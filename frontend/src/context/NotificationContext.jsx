import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef(null)

  // ── Fetch all notifications ────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch {
      // ignore — non-critical
    } finally {
      setLoading(false)
    }
  }, [user])

  // ── Mark all as read ────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }, [])

  // ── Mark one as read ────────────────────────────────────────
  const markOneRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // ignore
    }
  }, [])

  // ── Poll for unread count every 30s (lightweight) ──────────
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // Initial fetch
    fetchNotifications()

    // Poll every 30 seconds
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get('/notifications')
        setNotifications(res.data.notifications || [])
        setUnreadCount(res.data.unreadCount || 0)
      } catch {
        // ignore
      }
    }, 30_000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [user, fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, fetchNotifications, markAllRead, markOneRead }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
