# Deploy ke Railway

## 1. Backend API
1. Buka https://railway.app
2. Buat project baru.
3. Tambahkan service dari folder backend.
4. Set environment variables:
   - PORT=5000
   - FRONTEND_URL=https://your-frontend-url.vercel.app
   - DB_HOST=your-railway-mysql-host
   - DB_PORT=3306
   - DB_USER=your-railway-mysql-user
   - DB_PASSWORD=your-railway-mysql-password
   - DB_NAME=your-railway-mysql-database

## 2. Database MySQL di Railway
1. Tambahkan plugin MySQL pada project Railway.
2. Copy host, user, password, dan nama database ke environment backend.
3. Jalankan file database/schema.sql pada database MySQL Anda.

## 3. Frontend Web
1. Deploy frontend ke Vercel atau Netlify.
2. Set environment variable:
   - REACT_APP_API_URL=https://your-api-url.railway.app/api/v1

## 4. Android App
1. Ubah base URL API di file Flutter menjadi URL backend Railway.
2. Build APK/Android release.

## 5. Arsitektur yang disarankan
- Web admin dan Android app memakai API yang sama.
- Semua data disimpan di satu database MySQL di Railway.
