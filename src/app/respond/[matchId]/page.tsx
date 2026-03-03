"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Animal {
  id: string;
  species: string;
  count: number;
  specialNeeds: string | null;
}

interface MatchData {
  id: string;
  status: string;
  request: {
    id: string;
    name: string;
    phone: string;
    address: string;
    lat: number | null;
    lng: number | null;
    situation: string | null;
    trailerType: string;
    status: string;
    animals: Animal[];
  };
  transporter: {
    id: string;
    name: string;
    phone: string;
  };
}

export default function RespondPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    fetch(`/api/matches/${matchId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Match not found");
        return res.json();
      })
      .then((data) => setMatch(data))
      .catch(() => setError("Match not found or invalid link."))
      .finally(() => setLoading(false));
  }, [matchId]);

  async function handleRespond(action: "accept" | "reject") {
    setResponding(true);
    setError("");
    try {
      const res = await fetch(`/api/matches/${matchId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to respond");
      }
      const updated = await res.json();
      setMatch(updated);
      setDone(
        action === "accept"
          ? "You accepted this transport request. Thank you!"
          : "You declined this request. It will be reassigned."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setResponding(false);
    }
  }

  async function handleComplete() {
    setResponding(true);
    setError("");
    try {
      const res = await fetch(`/api/matches/${matchId}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete");
      }
      const updated = await res.json();
      setMatch(updated);
      setDone("Transport marked as complete. Thank you for your help!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setResponding(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error && !match) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </main>
    );
  }

  if (!match) return null;

  const totalAnimals = match.request.animals.reduce(
    (sum, a) => sum + a.count,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-brand-green mb-6">
          Transport Request
        </h1>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="mb-4">
            <h2 className="font-bold text-lg text-gray-900">
              {match.request.name}
            </h2>
            <p className="text-sm text-gray-600">{match.request.phone}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Location:</span>{" "}
              {match.request.address}
            </p>
            {match.request.lat && match.request.lng && (
              <p className="text-xs text-gray-500">
                GPS: {match.request.lat}, {match.request.lng}
              </p>
            )}
          </div>

          {match.request.situation && (
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Situation:</span>{" "}
                {match.request.situation}
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Animals ({totalAnimals} total):
            </p>
            <div className="flex flex-wrap gap-2">
              {match.request.animals.map((animal) => (
                <span
                  key={animal.id}
                  className="inline-block bg-brand-green/10 text-brand-green text-sm font-medium px-3 py-1 rounded-full"
                >
                  {animal.count}x{" "}
                  {animal.species.charAt(0).toUpperCase() +
                    animal.species.slice(1)}
                  {animal.specialNeeds && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({animal.specialNeeds})
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-700">
            <span className="font-semibold">Trailer needed:</span>{" "}
            {match.request.trailerType}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-800 font-semibold text-lg mb-2">{done}</p>
          </div>
        ) : match.status === "pending" ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleRespond("accept")}
              disabled={responding}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {responding ? "..." : "Accept"}
            </button>
            <button
              onClick={() => handleRespond("reject")}
              disabled={responding}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {responding ? "..." : "Decline"}
            </button>
          </div>
        ) : match.status === "accepted" ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-semibold">
                You accepted this request
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={responding}
              className="w-full bg-brand-green text-white py-3 rounded-lg font-semibold text-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50"
            >
              {responding ? "..." : "Mark as Complete"}
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600">
              This match is <span className="font-semibold">{match.status}</span>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
