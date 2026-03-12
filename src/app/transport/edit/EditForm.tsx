"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RIG_LENGTH_OPTIONS = [
  { value: "under-20", label: "Under 20ft" },
  { value: "20-30", label: "20-30ft" },
  { value: "30-40", label: "30-40ft" },
  { value: "over-40", label: "Over 40ft" },
];

const TRAILER_TYPE_OPTIONS = [
  "Stock trailer",
  "Slant load",
  "Straight load",
  "Gooseneck",
  "Bumper pull",
  "Flatbed",
];

const LIVESTOCK_OPTIONS = [
  "Cattle",
  "Goats/Sheep",
  "Pigs",
  "Other small livestock",
];

const DISTANCE_OPTIONS = [
  { value: "10", label: "Within 10 miles" },
  { value: "25", label: "10-25 miles" },
  { value: "50", label: "25-50 miles" },
  { value: "50+", label: "50+ miles" },
];

interface Props {
  transporter: {
    id: string;
    name: string;
    phone: string;
    address: string;
    stallCount: number;
    rigLengthFt: string;
    trailerTypes: string[];
    livestockTypes: string[];
    maxDistance: string;
    notes: string | null;
  };
}

export default function EditForm({ transporter }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(transporter.name);
  const [phone, setPhone] = useState(transporter.phone);
  const [address, setAddress] = useState(transporter.address);
  const [stallCount, setStallCount] = useState(transporter.stallCount);
  const [rigLengthFt, setRigLengthFt] = useState(transporter.rigLengthFt);
  const [trailerTypes, setTrailerTypes] = useState<string[]>(transporter.trailerTypes);
  const [livestockTypes, setLivestockTypes] = useState<string[]>(transporter.livestockTypes);
  const [maxDistance, setMaxDistance] = useState(transporter.maxDistance);
  const [notes, setNotes] = useState(transporter.notes ?? "");

  function toggleCheckbox(value: string, list: string[], setter: (v: string[]) => void) {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in your name, phone number, and address.");
      return;
    }
    if (trailerTypes.length === 0) {
      setError("Please select at least one trailer type.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/transporters/${transporter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          stallCount,
          rigLengthFt,
          trailerTypes,
          livestockTypes,
          maxDistance,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      router.push("/transport/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-white/20 bg-white/5 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-amber placeholder:text-white/30";

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/transport/dashboard")}
          className="text-white/50 hover:text-white text-sm mb-4 inline-block"
        >
          &larr; Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Edit Rig Details</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-white font-bold text-lg">Contact Info</h2>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Rig Details */}
          <div className="bg-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-white font-bold text-lg">Rig Details</h2>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Number of Horse Stalls</label>
              <input
                type="number"
                min={0}
                value={stallCount}
                onChange={(e) => setStallCount(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Rig Length</label>
              <select value={rigLengthFt} onChange={(e) => setRigLengthFt(e.target.value)} className={inputClass}>
                {RIG_LENGTH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Trailer Type</label>
              <div className="space-y-2">
                {TRAILER_TYPE_OPTIONS.map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trailerTypes.includes(type)}
                      onChange={() => toggleCheckbox(type, trailerTypes, setTrailerTypes)}
                      className="w-5 h-5 rounded border-white/30 text-brand-amber focus:ring-brand-amber bg-white/10"
                    />
                    <span className="text-sm text-white/80">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Other Livestock</label>
              <div className="space-y-2">
                {LIVESTOCK_OPTIONS.map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={livestockTypes.includes(type)}
                      onChange={() => toggleCheckbox(type, livestockTypes, setLivestockTypes)}
                      className="w-5 h-5 rounded border-white/30 text-brand-amber focus:ring-brand-amber bg-white/10"
                    />
                    <span className="text-sm text-white/80">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Max Haul Distance</label>
              <select value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className={inputClass}>
                {DISTANCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/10 rounded-xl p-5">
            <h2 className="text-white font-bold text-lg mb-3">Additional Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="E.g. warmblood-sized stalls, no stallions..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
