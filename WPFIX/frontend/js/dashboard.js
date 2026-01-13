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

        // Render Navigation based on Role
        renderNavigation(user.role);

        // Render Dashboard Content
        renderDashboard(user);

    } catch (error) {
        console.error('Dashboard Init Error:', error);
        // If profile fetch fails heavily, might redirect to login (handled in API.getProfile)
    }
});

function updateUserProfile(user) {
    document.getElementById('userName').textContent = user.name || user.email;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userAvatar').textContent = (user.name || user.email).charAt(0).toUpperCase();
}

function renderNavigation(role) {
    const nav = document.getElementById('sidebarNav');
    let items = [];

    // Common Items
    items.push({ label: 'Dashboard', href: '#dashboard', active: true });

    if (role === 'admin') {
        items.push(
            { label: 'User Management', href: '#users' },
            { label: 'Wallets', href: '#wallets' },
            { label: 'Transactions', href: '#transactions' },
            { label: 'Marketplace', href: '#products' },
            { label: 'Audit Logs', href: '#audit' }
        );
    } else if (role === 'dosen') {
        items.push(
            { label: 'My Missions', href: '#missions' },
            { label: 'Student Submissions', href: '#submissions' }
        );
    } else if (role === 'mahasiswa') {
        items.push(
            { label: 'Available Missions', href: '#missions' },
            { label: 'Marketplace', href: '#shop' },
            { label: 'Points History', href: '#history' }
        );
    }

    nav.innerHTML = items.map(item => `
        <a href="${item.href}" class="nav-item ${item.active ? 'active' : ''}" data-target="${item.href.substring(1)}">
            ${item.label}
        </a>
    `).join('');

    // Add click listeners
    nav.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update Active State
            nav.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Handle Navigation
            const target = link.dataset.target;
            handleNavigation(target, role);
        });
    });
}

function handleNavigation(target, role) {
    const title = document.getElementById('pageTitle');
    title.textContent = target.charAt(0).toUpperCase() + target.slice(1).replace('-', ' ');

    if (role === 'admin') {
        switch (target) {
            case 'users':
                AdminController.renderUsers();
                break;
            case 'wallets':
                AdminController.renderWallets();
                break;
            case 'transactions':
                AdminController.renderTransactions();
                break;
            case 'products':
                AdminController.renderProducts();
                break;
            case 'audit':
                AdminController.renderAuditLogs();
                break;
            default:
                // Fallback to dashboard
                renderDashboard({ role: 'admin' });
                title.textContent = 'Admin Dashboard';
                AdminController.loadDashboardStats();
        }
    } else if (role === 'dosen') {
        switch (target) {
            case 'missions':
                DosenController.renderMissions();
                break;
            case 'submissions':
                DosenController.renderSubmissions();
                break;
            default:
                renderDashboard({ role: 'dosen' });
        }
    } else if (role === 'mahasiswa') {
        switch (target) {
            case 'missions':
                MahasiswaController.renderMissions();
                break;
            case 'shop':
                MahasiswaController.renderShop();
                break;
            case 'history':
                MahasiswaController.renderHistory();
                break;
            default:
                renderDashboard({ role: 'mahasiswa' });
        }
    }
}


function renderDashboard(user) {
    const content = document.getElementById('mainContent');
    const title = document.getElementById('pageTitle');

    title.textContent = `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`;

    if (user.role === 'admin') {
        content.innerHTML = `
            <div class="grid-container">
                <div class="card">
                    <div class="stat-label">Total Users</div>
                    <div class="stat-value">--</div>
                    <div class="stat-trend">Active users in system</div>
                </div>
                <div class="card">
                    <div class="stat-label">Total Transactions</div>
                    <div class="stat-value">--</div>
                    <div class="stat-trend">All time</div>
                </div>
                <div class="card">
                    <div class="stat-label">System Health</div>
                    <div class="stat-value" style="color: var(--success)">OK</div>
                    <div class="stat-trend">All services running</div>
                </div>
            </div>
            
            <div class="table-container">
                <div class="table-header">
                    <h3>Quick Actions</h3>
                </div>
                <div style="padding: 1.5rem;">
                    <p>Select a module from the sidebar to manage the system.</p>
                </div>
            </div>
        `;
    } else if (user.role === 'mahasiswa') {
        content.innerHTML = `
            <div class="grid-container">
                <div class="card">
                    <div class="stat-label">My Points</div>
                    <div class="stat-value">0</div>
                    <div class="stat-trend trend-up">Available Balance</div>
                </div>
                <div class="card">
                    <div class="stat-label">Completed Missions</div>
                    <div class="stat-value">0</div>
                    <div class="stat-trend">Keep it up!</div>
                </div>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="grid-container">
                <div class="card">
                    <div class="stat-label">Active Missions</div>
                    <div class="stat-value">0</div>
                    <div class="stat-trend">Created by you</div>
                </div>
            </div>
        `;
    }
}
