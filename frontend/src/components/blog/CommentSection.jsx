import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { getAvatarUrl } from '../../utils/avatar'
import toast from 'react-hot-toast'
import ConfirmModal from '../ui/ConfirmModal'

// ─── Icons ────────────────────────────────────────────────────────────────────
const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const ChevronDownIcon = ({ open }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// ─── CommentInput — reusable textarea ──────────────────────────────────────────
function CommentInput({ user, value, onChange, onSubmit, onCancel, submitting, placeholder = 'What are your thoughts?', submitLabel = 'Respond', compact = false }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <div className={`flex items-start gap-3 ${compact ? '' : 'mb-8'}`}>
      {user && (
        <img
          src={getAvatarUrl(user.avatar, user.name)}
          alt={user.name}
          className={`rounded-full object-cover flex-shrink-0 ${compact ? 'w-7 h-7' : 'w-9 h-9'}`}
        />
      )}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-sm text-ink resize-none focus:outline-none focus:border-ink-muted transition-colors overflow-hidden"
          style={{ minHeight: compact ? '72px' : '88px' }}
        />
        <div className="flex justify-end items-center gap-2 mt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-ink-muted hover:text-ink px-3 py-1.5 rounded-full transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !value.trim()}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors disabled:opacity-40"
          >
            {submitting ? 'Posting...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SingleComment — renders one comment (top-level or reply) ─────────────────
function SingleComment({
  comment,
  user,
  onDelete,
  onEdit,
  onReply,
  isReply = false,
}) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [replying, setReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const uid = user?._id || user?.id
  const isOwn = uid && comment.author?._id === uid
  const authorName = comment.author?.name || 'Anonymous'
  const authorUsername = comment.author?.username || ''
  const avatarUrl = getAvatarUrl(comment.author?.avatar, authorName)

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return
    setEditSubmitting(true)
    try {
      const updated = await onEdit(comment._id, editContent)
      if (updated) {
        setEditing(false)
      }
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return
    setReplySubmitting(true)
    try {
      const success = await onReply(comment._id, replyContent)
      if (success) {
        setReplyContent('')
        setReplying(false)
      }
    } finally {
      setReplySubmitting(false)
    }
  }

  const replies = comment.replies || []

  return (
    <div className={`group ${isReply ? 'pl-4 border-l-2 border-border' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link to={`/${authorUsername}`} className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={authorName}
            className={`rounded-full object-cover ${isReply ? 'w-7 h-7' : 'w-8 h-8'}`}
          />
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              to={`/${authorUsername}`}
              className="text-sm font-semibold text-ink hover:underline"
            >
              {authorName}
            </Link>
            <span className="text-xs text-ink-muted">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-ink-muted italic">(edited)</span>
            )}
          </div>

          {/* Content or Edit Form */}
          {editing ? (
            <div className="mt-1">
              <CommentInput
                user={null}
                value={editContent}
                onChange={setEditContent}
                onSubmit={handleEditSubmit}
                onCancel={() => { setEditing(false); setEditContent(comment.content) }}
                submitting={editSubmitting}
                placeholder="Edit your comment..."
                submitLabel="Save"
                compact
              />
            </div>
          ) : (
            <p className="text-sm text-ink-light leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Action Buttons */}
          {!editing && (
            <div className="flex items-center gap-3 mt-2">
              {/* Reply — only for top-level comments */}
              {!isReply && user && (
                <button
                  onClick={() => setReplying(!replying)}
                  className={`flex items-center gap-1 text-xs transition-colors ${replying ? 'text-accent' : 'text-ink-muted hover:text-ink'}`}
                >
                  <ReplyIcon />
                  Reply
                </button>
              )}

              {/* Edit */}
              {isOwn && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                >
                  <EditIcon />
                  Edit
                </button>
              )}

              {/* Delete */}
              {isOwn && (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-1 text-xs text-danger/60 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <TrashIcon />
                  Delete
                </button>
              )}

              {/* Toggle replies */}
              {!isReply && replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors ml-auto"
                >
                  {showReplies ? 'Hide' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                  <ChevronDownIcon open={showReplies} />
                </button>
              )}
            </div>
          )}

          {/* Reply input */}
          {replying && (
            <div className="mt-3">
              <CommentInput
                user={user}
                value={replyContent}
                onChange={setReplyContent}
                onSubmit={handleReplySubmit}
                onCancel={() => { setReplying(false); setReplyContent('') }}
                submitting={replySubmitting}
                placeholder={`Reply to ${authorName}...`}
                submitLabel="Reply"
                compact
              />
            </div>
          )}

          {/* Nested Replies */}
          {!isReply && showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <SingleComment
                  key={reply._id}
                  comment={reply}
                  user={user}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onReply={onReply}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <ConfirmModal
        open={deleteOpen}
        title="Delete this comment?"
        message="This will permanently remove your comment and its replies."
        confirmText="Delete"
        onConfirm={() => { onDelete(comment._id); setDeleteOpen(false) }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}

// ─── CommentSection — main export ────────────────────────────────────────────
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
    setLoading(true)
    try {
      const res = await api.get(`/comments/${postId}`)
      setComments(res.data.comments || [])
    } catch {
      // silently fail — non-critical
    } finally {
      setLoading(false)
    }
  }

  // ── Add top-level comment ────────────────────────────────────
  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post(`/comments/${postId}`, { content })
      setComments((prev) => [...prev, { ...res.data, replies: [] }])
      setContent('')
      toast.success('Response posted!')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Add reply ──────────────────────────────────────────────────
  const handleReply = async (commentId, replyContent) => {
    try {
      const res = await api.post(`/comments/${commentId}/reply`, { content: replyContent })
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) {
            return { ...c, replies: [...(c.replies || []), res.data] }
          }
          return c
        })
      )
      toast.success('Reply posted!')
      return true
    } catch {
      toast.error('Failed to post reply')
      return false
    }
  }

  // ── Edit comment or reply ──────────────────────────────────────
  const handleEdit = async (commentId, newContent) => {
    try {
      const res = await api.put(`/comments/${commentId}`, { content: newContent })
      setComments((prev) =>
        prev.map((c) => {
          // Top-level match
          if (c._id === commentId) {
            return { ...c, content: res.data.content, isEdited: true }
          }
          // Reply match
          const updatedReplies = (c.replies || []).map((r) =>
            r._id === commentId ? { ...r, content: res.data.content, isEdited: true } : r
          )
          return { ...c, replies: updatedReplies }
        })
      )
      toast.success('Comment updated!')
      return true
    } catch {
      toast.error('Failed to update comment')
      return false
    }
  }

  // ── Delete comment or reply ──────────────────────────────────
  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`)
      setComments((prev) => {
        // Remove top-level comment
        const filtered = prev.filter((c) => c._id !== commentId)
        // Remove from replies list
        return filtered.map((c) => ({
          ...c,
          replies: (c.replies || []).filter((r) => r._id !== commentId),
        }))
      })
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  // ── Total comment count ──────────────────────────────────────
  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  )

  return (
    <div className="mt-10">
      {/* Header */}
      <h3 className="font-serif text-xl font-semibold text-ink mb-6">
        Responses ({totalCount})
      </h3>

      {/* Comment Form */}
      {user ? (
        <CommentInput
          user={user}
          value={content}
          onChange={setContent}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
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
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
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
        <div className="space-y-8">
          {comments.map((comment) => (
            <SingleComment
              key={comment._id}
              comment={comment}
              user={user}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}
