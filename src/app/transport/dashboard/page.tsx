import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function TransporterDashboard() {
  const session = await getServerSession(authOptions);

  // Auth guard: must be logged in
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/transport/dashboard");
  }

  // Must have a transporter record
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { transporter: true },
  });

  if (!user) redirect("/login?callbackUrl=/transport/dashboard");
  if (!user.transporter) redirect("/transport");

  const transporter = user.transporter;

  // Active assignment (accepted match)
  const activeMatch = await prisma.match.findFirst({
    where: {
      transporterId: transporter.id,
      status: "accepted",
    },
    include: {
      request: { include: { animals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Pending requests
  const pendingMatches = await prisma.match.findMany({
    where: {
      transporterId: transporter.id,
      status: "pending",
    },
    include: {
      request: { include: { animals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transport history (completed)
  const completedMatches = await prisma.match.findMany({
    where: {
      transporterId: transporter.id,
      status: "completed",
    },
    include: {
      request: { include: { animals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Parse JSON arrays for display
  let trailerTypesArr: string[] = [];
  let livestockTypesArr: string[] = [];
  try { trailerTypesArr = JSON.parse(transporter.trailerTypes); } catch {}
  try { livestockTypesArr = JSON.parse(transporter.livestockTypes); } catch {}

  return (
    <DashboardClient
      transporter={{
        id: transporter.id,
        name: transporter.name,
        phone: transporter.phone,
        address: transporter.address,
        stallCount: transporter.stallCount,
        rigLengthFt: transporter.rigLengthFt,
        trailerTypes: trailerTypesArr,
        livestockTypes: livestockTypesArr,
        maxDistance: transporter.maxDistance,
        availability: transporter.availability,
        notes: transporter.notes,
      }}
      activeMatch={activeMatch ? {
        id: activeMatch.id,
        request: {
          name: activeMatch.request.name,
          phone: activeMatch.request.phone,
          address: activeMatch.request.address,
          situation: activeMatch.request.situation,
          animals: activeMatch.request.animals.map(a => ({
            id: a.id,
            species: a.species,
            count: a.count,
            specialNeeds: a.specialNeeds,
          })),
        },
      } : null}
      pendingMatches={pendingMatches.map(m => ({
        id: m.id,
        createdAt: m.createdAt.toISOString(),
        request: {
          name: m.request.name,
          phone: m.request.phone,
          address: m.request.address,
          situation: m.request.situation,
          trailerType: m.request.trailerType,
          animals: m.request.animals.map(a => ({
            id: a.id,
            species: a.species,
            count: a.count,
            specialNeeds: a.specialNeeds,
          })),
        },
      }))}
      completedMatches={completedMatches.map(m => ({
        id: m.id,
        completedAt: m.respondedAt?.toISOString() ?? m.createdAt.toISOString(),
        request: {
          name: m.request.name,
          address: m.request.address,
          animalCount: m.request.animals.reduce((sum, a) => sum + a.count, 0),
        },
      }))}
    />
  );
}
