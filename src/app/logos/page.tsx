import Link from "next/link";

const logos = [
  {
    id: 1,
    label: "All caps amber",
    node: (
      <span className="text-3xl font-black tracking-[6px] text-brand-amber uppercase">
        HERDOUT
      </span>
    ),
  },
  {
    id: 2,
    label: "Split color",
    node: (
      <span className="text-3xl font-black">
        <span className="text-white">HERD</span>
        <span className="text-brand-amber/50 mx-2">·</span>
        <span className="text-brand-amber">OUT</span>
      </span>
    ),
  },
  {
    id: 3,
    label: "Hex icon + wordmark",
    node: (
      <span className="flex items-center gap-3 text-3xl font-black">
        <svg width="32" height="36" viewBox="0 0 32 36">
          <polygon points="16,2 30,10 30,26 16,34 2,26 2,10" fill="#f59e0b" />
          <text x="16" y="24" textAnchor="middle" fill="#1e1b4b" fontSize="14" fontWeight="900" fontFamily="sans-serif">H</text>
        </svg>
        <span><span className="text-white">Herd</span><span className="text-brand-amber">Out</span></span>
      </span>
    ),
  },
  {
    id: 4,
    label: "Square H badge",
    node: (
      <span className="flex items-center gap-3 text-3xl font-black">
        <span className="w-10 h-10 bg-brand-amber rounded-lg flex items-center justify-center text-brand-green text-xl font-black">H</span>
        <span className="text-white">HerdOut</span>
      </span>
    ),
  },
  {
    id: 5,
    label: "Lowercase + arrow",
    node: (
      <span className="text-3xl font-bold">
        <span className="text-white">herdout</span>
        <span className="text-brand-amber ml-2">→</span>
      </span>
    ),
  },
  {
    id: 6,
    label: "Slash prefix",
    node: (
      <span className="text-3xl font-black">
        <span className="text-brand-amber">H/</span>
        <span className="text-white">HerdOut</span>
      </span>
    ),
  },
];

export default function LogosPage() {
  return (
    <main className="min-h-screen bg-brand-green px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-white/40 text-sm hover:text-white">← Home</Link>
        <h1 className="text-2xl font-extrabold text-white mt-2 mb-1">Logo Options</h1>
        <p className="text-white/40 text-sm mb-8">Pick one and let Rook know — this page will be removed once a logo is chosen.</p>

        {/* Preview in nav context */}
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">As it appears in the nav bar</p>
        <div className="space-y-4 mb-10">
          {logos.map((logo) => (
            <div key={logo.id} className="bg-white/5 rounded-xl overflow-hidden">
              {/* Nav bar simulation */}
              <div className="bg-[#151330] border-b border-white/10 px-4 h-14 flex items-center justify-between">
                <div>{logo.node}</div>
                <div className="flex items-center gap-3">
                  <span className="text-white/40 text-sm">Support</span>
                  <span className="text-white/40 text-sm">🗺 Map</span>
                  <span className="bg-brand-amber text-brand-green text-xs font-bold px-3 py-1.5 rounded-lg">Sign In</span>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-white/50 text-sm font-medium">Option {logo.id} — {logo.label}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/20 text-xs text-center">Tell Rook which number you want and it goes live immediately.</p>
      </div>
    </main>
  );
}
