// controllers/post.controller.js
// Handles CRUD operations for blog posts, feed, clap toggle, and search

import Post from "../models/Post.model.js"
import User from "../models/User.model.js"

// ─── searchPosts ──────────────────────────────────────────────────────────────
// @route  GET /api/posts/search?q=keyword
// @access Public
export const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query is required" })
    }

    const regex = new RegExp(q.trim(), "i")

    const filter = {
      published: true,
      $or: [
        { title: regex },
        { excerpt: regex },
        { tags: regex },
      ],
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

    // Also search users
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
    res.status(500).json({ message: err.message })
  }
}

// ─── getFeed ──────────────────────────────────────────────────────────────────
// @route  GET /api/posts
// @access Public (optionalAuth — personalized feed if logged in)
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query

    // Base filter: only published posts
    const filter = { published: true }

    // Filter by tag if provided
    if (tag) {
      filter.tags = tag.toLowerCase()
    }

    // If user is logged in and follows people, show their posts + own posts
    if (req.user && req.user.following.length > 0) {
      filter.author = { $in: [...req.user.following, req.user._id] }
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

    res.status(200).json({
      posts,
      total,
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── getPost ──────────────────────────────────────────────────────────────────
// @route  GET /api/posts/:slug
// @access Public
export const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      "author",
      "name username avatar bio followers"
    )

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    res.status(200).json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── createPost ───────────────────────────────────────────────────────────────
// @route  POST /api/posts
// @access Private (protect)
export const createPost = async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body

    const post = await Post.create({
      title,
      content,
      tags,
      coverImage,
      author: req.user._id,
    })

    // Populate author before returning
    await post.populate("author", "name username avatar")

    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── updatePost ───────────────────────────────────────────────────────────────
// @route  PUT /api/posts/:id
// @access Private (protect, author only)
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Only the original author can update
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const { title, content, tags, coverImage } = req.body

    // Update only provided fields
    if (title !== undefined) post.title = title
    if (content !== undefined) post.content = content
    if (tags !== undefined) post.tags = tags
    if (coverImage !== undefined) post.coverImage = coverImage

    // .save() triggers pre-save hooks (slug, readTime, excerpt)
    const updated = await post.save()
    await updated.populate("author", "name username avatar")

    res.status(200).json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── deletePost ───────────────────────────────────────────────────────────────
// @route  DELETE /api/posts/:id
// @access Private (protect, author only)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Only the original author can delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await post.deleteOne()

    res.status(200).json({ message: "Post deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── clapPost ─────────────────────────────────────────────────────────────────
// @route  POST /api/posts/:id/clap
// @access Private (protect)
export const clapPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const userId = req.user._id.toString()

    // Check if user already clapped (compare as strings)
    const alreadyClapped = post.claps.some(
      (id) => id.toString() === userId
    )

    if (alreadyClapped) {
      // Unclap — remove user from claps array
      post.claps = post.claps.filter((id) => id.toString() !== userId)
    } else {
      // Clap — add user to claps array
      post.claps.push(req.user._id)
    }

    await post.save()

    res.status(200).json({
      claps: post.claps.length,
      clapped: !alreadyClapped,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
