import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type Role = "RELAWAN" | "KOORDINATOR" | "ADMIN";

export interface AuthPayload {
  sub: string; // id record (Relawan.id / Koordinator.id / Admin.id)
  kode: string;
  role: Role;
  nama: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwtSecret) as AuthPayload;
}
