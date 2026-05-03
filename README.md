# Sessions Marketplace: Senior Full-Stack Engineering Showcase

A high-performance, production-ready marketplace for expert 1-on-1 sessions. Built with a focus on architecture, security, and premium user experience.

## 🚀 Key Architectural Features (Senior Engineer Framework)

### 1. Robust Infrastructure (Docker & Nginx)
- **Multi-Stage Builds**: Optimized Docker images using multi-stage builds to keep production images lean.
- **Reverse Proxy**: Nginx orchestrates traffic between the Next.js frontend and Django backend, handling static/media file serving and API routing.
- **Persistence**: PostgreSQL and MinIO (S3) data are managed via persistent Docker volumes, ensuring no data loss on container restarts.

### 2. High-Performance UX (The "Google Professional" Standard)
- **Fluid Animations**: Staggered card entrances and smooth transitions powered by `framer-motion`.
- **Skeleton Loaders**: Integrated shimmer states across all dashboards to eliminate content popping and improve perceived performance.
- **Glassmorphism UI**: High-impact design language using backdrop blurs and a semantic Inter-based typography system.
- **Feedback Loops**: Integrated `react-hot-toast` for professional, non-blocking notifications for payments and session lifecycle.

### 3. Security & RBAC (Role-Based Access Control)
- **Middleware Protection**: Next.js Middleware enforces dashboard access. A 'User' cannot manually navigate to a 'Creator' URL without authorization.
- **JWT Authentication**: Secure Google OAuth integration with a structured JWT flow.
- **Backend Permissions**: Custom Django permission classes (`IsCreator`, `IsSessionCreatorOwner`) enforce RBAC at the API level.

### 4. Database & API Optimization
- **N+1 Elimination**: Extensive use of `select_related` (e.g., `session__creator`) ensures complex data trees are fetched in a single optimized SQL join.
- **Media Management**: Seamless S3/MinIO integration for session banner uploads with automated URL generation.
- **Razorpay Integration**: Robust end-to-end booking flow with signature verification and asynchronous callback handling.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Django, Django REST Framework, PostgreSQL.
- **Storage**: MinIO (S3-Compatible), local volumes.
- **Payments**: Razorpay.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 🏗️ Quick Start (Production Setup)

1. **Clone & Configure**:
   ```bash
   git clone <repo-url>
   cd Session-Management
   cp .env.example .env
   ```

2. **Launch Infrastructure**:
   ```bash
   docker compose up -d --build
   ```

3. **Verify Deployment**:
   - Frontend: `http://localhost:80`
   - API Docs: `http://localhost/api/docs` (if enabled)
   - MinIO Console: `http://localhost:9001`

---

## 🧪 Demo Flow
1. **Login**: Use Google Sign-In to authenticate.
2. **Creator Flow**: Visit the Dashboard, create a high-impact session with a banner.
3. **User Flow**: Browse the catalog (note the skeleton loaders), book a session via the Secure Razorpay portal.
4. **Validation**: Check your User Dashboard to see the booking immediately appear.
   
<a href="https://drive.google.com/file/d/1EN6rLFG5tXNCD8Em2diqot_7aLcsMOVo/view?usp=sharing">![Demo video of Game](https://img.shields.io/badge/Demo_Video_Of_Game-Click_ME-brightgreen.svg?style=plastic&logo=YouTube&logoColor=red)</a>


---
*Developed as a high-value portfolio project demonstrating end-to-end full-stack mastery.*
