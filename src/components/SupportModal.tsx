"use client";

import { useRef } from "react";

export default function SupportModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex items-center gap-1.5 text-white/50 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        Support
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
        className="fixed inset-0 m-auto rounded-2xl p-0 border-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm max-w-sm w-full bg-[#1a1740]"
      >
        <div className="p-6">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute top-4 right-4 text-white/30 hover:text-white text-2xl leading-none"
          >
            ×
          </button>

          <div className="text-3xl mb-3">🐴</div>

          <h2 className="text-white text-xl font-extrabold mb-2 leading-snug">
            Keep HerdOut free when it matters most
          </h2>

          <p className="text-white/60 text-sm leading-relaxed mb-4">
            When a wildfire hits, animal owners shouldn&apos;t have to think about cost. HerdOut is free to use — and stays that way because of people who believe no animal should be left behind.
          </p>

          <p className="text-white/40 text-xs mb-5">
            Every contribution goes directly to keeping the platform running and available 24/7 during emergencies.
          </p>

          <a
            href="https://venmo.com/u/PaigeFrankl"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => dialogRef.current?.close()}
            className="block w-full bg-brand-amber text-brand-green font-bold text-center py-4 rounded-xl hover:bg-amber-400 transition-colors text-base"
          >
            Support on Venmo →
          </a>

          <p className="text-white/20 text-xs text-center mt-3">No account needed · Any amount helps</p>
        </div>
      </dialog>
    </>
  );
}
