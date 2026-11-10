import type { AccommodationSwap, FlightSwap, LeaveSwap, ReturnPreference, UserQualification } from "@prisma/client";
import { prisma } from "../../config/database";
import { orderPair } from "../common/swap-utils";

type FlightWithQualifications = FlightSwap & { owner: { qualifications: UserQualification[] } };

const ownerProfileInclude = { owner: { include: { profile: true } } } as const;
const matchInclude = {
  requests: true,
  flightSwapA: { include: ownerProfileInclude },
  flightSwapB: { include: ownerProfileInclude },
  leaveSwapA: { include: ownerProfileInclude },
  leaveSwapB: { include: ownerProfileInclude },
  accommodationSwapA: { include: { ...ownerProfileInclude, currentAccommodation: true, desiredAccommodation: true } },
  accommodationSwapB: { include: { ...ownerProfileInclude, currentAccommodation: true, desiredAccommodation: true } },
} as const;

const compatibleGender = (a: AccommodationSwap, b: AccommodationSwap) => a.gender === "ANY" || b.gender === "ANY" || a.gender === b.gender;
const sameDay = (a: Date, b: Date) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
const rangesOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart <= bEnd && bStart <= aEnd;
const daysBetween = (start: Date, end: Date) => Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

const specificPreferenceMatches = (owner: FlightSwap, candidate: FlightSwap) => {
  if (owner.returnPreference === "ANY_OFFER") return true;
  if (owner.returnPreference === "SPECIFIC_DESTINATION") return owner.specificDestinations.includes(candidate.destination);
  if (owner.returnPreference === "SPECIFIC_DAYS_OFF") return owner.specificDaysOff.some((day) => sameDay(day, candidate.flightDate));
  return false;
};

const returnPreferenceScore = (a: FlightSwap, b: FlightSwap) => {
  const preferences: ReturnPreference[] = [a.returnPreference, b.returnPreference];
  if (preferences.every((preference) => preference === "ANY_OFFER")) return 10;
  if (specificPreferenceMatches(a, b) && specificPreferenceMatches(b, a)) return 10;
  if (specificPreferenceMatches(a, b) || specificPreferenceMatches(b, a)) return 5;
  return 0;
};

const scoreFlight = (a: FlightWithQualifications, b: FlightWithQualifications) => {
  const reasons: string[] = [];
  let score = 0;
  if (a.ownerId === b.ownerId) return null;
  if (a.status !== "OPEN" || b.status !== "OPEN") return null;
  if (a.flightDate < new Date() || b.flightDate < new Date()) return null;
  if (sameDay(a.flightDate, b.flightDate)) { score += 15; reasons.push("Same flight date"); }
  if (a.destination === b.origin && a.origin === b.destination) { score += 20; reasons.push("Mirror route"); }
  else if (a.origin === b.origin || a.destination === b.destination) { score += 10; reasons.push("Partial route alignment"); }
  if (a.crewRank === b.crewRank) { score += 20; reasons.push("Compatible rank"); }
  if (a.tripDuration === b.tripDuration) { score += 15; reasons.push("Same trip duration"); }
  else if (Math.abs(a.tripDuration - b.tripDuration) <= 1) { score += 8; reasons.push("Similar trip duration"); }
  if (b.owner.qualifications.some((q) => q.fleet === a.fleetType) && a.owner.qualifications.some((q) => q.fleet === b.fleetType)) {
    score += 25; reasons.push("Compatible fleet qualifications");
  }
  const preferenceScore = returnPreferenceScore(a, b);
  if (preferenceScore) { score += preferenceScore; reasons.push("Compatible return preference"); }
  if (score < 55) return null;
  return { score: Math.min(score, 100), reasons };
};

const scoreLeave = (a: LeaveSwap, b: LeaveSwap) => {
  const reasons: string[] = [];
  let score = 0;
  if (a.ownerId === b.ownerId || a.status !== "OPEN" || b.status !== "OPEN") return null;
  if (a.currentStart < new Date() || b.currentStart < new Date()) return null;
  if (rangesOverlap(a.currentStart, a.currentEnd, b.desiredStart, b.desiredEnd)) { score += 45; reasons.push("Your current leave overlaps their desired leave"); }
  if (rangesOverlap(a.desiredStart, a.desiredEnd, b.currentStart, b.currentEnd)) { score += 45; reasons.push("Their current leave overlaps your desired leave"); }
  if (daysBetween(a.currentStart, a.currentEnd) === daysBetween(b.desiredStart, b.desiredEnd)) { score += 5; reasons.push("Current leave duration aligns"); }
  if (daysBetween(a.desiredStart, a.desiredEnd) === daysBetween(b.currentStart, b.currentEnd)) { score += 5; reasons.push("Desired leave duration aligns"); }
  if (score < 60) return null;
  return { score: Math.min(score, 100), reasons };
};

const scoreAccommodation = (a: AccommodationSwap, b: AccommodationSwap) => {
  const reasons: string[] = [];
  let score = 0;
  if (a.ownerId === b.ownerId || a.status !== "OPEN" || b.status !== "OPEN") return null;
  const mirror = a.currentAccommodationId === b.desiredAccommodationId && a.desiredAccommodationId === b.currentAccommodationId;
  if (!mirror || !compatibleGender(a, b)) return null;
  score += 60; reasons.push("Accommodation targets mirror each other");
  if (a.swapType === b.swapType) { score += 25; reasons.push("Compatible swap type"); }
  if (compatibleGender(a, b)) { score += 15; reasons.push("Compatible gender preference"); }
  if (score < 75) return null;
  return { score: Math.min(score, 100), reasons };
};

export const matchService = {
  mine(userId: string) {
    return prisma.match.findMany({
      where: {
        OR: [
          { flightSwapA: { ownerId: userId } }, { flightSwapB: { ownerId: userId } },
          { leaveSwapA: { ownerId: userId } }, { leaveSwapB: { ownerId: userId } },
          { accommodationSwapA: { ownerId: userId } }, { accommodationSwapB: { ownerId: userId } },
        ],
      },
      include: matchInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  get(id: string) {
    return prisma.match.findUniqueOrThrow({
      where: { id },
      include: matchInclude,
    });
  },

  async recompute(type?: "FLIGHT" | "LEAVE" | "ACCOMMODATION") {
    const created: string[] = [];
    if (!type || type === "FLIGHT") {
      const swaps = await prisma.flightSwap.findMany({ where: { status: "OPEN" }, include: { owner: { include: { qualifications: true } } } });
      for (let i = 0; i < swaps.length; i += 1) for (let j = i + 1; j < swaps.length; j += 1) {
        const result = scoreFlight(swaps[i], swaps[j]);
        if (!result) continue;
        const [aId, bId] = orderPair(swaps[i].id, swaps[j].id);
        const match = await prisma.match.upsert({
          where: { type_flightSwapAId_flightSwapBId: { type: "FLIGHT", flightSwapAId: aId, flightSwapBId: bId } },
          create: { type: "FLIGHT", flightSwapAId: aId, flightSwapBId: bId, ...result },
          update: { score: result.score, reasons: result.reasons, status: "NEW" },
        });
        created.push(match.id);
      }
    }
    if (!type || type === "LEAVE") {
      const swaps = await prisma.leaveSwap.findMany({ where: { status: "OPEN" } });
      for (let i = 0; i < swaps.length; i += 1) for (let j = i + 1; j < swaps.length; j += 1) {
        const result = scoreLeave(swaps[i], swaps[j]);
        if (!result) continue;
        const [aId, bId] = orderPair(swaps[i].id, swaps[j].id);
        const match = await prisma.match.upsert({
          where: { type_leaveSwapAId_leaveSwapBId: { type: "LEAVE", leaveSwapAId: aId, leaveSwapBId: bId } },
          create: { type: "LEAVE", leaveSwapAId: aId, leaveSwapBId: bId, ...result },
          update: { score: result.score, reasons: result.reasons, status: "NEW" },
        });
        created.push(match.id);
      }
    }
    if (!type || type === "ACCOMMODATION") {
      const swaps = await prisma.accommodationSwap.findMany({ where: { status: "OPEN" } });
      for (let i = 0; i < swaps.length; i += 1) for (let j = i + 1; j < swaps.length; j += 1) {
        const result = scoreAccommodation(swaps[i], swaps[j]);
        if (!result) continue;
        const [aId, bId] = orderPair(swaps[i].id, swaps[j].id);
        const match = await prisma.match.upsert({
          where: { type_accommodationSwapAId_accommodationSwapBId: { type: "ACCOMMODATION", accommodationSwapAId: aId, accommodationSwapBId: bId } },
          create: { type: "ACCOMMODATION", accommodationSwapAId: aId, accommodationSwapBId: bId, ...result },
          update: { score: result.score, reasons: result.reasons, status: "NEW" },
        });
        created.push(match.id);
      }
    }
    return { createdOrUpdated: created.length, matchIds: created };
  },
};
