 # HireMate

 HireMate is a job application tracker prototype that I started building a few days ago after the idea came to me. It is currently a basic MERN app (Express + MongoDB backend, Vite + React frontend) with authentication, application data models, API routes, a reminder utility, and a simple React UI to create and track applications.

- **Backend**
  - Express server and database connection: [backend/server.js](backend/server.js), [backend/config/db.js](backend/config/db.js)
  - Authentication routes and JWT-based auth middleware: [backend/routes/authRoutes.js](backend/routes/authRoutes.js), [backend/middleware/auth.js](backend/middleware/auth.js)
  - Application routes and CRUD support: [backend/routes/applicationRoutes.js](backend/routes/applicationRoutes.js)
  - Data models for users and applications: [backend/models/User.js](backend/models/User.js), [backend/models/Application.js](backend/models/Application.js)
  - Reminder/cron utility to surface deadlines: [backend/utils/reminderCron.js](backend/utils/reminderCron.js)

- **Frontend**
  - Vite + React app with Tailwind styling (setup files present)
  - Pages for authentication and dashboard: [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx), [frontend/src/pages/Signup.jsx](frontend/src/pages/Signup.jsx), [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
  - Reusable components: [frontend/src/components/ApplicationCard.jsx](frontend/src/components/ApplicationCard.jsx), [frontend/src/components/AddApplicationModal.jsx](frontend/src/components/AddApplicationModal.jsx)
  - Axios wrapper for API calls: [frontend/src/api/axios.js](frontend/src/api/axios.js)

## Quick start (local)

Prerequisites: Node.js (v16+ recommended) and npm.

1. Run the backend

```bash
cd backend
npm install
# create .env from .env.example and set MONGO_URI and JWT_SECRET
npm run dev # or `node server.js`
```

2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

3. Common env vars (backend/.env)

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `PORT` — backend port (optional)

## Key API endpoints (summary)

- `POST /api/auth/signup` — register a new user
- `POST /api/auth/login` — login and receive a JWT
- `GET /api/applications` — list authenticated user's applications
- `POST /api/applications` — create a new application
- update/delete endpoints exist in [backend/routes/applicationRoutes.js](backend/routes/applicationRoutes.js)

Inspect the backend route files for exact request/response shapes.

## Progress notes & ideas

- This is an early-stage project started from a recent idea, and the current work focuses on the basic MERN stack.
- The core MERN skeleton is implemented with authentication and application CRUD.
- Reminder cron runs to check deadlines; currently logs reminders — can be extended to email or push notifications.
- AI is not integrated yet; the current implementation is intentionally in the standard MERN phase.

## Next steps (suggested)

- Add input validation and centralized error handling
- Add tests (backend routes + frontend integration) and set up CI
- Polish UI: improve forms, add status dropdowns, deadline summaries
- Deploy backend (Railway/Render) and frontend (Vercel/Netlify)
- Optional: add JD/resume analysis and LLM-based features (planned)

---

If you'd like, I can add example `.env` files, a Postman collection, screenshots, or brief deployment instructions next. Tell me which you'd prefer and I'll add it.
