import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditAnimalForm from "./EditAnimalForm";

export default async function EditAnimalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const animal = await prisma.animal.findFirst({ where: { id: params.id, userId: user.id } });
  if (!animal) notFound();

  return <EditAnimalForm animal={animal} />;
}
