# Blog Platform (Medium Clone)

A full-stack blog platform built with **React + Vite** (frontend) and **Express + MongoDB** (backend).

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 18, Vite 5, Tailwind CSS, Axios  |
| Backend  | Express 5, Mongoose, JWT, Helmet       |
| Database | MongoDB Atlas                           |
| Hosting  | Vercel (frontend) + Render (backend)    |

## Project Structure

```
├── backend/          # Express API server (deploy to Render)
│   ├── config/       # DB connection & env validation
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/         # React SPA (deploy to Vercel)
│   ├── src/
│   ├── vercel.json
│   └── vite.config.js
├── render.yaml       # Render deployment blueprint
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

# Frontend (optional for local dev — the Vite proxy works out of the box)
cp frontend/.env.example frontend/.env
```

**Required backend variables:**

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `MONGO_URI`          | MongoDB connection string            |
| `JWT_SECRET`         | Secret for access tokens             |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens            |

Generate secrets with: `openssl rand -base64 64`

### 3. Run in development

```bash
# Terminal 1 — backend (port 8000)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment (Vercel + Render)

### Step 1 — Deploy backend to Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Configure:

   | Setting        | Value            |
   | -------------- | ---------------- |
   | Root Directory | `backend`        |
   | Build Command  | `npm install`    |
   | Start Command  | `npm start`      |

4. Add environment variables in the Render dashboard:

   | Variable             | Value                                      |
   | -------------------- | ------------------------------------------ |
   | `NODE_ENV`           | `production`                               |
   | `MONGO_URI`          | Your MongoDB Atlas connection string       |
   | `JWT_SECRET`         | Generate with `openssl rand -base64 64`    |
   | `JWT_REFRESH_SECRET` | Generate with `openssl rand -base64 64`    |
   | `JWT_EXPIRE`         | `15m`                                      |
   | `JWT_REFRESH_EXPIRE` | `7d`                                       |
   | `CLIENT_URL`         | Your Vercel URL (e.g. `https://your-app.vercel.app`) |
   | `GOOGLE_CLIENT_ID`   | *(optional)* Your Google OAuth client ID   |

5. Deploy — note the Render URL (e.g. `https://your-backend.onrender.com`)

> **Tip:** You can also use the **render.yaml** blueprint for automatic setup — click "New Blueprint Instance" in the Render dashboard.

### Step 2 — Deploy frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:

   | Setting          | Value                                        |
   | ---------------- | -------------------------------------------- |
   | Root Directory   | `frontend`                                   |
   | Build Command    | `npm run build`                              |
   | Output Directory | `dist`                                       |
   | Framework Preset | Vite                                         |

4. Add environment variables in the Vercel dashboard:

   | Variable              | Value                                          |
   | --------------------- | ---------------------------------------------- |
   | `VITE_API_URL`        | Your Render backend URL (e.g. `https://your-backend.onrender.com`) |
   | `VITE_GOOGLE_CLIENT_ID` | *(optional)* Your Google OAuth client ID     |

5. Deploy

### Step 3 — Update Render `CLIENT_URL`

After Vercel gives you the frontend URL, go back to the Render dashboard and set:

```
CLIENT_URL=https://your-app.vercel.app
```

This ensures CORS allows requests from your frontend.

---

## API Endpoints

| Method | Endpoint              | Auth     | Description              |
| ------ | --------------------- | -------- | ------------------------ |
| GET    | `/api/health`         | —        | Health check + DB status |
| POST   | `/api/auth/register`  | —        | Register new user        |
| POST   | `/api/auth/login`     | —        | Login                    |
| POST   | `/api/auth/google`    | —        | Google OAuth             |
| POST   | `/api/auth/logout`    | —        | Logout                   |
| POST   | `/api/auth/refresh`   | Cookie   | Refresh access token     |
| GET    | `/api/auth/me`        | Bearer   | Current user             |
| GET    | `/api/posts`          | Optional | List / search posts      |
| POST   | `/api/posts`          | Bearer   | Create post              |
| GET    | `/api/posts/:slug`    | Optional | Get single post          |
| PUT    | `/api/posts/:id`      | Bearer   | Update post              |
| DELETE | `/api/posts/:id`      | Bearer   | Delete post              |

## License

ISC
