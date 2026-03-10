// Handles user registration, login, logout, token refresh, and current user

import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import User from "../models/User.model.js"

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ─── Internal Helpers (NOT exported) ──────────────────────────────────────────

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  })
}

const setRefreshCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production"
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

// ─── register ─────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" })
    }

    const usernameExists = await User.findOne({ username })
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" })
    }

    const user = await User.create({ name, email, password, username })

    setRefreshCookie(res, generateRefreshToken(user._id))

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      },
      accessToken: generateAccessToken(user._id),
    })
  } catch (err) {
    next(err)
  }
}

// ─── login ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    setRefreshCookie(res, generateRefreshToken(user._id))

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      },
      accessToken: generateAccessToken(user._id),
    })
  } catch (err) {
    next(err)
  }
}

// ─── logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken")
    res.status(200).json({ message: "Logged out successfully" })
  } catch (err) {
    next(err)
  }
}

// ─── refresh ──────────────────────────────────────────────────────────────────
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return res.status(401).json({ message: "No refresh token." })
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token." })
    }

    res.status(200).json({ accessToken: generateAccessToken(user._id) })
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token." })
  }
}

// ─── googleAuth ───────────────────────────────────────────────────────────────
export const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: "Google token is required" })
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, name, picture, sub: googleId } = payload

    // Check if user already exists
    let user = await User.findOne({ email })

    if (!user) {
      // Create new user from Google profile
      const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")

      // Ensure username is unique
      let finalUsername = username
      const usernameExists = await User.findOne({ username: finalUsername })
      if (usernameExists) {
        finalUsername = `${username}${Date.now().toString(36)}`
      }

      user = await User.create({
        name,
        email,
        username: finalUsername,
        avatar: "",
        googleId,
        password: undefined,
      })
    }

    setRefreshCookie(res, generateRefreshToken(user._id))

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      },
      accessToken: generateAccessToken(user._id),
    })
  } catch (err) {
    next(err)
  }
}

// ─── getMe ────────────────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user)
  } catch (err) {
    next(err)
  }
}
