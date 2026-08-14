import type { MatchResult, Mood, Post, Profile, Song } from '../types'

const songs: Song[] = [
  { title: 'Good Days', artist: 'SZA', mood: 'sunny', color: '#F08D74', tags: ['sunny', 'golden', 'joy', 'love'] },
  { title: 'Sunset Lover', artist: 'Petit Biscuit', mood: 'dreamy', color: '#C6A9D8', tags: ['soft', 'sky', 'dream', 'light'] },
  { title: 'Bloom', artist: 'The Paper Kites', mood: 'cozy', color: '#87A878', tags: ['green', 'slow', 'soft', 'home'] },
  { title: 'Electric Feel', artist: 'MGMT', mood: 'electric', color: '#E9C6B5', tags: ['magic', 'big', 'electric', 'spark'] },
]

const moodWords: Record<Mood, string[]> = { sunny: ['sun', 'golden', 'joy', 'warm'], dreamy: ['dream', 'sky', 'soft', 'light'], cozy: ['green', 'home', 'slow', 'quiet'], electric: ['magic', 'spark', 'big', 'electric'] }

/** Extracts a representative color from RGBA pixels without a vision dependency. */
export function extractDominantColor(pixels: Uint8ClampedArray): string {
  if (pixels.length < 4) return '#D9CFC8'
  let r = 0; let g = 0; let b = 0; let count = 0
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    if (pixels[i + 3] < 32) continue
    r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; count++
  }
  if (!count) return '#D9CFC8'
  const round = (value: number) => Math.round(value / count).toString(16).padStart(2, '0').toUpperCase()
  return `#${round(r)}${round(g)}${round(b)}`
}

/** Browser adapter: canvas readback, with a safe neutral fallback for CORS/decoding failures. */
export async function extractImageColor(imageUrl: string): Promise<string> {
  try {
    const image = new Image(); image.crossOrigin = 'anonymous'; image.src = imageUrl
    await image.decode()
    const canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = 16
    const context = canvas.getContext('2d'); if (!context) return '#D9CFC8'
    context.drawImage(image, 0, 0, 16, 16)
    return extractDominantColor(context.getImageData(0, 0, 16, 16).data)
  } catch { return '#D9CFC8' }
}

function hue(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16); const r = n >> 16; const g = (n >> 8) & 255; const b = n & 255
  if (r > b * 1.25 && r > g * 1.12) return 'coral'
  if (g > r * 1.1 && g > b * 1.05) return 'green'
  if (b > r * 1.12) return 'blue'
  return 'blush'
}

export function matchProfile(profile: Profile): MatchResult {
  const colors = profile.posts.map((post) => post.dominantColor ?? '#D9CFC8')
  const families = colors.map(hue)
  const text = `${profile.handle} ${profile.bio} ${profile.posts.map((p) => p.caption).join(' ')}`.toLowerCase()
  const profileSignals = Object.entries(moodWords).flatMap(([mood, words]) => words.filter((word) => text.includes(word)).map((word) => `${word} → ${mood}`))
  const scores = songs.map((song) => ({ song, score: families.filter((family) => (song.mood === 'sunny' && family === 'coral') || (song.mood === 'cozy' && family === 'green') || (song.mood === 'dreamy' && family === 'blue') || (song.mood === 'electric' && family === 'blush')).length + profileSignals.filter((signal) => signal.endsWith(`→ ${song.mood}`)).length * 2 }))
  scores.sort((a, b) => b.score - a.score || a.song.title.localeCompare(b.song.title))
  const winner = scores[0].song
  const mood = winner.mood
  const palette = families.join(' · ')
  const reasons = [`Your three-photo palette leans ${palette}.`, `Your profile adds ${profileSignals.length ? profileSignals.slice(0, 2).map((signal) => signal.split(' → ')[0]).join(' + ') : 'a quiet, neutral energy'}.`, `${winner.title} matches the ${mood} feeling best.`]
  return { colors, palette, mood, song: winner, profileSignals, reasons }
}
