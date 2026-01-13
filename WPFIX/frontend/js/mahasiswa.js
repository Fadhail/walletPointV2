/* Mahasiswa Dashboard Features */

class MahasiswaController {
    static async renderMissions() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-header" style="margin-bottom: 2rem;">
                <h3>Available Missions</h3>
            </div>
            <div id="missionsList" class="item-grid">
                <p class="text-center">Loading available missions...</p>
            </div>
        `;

        try {
            const result = await API.getStudentMissions({ status: 'active' });
            const missions = result.data.missions || [];

            const list = document.getElementById('missionsList');
            if (missions.length === 0) {
                list.innerHTML = '<p class="text-center">No active missions available right now. Check back later!</p>';
                return;
            }

            list.innerHTML = missions.map(m => `
                <div class="mission-card">
                    <div class="card-image">
                        <span>${m.type.toUpperCase()}</span>
                    </div>
                    <div class="card-content">
                        <h4 class="card-title">${m.title}</h4>
                        <p class="card-desc">${m.description || 'No description provided.'}</p>
                        <div class="card-footer">
                            <span class="points-tag">${m.points} Points</span>
                            <button class="btn btn-primary" style="padding: 0.4rem 0.8rem;" onclick="MahasiswaController.showSubmitModal(${m.id}, '${m.title}')">Submit</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }

    static showSubmitModal(missionId, title) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-content">
                    <h3>Submit Mission: ${title}</h3>
                    <form id="submissionForm" onsubmit="MahasiswaController.handleSubmit(event, ${missionId})">
                        <div class="form-group">
                            <label>Submission Content / Link</label>
                            <textarea name="content" required placeholder="Paste your work here or a link to your file..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>File URL (Optional)</label>
                            <input type="text" name="file_url" placeholder="http://...">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Now</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleSubmit(e, missionId) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.mission_id = missionId;

        try {
            await API.submitMission(data);
            closeModal();
            alert('Mission submitted successfully! Waiting for lecturer review.');
            MahasiswaController.renderMissions();
        } catch (error) {
            alert(error.message);
        }
    }

    static async renderShop() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-header" style="margin-bottom: 2rem;">
                <h3>Marketplace</h3>
            </div>
            <div id="productList" class="item-grid">
                <p class="text-center">Loading products...</p>
            </div>
        `;

        try {
            const result = await API.getProducts({ status: 'active' });
            const products = result.data.products || [];

            const list = document.getElementById('productList');
            if (products.length === 0) {
                list.innerHTML = '<p class="text-center">Marketplace is empty right now.</p>';
                return;
            }

            list.innerHTML = products.map(p => `
                <div class="product-card">
                    <div class="card-image" style="background-image: url('${p.image_url || ''}'); background-size: cover;">
                        ${!p.image_url ? '📦' : ''}
                    </div>
                    <div class="card-content">
                        <h4 class="card-title">${p.name}</h4>
                        <p class="card-desc">${p.description || ''}</p>
                        <div class="card-footer">
                            <span class="points-tag">${p.price} pts</span>
                            <button class="btn btn-primary" onclick="MahasiswaController.buyProduct(${p.id}, '${p.name}', ${p.price})" ${p.stock <= 0 ? 'disabled' : ''}>
                                ${p.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                            </button>
                        </div>
                        <p style="font-size: 0.75rem; color: #999; margin-top: 0.5rem;">Stock: ${p.stock}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }

    static async buyProduct(id, name, price) {
        if (!confirm(`Buy ${name} for ${price} points?`)) return;

        try {
            // Need to implement buyProduct in API.js but for now we'll call student endpoint
            await API.request('/mahasiswa/purchase', 'POST', { product_id: id });
            alert('Purchase successful!');
            MahasiswaController.renderShop();
        } catch (error) {
            alert(error.message);
        }
    }

    static async renderHistory() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>Points History</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table id="historyTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Loading history...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            // Reusing transaction monitoring but filtered for self (backend should handle this)
            // Ideally: GET /mahasiswa/wallet/transactions
            const profile = JSON.parse(localStorage.getItem('user'));
            const result = await API.getAllTransactions({ user_id: profile.id });
            const txns = result.data.transactions || [];

            const tbody = document.querySelector('#historyTable tbody');
            if (txns.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No transaction history found.</td></tr>';
                return;
            }

            tbody.innerHTML = txns.map(t => `
                <tr>
                    <td>${new Date(t.created_at).toLocaleDateString()}</td>
                    <td>${t.description}</td>
                    <td><small>${t.type}</small></td>
                    <td class="${t.direction === 'credit' ? 'trend-up' : 'trend-down'}" style="font-weight: bold;">
                        ${t.direction === 'credit' ? '+' : '-'}${t.amount}
                    </td>
                    <td><span class="status-badge status-active">${t.status}</span></td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }
}
