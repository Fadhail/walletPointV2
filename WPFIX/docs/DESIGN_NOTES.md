# Platform Wallet Point Gamifikasi Kampus - Design Notes

## 🎯 Key Design Principles

### 1. **Transaction Immutability**
✅ **DO**:
- Always create new records in `wallet_transactions`
- Use transactions for all point movements
- Log every change with proper reference

❌ **DON'T**:
- Update or delete transaction records
- Modify wallet balance directly without creating transaction
- Skip transaction creation for any point movement

**Example**:
```go
// ❌ WRONG
db.Model(&Wallet{}).Where("id = ?", walletID).Update("balance", newBalance)

// ✅ CORRECT
tx := db.Begin()
// 1. Create transaction record
tx.Create(&WalletTransaction{...})
// 2. Update balance via expression
tx.Model(&Wallet{}).Where("id = ?", walletID).Update("balance", gorm.Expr("balance + ?", amount))
tx.Commit()
```

---

### 2. **Wallet Balance as Cache**
The `wallets.balance` field is a **cached aggregate** value. The source of truth is `wallet_transactions`.

**Recalculation formula**:
```sql
SELECT SUM(
  CASE 
    WHEN direction = 'credit' THEN amount
    WHEN direction = 'debit' THEN -amount
  END
) as true_balance
FROM wallet_transactions
WHERE wallet_id = ? AND status = 'success';
```

**When to recalculate**:
- Suspected data inconsistency
- Manual adjustment by admin
- Data migration or recovery

---

### 3. **Atomic Transactions**
All operations involving multiple tables MUST be wrapped in database transactions.

**Critical operations requiring atomicity**:
1. **Transfer**: 2 wallet updates + 2 transaction records + 1 transfer record
2. **Marketplace purchase**: 1 wallet update + 1 stock update + 2 transaction records
3. **Submission approval**: 1 wallet update + 1 submission update + 1 transaction record
4. **External sync**: 1 wallet update + 1 sync log + 1 transaction record

**Pattern**:
```go
tx := db.Begin()
defer func() {
    if r := recover(); r != nil {
        tx.Rollback()
    }
}()

// Operation 1
if err := tx.Create(...); err != nil {
    tx.Rollback()
    return err
}

// Operation 2
if err := tx.Update(...); err != nil {
    tx.Rollback()
    return err
}

// Commit only if all succeed
return tx.Commit().Error
```

---

### 4. **Role-Based Access Control**
Access control is enforced at the **service layer**, not just middleware.

**Access matrix**:

| Feature | Admin | Dosen | Mahasiswa |
|---------|-------|-------|-----------|
| View all wallets | ✅ | ❌ | ❌ |
| View student wallet | ✅ | ✅ (read-only) | ✅ (own only) |
| Create mission | ❌ | ✅ | ❌ |
| Submit mission | ❌ | ❌ | ✅ |
| Validate submission | ❌ | ✅ | ❌ |
| Transfer points | ❌ | ❌ | ✅ (peer-to-peer) |
| Adjust points (manual) | ✅ | ❌ | ❌ |
| Manage marketplace | ✅ | ❌ | ❌ |
| Purchase from marketplace | ❌ | ❌ | ✅ |
| Configure external API | ✅ | ❌ | ❌ |

---

### 5. **Marketplace Synchronization**
Prevent overselling with proper locking.

```go
// Lock product record
tx.Set("gorm:query_option", "FOR UPDATE").
   Where("id = ?", productID).
   First(&product)

// Validate stock
if product.Stock < quantity {
    return errors.New("insufficient stock")
}

// Deduct stock
tx.Model(&Product{}).
   Where("id = ?", productID).
   Update("stock", gorm.Expr("stock - ?", quantity))
```

---

### 6. **External Integration (Credit-Only)**
External points are **credit-only** and **read-only** for mahasiswa.

**Sync flow**:
1. Cron job or webhook triggers sync
2. Call external API
3. Validate response
4. Check for duplicate (`external_transaction_id`)
5. Create `external_point_logs` record
6. Credit wallet via transaction
7. Update `last_sync_at`

**Duplicate prevention**:
```sql
-- Unique constraint prevents duplicate sync
ALTER TABLE external_point_logs 
ADD UNIQUE KEY uk_external_transaction_id (external_transaction_id);
```

---

### 7. **Audit Trail**
All sensitive operations must be logged in `audit_logs`.

**What to log**:
- User login/logout
- Point adjustments (admin)
- Submission approvals/rejections
- Wallet resets
- Product CRUD
- External API configurations

**Example**:
```go
auditLog := &AuditLog{
    UserID:    userID,
    Action:    "APPROVE_MISSION",
    TableName: "mission_submissions",
    RecordID:  submissionID,
    OldValue:  oldJSON,
    NewValue:  newJSON,
    IPAddress: c.ClientIP(),
    UserAgent: c.GetHeader("User-Agent"),
}
db.Create(auditLog)
```

---

### 8. **Data Integrity Constraints**

#### Foreign Key Constraints
```sql
-- Cascade delete: When user deleted, wallet also deleted
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- Set null: When user deleted, audit log remains but user_id becomes NULL
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
```

#### Check Constraints
```sql
-- Prevent negative balance
CONSTRAINT chk_balance_positive CHECK (balance >= 0)

-- Prevent zero or negative amounts
CONSTRAINT chk_amount_positive CHECK (amount > 0)

-- Prevent self-transfer
CONSTRAINT chk_different_wallets CHECK (sender_wallet_id != receiver_wallet_id)
```

---

### 9. **Error Handling Strategy**

**Error categories**:
1. **Validation errors** (400): Invalid input, business rule violation
2. **Authentication errors** (401): Missing or invalid token
3. **Authorization errors** (403): Insufficient permissions
4. **Not found errors** (404): Resource doesn't exist
5. **Conflict errors** (409): Duplicate submission, out of stock
6. **Server errors** (500): Database failure, external API failure

**Response format**:
```json
{
  "success": false,
  "message": "Insufficient balance",
  "errors": {
    "amount": "Your balance (100 points) is less than transfer amount (150 points)"
  }
}
```

---

### 10. **Performance Optimization**

#### Indexes
```sql
-- Composite index for common queries
CREATE INDEX idx_wt_wallet_type_status 
ON wallet_transactions(wallet_id, type, status);

-- Index for date range queries
CREATE INDEX idx_wt_created_at 
ON wallet_transactions(created_at DESC);

-- Index for student submissions
CREATE INDEX idx_ms_student_status 
ON mission_submissions(student_id, status);
```

#### Query optimization
```go
// ❌ N+1 query problem
for _, submission := range submissions {
    student := GetStudent(submission.StudentID)
    mission := GetMission(submission.MissionID)
}

// ✅ Preload related data
db.Preload("Student").Preload("Mission").Find(&submissions)
```

---

## 🔒 Security Considerations

### 1. Password Security
```go
// Use bcrypt with cost factor 10-12
hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

// Verify password
err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(inputPassword))
```

### 2. JWT Token
```go
// Include essential claims only
claims := jwt.MapClaims{
    "user_id": user.ID,
    "role":    user.Role,
    "exp":     time.Now().Add(time.Hour * 24).Unix(), // 24 hour expiry
}

// Use strong secret key (min 32 characters)
token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
tokenString, _ := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
```

### 3. Input Validation
```go
type TransferRequest struct {
    ReceiverNIM string `json:"receiver_nim" binding:"required,min=5,max=50"`
    Amount      int    `json:"amount" binding:"required,gt=0"`
    Note        string `json:"note" binding:"max=255"`
}

// Validate in handler
var req TransferRequest
if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(400, gin.H{"error": err.Error()})
    return
}
```

### 4. SQL Injection Prevention
```go
// ❌ Vulnerable to SQL injection
query := fmt.Sprintf("SELECT * FROM users WHERE email = '%s'", email)

// ✅ Use parameterized queries
db.Where("email = ?", email).First(&user)
```

---

## 📊 Database Migration Strategy

### Version control migrations
```
database/
├── migrations/
│   ├── 001_create_users_table.up.sql
│   ├── 001_create_users_table.down.sql
│   ├── 002_create_wallets_table.up.sql
│   ├── 002_create_wallets_table.down.sql
│   └── ...
```

### Migration tools
- **golang-migrate**: CLI tool for database migrations
- **GORM AutoMigrate**: For development only, not production

---

## 🧪 Testing Strategy

### 1. Unit Tests
Test individual functions in isolation.
```go
func TestProcessTransfer_InsufficientBalance(t *testing.T) {
    // Setup
    service := setupTestService()
    
    // Execute
    err := service.ProcessTransfer(senderID, receiverID, 1000, "test")
    
    // Assert
    assert.Error(t, err)
    assert.Equal(t, "insufficient balance", err.Error())
}
```

### 2. Integration Tests
Test complete workflows with database.
```go
func TestTransferFlow_EndToEnd(t *testing.T) {
    // Setup test database
    db := setupTestDB()
    
    // Create test users and wallets
    sender := createTestUser(db, "mahasiswa")
    receiver := createTestUser(db, "mahasiswa")
    
    // Credit sender wallet
    creditWallet(db, sender.WalletID, 500)
    
    // Execute transfer
    err := processTransfer(db, sender.ID, receiver.ID, 100, "test")
    
    // Assert
    assert.NoError(t, err)
    assert.Equal(t, 400, getBalance(db, sender.WalletID))
    assert.Equal(t, 100, getBalance(db, receiver.WalletID))
}
```

---

## 📝 Documentation Standards

### Code comments
```go
// ProcessTransfer transfers points from one wallet to another.
// It validates the sender's balance, creates transaction records,
// and updates both wallet balances atomically.
//
// Returns error if:
// - Sender wallet not found
// - Receiver wallet not found
// - Insufficient balance
// - Database transaction fails
func (s *WalletService) ProcessTransfer(senderID, receiverID uint, amount int, note string) error {
    // Implementation
}
```

### API documentation (Swagger)
```go
// @Summary Transfer points to another student
// @Description Transfer points from authenticated user to another student
// @Tags Wallet
// @Accept json
// @Produce json
// @Param request body TransferRequest true "Transfer details"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /mahasiswa/transfer [post]
// @Security BearerAuth
func (h *WalletHandler) Transfer(c *gin.Context) {
    // Implementation
}
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured (.env)
- [ ] Database migrations applied
- [ ] Seed data inserted
- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] CORS configuration is correct
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Health check endpoint working
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Backup strategy in place
- [ ] SSL/TLS certificate installed

---

**Version**: 1.0  
**Last Updated**: 2026-01-13
