# Platform Wallet Point Gamifikasi Kampus - Backend Structure

## 📋 Table of Contents
1. [Project Structure](#project-structure)
2. [Architecture Pattern](#architecture-pattern)
3. [Coding Guidelines](#coding-guidelines)
4. [Module Examples](#module-examples)

---

## 📁 Project Structure

```
wallet-point-backend/
├── cmd/
│   └── server/
│       └── main.go                 # Application entry point
├── config/
│   ├── config.go                   # Configuration management
│   └── database.go                 # Database connection
├── internal/
│   ├── auth/                       # Authentication module
│   │   ├── handler.go              # HTTP handlers
│   │   ├── service.go              # Business logic
│   │   ├── repository.go           # Database operations
│   │   └── model.go                # Data models
│   ├── user/                       # User management module
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   ├── wallet/                     # Wallet module
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   ├── transaction/                # Transaction module
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   ├── mission/                    # Mission & Task module
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   ├── marketplace/                # Marketplace module
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   ├── external/                   # External integration module
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   └── audit/                      # Audit logging module
│       ├── handler.go
│       ├── service.go
│       ├── repository.go
│       └── model.go
├── middleware/
│   ├── auth.go                     # JWT authentication middleware
│   ├── role.go                     # Role-based access control
│   ├── logger.go                   # Request logging
│   └── cors.go                     # CORS configuration
├── routes/
│   └── routes.go                   # API route definitions
├── utils/
│   ├── jwt.go                      # JWT utilities
│   ├── response.go                 # Response formatting
│   ├── validator.go                # Input validation
│   └── password.go                 # Password hashing
├── database/
│   ├── 01_tables.sql               # Table definitions
│   ├── 02_triggers_procedures.sql  # Database logic
│   └── 03_seed_data.sql            # Initial data
├── docs/
│   ├── DATABASE_DESIGN.md          # Database documentation
│   ├── SYSTEM_FLOW.md              # System flow diagrams
│   └── API_DOCUMENTATION.md        # API reference
├── go.mod                          # Go module dependencies
├── go.sum                          # Dependency checksums
├── .env.example                    # Environment variables template
└── README.md                       # Project documentation
```

---

## 🏗️ Architecture Pattern

### Handler-Service-Repository Pattern

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│         Handler Layer           │
│  - Parse request                │
│  - Validate input               │
│  - Call service                 │
│  - Format response              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│         Service Layer           │
│  - Business logic               │
│  - Role validation              │
│  - Transaction coordination     │
│  - Call repository              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│       Repository Layer          │
│  - Database queries             │
│  - CRUD operations              │
│  - No business logic            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│   Database  │
└─────────────┘
```

---

## 📝 Coding Guidelines

### 1. Handler Layer (`handler.go`)

**Responsibilities**:
- Parse HTTP requests
- Validate input data
- Extract user context from JWT
- Call service layer
- Format and return HTTP responses

**Example**:
```go
package wallet

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "wallet-point/utils"
)

type WalletHandler struct {
    service *WalletService
}

func NewWalletHandler(service *WalletService) *WalletHandler {
    return &WalletHandler{service: service}
}

// GetBalance godoc
// @Summary Get wallet balance
// @Tags Wallet
// @Security BearerAuth
// @Produce json
// @Success 200 {object} utils.Response
// @Router /mahasiswa/wallet [get]
func (h *WalletHandler) GetBalance(c *gin.Context) {
    // Extract user from context (set by auth middleware)
    userID := c.GetUint("user_id")
    
    // Call service
    wallet, err := h.service.GetWalletByUserID(userID)
    if err != nil {
        utils.ErrorResponse(c, http.StatusNotFound, "Wallet not found", err)
        return
    }
    
    // Success response
    utils.SuccessResponse(c, http.StatusOK, "Wallet retrieved successfully", wallet)
}
```

### 2. Service Layer (`service.go`)

**Responsibilities**:
- Implement business logic
- Coordinate multiple repositories
- Handle transactions
- Role-based validation
- Error handling

**Example**:
```go
package wallet

import (
    "errors"
    "gorm.io/gorm"
)

type WalletService struct {
    repo               *WalletRepository
    transactionRepo    *TransactionRepository
    db                 *gorm.DB
}

func NewWalletService(repo *WalletRepository, txRepo *TransactionRepository, db *gorm.DB) *WalletService {
    return &WalletService{
        repo:            repo,
        transactionRepo: txRepo,
        db:              db,
    }
}

func (s *WalletService) GetWalletByUserID(userID uint) (*Wallet, error) {
    return s.repo.FindByUserID(userID)
}

func (s *WalletService) ProcessTransfer(senderID, receiverID uint, amount int, note string) error {
    // Start database transaction
    tx := s.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()
    
    // Get sender wallet with lock
    senderWallet, err := s.repo.FindByUserIDWithLock(tx, senderID)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Validate balance
    if senderWallet.Balance < amount {
        tx.Rollback()
        return errors.New("insufficient balance")
    }
    
    // Get receiver wallet
    receiverWallet, err := s.repo.FindByUserIDWithLock(tx, receiverID)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Create transfer record
    transfer := &Transfer{
        SenderWalletID:   senderWallet.ID,
        ReceiverWalletID: receiverWallet.ID,
        Amount:           amount,
        Note:             note,
        Status:           "success",
    }
    if err := s.repo.CreateTransfer(tx, transfer); err != nil {
        tx.Rollback()
        return err
    }
    
    // Debit sender
    if err := s.transactionRepo.CreateTransaction(tx, &WalletTransaction{
        WalletID:    senderWallet.ID,
        Type:        "transfer_out",
        Amount:      amount,
        Direction:   "debit",
        ReferenceID: transfer.ID,
        Status:      "success",
        CreatedBy:   "system",
    }); err != nil {
        tx.Rollback()
        return err
    }
    
    if err := s.repo.UpdateBalance(tx, senderWallet.ID, -amount); err != nil {
        tx.Rollback()
        return err
    }
    
    // Credit receiver
    if err := s.transactionRepo.CreateTransaction(tx, &WalletTransaction{
        WalletID:    receiverWallet.ID,
        Type:        "transfer_in",
        Amount:      amount,
        Direction:   "credit",
        ReferenceID: transfer.ID,
        Status:      "success",
        CreatedBy:   "system",
    }); err != nil {
        tx.Rollback()
        return err
    }
    
    if err := s.repo.UpdateBalance(tx, receiverWallet.ID, amount); err != nil {
        tx.Rollback()
        return err
    }
    
    // Commit transaction
    return tx.Commit().Error
}
```

### 3. Repository Layer (`repository.go`)

**Responsibilities**:
- Direct database operations
- CRUD methods
- Query construction
- NO business logic

**Example**:
```go
package wallet

import (
    "gorm.io/gorm"
)

type WalletRepository struct {
    db *gorm.DB
}

func NewWalletRepository(db *gorm.DB) *WalletRepository {
    return &WalletRepository{db: db}
}

func (r *WalletRepository) FindByUserID(userID uint) (*Wallet, error) {
    var wallet Wallet
    err := r.db.Where("user_id = ?", userID).First(&wallet).Error
    return &wallet, err
}

func (r *WalletRepository) FindByUserIDWithLock(tx *gorm.DB, userID uint) (*Wallet, error) {
    var wallet Wallet
    err := tx.Set("gorm:query_option", "FOR UPDATE").
        Where("user_id = ?", userID).
        First(&wallet).Error
    return &wallet, err
}

func (r *WalletRepository) UpdateBalance(tx *gorm.DB, walletID uint, delta int) error {
    return tx.Model(&Wallet{}).
        Where("id = ?", walletID).
        Update("balance", gorm.Expr("balance + ?", delta)).
        Error
}

func (r *WalletRepository) CreateTransfer(tx *gorm.DB, transfer *Transfer) error {
    return tx.Create(transfer).Error
}
```

### 4. Model Layer (`model.go`)

**Responsibilities**:
- Define data structures
- Database table mappings
- Validation tags

**Example**:
```go
package wallet

import (
    "time"
)

type Wallet struct {
    ID         uint      `json:"id" gorm:"primaryKey"`
    UserID     uint      `json:"user_id" gorm:"uniqueIndex;not null"`
    Balance    int       `json:"balance" gorm:"default:0;not null"`
    LastSyncAt *time.Time `json:"last_sync_at"`
    CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
}

type WalletTransaction struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    WalletID    uint      `json:"wallet_id" gorm:"not null"`
    Type        string    `json:"type" gorm:"type:enum('mission','task','transfer_in','transfer_out','marketplace','external','adjustment','topup');not null"`
    Amount      int       `json:"amount" gorm:"not null"`
    Direction   string    `json:"direction" gorm:"type:enum('credit','debit');not null"`
    ReferenceID uint      `json:"reference_id"`
    Status      string    `json:"status" gorm:"type:enum('success','failed','pending');default:'success'"`
    Description string    `json:"description" gorm:"size:500"`
    CreatedBy   string    `json:"created_by" gorm:"type:enum('system','admin','dosen');default:'system'"`
    CreatedAt   time.Time `json:"created_at"`
}

type Transfer struct {
    ID               uint      `json:"id" gorm:"primaryKey"`
    SenderWalletID   uint      `json:"sender_wallet_id" gorm:"not null"`
    ReceiverWalletID uint      `json:"receiver_wallet_id" gorm:"not null"`
    Amount           int       `json:"amount" gorm:"not null"`
    Note             string    `json:"note" gorm:"size:255"`
    Status           string    `json:"status" gorm:"type:enum('success','failed');default:'success'"`
    CreatedAt        time.Time `json:"created_at"`
}
```

---

## 🔧 Main Application (`cmd/server/main.go`)

```go
package main

import (
    "log"
    "wallet-point/config"
    "wallet-point/routes"
    "github.com/gin-gonic/gin"
)

func main() {
    // Load configuration
    cfg := config.LoadConfig()
    
    // Connect to database
    db := config.ConnectDB(cfg)
    
    // Initialize Gin
    r := gin.Default()
    
    // Setup routes
    routes.SetupRoutes(r, db)
    
    // Start server
    log.Printf("Server starting on %s", cfg.ServerAddress)
    if err := r.Run(cfg.ServerAddress); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}
```

---

## 🛣️ Routes (`routes/routes.go`)

```go
package routes

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "wallet-point/internal/auth"
    "wallet-point/internal/wallet"
    "wallet-point/middleware"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
    // Middleware
    r.Use(middleware.CORS())
    r.Use(middleware.Logger())
    
    api := r.Group("/api/v1")
    
    // Initialize repositories
    authRepo := auth.NewAuthRepository(db)
    walletRepo := wallet.NewWalletRepository(db)
    
    // Initialize services
    authService := auth.NewAuthService(authRepo)
    walletService := wallet.NewWalletService(walletRepo, db)
    
    // Initialize handlers
    authHandler := auth.NewAuthHandler(authService)
    walletHandler := wallet.NewWalletHandler(walletService)
    
    // Public routes
    authGroup := api.Group("/auth")
    {
        authGroup.POST("/login", authHandler.Login)
        authGroup.POST("/register", authHandler.Register)
    }
    
    // Protected routes - Mahasiswa
    mahasiswaGroup := api.Group("/mahasiswa")
    mahasiswaGroup.Use(middleware.AuthMiddleware())
    mahasiswaGroup.Use(middleware.RoleMiddleware("mahasiswa"))
    {
        mahasiswaGroup.GET("/wallet", walletHandler.GetBalance)
        mahasiswaGroup.GET("/wallet/transactions", walletHandler.GetTransactions)
        mahasiswaGroup.POST("/transfer", walletHandler.Transfer)
    }
    
    // Protected routes - Dosen
    dosenGroup := api.Group("/dosen")
    dosenGroup.Use(middleware.AuthMiddleware())
    dosenGroup.Use(middleware.RoleMiddleware("dosen"))
    {
        // Dosen routes here
    }
    
    // Protected routes - Admin
    adminGroup := api.Group("/admin")
    adminGroup.Use(middleware.AuthMiddleware())
    adminGroup.Use(middleware.RoleMiddleware("admin"))
    {
        // Admin routes here
    }
}
```

---

## 🔐 Middleware Examples

### Auth Middleware (`middleware/auth.go`)
```go
package middleware

import (
    "net/http"
    "strings"
    "github.com/gin-gonic/gin"
    "wallet-point/utils"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }
        
        tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
        claims, err := utils.ValidateJWT(tokenString)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        c.Set("user_id", claims.UserID)
        c.Set("role", claims.Role)
        c.Next()
    }
}
```

### Role Middleware (`middleware/role.go`)
```go
package middleware

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        role := c.GetString("role")
        
        for _, allowedRole := range allowedRoles {
            if role == allowedRole {
                c.Next()
                return
            }
        }
        
        c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
        c.Abort()
    }
}
```

---

**Version**: 1.0  
**Last Updated**: 2026-01-13
