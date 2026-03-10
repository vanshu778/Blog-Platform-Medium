import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { getAvatarUrl } from '../utils/avatar'

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="font-serif text-3xl font-bold text-ink">Platform Stats</h1>
        </div>
        <p className="text-sm text-ink-muted">An overview of the community.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard label="Total Posts" value={stats.totalPosts} icon="📝" />
        <StatCard label="New Users (24h)" value={stats.dailyActiveUsers} icon="🆕" />
      </div>

      {/* Most read posts */}
      <div className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-ink mb-5">
          Most Read Posts
        </h2>
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
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {post.author && (
                  <img
                    src={getAvatarUrl(post.author.avatar, post.author.name)}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {post.author?.name} · {post.readTime} min read
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-ink">{post.views || 0}</p>
                <p className="text-xs text-ink-muted">views</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-ink">{value?.toLocaleString() || 0}</p>
        <p className="text-sm text-ink-muted">{label}</p>
      </div>
    </div>
  )
}
