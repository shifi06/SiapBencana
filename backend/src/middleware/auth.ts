import { Request, Response, NextFunction } from "express";
import { verifyToken, AuthPayload, Role } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Ambil token dari httpOnly cookie (menggantikan sessionStorage di versi lama)
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName];
  if (!token) {
    return next(new AppError("Belum login. Silakan login terlebih dahulu.", 401));
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError("Sesi tidak valid atau sudah kedaluwarsa. Silakan login ulang.", 401));
  }
}

// Optional auth — tidak error kalau tidak login, tapi tetap isi req.user kalau ada
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName];
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      /* abaikan token invalid untuk optional auth */
    }
  }
  next();
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Belum login.", 401));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError("Akses ditolak — role kamu tidak punya izin ke resource ini.", 403));
    }
    next();
  };
}
