import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 h-[64px] border-b border-border bg-cream/95 backdrop-blur-xl">
      <div className="max-w-[1192px] mx-auto h-full flex items-center justify-between px-6">
        {/* Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center w-9 h-9 rounded-md text-ink-light hover:bg-surface-alt transition-colors desktop:hidden [&_svg]:w-[22px] [&_svg]:h-[22px]"
            onClick={onMenuToggle}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-accent text-2xl leading-none">✦</span>
            <span className="font-serif text-[22px] font-semibold text-ink">
              Medium
            </span>
          </Link>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-[320px] mx-4">
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-surface-alt border border-transparent rounded-full focus:outline-none focus:border-border focus:bg-surface text-ink placeholder:text-ink-muted transition-all"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {location.pathname !== '/write' && (
                <Link
                  to="/write"
                  className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                >
                  <span>✏</span> Write
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-border transition-colors"
                >
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-surface rounded-lg shadow-md border border-border py-2 animate-fade-in">
                    <Link
                      to={`/${user.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink-light hover:bg-surface-alt transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/write"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink-light hover:bg-surface-alt transition-colors"
                    >
                      New Story
                    </Link>
                    <Link
                      to="/bookmarks"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink-light hover:bg-surface-alt transition-colors"
                    >
                      Reading List
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink-light hover:bg-surface-alt transition-colors"
                    >
                      Settings
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-surface-alt transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-ink-light hover:text-ink transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-ink text-cream text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
