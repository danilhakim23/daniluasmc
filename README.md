# Admin Web Panel - Santri Reminder NJ

Proyek ini adalah contoh implementasi Admin Web Panel untuk aplikasi mobile Android Santri Reminder NJ dengan fokus pada manajemen jadwal, pengumuman pondok, quote islami, dan database hadis.

## Struktur Proyek

```text
santri-reminder-admin/
├── backend/
│   ├── routes/
│   │   └── api.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── database/
│   └── schema.sql
└── README.md
```

## Fitur Utama

- Dashboard statistik santri aktif dan disiplin harian
- Form input jadwal kegiatan pondok
- CRUD jadwal yang terhubung ke API
- Manajemen quote islami
- Pengumuman pondok
- Database hadis
- Tampilan login admin simulasi

## Cara Menjalankan

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
npm start
```

## API yang Tersedia

- GET /api/v1/health
- GET /api/v1/schedules
- POST /api/v1/schedules
- PUT /api/v1/schedules/:id
- DELETE /api/v1/schedules/:id
- GET /api/v1/quotes
- POST /api/v1/quotes
- GET /api/v1/statistics

## Deployment Singkat

- Frontend: Vercel atau Netlify
- Backend: Render, Railway, atau Cyclic
- Database: PostgreSQL di Neon / Supabase / Railway

## Format Laporan UAS

1. Latar Belakang
2. Tujuan Aplikasi
3. Struktur Folder dan Teknologi
4. Fitur Utama
5. Endpoint API
6. Hasil Demo / Screenshot
7. Kesimpulan
