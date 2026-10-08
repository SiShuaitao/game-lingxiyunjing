/* ============================================================
 * config.js —— 全局配置：色板、数值、工具与敌人定义
 * 全局命名空间 LX，经典顺序脚本加载，file:// 可直接运行
 * ============================================================ */
(function () {
  'use strict';
  var LX = window.LX = window.LX || {};

  LX.CFG = {
    STORAGE_KEY: 'lingxi_game_save_v1',
    FADE_MS: 420,

    TILE: 24,                 // 瓦片像素

    /* ---------- 敌人速度全局倍率（唯一调参入口，勿在 AI 内散落硬编码） ---------- */
    ENEMY_SPEED_SCALE: 0.12,  // 巡航/移动速度倍率（慢速·当前的 1/3）
    BURST_SPEED_SCALE: 0.125, // 突刺/冲锋等爆发位移倍率（慢速·当前的 1/3）

    /* ---------- 马卡龙色板 ---------- */
    C: {
      text: '#3A4A66',
      muted: '#6B7C9C',
      accent: '#5EB2EE',
      pink: '#FFB7D1',
      mint: '#9FE8C9',
      violet: '#C9B8F0',
      cream: '#FFE3A3',
      heart: '#FF6F9E',
      rupee: '#53C79B',
      key: '#F2B24E'
    },

    /* ---------- 玩家 ---------- */
    P: {
      radius: 9,
      speed: 134,
      startHearts: 5,
      invuln: 0.95,           // 受击无敌秒
      touchCD: 0.85,           // 敌人接触伤害间隔
      swingTime: 0.22,
      swingCD: 0.30,
      swingReach: 24,
      swingArc: 1.45
    },

    /* ---------- 工具 ---------- */
    TOOLS: {
      boomerang: {
        name: '回力镖', key: '1', speed: 308, outTime: 0.52,
        stun: 1.9, desc: '打晕敌人 · 隔空取物'
      },
      bow: {
        name: '星弓', key: '2', arrowSpeed: 405, arrowLife: 1.7,
        desc: '远程射击 · 消耗光箭'
      },
      bombs: {
        name: '爆弹', key: '3', fuse: 1.5, radius: 38,
        desc: '轰开裂缝 · 范围伤害'
      },
      potion: {
        name: '仙露', key: '4', desc: '回复全部心'
      }
    },

    /* ---------- 敌人（hp 为受击次数，dmg 为半心数） ---------- */
    ENEMIES: {
      slime: {
        name: '果冻怪', hp: 2, dmg: 1, speed: 46, radius: 10,
        rupee: [1, 4], ai: 'hop', color: '#A5E0A0'
      },
      blueslime: {
        name: '薄荷冻', hp: 3, dmg: 1, speed: 60, radius: 11,
        rupee: [2, 5], ai: 'hop', color: '#8FDCE4'
      },
      beetle: {
        name: '硬壳甲虫', hp: 3, dmg: 1, speed: 78, radius: 10,
        rupee: [2, 4], ai: 'wander', color: '#D89A6F'
      },
      bat: {
        name: '夜蝠', hp: 1, dmg: 1, speed: 118, radius: 8,
        rupee: [1, 3], ai: 'sine', color: '#AE9ED8'
      },
      shroom: {
        name: '孢子精', hp: 3, dmg: 1, speed: 0, radius: 12,
        rupee: [3, 6], ai: 'shooter', shootCD: 2.4, boltSpeed: 165,
        color: '#E89ABE'
      },
      card: {
        name: '纸牌卫兵', hp: 4, dmg: 2, speed: 70, radius: 11,
        rupee: [4, 8], ai: 'lunge', lungeCD: 2.6, lungeSpeed: 330,
        color: '#F08CAE'
      },
      boss: {
        name: '乌有王', hp: 20, dmg: 1, speed: 60, radius: 26,
        rupee: [30, 30], ai: 'boss', color: '#E888A8', boss: true
      }
    },

    DROP_HEART_CHANCE: 0.12,
    MAX_PARTS: 260
  };
})();
