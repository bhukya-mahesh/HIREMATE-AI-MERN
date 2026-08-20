# HireMate

HireMate is a MERN-based placement preparation platform that helps students manage job applications, optimize resumes, prepare for interviews, and learn from uploaded books using AI-powered insights. The platform combines application tracking, intelligent resume and job description analysis, personalized preparation plans, and study assistance into one student-friendly experience.

## Live Demo

- Web app: https://hiremate-ai-mern.vercel.app/

## Live Backend

- Backend API: https://hiremate-ai-mern.onrender.com
- API base path: https://hiremate-ai-mern.onrender.com/api

## What the project includes

### Core features
- User authentication with signup, login, and protected routes
- Application tracking dashboard for job applications, stages, and interview notes
- Profile management with resume upload, skills, and role-specific metadata
- AI-powered job description analysis to identify key skills and fit
- Resume matching and feedback for stronger application positioning
- Personalized 7-day preparation roadmap with task suggestions and progress cues
- AI mentor guidance with preparation advice and interview readiness prompts
- Study module for uploading books and asking AI questions based on the book content
- Mock OA: AI-generated mock assessments with instant scoring and detailed feedback
- PDF handling for resumes, job descriptions, and study materials



### Why HireMate?
- Designed for students and early-career professionals preparing for placements
- Centralizes application tracking, preparation planning, and learning support
- Uses AI to reduce manual resume review and job matching guesswork
- Helps keep preparation organized across applications, interviews, and study goals
### ScreenShots 
<img width="1857" height="912" alt="Screenshot 2026-08-11 153840" src="https://github.com/user-attachments/assets/eaf439ef-9eba-498a-81dc-9b24b346a9b4" />
<img width="1900" height="976" alt="Screenshot 2026-08-11 152947" src="https://github.com/user-attachments/assets/645a8d0a-1f57-411a-8e1d-0cb783ff39b0" />
<img width="1918" height="890" alt="Screenshot 2026-08-11 153023" src="https://github.com/user-attachments/assets/456ae9a6-b625-4810-abb2-62c24f1e9b9c" />
<img width="1907" height="957" alt="Screenshot 2026-08-11 153046" src="https://github.com/user-attachments/assets/644ebb6d-3c3a-42c0-8f7b-8715d641b12a" />
<img width="1001" height="882" alt="Screenshot 2026-08-11 153113" src="https://github.com/user-attachments/assets/22f3fe23-d736-49b4-8e34-07e0d515014c" />
<img width="1902" height="900" alt="Screenshot 2026-08-11 153137" src="https://github.com/user-attachments/assets/29d580a7-4ac2-45a1-8427-05f716fa7529" />
<img width="1912" height="885" alt="Screenshot 2026-08-11 153151" src="https://github.com/user-attachments/assets/831b73be-499f-40e7-9e3d-4a56ab3e2a5f" />

<img width="1908" height="892" alt="Screenshot 2026-08-20 174648" src="https://github.com/user-attachments/assets/1ef20ef1-100b-4277-9619-59ce13d1cf77" />
<img width="1916" height="925" alt="Screenshot 2026-08-11 153221" src="https://github.com/user-attachments/assets/e5112598-b62f-48c1-9850-b978df7a84b2" />
<img width="1918" height="770" alt="Screenshot 2026-08-20 153232" src="https://github.com/user-attachments/assets/766b5792-4e5d-41ff-8df2-91b8e0d959ca" />
<img width="1907" height="853" alt="Screenshot 2026-08-20 153254" src="https://github.com/user-attachments/assets/07e39200-3c0b-4697-8f03-2fb088acbc6d" />
<img width="1908" height="798" alt="Screenshot 2026-08-20 153316" src="https://github.com/user-attachments/assets/2ce84856-6ca9-48f5-92ff-8e8593fb80ab" />
<img width="1918" height="846" alt="Screenshot 2026-08-20 153339" src="https://github.com/user-attachments/assets/a55fa868-1dba-429b-b30c-dd05074b1f2f" />
<img width="1918" height="937" alt="Screenshot 2026-08-11 153301" src="https://github.com/user-attachments/assets/3c2c58b9-d960-4a11-a8ef-32d931e62bec" />
<img width="1915" height="925" alt="Screenshot 2026-08-11 153320" src="https://github.com/user-attachments/assets/985769cd-c1fe-4ad0-8683-c47d2c14aa18" />
<img width="1907" height="882" alt="Screenshot 2026-08-11 153819" src="https://github.com/user-attachments/assets/9098912c-1f64-452e-855b-24ef7a8ae1f9" />

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
