/* ============================================================
 * core.js —— 游戏状态、玩家行动、工具、弹道、敌人 AI、拾取
 * ============================================================ */
(function () {
  'use strict';
  var LX = window.LX = window.LX || {};
  var CFG = LX.CFG, T = CFG.TILE, P = CFG.P;

  var game = LX.game = {
    state: 'menu', sceneId: null, scene: null, time: 0,
    player: null,
    enemies: [], projectiles: [], boomerangs: [], bombs: [],
    pickups: [], parts: [], floaters: [],
    npcs: [], chests: [], signs: [], springs: [],
    camera: { x: 0, y: 0 },
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    flags: null,
    shake: 0,
    fade: 0, fadeDir: 0, pending: null,
    dialogue: null, shop: null, paused: false, ended: false
  };

  /* ============================================================
   * 新游戏
   * ============================================================ */
  LX.newGame = function () {
    game.player = {
      x: 0, y: 0, dir: 'down', radius: P.radius,
      moving: false,
      hearts: P.startHearts, maxHearts: P.startHearts, pieces: 0,
      rupees: 0, keys: 0, arrows: 20, bombs: 0, potions: 0,
      tools: { sword: true, boomerang: false, bow: false, bombs: false },
      curTool: 'sword',
      invuln: 0, swingT: 0, swingCD: 0, swingHits: {},
      vx: 0, vy: 0
    };
    game.enemies = []; game.projectiles = []; game.boomerangs = [];
    game.bombs = []; game.pickups = []; game.parts = []; game.floaters = [];
    game.npcs = []; game.chests = []; game.signs = []; game.springs = [];
    game.flags = {
      dead: {}, opened: {}, clear: {}, gates: {}, switches: {},
      switchCD: {}, met: {},
      boss: false, bossHP: CFG.ENEMIES.boss.hp,
      shopPiece: false, ending: false, healCD: 0
    };
    // 恢复原始地图：上一局砍掉的灌木/炸开的裂缝石/开的锁门不带入新游戏
    if (LX.Scene && LX.Scene.resetGrids) LX.Scene.resetGrids();
    game.camera = { x: 0, y: 0 };
    game.dialogue = null; game.shop = null; game.paused = false;
    game.ended = false; game.shake = 0;
  };

  /* ---------- 工具小函数 ---------- */
  function dist(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var DIRS = {
    up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
  };
  function dirVec(d) { return DIRS[d] || [0, 1]; }

  // 卡入固体时的脱困：朝最近的可行方向推出，杜绝永久卡位
  function unstick(p) {
    if (!LX.Scene.solidAt(p.x, p.y, p.radius - 1)) return;
    for (var r = 2; r <= 60; r += 2) {
      var c = [[0, -r], [r, 0], [0, r], [-r, 0]];
      for (var i = 0; i < 4; i++) {
        if (!LX.Scene.solidAt(p.x + c[i][0], p.y + c[i][1], p.radius)) {
          p.x += c[i][0]; p.y += c[i][1];
          p.vx = 0; p.vy = 0;
          return;
        }
      }
    }
  }

  LX.parts = function (x, y, color, n, spread, grav) {
    for (var i = 0; i < n; i++) {
      if (game.parts.length >= CFG.MAX_PARTS) game.parts.shift();
      var a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * spread;
      game.parts.push({
        x: x, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (grav ? 20 : 0),
        life: 0.4 + Math.random() * 0.4, max: 0.8,
        color: color, size: 1.6 + Math.random() * 2, grav: grav ? 120 : 0
      });
    }
  };
  LX.float = function (x, y, text, color, big) {
    game.floaters.push({
      x: x, y: y, vy: -34, life: 0.9, max: 0.9,
      text: text, color: color, big: !!big
    });
  };

  /* ============================================================
   * 拾取
   * ============================================================ */
  function spawnPickup(k, n, x, y, quiet) {
    var a = Math.random() * Math.PI * 2;
    game.pickups.push({
      k: k, n: n, x: x, y: y,
      vx: quiet ? 0 : Math.cos(a) * 55, vy: quiet ? 0 : Math.sin(a) * 55 - 30,
      t: Math.random() * 6, mag: false, born: 0
    });
  }
  LX.spawnPickup = spawnPickup;

  function grant(k, n) {
    var p = game.player, f = game.flags;
    switch (k) {
      case 'rupee':
        p.rupees += n; LX.float(p.x, p.y - 14, '+' + n, CFG.C.rupee); break;
      case 'heart':
        p.hearts = Math.min(p.maxHearts, p.hearts + n);
        LX.float(p.x, p.y - 14, '+' + n, CFG.C.heart); break;
      case 'container':
        p.maxHearts += 1; p.hearts = p.maxHearts;
        LX.UI.toast('心之容器：心多了一颗'); break;
      case 'piece':
        p.pieces += 1;
        if (p.pieces >= 4) {
          p.pieces = 0; p.maxHearts += 1; p.hearts = p.maxHearts;
          LX.UI.toast('集齐四片！心多了一颗');
        } else LX.UI.toast('心之碎片 ' + p.pieces + ' / 4');
        break;
      case 'key':
        p.keys += 1; LX.UI.toast('小钥匙 x1'); break;
      case 'bombs':
        if (!p.tools.bombs) {
          p.tools.bombs = true; p.curTool = 'bombs';
          LX.UI.toast('得到了爆弹');
        } else LX.UI.toast('爆弹 x' + n);
        p.bombs += n; break;
      case 'arrows':
        p.arrows += n; LX.UI.toast('光箭 x' + n); break;
      case 'potion':
        p.potions += 1; LX.UI.toast('仙露 x1'); break;
      case 'bow':
        p.tools.bow = true; p.curTool = 'bow';
        LX.UI.toast('得到了星弓'); break;
      case 'boomerang':
        p.tools.boomerang = true; p.curTool = 'boomerang';
        LX.UI.toast('得到了回力镖'); break;
    }
  }
  LX.grant = grant;

  /* ============================================================
   * 伤害
   * ============================================================ */
  function hurtEnemy(e, dmg, kx, ky, stun) {
    if (!e.alive) return;
    e.hp -= dmg; e.flash = 0.12;
    // Boss 血量持久化：玩家死亡重进房间后不回满
    if (e.def.boss) game.flags.bossHP = e.hp;
    if (!e.def.boss) {
      // 击退位移须碰撞感知，不能把敌人推进树/岩石里卡死
      var ddx = kx * 10, ddy = ky * 10;
      if (ddx !== 0 && !LX.Scene.solidAt(e.x + ddx, e.y, e.radius)) e.x += ddx;
      if (ddy !== 0 && !LX.Scene.solidAt(e.x, e.y + ddy, e.radius)) e.y += ddy;
    }
    if (stun && !e.def.boss) e.stun = Math.max(e.stun, stun);
    LX.parts(e.x, e.y, '#FFFFFF', 4, 60);
    // 命中飘字：血条每击仅移动 5%，数字是最直接的掉血反馈
    LX.float(e.x, e.y - e.radius - 6, '-' + dmg, '#FFFFFF');
    if (e.hp <= 0) killEnemy(e);
  }
  LX.hurtEnemy = hurtEnemy;

  function killEnemy(e) {
    e.alive = false;
    game.flags.dead[game.sceneId + '#' + e.uid] = true;
    LX.parts(e.x, e.y, e.def.color, 12, 90, true);
    var r = e.def.rupee;
    if (r) spawnPickup('rupee', r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)), e.x, e.y);
    if (Math.random() < CFG.DROP_HEART_CHANCE) spawnPickup('heart', 1, e.x + 8, e.y);
    if (e.grp) LX.Scene.onRoomEnemyGone(e.grp);
    if (e.def.boss) onBossDown();
  }

  function hurtPlayer(dmg, sx, sy) {
    var p = game.player;
    if (p.invuln > 0 || game.fade > 0.3) return false;
    // dmg 以「半心」为单位（config 契约：1=半心，2=一心）
    p.hearts -= dmg * 0.5;
    p.invuln = P.invuln;
    game.shake = 0.35;
    var dx = p.x - sx, dy = p.y - sy, d = Math.sqrt(dx * dx + dy * dy) || 1;
    p.vx = dx / d * 170; p.vy = dy / d * 170;
    LX.float(p.x, p.y - 14, '-' + dmg, '#FF6F6F', true);
    LX.parts(p.x, p.y, '#FF9E8A', 8, 80);
    if (p.hearts <= 0) {
      p.hearts = 0;
      game.state = 'dead';
      LX.UI.showDeath();
    }
    return true;
  }
  LX.hurtPlayer = hurtPlayer;

  /* ============================================================
   * 剑
   * ============================================================ */
  LX.swing = function (faceX, faceY) {
    var p = game.player;
    if (p.swingCD > 0) return;
    if (faceX !== undefined) {
      var dx = faceX - p.x, dy = faceY - p.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) {
        p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up');
      }
    }
    p.swingT = P.swingTime; p.swingCD = P.swingCD; p.swingHits = {};
  };

  function swordHit(p) {
    var v = dirVec(p.dir), cx = p.x + v[0] * 14, cy = p.y + v[1] * 14;
    // 敌人
    game.enemies.forEach(function (e) {
      if (!e.alive || p.swingHits[e.uid]) return;
      var d = dist(e.x, e.y, cx, cy);
      if (d < P.swingReach + e.radius) {
        p.swingHits[e.uid] = 1;
        hurtEnemy(e, 1, v[0], v[1], 0.25);
      }
    });
    // 砍灌木
    LX.Scene.cutArc(cx, cy, P.swingReach, v, p.dir);
    // 剑击开关
    LX.Scene.hitSwitch(cx, cy);
  }

  /* ============================================================
   * 工具
   * ============================================================ */
  LX.useTool = function (tool) {
    var p = game.player;
    tool = tool || p.curTool;
    switch (tool) {
      case 'boomerang':
        if (!p.tools.boomerang) return;
        var v = dirVec(p.dir);
        game.boomerangs.push({
          x: p.x, y: p.y, vx: v[0] * CFG.TOOLS.boomerang.speed,
          vy: v[1] * CFG.TOOLS.boomerang.speed, t: 0, spin: 0
        });
        break;
      case 'bow':
        if (!p.tools.bow || p.arrows <= 0) { LX.UI.toast(p.arrows <= 0 ? '光箭用完了' : '还没有星弓'); return; }
        p.arrows--;
        var a = dirVec(p.dir);
        game.projectiles.push({
          x: p.x + a[0] * 10, y: p.y + a[1] * 10,
          vx: a[0] * CFG.TOOLS.bow.arrowSpeed, vy: a[1] * CFG.TOOLS.bow.arrowSpeed,
          life: CFG.TOOLS.bow.arrowLife, friendly: true, dmg: 1, type: 'arrow', radius: 5
        });
        break;
      case 'bombs':
        if (p.bombs <= 0) { LX.UI.toast('没有爆弹'); return; }
        var bv = dirVec(p.dir), bx = p.x + bv[0] * 20, by = p.y + bv[1] * 20;
        if (LX.Scene.solidAt(bx, by, 8)) { bx = p.x; by = p.y; }
        if (LX.Scene.solidAt(bx, by, 8)) return;
        p.bombs--;
        game.bombs.push({ x: bx, y: by, fuse: CFG.TOOLS.bombs.fuse });
        break;
      case 'potion':
        if (p.potions <= 0) { LX.UI.toast('没有仙露'); return; }
        if (p.hearts >= p.maxHearts) { LX.UI.toast('心是满的'); return; }
        p.potions--; p.hearts = p.maxHearts;
        LX.parts(p.x, p.y, CFG.C.pink, 16, 80);
        LX.float(p.x, p.y - 14, '治愈', CFG.C.heart, true);
        break;
    }
  };

  /* ============================================================
   * Boss 击倒
   * ============================================================ */
  function onBossDown() {
    var f = game.flags;
    f.boss = true;
    // 内门 G 打开（通往汐音内室）
    f.gates['24,3'] = true;
    // 心之容器（落在战场内）
    spawnPickup('container', 1, 25 * T, 8 * T, true);
    LX.UI.toast('乌有王化作了一摊纸牌');
  }

  /* ============================================================
   * 敌人 AI
   * ============================================================ */
  function moveEnemy(e, dt) {
    var nx = e.x + e.vx * dt, ny = e.y + e.vy * dt;
    if (!LX.Scene.solidAt(nx, e.y, e.radius)) e.x = nx; else e.vx = 0;
    if (!LX.Scene.solidAt(e.x, ny, e.radius)) e.y = ny; else e.vy = 0;
    // 防卡角：两轴都被墙挡住、且有明确移动意图时，沿墙朝玩家方向滑出
    // （1 格宽门口两侧的墙会对大体型敌人形成楔形死角，如乌有王冲锋后）
    if (Math.abs(e.vx) < 4 && Math.abs(e.vy) < 4 &&
        (e.stun || 0) <= 0 && e.def.ai !== 'shooter') {
      var wp = game.player;
      var ang = Math.atan2(wp.y - e.y, wp.x - e.x);
      var cands = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      cands.sort(function (a, b) {
        return (Math.cos(ang) * b[0] + Math.sin(ang) * b[1]) -
          (Math.cos(ang) * a[0] + Math.sin(ang) * a[1]);
      });
      for (var k = 0; k < 4; k++) {
        var sx = e.x + cands[k][0] * 5, sy = e.y + cands[k][1] * 5;
        if (!LX.Scene.solidAt(sx, sy, e.radius)) { e.x = sx; e.y = sy; break; }
      }
    }
    e.x = clamp(e.x, e.radius, game.scene.w * T - e.radius);
    e.y = clamp(e.y, e.radius, game.scene.h * T - e.radius);
  }

  function aiUpdate(e, dt, p) {
    var d = dist(p.x, p.y, e.x, e.y);
    e.t += dt;
    switch (e.def.ai) {
      case 'hop':
        e.vx *= 0.86; e.vy *= 0.86;
        if (e.t > 1.0 && d < 6 * T) {
          e.t = 0;
          var ang = Math.atan2(p.y - e.y, p.x - e.x);
          e.vx = Math.cos(ang) * e.speed; e.vy = Math.sin(ang) * e.speed;
          LX.parts(e.x, e.y + 8, '#FFFFFF', 3, 30);
        }
        break;
      case 'wander':
        if (d < 3.4 * T) {
          var a2 = Math.atan2(p.y - e.y, p.x - e.x);
          e.vx = Math.cos(a2) * e.speed; e.vy = Math.sin(a2) * e.speed;
        } else if (e.t > 2.2) {
          e.t = 0;
          var a3 = Math.random() * Math.PI * 2;
          e.vx = Math.cos(a3) * e.speed * 0.6;
          e.vy = Math.sin(a3) * e.speed * 0.6;
        }
        break;
      case 'sine': {
        var base = Math.atan2(p.y - e.y, p.x - e.x);
        var per = base + Math.PI / 2;
        var sp = e.speed * (d < 5 * T ? 1 : 0.4);
        e.vx = (Math.cos(base) + Math.cos(per) * Math.sin(e.t * 4) * 0.8) * sp;
        e.vy = (Math.sin(base) + Math.sin(per) * Math.sin(e.t * 4) * 0.8) * sp;
        break;
      }
      case 'shooter':
        e.vx = 0; e.vy = 0;
        e.cd -= dt;
        if (e.cd <= 0 && d < 7 * T) {
          e.cd = e.def.shootCD;
          var a4 = Math.atan2(p.y - e.y, p.x - e.x);
          game.projectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(a4) * e.def.boltSpeed, vy: Math.sin(a4) * e.def.boltSpeed,
            life: 3, friendly: false, dmg: 1, type: 'spore', radius: 6
          });
        }
        break;
      case 'lunge':
        e.vx *= 0.8; e.vy *= 0.8;
        e.cd -= dt;
        if (e.phase === 'wind') {
          e.wind -= dt;
          if (e.wind <= 0) {
            e.phase = 'go';
            var a5 = Math.atan2(p.y - e.y, p.x - e.x);
            e.vx = Math.cos(a5) * e.def.lungeSpeed * CFG.BURST_SPEED_SCALE;
            e.vy = Math.sin(a5) * e.def.lungeSpeed * CFG.BURST_SPEED_SCALE;
          }
        } else if (e.phase === 'go') {
          if (Math.abs(e.vx) + Math.abs(e.vy) < 60) e.phase = 'idle', e.cd = e.def.lungeCD;
        } else if (e.cd <= 0 && d < 4.2 * T) {
          e.phase = 'wind'; e.wind = 0.5;
        }
        break;
      case 'boss':
        bossAI(e, dt, p, d);
        break;
    }
  }

  /* ---------- Boss：乌有王 ---------- */
  function bossAI(e, dt, p, d) {
    e.cd -= dt; e.spell -= dt; e.sumCD -= dt;
    if (e.phase === 'cast') {
      // 施法不动
      if (e.cd <= 0) {
        e.phase = 'idle';
        var base = Math.atan2(p.y - e.y, p.x - e.x);
        for (var i = -1; i <= 1; i++) {
          var a = base + i * 0.32;
          game.projectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 175, vy: Math.sin(a) * 175,
            life: 3.4, friendly: false, dmg: 1, type: 'card', radius: 6
          });
        }
      }
      return;
    }
    // 残血冲刺：先原地预警 0.6 秒（可被侧向躲开），再沿预警方向突进
    if (e.phase === 'wind') {
      e.wind -= dt;
      e.vx *= 0.6; e.vy *= 0.6;
      if (e.wind <= 0) {
        e.phase = 'charge';
        var ca2 = Math.atan2(p.y - e.y, p.x - e.x);
        var cs = 280 * CFG.BURST_SPEED_SCALE;
        e.vx = Math.cos(ca2) * cs; e.vy = Math.sin(ca2) * cs;
        e.chargeT = 0.55;
      }
      return;
    }
    if (e.phase === 'charge') {
      e.chargeT -= dt;
      if (e.chargeT <= 0 || (Math.abs(e.vx) < 30 && Math.abs(e.vy) < 30))
        e.phase = 'idle';
      return;   // 保持冲刺惯性
    }
    // 朝玩家缓移
    var ang = Math.atan2(p.y - e.y, p.x - e.x);
    e.vx = Math.cos(ang) * e.speed; e.vy = Math.sin(ang) * e.speed;
    // 周期施法
    if (e.spell <= 0 && d < 9 * T) {
      e.phase = 'cast'; e.cd = 0.7;
      e.spell = e.hp < 12 ? 2.4 : 3.4;
    }
    // 低血召蝠
    if (e.hp < 12 && e.sumCD <= 0) {
      e.sumCD = 8;
      var bats = game.enemies.filter(function (x) { return x.alive && x.def.ai === 'sine'; }).length;
      if (bats < 3) {
        LX.Scene.spawnAt('bat', e.x + 30, e.y, 'B');
        LX.Scene.spawnAt('bat', e.x - 30, e.y, 'B');
      }
    }
    // 残血冲刺（中远距离才发动，避免贴脸必中）
    if (e.hp < 6 && e.chargeCD === undefined) e.chargeCD = 4;
    if (e.chargeCD !== undefined) {
      e.chargeCD -= dt;
      if (e.chargeCD <= 0 && d > 2.2 * T && d < 7 * T) {
        e.chargeCD = 5.5;
        e.phase = 'wind'; e.wind = 0.6;
      }
    }
  }

  /* ============================================================
   * 玩家移动
   * ============================================================ */
  function updatePlayer(p, dt) {
    var ix = 0, iy = 0;
    if (game.keys.w || game.keys.arrowup) iy -= 1;
    if (game.keys.s || game.keys.arrowdown) iy += 1;
    if (game.keys.a || game.keys.arrowleft) ix -= 1;
    if (game.keys.d || game.keys.arrowright) ix += 1;
    p.moving = ix !== 0 || iy !== 0;
    if (p.moving) {
      if (ix && iy) { ix *= 0.707; iy *= 0.707; }
      if (Math.abs(ix) > Math.abs(iy) && iy === 0 || ix !== 0 && Math.abs(ix) >= Math.abs(iy))
        p.dir = ix > 0 ? 'right' : 'left';
      else p.dir = iy > 0 ? 'down' : 'up';
      var nx = p.x + ix * P.speed * dt, ny = p.y + iy * P.speed * dt;
      if (!LX.Scene.solidAt(nx, p.y, p.radius)) p.x = nx;
      if (!LX.Scene.solidAt(p.x, ny, p.radius)) p.y = ny;
    }
    // 击退位移（碰撞感知：不会被推入岩石/墙内卡死）
    var kdx = p.vx * dt, kdy = p.vy * dt;
    if (kdx !== 0 && !LX.Scene.solidAt(p.x + kdx, p.y, p.radius)) p.x += kdx;
    else p.vx = 0;
    if (kdy !== 0 && !LX.Scene.solidAt(p.x, p.y + kdy, p.radius)) p.y += kdy;
    else p.vy = 0;
    p.vx *= 0.82; p.vy *= 0.82;
    p.x = clamp(p.x, p.radius, game.scene.w * T - p.radius);
    p.y = clamp(p.y, p.radius, game.scene.h * T - p.radius);
    unstick(p);

    if (p.invuln > 0) p.invuln -= dt;
    if (p.swingCD > 0) p.swingCD -= dt;
    if (p.swingT > 0) {
      p.swingT -= dt;
      swordHit(p);
    }
  }

  /* ============================================================
   * 弹道 / 回力镖 / 爆弹 / 拾取 / 粒子 更新
   * ============================================================ */
  function updateProjectiles(dt) {
    for (var i = game.projectiles.length - 1; i >= 0; i--) {
      var b = game.projectiles[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      var dead = b.life <= 0 || LX.Scene.solidAt(b.x, b.y, 2, true);
      if (b.friendly) {
        // 箭矢可触发开关（远射机关），每支箭只触发一次
        b.memo = b.memo || {};
        LX.Scene.hitSwitch(b.x, b.y, b.memo);
        game.enemies.forEach(function (e) {
          if (e.alive && dist(e.x, e.y, b.x, b.y) < e.radius + b.radius) {
            var a = Math.atan2(b.vy, b.vx);
            hurtEnemy(e, b.dmg, Math.cos(a), Math.sin(a), 0.5);
            dead = true;
          }
        });
      } else {
        var p = game.player;
        if (p.invuln <= 0 && dist(p.x, p.y, b.x, b.y) < p.radius + b.radius) {
          hurtPlayer(b.dmg, b.x, b.y); dead = true;
        }
      }
      if (dead) {
        LX.parts(b.x, b.y, b.friendly ? '#BFE4FF' : '#E8B7C9', 3, 40);
        game.projectiles.splice(i, 1);
      }
    }
  }

  function updateBoomerangs(dt, p) {
    for (var i = game.boomerangs.length - 1; i >= 0; i--) {
      var b = game.boomerangs[i];
      b.t += dt; b.spin += dt * 14;
      if (b.t > CFG.TOOLS.boomerang.outTime) {
        var a = Math.atan2(p.y - b.y, p.x - b.x);
        b.vx = Math.cos(a) * 380; b.vy = Math.sin(a) * 380;
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      // 撞墙即回（矮栅栏可飞过）
      if (LX.Scene.solidAt(b.x, b.y, 3, true)) b.t = Math.max(b.t, CFG.TOOLS.boomerang.outTime);
      // 打晕敌人；对 Boss 改为造成 1 点伤害（乌有王免疫眩晕但不再免疫回力镖）
      // 同一只回力镖对同一目标只结算一次伤害（防止重叠期每帧连击秒杀）
      b.hit = b.hit || {};
      game.enemies.forEach(function (e) {
        if (e.alive && !b.hit[e.uid] && dist(e.x, e.y, b.x, b.y) < e.radius + 9) {
          if (e.def.boss) { b.hit[e.uid] = 1; hurtEnemy(e, 1, 0, 0, 0); }
          else {
            e.stun = CFG.TOOLS.boomerang.stun;
            LX.parts(e.x, e.y, '#FFFFFF', 3, 40);
          }
        }
      });
      // 开关（同一只回力镖对每个开关只触发一次）
      b.memo = b.memo || {};
      LX.Scene.hitSwitch(b.x, b.y, b.memo);
      // 磁吸拾取
      game.pickups.forEach(function (pk) {
        if (dist(pk.x, pk.y, b.x, b.y) < 20) pk.mag = true;
      });
      if (b.t > CFG.TOOLS.boomerang.outTime && dist(p.x, p.y, b.x, b.y) < 14)
        game.boomerangs.splice(i, 1);
    }
  }

  function updateBombs(dt) {
    for (var i = game.bombs.length - 1; i >= 0; i--) {
      var b = game.bombs[i];
      b.fuse -= dt;
      if (b.fuse <= 0) {
        game.bombs.splice(i, 1);
        game.shake = 0.4;
        var R = CFG.TOOLS.bombs.radius;
        LX.parts(b.x, b.y, '#FFE3A3', 18, 130);
        LX.parts(b.x, b.y, '#FFFFFF', 10, 100);
        game.enemies.forEach(function (e) {
          if (e.alive && dist(e.x, e.y, b.x, b.y) < R + e.radius)
            hurtEnemy(e, 2, 0, 0, 0.6);
        });
        var p = game.player;
        if (dist(p.x, p.y, b.x, b.y) < R - 6) hurtPlayer(1, b.x, b.y);
        LX.Scene.explodeAt(b.x, b.y, R);
      }
    }
  }

  function updatePickups(dt) {
    var p = game.player;
    for (var i = game.pickups.length - 1; i >= 0; i--) {
      var pk = game.pickups[i];
      pk.born += dt; pk.t += dt;
      if (pk.mag) {
        var a = Math.atan2(p.y - pk.y, p.x - pk.x);
        pk.vx = Math.cos(a) * 230; pk.vy = Math.sin(a) * 230;
      } else {
        pk.vx *= 0.9; pk.vy *= 0.9;
        if (dist(p.x, p.y, pk.x, pk.y) < 34) pk.mag = true;
      }
      pk.x += pk.vx * dt; pk.y += pk.vy * dt;
      if (LX.Scene.solidAt(pk.x, pk.y, 3)) { pk.vx = 0; pk.vy = 0; }
      if (dist(p.x, p.y, pk.x, pk.y) < p.radius + 6) {
        grant(pk.k, pk.n);
        LX.parts(pk.x, pk.y, '#FFFFFF', 4, 40);
        game.pickups.splice(i, 1);
      }
    }
  }

  function updateMisc(dt) {
    for (var i = game.parts.length - 1; i >= 0; i--) {
      var q = game.parts[i];
      q.life -= dt;
      q.vy += q.grav * dt;
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.life <= 0) game.parts.splice(i, 1);
    }
    for (var j = game.floaters.length - 1; j >= 0; j--) {
      var f = game.floaters[j];
      f.life -= dt; f.y += f.vy * dt;
      if (f.life <= 0) game.floaters.splice(j, 1);
    }
    if (game.shake > 0) game.shake -= dt;
    game.flags.healCD = Math.max(0, game.flags.healCD - dt);
  }

  /* ============================================================
   * 敌人脱困：出生点在墙内/闸门关闭嵌入时自动推出
   * ============================================================ */
  function enemyUnstick(e) {
    if (!LX.Scene.solidAt(e.x, e.y, e.radius - 2)) return;
    for (var r = 2; r <= 80; r += 2) {
      var c = [[0, -r], [r, 0], [0, r], [-r, 0]];
      for (var i = 0; i < 4; i++) {
        if (!LX.Scene.solidAt(e.x + c[i][0], e.y + c[i][1], e.radius - 2)) {
          e.x += c[i][0]; e.y += c[i][1];
          e.vx = 0; e.vy = 0;
          return;
        }
      }
    }
  }

  /* ============================================================
   * 主更新（仅 playing 且无对话/商店时由 main loop 调用）
   * ============================================================ */
  LX.CoreUpdate = function (dt) {
    game.time += dt;
    var p = game.player;
    updatePlayer(p, dt);

    // 敌人
    game.enemies.forEach(function (e) {
      if (!e.alive) return;
      enemyUnstick(e);
      e.flash = Math.max(0, e.flash - dt);
      if (e.stun > 0) {
        e.stun -= dt;
        e.vx *= 0.8; e.vy *= 0.8;
      } else aiUpdate(e, dt, p);
      moveEnemy(e, dt);
      // 接触伤害（独立 touchCD 字段，不与 Boss 施法/卫兵突刺共用的 cd 冲突）
      e.touchCD = (e.touchCD || 0) - dt;
      if (e.touchCD <= 0 && dist(e.x, e.y, p.x, p.y) < e.radius + p.radius) {
        if (hurtPlayer(e.def.dmg, e.x, e.y)) e.touchCD = P.touchCD;
      }
    });

    updateProjectiles(dt);
    updateBoomerangs(dt, p);
    updateBombs(dt);
    updatePickups(dt);
    updateMisc(dt);

    // 温泉
    game.springs.forEach(function (s) {
      if (dist(s.x, s.y, p.x, p.y) < 22 && p.hearts < p.maxHearts) {
        if (!s.tick || s.tick <= 0) {
          s.tick = 0.7;
          p.hearts = Math.min(p.maxHearts, p.hearts + 1);
          LX.parts(p.x, p.y - 6, CFG.C.mint, 4, 50);
          LX.float(p.x, p.y - 14, '+1', CFG.C.heart);
        }
      }
      s.tick = (s.tick || 0) - dt;
    });
  };
})();
