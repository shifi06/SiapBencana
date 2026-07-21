"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireRole } from "@/lib/useRequireRole";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";
import { SKILL_EMOJI, KEAHLIAN_OPTIONS } from "@/lib/constants";
import type { Relawan, Koordinator } from "@/types";

export default function DashboardKoordinatorPage() {
  const { session, loading } = useRequireRole(["KOORDINATOR"]);
  const toast = useToast();
  const [data, setData] = useState<Relawan[]>([]);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [dispatch, setDispatch] = useState({ lokasi: "", jenis: "", deskripsi: "" });

  useEffect(() => {
    api
      .get("/relawan")
      .then((res) => setData(res.data || []))
      .catch(() => toast("Gagal memuat direktori relawan.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (d) =>
          (!q ||
            d.nama.toLowerCase().includes(q.toLowerCase()) ||
            d.kota.toLowerCase().includes(q.toLowerCase())) &&
          (!skill || d.keahlian === skill)
      ),
    [data, q, skill]
  );

  const target = useMemo(
    () => (dispatch.jenis ? data.filter((d) => d.keahlian === dispatch.jenis && d.status === "Siap") : []),
    [data, dispatch.jenis]
  );

  if (loading || !session) return <div className="text-center py-20 text-neutral-500">Memuat...</div>;
  const koord = session.user as Koordinator;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">🗺️ Dashboard Koordinator</h1>
      <p className="text-neutral-500 mb-8">
        {koord.nama} — {koord.wilayah}
      </p>

      {/* Dispatch */}
      <section className="border border-neutral-200 rounded-xl p-6 bg-white mb-10">
        <h2 className="font-semibold mb-4">📢 Kirim Permintaan Bantuan</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <input
            className="input"
            placeholder="Lokasi kejadian"
            value={dispatch.lokasi}
            onChange={(e) => setDispatch((d) => ({ ...d, lokasi: e.target.value }))}
          />
          <select
            className="input"
            value={dispatch.jenis}
            onChange={(e) => setDispatch((d) => ({ ...d, jenis: e.target.value }))}
          >
            <option value="">Jenis bantuan...</option>
            {KEAHLIAN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Deskripsi singkat"
            value={dispatch.deskripsi}
            onChange={(e) => setDispatch((d) => ({ ...d, deskripsi: e.target.value }))}
          />
        </div>

        {dispatch.jenis && (
          <div className="mt-4">
            {target.length === 0 ? (
              <p className="text-sm text-amber-700">Tidak ada relawan aktif untuk keahlian ini.</p>
            ) : (
              <>
                <p className="text-sm text-green-700 font-medium mb-2">
                  ✅ Ditemukan {target.length} relawan {dispatch.jenis} aktif
                </p>
                <div className="space-y-2">
                  {target.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between bg-neutral-50 rounded-lg p-3">
                      <span className="text-sm">
                        {r.nama} — 📍 {r.kota}
                      </span>
                      <a
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://wa.me/62${r.kontak.replace(/^0/, "")}?text=${encodeURIComponent(
                          `Halo ${r.nama}, saya ${koord.nama} dari SiapBencana. Kami membutuhkan bantuan ${dispatch.jenis} SEGERA di ${dispatch.lokasi}. ${dispatch.deskripsi}. Apakah kamu bisa membantu sekarang?`
                        )}`}
                      >
                        WA Sekarang
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Directory */}
      <section>
        <h2 className="font-semibold mb-4">Direktori Relawan ({filtered.length})</h2>
        <div className="flex gap-3 mb-4">
          <input
            className="input flex-1"
            placeholder="Cari nama / kota..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="border border-neutral-200 rounded-xl p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{d.nama}</span>
                <span className={`badge ${d.verified ? "badge-verified" : "badge-unverified"}`}>
                  {d.verified ? "✓" : "⏳"}
                </span>
              </div>
              <div className="text-sm text-neutral-500 mb-2">
                {SKILL_EMOJI[d.keahlian]} {d.keahlian} · {d.kota}, {d.provinsi}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">📞 {d.kontak}</span>
                <div className="flex gap-2">
                  <a href={`tel:${d.kontak}`} className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white">
                    Telepon
                  </a>
                  <a
                    href={`https://wa.me/62${d.kontak.replace(/^0/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300"
                  >
                    WA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx global>{`
        .input {
          border: 1px solid #d4d4d4;
          border-radius: 0.5rem;
          padding: 0.55rem 0.8rem;
        }
      `}</style>
    </div>
  );
}
