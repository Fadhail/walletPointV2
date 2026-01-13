# Platform Wallet Point Gamifikasi Kampus - API Documentation

## 📋 Table of Contents
1. [API Gateway Configuration](#api-gateway-configuration)
2. [Authentication APIs](#authentication-apis)
3. [Admin APIs](#admin-apis)
4. [Dosen APIs](#dosen-apis)
5. [Mahasiswa APIs](#mahasiswa-apis)

---

## 🌐 API Gateway Configuration

### Base URL
```
Development: http://localhost:8080/api/v1
Production: https://walletpoint.campus.edu/api/v1
```

### Authentication
All protected endpoints require JWT token:
```http
Authorization: Bearer {jwt_token}
```

### Rate Limiting (Optional)
```
- 100 requests per minute per IP
- 1000 requests per hour per user
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "errors": null
}
```

---

## 🔐 Authentication APIs

### POST /auth/register
Register new user (Admin only can create users)

**Request**:
```json
{
  "email": "student@campus.edu",
  "password": "Password123!",
  "full_name": "John Doe",
  "nim_nip": "2023001",
  "role": "mahasiswa"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "email": "student@campus.edu",
    "role": "mahasiswa"
  }
}
```

### POST /auth/login
User login

**Request**:
```json
{
  "email": "student@campus.edu",
  "password": "Password123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "student@campus.edu",
      "full_name": "John Doe",
      "role": "mahasiswa",
      "wallet_id": 1,
      "balance": 500
    }
  }
}
```

### POST /auth/logout
User logout

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🛡️ Admin APIs

### User Management

#### GET /admin/users
List all users

**Query Parameters**:
- `role` (optional): Filter by role
- `status` (optional): Filter by status
- `page` (default: 1)
- `limit` (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "student@campus.edu",
        "full_name": "John Doe",
        "nim_nip": "2023001",
        "role": "mahasiswa",
        "status": "active",
        "balance": 500
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "total_pages": 5
    }
  }
}
```

#### PUT /admin/users/{user_id}
Update user

**Request**:
```json
{
  "full_name": "John Updated Doe",
  "status": "active"
}
```

#### DELETE /admin/users/{user_id}
Deactivate user (soft delete)

#### POST /admin/wallet/reset
Reset wallet balance (emergency use only)

**Request**:
```json
{
  "wallet_id": 1,
  "new_balance": 0,
  "reason": "Account reset requested by user"
}
```

### Product Management

#### GET /admin/products
List all products

#### POST /admin/products
Create new product

**Request**:
```json
{
  "name": "Campus T-Shirt",
  "description": "Official campus t-shirt",
  "price": 100,
  "stock": 50,
  "image_url": "https://storage.campus.edu/products/tshirt.jpg",
  "status": "active"
}
```

#### PUT /admin/products/{product_id}
Update product

#### DELETE /admin/products/{product_id}
Delete product

### Point Adjustment

#### POST /admin/wallet/adjustment
Manual point adjustment

**Request**:
```json
{
  "wallet_id": 1,
  "amount": 100,
  "direction": "credit",
  "description": "Compensation for system error"
}
```

### Monitoring

#### GET /admin/transactions
View all transactions

**Query Parameters**:
- `type` (optional)
- `status` (optional)
- `from_date` (optional)
- `to_date` (optional)
- `page`, `limit`

#### GET /admin/audit-logs
View audit logs

**Query Parameters**:
- `user_id` (optional)
- `action` (optional)
- `table_name` (optional)
- `from_date`, `to_date`
- `page`, `limit`

---

## 🎓 Dosen APIs

### Mission Management

#### GET /dosen/missions
List missions created by authenticated dosen

**Response**:
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": 1,
        "title": "Complete Lab Report",
        "description": "Submit physics lab report",
        "points_reward": 100,
        "deadline": "2026-01-20T23:59:59Z",
        "status": "active",
        "total_submissions": 25,
        "pending_submissions": 10
      }
    ]
  }
}
```

#### POST /dosen/missions
Create new mission

**Request**:
```json
{
  "title": "Complete Lab Report",
  "description": "Submit physics lab report",
  "points_reward": 100,
  "deadline": "2026-01-20T23:59:59Z",
  "status": "active"
}
```

#### PUT /dosen/missions/{mission_id}
Update mission

#### DELETE /dosen/missions/{mission_id}
Delete mission

### Task Management

Similar endpoints for tasks:
- GET /dosen/tasks
- POST /dosen/tasks
- PUT /dosen/tasks/{task_id}
- DELETE /dosen/tasks/{task_id}

### Submission Validation

#### GET /dosen/submissions
List all submissions for validation

**Query Parameters**:
- `type`: "mission" or "task"
- `status`: "pending", "approved", "rejected"
- `mission_id` or `task_id` (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": 1,
        "mission_id": 1,
        "mission_title": "Complete Lab Report",
        "student_name": "John Doe",
        "student_nim": "2023001",
        "submission_content": "I have completed...",
        "file_url": "https://storage.campus.edu/submissions/lab1.pdf",
        "status": "pending",
        "submitted_at": "2026-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /dosen/submissions/{submission_id}/validate
Validate submission

**Request**:
```json
{
  "action": "approve",
  "validation_note": "Great work! Well done."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Submission approved successfully",
  "data": {
    "submission_id": 1,
    "status": "approved",
    "points_awarded": 100,
    "wallet_transaction_id": 123
  }
}
```

### Student Monitoring

#### GET /dosen/students/{student_id}/wallet
View student wallet (read-only)

**Response**:
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "full_name": "John Doe",
      "nim": "2023001",
      "balance": 500
    },
    "transactions": [
      {
        "id": 1,
        "type": "mission",
        "amount": 100,
        "direction": "credit",
        "description": "Mission: Complete Lab Report",
        "created_at": "2026-01-15T11:00:00Z"
      }
    ]
  }
}
```

#### POST /dosen/credit-points
Give points directly to student

**Request**:
```json
{
  "student_id": 1,
  "amount": 50,
  "description": "Excellent participation in class"
}
```

---

## 🎒 Mahasiswa APIs

### Wallet

#### GET /mahasiswa/wallet
View own wallet balance and summary

**Response**:
```json
{
  "success": true,
  "data": {
    "wallet_id": 1,
    "balance": 500,
    "total_earned": 800,
    "total_spent": 300,
    "last_sync_at": "2026-01-13T15:00:00Z"
  }
}
```

#### GET /mahasiswa/wallet/transactions
View transaction history

**Query Parameters**:
- `type` (optional)
- `from_date`, `to_date`
- `page`, `limit`

**Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "type": "mission",
        "amount": 100,
        "direction": "credit",
        "description": "Mission completed: Lab Report",
        "status": "success",
        "created_at": "2026-01-15T11:00:00Z"
      },
      {
        "id": 2,
        "type": "transfer_out",
        "amount": 50,
        "direction": "debit",
        "description": "Transfer to Bob Williams",
        "status": "success",
        "created_at": "2026-01-14T09:30:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20
    }
  }
}
```

### Missions & Tasks

#### GET /mahasiswa/missions
List available missions

**Query Parameters**:
- `status`: "active", "expired"

**Response**:
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": 1,
        "title": "Complete Lab Report",
        "description": "Submit physics lab report",
        "points_reward": 100,
        "deadline": "2026-01-20T23:59:59Z",
        "creator_name": "Dr. John Doe",
        "is_submitted": false,
        "submission_status": null
      }
    ]
  }
}
```

#### POST /mahasiswa/missions/{mission_id}/submit
Submit mission

**Request** (multipart/form-data):
```
submission_content: "I have completed the lab report..."
file: [uploaded file]
```

**Response**:
```json
{
  "success": true,
  "message": "Submission successful",
  "data": {
    "submission_id": 1,
    "status": "pending"
  }
}
```

#### GET /mahasiswa/tasks
List available tasks (similar to missions)

#### POST /mahasiswa/tasks/{task_id}/submit
Submit task (similar to missions)

### Transfer

#### POST /mahasiswa/transfer
Transfer points to another student

**Request**:
```json
{
  "receiver_nim": "2023002",
  "amount": 50,
  "note": "Payment for group project"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transfer_id": 1,
    "sender_balance": 450,
    "receiver_nim": "2023002",
    "amount": 50
  }
}
```

#### GET /mahasiswa/transfers
View transfer history

### Marketplace

#### GET /mahasiswa/marketplace/products
List available products

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Campus T-Shirt",
        "description": "Official campus t-shirt",
        "price": 100,
        "stock": 50,
        "image_url": "https://storage.campus.edu/products/tshirt.jpg",
        "status": "active"
      }
    ]
  }
}
```

#### POST /mahasiswa/marketplace/purchase
Purchase product

**Request**:
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response**:
```json
{
  "success": true,
  "message": "Purchase successful",
  "data": {
    "transaction_id": 1,
    "product_name": "Campus T-Shirt",
    "quantity": 2,
    "total_amount": 200,
    "new_balance": 300
  }
}
```

#### GET /mahasiswa/marketplace/purchases
View purchase history

### External Points

#### GET /mahasiswa/external/sources
List available external sources

#### POST /mahasiswa/external/sync
Trigger manual sync (if allowed)

**Request**:
```json
{
  "source_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sync completed",
  "data": {
    "new_points": 150,
    "total_synced": 3,
    "last_sync_at": "2026-01-13T16:00:00Z"
  }
}
```

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "amount": "Amount must be positive",
    "receiver_nim": "Receiver not found"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

**Version**: 1.0  
**Last Updated**: 2026-01-13
