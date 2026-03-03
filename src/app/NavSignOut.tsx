"use client";
import { signOut } from "next-auth/react";

export default function NavSignOut() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="text-white/50 hover:text-white text-sm">
      Sign out
    </button>
  );
}
