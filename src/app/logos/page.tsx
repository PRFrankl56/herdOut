export default function LogosPage() {
  return (
    <main className="min-h-screen bg-brand-green px-4 py-10">
      <div className="max-w-lg mx-auto space-y-5">
        <h1 className="text-2xl font-extrabold text-white mb-6">Logo Options — pick a number</h1>

        {/* Each card shows the logo in a fake nav bar */}

        {/* 1 */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="bg-[#151330] h-14 px-4 flex items-center justify-between">
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 5, color: "#f59e0b", textTransform: "uppercase" }}>HERDOUT</span>
            <span className="text-white/30 text-xs">Sign In</span>
          </div>
          <div className="bg-white/5 px-4 py-2 text-white/50 text-sm">Option 1 — All caps amber</div>
        </div>

        {/* 2 */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="bg-[#151330] h-14 px-4 flex items-center justify-between">
            <span style={{ fontSize: 22, fontWeight: 900 }}>
              <span style={{ color: "#ffffff" }}>HERD</span>
              <span style={{ color: "#f59e0b", opacity: 0.5, margin: "0 8px" }}>·</span>
              <span style={{ color: "#f59e0b" }}>OUT</span>
            </span>
            <span className="text-white/30 text-xs">Sign In</span>
          </div>
          <div className="bg-white/5 px-4 py-2 text-white/50 text-sm">Option 2 — Split color</div>
        </div>

        {/* 3 */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="bg-[#151330] h-14 px-4 flex items-center justify-between">
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 900 }}>
              <span style={{ display: "inline-block", width: 28, height: 28, background: "#f59e0b", borderRadius: 4, textAlign: "center", lineHeight: "28px", color: "#1e1b4b", fontSize: 14, fontWeight: 900 }}>⬡</span>
              <span><span style={{ color: "#ffffff" }}>Herd</span><span style={{ color: "#f59e0b" }}>Out</span></span>
            </span>
            <span className="text-white/30 text-xs">Sign In</span>
          </div>
          <div className="bg-white/5 px-4 py-2 text-white/50 text-sm">Option 3 — Hex icon + wordmark</div>
        </div>

        {/* 4 */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="bg-[#151330] h-14 px-4 flex items-center justify-between">
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 900 }}>
              <span style={{ display: "inline-flex", width: 32, height: 32, background: "#f59e0b", borderRadius: 8, alignItems: "center", justifyContent: "center", color: "#1e1b4b", fontSize: 18, fontWeight: 900 }}>H</span>
              <span style={{ color: "#ffffff" }}>HerdOut</span>
            </span>
            <span className="text-white/30 text-xs">Sign In</span>
          </div>
          <div className="bg-white/5 px-4 py-2 text-white/50 text-sm">Option 4 — Square H badge</div>
        </div>

        {/* 5 */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="bg-[#151330] h-14 px-4 flex items-center justify-between">
            <span style={{ fontSize: 22, fontWeight: 700 }}>
              <span style={{ color: "#ffffff" }}>herdout</span>
              <span style={{ color: "#f59e0b", marginLeft: 8 }}>→</span>
            </span>
            <span className="text-white/30 text-xs">Sign In</span>
          </div>
          <div className="bg-white/5 px-4 py-2 text-white/50 text-sm">Option 5 — Lowercase + arrow</div>
        </div>

        {/* 6 */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="bg-[#151330] h-14 px-4 flex items-center justify-between">
            <span style={{ fontSize: 22, fontWeight: 900 }}>
              <span style={{ color: "#f59e0b" }}>H/</span>
              <span style={{ color: "#ffffff" }}>HerdOut</span>
            </span>
            <span className="text-white/30 text-xs">Sign In</span>
          </div>
          <div className="bg-white/5 px-4 py-2 text-white/50 text-sm">Option 6 — Slash prefix</div>
        </div>

        <p className="text-white/30 text-xs text-center pt-4">Tell Rook a number → it goes live and this page disappears.</p>
      </div>
    </main>
  );
}
