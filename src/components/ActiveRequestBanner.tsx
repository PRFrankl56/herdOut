"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ActiveRequestBanner() {
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("herdout_active_request");
    if (id) setRequestId(id);
  }, []);

  if (!requestId) return null;

  return (
    <div className="bg-brand-amber/10 border-b border-brand-amber/30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-brand-amber text-lg">🚨</span>
        <span className="text-white font-semibold text-sm">You have an active evacuation request</span>
      </div>
      <Link href={`/request/${requestId}`}
        className="bg-brand-amber text-brand-green font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors">
        View Status →
      </Link>
    </div>
  );
}
