import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TAG_OPTIONS = [
  'Technology',
  'Design',
  'Science',
  'Culture',
  'Writing',
  'Business',
  'Health',
]

export default function WritePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState([])
  const [publishing, setPublishing] = useState(false)
  const [draftId, setDraftId] = useState(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')

  // Load existing draft if ?draft=<id> is in the URL
  useEffect(() => {
    const id = searchParams.get('draft')
    if (!id) return
    const loadDraft = async () => {
      try {
        const res = await api.get(`/posts/drafts`)
        const draft = (res.data.drafts || []).find((d) => d._id === id)
        if (!draft) return
        // Fetch full content by fetching the draft as a post (using slug)
        const full = await api.get(`/posts/${draft.slug}`)
        setTitle(full.data.title || '')
        setContent(full.data.content || '')
        setCoverImage(full.data.coverImage || '')
        setTags(full.data.tags || [])
        setDraftId(full.data._id)
        if (full.data.scheduledAt) {
          setShowSchedule(true)
          setScheduledAt(new Date(full.data.scheduledAt).toISOString().slice(0, 16))
        }
      } catch {
        // silently fail — just start fresh
      }
    }
    loadDraft()
  }, [searchParams])

  // Refs to hold latest values — auto-save reads these without recreating interval
  const draftRef = useRef({ title: '', content: '', coverImage: '', tags: [] })
  const draftIdRef = useRef(null)
  const lastSavedRef = useRef({ title: '', content: '' })
  const savingRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => {
    draftRef.current = { title, content, coverImage, tags: tags.map((t) => t.toLowerCase()) }
  }, [title, content, coverImage, tags])
  useEffect(() => { draftIdRef.current = draftId }, [draftId])

  // Stable auto-save interval — runs every 3 seconds, never resets
  useEffect(() => {
    const timer = setInterval(async () => {
      const { title: t, content: c, coverImage: img, tags: tg } = draftRef.current
      const contentEmpty = !c.trim() || c === '<p><br></p>'
      // Don't save if nothing typed at all or already saving
      if (!t.trim() && contentEmpty) return
      if (savingRef.current) return
      // Don't save if nothing changed
      if (t === lastSavedRef.current.title && c === lastSavedRef.current.content) return

      savingRef.current = true
      setAutoSaveStatus('Saving...')
      try {
        const id = draftIdRef.current
        const res = await api.put(`/posts/draft/${id || 'new'}`, {
          title: t, content: c, coverImage: img, tags: tg,
        })
        if (!id && res.data._id) {
          draftIdRef.current = res.data._id
          setDraftId(res.data._id)
        }
        lastSavedRef.current = { title: t, content: c }
        setAutoSaveStatus('Draft saved')
        setTimeout(() => setAutoSaveStatus(''), 2000)
      } catch {
        setAutoSaveStatus('Save failed')
        setTimeout(() => setAutoSaveStatus(''), 2000)
      } finally {
        savingRef.current = false
      }
    }, 3000)
    return () => clearInterval(timer)
  }, []) // empty deps — interval runs once, reads refs

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'code-block'],
        ['clean'],
      ],
    }),
    []
  )

  const plainText = content.replace(/<[^>]+>/g, '')
  const wordCount = plainText.split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleTitleInput = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
    setTitle(e.target.value)
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('Please add a title')
      return
    }
    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please add some content')
      return
    }

    setPublishing(true)
    try {
      const body = {
        title,
        content,
        coverImage,
        tags: tags.map((t) => t.toLowerCase()),
      }

      let res
      if (draftId) {
        // Update existing draft → publish or schedule it
        if (showSchedule && scheduledAt) {
          body.scheduledAt = new Date(scheduledAt).toISOString()
          body.status = 'scheduled'
        } else {
          body.status = 'published'
          body.scheduledAt = null
        }
        res = await api.put(`/posts/${draftId}`, body)
      } else {
        // No draft — create new post
        if (showSchedule && scheduledAt) {
          body.scheduledAt = new Date(scheduledAt).toISOString()
          body.status = 'scheduled'
        }
        res = await api.post('/posts', body)
      }

      if (showSchedule && scheduledAt) {
        toast.success('Story scheduled!')
        navigate('/stories')
      } else {
        toast.success('Story published!')
        navigate(`/blog/${res.data.slug}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div>
      {/* Sticky toolbar */}
      <div className="sticky top-[64px] z-40 bg-cream/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-content mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-muted">
              {wordCount} words · {readTime} min read
            </span>
            {autoSaveStatus && (
              <span className="text-xs text-ink-muted/60">{autoSaveStatus}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className={`text-sm px-4 py-2 rounded-full border transition-all ${
                showSchedule
                  ? 'border-accent text-accent'
                  : 'border-border text-ink-muted hover:border-ink-muted'
              }`}
            >
              ⏱ Schedule
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              {publishing
                ? 'Publishing...'
                : showSchedule && scheduledAt
                ? 'Schedule story'
                : 'Publish story'}
            </button>
          </div>
        </div>
        {showSchedule && (
          <div className="max-w-content mx-auto px-6 pb-3 flex items-center gap-3">
            <label className="text-sm text-ink-muted">Publish on:</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="text-sm px-3 py-1.5 bg-surface-alt border border-border rounded-lg text-ink focus:outline-none focus:border-ink-muted"
            />
            {scheduledAt && (
              <button
                onClick={() => { setScheduledAt(''); setShowSchedule(false) }}
                className="text-xs text-ink-muted hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className="max-w-content mx-auto px-6 py-10">
        {/* Cover image upload */}
        <CoverImageUpload value={coverImage} onChange={setCoverImage} />

        {/* Title */}
        <textarea
          value={title}
          onInput={handleTitleInput}
          placeholder="Title"
          rows={1}
          className="w-full font-serif text-[40px] font-bold text-ink bg-transparent border-none outline-none resize-none placeholder:text-border leading-tight mb-6"
        />

        {/* Tag pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-sm px-3.5 py-1.5 rounded-full border transition-all ${
                tags.includes(tag)
                  ? 'bg-ink text-cream border-ink'
                  : 'border-border text-ink-muted hover:border-ink-muted'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Quill editor */}
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="Tell your story..."
        />
      </div>
    </div>
  )
}

/* ── Cover Image Upload (file picker → base64) ────────────── */
function CoverImageUpload({ value, onChange }) {
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    onChange('')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (value) {
    return (
      <div className="relative mb-8 group">
        <img
          src={value}
          alt="Cover"
          className="w-full max-h-[300px] object-cover rounded"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-ink/70 hover:bg-ink text-cream text-xs px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
        >
          ✕ Remove cover
        </button>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-lg text-ink-muted hover:border-ink-muted hover:text-ink-light transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-sm">Add a cover image</span>
      </button>
    </div>
  )
}
