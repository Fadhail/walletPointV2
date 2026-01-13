# ⚠️ Password Hashing Disabled - Testing Mode

## 🔓 Changes Made

Password hashing telah **dinonaktifkan** untuk memudahkan testing dan development.

### Modified Files:

1. **`backend/internal/auth/service.go`**
   - ✅ Login: Password comparison menggunakan plain text
   - ✅ Register: Password disimpan sebagai plain text
   - ❌ Bcrypt hashing disabled

2. **`backend/internal/user/service.go`**
   - ✅ Change Password: Password disimpan sebagai plain text
   - ❌ Bcrypt hashing disabled

3. **`database/03_seed_data.sql`**
   - ✅ Seed data menggunakan plain text passwords
   - Password: `Password123!` untuk semua user

4. **`database/04_update_passwords_plaintext.sql`** (NEW)
   - Script untuk update existing users ke plain text

---

## 📝 Current Password Storage

### All Test Accounts
Password untuk semua akun: **`Password123!`**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | Password123! |
| Dosen | dosen1@campus.edu | Password123! |
| Dosen | dosen2@campus.edu | Password123! |
| Mahasiswa | mahasiswa1@campus.edu | Password123! |
| Mahasiswa | mahasiswa2@campus.edu | Password123! |
| Mahasiswa | mahasiswa3@campus.edu | Password123! |

---

## 🔄 How to Update Existing Database

Jika Anda sudah punya database dengan bcrypt hashes, jalankan:

```bash
mysql -u root -p < database/04_update_passwords_plaintext.sql
```

Atau manual di MySQL:
```sql
USE walletpoint_db;
UPDATE users SET password_hash = 'Password123!';
```

---

## ✅ Testing Now Easier

### Before (with bcrypt):
```bash
# Password harus di-hash dulu, sulit untuk testing manual
```

### After (plain text):
```bash
# Login langsung dengan password yang mudah diingat
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campus.edu","password":"Password123!"}'

# Create user dengan password simple
curl -X POST http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","full_name":"Test","nim_nip":"999","role":"mahasiswa"}'
```

---

## 🔐 Security Notes

### ⚠️ WARNING - TESTING ONLY!

**DO NOT USE IN PRODUCTION!**

Perubahan ini hanya untuk:
- ✅ Development & testing
- ✅ Debugging
- ✅ Quick prototyping
- ✅ Demo purposes

**NEVER** deploy ke production dengan plain text passwords!

### How to Re-enable Hashing for Production:

1. **Revert `auth/service.go`**:
```go
// Login - use bcrypt
if err := utils.VerifyPassword(user.PasswordHash, password); err != nil {
    return nil, errors.New("invalid email or password")
}

// Register - hash password
hashedPassword, err := utils.HashPassword(req.Password)
if err != nil {
    return nil, errors.New("failed to hash password")
}
user.PasswordHash = hashedPassword
```

2. **Revert `user/service.go`**:
```go
// Change password - hash it
hashedPassword, err := utils.HashPassword(newPassword)
if err != nil {
    return errors.New("failed to hash password")
}
return s.repo.UpdatePassword(userID, hashedPassword)
```

3. **Update seed data** dengan bcrypt hashes

4. **Migrate existing passwords**:
```go
// Create migration script to hash all plain text passwords
```

---

## 📊 Impact

### What Works:
- ✅ Login dengan plain text password
- ✅ Create user dengan password simple
- ✅ Change password tanpa hashing
- ✅ Semua test accounts accessible
- ✅ Easy debugging

### What's Different:
- ❌ No password encryption
- ❌ Passwords visible in database
- ❌ Not secure for production
- ⚠️ Anyone with DB access can see passwords

---

## 🧪 Quick Test

```bash
# 1. Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campus.edu","password":"Password123!"}'

# 2. Create user with simple password
curl -X POST http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"simple","full_name":"New User","nim_nip":"12345","role":"mahasiswa"}'

# 3. Login with new user
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"simple"}'
```

---

## 📌 Remember

1. **Current Mode**: Testing/Development
2. **Password Storage**: Plain Text
3. **Security Level**: ⚠️ LOW
4. **Production Ready**: ❌ NO
5. **Easy Testing**: ✅ YES

---

**Status**: Password hashing DISABLED ⚠️  
**Mode**: Testing/Development Only  
**Date**: 2026-01-13  
**Action Required**: Re-enable hashing before production deployment!
