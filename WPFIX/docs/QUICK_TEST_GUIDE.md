# 🚀 Quick Test Guide - Admin Features

Server sudah berjalan di **http://localhost:8080**

## ✅ Status
- Database: Connected ✅
- Server: Running on port 8080 ✅
- All compilation errors: Fixed ✅
- **Password Storage**: Plain text (untuk testing) ⚠️

> **Note**: Password hashing dinonaktifkan untuk memudahkan testing.  
> Password disimpan sebagai plain text. Jangan gunakan di production!

---

## 🧪 Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:8080/api/v1/health
```

**Expected Response:**
```json
{"status":"ok","message":"Wallet Point is running"}
```

---

### 2. Login sebagai Admin
```bash
curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@campus.edu\",\"password\":\"Password123!\"}"
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

**📝 SIMPAN TOKEN!** Copy nilai `token` untuk request berikutnya.

---

### 3. Get All Users (Butuh Token)
```bash
# Ganti YOUR_TOKEN dengan token dari login
curl -X GET http://localhost:8080/api/v1/admin/users -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Get All Wallets
```bash
curl -X GET http://localhost:8080/api/v1/admin/wallets -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Create New Product
```bash
curl -X POST http://localhost:8080/api/v1/admin/products -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Test Product\",\"description\":\"Test Description\",\"price\":100,\"stock\":50}"
```

---

### 6. Adjust Points (Give 500 points to wallet ID 4)
```bash
curl -X POST http://localhost:8080/api/v1/admin/wallet/adjustment -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"wallet_id\":4,\"amount\":500,\"direction\":\"credit\",\"description\":\"Testing credit points\"}"
```

---

### 7. Get All Transactions
```bash
curl -X GET http://localhost:8080/api/v1/admin/transactions -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Testing dengan Postman (Recommended)

### Setup Postman:

1. **Create Environment Variable**
   - `base_url`: `http://localhost:8080/api/v1`
   - `token`: (akan diisi setelah login)

2. **Request Login**
   - Method: POST
   - URL: `{{base_url}}/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@campus.edu",
       "password": "Password123!"
     }
     ```
   - Setelah dapat response, copy `token` dan simpan ke environment variable

3. **Request Get Users**
   - Method: GET
   - URL: `{{base_url}}/admin/users`
   - Header: `Authorization: Bearer {{token}}`

---

## 🎯 Available Admin Endpoints

### Authentication
- ✅ POST `/api/v1/auth/login` - Login
- ✅ GET `/api/v1/auth/me` - Get current user

### User Management
- ✅ GET `/api/v1/admin/users` - List all users
- ✅ POST `/api/v1/admin/users` - Create user
- ✅ GET `/api/v1/admin/users/:id` - Get user
- ✅ PUT `/api/v1/admin/users/:id` - Update user
- ✅ DELETE `/api/v1/admin/users/:id` - Deactivate user
- ✅ PUT `/api/v1/admin/users/:id/password` - Change password

### Wallet Management
- ✅ GET `/api/v1/admin/wallets` - List all wallets
- ✅ GET `/api/v1/admin/wallets/:id` - Get wallet
- ✅ GET `/api/v1/admin/wallets/:id/transactions` - Wallet transactions
- ✅ POST `/api/v1/admin/wallet/adjustment` - Adjust points
- ✅ POST `/api/v1/admin/wallet/reset` - Reset wallet

### Transaction Monitoring
- ✅ GET `/api/v1/admin/transactions` - List all transactions

### Marketplace
- ✅ GET `/api/v1/admin/products` - List products
- ✅ POST `/api/v1/admin/products` - Create product
- ✅ GET `/api/v1/admin/products/:id` - Get product
- ✅ PUT `/api/v1/admin/products/:id` - Update product
- ✅ DELETE `/api/v1/admin/products/:id` - Delete product

---

## 🔑 Test Accounts

| Role | Email | Password | NIM/NIP |
|------|-------|----------|---------|
| Admin | admin@campus.edu | Password123! | ADM001 |
| Dosen | dosen1@campus.edu | Password123! | NIP001 |
| Mahasiswa | mahasiswa1@campus.edu | Password123! | 2023001 |

---

## ⚠️ Common Issues

### 1. "Unauthorized" Error
**Solution**: Token expired atau invalid. Login ulang untuk dapat token baru.

### 2. "Wallet not found"
**Solution**: Cek wallet ID yang benar dari endpoint GET /admin/wallets

### 3. "Email already exists"
**Solution**: Gunakan email yang berbeda saat create user

---

## 🛑 Stop Server
Tekan **Ctrl+C** di terminal untuk stop server

---

**Status**: 🟢 READY FOR TESTING  
**Server**: http://localhost:8080  
**Health**: http://localhost:8080/api/v1/health  

**Next Steps**: Test semua endpoint atau lanjut implementasi Dosen features
