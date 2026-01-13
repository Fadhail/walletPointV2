/* Admin Dashboard Features */

class AdminController {
    static init() {
        console.log("Admin module initialized");
    }

    static async loadDashboardStats() {
        // Since we don't have a dedicated stats endpoint yet, we'll infer from list counts for now
        // Ideally: backend should provide /admin/stats endpoint
        try {
            const users = await API.getUsers({ limit: 1 });
            const txns = await API.getAllTransactions({ limit: 1 });

            document.querySelectorAll('.stat-value')[0].textContent = users.data.total || 0;
            document.querySelectorAll('.stat-value')[1].textContent = txns.data.total || 0;
        } catch (e) {
            console.error("Failed to load stats", e);
        }
    }

    // ==========================
    // MODULE: USERS
    // ==========================
    static async renderUsers() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>User Management</h3>
                    <button class="btn btn-primary" onclick="AdminController.showAddUserModal()">+ Add User</button>
                </div>
                <div style="overflow-x: auto;">
                    <table id="usersTable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>NIM/NIP</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="7" class="text-center">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getUsers({ limit: 100 });
            const users = result.data.users || [];

            const tbody = document.querySelector('#usersTable tbody');
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found.</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(user => `
                <tr id="user-row-${user.id}">
                    <td>${user.full_name}</td>
                    <td>${user.email}</td>
                    <td>${user.nim_nip}</td>
                    <td><span class="status-badge" style="background-color: #e5e7eb;">${user.role}</span></td>
                    <td><span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">${user.status}</span></td>
                    <td>${user.balance} pts</td>
                    <td>
                        <button class="btn-icon" onclick="AdminController.showEditUserModal(${user.id})" title="Edit User">✏️</button>
                         <button class="btn-icon" onclick="AdminController.resetPassword(${user.id})" title="Reset Password">🔑</button>
                        ${user.status === 'active'
                    ? `<button class="btn-icon" style="color:red" onclick="AdminController.toggleUserStatus(${user.id}, 'inactive')" title="Deactivate">🚫</button>`
                    : `<button class="btn-icon" style="color:green" onclick="AdminController.toggleUserStatus(${user.id}, 'active')" title="Activate">✅</button>`
                }
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error(error);
            document.querySelector('#usersTable tbody').innerHTML = `<tr><td colspan="7" style="color:red">Error loading users.</td></tr>`;
        }
    }

    static async showAddUserModal() {
        AdminController.renderUserModal(null, 'Add New User');
    }

    static async showEditUserModal(id) {
        try {
            const response = await API.request(`/admin/users/${id}`, 'GET');
            AdminController.renderUserModal(response.data, 'Edit User');
        } catch (error) {
            alert("Failed to fetch user data: " + error.message);
        }
    }

    static renderUserModal(user = null, title) {
        const isEdit = !!user;
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-content">
                    <h3>${title}</h3>
                    <form id="userForm" onsubmit="AdminController.handleUserSubmit(event, ${isEdit ? user.id : 'null'})">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="full_name" value="${user?.full_name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value="${user?.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>NIM/NIP</label>
                            <input type="text" name="nim_nip" value="${user?.nim_nip || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Role</label>
                            <select name="role">
                                <option value="mahasiswa" ${user?.role === 'mahasiswa' ? 'selected' : ''}>Mahasiswa</option>
                                <option value="dosen" ${user?.role === 'dosen' ? 'selected' : ''}>Dosen</option>
                                <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        ${!isEdit ? `
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" required minlength="6">
                        </div>` : ''}
                        
                        <div class="form-actions">
                            <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create User'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleUserSubmit(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (id) {
                await API.updateUser(id, data); // Make sure API.updateUser is implemented
            } else {
                await API.createUser(data);
            }
            closeModal();
            AdminController.renderUsers();
            alert(`User ${id ? 'updated' : 'created'} successfully`);
        } catch (error) {
            alert(error.message);
        }
    }

    static async toggleUserStatus(id, newStatus) {
        if (!confirm(`Are you sure you want to set this user to ${newStatus}?`)) return;
        try {
            // Re-using generic update since backend usually supports status update via same endpoint
            await API.updateUser(id, { status: newStatus });
            AdminController.renderUsers();
        } catch (error) {
            alert(error.message);
        }
    }

    static async resetPassword(id) {
        const newPassword = prompt("Enter new password for this user:");
        if (newPassword) {
            try {
                await API.resetUserPassword(id, newPassword);
                alert('Password updated successfully');
            } catch (error) {
                alert(error.message);
            }
        }
    }


    // ==========================
    // MODULE: WALLETS
    // ==========================
    static async renderWallets() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>Wallet Management</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table id="walletsTable">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="4">Loading...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getWallets({ limit: 100 });
            const wallets = result.data.users || []; // Note: Endpoint returns UserWithWallet wrapper

            const tbody = document.querySelector('#walletsTable tbody');
            tbody.innerHTML = wallets.map(w => `
                <tr>
                    <td>
                        <strong>${w.full_name}</strong><br>
                        <small>${w.email}</small>
                    </td>
                    <td>${w.role}</td>
                    <td style="font-size: 1.1em; font-weight: bold;">${w.balance.toLocaleString()} pts</td>
                    <td>
                        <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="AdminController.showAdjustModal(${w.id}, '${w.full_name}')">Adjust Points</button>
                        <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="AdminController.showResetModal(${w.id}, '${w.full_name}')">Reset</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }

    static showAdjustModal(walletId, userName) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-content">
                    <h3>Adjust Points: ${userName}</h3>
                    <form id="adjustForm" onsubmit="AdminController.handleAdjust(event)">
                        <input type="hidden" name="wallet_id" value="${walletId}">
                        <div class="form-group">
                            <label>Direction</label>
                            <select name="direction">
                                <option value="credit">Credit (Add)</option>
                                <option value="debit">Debit (Deduct)</option>
                            </select>
                        </div>
                         <div class="form-group">
                            <label>Amount</label>
                            <input type="number" name="amount" min="1" required>
                        </div>
                         <div class="form-group">
                            <label>Description</label>
                            <input type="text" name="description" required placeholder="Reason for adjustment">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Process</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleAdjust(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.wallet_id = parseInt(data.wallet_id);
        data.amount = parseInt(data.amount);

        try {
            await API.adjustWalletPoints(data);
            closeModal();
            AdminController.renderWallets();
            alert('Points adjusted successfully');
        } catch (error) {
            alert(error.message);
        }
    }

    static showResetModal(walletId, userName) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-content">
                    <h3>Reset Wallet: ${userName}</h3>
                    <p style="color:red; margin-bottom:1rem;">Warning: This will force set the wallet balance to a specific amount.</p>
                    <form id="resetForm" onsubmit="AdminController.handleReset(event)">
                        <input type="hidden" name="wallet_id" value="${walletId}">
                        <div class="form-group">
                            <label>New Balance</label>
                            <input type="number" name="new_balance" min="0" value="0" required>
                        </div>
                         <div class="form-group">
                            <label>Reason (Audit)</label>
                            <input type="text" name="reason" required placeholder="Why is this reset needed?">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-danger">Reset Balance</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleReset(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.wallet_id = parseInt(data.wallet_id);
        data.new_balance = parseInt(data.new_balance);

        if (!confirm("Are you ABSOLUTELY SURE? This cannot be undone easily.")) return;

        try {
            await API.resetWallet(data);
            closeModal();
            AdminController.renderWallets();
            alert('Wallet balance reset successfully');
        } catch (error) {
            alert(error.message);
        }
    }

    // ==========================
    // MODULE: TRANSACTIONS
    // ==========================
    static async renderTransactions() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>All Transactions</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table id="txnTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="6">Loading...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getAllTransactions({ limit: 50 });
            const txns = result.data.transactions || [];

            const tbody = document.querySelector('#txnTable tbody');
            if (txns.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No transactions found.</td></tr>';
                return;
            }

            tbody.innerHTML = txns.map(t => `
                <tr>
                    <td>${new Date(t.created_at).toLocaleString()}</td>
                    <td>${t.user_name} <br> <small>${t.nim_nip}</small></td>
                    <td>${t.type}</td>
                    <td class="${t.direction === 'credit' ? 'trend-up' : 'trend-down'}" style="font-weight: bold;">
                        ${t.direction === 'credit' ? '+' : '-'}${t.amount}
                    </td>
                    <td>${t.description}</td>
                    <td><span class="status-badge status-active">${t.status}</span></td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }
    // ==========================
    // MODULE: MARKETPLACE
    // ==========================
    static async renderProducts() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>Marketplace Products</h3>
                    <button class="btn btn-primary" onclick="AdminController.showProductModal()">+ Add Product</button>
                </div>
                <div style="overflow-x: auto;">
                    <table id="productsTable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5">Loading...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getProducts({ limit: 100 });
            const products = result.data.products || [];

            const tbody = document.querySelector('#productsTable tbody');
            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found.</td></tr>';
                return;
            }

            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>
                        <strong>${p.name}</strong><br>
                        <small>${p.description || ''}</small>
                    </td>
                    <td style="font-weight:bold">${p.price.toLocaleString()} pts</td>
                    <td>${p.stock} units</td>
                    <td><span class="status-badge ${p.status === 'active' ? 'status-active' : 'status-inactive'}">${p.status}</span></td>
                    <td>
                        <button class="btn-icon" onclick="AdminController.showProductModal(${p.id})" title="Edit">✏️</button>
                        <button class="btn-icon" style="color:red" onclick="AdminController.deleteProduct(${p.id})" title="Delete">🗑️</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }

    static async showProductModal(id = null) {
        let product = null;
        if (id) {
            try {
                // Fetch product details if editing (or find from existing list if possible)
                // For simplicity, we'll just fetch by ID or assume passed data
                // Ideally we fetch generic get first.
                // Let's rely on basic form reset if new.
                // To do it properly: 
                const res = await API.request(`/admin/products/${id}`, 'GET');
                product = res.data;
            } catch (e) { console.error(e); }
        }

        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-content">
                    <h3>${id ? 'Edit Product' : 'Add New Product'}</h3>
                    <form id="productForm" onsubmit="AdminController.handleProductSubmit(event, ${id})">
                        <div class="form-group">
                            <label>Product Name</label>
                            <input type="text" name="name" value="${product?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input type="text" name="description" value="${product?.description || ''}">
                        </div>
                        <div class="form-group">
                            <label>Price (Points)</label>
                            <input type="number" name="price" value="${product?.price || ''}" required min="1">
                        </div>
                        <div class="form-group">
                            <label>Initial Stock</label>
                            <input type="number" name="stock" value="${product?.stock || 0}" required min="0">
                        </div>
                         <div class="form-group">
                            <label>Image URL (Optional)</label>
                            <input type="text" name="image_url" value="${product?.image_url || ''}" placeholder="http://...">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select name="status">
                                <option value="active" ${product?.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${product?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Create'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleProductSubmit(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.price = parseInt(data.price);
        data.stock = parseInt(data.stock);

        try {
            if (id) {
                await API.updateProduct(id, data);
            } else {
                await API.createProduct(data);
            }
            closeModal();
            AdminController.renderProducts();
            alert(`Product ${id ? 'updated' : 'created'} successfully`);
        } catch (error) {
            alert(error.message);
        }
    }

    static async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await API.deleteProduct(id);
            AdminController.renderProducts();
        } catch (error) {
            alert(error.message);
        }
    }

    // ==========================
    // MODULE: AUDIT LOGS
    // ==========================
    static async renderAuditLogs() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>System Audit Logs</h3>
                    <div class="filter-group">
                        <input type="date" id="auditDateFilter" onchange="AdminController.filterAuditLogs()">
                        <select id="auditActionFilter" onchange="AdminController.filterAuditLogs()">
                            <option value="">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="LOGIN">Login</option>
                        </select>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table id="auditTable">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Details</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="6" class="text-center">Loading...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        AdminController.filterAuditLogs();
    }

    static async filterAuditLogs() {
        const date = document.getElementById('auditDateFilter')?.value || '';
        const action = document.getElementById('auditActionFilter')?.value || '';

        try {
            const result = await API.getAuditLogs({ date, action, limit: 100 });
            const logs = result.data.logs || [];

            const tbody = document.querySelector('#auditTable tbody');
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No logs found.</td></tr>';
                return;
            }

            tbody.innerHTML = logs.map(l => `
                <tr>
                    <td>${new Date(l.created_at).toLocaleString()}</td>
                    <td>${l.user_name} <br> <small>${l.user_role}</small></td>
                    <td><span class="status-badge" style="background:#f3f4f6">${l.action}</span></td>
                    <td>${l.entity} (ID: ${l.entity_id})</td>
                    <td style="max-width:300px; font-size:0.85em; color:#666">${l.details}</td>
                    <td><small>${l.ip_address}</small></td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }
}

// Global modal helpers
function closeModal(e) {
    // If e is present, check if background click
    if (e && e.target.className !== 'modal-overlay' && e.target.type !== 'button') return;

    // Remove modal
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

