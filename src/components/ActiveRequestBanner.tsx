"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ActiveRequestNavItem() {
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("herdout_active_request");
    if (id) setRequestId(id);
  }, []);

  if (!requestId) return null;

  return (
    <Link
      href={`/request/${requestId}`}
      className="flex items-center gap-1.5 bg-brand-amber/20 hover:bg-brand-amber/30 border border-brand-amber/40 text-brand-amber font-bold text-sm px-3 py-1.5 rounded-lg transition-colors animate-pulse"
    >
      <span className="text-base leading-none">🚨</span>
      <span className="hidden sm:inline">My Request</span>
    </Link>
  );
}
