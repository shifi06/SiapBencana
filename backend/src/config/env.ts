import "dotenv/config";

function required(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Environment variable ${name} wajib diisi (cek file .env)`);
  }
  return val;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME || "sb_token",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim()),
  isProd: process.env.NODE_ENV === "production",
};
