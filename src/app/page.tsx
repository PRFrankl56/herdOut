import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-green flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-extrabold text-white mb-2">HerdOut</h1>
        <p className="text-brand-amber text-lg font-semibold mb-8">
          Livestock Evacuation Coordination
        </p>
        <p className="text-white/80 text-base mb-10">
          Wildfire threatening your property? We connect you with volunteers who
          have trailers and can help move your animals to safety.
        </p>
        <Link
          href="/request"
          className="inline-block bg-brand-amber text-brand-green font-bold text-lg px-8 py-5 rounded-lg shadow-lg hover:bg-amber-400 active:bg-amber-500 transition-colors"
        >
          I Need Help Evacuating My Animals
        </Link>
        <div className="mt-12">
          <Link
            href="/admin"
            className="text-white/60 text-sm underline hover:text-white/80"
          >
            View all requests (admin)
          </Link>
        </div>
      </div>
    </main>
  );
}
