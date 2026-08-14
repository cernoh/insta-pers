import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { parseProfilePage, profileFromPosts } from './src/lib/profileScraper.ts'

const scraplingUrl = process.env.SCRAPLING_MCP_URL ?? 'http://127.0.0.1:8000/mcp'

async function scraplingProfile(handle: string): Promise<string> {
  const init = await fetch(scraplingUrl, {
    method: 'POST',
    headers: { Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'muse-fm', version: '0.1.0' } } }),
  })
  const sessionId = init.headers.get('mcp-session-id')
  const call = await fetch(scraplingUrl, {
    method: 'POST',
    headers: { Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json', ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'stealthy_fetch', arguments: { url: `https://www.instagram.com/${handle}/`, extraction_type: 'html', main_content_only: false, headless: true, network_idle: true, timeout: 60000, solve_cloudflare: true } } }),
  })
  const body = await call.text()
  const data = body.split('\n').find((line) => line.startsWith('data: '))?.slice(6) ?? body
  const result = JSON.parse(data) as { result?: { content?: Array<{ text?: string }> }; error?: { message?: string } }
  if (result.error) throw new Error(result.error.message ?? 'Scrapling request failed.')
  return result.result?.content?.map((item) => item.text ?? '').join('') ?? ''
}

function instagramScraper(): Plugin {
  return {
    name: 'instagram-scraper',
    configureServer(server) {
      server.middlewares.use('/api/instagram/profile', async (request, response) => {
        const handle = new URL(request.url ?? '/', 'http://localhost').searchParams.get('handle')?.replace(/^@/, '').trim()
        if (!handle || !/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
          response.statusCode = 400
          response.end(JSON.stringify({ error: 'Enter a valid Instagram handle.' }))
          return
        }
        try {
          const posts = parseProfilePage(await scraplingProfile(handle), handle)
          if (posts.length < 3) throw new Error('Instagram did not expose three public posts.')
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify(profileFromPosts(handle, posts)))
        } catch (error) {
          response.statusCode = 502
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Instagram profile unavailable.' }))
        }
      })
    },
  }
}

export default defineConfig({ plugins: [react(), instagramScraper()] })
