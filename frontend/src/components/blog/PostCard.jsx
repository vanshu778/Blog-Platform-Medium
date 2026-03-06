import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { getAvatarUrl } from '../../utils/avatar'
import { ReactionSummary } from './ReactionBar'

export default function PostCard({ post, style }) {
  const authorName = post.author?.name || 'Anonymous'
  const authorUsername = post.author?.username || ''
  const avatarUrl = getAvatarUrl(post.author?.avatar, authorName)

  return (
    <article
      className="flex gap-6 py-6 border-b border-border transition-colors hover:bg-surface-alt/30"
      style={{
        opacity: 0,
        animation: 'fadeInUp 0.5s ease forwards',
        ...style,
      }}
    >
      {/* Left content */}
      <div className="flex-1 min-w-0">
        {/* Author row */}
        <Link
          to={`/${authorUsername}`}
          className="inline-flex items-center gap-2 mb-2"
        >
          <img
            src={avatarUrl}
            alt={authorName}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-ink-light font-medium">
            {authorName}
          </span>
        </Link>

        {/* Title */}
        <Link to={`/post/${post.slug}`}>
          <h2 className="font-serif text-xl font-bold text-ink leading-snug mb-1 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-[15px] text-ink-muted leading-relaxed line-clamp-2 mb-3">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] text-ink-muted">
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>·</span>
            <span>{post.readTime} min read</span>
            <ReactionSummary post={post} />
          </div>
          <div className="flex gap-1.5">
            {post.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-surface-alt text-ink-muted px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="flex-shrink-0 hidden sm:block">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-[160px] h-[107px] object-cover rounded"
            onError={(e) => (e.target.parentElement.style.display = 'none')}
          />
        </div>
      )}
    </article>
  )
}
