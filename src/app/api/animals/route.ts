import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const animal = await prisma.animal.create({
    data: {
      userId: user.id,
      name: body.name,
      species: body.species,
      breed: body.breed || null,
      color: body.color || null,
      markings: body.markings || null,
      weightClass: body.weightClass || null,
      photoUrl: body.photoUrl || null,
      specialNeeds: body.specialNeeds || null,
      vetName: body.vetName || null,
      vetPhone: body.vetPhone || null,
    },
  });

  return NextResponse.json(animal);
}

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json([]);

  const animals = await prisma.animal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(animals);
}
