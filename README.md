
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

Deploying the frontend to Netlify

1. Build configuration

- In the Netlify UI create a new site from the project repository.
- Set the build command to `cd frontend && npm run build` and the publish directory to `frontend/build`.

2. Environment variable

- In Netlify set an environment variable `REACT_APP_API_BASE_URL` to your backend URL (for example `https://your-backend.example.com`). This will be baked into the frontend at build time.

3. Backend deployment

- Deploy your Express backend separately (Heroku, Render, Fly, AWS, etc.) and ensure it is publicly accessible over HTTPS.

4. Note on proxy

- The `proxy` field in `frontend/package.json` is used only for local development with `react-scripts` and is ignored by Netlify builds. Use `REACT_APP_API_BASE_URL` in production instead.

Quick local test before deploying

```powershell
# From repo root
cd frontend
REACT_APP_API_BASE_URL=http://localhost:5000 npm run build
```

This produces a `build/` folder you can inspect locally or deploy to Netlify. Make sure your backend is running at the URL you set in `REACT_APP_API_BASE_URL`.
