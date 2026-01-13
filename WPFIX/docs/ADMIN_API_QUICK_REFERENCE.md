# Platform Wallet Point - Admin API Reference Quick Guide

## 🔐 Authentication

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@campus.edu",
  "password": "Password123!"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@campus.edu",
      "full_name": "System Administrator",
      "nim_nip": "ADM001",
      "role": "admin",
      "status": "active"
    }
  }
}
```

**Use the token in all subsequent requests:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 👥 User Management

### 1. List All Users
```http
GET /api/v1/admin/users?role=mahasiswa&status=active&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `role` (optional): admin | dosen | mahasiswa
- `status` (optional): active | inactive | suspended
- `page` (default: 1)
- `limit` (default: 20)

### 2. Get User by ID
```http
GET /api/v1/admin/users/1
Authorization: Bearer {token}
```

### 3. Create New User
```http
POST /api/v1/admin/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "student@campus.edu",
  "password": "Password123!",
  "full_name": "John Doe",
  "nim_nip": "2024001",
  "role": "mahasiswa"
}
```

### 4. Update User
```http
PUT /api/v1/admin/users/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "John Updated Doe",
  "status": "active",
  "email": "newemail@campus.edu"
}
```

### 5. Deactivate User
```http
DELETE /api/v1/admin/users/1
Authorization: Bearer {token}
```

### 6. Change User Password
```http
PUT /api/v1/admin/users/1/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "new_password": "NewPassword123!"
}
```

---

## 💰 Wallet Management

### 1. List All Wallets
```http
GET /api/v1/admin/wallets
Authorization: Bearer {token}
```

**Response shows all wallets sorted by balance (highest first)**

### 2. Get Wallet by ID
```http
GET /api/v1/admin/wallets/1
Authorization: Bearer {token}
```

### 3. Get Wallet Transactions
```http
GET /api/v1/admin/wallets/1/transactions?limit=50
Authorization: Bearer {token}
```

### 4. Adjust Points (Manual)
```http
POST /api/v1/admin/wallet/adjustment
Authorization: Bearer {token}
Content-Type: application/json

{
  "wallet_id": 1,
  "amount": 100,
  "direction": "credit",
  "description": "Bonus for excellent performance"
}
```

**Direction:**
- `credit`: Add points
- `debit`: Deduct points

### 5. Reset Wallet (Emergency)
```http
POST /api/v1/admin/wallet/reset
Authorization: Bearer {token}
Content-Type: application/json

{
  "wallet_id": 1,
  "new_balance": 0,
  "reason": "Account reset requested by user"
}
```

---

## 📊 Transaction Monitoring

### List All Transactions
```http
GET /api/v1/admin/transactions?type=transfer_in&status=success&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` (optional): mission | task | transfer_in | transfer_out | marketplace | external | adjustment | topup
- `status` (optional): success | failed | pending
- `direction` (optional): credit | debit
- `from_date` (optional): YYYY-MM-DD
- `to_date` (optional): YYYY-MM-DD
- `page` (default: 1)
- `limit` (default: 20)

---

## 🛒 Marketplace Management

### 1. List All Products
```http
GET /api/v1/admin/products?status=active&page=1&limit=20
Authorization: Bearer {token}
```

### 2. Get Product by ID
```http
GET /api/v1/admin/products/1
Authorization: Bearer {token}
```

### 3. Create Product
```http
POST /api/v1/admin/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Campus Hoodie",
  "description": "Official campus hoodie - Navy Blue",
  "price": 150,
  "stock": 50,
  "image_url": "https://example.com/hoodie.jpg"
}
```

### 4. Update Product
```http
PUT /api/v1/admin/products/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 140,
  "stock": 45,
  "status": "active"
}
```

### 5. Delete Product
```http
DELETE /api/v1/admin/products/1
Authorization: Bearer {token}
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    // Error details
  }
}
```

---

## ⚡ HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate entry |
| 500 | Internal Server Error |

---

## 🧪 Testing with Postman/Insomnia

### 1. Create Environment Variable
```
base_url = http://localhost:8080/api/v1
token = <paste token after login>
```

### 2. Login Request
```
POST {{base_url}}/auth/login
Body: {"email": "admin@campus.edu", "password": "Password123!"}
```

### 3. Save token from response
Copy the `token` value from response and save it to environment variable.

### 4. Use in requests
```
GET {{base_url}}/admin/users
Header: Authorization: Bearer {{token}}
```

---

## 🔄 Common Workflows

### Add New Student & Give Points
```bash
# 1. Create student
POST /api/v1/admin/users
{
  "email": "student@campus.edu",
  "password": "Password123!",
  "full_name": "New Student",
  "nim_nip": "2024001",
  "role": "mahasiswa"
}

# 2. Get student's wallet ID from response or from users list
GET /api/v1/admin/users?nim_nip=2024001

# 3. Give points
POST /api/v1/admin/wallet/adjustment
{
  "wallet_id": <student_wallet_id>,
  "amount": 500,
  "direction": "credit",
  "description": "Welcome bonus"
}
```

### Monitor Today's Transactions
```bash
GET /api/v1/admin/transactions?from_date=2026-01-13&to_date=2026-01-13
```

### Find Students with Low Balance
```bash
# Get all wallets (sorted by balance)
GET /api/v1/admin/wallets
# Check bottom of the list
```

---

## 📱 Pagination Example

Request:
```http
GET /api/v1/admin/users?page=2&limit=10
```

Response:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 150,
    "page": 2,
    "limit": 10,
    "total_pages": 15
  }
}
```

**Navigation:**
- First page: `page=1`
- Next page: `page=3`
- Last page: `page=15`

---

## 🔒 Security Notes

1. **Always use HTTPS in production**
2. **Never commit .env file**
3. **Rotate JWT_SECRET regularly**
4. **Change default passwords**
5. **Validate all inputs**
6. **Monitor suspicious activities**
7. **Keep audit logs enabled**

---

**Quick Reference Version**: 1.0  
**Last Updated**: 2026-01-13  
**Base URL**: `http://localhost:8080/api/v1`
