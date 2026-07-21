import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/AppError";
import { addKoordinatorSchema } from "../utils/validators";

const BCRYPT_ROUNDS = 10;

function omitPassword<T extends { passwordHash: string }>(obj: T) {
  const { passwordHash: _omit, ...rest } = obj;
  return rest;
}

// ================================================================
// GET /api/koordinator — admin only. Dulu tidak ada endpoint list
// khusus di apps-script.js (koordinator hanya bisa ditambah/dicek login).
// ================================================================
export const listKoordinator = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.koordinator.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: rows.map(omitPassword), total: rows.length });
});

// ================================================================
// POST /api/koordinator — dulu doPost({action:'addKoordinator'}), admin only
// Kode koordinator (prefix KOORD-) di-generate di server.
// PERBAIKAN KEAMANAN: admin sekarang WAJIB menetapkan password untuk
// koordinator baru — di-hash bcrypt sebelum disimpan, sama seperti relawan.
// ================================================================
export const addKoordinator = asyncHandler(async (req: Request, res: Response) => {
  const { password, ...data } = addKoordinatorSchema.parse(req.body);

  let kode = "";
  for (let i = 0; i < 10; i++) {
    const angka = Math.floor(1000 + Math.random() * 9000);
    const candidate = `KOORD-${angka}`;
    const exists = await prisma.koordinator.findUnique({ where: { kode: candidate } });
    if (!exists) {
      kode = candidate;
      break;
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const koordinator = await prisma.koordinator.create({ data: { ...data, kode, passwordHash } });
  res.status(201).json({ success: true, kode: koordinator.kode, data: omitPassword(koordinator) });
});

// ================================================================
// DELETE /api/koordinator/:kode
// ================================================================
export const deleteKoordinator = asyncHandler(async (req: Request, res: Response) => {
  const { kode } = req.params;

  const data = await prisma.koordinator.findUnique({
    where: { kode },
  });

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Koordinator tidak ditemukan.",
    });
  }

  await prisma.koordinator.delete({
    where: { kode },
  });

  res.json({
    success: true,
    message: "Koordinator berhasil dihapus",
  });
});
