import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RequestStatus from "./RequestStatus";

export default async function RequestStatusPage({ params }: { params: { id: string } }) {
  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: { animals: true, matches: { include: { transporter: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!request || request.status === "cancelled") notFound();

  return <RequestStatus request={request} />;
}
