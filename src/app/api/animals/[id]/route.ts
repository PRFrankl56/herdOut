import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedAnimal(animalId: string, userEmail: string) {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return null;
  const animal = await prisma.animal.findFirst({ where: { id: animalId, userId: user.id } });
  return animal;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const animal = await getOwnedAnimal(params.id, session.user.email);
  if (!animal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.animal.update({
    where: { id: params.id },
    data: {
      name: body.name,
      species: body.species,
      breed: body.breed || null,
      color: body.color || null,
      markings: body.markings || null,
      weightClass: body.weightClass || null,
      specialNeeds: body.specialNeeds || null,
      vetName: body.vetName || null,
      vetPhone: body.vetPhone || null,
      photoUrl: body.photoUrl ?? animal.photoUrl,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const animal = await getOwnedAnimal(params.id, session.user.email);
  if (!animal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.animal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
