import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditForm from "./EditForm";

export default async function EditTransporterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/transport/edit");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { transporter: true },
  });

  if (!user) redirect("/login?callbackUrl=/transport/edit");
  if (!user.transporter) redirect("/transport");

  const t = user.transporter;
  let trailerTypes: string[] = [];
  let livestockTypes: string[] = [];
  try { trailerTypes = JSON.parse(t.trailerTypes); } catch {}
  try { livestockTypes = JSON.parse(t.livestockTypes); } catch {}

  return (
    <EditForm
      transporter={{
        id: t.id,
        name: t.name,
        phone: t.phone,
        address: t.address,
        stallCount: t.stallCount,
        rigLengthFt: t.rigLengthFt,
        trailerTypes,
        livestockTypes,
        maxDistance: t.maxDistance,
        notes: t.notes,
      }}
    />
  );
}
