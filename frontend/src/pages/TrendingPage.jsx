import { useState, useEffect } from 'react'
import api from '../utils/api'
import PostCard from '../components/blog/PostCard'

const PERIODS = [
  { label: 'Today', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

export default function TrendingPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      try {
        const res = await api.get('/posts/trending', { params: { period, limit: 20 } })
        setPosts(res.data.posts || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [period])

  return (
    <div className="max-w-[1192px] mx-auto px-6 pt-8">
      {/* Header */}
      <div className="pb-6 mb-2 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔥</span>
          <h1 className="font-serif text-3xl font-bold text-ink">Trending</h1>
        </div>
        <p className="text-sm text-ink-muted">
          Stories getting the most attention right now.
        </p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 py-4">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
              period === p.value
                ? 'bg-surface border-border text-ink font-medium shadow-sm'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      <div className="max-w-[720px]">
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-6 py-6 border-b border-border">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="skeleton w-6 h-6 rounded-full" />
                    <div className="skeleton w-24 h-3" />
                  </div>
                  <div className="skeleton w-3/4 h-5" />
                  <div className="skeleton w-full h-3" />
                </div>
                <div className="skeleton w-[160px] h-[107px] rounded hidden sm:block flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-ink-muted text-lg">No trending stories yet.</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <div key={post._id} className="relative">
              <div className="absolute left-0 top-6 -ml-10 hidden lg:flex items-center justify-center w-8 h-8 text-[20px] font-bold text-border font-serif">
                {String(i + 1).padStart(2, '0')}
              </div>
              <PostCard
                post={post}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
