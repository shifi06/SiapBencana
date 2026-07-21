"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { session, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/cari", label: "Find Volunteers" },
    { href: "/tentang", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl flex items-center gap-2 text-neutral-900">
          <span className="text-brand">⚡</span> SiapBencana
        </Link>

        {/* Nav Links + Auth — dikelompokkan berdekatan di kanan (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "text-brand bg-red-50"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm">
            {!loading && !session && (
              <>
                <Link
                  href="/daftar"
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium transition"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark font-medium transition"
                >
                  Sign In
                </Link>
              </>
            )}

            {!loading && session && (
              <>
                <Link
                  href={dashboardPathForRole(session.role)}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 font-medium transition"
                >
                  {session.role === "ADMIN"
                    ? "⚙️ Admin"
                    : session.role === "KOORDINATOR"
                    ? "🗺️ Koordinator"
                    : `👤 ${"nama" in session.user ? session.user.nama : "Dashboard"}`}
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-neutral-500 hover:text-brand font-medium transition"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hamburger button — hanya tampil di layar sempit */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition"
          aria-label="Buka menu"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-brand bg-red-50"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="pt-2 mt-2 border-t border-neutral-100 space-y-2">
            {!loading && !session && (
              <>
                <Link
                  href="/daftar"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg bg-brand text-white font-medium"
                >
                  Sign In
                </Link>
              </>
            )}

            {!loading && session && (
              <>
                <Link
                  href={dashboardPathForRole(session.role)}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg bg-neutral-900 text-white font-medium"
                >
                  {session.role === "ADMIN"
                    ? "⚙️ Admin"
                    : session.role === "KOORDINATOR"
                    ? "🗺️ Koordinator"
                    : `👤 ${"nama" in session.user ? session.user.nama : "Dashboard"}`}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-neutral-500 font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
