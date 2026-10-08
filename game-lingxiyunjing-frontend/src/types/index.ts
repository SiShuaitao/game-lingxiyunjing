// 游戏元数据
export interface GameMeta {
  id?: number
  gameId: string
  name: string
  subtitle?: string
  category: string
  tagline: string
  summary?: string
  description: string
  url: string
  cover: string
  /** 视觉风格主题：inkpaint 国风水墨 */
  style?: string
  featured?: number
  sort?: number
  status?: number
}

// 资讯
export interface NewsItem {
  id: number
  title: string
  summary: string
  content?: string
  category: 'news' | 'notice' | 'activity'
  coverImage?: string
  publishTime: string
  status?: number
}

// 首页轮播 Banner
export interface Banner {
  id: number
  title: string
  subtitle?: string
  cover: string
  link?: string
  sort?: number
  status?: number
}

// 侠客
export interface Character {
  id: number
  name: string
  title: string
  faction: string
  role: string
  difficulty: string
  description: string
  cover: string
  sort?: number
  status?: number
}

// 门派
export interface Sect {
  id: number
  name: string
  subtitle: string
  philosophy: string
  description: string
  cover: string
  sort?: number
  status?: number
}

// 玩法特色
export interface Feature {
  id: number
  title: string
  summary: string
  description: string
  icon: string
  sort?: number
  status?: number
}

// 后端统一响应封装
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}
