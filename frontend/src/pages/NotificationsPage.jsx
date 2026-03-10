import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '../context/NotificationContext'
import { getAvatarUrl } from '../utils/avatar'

// ─── Icons ──────────────────────────────────────────────────────────────────
const BellOffIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M18.63 13A17.9 17.9 0 0 1 18 8" />
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
    <path d="M18 8a6 6 0 0 0-9.33-5" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const CommentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const FollowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
)

const LikeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const CheckAllIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="20 11 9 22 7 20" />
  </svg>
)

// ─── Type badge config ────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  comment: {
    icon: <CommentIcon />,
    color: 'bg-blue-100 text-blue-600',
    label: 'Comment',
  },
  follow: {
    icon: <FollowIcon />,
    color: 'bg-purple-100 text-purple-600',
    label: 'Follow',
  },
  reaction: {
    icon: <LikeIcon />,
    color: 'bg-rose-100 text-rose-500',
    label: 'Reaction',
  },
}

// ─── Individual notification row ─────────────────────────────────────────────
function NotificationRow({ notif, onRead }) {
  const senderName = notif.sender?.name || 'Someone'
  const senderUsername = notif.sender?.username || ''
  const avatarUrl = getAvatarUrl(notif.sender?.avatar, senderName)
  const postSlug = notif.post?.slug
  const postTitle = notif.post?.title
  const typeConf = TYPE_CONFIG[notif.type] || TYPE_CONFIG.reaction

  const getMessage = () => {
    switch (notif.type) {
      case 'comment':
        return postTitle
          ? `commented on your story "${postTitle}"`
          : 'commented on your story'
      case 'follow':
        return 'started following you'
      case 'reaction':
        return postTitle
          ? `liked your story "${postTitle}"`
          : 'liked your story'
      default:
        return 'interacted with you'
    }
  }

  const getLink = () => {
    if (notif.type === 'follow') return `/${senderUsername}`
    if (postSlug) return `/blog/${postSlug}`
    return '/'
  }

  const handleClick = () => {
    if (!notif.read) onRead(notif._id)
  }

  return (
    <Link
      to={getLink()}
      onClick={handleClick}
      className={`flex items-start gap-4 px-6 py-4 hover:bg-surface-alt transition-colors border-b border-border last:border-0 ${
        !notif.read ? 'bg-green-50/50' : ''
      }`}
    >
      {/* Avatar + type icon */}
      <div className="relative flex-shrink-0">
        <img
          src={avatarUrl}
          alt={senderName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${typeConf.color} border-2 border-white`}
        >
          {typeConf.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-light leading-snug">
          <span className="font-semibold text-ink">{senderName}</span>{' '}
          {getMessage()}
        </p>
        <p className="text-xs text-ink-muted mt-1">
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread indicator */}
      {!notif.read && (
        <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-accent" />
      )}
    </Link>
  )
}

// ─── NotificationsPage — main export ─────────────────────────────────────────
export default function NotificationsPage() {
  const { notifications, unreadCount, loading, fetchNotifications, markAllRead, markOneRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
    document.title = 'Notifications · Medium'
    return () => { document.title = 'Medium' }
  }, [fetchNotifications])

  // Group by today vs earlier
  const now = new Date()
  const today = []
  const earlier = []
  notifications.forEach((n) => {
    const age = now - new Date(n.createdAt)
    if (age < 86_400_000) today.push(n) // < 24 hours
    else earlier.push(n)
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-ink-muted mt-1">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-accent border border-border hover:border-accent/40 px-3 py-1.5 rounded-full transition-all"
          >
            <CheckAllIcon />
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-4">
              <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton w-3/4 h-3.5" />
                <div className="skeleton w-1/4 h-2.5" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 p-5 bg-surface-alt rounded-full">
            <BellOffIcon />
          </div>
          <h3 className="font-serif text-xl font-semibold text-ink mb-2">
            You're all caught up!
          </h3>
          <p className="text-sm text-ink-muted max-w-xs">
            When someone comments on your story, follows you, or likes your post — you'll see it here.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            Explore stories
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {/* Today */}
          {today.length > 0 && (
            <>
              <div className="px-6 py-2.5 bg-surface-alt border-b border-border">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Today</p>
              </div>
              {today.map((n) => (
                <NotificationRow key={n._id} notif={n} onRead={markOneRead} />
              ))}
            </>
          )}

          {/* Earlier */}
          {earlier.length > 0 && (
            <>
              <div className="px-6 py-2.5 bg-surface-alt border-b border-border">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Earlier</p>
              </div>
              {earlier.map((n) => (
                <NotificationRow key={n._id} notif={n} onRead={markOneRead} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
