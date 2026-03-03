import { prisma } from "@/lib/prisma";
import { notifyTransporter, notifyRequester, MatchWithRelations } from "@/lib/notifications";

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function scoreTransporter(
  transporter: {
    stallCount: number;
    lat: number | null;
    lng: number | null;
    trailerTypes: string;
    maxDistance: string;
  },
  request: {
    lat: number | null;
    lng: number | null;
    trailerType: string;
    totalAnimals: number;
  }
): number {
  let score = 0;

  // Stall capacity: bonus if transporter can fit all animals
  if (transporter.stallCount >= request.totalAnimals) {
    score += 50;
  } else {
    // Partial credit based on how much capacity they have
    score += (transporter.stallCount / Math.max(request.totalAnimals, 1)) * 30;
  }

  // Distance scoring (if both have coordinates)
  if (
    transporter.lat != null &&
    transporter.lng != null &&
    request.lat != null &&
    request.lng != null
  ) {
    const distance = haversineDistance(
      request.lat,
      request.lng,
      transporter.lat,
      transporter.lng
    );

    // Parse max distance preference
    const maxDistMap: Record<string, number> = {
      "10": 10,
      "25": 25,
      "50": 50,
      "50+": 100,
    };
    const maxDist = maxDistMap[transporter.maxDistance] || 50;

    if (distance <= maxDist) {
      // Closer transporters get higher scores (max 40 points)
      score += Math.max(0, 40 - distance);
    } else {
      // Over their max distance, significant penalty
      score -= 20;
    }
  }

  // Trailer type compatibility
  let trailerArr: string[] = [];
  try {
    trailerArr = JSON.parse(transporter.trailerTypes);
  } catch {}

  const trailerTypeMap: Record<string, string[]> = {
    horse: ["Slant load", "Straight load"],
    stock: ["Stock trailer"],
    flatbed: ["Flatbed"],
    any: [],
  };

  const neededTypes = trailerTypeMap[request.trailerType] || [];
  if (request.trailerType === "any") {
    score += 10; // Any trailer works
  } else if (neededTypes.some((t) => trailerArr.includes(t))) {
    score += 20; // Has a compatible trailer type
  }

  return score;
}

export async function matchRequest(requestId: string) {
  // 1. Load the request with its animals
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { animals: true },
  });

  if (!request) {
    console.error(`Request ${requestId} not found`);
    return null;
  }

  const totalAnimals = request.animals.reduce((sum, a) => sum + a.count, 0);

  // 2. Find all available transporters
  const transporters = await prisma.transporter.findMany({
    where: { availability: "available" },
  });

  if (transporters.length === 0) {
    await prisma.request.update({
      where: { id: requestId },
      data: { status: "queued" },
    });
    console.log(`No available transporters for request ${requestId}, status set to queued`);
    return null;
  }

  // 3. Score each transporter
  const scored = transporters.map((t) => ({
    transporter: t,
    score: scoreTransporter(t, {
      lat: request.lat,
      lng: request.lng,
      trailerType: request.trailerType,
      totalAnimals,
    }),
  }));

  // 4. Sort by score descending, pick top match
  scored.sort((a, b) => b.score - a.score);

  // Skip transporters who already have a pending match for this request
  const existingMatches = await prisma.match.findMany({
    where: {
      requestId,
      status: { in: ["pending", "rejected"] },
    },
    select: { transporterId: true },
  });
  const excludedIds = new Set(existingMatches.map((m) => m.transporterId));

  const bestMatch = scored.find((s) => !excludedIds.has(s.transporter.id));

  if (!bestMatch) {
    await prisma.request.update({
      where: { id: requestId },
      data: { status: "queued" },
    });
    console.log(`No eligible transporters for request ${requestId}, status set to queued`);
    return null;
  }

  // 5. Create a Match record
  const match = await prisma.match.create({
    data: {
      requestId,
      transporterId: bestMatch.transporter.id,
      status: "pending",
      notifiedAt: new Date(),
    },
    include: {
      request: { include: { animals: true } },
      transporter: true,
    },
  });

  // 6. Update Request status to matched
  await prisma.request.update({
    where: { id: requestId },
    data: { status: "matched" },
  });

  // 7. Notify the transporter
  await notifyTransporter(match as MatchWithRelations);

  return match;
}
