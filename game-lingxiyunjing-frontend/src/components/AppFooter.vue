<script setup lang="ts">
import { ref } from 'vue'

const year = ref(new Date().getFullYear())
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <div class="brand-row">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="34" height="34">
              <defs>
                <linearGradient id="lxfsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#7EC8F7"/>
                  <stop offset="100%" stop-color="#EAF6FF"/>
                </linearGradient>
                <linearGradient id="lxfcastle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#FFB7D1"/>
                  <stop offset="100%" stop-color="#C9B8F0"/>
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="30" height="30" rx="6" fill="url(#lxfsky)"/>
              <ellipse cx="10" cy="9.5" rx="4.4" ry="2.4" fill="#FFFFFF" opacity="0.95"/>
              <ellipse cx="23.5" cy="7" rx="3" ry="1.8" fill="#FFFFFF" opacity="0.85"/>
              <path d="M9 31 L9 21 L11.5 21 L11.5 17.5 L13.5 17.5 L13.5 21 L15 21 L15 15.5 L17 12 L19 15.5 L19 21 L21.5 21 L21.5 31 Z" fill="url(#lxfcastle)"/>
              <path d="M17 12 L17 9.6 L19.8 10.5 L17 11.4 Z" fill="#FF9BC6"/>
              <path d="M24.5 12.6 L25.3 14.7 L27.5 14.8 L25.8 16.3 L26.4 18.5 L24.5 17.3 L22.6 18.5 L23.2 16.3 L21.5 14.8 L23.7 14.7 Z" fill="#FFB7D1"/>
            </svg>
          </span>
          <div class="brand-text">
            <span class="brand-cn">灵汐云境</span>
            <span class="brand-en">LING XI</span>
          </div>
        </div>
        <p class="brand-slogan">云端童话 · 城堡魔法 · 治愈之旅</p>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <h4 class="footer-title">云境</h4>
          <ul>
            <li><router-link to="/characters">伙伴图鉴</router-link></li>
            <li><router-link to="/sects">魔法秘境</router-link></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">动态</h4>
          <ul>
            <li><router-link to="/news">资讯中心</router-link></li>
            <li><a href="/#news">最新资讯</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">关于</h4>
          <ul>
            <li><router-link to="/about">云境世界观</router-link></li>
            <li><a href="mailto:hr@shixingxu.com">加入我们</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="container footer-bottom">
      <p class="footer-copy">© {{ year }} 灵汐云境 LING XI · 拾星序 SHIXINGXU 出品</p>
      <p class="footer-icp">沪ICP备XXXXXXXX号-1 · 沪公网安备 XXXXXXXXXXXX号</p>
      <p class="footer-tip">
        健康游戏忠告：抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: linear-gradient(180deg, #EAF4FF 0%, #D6EAFF 100%);
  border-top: 1px solid var(--border);
  padding: 64px 0 28px;
  position: relative;
  overflow: hidden;
}

.site-footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120px;
  background:
    radial-gradient(ellipse at 20% 100%, rgba(255, 183, 209, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 100%, rgba(159, 232, 201, 0.20) 0%, transparent 55%);
  pointer-events: none;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 56px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 1;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-cn {
  font-size: 23px;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--text);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.brand-en {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--accent);
  margin-top: 5px;
}

.brand-slogan {
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 2px;
  line-height: 2;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.footer-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--accent);
  margin-bottom: 18px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.footer-col ul {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col a {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
  transition: color 0.25s ease, transform 0.25s ease;
  display: inline-block;
}

.footer-col a:hover {
  color: var(--accent);
  transform: translateX(3px);
}

.footer-bottom {
  padding-top: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.footer-copy {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.footer-icp {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.footer-tip {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  line-height: 1.8;
  max-width: 720px;
  margin: 8px auto 0;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 36px;
    padding-bottom: 32px;
  }

  .footer-cols {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 520px) {
  .footer-cols {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
