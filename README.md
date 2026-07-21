# ⚡ SiapBencana — Direktori Relawan Darurat Indonesia

Full-stack version: **Next.js + Express.js + Prisma + PostgreSQL**

## Struktur Project

```
siapbencana-final/
├── backend/          ← Express.js API + Prisma + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── utils/
│
└── frontend/         ← Next.js App Router
    └── src/
        ├── app/
        │   ├── page.tsx           (Beranda)
        │   ├── cari/              (Cari Relawan + Peta)
        │   ├── daftar/            (Form Daftar)
        │   ├── tentang/           (Tentang)
        │   ├── login/             (Login)
        │   └── dashboard/
        │       ├── relawan/
        │       ├── koordinator/
        │       └── admin/
        ├── components/
        │   └── Navbar.tsx
        ├── lib/
        │   ├── api.ts
        │   ├── auth-context.tsx
        │   ├── toast-context.tsx
        │   ├── useRequireRole.ts
        │   └── constants.ts
        └── types/
```

## Perubahan dari versi sebelumnya

**Navbar** — diubah menjadi: Home, Find Volunteers, About, Sign Up, Sign In (sesuai request)

**Halaman Cari Relawan** (`/cari`) — dipindahkan dari halaman "Daftar Relawan" yang salah tampil sebagai form pendaftaran. Sekarang `/cari` khusus untuk mencari relawan terdaftar, lengkap dengan:
- Search bar + filter kota + filter keahlian
- Tombol "📍 Cari relawan terdekat dari lokasi saya" (pakai GPS browser)
- Peta Leaflet (OpenStreetMap, gratis) menampilkan pin relawan
- Sorting otomatis berdasarkan jarak

**Homepage** (`/`) — didesain ulang mengikuti gaya visual dari project HTML sebelumnya (hero besar, stats counter, cara kerja 3 langkah)

## Setup — Backend

```bash
cd backend
npm install
cp .env.example .env
# isi .env dengan DATABASE_URL dari Neon (https://neon.tech)

npx prisma generate
npx prisma db push
npx prisma db seed    # buat akun admin awal

npm run dev            # jalan di http://localhost:4000
```

## Setup — Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# isi NEXT_PUBLIC_API_URL dengan URL backend kamu

npm run dev             # jalan di http://localhost:3000
```

## Deploy

**Backend → Railway / Render** (Neon PostgreSQL sebagai database)
1. Push folder `backend/` ke GitHub repo terpisah (atau subfolder)
2. Connect ke Railway/Render
3. Set environment variables dari `.env.example`
4. Set `DATABASE_URL` dari Neon dashboard

**Frontend → Vercel**
1. Push folder `frontend/` ke GitHub
2. Import project di vercel.com
3. Set `NEXT_PUBLIC_API_URL` ke URL backend production
4. Deploy

**Cloudflare Tunnel (opsional, untuk expose local dev)**
```bash
# Install cloudflared
cloudflared tunnel --url http://localhost:4000
```
Tunnel akan generate URL publik sementara untuk backend lokal kamu — berguna untuk testing sebelum deploy production.

## Autentikasi — Kode + Password (wajib untuk semua role)

**Perubahan keamanan penting:** sebelumnya relawan/koordinator bisa login hanya dengan kode (tanpa password), dan admin punya password tapi bersifat opsional. Ini rentan disalahgunakan — siapapun yang tahu/menebak sebuah kode (mis. `SB-100001`) bisa langsung masuk sebagai orang itu.

Sekarang **semua role wajib login dengan kode + password**, dan:
- Password di-hash dengan **bcrypt** sebelum disimpan — tidak pernah tersimpan dalam bentuk plain text
- `passwordHash` tidak pernah dikirim ke frontend (di-strip di setiap response API)
- Pesan error login sengaja dibuat sama ("Kode atau password salah.") baik kode maupun password yang salah — supaya penyerang tidak bisa menebak kode mana yang valid (anti *user enumeration*)
- Halaman login tidak lagi menyebutkan format kode role tertentu (SB-/KOORD-/ADMIN-) — backend yang menentukan role secara otomatis setelah autentikasi berhasil

## Login untuk testing

Setelah `npm run db:seed` di backend, kamu bisa login dengan:

| Role | Kode | Password default |
|---|---|---|
| Admin | `ADMIN-2025` (atau sesuai `SEED_ADMIN_KODE`) | sesuai `SEED_ADMIN_PASSWORD` di `.env` |
| Koordinator | `KOORD-0001` | `koordinator123` (atau sesuai `SEED_KOORDINATOR_PASSWORD`) |
| Relawan (contoh) | `SB-100001` s/d `SB-100012` | `relawan123` (atau sesuai `SEED_RELAWAN_PASSWORD`) |

**Relawan baru** mendaftar lewat halaman `/daftar` dan menentukan password/PIN sendiri (minimal 6 karakter) saat mengisi form — kode unik digenerate otomatis oleh server setelah submit.

**Koordinator baru** hanya bisa ditambahkan oleh admin lewat dashboard admin, yang juga menetapkan password awal untuk koordinator tersebut.

⚠️ **Sebelum deploy ke production**, ganti semua password default di atas dan jangan commit `.env` ke git.
