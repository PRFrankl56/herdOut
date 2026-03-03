import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminTabs from "./AdminTabs";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requests = await prisma.request.findMany({
    include: { animals: true, matches: { include: { transporter: true } } },
    orderBy: { createdAt: "desc" },
  });

  const transporters = await prisma.transporter.findMany({
    orderBy: { createdAt: "desc" },
  });

  const matches = await prisma.match.findMany({
    include: {
      request: { include: { animals: true } },
      transporter: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-green">
            Admin Dashboard
          </h1>
          <Link
            href="/"
            className="text-sm text-brand-green underline hover:text-brand-green/80"
          >
            Home
          </Link>
        </div>

        <AdminTabs
          requests={requests}
          transporters={transporters}
          matches={matches}
        />
      </div>
    </main>
  );
}
