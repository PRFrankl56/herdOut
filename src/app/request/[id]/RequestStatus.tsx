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
          {(request.status === "unmatched" || request.status === "queued") && (
            <div className="mt-3 flex gap-1">
              {[0,1,2].map((i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full bg-current opacity-30 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          )}
        </div>

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
