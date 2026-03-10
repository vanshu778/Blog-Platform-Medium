// Post routes — feed, single post, CRUD, reactions, search, trending, analytics, drafts, recommendations

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
  getTrending,
  getAnalytics,
  getRecommended,
  saveDraft,
  getUserDrafts,
  getScheduledPosts,
} from "../controllers/post.controller.js"
import { protect, optionalAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

// Static routes first
router.get("/trending", getTrending)
router.get("/analytics", protect, getAnalytics)
router.get("/recommended", protect, getRecommended)
router.get("/drafts", protect, getUserDrafts)
router.get("/scheduled", protect, getScheduledPosts)
router.get("/search", searchPosts)
router.get("/user/:username", getUserPosts)
router.get("/", optionalAuth, getFeed)

// Draft auto-save
router.put("/draft/:id", protect, saveDraft)

// Single post by slug
router.get("/:slug", getPost)

// CRUD
router.post("/", protect, createPost)
router.put("/:id", protect, updatePost)
router.delete("/:id", protect, deletePost)
router.post("/:id/react", protect, reactPost)

export default router
