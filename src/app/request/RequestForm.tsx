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

interface SavedAnimal {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  specialNeeds: string | null;
  photoUrl: string | null;
}

interface AnimalEntry {
  species: string;
  count: number;
  specialNeeds: string;
}

interface Props {
  profile: { name: string; phone: string; address: string };
  savedAnimals: SavedAnimal[];
}

export default function RequestForm({ profile, savedAnimals }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [useProfileAddress, setUseProfileAddress] = useState(!!profile.address);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [situation, setSituation] = useState("");
  const [evacuationScope, setEvacuationScope] = useState("own");
  const [locating, setLocating] = useState(false);

  // Animals — pre-select all saved animals by default
  const [selectedSavedIds, setSelectedSavedIds] = useState<Set<string>>(
    new Set(savedAnimals.map((a) => a.id))
  );
  const [manualAnimals, setManualAnimals] = useState<AnimalEntry[]>(
    savedAnimals.length === 0 ? [{ species: "horse", count: 1, specialNeeds: "" }] : []
  );
  const [trailerType, setTrailerType] = useState("any");

  function handleUseLocation() {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        if (!address) setAddress(`GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => { setError("Unable to get your location"); setLocating(false); }
    );
  }

  function toggleSavedAnimal(id: string) {
    setSelectedSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function addManualAnimal() {
    setManualAnimals([...manualAnimals, { species: "horse", count: 1, specialNeeds: "" }]);
  }

  function updateManualAnimal(i: number, field: keyof AnimalEntry, value: string | number) {
    const updated = [...manualAnimals];
    updated[i] = { ...updated[i], [field]: value };
    setManualAnimals(updated);
  }

  function goToStep2() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in your name, phone, and location.");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit() {
    const animalList: AnimalEntry[] = [
      ...savedAnimals
        .filter((a) => selectedSavedIds.has(a.id))
        .map((a) => ({ species: a.species, count: 1, specialNeeds: a.specialNeeds ?? "" })),
      ...manualAnimals,
    ];

    if (animalList.length === 0) {
      setError("Please select or add at least one animal.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, lat, lng, situation: situation || null, evacuationScope, trailerType, animals: animalList }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      localStorage.setItem("herdout_active_request", data.id);
      router.push(`/request/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green";
  const hasProfile = !!(profile.name || profile.phone || profile.address);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-brand-green mb-1">Request Evacuation Help</h1>
        <p className="text-sm text-gray-600 mb-6">Step {step} of 2: {step === 1 ? "Your Information" : "Your Animals"}</p>

        <div className="flex gap-2 mb-8">
          <div className="h-2 flex-1 rounded bg-brand-green" />
          <div className={`h-2 flex-1 rounded ${step === 2 ? "bg-brand-green" : "bg-gray-300"}`} />
        </div>

        {hasProfile && step === 1 && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-sm text-green-800 flex items-center gap-2">
            ✓ Pre-filled from your profile — review and update if needed
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">{error}</div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Your Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Phone Number *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="(555) 555-1234" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Evacuation Location *</label>
              {profile.address && (
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={useProfileAddress} onChange={(e) => {
                    setUseProfileAddress(e.target.checked);
                    if (e.target.checked) setAddress(profile.address);
                    else setAddress("");
                  }} className="w-4 h-4 accent-brand-green" />
                  <span className="text-sm text-gray-700">Use my profile address <span className="text-gray-400">({profile.address})</span></span>
                </label>
              )}
              {(!useProfileAddress || !profile.address) && (
                <>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Street address or description" />
                  <button type="button" onClick={handleUseLocation} disabled={locating}
                    className="mt-2 text-sm font-semibold text-brand-green underline hover:text-brand-green/80 disabled:opacity-50">
                    {locating ? "Getting location..." : "Use my GPS location"}
                  </button>
                  {lat && lng && <p className="text-xs text-gray-500 mt-1">GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</p>}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Situation Description (optional)</label>
              <textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={3} className={inputClass}
                placeholder="Fire proximity, road conditions, urgency..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Who needs evacuation? *</label>
              <div className="space-y-2">
                {["own", "all"].map((val) => (
                  <label key={val} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="scope" value={val} checked={evacuationScope === val}
                      onChange={(e) => setEvacuationScope(e.target.value)} className="w-4 h-4 accent-brand-green" />
                    <span className="text-base text-gray-800">
                      {val === "own" ? "My animals only" : "All animals at this property"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={goToStep2}
              className="w-full bg-brand-green text-white font-bold text-lg py-4 rounded-lg hover:bg-brand-green/90 transition-colors">
              Next: Your Animals
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Saved animals from profile */}
            {savedAnimals.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Your registered animals — tap to include/exclude:</p>
                <div className="space-y-2">
                  {savedAnimals.map((a) => (
                    <label key={a.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedSavedIds.has(a.id) ? "border-brand-green bg-green-50" : "border-gray-200 bg-white"
                    }`}>
                      <input type="checkbox" checked={selectedSavedIds.has(a.id)} onChange={() => toggleSavedAnimal(a.id)} className="w-5 h-5 accent-brand-green" />
                      {a.photoUrl
                        ? <img src={a.photoUrl} alt={a.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        : <span className="text-2xl">{a.species === "horse" ? "🐴" : a.species === "cattle" ? "🐄" : "🐾"}</span>
                      }
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{a.name}</p>
                        <p className="text-gray-500 text-xs capitalize">{a.species}{a.breed ? ` · ${a.breed}` : ""}</p>
                        {a.specialNeeds && <p className="text-amber-600 text-xs">⚠ {a.specialNeeds}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Manual animal entries */}
            {manualAnimals.map((animal, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">Additional Animal</span>
                  <button onClick={() => setManualAnimals(manualAnimals.filter((_, j) => j !== i))}
                    className="text-red-500 text-sm font-semibold hover:text-red-700">Remove</button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Species</label>
                    <select value={animal.species} onChange={(e) => updateManualAnimal(i, "species", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green">
                      {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Count</label>
                    <input type="number" min={1} value={animal.count}
                      onChange={(e) => updateManualAnimal(i, "count", parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Special Needs (optional)</label>
                  <input type="text" value={animal.specialNeeds} onChange={(e) => updateManualAnimal(i, "specialNeeds", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Difficult to load, medical needs, etc." />
                </div>
              </div>
            ))}

            <button onClick={addManualAnimal}
              className="w-full border-2 border-dashed border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors">
              + Add {savedAnimals.length > 0 ? "Another" : "Animal"}
            </button>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Trailer Type Needed</label>
              <select value={trailerType} onChange={(e) => setTrailerType(e.target.value)}
                className={inputClass}>
                {TRAILER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 font-bold text-lg py-4 rounded-lg hover:bg-gray-100 transition-colors">
                Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-[2] bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
