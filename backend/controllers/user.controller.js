// Handles user profiles, follow/unfollow, bookmarks, suggestions, and search

import User from "../models/User.model.js"
import Post from "../models/Post.model.js"
import Notification from "../models/Notification.model.js"

// ─── getProfile ───────────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "name username avatar")
      .populate("following", "name username avatar")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (err) {
    next(err)
  }
}

// ─── toggleFollow ─────────────────────────────────────────────────────────────
export const toggleFollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" })
    }

    const targetUser = await User.findById(req.params.id)
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" })
    }

    const currentUser = await User.findById(req.user._id)

    const isFollowing = currentUser.following
      .map((f) => f.toString())
      .includes(req.params.id)

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (f) => f.toString() !== req.params.id
      )
      targetUser.followers = targetUser.followers.filter(
        (f) => f.toString() !== req.user._id.toString()
      )
    } else {
      currentUser.following.push(req.params.id)
      targetUser.followers.push(req.user._id)

      await Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: "follow",
        post: null,
      })
    }

    await Promise.all([currentUser.save(), targetUser.save()])

    res.status(200).json({
      following: !isFollowing,
      followerCount: targetUser.followers.length,
    })
  } catch (err) {
    next(err)
  }
}

// ─── updateProfile ────────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    const { name, bio, avatar } = req.body

    if (name !== undefined) user.name = name
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar

    await user.save()

    const updatedUser = user.toObject()
    delete updatedUser.password

    res.status(200).json(updatedUser)
  } catch (err) {
    next(err)
  }
}

// ─── toggleBookmark ───────────────────────────────────────────────────────────
export const toggleBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const postId = req.params.postId

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
    next(err)
  }
}

// ─── getBookmarks ─────────────────────────────────────────────────────────────
export const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      populate: { path: "author", select: "name username avatar" },
      options: { sort: { createdAt: -1 } },
    })

    res.status(200).json(user.bookmarks)
  } catch (err) {
    next(err)
  }
}

// ─── getSuggestedUsers ────────────────────────────────────────────────────────
export const getSuggestedUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      _id: { $nin: [...req.user.following, req.user._id] },
    })
      .select("name username avatar bio followers")
      .limit(5)

    res.status(200).json({ users })
  } catch (err) {
    next(err)
  }
}

// ─── searchUsers ──────────────────────────────────────────────────────────────
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q || !q.trim()) {
      return res.status(200).json({ users: [] })
    }

    const regex = new RegExp(q, "i")

    const users = await User.find({
      $or: [{ name: regex }, { username: regex }],
    })
      .select("name username avatar bio")
      .limit(10)

    res.status(200).json({ users })
  } catch (err) {
    next(err)
  }
}

// ─── getCollections ─────────────────────────────────────────────────────────────
export const getCollections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("collections")
      .populate("collections.posts", "title slug coverImage excerpt author readTime createdAt")

    // Populate author in each post
    await User.populate(user, {
      path: "collections.posts.author",
      select: "name username avatar",
    })

    res.status(200).json({ collections: user.collections || [] })
  } catch (err) {
    next(err)
  }
}

// ─── createCollection ───────────────────────────────────────────────────────────
export const createCollection = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Collection name is required" })
    }

    const user = await User.findById(req.user._id)
    const exists = user.collections?.some(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    )
    if (exists) {
      return res.status(400).json({ message: "Collection already exists" })
    }

    user.collections.push({ name: name.trim(), posts: [] })
    await user.save()

    const newCollection = user.collections[user.collections.length - 1]
    res.status(201).json(newCollection)
  } catch (err) {
    next(err)
  }
}

// ─── deleteCollection ───────────────────────────────────────────────────────────
export const deleteCollection = async (req, res, next) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { collections: { _id: req.params.collectionId } } },
      { new: true, runValidators: false }
    )
    if (!result) {
      return res.status(404).json({ message: "Collection not found" })
    }
    res.status(200).json({ message: "Collection deleted" })
  } catch (err) {
    next(err)
  }
}

// ─── addToCollection ──────────────────────────────────────────────────────────
export const addToCollection = async (req, res, next) => {
  try {
    const { postId } = req.body
    const user = await User.findById(req.user._id)
    const collection = user.collections.id(req.params.collectionId)

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" })
    }

    if (collection.posts.some((p) => p.toString() === postId)) {
      return res.status(400).json({ message: "Post already in collection" })
    }

    collection.posts.push(postId)
    await user.save()
    res.status(200).json(collection)
  } catch (err) {
    next(err)
  }
}

// ─── removeFromCollection ─────────────────────────────────────────────────────
export const removeFromCollection = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const collection = user.collections.id(req.params.collectionId)

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" })
    }

    collection.posts = collection.posts.filter(
      (p) => p.toString() !== req.params.postId
    )
    await user.save()
    res.status(200).json(collection)
  } catch (err) {
    next(err)
  }
}
