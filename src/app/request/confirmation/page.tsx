import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-brand-green flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">&#10003;</div>
        <h1 className="text-3xl font-extrabold text-white mb-4">
          Request Submitted
        </h1>
        <p className="text-white/80 text-base mb-8">
          Your evacuation help request has been received. Volunteers with
          trailers will be able to see your request and coordinate to help. Stay
          safe and keep your phone nearby.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-amber text-brand-green font-bold text-lg px-8 py-4 rounded-lg hover:bg-amber-400 active:bg-amber-500 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
