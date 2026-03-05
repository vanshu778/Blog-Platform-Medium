// controllers/user.controller.js
// Handles user profiles, follow/unfollow toggle, and profile updates

import User from "../models/User.model.js"
import Post from "../models/Post.model.js"

// ─── getProfile ───────────────────────────────────────────────────────────────
// @route  GET /api/users/:username
// @access Public
export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "name username avatar")
      .populate("following", "name username avatar")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get all published posts by this user
    const posts = await Post.find({ author: user._id, published: true })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatar")

    res.status(200).json({ user, posts })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── toggleFollow ─────────────────────────────────────────────────────────────
// @route  POST /api/users/:id/follow
// @access Private (protect)
export const toggleFollow = async (req, res) => {
  try {
    // Prevent self-follow
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" })
    }

    const targetUser = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user._id)

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if already following (compare as strings)
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString()
    )

    if (isFollowing) {
      // Unfollow — remove references from both users
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUser._id.toString()
      )
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      )
    } else {
      // Follow — add references to both users
      currentUser.following.push(targetUser._id)
      targetUser.followers.push(currentUser._id)
    }

    // Save both users in parallel
    await Promise.all([currentUser.save(), targetUser.save()])

    res.status(200).json({
      following: !isFollowing,
      followerCount: targetUser.followers.length,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── toggleBookmark ───────────────────────────────────────────────────────────
// @route  POST /api/users/bookmarks/:postId
// @access Private (protect)
export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const postId = req.params.postId

    // Verify post exists
    const postExists = await Post.findById(postId)
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" })
    }

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === postId
    )

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== postId
      )
    } else {
      user.bookmarks.push(postId)
    }

    await user.save()

    res.status(200).json({
      bookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── getBookmarks ─────────────────────────────────────────────────────────────
// @route  GET /api/users/bookmarks
// @access Private (protect)
export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      populate: { path: "author", select: "name username avatar" },
      options: { sort: { createdAt: -1 } },
    })

    res.status(200).json(user.bookmarks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── updateProfile ────────────────────────────────────────────────────────────
// @route  PUT /api/users/profile/update
// @access Private (protect)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const { name, bio, avatar } = req.body

    // Update only provided fields
    if (name !== undefined) user.name = name
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar

    await user.save()

    // Return updated user without password
    const updatedUser = user.toObject()
    delete updatedUser.password

    res.status(200).json(updatedUser)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
