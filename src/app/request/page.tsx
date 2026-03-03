"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SPECIES_OPTIONS = ["horse", "cattle", "goat", "sheep", "pig", "other"];
const TRAILER_OPTIONS = [
  { value: "stock", label: "Stock Trailer" },
  { value: "horse", label: "Horse Trailer" },
  { value: "flatbed", label: "Flatbed" },
  { value: "any", label: "Any" },
];

interface AnimalEntry {
  species: string;
  count: number;
  specialNeeds: string;
}

export default function RequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [situation, setSituation] = useState("");
  const [locating, setLocating] = useState(false);

  // Step 2 fields
  const [animals, setAnimals] = useState<AnimalEntry[]>([
    { species: "horse", count: 1, specialNeeds: "" },
  ]);
  const [trailerType, setTrailerType] = useState("any");

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        if (!address) {
          setAddress(
            `GPS: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
          );
        }
        setLocating(false);
      },
      () => {
        setError("Unable to get your location");
        setLocating(false);
      }
    );
  }

  function addAnimal() {
    setAnimals([...animals, { species: "horse", count: 1, specialNeeds: "" }]);
  }

  function removeAnimal(index: number) {
    setAnimals(animals.filter((_, i) => i !== index));
  }

  function updateAnimal(index: number, field: keyof AnimalEntry, value: string | number) {
    const updated = [...animals];
    updated[index] = { ...updated[index], [field]: value };
    setAnimals(updated);
  }

  function goToStep2() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in your name, phone number, and location.");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit() {
    if (animals.length === 0) {
      setError("Please add at least one animal.");
      return;
    }
    for (const a of animals) {
      if (a.count < 1) {
        setError("Each animal entry must have a count of at least 1.");
        return;
      }
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          lat,
          lng,
          situation: situation || null,
          trailerType,
          animals: animals.map((a) => ({
            species: a.species,
            count: a.count,
            specialNeeds: a.specialNeeds || null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      router.push("/request/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-brand-green mb-1">
          Request Evacuation Help
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Step {step} of 2:{" "}
          {step === 1 ? "Your Information" : "Your Animals"}
        </p>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-2 flex-1 rounded bg-brand-green" />
          <div
            className={`h-2 flex-1 rounded ${step === 2 ? "bg-brand-green" : "bg-gray-300"}`}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="(555) 555-1234"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Location / Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Street address or description"
              />
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="mt-2 text-sm font-semibold text-brand-green underline hover:text-brand-green/80 disabled:opacity-50"
              >
                {locating ? "Getting location..." : "Use my GPS location"}
              </button>
              {lat && lng && (
                <p className="text-xs text-gray-500 mt-1">
                  GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Situation Description (optional)
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Describe your situation — fire proximity, road conditions, etc."
              />
            </div>

            <button
              onClick={goToStep2}
              className="w-full bg-brand-green text-white font-bold text-lg py-4 rounded-lg hover:bg-brand-green/90 active:bg-brand-green/80 transition-colors"
            >
              Next: Your Animals
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {animals.map((animal, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">
                    Animal #{i + 1}
                  </span>
                  {animals.length > 1 && (
                    <button
                      onClick={() => removeAnimal(i)}
                      className="text-red-500 text-sm font-semibold hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Species
                    </label>
                    <select
                      value={animal.species}
                      onChange={(e) =>
                        updateAnimal(i, "species", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                    >
                      {SPECIES_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={animal.count}
                      onChange={(e) =>
                        updateAnimal(i, "count", parseInt(e.target.value) || 0)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Special Needs (optional)
                  </label>
                  <input
                    type="text"
                    value={animal.specialNeeds}
                    onChange={(e) =>
                      updateAnimal(i, "specialNeeds", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Injured, pregnant, aggressive, etc."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addAnimal}
              className="w-full border-2 border-dashed border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors"
            >
              + Add Another Animal Type
            </button>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Trailer Type Needed
              </label>
              <select
                value={trailerType}
                onChange={(e) => setTrailerType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                {TRAILER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 font-bold text-lg py-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 active:bg-amber-500 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
