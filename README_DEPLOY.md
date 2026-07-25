# Deploy ke Railway

## 1. Backend API
1. Buka https://railway.app
2. Buat project baru.
3. Tambahkan service dari folder backend.
4. Set environment variables:
   - PORT=5000
   - FRONTEND_URL=https://your-frontend-url.vercel.app
   - MYSQL_HOST=your-railway-mysql-host
   - MYSQL_PORT=3306
   - MYSQL_USER=your-railway-mysql-user
   - MYSQL_PASSWORD=your-railway-mysql-password
   - MYSQL_DATABASE=your-railway-mysql-database
   - Or use DATABASE_URL / MYSQL_URL if Railway provides a connection string

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
