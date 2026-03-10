import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* ── SVG Icons ──────────────────────────────────────────── */

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-4a1 1 0 0 1-1-1v-4.5a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1V20.5a1 1 0 0 1-1 1.5H5.5A1.5 1.5 0 0 1 3 20V9.5z" />
  </svg>
)

const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const StoriesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const FollowingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const CollectionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
)

export default function LeftSidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const NAV_ITEMS = [
    { label: 'Home', icon: <HomeIcon />, to: '/' },
    { label: 'Library', icon: <LibraryIcon />, to: '/bookmarks' },
    ...(user
      ? [
          { label: 'Profile', icon: <ProfileIcon />, to: `/${user.username}` },
          { label: 'Stories', icon: <StoriesIcon />, to: '/write' },
        ]
      : []),
    { label: 'Trending', icon: <TrendingIcon />, to: '/trending' },
    { label: 'Stats', icon: <StatsIcon />, to: '/stats' },
    ...(user
      ? [{ label: 'Collections', icon: <CollectionIcon />, to: '/collections' }]
      : []),
  ]

  return (
    <>
      {/* Overlay (mobile only) */}
      <div
        className={`fixed inset-0 bg-black/30 z-[60] transition-opacity duration-250 desktop:hidden ${
          isOpen ? 'block opacity-100' : 'hidden opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] bg-surface border-r border-border z-[70] font-sans flex flex-col overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] desktop:sticky desktop:top-[64px] desktop:h-[calc(100vh-64px)] desktop:translate-x-0 desktop:flex-shrink-0 desktop:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border desktop:hidden">
          <Link to="/" className="font-serif text-[22px] font-bold text-ink flex items-center gap-2" onClick={onClose}>
            <span className="text-accent text-xl">✦</span>
            Medium
          </Link>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-ink-muted hover:bg-surface-alt hover:text-ink transition-colors"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="py-4 px-3 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3.5 py-3 px-3.5 rounded-lg text-[15px] transition-colors [&_svg]:w-[22px] [&_svg]:h-[22px] ${
                isActive(item.to)
                  ? 'font-semibold text-ink bg-surface-alt'
                  : 'text-ink-light hover:bg-surface-alt hover:text-ink'
              }`}
            >
              <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          <div className="h-px bg-border mx-5 my-2" />

          {/* Following */}
          <Link
            to={user ? `/${user.username}` : '/login'}
            onClick={onClose}
            className="flex items-center gap-3.5 py-3 px-3.5 rounded-lg text-[15px] text-ink-light hover:bg-surface-alt hover:text-ink transition-colors [&_svg]:w-[22px] [&_svg]:h-[22px]"
          >
            <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <FollowingIcon />
            </span>
            Following
          </Link>
        </nav>

        {/* Find writers */}
        <div className="px-3 pb-6 pt-1">
          <Link
            to="/search"
            onClick={onClose}
            className="flex items-center gap-3.5 py-3 px-3.5 rounded-lg text-[15px] text-ink-light hover:bg-surface-alt hover:text-ink transition-colors [&_svg]:w-[22px] [&_svg]:h-[22px]"
          >
            <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <PlusIcon />
            </span>
            <span>
              Find writers and<br />publications to follow.
            </span>
          </Link>
          <Link
            to="/search"
            onClick={onClose}
            className="inline-block text-[13px] text-ink underline underline-offset-2 mt-1 px-3.5 hover:text-accent transition-colors"
          >
            See suggestions
          </Link>
        </div>
      </aside>
    </>
  )
}
