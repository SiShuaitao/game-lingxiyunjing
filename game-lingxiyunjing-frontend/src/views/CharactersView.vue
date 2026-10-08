<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCharacters } from '@/api/portal'
import type { Character } from '@/types'
import { coverGradient, difficultyColor } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()

const characters = ref<Character[]>([])
const loading = ref(true)

async function load() {
  characters.value = await fetchCharacters()
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
        <p class="section-kicker">PARTNERS</p>
        <h1 class="page-title">伙伴图鉴</h1>
        <p class="page-subtitle">六位伙伴各怀魔法，于云端童话中与你相遇</p>
      </div>
    </section>

    <!-- 伙伴网格 -->
    <section class="characters-section">
      <div class="container">
        <div v-if="characters.length > 0" class="characters-grid">
          <article v-for="c in characters" :key="c.id" class="character-card reveal">
            <div class="character-cover" :style="{ background: coverGradient(c.cover) }">
              <div class="cover-mist" aria-hidden="true"></div>
              <span class="character-difficulty" :style="{ color: difficultyColor(c.difficulty), borderColor: difficultyColor(c.difficulty) }">{{ c.difficulty }}</span>
              <div class="character-name-overlay">
                <span class="character-cn">{{ c.name }}</span>
              </div>
            </div>
            <div class="character-body">
              <div class="character-meta">
                <span class="character-role">{{ c.role }}</span>
                <span class="character-faction">{{ c.faction }}</span>
              </div>
              <p class="character-title-text">{{ c.title }}</p>
              <p class="character-desc">{{ c.description }}</p>
            </div>
          </article>
        </div>

        <div v-else-if="!loading" class="empty">
          <p>暂无伙伴</p>
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

.c1 { top: 16%; left: 6%; animation-duration: 24s; }
.c2 { top: 30%; left: 30%; animation-duration: 32s; transform: scale(0.8); }
.c3 { top: 12%; left: 52%; animation-duration: 28s; transform: scale(1.1); }
.c4 { top: 36%; left: 68%; animation-duration: 36s; transform: scale(0.7); }
.c5 { top: 22%; left: 84%; animation-duration: 30s; }
.c6 { top: 44%; left: 14%; animation-duration: 40s; transform: scale(0.6); }

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

.characters-section {
  padding: 72px 0 96px;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.character-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease), box-shadow 0.4s var(--ease);
}

.character-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent);
  box-shadow: var(--shadow-hover);
}

.character-cover {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.cover-mist {
  position: absolute;
  top: 40%;
  left: -10%;
  right: -10%;
  height: 60px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  filter: blur(8px);
  animation: coverMistDrift 12s ease-in-out infinite;
}

@keyframes coverMistDrift {
  0%, 100% { transform: translateX(-20px); opacity: 0.4; }
  50% { transform: translateX(20px); opacity: 0.8; }
}

.character-difficulty {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  padding: 4px 10px;
  font-size: 11px;
  letter-spacing: 1px;
  border: 1px solid;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
}

.character-name-overlay {
  position: absolute;
  bottom: 16px;
  left: 18px;
  z-index: 2;
}

.character-cn {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 6px;
  color: var(--text);
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.8);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.character-body {
  padding: 24px 26px 28px;
}

.character-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.character-role,
.character-faction {
  font-size: 11px;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 999px;
}

.character-role {
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent);
}

.character-faction {
  background: var(--bg-elev-2);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.character-title-text {
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 12px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.character-desc {
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 2;
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
  .characters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .characters-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    letter-spacing: 8px;
  }
}
</style>
