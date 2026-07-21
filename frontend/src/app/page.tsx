"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

interface Stats {
  total: number;
  verified: number;
  aktif: number;
  kota: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const toast = useToast();

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get("/relawan/stats");
      setStats({
        total: res.total ?? 0,
        verified: res.verified ?? 0,
        aktif: res.aktif ?? 0,
        kota: res.kota ?? 0,
      });
    } catch {
      toast("Gagal memuat statistik.", "error");
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-brand rounded-full px-4 py-1.5 text-sm font-semibold mb-8">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          Database Relawan Darurat Indonesia
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Temukan siapa yang bisa{" "}
          <em className="not-italic text-brand">membantu</em>{" "}
          saat krisis
        </h1>

        <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Platform crowdsourcing keahlian darurat warga Indonesia. Daftarkan
          keahlianmu — saat bencana terjadi, orang yang tepat bisa ditemukan
          dalam detik.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition text-base"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
            </svg>
            Daftarkan Diri
          </Link>
          <Link
            href="/cari"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold hover:border-neutral-500 hover:bg-neutral-50 transition text-base"
          >
            Cari Relawan →
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 divide-x divide-neutral-200 border border-neutral-200 rounded-2xl bg-white max-w-xl mx-auto overflow-hidden">
          <StatCell
            value={stats?.total ?? "—"}
            label="Relawan Terdaftar"
          />
          <StatCell
            value={stats?.kota ?? "—"}
            label="Kota / Kabupaten"
          />
          <StatCell
            value={stats?.verified ?? "—"}
            label="Terverifikasi"
          />
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section className="bg-white border-y border-neutral-200 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-center mb-10">
            Bagaimana cara kerjanya?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Daftarkan keahlianmu",
                desc: "Isi form singkat — nama, kota, keahlian, kontak. Selesai dalam 2 menit.",
              },
              {
                num: "2",
                title: "Data tersimpan otomatis",
                desc: "Tidak perlu admin manual — data kamu langsung tersimpan dan siap dicari.",
              },
              {
                num: "3",
                title: "Ditemukan saat dibutuhkan",
                desc: "Koordinator filter kota + keahlian, atau pakai GPS untuk cari relawan terdekat.",
              },
            ].map((s) => (
              <div key={s.num} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {s.num}
                </div>
                <div>
                  <div className="font-semibold mb-1">{s.title}</div>
                  <div className="text-sm text-neutral-500 leading-relaxed">
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-neutral-900 py-16 text-center text-white">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-2xl font-extrabold mb-3">Siap berkontribusi?</h2>
          <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
            Daftarkan keahlianmu — gratis, sukarela, bisa menyelamatkan nyawa.
          </p>
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition"
          >
            Daftarkan Diri Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="py-6 px-4 text-center">
      <div className="text-3xl font-extrabold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
