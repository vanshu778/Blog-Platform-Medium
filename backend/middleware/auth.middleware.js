// middleware/auth.middleware.js
// JWT authentication middleware — provides protect (required auth) and optionalAuth (soft auth)

import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

// ─── protect ──────────────────────────────────────────────────────────────────
// Blocks request if no valid token is provided
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select("-password")

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, token failed" })
    }

    next()
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}

// ─── optionalAuth ─────────────────────────────────────────────────────────────
// Attaches user if a valid token exists, otherwise sets req.user = null
// Never blocks the request
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null
      return next()
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select("-password")
  } catch (err) {
    req.user = null
  }

  next()
}
