// controllers/comment.controller.js
// Handles CRUD for comments on posts

import Comment from "../models/Comment.model.js"
import Post from "../models/Post.model.js"

// ─── getComments ──────────────────────────────────────────────────────────────
// @route  GET /api/posts/:postId/comments
// @access Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 })

    // Fetch replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("author", "name username avatar")
          .sort({ createdAt: 1 })
        return { ...comment.toObject(), replies }
      })
    )

    res.status(200).json(commentsWithReplies)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── createComment ────────────────────────────────────────────────────────────
// @route  POST /api/posts/:postId/comments
// @access Private (protect)
export const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body

    // Verify post exists
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // If replying, verify parent comment exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment)
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" })
      }
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: req.params.postId,
      parentComment: parentComment || null,
    })

    await comment.populate("author", "name username avatar")

    res.status(201).json({ ...comment.toObject(), replies: [] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── deleteComment ────────────────────────────────────────────────────────────
// @route  DELETE /api/comments/:id
// @access Private (protect, author only)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Delete all replies too
    await Comment.deleteMany({ parentComment: comment._id })
    await comment.deleteOne()

    res.status(200).json({ message: "Comment deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
