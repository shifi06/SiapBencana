"use client";

import Link from "next/link";

export default function TentangPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-brand rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          Platform Crowdsourcing Darurat Indonesia
        </div>
        <h1 className="text-4xl font-extrabold mb-4 leading-tight">
          Saat bencana terjadi,{" "}
          <em className="not-italic text-brand">detik-detik pertama</em>{" "}
          sangat menentukan
        </h1>
        <p className="text-neutral-500 leading-relaxed">
          SiapBencana adalah direktori keahlian darurat warga Indonesia — agar
          orang yang tepat bisa ditemukan dalam hitungan detik, bukan jam.
        </p>
      </div>

      {/* Values */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: "⚡", title: "Cepat & Real-Time", desc: "Data tersedia langsung begitu seseorang mendaftar. Tidak ada delay, tidak ada admin manual." },
          { icon: "🌐", title: "Bisa Diakses Siapapun", desc: "Tidak perlu install aplikasi. Cukup buka browser dari HP manapun." },
          { icon: "📍", title: "Temukan Relawan Terdekat", desc: "Peta real-time tunjukkan relawan terdekat dari lokasi kamu." },
        ].map((v) => (
          <div key={v.title} className="bg-white border border-neutral-200 rounded-2xl p-5">
            <div className="text-2xl mb-3">{v.icon}</div>
            <div className="font-bold text-sm mb-2">{v.title}</div>
            <div className="text-xs text-neutral-500 leading-relaxed">{v.desc}</div>
          </div>
        ))}
      </div>

      {/* Problem vs Solution */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-12">
        <h3 className="font-bold text-red-800 mb-4">Masalah yang SiapBencana selesaikan</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span>❌</span>
            <p className="text-sm text-red-700 leading-relaxed">
              <strong>Tanpa SiapBencana:</strong> Koordinator telepon satu-satu, WA grup, nunggu reply — berjam-jam hanya untuk tahu siapa dokter terdekat.
            </p>
          </div>
          <div className="flex gap-3">
            <span>✅</span>
            <p className="text-sm text-red-700 leading-relaxed">
              <strong>Dengan SiapBencana:</strong> Filter kota + keahlian → dalam 10 detik muncul daftar lengkap dengan nomor kontak darurat.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <h2 className="text-xl font-bold mb-5">Bagaimana cara kerjanya?</h2>
      <div className="space-y-4 mb-12">
        {[
          { n: "1", title: "Warga daftarkan diri & keahlian", desc: "Isi form singkat: nama, kota, kategori keahlian, dan nomor darurat. Selesai dalam 2 menit." },
          { n: "2", title: "Tidak perlu admin manual", desc: "data kamu langsung tersimpan dan siap dicari." },
          { n: "3", title: "Koordinator cari relawan saat dibutuhkan", desc: "Filter by kota dan keahlian, atau gunakan GPS untuk cari yang terdekat dari lokasi bencana." },
        ].map((s) => (
          <div key={s.n} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {s.n}
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">{s.title}</div>
              <div className="text-sm text-neutral-500 leading-relaxed">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center bg-neutral-100 rounded-2xl p-8">
        <div className="font-bold text-lg mb-2">Siap berkontribusi?</div>
        <p className="text-neutral-500 text-sm mb-5">Daftarkan keahlianmu — gratis, sukarela, bisa menyelamatkan nyawa.</p>
        <Link href="/daftar" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition">
          Daftarkan Diri Sekarang
        </Link>
      </div>
    </div>
  );
}
