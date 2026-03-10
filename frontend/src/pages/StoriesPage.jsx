import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ui/ConfirmModal'
import StoryCard from '../components/blog/StoryCard'

const TABS = [
  { key: 'drafts', status: 'draft', label: 'Drafts', emptyIcon: '📝', emptyText: 'You have no drafts.' },
  { key: 'published', status: 'published', label: 'Published', emptyIcon: '📖', emptyText: "You haven't published any stories yet." },
  { key: 'scheduled', status: 'scheduled', label: 'Scheduled', emptyIcon: '📅', emptyText: 'No scheduled stories.' },
  { key: 'archived', status: 'archived', label: 'Archived', emptyIcon: '📦', emptyText: 'No archived stories.' },
]

const PAGE_SIZE = 10

export default function StoriesPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('drafts')
  const [stories, setStories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [counts, setCounts] = useState({ draft: 0, published: 0, scheduled: 0, archived: 0 })

  const currentTab = TABS.find((t) => t.key === tab)

  // Fetch stories for current tab
  const fetchStories = useCallback(async (status, pageNum) => {
    setLoading(true)
    try {
      const res = await api.get(`/posts/stories/me?status=${status}&page=${pageNum}&limit=${PAGE_SIZE}`)
      setStories(res.data.stories || [])
      setTotal(res.data.total || 0)
    } catch {
      toast.error('Failed to load stories')
      setStories([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch tab counts on mount
  useEffect(() => {
    if (!user) return
    const fetchCounts = async () => {
      const statuses = ['draft', 'published', 'scheduled', 'archived']
      const results = await Promise.allSettled(
        statuses.map((s) => api.get(`/posts/stories/me?status=${s}&limit=1`))
      )
      const newCounts = {}
      statuses.forEach((s, i) => {
        newCounts[s] = results[i].status === 'fulfilled' ? results[i].value.data.total || 0 : 0
      })
      setCounts(newCounts)
    }
    fetchCounts()
  }, [user])

  // Fetch on tab or page change
  useEffect(() => {
    if (!user || !currentTab) return
    fetchStories(currentTab.status, page)
  }, [user, tab, page, fetchStories, currentTab])

  // Reset page to 1 when switching tabs
  const handleTabChange = (key) => {
    setTab(key)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/posts/${deleteTarget}`)
      setStories((prev) => prev.filter((p) => p._id !== deleteTarget))
      setTotal((prev) => prev - 1)
      setCounts((prev) => ({ ...prev, [currentTab.status]: Math.max(0, (prev[currentTab.status] || 0) - 1) }))
      toast.success('Story deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleArchive = async (id, moveTo = 'archived') => {
    try {
      await api.put(`/posts/${id}`, { status: moveTo })
      setStories((prev) => prev.filter((p) => p._id !== id))
      setTotal((prev) => prev - 1)
      setCounts((prev) => ({
        ...prev,
        [currentTab.status]: Math.max(0, (prev[currentTab.status] || 0) - 1),
        [moveTo]: (prev[moveTo] || 0) + 1,
      }))
      toast.success(moveTo === 'archived' ? 'Story archived' : 'Moved to drafts')
    } catch {
      toast.error('Failed to update story')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

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
              onClick={() => handleTabChange(t.key)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                tab === t.key ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t.label}
              {counts[t.status] > 0 && (
                <span className="ml-1.5 text-ink-muted">{counts[t.status]}</span>
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
      ) : stories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{currentTab?.emptyIcon}</p>
          <p className="text-ink-muted">{currentTab?.emptyText}</p>
          {tab !== 'published' && tab !== 'archived' && (
            <Link
              to="/write"
              className="inline-block mt-4 text-accent text-sm font-medium hover:underline"
            >
              Write a story
            </Link>
          )}
        </div>
      ) : (
        <>
          <div>
            {stories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                onDelete={(id) => setDeleteTarget(id)}
                onArchive={handleArchive}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-border text-ink-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-ink-muted px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-border text-ink-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete story"
        message="Are you sure? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
