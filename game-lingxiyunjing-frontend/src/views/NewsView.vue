<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fetchLatestNews } from '@/api/portal'
import type { NewsItem } from '@/types'
import { newsCategoryLabel, newsCategoryColor, formatDate } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import { useRouter } from 'vue-router'

useReveal()
const router = useRouter()

const news = ref<NewsItem[]>([])
const loading = ref(true)
const activeCategory = ref<'all' | 'news' | 'notice' | 'activity'>('all')

async function load() {
  loading.value = true
  news.value = await fetchLatestNews(20)
  loading.value = false
  requestAnimationFrame(() => refreshReveal())
}

const filtered = ref<NewsItem[]>([])
function applyFilter() {
  filtered.value =
    activeCategory.value === 'all'
      ? news.value
      : news.value.filter((n) => n.category === activeCategory.value)
  requestAnimationFrame(() => refreshReveal())
}

watch(activeCategory, applyFilter)
watch(news, applyFilter)

function goDetail(id: number) {
  router.push(`/news/${id}`)
}

onMounted(load)
</script>

<template>
  <div class="page">
    <!-- 页面顶部 Hero -->
    <section class="page-hero">
      <div class="page-hero-bg" aria-hidden="true">
        <div class="hero-sun" aria-hidden="true"></div>
        <span v-for="n in 6" :key="n" class="cloud" :class="'c' + n"></span>
      </div>
      <div class="container page-hero-inner">
        <p class="section-kicker">NEWS</p>
        <h1 class="page-title">云境资讯</h1>
        <p class="page-subtitle">来自灵汐云境的最新动态与公告</p>
      </div>
    </section>

    <!-- 分类筛选 -->
    <section class="filter-bar">
      <div class="container filter-inner">
        <button
          v-for="cat in [
            { k: 'all', label: '全部' },
            { k: 'notice', label: '公告' },
            { k: 'activity', label: '活动' },
            { k: 'news', label: '资讯' }
          ]"
          :key="cat.k"
          class="filter-btn"
          :class="{ active: activeCategory === cat.k }"
          @click="activeCategory = cat.k as any"
        >{{ cat.label }}</button>
      </div>
    </section>

    <!-- 列表 -->
    <section class="news-list-section">
      <div class="container">
        <div v-if="filtered.length > 0" class="news-list">
          <article
            v-for="item in filtered"
            :key="item.id"
            class="news-row reveal"
            @click="goDetail(item.id)"
          >
            <div class="news-row-date">
              <span class="news-row-day">{{ formatDate(item.publishTime, 'iso').slice(8) }}</span>
              <span class="news-row-month">{{ formatDate(item.publishTime, 'iso').slice(0, 7) }}</span>
            </div>
            <div class="news-row-body">
              <div class="news-row-meta">
                <span
                  class="news-row-tag"
                  :style="{
                    background: newsCategoryColor(item.category),
                    borderColor: newsCategoryColor(item.category)
                  }"
                >{{ newsCategoryLabel(item.category) }}</span>
              </div>
              <h3 class="news-row-title">{{ item.title }}</h3>
              <p class="news-row-summary">{{ item.summary }}</p>
            </div>
            <div class="news-row-arrow">→</div>
          </article>
        </div>

        <div v-else-if="!loading" class="news-empty">
          <p>暂无资讯</p>
        </div>

        <div v-if="loading" class="news-loading">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
}

.page-hero {
  position: relative;
  padding: 110px 0 64px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(180deg, #AEE3FF 0%, #D6F0FF 55%, #F4FAFF 100%);
}

.page-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-sun {
  position: absolute;
  top: 34px;
  right: 12%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #FFE3A3 0%, rgba(255, 227, 163, 0.4) 55%, transparent 72%);
}

.cloud {
  position: absolute;
  width: 92px;
  height: 28px;
  background: #FFFFFF;
  border-radius: 999px;
  opacity: 0.92;
  animation: cloudDrift ease-in-out infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: #FFFFFF;
  border-radius: 50%;
}

.cloud::before {
  width: 38px;
  height: 38px;
  top: -17px;
  left: 14px;
}

.cloud::after {
  width: 26px;
  height: 26px;
  top: -11px;
  right: 16px;
}

.c1 { top: 16%; left: 6%; animation-duration: 24s; }
.c2 { top: 32%; left: 28%; animation-duration: 32s; transform: scale(0.8); }
.c3 { top: 12%; left: 50%; animation-duration: 28s; transform: scale(1.1); }
.c4 { top: 36%; left: 68%; animation-duration: 36s; transform: scale(0.7); }
.c5 { top: 22%; left: 84%; animation-duration: 30s; }
.c6 { top: 44%; left: 12%; animation-duration: 40s; transform: scale(0.6); }

@keyframes cloudDrift {
  0%, 100% { margin-left: 0; }
  50% { margin-left: 42px; }
}

.page-hero-inner {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: clamp(40px, 6vw, 60px);
  font-weight: 700;
  letter-spacing: 12px;
  margin: 12px 0 16px;
  color: var(--text);
  font-family: 'KaiTi', 'STKaiti', serif;
  text-shadow: 0 2px 14px rgba(255, 255, 255, 0.8);
}

.page-subtitle {
  font-size: 15px;
  color: var(--text-muted);
  letter-spacing: 3px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.filter-bar {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.85);
  position: sticky;
  top: var(--header-h);
  z-index: 10;
  backdrop-filter: blur(10px);
}

.filter-inner {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  overflow-x: auto;
}

.filter-btn {
  padding: 8px 20px;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  transition: var(--transition);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.filter-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.filter-btn.active {
  background: linear-gradient(135deg, #7EC8F7, #FFB7D1);
  color: #FFFFFF;
  border-color: transparent;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(126, 200, 247, 0.35);
}

.news-list-section {
  padding: 64px 0;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-row {
  display: grid;
  grid-template-columns: 90px 1fr 24px;
  gap: 28px;
  align-items: center;
  padding: 24px 28px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.35s var(--ease), border-color 0.35s var(--ease), box-shadow 0.35s var(--ease);
}

.news-row:hover {
  transform: translateX(6px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card);
}

.news-row-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  border-right: 1px solid var(--border);
}

.news-row-day {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  font-family: 'Courier New', monospace;
}

.news-row-month {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  margin-top: 6px;
}

.news-row-body {
  min-width: 0;
}

.news-row-meta {
  margin-bottom: 8px;
}

.news-row-tag {
  display: inline-flex;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #FFFFFF;
  border-radius: 999px;
  letter-spacing: 1px;
}

.news-row-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.news-row-summary {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-row-arrow {
  font-size: 18px;
  color: var(--text-dim);
  transition: transform 0.3s ease, color 0.3s ease;
}

.news-row:hover .news-row-arrow {
  color: var(--accent);
  transform: translateX(4px);
}

.news-empty,
.news-loading {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

.news-loading {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  animation: dotPulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

@media (max-width: 600px) {
  .news-row {
    grid-template-columns: 70px 1fr;
    gap: 16px;
    padding: 18px 20px;
  }

  .news-row-arrow {
    display: none;
  }

  .news-row-day {
    font-size: 24px;
  }

  .page-title {
    letter-spacing: 8px;
  }
}
</style>
