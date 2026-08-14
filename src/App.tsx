import { useEffect, useMemo, useState } from 'react'
import { getDemoProfile, normalizeProfile } from './lib/instagram'
import { extractImageColor, matchProfile } from './lib/colorMatch'
import type { Profile } from './types'
import './styles.css'

export default function App() {
  const [handle, setHandle] = useState('maya.makes.magic')
  const [submitted, setSubmitted] = useState('maya.makes.magic')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<Profile>(() => getDemoProfile())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/instagram/profile?handle=${encodeURIComponent(submitted)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error)
        return response.json() as Promise<Profile>
      })
      .then(async (source) => {
        const posts = await Promise.all(source.posts.map(async (post) => ({ ...post, dominantColor: (await extractImageColor(post.imageUrl)) || post.dominantColor })))
        if (!cancelled) setProfile({ ...source, posts })
      })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Instagram profile unavailable.') })
      .finally(() => { if (!cancelled) setLoading(false) })
  }, [submitted])

  const result = useMemo(() => matchProfile(normalizeProfile(profile)), [profile])

  function submit(event: React.FormEvent) {
    event.preventDefault(); setError('')
    if (!handle.trim()) { setError('Pop in a handle so we know whose vibe to read.'); return }
    setSubmitted(handle.trim().replace(/^@/, ''))
  }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">✳</span><span>muse.fm</span></div><span className="top-note">a tiny soundtrack for your feed</span></header>
    <main>
      <section className="hero"><div className="eyebrow">✦ meet your next favorite song</div><h1>Your feed has a<br /><em>sound.</em></h1><p>Drop in an Instagram handle and we’ll turn your latest three posts into one little musical mood.</p><form onSubmit={submit}><label htmlFor="handle">Instagram handle</label><div className="input-row"><span className="at">@</span><input id="handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your.handle" /><button type="submit" disabled={loading}>{loading ? 'Reading feed…' : 'Find my song'} <span>↗</span></button></div>{error && <div className="error">{error} Try a public profile with at least three posts.</div>}</form></section>
      <section className="result-area" aria-live="polite"><div className="section-label"><span>your latest little moments</span><span className="rule" /><span>03 posts</span></div><div className="post-grid">{profile.posts.map((post, index) => <article className="post" key={post.id}><img src={post.imageUrl} alt={`Post ${index + 1}: ${post.caption}`} /><div className="post-meta"><span>0{index + 1}</span><span>{post.caption}</span></div></article>)}</div>
        <div className="match-grid"><div className="palette-panel"><div className="section-label"><span>the palette</span><span className="rule" /><span>picked from your pixels</span></div><div className="swatches">{result.colors.map((color, index) => <div className="swatch" key={color + index} style={{ backgroundColor: color }}><span>{color}</span></div>)}</div><div className="palette-copy"><strong>{result.mood} energy</strong><span>{result.palette}</span></div></div>
          <div className="song-card"><div className="song-kicker">✦ your song match</div><div className="disc" style={{ background: `linear-gradient(135deg, ${result.song.color}, #f6d8c8)` }}><span>♪</span></div><div className="song-info"><h2>{result.song.title}</h2><p>{result.song.artist}</p><div className="song-tags">{result.song.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div></div><button className="play" aria-label="Play preview">▶</button></div>
        </div><div className="why"><span className="why-title">why this one?</span>{result.reasons.map((reason) => <p key={reason}><span>✦</span>{reason}</p>)}</div>
      </section>
    </main><footer><span>made for soft scrollers &amp; big feelers</span><span>muse.fm <span className="footer-star">✳</span></span></footer>
  </div>
}
