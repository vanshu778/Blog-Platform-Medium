// Comment routes — get, add, and delete comments

import express from "express"
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/comment.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/:postId", getComments)
router.post("/:postId", protect, addComment)
router.delete("/:commentId", protect, deleteComment)

export default router
