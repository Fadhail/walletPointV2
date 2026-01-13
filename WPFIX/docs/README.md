# Platform Wallet Point Gamifikasi Kampus

## 📖 Overview
Platform Wallet Point Gamifikasi Kampus adalah sistem manajemen poin digital terintegrasi untuk lingkungan kampus. Sistem ini memungkinkan mahasiswa mendapatkan poin melalui misi dan tugas akademik, melakukan transfer antar mahasiswa, dan menukarkan poin di marketplace yang dikelola admin.

## 🎯 Key Features

### Role-Based System
- **Admin**: Manajemen user, produk marketplace, adjustment poin, monitoring
- **Dosen**: Membuat misi/tugas, validasi submission, monitoring mahasiswa
- **Mahasiswa**: Submit misi/tugas, transfer poin, marketplace, sync external points

### Core Functionalities
1. **Wallet Management**: Sistem e-wallet dengan transaksi immutable
2. **Mission & Task System**: Gamifikasi akademik dengan reward points
3. **Peer-to-Peer Transfer**: Transfer poin antar mahasiswa
4. **Marketplace**: Toko produk dengan pembayaran menggunakan poin
5. **External Integration**: Sinkronisasi poin dari aplikasi eksternal

## 🏗️ Architecture

### Technology Stack
- **Backend**: Golang (Gin framework)
- **Database**: MySQL 8.0+
- **Frontend**: Cordova (Android/iOS)
- **Authentication**: JWT-based stateless auth

### Design Patterns
- **Handler-Service-Repository**: Clean architecture pattern
- **Atomic Transactions**: Database-level transaction guarantees
- **Immutable Ledger**: Transaction records never modified
- **Cached Aggregates**: Wallet balance as computed cache

## 📁 Project Structure

```
WPFIX/
├── database/
│   ├── 01_tables.sql              # Table definitions
│   ├── 02_triggers_procedures.sql # Database logic
│   └── 03_seed_data.sql           # Initial data
├── docs/
│   ├── DATABASE_DESIGN.md         # ERD & schema documentation
│   ├── SYSTEM_FLOW.md             # Flow diagrams & processes
│   ├── API_DOCUMENTATION.md       # REST API reference
│   ├── BACKEND_STRUCTURE.md       # Backend architecture guide
│   └── DESIGN_NOTES.md            # Design principles & best practices
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- MySQL 8.0+
- Node.js 18+ (for Cordova)

### Database Setup
```bash
# 1. Create database and run migrations
mysql -u root -p < database/01_tables.sql
mysql -u root -p < database/02_triggers_procedures.sql
mysql -u root -p < database/03_seed_data.sql
```

### Backend Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd WPFIX

# 2. Install dependencies
go mod download

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Run application
go run cmd/server/main.go
```

### Frontend Setup (Cordova)
```bash
# 1. Install Cordova
npm install -g cordova

# 2. Navigate to frontend directory
cd frontend

# 3. Add platforms
cordova platform add android
cordova platform add ios

# 4. Build
cordova build android
```

## 📚 Documentation

### Database Design
Lihat [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) untuk:
- ERD lengkap dengan relasi antar tabel
- Definisi tabel dengan constraints
- Design principles (immutability, atomicity, etc.)

### System Flow
Lihat [`docs/SYSTEM_FLOW.md`](docs/SYSTEM_FLOW.md) untuk:
- Sequence diagrams untuk setiap flow
- Activity diagrams sistem
- Detailed process descriptions

### API Documentation
Lihat [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) untuk:
- Endpoint reference lengkap
- Request/response examples
- Authentication & authorization

### Backend Structure
Lihat [`docs/BACKEND_STRUCTURE.md`](docs/BACKEND_STRUCTURE.md) untuk:
- Project structure
- Architecture patterns
- Code examples (handler, service, repository)

### Design Notes
Lihat [`docs/DESIGN_NOTES.md`](docs/DESIGN_NOTES.md) untuk:
- Key design principles
- Security considerations
- Performance optimization
- Testing strategy

## 🔑 Default Credentials

Setelah menjalankan seed data, gunakan credentials berikut untuk testing:

| Role | Email | Password | NIM/NIP |
|------|-------|----------|---------|
| Admin | admin@campus.edu | Password123! | ADM001 |
| Dosen | dosen1@campus.edu | Password123! | NIP001 |
| Mahasiswa | mahasiswa1@campus.edu | Password123! | 2023001 |

⚠️ **PENTING**: Ganti password default di production!

## 🗄️ Database Schema Highlights

### Core Tables (13 Total)
1. `users` - User accounts with RBAC
2. `wallets` - User wallet balances (cached)
3. `wallet_transactions` - **Immutable** transaction log
4. `missions` & `tasks` - Gamification content
5. `mission_submissions` & `task_submissions` - Student work
6. `transfers` - P2P point transfers
7. `products` & `marketplace_transactions` - Marketplace
8. `external_sources` & `external_point_logs` - External integration
9. `audit_logs` - System audit trail

### Key Relationships
```
users (1) ──── (1) wallets
wallets (1) ──── (N) wallet_transactions
missions (1) ──── (N) mission_submissions
mission_submissions (1) ──── (1) wallet_transactions
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with cost factor 10
- **JWT Authentication**: Stateless token-based auth
- **Role-Based Access Control**: Enforced at service layer
- **SQL Injection Prevention**: Parameterized queries (GORM)
- **Audit Logging**: All sensitive operations logged
- **Input Validation**: Strict validation on all endpoints

## ⚡ Performance Optimizations

- **Database Indexes**: Optimized for common queries
- **Connection Pooling**: Configured for high concurrency
- **Cached Aggregates**: Wallet balance cached from transactions
- **Efficient Queries**: Preloading, joins optimization
- **Atomic Operations**: Database-level transactions

## 🧪 Testing

### Unit Tests
```bash
go test ./internal/... -v
```

### Integration Tests
```bash
go test ./tests/integration/... -v
```

### API Tests (Postman/Insomnia)
Import collection dari `tests/api_collection.json`

## 📊 API Endpoints Overview

### Public
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration (admin only)

### Mahasiswa (Student)
- `GET /api/v1/mahasiswa/wallet` - View wallet
- `GET /api/v1/mahasiswa/missions` - List missions
- `POST /api/v1/mahasiswa/missions/{id}/submit` - Submit mission
- `POST /api/v1/mahasiswa/transfer` - Transfer points
- `POST /api/v1/mahasiswa/marketplace/purchase` - Buy product

### Dosen (Lecturer)
- `POST /api/v1/dosen/missions` - Create mission
- `GET /api/v1/dosen/submissions` - View submissions
- `POST /api/v1/dosen/submissions/{id}/validate` - Approve/reject

### Admin
- `GET /api/v1/admin/users` - List users
- `POST /api/v1/admin/products` - Create product
- `POST /api/v1/admin/wallet/adjustment` - Adjust points
- `GET /api/v1/admin/transactions` - Monitor transactions

## 🎯 Business Rules

### Critical Rules
1. **Immutable Transactions**: Never UPDATE or DELETE transaction records
2. **Atomic Operations**: Multi-step operations in DB transactions
3. **Balance Validation**: Always check balance before debit
4. **Stock Validation**: Check stock before marketplace purchase
5. **Deadline Enforcement**: Reject submissions after deadline
6. **Duplicate Prevention**: One submission per student per mission
7. **External Credit-Only**: External points can only credit, never debit

### Transaction Types
- `mission` - Reward from mission completion
- `task` - Reward from task completion
- `transfer_in` - Points received from peer
- `transfer_out` - Points sent to peer
- `marketplace` - Points spent on products
- `external` - Points from external system
- `adjustment` - Manual admin adjustment
- `topup` - Admin top-up

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check MySQL service status
sudo systemctl status mysql

# Verify credentials in .env
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=walletpoint_db
```

### JWT Token Invalid
```bash
# Verify JWT_SECRET in .env is set and strong
JWT_SECRET=your-very-strong-secret-key-min-32-chars
```

### Migration Errors
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS walletpoint_db;"
mysql -u root -p < database/01_tables.sql
```

## 📈 Roadmap

### Version 1.0 (Current)
- ✅ Core wallet functionality
- ✅ Mission & task system
- ✅ P2P transfers
- ✅ Marketplace
- ✅ External integration

### Version 1.1 (Planned)
- [ ] QR code for instant transfers
- [ ] Push notifications
- [ ] Leaderboard system
- [ ] Point expiration rules
- [ ] Advanced analytics dashboard

### Version 2.0 (Future)
- [ ] Multi-currency support
- [ ] Blockchain integration option
- [ ] Mobile app (native iOS/Android)
- [ ] Real-time synchronization
- [ ] Machine learning for fraud detection

## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards
- Follow Go best practices
- Write unit tests for new features
- Update documentation
- Follow Handler-Service-Repository pattern

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Email: support@campus.edu
- Documentation: Read the `/docs` folder

## 🙏 Acknowledgments

- Golang community for excellent frameworks
- MySQL team for robust database engine
- Apache Cordova for mobile development platform

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-13  
**Maintained by**: Campus IT Team
