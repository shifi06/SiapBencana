"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { KEAHLIAN_OPTIONS, STATUS_OPTIONS, KOTA_DATA, PROVINSI_LIST } from "@/lib/constants";

export default function DaftarPage() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    password: "",
    provinsi: "",
    kota: "",
    keahlian: "",
    detail: "",
    kontak: "",
    status: "Siap",
  });
  const [kodeHasil, setKodeHasil] = useState<string | null>(null);

  const kotaOptions = useMemo(() => (form.provinsi ? KOTA_DATA[form.provinsi] || [] : []), [form.provinsi]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama || !form.provinsi || !form.kota || !form.keahlian || !form.kontak) {
      toast("Lengkapi semua field wajib (*) dulu.", "error");
      return;
    }
    if (form.password.length < 6) {
      toast("Password/PIN minimal 6 karakter.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/relawan", form);
      setKodeHasil(res.kode);
      toast("✅ Pendaftaran berhasil! Simpan kode kamu.", "success");
    } catch (err: any) {
      toast(err.message || "Gagal mendaftar. Coba lagi.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (kodeHasil) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-3">Pendaftaran Berhasil!</h1>
        <p className="text-neutral-600 mb-6">
          Ini kode unik kamu — simpan baik-baik, dipakai untuk login ke dashboard:
        </p>
        <div className="text-2xl font-mono font-bold bg-neutral-100 rounded-lg py-4 mb-6">
          {kodeHasil}
        </div>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark"
        >
          Lanjut ke Login →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Daftarkan Keahlianmu</h1>
      <p className="text-neutral-600 mb-8 text-sm">
        Data kamu akan direview oleh admin sebelum diverifikasi dan tampil publik.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <Field label="Nama Lengkap" required>
          <input
            className="input"
            value={form.nama}
            onChange={(e) => update("nama", e.target.value)}
            placeholder="Nama lengkap kamu"
          />
        </Field>

        <Field label="Password / PIN (untuk login nanti)" required>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Minimal 6 karakter, boleh angka saja"
          />
          <p className="text-xs text-neutral-400 mt-1">
            Ingat baik-baik — dipakai bersama kode akun untuk login.
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Provinsi" required>
            <select
              className="input"
              value={form.provinsi}
              onChange={(e) => {
                update("provinsi", e.target.value);
                update("kota", "");
              }}
            >
              <option value="">Pilih provinsi...</option>
              {PROVINSI_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Kota" required>
            <select
              className="input"
              value={form.kota}
              onChange={(e) => update("kota", e.target.value)}
              disabled={!form.provinsi}
            >
              <option value="">{form.provinsi ? "Pilih kota..." : "Pilih provinsi dulu..."}</option>
              {kotaOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Kategori Keahlian" required>
          <select className="input" value={form.keahlian} onChange={(e) => update("keahlian", e.target.value)}>
            <option value="">Pilih kategori...</option>
            {KEAHLIAN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Detail Keahlian">
          <textarea
            className="input"
            rows={3}
            value={form.detail}
            onChange={(e) => update("detail", e.target.value)}
            placeholder="Contoh: Perawat IGD, 5 tahun pengalaman"
          />
        </Field>

        <Field label="Nomor Kontak (WhatsApp)" required>
          <input
            className="input"
            value={form.kontak}
            onChange={(e) => update("kontak", e.target.value)}
            placeholder="0812xxxxxxxx"
          />
        </Field>

        <Field label="Status Ketersediaan">
          <select className="input" value={form.status} onChange={(e) => update("status", e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? "Mendaftar..." : "Daftar Sekarang"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #d4d4d4;
          border-radius: 0.5rem;
          padding: 0.6rem 0.9rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
