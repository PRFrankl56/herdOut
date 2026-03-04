"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Animal {
  id: string; name: string; species: string; breed: string | null;
  color: string | null; markings: string | null; weightClass: string | null;
  specialNeeds: string | null; vetName: string | null; vetPhone: string | null;
  photoUrl: string | null;
}

export default function EditAnimalForm({ animal }: { animal: Animal }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(animal.photoUrl);
  const [photoPreview, setPhotoPreview] = useState<string | null>(animal.photoUrl);

  const [form, setForm] = useState({
    name: animal.name,
    species: animal.species,
    breed: animal.breed ?? "",
    color: animal.color ?? "",
    markings: animal.markings ?? "",
    weightClass: animal.weightClass ?? "",
    specialNeeds: animal.specialNeeds ?? "",
    vetName: animal.vetName ?? "",
    vetPhone: animal.vetPhone ?? "",
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/animals/${animal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photoUrl }),
    });
    router.push("/profile/animals");
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/animals/${animal.id}`, { method: "DELETE" });
    router.push("/profile/animals");
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-brand-amber";

  const field = (label: string, key: keyof typeof form, opts?: { placeholder?: string; optional?: boolean }) => (
    <div>
      <label className="block text-white/60 text-xs font-medium mb-1">
        {label}{opts?.optional && <span className="text-white/30 ml-1">(optional)</span>}
      </label>
      <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={opts?.placeholder} className={inputClass} />
    </div>
  );

  return (
    <main className="min-h-screen bg-brand-green px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/profile/animals" className="text-white/50 text-sm hover:text-white">← My Animals</Link>
        <h1 className="text-3xl font-extrabold text-white mt-2 mb-6">Edit {animal.name}</h1>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-2">Photo <span className="text-white/30">(optional)</span></label>
            {photoPreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">Uploading...</div>
                )}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-white/30 rounded-lg text-white/60 hover:border-brand-amber hover:text-brand-amber transition-colors">
              {photoPreview ? "Change Photo" : "📷 Upload Photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          {field("Name", "name")}

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1">Species</label>
            <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}
              className={inputClass + " bg-[#1e1b4b]"}>
              {["horse","cattle","goat","sheep","pig","other"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {field("Breed", "breed", { optional: true })}
          {field("Color", "color", { optional: true })}
          {field("Markings", "markings", { placeholder: "e.g. white blaze, three white socks", optional: true })}

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1">Weight Class <span className="text-white/30">(optional)</span></label>
            <select value={form.weightClass} onChange={(e) => setForm({ ...form, weightClass: e.target.value })}
              className={inputClass + " bg-[#1e1b4b]"}>
              <option value="">Select...</option>
              <option value="pony">Pony (&lt;14.2hh)</option>
              <option value="light">Light Horse</option>
              <option value="warmblood">Warmblood</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1">Special Needs <span className="text-white/30">(optional)</span></label>
            <textarea value={form.specialNeeds} onChange={(e) => setForm({ ...form, specialNeeds: e.target.value })}
              rows={2} className={inputClass + " resize-none"} placeholder="Difficult to load, medical needs, etc." />
          </div>

          {field("Vet Name", "vetName", { optional: true })}
          {field("Vet Phone", "vetPhone", { optional: true })}

          <button type="submit" disabled={loading || uploadingPhoto}
            className="w-full bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-60 mt-2">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Delete */}
        <div className="mt-6">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-white/30 hover:text-red-400 text-sm py-2 transition-colors">
              Remove this animal
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
              <p className="text-white text-sm font-semibold text-center">Remove {animal.name} from your profile?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Keep
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60">
                  {deleting ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
