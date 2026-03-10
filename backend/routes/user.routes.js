// User routes — search, suggestions, profile, follow, bookmarks, collections, and update

import express from "express"
import {
  getProfile,
  toggleFollow,
  updateProfile,
  toggleBookmark,
  getBookmarks,
  getSuggestedUsers,
  searchUsers,
  getCollections,
  createCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
} from "../controllers/user.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// ── Static routes first (must be before /:username to avoid param conflict) ──
router.get("/search", searchUsers)
router.get("/suggested", protect, getSuggestedUsers)
router.get("/bookmarks", protect, getBookmarks)
router.post("/bookmarks/:postId", protect, toggleBookmark)
router.put("/profile/update", protect, updateProfile)

// ── Collection routes ─────────────────────────────────────────────────────────
router.get("/collections", protect, getCollections)
router.post("/collections", protect, createCollection)
router.delete("/collections/:collectionId", protect, deleteCollection)
router.post("/collections/:collectionId/posts", protect, addToCollection)
router.delete("/collections/:collectionId/posts/:postId", protect, removeFromCollection)

// ── Dynamic routes last ───────────────────────────────────────────────────────
router.get("/:username", getProfile)
router.post("/:id/follow", protect, toggleFollow)

export default router
