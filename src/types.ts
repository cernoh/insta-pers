export type Post = { id: string; imageUrl: string; caption: string; publishedAt: string; dominantColor?: string }
export type Profile = { handle: string; bio: string; posts: Post[] }
export type Mood = 'sunny' | 'dreamy' | 'cozy' | 'electric'
export type Song = { title: string; artist: string; mood: Mood; color: string; tags: string[] }
export type MatchResult = { colors: string[]; palette: string; mood: Mood; song: Song; profileSignals: string[]; reasons: string[] }
