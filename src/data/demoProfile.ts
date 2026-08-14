import type { Profile } from '../types'

export const demoProfile: Profile = {
  handle: 'maya.makes.magic',
  bio: 'tiny joys, big skies, and a little bit of golden hour ✿',
  posts: [
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85', caption: 'sunny days are my love language', publishedAt: '2026-08-12', dominantColor: '#F08D74' },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=85', caption: 'a little green corner of the world', publishedAt: '2026-08-09', dominantColor: '#87A878' },
    { id: '3', imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85', caption: 'soft light, softer thoughts', publishedAt: '2026-08-04', dominantColor: '#E9C6B5' },
  ],
}
