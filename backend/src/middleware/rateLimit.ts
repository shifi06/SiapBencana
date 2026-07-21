import rateLimit from "express-rate-limit";

// Login: cegah brute-force kode
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak percobaan login. Coba lagi 15 menit lagi!" },
});

// Registrasi publik: cegah spam pendaftaran
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak pendaftaran dari IP ini. Coba lagi nanti!" },
});

// Umum: proteksi dasar seluruh API
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
