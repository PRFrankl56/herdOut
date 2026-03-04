import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditRequestForm from "./EditRequestForm";

export default async function EditRequestPage({ params }: { params: { id: string } }) {
  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: { animals: true },
  });
  if (!request || request.status === "cancelled") notFound();
  return <EditRequestForm request={request} />;
}
