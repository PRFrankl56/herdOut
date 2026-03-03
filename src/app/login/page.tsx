"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, callbackUrl: "/profile", redirect: false });
    setSent(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-brand-green flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-white mb-2 text-center">HerdOut</h1>
        <p className="text-brand-amber text-center font-semibold mb-8">Livestock Evacuation Coordination</p>

        {sent ? (
          <div className="bg-white/10 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-white text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-white/70">We sent a sign-in link to <strong className="text-white">{email}</strong>. Click the link to continue.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/10 rounded-xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">Sign In</h2>
            <label className="block text-white/80 text-sm font-medium mb-2">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-brand-amber mb-6 text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 active:bg-amber-500 transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Sign-In Link"}
            </button>
            <p className="text-white/50 text-sm text-center mt-4">No password needed — we&apos;ll email you a link.</p>
          </form>
        )}
      </div>
    </main>
  );
}
