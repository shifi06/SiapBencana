import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { asyncHandler, AppError } from "../utils/AppError";
import {
  registerRelawanSchema,
  updateRelawanSchema,
  relawanQuerySchema,
} from "../utils/validators";
import { Prisma } from "@prisma/client";

const BCRYPT_ROUNDS = 10;

// Helper: buang passwordHash sebelum data dikirim ke client
function omitPassword<T extends { passwordHash: string }>(obj: T) {
  const { passwordHash: _omit, ...rest } = obj;
  return rest;
}

// Generate kode unik SB-XXXXXX (dulu di-generate di frontend, sekarang di server
// supaya tidak bisa dipalsukan / bentrok)
async function generateKodeRelawan(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const angka = Math.floor(100000 + Math.random() * 900000);
    const kode = `SB-${angka}`;
    const exists = await prisma.relawan.findUnique({ where: { kode } });
    if (!exists) return kode;
  }
  throw new AppError("Gagal generate kode unik, coba lagi.", 500);
}

// ================================================================
// GET /api/relawan — dulu doGet({action:'get'})
// Mendukung filter & pencarian (dulu difilter di client-side)
// ================================================================
export const getAllRelawan = asyncHandler(async (req: Request, res: Response) => {
  const query = relawanQuerySchema.parse(req.query);
  const { q, kota, keahlian, status, verified, page, limit } = query;

  const where: Prisma.RelawanWhereInput = {
    ...(kota ? { kota } : {}),
    ...(keahlian ? { keahlian } : {}),
    ...(status ? { status } : {}),
    ...(verified !== undefined ? { verified: verified === "true" } : {}),
    ...(q
      ? {
          OR: [
            { nama: { contains: q, mode: "insensitive" } },
            { kota: { contains: q, mode: "insensitive" } },
            { detail: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.relawan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.relawan.count({ where }),
  ]);

  // Daftar relawan bersifat publik (untuk dicari koordinator) —
  // pastikan passwordHash TIDAK pernah ikut di response ini.
  const data = rows.map(omitPassword);

  res.json({ success: true, data, total, page, limit });
});

// ================================================================
// GET /api/relawan/stats — dulu doGet({action:'stats'})
// ================================================================
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, verified, aktif, kotaGroups] = await Promise.all([
    prisma.relawan.count(),
    prisma.relawan.count({ where: { verified: true } }),
    prisma.relawan.count({ where: { status: "Siap" } }),
    prisma.relawan.groupBy({ by: ["kota"] }),
  ]);

  res.json({ success: true, total, verified, aktif, kota: kotaGroups.length });
});

// ================================================================
// POST /api/relawan — dulu doPost({action:'add'})
// Registrasi publik relawan baru.
// PERBAIKAN KEAMANAN: password/PIN sekarang WAJIB diisi dan di-hash
// dengan bcrypt sebelum disimpan — tidak pernah disimpan dalam bentuk plain text.
// ================================================================
export const registerRelawan = asyncHandler(async (req: Request, res: Response) => {
  const { password, ...data } = registerRelawanSchema.parse(req.body);
  const kode = await generateKodeRelawan();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const relawan = await prisma.relawan.create({
    data: { ...data, kode, passwordHash, verified: false, flags: 0 },
  });

  res.status(201).json({ success: true, kode: relawan.kode, data: omitPassword(relawan) });
});

// ================================================================
// PATCH /api/relawan/me — dulu doPost({action:'update'}) & ({action:'toggleStatus'})
// Hanya relawan yang login yang boleh update profil sendiri
// ================================================================
export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = updateRelawanSchema.parse(req.body);
  if (!req.user) throw new AppError("Belum login!", 401);

  const relawan = await prisma.relawan.update({
    where: { id: req.user.sub },
    data,
  });

  res.json({ success: true, data: omitPassword(relawan) });
});

// ================================================================
// PATCH /api/relawan/:kode/approve — dulu doPost({action:'approve'}), admin only
// ================================================================
export const approveRelawan = asyncHandler(async (req: Request, res: Response) => {
  const kode = req.params.kode.toUpperCase();
  const relawan = await prisma.relawan.update({
    where: { kode },
    data: { verified: true },
  });
  res.json({ success: true, data: omitPassword(relawan) });
});

// ================================================================
// DELETE /api/relawan/:kode — dulu doPost({action:'hapus'}), admin only
// ================================================================
export const deleteRelawan = asyncHandler(async (req: Request, res: Response) => {
  const kode = req.params.kode.toUpperCase();
  await prisma.relawan.delete({ where: { kode } });
  res.json({ success: true });
});

// ================================================================
// POST /api/relawan/:kode/flag — dulu doPost({action:'flag'})
// Publik (siapa saja bisa lapor), tapi sekarang dicatat per-IP untuk audit
// & mencegah spam sederhana (1 IP hanya bisa flag 1x per relawan / 24 jam).
// ================================================================
export const flagRelawan = asyncHandler(async (req: Request, res: Response) => {
  const kode = req.params.kode.toUpperCase();
  const relawan = await prisma.relawan.findUnique({ where: { kode } });
  if (!relawan) throw new AppError("Data relawan tidak ditemukan!", 404);

  const reporterIp = req.ip;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alreadyReported = await prisma.report.findFirst({
    where: { relawanId: relawan.id, reporterIp, createdAt: { gte: since } },
  });
  if (alreadyReported) {
    throw new AppError("Kamu sudah melaporkan relawan ini dalam 24 jam terakhir!", 429);
  }

  const [, updated] = await prisma.$transaction([
    prisma.report.create({ data: { relawanId: relawan.id, reporterIp } }),
    prisma.relawan.update({ where: { id: relawan.id }, data: { flags: { increment: 1 } } }),
  ]);

  res.json({ success: true, flags: updated.flags });
});

// ================================================================
// POST /api/relawan/:kode/reset-flag — dulu doPost({action:'resetFlag'}), admin only
// ================================================================
export const resetFlag = asyncHandler(async (req: Request, res: Response) => {
  const kode = req.params.kode.toUpperCase();
  const relawan = await prisma.relawan.update({ where: { kode }, data: { flags: 0 } });
  // Bersihkan juga histori report supaya rate-limit flag tidak nyangkut
  await prisma.report.deleteMany({ where: { relawanId: relawan.id } });
  res.json({ success: true, flags: relawan.flags });
});
