import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { getAvatarUrl } from '../utils/avatar'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ui/ConfirmModal'

export default function CollectionsPage() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const res = await api.get('/users/collections')
      setCollections(res.data.collections || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/users/collections', { name: newName.trim() })
      setCollections((prev) => [...prev, { ...res.data, posts: [] }])
      setNewName('')
      setShowForm(false)
      toast.success('Collection created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (collectionId) => {
    try {
      await api.delete(`/users/collections/${collectionId}`)
      setCollections((prev) => prev.filter((c) => c._id !== collectionId))
      toast.success('Collection deleted')
    } catch {
      toast.error('Failed to delete')
    }
    setDeleteTarget(null)
  }

  const handleRemovePost = async (collectionId, postId) => {
    try {
      await api.delete(`/users/collections/${collectionId}/posts/${postId}`)
      setCollections((prev) =>
        prev.map((c) =>
          c._id === collectionId
            ? { ...c, posts: c.posts.filter((p) => (p._id || p) !== postId) }
            : c
        )
      )
      toast.success('Removed from collection')
    } catch {
      toast.error('Failed to remove')
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1192px] mx-auto px-6 pt-8">
        <div className="skeleton w-48 h-8 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1192px] mx-auto px-6 pt-8">
      {/* Header */}
      <div className="pb-6 mb-6 border-b border-border flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📚</span>
            <h1 className="font-serif text-3xl font-bold text-ink">Collections</h1>
          </div>
          <p className="text-sm text-ink-muted">
            Organize your saved posts into groups.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          + New Collection
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-surface border border-border rounded-lg">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Collection name (e.g. React Learning)"
            className="flex-1 px-3 py-2 text-sm bg-surface-alt border border-border rounded-lg text-ink focus:outline-none focus:border-ink-muted"
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="bg-accent text-white text-sm px-4 py-2 rounded-full disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={() => { setShowForm(false); setNewName('') }}
            className="text-sm text-ink-muted hover:text-ink px-3 py-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Collections list */}
      {collections.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📂</p>
          <p className="text-ink-muted text-lg mb-4">
            No collections yet. Create one to organize your saved posts!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-[720px]">
          {collections.map((col) => (
            <div key={col._id} className="border border-border rounded-lg overflow-hidden">
              {/* Collection header */}
              <button
                onClick={() => setExpandedId(expandedId === col._id ? null : col._id)}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-alt transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📁</span>
                  <div>
                    <p className="font-semibold text-ink">{col.name}</p>
                    <p className="text-xs text-ink-muted">
                      {col.posts?.length || 0} {col.posts?.length === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(col._id) }}
                    className="text-xs text-danger/60 hover:text-danger px-2 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: expandedId === col._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {/* Expanded posts */}
              {expandedId === col._id && (
                <div className="border-t border-border">
                  {!col.posts || col.posts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-ink-muted">
                      No posts in this collection yet. Bookmark a post and add it here!
                    </div>
                  ) : (
                    col.posts.map((post) => (
                      <div
                        key={post._id}
                        className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-alt/50 transition-colors"
                      >
                        <Link to={`/blog/${post.slug}`} className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate hover:underline">
                            {post.title}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {post.author?.name} · {post.readTime} min read
                          </p>
                        </Link>
                        <button
                          onClick={() => handleRemovePost(col._id, post._id)}
                          className="flex-shrink-0 text-xs text-ink-muted hover:text-danger px-2 py-1 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this collection?"
        message="This will permanently delete the collection. Your saved posts won't be affected."
        confirmText="Delete"
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
