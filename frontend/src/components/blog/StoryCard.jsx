import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'

export default function StoryCard({ story, onDelete, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const title = story.title || 'Untitled'
  const subtitle = story.subtitle || story.excerpt?.slice(0, 120) || ''
  const status = story.status || 'draft'

  const dateLabel =
    status === 'scheduled' && story.scheduledAt
      ? `Scheduled for ${format(new Date(story.scheduledAt), 'MMM d, yyyy · h:mm a')}`
      : status === 'published'
      ? `Published ${formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}`
      : `Last edited ${formatDistanceToNow(new Date(story.updatedAt || story.createdAt), { addSuffix: true })}`

  const statusConfig = {
    draft: { label: 'Draft', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    scheduled: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    published: { label: 'Published', classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    archived: { label: 'Archived', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  }

  const badge = statusConfig[status] || statusConfig.draft
  const editLink = status === 'published' ? `/edit/${story.slug}` : `/write?draft=${story._id}`

  return (
    <div className="flex items-start justify-between py-5 border-b border-border group">
      <div className="flex-1 min-w-0 pr-4">
        <Link to={editLink} className="block">
          <h3 className="text-base font-semibold text-ink group-hover:text-accent transition-colors truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-ink-muted mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full ${badge.classes}`}>
            {badge.label}
          </span>
          <span className="text-xs text-ink-muted">{dateLabel}</span>
          {story.readTime && (
            <span className="text-xs text-ink-muted">{story.readTime} min read</span>
          )}
          {status === 'published' && (
            <>
              {story.views > 0 && (
                <span className="text-xs text-ink-muted">{story.views} views</span>
              )}
              {story.reactionCount > 0 && (
                <span className="text-xs text-ink-muted">{story.reactionCount} reactions</span>
              )}
              {story.commentCount > 0 && (
                <span className="text-xs text-ink-muted">{story.commentCount} comments</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3-dot menu */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full text-ink-muted hover:bg-surface-alt hover:text-ink transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg z-50 py-1">
              <Link
                to={editLink}
                className="block px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Edit
              </Link>
              {status === 'published' && (
                <Link
                  to={`/blog/${story.slug}`}
                  className="block px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  View story
                </Link>
              )}
              {status !== 'archived' && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onArchive?.(story._id)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                >
                  Archive
                </button>
              )}
              {status === 'archived' && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onArchive?.(story._id, 'draft')
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                >
                  Move to drafts
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onDelete?.(story._id)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-surface-alt transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
