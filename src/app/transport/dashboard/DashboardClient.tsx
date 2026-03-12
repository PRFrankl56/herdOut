"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Animal {
  id: string;
  species: string;
  count: number;
  specialNeeds: string | null;
}

interface TransporterData {
  id: string;
  name: string;
  phone: string;
  address: string;
  stallCount: number;
  rigLengthFt: string;
  trailerTypes: string[];
  livestockTypes: string[];
  maxDistance: string;
  availability: string;
  notes: string | null;
}

interface ActiveMatchData {
  id: string;
  request: {
    name: string;
    phone: string;
    address: string;
    situation: string | null;
    animals: Animal[];
  };
}

interface PendingMatchData {
  id: string;
  createdAt: string;
  request: {
    name: string;
    phone: string;
    address: string;
    situation: string | null;
    trailerType: string;
    animals: Animal[];
  };
}

interface CompletedMatchData {
  id: string;
  completedAt: string;
  request: {
    name: string;
    address: string;
    animalCount: number;
  };
}

interface Props {
  transporter: TransporterData;
  activeMatch: ActiveMatchData | null;
  pendingMatches: PendingMatchData[];
  completedMatches: CompletedMatchData[];
}

export default function DashboardClient({
  transporter,
  activeMatch: initialActive,
  pendingMatches: initialPending,
  completedMatches,
}: Props) {
  const router = useRouter();
  const [availability, setAvailability] = useState(transporter.availability);
  const [toggling, setToggling] = useState(false);
  const [activeMatch, setActiveMatch] = useState(initialActive);
  const [pendingMatches, setPendingMatches] = useState(initialPending);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isAvailable = availability === "available";

  async function toggleAvailability() {
    setToggling(true);
    setError("");
    const newVal = isAvailable ? "unavailable" : "available";
    try {
      const res = await fetch(`/api/transporters/${transporter.id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: newVal }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
      setAvailability(newVal);
    } catch {
      setError("Failed to update availability");
    } finally {
      setToggling(false);
    }
  }

  async function handleComplete(matchId: string) {
    setActing(matchId);
    setError("");
    try {
      const res = await fetch(`/api/matches/${matchId}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark complete");
      setActiveMatch(null);
      setAvailability("available");
      router.refresh();
    } catch {
      setError("Failed to mark transport complete");
    } finally {
      setActing(null);
    }
  }

  async function handleRespond(matchId: string, action: "accept" | "reject") {
    setActing(matchId);
    setError("");
    try {
      const res = await fetch(`/api/matches/${matchId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} request`);

      if (action === "accept") {
        // Move this match to active, set unavailable
        const pending = pendingMatches.find(m => m.id === matchId);
        if (pending) {
          setActiveMatch({
            id: pending.id,
            request: {
              name: pending.request.name,
              phone: pending.request.phone,
              address: pending.request.address,
              situation: pending.request.situation,
              animals: pending.request.animals,
            },
          });
        }
        setAvailability("unavailable");
      }

      // Remove from pending list
      setPendingMatches(prev => prev.filter(m => m.id !== matchId));
      router.refresh();
    } catch {
      setError(`Failed to ${action} request`);
    } finally {
      setActing(null);
    }
  }

  const distanceLabel: Record<string, string> = {
    "10": "10 mi",
    "25": "25 mi",
    "50": "50 mi",
    "50+": "50+ mi",
  };

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">Transporter ops center</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Availability Toggle */}
        <div className="bg-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Available to Transport</h2>
              <p className="text-white/50 text-sm mt-0.5">
                {isAvailable
                  ? "You'll receive new transport requests"
                  : "You won't receive new requests"}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`relative w-16 h-9 rounded-full transition-colors duration-200 ${
                isAvailable ? "bg-green-500" : "bg-white/20"
              } disabled:opacity-50`}
              aria-label={isAvailable ? "Set unavailable" : "Set available"}
            >
              <span
                className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-transform duration-200 ${
                  isAvailable ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active Assignment */}
        {activeMatch && (
          <div className="bg-brand-amber/20 border-2 border-brand-amber rounded-xl p-5">
            <p className="text-brand-amber font-bold text-sm uppercase tracking-wide mb-3">
              Active Assignment
            </p>
            <div className="space-y-2">
              <p className="text-white font-semibold text-lg">{activeMatch.request.name}</p>
              <a
                href={`tel:${activeMatch.request.phone}`}
                className="text-brand-amber font-medium text-sm hover:underline block"
              >
                {activeMatch.request.phone}
              </a>
              <p className="text-white/70 text-sm">{activeMatch.request.address}</p>
              {activeMatch.request.situation && (
                <p className="text-white/50 text-sm italic">{activeMatch.request.situation}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {activeMatch.request.animals.map((a) => (
                  <span
                    key={a.id}
                    className="bg-white/10 text-white text-sm px-3 py-1 rounded-full"
                  >
                    {a.count}x {a.species.charAt(0).toUpperCase() + a.species.slice(1)}
                    {a.specialNeeds && (
                      <span className="text-white/50 text-xs ml-1">({a.specialNeeds})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleComplete(activeMatch.id)}
              disabled={acting === activeMatch.id}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {acting === activeMatch.id ? "Completing..." : "Mark Complete"}
            </button>
          </div>
        )}

        {/* Pending Requests */}
        {pendingMatches.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-lg">Pending Requests</h2>
            {pendingMatches.map((m) => {
              const totalAnimals = m.request.animals.reduce((s, a) => s + a.count, 0);
              return (
                <div key={m.id} className="bg-white/10 rounded-xl p-5 border border-white/10">
                  <div className="space-y-2 mb-4">
                    <p className="text-white font-semibold">{m.request.name}</p>
                    <p className="text-white/70 text-sm">{m.request.address}</p>
                    <p className="text-white/50 text-sm">
                      {totalAnimals} animal{totalAnimals !== 1 ? "s" : ""} &middot; {m.request.trailerType} trailer
                    </p>
                    {m.request.situation && (
                      <p className="text-white/50 text-sm italic">{m.request.situation}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {m.request.animals.map((a) => (
                        <span
                          key={a.id}
                          className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full"
                        >
                          {a.count}x {a.species}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespond(m.id, "accept")}
                      disabled={acting === m.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {acting === m.id ? "..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleRespond(m.id, "reject")}
                      disabled={acting === m.id}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 border border-white/20"
                    >
                      {acting === m.id ? "..." : "Decline"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rig Details */}
        <div className="bg-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Rig Details</h2>
            <Link
              href="/transport/edit"
              className="text-brand-amber text-sm font-semibold hover:underline"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Stalls</span>
              <span className="text-white font-medium">{transporter.stallCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Rig Length</span>
              <span className="text-white font-medium">{transporter.rigLengthFt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Trailer Types</span>
              <span className="text-white font-medium text-right max-w-[60%]">
                {transporter.trailerTypes.length > 0
                  ? transporter.trailerTypes.join(", ")
                  : "—"}
              </span>
            </div>
            {transporter.livestockTypes.length > 0 && (
              <div className="flex justify-between">
                <span className="text-white/50">Livestock</span>
                <span className="text-white font-medium text-right max-w-[60%]">
                  {transporter.livestockTypes.join(", ")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/50">Max Distance</span>
              <span className="text-white font-medium">
                {distanceLabel[transporter.maxDistance] ?? transporter.maxDistance}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Address</span>
              <span className="text-white font-medium text-right max-w-[60%]">
                {transporter.address}
              </span>
            </div>
          </div>
        </div>

        {/* Transport History */}
        <div className="bg-white/10 rounded-xl p-5">
          <h2 className="text-white font-bold text-lg mb-3">Transport History</h2>
          {completedMatches.length === 0 ? (
            <p className="text-white/50 text-sm">No completed transports yet.</p>
          ) : (
            <div className="space-y-3">
              {completedMatches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{m.request.name}</p>
                    <p className="text-white/50 text-xs">{m.request.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">{m.request.animalCount} animal{m.request.animalCount !== 1 ? "s" : ""}</p>
                    <p className="text-white/40 text-xs">
                      {new Date(m.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
