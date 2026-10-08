<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const scrolled = ref(false)
const menuOpen = ref(false)
const route = useRoute()

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="app-header" :class="{ scrolled: scrolled || menuOpen }">
    <div class="header-inner">
      <router-link to="/" class="logo" @click="closeMenu">
        <span class="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30">
            <defs>
              <linearGradient id="lxsky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7EC8F7"/>
                <stop offset="100%" stop-color="#EAF6FF"/>
              </linearGradient>
              <linearGradient id="lxcastle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFB7D1"/>
                <stop offset="100%" stop-color="#C9B8F0"/>
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#lxsky)"/>
            <ellipse cx="10" cy="9.5" rx="4.4" ry="2.4" fill="#FFFFFF" opacity="0.95"/>
            <ellipse cx="23.5" cy="7" rx="3" ry="1.8" fill="#FFFFFF" opacity="0.85"/>
            <path d="M10 31 L10 21 L12.5 21 L12.5 17.5 L14.5 17.5 L14.5 21 L16 21 L16 15.5 L18 12 L20 15.5 L20 21 L22.5 21 L22.5 31 Z" fill="url(#lxcastle)"/>
            <path d="M18 12 L18 9.6 L20.8 10.5 L18 11.4 Z" fill="#FF9BC6"/>
            <rect x="16.9" y="23.5" width="2.4" height="4" rx="1.2" fill="#FFFFFF" opacity="0.85"/>
            <circle cx="25.5" cy="13.5" r="1.3" fill="#FFE3A3"/>
          </svg>
        </span>
        <span class="logo-text">
          <span class="logo-cn">灵汐云境</span>
          <span class="logo-en">LING XI</span>
        </span>
      </router-link>

      <nav class="nav" :class="{ open: menuOpen }">
        <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }" @click="closeMenu">首页</router-link>
        <router-link to="/characters" class="nav-link" :class="{ active: route.path === '/characters' }" @click="closeMenu">伙伴</router-link>
        <router-link to="/sects" class="nav-link" :class="{ active: route.path === '/sects' }" @click="closeMenu">秘境</router-link>
        <a href="/#features" class="nav-link" @click="closeMenu">玩法</a>
        <a href="/#news" class="nav-link" @click="closeMenu">资讯</a>
        <router-link to="/about" class="nav-link" :class="{ active: route.path === '/about' }" @click="closeMenu">关于</router-link>
        <router-link to="/play" class="nav-link nav-play" :class="{ active: route.path === '/play' }" @click="closeMenu">试玩</router-link>
      </nav>

      <button class="nav-toggle" :class="{ open: menuOpen }" @click="toggleMenu" aria-label="菜单">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-h);
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid transparent;
  transition: background 0.45s var(--ease), border-color 0.45s var(--ease), box-shadow 0.45s var(--ease);
}

.app-header.scrolled {
  background: rgba(255, 255, 255, 0.86);
  border-bottom-color: var(--hairline);
  box-shadow: 0 8px 30px rgba(126, 200, 247, 0.14);
}

.header-inner {
  max-width: var(--container);
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 10px rgba(126, 200, 247, 0.35));
  transition: filter 0.45s var(--ease);
}

.logo:hover .logo-mark {
  filter: drop-shadow(0 2px 16px rgba(255, 183, 209, 0.5));
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-cn {
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 5px;
  color: var(--text);
}

.logo-en {
  font-size: 9px;
  letter-spacing: 4px;
  color: var(--accent);
  margin-top: 4px;
  font-family: var(--font-serif);
  font-style: italic;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-link {
  position: relative;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 4px;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--accent);
}

.nav-link.active {
  color: var(--text);
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: 2px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #7EC8F7, #FFB7D1);
  opacity: 0;
  transition: left 0.4s var(--ease), right 0.4s var(--ease), opacity 0.4s var(--ease);
}

.nav-link:hover::after,
.nav-link.active::after {
  left: 16px;
  right: 16px;
  opacity: 1;
}

.nav-play {
  margin-left: 10px;
  padding: 8px 22px;
  border: 1px solid rgba(126, 200, 247, 0.55);
  border-radius: 999px;
  color: var(--accent);
  letter-spacing: 4px;
  background: rgba(255, 255, 255, 0.6);
  transition: var(--transition);
}

.nav-play::after {
  display: none;
}

.nav-play:hover,
.nav-play.active {
  color: var(--ink);
  background: linear-gradient(135deg, #7EC8F7, #FFB7D1);
  border-color: transparent;
  box-shadow: 0 8px 22px rgba(126, 200, 247, 0.38);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
}

.nav-toggle span {
  display: block;
  width: 24px;
  height: 1.5px;
  background: var(--text);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.nav-toggle.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-toggle.open span:nth-child(2) {
  opacity: 0;
}

.nav-toggle.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav {
    position: fixed;
    top: var(--header-h);
    right: 0;
    width: 72%;
    max-width: 300px;
    height: calc(100vh - var(--header-h));
    flex-direction: column;
    gap: 0;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(20px);
    padding: 24px 0;
    transform: translateX(100%);
    transition: transform 0.4s var(--ease);
    border-left: 1px solid var(--hairline);
  }

  .nav.open {
    transform: translateX(0);
  }

  .nav-link {
    display: block;
    padding: 14px 28px;
    font-size: 14px;
    border-bottom: 1px solid var(--border);
  }

  .nav-link::after {
    left: 28px;
    right: auto;
    width: 0;
  }

  .nav-link:hover::after,
  .nav-link.active::after {
    width: 24px;
    right: auto;
  }

  .logo-en {
    display: none;
  }
}
</style>
