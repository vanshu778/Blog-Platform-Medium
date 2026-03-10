import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useAuth } from '../context/AuthContext'
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

export default function EditPostPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [postId, setPostId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${slug}`)
        const post = res.data

        // Check ownership
        const uid = user?._id || user?.id
        if (post.author._id !== uid) {
          toast.error('You can only edit your own stories')
          navigate('/')
          return
        }

        setPostId(post._id)
        setTitle(post.title)
        setContent(post.content)
        setCoverImage(post.coverImage || '')
        setTags(
          post.tags?.map(
            (t) => TAG_OPTIONS.find((o) => o.toLowerCase() === t) || t
          ) || []
        )
      } catch {
        toast.error('Post not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug, user, navigate])

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please add a title')
      return
    }
    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please add some content')
      return
    }

    setSaving(true)
    try {
      const res = await api.put(`/posts/${postId}`, {
        title,
        content,
        coverImage,
        tags: tags.map((t) => t.toLowerCase()),
      })
      toast.success('Story updated!')
      navigate(`/blog/${res.data.slug}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="skeleton w-full h-10 mb-6" />
        <div className="skeleton w-full h-64" />
      </div>
    )
  }

  return (
    <div>
      <div className="sticky top-[64px] z-40 bg-cream/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-content mx-auto flex items-center justify-between px-6 py-3">
          <span className="text-sm text-ink-muted">
            {wordCount} words · {readTime} min read
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-ink-muted hover:text-ink px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 py-10">
        <div className="mb-8">
          {coverImage ? (
            <div className="relative group">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full max-h-[300px] object-cover rounded"
              />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-ink/70 hover:bg-ink text-cream text-xs px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                ✕ Remove cover
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                id="edit-cover-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (!file.type.startsWith('image/')) return
                  if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
                  const reader = new FileReader()
                  reader.onload = () => setCoverImage(reader.result)
                  reader.readAsDataURL(file)
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('edit-cover-upload')?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-lg text-ink-muted hover:border-ink-muted hover:text-ink-light transition-colors cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-sm">Add a cover image</span>
              </button>
            </>
          )}
        </div>

        <textarea
          value={title}
          onInput={handleTitleInput}
          placeholder="Title"
          rows={1}
          className="w-full font-serif text-[40px] font-bold text-ink bg-transparent border-none outline-none resize-none placeholder:text-border leading-tight mb-6"
        />

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
