"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function LoginPage() {
  const [kode, setKode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const isFormValid = kode.trim().length >= 3 && password.length >= 6;

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Validasi wajib DUA-DUANYA — kode saja atau password saja tidak cukup.
    if (!kode.trim()) {
      toast("Isi kode akun kamu dulu.", "error");
      return;
    }
    if (!password) {
      toast("Isi password kamu dulu.", "error");
      return;
    }

    setLoading(true);
    try {
      const session = await login(kode.trim(), password);
      toast("Login berhasil!", "success");
      router.push(dashboardPathForRole(session.role));
    } catch (err: any) {
      toast(err.message || "Kode atau password salah.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-1 text-center">Masuk</h1>
      <p className="text-neutral-500 text-sm text-center mb-8">
        Masukkan kode akun dan password kamu untuk melanjutkan
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Kode Akun
          </label>
          <input
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none focus:border-brand transition"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="Masukkan kode akun"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Password
          </label>
          <input
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none focus:border-brand transition"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Belum punya akun?{" "}
        <a href="/daftar" className="text-brand font-medium hover:underline">
          Daftar sebagai Relawan
        </a>
      </p>
    </div>
  );
}
