import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocode";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify this transporter belongs to the current user
    const transporter = await prisma.transporter.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!transporter) {
      return NextResponse.json({ error: "Transporter not found" }, { status: 404 });
    }

    if (transporter.user?.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    // Re-geocode if address changed and no coords provided
    let resolvedLat = lat ? parseFloat(lat) : transporter.lat;
    let resolvedLng = lng ? parseFloat(lng) : transporter.lng;
    if (address && address !== transporter.address && !lat) {
      const coords = await geocodeAddress(address);
      if (coords) {
        resolvedLat = coords.lat;
        resolvedLng = coords.lng;
      }
    }

    const updated = await prisma.transporter.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address, lat: resolvedLat, lng: resolvedLng }),
        ...(stallCount !== undefined && { stallCount: parseInt(stallCount) }),
        ...(rigLengthFt !== undefined && { rigLengthFt }),
        ...(trailerTypes !== undefined && { trailerTypes: JSON.stringify(trailerTypes) }),
        ...(livestockTypes !== undefined && { livestockTypes: JSON.stringify(livestockTypes) }),
        ...(maxDistance !== undefined && { maxDistance }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update transporter:", error);
    return NextResponse.json(
      { error: "Failed to update transporter" },
      { status: 500 }
    );
  }
}
