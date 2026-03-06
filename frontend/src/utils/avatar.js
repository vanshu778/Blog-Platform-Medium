/**
 * Returns the user's avatar URL, falling back to DiceBear initials.
 * Single source of truth — used everywhere instead of duplicating the URL.
 */
const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/initials/svg'

export function getAvatarUrl(avatar, name = 'U') {
  return avatar || `${DICEBEAR_BASE}?seed=${encodeURIComponent(name)}`
}
