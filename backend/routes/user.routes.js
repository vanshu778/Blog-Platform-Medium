// routes/user.routes.js
// User routes — public profile, follow toggle, profile update

import express from "express"
import {
  getProfile,
  toggleFollow,
  updateProfile,
  toggleBookmark,
  getBookmarks,
} from "../controllers/user.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/bookmarks", protect, getBookmarks)
router.post("/bookmarks/:postId", protect, toggleBookmark)
router.get("/:username", getProfile)
router.post("/:id/follow", protect, toggleFollow)
router.put("/profile/update", protect, updateProfile)

export default router
