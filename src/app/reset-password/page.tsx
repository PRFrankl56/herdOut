"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-brand-green flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/10 rounded-xl p-8 text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Invalid link</h2>
          <p className="text-white/70 mb-6">This reset link is missing or invalid.</p>
          <Link href="/forgot-password" className="text-brand-amber hover:text-amber-400 font-semibold">
            Request a new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-green flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-white mb-2 text-center">HerdOut</h1>
        <p className="text-brand-amber text-center font-semibold mb-8">Livestock Evacuation Coordination</p>

        <div className="bg-white/10 rounded-xl p-8">
          {success ? (
            <div className="text-center">
              <h2 className="text-white text-2xl font-bold mb-4">Password updated!</h2>
              <p className="text-white/70 mb-6">Your password has been reset. You can now sign in.</p>
              <Link
                href="/login"
                className="inline-block bg-brand-amber text-brand-green font-bold text-lg py-3 px-8 rounded-lg hover:bg-amber-400 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white text-2xl font-bold mb-6">Set new password</h2>

              {error && (
                <div className="bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3 mb-4 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label className="block text-white/80 text-sm font-medium mb-2">New password</label>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-brand-amber text-lg pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <label className="block text-white/80 text-sm font-medium mb-2">Confirm new password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-brand-amber mb-6 text-lg"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-amber text-brand-green font-bold text-lg py-4 rounded-lg hover:bg-amber-400 active:bg-amber-500 transition-colors disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
