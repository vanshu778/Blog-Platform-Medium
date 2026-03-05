// server.js
// Main entry point — sets up Express, connects to MongoDB, and mounts all API routes

import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"

import authRoutes from "./routes/auth.routes.js"
import postRoutes from "./routes/post.routes.js"
import userRoutes from "./routes/user.routes.js"
import commentRoutes from "./routes/comment.routes.js"

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())

// Health check
app.get("/", (req, res) => res.json({ message: "Inkwell API running 🚀" }))

// Mount API routes
app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/users", userRoutes)
app.use("/api", commentRoutes)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
})