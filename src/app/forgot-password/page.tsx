"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-brand-green flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-white mb-2 text-center">HerdOut</h1>
        <p className="text-brand-amber text-center font-semibold mb-8">Livestock Evacuation Coordination</p>

        <div className="bg-white/10 rounded-xl p-8">
          {submitted ? (
            <div className="text-center">
              <h2 className="text-white text-2xl font-bold mb-4">Check your email</h2>
              <p className="text-white/70 mb-6">
                If that email is registered, a reset link is on its way.
              </p>
              <Link
                href="/login"
                className="text-brand-amber hover:text-amber-400 font-semibold"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white text-2xl font-bold mb-2">Forgot password</h2>
              <p className="text-white/60 text-sm mb-6">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit}>
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <p className="text-center mt-4">
                <Link href="/login" className="text-white/60 hover:text-white text-sm">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
