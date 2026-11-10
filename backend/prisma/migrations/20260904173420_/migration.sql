-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CREW', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('PURSER', 'IN_FLIGHT_SUPERVISOR', 'FA', 'FJ', 'FC', 'CS', 'CM', 'FO', 'CP');

-- CreateEnum
CREATE TYPE "Fleet" AS ENUM ('A320', 'A330', 'A350', 'B737', 'B777', 'B787');

-- CreateEnum
CREATE TYPE "SwapStatus" AS ENUM ('DRAFT', 'OPEN', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('NEW', 'VIEWED', 'EXPIRED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnPreference" AS ENUM ('ANY_OFFER', 'SPECIFIC_DESTINATION', 'SPECIFIC_DAYS_OFF');

-- CreateEnum
CREATE TYPE "SwapType" AS ENUM ('FULL_APARTMENT', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('MALE', 'FEMALE', 'ANY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MATCH', 'NEW_REQUEST', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'SWAP_CANCELLED', 'SWAP_MODIFIED', 'SWAP_EXPIRED', 'SWAP_COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CREW',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "rank" "Rank",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQualification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fleet" "Fleet" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "fleet" "Fleet" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightSwap" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "flightDate" TIMESTAMP(3) NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "fleetType" "Fleet" NOT NULL,
    "crewRank" "Rank" NOT NULL,
    "tripDuration" INTEGER NOT NULL,
    "returnPreference" "ReturnPreference" NOT NULL DEFAULT 'ANY_OFFER',
    "specificDestinations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specificDaysOff" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "note" TEXT,
    "status" "SwapStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightSwap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveSwap" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "currentStart" TIMESTAMP(3) NOT NULL,
    "currentEnd" TIMESTAMP(3) NOT NULL,
    "desiredStart" TIMESTAMP(3) NOT NULL,
    "desiredEnd" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "status" "SwapStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveSwap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccommodationSwap" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "currentAccommodationId" TEXT NOT NULL,
    "desiredAccommodationId" TEXT NOT NULL,
    "swapType" "SwapType" NOT NULL,
    "gender" "GenderPreference" NOT NULL DEFAULT 'ANY',
    "note" TEXT,
    "status" "SwapStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccommodationSwap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "flightSwapAId" TEXT,
    "flightSwapBId" TEXT,
    "leaveSwapAId" TEXT,
    "leaveSwapBId" TEXT,
    "accommodationSwapAId" TEXT,
    "accommodationSwapBId" TEXT,
    "score" INTEGER NOT NULL,
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MatchStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwapRequest" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwapRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterItem" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "flightId" TEXT,
    "dutyType" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RosterItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQualification_userId_fleet_key" ON "UserQualification"("userId", "fleet");

-- CreateIndex
CREATE UNIQUE INDEX "Accommodation_name_key" ON "Accommodation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Match_type_flightSwapAId_flightSwapBId_key" ON "Match"("type", "flightSwapAId", "flightSwapBId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_type_leaveSwapAId_leaveSwapBId_key" ON "Match"("type", "leaveSwapAId", "leaveSwapBId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_type_accommodationSwapAId_accommodationSwapBId_key" ON "Match"("type", "accommodationSwapAId", "accommodationSwapBId");

-- CreateIndex
CREATE UNIQUE INDEX "SwapRequest_matchId_senderId_receiverId_key" ON "SwapRequest"("matchId", "senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_type_eventId_key" ON "Notification"("userId", "type", "eventId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQualification" ADD CONSTRAINT "UserQualification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightSwap" ADD CONSTRAINT "FlightSwap_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightSwap" ADD CONSTRAINT "FlightSwap_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveSwap" ADD CONSTRAINT "LeaveSwap_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationSwap" ADD CONSTRAINT "AccommodationSwap_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationSwap" ADD CONSTRAINT "AccommodationSwap_currentAccommodationId_fkey" FOREIGN KEY ("currentAccommodationId") REFERENCES "Accommodation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationSwap" ADD CONSTRAINT "AccommodationSwap_desiredAccommodationId_fkey" FOREIGN KEY ("desiredAccommodationId") REFERENCES "Accommodation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_flightSwapAId_fkey" FOREIGN KEY ("flightSwapAId") REFERENCES "FlightSwap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_flightSwapBId_fkey" FOREIGN KEY ("flightSwapBId") REFERENCES "FlightSwap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leaveSwapAId_fkey" FOREIGN KEY ("leaveSwapAId") REFERENCES "LeaveSwap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leaveSwapBId_fkey" FOREIGN KEY ("leaveSwapBId") REFERENCES "LeaveSwap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_accommodationSwapAId_fkey" FOREIGN KEY ("accommodationSwapAId") REFERENCES "AccommodationSwap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_accommodationSwapBId_fkey" FOREIGN KEY ("accommodationSwapBId") REFERENCES "AccommodationSwap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapRequest" ADD CONSTRAINT "SwapRequest_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapRequest" ADD CONSTRAINT "SwapRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapRequest" ADD CONSTRAINT "SwapRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterItem" ADD CONSTRAINT "RosterItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterItem" ADD CONSTRAINT "RosterItem_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
