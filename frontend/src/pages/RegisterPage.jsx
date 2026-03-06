import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleUsernameChange = (e) => {
    setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSubmitting(true)

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        username,
        password,
      })
      login(res.data)
      toast.success(`Welcome to Medium, ${res.data.user.name}!`)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-surface rounded-xl shadow-md p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-accent text-xl">✦</span>
            <span className="font-serif text-xl font-semibold text-ink">
              Medium
            </span>
          </Link>
        </div>

        <h1 className="font-serif text-[32px] font-bold text-ink text-center mb-2">
          Join Medium.
        </h1>
        <p className="text-ink-muted text-center mb-8">
          Start reading &amp; writing stories that matter.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-4 py-2.5 border border-border rounded bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
              placeholder="yourname"
            />
            {username && (
              <p className="text-xs text-ink-muted mt-1">
                medium.com/@{username}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-danger text-sm px-4 py-2.5 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink text-cream font-medium py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          Already a member?{' '}
          <Link
            to="/login"
            className="text-accent font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
