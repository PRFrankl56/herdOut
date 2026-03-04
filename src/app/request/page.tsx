import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RequestForm from "./RequestForm";

export default async function RequestPage() {
  const session = await getServerSession(authOptions);

  let profile = { name: "", phone: "", address: "" };
  let savedAnimals: { id: string; name: string; species: string; breed: string | null; specialNeeds: string | null; photoUrl: string | null }[] = [];

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { animals: { orderBy: { createdAt: "asc" } } },
    });
    if (user) {
      profile = {
        name: user.name ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
      };
      savedAnimals = user.animals.map((a) => ({
        id: a.id,
        name: a.name,
        species: a.species,
        breed: a.breed,
        specialNeeds: a.specialNeeds,
        photoUrl: a.photoUrl,
      }));
    }
  }

  return <RequestForm profile={profile} savedAnimals={savedAnimals} />;
}
