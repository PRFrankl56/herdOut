"use client";

import { useState } from "react";

interface Animal {
  id: string;
  species: string;
  count: number;
  specialNeeds: string | null;
}

interface Request {
  id: string;
  name: string;
  phone: string;
  address: string;
  lat: number | null;
  lng: number | null;
  situation: string | null;
  trailerType: string;
  createdAt: Date;
  animals: Animal[];
}

interface Transporter {
  id: string;
  name: string;
  phone: string;
  address: string;
  lat: number | null;
  lng: number | null;
  stallCount: number;
  rigLengthFt: string;
  trailerTypes: string;
  livestockTypes: string;
  maxDistance: string;
  notes: string | null;
  createdAt: Date;
}

const DISTANCE_LABELS: Record<string, string> = {
  "10": "Within 10 miles",
  "25": "10-25 miles",
  "50": "25-50 miles",
  "50+": "50+ miles",
};

const RIG_LENGTH_LABELS: Record<string, string> = {
  "under-20": "Under 20ft",
  "20-30": "20-30ft",
  "30-40": "30-40ft",
  "over-40": "Over 40ft",
};

export default function AdminTabs({
  requests,
  transporters,
}: {
  requests: Request[];
  transporters: Transporter[];
}) {
  const [tab, setTab] = useState<"requests" | "transporters">("requests");

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tab === "requests"
              ? "bg-brand-green text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Evacuation Requests ({requests.length})
        </button>
        <button
          onClick={() => setTab("transporters")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tab === "transporters"
              ? "bg-brand-green text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Transporters ({transporters.length})
        </button>
      </div>

      {tab === "requests" && (
        <>
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No evacuation requests yet.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-bold text-lg text-gray-900">
                        {req.name}
                      </h2>
                      <p className="text-sm text-gray-600">{req.phone}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(req.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Location:</span>{" "}
                      {req.address}
                    </p>
                    {req.lat && req.lng && (
                      <p className="text-xs text-gray-500">
                        GPS: {req.lat}, {req.lng}
                      </p>
                    )}
                  </div>

                  {req.situation && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Situation:</span>{" "}
                        {req.situation}
                      </p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Animals:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {req.animals.map((animal) => (
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
                    {req.trailerType}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "transporters" && (
        <>
          {transporters.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No transporters registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              {transporters.map((t) => {
                let trailerArr: string[] = [];
                try {
                  trailerArr = JSON.parse(t.trailerTypes);
                } catch {}
                let livestockArr: string[] = [];
                try {
                  livestockArr = JSON.parse(t.livestockTypes);
                } catch {}

                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-lg border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="font-bold text-lg text-gray-900">
                          {t.name}
                        </h2>
                        <p className="text-sm text-gray-600">{t.phone}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(t.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Location:</span>{" "}
                        {t.address}
                      </p>
                      {t.lat && t.lng && (
                        <p className="text-xs text-gray-500">
                          GPS: {t.lat}, {t.lng}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">Stalls:</span>{" "}
                        {t.stallCount}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Rig length:</span>{" "}
                        {RIG_LENGTH_LABELS[t.rigLengthFt] || t.rigLengthFt}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Max distance:</span>{" "}
                        {DISTANCE_LABELS[t.maxDistance] || t.maxDistance}
                      </p>
                    </div>

                    {trailerArr.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Trailer types:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {trailerArr.map((type) => (
                            <span
                              key={type}
                              className="inline-block bg-brand-green/10 text-brand-green text-xs font-medium px-3 py-1 rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {livestockArr.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Also hauls:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {livestockArr.map((type) => (
                            <span
                              key={type}
                              className="inline-block bg-brand-amber/20 text-amber-800 text-xs font-medium px-3 py-1 rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {t.notes && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Notes:</span> {t.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
