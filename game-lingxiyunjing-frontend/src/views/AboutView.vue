<script setup lang="ts">
import { useReveal } from '@/composables/useReveal'

useReveal()

const volumes = [
  {
    label: '卷一',
    title: '云隙之外',
    desc: '老人们说，云海是有尽头的。尽头处有一道缝隙，只有星光涨成潮汐的夜晚才会打开。走进去的人会听见铜铃，会看见倒着生长的树，会遇到揣着怀表、嫌你走得太慢的兔子。那片土地没有画在任何一张地图上，风铃镇、倒生森林、蘑菇高地与云镜神殿各自安好，时间在那里走得很慢，慢到够人把一场下午茶喝到地老天荒。卷一讲述云隙之外的世界，与它被重新记起的那个夜晚。'
  },
  {
    label: '卷二',
    title: '奇境风物',
    desc: '《灵汐云境》的画面从一朵云开始。马卡龙色的天光铺满四境，风推着白云慢慢走，热气球吊在半空，雾猫把笑留在树梢就消失了。我们把童话里那些“不太合常理”的东西都画了进来：树根朝天、露水让人忽大忽小、纸牌会端着长矛巡逻。色彩是软的，光也是软的，希望这趟旅程看起来像一块刚出炉的松饼——闻着香，咬下去更甜。'
  },
  {
    label: '卷三',
    title: '自由的刻度',
    desc: '我们喜欢那种“自己找到路”的感觉。所以云境不发任务箭头，不按着头让人看教程：可疑的墙可以炸，可疑的草丛可以烧，栅栏后面的东西可以用回力镖捞。一把剑、四种工具、三颗心，剩下的全靠好奇心。打不过的地方可以先走，等你长高了——心多了、工具齐了——再回来。云境会等你，就像它等过每一个从云隙走进来的人。'
  }
]

const values = [
  {
    icon: '觅',
    title: '好奇心有奖',
    desc: '每一条岔路都通向什么。裂缝墙、藏洞、水潭底的微光，认真找过的人从不空手。'
  },
  {
    icon: '巧',
    title: '一物多用',
    desc: '工具不是钥匙：回力镖能打也能捞，爆弹能开路也能退敌。解法往往不止一种。'
  },
  {
    icon: '暖',
    title: '温柔的硬仗',
    desc: '世界是软的，挑战是真的。打不过就先走，泡个温泉、集齐心器，再来会会乌有王。'
  }
]

const milestones = [
  { year: '2025', event: '云境立项', desc: '一群想做“自己找路”游戏的人，在画板上画下了第一朵云。' },
  { year: '2026', event: '云隙首曝', desc: '怀表兔与风铃镇首次亮相，那张动态画卷让很多人记住了铃声。' },
  { year: '2026', event: '风铃镇测试', desc: '小镇、森林与云镜神殿分批开放，第一批旅人带回了自己的故事。' },
  { year: '2026', event: '10 月 15 日公测', desc: '星光潮汐将涨至最高，云隙为所有预约的旅人打开。' }
]
</script>

<template>
  <div class="page">
    <!-- Hero -->
    <section class="about-hero">
      <div class="about-hero-bg" aria-hidden="true">
        <div class="hero-sun" aria-hidden="true"></div>
        <span v-for="n in 7" :key="n" class="cloud" :class="'c' + n"></span>
        <svg class="hero-castle" viewBox="0 0 400 220" aria-hidden="true">
          <defs>
            <linearGradient id="aboutCastle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#C9B8F0"/>
              <stop offset="100%" stop-color="#FFB7D1"/>
            </linearGradient>
          </defs>
          <path d="M40 220 L40 130 L62 130 L62 100 L82 100 L82 130 L105 130 L105 84 L130 52 L155 84 L155 130 L180 130 L180 108 L200 108 L200 130 L225 130 L225 92 L250 60 L275 92 L275 130 L300 130 L300 104 L320 104 L320 130 L342 130 L342 220 Z" fill="url(#aboutCastle)" opacity="0.9"/>
          <path d="M130 52 L130 34 L158 42 L130 50 Z" fill="#FF9BC6"/>
          <path d="M250 60 L250 42 L278 50 L250 58 Z" fill="#9FE8C9"/>
          <rect x="122" y="150" width="18" height="34" rx="9" fill="#FFFFFF" opacity="0.85"/>
          <rect x="242" y="140" width="16" height="28" rx="8" fill="#FFFFFF" opacity="0.85"/>
        </svg>
      </div>
      <div class="container about-hero-inner">
        <p class="section-kicker">WORLDVIEW</p>
        <h1 class="about-hero-title">灵汐云境</h1>
        <p class="about-hero-sub">LING XI · 云海秘境 · 奇境漫游 · 治愈冒险</p>
        <p class="about-hero-slogan">
          云隙之外，铃声正替你留着一盏灯。
        </p>
        <div class="hero-seal" aria-hidden="true">
          <span class="seal-text">灵汐</span>
        </div>
      </div>
    </section>

    <!-- 卷一 / 卷二 / 卷三 童话长卷叙述 -->
    <section class="volumes">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">SCROLL</p>
          <h2 class="section-title">云境长卷</h2>
          <p class="section-desc">三卷风物，从一道云隙讲起：奇境的来历、画面的味道，与“自己找路”的规矩。</p>
        </div>
        <div class="volumes-list">
          <article v-for="(v, i) in volumes" :key="v.label" class="volume-item reveal" :class="{ reverse: i % 2 === 1 }">
            <div class="volume-label">
              <span class="volume-cn">{{ v.label }}</span>
              <span class="volume-line"></span>
            </div>
            <div class="volume-body">
              <h3 class="volume-title">{{ v.title }}</h3>
              <p class="volume-desc">{{ v.desc }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 研发理念 -->
    <section class="values">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">OUR VALUES</p>
          <h2 class="section-title">研发理念</h2>
        </div>
        <div class="values-grid">
          <div v-for="v in values" :key="v.title" class="value-card reveal">
            <div class="value-icon">{{ v.icon }}</div>
            <h3 class="value-title">{{ v.title }}</h3>
            <p class="value-desc">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 里程碑 -->
    <section class="timeline-section">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">MILESTONES</p>
          <h2 class="section-title">云境之路</h2>
        </div>
        <div class="timeline">
          <div v-for="(m, i) in milestones" :key="i" class="timeline-item reveal">
            <div class="timeline-dot"></div>
            <div class="timeline-body">
              <span class="timeline-year">{{ m.year }}</span>
              <h3 class="timeline-event">{{ m.event }}</h3>
              <p class="timeline-desc">{{ m.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="contact">
      <div class="container contact-inner reveal">
        <p class="section-kicker">CONTACT</p>
        <h2 class="contact-title">与云境对话</h2>
        <div class="contact-grid">
          <a class="contact-card" href="mailto:hr@shixingxu.com">
            <h3 class="contact-label">招聘合作</h3>
            <p class="contact-value">hr@shixingxu.com</p>
            <p class="contact-desc">美术、程序、策划多岗位持续开放招募。</p>
          </a>
          <a class="contact-card" href="mailto:bd@shixingxu.com">
            <h3 class="contact-label">商务合作</h3>
            <p class="contact-value">bd@shixingxu.com</p>
            <p class="contact-desc">投资、发行、IP 联动等商务合作洽谈。</p>
          </a>
          <a class="contact-card" href="mailto:pr@shixingxu.com">
            <h3 class="contact-label">媒体联络</h3>
            <p class="contact-value">pr@shixingxu.com</p>
            <p class="contact-desc">采访、媒体合作与新闻素材索取。</p>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
}

.about-hero {
  position: relative;
  padding: 130px 0 88px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(180deg, #AEE3FF 0%, #D6F0FF 55%, #F4FAFF 100%);
}

.about-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-sun {
  position: absolute;
  top: 40px;
  right: 14%;
  width: 96px;
  height: 96px;
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

.c1 { top: 14%; left: 6%; animation-duration: 26s; }
.c2 { top: 30%; left: 24%; animation-duration: 34s; transform: scale(0.75); }
.c3 { top: 10%; left: 46%; animation-duration: 28s; transform: scale(1.1); }
.c4 { top: 36%; left: 62%; animation-duration: 38s; transform: scale(0.7); }
.c5 { top: 20%; left: 80%; animation-duration: 30s; }
.c6 { top: 46%; left: 36%; animation-duration: 42s; transform: scale(0.6); }
.c7 { top: 52%; left: 72%; animation-duration: 36s; transform: scale(0.85); }

@keyframes cloudDrift {
  0%, 100% { margin-left: 0; }
  50% { margin-left: 42px; }
}

.hero-castle {
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  width: min(560px, 72vw);
  opacity: 0.55;
}

.about-hero-inner {
  position: relative;
  z-index: 1;
}

.about-hero-title {
  font-size: clamp(56px, 10vw, 120px);
  font-weight: 700;
  letter-spacing: 20px;
  color: var(--text);
  margin: 18px 0 14px;
  text-shadow: 0 2px 18px rgba(255, 255, 255, 0.85);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.about-hero-sub {
  font-size: 13px;
  letter-spacing: 6px;
  color: var(--accent);
  margin-bottom: 32px;
}

.about-hero-slogan {
  font-size: clamp(16px, 1.8vw, 20px);
  color: var(--text-muted);
  letter-spacing: 4px;
  line-height: 2;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.hero-seal {
  margin: 36px auto 0;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FFB7D1, #C9B8F0);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(255, 183, 209, 0.5);
  transform: rotate(-4deg);
  opacity: 0.95;
}

.seal-text {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 2px;
  line-height: 1;
}

/* Volumes */
.volumes {
  padding: 96px 0;
  background: var(--bg);
}

.volumes-list {
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 64px;
}

.volume-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 40px;
  align-items: start;
}

.volume-item.reverse {
  direction: rtl;
}

.volume-item.reverse > * {
  direction: ltr;
}

.volume-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding-top: 6px;
}

.volume-cn {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--accent);
  font-family: 'KaiTi', 'STKaiti', serif;
  writing-mode: vertical-rl;
}

.volume-line {
  width: 1px;
  flex: 1;
  min-height: 60px;
  background: linear-gradient(180deg, var(--accent), transparent);
}

.volume-title {
  font-size: clamp(26px, 3.4vw, 36px);
  font-weight: 700;
  letter-spacing: 6px;
  color: var(--text);
  margin-bottom: 18px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.volume-desc {
  font-size: 15.5px;
  color: var(--text-muted);
  line-height: 2.3;
  letter-spacing: 0.5px;
}

/* Values */
.values {
  padding: 96px 0;
  background: linear-gradient(180deg, var(--bg) 0%, #EAF4FF 100%);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.value-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px 32px;
  text-align: center;
  position: relative;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease), box-shadow 0.4s var(--ease);
}

.value-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, #7EC8F7, #FFB7D1);
  opacity: 0.8;
}

.value-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card);
}

.value-icon {
  font-size: 40px;
  color: var(--accent);
  margin-bottom: 20px;
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1;
}

.value-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--text);
  margin-bottom: 14px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.value-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 2;
}

/* Timeline */
.timeline-section {
  padding: 96px 0;
  background: #EAF4FF;
}

.timeline {
  max-width: 820px;
  margin: 0 auto;
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #7EC8F7, #FFB7D1, transparent);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  padding-bottom: 40px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -32px;
  top: 6px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #EAF4FF;
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 4px #EAF4FF;
}

.timeline-year {
  display: inline-block;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--accent);
  margin-bottom: 6px;
  font-family: 'Courier New', monospace;
}

.timeline-event {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 2px;
  margin-bottom: 8px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.timeline-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.9;
}

/* Contact */
.contact {
  padding: 96px 0;
  background: linear-gradient(180deg, #EAF4FF 0%, var(--bg-elev) 100%);
}

.contact-inner {
  text-align: center;
}

.contact-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
  letter-spacing: 8px;
  margin-bottom: 48px;
  color: var(--text);
  font-family: 'KaiTi', 'STKaiti', serif;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: left;
}

.contact-card {
  display: block;
  padding: 32px 28px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: transform 0.35s var(--ease), border-color 0.35s var(--ease), box-shadow 0.35s var(--ease);
}

.contact-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card);
  color: inherit;
}

.contact-label {
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--accent);
  margin-bottom: 12px;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.contact-value {
  font-size: 16px;
  color: var(--text);
  letter-spacing: 1px;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.contact-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.8;
}

@media (max-width: 768px) {
  .about-hero,
  .volumes,
  .values,
  .timeline-section,
  .contact {
    padding: 64px 0;
  }

  .volume-item,
  .volume-item.reverse {
    grid-template-columns: 1fr;
    gap: 24px;
    direction: ltr;
  }

  .volume-label {
    flex-direction: row;
    align-items: center;
    gap: 14px;
  }

  .volume-cn {
    writing-mode: horizontal-tb;
  }

  .volume-line {
    width: auto;
    flex: 1;
    min-height: 1px;
    height: 1px;
    background: linear-gradient(90deg, var(--accent), transparent);
  }

  .values-grid,
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .value-card {
    padding: 28px 24px;
  }
}
</style>
