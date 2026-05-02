# Sessions Marketplace Platform: Project Guide

A professional, full-stack marketplace connecting expert Creators with eager Learners through high-impact 1-on-1 sessions.

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 (Modern, utility-first)
- **Animations**: Framer Motion (Premium, smooth transitions)
- **Icons**: Lucide React
- **Payments**: Razorpay SDK Integration
- **Auth**: Google OAuth 2.0 (@react-oauth/google)

### Backend
- **Framework**: Django 4.2+ & Django REST Framework (DRF)
- **Language**: Python 3.12+
- **Database**: PostgreSQL 16 (Relational data with UUID support)
- **Auth**: JWT (SimpleJWT) for secure, stateless sessions
- **Storage**: MinIO (S3 Compatible) for session images
- **Reverse Proxy**: Nginx (WebSocket & HMR support)

---

## ✨ Core Features

### 1. Advanced Search & Discovery
- **API-Driven Search**: Real-time session filtering via backend `SearchFilter`.
- **Category Labels**: Visual tags for Frontend, Backend, Career, etc.
- **Global Pagination**: Smooth, offset-based navigation across all session listings.

### 2. UUID-Based Architecture
- **Data Integrity**: Every User, Session, and Booking uses a unique UUID primary key.
- **Secure Routing**: URLs like `/sessions/[uuid]` prevent ID guessing and improve security.

### 3. Secure Payment Lifecycle
- **Razorpay Integration**: Seamless checkout flow with automated order creation.
- **Payment Verification**: Backend HMAC signature verification for secure transaction confirmation.
- **Instant Confirmation**: Automatic booking status update from `PENDING` to `CONFIRMED` upon payment.

### 4. Creator Management
- **Dashboard**: Real-time stats for "Successful Bookings" and "Pending Requests."
- **Dirty-Check Editing**: Smart "Save" button that only enables when changes are detected in session details.
- **Numeric Pricing**: Enforced float-based pricing for consistent financial calculations.

### 5. Learner Experience
- **Journey Tracking**: Personalized dashboard with booking history and learning points.
- **Real-Time Status**: Visual indicators for `CONFIRMED`, `PENDING`, or `FAILED` bookings.
- **JWT Persistence**: Stateless auth tracking via localStorage and secure Cookies.

---

## 🛠️ How to Use the Platform

### Phase 1: Authentication
1. **Sign In**: Navigate to the login page.
2. **Identity Selection**: Choose your role (**USER** or **CREATOR**).
3. **Developer Bypass**: Use the "Developer Bypass" for instant login during testing (admin/admin123).

### Phase 2: The Learner Journey
1. **Browse**: Search for sessions by skill or category in the home catalog.
2. **Session Detail**: View expert bio, duration, and investment price.
3. **Booking**: Click **SECURE BOOKING** to trigger the Razorpay gateway.
4. **Dashboard**: Track your confirmed sessions in the Learner Dashboard.

### Phase 3: The Creator Journey
1. **Create Session**: Add a new session with title, description, price (number), and duration.
2. **Manage**: Use the Creator Dashboard to edit existing sessions.
3. **Stats**: Monitor your successful and pending bookings in real-time.

---

## 🏗️ Technical Architecture Details

### Authentication Flow
- **Request**: User clicks login.
- **Validation**: Backend verifies Google/Dev credentials.
- **Session**: JWT Access/Refresh tokens are issued and stored in LocalStorage & Cookies.

### Booking & Payment Flow
- **Creation**: Learner creates a `PENDING` booking.
- **Order**: Backend creates a Razorpay Order ID.
- **Payment**: Learner pays via Razorpay Modal.
- **Verification**: Backend verifies the payment signature and updates booking to `CONFIRMED`.

---

## 🛠️ Infrastructure & Administration

Manage the platform using these administrative tools:

| Service | Link | Credentials |
|---------|------|-------------|
| **Main Application** | [http://localhost](http://localhost) | Use Developer Bypass |
| **Django Admin** | [http://localhost/admin/](http://localhost/admin/) | `admin` / `admin123` |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | `minioadmin` / `minioadmin` |
| **PostgreSQL** | `localhost:5432` | `sessions_user` / `change-me` |

### 📸 Screenshots & Previews
*(Screenshots of administration panels are generated and available in the project assets)*

### 🗄️ Database Schema Overview
The PostgreSQL database contains the following core tables:

```sql
- core_user                  -- Custom user model with role-based auth
- bookings_session           -- Expert sessions with UUID and numeric pricing
- bookings_booking           -- Learner bookings tracking status (CONFIRMED/PENDING)
- payments_payment           -- Financial transactions linked to Razorpay
- django_admin_log           -- Administrative audit trails
```

## 🧪 Deployment & Local Setup
1. **Clone**: Pull the repository.
2. **Environment**: Configure `.env` with `RAZORPAY_KEY_ID` and `GOOGLE_CLIENT_ID`.
3. **Docker**: Run `docker compose up --build`.
4. **Access**: Open `http://localhost` to view the platform.
