"use client";

import { useState } from "react";
import { useRequireRole } from "@/lib/useRequireRole";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";
import { SKILL_EMOJI, STATUS_LABEL, STATUS_OPTIONS } from "@/lib/constants";
import type { Relawan } from "@/types";

export default function DashboardRelawanPage() {
  const { session, loading } = useRequireRole(["RELAWAN"]);
  const { refresh } = useAuth();
  const toast = useToast();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ detail: "", kontak: "", status: "Siap" });

  if (loading || !session) return <div className="text-center py-20 text-neutral-500">Memuat...</div>;

  const data = session.user as Relawan;

  function enableEdit() {
    setForm({ detail: data.detail || "", kontak: data.kontak, status: data.status });
    setEditMode(true);
  }

  async function save() {
    setSaving(true);
    try {
      await api.patch("/relawan/me", form);
      await refresh();
      toast("✅ Profil berhasil diupdate!", "success");
      setEditMode(false);
    } catch (err: any) {
      toast(err.message || "Gagal update profil.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: string) {
    try {
      await api.patch("/relawan/me", { status });
      await refresh();
      toast(`Status diubah ke: ${STATUS_LABEL[status] || status}`, "success");
    } catch (err: any) {
      toast(err.message || "Gagal mengubah status.", "error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="border border-neutral-200 rounded-xl p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{data.nama}</h1>
            <span className="text-sm text-neutral-500">{data.kode}</span>
          </div>
          <span className={`badge ${data.verified ? "badge-verified" : "badge-unverified"}`}>
            {data.verified ? "✓ Terverifikasi" : "⏳ Belum Diverifikasi"}
          </span>
        </div>

        {!editMode ? (
          <>
            <dl className="space-y-2 text-sm">
              <Row label="Keahlian" value={`${SKILL_EMOJI[data.keahlian]} ${data.keahlian}`} />
              <Row label="Detail" value={data.detail || "—"} />
              <Row label="Lokasi" value={`${data.kota}, ${data.provinsi}`} />
              <Row label="Kontak" value={data.kontak} />
              <Row label="Status" value={STATUS_LABEL[data.status] || data.status} />
              <Row label="Terdaftar" value={new Date(data.createdAt).toLocaleDateString("id-ID")} />
            </dl>

            <div className="flex gap-2 mt-6 flex-wrap">
              <button onClick={enableEdit} className="btn-primary">
                Edit Profil
              </button>
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStatus(o.value)}
                  className={`text-xs px-3 py-2 rounded-lg border ${
                    data.status === o.value ? "bg-neutral-900 text-white" : "border-neutral-300"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Field label="Detail Keahlian">
              <textarea
                className="input"
                rows={3}
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              />
            </Field>
            <Field label="Kontak">
              <input
                className="input"
                value={form.kontak}
                onChange={(e) => setForm((f) => ({ ...f, kontak: e.target.value }))}
              />
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg border border-neutral-300">
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .btn-primary {
          background: #0d0d0d;
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 0.5rem;
          font-weight: 500;
        }
        .input {
          width: 100%;
          border: 1px solid #d4d4d4;
          border-radius: 0.5rem;
          padding: 0.5rem 0.8rem;
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 py-2">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
