# 🚀 Getting Started - Admin Features

Panduan lengkap untuk menjalankan dan testing fitur Admin Platform Wallet Point.

---

## 📋 Prerequisites Checklist

Pastikan sudah terinstall:
- ✅ **Go** 1.21+ ([Download](https://go.dev/dl/))
- ✅ **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- ✅ **Git** ([Download](https://git-scm.com/downloads))
- ✅ **Postman** atau **curl** untuk testing API

**Cek instalasi:**
```bash
go version        # Go version go1.21 atau lebih
mysql --version   # MySQL 8.0 atau lebih
```

---

## 🗄️ Step 1: Setup Database

### 1.1 Buat Database
```bash
# Login ke MySQL
mysql -u root -p

# Atau di Windows (jika MySQL ada di PATH):
# mysql -u root -p
```

### 1.2 Jalankan SQL Files
```bash
# Exit dari MySQL dulu (ketik: exit)

# Masuk ke folder database
cd c:\Users\ahmad\Downloads\project-3\WPFIX\database

# Jalankan SQL files secara berurutan
mysql -u root -p < 01_tables.sql
mysql -u root -p < 02_triggers_procedures.sql
mysql -u root -p < 03_seed_data.sql
```

**Atau bisa manual:**
```bash
# Login MySQL
mysql -u root -p

# Paste isi dari 01_tables.sql
# Lalu paste isi dari 02_triggers_procedures.sql
# Terakhir paste isi dari 03_seed_data.sql
```

### 1.3 Verifikasi Database
```sql
USE walletpoint_db;
SHOW TABLES;

-- Harus ada 13 tabel:
-- users, wallets, wallet_transactions, missions, mission_submissions,
-- tasks, task_submissions, transfers, products, marketplace_transactions,
-- external_sources, external_point_logs, audit_logs

-- Cek data awal
SELECT * FROM users;        -- Harus ada 6 users
SELECT * FROM products;     -- Harus ada 4 products
```

---

## ⚙️ Step 2: Setup Backend

### 2.1 Masuk ke Folder Backend
```bash
cd c:\Users\ahmad\Downloads\project-3\WPFIX\backend
```

### 2.2 Konfigurasi Environment
File `.env` sudah dibuat, tapi cek dan sesuaikan jika perlu:

```env
# Edit file .env
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=        # Isi password MySQL kamu
DB_NAME=walletpoint_db
JWT_SECRET=wallet-point-super-secret-key-change-in-production-min-32-chars
```

**⚠️ PENTING**: Ganti `DB_PASSWORD` dengan password MySQL Anda!

### 2.3 Install Dependencies
```bash
go mod download
```

Akan download:
- Gin (web framework)
- GORM (ORM)
- JWT library
- bcrypt (password hashing)
- MySQL driver
- dan lainnya

### 2.4 Jalankan Aplikasi
```bash
go run cmd/server/main.go
```

**Output yang diharapkan:**
```
✅ Database connected successfully
🚀 Server starting on http://localhost:8080
📚 API Documentation: http://localhost:8080/swagger/index.html
🏥 Health Check: http://localhost:8080/api/v1/health
✨ Press Ctrl+C to stop the server
```

**Jika ada error:**
- Cek database credentials di `.env`
- Pastikan MySQL service running
- Cek port 8080 tidak dipakai aplikasi lain

---

## 🧪 Step 3: Testing dengan curl (Command Line)

### 3.1 Health Check
```bash
curl http://localhost:8080/api/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Wallet Point API is running"
}
```

### 3.2 Login sebagai Admin
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@campus.edu\",\"password\":\"Password123!\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@campus.edu",
      "full_name": "System Administrator",
      "role": "admin"
    }
  }
}
```

**🔑 SIMPAN TOKEN INI!** Copy nilai `token` untuk request berikutnya.

### 3.3 Test Get Users (Perlu Token)
```bash
# Ganti YOUR_TOKEN dengan token dari login
curl -X GET http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 4,
        "email": "mahasiswa1@campus.edu",
        "full_name": "Alice Johnson",
        "nim_nip": "2023001",
        "role": "mahasiswa",
        "status": "active",
        "balance": 0
      },
      // ... more users
    ],
    "total": 6,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

### 3.4 Test Create User
```bash
curl -X POST http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser@campus.edu\",\"password\":\"Test123!\",\"full_name\":\"Test User\",\"nim_nip\":\"2024999\",\"role\":\"mahasiswa\"}"
```

### 3.5 Test Adjust Points
```bash
# Ambil wallet_id dari response get users (biasanya sama dengan user_id)
curl -X POST http://localhost:8080/api/v1/admin/wallet/adjustment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_id\":4,\"amount\":500,\"direction\":\"credit\",\"description\":\"Welcome bonus for testing\"}"
```

### 3.6 Test Get Transactions
```bash
curl -X GET http://localhost:8080/api/v1/admin/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Step 4: Testing dengan Postman (Recommended)

### 4.1 Setup Postman

1. **Buka Postman**
2. **Create new Collection**: "Wallet Point Admin"
3. **Add Environment Variable**:
   - Variable: `base_url`
   - Initial Value: `http://localhost:8080/api/v1`
   - Variable: `token`
   - Initial Value: (kosongkan dulu)

### 4.2 Request 1: Login

**Method**: POST  
**URL**: `{{base_url}}/auth/login`  
**Headers**: 
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "email": "admin@campus.edu",
  "password": "Password123!"
}
```

**Send** → Copy `token` dari response → Simpan ke environment variable `token`

### 4.3 Request 2: Get All Users

**Method**: GET  
**URL**: `{{base_url}}/admin/users`  
**Headers**:
```
Authorization: Bearer {{token}}
```

**Send** → Lihat list users dengan wallet balance

### 4.4 Request 3: Create User

**Method**: POST  
**URL**: `{{base_url}}/admin/users`  
**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "email": "newstudent@campus.edu",
  "password": "Password123!",
  "full_name": "New Student",
  "nim_nip": "2024100",
  "role": "mahasiswa"
}
```

### 4.5 Request 4: Get Wallets

**Method**: GET  
**URL**: `{{base_url}}/admin/wallets`  
**Headers**:
```
Authorization: Bearer {{token}}
```

### 4.6 Request 5: Adjust Points

**Method**: POST  
**URL**: `{{base_url}}/admin/wallet/adjustment`  
**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "wallet_id": 4,
  "amount": 1000,
  "direction": "credit",
  "description": "Testing credit points"
}
```

### 4.7 Request 6: Get Transactions

**Method**: GET  
**URL**: `{{base_url}}/admin/transactions?page=1&limit=20`  
**Headers**:
```
Authorization: Bearer {{token}}
```

### 4.8 Request 7: Create Product

**Method**: POST  
**URL**: `{{base_url}}/admin/products`  
**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "name": "Campus Tumbler",
  "description": "Stainless steel tumbler 500ml",
  "price": 80,
  "stock": 100,
  "image_url": "https://example.com/tumbler.jpg"
}
```

---

## ✅ Verification Checklist

Jalankan test ini untuk memastikan semua berfungsi:

### Database
- [ ] Database `walletpoint_db` terbuat
- [ ] 13 tabel terdeteksi
- [ ] 6 users dari seed data ada
- [ ] 4 products dari seed data ada
- [ ] Trigger auto-create wallet berfungsi

### Backend
- [ ] Server berjalan di port 8080
- [ ] Health check mengembalikan status OK
- [ ] Tidak ada error di console

### Authentication
- [ ] Login berhasil dengan admin credentials
- [ ] Token JWT digenerate
- [ ] GET /auth/me mengembalikan user info

### User Management
- [ ] GET /admin/users menampilkan list users
- [ ] POST /admin/users berhasil create user baru
- [ ] Wallet otomatis terbuat untuk user baru
- [ ] PUT /admin/users berhasil update user
- [ ] DELETE /admin/users berhasil deactivate

### Wallet Management
- [ ] GET /admin/wallets menampilkan semua wallets
- [ ] POST /admin/wallet/adjustment berhasil credit poin
- [ ] POST /admin/wallet/adjustment berhasil debit poin
- [ ] Balance update setelah adjustment
- [ ] Transaction record terbuat

### Transaction Monitoring
- [ ] GET /admin/transactions menampilkan semua transaksi
- [ ] Filter by type berfungsi
- [ ] Pagination berfungsi

### Marketplace
- [ ] GET /admin/products menampilkan products
- [ ] POST /admin/products berhasil create product
- [ ] PUT /admin/products berhasil update product
- [ ] DELETE /admin/products berhasil soft delete

---

## 🐛 Troubleshooting

### Error: "Failed to connect to database"
```bash
# Cek MySQL service status
# Windows:
net start MySQL80

# Cek credentials di .env
DB_USER=root
DB_PASSWORD=your_password  # <- Pastikan benar
DB_NAME=walletpoint_db
```

### Error: "Port 8080 already in use"
```bash
# Option 1: Stop aplikasi yang pakai port 8080
# Option 2: Ganti port di .env
SERVER_PORT=8081
```

### Error: "Invalid token" / "Unauthorized"
```bash
# Token expired atau invalid
# Solution: Login ulang untuk dapat token baru
```

### Error: "Email already registered"
```bash
# Email sudah dipakai user lain
# Solution: Gunakan email berbeda
```

### Error: "Wallet not found"
```bash
# Wallet ID tidak ada
# Solution: Cek wallet ID yang benar dari GET /admin/wallets
```

---

## 📚 Next Steps

Setelah semua test berhasil, Anda bisa:

1. **Explore semua endpoint** di [ADMIN_API_QUICK_REFERENCE.md](ADMIN_API_QUICK_REFERENCE.md)
2. **Test skenario kompleks**:
   - Create multiple users
   - Give points to users
   - Monitor transactions
   - Create products
   - Test pagination & filters

3. **Prepare for next module**: Dosen Features

---

## 🎯 Success Criteria

Admin features dianggap berhasil jika:
- ✅ Semua 19+ endpoints berfungsi
- ✅ Authentication & authorization bekerja
- ✅ Database transactions atomic
- ✅ Wallet balance update correctly
- ✅ Transaction records immutable
- ✅ Audit logs created automatically

---

**Happy Testing! 🚀**

Jika ada masalah, cek:
1. Error message di terminal backend
2. Error response dari API
3. MySQL error logs
4. [DESIGN_NOTES.md](DESIGN_NOTES.md) untuk design principles

---

**Version**: 1.0  
**Last Updated**: 2026-01-13  
**Status**: Ready for Testing ✅
