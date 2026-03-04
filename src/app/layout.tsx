import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavSignOut from "./NavSignOut";
import ActiveRequestBanner from "@/components/ActiveRequestBanner";

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
  const userInitial = session?.user?.email?.[0]?.toUpperCase() ?? null;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <nav className="bg-[#151330] border-b border-white/10 px-4 h-14 flex items-center justify-between sticky top-0 z-50">
          {/* Logo */}
          <Link href="/" className="text-white font-extrabold text-lg tracking-tight flex items-center gap-2">
            <span className="text-brand-amber">H</span>erdOut
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <Link
              href="/map"
              className="flex items-center gap-1.5 text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              Map
            </Link>

            {session?.user ? (
              <>
                <Link
                  href="/profile/animals"
                  className="text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-2 rounded-lg transition-colors hidden sm:block"
                >
                  My Animals
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-amber text-brand-green font-bold text-sm ml-1 hover:bg-amber-400 transition-colors"
                  title={session.user.email ?? "Profile"}
                >
                  {userInitial}
                </Link>
                <NavSignOut />
              </>
            ) : (
              <Link
                href="/login"
                className="bg-brand-amber text-brand-green font-bold text-sm px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors ml-1"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
        <ActiveRequestBanner />
        {children}
      </body>
    </html>
  );
}
