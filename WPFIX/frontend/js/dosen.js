/* Dosen Dashboard Features */

class DosenController {
    static async renderMissions() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>My Missions</h3>
                    <button class="btn btn-primary" onclick="DosenController.showMissionModal()">+ Create Mission</button>
                </div>
                <div style="overflow-x: auto;">
                    <table id="dosenMissionsTable">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Points</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="6" class="text-center">Loading...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getDosenMissions();
            const missions = result.data.missions || [];

            const tbody = document.querySelector('#dosenMissionsTable tbody');
            if (missions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">You haven\'t created any missions yet.</td></tr>';
                return;
            }

            tbody.innerHTML = missions.map(m => `
                <tr>
                    <td>
                        <strong>${m.title}</strong><br>
                        <small>${m.description || ''}</small>
                    </td>
                    <td style="text-transform: capitalize;">${m.type}</td>
                    <td style="font-weight:bold">${m.points} pts</td>
                    <td>${m.deadline ? new Date(m.deadline).toLocaleDateString() : 'No Deadline'}</td>
                    <td><span class="status-badge ${m.status === 'active' ? 'status-active' : 'status-expired'}">${m.status}</span></td>
                    <td>
                        <button class="btn-icon" onclick="DosenController.showMissionModal(${m.id})" title="Edit">✏️</button>
                        <button class="btn-icon" style="color:red" onclick="DosenController.deleteMission(${m.id})" title="Delete">🗑️</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }

    static async showMissionModal(id = null) {
        let mission = null;
        if (id) {
            try {
                // Ideally we have a GetMissionByID but for now we can find in list or call detail
                const res = await API.request(`/missions/${id}`, 'GET');
                mission = res.data;
            } catch (e) { console.error(e); }
        }

        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-content">
                    <h3>${id ? 'Edit Mission' : 'Create New Mission'}</h3>
                    <form id="missionForm" onsubmit="DosenController.handleMissionSubmit(event, ${id})">
                        <div class="form-group">
                            <label>Mission Title</label>
                            <input type="text" name="title" value="${mission?.title || ''}" required placeholder="e.g. Quiz Pekan 1">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea name="description" placeholder="Instructions for students...">${mission?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Mission Type</label>
                            <select name="type">
                                <option value="quiz" ${mission?.type === 'quiz' ? 'selected' : ''}>Quiz</option>
                                <option value="task" ${mission?.type === 'task' ? 'selected' : ''}>Task</option>
                                <option value="assignment" ${mission?.type === 'assignment' ? 'selected' : ''}>Assignment</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Reward Points</label>
                            <input type="number" name="points" value="${mission?.points || 10}" required min="1">
                        </div>
                        <div class="form-group">
                            <label>Deadline (Optional)</label>
                            <input type="datetime-local" name="deadline" value="${mission?.deadline ? mission.deadline.substring(0, 16) : ''}">
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

    static async handleMissionSubmit(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.points = parseInt(data.points);
        if (!data.deadline) delete data.deadline;
        else data.deadline = new Date(data.deadline).toISOString();

        try {
            if (id) {
                await API.updateMission(id, data);
            } else {
                await API.createMission(data);
            }
            closeModal();
            DosenController.renderMissions();
            alert(`Mission ${id ? 'updated' : 'created'} successfully`);
        } catch (error) {
            alert(error.message);
        }
    }

    static async deleteMission(id) {
        if (!confirm('Are you sure you want to delete this mission?')) return;
        try {
            await API.deleteMission(id);
            DosenController.renderMissions();
        } catch (error) {
            alert(error.message);
        }
    }

    static async renderSubmissions() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>Student Submissions</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table id="submissionsTable">
                        <thead>
                            <tr>
                                <th>Mission</th>
                                <th>Student</th>
                                <th>Submitted At</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody><tr><td colspan="5" class="text-center">Loading...</td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const result = await API.getSubmissions({ status: 'pending' });
            const subs = result.data.submissions || [];

            const tbody = document.querySelector('#submissionsTable tbody');
            if (subs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No pending submissions to review.</td></tr>';
                return;
            }

            tbody.innerHTML = subs.map(s => `
                <tr>
                    <td>${s.mission_title}</td>
                    <td>${s.student_name} <br> <small>${s.student_nim}</small></td>
                    <td>${new Date(s.created_at).toLocaleString()}</td>
                    <td><span class="status-badge status-pending">${s.status}</span></td>
                    <td>
                        <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="DosenController.showReviewModal(${s.id}, '${s.student_name}')">Review</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }

    static showReviewModal(subId, studentName) {
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal(event)">
                <div class="modal-content">
                    <h3>Review Submission: ${studentName}</h3>
                    <form id="reviewForm" onsubmit="DosenController.handleReview(event, ${subId})">
                        <div class="form-group">
                            <label>Decision</label>
                            <select name="status">
                                <option value="approved">Approve & Reward</option>
                                <option value="rejected">Reject</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Score (0-100)</label>
                            <input type="number" name="score" value="100" min="0" max="100" required>
                        </div>
                        <div class="form-group">
                            <label>Review Note</label>
                            <textarea name="review_note" placeholder="Feedback for student..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Review</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static async handleReview(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.score = parseInt(data.score);

        try {
            await API.reviewSubmission(id, data);
            closeModal();
            DosenController.renderSubmissions();
            alert('Review submitted successfully');
        } catch (error) {
            alert(error.message);
        }
    }
}
