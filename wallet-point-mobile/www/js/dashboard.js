document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch User Profile
        const response = await API.getProfile();
        const user = response.data;

        // Update UI with User Info
        updateUserProfile(user);

        // Initialize Navigation and View
        renderNavigation(user.role);
        handleNavigation('dashboard', user.role);

    } catch (error) {
        console.error('Dashboard Init Error:', error);
        // If profile fetch fails heavily, might redirect to login (handled in API.getProfile)
    }
});

function updateUserProfile(user) {
    document.getElementById('userName').textContent = user.full_name || user.email;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userAvatar').textContent = (user.full_name || user.email).charAt(0).toUpperCase();
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function closeModal(e) {
    // Only close if clicking the actual overlay background, not elements inside it
    if (e && e.target !== e.currentTarget) return;
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function renderNavigation(role) {
    const sidebarNav = document.getElementById('sidebarNav');
    const bottomNav = document.getElementById('mobileBottomNav');

    let items = [];

    // Define icons for bottom nav
    const icons = {
        'dashboard': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        'users': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        'products': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
        'audit-logs': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
        'quizzes': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
        'missions': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        'submissions': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
        'dosen-students': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>',
        'scan': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>',
        'shop': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
        'transfer': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
        'history': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
        'merchant-dashboard': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        'profile': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    };

    if (role === 'admin') {
        items.push(
            { label: 'Home', href: '#dashboard', active: true, icon: icons['dashboard'] },
            { label: 'Users', href: '#users', icon: icons['users'] },
            { label: 'Produk', href: '#products', icon: icons['products'] },
            { label: 'Audit', href: '#audit-logs', icon: icons['audit-logs'] }
        );
    } else if (role === 'dosen') {
        items.push(
            { label: 'Home', href: '#dashboard', active: true, icon: icons['dashboard'] },
            { label: 'Misi', href: '#missions', icon: icons['missions'] },
            { label: 'Validasi', href: '#submissions', icon: icons['submissions'] },
            { label: 'Siswa', href: '#dosen-students', icon: icons['dosen-students'] }
        );
    } else if (role === 'mahasiswa') {
        items.push(
            { label: 'Home', href: '#dashboard', active: true, icon: icons['dashboard'] },
            { label: 'Misi', href: '#missions', icon: icons['missions'] },
            { label: 'Scan', href: '#scan', icon: icons['scan'] }, // Center item often
            { label: 'Toko', href: '#shop', icon: icons['shop'] },
            { label: 'Akun', href: '#profile', icon: icons['profile'] }
        );
    } else if (role === 'merchant') {
        items.push(
            { label: 'Home', href: '#merchant-dashboard', active: true, icon: icons['merchant-dashboard'] },
            { label: 'Scan', href: '#merchant-scanner', icon: icons['scan'] },
            { label: 'Akun', href: '#profile', icon: icons['profile'] }
        );
    }

    if (role !== 'mahasiswa' && role !== 'merchant') { // Mahasiswa/Merchant have profile in main nav
        items.push({ label: 'Profil', href: '#profile', icon: icons['profile'] });
    }

    // Render Sidebar
    sidebarNav.innerHTML = items.map(item => `
        <a href="${item.href}" class="nav-item ${item.active ? 'active' : ''}" data-target="${item.href.substring(1)}">
            ${item.label}
        </a>
    `).join('');

    // Render Mobile Bottom Nav
    bottomNav.innerHTML = items.map(item => `
        <button class="bottom-nav-item ${item.active ? 'active' : ''}" data-target="${item.href.substring(1)}">
            ${item.icon}
            <span>${item.label}</span>
        </button>
    `).join('');

    // Logic to handle clicks
    const handleNavClick = (target) => {
        // Update UI states
        document.querySelectorAll('.nav-item').forEach(l => {
            l.classList.toggle('active', l.dataset.target === target);
        });
        document.querySelectorAll('.bottom-nav-item').forEach(b => {
            b.classList.toggle('active', b.dataset.target === target);
        });

        // Logic
        handleNavigation(target, role);
    };

    // Attach listeners
    sidebarNav.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavClick(link.dataset.target);
            if (window.innerWidth <= 768) toggleSidebar();
        });
    });

    bottomNav.querySelectorAll('.bottom-nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavClick(btn.dataset.target);
        });
    });
}

function handleNavigation(target, role) {
    // Force close any open modals to prevent blurring issues
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const title = document.getElementById('pageTitle');
    title.textContent = target.charAt(0).toUpperCase() + target.slice(1).replace('-', ' ');

    if (role === 'admin') {
        switch (target) {
            case 'users':
                AdminController.renderUsers();
                break;
            case 'products':
                AdminController.renderProducts();
                break;
            case 'audit-logs':
                AdminController.renderAuditLogs();
                break;
            case 'dashboard':
                AdminController.renderDashboard();
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                AdminController.renderDashboard();
                title.textContent = 'Dashboard Administrator';
        }
    } else if (role === 'dosen') {
        switch (target) {
            case 'dashboard':
                renderDashboard({ role: 'dosen' });
                break;
            case 'quizzes':
                DosenController.renderQuizzes();
                break;
            case 'missions':
                DosenController.renderMissions();
                break;
            case 'submissions':
                DosenController.renderSubmissions();
                break;
            case 'dosen-students':
                DosenController.renderStudents();
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                renderDashboard({ role: 'dosen' });
                title.textContent = 'Ringkasan Dosen';
        }
    } else if (role === 'mahasiswa') {
        switch (target) {
            case 'dashboard':
                renderDashboard({ role: 'mahasiswa' });
                break;
            case 'missions':
                MahasiswaController.renderMissions();
                break;
            case 'shop':
                MahasiswaController.renderShop();
                break;
            case 'transfer':
                MahasiswaController.renderTransfer();
                break;
            case 'scan':
                MahasiswaController.renderScanner();
                break;

            case 'history':
                MahasiswaController.renderLedger();
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                renderDashboard({ role: 'mahasiswa' });
                title.textContent = 'Dashboard Mahasiswa';
        }
    } else if (role === 'merchant') {
        switch (target) {
            case 'merchant-scanner':
                MerchantController.renderMerchantScanner();
                break;
            case 'profile':
                ProfileController.renderProfile();
                break;
            default:
                renderDashboard({ role: 'merchant' });
                title.textContent = 'Dashboard Kasir';
        }
    }
}

function renderDashboard(user) {
    const content = document.getElementById('mainContent');
    const title = document.getElementById('pageTitle');

    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userName = storedUser.full_name || 'Pengguna';

    // Greeting based on time
    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18) greeting = 'Selamat Malam';

    title.textContent = `Dashboard ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;

    // Common Mobile-App Style Header for Dashboard
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

    if (user.role === 'admin') {
        content.innerHTML = dashboardHeader + `
            <div class="stats-grid">
                <div class="stat-card card-gradient-1">
                    <span class="stat-label">Pengguna Sistem</span>
                    <div class="stat-value" id="stats-users"><span class="skeleton" style="width: 60px; height: 35px; border-radius: 8px;"></span></div>
                    <div class="stat-trend" style="color: var(--primary)">Total Terdaftar</div>
                </div>
                <div class="stat-card card-gradient-2">
                    <span class="stat-label">Total Transaksi</span>
                    <div class="stat-value" id="stats-txns"><span class="skeleton" style="width: 60px; height: 35px; border-radius: 8px;"></span></div>
                    <div class="stat-trend" style="color: var(--secondary)">Semua Acara</div>
                </div>
                <div class="stat-card card-gradient-3">
                    <span class="stat-label">Status API</span>
                    <div class="stat-value" style="color: var(--success); font-size: 1.5rem; margin-top: 0.5rem;"><span class="skeleton" style="width: 80px; height: 30px; border-radius: 8px;"></span></div>
                    <div class="stat-trend">Koneksi Stabil</div>
                </div>
            </div>
            
            <div class="table-wrapper">
                <div class="table-header">
                    <h3>Akses Cepat</h3>
                </div>
                <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
                    <p>Selamat datang di panel admin premium. Gunakan bilah sisi untuk menavigasi antar modul.</p>
                </div>
            </div>
        `;
        AdminController.loadDashboardStats();
    } else if (user.role === 'dosen') {
        content.innerHTML = dashboardHeader + `
            <div class="stats-grid">
                <div class="stat-card card-gradient-1">
                    <span class="stat-label">Misi Saya</span>
                    <div class="stat-value" id="stats-missions"><span class="skeleton" style="width: 50px; height: 35px; border-radius: 8px;"></span></div>
                    <div class="stat-trend" style="color: var(--primary); font-weight: 600;">📚 Total tugas dibuat</div>
                </div>
                <div class="stat-card card-gradient-2">
                    <span class="stat-label">Ulasan Tertunda</span>
                    <div class="stat-value" id="stats-pending" style="color: var(--warning);"><span class="skeleton" style="width: 50px; height: 35px; border-radius: 8px;"></span></div>
                    <div class="stat-trend" style="color: var(--secondary); font-weight: 600;">⏳ Perlu segera diperiksa</div>
                </div>
                <div class="stat-card card-gradient-3">
                    <span class="stat-label">Tugas Divalidasi</span>
                    <div class="stat-value" id="stats-validated"><span class="skeleton" style="width: 50px; height: 35px; border-radius: 8px;"></span></div>
                    <div class="stat-trend" style="color: var(--success); font-weight: 600;">✅ Sudah diberikan poin</div>
                </div>
            </div>
            
            <div class="dashboard-grid-split">
                <div class="table-wrapper">
                    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>📥 Butuh Review Segera</h3>
                        <button class="btn btn-sm" onclick="handleNavigation('submissions', 'dosen')" style="background: var(--primary-bg); color: var(--primary); font-weight: 600;">Lihat Semua</button>
                    </div>
                    <div style="padding: 1rem;">
                        <div id="quickReviewList" style="display: flex; flex-direction: column; gap: 1rem;">
                            <!-- Simple items or empty state -->
                            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                                <span class="spinner"></span> Menarik pengiriman terbaru...
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card fade-in" style="padding: 2rem; background: white; border: 1px solid var(--border); border-radius: 24px;">
                    <h3 style="margin-bottom: 1.5rem;">📊 Analisis Kelas</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span style="font-weight: 600;">Tingkat Kelulusan</span>
                                <span style="color: var(--success); font-weight: 700;">85%</span>
                            </div>
                            <div style="height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden;">
                                <div style="width: 85%; height: 100%; background: var(--success);"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span style="font-weight: 600;">Keaktifan Kuis</span>
                                <span style="color: var(--primary); font-weight: 700;">92%</span>
                            </div>
                            <div style="height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden;">
                                <div style="width: 92%; height: 100%; background: var(--primary);"></div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; font-size: 0.85rem; color: var(--text-muted);">
                            <strong>Insight:</strong> Mahasiswa paling aktif di hari Senin & Selasa. Waktu terbaik untuk merilis kuis baru!
                        </div>
                    </div>
                </div>
            </div>
        `;
        DosenController.loadDosenStats();
        loadDosenQuickReview();
    } else if (user.role === 'mahasiswa') {
        content.innerHTML = dashboardHeader + `
            <div class="stats-grid">
                <div class="stat-card card-gradient-1">
                    <span class="stat-label">Saldo Emerald</span>
                    <div class="stat-value" id="userBalance"><span class="skeleton" style="width: 100px; height: 40px; border-radius: 10px;"></span></div>
                    <div class="stat-trend" style="color: var(--primary); font-weight: 600;">💎 Poin dapat dibelanjakan</div>
                </div>
                <div class="stat-card card-gradient-2">
                    <span class="stat-label">Misi Selesai</span>
                    <div class="stat-value" id="stats-missions-done"><span class="skeleton" style="width: 60px; height: 40px; border-radius: 10px;"></span></div>
                    <div class="stat-trend" style="color: var(--secondary); font-weight: 600;">✅ Tugas tervalidasi</div>
                </div>
                <div class="stat-card card-gradient-3">
                    <span class="stat-label">Discovery Hub</span>
                    <div class="stat-value" id="stats-active-missions"><span class="skeleton" style="width: 60px; height: 40px; border-radius: 10px;"></span></div>
                    <div class="stat-trend" style="color: var(--success); font-weight: 600;">✨ Cari misi baru</div>
                </div>
            </div>

            <div class="dashboard-grid-split">
                <div class="card fade-in" style="padding: 1.5rem; background: white; border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-sm); border-top: 6px solid var(--primary);">
                    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1.25rem;">
                        🚀 Akses Cepat
                    </h3>
                    <div class="quick-access-grid">
                        <div class="quick-action-card" onclick="handleNavigation('missions', 'mahasiswa')" style="background: rgba(99, 102, 241, 0.05); padding: 1.25rem; border-radius: 16px; cursor: pointer; border: 1px solid rgba(99, 102, 241, 0.1);">
                            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">🎯</div>
                            <h4 style="margin: 0; color: var(--primary); font-size: 0.95rem;">Jelajahi Misi</h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Cari tugas baru</p>
                        </div>
                        <div class="quick-action-card" onclick="handleNavigation('shop', 'mahasiswa')" style="background: rgba(16, 185, 129, 0.05); padding: 1.25rem; border-radius: 16px; cursor: pointer; border: 1px solid rgba(16, 185, 129, 0.1);">
                            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">🛍️</div>
                            <h4 style="margin: 0; color: #10b981; font-size: 0.95rem;">MarketPlace</h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Tukar poin</p>
                        </div>
                        <div class="quick-action-card" onclick="handleNavigation('transfer', 'mahasiswa')" style="background: rgba(245, 158, 11, 0.05); padding: 1.25rem; border-radius: 16px; cursor: pointer; border: 1px solid rgba(245, 158, 11, 0.1);">
                            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">💸</div>
                            <h4 style="margin: 0; color: #f59e0b; font-size: 0.95rem;">Transfer Poin</h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Kirim ke teman</p>
                        </div>
                        <div class="quick-action-card" onclick="handleNavigation('scan', 'mahasiswa')" style="background: rgba(99, 102, 241, 0.05); padding: 1.25rem; border-radius: 16px; cursor: pointer; border: 1px solid rgba(99, 102, 241, 0.1);">
                            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">📸</div>
                            <h4 style="margin: 0; color: var(--primary); font-size: 0.95rem;">Pindai QR</h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Bayar via scan</p>
                        </div>
                        <div class="quick-action-card" onclick="handleNavigation('history', 'mahasiswa')" style="background: rgba(107, 114, 128, 0.05); padding: 1.25rem; border-radius: 16px; cursor: pointer; border: 1px solid rgba(107, 114, 128, 0.1);">
                            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">📑</div>
                            <h4 style="margin: 0; color: #4b5563; font-size: 0.95rem;">Buku Kas</h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Riwayat transaksi</p>
                        </div>
                    </div>
                </div>

                <div class="card fade-in" style="padding: 2rem; background: #ffffff; color: var(--text-main); border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; border-top: 6px solid var(--primary);">
                    <div>
                        <h4 style="color: var(--primary); margin-bottom: 1rem; font-weight: 700;">Tips Hari Ini 💡</h4>
                        <p id="dailyTip" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-muted);">Lakukan kuis setiap minggu untuk mempertahankan streak perolehan poin Anda!</p>
                    </div>
                    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9;">
                        <button class="btn btn-primary" style="width: 100%; padding: 1rem; border-radius: 15px; font-weight: 700;" onclick="handleNavigation('missions', 'mahasiswa')">
                            Mulai Misi Sekarang
                        </button>
                    </div>
                </div>
            </div>
        `;
        loadStudentStats();
    } else if (user.role === 'merchant') {
        content.innerHTML = dashboardHeader + `
            <div class="stats-grid">
                <div class="stat-card card-gradient-1">
                    <span class="stat-label">Total Penjualan Hari Ini</span>
                    <div class="stat-value" id="stats-merchant-sales">--</div>
                    <div class="stat-trend" style="color:var(--primary)">Poin Terkumpul</div>
                </div>
                <div class="stat-card card-gradient-2">
                    <span class="stat-label">Jumlah Transaksi</span>
                    <div class="stat-value" id="stats-merchant-count">--</div>
                    <div class="stat-trend" style="color:var(--secondary)">Sesi Berhasil</div>
                </div>
                 <div class="stat-card card-gradient-3">
                    <span class="stat-label">Saldo Emerald (Kredit)</span>
                    <div class="stat-value" id="stats-merchant-balance">--</div>
                    <div class="stat-trend" style="color:var(--success)">Total Kredit Masuk</div>
                </div>
            </div>

            <div class="card fade-in" style="margin-top: 2rem; padding: 2.5rem; text-align: center; background: white; border: 1px solid var(--primary-light); border-radius:30px;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🏧</div>
                <h2 style="font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">Dashboard Merchant WalletPoint</h2>
                <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto;">Selamat datang! Anda dapat melihat riwayat penjualan dan statistik toko Anda di sini.</p>
            </div>
        `;
        MerchantController.loadMerchantStats();
    }
}

async function loadStudentStats() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const [walletRes, missionsRes, subsRes] = await Promise.all([
            API.getWallet(user.id),
            API.getMissions(),
            API.getSubmissions({ status: 'approved' })
        ]);

        if (document.getElementById('userBalance')) document.getElementById('userBalance').textContent = walletRes.data.balance.toLocaleString();
        if (document.getElementById('stats-missions-done')) document.getElementById('stats-missions-done').textContent = (subsRes.data.submissions || []).filter(s => s.student_id === user.id).length;
        if (document.getElementById('stats-active-missions')) document.getElementById('stats-active-missions').textContent = (missionsRes.data.missions || []).length;

        // Random Tip
        const tips = [
            "Selesaikan misi harian untuk poin bonus rutin!",
            "Cek MarketPlace secara berkala untuk promo terbatas.",
            "Gunakan fitur transfer untuk berbagi poin dengan teman kelompok.",
            "Misi Quiz memiliki tenggat waktu, jangan sampai terlewat!",
            "Pantau Buku Kas untuk memastikan seluruh saldo Anda aman."
        ];
        const tipElem = document.getElementById('dailyTip');
        if (tipElem) tipElem.textContent = tips[Math.floor(Math.random() * tips.length)];

    } catch (e) { console.error(e); }
}

async function loadDosenQuickReview() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await API.getDosenSubmissions({ status: 'pending', limit: 3, creator_id: user.id });
        const submissions = res.data.submissions || [];
        const container = document.getElementById('quickReviewList');
        if (!container) return;

        if (submissions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted); background: #f8fafc; border-radius: 16px;">
                    <div>🎉</div>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem;">Semua tugas telah diperiksa!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = submissions.map(s => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #ffffff; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: transform 0.2s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                    <div style="width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);">
                        ${s.student_name ? s.student_name.charAt(0) : 'S'}
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${s.student_name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${s.mission_title}</div>
                    </div>
                </div>
                <button class="btn btn-sm" onclick="handleNavigation('submissions', 'dosen')" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 10px; background: var(--bg-main); color: var(--primary); border: 1px solid var(--border); font-weight: 600;">Periksa</button>
            </div>
        `).join('');

    } catch (e) { console.error(e); }
}

function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    } else {
        sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }
}
