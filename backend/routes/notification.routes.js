// Notification routes — get, mark all read, mark one read, delete

import express from "express"
import {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notification.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require auth
router.get("/", protect, getNotifications)
router.put("/read-all", protect, markAllRead)
router.delete("/clear-all", protect, clearAllNotifications)
router.put("/:id/read", protect, markOneRead)
router.delete("/:id", protect, deleteNotification)

export default router
