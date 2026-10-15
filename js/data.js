/**
 * CAREERPULSE DATA STORE & STATE MANAGER
 * Handles localStorage persistence, seed data, and CRUD events
 */

const DB_KEY = 'careerpulse_db_v1';

const SEED_DATA = {
  // Current active user ID
  activeUserId: 'usr-seeker-1',

  // System Configuration Settings
  settings: {
    siteName: 'CareerPulse Portal',
    contactEmail: 'admin@careerpulse.io',
    currency: 'USD',
    requireApproval: true,
    autoNotify: true,
    maintenanceMode: false
  },

  // Users Collection
  users: [
    {
      id: 'usr-seeker-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'seeker',
      status: 'Active',
      title: 'Senior Full-Stack Engineer',
      location: 'San Francisco, CA',
      phone: '+1 (555) 019-2834',
      portfolio: 'https://alexrivera.dev',
      bio: 'Passionate full-stack engineer with 6+ years specializing in modern cloud architectures, React/TypeScript frontends, and scalable Node.js/Java microservices.',
      skills: ['React', 'Node.js', 'TypeScript', 'Java', 'AWS', 'GraphQL', 'Docker', 'PostgreSQL'],
      experience: '6+ years designing scalable SaaS products, leading frontend refactors, and building distributed microservices at high-growth tech companies.',
      resumeFile: {
        name: 'Alex_Rivera_Senior_Resume.pdf',
        size: '240 KB',
        updated: '2 days ago'
      },
      joinedDate: '2026-01-15'
    },
    {
      id: 'usr-seeker-2',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      role: 'seeker',
      status: 'Active',
      title: 'Lead AI & Machine Learning Scientist',
      location: 'Bengaluru, India (Remote)',
      phone: '+91 98765 43210',
      portfolio: 'https://priyasharma.ai',
      bio: 'Specialized in Large Language Models, PyTorch, computer vision, and high-throughput real-time inference pipelines.',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Docker', 'Kubernetes', 'FastAPI'],
      experience: '5+ years in applied AI research, patent holder in generative vision transformers.',
      resumeFile: {
        name: 'Priya_Sharma_AI_Lead.pdf',
        size: '310 KB',
        updated: '5 days ago'
      },
      joinedDate: '2026-02-10'
    },
    {
      id: 'usr-seeker-3',
      name: 'David Kim',
      email: 'david.kim@example.com',
      role: 'seeker',
      status: 'Active',
      title: 'Senior Product Designer (UI/UX)',
      location: 'New York, NY',
      phone: '+1 (555) 321-9876',
      portfolio: 'https://davidkim.design',
      bio: 'Design systems fanatic crafting pixel-perfect, accessible user experiences for Web and Mobile platforms.',
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'HTML/CSS', 'Accessibility'],
      experience: '7 years building enterprise design systems and leading product design teams.',
      resumeFile: {
        name: 'David_Kim_ProductDesign_CV.pdf',
        size: '185 KB',
        updated: '1 week ago'
      },
      joinedDate: '2026-02-28'
    },
    {
      id: 'usr-emp-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@stripe.com',
      role: 'employer',
      status: 'Active',
      company: 'Stripe Technologies',
      title: 'Head of Technical Talent Acquisition',
      location: 'San Francisco, CA',
      joinedDate: '2025-11-20'
    },
    {
      id: 'usr-emp-2',
      name: 'James Reynolds',
      email: 'j.reynolds@datadog.com',
      role: 'employer',
      status: 'Active',
      company: 'Datadog Systems',
      title: 'Director of Engineering Hiring',
      location: 'Boston, MA',
      joinedDate: '2025-12-05'
    },
    {
      id: 'usr-emp-3',
      name: 'Elena Rostova',
      email: 'elena@spotify.com',
      role: 'employer',
      status: 'Active',
      company: 'Spotify Media',
      title: 'Senior Tech Recruiter',
      location: 'Stockholm / Remote',
      joinedDate: '2026-01-08'
    },
    {
      id: 'usr-admin-1',
      name: 'Marcus Vance',
      email: 'marcus.vance@careerpulse.io',
      role: 'admin',
      status: 'Active',
      title: 'Super Administrator & Governance Lead',
      joinedDate: '2025-09-01'
    }
  ],

  // Job Listings Collection
  jobs: [
    {
      id: 'job-101',
      employerId: 'usr-emp-1',
      company: 'Stripe Technologies',
      title: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'San Francisco, CA (Remote)',
      salary: '$150,000 - $190,000',
      minSalaryNum: 150000,
      experience: 'Senior',
      approvalStatus: 'Approved', // 'Approved' | 'Pending' | 'Rejected'
      status: 'Active', // 'Active' | 'Paused' | 'Closed'
      description: 'We are looking for a Senior Full-Stack Engineer to architect and scale our developer billing and subscription platforms used by millions globally. You will collaborate closely with product managers and infrastructure engineers.',
      requirements: [
        '5+ years of experience with React, TypeScript, and modern Node.js or Java backend services',
        'Strong knowledge of relational databases (PostgreSQL) and caching strategies (Redis)',
        'Experience building highly available distributed systems with 99.99% uptime',
        'Passion for code quality, automated testing (Jest, Cypress), and CI/CD pipelines'
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'Java', 'PostgreSQL', 'AWS', 'Docker'],
      postedDate: '2026-03-01',
      viewsCount: 640
    },
    {
      id: 'job-102',
      employerId: 'usr-emp-1',
      company: 'Stripe Technologies',
      title: 'Staff Backend & Cloud Architect',
      department: 'Engineering',
      type: 'Full-time',
      location: 'San Francisco, CA',
      salary: '$185,000 - $240,000',
      minSalaryNum: 185000,
      experience: 'Lead / Staff',
      approvalStatus: 'Approved',
      status: 'Active',
      description: 'Lead the architectural evolution of Stripe financial settlement engines. You will define technical roadmaps, mentor staff engineers, and build resilient distributed transactional workflows.',
      requirements: [
        '8+ years in distributed systems engineering with Java, Go, or Rust',
        'Deep expertise in event-driven systems (Kafka), ACID transactions, and consensus protocols',
        'Proven track record leading major architectural migrations without customer downtime'
      ],
      skills: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'AWS', 'Distributed Systems'],
      postedDate: '2026-03-04',
      viewsCount: 420
    },
    {
      id: 'job-103',
      employerId: 'usr-emp-2',
      company: 'Datadog Systems',
      title: 'Lead AI Infrastructure Engineer',
      department: 'Data & AI',
      type: 'Remote',
      location: 'Remote (US/EU)',
      salary: '$170,000 - $215,000',
      minSalaryNum: 170000,
      experience: 'Senior',
      approvalStatus: 'Approved',
      status: 'Active',
      description: 'Design next-generation machine learning monitoring and inference clusters. You will optimize tensor processing clusters, build low-latency GPU serving pipelines, and integrate telemetry.',
      requirements: [
        '4+ years building high-performance ML pipelines using PyTorch, Triton, or TensorRT',
        'Expertise in Python, C++, Docker, and Kubernetes GPU scheduling',
        'Familiarity with real-time streaming metrics and observability frameworks'
      ],
      skills: ['Python', 'PyTorch', 'Kubernetes', 'Docker', 'FastAPI', 'LLMs', 'AWS'],
      postedDate: '2026-03-05',
      viewsCount: 512
    },
    {
      id: 'job-104',
      employerId: 'usr-emp-2',
      company: 'Datadog Systems',
      title: 'Senior Product Designer (Design Systems)',
      department: 'Design',
      type: 'Full-time',
      location: 'Boston, MA (Hybrid)',
      salary: '$135,000 - $165,000',
      minSalaryNum: 135000,
      experience: 'Senior',
      approvalStatus: 'Approved',
      status: 'Active',
      description: 'Empower hundreds of engineers and designers by creating, evolving, and documenting our universal design system component library.',
      requirements: [
        '5+ years leading design systems in Figma for complex enterprise Web applications',
        'Deep understanding of WCAG accessibility standards and design tokens',
        'Ability to collaborate tightly with frontend engineers on token automation'
      ],
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility'],
      postedDate: '2026-03-06',
      viewsCount: 380
    },
    {
      id: 'job-105',
      employerId: 'usr-emp-3',
      company: 'Spotify Media',
      title: 'Principal Product Manager - Discovery Engine',
      department: 'Product',
      type: 'Remote',
      location: 'Stockholm, Sweden (Remote)',
      salary: '$160,000 - $200,000',
      minSalaryNum: 160000,
      experience: 'Lead / Staff',
      approvalStatus: 'Approved',
      status: 'Active',
      description: 'Define the future of personalized audio discovery and recommendation algorithms for 500M+ active listeners across the globe.',
      requirements: [
        '6+ years in product management with algorithms, recommendation engines, or consumer apps',
        'Exceptional data literacy and capability to run complex multivariable A/B tests',
        'Strong cross-functional leadership across AI research, UX, and business analytics'
      ],
      skills: ['Product Strategy', 'A/B Testing', 'Data Analytics', 'Agile', 'User Research'],
      postedDate: '2026-03-08',
      viewsCount: 610
    },
    {
      id: 'job-106',
      employerId: 'usr-emp-3',
      company: 'Spotify Media',
      title: 'Frontend Engineer (Web Player Core)',
      department: 'Engineering',
      type: 'Contract',
      location: 'Remote',
      salary: '$90,000 - $120,000',
      minSalaryNum: 90000,
      experience: 'Mid-Level',
      approvalStatus: 'Pending', // Pending moderation for Admin demo
      status: 'Active',
      description: 'Contribute to the lightning-fast web audio player experience. Optimize asset bundle sizes, smooth audio buffer streaming, and interactive playlist animations.',
      requirements: [
        '3+ years in modern JavaScript/TypeScript and React ecosystem',
        'Hands-on experience with Web Audio API, Web Workers, or Media Source Extensions',
        'Obsession with sub-100ms render speeds and fluid micro-animations'
      ],
      skills: ['React', 'TypeScript', 'Web Audio', 'CSS', 'Performance'],
      postedDate: '2026-03-09',
      viewsCount: 88
    },
    {
      id: 'job-107',
      employerId: 'usr-emp-1',
      company: 'Stripe Technologies',
      title: 'Cybersecurity Operations & Threat Analyst',
      department: 'Security',
      type: 'Full-time',
      location: 'San Francisco, CA',
      salary: '$145,000 - $175,000',
      minSalaryNum: 145000,
      experience: 'Mid-Level',
      approvalStatus: 'Pending', // Pending moderation for Admin demo
      status: 'Active',
      description: 'Protect global payments infrastructure against sophisticated attacks, oversee automated vulnerability scanners, and coordinate incident response.',
      requirements: [
        '3+ years in SOC operations, incident triage, or cloud security engineering',
        'Deep understanding of AWS IAM policies, Zero-Trust networks, and SIEM tooling'
      ],
      skills: ['Security', 'AWS', 'SIEM', 'Threat Analysis', 'Linux'],
      postedDate: '2026-03-09',
      viewsCount: 42
    }
  ],

  // Applications Collection
  applications: [
    {
      id: 'app-501',
      jobId: 'job-101',
      seekerId: 'usr-seeker-1',
      employerId: 'usr-emp-1',
      jobTitle: 'Senior Full-Stack Engineer',
      company: 'Stripe Technologies',
      seekerName: 'Alex Rivera',
      seekerEmail: 'alex.rivera@example.com',
      seekerTitle: 'Senior Full-Stack Engineer',
      status: 'Interview Scheduled', // 'Submitted' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Rejected'
      coverLetter: 'I have spent the last 6 years designing robust React and Node/Java backend pipelines with 99.99% uptime. Stripe has always been my benchmark for developer experience.',
      expectedSalary: 165000,
      startDate: '2026-04-01',
      appliedDate: '2026-03-02',
      resumeName: 'Alex_Rivera_Senior_Resume.pdf',
      employerNotes: 'Excellent portfolio and technical pedigree. First technical round scheduled with engineering manager.'
    },
    {
      id: 'app-502',
      jobId: 'job-102',
      seekerId: 'usr-seeker-1',
      employerId: 'usr-emp-1',
      jobTitle: 'Staff Backend & Cloud Architect',
      company: 'Stripe Technologies',
      seekerName: 'Alex Rivera',
      seekerEmail: 'alex.rivera@example.com',
      seekerTitle: 'Senior Full-Stack Engineer',
      status: 'Shortlisted',
      coverLetter: 'Interested in advancing the transactional scaling architecture at Stripe. Extensive experience in Kafka and Spring Boot microservices.',
      expectedSalary: 180000,
      startDate: '2026-04-15',
      appliedDate: '2026-03-04',
      resumeName: 'Alex_Rivera_Senior_Resume.pdf',
      employerNotes: 'Candidate has strong Java background. Proceed to architectural screen.'
    },
    {
      id: 'app-503',
      jobId: 'job-103',
      seekerId: 'usr-seeker-2',
      employerId: 'usr-emp-2',
      jobTitle: 'Lead AI Infrastructure Engineer',
      company: 'Datadog Systems',
      seekerName: 'Priya Sharma',
      seekerEmail: 'priya.sharma@example.com',
      seekerTitle: 'Lead AI & Machine Learning Scientist',
      status: 'Under Review',
      coverLetter: 'Deep experience scaling PyTorch clusters on Kubernetes with zero-latency overhead for enterprise production workloads.',
      expectedSalary: 195000,
      startDate: '2026-04-01',
      appliedDate: '2026-03-06',
      resumeName: 'Priya_Sharma_AI_Lead.pdf',
      employerNotes: 'Impressive research background. Reviewing code samples.'
    },
    {
      id: 'app-504',
      jobId: 'job-104',
      seekerId: 'usr-seeker-3',
      employerId: 'usr-emp-2',
      jobTitle: 'Senior Product Designer (Design Systems)',
      company: 'Datadog Systems',
      seekerName: 'David Kim',
      seekerEmail: 'david.kim@example.com',
      seekerTitle: 'Senior Product Designer (UI/UX)',
      status: 'Offered',
      coverLetter: 'Created design systems used by over 300 frontend engineers. Passionate about token-driven workflows.',
      expectedSalary: 155000,
      startDate: '2026-03-25',
      appliedDate: '2026-03-03',
      resumeName: 'David_Kim_ProductDesign_CV.pdf',
      employerNotes: 'Outstanding design case study. Formal offer extended!'
    },
    {
      id: 'app-505',
      jobId: 'job-105',
      seekerId: 'usr-seeker-1',
      employerId: 'usr-emp-3',
      jobTitle: 'Principal Product Manager - Discovery Engine',
      company: 'Spotify Media',
      seekerName: 'Alex Rivera',
      seekerEmail: 'alex.rivera@example.com',
      seekerTitle: 'Senior Full-Stack Engineer',
      status: 'Submitted',
      coverLetter: 'Eager to apply engineering insights to product recommendation systems.',
      expectedSalary: 160000,
      startDate: '2026-05-01',
      appliedDate: '2026-03-08',
      resumeName: 'Alex_Rivera_Senior_Resume.pdf',
      employerNotes: ''
    }
  ],

  // Direct Chat Messages
  messages: [
    {
      id: 'msg-1',
      applicationId: 'app-501',
      senderId: 'usr-emp-1',
      senderName: 'Sarah Chen (Stripe)',
      recipientId: 'usr-seeker-1',
      recipientName: 'Alex Rivera',
      text: 'Hi Alex, thank you for applying for the Senior Full-Stack Engineer position at Stripe! We were very impressed by your background in React and microservices.',
      timestamp: '2026-03-03T10:15:00Z',
      read: true
    },
    {
      id: 'msg-2',
      applicationId: 'app-501',
      senderId: 'usr-seeker-1',
      senderName: 'Alex Rivera',
      recipientId: 'usr-emp-1',
      recipientName: 'Sarah Chen (Stripe)',
      text: 'Thank you Sarah! Excited to connect. I have been following Stripe developer tools closely and would love to contribute.',
      timestamp: '2026-03-03T11:20:00Z',
      read: true
    },
    {
      id: 'msg-3',
      applicationId: 'app-501',
      senderId: 'usr-emp-1',
      senderName: 'Sarah Chen (Stripe)',
      recipientId: 'usr-seeker-1',
      recipientName: 'Alex Rivera',
      text: 'Wonderful! We would love to schedule a 45-minute technical discussion with our Engineering Manager for next Tuesday at 2:00 PM PST. Does that time work for you?',
      timestamp: '2026-03-04T09:30:00Z',
      read: false
    }
  ],

  // Audit Logs & Real-time Activities
  activityLogs: [
    {
      id: 'act-1',
      type: 'application',
      text: 'Alex Rivera submitted an application for "Principal Product Manager" at Spotify Media',
      timestamp: '15 mins ago',
      badgeClass: 'badge-primary'
    },
    {
      id: 'act-2',
      type: 'moderation',
      text: 'Employer Sarah Chen published "Cybersecurity Operations & Threat Analyst" (Awaiting Review)',
      timestamp: '1 hour ago',
      badgeClass: 'badge-warning'
    },
    {
      id: 'act-3',
      type: 'status',
      text: 'David Kim was moved to "Offered" stage by Datadog Systems',
      timestamp: '3 hours ago',
      badgeClass: 'badge-success'
    },
    {
      id: 'act-4',
      type: 'user',
      text: 'New candidate profile registered: Priya Sharma (AI Scientist)',
      timestamp: 'Yesterday',
      badgeClass: 'badge-info'
    },
    {
      id: 'act-5',
      type: 'approval',
      text: 'Admin Marcus Vance approved job listing "Lead AI Infrastructure Engineer"',
      timestamp: '2 days ago',
      badgeClass: 'badge-success'
    }
  ],

  // System Notifications
  notifications: [
    {
      id: 'notif-1',
      userId: 'usr-seeker-1',
      title: 'Interview Scheduled',
      message: 'Stripe Technologies scheduled your technical interview for Senior Full-Stack Engineer.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 'notif-2',
      userId: 'usr-emp-1',
      title: 'New Candidate Applied',
      message: 'Alex Rivera applied for Staff Backend & Cloud Architect.',
      time: '1 day ago',
      read: false
    },
    {
      id: 'notif-3',
      userId: 'usr-admin-1',
      title: 'Job Moderation Queue',
      message: '2 new job postings from Spotify and Stripe are waiting for your approval.',
      time: 'Just now',
      read: false
    }
  ]
};

// Global Store Helper
const DataStore = {
  get() {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage load failed, using seed data', e);
    }
    this.set(SEED_DATA);
    return SEED_DATA;
  },

  set(data) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('careerpulse_data_changed', { detail: data }));
    } catch (e) {
      console.error('LocalStorage save failed', e);
    }
  },

  reset() {
    localStorage.removeItem(DB_KEY);
    this.set(SEED_DATA);
    return SEED_DATA;
  },

  // Helpers for Active User
  getActiveUser() {
    const data = this.get();
    return data.users.find(u => u.id === data.activeUserId) || data.users[0];
  },

  setActiveUserId(userId) {
    const data = this.get();
    data.activeUserId = userId;
    this.set(data);
  },

  // Helpers for Jobs
  getApprovedJobs() {
    const data = this.get();
    return data.jobs.filter(j => j.approvalStatus === 'Approved' && j.status === 'Active');
  },

  getAllJobs() {
    const data = this.get();
    return data.jobs;
  },

  saveJob(jobObj) {
    const data = this.get();
    if (jobObj.id) {
      const index = data.jobs.findIndex(j => j.id === jobObj.id);
      if (index !== -1) {
        data.jobs[index] = { ...data.jobs[index], ...jobObj };
      }
    } else {
      jobObj.id = 'job-' + Date.now().toString().slice(-4);
      jobObj.postedDate = new Date().toISOString().split('T')[0];
      jobObj.viewsCount = 1;
      data.jobs.unshift(jobObj);

      // Add log
      this.addActivityLog('moderation', `Employer submitted job "${jobObj.title}" for approval.`, 'badge-warning');
    }
    this.set(data);
    return jobObj;
  },

  deleteJob(jobId) {
    const data = this.get();
    data.jobs = data.jobs.filter(j => j.id !== jobId);
    this.set(data);
  },

  updateJobApproval(jobId, newStatus) {
    const data = this.get();
    const job = data.jobs.find(j => j.id === jobId);
    if (job) {
      job.approvalStatus = newStatus;
      this.addActivityLog('approval', `Admin ${newStatus.toLowerCase()} job "${job.title}" by ${job.company}.`, newStatus === 'Approved' ? 'badge-success' : 'badge-danger');
      this.set(data);
    }
  },

  // Helpers for Applications
  getApplications() {
    const data = this.get();
    return data.applications;
  },

  submitApplication(appObj) {
    const data = this.get();
    appObj.id = 'app-' + Date.now().toString().slice(-4);
    appObj.appliedDate = new Date().toISOString().split('T')[0];
    appObj.status = 'Submitted';
    appObj.employerNotes = '';
    data.applications.unshift(appObj);

    this.addActivityLog('application', `${appObj.seekerName} applied for "${appObj.jobTitle}" at ${appObj.company}`, 'badge-primary');
    
    // Add notification for employer
    data.notifications.unshift({
      id: 'notif-' + Date.now(),
      userId: appObj.employerId,
      title: 'New Candidate Applied',
      message: `${appObj.seekerName} submitted an application for ${appObj.jobTitle}.`,
      time: 'Just now',
      read: false
    });

    this.set(data);
    return appObj;
  },

  updateApplicationStatus(appId, newStatus, employerNotes = '') {
    const data = this.get();
    const app = data.applications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      if (employerNotes) app.employerNotes = employerNotes;
      
      this.addActivityLog('status', `Candidate ${app.seekerName} status updated to "${newStatus}" for ${app.jobTitle}`, 'badge-info');

      // Add seeker notification
      data.notifications.unshift({
        id: 'notif-' + Date.now(),
        userId: app.seekerId,
        title: `Status Update: ${newStatus}`,
        message: `Your application for ${app.jobTitle} at ${app.company} is now "${newStatus}".`,
        time: 'Just now',
        read: false
      });

      this.set(data);
    }
  },

  // Helpers for Messages
  getMessagesForApp(appId) {
    const data = this.get();
    return data.messages.filter(m => m.applicationId === appId);
  },

  addMessage(msgObj) {
    const data = this.get();
    msgObj.id = 'msg-' + Date.now();
    msgObj.timestamp = new Date().toISOString();
    msgObj.read = false;
    data.messages.push(msgObj);
    this.set(data);
    return msgObj;
  },

  // Helpers for Users
  getUsers() {
    return this.get().users;
  },

  saveUser(userObj) {
    const data = this.get();
    if (userObj.id) {
      const idx = data.users.findIndex(u => u.id === userObj.id);
      if (idx !== -1) {
        data.users[idx] = { ...data.users[idx], ...userObj };
      }
    } else {
      userObj.id = 'usr-' + Date.now().toString().slice(-4);
      userObj.joinedDate = new Date().toISOString().split('T')[0];
      data.users.push(userObj);
      this.addActivityLog('user', `Admin created new ${userObj.role} account: ${userObj.name}`, 'badge-info');
    }
    this.set(data);
    return userObj;
  },

  deleteUser(userId) {
    const data = this.get();
    data.users = data.users.filter(u => u.id !== userId);
    this.set(data);
  },

  // Helpers for Settings & Logs
  saveSettings(newSettings) {
    const data = this.get();
    data.settings = { ...data.settings, ...newSettings };
    this.addActivityLog('settings', 'System-wide configuration settings were updated by Admin.', 'badge-info');
    this.set(data);
  },

  addActivityLog(type, text, badgeClass = 'badge-primary') {
    const data = this.get();
    data.activityLogs.unshift({
      id: 'act-' + Date.now(),
      type,
      text,
      timestamp: 'Just now',
      badgeClass
    });
    // Keep max 25
    if (data.activityLogs.length > 25) data.activityLogs.pop();
    this.set(data);
  }
};
