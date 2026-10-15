/**
 * CAREERPULSE — JOB SEEKER CONTROLLER & WORKFLOWS
 * Powers Job Search, AI Skill Matching, Application Tracking, Profile & Resume Management
 */

const JobSeeker = {
  activeTab: 'seeker-applications',
  filters: {
    keyword: '',
    location: '',
    category: 'all',
    types: ['Full-time', 'Contract', 'Remote', 'Part-time'],
    experience: 'all',
    minSalary: 60000,
    sortBy: 'newest'
  },

  init() {
    this.populateProfileForm();
    this.renderApplications();
    this.renderRecommendations();
    this.renderHistory();
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('#panel-seeker .dashboard-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#panel-seeker .tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${tabId}`);
    });

    if (tabId === 'seeker-applications') this.renderApplications();
    if (tabId === 'seeker-recommendations') this.renderRecommendations();
    if (tabId === 'seeker-profile') this.populateProfileForm();
    if (tabId === 'seeker-history') this.renderHistory();
  },

  // Calculate Match Percentage between Seeker and Job
  calculateSkillMatch(jobSkills, userSkills) {
    if (!jobSkills || !jobSkills.length || !userSkills || !userSkills.length) return 70;
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
    let matchCount = 0;
    jobSkills.forEach(js => {
      if (normalizedUserSkills.includes(js.toLowerCase().trim())) {
        matchCount++;
      }
    });
    const percentage = Math.round((matchCount / jobSkills.length) * 100);
    return Math.max(percentage, 50); // Floor at 50% for realistic demo
  },

  // Explore & Search Jobs Filter Engine
  applyFilters() {
    const keywordInput = document.getElementById('filter-keyword');
    const locationInput = document.getElementById('filter-location');
    const catInput = document.getElementById('filter-category');
    const expInput = document.getElementById('filter-experience');
    const sortInput = document.getElementById('sort-jobs-select');

    if (keywordInput) this.filters.keyword = keywordInput.value.toLowerCase().trim();
    if (locationInput) this.filters.location = locationInput.value.toLowerCase().trim();
    if (catInput) this.filters.category = catInput.value;
    if (expInput) this.filters.experience = expInput.value;
    if (sortInput) this.filters.sortBy = sortInput.value;

    const checkedTypes = Array.from(document.querySelectorAll('input[name="job-type"]:checked')).map(cb => cb.value);
    this.filters.types = checkedTypes;

    this.renderExploreJobs();
  },

  onSalaryRangeChange(val) {
    this.filters.minSalary = parseInt(val, 10);
    const display = document.getElementById('salary-val-display');
    if (display) display.textContent = '$' + this.filters.minSalary.toLocaleString();
    this.applyFilters();
  },

  resetFilters() {
    this.filters = {
      keyword: '',
      location: '',
      category: 'all',
      types: ['Full-time', 'Contract', 'Remote', 'Part-time'],
      experience: 'all',
      minSalary: 40000,
      sortBy: 'newest'
    };

    if (document.getElementById('filter-keyword')) document.getElementById('filter-keyword').value = '';
    if (document.getElementById('filter-location')) document.getElementById('filter-location').value = '';
    if (document.getElementById('filter-category')) document.getElementById('filter-category').value = 'all';
    if (document.getElementById('filter-experience')) document.getElementById('filter-experience').value = 'all';
    if (document.getElementById('filter-min-salary')) {
      document.getElementById('filter-min-salary').value = 40000;
      document.getElementById('salary-val-display').textContent = '$40,000';
    }
    document.querySelectorAll('input[name="job-type"]').forEach(cb => cb.checked = true);
    
    this.renderExploreJobs();
  },

  renderExploreJobs() {
    const container = document.getElementById('jobs-stream-list');
    const countText = document.getElementById('jobs-count-text');
    if (!container) return;

    const currentUser = DataStore.getActiveUser();
    let jobs = DataStore.getApprovedJobs();

    // Filter by keyword
    if (this.filters.keyword) {
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(this.filters.keyword) ||
        j.company.toLowerCase().includes(this.filters.keyword) ||
        j.skills.some(s => s.toLowerCase().includes(this.filters.keyword)) ||
        j.description.toLowerCase().includes(this.filters.keyword)
      );
    }

    // Filter by location
    if (this.filters.location) {
      jobs = jobs.filter(j => j.location.toLowerCase().includes(this.filters.location));
    }

    // Filter by category
    if (this.filters.category !== 'all') {
      jobs = jobs.filter(j => j.department === this.filters.category);
    }

    // Filter by type
    if (this.filters.types.length > 0) {
      jobs = jobs.filter(j => this.filters.types.includes(j.type));
    }

    // Filter by experience
    if (this.filters.experience !== 'all') {
      jobs = jobs.filter(j => j.experience === this.filters.experience);
    }

    // Filter by salary
    jobs = jobs.filter(j => (j.minSalaryNum || 80000) >= this.filters.minSalary);

    // Sort
    if (this.filters.sortBy === 'salary-high') {
      jobs.sort((a, b) => (b.minSalaryNum || 0) - (a.minSalaryNum || 0));
    } else if (this.filters.sortBy === 'match-score') {
      jobs.sort((a, b) => {
        const scoreA = this.calculateSkillMatch(a.skills, currentUser.skills || []);
        const scoreB = this.calculateSkillMatch(b.skills, currentUser.skills || []);
        return scoreB - scoreA;
      });
    } else {
      // Newest first
      jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    }

    if (countText) {
      countText.textContent = `Showing ${jobs.length} verified ${jobs.length === 1 ? 'opening' : 'openings'}`;
    }

    if (jobs.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding: 3rem 1.5rem;">
          <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 1rem; color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h3>No matching job openings found</h3>
          <p class="text-muted">Try adjusting your filters or search keywords to discover more opportunities.</p>
          <button class="btn btn-outline-primary btn-sm" style="margin-top: 1rem;" onclick="JobSeeker.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = jobs.map(job => {
      const matchScore = this.calculateSkillMatch(job.skills, currentUser.skills || []);
      const userApps = DataStore.getApplications().filter(a => a.seekerId === currentUser.id && a.jobId === job.id);
      const isApplied = userApps.length > 0;

      return `
        <div class="job-card" onclick="JobSeeker.openJobDetailModal('${job.id}')">
          <div class="job-card-top">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <div class="company-logo-avatar">${job.company.charAt(0)}</div>
              <div>
                <h3 class="job-card-title">${job.title}</h3>
                <div class="job-card-company">
                  <span>${job.company}</span> • <span class="text-muted">${job.department}</span>
                </div>
              </div>
            </div>
            ${currentUser.role === 'seeker' ? `
              <div class="match-badge">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ${matchScore}% Match
              </div>
            ` : ''}
          </div>

          <div class="job-card-meta">
            <span class="meta-chip"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg> ${job.location}</span>
            <span class="meta-chip"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/></svg> ${job.type}</span>
            <span class="meta-chip"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg> ${job.experience}</span>
          </div>

          <p class="text-muted mb-3" style="font-size: 0.88rem; line-height: 1.5;">${job.description.slice(0, 155)}...</p>

          <div class="job-card-skills">
            ${job.skills.slice(0, 5).map(s => `<span class="skill-tag">${s}</span>`).join('')}
            ${job.skills.length > 5 ? `<span class="skill-tag">+${job.skills.length - 5} more</span>` : ''}
          </div>

          <div class="job-card-footer">
            <div class="job-card-salary">${job.salary}</div>
            ${isApplied ? `
              <span class="badge badge-success"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> Applied</span>
            ` : `
              <button class="btn btn-primary btn-sm">View & Apply &rarr;</button>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  // Modal Detailed View & One-Click Application
  openJobDetailModal(jobId) {
    const jobs = DataStore.getAllJobs();
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const currentUser = DataStore.getActiveUser();
    const userApps = DataStore.getApplications().filter(a => a.seekerId === currentUser.id && a.jobId === job.id);
    const isApplied = userApps.length > 0;

    document.getElementById('modal-job-title').textContent = job.title;
    document.getElementById('modal-job-company').textContent = job.company;
    document.getElementById('modal-job-dept').textContent = job.department;
    document.getElementById('modal-job-salary').textContent = job.salary;
    document.getElementById('modal-job-location').textContent = job.location;
    document.getElementById('modal-job-exp').textContent = job.experience;
    document.getElementById('modal-job-desc').textContent = job.description;

    // Pills
    const pillsWrap = document.getElementById('modal-job-pills');
    pillsWrap.innerHTML = `
      <span class="badge badge-primary">${job.type}</span>
      <span class="badge badge-info">${job.department}</span>
      <span class="badge badge-warning">${job.experience}</span>
    `;

    // Requirements
    const reqsList = document.getElementById('modal-job-reqs');
    reqsList.innerHTML = (job.requirements || []).map(r => `<li>${r}</li>`).join('');

    // Skills
    const skillsWrap = document.getElementById('modal-job-skills');
    skillsWrap.innerHTML = (job.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');

    // Form settings
    const applyPanel = document.getElementById('modal-apply-panel');
    const applicantName = document.getElementById('modal-applicant-name');
    const applyJobId = document.getElementById('apply-job-id');
    const applyResumeName = document.getElementById('apply-resume-name');
    const startDateInput = document.getElementById('apply-start-date');

    if (applyJobId) applyJobId.value = job.id;
    if (applicantName) applicantName.textContent = currentUser.name;
    if (applyResumeName) applyResumeName.textContent = currentUser.resumeFile ? currentUser.resumeFile.name : 'Master_Resume.pdf';
    
    // Set default start date to +14 days
    if (startDateInput) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 14);
      startDateInput.value = targetDate.toISOString().split('T')[0];
    }

    if (currentUser.role !== 'seeker') {
      applyPanel.innerHTML = `
        <div class="card text-center" style="background: rgba(255,255,255,0.03);">
          <p class="text-muted">You are viewing this job preview as an <strong>${currentUser.role.toUpperCase()}</strong>. Switch to a Job Seeker identity to submit an application.</p>
          <button class="btn btn-sm btn-outline-primary" style="margin: 0.5rem auto 0;" onclick="App.switchUser('usr-seeker-1')">Switch to Alex Rivera (Seeker)</button>
        </div>
      `;
    } else if (isApplied) {
      const activeApp = userApps[0];
      applyPanel.innerHTML = `
        <div class="card" style="background: rgba(16, 185, 129, 0.08); border-color: var(--success);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="color: var(--success); display: block; font-size: 1.05rem;">Application Already Submitted</strong>
              <p class="text-muted" style="margin-top: 0.2rem;">You applied on ${activeApp.appliedDate}. Current stage: <strong>${activeApp.status}</strong></p>
            </div>
            <button class="btn btn-sm btn-primary" onclick="App.closeModal('modal-job-detail'); App.navigate('dashboard'); JobSeeker.switchTab('seeker-applications');">Track Application</button>
          </div>
        </div>
      `;
    }

    App.openModal('modal-job-detail');
  },

  // Submit Job Application
  submitJobApplication(e) {
    e.preventDefault();
    const jobId = document.getElementById('apply-job-id').value;
    const coverLetter = document.getElementById('apply-cover-letter').value;
    const expectedSalary = parseInt(document.getElementById('apply-expected-salary').value, 10) || 150000;
    const startDate = document.getElementById('apply-start-date').value;

    const currentUser = DataStore.getActiveUser();
    const job = DataStore.getAllJobs().find(j => j.id === jobId);

    if (!job) {
      App.showToast('Error: Job not found', 'danger');
      return;
    }

    const newApp = {
      jobId: job.id,
      seekerId: currentUser.id,
      employerId: job.employerId,
      jobTitle: job.title,
      company: job.company,
      seekerName: currentUser.name,
      seekerEmail: currentUser.email,
      seekerTitle: currentUser.title || 'Applicant',
      coverLetter,
      expectedSalary,
      startDate,
      resumeName: currentUser.resumeFile ? currentUser.resumeFile.name : 'Resume.pdf'
    };

    DataStore.submitApplication(newApp);

    App.closeModal('modal-job-detail');
    App.showToast(`Application successfully sent to ${job.company}!`, 'success');
    
    // Refresh views
    this.renderApplications();
    this.renderRecommendations();
    this.renderExploreJobs();
  },

  // Render Seeker Active Applications Pipeline
  renderApplications() {
    const tbody = document.getElementById('seeker-applications-tbody');
    const totalStat = document.getElementById('seeker-stat-total');
    const reviewStat = document.getElementById('seeker-stat-review');
    const interviewStat = document.getElementById('seeker-stat-interview');
    const offersStat = document.getElementById('seeker-stat-offers');
    const appCount = document.getElementById('seeker-app-count');
    if (!tbody) return;

    const currentUser = DataStore.getActiveUser();
    const apps = DataStore.getApplications().filter(a => a.seekerId === currentUser.id);

    if (appCount) appCount.textContent = apps.length;
    if (totalStat) totalStat.textContent = apps.length;
    if (reviewStat) reviewStat.textContent = apps.filter(a => ['Under Review', 'Shortlisted'].includes(a.status)).length;
    if (interviewStat) interviewStat.textContent = apps.filter(a => a.status === 'Interview Scheduled').length;
    if (offersStat) offersStat.textContent = apps.filter(a => a.status === 'Offered').length;

    if (apps.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 2.5rem 1rem;">
            <p class="text-muted">You have not submitted any applications yet.</p>
            <button class="btn btn-sm btn-primary mt-3" onclick="App.navigate('explore-jobs')">Discover Openings</button>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = apps.map(app => {
      const msgs = DataStore.getMessagesForApp(app.id);
      const stageClass = this.getStatusBadgeClass(app.status);
      const progressSteps = this.getPipelineProgressHtml(app.status);

      return `
        <tr>
          <td>
            <div class="table-title-cell">
              <strong>${app.jobTitle}</strong>
              <span>${app.company}</span>
            </div>
          </td>
          <td>${app.appliedDate}</td>
          <td><span class="badge ${stageClass}">${app.status}</span></td>
          <td>${progressSteps}</td>
          <td>
            <span class="badge badge-pill">${msgs.length} ${msgs.length === 1 ? 'msg' : 'msgs'}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="JobSeeker.openJobDetailModal('${app.jobId}')">
              View Role
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Submitted': return 'badge-info';
      case 'Under Review': return 'badge-warning';
      case 'Shortlisted': return 'badge-primary';
      case 'Interview Scheduled': return 'badge-warning';
      case 'Offered': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-info';
    }
  },

  getPipelineProgressHtml(status) {
    const stages = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offered'];
    const isRejected = status === 'Rejected';
    const currentIndex = stages.indexOf(status);

    if (isRejected) {
      return `
        <div class="pipeline-progress-bar" title="Status: Rejected">
          <div class="step-bar rejected"></div>
          <div class="step-bar rejected"></div>
          <div class="step-bar rejected"></div>
          <div class="step-bar rejected"></div>
        </div>
      `;
    }

    return `
      <div class="pipeline-progress-bar" title="Stage: ${status}">
        ${stages.slice(0, 4).map((st, idx) => {
          let state = '';
          if (idx < currentIndex) state = 'done';
          else if (idx === currentIndex) state = 'active';
          return `<div class="step-bar ${state}"></div>`;
        }).join('')}
      </div>
    `;
  },

  // AI Job Recommendations Engine
  renderRecommendations() {
    const grid = document.getElementById('seeker-recommendations-grid');
    const skillsDisplay = document.getElementById('seeker-current-skills-display');
    if (!grid) return;

    const currentUser = DataStore.getActiveUser();
    const userSkills = currentUser.skills || [];

    if (skillsDisplay) {
      skillsDisplay.textContent = userSkills.join(', ') || 'None listed yet';
    }

    const jobs = DataStore.getApprovedJobs().map(j => {
      const matchScore = this.calculateSkillMatch(j.skills, userSkills);
      return { ...j, matchScore };
    });

    // Sort descending by matchScore
    jobs.sort((a, b) => b.matchScore - a.matchScore);

    grid.innerHTML = jobs.map(job => `
      <div class="job-card" onclick="JobSeeker.openJobDetailModal('${job.id}')">
        <div class="job-card-top">
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <div class="company-logo-avatar">${job.company.charAt(0)}</div>
            <div>
              <h3 class="job-card-title">${job.title}</h3>
              <div class="job-card-company">${job.company} • <span class="text-muted">${job.department}</span></div>
            </div>
          </div>
          <div class="match-badge">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            ${job.matchScore}% Match
          </div>
        </div>

        <div class="job-card-meta">
          <span class="meta-chip">${job.location}</span>
          <span class="meta-chip">${job.type}</span>
          <span class="meta-chip">${job.experience}</span>
        </div>

        <div class="job-card-skills">
          ${job.skills.map(s => {
            const isMatched = userSkills.map(us => us.toLowerCase().trim()).includes(s.toLowerCase().trim());
            return `<span class="skill-tag" style="${isMatched ? 'background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: rgba(16, 185, 129, 0.3); font-weight: 700;' : ''}">${s} ${isMatched ? '✓' : ''}</span>`;
          }).join('')}
        </div>

        <div class="job-card-footer">
          <div class="job-card-salary">${job.salary}</div>
          <button class="btn btn-primary btn-sm">Review & Apply</button>
        </div>
      </div>
    `).join('');
  },

  // Populate Seeker Profile Form
  populateProfileForm() {
    const user = DataStore.getActiveUser();
    if (!user) return;

    const nameInput = document.getElementById('prof-name');
    const emailInput = document.getElementById('prof-email');
    const titleInput = document.getElementById('prof-title');
    const locInput = document.getElementById('prof-location');
    const phoneInput = document.getElementById('prof-phone');
    const portInput = document.getElementById('prof-portfolio');
    const bioInput = document.getElementById('prof-bio');
    const skillsInput = document.getElementById('prof-skills');
    const expInput = document.getElementById('prof-experience');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (titleInput) titleInput.value = user.title || '';
    if (locInput) locInput.value = user.location || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (portInput) portInput.value = user.portfolio || '';
    if (bioInput) bioInput.value = user.bio || '';
    if (skillsInput) skillsInput.value = (user.skills || []).join(', ');
    if (expInput) expInput.value = user.experience || '';

    // Update banner & resume cards
    const bannerName = document.getElementById('seeker-banner-name');
    const bannerTitle = document.getElementById('seeker-banner-title');
    const resumeFilename = document.getElementById('resume-filename');
    const resumeFilesize = document.getElementById('resume-filesize');

    if (bannerName) bannerName.textContent = user.name;
    if (bannerTitle) bannerTitle.textContent = `${user.title || 'Applicant'} • ${user.location || 'Remote'}`;
    if (resumeFilename && user.resumeFile) resumeFilename.textContent = user.resumeFile.name;
    if (resumeFilesize && user.resumeFile) resumeFilesize.textContent = `Updated ${user.resumeFile.updated} • PDF (${user.resumeFile.size})`;
  },

  handleSaveProfile(e) {
    e.preventDefault();
    const user = DataStore.getActiveUser();

    user.name = document.getElementById('prof-name').value;
    user.email = document.getElementById('prof-email').value;
    user.title = document.getElementById('prof-title').value;
    user.location = document.getElementById('prof-location').value;
    user.phone = document.getElementById('prof-phone').value;
    user.portfolio = document.getElementById('prof-portfolio').value;
    user.bio = document.getElementById('prof-bio').value;
    user.skills = document.getElementById('prof-skills').value.split(',').map(s => s.trim()).filter(Boolean);
    user.experience = document.getElementById('prof-experience').value;

    DataStore.saveUser(user);
    App.showToast('Profile updated successfully!', 'success');
    App.updateHeaderUser();
    this.populateProfileForm();
    this.renderRecommendations();
  },

  handleResumeFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const user = DataStore.getActiveUser();
    user.resumeFile = {
      name: file.name,
      size: Math.round(file.size / 1024) + ' KB',
      updated: 'Just now'
    };

    DataStore.saveUser(user);
    this.populateProfileForm();
    App.showToast(`Resume "${file.name}" uploaded successfully!`, 'success');
  },

  viewActiveResumeModal() {
    const user = DataStore.getActiveUser();
    const container = document.getElementById('resume-document-content');
    if (!container) return;

    container.innerHTML = `
      <div style="border-bottom: 2px solid #6366f1; padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; font-size: 2rem;">${user.name}</h2>
        <div class="resume-headline">${user.title || 'Senior Software Engineer'}</div>
        <div style="font-size: 0.88rem; color: #475569; display: flex; gap: 1rem; flex-wrap: wrap;">
          <span>📧 ${user.email}</span>
          <span>📍 ${user.location || 'San Francisco, CA'}</span>
          <span>🌐 ${user.portfolio || 'https://alexrivera.dev'}</span>
          <span>📱 ${user.phone || '+1 (555) 019-2834'}</span>
        </div>
      </div>

      <div class="resume-section-title">Professional Executive Summary</div>
      <p style="font-size: 0.95rem; color: #334155; margin-bottom: 1.25rem;">
        ${user.bio || 'Results-driven software engineer with extensive background building mission-critical distributed web systems and frontend applications.'}
      </p>

      <div class="resume-section-title">Core Competencies & Technical Skills</div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem;">
        ${(user.skills || []).map(s => `<span style="background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${s}</span>`).join('')}
      </div>

      <div class="resume-section-title">Experience & Career History</div>
      <div style="margin-bottom: 1.25rem; font-size: 0.95rem; color: #334155;">
        <strong>Senior Software Engineer</strong> — TechFlow Cloud Systems (2022 - Present)<br>
        <span style="font-size: 0.85rem; color: #64748b;">San Francisco, CA • Full-time</span>
        <ul style="padding-left: 1.25rem; margin-top: 0.5rem;">
          <li>Architected microservices processing over 12M daily requests with 99.99% availability.</li>
          <li>Led team of 6 engineers redesigning customer payment pipelines using React and Java.</li>
          <li>Reduced bundle load times by 48% via intelligent code-splitting and asset optimization.</li>
        </ul>
      </div>

      <div class="resume-section-title">Education & Certifications</div>
      <div style="font-size: 0.95rem; color: #334155;">
        <strong>B.S. in Computer Science</strong> — University of California, Berkeley<br>
        <span style="font-size: 0.85rem; color: #64748b;">AWS Certified Solutions Architect (Associate)</span>
      </div>
    `;

    App.openModal('modal-resume-preview');
  },

  renderHistory() {
    const container = document.getElementById('seeker-timeline-list');
    if (!container) return;

    const currentUser = DataStore.getActiveUser();
    const apps = DataStore.getApplications().filter(a => a.seekerId === currentUser.id);

    if (apps.length === 0) {
      container.innerHTML = `<p class="text-muted text-center" style="padding: 2rem;">No historical submissions yet.</p>`;
      return;
    }

    container.innerHTML = apps.map(app => `
      <div class="activity-item">
        <div class="activity-icon" style="background: var(--primary-light); color: var(--primary);">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        </div>
        <div class="activity-desc">
          <strong>${app.jobTitle}</strong> at <strong>${app.company}</strong>
          <div class="text-muted" style="font-size: 0.8rem;">Status: <span class="badge ${this.getStatusBadgeClass(app.status)}">${app.status}</span> • Expected Salary: $${app.expectedSalary.toLocaleString()}</div>
          ${app.employerNotes ? `<div style="font-size: 0.8rem; margin-top: 0.3rem; color: var(--text-secondary); font-style: italic;">Note from hiring team: "${app.employerNotes}"</div>` : ''}
        </div>
        <div class="activity-time">${app.appliedDate}</div>
      </div>
    `).join('');
  },

  openProfileModal() {
    this.switchTab('seeker-profile');
  }
};
