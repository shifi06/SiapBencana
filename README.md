# ⚡ SiapBencana — Direktori Relawan Darurat Indonesia

Platform crowdsourcing untuk menemukan dan menghubungkan relawan berkeahlian khusus (medis, logistik, teknik, komunikasi, psikologi) dengan koordinator bencana secara real-time — dilengkapi pencarian berbasis lokasi.

**Live demo:** [siapbencana.vercel.app](https://siapbencana.vercel.app) · **Repo:** [github.com/shifi06/SiapBencana](https://github.com/shifi06/SiapBencana)

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Leaflet.js |
| Backend | Express.js, TypeScript, Zod |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | JWT (httpOnly cookie) + bcrypt password hashing |
| Deploy | Vercel (frontend) · Railway/Render (backend) · Neon (DB) |

---

## Clone repository

```bash
git clone https://github.com/shifi06/SiapBencana.git
cd SiapBencana
```

---

## Backend

```bash
cd backend && npm install && cp .env.example .env
```

Isi `.env` dengan `DATABASE_URL` dari [Neon](https://neon.tech), lalu jalankan migrasi + seed:

```bash
npx prisma generate && npx prisma db push && npm run db:seed && npm run dev
```

> Backend running on http://localhost:4000

### Prisma Studio (lihat isi database)

```bash
cd backend && npx prisma studio
```

> Prisma Studio is up on http://localhost:5555

---

## Frontend

```bash
cd frontend && npm install && cp .env.example .env.local && npm run dev
```

> Access the page at http://localhost:3000

---

## Akun untuk testing

Setelah `npm run db:seed`, tiga role berikut siap dipakai. **Semua role login dengan kode + password** — tidak ada jalur login tanpa password.

| Role | Kode | Password |
|---|---|---|
| Admin | `ADMIN-2025` | sesuai `SEED_ADMIN_PASSWORD` di `.env` |
| Koordinator | `KOORD-0001` | `koordinator123` |
| Relawan (contoh) | `SB-100001` s/d `SB-100012` | `relawan123` |

Relawan baru mendaftar mandiri lewat `/daftar` dan menentukan password sendiri (min. 6 karakter) — kode unik digenerate otomatis oleh server.

---

## Struktur Project

```
SiapBencana/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # model Relawan, Koordinator, Admin, Report
│   │   └── seed.ts
│   └── src/
│       ├── controllers/       # auth, relawan, koordinator
│       ├── middleware/        # authenticate, authorize (role-based)
│       ├── routes/
│       └── utils/             # validators (Zod), AppError
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx            # Beranda
        │   ├── cari/                # Direktori + peta Leaflet + GPS terdekat
        │   ├── daftar/               # Registrasi relawan
        │   ├── tentang/
        │   ├── login/
        │   └── dashboard/
        │       ├── relawan/          # Profil, status ketersediaan
        │       ├── koordinator/      # Kirim permintaan bantuan + direktori
        │       └── admin/            # Verifikasi, flag, kelola koordinator
        ├── components/Navbar.tsx
        ├── lib/                     # api.ts, auth-context, toast-context
        └── types/
```

---

## Fitur Utama

- **Pencarian relawan terdekat** — deteksi GPS browser, urutkan hasil berdasarkan jarak (Haversine), tampilkan di peta Leaflet (OpenStreetMap, gratis)
- **Role-based dashboard** — tampilan dan izin berbeda untuk Relawan, Koordinator, dan Admin
- **Verifikasi & moderasi** — admin approve relawan baru, kelola laporan (flag) dari publik dengan proteksi anti-spam per-IP
- **Autentikasi aman** — password di-hash bcrypt untuk semua role, pesan error login seragam (anti user-enumeration), role ditentukan backend bukan dibocorkan di UI

---

## Deploy ke Production

**Backend → Railway / Render**
1. Push repo ke GitHub
2. Connect ke Railway/Render, set root directory ke `backend/`
3. Isi environment variables sesuai `.env.example`
4. `DATABASE_URL` diambil dari Neon dashboard

**Frontend → Vercel**
1. Import project di [vercel.com](https://vercel.com), set root directory ke `frontend/`
2. Isi `NEXT_PUBLIC_API_URL` dengan URL backend production
3. Deploy

**Cloudflare Tunnel** (expose backend lokal untuk testing sebelum deploy)
```bash
cloudflared tunnel --url http://localhost:4000
```

---

⚠️ **Sebelum deploy ke production**, ganti semua password default di atas dan jangan commit `.env` ke git.

---

## Lisensi

Project ini dibuat untuk keperluan tugas mata kuliah Data Engineering.