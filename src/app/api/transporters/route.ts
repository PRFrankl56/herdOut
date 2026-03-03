import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      driveCapability,
      livestockTypes,
      maxDistance,
      availableNow,
      availableInHours,
      notes,
    } = body;

    if (!name || !phone || !address || !rigLengthFt || !driveCapability || !maxDistance) {
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

    const transporter = await prisma.transporter.create({
      data: {
        name,
        phone,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        stallCount: parseInt(stallCount),
        rigLengthFt,
        trailerTypes: JSON.stringify(trailerTypes || []),
        driveCapability,
        livestockTypes: JSON.stringify(livestockTypes || []),
        maxDistance,
        availableNow: Boolean(availableNow),
        availableInHours: availableInHours ? parseInt(availableInHours) : null,
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
