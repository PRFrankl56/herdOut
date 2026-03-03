import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, address, lat, lng, situation, trailerType, animals } =
      body;

    if (!name || !phone || !address || !trailerType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!animals || animals.length === 0) {
      return NextResponse.json(
        { error: "At least one animal entry is required" },
        { status: 400 }
      );
    }

    const request = await prisma.request.create({
      data: {
        name,
        phone,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        situation: situation || null,
        trailerType,
        animals: {
          create: animals.map(
            (a: { species: string; count: number; specialNeeds?: string }) => ({
              species: a.species,
              count: a.count,
              specialNeeds: a.specialNeeds || null,
            })
          ),
        },
      },
      include: { animals: true },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Failed to create request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      include: { animals: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
