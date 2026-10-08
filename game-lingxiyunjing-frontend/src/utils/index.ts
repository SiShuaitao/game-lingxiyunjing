// 封面渐变：cover 已是 CSS gradient 字符串则直接返回，否则包成 linear-gradient
export function coverGradient(cover: string): string {
  if (!cover) return 'linear-gradient(135deg,#AEE3FF,#D6F0FF)'
  if (/gradient/i.test(cover)) return cover
  return `linear-gradient(135deg,#AEE3FF,${cover})`
}

// 难度主题色（马卡龙：高=樱粉，中=天蓝，低=薄荷）
export function difficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    高: '#FF9BC6',
    中: '#8FBBF2',
    低: '#9FE8C9'
  }
  return map[difficulty] || '#9AACCB'
}

// 定位中文名（后端已是中文，此处做容错映射）
export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    剑客: '剑客',
    辅助: '辅助',
    法师: '法师',
    射手: '射手',
    战士: '战士',
    刺客: '刺客'
  }
  return map[role] || role
}

// 资讯分类标签文案
export function newsCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    activity: '活动',
    notice: '公告',
    news: '资讯'
  }
  return map[category] || '资讯'
}

// 资讯分类颜色（马卡龙：公告天蓝、活动樱粉、资讯雾蓝）
export function newsCategoryColor(category: string): string {
  const map: Record<string, string> = {
    activity: '#F5A3C7',
    notice: '#5EB2EE',
    news: '#9AACCB'
  }
  return map[category] || '#9AACCB'
}

// 时间格式化：'2026-08-05' 或 '2026年08月05日'
export function formatDate(input?: string, style: 'cn' | 'iso' = 'cn'): string {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return style === 'cn' ? `${yyyy}年${mm}月${dd}日` : `${yyyy}-${mm}-${dd}`
}

// 时间格式化（带月日）
export function formatMonthDay(input?: string): { month: string; day: string; year: string } {
  if (!input) return { month: '--', day: '--', year: '----' }
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return { month: '--', day: '--', year: '----' }
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    day: String(d.getDate()).padStart(2, '0')
  }
}
