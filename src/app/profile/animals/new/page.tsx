"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewAnimalPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    name: "", species: "horse", breed: "", color: "",
    markings: "", weightClass: "", specialNeeds: "", vetName: "", vetPhone: "",
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setPhotoUrl(data.url);
    setUploadingPhoto(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/animals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photoUrl }),
    });
    router.push("/profile/animals");
  };

  const field = (label: string, key: keyof typeof form, opts?: { placeholder?: string; optional?: boolean }) => (
    <div>
      <label className="block text-white/80 text-sm font-medium mb-1">
        {label}{opts?.optional && <span className="text-white/40 font-normal ml-1">(optional)</span>}
      </label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={opts?.placeholder}
        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-brand-amber"
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/profile/animals" className="text-white/50 text-sm hover:text-white">← My Animals</Link>
        <h1 className="text-3xl font-extrabold text-white mt-2 mb-8">Add Animal</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Photo <span className="text-white/40 font-normal">(optional)</span></label>
            {photoPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">Uploading...</div>
                )}
              </div>
            ) : null}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-white/30 rounded-lg text-white/60 hover:border-brand-amber hover:text-brand-amber transition-colors">
              {photoPreview ? "Change Photo" : "📷 Upload Photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          {field("Name", "name")}

          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">Species</label>
            <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-brand-amber">
              <option value="horse">Horse</option>
              <option value="cattle">Cattle</option>
              <option value="goat">Goat</option>
              <option value="sheep">Sheep</option>
              <option value="pig">Pig</option>
              <option value="other">Other</option>
            </select>
          </div>

          {field("Breed", "breed", { optional: true })}
          {field("Color", "color", { optional: true })}
          {field("Markings", "markings", { placeholder: "e.g. white blaze, three white socks", optional: true })}

          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">Weight Class <span className="text-white/40 font-normal">(optional)</span></label>
            <select value={form.weightClass} onChange={(e) => setForm({ ...form, weightClass: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-brand-amber">
              <option value="">Select...</option>
              <option value="pony">Pony (&lt;14.2hh)</option>
              <option value="light">Light Horse</option>
              <option value="warmblood">Warmblood</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">Special Needs <span className="text-white/40 font-normal">(optional)</span></label>
            <textarea value={form.specialNeeds} onChange={(e) => setForm({ ...form, specialNeeds: e.target.value })}
              placeholder="Stallion, warm blood size, difficult to load"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-brand-amber resize-none" />
          </div>

          {field("Vet Name", "vetName", { optional: true })}
          {field("Vet Phone", "vetPhone", { optional: true })}

          <button type="submit" disabled={loading || uploadingPhoto}
            className="w-full bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-60 mt-4">
            {loading ? "Saving..." : "Save Animal"}
          </button>
        </form>
      </div>
    </main>
  );
}
