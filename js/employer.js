/**
 * CAREERPULSE — EMPLOYER CONTROLLER & RECRUITMENT SUITE
 * Job Management, Applicant Pipeline, Direct Messaging & Hiring Analytics
 */

const Employer = {
  activeTab: 'emp-jobs',
  activeChatAppId: null,
  charts: {},

  init() {
    this.renderJobs();
    this.renderApplicants();
    this.renderChatThreads();
    this.renderAnalytics();
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('#panel-employer .dashboard-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#panel-employer .tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${tabId}`);
    });

    if (tabId === 'emp-jobs') this.renderJobs();
    if (tabId === 'emp-applications') this.renderApplicants();
    if (tabId === 'emp-communication') this.renderChatThreads();
    if (tabId === 'emp-analytics') this.renderAnalytics();
  },

  // ================= 1. JOB MANAGEMENT =================
  renderJobs() {
    const tbody = document.getElementById('emp-jobs-tbody');
    const jobsCountBadge = document.getElementById('emp-jobs-count');
    const filterSelect = document.getElementById('emp-filter-job-id');
    if (!tbody) return;

    const currentUser = DataStore.getActiveUser();
    const allJobs = DataStore.getAllJobs();
    const myJobs = allJobs.filter(j => j.employerId === currentUser.id || currentUser.role === 'admin');

    if (jobsCountBadge) jobsCountBadge.textContent = myJobs.length;

    // Update job filter dropdown in applicant tab
    if (filterSelect) {
      const currentVal = filterSelect.value;
      filterSelect.innerHTML = `<option value="all">All Postings (${myJobs.length})</option>` +
        myJobs.map(j => `<option value="${j.id}" ${j.id === currentVal ? 'selected' : ''}>${j.title}</option>`).join('');
    }

    if (myJobs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 2.5rem 1rem;">
            <p class="text-muted">No job postings created yet for ${currentUser.company || 'your organization'}.</p>
            <button class="btn btn-sm btn-primary mt-3" onclick="Employer.openNewJobModal()">+ Post Your First Job</button>
          </td>
        </tr>
      `;
      return;
    }

    const allApps = DataStore.getApplications();

    tbody.innerHTML = myJobs.map(job => {
      const jobApps = allApps.filter(a => a.jobId === job.id);
      const approvalBadge = job.approvalStatus === 'Approved' ? 'badge-success' :
                           job.approvalStatus === 'Pending'  ? 'badge-warning' : 'badge-danger';

      return `
        <tr>
          <td>
            <div class="table-title-cell">
              <strong>${job.title}</strong>
              <span>${job.department} • Posted ${job.postedDate}</span>
            </div>
          </td>
          <td>
            <span class="meta-chip">${job.type}</span>
            <span class="meta-chip">${job.location}</span>
          </td>
          <td><strong>${job.salary}</strong></td>
          <td><span class="badge ${approvalBadge}">${job.approvalStatus}</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="Employer.filterApplicantsByJob('${job.id}')">
              <strong>${jobApps.length}</strong> Applicants &rarr;
            </button>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-sm btn-outline-secondary" onclick="Employer.openEditJobModal('${job.id}')" title="Edit Job">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="Employer.handleDeleteJob('${job.id}')" title="Delete Job">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openNewJobModal() {
    document.getElementById('employer-job-modal-title').textContent = 'Post New Job Vacancy';
    document.getElementById('emp-edit-job-id').value = '';
    document.getElementById('emp-job-title').value = '';
    document.getElementById('emp-job-location').value = 'San Francisco, CA (Remote)';
    document.getElementById('emp-job-salary').value = '$140,000 - $175,000';
    document.getElementById('emp-job-desc').value = '';
    document.getElementById('emp-job-reqs').value = '';
    document.getElementById('emp-job-skills').value = '';
    App.openModal('modal-employer-job');
  },

  openEditJobModal(jobId) {
    const job = DataStore.getAllJobs().find(j => j.id === jobId);
    if (!job) return;

    document.getElementById('employer-job-modal-title').textContent = 'Edit Job Vacancy';
    document.getElementById('emp-edit-job-id').value = job.id;
    document.getElementById('emp-job-title').value = job.title;
    document.getElementById('emp-job-dept').value = job.department;
    document.getElementById('emp-job-type').value = job.type;
    document.getElementById('emp-job-location').value = job.location;
    document.getElementById('emp-job-salary').value = job.salary;
    document.getElementById('emp-job-exp').value = job.experience;
    document.getElementById('emp-job-desc').value = job.description;
    document.getElementById('emp-job-reqs').value = (job.requirements || []).join('\n');
    document.getElementById('emp-job-skills').value = (job.skills || []).join(', ');

    App.openModal('modal-employer-job');
  },

  handleSaveJob(e) {
    e.preventDefault();
    const editId = document.getElementById('emp-edit-job-id').value;
    const currentUser = DataStore.getActiveUser();
    const settings = DataStore.get().settings;

    const title = document.getElementById('emp-job-title').value;
    const department = document.getElementById('emp-job-dept').value;
    const type = document.getElementById('emp-job-type').value;
    const location = document.getElementById('emp-job-location').value;
    const salary = document.getElementById('emp-job-salary').value;
    const experience = document.getElementById('emp-job-exp').value;
    const description = document.getElementById('emp-job-desc').value;
    const requirements = document.getElementById('emp-job-reqs').value.split('\n').map(r => r.trim()).filter(Boolean);
    const skills = document.getElementById('emp-job-skills').value.split(',').map(s => s.trim()).filter(Boolean);

    // Extract approximate min salary number
    const numMatch = salary.replace(/[^0-9]/g, ' ').trim().split(/\s+/)[0];
    const minSalaryNum = numMatch ? parseInt(numMatch, 10) * (numMatch.length <= 3 ? 1000 : 1) : 100000;

    const jobPayload = {
      title,
      department,
      type,
      location,
      salary,
      minSalaryNum,
      experience,
      description,
      requirements,
      skills,
      employerId: currentUser.id,
      company: currentUser.company || 'Enterprise Partner',
      status: 'Active',
      // If admin approval is required, new posts are Pending, otherwise Approved
      approvalStatus: editId ? (DataStore.getAllJobs().find(j => j.id === editId)?.approvalStatus || 'Approved') : (settings.requireApproval ? 'Pending' : 'Approved')
    };

    if (editId) {
      jobPayload.id = editId;
    }

    DataStore.saveJob(jobPayload);
    App.closeModal('modal-employer-job');
    App.showToast(editId ? 'Job listing updated!' : (settings.requireApproval ? 'Job submitted! Waiting for Admin moderation.' : 'Job posted and live!'), 'success');

    this.renderJobs();
    if (JobSeeker) JobSeeker.applyFilters();
  },

  handleDeleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job listing? All associated applications will remain in archive.')) {
      DataStore.deleteJob(jobId);
      App.showToast('Job listing removed.', 'info');
      this.renderJobs();
      if (JobSeeker) JobSeeker.applyFilters();
    }
  },

  filterApplicantsByJob(jobId) {
    this.switchTab('emp-applications');
    const select = document.getElementById('emp-filter-job-id');
    if (select) {
      select.value = jobId;
      this.renderApplicants();
    }
  },

  // ================= 2. APPLICANT PIPELINE REVIEW =================
  renderApplicants() {
    const tbody = document.getElementById('emp-applicants-tbody');
    const countBadge = document.getElementById('emp-applicant-count');
    const jobFilter = document.getElementById('emp-filter-job-id')?.value || 'all';
    const stageFilter = document.getElementById('emp-filter-stage')?.value || 'all';
    if (!tbody) return;

    const currentUser = DataStore.getActiveUser();
    let apps = DataStore.getApplications();

    // Filter by employer
    if (currentUser.role === 'employer') {
      apps = apps.filter(a => a.employerId === currentUser.id);
    }

    // Filter by selected Job
    if (jobFilter !== 'all') {
      apps = apps.filter(a => a.jobId === jobFilter);
    }

    // Filter by stage
    if (stageFilter !== 'all') {
      apps = apps.filter(a => a.status === stageFilter);
    }

    if (countBadge) countBadge.textContent = apps.length;

    if (apps.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 2.5rem 1rem;">
            <p class="text-muted">No applicants found matching the selected filters.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = apps.map(app => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div class="user-avatar">${app.seekerName.split(' ').map(n=>n[0]).join('')}</div>
            <div>
              <strong>${app.seekerName}</strong>
              <div class="text-muted" style="font-size: 0.78rem;">${app.seekerEmail}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-title-cell">
            <strong>${app.jobTitle}</strong>
            <span>Exp. Salary: $${app.expectedSalary.toLocaleString()}</span>
          </div>
        </td>
        <td>${app.appliedDate}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="Employer.inspectCandidateResume('${app.seekerId}')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${app.resumeName || 'Resume.pdf'}
          </button>
        </td>
        <td>
          <select class="select-input select-sm" style="min-width: 145px;" onchange="Employer.handleStageChange('${app.id}', this.value)">
            <option value="Submitted" ${app.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
            <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
            <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
            <option value="Interview Scheduled" ${app.status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
            <option value="Offered" ${app.status === 'Offered' ? 'selected' : ''}>Offered 🎉</option>
            <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm btn-primary" onclick="Employer.openChatWithCandidate('${app.id}')" title="Message Candidate">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  handleStageChange(appId, newStage) {
    DataStore.updateApplicationStatus(appId, newStage);
    App.showToast(`Candidate stage updated to "${newStage}"`, 'success');
    this.renderApplicants();
    this.renderAnalytics();
    if (JobSeeker) JobSeeker.renderApplications();
  },

  inspectCandidateResume(seekerId) {
    const user = DataStore.getUsers().find(u => u.id === seekerId);
    if (!user) return;
    JobSeeker.viewActiveResumeModal();
  },

  // ================= 3. CANDIDATE COMMUNICATION =================
  renderChatThreads() {
    const threadsContainer = document.getElementById('emp-chat-threads');
    const unreadBadge = document.getElementById('emp-unread-badge');
    if (!threadsContainer) return;

    const currentUser = DataStore.getActiveUser();
    let apps = DataStore.getApplications();

    if (currentUser.role === 'employer') {
      apps = apps.filter(a => a.employerId === currentUser.id);
    }

    if (apps.length === 0) {
      threadsContainer.innerHTML = `<p class="text-muted text-center" style="padding: 1.5rem;">No conversations yet.</p>`;
      return;
    }

    if (!this.activeChatAppId) {
      this.activeChatAppId = apps[0].id;
    }

    threadsContainer.innerHTML = apps.map(app => {
      const msgs = DataStore.getMessagesForApp(app.id);
      const lastMsg = msgs[msgs.length - 1];
      const isActive = app.id === this.activeChatAppId;

      return `
        <div class="chat-thread-item ${isActive ? 'active' : ''}" onclick="Employer.selectChatThread('${app.id}')">
          <div class="user-avatar">${app.seekerName.split(' ').map(n=>n[0]).join('')}</div>
          <div class="thread-info">
            <div class="thread-top">
              <strong>${app.seekerName}</strong>
              <span class="thread-time">${lastMsg ? 'Active' : 'New'}</span>
            </div>
            <div class="thread-snippet">${lastMsg ? lastMsg.text : `Applied for ${app.jobTitle}`}</div>
          </div>
        </div>
      `;
    }).join('');

    this.renderChatMessages();
  },

  selectChatThread(appId) {
    this.activeChatAppId = appId;
    this.renderChatThreads();
  },

  openChatWithCandidate(appId) {
    this.activeChatAppId = appId;
    this.switchTab('emp-communication');
  },

  renderChatMessages() {
    const msgBody = document.getElementById('chat-messages-body');
    const chatHeaderName = document.getElementById('chat-user-name');
    const chatHeaderSub = document.getElementById('chat-user-sub');
    const chatAvatar = document.getElementById('chat-user-avatar');
    if (!msgBody || !this.activeChatAppId) return;

    const app = DataStore.getApplications().find(a => a.id === this.activeChatAppId);
    if (!app) return;

    const currentUser = DataStore.getActiveUser();
    const msgs = DataStore.getMessagesForApp(app.id);

    if (chatHeaderName) chatHeaderName.textContent = app.seekerName;
    if (chatHeaderSub) chatHeaderSub.textContent = `Candidate for: ${app.jobTitle} • Current Stage: ${app.status}`;
    if (chatAvatar) chatAvatar.textContent = app.seekerName.split(' ').map(n=>n[0]).join('');

    if (msgs.length === 0) {
      msgBody.innerHTML = `
        <div class="text-center text-muted" style="padding: 2.5rem 1rem;">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 0.5rem;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>Start a direct conversation with <strong>${app.seekerName}</strong> regarding their application.</p>
        </div>
      `;
      return;
    }

    msgBody.innerHTML = msgs.map(m => {
      const isMine = m.senderId === currentUser.id || m.senderName.includes(currentUser.name);
      return `
        <div class="msg-bubble ${isMine ? 'msg-sent' : 'msg-received'}">
          <div>${m.text}</div>
          <span class="msg-time">${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;
    }).join('');

    msgBody.scrollTop = msgBody.scrollHeight;
  },

  insertQuickTemplate(type) {
    const input = document.getElementById('chat-input-text');
    if (!input || !this.activeChatAppId) return;

    const app = DataStore.getApplications().find(a => a.id === this.activeChatAppId);
    if (!app) return;

    if (type === 'interview') {
      input.value = `Hi ${app.seekerName.split(' ')[0]}, we were very impressed by your profile for the ${app.jobTitle} position and would like to invite you for a 45-minute technical screen. Please let us know what time slots work best for you!`;
    } else if (type === 'offer') {
      input.value = `Congratulations ${app.seekerName.split(' ')[0]}! We are thrilled to offer you the position of ${app.jobTitle} with an annual starting compensation of $${app.expectedSalary.toLocaleString()}. We will email you the official contract!`;
    }
    input.focus();
  },

  sendMessage() {
    const input = document.getElementById('chat-input-text');
    if (!input || !input.value.trim() || !this.activeChatAppId) return;

    const app = DataStore.getApplications().find(a => a.id === this.activeChatAppId);
    if (!app) return;

    const currentUser = DataStore.getActiveUser();

    const newMsg = {
      applicationId: app.id,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (${currentUser.company || 'Employer'})`,
      recipientId: app.seekerId,
      recipientName: app.seekerName,
      text: input.value.trim()
    };

    DataStore.addMessage(newMsg);
    input.value = '';
    this.renderChatMessages();

    // Simulated automated candidate reply after 2.5 seconds if seeker wasn't typing
    setTimeout(() => {
      if (Math.random() > 0.3) {
        DataStore.addMessage({
          applicationId: app.id,
          senderId: app.seekerId,
          senderName: app.seekerName,
          recipientId: currentUser.id,
          recipientName: currentUser.name,
          text: `Thank you for the update! Looking forward to the next steps.`
        });
        Employer.renderChatMessages();
      }
    }, 2500);
  },

  // ================= 4. HIRING ANALYTICS (CHART.JS) =================
  renderAnalytics() {
    if (typeof Chart === 'undefined') return;

    const currentUser = DataStore.getActiveUser();
    const allJobs = DataStore.getAllJobs().filter(j => j.employerId === currentUser.id || currentUser.role === 'admin');
    const allApps = DataStore.getApplications();

    // Chart 1: Applications by Job
    const ctxJobs = document.getElementById('chart-emp-jobs');
    if (ctxJobs) {
      if (this.charts.jobs) this.charts.jobs.destroy();
      
      const labels = allJobs.map(j => j.title.length > 20 ? j.title.slice(0, 18) + '...' : j.title);
      const dataCounts = allJobs.map(j => allApps.filter(a => a.jobId === j.id).length);

      this.charts.jobs = new Chart(ctxJobs, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Applications Received',
            data: dataCounts,
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            borderColor: '#6366f1',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
          }
        }
      });
    }

    // Chart 2: Pipeline Conversion Funnel
    const ctxFunnel = document.getElementById('chart-emp-funnel');
    if (ctxFunnel) {
      if (this.charts.funnel) this.charts.funnel.destroy();

      const stages = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offered'];
      const funnelCounts = stages.map(st => allApps.filter(a => a.status === st).length);

      this.charts.funnel = new Chart(ctxFunnel, {
        type: 'doughnut',
        data: {
          labels: stages,
          datasets: [{
            data: funnelCounts,
            backgroundColor: [
              '#3b82f6',
              '#f59e0b',
              '#8b5cf6',
              '#06b6d4',
              '#10b981'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
          }
        }
      });
    }
  }
};
