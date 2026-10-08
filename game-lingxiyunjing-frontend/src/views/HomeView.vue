<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGame, fetchBanners, fetchFeatures, fetchCharacters, fetchSects, fetchLatestNews } from '@/api/portal'
import type { GameMeta, Banner, Feature, Character, Sect, NewsItem } from '@/types'
import { coverGradient, difficultyColor, newsCategoryLabel, newsCategoryColor, formatMonthDay } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()
const router = useRouter()

// 角色扩展档案字段（API 不提供时使用兜底）
interface CharacterExt extends Character {
  voice?: string
  quote?: string
  race?: string
}

const game = ref<GameMeta | null>(null)
const banners = ref<Banner[]>([])
const features = ref<Feature[]>([])
const characters = ref<CharacterExt[]>([])
const sects = ref<Sect[]>([])
const news = ref<NewsItem[]>([])
const loading = ref(true)

// ============ 兜底数据 ============
const fallbackCharacters: CharacterExt[] = [
  {
    id: 1, name: '拾时', title: '怀表兔', faction: '风铃镇', role: '向导',
    difficulty: '低', race: '兔灵', voice: '滴答',
    quote: '再不走，星光潮汐就要退啦。',
    description: '揣着一只星光怀表的灰耳兔，在云隙门口接引误闯此地的旅人。他总能算出下一次涨潮的时间，却总嫌别人走得太慢。',
    cover: 'linear-gradient(155deg,#EAF4FF 0%,#F0F8FF 45%,#FFF6FB 100%)'
  },
  {
    id: 2, name: '杳笑', title: '雾纹猫', faction: '倒生森林', role: '辅助',
    difficulty: '中', race: '雾猫', voice: '呼噜',
    quote: '我人走啦，笑还挂在树上呢。',
    description: '倒生森林里的雾纹猫，喜欢把自己隐身，只留下一个笑悬在半空。他知道森林里每条近路，但回答问题从来只说半句。',
    cover: 'linear-gradient(155deg,#F0F0FF 0%,#E8F4FF 45%,#F8F0FF 100%)'
  },
  {
    id: 3, name: '蒲宁', title: '菇露翁', faction: '蘑菇高地', role: '炼金',
    difficulty: '中', race: '菇人', voice: '闷雷',
    quote: '喝一口变大，再喝一口变小。',
    description: '蘑菇高地最年长的菇人，红伞菇帽下藏着一张圆脸。他用清晨的露水酿药水——一口高过塔尖，再一口又能躲进草丛。',
    cover: 'linear-gradient(155deg,#FFF0E8 0%,#FFF8E7 45%,#F0FFF4 100%)'
  },
  {
    id: 4, name: '红七', title: '纸牌逃兵', faction: '风铃镇', role: '战士',
    difficulty: '高', race: '纸灵', voice: '沙沙',
    quote: '我胸前印着柒，却不想替谁打仗。',
    description: '从乌有王的纸牌军团里逃出来的小兵，把纸折的长枪擦得很亮。他听见鼓声就发抖，可伙伴遇险时，总是第一个站出来。',
    cover: 'linear-gradient(155deg,#FFE8F0 0%,#FFF0F5 45%,#F0F0FF 100%)'
  },
  {
    id: 5, name: '月桂', title: '茶会主人', faction: '风铃镇', role: '辅助',
    difficulty: '低', race: '睡鼠族', voice: '呢喃',
    quote: '茶会永远不结束，杯子永远不空。',
    description: '在小镇花园主持一场永不散场的茶会，帽子上摞着三只茶杯。她说话慢吞吞，烤的松饼却能瞬间恢复力气，路过的旅人都要被她拉住喝一杯。',
    cover: 'linear-gradient(155deg,#F8F0E0 0%,#FFF0F5 45%,#E8F8F0 100%)'
  },
  {
    id: 6, name: '汐音', title: '守梦少女', faction: '云镜神殿', role: '法师',
    difficulty: '高', race: '梦灵', voice: '潮声',
    quote: '我在梦里等了很久，久到忘了自己的名字。',
    description: '云镜神殿最后的守梦人，为护住云境梦源陷入长眠。她沉睡在镜子深处，只有驱散乌有王的旅人，能听见她醒来时轻轻的一声叹息。',
    cover: 'linear-gradient(155deg,#E0E8FF 0%,#F0E8FF 45%,#E8F4FF 100%)'
  }
]

const fallbackSects: Sect[] = [
  {
    id: 1, name: '风铃镇', subtitle: '云海边的风铃小镇', philosophy: '铃声不停，小镇不散',
    description: '云海尽头的小镇，屋檐挂满铜铃，风一吹便此起彼伏。镇民守着茶会、杂货铺与热气球航线，是所有旅人歇脚的第一站。',
    cover: 'linear-gradient(150deg,#D6ECFF,#EAF4FF,#FFF6FB)'
  },
  {
    id: 2, name: '倒生森林', subtitle: '树根朝天的森林', philosophy: '路在脚下，也在头顶',
    description: '一片树根朝天、树冠朝下生长的森林，雾霭终年不散。近路常常藏在头顶，会笑的雾猫是唯一的向导。',
    cover: 'linear-gradient(150deg,#D8F5E0,#E8F4FF,#F0F8FF)'
  },
  {
    id: 3, name: '蘑菇高地', subtitle: '巨菇如塔的高地', philosophy: '大小之间，另有天地',
    description: '巨菇像塔一样林立的高地，露水会改变万物的尺寸。菇人们在伞盖之间架起吊桥，红伞菇帽下的炉火日夜不熄。',
    cover: 'linear-gradient(150deg,#FFE8D6,#FFF3D6,#F0FFF4)'
  },
  {
    id: 4, name: '云镜神殿', subtitle: '沉入梦底的神殿', philosophy: '镜子照见的，不只是自己',
    description: '云境梦源所在的神殿，如今被乌有王改成纸牌迷宫。无数房间藏在镜子之后，钥匙、机关与纸牌卫兵拦住了所有来者。',
    cover: 'linear-gradient(150deg,#E0E8FF,#F0E8FF,#FFE8F0)'
  }
]

const fallbackFeatures: Feature[] = [
  { id: 1, title: '云海漫游', summary: '四境相通 · 自由探索', description: '草原、小镇、森林与高地无缝相连。循着铃声走，或偏离开阔地——每条岔路、每道裂缝后都可能藏着东西。', icon: 'cloud', sort: 1 },
  { id: 2, title: '镜殿解谜', summary: '房间制迷宫机关', description: '云镜神殿由一间间密室组成：推动机关、寻找小钥匙、隔着栅栏规划路线，才能抵达被封死的梦源。', icon: 'maze', sort: 2 },
  { id: 3, title: '随身百宝', summary: '剑 · 回力镖 · 星弓 · 爆弹', description: '四种工具各有妙用：回力镖隔空取物、星弓远程先手、爆弹轰开裂缝。怎么组合，全看你自己。', icon: 'sword', sort: 3 },
  { id: 4, title: '风铃小镇', summary: '商店 · 茶会 · 路人闲话', description: '在杂货铺补给，在花园蹭一顿下午茶，听镇民闲聊。他们提到的每个传闻，多半都是真的。', icon: 'bell', sort: 4 },
  { id: 5, title: '心之成长', summary: '心心血量 · 碎片收集', description: '起初你只有三颗心。心之碎片散落在裂缝墙后、机关深处与宝箱之中，集齐四颗，便多一颗心。', icon: 'heart', sort: 5 },
  { id: 6, title: '彩蛋奇遇', summary: '炸墙 · 烧草 · 藏洞', description: '可疑的墙、可疑的草丛、可疑的水潭——云境奖励每一份好奇心，真正的宝贝从不放在大路上。', icon: 'star', sort: 6 }
]

// 玩法图标映射（关键词 → 童话表情）
const featureIconMap: Record<string, string> = {
  cloud: '☁️',
  maze: '🗝️',
  sword: '⚔️',
  bell: '🔔',
  heart: '💗',
  star: '✨'
}
function featureIcon(icon: string): string {
  return featureIconMap[icon] || icon || '✨'
}

const fallbackNews: NewsItem[] = [
  { id: 1, title: '云境大门 10 月 15 日开启', summary: '星光潮汐当夜涨至最高，预约旅人可领怀表兔头像框与三颗星币糖。', category: 'notice', publishTime: '2026-10-12', coverImage: 'linear-gradient(135deg,#AEDAF5,#D6ECFF)' },
  { id: 2, title: '云镜神殿前瞻：钥匙、机关与纸牌卫兵', summary: '镜子后面有什么？这篇带你提前看看梦源迷宫的房间规则。', category: 'news', publishTime: '2026-10-02', coverImage: 'linear-gradient(135deg,#C9B8F0,#E8F4FF)' },
  { id: 3, title: '「永不散场的下午茶」9 月 28 日开席', summary: '帮月桂收集方糖与莓果，兑换茶会帽、松饼背包与限定表情。', category: 'activity', publishTime: '2026-09-25', coverImage: 'linear-gradient(135deg,#F5B8D0,#FFE8C7)' },
  { id: 4, title: '风铃小镇导游图：今天也替你探好了路', summary: '杂货铺、茶会花园、热气球平台——一张图看懂小镇的全部好去处。', category: 'news', publishTime: '2026-09-15', coverImage: 'linear-gradient(135deg,#9FE8C9,#D6F0FF)' },
  { id: 5, title: '预约突破 100 万：全员加赠星光怀表', summary: '百万预约达成！开服后全员可领取一只会自己滴答走的星光怀表挂件。', category: 'notice', publishTime: '2026-09-05', coverImage: 'linear-gradient(135deg,#FFE3A3,#FFF3D6)' }
]

// ============ Hero ============
const heroBanners = ref<Banner[]>([])
const activeBannerIndex = ref(0)
let bannerTimer: ReturnType<typeof setInterval> | null = null

function rebuildHeroBanners() {
  if (banners.value.length > 0) {
    heroBanners.value = banners.value
    return
  }
  if (game.value) {
    heroBanners.value = [{
      id: 0,
      title: game.value.name,
      subtitle: game.value.tagline,
      cover: game.value.cover,
      link: '#features'
    }]
    return
  }
  heroBanners.value = [{
    id: 0,
    title: '灵汐云境',
    subtitle: '云海秘境 · 奇境漫游 · 治愈冒险',
    cover: 'linear-gradient(180deg,#AEE3FF 0%,#D6F0FF 50%,#FFF6FB 100%)',
    link: '#features'
  }]
}

function startBannerRotation() {
  stopBannerRotation()
  if (heroBanners.value.length <= 1) return
  bannerTimer = setInterval(() => {
    activeBannerIndex.value = (activeBannerIndex.value + 1) % heroBanners.value.length
  }, 7000)
}

function stopBannerRotation() {
  if (bannerTimer) { clearInterval(bannerTimer); bannerTimer = null }
}

function selectBanner(idx: number) {
  activeBannerIndex.value = idx
  startBannerRotation()
}

const activeBanner = computed<Banner | null>(() => heroBanners.value[activeBannerIndex.value] || null)

// ============ Hero 鼠标视差（云朵 / 热气球 / 飞鸟） ============
const heroRef = ref<HTMLElement | null>(null)

function onHeroMouseMove(e: MouseEvent) {
  const hero = heroRef.value
  if (!hero) return
  const rect = hero.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  hero.querySelectorAll<SVGGElement>('.parallax-cloud').forEach(el => {
    el.style.transform = `translate(${x * 24}px, ${y * 12}px)`
  })
  hero.querySelectorAll<SVGGElement>('.parallax-balloon').forEach(el => {
    el.style.transform = `translate(${x * 38}px, ${y * 18}px)`
  })
  hero.querySelectorAll<SVGGElement>('.parallax-bird').forEach(el => {
    el.style.transform = `translate(${x * 52}px, ${y * 24}px)`
  })
}

// ============ 角色轮播 ============
const activeCharIndex = ref(0)
let charTimer: ReturnType<typeof setInterval> | null = null
const charHovering = ref(false)

const activeChar = computed<CharacterExt | null>(() => {
  if (!characters.value.length) return null
  return characters.value[activeCharIndex.value % characters.value.length]
})

function selectChar(i: number) {
  if (!characters.value.length) return
  activeCharIndex.value = (i + characters.value.length) % characters.value.length
  restartCharRotation()
}
function nextChar() { selectChar(activeCharIndex.value + 1) }
function prevChar() { selectChar(activeCharIndex.value - 1) }

function startCharRotation() {
  stopCharRotation()
  if (characters.value.length <= 1) return
  charTimer = setInterval(() => {
    if (!charHovering.value) selectChar(activeCharIndex.value + 1)
  }, 6500)
}
function stopCharRotation() {
  if (charTimer) { clearInterval(charTimer); charTimer = null }
}
function restartCharRotation() {
  stopCharRotation()
  startCharRotation()
}

const charIndexLabel = computed(() => {
  const total = characters.value.length
  if (!total) return '00 / 00'
  return String(activeCharIndex.value + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')
})

// ============ 世界观 LORE ============
const activeSectIndex = ref(0)
const activeSect = computed<Sect | null>(() => sects.value[activeSectIndex.value] || null)
function selectSect(i: number) {
  if (!sects.value.length) return
  activeSectIndex.value = (i + sects.value.length) % sects.value.length
}
const sectOrdinal = ['一', '二', '三', '四', '五', '六']

// ============ 影像画廊 ============
interface GalleryItem { id: number; title: string; category: string; cover: string; desc: string }
const galleryItems: GalleryItem[] = [
  { id: 1, title: '云隙涨潮', category: '云境', cover: 'linear-gradient(150deg,#AEDAF5,#D6ECFF,#FFF6FB)', desc: '星光如潮涌过云隙，入口只在此时显现。' },
  { id: 2, title: '风铃镇全景', category: '小镇', cover: 'linear-gradient(150deg,#D6ECFF,#EAF4FF,#FFF0F5)', desc: '屋檐挂满铜铃的云海小镇。' },
  { id: 3, title: '倒生森林', category: '秘境', cover: 'linear-gradient(150deg,#D8F5E0,#E8F4FF,#F0F0FF)', desc: '树根朝天，路在头顶的森林。' },
  { id: 4, title: '蘑菇高地', category: '秘境', cover: 'linear-gradient(150deg,#FFE8D6,#FFF3D6,#F0FFF4)', desc: '巨菇如塔，露水改变大小。' },
  { id: 5, title: '云镜神殿', category: '神殿', cover: 'linear-gradient(150deg,#E0E8FF,#F0E8FF,#FFE8F0)', desc: '沉入梦底的镜子迷宫。' },
  { id: 6, title: '下午茶花园', category: '小镇', cover: 'linear-gradient(150deg,#FFF0DC,#FFE8F0,#E8F8F0)', desc: '一场永不散场的茶会。' },
  { id: 7, title: '星露温泉', category: '秘境', cover: 'linear-gradient(150deg,#C8ECF8,#E8F4FF,#F0F8FF)', desc: '泡一泡，心就会长回来。' },
  { id: 8, title: '热气球航线', category: '云境', cover: 'linear-gradient(150deg,#F5D6E8,#E0F0FF,#FFF6FB)', desc: '顺着风，去任何想去的地方。' }
]
const galleryCategories = ['全部', '云境', '小镇', '秘境', '神殿']
const galleryFilter = ref('全部')
const filteredGallery = computed(() => {
  if (galleryFilter.value === '全部') return galleryItems
  return galleryItems.filter(g => g.category === galleryFilter.value)
})
const lightboxId = ref<number | null>(null)
const lightboxItem = computed(() => galleryItems.find(g => g.id === lightboxId.value) || null)
function openLightbox(id: number) { lightboxId.value = id }
function closeLightbox() { lightboxId.value = null }

// ============ 玩法 GAMEPLAY ============
const activeFeatureIndex = ref(0)
const activeFeature = computed<Feature | null>(() => features.value[activeFeatureIndex.value] || null)
function selectFeature(i: number) {
  if (!features.value.length) return
  activeFeatureIndex.value = (i + features.value.length) % features.value.length
}
function nextFeature() { selectFeature(activeFeatureIndex.value + 1) }
function prevFeature() { selectFeature(activeFeatureIndex.value - 1) }

// ============ 数据加载 ============
async function loadAll() {
  const [g, b, f, c, s, n] = await Promise.all([
    fetchGame(),
    fetchBanners(),
    fetchFeatures(),
    fetchCharacters(),
    fetchSects(),
    fetchLatestNews(6)
  ])
  game.value = g
  banners.value = b
  features.value = f.length ? f : fallbackFeatures
  // API 角色按姓名富化扩展档案（种族/配音/金句），姓名匹配不上则按序号兜底
  characters.value = c.length
    ? c.map((apiC, i) => {
        const fb = fallbackCharacters.find(x => x.name === apiC.name) || fallbackCharacters[i]
        return fb ? { ...fb, ...apiC } : apiC
      })
    : fallbackCharacters
  sects.value = s.length ? s : fallbackSects
  news.value = n.length ? n : fallbackNews
  loading.value = false
  rebuildHeroBanners()
  requestAnimationFrame(() => {
    refreshReveal()
    startBannerRotation()
    startCharRotation()
  })
}

function goToNews(id: number) {
  router.push(`/news/${id}`)
}

onMounted(() => {
  loadAll()
  heroRef.value?.addEventListener('mousemove', onHeroMouseMove)
})

onBeforeUnmount(() => {
  stopBannerRotation()
  stopCharRotation()
  heroRef.value?.removeEventListener('mousemove', onHeroMouseMove)
})

// ============ 马卡龙童话渐变循环 ============
// 用于 hero 兜底背景与卡片封面，替代 DB cover（DB cover 可能与主题冲突）
const themeCovers = [
  'linear-gradient(150deg,#AEE3FF,#D6F0FF,#FFF6FB)',
  'linear-gradient(150deg,#F0D9FF,#E8F0FF,#FFF0F5)',
  'linear-gradient(150deg,#D0F5E5,#E0F0FF,#FFF8E7)',
  'linear-gradient(150deg,#FFE8F0,#E8F4FF,#F0FFF4)',
  'linear-gradient(150deg,#E0E8FF,#F0E8FF,#FFF0F8)',
  'linear-gradient(150deg,#C8ECF8,#E8F8F0,#FFF8E0)'
]
function themeCover(i: number): string {
  const len = themeCovers.length
  if (!len) return 'linear-gradient(150deg,#AEE3FF,#D6F0FF,#FFF6FB)'
  const idx = ((i % len) + len) % len
  return themeCovers[idx]
}
</script>

<template>
  <div class="home">
    <!-- ============ 1. HERO 蓝天白云城堡首屏 ============ -->
    <section class="hero" ref="heroRef">
      <div class="hero-bg" :style="{ background: themeCover(activeBannerIndex) }">
        <!-- 蓝天白云城堡全景 -->
        <svg class="hero-sky" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#AEE3FF"/>
              <stop offset="50%" stop-color="#D6F0FF"/>
              <stop offset="100%" stop-color="#FFF6FB"/>
            </linearGradient>
            <linearGradient id="castlegrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#C9B8F0"/>
              <stop offset="100%" stop-color="#FFB7D1"/>
            </linearGradient>
          </defs>

          <!-- 1. 天空底 -->
          <rect x="0" y="0" width="1440" height="900" fill="url(#skygrad)"/>

          <!-- 2. 太阳与光晕 -->
          <circle cx="1200" cy="120" r="112" fill="#FFE3A3" opacity="0.25"/>
          <circle cx="1200" cy="120" r="70" fill="#FFE3A3" opacity="0.85"/>

          <!-- 3. 白云（缓慢飘动 + 鼠标视差） -->
          <g class="parallax-cloud">
            <g>
              <animateTransform attributeName="transform" type="translate" values="250 180; 310 180; 250 180" dur="25s" repeatCount="indefinite"/>
              <g fill="#FFFFFF" opacity="0.92">
                <ellipse cx="0" cy="0" rx="58" ry="26"/>
                <ellipse cx="-42" cy="-8" rx="36" ry="20"/>
                <ellipse cx="40" cy="-12" rx="42" ry="24"/>
                <ellipse cx="2" cy="-22" rx="34" ry="20"/>
              </g>
            </g>
          </g>
          <g class="parallax-cloud">
            <g>
              <animateTransform attributeName="transform" type="translate" values="760 110; 700 110; 760 110" dur="35s" repeatCount="indefinite"/>
              <g fill="#FFFFFF" opacity="0.92" transform="scale(0.8)">
                <ellipse cx="0" cy="0" rx="58" ry="26"/>
                <ellipse cx="-42" cy="-8" rx="36" ry="20"/>
                <ellipse cx="40" cy="-12" rx="42" ry="24"/>
                <ellipse cx="2" cy="-22" rx="34" ry="20"/>
              </g>
            </g>
          </g>
          <g class="parallax-cloud">
            <g>
              <animateTransform attributeName="transform" type="translate" values="1140 270; 1200 270; 1140 270" dur="30s" repeatCount="indefinite"/>
              <g fill="#FFFFFF" opacity="0.92" transform="scale(1.1)">
                <ellipse cx="0" cy="0" rx="58" ry="26"/>
                <ellipse cx="-42" cy="-8" rx="36" ry="20"/>
                <ellipse cx="40" cy="-12" rx="42" ry="24"/>
                <ellipse cx="2" cy="-22" rx="34" ry="20"/>
              </g>
            </g>
          </g>

          <!-- 4. 飞鸟（V 形，横穿天空 + 鼠标视差） -->
          <g class="parallax-bird">
            <g stroke="#6B7C9C" stroke-width="2" fill="none" stroke-linecap="round">
              <path d="M0 0 Q7 -7 14 0 Q21 -7 28 0">
                <animateTransform attributeName="transform" type="translate" values="-60 210; 1500 170" dur="28s" repeatCount="indefinite"/>
              </path>
              <path d="M0 0 Q6 -6 12 0 Q18 -6 24 0">
                <animateTransform attributeName="transform" type="translate" values="-120 300; 1500 260" dur="34s" repeatCount="indefinite"/>
              </path>
              <path d="M0 0 Q7 -7 14 0 Q21 -7 28 0">
                <animateTransform attributeName="transform" type="translate" values="-200 150; 1500 120" dur="24s" repeatCount="indefinite"/>
              </path>
            </g>
          </g>

          <!-- 5. 梦幻城堡剪影 -->
          <g>
            <path
              d="M560 720 L560 560 L575 560 L590 505 L605 560 L620 560 L620 620 L680 620 L680 480 L700 480 L720 405 L740 480 L760 480 L760 620 L820 620 L820 560 L835 560 L850 505 L865 560 L880 560 L880 720 Z"
              fill="url(#castlegrad)" opacity="0.95"/>
            <!-- 门窗 -->
            <path d="M700 720 L700 672 Q720 652 740 672 L740 720 Z" fill="#FFF6FB" opacity="0.55"/>
            <circle cx="720" cy="540" r="9" fill="#FFF6FB" opacity="0.6"/>
            <circle cx="590" cy="605" r="6" fill="#FFF6FB" opacity="0.6"/>
            <circle cx="850" cy="605" r="6" fill="#FFF6FB" opacity="0.6"/>
            <!-- 旗帜 -->
            <path d="M720 405 L720 368" stroke="#C9B8F0" stroke-width="3" stroke-linecap="round"/>
            <path d="M720 368 L752 377 L720 386 Z" fill="#FF9BC6"/>
            <path d="M590 505 L590 482" stroke="#C9B8F0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M590 482 L612 489 L590 496 Z" fill="#7EC8F7"/>
            <path d="M850 505 L850 482" stroke="#C9B8F0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M850 482 L872 489 L850 496 Z" fill="#7EC8F7"/>
          </g>

          <!-- 6. 热气球（上下浮动 + 鼠标视差） -->
          <g class="parallax-balloon">
            <g>
              <animateTransform attributeName="transform" type="translate" values="190 350; 190 335; 190 350" dur="6s" repeatCount="indefinite"/>
              <ellipse cx="0" cy="0" rx="34" ry="42" fill="#FF9BC6"/>
              <ellipse cx="-11" cy="-14" rx="10" ry="16" fill="#FFFFFF" opacity="0.35"/>
              <path d="M-18 32 L-8 58 M18 32 L8 58" stroke="#9AACCB" stroke-width="2" fill="none"/>
              <rect x="-11" y="58" width="22" height="15" rx="4" fill="#C9B8F0"/>
            </g>
          </g>
          <g class="parallax-balloon">
            <g>
              <animateTransform attributeName="transform" type="translate" values="1250 330; 1250 315; 1250 330" dur="8s" repeatCount="indefinite"/>
              <ellipse cx="0" cy="0" rx="30" ry="38" fill="#9FE8C9"/>
              <ellipse cx="-10" cy="-12" rx="9" ry="14" fill="#FFFFFF" opacity="0.35"/>
              <path d="M-16 29 L-7 52 M16 29 L7 52" stroke="#9AACCB" stroke-width="2" fill="none"/>
              <rect x="-10" y="52" width="20" height="13" rx="4" fill="#FFB7D1"/>
            </g>
          </g>

          <!-- 7. 前景草地 / 花海 -->
          <path d="M0 780 Q240 742 480 772 T960 766 T1440 776 L1440 900 L0 900 Z" fill="#9FE8C9" opacity="0.35"/>
          <path d="M0 832 Q300 796 620 822 T1440 816 L1440 900 L0 900 Z" fill="#FFB7D1" opacity="0.25"/>
        </svg>
      </div>

      <!-- 柔光徽记 -->
      <div class="hero-sigil" aria-hidden="true">
        <span class="sigil-glyph">✦</span>
      </div>

      <div class="hero-content">
        <transition name="banner-fade" mode="out-in">
          <div :key="activeBannerIndex" class="hero-text">
            <p class="hero-eyebrow">LING XI · 灵汐云境</p>
            <h1 class="hero-title">{{ activeBanner?.title || '灵汐云境' }}</h1>
            <p class="hero-en">LINGXI YUNJING</p>
            <p class="hero-slogan">{{ activeBanner?.subtitle || '踏入云端童话，在灵汐云境与星光共舞' }}</p>
            <div class="hero-actions">
              <router-link to="/play" class="btn btn-primary">
                <span>开启冒险</span>
                <span class="arrow">→</span>
              </router-link>
              <a class="btn btn-ghost" href="#gallery">观看预告</a>
            </div>
          </div>
        </transition>

        <div v-if="heroBanners.length > 1" class="hero-dots">
          <button
            v-for="(b, i) in heroBanners"
            :key="b.id"
            class="dot"
            :class="{ active: i === activeBannerIndex }"
            @click="selectBanner(i)"
            :aria-label="`切换至 ${b.title}`"
          ></button>
        </div>
      </div>

      <a href="#characters" class="hero-scroll" aria-label="向下滚动">
        <span class="hero-scroll-dot"></span>
      </a>

      <div class="hero-side-label" aria-hidden="true">
        <span>FAIRY TALE</span>
        <span class="hero-side-line"></span>
        <span>01</span>
      </div>
    </section>

    <!-- ============ 2. CHARACTERS 云境伙伴 ============ -->
    <section id="characters" class="chapter characters-chapter">
      <div class="chapter-mark" aria-hidden="true">
        <span class="mark-no">02</span>
        <span class="mark-line"></span>
        <span class="mark-label">CHARACTERS</span>
        <span class="mark-cn">邂逅云境伙伴</span>
      </div>

      <div
        v-if="activeChar"
        class="char-stage"
        @mouseenter="charHovering = true"
        @mouseleave="charHovering = false"
      >
        <button class="char-arrow char-prev" @click="prevChar" aria-label="上一伙伴">‹</button>
        <button class="char-arrow char-next" @click="nextChar" aria-label="下一伙伴">›</button>

        <transition name="char-fade" mode="out-in">
          <div :key="activeChar.id" class="char-inner">
            <!-- 立绘区：马卡龙渐变 + 悬浮动效 -->
            <div class="char-portrait-wrap">
              <div class="char-portrait" :style="{ background: themeCover(activeCharIndex) }">
                <div class="char-portrait-bokeh" aria-hidden="true">
                  <span class="cp-bokeh cpb-1"></span>
                  <span class="cp-bokeh cpb-2"></span>
                </div>
                <svg class="char-deco" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <circle cx="200" cy="220" r="150" fill="none" stroke="#FF9BC6" stroke-opacity="0.3" stroke-width="1"/>
                  <circle cx="200" cy="220" r="210" fill="none" stroke="#7EC8F7" stroke-opacity="0.2" stroke-width="1"/>
                  <ellipse cx="200" cy="540" rx="190" ry="36" fill="rgba(58,74,102,0.08)"/>
                </svg>
                <div class="char-portrait-mist" aria-hidden="true"></div>
                <span class="char-difficulty" :style="{ color: difficultyColor(activeChar.difficulty), borderColor: difficultyColor(activeChar.difficulty) }">{{ activeChar.difficulty }}</span>
                <div class="char-name-overlay">
                  <span class="char-name-cn">{{ activeChar.name }}</span>
                  <span class="char-name-title">{{ activeChar.title }}</span>
                </div>
                <span class="char-big-num">{{ String(activeCharIndex + 1).padStart(2, '0') }}</span>
              </div>
            </div>

            <!-- 档案区 -->
            <div class="char-dossier">
              <p class="char-dossier-kicker">CHARACTER FILE</p>
              <h3 class="char-dossier-name">{{ activeChar.name }}</h3>
              <p class="char-dossier-quote">「{{ activeChar.quote || '愿星光与你同在。' }}」</p>

              <dl class="char-dossier-meta">
                <div><dt>阵营</dt><dd>{{ activeChar.faction }}</dd></div>
                <div><dt>定位</dt><dd>{{ activeChar.role }}</dd></div>
                <div><dt>种族</dt><dd>{{ activeChar.race || '人族' }}</dd></div>
                <div><dt>配音</dt><dd>{{ activeChar.voice || '——' }}</dd></div>
                <div><dt>称号</dt><dd>{{ activeChar.title }}</dd></div>
                <div><dt>难度</dt><dd :style="{ color: difficultyColor(activeChar.difficulty) }">{{ activeChar.difficulty }}</dd></div>
              </dl>

              <p class="char-dossier-story">{{ activeChar.description }}</p>

              <div class="char-dossier-foot">
                <router-link to="/characters" class="dossier-link">查看全部伙伴 →</router-link>
              </div>
            </div>
          </div>
        </transition>

        <!-- 编号指示器 -->
        <div class="char-indicator">
          <span class="char-ind-current">{{ String(activeCharIndex + 1).padStart(2, '0') }}</span>
          <span class="char-ind-bar"><span class="char-ind-progress" :style="{ width: (characters.length ? ((activeCharIndex + 1) / characters.length * 100) : 0) + '%' }"></span></span>
          <span class="char-ind-total">{{ String(characters.length).padStart(2, '0') }}</span>
        </div>
        <div class="char-thumbs">
          <button
            v-for="(c, i) in characters"
            :key="c.id"
            class="char-thumb"
            :class="{ active: i === activeCharIndex }"
            @click="selectChar(i)"
            :aria-label="`切换至 ${c.name}`"
          >
            <span class="char-thumb-no">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="char-thumb-name">{{ c.name }}</span>
          </button>
        </div>
        <p class="char-indicator-label">{{ charIndexLabel }}</p>
      </div>

      <div v-else-if="loading" class="loading-row">
        <span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span>
      </div>
    </section>

    <!-- ============ 3. LORE 魔法秘境 ============ -->
    <section id="lore" class="chapter lore-chapter">
      <div class="chapter-mark chapter-mark-center" aria-hidden="true">
        <span class="mark-no">03</span>
        <span class="mark-line"></span>
        <span class="mark-label">LORE</span>
        <span class="mark-cn">探索魔法秘境</span>
      </div>

      <div class="lore-wrap reveal">
        <nav class="lore-tabs">
          <button
            v-for="(s, i) in sects"
            :key="s.id"
            class="lore-tab"
            :class="{ active: i === activeSectIndex }"
            @click="selectSect(i)"
          >
            <span class="lore-tab-no">第{{ sectOrdinal[i] || i + 1 }}境</span>
            <span class="lore-tab-name">{{ s.name }}</span>
          </button>
        </nav>

        <transition name="lore-fade" mode="out-in">
          <div v-if="activeSect" :key="activeSect.id" class="lore-detail">
            <div class="lore-cover" :style="{ background: themeCover(activeSectIndex) }">
              <div class="lore-cover-bokeh" aria-hidden="true">
                <span class="lc-bokeh lcb-1"></span>
                <span class="lc-bokeh lcb-2"></span>
              </div>
              <div class="lore-cover-mist" aria-hidden="true"></div>
              <span class="lore-cover-sub">{{ activeSect.subtitle }}</span>
              <span class="lore-cover-no">{{ String(activeSectIndex + 1).padStart(2, '0') }} / {{ String(sects.length).padStart(2, '0') }}</span>
            </div>
            <div class="lore-text">
              <p class="lore-philosophy">「{{ activeSect.philosophy }}」</p>
              <h3 class="lore-name">{{ activeSect.name }}</h3>
              <p class="lore-desc">{{ activeSect.description }}</p>
              <router-link to="/sects" class="lore-link">遍览魔法秘境 →</router-link>
            </div>
          </div>
        </transition>
      </div>
    </section>

    <!-- ============ 4. GALLERY 云境画廊 ============ -->
    <section id="gallery" class="chapter gallery-chapter">
      <div class="chapter-mark chapter-mark-center" aria-hidden="true">
        <span class="mark-no">04</span>
        <span class="mark-line"></span>
        <span class="mark-label">GALLERY</span>
        <span class="mark-cn">云境画廊</span>
      </div>

      <div class="gallery-controls reveal">
        <button
          v-for="cat in galleryCategories"
          :key="cat"
          class="gallery-cat"
          :class="{ active: galleryFilter === cat }"
          @click="galleryFilter = cat"
        >{{ cat }}</button>
      </div>

      <div class="gallery-grid reveal">
        <button
          v-for="g in filteredGallery"
          :key="g.id"
          class="gallery-card"
          :style="{ background: themeCover(g.id) }"
          @click="openLightbox(g.id)"
        >
          <span class="gallery-card-mask"></span>
          <span class="gallery-card-cat">{{ g.category }}</span>
          <span class="gallery-card-body">
            <span class="gallery-card-title">{{ g.title }}</span>
            <span class="gallery-card-desc">{{ g.desc }}</span>
          </span>
        </button>
      </div>

      <transition name="lightbox">
        <div v-if="lightboxItem" class="lightbox" @click="closeLightbox">
          <div class="lightbox-inner" :style="{ background: themeCover(lightboxId || 0) }" @click.stop>
            <span class="lightbox-cat">{{ lightboxItem.category }}</span>
            <div class="lightbox-text">
              <h4>{{ lightboxItem.title }}</h4>
              <p>{{ lightboxItem.desc }}</p>
            </div>
            <button class="lightbox-close" @click="closeLightbox" aria-label="关闭">×</button>
          </div>
        </div>
      </transition>
    </section>

    <!-- ============ 5. GAMEPLAY 梦幻玩法 ============ -->
    <section id="features" class="chapter gameplay-chapter">
      <div class="chapter-mark chapter-mark-center" aria-hidden="true">
        <span class="mark-no">05</span>
        <span class="mark-line"></span>
        <span class="mark-label">GAMEPLAY</span>
        <span class="mark-cn">梦幻玩法</span>
      </div>

      <div v-if="activeFeature" class="gameplay-wrap reveal">
        <div class="gameplay-tabs">
          <button
            v-for="(f, i) in features"
            :key="f.id"
            class="gameplay-tab"
            :class="{ active: i === activeFeatureIndex }"
            @click="selectFeature(i)"
          >
            <span class="gameplay-tab-no">0{{ i + 1 }}</span>
            <span class="gameplay-tab-name">{{ f.title }}</span>
          </button>
        </div>

        <transition name="gameplay-fade" mode="out-in">
          <div :key="activeFeature.id" class="gameplay-detail">
            <div class="gameplay-visual" :style="{ background: themeCover(activeFeatureIndex) }">
              <div class="gameplay-visual-bokeh" aria-hidden="true">
                <span class="gv-bokeh gvb-1"></span>
                <span class="gv-bokeh gvb-2"></span>
              </div>
              <div class="gameplay-visual-mist" aria-hidden="true"></div>
              <span class="gameplay-visual-icon">{{ featureIcon(activeFeature.icon) }}</span>
              <span class="gameplay-visual-no">0{{ activeFeatureIndex + 1 }}</span>
            </div>
            <div class="gameplay-text">
              <p class="gameplay-summary">{{ activeFeature.summary }}</p>
              <h3 class="gameplay-title">{{ activeFeature.title }}</h3>
              <p class="gameplay-desc">{{ activeFeature.description }}</p>
              <div class="gameplay-nav">
                <button class="btn btn-ghost btn-sm" @click="prevFeature">‹ 上一个</button>
                <span class="gameplay-nav-no">{{ String(activeFeatureIndex + 1).padStart(2, '0') }} / {{ String(features.length).padStart(2, '0') }}</span>
                <button class="btn btn-ghost btn-sm" @click="nextFeature">下一个 ›</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </section>

    <!-- ============ 6. NOTICE 最新资讯 ============ -->
    <section id="news" class="chapter notice-chapter">
      <div class="chapter-mark chapter-mark-center" aria-hidden="true">
        <span class="mark-no">06</span>
        <span class="mark-line"></span>
        <span class="mark-label">NOTICE</span>
        <span class="mark-cn">最新资讯</span>
      </div>

      <div class="notice-list reveal">
        <article
          v-for="item in news"
          :key="item.id"
          class="notice-row"
          @click="goToNews(item.id)"
        >
          <div class="notice-date">
            <span class="notice-day">{{ formatMonthDay(item.publishTime).day }}</span>
            <span class="notice-my">{{ formatMonthDay(item.publishTime).month }}月 · {{ formatMonthDay(item.publishTime).year }}</span>
          </div>
          <div class="notice-body">
            <span
              class="notice-tag"
              :style="{ background: newsCategoryColor(item.category), borderColor: newsCategoryColor(item.category) }"
            >{{ newsCategoryLabel(item.category) }}</span>
            <h3 class="notice-title">{{ item.title }}</h3>
            <p class="notice-summary">{{ item.summary }}</p>
          </div>
          <span class="notice-arrow">→</span>
        </article>
      </div>

      <div class="notice-more">
        <router-link to="/news" class="btn btn-ghost">查看全部资讯 →</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}

/* ============ 通用章节标记 ============ */
.chapter {
  position: relative;
  padding: 150px 0;
  overflow: hidden;
}

.chapter-mark {
  position: relative;
  max-width: var(--container);
  margin: 0 auto 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.chapter-mark-center {
  flex-direction: column;
  text-align: center;
  gap: 14px;
}

.mark-no {
  font-size: 12px;
  letter-spacing: 5px;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

.mark-line {
  width: 56px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.7;
}

.chapter-mark-center .mark-line {
  width: 96px;
}

.mark-label {
  font-size: 11px;
  letter-spacing: 7px;
  color: var(--text-dim);
  text-transform: uppercase;
  font-family: var(--font-serif);
}

.mark-cn {
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 300;
  letter-spacing: 12px;
  color: var(--text);
}

/* ============ 1. HERO ============ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(180deg, #AEE3FF 0%, #D6F0FF 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  transition: background 1.6s var(--ease);
}

/* 蓝天白云城堡全景 */
.hero-sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hero-sigil {
  position: absolute;
  left: 44px;
  bottom: 52px;
  z-index: 2;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(6px);
  box-shadow: 0 0 30px rgba(126, 200, 247, 0.35), inset 0 0 18px rgba(255, 183, 209, 0.25);
  transform: rotate(-3deg);
}

.sigil-glyph {
  font-size: 22px;
  color: var(--accent);
  line-height: 1;
  text-shadow: 0 0 12px rgba(126, 200, 247, 0.6);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 0 24px;
  width: 100%;
  max-width: 940px;
}

.hero-text {
  animation: heroIn 1.5s var(--ease);
}

@keyframes heroIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-eyebrow {
  font-size: 11px;
  letter-spacing: 10px;
  color: var(--accent);
  margin-bottom: 30px;
  text-transform: uppercase;
  font-family: var(--font-serif);
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.8);
}

.hero-title {
  font-size: clamp(54px, 10vw, 128px);
  font-weight: 300;
  letter-spacing: 18px;
  line-height: 1.1;
  color: var(--text);
  margin-bottom: 16px;
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.8);
}

.hero-en {
  font-size: clamp(11px, 1.3vw, 14px);
  letter-spacing: 12px;
  color: var(--text-muted);
  margin-bottom: 30px;
  font-family: var(--font-serif);
  font-style: italic;
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.7);
}

.hero-slogan {
  font-size: clamp(14px, 1.5vw, 18px);
  font-weight: 300;
  color: var(--text-muted);
  letter-spacing: 6px;
  line-height: 2.1;
  max-width: 600px;
  margin: 0 auto 46px;
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.7);
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-actions .arrow {
  transition: transform 0.3s ease;
}

.hero-actions .btn-primary:hover .arrow {
  transform: translateX(4px);
}

.hero-dots {
  position: relative;
  z-index: 1;
  margin-top: 52px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dot {
  width: 28px;
  height: 3px;
  background: rgba(58, 74, 102, 0.18);
  border-radius: 2px;
  transition: var(--transition);
}

.dot.active {
  background: var(--accent);
  width: 46px;
  box-shadow: 0 0 12px rgba(94, 178, 238, 0.55);
}

.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 0.75s var(--ease), transform 0.75s var(--ease);
}

.banner-fade-enter-from { opacity: 0; transform: translateY(14px); }
.banner-fade-leave-to { opacity: 0; transform: translateY(-14px); }

.hero-scroll {
  position: absolute;
  bottom: 40px;
  right: 44px;
  z-index: 1;
  width: 24px;
  height: 40px;
  border: 1px solid rgba(58, 74, 102, 0.28);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
}

.hero-scroll-dot {
  width: 3px;
  height: 8px;
  background: var(--accent);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(94, 178, 238, 0.7);
  animation: scrollDot 1.8s ease-in-out infinite;
}

@keyframes scrollDot {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(14px); opacity: 0; }
}

.hero-side-label {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: left center;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  letter-spacing: 5px;
  color: var(--text-muted);
  z-index: 2;
  font-family: var(--font-serif);
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.7);
}

.hero-side-line {
  width: 48px;
  height: 1px;
  background: var(--text-dim);
}

/* ============ 2. CHARACTERS ============ */
.characters-chapter {
  background: #FFFFFF;
}

.char-stage {
  position: relative;
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
}

.char-arrow {
  position: absolute;
  top: 38%;
  transform: translateY(-50%);
  z-index: 5;
  width: 52px;
  height: 52px;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  color: var(--text-muted);
  font-size: 28px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.char-arrow:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 24px rgba(126, 200, 247, 0.35);
}

.char-prev { left: -10px; }
.char-next { right: -10px; }

.char-inner {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 48px;
  align-items: stretch;
}

.char-fade-enter-active,
.char-fade-leave-active {
  transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
}

.char-fade-enter-from { opacity: 0; transform: translateX(24px); }
.char-fade-leave-to { opacity: 0; transform: translateX(-24px); }

/* 立绘悬浮容器 */
.char-portrait-wrap {
  position: relative;
  animation: portraitDrift 6s ease-in-out infinite;
}

@keyframes portraitDrift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.char-portrait {
  position: relative;
  height: 560px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.5s var(--ease);
}

.char-portrait-wrap:hover .char-portrait {
  box-shadow: var(--shadow-hover);
}

.char-portrait-bokeh,
.lore-cover-bokeh,
.gameplay-visual-bokeh {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cp-bokeh,
.lc-bokeh,
.gv-bokeh {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
}

.cpb-1, .lcb-1, .gvb-1 {
  top: 16%;
  left: 18%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 183, 209, 0.38), transparent 65%);
  animation: bokehBreath 10s ease-in-out infinite;
}

.cpb-2, .lcb-2, .gvb-2 {
  bottom: 14%;
  right: 14%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(126, 200, 247, 0.32), transparent 65%);
  animation: bokehBreath 12s ease-in-out infinite 2s;
}

@keyframes bokehBreath {
  0%, 100% { transform: scale(0.82); opacity: 0.4; }
  50% { transform: scale(1.14); opacity: 0.85; }
}

.char-deco {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.char-portrait-mist,
.lore-cover-mist,
.gameplay-visual-mist {
  position: absolute;
  top: 50%;
  left: -10%;
  right: -10%;
  height: 80px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  filter: blur(12px);
  animation: coverMistDrift 13s ease-in-out infinite;
}

@keyframes coverMistDrift {
  0%, 100% { transform: translateX(-26px); opacity: 0.35; }
  50% { transform: translateX(26px); opacity: 0.85; }
}

.char-difficulty {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  padding: 5px 12px;
  font-size: 11px;
  letter-spacing: 1px;
  border: 1px solid;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
}

.char-name-overlay {
  position: absolute;
  bottom: 26px;
  left: 26px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.char-name-cn {
  font-size: 40px;
  font-weight: 300;
  letter-spacing: 10px;
  color: var(--text);
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.8);
  line-height: 1;
}

.char-name-title {
  font-size: 13px;
  letter-spacing: 5px;
  color: var(--accent);
  margin-top: 12px;
  font-family: var(--font-serif);
  font-style: italic;
}

.char-big-num {
  position: absolute;
  top: 14px;
  right: 22px;
  z-index: 2;
  font-size: 86px;
  font-weight: 300;
  line-height: 1;
  color: rgba(58, 74, 102, 0.08);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

.char-dossier {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 42px 38px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(6px);
}

.char-dossier-kicker {
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--accent);
  margin-bottom: 18px;
  font-family: var(--font-serif);
}

.char-dossier-name {
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 8px;
  color: var(--text);
  margin-bottom: 14px;
}

.char-dossier-quote {
  font-size: 15px;
  font-weight: 300;
  letter-spacing: 2px;
  color: var(--silver);
  line-height: 1.9;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--hairline);
}

.char-dossier-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  margin-bottom: 24px;
}

.char-dossier-meta > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.char-dossier-meta dt {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-dim);
}

.char-dossier-meta dd {
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--text);
}

.char-dossier-story {
  font-size: 13px;
  font-weight: 300;
  color: var(--text-muted);
  line-height: 2.2;
  flex: 1;
}

.char-dossier-foot {
  margin-top: 24px;
}

.dossier-link {
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--accent);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--accent);
  transition: transform 0.3s ease, color 0.3s ease;
}

.dossier-link:hover {
  color: var(--accent-hover);
  transform: translateX(6px);
}

.char-indicator {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 36px;
  max-width: 360px;
}

.char-ind-current,
.char-ind-total {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

.char-ind-current {
  color: var(--accent);
}

.char-ind-bar {
  flex: 1;
  height: 2px;
  background: var(--border);
  border-radius: 2px;
  position: relative;
}

.char-ind-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #7EC8F7, #FFB7D1);
  box-shadow: 0 0 8px rgba(126, 200, 247, 0.5);
  transition: width 0.55s var(--ease);
}

.char-thumbs {
  position: absolute;
  right: 24px;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 160px;
}

.char-thumb {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  text-align: left;
}

.char-thumb:hover {
  border-color: var(--border-strong);
  background: rgba(126, 200, 247, 0.08);
}

.char-thumb.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.char-thumb-no {
  font-size: 11px;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

.char-thumb.active .char-thumb-no {
  color: var(--accent);
}

.char-thumb-name {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

.char-thumb.active .char-thumb-name {
  color: var(--text);
}

.char-indicator-label {
  display: none;
}

/* ============ 3. LORE ============ */
.lore-chapter {
  background: #F0F8FF;
}

.lore-wrap {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
  align-items: stretch;
}

.lore-tabs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 1px solid var(--hairline);
}

.lore-tab {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 22px;
  border-left: 2px solid transparent;
  text-align: left;
  transition: var(--transition);
}

.lore-tab:hover {
  background: rgba(126, 200, 247, 0.08);
}

.lore-tab.active {
  border-left-color: var(--accent);
  background: var(--accent-soft);
}

.lore-tab-no {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-dim);
  font-family: var(--font-serif);
}

.lore-tab.active .lore-tab-no {
  color: var(--accent);
}

.lore-tab-name {
  font-size: 17px;
  font-weight: 300;
  letter-spacing: 4px;
  color: var(--text-muted);
}

.lore-tab.active .lore-tab-name {
  color: var(--text);
}

.lore-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
  min-height: 420px;
}

.lore-fade-enter-active,
.lore-fade-leave-active {
  transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
}

.lore-fade-enter-from { opacity: 0; transform: translateY(16px); }
.lore-fade-leave-to { opacity: 0; transform: translateY(-16px); }

.lore-cover {
  position: relative;
  height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}

.lore-cover-sub {
  position: absolute;
  top: 22px;
  left: 24px;
  z-index: 2;
  padding: 6px 14px;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.lore-cover-no {
  position: absolute;
  bottom: 22px;
  right: 24px;
  z-index: 2;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.7);
}

.lore-text {
  display: flex;
  flex-direction: column;
}

.lore-philosophy {
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 4px;
  color: var(--accent);
  margin-bottom: 18px;
  line-height: 1.7;
}

.lore-name {
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 300;
  letter-spacing: 10px;
  margin-bottom: 22px;
  color: var(--text);
}

.lore-desc {
  font-size: 14px;
  font-weight: 300;
  color: var(--text-muted);
  line-height: 2.2;
  margin-bottom: 28px;
}

.lore-link {
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--accent);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--accent);
  transition: transform 0.3s ease, color 0.3s ease;
}

.lore-link:hover {
  color: var(--accent-hover);
  transform: translateX(6px);
}

/* ============ 4. GALLERY ============ */
.gallery-chapter {
  background: #FFFFFF;
}

.gallery-controls {
  max-width: var(--container);
  margin: 0 auto 40px;
  padding: 0 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.gallery-cat {
  padding: 8px 22px;
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 3px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  transition: var(--transition);
}

.gallery-cat:hover {
  color: var(--accent);
  border-color: var(--border-strong);
}

.gallery-cat.active {
  color: var(--ink);
  background: linear-gradient(135deg, #7EC8F7, #FFB7D1);
  border-color: transparent;
  font-weight: 400;
  box-shadow: 0 8px 20px rgba(126, 200, 247, 0.35);
}

.gallery-grid {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.gallery-card {
  position: relative;
  height: 240px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  text-align: left;
  box-shadow: var(--shadow-card);
  transition: transform 0.55s var(--ease), box-shadow 0.55s var(--ease), border-color 0.55s var(--ease);
}

.gallery-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: var(--shadow-hover);
  border-color: var(--accent);
  z-index: 2;
}

.gallery-card-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.82) 100%);
  transition: background 0.55s var(--ease);
}

.gallery-card:hover .gallery-card-mask {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.72) 100%);
}

.gallery-card-cat {
  position: absolute;
  top: 14px;
  left: 16px;
  z-index: 2;
  padding: 3px 10px;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.gallery-card-body {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gallery-card-title {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 4px;
  color: var(--text);
}

.gallery-card-desc {
  font-size: 12px;
  font-weight: 300;
  color: var(--text-muted);
  line-height: 1.7;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.55s var(--ease), max-height 0.55s var(--ease);
}

.gallery-card:hover .gallery-card-desc {
  opacity: 1;
  max-height: 60px;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(244, 250, 255, 0.88);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.lightbox-inner {
  position: relative;
  width: min(900px, 100%);
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-hover);
}

.lightbox-cat {
  position: absolute;
  top: 22px;
  left: 24px;
  z-index: 2;
  padding: 5px 14px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.lightbox-text {
  position: absolute;
  left: 28px;
  bottom: 28px;
  z-index: 2;
}

.lightbox-text h4 {
  font-size: 30px;
  font-weight: 300;
  letter-spacing: 6px;
  color: var(--text);
  margin-bottom: 8px;
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.8);
}

.lightbox-text p {
  font-size: 14px;
  font-weight: 300;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.lightbox-close {
  position: absolute;
  top: 18px;
  right: 20px;
  z-index: 3;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border-strong);
  color: var(--text-muted);
  font-size: 22px;
  line-height: 1;
  transition: var(--transition);
}

.lightbox-close:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s var(--ease);
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* ============ 5. GAMEPLAY ============ */
.gameplay-chapter {
  background: #F0F8FF;
}

.gameplay-wrap {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
  align-items: stretch;
}

.gameplay-tabs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 1px solid var(--hairline);
}

.gameplay-tab {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 22px;
  border-left: 2px solid transparent;
  text-align: left;
  transition: var(--transition);
}

.gameplay-tab:hover {
  background: rgba(126, 200, 247, 0.08);
}

.gameplay-tab.active {
  border-left-color: var(--accent);
  background: var(--accent-soft);
}

.gameplay-tab-no {
  font-size: 11px;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

.gameplay-tab.active .gameplay-tab-no {
  color: var(--accent);
}

.gameplay-tab-name {
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 4px;
  color: var(--text-muted);
}

.gameplay-tab.active .gameplay-tab-name {
  color: var(--text);
}

.gameplay-detail {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 36px;
  align-items: center;
  min-height: 360px;
}

.gameplay-fade-enter-active,
.gameplay-fade-leave-active {
  transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
}

.gameplay-fade-enter-from { opacity: 0; transform: translateX(20px); }
.gameplay-fade-leave-to { opacity: 0; transform: translateX(-20px); }

.gameplay-visual {
  position: relative;
  height: 360px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}

.gameplay-visual-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 96px;
  line-height: 1;
  filter: drop-shadow(0 6px 24px rgba(126, 200, 247, 0.35));
}

.gameplay-visual-no {
  position: absolute;
  bottom: 20px;
  right: 26px;
  font-size: 60px;
  font-weight: 300;
  line-height: 1;
  color: rgba(58, 74, 102, 0.08);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

.gameplay-text {
  display: flex;
  flex-direction: column;
}

.gameplay-summary {
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--accent);
  margin-bottom: 12px;
  font-family: var(--font-serif);
}

.gameplay-title {
  font-size: clamp(30px, 3.6vw, 42px);
  font-weight: 300;
  letter-spacing: 8px;
  margin-bottom: 20px;
  color: var(--text);
}

.gameplay-desc {
  font-size: 14px;
  font-weight: 300;
  color: var(--text-muted);
  line-height: 2.2;
  margin-bottom: 30px;
}

.gameplay-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-sm {
  padding: 8px 18px;
  font-size: 12px;
  letter-spacing: 2px;
}

.gameplay-nav-no {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

/* ============ 6. NOTICE ============ */
.notice-chapter {
  background: linear-gradient(180deg, #FFFFFF 0%, #F0F8FF 100%);
}

.notice-list {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-row {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 28px;
  align-items: center;
  padding: 24px 26px;
  border: 1px solid transparent;
  border-bottom: 1px solid var(--hairline);
  cursor: pointer;
  transition: var(--transition);
}

.notice-row:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: var(--accent);
  border-radius: var(--radius);
  transform: translateX(6px);
  box-shadow: 0 12px 32px rgba(126, 200, 247, 0.22), 0 0 20px rgba(255, 183, 209, 0.16);
}

.notice-date {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-right: 1px solid var(--hairline);
  padding-right: 24px;
}

.notice-day {
  font-size: 38px;
  font-weight: 300;
  color: var(--accent);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-serif);
}

.notice-my {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 1px;
  margin-top: 8px;
}

.notice-body {
  min-width: 0;
}

.notice-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 400;
  color: #FFFFFF;
  border-radius: 999px;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.notice-title {
  font-size: 17px;
  font-weight: 400;
  color: var(--text);
  letter-spacing: 2px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.notice-summary {
  font-size: 13px;
  font-weight: 300;
  color: var(--text-muted);
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-arrow {
  font-size: 20px;
  color: var(--text-dim);
  transition: var(--transition);
}

.notice-row:hover .notice-arrow {
  color: var(--accent);
  transform: translateX(6px);
}

.notice-more {
  margin-top: 56px;
  text-align: center;
}

/* ============ loading ============ */
.loading-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 80px 0;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(126, 200, 247, 0.6);
  animation: dotPulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

/* ============ 响应式 ============ */
@media (max-width: 1080px) {
  .char-thumbs {
    position: static;
    flex-direction: row;
    max-width: none;
    overflow-x: auto;
    margin-top: 28px;
    padding-bottom: 6px;
  }

  .char-thumb {
    flex-shrink: 0;
  }
}

@media (max-width: 960px) {
  .chapter {
    padding: 96px 0;
  }

  .char-inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .char-portrait {
    height: 420px;
  }

  .char-dossier {
    padding: 30px 26px;
  }

  .lore-wrap,
  .gameplay-wrap {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .lore-tabs,
  .gameplay-tabs {
    flex-direction: row;
    overflow-x: auto;
    border-left: none;
    border-bottom: 1px solid var(--hairline);
    padding-bottom: 4px;
  }

  .lore-tab,
  .gameplay-tab {
    flex-shrink: 0;
    border-left: none;
    border-bottom: 2px solid transparent;
    padding: 12px 18px;
  }

  .lore-tab.active,
  .gameplay-tab.active {
    border-left-color: transparent;
    border-bottom-color: var(--accent);
  }

  .lore-detail,
  .gameplay-detail {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .lore-cover,
  .gameplay-visual {
    height: 280px;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .notice-row {
    grid-template-columns: 90px 1fr;
    gap: 18px;
    padding: 20px;
  }

  .notice-arrow {
    display: none;
  }

  .notice-day {
    font-size: 30px;
  }

  .hero-side-label {
    display: none;
  }

  .hero-sigil {
    left: 24px;
    bottom: 32px;
    width: 50px;
    height: 50px;
  }

  .sigil-glyph {
    font-size: 18px;
  }

  .hero-scroll {
    right: 24px;
    bottom: 32px;
  }
}

@media (max-width: 600px) {
  .chapter {
    padding: 72px 0;
  }

  .char-portrait {
    height: 360px;
  }

  .char-name-cn {
    font-size: 32px;
    letter-spacing: 8px;
  }

  .char-big-num {
    font-size: 60px;
  }

  .char-dossier-meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-card {
    height: 200px;
  }

  .hero-title {
    letter-spacing: 12px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .btn {
    width: 100%;
  }

  .char-arrow {
    width: 42px;
    height: 42px;
    font-size: 22px;
  }

  .char-prev { left: 8px; }
  .char-next { right: 8px; }

  .notice-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .notice-date {
    flex-direction: row;
    align-items: baseline;
    gap: 10px;
    border-right: none;
    border-bottom: 1px solid var(--hairline);
    padding-right: 0;
    padding-bottom: 10px;
  }
}
</style>
