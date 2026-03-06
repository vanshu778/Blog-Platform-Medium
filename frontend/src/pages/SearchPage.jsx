import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { getAvatarUrl } from '../utils/avatar'
import PostCard from '../components/blog/PostCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!query.trim()) return

    const search = async () => {
      setLoading(true)
      try {
        const res = await api.get('/posts/search', { params: { q: query } })
        setPosts(res.data.posts)
        setUsers(res.data.users)
        setTotal(res.data.total)
      } catch {
        // Search failed — silently fail
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [query])

  if (!query.trim()) {
    return (
      <div className="max-w-[1192px] mx-auto px-6 py-16 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-ink-muted text-lg">
          Enter a search term to find stories and writers.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-[1192px] mx-auto px-6 pt-8">
      <div className="pb-6 mb-2 border-b border-border">
        <p className="text-sm text-ink-muted mb-1">Search results for</p>
        <h1 className="font-serif text-3xl font-bold text-ink">"{query}"</h1>
        {!loading && (
          <p className="text-sm text-ink-muted mt-2">
            {total} {total === 1 ? 'story' : 'stories'} found
            {users.length > 0 && ` · ${users.length} ${users.length === 1 ? 'writer' : 'writers'}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <main>
          {loading ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-6 py-6 border-b border-border"
                >
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
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-ink-muted text-lg">
                No stories match your search.
              </p>
            </div>
          ) : (
            posts.map((post, i) => (
              <PostCard
                key={post._id}
                post={post}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))
          )}
        </main>

        {/* Writers sidebar */}
        {users.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-[88px]">
              <h3 className="font-serif text-lg font-semibold text-ink mb-4">
                Writers
              </h3>
              <div className="space-y-4">
                {users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/${u.username}`}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={getAvatarUrl(u.avatar, u.name)}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-ink group-hover:underline">
                        {u.name}
                      </p>
                      <p className="text-xs text-ink-muted">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
