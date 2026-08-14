import type { Post, Profile } from '../types.ts'

const decode = (value: string) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')

export function parseProfilePage(html: string, _handle: string): Post[] {
  const posts: Post[] = []
  const seen = new Set<string>()
  const pattern = /<a[^>]+href="(\/[^"/]+\/(?:p|reel)\/([A-Za-z0-9_-]+)\/?)"[\s\S]*?<img[^>]+(?:alt="([^"]*)")?[^>]+src="([^"]+)"[\s\S]*?<\/a>/g
  for (const match of html.matchAll(pattern)) {
    const [, , id, alt = '', imageUrl] = match
    if (seen.has(id)) continue
    seen.add(id)
    posts.push({ id, imageUrl: decode(imageUrl), caption: decode(alt), publishedAt: '' })
    if (posts.length === 3) break
  }
  return posts
}

export function parsePostPage(html: string, url: string, _index: number): Post | undefined {
  const imageUrl = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1]
  const description = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1]
  const id = url.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1]
  if (!imageUrl || !id) return undefined
  return { id, imageUrl: decode(imageUrl), caption: decode(description ?? ''), publishedAt: '', }
}

export function profileFromPosts(handle: string, posts: Post[]): Profile {
  return { handle, bio: '', posts: posts.slice(0, 3) }
}
