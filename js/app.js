/**
 * CAREERPULSE — CORE APPLICATION ORCHESTRATOR & ROUTER
 * Handles navigation, role switching, dark/light theme, notifications, toasts & hero search
 */

const App = {
  currentView: 'home',

  init() {
    this.initTheme();
    this.updateHeaderUser();
    this.renderHomeFeaturedJobs();
    this.renderNotifications();
    this.updateRolePillHighlights();

    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleHashRoute());

    // Listen to DataStore changes
    window.addEventListener('careerpulse_data_changed', () => {
      this.updateHeaderUser();
      this.renderNotifications();
      this.renderHomeFeaturedJobs();
    });

    // Parse initial route
    this.handleHashRoute();

    // Initialize all controllers
    if (window.JobSeeker) JobSeeker.init();
    if (window.Employer) Employer.init();
    if (window.Admin) Admin.init();

    // Simulated real-time activity tick every 30 seconds
    setInterval(() => {
      this.generateSimulatedActivity();
    }, 30000);
  },

  handleHashRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (['home', 'explore-jobs', 'dashboard'].includes(hash)) {
      this.navigate(hash, false);
    } else {
      this.navigate('home', false);
    }
  },

  navigate(viewName, updateHash = true) {
    this.currentView = viewName;

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update main nav links
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.nav === viewName);
    });

    if (updateHash) {
      window.location.hash = viewName;
    }

    // View specific activations
    if (viewName === 'explore-jobs') {
      if (window.JobSeeker) JobSeeker.applyFilters();
    } else if (viewName === 'dashboard') {
      this.refreshCurrentDashboard();
    } else if (viewName === 'home') {
      this.renderHomeFeaturedJobs();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  refreshCurrentDashboard() {
    const user = DataStore.getActiveUser();
    
    // Toggle active dashboard panel
    const panelSeeker = document.getElementById('panel-seeker');
    const panelEmployer = document.getElementById('panel-employer');
    const panelAdmin = document.getElementById('panel-admin');

    if (panelSeeker) panelSeeker.style.display = user.role === 'seeker' ? 'block' : 'none';
    if (panelEmployer) panelEmployer.style.display = user.role === 'employer' ? 'block' : 'none';
    if (panelAdmin) panelAdmin.style.display = user.role === 'admin' ? 'block' : 'none';

    // Update dashboard title in nav
    const navDashTitle = document.getElementById('nav-dashboard-title');
    if (navDashTitle) {
      navDashTitle.textContent = user.role === 'seeker' ? 'Seeker Portal' :
                                 user.role === 'employer' ? 'Employer Hub' : 'Admin Console';
    }

    if (user.role === 'seeker' && window.JobSeeker) {
      JobSeeker.init();
    } else if (user.role === 'employer' && window.Employer) {
      Employer.init();
      // Update employer banner name
      const empBannerName = document.getElementById('emp-banner-name');
      const empBannerSubtitle = document.getElementById('emp-banner-subtitle');
      if (empBannerName) empBannerName.textContent = `${user.name} • ${user.company || 'Enterprise'}`;
      if (empBannerSubtitle) empBannerSubtitle.textContent = `${user.title || 'Talent Lead'} • Verified Partner`;
    } else if (user.role === 'admin' && window.Admin) {
      Admin.init();
    }
  },

  // ================= SWITCH USER / ROLE DEMO =================
  switchUser(userId) {
    DataStore.setActiveUserId(userId);
    const user = DataStore.getActiveUser();

    this.updateHeaderUser();
    this.updateRolePillHighlights();
    this.showToast(`Switched active identity to ${user.name} (${user.role.toUpperCase()})`, 'info');

    // If currently on dashboard, refresh it immediately
    if (this.currentView === 'dashboard') {
      this.refreshCurrentDashboard();
    } else if (this.currentView === 'explore-jobs') {
      if (window.JobSeeker) JobSeeker.applyFilters();
    }

    this.closeModal('modal-role-select');
  },

  updateHeaderUser() {
    const user = DataStore.getActiveUser();
    const avatarEl = document.getElementById('header-avatar');
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');

    if (avatarEl) {
      avatarEl.textContent = user.name.split(' ').map(n=>n[0]).join('');
      avatarEl.className = 'user-avatar' + (user.role === 'employer' ? ' emp-avatar' : user.role === 'admin' ? ' admin-avatar' : '');
    }
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role === 'seeker' ? 'Job Seeker' : user.role === 'employer' ? 'Employer' : 'Platform Admin';

    // Hero banner stats
    const approvedJobs = DataStore.getApprovedJobs();
    const apps = DataStore.getApplications();
    const statJobs = document.getElementById('hero-stat-jobs');
    const statApps = document.getElementById('hero-stat-seekers');
    if (statJobs) statJobs.textContent = `${approvedJobs.length}+`;
    if (statApps) statApps.textContent = `${apps.length * 12}+`;
  },

  updateRolePillHighlights() {
    const user = DataStore.getActiveUser();
    document.querySelectorAll('.role-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === user.role);
    });
  },

  // Role Selection Modal
  openRoleSwitchModal() {
    const list = document.getElementById('role-select-list');
    const users = DataStore.getUsers();
    const activeUser = DataStore.getActiveUser();

    if (list) {
      list.innerHTML = users.map(u => `
        <div class="chat-thread-item ${u.id === activeUser.id ? 'active' : ''}" style="border-radius: var(--radius-md); margin-bottom: 0.5rem; border: 1px solid var(--border-color);" onclick="App.switchUser('${u.id}')">
          <div class="user-avatar ${u.role === 'employer' ? 'emp-avatar' : u.role === 'admin' ? 'admin-avatar' : ''}">
            ${u.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div class="thread-info">
            <div class="thread-top">
              <strong>${u.name}</strong>
              <span class="badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'employer' ? 'badge-info' : 'badge-primary'}">${u.role.toUpperCase()}</span>
            </div>
            <div class="thread-snippet">${u.company || u.title || u.email}</div>
          </div>
        </div>
      `).join('');
    }

    this.openModal('modal-role-select');
  },

  resetToDemoData() {
    if (confirm('Reset portal back to clean demonstration state with default mock users, jobs, and applications?')) {
      DataStore.reset();
      this.showToast('Demo data reset to factory default!', 'success');
      this.updateHeaderUser();
      this.updateRolePillHighlights();
      this.refreshCurrentDashboard();
      this.renderHomeFeaturedJobs();
      if (window.JobSeeker) JobSeeker.applyFilters();
    }
  },

  // ================= HOME FEATURED JOBS =================
  renderHomeFeaturedJobs() {
    const grid = document.getElementById('home-featured-jobs-grid');
    if (!grid) return;

    const jobs = DataStore.getApprovedJobs().slice(0, 3);
    const currentUser = DataStore.getActiveUser();

    grid.innerHTML = jobs.map(job => {
      const matchScore = window.JobSeeker ? JobSeeker.calculateSkillMatch(job.skills, currentUser.skills || []) : 85;

      return `
        <div class="job-card" onclick="App.navigate('explore-jobs'); setTimeout(() => JobSeeker.openJobDetailModal('${job.id}'), 150);">
          <div class="job-card-top">
            <div style="display: flex; gap: 0.85rem; align-items: center;">
              <div class="company-logo-avatar">${job.company.charAt(0)}</div>
              <div>
                <h3 class="job-card-title">${job.title}</h3>
                <div class="job-card-company">${job.company} • <span class="text-muted">${job.department}</span></div>
              </div>
            </div>
            <div class="match-badge">${matchScore}% Match</div>
          </div>

          <div class="job-card-meta">
            <span class="meta-chip">${job.location}</span>
            <span class="meta-chip">${job.type}</span>
            <span class="meta-chip">${job.experience}</span>
          </div>

          <p class="text-muted mb-3" style="font-size: 0.88rem; line-height: 1.5;">${job.description.slice(0, 140)}...</p>

          <div class="job-card-skills">
            ${job.skills.slice(0, 4).map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>

          <div class="job-card-footer">
            <div class="job-card-salary">${job.salary}</div>
            <button class="btn btn-primary btn-sm">Apply Now &rarr;</button>
          </div>
        </div>
      `;
    }).join('');
  },

  handleHeroSearch() {
    const query = document.getElementById('hero-search-query')?.value || '';
    const loc = document.getElementById('hero-search-location')?.value || '';

    this.navigate('explore-jobs');

    setTimeout(() => {
      const keywordInput = document.getElementById('filter-keyword');
      const locInput = document.getElementById('filter-location');
      if (keywordInput) keywordInput.value = query;
      if (locInput) locInput.value = loc;
      if (window.JobSeeker) JobSeeker.applyFilters();
    }, 50);
  },

  // ================= NOTIFICATION SYSTEM =================
  toggleNotifDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById('notif-menu');
    if (menu) menu.classList.toggle('active');
  },

  renderNotifications() {
    const list = document.getElementById('notif-list');
    const badgeCount = document.getElementById('notif-badge-count');
    if (!list) return;

    const data = DataStore.get();
    const user = DataStore.getActiveUser();
    const notifs = (data.notifications || []).filter(n => n.userId === user.id || user.role === 'admin');
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badgeCount) {
      badgeCount.textContent = unreadCount;
      badgeCount.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    if (notifs.length === 0) {
      list.innerHTML = `<p class="text-muted text-center" style="padding: 1.5rem;">No new notifications</p>`;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <div style="flex: 1;">
          <strong style="display: block; font-size: 0.88rem; color: var(--text-primary);">${n.title}</strong>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 2px 0 4px;">${n.message}</p>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${n.time}</span>
        </div>
      </div>
    `).join('');
  },

  markAllNotificationsRead() {
    const data = DataStore.get();
    (data.notifications || []).forEach(n => n.read = true);
    DataStore.set(data);
    this.renderNotifications();
    this.showToast('All notifications marked as read', 'info');
  },

  // ================= TOAST ENGINE =================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'danger') icon = '⚠️';
    if (type === 'warning') icon = '⚡';

    toast.innerHTML = `
      <span style="font-weight: 700; font-size: 1.1rem;">${icon}</span>
      <span style="font-size: 0.9rem; flex: 1;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  },

  // ================= MODAL CONTROLS =================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // ================= THEME TOGGLE =================
  initTheme() {
    const saved = localStorage.getItem('careerpulse_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('careerpulse_theme', next);
    this.showToast(`Switched to ${next} theme mode`, 'info');
  },

  // ================= SIMULATED LIVE TICK =================
  generateSimulatedActivity() {
    const mockEvents = [
      { type: 'view', text: 'Senior Full-Stack Engineer viewed by a candidate in Seattle, WA' },
      { type: 'application', text: 'New application received for Lead AI Infrastructure Engineer' },
      { type: 'login', text: 'Recruiter from Stripe Technologies logged into portal' }
    ];
    const picked = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    DataStore.addActivityLog(picked.type, picked.text, 'badge-primary');
    if (window.Admin && Admin.activeTab === 'admin-activity') {
      Admin.renderActivityLogs();
    }
  }
};

// Close dropdowns when clicking outside
window.addEventListener('click', (e) => {
  const notifMenu = document.getElementById('notif-menu');
  const notifBtn = document.getElementById('notif-btn');
  if (notifMenu && notifMenu.classList.contains('active') && !notifMenu.contains(e.target) && !notifBtn.contains(e.target)) {
    notifMenu.classList.remove('active');
  }
});

// Close modals when clicking outside dialog
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('active');
    }
  });
});

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
