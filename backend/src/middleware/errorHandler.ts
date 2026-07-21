import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan!` });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Data yang dikirim tidak valid!",
      errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  // Prisma known errors (unique constraint, not found, dll)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `Data dengan ${(err.meta?.target as string[])?.join(", ")} tersebut sudah terdaftar!`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan!" });
    }
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Fallback — unexpected error
  console.error("[Unhandled Error]", err);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server. Coba lagi beberapa saat",
  });
}
