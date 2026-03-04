import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import SignOutButton from "./SignOutButton";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      animals: true,
      transporter: true,
      requests: {
        where: { status: { notIn: ["completed", "cancelled"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">My Profile</h1>
          <SignOutButton />
        </div>

        {/* Profile info form */}
        <ProfileForm
          initialName={user.name ?? ""}
          initialPhone={user.phone ?? ""}
          initialAddress={user.address ?? ""}
          email={user.email ?? ""}
        />

        {/* Animals */}
        <div className="bg-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">🐴 My Animals</h2>
            <Link href="/profile/animals/new" className="text-brand-amber text-sm font-semibold hover:underline">+ Add</Link>
          </div>
          {user.animals.length === 0 ? (
            <p className="text-white/50 text-sm">No animals yet. Add them so they pre-fill evacuation requests.</p>
          ) : (
            <div className="space-y-2">
              {user.animals.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  {a.photoUrl
                    ? <img src={a.photoUrl} alt={a.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                        {a.species === "horse" ? "🐴" : a.species === "cattle" ? "🐄" : "🐾"}
                      </div>
                  }
                  <div>
                    <p className="text-white font-medium text-sm">{a.name}</p>
                    <p className="text-white/50 text-xs capitalize">{a.species}{a.breed ? ` · ${a.breed}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/profile/animals" className="block mt-3 text-white/40 text-xs hover:text-white/60">
            Manage all animals →
          </Link>
        </div>

        {/* Transporter status */}
        <div className="bg-white/10 rounded-xl p-5">
          <h2 className="text-white font-bold text-lg mb-3">🚛 Transporter Status</h2>
          {user.transporter ? (
            <div>
              <p className="text-green-400 font-semibold text-sm mb-1">✓ Registered as a transporter</p>
              <p className="text-white/50 text-sm">{user.transporter.stallCount} stalls · {user.transporter.rigLengthFt}ft rig · up to {user.transporter.maxDistance} miles</p>
              <p className="text-white/40 text-xs mt-1">{user.transporter.address}</p>
            </div>
          ) : (
            <div>
              <p className="text-white/50 text-sm mb-3">Not registered as a transporter yet.</p>
              <Link href="/transport" className="inline-block bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-white/20">
                Register Your Rig →
              </Link>
            </div>
          )}
        </div>

        {/* Active request or CTA */}
        {user.requests[0] ? (
          <Link href={`/request/${user.requests[0].id}`}
            className="block bg-brand-amber/20 border-2 border-brand-amber text-white rounded-xl p-5 hover:bg-brand-amber/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-amber font-bold text-sm uppercase tracking-wide">Active Request</p>
                <p className="text-white font-semibold mt-1">{user.requests[0].address}</p>
                <p className="text-white/50 text-xs mt-0.5 capitalize">{user.requests[0].status.replace("_", " ")}</p>
              </div>
              <span className="text-brand-amber text-2xl">→</span>
            </div>
          </Link>
        ) : (
          <Link href="/request" className="block bg-brand-amber text-brand-green font-bold text-center text-lg py-4 rounded-xl hover:bg-amber-400 transition-colors">
            🚨 Request Emergency Evacuation
          </Link>
        )}
      </div>
    </main>
  );
}
