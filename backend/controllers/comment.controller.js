// comment.controller.js
// Full CRUD for comments + nested replies

import mongoose from "mongoose"
import Comment from "../models/Comment.model.js"
import Post from "../models/Post.model.js"
import Notification from "../models/Notification.model.js"

// ─── Helper: validate ObjectId ────────────────────────────────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// ─── getComments ──────────────────────────────────────────────────────────────
// Returns all top-level comments for a post, each with their nested replies
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params

    if (!isValidId(postId)) {
      return res.status(400).json({ message: "Invalid post ID" })
    }

    // 1. Fetch all comments (top-level + replies) for the post in one query
    const all = await Comment.find({ post: postId })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 })
      .lean()

    // 2. Separate top-level comments from replies
    const topLevel = []
    const repliesMap = {}

    all.forEach((c) => {
      if (c.parentId) {
        const pid = c.parentId.toString()
        if (!repliesMap[pid]) repliesMap[pid] = []
        repliesMap[pid].push(c)
      } else {
        topLevel.push(c)
      }
    })

    // 3. Attach replies to their parent comments
    const withReplies = topLevel.map((c) => ({
      ...c,
      _id: c._id.toString(),
      replies: (repliesMap[c._id.toString()] || []).map((r) => ({
        ...r,
        _id: r._id.toString(),
      })),
    }))

    res.status(200).json({ comments: withReplies, total: all.length })
  } catch (err) {
    next(err)
  }
}

// ─── addComment ───────────────────────────────────────────────────────────────
// Adds a top-level comment on a post
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body
    const { postId } = req.params

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" })
    }

    if (!isValidId(postId)) {
      return res.status(400).json({ message: "Invalid post ID" })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: postId,
      parentId: null,
    })

    await comment.populate("author", "name username avatar")

    // Notify post author (unless commenting on own post)
    if (post.author.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "comment",
          post: postId,
        })
      } catch {
        // Notification failure should not crash comment creation
      }
    }

    const obj = comment.toObject()
    obj._id = obj._id.toString()
    obj.replies = []

    res.status(201).json(obj)
  } catch (err) {
    next(err)
  }
}

// ─── addReply ─────────────────────────────────────────────────────────────────
// Adds a reply to an existing comment
export const addReply = async (req, res, next) => {
  try {
    const { content } = req.body
    const { commentId } = req.params

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Reply cannot be empty" })
    }

    if (!isValidId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" })
    }

    // Don't populate — just get the raw document
    const parent = await Comment.findById(commentId)
    if (!parent) {
      return res.status(404).json({ message: "Comment not found" })
    }

    // If the parent itself is a reply, attach to the grandparent (flat nesting)
    const actualParentId = parent.parentId || commentId

    const reply = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: parent.post,        // use raw ObjectId, no populate needed
      parentId: actualParentId,
    })

    await reply.populate("author", "name username avatar")

    // Notify original commenter (unless replying to own comment)
    if (parent.author.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: parent.author,
          sender: req.user._id,
          type: "comment",
          post: parent.post,
        })
      } catch {
        // Notification failure should not crash reply creation
      }
    }

    const obj = reply.toObject()
    obj._id = obj._id.toString()
    res.status(201).json(obj)
  } catch (err) {
    next(err)
  }
}

// ─── editComment ──────────────────────────────────────────────────────────────
// Allows the author to edit their own comment or reply
export const editComment = async (req, res, next) => {
  try {
    const { content } = req.body
    const { commentId } = req.params

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" })
    }

    if (!isValidId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" })
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Use findByIdAndUpdate to avoid full-document revalidation on old docs
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { content: content.trim(), isEdited: true },
      { new: true, runValidators: false }
    ).populate("author", "name username avatar")

    const obj = updated.toObject()
    obj._id = obj._id.toString()
    res.status(200).json(obj)
  } catch (err) {
    next(err)
  }
}

// ─── deleteComment ────────────────────────────────────────────────────────────
// Deletes a comment (and all its replies if it's a top-level comment)
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params

    if (!isValidId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" })
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // If top-level comment, also delete all replies
    if (!comment.parentId) {
      await Comment.deleteMany({ parentId: comment._id })
    }

    await comment.deleteOne()

    res.status(200).json({ message: "Comment deleted", id: commentId })
  } catch (err) {
    next(err)
  }
}
