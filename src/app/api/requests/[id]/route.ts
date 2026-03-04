import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      animals: true,
      matches: {
        include: { transporter: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(request);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, phone, address, situation, evacuationScope, trailerType, animals } = body;

  // Geocode new address if changed
  let lat: number | null = null;
  let lng: number | null = null;
  if (address) {
    const coords = await geocodeAddress(address);
    if (coords) { lat = coords.lat; lng = coords.lng; }
  }

  // Cancel existing pending matches so it re-queues
  await prisma.match.updateMany({
    where: { requestId: params.id, status: { in: ["pending", "accepted"] } },
    data: { status: "cancelled" },
  });

  // Reset status to unmatched and update fields
  const updated = await prisma.request.update({
    where: { id: params.id },
    data: {
      name, phone, address,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      situation: situation || null,
      evacuationScope,
      trailerType,
      status: "unmatched",
      animals: {
        deleteMany: {},
        create: animals.map((a: { species: string; count: number; specialNeeds?: string }) => ({
          species: a.species,
          count: a.count,
          specialNeeds: a.specialNeeds || null,
        })),
      },
    },
    include: { animals: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.match.updateMany({
    where: { requestId: params.id },
    data: { status: "cancelled" },
  });
  await prisma.request.update({
    where: { id: params.id },
    data: { status: "cancelled" },
  });
  return NextResponse.json({ ok: true });
}
