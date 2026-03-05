// routes/comment.routes.js
// Comment routes — get, create, and delete comments

import express from "express"
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/comment.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Nested under /api/posts/:postId/comments
router.get("/posts/:postId/comments", getComments)
router.post("/posts/:postId/comments", protect, createComment)
router.delete("/comments/:id", protect, deleteComment)

export default router
