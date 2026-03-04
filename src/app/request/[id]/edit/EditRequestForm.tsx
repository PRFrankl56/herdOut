"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SPECIES_OPTIONS = ["horse", "cattle", "goat", "sheep", "pig", "other"];
const TRAILER_OPTIONS = [
  { value: "stock", label: "Stock Trailer" },
  { value: "horse", label: "Horse Trailer" },
  { value: "flatbed", label: "Flatbed" },
  { value: "any", label: "Any" },
];

interface Animal { id: string; species: string; count: number; specialNeeds: string | null; }
interface Request {
  id: string; name: string; phone: string; address: string;
  situation: string | null; evacuationScope: string; trailerType: string;
  animals: Animal[];
}

export default function EditRequestForm({ request }: { request: Request }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(request.name);
  const [phone, setPhone] = useState(request.phone);
  const [address, setAddress] = useState(request.address);
  const [situation, setSituation] = useState(request.situation ?? "");
  const [evacuationScope, setEvacuationScope] = useState(request.evacuationScope);
  const [trailerType, setTrailerType] = useState(request.trailerType);
  const [animals, setAnimals] = useState(request.animals.map((a) => ({
    species: a.species, count: a.count, specialNeeds: a.specialNeeds ?? "",
  })));

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || animals.length === 0) {
      setError("Please fill in all required fields and add at least one animal.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, situation: situation || null, evacuationScope, trailerType, animals }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      router.push(`/request/${request.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href={`/request/${request.id}`} className="text-brand-green text-sm hover:underline">← Back to status</Link>
        <h1 className="text-2xl font-bold text-brand-green mt-2 mb-2">Edit Request</h1>
        <p className="text-sm text-gray-500 mb-6">Saving will return your request to the queue for re-matching.</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Your Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Phone *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Location *</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Situation</label>
            <textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Evacuation scope</label>
            {["own", "all"].map((val) => (
              <label key={val} className="flex items-center gap-3 cursor-pointer mb-2">
                <input type="radio" name="scope" value={val} checked={evacuationScope === val} onChange={() => setEvacuationScope(val)} className="w-4 h-4 accent-brand-green" />
                <span className="text-gray-800">{val === "own" ? "My animals only" : "All animals at this property"}</span>
              </label>
            ))}
          </div>

          {/* Animals */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Animals *</label>
            <div className="space-y-3">
              {animals.map((a, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 text-sm">Animal #{i + 1}</span>
                    {animals.length > 1 && (
                      <button type="button" onClick={() => setAnimals(animals.filter((_, j) => j !== i))}
                        className="text-red-500 text-sm hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <select value={a.species} onChange={(e) => { const u = [...animals]; u[i] = { ...u[i], species: e.target.value }; setAnimals(u); }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green">
                        {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="w-24">
                      <input type="number" min={1} value={a.count}
                        onChange={(e) => { const u = [...animals]; u[i] = { ...u[i], count: parseInt(e.target.value) || 1 }; setAnimals(u); }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green" />
                    </div>
                  </div>
                  <input type="text" value={a.specialNeeds} placeholder="Special needs (optional)"
                    onChange={(e) => { const u = [...animals]; u[i] = { ...u[i], specialNeeds: e.target.value }; setAnimals(u); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-green" />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setAnimals([...animals, { species: "horse", count: 1, specialNeeds: "" }])}
              className="mt-3 w-full border-2 border-dashed border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors">
              + Add Animal
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Trailer Type</label>
            <select value={trailerType} onChange={(e) => setTrailerType(e.target.value)} className={inputClass}>
              {TRAILER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-60">
            {submitting ? "Saving..." : "Save & Re-queue Request"}
          </button>
        </form>
      </div>
    </main>
  );
}
