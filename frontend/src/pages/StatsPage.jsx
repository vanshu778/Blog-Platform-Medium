import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/posts/analytics')
        setStats(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1192px] mx-auto px-6 pt-8">
        <div className="skeleton w-48 h-8 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
        <div className="skeleton w-full h-64 rounded-lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-[1192px] mx-auto px-6 pt-8 text-center py-20">
        <p className="text-5xl mb-4">📊</p>
        <p className="text-ink-muted">{error || 'No analytics data available yet.'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1192px] mx-auto px-6 pt-8">
      {/* Header */}
      <div className="pb-6 mb-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📈</span>
          <h1 className="font-serif text-3xl font-bold text-ink">Your Stats</h1>
        </div>
        <p className="text-sm text-ink-muted">Performance overview of your stories.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Posts" value={stats.totalPosts ?? 0} icon="📝" />
        <StatCard label="Total Views" value={stats.totalViews ?? 0} icon="👁️" />
        <StatCard label="Total Reactions" value={stats.totalReactions ?? 0} icon="❤️" />
        <StatCard label="Total Comments" value={stats.totalComments ?? 0} icon="💬" />
      </div>

      {/* Most read posts */}
      <div className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-ink mb-5">
          Your Most Read Stories
        </h2>
        {stats.mostReadPosts?.length === 0 ? (
          <p className="text-ink-muted text-sm py-8 text-center">No published stories yet.</p>
        ) : (
          <div className="space-y-1">
            {stats.mostReadPosts?.map((post, i) => (
              <Link
                key={post._id}
                to={`/blog/${post.slug}`}
                className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-surface-alt transition-colors"
              >
                <span className="text-2xl font-bold text-border font-serif min-w-[32px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {post.readTime} min read · {post.tags?.join(', ') || 'No tags'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-ink">{post.views || 0}</p>
                  <p className="text-xs text-ink-muted">views</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : '0'
  return (
    <div className="bg-surface border border-border rounded-lg p-6 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-ink">{displayValue}</p>
        <p className="text-sm text-ink-muted">{label}</p>
      </div>
    </div>
  )
}
