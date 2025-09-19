
# Contact Book (Vite + React + Express + SQLite)

This repository contains a simple Contact Book application with a Vite + React frontend and an Express + SQLite backend.

Overview
- frontend: React app in `frontend/` (Vite for dev)
- backend: Express API in `backend/` (SQLite for storage)

Requirements
- Node.js 18+ and npm

Setup

1. Install root dev helpers and workspace scripts:

```powershell
npm install
```

2. Install frontend and backend dependencies:

```powershell
cd frontend; npm install; cd ..
cd backend; npm install; cd ..
```

Run (development)

```powershell
npm run dev
```

This starts frontend and backend concurrently. Frontend expects backend at http://localhost:5000 by default.

Build & serve (production-like)

```powershell
npm run build
npm run start
```

Notes & fixes applied in this audit
- Backend: `email` column now has a UNIQUE constraint to prevent duplicates.
- Added helpful root scripts: `dev`, `start`, and workspace helpers.
- Added `.gitignore` to exclude node_modules and DB files.

Recommended next steps
- Add tests (Jest/React Testing Library for frontend, supertest/mocha for backend).
- Add Dockerfile and docker-compose for easy local deployment.
- Add linting and pre-commit hooks (eslint, prettier, husky).
