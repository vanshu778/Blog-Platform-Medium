// JWT authentication middleware — protect, optionalAuth, and refreshTokenMiddleware

import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

// ─── protect ──────────────────────────────────────────────────────────────────
// Blocks request if no valid token is provided
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select("-password")

    if (!req.user) {
      return res.status(401).json({ message: "Invalid or expired token." })
    }

    next()
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." })
  }
}

// ─── optionalAuth ─────────────────────────────────────────────────────────────
// Attaches user if valid token exists, never blocks the request
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


