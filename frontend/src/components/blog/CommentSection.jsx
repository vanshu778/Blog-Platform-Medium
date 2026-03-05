import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function CommentSection({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const res = await api.get(`/posts/${postId}/comments`)
      setComments(res.data)
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
      const res = await api.post(`/posts/${postId}/comments`, { content })
      setComments((prev) => [res.data, ...prev])
      setContent('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parentComment: parentId,
      })
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), res.data] }
            : c
        )
      )
      setReplyContent('')
      setReplyingTo(null)
      toast.success('Reply added!')
    } catch {
      toast.error('Failed to add reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId, parentId = null) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      await api.delete(`/comments/${commentId}`)
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? { ...c, replies: c.replies.filter((r) => r._id !== commentId) }
              : c
          )
        )
      } else {
        setComments((prev) => prev.filter((c) => c._id !== commentId))
      }
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const totalCount =
    comments.length +
    comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0)

  return (
    <div className="mt-10">
      <h3 className="font-serif text-xl font-semibold text-ink mb-6">
        Responses ({totalCount})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start gap-3">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
              }
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
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              user={user}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReply={handleReply}
              handleDelete={handleDelete}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  user,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleReply,
  handleDelete,
  submitting,
  isReply = false,
  parentId = null,
}) {
  const authorName = comment.author?.name || 'Anonymous'
  const authorUsername = comment.author?.username || ''
  const avatarUrl =
    comment.author?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`
  const uid = user?._id || user?.id
  const isOwn = uid && comment.author?._id === uid

  return (
    <div className={`${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="flex items-start gap-3">
        <Link to={`/@${authorUsername}`} className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/@${authorUsername}`}
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
          <div className="flex items-center gap-3 mt-2">
            {user && !isReply && (
              <button
                onClick={() =>
                  setReplyingTo(
                    replyingTo === comment._id ? null : comment._id
                  )
                }
                className="text-xs text-ink-muted hover:text-ink transition-colors"
              >
                Reply
              </button>
            )}
            {isOwn && (
              <button
                onClick={() =>
                  handleDelete(comment._id, isReply ? parentId : null)
                }
                className="text-xs text-danger/70 hover:text-danger transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo === comment._id && (
        <div className="ml-11 mt-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Reply to ${authorName}...`}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm text-ink resize-none focus:outline-none focus:border-ink-muted transition-colors"
          />
          <div className="flex gap-2 justify-end mt-1.5">
            <button
              onClick={() => {
                setReplyingTo(null)
                setReplyContent('')
              }}
              className="text-xs text-ink-muted hover:text-ink px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={() => handleReply(comment._id)}
              disabled={submitting || !replyContent.trim()}
              className="bg-accent text-white text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies?.length > 0 &&
        comment.replies.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            user={user}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleReply={handleReply}
            handleDelete={handleDelete}
            submitting={submitting}
            isReply={true}
            parentId={comment._id}
          />
        ))}
    </div>
  )
}
