import { useState, useEffect } from 'react'
import api from '../utils/api'
import PostCard from '../components/blog/PostCard'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/users/bookmarks')
        setBookmarks(res.data)
      } catch {
        // Failed to load bookmarks
      } finally {
        setLoading(false)
      }
    }
    fetchBookmarks()
  }, [])

  return (
    <div className="max-w-[1192px] mx-auto px-6 pt-8">
      <div className="pb-6 mb-2 border-b border-border">
        <h1 className="font-serif text-3xl font-bold text-ink">
          Your reading list
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Stories you've saved for later.
        </p>
      </div>

      <div className="max-w-[720px]">
        {loading ? (
          <div>
            {[...Array(3)].map((_, i) => (
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
                </div>
                <div className="skeleton w-[160px] h-[107px] rounded hidden sm:block flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-ink-muted text-lg">
              Your reading list is empty. Bookmark stories to save them here!
            </p>
          </div>
        ) : (
          bookmarks.map((post, i) => (
            <PostCard
              key={post._id}
              post={post}
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))
        )}
      </div>
    </div>
  )
}
