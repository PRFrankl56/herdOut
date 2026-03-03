import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AnimalsPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const animals = await prisma.animal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/profile" className="text-white/50 text-sm hover:text-white">← Profile</Link>
            <h1 className="text-3xl font-extrabold text-white mt-1">My Animals</h1>
          </div>
          <Link href="/profile/animals/new" className="bg-brand-amber text-brand-green font-bold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors">
            + Add Animal
          </Link>
        </div>

        {animals.length === 0 ? (
          <div className="bg-white/10 rounded-xl p-8 text-center">
            <p className="text-white/60 text-lg mb-4">No animals registered yet.</p>
            <Link href="/profile/animals/new" className="bg-brand-amber text-brand-green font-bold px-6 py-3 rounded-lg hover:bg-amber-400 transition-colors inline-block">
              Add Your First Animal
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {animals.map((animal) => (
              <div key={animal.id} className="bg-white/10 rounded-xl overflow-hidden flex">
                {animal.photoUrl ? (
                  <img src={animal.photoUrl} alt={animal.name} className="w-24 h-24 object-cover flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 bg-white/5 flex items-center justify-center flex-shrink-0 text-3xl">
                    {animal.species === "horse" ? "🐴" : animal.species === "cattle" ? "🐄" : "🐾"}
                  </div>
                )}
                <div className="p-4 flex-1">
                  <h3 className="text-white font-bold text-lg">{animal.name}</h3>
                  <p className="text-white/60 text-sm capitalize">{animal.species}{animal.breed ? ` · ${animal.breed}` : ""}</p>
                  {animal.specialNeeds && <p className="text-brand-amber text-xs mt-1">⚠ {animal.specialNeeds}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
