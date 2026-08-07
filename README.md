# HireMate

HireMate is a MERN-based placement preparation platform designed to help students track job applications, analyze resumes against job descriptions, generate personalized preparation roadmaps, and study from uploaded books with AI assistance. The project is currently in active development and is being iterated toward a more complete end-to-end experience.

## Live Backend

- Backend API: https://hiremate-ai-mern.onrender.com
- API base path: https://hiremate-ai-mern.onrender.com/api

## What the project includes

### Core features
- User authentication with signup, login, and protected routes
- Application tracking dashboard for job applications and statuses
- Profile management with resume upload and skill tracking
- AI-powered JD analysis and resume matching
- Personalized 7-day preparation roadmap generation
- AI mentor guidance based on application progress
- Study module for uploading books and asking AI questions from book content

### Tech stack
- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer, CORS
- AI integration: Google Gemini via the backend for JD analysis, resume evaluation, roadmap generation, and mentor responses

## Project structure

```text
HireMate/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   └── studyController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   ├── uploadBook.js
│   │   └── uploadResume.js
│   ├── models/
│   │   ├── Application.js
│   │   ├── Book.js
│   │   └── User.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   └── studyRoutes.js
│   ├── uploads/
│   │   ├── books/
│   │   └── resumes/
│   ├── utils/
│   │   ├── embeddings.js
│   │   ├── llm.js
│   │   ├── pdfExtractor.js
│   │   ├── reminderCron.js
│   │   └── vectorSearch.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
└── README.md
```

Key areas:
- Backend logic and API routes live under [backend](backend)
- Frontend pages and reusable UI components live under [frontend/src](frontend/src)
- The AI and study features are implemented in [backend/controllers/aiController.js](backend/controllers/aiController.js) and [backend/controllers/studyController.js](backend/controllers/studyController.js)

## Local development

### Prerequisites
- Node.js 18+ recommended
- npm
- MongoDB instance
- Gemini API key for AI features

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Update the backend environment file with:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `GEMINI_API_KEY` — Google Gemini API key for AI features
- `PORT` — optional backend port

Run the backend:

```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set the frontend environment variable:

```env
VITE_API_URL=https://hiremate-ai-mern.onrender.com/api
```

Run the frontend:

```bash
npm run dev
```

## API overview

Key backend endpoints include:
- `POST /api/auth/signup` — register a user
- `POST /api/auth/login` — authenticate a user and return a JWT
- `GET /api/auth/profile` — fetch the signed-in user's profile and stats
- `GET /api/applications` — list applications for the current user
- `POST /api/applications` — create a new application
- `POST /api/ai/applications/:id/analyze-jd` — analyze a JD PDF
- `POST /api/ai/applications/:id/analyze-resume` — compare a resume PDF to a JD
- `POST /api/ai/applications/:id/roadmap` — generate a personalized roadmap
- `GET /api/study/books` — list uploaded study books
- `POST /api/study/books` — upload a book for AI study assistance

## Development status

This project is currently in development. Core functionality is implemented and working at a prototype level, but the app is still being refined for stability, polish, and broader feature completeness. Some features may evolve as the product matures.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Next steps

Suggested improvements include:
- Improving validation and error handling
- Adding automated tests and CI/CD coverage
- Enhancing UI polish and responsiveness
- Expanding AI features and study experience
- Strengthening deployment and monitoring for production use
