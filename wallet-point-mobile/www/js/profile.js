class ProfileController {
    static async renderProfile() {
        const content = document.getElementById('mainContent');
        const user = JSON.parse(localStorage.getItem('user')) || {};

        content.innerHTML = `
            <div class="fade-in">
                <!-- Profile Header -->
                <div class="card card-gradient-1" style="display: flex; flex-direction: column; align-items: center; padding: 2.5rem; margin-bottom: 2rem; border-radius: 30px; text-align: center; box-shadow: var(--shadow-lg);">
                    <div class="user-avatar" style="width: 110px; height: 110px; font-size: 3rem; background: var(--primary); color: white; border: 4px solid #f8fafc; margin-bottom: 1.5rem; box-shadow: var(--shadow-md);">
                        ${(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style="color: var(--text-main)">
                        <h2 style="margin:0; font-size: 1.8rem; font-weight: 800;">${user.full_name || 'User'}</h2>
                        <div style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
                            <span style="background: #f1f5f9; color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${user.role}</span>
                            <span style="opacity: 0.8; font-size: 0.95rem;">•</span>
                            <span style="opacity: 0.9; font-size: 0.95rem; font-weight: 600; color: var(--text-muted);">ID: ${user.nim_nip || user.id}</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid-split">
                    <!-- Basic Info -->
                    <div class="card" style="margin:0; padding: 0; border: 1px solid var(--border); overflow: hidden; border-radius: 24px; background: white;">
                        <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); background: #f8fafc;">
                            <h3 style="margin:0; font-size: 1.1rem; font-weight: 700;">👤 Informasi Akun</h3>
                        </div>
                        <div style="padding: 2rem;">
                            <form id="profileForm" onsubmit="ProfileController.handleUpdateProfile(event)">
                                <div class="form-group">
                                    <label style="font-weight: 600; color: var(--text-main);">Nama Lengkap</label>
                                    <input type="text" name="full_name" value="${user.full_name}" required style="border-radius: 12px; padding: 0.8rem; border: 1px solid var(--border); width: 100%; box-sizing: border-box;">
                                </div>
                                <div class="form-group">
                                    <label style="font-weight: 600; color: var(--text-main);">Alamat Email</label>
                                    <input type="email" value="${user.email}" disabled style="opacity: 0.6; cursor: not-allowed; border-radius: 12px; padding: 0.8rem; border: 1px solid var(--border); width: 100%; box-sizing: border-box; background: #f1f5f9;">
                                    <small style="color:var(--text-muted); display: block; margin-top: 0.5rem;">Email dikelola oleh sistem Administrator.</small>
                                </div>
                                <div style="margin-top: 2rem">
                                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; border-radius: 14px; font-weight: 700; background: var(--primary); border: none;">Simpan Perubahan</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 2rem;">
                        <!-- Change Password -->
                        <div class="card" style="margin:0; padding: 0; border: 1px solid var(--border); overflow: hidden; border-radius: 24px; background: white;">
                            <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); background: #f8fafc;">
                                <h3 style="margin:0; font-size: 1.1rem; font-weight: 700;">🔒 Keamanan</h3>
                            </div>
                            <div style="padding: 2rem;">
                                <form id="passwordForm" onsubmit="ProfileController.handleUpdatePassword(event)">
                                    <div class="form-group">
                                        <label style="font-weight: 600; color: var(--text-main);">Sandi Saat Ini</label>
                                        <input type="password" name="old_password" required placeholder="••••••••" style="border-radius: 12px; padding: 0.8rem; border: 1px solid var(--border); width: 100%; box-sizing: border-box;">
                                    </div>
                                    <div class="form-group">
                                        <label style="font-weight: 600; color: var(--text-main);">Sandi Baru</label>
                                        <input type="password" name="new_password" required placeholder="••••••••" minlength="6" style="border-radius: 12px; padding: 0.8rem; border: 1px solid var(--border); width: 100%; box-sizing: border-box;">
                                    </div>
                                    <div class="form-actions" style="margin-top: 1.5rem">
                                        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; border-radius: 14px; font-weight: 700; background: var(--secondary); border: none;">Ganti Sandi</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Logout Button for Mobile/Profile Context -->
                        <button onclick="API.logout()" class="btn" style="padding: 1rem; border-radius: 16px; background: #fee2e2; color: #ef4444; font-weight: 700; border: 1px solid #fecaca; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: 0.2s;">
                           <span>🚪</span> Keluar dari Sesi
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static async handleUpdateProfile(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await API.updateProfile(data);
            showToast("Profil berhasil diperbarui");

            // Update local storage
            const user = JSON.parse(localStorage.getItem('user'));
            user.full_name = res.data.full_name;
            localStorage.setItem('user', JSON.stringify(user));

            // Update UI sidebar
            updateUserProfile(user);
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    static async handleUpdatePassword(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const confirm = document.getElementById('confirm_password').value;

        if (data.new_password !== confirm) {
            showToast("Kata sandi tidak cocok", "error");
            return;
        }

        try {
            await API.updatePassword(data);
            showToast("Kata sandi berhasil diperbarui");
            e.target.reset();
        } catch (error) {
            showToast(error.message, "error");
        }
    }
}
