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

export default function TransportPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Contact info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  // Rig details
  const [stallCount, setStallCount] = useState(0);
  const [rigLengthFt, setRigLengthFt] = useState("20-30");
  const [trailerTypes, setTrailerTypes] = useState<string[]>([]);
  const [livestockTypes, setLivestockTypes] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState("25");

  // Notes
  const [notes, setNotes] = useState("");

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

  function toggleCheckbox(value: string, list: string[], setter: (v: string[]) => void) {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in your name, phone number, and location.");
      return;
    }
    if (trailerTypes.length === 0) {
      setError("Please select at least one trailer type.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/transporters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          lat,
          lng,
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
        throw new Error(data.error || "Failed to submit");
      }

      router.push("/transport/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-brand-green mb-1">
          Volunteer Transporter Registration
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Register your rig to help evacuate livestock
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Contact Info */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Full Name *
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
                  Current Location / Address *
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
            </div>
          </section>

          {/* Rig Details */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Rig Details</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Number of Horse Stalls *
                </label>
                <input
                  type="number"
                  min={0}
                  value={stallCount}
                  onChange={(e) => setStallCount(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Rig Length *
                </label>
                <select
                  value={rigLengthFt}
                  onChange={(e) => setRigLengthFt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  {RIG_LENGTH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Helps owners know if their driveway/property is accessible
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Trailer Type *
                </label>
                <div className="space-y-2">
                  {TRAILER_TYPE_OPTIONS.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={trailerTypes.includes(type)}
                        onChange={() =>
                          toggleCheckbox(type, trailerTypes, setTrailerTypes)
                        }
                        className="w-5 h-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                      />
                      <span className="text-sm text-gray-800">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Can haul other livestock besides horses?
                </label>
                <div className="space-y-2">
                  {LIVESTOCK_OPTIONS.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={livestockTypes.includes(type)}
                        onChange={() =>
                          toggleCheckbox(type, livestockTypes, setLivestockTypes)
                        }
                        className="w-5 h-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                      />
                      <span className="text-sm text-gray-800">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Max Haul Distance *
                </label>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  {DISTANCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Additional Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="E.g. warmblood-sized stalls, no stallions, experienced with cattle loading..."
            />
          </section>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 active:bg-amber-500 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Register as Transporter"}
          </button>
        </div>
      </div>
    </main>
  );
}
