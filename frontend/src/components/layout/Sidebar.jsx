import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

const DISCOVER_TAGS = [
  'Technology',
  'Design',
  'Science',
  'Culture',
  'Writing',
  'Business',
  'Health',
  'Programming',
  'Data Science',
  'Productivity',
  'Startup',
  'UX',
]

const FOOTER_LINKS = [
  'Help',
  'Status',
  'Writers',
  'Blog',
  'Privacy',
  'Terms',
  'About',
]

export default function Sidebar() {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/posts/trending', { params: { limit: 5 } })
        setTrending(res.data.posts || [])
      } catch {
        // silently fail, show empty
      }
    }
    fetchTrending()
  }, [])
  return (
    <aside className="w-[300px] font-sans sticky top-[88px] self-start hidden lg:block">
      {/* Trending Topics */}
      <section className="mb-8">
        <h3 className="font-serif text-lg font-semibold text-ink mb-4">
          Trending on Medium
        </h3>
        {trending.length === 0 ? (
          <p className="text-sm text-ink-muted">No trending posts yet.</p>
        ) : (
          <ol className="list-none p-0 m-0 flex flex-col gap-1.5">
            {trending.map((item, i) => (
              <li key={item._id}>
                <Link
                  to={`/blog/${item.slug}`}
                  className="flex items-baseline gap-2.5 py-2.5 border-b border-border last:border-b-0"
                >
                  <span className="text-[28px] font-bold text-border leading-none min-w-[24px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] text-ink-muted mb-0.5">
                      {item.tags?.[0] || 'General'}
                    </p>
                    <p className="text-[15px] font-semibold text-ink leading-tight line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Discover Tags */}
      <section className="mb-8">
        <h3 className="font-serif text-lg font-semibold text-ink mb-4">
          Discover more topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {DISCOVER_TAGS.map((tag) => (
            <Link
              key={tag}
              to={`/search?q=${encodeURIComponent(tag)}`}
              className="bg-surface-alt rounded-full py-2 px-3.5 text-sm font-sans text-ink-light hover:bg-border transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Links */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-y-1.5 gap-x-4">
          {FOOTER_LINKS.map((link) => (
            <span
              key={link}
              className="text-[13px] text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              {link}
            </span>
          ))}
        </div>
      </section>
    </aside>
  )
}
