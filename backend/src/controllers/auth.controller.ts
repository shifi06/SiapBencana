import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { asyncHandler, AppError } from "../utils/AppError";
import { loginSchema } from "../utils/validators";
import { signToken } from "../utils/jwt";
import { env } from "../config/env";

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
};

// ================================================================
// POST /api/auth/login
// Menggantikan doGet({action:'login'}) di apps-script.js +
// detectRole() di auth.js (yang sebelumnya jalan di client / rawan dimanipulasi).
// Deteksi role dilakukan sepenuhnya di server.
//
// PERBAIKAN KEAMANAN: sebelumnya relawan/koordinator bisa login hanya
// dengan kode saja (tanpa password), dan admin password bersifat opsional.
// Sekarang SEMUA role WAJIB mengirim kode + password, dan password
// diverifikasi dengan bcrypt.compare terhadap passwordHash tersimpan.
// Tidak ada jalur login yang bisa lolos tanpa password valid.
// ================================================================
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { kode, password } = loginSchema.parse(req.body);
  const kodeUpper = kode.toUpperCase();

  // Helper: verifikasi password & lempar error yang sama persis
  // baik kode maupun password salah — supaya penyerang tidak bisa
  // membedakan "kode tidak ada" vs "password salah" (mencegah user enumeration).
  const INVALID_MSG = "Kode atau password salah!";

  // 1. Cek admin
  const admin = await prisma.admin.findUnique({ where: { kode: kodeUpper } });
  if (admin) {
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new AppError(INVALID_MSG, 401);
    const token = signToken({ sub: admin.id, kode: admin.kode, role: "ADMIN", nama: admin.nama });
    res.cookie(env.cookieName, token, cookieOptions);
    return res.json({
      success: true,
      role: "ADMIN",
      user: { kode: admin.kode, nama: admin.nama },
    });
  }

  // 2. Cek koordinator
  const koordinator = await prisma.koordinator.findUnique({ where: { kode: kodeUpper } });
  if (koordinator) {
    const valid = await bcrypt.compare(password, koordinator.passwordHash);
    if (!valid) throw new AppError(INVALID_MSG, 401);
    const token = signToken({
      sub: koordinator.id,
      kode: koordinator.kode,
      role: "KOORDINATOR",
      nama: koordinator.nama,
    });
    res.cookie(env.cookieName, token, cookieOptions);
    const { passwordHash: _omit, ...safeKoordinator } = koordinator;
    return res.json({ success: true, role: "KOORDINATOR", user: safeKoordinator });
  }

  // 3. Cek relawan
  const relawan = await prisma.relawan.findUnique({ where: { kode: kodeUpper } });
  if (relawan) {
    const valid = await bcrypt.compare(password, relawan.passwordHash);
    if (!valid) throw new AppError(INVALID_MSG, 401);
    const token = signToken({ sub: relawan.id, kode: relawan.kode, role: "RELAWAN", nama: relawan.nama });
    res.cookie(env.cookieName, token, cookieOptions);
    const { passwordHash: _omit, ...safeRelawan } = relawan;
    return res.json({ success: true, role: "RELAWAN", user: safeRelawan });
  }

  // Kode sama sekali tidak ditemukan — pesan tetap sama seperti di atas
  // supaya tidak membocorkan kode mana yang valid (anti user-enumeration).
  throw new AppError(INVALID_MSG, 401);
});

// ================================================================
// POST /api/auth/logout
// ================================================================
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.cookieName, { ...cookieOptions, maxAge: 0 });
  res.json({ success: true });
});

// ================================================================
// GET /api/auth/me — ambil data user yang sedang login (fresh dari DB)
// ================================================================
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Belum login!", 401);
  const { role, sub } = req.user;

  if (role === "ADMIN") {
    const admin = await prisma.admin.findUnique({ where: { id: sub } });
    if (!admin) throw new AppError("Akun tidak ditemukan!", 404);
    return res.json({ success: true, role, user: { kode: admin.kode, nama: admin.nama } });
  }
  if (role === "KOORDINATOR") {
    const koordinator = await prisma.koordinator.findUnique({ where: { id: sub } });
    if (!koordinator) throw new AppError("Akun tidak ditemukan.", 404);
    const { passwordHash: _omit, ...safeKoordinator } = koordinator;
    return res.json({ success: true, role, user: safeKoordinator });
  }
  const relawan = await prisma.relawan.findUnique({ where: { id: sub } });
  if (!relawan) throw new AppError("Akun tidak ditemukan!", 404);
  const { passwordHash: _omit, ...safeRelawan } = relawan;
  return res.json({ success: true, role, user: safeRelawan });
});
