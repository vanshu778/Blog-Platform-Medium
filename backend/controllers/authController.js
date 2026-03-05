import User from "../models/User.model.js"
import jwt from "jsonwebtoken"

// Generate a signed JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @desc   Register a new user
// @route  POST /api/auth/signup
// @access Public
export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check for duplicate email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email already in use"
            : "Username already taken",
      })
    }

    // Password is hashed automatically by the pre-save hook in User.model.js
    const user = await User.create({ name, username, email, password })

    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Use instance method from User.model.js
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}