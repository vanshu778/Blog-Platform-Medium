// Post routes — feed, single post, CRUD, reactions, search, and user posts

import express from "express"
import {
  getFeed,
  getPost,
  createPost,
  updatePost,
  deletePost,
  reactPost,
  getUserPosts,
  searchPosts,
} from "../controllers/post.controller.js"
import { protect, optionalAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", optionalAuth, getFeed)
router.get("/user/:username", getUserPosts)
router.get("/search", searchPosts)
router.get("/:slug", getPost)
router.post("/", protect, createPost)
router.put("/:id", protect, updatePost)
router.delete("/:id", protect, deletePost)
router.post("/:id/react", protect, reactPost)

export default router
