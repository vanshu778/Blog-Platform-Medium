import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function ClapButton({
  postId,
  initialClaps = 0,
  initialClapped = false,
}) {
  const { user } = useAuth()
  const [claps, setClaps] = useState(initialClaps)
  const [clapped, setClapped] = useState(initialClapped)
  const [animating, setAnimating] = useState(false)
  const [floatLabel, setFloatLabel] = useState(null)

  const handleClap = async () => {
    if (!user) {
      toast.error('Sign in to clap for stories')
      return
    }

    const prevClaps = claps
    const prevClapped = clapped
    const newClapped = !clapped

    // Optimistic update
    setClapped(newClapped)
    setClaps((c) => Math.max(0, newClapped ? c + 1 : c - 1))
    setAnimating(true)
    if (newClapped) setFloatLabel('+1')

    setTimeout(() => {
      setAnimating(false)
      setFloatLabel(null)
    }, 600)

    try {
      const res = await api.post(`/posts/${postId}/clap`)
      setClaps(res.data.claps)
      setClapped(res.data.clapped)
    } catch {
      // Revert on failure
      setClaps(prevClaps)
      setClapped(prevClapped)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {/* Float label */}
      {floatLabel && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-ink text-cream text-xs px-2 py-0.5 rounded-full animate-float-up">
          {floatLabel}
        </span>
      )}

      {/* Clap button */}
      <button
        onClick={handleClap}
        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
          clapped
            ? 'bg-ink border-ink text-cream'
            : 'bg-surface border-border text-ink-light hover:border-ink-muted'
        } ${animating ? 'animate-clap-pop' : ''}`}
      >
        <span className="text-xl leading-none select-none">👏</span>
      </button>

      {/* Count */}
      <span className="text-xs text-ink-muted">
        {claps > 0 ? claps : ''}
      </span>
    </div>
  )
}
