import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Profile</h1>
            <p className="text-white/60 text-sm mt-1">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="space-y-4">
          <Link href="/profile/animals" className="block bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">🐴 My Animals</h2>
                <p className="text-white/60 text-sm mt-1">Manage animal profiles and photos</p>
              </div>
              <span className="text-brand-amber text-2xl">→</span>
            </div>
          </Link>

          <Link href="/request" className="block bg-brand-amber/20 hover:bg-brand-amber/30 transition-colors rounded-xl p-6 border border-brand-amber/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">🚨 Request Evacuation</h2>
                <p className="text-white/60 text-sm mt-1">Submit an emergency evacuation request</p>
              </div>
              <span className="text-brand-amber text-2xl">→</span>
            </div>
          </Link>

          <Link href="/transport" className="block bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">🚛 Register as Transporter</h2>
                <p className="text-white/60 text-sm mt-1">Volunteer to help evacuate animals</p>
              </div>
              <span className="text-brand-amber text-2xl">→</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
