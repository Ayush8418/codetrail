# CodeTrail

CodeTrail is a comprehensive, production-ready student productivity and active-recall ecosystem. Built using **Next.js**, **Tailwind CSS**, and **MongoDB/Mongoose**, it seamlessly bridges the gap between structured learning and task management. It empowers students to track study sessions via an interactive Pomodoro timer, log daily habits and diaries, implement spaced repetition with custom revision alerts, and secure their data with a robust, multi-flow authentication system.

**🌐 Live Demo:** [codetrail-coral.vercel.app](https://codetrail-coral.vercel.app/auth/signin)

---

## 🚀 Features

### 🛡️ Advanced Authentication Suite
* **Multi-Provider Login:** Secure authentication using Google OAuth or traditional Email/Password credentials.
* **Account Verification:** Automated email verification using `nodemailer` upon registration to ensure valid user bases.
* **Security Recovery:** Fully implemented "Forgot Password" and secure password reset flow via time-sensitive email links.

### ⏱️ Active Learning & Study Tracking
* **Interactive Pomodoro Timer:** A live, frontend-driven timer helping students balance focused deep-work blocks and structured breaks.
* **Study Session Analytics:** Logs and tracks study durations, target focus areas, and actual hours completed.
* **Smart Revision Engine:** Allows students to manually assign calendar revision dates to individual questions, notes, and complete study sessions to facilitate active recall.

### 📋 All-in-One Student Management
* **Dynamic To-Do Lists:** Daily task creation, prioritization, and completion tracking.
* **Personal Diary/Journal:** A dedicated space for students to document daily reflections, technical hurdles, or learning milestones.
* **Habit Tracker:** Visual tracking to help build and maintain consistent daily study routines.

---

## 🛠️ Tech Stack

* **Frontend & Framework:** Next.js (App Router), Tailwind CSS
* **Database & ODM:** MongoDB, Mongoose
* **Authentication:** NextAuth.js / Custom Auth handles with Google OAuth & Email/Password
* **Mailing Service:** Nodemailer (Verification & Password Reset tokens)
* **Deployment & Performance Optimization:** Vercel (utilizing native Next.js page caching and API route optimization)

---

## ⚙️ Architecture & Performance Optimizations

* **Next.js Caching Engine:** Capitalizes on Next.js built-in data caching and page memoization strategies to minimize unnecessary database hits and maximize page response speeds.
* **Optimized ODM Layers:** Employs Mongoose schemas designed for fast read/write execution, proper indexing on user identifiers, and efficient relationship tracking between users, notes, and timers.

---

## 💻 Getting Started

### Prerequisites
* Node.js (v18.x or higher)
* MongoDB Atlas account or local MongoDB instance

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/codetrail.git](https://github.com/your-username/codetrail.git)
   cd codetrail
2. **Install dependencies:**
   ```bash
   npm install
2. **Configure Environment Variables:**
   ```bash
    # Database Connection
    MONGODB_URI=your_mongodb_connection_string
    
    # Authentication Configuration
    NEXTAUTH_SECRET=your_nextauth_secret_key
    NEXTAUTH_URL=http://localhost:3000
    
    # Google OAuth Credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    
    # Nodemailer SMTP Configuration
    EMAIL_SERVER_HOST=your_smtp_host
    EMAIL_SERVER_PORT=your_smtp_port
    EMAIL_SERVER_USER=your_email_address
    EMAIL_SERVER_PASSWORD=your_email_app_password
    EMAIL_FROM=noreply@codetrail.com
2. **Run the development server:**
   ```bash
   npm run dev
   
