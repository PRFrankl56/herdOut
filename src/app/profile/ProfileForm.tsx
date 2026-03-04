"use client";
import { useState } from "react";

interface Props {
  initialName: string;
  initialPhone: string;
  initialAddress: string;
  email: string;
}

export default function ProfileForm({ initialName, initialPhone, initialAddress, email }: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-brand-amber";

  return (
    <div className="bg-white/10 rounded-xl p-5 space-y-4">
      <h2 className="text-white font-bold text-lg">My Info</h2>
      <div>
        <label className="text-white/60 text-xs font-medium block mb-1">Email</label>
        <p className="text-white/40 text-sm px-4 py-3">{email}</p>
      </div>
      <div>
        <label className="text-white/60 text-xs font-medium block mb-1">Full Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputClass} />
      </div>
      <div>
        <label className="text-white/60 text-xs font-medium block mb-1">Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(970) 555-0000" className={inputClass} />
      </div>
      <div>
        <label className="text-white/60 text-xs font-medium block mb-1">Default Address <span className="text-white/30">(your property — pre-fills evacuation requests)</span></label>
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="1234 Ranch Rd, Jamestown, CO 80455" className={inputClass} />
      </div>
      <button onClick={handleSave} disabled={saving}
        className="w-full bg-brand-amber text-brand-green font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-60">
        {saved ? "✓ Saved" : saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
