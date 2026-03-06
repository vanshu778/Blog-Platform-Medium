import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { getAvatarUrl } from '../../utils/avatar'
import toast from 'react-hot-toast'

export default function CommentSection({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`)
      setComments(res.data.comments || [])
    } catch {
      console.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const res = await api.post(`/comments/${postId}`, { content })
      setComments((prev) => [...prev, res.data])
      setContent('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      await api.delete(`/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c._id !== commentId))
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div className="mt-10">
      <h3 className="font-serif text-xl font-semibold text-ink mb-6">
        Responses ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start gap-3">
            <img
              src={getAvatarUrl(user.avatar, user.name)}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What are your thoughts?"
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-sm text-ink resize-none focus:outline-none focus:border-ink-muted transition-colors"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Respond'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 border border-border rounded-lg text-center">
          <p className="text-sm text-ink-muted">
            <Link to="/login" className="text-accent hover:underline">
              Sign in
            </Link>{' '}
            to join the conversation.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton w-32 h-3" />
                <div className="skeleton w-full h-4" />
                <div className="skeleton w-2/3 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-8">
          No responses yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => {
            const authorName = comment.author?.name || 'Anonymous'
            const authorUsername = comment.author?.username || ''
            const avatarUrl = getAvatarUrl(comment.author?.avatar, authorName)
            const uid = user?._id || user?.id
            const isOwn = uid && comment.author?._id === uid

            return (
              <div key={comment._id} className="flex items-start gap-3">
                <Link to={`/${authorUsername}`} className="flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/${authorUsername}`}
                      className="text-sm font-medium text-ink hover:underline"
                    >
                      {authorName}
                    </Link>
                    <span className="text-xs text-ink-muted">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-ink-light leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-xs text-danger/70 hover:text-danger transition-colors mt-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
