// Handles CRUD for blog posts, feed, reactions, search, and user posts

import Post from "../models/Post.model.js"
import User from "../models/User.model.js"
import Comment from "../models/Comment.model.js"
import Notification from "../models/Notification.model.js"

// ─── getFeed ──────────────────────────────────────────────────────────────────
export const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag } = req.query

    const filter = { published: true }

    if (tag) {
      filter.tags = tag.toLowerCase()
    }

    // Home feed always shows all published posts

    const skip = (Number(page) - 1) * Number(limit)

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ])

    res.status(200).json({
      posts,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    })
  } catch (err) {
    next(err)
  }
}

// ─── getPost ──────────────────────────────────────────────────────────────────
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      "author",
      "name username avatar bio followers following"
    )

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    res.status(200).json(post)
  } catch (err) {
    next(err)
  }
}

// ─── createPost ───────────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { title, content, tags, coverImage } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" })
    }

    const post = await Post.create({
      title,
      content,
      tags,
      coverImage,
      author: req.user._id,
    })

    await post.populate("author", "name username avatar")

    res.status(201).json(post)
  } catch (err) {
    next(err)
  }
}

// ─── updatePost ───────────────────────────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const { title, content, tags, coverImage } = req.body

    if (title !== undefined) post.title = title
    if (content !== undefined) post.content = content
    if (tags !== undefined) post.tags = tags
    if (coverImage !== undefined) post.coverImage = coverImage

    const updated = await post.save()
    await updated.populate("author", "name username avatar")

    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}

// ─── deletePost ───────────────────────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await post.deleteOne()
    await Comment.deleteMany({ post: req.params.id })

    res.status(200).json({ message: "Post deleted successfully" })
  } catch (err) {
    next(err)
  }
}

// ─── reactPost ────────────────────────────────────────────────────────────────
const VALID_REACTIONS = ["like", "love", "clap", "insightful", "funny", "celebrate"]

export const reactPost = async (req, res, next) => {
  try {
    const { type } = req.body

    if (!type || !VALID_REACTIONS.includes(type)) {
      return res.status(400).json({ message: `Invalid reaction. Must be one of: ${VALID_REACTIONS.join(", ")}` })
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Initialize reactions map if missing (for older posts)
    if (!post.reactions) {
      post.reactions = {}
    }
    for (const r of VALID_REACTIONS) {
      if (!post.reactions[r]) post.reactions[r] = []
    }

    const userId = req.user._id.toString()
    const alreadyReacted = post.reactions[type]
      .map((id) => id.toString())
      .includes(userId)

    if (alreadyReacted) {
      // Remove the reaction
      post.reactions[type] = post.reactions[type].filter(
        (id) => id.toString() !== userId
      )
    } else {
      // Add the reaction
      post.reactions[type].push(req.user._id)

      // Send notification if reacting to someone else's post
      if (post.author.toString() !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "reaction",
          post: post._id,
        })
      }
    }

    await post.save()

    // Build response: count per reaction + which ones current user toggled
    const reactionSummary = {}
    let totalReactions = 0
    for (const r of VALID_REACTIONS) {
      const count = post.reactions[r]?.length || 0
      reactionSummary[r] = {
        count,
        reacted: post.reactions[r]?.map((id) => id.toString()).includes(userId),
      }
      totalReactions += count
    }

    res.status(200).json({
      reactions: reactionSummary,
      totalReactions,
    })
  } catch (err) {
    next(err)
  }
}

// ─── getUserPosts ─────────────────────────────────────────────────────────────
export const getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const posts = await Post.find({ author: user._id, published: true })
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 })

    res.status(200).json({ posts })
  } catch (err) {
    next(err)
  }
}

// ─── searchPosts ──────────────────────────────────────────────────────────────
export const searchPosts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query is required" })
    }

    const regex = new RegExp(q.trim(), "i")

    const filter = {
      published: true,
      $or: [{ title: regex }, { excerpt: regex }, { tags: regex }],
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ])

    const users = await User.find({
      $or: [{ name: regex }, { username: regex }],
    })
      .select("name username avatar bio")
      .limit(5)

    res.status(200).json({
      posts,
      users,
      total,
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    next(err)
  }
}
