import Link from "next/link";
import { fetchWildfires } from "@/lib/wildfires";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

const FireMap = dynamic(() => import("@/components/FireMap"), { ssr: false });

export const revalidate = 0;

export default async function Home() {
  const [fires, session] = await Promise.all([fetchWildfires(), getServerSession(authOptions)]);

  let isTransporter = false;
  let requests: { id: string; name: string; address: string; lat: number; lng: number; animalCount: number; status: string }[] = [];
  let transporters: { id: string; name: string; address: string; lat: number; lng: number; stallCount: number; availability: string }[] = [];

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { transporter: true },
    });
    isTransporter = !!user?.transporter;
  }

  const [rawRequests, rawTransporters] = await Promise.all([
    prisma.request.findMany({ where: { lat: { not: null }, lng: { not: null } }, select: { id: true, name: true, address: true, lat: true, lng: true, status: true } }),
    prisma.transporter.findMany({ where: { lat: { not: null }, lng: { not: null } }, select: { id: true, name: true, address: true, lat: true, lng: true, stallCount: true, availability: true } }),
  ]);

  requests = rawRequests.map((r) => ({ ...r, lat: r.lat!, lng: r.lng!, animalCount: 0 }));
  transporters = rawTransporters.map((t) => ({ ...t, lat: t.lat!, lng: t.lng! }));

  const mapFires = fires.filter((f) => f.lat !== null && f.lng !== null).map((f) => ({ ...f, lat: f.lat!, lng: f.lng! }));

  return (
    <main className="min-h-screen bg-brand-green flex flex-col">
      {/* Map — full width hero */}
      <div className="relative w-full" style={{ height: "60vh", minHeight: 360 }}>
        <FireMap fires={mapFires} requests={requests} transporters={transporters} />

        {/* CTA overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4 z-[1000]">
          <Link href="/request"
            className="bg-brand-amber text-brand-green font-bold text-base px-6 py-3 rounded-xl shadow-xl hover:bg-amber-400 transition-colors">
            🚨 Request Evacuation
          </Link>
          {!isTransporter && (
            <Link href="/login?callbackUrl=/transport"
              className="bg-white/90 text-brand-green font-bold text-base px-6 py-3 rounded-xl shadow-xl hover:bg-white transition-colors">
              🚛 Volunteer to Transport
            </Link>
          )}
        </div>

        {/* Legend */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex gap-3 text-xs text-white font-medium">
            <span>🔥 {mapFires.length} fires</span>
            <span>🚨 {requests.length} requests</span>
            <span>🚛 {transporters.length} transporters</span>
          </div>
        </div>
      </div>

      {/* Fire list below map */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">🔥 Active Wildfires</h2>
          <span className="text-white/40 text-xs">Western US · 5min refresh</span>
        </div>

        {fires.length === 0 ? (
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <p className="text-white/60">No active wildfires in the western US right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fires.slice(0, 15).map((fire, i) => (
              <a key={i} href={fire.url} target="_blank" rel="noopener noreferrer"
                className="block bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm leading-snug">{fire.title}</h3>
                    <p className="text-white/50 text-xs mt-1">{fire.state}</p>
                    {fire.updated && <p className="text-white/30 text-xs mt-0.5">Updated {fire.updated}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <span className="inline-block bg-red-500/20 text-red-300 text-xs font-bold px-2 py-1 rounded-full">ACTIVE</span>
                    {fire.containmentPct !== null && fire.containmentPct < 100 && (
                      <div>
                        <span className="inline-block bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {fire.containmentPct}% contained
                        </span>
                      </div>
                    )}
                    {fire.containmentDelta !== null && fire.containmentDelta !== 0 && (
                      <div>
                        <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${fire.containmentDelta > 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                          {fire.containmentDelta > 0 ? "+" : ""}{fire.containmentDelta}% (24h)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <p className="text-white/30 text-xs text-center mt-4">
          Data from <a href="https://inciweb.wildfire.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">InciWeb</a>
        </p>
      </div>
    </main>
  );
}
