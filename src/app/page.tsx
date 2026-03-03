import Link from "next/link";
import { fetchWildfires } from "@/lib/wildfires";

export const revalidate = 300; // refresh every 5 minutes

export default async function Home() {
  const fires = await fetchWildfires();

  return (
    <main className="min-h-screen bg-brand-green">
      {/* Hero */}
      <section className="px-4 py-16 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-3">HerdOut</h1>
        <p className="text-brand-amber text-xl font-semibold mb-4">Livestock Evacuation Coordination</p>
        <p className="text-white/70 text-base mb-10">
          Wildfire threatening your property? We connect animal owners with volunteer transporters to move livestock to safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/request"
            className="bg-brand-amber text-brand-green font-bold text-lg px-8 py-5 rounded-xl shadow-lg hover:bg-amber-400 active:bg-amber-500 transition-colors">
            🚨 I Need Evacuation Help
          </Link>
          <Link href="/transport"
            className="bg-white/10 text-white font-bold text-lg px-8 py-5 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
            🚛 I Can Transport Animals
          </Link>
        </div>
      </section>

      {/* Active Wildfires */}
      <section className="px-4 pb-16 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-2xl font-bold">
            🔥 Active Wildfires
          </h2>
          <Link href="/map" className="text-brand-amber text-sm font-semibold hover:underline">
            View Map →
          </Link>
        </div>

        {fires.length === 0 ? (
          <div className="bg-white/10 rounded-xl p-8 text-center">
            <p className="text-white/60">No active wildfires reported in the western US right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fires.slice(0, 15).map((fire, i) => (
              <a
                key={i}
                href={fire.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base leading-snug">{fire.title}</h3>
                    <p className="text-white/50 text-sm mt-1">{fire.state}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block bg-red-500/20 text-red-300 text-xs font-bold px-2 py-1 rounded-full">
                      ACTIVE
                    </span>
                    {fire.updated && (
                      <p className="text-white/30 text-xs mt-1">Updated {fire.updated}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <p className="text-white/30 text-xs text-center mt-4">
          Data from <a href="https://inciweb.wildfire.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">InciWeb</a> · Wildfire incidents in western US states only
        </p>
      </section>
    </main>
  );
}
