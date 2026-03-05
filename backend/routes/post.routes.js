// routes/post.routes.js
// Post routes — feed, single post, CRUD, and clap toggle

import express from "express"
import {
  getFeed,
  getPost,
  createPost,
  updatePost,
  deletePost,
  clapPost,
  searchPosts,
} from "../controllers/post.controller.js"
import { protect, optionalAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/search", searchPosts)
router.get("/", optionalAuth, getFeed)
router.get("/:slug", getPost)
router.post("/", protect, createPost)
router.put("/:id", protect, updatePost)
router.delete("/:id", protect, deletePost)
router.post("/:id/clap", protect, clapPost)

export default router
