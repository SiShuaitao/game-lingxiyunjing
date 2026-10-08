import { get } from './http'
import type { GameMeta, NewsItem, Banner, Character, Sect, Feature } from '@/types'

// 获取灵汐云境元数据（唯一作品）
export function fetchGame(): Promise<GameMeta | null> {
  return get<GameMeta | null>('/api/game', null)
}

// 获取作品列表（兼容通用模式）
export function fetchGames(): Promise<GameMeta[]> {
  return get<GameMeta[]>('/api/games', [])
}

// 获取最新资讯
export function fetchLatestNews(limit = 6): Promise<NewsItem[]> {
  return get<NewsItem[]>(`/api/news?limit=${limit}`, [])
}

// 资讯详情
export function fetchNewsById(id: number | string): Promise<NewsItem | null> {
  return get<NewsItem | null>(`/api/news/${id}`, null)
}

// 获取首页 Banner
export function fetchBanners(): Promise<Banner[]> {
  return get<Banner[]>('/api/banners', [])
}

// 获取侠客列表
export function fetchCharacters(): Promise<Character[]> {
  return get<Character[]>('/api/characters', [])
}

// 获取门派列表
export function fetchSects(): Promise<Sect[]> {
  return get<Sect[]>('/api/sects', [])
}

// 获取玩法特色列表
export function fetchFeatures(): Promise<Feature[]> {
  return get<Feature[]>('/api/features', [])
}
