"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { SKILL_EMOJI, KEAHLIAN_OPTIONS } from "@/lib/constants";
import type { Relawan } from "@/types";

// Koordinat kota untuk peta
const KOTA_COORDS: Record<string, { lat: number; lng: number }> = {
  "Bogor": { lat: -6.5971, lng: 106.806 },
  "Jakarta Selatan": { lat: -6.2615, lng: 106.8106 },
  "Jakarta Pusat": { lat: -6.1862, lng: 106.834 },
  "Jakarta Barat": { lat: -6.1674, lng: 106.7637 },
  "Jakarta Timur": { lat: -6.225, lng: 106.9004 },
  "Jakarta Utara": { lat: -6.1481, lng: 106.8998 },
  "Depok": { lat: -6.4025, lng: 106.7942 },
  "Bekasi": { lat: -6.2349, lng: 106.9896 },
  "Tangerang": { lat: -6.1781, lng: 106.6297 },
  "Tangerang Selatan": { lat: -6.2887, lng: 106.7107 },
  "Bandung": { lat: -6.9175, lng: 107.6191 },
  "Cianjur": { lat: -6.8215, lng: 107.1425 },
  "Garut": { lat: -7.21, lng: 107.906 },
  "Sukabumi": { lat: -6.9277, lng: 106.9301 },
  "Tasikmalaya": { lat: -7.3274, lng: 108.2207 },
  "Cirebon": { lat: -6.732, lng: 108.5523 },
  "Surabaya": { lat: -7.2575, lng: 112.7521 },
  "Malang": { lat: -7.9797, lng: 112.6304 },
  "Yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "Semarang": { lat: -6.9932, lng: 110.4203 },
  "Medan": { lat: 3.5952, lng: 98.6722 },
  "Makassar": { lat: -5.1477, lng: 119.4327 },
  "Denpasar": { lat: -8.6705, lng: 115.2126 },
  "Palu": { lat: -0.8917, lng: 119.8707 },
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CariPage() {
  const [data, setData] = useState<Relawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kota, setKota] = useState("");
  const [skill, setSkill] = useState("");
  const [kotaList, setKotaList] = useState<string[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const mapRef = useRef<any>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (kota) params.set("kota", kota);
      if (skill) params.set("keahlian", skill);
      params.set("limit", "100");
      const res = await api.get(`/relawan?${params}`);
      let list: Relawan[] = res.data || [];

      // Sort by distance if user location known
      if (userLat !== null && userLng !== null) {
        list = list
          .map((d) => {
            const c = KOTA_COORDS[d.kota];
            const dist = c ? haversine(userLat!, userLng!, c.lat, c.lng) : 9999;
            return { ...d, _dist: dist };
          })
          .sort((a: any, b: any) => a._dist - b._dist) as Relawan[];
      }
      setData(list);

      // Populate kota dropdown
      const kotaSet = [...new Set(list.map((d) => d.kota))].sort();
      setKotaList(kotaSet);
    } catch {
      toast("Gagal memuat data relawan.", "error");
    } finally {
      setLoading(false);
    }
  }, [q, kota, skill, userLat, userLng, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Init Leaflet map
  useEffect(() => {
    if (!showMap || !mapElRef.current) return;
    if (typeof window === "undefined") return;

    // Load Leaflet dynamically
    Promise.all([
      import("leaflet"),
      // @ts-ignore
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const center: [number, number] =
        userLat !== null ? [userLat, userLng!] : [-6.5, 107.0];
      const map = (L as any).map(mapElRef.current!, { zoom: 8, center });
      (L as any)
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
        })
        .addTo(map);

      // User marker
      if (userLat !== null) {
        (L as any)
          .circleMarker([userLat, userLng!], {
            color: "#CC3300",
            fillColor: "#CC3300",
            fillOpacity: 0.9,
            radius: 10,
          })
          .addTo(map)
          .bindPopup("<strong>📍 Lokasi kamu</strong>")
          .openPopup();
      }

      // Relawan markers
      data.forEach((d) => {
        const c = KOTA_COORDS[d.kota];
        if (!c) return;
        const color = d.status === "Siap" ? "#1A7A4A" : "#C47B00";
        const dist =
          userLat !== null
            ? `<br>📍 ${haversine(userLat!, userLng!, c.lat, c.lng).toFixed(1)} km`
            : "";
        (L as any)
          .circleMarker([c.lat, c.lng], {
            color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 8,
          })
          .addTo(map)
          .bindPopup(
            `<strong>${d.nama}</strong><br>${SKILL_EMOJI[d.keahlian] || ""} ${d.keahlian}<br>📞 ${d.kontak}${dist}`
          );
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap, data]);

  function cariTerdekat() {
    if (!navigator.geolocation) {
      toast("Browser tidak mendukung GPS.", "error");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setShowMap(true);
        setLocLoading(false);
        toast("✅ Lokasi terdeteksi! Relawan diurutkan berdasarkan jarak.", "success");
      },
      () => {
        toast("Gagal deteksi lokasi. Izinkan akses GPS di browser.", "error");
        setLocLoading(false);
      }
    );
  }

  function resetLokasi() {
    setUserLat(null);
    setUserLng(null);
    setShowMap(false);
  }

  async function handleFlag(kode: string) {
    try {
      await api.post(`/relawan/${kode}/flag`);
      toast("Laporan terkirim. Terima kasih.", "success");
    } catch (e: any) {
      toast(e.message || "Gagal mengirim laporan.", "error");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 border border-neutral-300 rounded-xl px-4 py-2.5 focus-within:border-brand">
            <svg className="text-neutral-400 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 8.5 15a6.5 6.5 0 0 0 4.19-1.53l.27.28v.79l5 5-1.5 1.5-5-5zm-6 0C7 14 5 12 5 9.5S7 5 9.5 5 14 7 14 9.5 12 14 9.5 14z" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau keahlian..."
              className="flex-1 outline-none text-sm"
            />
          </div>
          <select
            value={kota}
            onChange={(e) => setKota(e.target.value)}
            className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand min-w-[150px]"
          >
            <option value="">Semua Kota</option>
            {kotaList.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="border border-neutral-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand min-w-[150px]"
          >
            <option value="">Semua Keahlian</option>
            {KEAHLIAN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{SKILL_EMOJI[o.value]} {o.value}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={cariTerdekat}
            disabled={locLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold hover:bg-blue-100 transition disabled:opacity-50"
          >
            {locLoading ? "⏳ Mendeteksi..." : "📍 Cari relawan terdekat dari lokasi saya"}
          </button>
          {userLat !== null && (
            <button
              onClick={resetLokasi}
              className="text-sm text-neutral-500 hover:text-brand transition"
            >
              ✕ Reset lokasi
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div
          ref={mapElRef}
          className="h-72 rounded-2xl overflow-hidden border border-neutral-200 mb-5"
        />
      )}

      {/* Result count */}
      <p className="text-sm text-neutral-500 mb-4">
        {loading ? "Memuat..." : `${data.length} relawan ditemukan`}
        {userLat !== null && " · diurutkan berdasarkan jarak"}
      </p>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-20 text-neutral-400">
          <div className="animate-spin text-3xl mb-3">⏳</div>
          Memuat data relawan...
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <div className="text-3xl mb-3">🔍</div>
          <p className="font-medium">Tidak ada relawan ditemukan</p>
          <p className="text-sm mt-1">Coba ubah filter pencarian</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((d: any) => (
            <div
              key={d.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-red-200 hover:shadow-md transition-all relative"
            >
              <button
                onClick={() => handleFlag(d.kode)}
                title="Laporkan data tidak valid"
                className="absolute top-3 right-3 text-neutral-300 hover:text-amber-500 transition text-sm"
              >
                🚩
              </button>

              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                    skillAvatarColor[d.keahlian] || "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {d.nama.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                </div>
                <span className={`badge ${d.verified ? "badge-verified" : "badge-unverified"}`}>
                  {d.verified ? "✓ Verified" : "⏳ Pending"}
                </span>
              </div>

              <div className="font-bold text-neutral-900 mb-1">
                {d.nama}
                {d._dist && d._dist < 9999 && (
                  <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    📍 {d._dist < 1 ? "< 1" : d._dist.toFixed(0)} km
                  </span>
                )}
              </div>

              <span className={`badge mb-3 inline-block ${skillBadgeColor[d.keahlian] || ""}`}>
                {SKILL_EMOJI[d.keahlian]} {d.keahlian}
              </span>

              <div className="space-y-1 text-sm text-neutral-500">
                {d.detail && <p>ℹ️ {d.detail}</p>}
                <p>📍 {d.kota}, {d.provinsi}</p>
                <p style={{ color: d.status === "Siap" ? "#1A7A4A" : d.status === "Terbatas" ? "#C47B00" : "#6b6b6b" }}>
                  ⏱ {d.status === "TidakAktif" ? "Tidak Aktif" : d.status}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-sm font-medium">📞 {d.kontak}</span>
                <div className="flex gap-2">
                  <a
                    href={`tel:${d.kontak}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark transition"
                  >
                    Hubungi
                  </a>
                  <a
                    href={`https://wa.me/62${d.kontak.replace(/^0/, "")}?text=${encodeURIComponent(`Halo ${d.nama}, saya menghubungi dari SiapBencana. Apakah Anda bisa dihubungi untuk situasi darurat?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition"
                  >
                    WA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const skillAvatarColor: Record<string, string> = {
  Medis: "bg-red-100 text-red-700",
  Logistik: "bg-yellow-100 text-yellow-800",
  Teknik: "bg-blue-100 text-blue-700",
  Komunikasi: "bg-green-100 text-green-700",
  Psikologi: "bg-purple-100 text-purple-700",
  Lainnya: "bg-neutral-100 text-neutral-700",
};

const skillBadgeColor: Record<string, string> = {
  Medis: "bg-red-100 text-red-700",
  Logistik: "bg-yellow-100 text-yellow-800",
  Teknik: "bg-blue-100 text-blue-700",
  Komunikasi: "bg-green-100 text-green-700",
  Psikologi: "bg-purple-100 text-purple-700",
  Lainnya: "bg-neutral-100 text-neutral-700",
};
