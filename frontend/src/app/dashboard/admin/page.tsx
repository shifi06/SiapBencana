"use client";

import { useEffect, useState } from "react";
import { useRequireRole } from "@/lib/useRequireRole";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";
import { SKILL_EMOJI, STATUS_LABEL } from "@/lib/constants";
import type { Relawan } from "@/types";

type Tab = "semua" | "pending" | "flag" | "koordinator";

export default function DashboardAdminPage() {
  const { session, loading } = useRequireRole(["ADMIN"]);
  const toast = useToast();
  const [data, setData] = useState<Relawan[]>([]);
  const [tab, setTab] = useState<Tab>("semua");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Relawan | null>(null);
  const [koordForm, setKoordForm] = useState({ nama: "", password: "", instansi: "", wilayah: "", kontak: "" });
  const [koordList, setKoordList] = useState<any[]>([]);
  const [deleteKoord, setDeleteKoord] = useState<any | null>(null);

  async function loadData() {
    try {
      const res = await api.get("/relawan?limit=200");
      setData(res.data || []);
    } catch {
      toast("Gagal memuat data dari server.", "error");
    }
  }

  async function loadKoordinator() {
    try {
      const res = await api.get("/koordinator");
      setKoordList(res.data || []);
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    if (!loading && session) {
      loadData();
      loadKoordinator();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session]);

  if (loading || !session) return <div className="text-center py-20 text-neutral-500">Memuat...</div>;

  const total = data.length;
  const verified = data.filter((d) => d.verified).length;
  const pending = data.filter((d) => !d.verified);
  const flagged = data.filter((d) => d.flags >= 1).sort((a, b) => b.flags - a.flags);
  const aktif = data.filter((d) => d.status === "Siap").length;
  const kota = new Set(data.map((d) => d.kota)).size;

  const filteredAll = data.filter((d) => {
    const f = search.toLowerCase();
    return !f || d.nama.toLowerCase().includes(f) || d.kota.toLowerCase().includes(f) || d.keahlian.toLowerCase().includes(f);
  });

  async function approve(d: Relawan) {
    try {
      await api.patch(`/relawan/${d.kode}/approve`);
      toast(`✅ ${d.nama} berhasil diverifikasi!`, "success");
      loadData();
    } catch (err: any) {
      toast(err.message || "Gagal approve.", "error");
    }
  }

  async function doHapus() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/relawan/${deleteTarget.kode}`);
      toast(`🗑 Data ${deleteTarget.nama} berhasil dihapus`, "success");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast(err.message || "Gagal hapus!", "error");
    }
  }

  async function doResetFlag(d: Relawan) {
    try {
      await api.post(`/relawan/${d.kode}/reset-flag`);
      toast("Flag direset ke 0.", "success");
      loadData();
    } catch (err: any) {
      toast(err.message || "Gagal reset flag.", "error");
    }
  }

  function exportCSV() {
    const headers = ["Kode", "Nama", "Kota", "Provinsi", "Keahlian", "Detail", "Kontak", "Status", "Verified", "Flags"];
    const rows = data.map((d) =>
      [d.kode, d.nama, d.kota, d.provinsi, d.keahlian, d.detail || "", d.kontak, d.status, String(d.verified), String(d.flags)]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SiapBencana_Data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast("📥 Data berhasil diexport!", "success");
  }

  async function addKoordinator(e: React.FormEvent) {
    e.preventDefault();
    if (koordForm.password.length < 6) {
      toast("Password koordinator minimal 6 karakter.", "error");
      return;
    }
    try {
      const res = await api.post("/koordinator", koordForm);
      toast(`✅ Koordinator ditambahkan. Kode: ${res.kode}`, "success");
      setKoordForm({ nama: "", password: "", instansi: "", wilayah: "", kontak: "" });
      loadKoordinator();
    } catch (err: any) {
      toast(err.message || "Gagal menambah koordinator.", "error");
    }
  }

  async function doDeleteKoordinator() {
  if (!deleteKoord) return;

  try {
    await api.delete(`/koordinator/${deleteKoord.kode}`);

    toast("🗑 Koordinator berhasil dihapus", "success");

    setDeleteKoord(null);

    loadKoordinator();
  } catch (err: any) {
    toast(err.message || "Gagal menghapus koordinator", "error");
  }
}

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">⚙️ Dashboard Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        <Stat label="Total" value={total} />
        <Stat label="Verified" value={verified} />
        <Stat label="Pending" value={pending.length} />
        <Stat label="Flagged" value={flagged.length} />
        <Stat label="Siap" value={aktif} />
        <Stat label="Kota" value={kota} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-neutral-200">
        {(["semua", "pending", "flag", "koordinator"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === t ? "border-brand text-brand" : "border-transparent text-neutral-500"
            }`}
          >
            {t === "semua" ? `Semua (${total})` : t === "pending" ? `Pending (${pending.length})` : t === "flag" ? `Flag (${flagged.length})` : "Koordinator"}
          </button>
        ))}
      </div>

      {tab === "semua" && (
        <>
          <div className="flex justify-between mb-4 gap-3">
            <input
              className="input flex-1"
              placeholder="Cari nama, kota, keahlian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={exportCSV} className="px-4 py-2 rounded-lg border border-neutral-300 text-sm whitespace-nowrap">
              📥 Export CSV
            </button>
          </div>
          <Table
            data={filteredAll}
            renderActions={(d) => (
              <div className="flex gap-2">
                {!d.verified && (
                  <button onClick={() => approve(d)} className="btn-success">
                    ✓ Approve
                  </button>
                )}
                <button onClick={() => setDeleteTarget(d)} className="btn-danger">
                  🗑 Hapus
                </button>
              </div>
            )}
          />
        </>
      )}

      {tab === "pending" && (
        <Table
          data={pending}
          renderActions={(d) => (
            <div className="flex gap-2">
              <button onClick={() => approve(d)} className="btn-success">
                ✓ Approve
              </button>
              <button onClick={() => setDeleteTarget(d)} className="btn-danger">
                ✗ Tolak
              </button>
            </div>
          )}
        />
      )}

      {tab === "flag" && (
        <Table
          data={flagged}
          renderActions={(d) => (
            <div className="flex gap-2">
              <button onClick={() => doResetFlag(d)} className="btn-warning">
                Reset Flag
              </button>
              <button onClick={() => setDeleteTarget(d)} className="btn-danger">
                🗑 Hapus
              </button>
            </div>
          )}
        />
      )}

      {tab === "koordinator" && (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={addKoordinator} className="space-y-3 border border-neutral-200 rounded-xl p-6 bg-white">
            <h2 className="font-semibold mb-2">Tambah Koordinator</h2>
            <input className="input" placeholder="Nama" value={koordForm.nama} onChange={(e) => setKoordForm((f) => ({ ...f, nama: e.target.value }))} />
            <input className="input" type="password" placeholder="Password (min. 6 karakter)" value={koordForm.password} onChange={(e) => setKoordForm((f) => ({ ...f, password: e.target.value }))} />
            <input className="input" placeholder="Instansi" value={koordForm.instansi} onChange={(e) => setKoordForm((f) => ({ ...f, instansi: e.target.value }))} />
            <input className="input" placeholder="Wilayah" value={koordForm.wilayah} onChange={(e) => setKoordForm((f) => ({ ...f, wilayah: e.target.value }))} />
            <input className="input" placeholder="Kontak" value={koordForm.kontak} onChange={(e) => setKoordForm((f) => ({ ...f, kontak: e.target.value }))} />
            <button type="submit" className="btn-primary w-full">
              Tambah
            </button>
          </form>

          <div>
            <h2 className="font-semibold mb-2">Daftar Koordinator ({koordList.length})</h2>
            <div className="space-y-2">
              {koordList.map((k) => (
                <div
                key={k.id} className="border border-neutral-200 rounded-lg p-3 bg-white text-sm flex justify-between items-center">
                  <div>
                    <div className="font-medium"> {k.nama} · {k.kode}
                    </div>
                    <div className="text-neutral-500">{k.instansi} — {k.wilayah}
                    </div>
                    </div>
                    <button onClick={() => setDeleteKoord(k)} className="btn-danger">🗑 Hapus
                    </button>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Hapus Data?</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Yakin ingin menghapus data <b>{deleteTarget.nama}</b>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-neutral-300">
                Batal
              </button>
              <button onClick={doHapus} className="btn-danger px-4 py-2">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}  

      {deleteKoord && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Hapus Koordinator?</h3>
            <p className="text-sm text-neutral-600 mb-6">
        Yakin ingin menghapus <b>{deleteKoord.nama}</b>?
        </p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setDeleteKoord(null)}
          className="px-4 py-2 rounded-lg border border-neutral-300">
          Batal
        </button>
        <button
          onClick={doDeleteKoordinator}
          className="btn-danger px-4 py-2">
          Hapus
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-neutral-200 rounded-xl p-3 text-center bg-white">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}

function Table({ data, renderActions }: { data: Relawan[]; renderActions: (d: Relawan) => React.ReactNode }) {
  if (!data.length) {
    return <div className="text-center py-16 text-neutral-500 border border-neutral-200 rounded-xl bg-white">Tidak ada data</div>;
  }
  return (
    <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left">
          <tr>
            <th className="p-3">Kode</th>
            <th className="p-3">Nama</th>
            <th className="p-3">Keahlian</th>
            <th className="p-3">Kota</th>
            <th className="p-3">Verifikasi</th>
            <th className="p-3">Status</th>
            <th className="p-3">Flags</th>
            <th className="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id} className="border-t border-neutral-100">
              <td className="p-3 font-mono text-xs">{d.kode}</td>
              <td className="p-3 font-medium">{d.nama}</td>
              <td className="p-3">
                {SKILL_EMOJI[d.keahlian]} {d.keahlian}
              </td>
              <td className="p-3">{d.kota}</td>
              <td className="p-3">
                <span className={`badge ${d.verified ? "badge-verified" : "badge-unverified"}`}>
                  {d.verified ? "✓ Verified" : "⏳ Pending"}
                </span>
              </td>
              <td className="p-3">{STATUS_LABEL[d.status] || d.status}</td>
              <td className="p-3">{d.flags > 0 ? `${d.flags} 🚩` : d.flags}</td>
              <td className="p-3">{renderActions(d)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
