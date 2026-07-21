export type Keahlian = "Medis" | "Logistik" | "Teknik" | "Komunikasi" | "Psikologi" | "Lainnya";
export type StatusRelawan = "Siap" | "Terbatas" | "TidakAktif";
export type Role = "RELAWAN" | "KOORDINATOR" | "ADMIN";

export interface Relawan {
  id: string;
  kode: string;
  nama: string;
  kota: string;
  provinsi: string;
  keahlian: Keahlian;
  detail: string | null;
  kontak: string;
  status: StatusRelawan;
  verified: boolean;
  flags: number;
  createdAt: string;
  updatedAt: string;
}

export interface Koordinator {
  id: string;
  kode: string;
  nama: string;
  instansi: string;
  wilayah: string;
  kontak: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  kode: string;
  nama: string;
}

export interface Session {
  role: Role;
  user: Relawan | Koordinator | AdminUser;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  [key: string]: any;
}
