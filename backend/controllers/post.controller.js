// Handles CRUD for blog posts, feed, reactions, search, user posts, trending, analytics, drafts, and recommendations

import Post from "../models/Post.model.js"
import User from "../models/User.model.js"
import Comment from "../models/Comment.model.js"
import Notification from "../models/Notification.model.js"

// ─── getFeed ──────────────────────────────────────────────────────────────────
export const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag } = req.query

    const filter = { status: "published" }

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

    // Increment view count
    post.views = (post.views || 0) + 1
    await post.save({ validateModifiedOnly: true })

    res.status(200).json(post)
  } catch (err) {
    next(err)
  }
}

// ─── createPost ───────────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { title, content, tags, coverImage, subtitle, scheduledAt, status } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" })
    }

    const postData = {
      title,
      content,
      tags,
      coverImage,
      author: req.user._id,
    }

    if (subtitle !== undefined) postData.subtitle = subtitle

    // Handle scheduling
    if (scheduledAt) {
      const schedDate = new Date(scheduledAt)
      if (schedDate <= new Date()) {
        return res.status(400).json({ message: "Scheduled date must be in the future" })
      }
      postData.scheduledAt = schedDate
      postData.status = "scheduled"
    } else if (status === "draft") {
      postData.status = "draft"
    }

    const post = await Post.create(postData)
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

    const { title, content, tags, coverImage, subtitle, status, scheduledAt } = req.body

    if (title !== undefined) post.title = title
    if (content !== undefined) post.content = content
    if (tags !== undefined) post.tags = tags
    if (coverImage !== undefined) post.coverImage = coverImage
    if (subtitle !== undefined) post.subtitle = subtitle
    if (status !== undefined) post.status = status
    if (scheduledAt !== undefined) {
      post.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
    }

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

    const posts = await Post.find({ author: user._id, status: "published" })
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
      status: "published",
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

// ─── getTrending ────────────────────────────────────────────────────────────────
// Returns trending posts sorted by a score combining views, reactions, and comments
export const getTrending = async (req, res, next) => {
  try {
    const { period = "week", limit = 10 } = req.query

    const dateFilter = new Date()
    if (period === "day") dateFilter.setDate(dateFilter.getDate() - 1)
    else if (period === "month") dateFilter.setMonth(dateFilter.getMonth() - 1)
    else dateFilter.setDate(dateFilter.getDate() - 7) // default: week

    const posts = await Post.find({
      status: "published",
      createdAt: { $gte: dateFilter },
    })
      .populate("author", "name username avatar")
      .lean()

    // Get comment counts for each post
    const postIds = posts.map((p) => p._id)
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ])
    const commentMap = {}
    commentCounts.forEach((c) => { commentMap[c._id.toString()] = c.count })

    // Calculate trending score: views + (reactions * 2) + (comments * 3)
    const scored = posts.map((p) => {
      const totalReactions = ["like", "love", "clap", "insightful", "funny", "celebrate"]
        .reduce((sum, r) => sum + (p.reactions?.[r]?.length || 0), 0)
      const comments = commentMap[p._id.toString()] || 0
      const score = (p.views || 0) + totalReactions * 2 + comments * 3
      return { ...p, trendingScore: score, commentCount: comments }
    })

    scored.sort((a, b) => b.trendingScore - a.trendingScore)

    res.status(200).json({ posts: scored.slice(0, Number(limit)) })
  } catch (err) {
    next(err)
  }
}

// ─── getAnalytics ─────────────────────────────────────────────────────────────
// Personal analytics — only the logged-in user's posts
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Get ALL posts by this user (published + drafts + scheduled) for total count
    const allPosts = await Post.find({ author: userId })
      .select("title slug views reactions readTime createdAt tags status scheduledAt")
      .sort({ views: -1 })
      .lean()

    const publishedPosts = allPosts.filter((p) => p.status === "published")
    const totalPosts = allPosts.length
    const totalViews = allPosts.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalReactions = allPosts.reduce((sum, p) => {
      if (!p.reactions) return sum
      return sum + ["like", "love", "clap", "insightful", "funny", "celebrate"]
        .reduce((s, r) => {
          const arr = p.reactions[r]
          return s + (Array.isArray(arr) ? arr.length : 0)
        }, 0)
    }, 0)

    // Comment count across user's posts
    const postIds = allPosts.map((p) => p._id)
    const totalComments = postIds.length > 0
      ? await Comment.countDocuments({ post: { $in: postIds } })
      : 0

    const mostReadPosts = publishedPosts.slice(0, 5)

    res.status(200).json({
      totalPosts,
      totalViews,
      totalReactions,
      totalComments,
      mostReadPosts,
    })
  } catch (err) {
    next(err)
  }
}

// ─── getScheduledPosts ────────────────────────────────────────────────────────
export const getScheduledPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      author: req.user._id,
      status: "scheduled",
    })
      .select("title slug excerpt subtitle scheduledAt createdAt updatedAt")
      .sort({ scheduledAt: 1 })

    res.status(200).json({ posts })
  } catch (err) {
    next(err)
  }
}

// ─── getRecommended ───────────────────────────────────────────────────────────
// Returns recommended posts based on user's liked tags and reading history
export const getRecommended = async (req, res, next) => {
  try {
    const userId = req.user._id.toString()

    // 1. Find posts user has reacted to
    const reactedPosts = await Post.find({
      $or: [
        { "reactions.like": req.user._id },
        { "reactions.love": req.user._id },
        { "reactions.clap": req.user._id },
        { "reactions.insightful": req.user._id },
      ],
    }).select("tags")

    // 2. Collect most-used tags from user's reacted posts
    const tagCounts = {}
    reactedPosts.forEach((p) => {
      p.tags?.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1 })
    })
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)

    // 3. Find posts matching those tags, excluding already-reacted ones
    const reactedIds = reactedPosts.map((p) => p._id)
    const filter = {
      status: "published",
      _id: { $nin: reactedIds },
      author: { $ne: req.user._id },
    }
    if (topTags.length > 0) {
      filter.tags = { $in: topTags }
    }

    const recommended = await Post.find(filter)
      .populate("author", "name username avatar")
      .sort({ views: -1, createdAt: -1 })
      .limit(10)

    // If not enough based on tags, fill with popular posts
    if (recommended.length < 5) {
      const existingIds = [...reactedIds, ...recommended.map((p) => p._id)]
      const filler = await Post.find({
        status: "published",
        _id: { $nin: existingIds },
        author: { $ne: req.user._id },
      })
        .populate("author", "name username avatar")
        .sort({ views: -1 })
        .limit(10 - recommended.length)
      recommended.push(...filler)
    }

    res.status(200).json({ posts: recommended })
  } catch (err) {
    next(err)
  }
}

// ─── saveDraft (auto-save) ────────────────────────────────────────────────────
export const saveDraft = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, content, tags, coverImage } = req.body

    if (id && id !== "new") {
      // Update existing draft
      const post = await Post.findById(id)
      if (!post) return res.status(404).json({ message: "Draft not found" })
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" })
      }

      if (title !== undefined) post.title = title || "Untitled"
      if (content !== undefined) post.content = content && content.trim() && content !== '<p><br></p>' ? content : "<p></p>"
      if (tags !== undefined) post.tags = tags
      if (coverImage !== undefined) post.coverImage = coverImage

      const updated = await post.save({ validateModifiedOnly: true })
      return res.status(200).json({ _id: updated._id, slug: updated.slug })
    }

    // Create new draft — bypass required validators since drafts can be incomplete
    const draft = new Post({
      title: title?.trim() || "Untitled",
      content: content && content.trim() && content !== '<p><br></p>' ? content : "<p></p>",
      tags: tags || [],
      coverImage: coverImage || "",
      author: req.user._id,
      status: "draft",
    })
    await draft.save({ validateBeforeSave: false })

    res.status(201).json({ _id: draft._id, slug: draft.slug })
  } catch (err) {
    next(err)
  }
}

// ─── getUserDrafts ────────────────────────────────────────────────────────────
export const getUserDrafts = async (req, res, next) => {
  try {
    const drafts = await Post.find({
      author: req.user._id,
      status: "draft",
    })
      .select("title slug excerpt subtitle createdAt updatedAt")
      .sort({ updatedAt: -1 })

    res.status(200).json({ drafts })
  } catch (err) {
    next(err)
  }
}

// ─── getMyStories ─────────────────────────────────────────────────────────────
// Unified stories endpoint: GET /posts/stories/me?status=draft&page=1&limit=10
export const getMyStories = async (req, res, next) => {
  try {
    const { status = "draft", page = 1, limit = 10 } = req.query

    const validStatuses = ["draft", "published", "scheduled", "archived"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` })
    }

    const skip = (Number(page) - 1) * Number(limit)

    const filter = { author: req.user._id, status }

    const [stories, total] = await Promise.all([
      Post.find(filter)
        .select("title subtitle slug excerpt coverImage tags readTime views status scheduledAt reactions createdAt updatedAt")
        .sort(status === "scheduled" ? { scheduledAt: 1 } : { updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments(filter),
    ])

    // Attach reaction + comment counts for published stories
    if (status === "published" && stories.length > 0) {
      const postIds = stories.map((s) => s._id)
      const commentCounts = await Comment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ])
      const commentMap = {}
      commentCounts.forEach((c) => { commentMap[c._id.toString()] = c.count })

      for (const s of stories) {
        const totalReactions = ["like", "love", "clap", "insightful", "funny", "celebrate"]
          .reduce((sum, r) => sum + (s.reactions?.[r]?.length || 0), 0)
        s.reactionCount = totalReactions
        s.commentCount = commentMap[s._id.toString()] || 0
      }
    }

    res.status(200).json({
      stories,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    })
  } catch (err) {
    next(err)
  }
}
