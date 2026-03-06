// Notification routes — get, mark all read, mark one read

import express from "express"
import {
  getNotifications,
  markAllRead,
  markOneRead,
} from "../controllers/notification.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protect, getNotifications)
router.put("/read-all", protect, markAllRead)
router.put("/:id/read", protect, markOneRead)

export default router
