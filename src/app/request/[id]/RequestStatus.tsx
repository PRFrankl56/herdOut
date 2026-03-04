"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Animal { id: string; species: string; count: number; specialNeeds: string | null; }
interface Request {
  id: string; name: string; phone: string; address: string;
  situation: string | null; evacuationScope: string; trailerType: string;
  status: string; createdAt: string | Date; animals: Animal[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; description: string }> = {
  unmatched:  { label: "Finding a transporter",    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: "🔍", description: "We're searching for a transporter near you." },
  queued:     { label: "Contacting transporter",   color: "bg-blue-500/20 text-blue-300 border-blue-500/30",   icon: "📲", description: "A transporter has been notified and we're waiting for their response." },
  matched:    { label: "Transporter on the way",   color: "bg-green-500/20 text-green-300 border-green-500/30", icon: "🚛", description: "A transporter has accepted and is heading to you." },
  confirmed:  { label: "Transporter confirmed",    color: "bg-green-500/20 text-green-300 border-green-500/30", icon: "✅", description: "Your evacuation is confirmed." },
  completed:  { label: "Completed",                color: "bg-white/10 text-white/60 border-white/20",          icon: "✓",  description: "Your animals have been evacuated safely." },
};

export default function RequestStatus({ request }: { request: Request }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const status = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.unmatched;
  const createdAt = new Date(request.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  async function handleCancel() {
    setCancelling(true);
    await fetch(`/api/requests/${request.id}`, { method: "DELETE" });
    localStorage.removeItem("herdout_active_request");
    router.push("/");
  }

  const speciesEmoji: Record<string, string> = { horse: "🐴", cattle: "🐄", goat: "🐐", sheep: "🐑", pig: "🐷" };

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div>
          <Link href="/" className="text-white/50 text-sm hover:text-white">← Home</Link>
          <h1 className="text-3xl font-extrabold text-white mt-1">Evacuation Request</h1>
          <p className="text-white/40 text-xs mt-1">Submitted {createdAt} · ID: {request.id.slice(-6).toUpperCase()}</p>
        </div>

        {/* Status card */}
        <div className={`rounded-xl border p-5 ${status.color}`}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{status.icon}</span>
            <span className="font-bold text-lg">{status.label}</span>
          </div>
          <p className="text-sm opacity-80">{status.description}</p>
        </div>

        {/* Radar animation for searching state */}
        {(request.status === "unmatched" || request.status === "queued") && (
          <div className="bg-white/5 rounded-xl p-6 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              {/* Pulsing rings */}
              <div className="radar-ring absolute inset-0 rounded-full border-2 border-brand-amber/50" style={{ animationDelay: "0s" }} />
              <div className="radar-ring absolute inset-0 rounded-full border-2 border-brand-amber/30" style={{ animationDelay: "0.8s" }} />
              <div className="radar-ring absolute inset-0 rounded-full border-2 border-brand-amber/20" style={{ animationDelay: "1.6s" }} />
              {/* Static grid rings */}
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-8 rounded-full border border-white/10" />
              <div className="absolute inset-16 rounded-full border border-white/10" />
              {/* Radar sweep */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="radar-sweep absolute inset-0 origin-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 origin-bottom"
                    style={{ background: "linear-gradient(to top, rgba(245,158,11,0.9), transparent)" }} />
                  <div className="absolute inset-0 origin-center rounded-full"
                    style={{ background: "conic-gradient(from 270deg, rgba(245,158,11,0.12) 0deg, transparent 90deg)" }} />
                </div>
              </div>
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-brand-amber animate-pulse shadow-lg" style={{ boxShadow: "0 0 12px rgba(245,158,11,0.8)" }} />
              </div>
              {/* Orbiting trucks */}
              <div className="radar-orbit-1 absolute inset-0 origin-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-base">🚛</div>
              </div>
              <div className="radar-orbit-2 absolute inset-0 origin-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-base">🚛</div>
              </div>
              <div className="radar-orbit-3 absolute inset-0 origin-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-base">🚛</div>
              </div>
            </div>
            <p className="text-white/50 text-sm text-center">Scanning for available transporters near you</p>
            <div className="flex gap-2 mt-3">
              <div className="radar-dot w-2 h-2 rounded-full bg-brand-amber/70" style={{ animationDelay: "0s" }} />
              <div className="radar-dot w-2 h-2 rounded-full bg-brand-amber/70" style={{ animationDelay: "0.2s" }} />
              <div className="radar-dot w-2 h-2 rounded-full bg-brand-amber/70" style={{ animationDelay: "0.4s" }} />
              <div className="radar-dot w-2 h-2 rounded-full bg-brand-amber/70" style={{ animationDelay: "0.6s" }} />
            </div>
          </div>
        )}

        {/* Request details */}
        <div className="bg-white/10 rounded-xl p-5 space-y-3">
          <h2 className="text-white font-bold">Request Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/40 text-xs">Name</p>
              <p className="text-white">{request.name}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Phone</p>
              <p className="text-white">{request.phone}</p>
            </div>
          </div>
          <div>
            <p className="text-white/40 text-xs">Location</p>
            <p className="text-white text-sm">{request.address}</p>
          </div>
          {request.situation && (
            <div>
              <p className="text-white/40 text-xs">Situation</p>
              <p className="text-white text-sm">{request.situation}</p>
            </div>
          )}
        </div>

        {/* Animals */}
        <div className="bg-white/10 rounded-xl p-5">
          <h2 className="text-white font-bold mb-3">Animals</h2>
          <div className="space-y-2">
            {request.animals.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-xl">{speciesEmoji[a.species] ?? "🐾"}</span>
                <div>
                  <p className="text-white text-sm font-medium capitalize">{a.count}× {a.species}</p>
                  {a.specialNeeds && <p className="text-brand-amber text-xs">⚠ {a.specialNeeds}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {request.status !== "completed" && (
          <div className="space-y-3">
            <Link href={`/request/${request.id}/edit`}
              className="block w-full text-center bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors border border-white/20">
              ✏️ Edit Request
            </Link>

            {!showCancelConfirm ? (
              <button onClick={() => setShowCancelConfirm(true)}
                className="w-full text-white/40 hover:text-red-400 text-sm py-2 transition-colors">
                Cancel this request
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                <p className="text-white text-sm font-semibold text-center">Cancel your evacuation request?</p>
                <p className="text-white/50 text-xs text-center">Any matched transporters will be released.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition-colors">
                    Keep Request
                  </button>
                  <button onClick={handleCancel} disabled={cancelling}
                    className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60">
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
