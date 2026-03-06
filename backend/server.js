// server.js
// Main entry point — sets up Express, connects to MongoDB, and mounts all API routes

import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import errorMiddleware from "./middleware/error.middleware.js"

import authRoutes from "./routes/auth.routes.js"
import postRoutes from "./routes/post.routes.js"
import userRoutes from "./routes/user.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import notificationRoutes from "./routes/notification.routes.js"

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Health check
app.get("/", (req, res) => res.json({ message: "Medium Clone API 🚀" }))

// Mount API routes
app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/users", userRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)

// Global error handler — must be LAST middleware
app.use(errorMiddleware)

const PORT = process.env.PORT || 8000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
})