import type { Profile } from '../types'
import { demoProfile } from '../data/demoProfile'

export function getDemoProfile(): Profile {
  return { ...demoProfile, posts: demoProfile.posts.slice(0, 3) }
}

export function normalizeProfile(profile: Profile): Profile {
  const posts = profile.posts.filter((post) => post.imageUrl).slice(0, 3)
  if (posts.length < 3) throw new Error('We need three photo posts to make your mix.')
  return { ...profile, posts }
}
