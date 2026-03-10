import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ui/ConfirmModal'

const TABS = [
  { key: 'drafts', label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'published', label: 'Published' },
]

export default function StoriesPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('drafts')
  const [drafts, setDrafts] = useState([])
  const [scheduled, setScheduled] = useState([])
  const [published, setPublished] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [draftsRes, scheduledRes, publishedRes] = await Promise.all([
          api.get('/posts/drafts'),
          api.get('/posts/scheduled'),
          api.get(`/posts/user/${user.username}`),
        ])
        setDrafts(draftsRes.data.drafts || [])
        setScheduled(scheduledRes.data.posts || [])
        setPublished(publishedRes.data.posts || [])
      } catch {
        toast.error('Failed to load stories')
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchAll()
  }, [user])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/posts/${deleteTarget}`)
      setDrafts((prev) => prev.filter((p) => p._id !== deleteTarget))
      setScheduled((prev) => prev.filter((p) => p._id !== deleteTarget))
      setPublished((prev) => prev.filter((p) => p._id !== deleteTarget))
      toast.success('Story deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteTarget(null)
    }
  }

  const currentItems =
    tab === 'drafts' ? drafts : tab === 'scheduled' ? scheduled : published

  const counts = {
    drafts: drafts.length,
    scheduled: scheduled.length,
    published: published.length,
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-[42px] font-bold text-ink">Your stories</h1>
        <Link
          to="/write"
          className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-accent-hover transition-colors"
        >
          Write a story
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'text-ink'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className="ml-1.5 text-ink-muted">{counts[t.key]}</span>
              )}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-ink" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-border">
              <div className="flex-1 space-y-2">
                <div className="skeleton w-2/3 h-5" />
                <div className="skeleton w-1/3 h-3" />
              </div>
            </div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">
            {tab === 'drafts' ? '📝' : tab === 'scheduled' ? '📅' : '📖'}
          </p>
          <p className="text-ink-muted">
            {tab === 'drafts'
              ? 'You have no drafts.'
              : tab === 'scheduled'
              ? 'No scheduled stories.'
              : 'You haven\'t published any stories yet.'}
          </p>
          {tab !== 'published' && (
            <Link
              to="/write"
              className="inline-block mt-4 text-accent text-sm font-medium hover:underline"
            >
              Write a story
            </Link>
          )}
        </div>
      ) : (
        <div>
          {currentItems.map((story) => (
            <StoryRow
              key={story._id}
              story={story}
              tab={tab}
              onDelete={() => setDeleteTarget(story._id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete story"
        message="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}

function StoryRow({ story, tab, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const title = story.title || 'Untitled'
  const excerpt = story.excerpt
    ? story.excerpt.slice(0, 120) + (story.excerpt.length > 120 ? '…' : '')
    : ''

  const dateLabel =
    tab === 'scheduled' && story.scheduledAt
      ? `Scheduled for ${format(new Date(story.scheduledAt), 'MMM d, yyyy · h:mm a')}`
      : `Last edited ${formatDistanceToNow(new Date(story.updatedAt || story.createdAt), { addSuffix: true })}`

  const statusBadge =
    tab === 'drafts' ? (
      <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
        Draft
      </span>
    ) : tab === 'scheduled' ? (
      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
        Scheduled
      </span>
    ) : (
      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
        Published
      </span>
    )

  const editLink =
    tab === 'published' ? `/edit/${story.slug}` : `/write?draft=${story._id}`

  return (
    <div className="flex items-start justify-between py-5 border-b border-border group">
      <div className="flex-1 min-w-0 pr-4">
        <Link to={editLink} className="block">
          <h3 className="text-base font-semibold text-ink group-hover:text-accent transition-colors truncate">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-ink-muted mt-0.5 line-clamp-1">{excerpt}</p>
          )}
        </Link>
        <div className="flex items-center gap-3 mt-2">
          {statusBadge}
          <span className="text-xs text-ink-muted">{dateLabel}</span>
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
            <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-border rounded-lg shadow-lg z-50 py-1">
              <Link
                to={editLink}
                className="block px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Edit
              </Link>
              {tab === 'published' && (
                <Link
                  to={`/blog/${story.slug}`}
                  className="block px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  View
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
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
