// comment.routes.js — full CRUD + replies

import express from "express"
import {
  getComments,
  addComment,
  addReply,
  editComment,
  deleteComment,
} from "../controllers/comment.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// ── Top-level comments ────────────────────────────────────────
// GET  /api/comments/:postId          — fetch all comments (with nested replies)
// POST /api/comments/:postId          — add a comment on a post
router.get("/:postId", getComments)
router.post("/:postId", protect, addComment)

// ── Individual comment actions ────────────────────────────────
// POST   /api/comments/:commentId/reply   — reply to a comment
// PUT    /api/comments/:commentId         — edit your own comment
// DELETE /api/comments/:commentId         — delete your own comment
router.post("/:commentId/reply", protect, addReply)
router.put("/:commentId", protect, editComment)
router.delete("/:commentId", protect, deleteComment)

export default router
