import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { getAvatarUrl } from '../utils/avatar'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    try {
      const res = await api.put('/users/profile/update', {
        name,
        bio,
        avatar,
      })
      updateUser(res.data)
      toast.success('Profile updated!')
      navigate(`/${user.username}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const avatarUrl = getAvatarUrl(avatar, name || 'U')

  return (
    <div className="max-w-[560px] mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-bold text-ink mb-2">
        Edit profile
      </h1>
      <p className="text-sm text-ink-muted mb-8">
        Update your name, bio, and avatar.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt="Avatar preview"
            className="w-20 h-20 rounded-full object-cover border-[3px] border-border"
          />
          <div className="flex-1">
            <label className="block text-sm font-medium text-ink mb-1">
              Avatar URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Paste an image URL..."
              className="w-full px-4 py-2.5 border border-border rounded bg-surface text-sm text-ink focus:outline-none focus:border-ink-muted transition-colors"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className="w-full px-4 py-2.5 border border-border rounded bg-surface text-sm text-ink focus:outline-none focus:border-ink-muted transition-colors"
          />
        </div>

        {/* Username (read-only) */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Username
          </label>
          <input
            type="text"
            value={user?.username || ''}
            disabled
            className="w-full px-4 py-2.5 border border-border rounded bg-surface-alt text-sm text-ink-muted cursor-not-allowed"
          />
          <p className="text-xs text-ink-muted mt-1">
            Username cannot be changed.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell readers about yourself..."
            rows={4}
            maxLength={300}
            className="w-full px-4 py-2.5 border border-border rounded bg-surface text-sm text-ink resize-none focus:outline-none focus:border-ink-muted transition-colors"
          />
          <p className="text-xs text-ink-muted text-right mt-1">
            {bio.length}/300
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-ink-muted hover:text-ink px-4 py-2.5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
