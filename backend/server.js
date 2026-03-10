// server.js
// Main entry point — sets up Express, connects to MongoDB, and mounts all API routes

import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root
dotenv.config()

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import compression from "compression"
import schedule from "node-schedule"
import connectDB from "./config/db.js"
import errorMiddleware from "./middleware/error.middleware.js"

import authRoutes from "./routes/auth.routes.js"
import postRoutes from "./routes/post.routes.js"
import userRoutes from "./routes/user.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import Post from "./models/Post.model.js"

const NODE_ENV = process.env.NODE_ENV || "development"
const isProduction = NODE_ENV === "production"
const PORT = process.env.PORT || 8000

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
app.get("/api/health", (req, res) => res.json({ status: "ok" }))

// Mount API routes
app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/users", userRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)

// Serve frontend in production
if (isProduction) {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist")
  app.use(express.static(frontendDist))
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"))
  })
}

// Global error handler — must be LAST middleware
app.use(errorMiddleware)

// Database connection and server startup
connectDB()
  .then(() => {
    // ── Scheduled post publisher — runs every minute ──────────────
    schedule.scheduleJob("* * * * *", async () => {
      try {
        const now = new Date()
        const result = await Post.updateMany(
          { published: false, scheduledAt: { $lte: now, $ne: null } },
          { $set: { published: true } }
        )
        if (result.modifiedCount > 0) {
          console.log(`📅 Published ${result.modifiedCount} scheduled post(s)`)
        }
      } catch (err) {
        console.error("Scheduled publish error:", err.message)
      }
    })

    app.on("error", (error) => {
      console.error("❌ Server error:", error)
      throw error
    })

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (${NODE_ENV})`)
    })
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message)
    process.exit(1)
  })
