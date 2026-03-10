import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { getAvatarUrl } from '../utils/avatar'
import toast from 'react-hot-toast'
import ReactionBar from '../components/blog/ReactionBar'
import CommentSection from '../components/blog/CommentSection'
import BookmarkButton from '../components/blog/BookmarkButton'
import AddToCollection from '../components/blog/AddToCollection'
import ConfirmModal from '../components/ui/ConfirmModal'

export default function PostPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [readingMode, setReadingMode] = useState(false)
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${slug}`)
        setPost(res.data)
        setFollowerCount(res.data.author.followers?.length || 0)
        if (user) {
          const uid = user._id || user.id
          setFollowing(
            res.data.author.followers?.some((f) =>
              typeof f === 'object' ? f._id === uid : f === uid
            ) || false
          )
        }
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug, navigate, user])

  // Fetch recommended articles
  useEffect(() => {
    if (!user) return
    const fetchRecommended = async () => {
      try {
        const res = await api.get('/posts/recommended')
        const posts = res.data.posts || res.data || []
        setRecommended(posts.filter((p) => p.slug !== slug).slice(0, 3))
      } catch {
        // silently fail
      }
    }
    fetchRecommended()
  }, [slug, user])

  const handleFollow = async () => {
    if (!user) {
      toast.error('Sign in to follow writers')
      return
    }
    const prevFollowing = following
    const prevCount = followerCount

    setFollowing(!following)
    setFollowerCount((c) => (following ? c - 1 : c + 1))

    try {
      const res = await api.post(`/users/${post.author._id}/follow`)
      setFollowing(res.data.following)
      setFollowerCount(res.data.followerCount)
      toast.success(res.data.following ? 'Following!' : 'Unfollowed')
    } catch {
      setFollowing(prevFollowing)
      setFollowerCount(prevCount)
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`)
      toast.success('Story deleted')
      navigate('/')
    } catch {
      toast.error('Failed to delete story')
    } finally {
      setShowDeleteModal(false)
    }
  }

  /* ── Loading skeleton ────────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="skeleton w-1/3 h-4 mb-4" />
        <div className="skeleton w-full h-10 mb-4" />
        <div className="skeleton w-2/3 h-10 mb-8" />
        <div className="flex items-center gap-3 mb-8">
          <div className="skeleton w-11 h-11 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton w-32 h-3" />
            <div className="skeleton w-48 h-3" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton w-full h-4" />
          ))}
        </div>
      </div>
    )
  }

  if (!post) return null

  const authorName = post.author?.name || 'Anonymous'
  const authorUsername = post.author?.username || ''
  const avatarUrl = getAvatarUrl(post.author?.avatar, authorName)
  const uid = user?._id || user?.id
  const isOwnPost = user && (uid === post.author._id)

  return (
    <div className={`max-w-content mx-auto px-6 py-12 ${readingMode ? 'reading-mode' : ''}`}>
      {/* Reading mode toggle */}
      <button
        onClick={() => setReadingMode(!readingMode)}
        className="fixed bottom-6 right-6 z-50 bg-surface border border-border shadow-lg rounded-full p-3 hover:bg-surface-alt transition-colors"
        title={readingMode ? 'Exit reading mode' : 'Enter reading mode'}
      >
        {readingMode ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        )}
      </button>
      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs uppercase tracking-wider text-accent font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="font-serif text-[clamp(28px,5vw,44px)] font-bold text-ink leading-tight mb-6">
        {post.title}
      </h1>

      {/* Author bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to={`/${authorUsername}`}>
            <img
              src={avatarUrl}
              alt={authorName}
              className="w-11 h-11 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              to={`/${authorUsername}`}
              className="text-sm font-medium text-ink hover:underline"
            >
              {authorName}
            </Link>
            <p className="text-[13px] text-ink-muted">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}{' '}
              · {post.readTime} min read
            </p>
          </div>
        </div>

        <div>
          {isOwnPost ? (
            <div className="flex items-center gap-2">
              <Link
                to={`/edit/${post.slug}`}
                className="text-sm text-ink-light border border-border px-4 py-1.5 rounded-full hover:bg-surface-alt transition-all"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-sm text-danger border border-danger/30 px-4 py-1.5 rounded-full hover:bg-danger hover:text-white transition-all"
              >
                Delete
              </button>
            </div>
          ) : user ? (
            <button
              onClick={handleFollow}
              className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                following
                  ? 'border-border text-ink-muted hover:border-ink-muted'
                  : 'bg-accent text-white border-accent hover:bg-accent-hover'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full max-h-[480px] object-cover rounded mb-10"
          onError={(e) => (e.target.style.display = 'none')}
        />
      )}

      {/* Post content */}
      <div
        className="prose prose-medium max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Reaction bar */}
      <div className="border-t border-b border-border py-6 my-10 flex items-center justify-between hide-in-reading">
        <ReactionBar post={post} />
        <div className="flex items-center gap-2">
          <AddToCollection postId={post._id} />
          <BookmarkButton postId={post._id} />
        </div>
      </div>

      {/* Comments */}
      <div className="hide-in-reading">
        <CommentSection postId={post._id} />
      </div>

      {/* Author bio section */}
      <div className="flex items-start gap-4 bg-surface-alt rounded-lg p-6 hide-in-reading">
        <Link to={`/${authorUsername}`} className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={authorName}
            className="w-16 h-16 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1">
          <Link
            to={`/${authorUsername}`}
            className="font-serif text-lg font-semibold text-ink hover:underline"
          >
            {authorName}
          </Link>
          {post.author?.bio && (
            <p className="text-sm text-ink-muted mt-1 leading-relaxed">
              {post.author.bio}
            </p>
          )}
          {!isOwnPost && user && (
            <button
              onClick={handleFollow}
              className={`mt-3 text-sm px-4 py-1.5 rounded-full border transition-all ${
                following
                  ? 'border-border text-ink-muted hover:border-ink-muted'
                  : 'bg-accent text-white border-accent hover:bg-accent-hover'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Recommended articles */}
      {recommended.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border hide-in-reading">
          <h2 className="font-serif text-xl font-bold text-ink mb-6">Recommended for you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommended.map((rec) => (
              <Link
                key={rec._id}
                to={`/blog/${rec.slug}`}
                className="group block"
              >
                {rec.coverImage && (
                  <img
                    src={rec.coverImage}
                    alt={rec.title}
                    className="w-full h-32 object-cover rounded mb-3"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
                <p className="text-sm font-semibold text-ink group-hover:underline line-clamp-2">
                  {rec.title}
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  {rec.author?.name} · {rec.readTime} min read
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete this story?"
        message="This will permanently delete your story. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
