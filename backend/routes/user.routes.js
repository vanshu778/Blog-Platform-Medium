// User routes — search, suggestions, profile, follow, bookmarks, and update

import express from "express"
import {
  getProfile,
  toggleFollow,
  updateProfile,
  toggleBookmark,
  getBookmarks,
  getSuggestedUsers,
  searchUsers,
} from "../controllers/user.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/search", searchUsers)
router.get("/suggested", protect, getSuggestedUsers)
router.get("/bookmarks", protect, getBookmarks)
router.post("/bookmarks/:postId", protect, toggleBookmark)
router.get("/:username", getProfile)
router.post("/:id/follow", protect, toggleFollow)
router.put("/profile/update", protect, updateProfile)

export default router
