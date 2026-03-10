import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '../../context/NotificationContext'
import { getAvatarUrl } from '../../utils/avatar'

// ─── Icons ─────────────────────────────────────────────────────────────────────
const BellIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const CheckAllIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="20 11 9 22 7 20" />
  </svg>
)

// ─── Notification Item ──────────────────────────────────────────────────────────
function NotifItem({ notif, onClick }) {
  const senderName = notif.sender?.name || 'Someone'
  const senderUsername = notif.sender?.username || ''
  const avatarUrl = getAvatarUrl(notif.sender?.avatar, senderName)
  const postSlug = notif.post?.slug
  const postTitle = notif.post?.title

  const getMessage = () => {
    switch (notif.type) {
      case 'comment':
        return (
          <>
            commented on your story{' '}
            {postTitle && (
              <span className="font-medium text-ink">"{postTitle}"</span>
            )}
          </>
        )
      case 'follow':
        return 'started following you'
      case 'reaction':
        return (
          <>
            liked your story{' '}
            {postTitle && (
              <span className="font-medium text-ink">"{postTitle}"</span>
            )}
          </>
        )
      default:
        return 'interacted with you'
    }
  }

  const getLink = () => {
    if (notif.type === 'follow') return `/${senderUsername}`
    if (postSlug) return `/blog/${postSlug}`
    return '/'
  }

  return (
    <Link
      to={getLink()}
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-alt transition-colors ${
        !notif.read ? 'bg-green-50/60' : ''
      }`}
    >
      {/* Unread dot */}
      <div className="relative flex-shrink-0 mt-0.5">
        <img
          src={avatarUrl}
          alt={senderName}
          className="w-8 h-8 rounded-full object-cover"
        />
        {!notif.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-light leading-snug">
          <span className="font-semibold text-ink">{senderName}</span>{' '}
          {getMessage()}
        </p>
        <p className="text-xs text-ink-muted mt-0.5">
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
  )
}

// ─── NotificationBell — the main export ──────────────────────────────────────
export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAllRead, markOneRead, fetchNotifications } = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setOpen((prev) => {
      if (!prev) fetchNotifications() // refresh on open
      return !prev
    })
  }

  const handleItemClick = (notif) => {
    if (!notif.read) markOneRead(notif._id)
    setOpen(false)
  }

  const handleMarkAll = (e) => {
    e.stopPropagation()
    markAllRead()
  }

  const handleViewAll = () => {
    setOpen(false)
    navigate('/notifications')
  }

  const preview = notifications.slice(0, 5)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-ink-light hover:bg-surface-alt transition-colors"
        aria-label="Notifications"
      >
        <BellIcon filled={unreadCount > 0} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none animate-fade-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[340px] bg-surface rounded-xl shadow-md border border-border overflow-hidden animate-fade-in z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h4 className="text-sm font-semibold text-ink">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent transition-colors"
              >
                <CheckAllIcon />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="space-y-0">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton w-3/4 h-3" />
                      <div className="skeleton w-1/3 h-2.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : preview.length === 0 ? (
              <div className="py-10 text-center">
                <BellIcon />
                <p className="text-sm text-ink-muted mt-3">No notifications yet</p>
                <p className="text-xs text-ink-muted/70 mt-1">
                  You'll be notified about comments, follows, and likes
                </p>
              </div>
            ) : (
              preview.map((notif) => (
                <NotifItem
                  key={notif._id}
                  notif={notif}
                  onClick={() => handleItemClick(notif)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border">
              <button
                onClick={handleViewAll}
                className="w-full py-3 text-sm text-accent hover:bg-surface-alt transition-colors font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
