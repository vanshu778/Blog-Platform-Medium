// Handles fetching notifications and marking them as read

import Notification from "../models/Notification.model.js"

// ─── getNotifications ─────────────────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name username avatar")
      .populate("post", "title slug")
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = notifications.filter((n) => !n.read).length

    res.status(200).json({ notifications, unreadCount })
  } catch (err) {
    next(err)
  }
}

// ─── markAllRead ──────────────────────────────────────────────────────────────
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    )

    res.status(200).json({ message: "All notifications marked as read" })
  } catch (err) {
    next(err)
  }
}

// ─── markOneRead ──────────────────────────────────────────────────────────────
export const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { read: true } },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.status(200).json(notification)
  } catch (err) {
    next(err)
  }
}

// ─── deleteNotification ────────────────────────────────────────────────────────
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.status(200).json({ message: "Notification deleted", id: req.params.id })
  } catch (err) {
    next(err)
  }
}

// ─── clearAllNotifications ────────────────────────────────────────────────────
export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id })
    res.status(200).json({ message: "All notifications cleared" })
  } catch (err) {
    next(err)
  }
}
