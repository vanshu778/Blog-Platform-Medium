import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function BookmarkButton({ postId }) {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)

  // Check bookmarks from user state (no extra API call)
  const bookmarked = user?.bookmarks?.some(
    (b) => (typeof b === 'object' ? b._id : b) === postId
  ) || false

  const handleToggle = async () => {
    if (!user) {
      toast.error('Sign in to bookmark stories')
      return
    }

    setLoading(true)

    try {
      const res = await api.post(`/users/bookmarks/${postId}`)
      // Update user bookmarks in AuthContext
      updateUser({ bookmarks: res.data.bookmarks })
      toast.success(res.data.bookmarked ? 'Saved to reading list' : 'Removed from reading list')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${
        bookmarked
          ? 'bg-ink text-cream border-ink'
          : 'border-border text-ink-muted hover:border-ink-muted'
      }`}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this story'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  )
}
