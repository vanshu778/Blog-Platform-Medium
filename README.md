# Blog Platform (Medium Clone)

A full-stack blog platform built with **React + Vite** (frontend) and **Express + MongoDB** (backend).

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 18, Vite 5, Tailwind CSS, Axios  |
| Backend  | Express 5, Mongoose, JWT, Helmet       |
| Database | MongoDB Atlas                           |

## Project Structure

```
├── backend/        # Express API server
│   ├── config/     # DB connection & env validation
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/       # React SPA
│   ├── src/
│   └── vite.config.js
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started (Local Development)

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install

```bash
git clone https://github.com/vanshu778/Blog-Platform-Medium.git
cd Blog-Platform-Medium

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET

# Frontend (optional — dev proxy works out of the box)
cp frontend/.env.example frontend/.env
```

**Required backend variables:**

| Variable             | Description                              |
| -------------------- | ---------------------------------------- |
| `MONGO_URI`          | MongoDB connection string                |
| `JWT_SECRET`         | Secret for access tokens                 |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens                |

Generate secrets with: `openssl rand -base64 64`

### 3. Run in development

```bash
# Terminal 1 — backend (port 8000)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deployment

### Option A: Docker (Recommended)

The Dockerfile uses a multi-stage build that compiles the frontend and serves it from the backend.

```bash
# Build & run
docker compose up --build

# Or without compose:
docker build -t blog-platform .
docker run -p 8000:8000 --env-file backend/.env blog-platform
```

### Option B: Railway / Render / Heroku

These platforms auto-detect Node.js. Set the **Root Directory** to `backend` and configure:

| Setting         | Value                          |
| --------------- | ------------------------------ |
| Build Command   | `npm run build`                |
| Start Command   | `npm start`                    |
| Root Directory  | `backend`                      |

Then set the required environment variables in the platform dashboard.

> The backend `build` script automatically runs `cd ../frontend && npm ci && npm run build`, so both sides are built in one step.

### Option C: Manual VPS

```bash
# On your server
git clone <repo> && cd Blog-Platform-Medium/backend
npm ci
npm run build        # builds the frontend
npm start            # starts production server on port 8000
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<generate-with-openssl>
JWT_REFRESH_SECRET=<generate-with-openssl>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-id (optional)
```

> **Important:** Set `CLIENT_URL` to your deployed domain for CORS to work correctly. Multiple origins can be comma-separated.

## API Endpoints

| Method | Endpoint                 | Auth     | Description             |
| ------ | ----------------------- | -------- | ----------------------- |
| GET    | `/api/health`           | —        | Health check + DB status|
| POST   | `/api/auth/register`    | —        | Register new user       |
| POST   | `/api/auth/login`       | —        | Login                   |
| POST   | `/api/auth/google`      | —        | Google OAuth            |
| POST   | `/api/auth/logout`      | —        | Logout                  |
| POST   | `/api/auth/refresh`     | Cookie   | Refresh access token    |
| GET    | `/api/auth/me`          | Bearer   | Current user            |
| GET    | `/api/posts`            | Optional | List / search posts     |
| POST   | `/api/posts`            | Bearer   | Create post             |
| GET    | `/api/posts/:slug`      | Optional | Get single post         |
| PUT    | `/api/posts/:id`        | Bearer   | Update post             |
| DELETE | `/api/posts/:id`        | Bearer   | Delete post             |

## License

ISC
