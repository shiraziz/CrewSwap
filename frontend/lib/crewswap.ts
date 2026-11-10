import { formatDate, formatTime } from './api';

export type SwapType = 'FLIGHT' | 'LEAVE' | 'ACCOMMODATION';

export type MatchProfile = {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  rank?: string | null;
};

export type MatchOwner = {
  id: string;
  profile?: MatchProfile | null;
};

type OwnedSwap = {
  ownerId?: string;
  owner?: MatchOwner | null;
};

export type FlightSwap = {
  id: string;
  ownerId?: string;
  owner?: MatchOwner | null;
  type?: SwapType;
  status: string;
  flightDate?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  flightNumber?: string;
  fleetType?: string;
  crewRank?: string;
  tripDuration?: number;
  returnPreference?: string;
  note?: string | null;
  flight?: {
    flightNumber: string;
    origin: string;
    destination: string;
    fleet: string;
  } | null;
};

export type LeaveSwap = {
  id: string;
  ownerId?: string;
  owner?: MatchOwner | null;
  type?: SwapType;
  status: string;
  currentStart?: string;
  currentEnd?: string;
  desiredStart?: string;
  desiredEnd?: string;
  note?: string | null;
};

export type AccommodationSwap = {
  id: string;
  ownerId?: string;
  owner?: MatchOwner | null;
  type?: SwapType;
  status: string;
  swapType?: string;
  gender?: string;
  note?: string | null;
  currentAccommodation?: { name: string; location?: string | null } | null;
  desiredAccommodation?: { name: string; location?: string | null } | null;
};

export type AnySwap = FlightSwap | LeaveSwap | AccommodationSwap;

export type Match = {
  id: string;
  type: SwapType;
  score: number;
  reasons: string[];
  status: string;
  createdAt: string;
  flightSwapA?: FlightSwap | null;
  flightSwapB?: FlightSwap | null;
  leaveSwapA?: LeaveSwap | null;
  leaveSwapB?: LeaveSwap | null;
  accommodationSwapA?: AccommodationSwap | null;
  accommodationSwapB?: AccommodationSwap | null;
  requests?: { id: string; status: string; senderId: string; receiverId: string }[];
};

export type RequestItem = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  match: Match;
  sender?: { profile?: MatchProfile | null };
  receiver?: { profile?: MatchProfile | null };
};

export function labelize(value?: string | null) {
  return value ? value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : 'Not set';
}

export function routeText(origin?: string, destination?: string) {
  return origin && destination ? `${origin} to ${destination}` : 'Route not set';
}

export function getMatchSwaps(match: Match): [AnySwap | null, AnySwap | null] {
  if (match.type === 'FLIGHT') return [match.flightSwapA ?? null, match.flightSwapB ?? null];
  if (match.type === 'LEAVE') return [match.leaveSwapA ?? null, match.leaveSwapB ?? null];
  return [match.accommodationSwapA ?? null, match.accommodationSwapB ?? null];
}

export function profileName(profile?: MatchProfile | null, fallback = 'Crew member') {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return name || fallback;
}

export function getMatchedSwap(match: Match, currentUserId?: string | null) {
  const [swapA, swapB] = getMatchSwaps(match);
  const ownedA = swapA as (AnySwap & OwnedSwap) | null;
  const ownedB = swapB as (AnySwap & OwnedSwap) | null;
  if (!currentUserId) return ownedB ?? ownedA;
  if (ownedA?.ownerId === currentUserId) return ownedB;
  if (ownedB?.ownerId === currentUserId) return ownedA;
  return ownedB ?? ownedA;
}

export function getMatchedProfile(match: Match, currentUserId?: string | null) {
  return getMatchedSwap(match, currentUserId)?.owner?.profile ?? null;
}

export function hasActiveRequest(match: Match, currentUserId?: string | null) {
  return !!match.requests?.some((request) => {
    const belongsToUser = !currentUserId || request.senderId === currentUserId || request.receiverId === currentUserId;
    return belongsToUser && !['REJECTED', 'CANCELLED'].includes(request.status);
  });
}

export function hasSentRequest(match: Match, currentUserId?: string | null) {
  return !!match.requests?.some((request) => {
    const sentByUser = !currentUserId || request.senderId === currentUserId;
    return sentByUser && !['REJECTED', 'CANCELLED'].includes(request.status);
  });
}

export function swapTitle(swap?: AnySwap | null, fallbackType?: SwapType) {
  if (!swap) return `${labelize(fallbackType)} swap`;
  if ('origin' in swap) return routeText(swap.origin, swap.destination);
  if ('currentStart' in swap) return `${formatDate(swap.currentStart)} to ${formatDate(swap.desiredStart)}`;
  if ('currentAccommodation' in swap) return `${swap.currentAccommodation?.name ?? 'Current'} to ${swap.desiredAccommodation?.name ?? 'Desired'}`;
  return `${labelize(fallbackType)} swap`;
}

export function swapMeta(swap?: AnySwap | null, fallbackType?: SwapType) {
  if (!swap) return 'Details unavailable';
  if ('origin' in swap) {
    return [
      swap.flightNumber,
      swap.flightDate ? formatDate(swap.flightDate) : undefined,
      swap.departureTime ? formatTime(swap.departureTime) : undefined,
      swap.fleetType,
      swap.crewRank,
    ].filter(Boolean).join(' - ');
  }
  if ('currentStart' in swap) {
    return `Current ${formatDate(swap.currentStart)}-${formatDate(swap.currentEnd)} - Desired ${formatDate(swap.desiredStart)}-${formatDate(swap.desiredEnd)}`;
  }
  if ('currentAccommodation' in swap) {
    return `${labelize(swap.swapType)} - ${labelize(swap.gender)} preference`;
  }
  return labelize(fallbackType);
}
