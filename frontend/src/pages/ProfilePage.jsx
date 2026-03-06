import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { getAvatarUrl } from '../utils/avatar'
import toast from 'react-hot-toast'
import PostCard from '../components/blog/PostCard'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(false)
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/posts/user/${username}`),
        ])
        const profileData = profileRes.data
        setProfile(profileData)
        setPosts(postsRes.data.posts || [])
        setFollowerCount(profileData.followers?.length || 0)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  // Sync follow state when user or profile changes
  useEffect(() => {
    if (user && profile) {
      const uid = user._id || user.id
      setFollowing(
        profile.followers?.some((f) =>
          typeof f === 'object' ? f._id === uid : f === uid
        ) || false
      )
    }
  }, [user, profile])

  const handleFollow = async () => {
    if (!user) {
      toast.error('Sign in to follow writers')
      return
    }
    const prevFollowing = following
    const prevCount = followerCount

    setFollowing(!following)
    setFollowerCount((c) => (following ? c - 1 : c + 1))

    try {
      const res = await api.post(`/users/${profile._id}/follow`)
      setFollowing(res.data.following)
      setFollowerCount(res.data.followerCount)
      toast.success(res.data.following ? 'Following!' : 'Unfollowed')
    } catch {
      setFollowing(prevFollowing)
      setFollowerCount(prevCount)
      toast.error('Something went wrong')
    }
  }

  /* ── Loading skeleton ────────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-[1192px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-16">
          <div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-6 py-6 border-b border-border">
                <div className="flex-1 space-y-3">
                  <div className="skeleton w-24 h-3" />
                  <div className="skeleton w-3/4 h-5" />
                  <div className="skeleton w-full h-3" />
                </div>
                <div className="skeleton w-[160px] h-[107px] rounded hidden sm:block flex-shrink-0" />
              </div>
            ))}
          </div>
          <aside className="hidden md:block">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="skeleton w-[88px] h-[88px] rounded-full" />
              <div className="skeleton w-32 h-5" />
              <div className="skeleton w-20 h-3" />
              <div className="skeleton w-full h-3" />
            </div>
          </aside>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1192px] mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">User not found</h2>
        <p className="text-ink-muted mb-6">We couldn't find a profile for @{username}.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-accent text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-accent-hover transition-colors"
        >
          Go home
        </button>
      </div>
    )
  }

  if (!profile) return null

  const uid = user?._id || user?.id
  const isOwnProfile =
    user && (uid === profile._id || user.username === profile.username)
  const avatarUrl = getAvatarUrl(profile.avatar, profile.name)

  return (
    <div className="max-w-[1192px] mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-16">
        {/* Main feed */}
        <main>
          <h2 className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-6">
            All stories
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-ink-muted">No stories published yet.</p>
            </div>
          ) : (
            posts.map((post, i) => (
              <PostCard
                key={post._id}
                post={post}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))
          )}
        </main>

        {/* Profile sidebar */}
        <aside className="md:order-last order-first">
          <div className="sticky top-[88px] flex flex-col items-center md:items-start text-center md:text-left">
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-[88px] h-[88px] rounded-full object-cover border-[3px] border-border mb-4"
            />
            <h1 className="font-serif text-[22px] font-semibold text-ink">
              {profile.name}
            </h1>
            <p className="text-[13px] text-ink-muted mb-3">
              @{profile.username}
            </p>

            {profile.bio && (
              <p className="text-sm text-ink-light leading-relaxed mb-4">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mb-5">
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">{posts.length}</p>
                <p className="text-xs text-ink-muted">Stories</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">
                  {followerCount}
                </p>
                <p className="text-xs text-ink-muted">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">
                  {profile.following?.length || 0}
                </p>
                <p className="text-xs text-ink-muted">Following</p>
              </div>
            </div>

            {/* Follow / Edit profile button */}
            {isOwnProfile ? (
              <Link
                to="/settings"
                className="block w-full text-center text-sm py-2 rounded-full border border-border text-ink-muted hover:border-ink-muted transition-all"
              >
                Edit profile
              </Link>
            ) : user ? (
              <button
                onClick={handleFollow}
                className={`w-full text-sm py-2 rounded-full border transition-all ${
                  following
                    ? 'border-border text-ink-muted hover:border-ink-muted'
                    : 'bg-accent text-white border-accent hover:bg-accent-hover'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
