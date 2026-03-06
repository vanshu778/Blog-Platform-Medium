// Handles getting, adding, and deleting comments on posts

import Comment from "../models/Comment.model.js"
import Post from "../models/Post.model.js"
import Notification from "../models/Notification.model.js"

// ─── getComments ──────────────────────────────────────────────────────────────
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 })

    res.status(200).json({ comments, total: comments.length })
  } catch (err) {
    next(err)
  }
}

// ─── addComment ───────────────────────────────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" })
    }

    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: req.params.postId,
    })

    await comment.populate("author", "name username avatar")

    // Send notification if commenting on someone else's post
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: req.params.postId,
      })
    }

    res.status(201).json(comment)
  } catch (err) {
    next(err)
  }
}

// ─── deleteComment ────────────────────────────────────────────────────────────
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await comment.deleteOne()

    res.status(200).json({ message: "Comment deleted" })
  } catch (err) {
    next(err)
  }
}
