import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import PostCard from '../components/blog/PostCard'

const TAGS = [
  'All',
  'Technology',
  'Design',
  'Science',
  'Culture',
  'Writing',
  'Business',
  'Health',
]

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('All')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchPosts = useCallback(
    async (reset = false) => {
      setLoading(true)
      try {
        const currentPage = reset ? 1 : page
        const params = { page: currentPage, limit: 10 }
        if (activeTag !== 'All') params.tag = activeTag.toLowerCase()

        const res = await api.get('/posts', { params })
        const newPosts = res.data.posts

        if (reset) {
          setPosts(newPosts)
          setPage(2)
        } else {
          setPosts((prev) => [...prev, ...newPosts])
          setPage((p) => p + 1)
        }
        setHasMore(newPosts.length === 10)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [activeTag, page]
  )

  useEffect(() => {
    setPosts([])
    setPage(1)
    fetchPosts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag])

  const handleLoadMore = () => fetchPosts(false)

  return (
    <div className="max-w-[1192px] mx-auto px-6 pt-8">
      {/* Hero */}
      <div className="pb-8 mb-2 border-b border-border">
        <h1 className="font-serif text-[clamp(36px,5vw,52px)] font-bold text-ink leading-tight mb-3">
          Stories that matter.
        </h1>
        <p className="text-lg text-ink-muted max-w-xl">
          Ideas from writers who think deeply about technology, culture, and the
          human condition.
        </p>
      </div>

      {/* Tags bar */}
      <div className="flex gap-2 py-5 overflow-x-auto scrollbar-hide">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`whitespace-nowrap text-sm px-4 py-1.5 rounded-full border transition-all ${
              activeTag === tag
                ? 'bg-surface border-border text-ink font-medium shadow-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        {/* Feed */}
        <main>
          {loading && posts.length === 0 ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-ink-muted text-lg">
                No stories yet. Be the first to write one!
              </p>
            </div>
          ) : (
            <>
              {posts.map((post, i) => (
                <PostCard
                  key={post._id}
                  post={post}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
              {hasMore && (
                <div className="py-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="text-sm text-ink-light border border-border px-6 py-2.5 rounded-full hover:bg-surface-alt transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more stories'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-[88px]">
            <h3 className="font-serif text-lg font-semibold text-ink mb-4">
              Trending topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-sm px-3.5 py-1.5 rounded-full border transition-all ${
                    activeTag === tag
                      ? 'bg-ink text-cream border-ink'
                      : 'border-border text-ink-muted hover:border-ink-muted'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex gap-6 py-6 border-b border-border">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton w-6 h-6 rounded-full" />
          <div className="skeleton w-24 h-3" />
        </div>
        <div className="skeleton w-3/4 h-5" />
        <div className="skeleton w-full h-3" />
        <div className="skeleton w-1/2 h-3" />
      </div>
      <div className="skeleton w-[160px] h-[107px] rounded hidden sm:block flex-shrink-0" />
    </div>
  )
}
