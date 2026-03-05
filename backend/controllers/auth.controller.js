// controllers/auth.controller.js
// Handles user registration, login, and fetching the current user

import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

// ─── Helper: Generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// ─── register ─────────────────────────────────────────────────────────────────
// @route  POST /api/auth/register
// @access Public
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body

    // Check for duplicate email
    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Check for duplicate username
    const usernameExists = await User.findOne({ username })
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" })
    }

    // Create user — password is hashed automatically by pre-save hook
    const user = await User.create({ name, email, password, username })

    const token = generateToken(user._id)

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      token,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── login ────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    // Validate credentials using matchPassword from User model
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      token,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── getMe ────────────────────────────────────────────────────────────────────
// @route  GET /api/auth/me
// @access Private (protect middleware)
export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
