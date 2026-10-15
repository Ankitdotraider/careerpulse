/**
 * CAREERPULSE — ADMINISTRATOR CONTROLLER & PLATFORM GOVERNANCE
 * User Management CRUD, Job Moderation Queue, Analytics Telemetry, Real-time Activity, System Settings
 */

const Admin = {
  activeTab: 'admin-users',
  charts: {},

  init() {
    this.renderUsers();
    this.renderModerationQueue();
    this.renderStatistics();
    this.renderActivityLogs();
    this.populateSettingsForm();
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('#panel-admin .dashboard-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#panel-admin .tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${tabId}`);
    });

    if (tabId === 'admin-users') this.renderUsers();
    if (tabId === 'admin-moderation') this.renderModerationQueue();
    if (tabId === 'admin-telemetry') this.renderStatistics();
    if (tabId === 'admin-activity') this.renderActivityLogs();
    if (tabId === 'admin-settings') this.populateSettingsForm();
  },

  // ================= 1. USER MANAGEMENT (CRUD) =================
  renderUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    const usersCountBadge = document.getElementById('admin-users-count');
    if (!tbody) return;

    const users = DataStore.getUsers();
    if (usersCountBadge) usersCountBadge.textContent = users.length;

    tbody.innerHTML = users.map(user => {
      const roleBadgeClass = user.role === 'admin' ? 'badge-danger' :
                             user.role === 'employer' ? 'badge-info' : 'badge-primary';
      const statusBadgeClass = user.status === 'Active' ? 'badge-success' : 'badge-warning';

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="user-avatar ${user.role === 'employer' ? 'emp-avatar' : user.role === 'admin' ? 'admin-avatar' : ''}">
                ${user.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <strong>${user.name}</strong>
                <div class="text-muted" style="font-size: 0.78rem;">${user.email}</div>
              </div>
            </div>
          </td>
          <td><span class="badge ${roleBadgeClass}">${user.role.toUpperCase()}</span></td>
          <td>${user.company || user.title || 'General Account'}</td>
          <td><span class="badge ${statusBadgeClass}">${user.status || 'Active'}</span></td>
          <td>${user.joinedDate || '2026-01-01'}</td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-sm btn-outline-secondary" onclick="Admin.openEditUserModal('${user.id}')" title="Edit User">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              ${user.id !== 'usr-admin-1' ? `
                <button class="btn btn-sm btn-outline-danger" onclick="Admin.handleDeleteUser('${user.id}')" title="Delete User">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openCreateUserModal() {
    document.getElementById('admin-user-modal-title').textContent = 'Create User Account';
    document.getElementById('admin-edit-user-id').value = '';
    document.getElementById('admin-user-name').value = '';
    document.getElementById('admin-user-email').value = '';
    document.getElementById('admin-user-role').value = 'seeker';
    document.getElementById('admin-user-status').value = 'Active';
    document.getElementById('admin-user-org').value = '';
    App.openModal('modal-admin-user');
  },

  openEditUserModal(userId) {
    const user = DataStore.getUsers().find(u => u.id === userId);
    if (!user) return;

    document.getElementById('admin-user-modal-title').textContent = 'Edit User Account';
    document.getElementById('admin-edit-user-id').value = user.id;
    document.getElementById('admin-user-name').value = user.name;
    document.getElementById('admin-user-email').value = user.email;
    document.getElementById('admin-user-role').value = user.role;
    document.getElementById('admin-user-status').value = user.status || 'Active';
    document.getElementById('admin-user-org').value = user.company || user.title || '';
    App.openModal('modal-admin-user');
  },

  handleSaveUser(e) {
    e.preventDefault();
    const editId = document.getElementById('admin-edit-user-id').value;
    const name = document.getElementById('admin-user-name').value;
    const email = document.getElementById('admin-user-email').value;
    const role = document.getElementById('admin-user-role').value;
    const status = document.getElementById('admin-user-status').value;
    const org = document.getElementById('admin-user-org').value;

    const userPayload = {
      name,
      email,
      role,
      status
    };

    if (role === 'employer') {
      userPayload.company = org || 'Tech Corporation';
    } else {
      userPayload.title = org || 'Professional';
    }

    if (editId) {
      userPayload.id = editId;
      DataStore.saveUser(userPayload);
      App.showToast(`User account "${name}" updated successfully!`, 'success');
    } else {
      DataStore.saveUser(userPayload);
      App.showToast(`New user account "${name}" created successfully!`, 'success');
    }

    App.closeModal('modal-admin-user');
    this.renderUsers();
    this.renderStatistics();
  },

  handleDeleteUser(userId) {
    const user = DataStore.getUsers().find(u => u.id === userId);
    if (confirm(`Are you sure you want to delete user account "${user.name}"?`)) {
      DataStore.deleteUser(userId);
      App.showToast(`User account "${user.name}" deleted.`, 'info');
      this.renderUsers();
      this.renderStatistics();
    }
  },

  // ================= 2. JOB MODERATION & APPROVAL ENGINE =================
  renderModerationQueue() {
    const tbody = document.getElementById('admin-moderation-tbody');
    const pendingBadge = document.getElementById('admin-pending-badge');
    if (!tbody) return;

    const allJobs = DataStore.getAllJobs();
    const pendingJobs = allJobs.filter(j => j.approvalStatus === 'Pending');

    if (pendingBadge) {
      pendingBadge.textContent = `${pendingJobs.length} Pending`;
      pendingBadge.style.display = pendingJobs.length > 0 ? 'inline-block' : 'none';
    }

    tbody.innerHTML = allJobs.map(job => {
      const approvalBadge = job.approvalStatus === 'Approved' ? 'badge-success' :
                           job.approvalStatus === 'Pending'  ? 'badge-warning' : 'badge-danger';

      return `
        <tr>
          <td>
            <div class="table-title-cell">
              <strong>${job.title}</strong>
              <span>${job.company}</span>
            </div>
          </td>
          <td>
            <span class="meta-chip">${job.department}</span>
            <span class="meta-chip">${job.location}</span>
          </td>
          <td>${job.company}</td>
          <td><strong>${job.salary}</strong></td>
          <td><span class="badge ${approvalBadge}">${job.approvalStatus}</span></td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-sm btn-primary" onclick="Admin.handleModerationDecision('${job.id}', 'Approved')" ${job.approvalStatus === 'Approved' ? 'disabled' : ''}>
                ✓ Approve
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="Admin.handleModerationDecision('${job.id}', 'Rejected')" ${job.approvalStatus === 'Rejected' ? 'disabled' : ''}>
                ✕ Reject
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  handleModerationDecision(jobId, decision) {
    DataStore.updateJobApproval(jobId, decision);
    App.showToast(`Job listing marked as "${decision}"!`, decision === 'Approved' ? 'success' : 'warning');
    this.renderModerationQueue();
    this.renderStatistics();
    if (JobSeeker) JobSeeker.applyFilters();
    if (Employer) Employer.renderJobs();
  },

  // ================= 3. SYSTEM TELEMETRY & STATISTICS =================
  renderStatistics() {
    const totalUsersStat = document.getElementById('admin-stat-total-users');
    const totalJobsStat = document.getElementById('admin-stat-total-jobs');
    const totalAppsStat = document.getElementById('admin-stat-total-apps');
    const approvalRateStat = document.getElementById('admin-stat-approval-rate');

    const users = DataStore.getUsers();
    const jobs = DataStore.getAllJobs();
    const apps = DataStore.getApplications();

    const approvedCount = jobs.filter(j => j.approvalStatus === 'Approved').length;
    const approvalRate = jobs.length > 0 ? Math.round((approvedCount / jobs.length) * 100) : 100;

    if (totalUsersStat) totalUsersStat.textContent = users.length;
    if (totalJobsStat) totalJobsStat.textContent = jobs.length;
    if (totalAppsStat) totalAppsStat.textContent = apps.length;
    if (approvalRateStat) approvalRateStat.textContent = `${approvalRate}%`;

    if (typeof Chart === 'undefined') return;

    // Chart 1: Platform Growth Trends
    const ctxGrowth = document.getElementById('chart-admin-growth');
    if (ctxGrowth) {
      if (this.charts.growth) this.charts.growth.destroy();

      this.charts.growth = new Chart(ctxGrowth, {
        type: 'line',
        data: {
          labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          datasets: [
            {
              label: 'Job Postings',
              data: [12, 19, 25, 38, 52, 70],
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Applications',
              data: [45, 80, 140, 220, 310, 480],
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // Chart 2: User Roles Distribution
    const ctxRoles = document.getElementById('chart-admin-roles');
    if (ctxRoles) {
      if (this.charts.roles) this.charts.roles.destroy();

      const seekers = users.filter(u => u.role === 'seeker').length;
      const employers = users.filter(u => u.role === 'employer').length;
      const admins = users.filter(u => u.role === 'admin').length;

      this.charts.roles = new Chart(ctxRoles, {
        type: 'doughnut',
        data: {
          labels: ['Job Seekers', 'Employers', 'Administrators'],
          datasets: [{
            data: [seekers, employers, admins],
            backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  },

  // ================= 4. REAL-TIME ACTIVITY STREAM =================
  renderActivityLogs() {
    const feed = document.getElementById('admin-activity-feed');
    if (!feed) return;

    const data = DataStore.get();
    const logs = data.activityLogs || [];

    feed.innerHTML = logs.map(log => `
      <div class="activity-item">
        <div class="activity-icon" style="background: rgba(99, 102, 241, 0.12); color: var(--primary);">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="activity-desc">
          <span>${log.text}</span>
        </div>
        <span class="badge ${log.badgeClass || 'badge-primary'}">${log.type.toUpperCase()}</span>
        <div class="activity-time">${log.timestamp}</div>
      </div>
    `).join('');
  },

  // ================= 5. SYSTEM SETTINGS =================
  populateSettingsForm() {
    const settings = DataStore.get().settings;
    if (!settings) return;

    const nameInput = document.getElementById('setting-site-name');
    const emailInput = document.getElementById('setting-contact-email');
    const currInput = document.getElementById('setting-currency');
    const apprInput = document.getElementById('setting-require-approval');
    const notifyInput = document.getElementById('setting-auto-notify');
    const maintInput = document.getElementById('setting-maintenance-mode');

    if (nameInput) nameInput.value = settings.siteName || 'CareerPulse Portal';
    if (emailInput) emailInput.value = settings.contactEmail || 'admin@careerpulse.io';
    if (currInput) currInput.value = settings.currency || 'USD';
    if (apprInput) apprInput.checked = !!settings.requireApproval;
    if (notifyInput) notifyInput.checked = !!settings.autoNotify;
    if (maintInput) maintInput.checked = !!settings.maintenanceMode;
  },

  handleSaveSettings(e) {
    e.preventDefault();
    const newSettings = {
      siteName: document.getElementById('setting-site-name').value,
      contactEmail: document.getElementById('setting-contact-email').value,
      currency: document.getElementById('setting-currency').value,
      requireApproval: document.getElementById('setting-require-approval').checked,
      autoNotify: document.getElementById('setting-auto-notify').checked,
      maintenanceMode: document.getElementById('setting-maintenance-mode').checked
    };

    DataStore.saveSettings(newSettings);
    App.showToast('System configuration saved successfully!', 'success');
  }
};
