/* Admin Dashboard Features */

class AdminController {
    static init() {
        console.log("Admin module initialized");
    }

    static async renderDashboard() {
        const content = document.getElementById('mainContent');
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        const userName = storedUser.full_name || 'Administrator';

        // Greeting
        const hour = new Date().getHours();
        let greeting = 'Selamat Pagi';
        if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
        else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
        else if (hour >= 18) greeting = 'Selamat Malam';

        const dashboardHeader = `
            <div class="fade-in" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.2rem;">${greeting},</div>
                    <h2 style="margin: 0; font-weight: 800; color: var(--text-main); font-size: 1.75rem;">${userName.split(' ')[0]}! 👋</h2>
                </div>
                <div style="width: 45px; height: 45px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 1px solid var(--border); position: relative;">
                    <span style="font-size: 1.2rem;">🔔</span>
                    <div style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background: var(--error); border-radius: 50%; border: 2px solid white;"></div>
                </div>
            </div>
        `;

        content.innerHTML = dashboardHeader + `
            <div class="fade-in">
                <div class="stats-grid">
                    <div class="stat-card card-gradient-1">
                        <span class="stat-label">TOTAL PENGGUNA</span>
                        <div class="stat-value" id="stats-users">--</div>
                        <div class="stat-trend" id="stats-active-users" style="color: var(--primary); font-weight: 600;">-- Aktif</div>
                    </div>
                    <div class="stat-card card-gradient-3">
                        <span class="stat-label">POIN BEREDAR</span>
                        <div class="stat-value" id="stats-circulation" style="color: var(--success);">--</div>
                        <div class="stat-trend" style="color: var(--success); font-weight: 600;">💎 Emerald Total</div>
                    </div>
                    <div class="stat-card card-gradient-2">
                        <span class="stat-label">AKTIVITAS HARI INI</span>
                        <div class="stat-value" id="stats-today-txns" style="color: var(--secondary);">--</div>
                        <div class="stat-trend" style="color: var(--secondary); font-weight: 600;">Transaksi Berhasil</div>
                    </div>
                </div>

                <div class="dashboard-grid-split">
                    <div class="card fade-in" style="padding: 2.5rem; background: white; border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-sm); border-top: 6px solid var(--primary);">
                        <h4 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 1.25rem;">
                            📊 Aliran Poin Hari Ini (Real-time)
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div style="padding: 2.5rem; background: rgba(16, 185, 129, 0.05); border-radius: 20px; border: 1px dashed var(--success); text-align: center;">
                                <small style="color: var(--success); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Total Kredit (+)</small>
                                <div id="stats-today-credits" style="font-size: 3rem; font-weight: 900; color: var(--success); margin-top: 0.5rem;">--</div>
                            </div>
                            <div style="padding: 2.5rem; background: rgba(239, 68, 68, 0.05); border-radius: 20px; border: 1px dashed var(--error); text-align: center;">
                                <small style="color: var(--error); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Total Debit (-)</small>
                                <div id="stats-today-debits" style="font-size: 3rem; font-weight: 900; color: var(--error); margin-top: 0.5rem;">--</div>
                            </div>
                        </div>
                    </div>

                    <div class="table-wrapper" style="margin: 0;">
                        <div class="table-header">
                            <h3 style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">⚡ Transaksi Terakhir</h3>
                            <button class="btn btn-sm" onclick="handleNavigation('transactions', 'admin')" style="background:var(--primary-bg); color:var(--primary); font-weight: 700; border-radius: 20px; padding: 0.5rem 1rem;">Semua →</button>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="premium-table" id="recentTxnTable">
                                <thead>
                                    <tr>
                                        <th>Waktu</th>
                                        <th>Pengguna</th>
                                        <th>Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody><tr><td colspan="3" class="text-center">Memuat transaksi terbaru...</td></tr></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Use class name to be safe with context
        AdminController.loadDashboardStats();
        AdminController.loadRecentTransactions();
    }

    static async loadDashboardStats() {
        try {
            const res = await API.getAdminStats();
            // Standardise: res might be the whole JSON or result.data depending on wrapper
            const stats = res.data || res || {};

            const elUsers = document.getElementById('stats-users');
            const elActive = document.getElementById('stats-active-users');
            const elCirc = document.getElementById('stats-circulation');
            const elToday = document.getElementById('stats-today-txns');
            const elCredits = document.getElementById('stats-today-credits');
            const elDebits = document.getElementById('stats-today-debits');

            if (elUsers) elUsers.textContent = (stats.total_users ?? 0).toLocaleString();
            if (elActive) elActive.textContent = `${(stats.active_users ?? 0).toLocaleString()} Aktif`;
            if (elCirc) elCirc.textContent = (stats.circulation_points ?? 0).toLocaleString();
            if (elToday) elToday.textContent = (stats.today_transactions ?? 0).toLocaleString();
            if (elCredits) elCredits.textContent = `+${(stats.today_credits ?? 0).toLocaleString()}`;
            if (elDebits) elDebits.textContent = `-${(stats.today_debits ?? 0).toLocaleString()}`;

        } catch (e) {
            console.error("Failed to load admin dashboard stats", e);
        }
    }

    static async loadRecentTransactions() {
        const tbody = document.querySelector('#recentTxnTable tbody');
        if (!tbody) return;

        // Table Skeletons
        tbody.innerHTML = Array(3).fill(0).map(() => `
            <tr>
                <td><div class="skeleton" style="width: 50px; height: 12px;"></div></td>
                <td><div class="skeleton" style="width: 100px; height: 12px;"></div></td>
                <td><div class="skeleton" style="width: 50px; height: 20px; border-radius: 12px;"></div></td>
                <td><div class="skeleton" style="width: 40px; height: 12px;"></div></td>
            </tr>
        `).join('');

        try {
            const result = await API.getAllTransactions({ limit: 5 });
            const data = result.data || result || {};
            const txns = data.transactions || [];

            if (txns.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding: 2.5rem; color: var(--text-muted); font-size: 0.9rem;">🍃 Sistem masih hening. Belum ada aktivitas transaksi terdeteksi.</td></tr>';
                return;
            }

            tbody.innerHTML = txns.map(t => `
                <tr class="fade-in-item">
                    <td><small>${new Date(t.created_at).toLocaleTimeString()}</small></td>
                    <td><div style="font-weight: 700;">${t.user_name || 'System'}</div></td>
                    <td><span class="badge" style="background:#f1f5f9; color:var(--text-muted); font-size:0.75rem; font-weight:700; text-transform: uppercase;">${t.type || 'N/A'}</span></td>
                    <td style="font-weight: 800; color: ${t.direction === 'credit' ? 'var(--success)' : 'var(--error)'}">
                        ${t.direction === 'credit' ? '↑' : '↓'} ${(t.amount || 0).toLocaleString()}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: var(--error); padding: 1.5rem;">Gagal sinkronisasi data transaksi.</td></tr>';
            console.error("Recent txns error:", e);
        }
    }

    // ==========================
    // MODULE: DATA PENGGUNA (Integrated)
    // ==========================
    static async renderUsers(activeTab = 'accounts') {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="tab-header" style="display: flex; gap: 0.75rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 1rem; -webkit-overflow-scrolling: touch; scrollbar-width: none;">
                    <button class="tab-btn ${activeTab === 'accounts' ? 'active' : ''}" onclick="AdminController.renderUsers('accounts')" style="white-space: nowrap;">Daftar Akun</button>
                    <button class="tab-btn ${activeTab === 'wallets' ? 'active' : ''}" onclick="AdminController.renderUsers('wallets')" style="white-space: nowrap;">Manajemen Dompet</button>
                    <button class="tab-btn ${activeTab === 'transactions' ? 'active' : ''}" onclick="AdminController.renderUsers('transactions')" style="white-space: nowrap;">Log Transaksi</button>
                    <button class="tab-btn ${activeTab === 'transfers' ? 'active' : ''}" onclick="AdminController.renderUsers('transfers')" style="white-space: nowrap;">Riwayat P2P</button>
                </div>
                <div id="tabContent"></div>
            </div>
            <style>
                .tab-btn { 
                    background: transparent; 
                    border: 1px solid var(--border); 
                    padding: 0.6rem 1.25rem; 
                    font-weight: 700; 
                    color: var(--text-muted); 
                    cursor: pointer; 
                    border-radius: 20px; 
                    transition: all 0.2s; 
                    font-size: 0.85rem;
                }
                .tab-btn.active { 
                    background: var(--primary); 
                    color: white; 
                    border-color: var(--primary);
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
                }
                .tab-btn:hover:not(.active) { background: #f1f5f9; color: var(--text-main); }
            </style>
        `;

        if (activeTab === 'accounts') await this.renderUserAccounts();
        else if (activeTab === 'wallets') await this.renderWallets();
        else if (activeTab === 'transactions') await this.renderTransactions();
        else if (activeTab === 'transfers') await this.renderTransfers();
    }

    static async renderUserAccounts() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper" style="border-top: 6px solid var(--primary);">
                <div class="table-header" style="padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid var(--border);">
                    <h3 style="margin:0; font-weight: 800; font-size: 1.25rem;">👥 Manajemen Akun Pengguna</h3>
                    <button class="btn btn-primary" onclick="AdminController.showAddUserModal()" style="border-radius: 20px; padding: 0.5rem 1.25rem; font-size: 0.85rem;">+ Tambah Akun</button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="usersTable">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Email</th>
                                <th>NIM/NIP</th>
                                <th>Peran</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="6" class="text-center">Memuat...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getUsers({ limit: 100 });
            const users = result.data.users || [];
            const tbody = document.querySelector('#usersTable tbody');

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada pengguna ditemukan.</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td><strong>${user.full_name}</strong></td>
                    <td>${user.email}</td>
                    <td><code>${user.nim_nip}</code></td>
                    <td><span class="badge badge-info">${user.role}</span></td>
                    <td><span class="badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">${user.status}</span></td>
                    <td>
                        <button class="btn-icon" onclick="AdminController.showEditUserModal(${user.id})" title="Edit Pengguna">✏️</button>
                        <button class="btn-icon" onclick="AdminController.resetPassword(${user.id})" title="Reset Password">🔑</button>
                        ${user.status === 'active'
                    ? `<button class="btn-icon" style="color:var(--error)" onclick="AdminController.toggleUserStatus(${user.id}, 'inactive')">🚫</button>`
                    : `<button class="btn-icon" style="color:var(--success)" onclick="AdminController.toggleUserStatus(${user.id}, 'active')">✅</button>`
                }
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderWallets() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Status & Penyesuaian Dompet</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="walletsTable">
                        <thead>
                            <tr>
                                <th>Akun</th>
                                <th>Peran</th>
                                <th>Saldo Emerald</th>
                                <th>Aksi Cepat</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="4" class="text-center">Memuat Dompet...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getWallets({ limit: 100 });
            const wallets = result.data || [];
            const tbody = document.querySelector('#walletsTable tbody');

            tbody.innerHTML = wallets.map(w => `
                <tr>
                    <td>
                        <strong>${w.full_name}</strong><br>
                        <small style="color: var(--text-muted)">${w.email}</small>
                    </td>
                    <td><span class="badge badge-info">${w.role}</span></td>
                    <td style="font-size: 1.1em; font-weight: 800; color: var(--primary)">${w.balance.toLocaleString()} pts</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="AdminController.showAdjustModal(${w.wallet_id}, '${w.full_name}')" style="font-size: 0.7rem;">Sesuaikan ⚖️</button>
                        <button class="btn btn-sm" style="background: #fee2e2; color: #991b1b; font-size: 0.7rem;" onclick="AdminController.showResetModal(${w.wallet_id}, '${w.full_name}')">Reset ⚠️</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderTransactions() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Semua Transaksi Sistem</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="txnTable">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>Pengguna</th>
                                <th>Tipe</th>
                                <th>Jumlah</th>
                                <th>Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Memuat Log...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getAllTransactions({ limit: 50 });
            const txns = result.data.transactions || [];
            const tbody = document.querySelector('#txnTable tbody');

            tbody.innerHTML = txns.map(t => `
                <tr>
                    <td><small>${new Date(t.created_at).toLocaleString()}</small></td>
                    <td><strong>${t.user_name}</strong></td>
                    <td><span class="badge badge-info">${t.type}</span></td>
                    <td style="font-weight: 800; color: ${t.direction === 'credit' ? 'var(--success)' : 'var(--error)'}">
                        ${t.direction === 'credit' ? '+' : '-'} ${t.amount.toLocaleString()}
                    </td>
                    <td><small>${t.description}</small></td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderTransfers() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Log Transfer Antar Pengguna</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="transfersTable">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>Pengirim</th>
                                <th>Penerima</th>
                                <th>Jumlah</th>
                                <th>Catatan</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Memuat Transfer...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getAllTransfers({ limit: 50 });
            const items = result.data.transfers || [];
            const tbody = document.querySelector('#transfersTable tbody');

            tbody.innerHTML = items.map(t => `
                <tr>
                    <td><small>${new Date(t.created_at).toLocaleString()}</small></td>
                    <td><strong>${t.sender_name}</strong></td>
                    <td><strong>${t.receiver_name}</strong></td>
                    <td style="font-weight: 800; color: var(--primary)">${t.amount.toLocaleString()} pts</td>
                    <td><small>${t.description || '-'}</small></td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    // ==========================
    // MODULE: DATA PRODUK (Integrated)
    // ==========================
    static async renderProducts(activeTab = 'catalog') {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="tab-header" style="display: flex; gap: 0.75rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 1rem; -webkit-overflow-scrolling: touch; scrollbar-width: none;">
                    <button class="tab-btn ${activeTab === 'catalog' ? 'active' : ''}" onclick="AdminController.renderProducts('catalog')" style="white-space: nowrap;">Katalog Produk</button>
                    <button class="tab-btn ${activeTab === 'sales' ? 'active' : ''}" onclick="AdminController.renderProducts('sales')" style="white-space: nowrap;">Riwayat Penjualan</button>
                </div>
                <div id="tabContent"></div>
            </div>
            <style>
                .tab-btn { 
                    background: transparent; 
                    border: 1px solid var(--border); 
                    padding: 0.6rem 1.25rem; 
                    font-weight: 700; 
                    color: var(--text-muted); 
                    cursor: pointer; 
                    border-radius: 20px; 
                    transition: all 0.2s; 
                    font-size: 0.85rem;
                }
                .tab-btn.active { 
                    background: var(--primary); 
                    color: white; 
                    border-color: var(--primary);
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
                }
                .tab-btn:hover:not(.active) { background: #f1f5f9; color: var(--text-main); }
            </style>
        `;

        if (activeTab === 'catalog') await this.renderCatalog();
        else if (activeTab === 'sales') await this.renderSalesHistory();
    }

    static async renderCatalog() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper" style="border-top: 6px solid var(--primary);">
                <div class="table-header" style="padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid var(--border);">
                    <h3 style="margin:0; font-weight: 800; font-size: 1.25rem;">📦 Inventaris Produk</h3>
                    <button class="btn btn-primary" onclick="AdminController.showProductModal()" style="border-radius: 20px; padding: 0.5rem 1.25rem; font-size: 0.85rem;">+ Tambah Produk</button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="productsTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Gambar</th>
                                <th>Nama Produk</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>QR</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="7" class="text-center">Belum ada produk.</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getProducts({ limit: 100 });
            const products = result.data.products || [];
            const tbody = document.querySelector('#productsTable tbody');

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada produk.</td></tr>';
                return;
            }

            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>#${p.id}</td>
                    <td><div class="table-img" style="background: linear-gradient(135deg, var(--primary-light), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white; border-radius: 8px;">📦</div></td>
                    <td>
                        <div style="font-weight: 600;">${p.name}</div>
                        <small style="color: var(--text-muted);">${p.category || 'Umum'}</small>
                    </td>
                    <td style="font-weight: 700; color: var(--primary);">${p.price.toLocaleString()}</td>
                    <td>${p.stock} unit</td>
                    <td>
                        <button class="btn btn-sm" onclick="AdminController.showProductQR(${p.id}, '${p.name}')" style="background: #f1f5f9; color: var(--primary); font-weight: 700; border: 1px solid var(--primary-light);">🔍 QR</button>
                    </td>
                    <td>
                        <button class="btn btn-sm" onclick="AdminController.showProductModal(${p.id})" style="margin-right:0.5rem;">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="AdminController.deleteProduct(${p.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderSalesHistory() {
        const tabContent = document.getElementById('tabContent');
        tabContent.innerHTML = `
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Data Penjualan Marketplace</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="premium-table" id="salesTable">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Pembeli</th>
                                <th>Produk</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="4" class="text-center">Memuat Penjualan...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getMarketplaceTransactions({ limit: 50 });
            const items = result.data.transactions || [];
            const tbody = document.querySelector('#salesTable tbody');

            tbody.innerHTML = items.map(t => `
                <tr>
                    <td><small>${new Date(t.created_at).toLocaleString()}</small></td>
                    <td><strong>${t.user_name}</strong></td>
                    <td><strong>${t.product_name}</strong> (x${t.quantity})</td>
                    <td style="font-weight: 800; color: var(--success)">+${t.amount.toLocaleString()} pts</td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    static async renderAuditLogs() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="fade-in">
                <div class="table-header" style="margin-bottom: 2rem;">
                    <div><h2>Log Audit Keamanan</h2></div>
                    <button class="btn" style="background:white; border:1px solid var(--border);" onclick="AdminController.renderAuditLogs()">Segarkan 🔄</button>
                </div>
                <div class="table-wrapper">
                    <div style="overflow-x: auto;">
                        <table class="premium-table" id="auditTable">
                            <thead>
                                <tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Target</th><th>Detail</th></tr>
                            </thead>
                            <tbody><tr><td colspan="5" class="text-center">Memuat Log Audit...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        try {
            const result = await API.getAuditLogs({ limit: 50 });
            const logs = result.data.logs || [];
            const tbody = document.querySelector('#auditTable tbody');
            tbody.innerHTML = logs.map(log => `
                <tr>
                    <td><small>${new Date(log.created_at).toLocaleString()}</small></td>
                    <td><strong>${log.user_name || 'System'}</strong></td>
                    <td><span class="badge" style="background:#f1f5f9; color:var(--text-main);">${log.action}</span></td>
                    <td><code>${log.entity} #${log.entity_id}</code></td>
                    <td><small>${log.details}</small></td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    // MODALS & HELPERS
    static async showAddUserModal() { AdminController.renderUserModal(null, 'Tambah Pengguna Baru'); }
    static async showEditUserModal(id) {
        try { const response = await API.request(`/admin/users/${id}`, 'GET'); AdminController.renderUserModal(response.data, 'Edit Pengguna'); } catch (e) { showToast(e.message, 'error'); }
    }
    static renderUserModal(user, title) {
        const isEdit = !!user;
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>${title}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="userForm" onsubmit="AdminController.handleUserSubmit(event, ${isEdit ? user.id : 'null'})">
                            <div class="form-group"><label>Nama Lengkap</label><input type="text" name="full_name" value="${user?.full_name || ''}" required></div>
                            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div><label>Email</label><input type="email" name="email" value="${user?.email || ''}" required></div>
                                <div><label>NIM/NIP</label><input type="text" name="nim_nip" value="${user?.nim_nip || ''}" required></div>
                            </div>
                            <div class="form-group">
                                <label>Role</label>
                                <select name="role">
                                    <option value="mahasiswa" ${user?.role === 'mahasiswa' ? 'selected' : ''}>Mahasiswa</option>
                                    <option value="dosen" ${user?.role === 'dosen' ? 'selected' : ''}>Dosen</option>
                                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                            ${!isEdit ? `<div class="form-group"><label>Password</label><input type="password" name="password" required minlength="6"></div>` : ''}
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Buat'}</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleUserSubmit(e, id) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            if (id) await API.updateUser(id, data); else await API.createUser(data);
            closeModal(); AdminController.renderUsers(); showToast(`Selesai`);
        } catch (e) { showToast(e.message, 'error'); }
    }
    static async toggleUserStatus(id, newStatus) {
        if (!confirm(`Ubah status?`)) return;
        try { await API.updateUser(id, { status: newStatus }); AdminController.renderUsers(); } catch (e) { showToast(e.message, 'error'); }
    }
    static async resetPassword(id) {
        const pw = prompt("Password baru:");
        if (pw) try { await API.resetUserPassword(id, pw); showToast('Selesai'); } catch (e) { showToast(e.message, 'error'); }
    }

    static showAdjustModal(walletId, userName) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>⚖️ Sesuaikan: ${userName}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="adjustForm" onsubmit="AdminController.handleAdjust(event)">
                            <input type="hidden" name="wallet_id" value="${walletId}">
                            <div class="form-group"><label>Arah</label><select name="direction"><option value="credit">Tambah (+)</option><option value="debit">Kurang (-)</option></select></div>
                            <div class="form-group"><label>Jumlah</label><input type="number" name="amount" min="1" required></div>
                            <div class="form-group"><label>Alasan</label><textarea name="description" required></textarea></div>
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleAdjust(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.wallet_id = parseInt(data.wallet_id); data.amount = parseInt(data.amount);
        try { await API.adjustWalletPoints(data); closeModal(); AdminController.renderUsers('wallets'); showToast('Selesai'); } catch (e) { showToast(e.message, 'error'); }
    }

    static showResetModal(walletId, userName) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>⚠️ Reset: ${userName}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="resetForm" onsubmit="AdminController.handleReset(event)">
                            <input type="hidden" name="wallet_id" value="${walletId}">
                            <div class="form-group"><label>Saldo Target</label><input type="number" name="new_balance" min="0" value="0" required></div>
                            <div class="form-group"><label>Justifikasi</label><input type="text" name="reason" required></div>
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-error" style="background:var(--error); color:white">RESET</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleReset(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.wallet_id = parseInt(data.wallet_id); data.new_balance = parseInt(data.new_balance);
        if (!confirm("Reset?")) return;
        try { await API.resetWallet(data); closeModal(); AdminController.renderUsers('wallets'); showToast('Selesai'); } catch (e) { showToast(e.message, 'error'); }
    }


    static async showProductModal(id = null) {
        let product = null;
        if (id) { try { const res = await API.request(`/admin/products/${id}`, 'GET'); product = res.data; } catch (e) { console.error(e); } }
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card">
                    <div class="modal-head"><h3>${id ? '🛠️ Edit' : '🎁 Baru'}</h3><button class="btn-icon" onclick="closeModal()">×</button></div>
                    <div class="modal-body">
                        <form id="productForm" onsubmit="AdminController.handleProductSubmit(event, ${id})">
                            <div class="form-group"><label>Nama</label><input type="text" name="name" value="${product?.name || ''}" required></div>
                            <div class="form-group"><label>Deskripsi</label><textarea name="description">${product?.description || ''}</textarea></div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group"><label>Harga</label><input type="number" name="price" value="${product?.price || ''}" required min="1"></div>
                                <div class="form-group"><label>Stok</label><input type="number" name="stock" value="${product?.stock || 0}" required min="0"></div>
                            </div>
                            <div class="form-group">
                                <label>URL Gambar (Opsional)</label>
                                <input type="text" name="image_url" value="${product?.image_url || ''}" placeholder="https://example.com/image.jpg">
                                <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.5rem; display: block;">Kosongkan jika ingin menggunakan ikon default.</small>
                            </div>
                            <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    static async handleProductSubmit(e, id) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.price = parseInt(data.price); data.stock = parseInt(data.stock);
        try {
            if (id) await API.request(`/admin/products/${id}`, 'PUT', data);
            else await API.request('/admin/products', 'POST', data);
            closeModal(); AdminController.renderProducts('catalog'); showToast("Selesai");
        } catch (e) { showToast(e.message, "error"); }
    }
    static async deleteProduct(id) {
        if (!confirm('Hapus?')) return;
        try { await API.deleteProduct(id); AdminController.renderProducts('catalog'); } catch (e) { showToast(e.message, 'error'); }
    }

    static showProductQR(id, name) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-card fade-in" style="max-width: 450px; text-align: center; padding: 2.5rem; border-radius: 32px; box-shadow: var(--shadow-premium);">
                    <div style="margin-bottom: 2rem;">
                        <h3 style="margin: 0; font-weight: 800; font-size: 1.5rem; color: var(--text-main);">QR Code Produk 🏷️</h3>
                        <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.95rem;">Siap untuk dicetak dan digunakan di Marketplace.</p>
                    </div>
                    
                    <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
                        <div id="admin-product-qr" style="background: white; padding: 2rem; border-radius: 24px; border: 1px dashed var(--border); box-shadow: var(--shadow-sm); transition: transform 0.3s hover {transform: scale(1.02);}"></div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 1.25rem; border-radius: 20px; margin-bottom: 2.5rem; border: 1px solid var(--border);">
                        <div style="font-weight: 800; color: var(--text-main); font-size: 1.1rem; margin-bottom: 0.25rem;">${name}</div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                             <span style="color: var(--text-muted); font-size: 0.85rem;">SKU:</span>
                             <code style="color: var(--primary); font-weight: 900; background: rgba(99, 102, 241, 0.1); padding: 4px 10px; border-radius: 8px;">WPPROD:${id}</code>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                        <button class="btn btn-primary" onclick="window.print()" style="padding: 1.1rem; border-radius: 18px; font-weight: 800; font-size: 1rem; background: linear-gradient(135deg, var(--primary), #4f46e5); border: none; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">
                            Cetak Tiket QR 🖨️
                        </button>
                        <button class="btn" onclick="closeModal()" style="padding: 1rem; border-radius: 18px; color: var(--text-muted); font-weight: 600;">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        new QRCode(document.getElementById("admin-product-qr"), {
            text: `WPPROD:${id}`,
            width: 220,
            height: 220,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}
