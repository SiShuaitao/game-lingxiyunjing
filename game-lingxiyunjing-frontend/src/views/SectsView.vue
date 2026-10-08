<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchSects, fetchCharacters } from '@/api/portal'
import type { Sect, Character } from '@/types'
import { coverGradient } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()

const sects = ref<Sect[]>([])
const characters = ref<Character[]>([])
const loading = ref(true)

/** 取该秘境的代表伙伴（前 2 位） */
function representatives(faction: string): Character[] {
  return characters.value.filter((c) => c.faction === faction).slice(0, 2)
}

async function load() {
  const [s, c] = await Promise.all([fetchSects(), fetchCharacters()])
  sects.value = s
  characters.value = c
  loading.value = false
  requestAnimationFrame(() => refreshReveal())
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
        <p class="section-kicker">REALMS</p>
        <h1 class="page-title">魔法秘境</h1>
        <p class="page-subtitle">四大秘境散落云境，各藏奇遇与治愈魔法</p>
      </div>
    </section>

    <!-- 秘境列表 -->
    <section class="sects-section">
      <div class="container">
        <div v-if="sects.length > 0" class="sects-list">
          <article
            v-for="(s, i) in sects"
            :key="s.id"
            class="sect-item reveal"
            :class="{ reverse: i % 2 === 1 }"
          >
            <div class="sect-visual" :style="{ background: coverGradient(s.cover) }">
              <div class="sect-mist" aria-hidden="true"></div>
              <span class="sect-subtitle">{{ s.subtitle }}</span>
              <div class="sect-seal" aria-hidden="true">{{ ['铃', '雾', '菇', '镜'][i] || '境' }}</div>
            </div>
            <div class="sect-text">
              <p class="sect-index">秘境 · {{ ['壹', '贰', '叁', '肆'][i] || i + 1 }}</p>
              <h3 class="sect-name">{{ s.name }}</h3>
              <p class="sect-philosophy">{{ s.philosophy }}</p>
              <p class="sect-desc">{{ s.description }}</p>

              <div v-if="representatives(s.name).length > 0" class="sect-reps">
                <p class="reps-label">此地伙伴</p>
                <div class="reps-list">
                  <div v-for="r in representatives(s.name)" :key="r.id" class="rep-chip">
                    <span class="rep-name">{{ r.name }}</span>
                    <span class="rep-title">{{ r.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else-if="!loading" class="empty">
          <p>暂无秘境</p>
        </div>

        <div v-if="loading" class="loading-row">
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
  padding: 120px 0 72px;
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
  top: 36px;
  right: 12%;
  width: 84px;
  height: 84px;
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

.c1 { top: 14%; left: 8%; animation-duration: 26s; }
.c2 { top: 32%; left: 26%; animation-duration: 34s; transform: scale(0.75); }
.c3 { top: 12%; left: 48%; animation-duration: 28s; transform: scale(1.15); }
.c4 { top: 38%; left: 66%; animation-duration: 38s; transform: scale(0.7); }
.c5 { top: 20%; left: 82%; animation-duration: 30s; }
.c6 { top: 46%; left: 40%; animation-duration: 42s; transform: scale(0.6); }

@keyframes cloudDrift {
  0%, 100% { margin-left: 0; }
  50% { margin-left: 42px; }
}

.page-hero-inner {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: clamp(40px, 6vw, 64px);
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

.sects-section {
  padding: 80px 0 96px;
}

.sects-list {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.sect-item {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 64px;
  align-items: center;
  transition: transform 0.4s var(--ease);
}

.sect-item:hover {
  transform: translateY(-4px);
}

.sect-item.reverse .sect-visual {
  order: 2;
}

.sect-visual {
  position: relative;
  height: 400px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}

.sect-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.28) 100%);
}

.sect-mist {
  position: absolute;
  top: 45%;
  left: -10%;
  right: -10%;
  height: 70px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  filter: blur(10px);
  animation: coverMistDrift 14s ease-in-out infinite;
}

@keyframes coverMistDrift {
  0%, 100% { transform: translateX(-20px); opacity: 0.4; }
  50% { transform: translateX(20px); opacity: 0.8; }
}

.sect-subtitle {
  position: absolute;
  top: 20px;
  left: 22px;
  z-index: 2;
  padding: 5px 12px;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--border);
  border-radius: 999px;
  backdrop-filter: blur(4px);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.sect-seal {
  position: absolute;
  bottom: 22px;
  right: 22px;
  z-index: 2;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FFB7D1, #C9B8F0);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  transform: rotate(-4deg);
  opacity: 0.95;
  box-shadow: 0 6px 18px rgba(255, 183, 209, 0.45);
}

.sect-index {
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--accent);
  margin-bottom: 12px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.sect-name {
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 700;
  letter-spacing: 6px;
  margin-bottom: 14px;
  color: var(--text);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.sect-philosophy {
  font-size: 17px;
  color: var(--accent);
  letter-spacing: 2px;
  margin-bottom: 18px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.sect-desc {
  font-size: 14.5px;
  color: var(--text-muted);
  line-height: 2.1;
  margin-bottom: 28px;
}

.sect-reps {
  border-top: 1px solid var(--border);
  padding-top: 22px;
}

.reps-label {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-dim);
  margin-bottom: 14px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.reps-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.rep-chip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 18px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.rep-chip:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-card);
}

.rep-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.rep-title {
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 1px;
}

.empty,
.loading-row {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

.loading-row {
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

@media (max-width: 960px) {
  .sects-list {
    gap: 56px;
  }

  .sect-item,
  .sect-item.reverse {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .sect-item.reverse .sect-visual {
    order: 0;
  }

  .sect-visual {
    height: 280px;
  }
}

@media (max-width: 600px) {
  .page-title {
    letter-spacing: 8px;
  }
}
</style>
