// comment.controller.js
// Full CRUD for comments + nested replies

import Comment from "../models/Comment.model.js"
import Post from "../models/Post.model.js"
import Notification from "../models/Notification.model.js"

// ─── getComments ──────────────────────────────────────────────────────────────
// Returns all top-level comments for a post, each with their nested replies
export const getComments = async (req, res, next) => {
  try {
    // 1. Fetch all comments (top-level + replies) for the post in one query
    const all = await Comment.find({ post: req.params.postId })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 })

    // 2. Separate top-level comments from replies
    const topLevel = all.filter((c) => c.parentId === null || c.parentId === undefined)
    const repliesMap = {}

    all.forEach((c) => {
      if (c.parentId) {
        const pid = c.parentId.toString()
        if (!repliesMap[pid]) repliesMap[pid] = []
        repliesMap[pid].push(c)
      }
    })

    // 3. Attach replies to their parent comments (plain objects)
    const withReplies = topLevel.map((c) => {
      const obj = c.toObject()
      obj.replies = repliesMap[c._id.toString()] || []
      return obj
    })

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

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" })
    }

    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: req.params.postId,
      parentId: null,
    })

    await comment.populate("author", "name username avatar")

    // Notify post author (unless commenting on own post)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: req.params.postId,
      })
    }

    const obj = comment.toObject()
    obj.replies = []

    res.status(201).json(obj)
  } catch (err) {
    next(err)
  }
}

// ─── addReply ─────────────────────────────────────────────────────────────────
// Adds a reply to an existing comment (one level deep — replies to replies go
// under the same top-level parent for simplicity)
export const addReply = async (req, res, next) => {
  try {
    const { content } = req.body
    const { commentId } = req.params

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Reply cannot be empty" })
    }

    const parent = await Comment.findById(commentId).populate("post")
    if (!parent) {
      return res.status(404).json({ message: "Comment not found" })
    }

    // If the parent itself is a reply, attach to the grandparent (flat nesting)
    const actualParentId = parent.parentId
      ? parent.parentId.toString()
      : commentId

    const reply = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: parent.post._id,
      parentId: actualParentId,
    })

    await reply.populate("author", "name username avatar")

    // Notify original commenter (unless replying to own comment)
    if (parent.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: parent.author,
        sender: req.user._id,
        type: "comment",
        post: parent.post._id,
      })
    }

    res.status(201).json(reply.toObject())
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

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    comment.content = content.trim()
    comment.isEdited = true
    await comment.save()

    await comment.populate("author", "name username avatar")

    res.status(200).json(comment.toObject())
  } catch (err) {
    next(err)
  }
}

// ─── deleteComment ────────────────────────────────────────────────────────────
// Deletes a comment (and all its replies if it's a top-level comment)
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

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

    res.status(200).json({ message: "Comment deleted", id: req.params.commentId })
  } catch (err) {
    next(err)
  }
}
