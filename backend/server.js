// server.js
// Main entry point — sets up Express, connects to MongoDB, and mounts all API routes

import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import compression from "compression"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import connectDB from "./config/db.js"
import validateEnv from "./config/validateEnv.js"
import errorMiddleware from "./middleware/error.middleware.js"
import mongoose from "mongoose"

import authRoutes from "./routes/auth.routes.js"
import postRoutes from "./routes/post.routes.js"
import userRoutes from "./routes/user.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import notificationRoutes from "./routes/notification.routes.js"

dotenv.config()
validateEnv()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isProduction = process.env.NODE_ENV === "production"

const app = express()

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

// Gzip compression
app.use(compression())

// CORS — allow frontend origin with credentials
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(o => o.trim())
  : ["http://localhost:5173"]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Health check
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStatus = dbState === 1 ? "connected" : "disconnected"
  const statusCode = dbState === 1 ? 200 : 503
  res.status(statusCode).json({ status: dbState === 1 ? "ok" : "degraded", db: dbStatus })
})

// Mount API routes
app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/users", userRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)

// Serve frontend in production (only when dist exists, e.g. self-hosted)
if (isProduction) {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist")
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist))
    app.get("/{*splat}", (req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"))
    })
  }
}

// Global error handler — must be LAST middleware
app.use(errorMiddleware)

const PORT = process.env.PORT || 8000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (${isProduction ? "production" : "development"})`)
  })
})