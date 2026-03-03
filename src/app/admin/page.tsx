import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requests = await prisma.request.findMany({
    include: { animals: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-green">
            Evacuation Requests
          </h1>
          <Link
            href="/"
            className="text-sm text-brand-green underline hover:text-brand-green/80"
          >
            Home
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No evacuation requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      {req.name}
                    </h2>
                    <p className="text-sm text-gray-600">{req.phone}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Location:</span>{" "}
                    {req.address}
                  </p>
                  {req.lat && req.lng && (
                    <p className="text-xs text-gray-500">
                      GPS: {req.lat}, {req.lng}
                    </p>
                  )}
                </div>

                {req.situation && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Situation:</span>{" "}
                      {req.situation}
                    </p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Animals:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {req.animals.map((animal) => (
                      <span
                        key={animal.id}
                        className="inline-block bg-brand-green/10 text-brand-green text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {animal.count}x{" "}
                        {animal.species.charAt(0).toUpperCase() +
                          animal.species.slice(1)}
                        {animal.specialNeeds && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({animal.specialNeeds})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Trailer needed:</span>{" "}
                  {req.trailerType}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
