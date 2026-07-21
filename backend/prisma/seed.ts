import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

// Data contoh diambil dari SAMPLE_DATA di index.html versi lama
const sampleRelawan = [
  { kode: "SB-100001", nama: "Dr. Rina Kusumawati", kota: "Bogor", provinsi: "Jawa Barat", keahlian: "Medis", detail: "Dokter Umum, Puskesmas Bogor Tengah", kontak: "081234567890", status: "Siap", verified: true },
  { kode: "SB-100002", nama: "Budi Santoso", kota: "Cianjur", provinsi: "Jawa Barat", keahlian: "Logistik", detail: "Pengemudi truk 10 tahun, siap evakuasi", kontak: "082345678901", status: "Siap", verified: true },
  { kode: "SB-100003", nama: "Sari Dewi", kota: "Bandung", provinsi: "Jawa Barat", keahlian: "Psikologi", detail: "Psikolog klinis, spesialis trauma bencana", kontak: "083456789012", status: "Siap", verified: false },
  { kode: "SB-100004", nama: "Ahmad Fauzi", kota: "Jakarta Selatan", provinsi: "DKI Jakarta", keahlian: "Teknik", detail: "Teknisi listrik PLN, siap perbaikan darurat", kontak: "084567890123", status: "Terbatas", verified: true },
  { kode: "SB-100005", nama: "Lestari Ningrum", kota: "Bogor", provinsi: "Jawa Barat", keahlian: "Komunikasi", detail: "Operator radio amatir ORARI", kontak: "085678901234", status: "Siap", verified: false },
  { kode: "SB-100006", nama: "Hendra Wijaya", kota: "Depok", provinsi: "Jawa Barat", keahlian: "Medis", detail: "Perawat IGD RS Universitas Indonesia", kontak: "086789012345", status: "Siap", verified: true },
  { kode: "SB-100007", nama: "Fitriani", kota: "Sukabumi", provinsi: "Jawa Barat", keahlian: "Lainnya", detail: "Koordinator dapur umum, bisa masak 200 porsi", kontak: "087890123456", status: "Siap", verified: false },
  { kode: "SB-100008", nama: "Ns. Dina Marlina", kota: "Bekasi", provinsi: "Jawa Barat", keahlian: "Medis", detail: "Bidan komunitas, spesialis ibu dan anak", kontak: "089012345678", status: "Siap", verified: true },
  { kode: "SB-100009", nama: "Yanuar Pratama", kota: "Jakarta Timur", provinsi: "DKI Jakarta", keahlian: "Logistik", detail: "Punya pickup double cabin, angkut 1 ton", kontak: "081122334455", status: "Siap", verified: false },
  { kode: "SB-100010", nama: "Citra Puspita", kota: "Tangerang", provinsi: "Banten", keahlian: "Komunikasi", detail: "Jurnalis lapangan, dokumentasi dan siaran darurat", kontak: "082233445566", status: "Siap", verified: true },
  { kode: "SB-100011", nama: "Pak Sutrisno", kota: "Cianjur", provinsi: "Jawa Barat", keahlian: "Teknik", detail: "Tukang bangunan 20 tahun, perbaikan cepat", kontak: "083344556677", status: "Siap", verified: false },
  { kode: "SB-100012", nama: "Dr. Agus Hermawan", kota: "Garut", provinsi: "Jawa Barat", keahlian: "Medis", detail: "Dokter spesialis bedah, siaga bencana", kontak: "081344556677", status: "Siap", verified: true },
] as const;

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Admin awal (dulu hardcoded ADMIN_CODES di auth.js — sekarang di DB dengan password hash)
  const adminKode = (process.env.SEED_ADMIN_KODE || "ADMIN-2025").toUpperCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ganti-password-ini";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { kode: adminKode },
    update: {},
    create: {
      kode: adminKode,
      nama: process.env.SEED_ADMIN_NAMA || "Administrator",
      passwordHash: adminPasswordHash,
    },
  });
  console.log(`✅ Admin siap: ${adminKode} / password: ${adminPassword}`);

  // 2. Contoh koordinator
  // PERBAIKAN KEAMANAN: koordinator sekarang juga wajib punya password ter-hash.
  const koordDefaultPassword = process.env.SEED_KOORDINATOR_PASSWORD || "koordinator123";
  const koordPasswordHash = await bcrypt.hash(koordDefaultPassword, 10);

  await prisma.koordinator.upsert({
    where: { kode: "KOORD-0001" },
    update: {},
    create: {
      kode: "KOORD-0001",
      passwordHash: koordPasswordHash,
      nama: "Koordinator BNPB Jabar",
      instansi: "BNPB Provinsi Jawa Barat",
      wilayah: "Jawa Barat",
      kontak: "081200000000",
    },
  });
  console.log(`✅ Koordinator siap: KOORD-0001 / password: ${koordDefaultPassword}`);

  // 3. Data relawan contoh
  // PERBAIKAN KEAMANAN: setiap relawan contoh juga diberi password/PIN ter-hash.
  // Password default sama untuk semua data contoh — HANYA untuk testing/demo.
  const relawanDefaultPassword = process.env.SEED_RELAWAN_PASSWORD || "relawan123";
  const relawanPasswordHash = await bcrypt.hash(relawanDefaultPassword, 10);

  for (const r of sampleRelawan) {
    await prisma.relawan.upsert({
      where: { kode: r.kode },
      update: {},
      create: {
        ...r,
        passwordHash: relawanPasswordHash,
        keahlian: r.keahlian as any,
        status: r.status as any,
        flags: 0,
      },
    });
  }
  console.log(`✅ ${sampleRelawan.length} data relawan contoh dimasukkan.`);
  console.log(`   Semua relawan contoh pakai password: ${relawanDefaultPassword}`);

  console.log("🌱 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
