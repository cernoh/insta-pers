import { describe, expect, it } from 'vitest'
import { getDemoProfile, normalizeProfile } from '../lib/instagram'

describe('Instagram provider boundary', () => {
  it('returns three newest demo posts', () => expect(getDemoProfile().posts).toHaveLength(3))
  it('truncates extra posts', () => expect(normalizeProfile({ ...getDemoProfile(), posts: [...getDemoProfile().posts, getDemoProfile().posts[0]] }).posts).toHaveLength(3))
  it('rejects fewer than three image posts', () => expect(() => normalizeProfile({ ...getDemoProfile(), posts: getDemoProfile().posts.slice(0, 2) })).toThrow())
})
