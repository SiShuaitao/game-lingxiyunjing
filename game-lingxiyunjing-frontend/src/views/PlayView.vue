<script setup lang="ts">
import { ref } from 'vue'

// 试玩改为独立窗口打开，游戏代码位于 game-lingxiyunjing-game，
// 由 Vite 映射到同端口的 /game-play/ 路径。
const GAME_URL = '/game-play/index.html'
const popupBlocked = ref(false)

function openGame() {
  popupBlocked.value = false
  const screen = window.screen
  const width = Math.min(1280, Math.max(960, screen.availWidth - 60))
  const height = Math.min(840, Math.max(640, screen.availHeight - 60))
  const left = Math.max(
    (screen.availLeft || 0),
    (screen.availLeft || 0) + (screen.availWidth - width) / 2
  )
  const top = Math.max(
    (screen.availTop || 0),
    (screen.availTop || 0) + (screen.availHeight - height) / 2
  )
  // 指定宽高后浏览器以独立窗口（而非标签页）打开，并在屏幕中居中
  const win = window.open(
    GAME_URL,
    'lingxiGame',
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
  )
  if (!win) popupBlocked.value = true
}

const highlights = [
  { icon: '🗺️', title: '五大场景', desc: '草原、风铃镇、倒生森林、蘑菇高地与云镜神殿无缝相连' },
  { icon: '🎒', title: '随身百宝', desc: '短剑、回力镖、星弓、爆弹，自由组合破解难关' },
  { icon: '🗝️', title: '镜殿解谜', desc: '清敌、找钥匙、触发机关，深入纸牌迷宫' },
  { icon: '💗', title: '心之成长', desc: '收集心之碎片扩充心血量，随时可手动存档' }
]

const controls = [
  { keys: 'W A S D / 方向键', action: '移动' },
  { keys: 'J / 鼠标点击', action: '挥剑（面朝指针）' },
  { keys: 'K / 鼠标右键', action: '使用当前道具' },
  { keys: '1 · 2 · 3', action: '切换 回力镖 / 星弓 / 爆弹' },
  { keys: 'Tab / 鼠标滚轮', action: '循环切换已拥有的道具' },
  { keys: 'Q', action: '仙露（一次回满心血量）' },
  { keys: 'E', action: '交谈 · 查看 · 开宝箱' },
  { keys: 'Esc', action: '暂停（菜单内手动保存）' },
  { keys: '保存', action: '仅手动保存，游戏不会自动存档' }
]
</script>

<template>
  <div class="play-entry">
    <!-- 背景装饰：云朵 -->
    <div class="entry-bg" aria-hidden="true">
      <span v-for="n in 5" :key="n" class="bg-cloud" :class="'cc' + n"></span>
      <span class="bg-balloon">🎈</span>
    </div>

    <div class="entry-container">
      <p class="entry-kicker">FREE TRIAL</p>
      <h1 class="entry-title">云境漫游试玩</h1>
      <p class="entry-subtitle">
        游戏将在<strong>独立的新窗口</strong>中运行，建议使用键盘操作。<br />
        云隙已开，怀表兔在等你。
      </p>

      <button class="open-btn" type="button" @click="openGame">
        <span class="open-btn-icon">✦</span>
        <span class="open-btn-text">在新窗口开启云境漫游</span>
        <span class="open-btn-arrow">→</span>
      </button>

      <p v-if="popupBlocked" class="blocked-tip">
        浏览器拦截了弹窗，请
        <a :href="GAME_URL" target="_blank" rel="noopener">点此直接打开试玩</a>
      </p>
      <p v-else class="fallback-tip">
        若按钮没有反应，也可
        <a :href="GAME_URL" target="_blank" rel="noopener">直接打开试玩页面</a>
      </p>

      <!-- 亮点 -->
      <div class="highlight-grid">
        <div v-for="h in highlights" :key="h.title" class="highlight-card">
          <span class="highlight-icon">{{ h.icon }}</span>
          <p class="highlight-title">{{ h.title }}</p>
          <p class="highlight-desc">{{ h.desc }}</p>
        </div>
      </div>

      <!-- 操作说明 -->
      <div class="control-card">
        <h2 class="control-title">操作说明</h2>
        <ul class="control-list">
          <li v-for="c in controls" :key="c.action">
            <span class="control-keys">{{ c.keys }}</span>
            <span class="control-action">{{ c.action }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.play-entry {
  position: relative;
  min-height: calc(100vh - var(--header-h));
  padding: 80px 24px 110px;
  overflow: hidden;
  background:
    radial-gradient(1000px 560px at 15% -5%, #d9f0ff 0%, transparent 60%),
    radial-gradient(900px 560px at 110% 15%, #fbe3f1 0%, transparent 60%),
    linear-gradient(180deg, #f2f9ff 0%, #fbf7ff 100%);
}

/* ===== 背景装饰 ===== */
.entry-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-cloud {
  position: absolute;
  width: 96px;
  height: 26px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  opacity: 0.85;
  animation: entryCloudDrift ease-in-out infinite;
}

.bg-cloud::before,
.bg-cloud::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
}

.bg-cloud::before {
  width: 38px;
  height: 38px;
  top: -17px;
  left: 14px;
}

.bg-cloud::after {
  width: 26px;
  height: 26px;
  top: -11px;
  right: 16px;
}

.cc1 { top: 12%; left: 6%; animation-duration: 26s; }
.cc2 { top: 24%; right: 8%; animation-duration: 34s; transform: scale(1.15); }
.cc3 { top: 56%; left: 4%; animation-duration: 30s; transform: scale(0.75); }
.cc4 { top: 72%; right: 5%; animation-duration: 38s; transform: scale(0.9); }
.cc5 { top: 40%; left: 44%; animation-duration: 42s; transform: scale(0.65); opacity: 0.6; }

@keyframes entryCloudDrift {
  0%, 100% { margin-left: 0; }
  50% { margin-left: 46px; }
}

.bg-balloon {
  position: absolute;
  top: 8%;
  right: 22%;
  font-size: 34px;
  animation: balloonFloat 7s ease-in-out infinite;
}

@keyframes balloonFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

/* ===== 内容 ===== */
.entry-container {
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
}

.entry-kicker {
  font-size: 12px;
  letter-spacing: 8px;
  color: var(--accent);
}

.entry-title {
  margin: 14px 0 18px;
  font-size: clamp(38px, 6vw, 60px);
  font-weight: 700;
  letter-spacing: 12px;
  color: var(--text);
}

.entry-subtitle {
  margin-bottom: 40px;
  font-size: 15px;
  line-height: 2.2;
  letter-spacing: 2px;
  color: var(--text-muted);
}

.entry-subtitle strong {
  color: var(--accent);
  font-weight: 600;
}

/* ===== 主按钮 ===== */
.open-btn {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 18px 42px;
  font-size: 18px;
  letter-spacing: 4px;
  color: #fff;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #7ec8f7 0%, #9f9be8 55%, #ff9ec4 100%);
  box-shadow: 0 16px 36px rgba(126, 150, 230, 0.35);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.open-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 44px rgba(126, 150, 230, 0.42);
}

.open-btn:active {
  transform: translateY(-1px);
}

.open-btn-icon {
  font-size: 16px;
  opacity: 0.9;
}

.open-btn-arrow {
  font-size: 20px;
  transition: transform 0.2s ease;
}

.open-btn:hover .open-btn-arrow {
  transform: translateX(5px);
}

.blocked-tip,
.fallback-tip {
  margin-top: 18px;
  font-size: 13.5px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.blocked-tip a,
.fallback-tip a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.blocked-tip {
  color: #e0708c;
}

/* ===== 亮点 ===== */
.highlight-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-top: 56px;
}

.highlight-card {
  padding: 26px 18px 22px;
  background: rgba(255, 255, 255, 0.78);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 22px;
  box-shadow: 0 12px 32px rgba(110, 140, 190, 0.14);
  backdrop-filter: blur(8px);
}

.highlight-icon {
  font-size: 30px;
}

.highlight-title {
  margin: 10px 0 6px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text);
}

.highlight-desc {
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--text-muted);
}

/* ===== 操作说明 ===== */
.control-card {
  margin-top: 30px;
  padding: 34px 40px 30px;
  text-align: left;
  background: rgba(255, 255, 255, 0.72);
  border: 1.5px solid rgba(255, 255, 255, 0.95);
  border-radius: 26px;
  box-shadow: 0 14px 38px rgba(110, 140, 190, 0.14);
  backdrop-filter: blur(8px);
}

.control-title {
  margin-bottom: 16px;
  text-align: center;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 6px;
  color: var(--text);
}

.control-list {
  list-style: none;
}

.control-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 6px;
  border-bottom: 1px dashed rgba(150, 170, 200, 0.35);
}

.control-list li:last-child {
  border-bottom: none;
}

.control-keys {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--accent);
}

.control-action {
  font-size: 13.5px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

@media (max-width: 860px) {
  .highlight-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .entry-title {
    letter-spacing: 8px;
  }
}

@media (max-width: 520px) {
  .open-btn {
    padding: 16px 26px;
    font-size: 16px;
    letter-spacing: 2px;
  }

  .control-card {
    padding: 26px 22px;
  }
}
</style>
