import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      phone,
      address,
      lat,
      lng,
      stallCount,
      rigLengthFt,
      trailerTypes,
      livestockTypes,
      maxDistance,
      notes,
    } = body;

    if (!name || !phone || !address || !rigLengthFt || !maxDistance) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (stallCount == null || stallCount < 0) {
      return NextResponse.json(
        { error: "Stall count is required" },
        { status: 400 }
      );
    }

    // Geocode the address if lat/lng not provided
    let resolvedLat = lat ? parseFloat(lat) : null;
    let resolvedLng = lng ? parseFloat(lng) : null;
    if (!resolvedLat || !resolvedLng) {
      const coords = await geocodeAddress(address);
      if (coords) { resolvedLat = coords.lat; resolvedLng = coords.lng; }
    }

    // Link to user account if logged in
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) userId = user.id;
    }

    const transporter = await prisma.transporter.create({
      data: {
        name,
        phone,
        address,
        lat: resolvedLat,
        lng: resolvedLng,
        userId: userId ?? undefined,
        stallCount: parseInt(stallCount),
        rigLengthFt,
        trailerTypes: JSON.stringify(trailerTypes || []),
        driveCapability: "N/A",
        livestockTypes: JSON.stringify(livestockTypes || []),
        maxDistance,
        availableNow: true,
        availableInHours: null,
        notes: notes || null,
      },
    });

    return NextResponse.json(transporter, { status: 201 });
  } catch (error) {
    console.error("Failed to create transporter:", error);
    return NextResponse.json(
      { error: "Failed to create transporter" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const transporters = await prisma.transporter.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transporters);
  } catch (error) {
    console.error("Failed to fetch transporters:", error);
    return NextResponse.json(
      { error: "Failed to fetch transporters" },
      { status: 500 }
    );
  }
}
