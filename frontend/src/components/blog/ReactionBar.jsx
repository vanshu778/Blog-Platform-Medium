import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'clap', emoji: '👏', label: 'Clap' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'funny', emoji: '😂', label: 'Funny' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
]

/**
 * Build initial state from post data.
 */
function buildInitialState(post, userId) {
  const state = {}

  for (const { type } of REACTIONS) {
    const arr = post.reactions?.[type] || []
    state[type] = {
      count: arr.length,
      reacted: userId
        ? arr.some((id) => (typeof id === 'object' ? id._id : id) === userId)
        : false,
    }
  }

  return state
}

export default function ReactionBar({ post }) {
  const { user } = useAuth()
  const uid = user?._id || user?.id
  const [reactions, setReactions] = useState(() => buildInitialState(post, uid))
  const [showPicker, setShowPicker] = useState(false)
  const [animating, setAnimating] = useState(null) // which type is animating
  const [floatEmoji, setFloatEmoji] = useState(null)

  const totalReactions = Object.values(reactions).reduce((s, v) => s + v.count, 0)

  // Find the user's current reaction (first one they've toggled on)
  const myReaction = REACTIONS.find((r) => reactions[r.type]?.reacted)

  const handleReact = async (type) => {
    if (!user) {
      toast.error('Sign in to react to stories')
      return
    }

    const prev = { ...reactions }
    const wasReacted = reactions[type].reacted

    // Optimistic update
    setReactions((r) => ({
      ...r,
      [type]: {
        count: Math.max(0, r[type].count + (wasReacted ? -1 : 1)),
        reacted: !wasReacted,
      },
    }))

    if (!wasReacted) {
      const emoji = REACTIONS.find((r) => r.type === type)?.emoji
      setAnimating(type)
      setFloatEmoji(emoji)
      setTimeout(() => {
        setAnimating(null)
        setFloatEmoji(null)
      }, 700)
    }

    setShowPicker(false)

    try {
      const res = await api.post(`/posts/${post._id}/react`, { type })
      setReactions(res.data.reactions)
    } catch {
      setReactions(prev)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="flex items-center gap-3 relative">
      {/* Main reaction button (shows current reaction or default clap) */}
      <div className="relative">
        <button
          onClick={() => handleReact(myReaction?.type || 'clap')}
          onMouseEnter={() => setShowPicker(true)}
          className={`group relative w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
            myReaction
              ? 'bg-ink border-ink text-cream'
              : 'bg-surface border-border text-ink-light hover:border-ink-muted'
          } ${animating ? 'scale-125' : 'scale-100'}`}
          style={{ transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, border-color 0.2s' }}
        >
          <span className="text-xl leading-none select-none">
            {myReaction?.emoji || '👏'}
          </span>
        </button>

        {/* Floating emoji animation */}
        {floatEmoji && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg animate-float-up pointer-events-none">
            {floatEmoji}
          </span>
        )}

        {/* Emoji picker popover */}
        {showPicker && (
          <div
            className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 flex gap-1 bg-surface border border-border rounded-full shadow-lg px-2 py-1.5 z-50"
            onMouseEnter={() => setShowPicker(true)}
            onMouseLeave={() => setShowPicker(false)}
          >
            {REACTIONS.map((r) => {
              const isActive = reactions[r.type]?.reacted
              return (
                <button
                  key={r.type}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReact(r.type)
                  }}
                  title={r.label}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-125 hover:bg-surface-alt ${
                    isActive ? 'bg-surface-alt ring-2 ring-accent' : ''
                  }`}
                  style={{ transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                  <span className="text-xl leading-none select-none">{r.emoji}</span>
                  {reactions[r.type]?.count > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-ink text-cream text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {reactions[r.type].count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Reaction count */}
      <span className="text-sm text-ink-muted">
        {totalReactions > 0
          ? `${totalReactions} ${totalReactions === 1 ? 'reaction' : 'reactions'}`
          : 'Be the first to react'}
      </span>

      {/* Mini reaction summary — show top emojis */}
      {totalReactions > 0 && (
        <div className="flex -space-x-1">
          {REACTIONS.filter((r) => reactions[r.type]?.count > 0)
            .sort((a, b) => reactions[b.type].count - reactions[a.type].count)
            .slice(0, 3)
            .map((r) => (
              <span
                key={r.type}
                className="w-6 h-6 rounded-full bg-surface-alt border border-border flex items-center justify-center text-sm"
                title={`${r.label}: ${reactions[r.type].count}`}
              >
                {r.emoji}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for PostCard — shows emoji summary, no interaction
 */
export function ReactionSummary({ post }) {
  const reactions = post.reactions || {}
  const entries = Object.entries(reactions)
    .map(([type, users]) => ({
      type,
      count: Array.isArray(users) ? users.length : 0,
      emoji: REACTIONS.find((r) => r.type === type)?.emoji,
    }))
    .filter((e) => e.count > 0 && e.emoji)
    .sort((a, b) => b.count - a.count)

  const total = entries.reduce((s, e) => s + e.count, 0)
  if (total === 0) return null

  const topEmojis = entries.slice(0, 3)

  return (
    <>
      <span>·</span>
      <span className="inline-flex items-center gap-0.5">
        {topEmojis.map((e) => (
          <span key={e.type} className="text-xs">{e.emoji}</span>
        ))}
        {' '}{total}
      </span>
    </>
  )
}
