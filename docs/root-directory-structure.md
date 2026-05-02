# Root Directory Structure

```text
Session-Management/
├── backend/
│   ├── bookings/
│   ├── config/
│   ├── core/
│   ├── payments/
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker/
│   └── minio/
├── scripts/
├── docs/
│   └── root-directory-structure.md
├── .env.example
├── README.md
└── docker-compose.yml
```

## Intended Boundaries

- `backend/core`: Google OAuth, JWT issuing, user profile, roles, permissions, throttling, and exception handling.
- `backend/bookings`: public sessions, creator session management, and booking lifecycle.
- `backend/payments`: Razorpay order creation and payment signature verification.
- `backend/config`: Django settings, URLs, ASGI/WSGI, rate limits, CORS, and S3/MinIO storage configuration.
- `frontend/src/app`: Next.js App Router routes for catalog, detail, booking, auth, and dashboards.
- `frontend/src/components`: reusable responsive UI components and error boundaries.
- `frontend/src/lib`: API client, auth helpers, Razorpay loader, validation utilities, and typed domain services.
- `nginx`: reverse proxy for frontend, backend API, Django admin, static files, and media files.
- `docker/minio`: optional local MinIO bootstrap scripts or bucket policies.
- `scripts`: one-command developer helpers for setup, migration, seeding, and test workflows.
