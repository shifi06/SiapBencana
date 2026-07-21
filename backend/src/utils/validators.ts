import { z } from "zod";

export const KeahlianEnum = z.enum(["Medis", "Logistik", "Teknik", "Komunikasi", "Psikologi", "Lainnya"]);
export const StatusEnum = z.enum(["Siap", "Terbatas", "TidakAktif"]);

// PIN/password minimal 6 karakter — cukup untuk relawan lapangan
// (tidak dipaksa kombinasi huruf besar/simbol seperti password web biasa,
// karena relawan sering login lewat HP di kondisi darurat).
const passwordField = z
  .string()
  .min(6, "Password/PIN minimal 6 karakter")
  .max(72, "Password/PIN maksimal 72 karakter");

export const loginSchema = z.object({
  kode: z.string().trim().min(3, "Kode minimal 3 karakter").max(50),
  password: passwordField,
});

export const registerRelawanSchema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  password: passwordField,
  kota: z.string().trim().min(2).max(100),
  provinsi: z.string().trim().min(2).max(100),
  keahlian: KeahlianEnum,
  detail: z.string().trim().max(500).optional().default(""),
  kontak: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{8,20}$/, "Format nomor kontak tidak valid"),
  status: StatusEnum.optional().default("Siap"),
});

export const updateRelawanSchema = z.object({
  detail: z.string().trim().max(500).optional(),
  kontak: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{8,20}$/, "Format nomor kontak tidak valid!")
    .optional(),
  status: StatusEnum.optional(),
});

export const addKoordinatorSchema = z.object({
  nama: z.string().trim().min(3).max(100),
  password: passwordField,
  instansi: z.string().trim().min(2).max(150),
  wilayah: z.string().trim().min(2).max(150),
  kontak: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{8,20}$/, "Format nomor kontak tidak valid"),
});

export const relawanQuerySchema = z.object({
  q: z.string().trim().optional(),
  kota: z.string().trim().optional(),
  keahlian: KeahlianEnum.optional(),
  status: StatusEnum.optional(),
  verified: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});
