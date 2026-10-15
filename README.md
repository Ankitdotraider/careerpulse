# CareerPulse — Online Job Portal

A modern, full-featured **Online Job Portal** web application built to fulfill the GUVI Geek Network specification. CareerPulse delivers dedicated, role-tailored dashboards and distinct workflows for **Administrators**, **Employers**, and **Job Seekers**.

---

## 🌟 Key Stakeholders & Functionalities

### 1. 🛡️ Administrator Portal
* **User Management:** Complete CRUD table for user accounts. Create, edit, and delete accounts, assign system roles (*Admin, Employer, Job Seeker*), and toggle status (*Active / Suspended*).
* **Job Listing Moderation Queue:** Review job postings submitted by employers. One-click **Approve** or **Reject** with real-time status updates and audit logging.
* **System Settings:** Control system-wide policies (site name, contact email, default currency, mandatory job approval enforcement, maintenance mode, and automated applicant emails).
* **Job Statistics & Analytics:** Interactive Chart.js visual telemetry showing monthly job postings vs applications trends, user role distributions, and approval metrics.
* **Real-Time User Activity Monitoring:** Live streaming audit feed logging user logins, application submissions, moderation decisions, and system config changes.

---

### 2. 🏢 Employer Portal
* **Job Posting & Management:** Post new vacancies with detailed requirements, salary ranges, categories, and skill tags. Full CRUD interface to edit, update, pause, or delete listings.
* **Applicant Review Pipeline:** Filter candidates by job posting and review pipeline stages:
  $$\text{Submitted} \longrightarrow \text{Under Review} \longrightarrow \text{Shortlisted} \longrightarrow \text{Interview Scheduled} \longrightarrow \text{Offered} \big/ \text{Rejected}$$
* **Resume & Profile Inspection:** Formatted CV viewer to inspect candidate skills, credentials, and portfolios.
* **Direct Candidate Communication:** Real-time 1-on-1 chat module with pre-set templates (*Interview Invitation*, *Offer Letter*) and instant response simulation.
* **Job Posting History & Hiring Analytics:** Bar charts and conversion funnels tracking candidate flow from application to hire.

---

### 3. 👤 Job Seeker Portal
* **Intelligent Job Search & Filtering:** Comprehensive search by keywords, location, department, employment type (Full-time, Contract, Remote, Part-time), experience level, and interactive salary sliders.
* **AI Skill-Match Recommendations:** Automated recommendation engine calculating `% Match` scores based on candidate profile skills vs job requirements.
* **1-Click Job Application:** Modal apply drawer with auto-filled profile credentials, cover letter builder, expected salary, and attached resume.
* **Application Tracker:** Real-time visual progress tracker showing pipeline status updates (*Submitted, In Review, Shortlisted, Interview Scheduled, Offered*).
* **Profile & Resume Builder:** Comprehensive profile editor for contact details, career summary, skill tags, and resume file upload/preview.
* **Application History & Audit Log:** Complete archive of all past job applications and notes from hiring teams.

---

## 🚀 Quick Start / How to Run

1. **Direct Browser Execution:**
   Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox).

2. **Using a Local Server (Recommended):**
   ```bash
   # Using Python 3
   python3 -m http.server 3000

   # Or using Node.js npx
   npx serve .
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎭 Interactive Role Switcher Demo

A persistent demo bar is pinned at the top of the interface allowing instant switching between:
* **Job Seeker**: Alex Rivera (*Senior Full-Stack Engineer*)
* **Employer**: Sarah Chen (*Stripe Technologies*)
* **Admin**: Marcus Vance (*Super Administrator*)

You can also use the **"Reset State"** button at any time to restore the default sample dataset.

---

## 💻 Tech Stack & Architecture

* **Frontend:** HTML5 (Semantic), Vanilla CSS3 (Custom Design System with CSS variables, Glassmorphism, Dark/Light Themes), Vanilla JavaScript (ES6+ Modules).
* **Analytics Engine:** Chart.js 4.4 for dynamic telemetry graphs and pipeline conversion funnels.
* **Persistence:** Reactive LocalStorage state manager (`data.js`) supporting seamless offline persistence, real-time event dispatching, and audit logging.
