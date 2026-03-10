import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AddToCollection({ postId }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users/collections')
      setCollections(res.data.collections || [])
    } catch {
      toast.error('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    if (!user) {
      toast.error('Sign in to use collections')
      return
    }
    setOpen(true)
    fetchCollections()
  }

  const handleAdd = async (collectionId) => {
    try {
      await api.post(`/users/collections/${collectionId}/posts`, { postId })
      toast.success('Added to collection')
      // Mark it locally
      setCollections((prev) =>
        prev.map((c) =>
          c._id === collectionId
            ? { ...c, posts: [...c.posts, { _id: postId }] }
            : c
        )
      )
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add')
    }
  }

  const handleRemove = async (collectionId) => {
    try {
      await api.delete(`/users/collections/${collectionId}/posts/${postId}`)
      toast.success('Removed from collection')
      setCollections((prev) =>
        prev.map((c) =>
          c._id === collectionId
            ? { ...c, posts: c.posts.filter((p) => (p._id || p) !== postId) }
            : c
        )
      )
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/users/collections', { name: newName.trim() })
      setCollections((prev) => [...prev, { ...res.data, posts: [] }])
      setNewName('')
      toast.success('Collection created')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create')
    } finally {
      setCreating(false)
    }
  }

  const isInCollection = (collection) =>
    collection.posts?.some((p) => (p._id || p) === postId)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border text-ink-muted hover:border-ink-muted transition-all"
        title="Add to collection"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        Collect
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-ink">Add to collection</p>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-ink-muted">Loading…</div>
            ) : collections.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-ink-muted">No collections yet</div>
            ) : (
              collections.map((c) => {
                const added = isInCollection(c)
                return (
                  <button
                    key={c._id}
                    onClick={() => (added ? handleRemove(c._id) : handleAdd(c._id))}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-alt transition-colors text-left"
                  >
                    <span className="text-sm text-ink truncate">{c.name}</span>
                    {added ? (
                      <span className="text-xs text-accent font-medium flex-shrink-0">✓ Added</span>
                    ) : (
                      <span className="text-xs text-ink-muted flex-shrink-0">+ Add</span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Quick create */}
          <form onSubmit={handleCreate} className="flex border-t border-border">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New collection…"
              className="flex-1 text-sm px-4 py-2.5 bg-transparent text-ink placeholder:text-ink-muted focus:outline-none"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="px-3 text-accent text-sm font-medium hover:bg-surface-alt disabled:opacity-40 transition-colors"
            >
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
