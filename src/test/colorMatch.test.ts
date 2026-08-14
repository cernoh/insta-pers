import { describe, expect, it } from 'vitest'
import { extractDominantColor, matchProfile } from '../lib/colorMatch'
import { demoProfile } from '../data/demoProfile'

describe('color matching', () => {
  it('extracts the average visible pixel color', () => {
    expect(extractDominantColor(new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 0]))).toBe('#FF0000')
  })
  it('falls back for empty or fully transparent pixels', () => {
    expect(extractDominantColor(new Uint8ClampedArray())).toBe('#D9CFC8')
    expect(extractDominantColor(new Uint8ClampedArray([0, 0, 0, 0]))).toBe('#D9CFC8')
  })
  it('combines palette and profile context into a deterministic recommendation', () => {
    const result = matchProfile(demoProfile)
    expect(result.colors).toHaveLength(3)
    expect(result.song.title).toBe('Good Days')
    expect(result.reasons).toHaveLength(3)
  })
  it('handles low-signal profiles', () => {
    const result = matchProfile({ handle: 'x', bio: '', posts: demoProfile.posts.map((post) => ({ ...post, dominantColor: '#888888' })) })
    expect(result.song.title).toBeTruthy()
  })
})
