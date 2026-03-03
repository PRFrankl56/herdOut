import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavSignOut from "./NavSignOut";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HerdOut — Livestock Evacuation Coordination",
  description:
    "Emergency livestock evacuation coordination for wildfire emergencies. Request help moving your animals to safety.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <nav className="bg-black/20 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-white font-extrabold text-xl tracking-tight">
            🖤 HerdOut
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/map" className="text-white/70 hover:text-white text-sm">🗺 Map</Link>
            {session?.user ? (
              <>
                <Link href="/profile/animals" className="text-white/80 hover:text-white text-sm">My Animals</Link>
                <Link href="/profile" className="text-white/80 hover:text-white text-sm">{session.user.email}</Link>
                <NavSignOut />
              </>
            ) : (
              <Link href="/login" className="bg-brand-amber text-brand-green font-bold text-sm px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
