import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchWildfires } from "@/lib/wildfires";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

const FireMap = dynamic(() => import("@/components/FireMap"), { ssr: false });

export default async function MapPage() {
  const [firesRaw, requests, transporters] = await Promise.all([
    fetchWildfires(),
    prisma.request.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      select: { id: true, name: true, address: true, lat: true, lng: true, status: true },
    }),
    prisma.transporter.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      select: { id: true, name: true, address: true, lat: true, lng: true, stallCount: true, availability: true },
    }),
  ]);

  const fires = firesRaw
    .filter((f) => f.lat !== null && f.lng !== null)
    .map((f) => ({ ...f, lat: f.lat!, lng: f.lng! }));

  const safeRequests = requests.map((r) => ({ ...r, lat: r.lat!, lng: r.lng!, animalCount: 0 }));
  const safeTransporters = transporters.map((t) => ({ ...t, lat: t.lat!, lng: t.lng! }));

  return (
    <main className="min-h-screen bg-brand-green px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/" className="text-white/50 text-sm hover:text-white">← Home</Link>
            <h1 className="text-3xl font-extrabold text-white mt-1">Live Map</h1>
          </div>
          <Link href="/request"
            className="bg-brand-amber text-brand-green font-bold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors text-sm">
            🚨 Request Help
          </Link>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <span className="text-xl">🔥</span>
            <span className="text-white text-sm font-medium">{fires.length} Active Fire{fires.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <span className="text-xl">🚨</span>
            <span className="text-white text-sm font-medium">{safeRequests.length} Evacuation Request{safeRequests.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <span className="text-xl">🚛</span>
            <span className="text-white text-sm font-medium">{safeTransporters.length} Transporter{safeTransporters.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Map */}
        <div style={{ height: "600px" }} className="rounded-xl overflow-hidden shadow-xl">
          <FireMap
            fires={fires}
            requests={safeRequests}
            transporters={safeTransporters}
          />
        </div>

        <p className="text-white/30 text-xs text-center mt-3">
          Fire data from <a href="https://inciweb.wildfire.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">InciWeb</a> · Updates every 5 minutes
        </p>
      </div>
    </main>
  );
}
