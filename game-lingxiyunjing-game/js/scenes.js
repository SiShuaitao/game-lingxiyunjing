/* ============================================================
 * scenes.js —— SceneManager：碰撞、进出、交互、机关、裂缝
 * ============================================================ */
(function () {
  'use strict';
  var LX = window.LX = window.LX || {};
  var CFG = LX.CFG, T = CFG.TILE;
  var game = LX.game;

  var SM = LX.Scene = {};

  /* ---------- 开关 → 它管辖的闸门 ---------- */
  var SWITCH_MAP = {
    '28,17': [[23, 14], [24, 14], [25, 14], [23, 15], [25, 15],
      [23, 16], [24, 16], [25, 16]],
    '10,6': [[11, 4], [12, 4], [13, 4]]
  };

  /* ---------- 原始地图快照：新游戏时恢复被砍/被炸/被开的格子 ----------
   * 本脚本在 data.js 之后加载，执行时 LX.DATA.SCENES 已是原始状态 */
  var origGrids = {};
  (function () {
    var scenes = LX.DATA && LX.DATA.SCENES;
    if (!scenes) return;
    Object.keys(scenes).forEach(function (id) {
      origGrids[id] = scenes[id].g.map(function (row) { return row.slice(); });
    });
  })();

  SM.resetGrids = function () {
    Object.keys(origGrids).forEach(function (id) {
      var sc = LX.DATA.SCENES[id], orig = origGrids[id];
      for (var y = 0; y < orig.length; y++)
        sc.g[y] = orig[y].slice();
    });
  };

  /* ============================================================
   * 瓦片碰撞
   * ============================================================ */
  function gateOpen(tx, ty) {
    return !!game.flags.gates[tx + ',' + ty];
  }

  function tileSolid(ch, tx, ty, fly) {
    if (game.scene.indoor) {
      if (ch === 'X' || ch === 'L') return true;
      if (ch === 'g') return !fly;   // 矮栅栏：飞行物可过
      if (ch === 'G') return !gateOpen(tx, ty);
      return false;
    }
    return ch === 'T' || ch === 'W' || ch === '#' || ch === 'c';
  }

  SM.solidAt = function (px, py, r, fly) {
    r = r || 6;
    var sc = game.scene;
    var x0 = Math.floor((px - r) / T), x1 = Math.floor((px + r) / T);
    var y0 = Math.floor((py - r) / T), y1 = Math.floor((py + r) / T);
    for (var ty = y0; ty <= y1; ty++)
      for (var tx = x0; tx <= x1; tx++) {
        if (ty < 0 || tx < 0 || ty >= sc.h || tx >= sc.w) return true;
        if (tileSolid(sc.g[ty][tx], tx, ty, fly)) return true;
      }
    return false;
  };

  /* ============================================================
   * 实体生成
   * ============================================================ */
  function makeEnemy(kind, tx, ty, uid, grp) {
    var def = CFG.ENEMIES[kind];
    return {
      uid: uid, def: def, kind: kind, grp: grp || null,
      x: tx * T + T / 2, y: ty * T + T / 2,
      hp: def.hp, radius: def.radius, speed: def.speed * CFG.ENEMY_SPEED_SCALE,
      vx: 0, vy: 0, dir: 'down', t: Math.random() * 2, cd: 0, touchCD: 0,
      stun: 0, flash: 0, alive: true,
      phase: 'idle', wind: 0, chargeCD: undefined,
      spell: 3, sumCD: 5
    };
  }
  SM.spawnAt = function (kind, x, y, grp) {
    var e = makeEnemy(kind, 0, 0, game.sceneId + '#s' + Math.random().toString(36).slice(2, 7), grp);
    e.x = x; e.y = y;
    game.enemies.push(e);
    return e;
  };

  /* ============================================================
   * 进入场景
   * ============================================================ */
  SM.enterScene = function (id, tx, ty) {
    var sc = LX.DATA.SCENES[id];
    var f = game.flags;
    game.sceneId = id;
    game.scene = sc;
    game.enemies = []; game.projectiles = []; game.boomerangs = [];
    game.bombs = []; game.pickups = [];
    game.npcs = []; game.chests = []; game.springs = []; game.signs = [];

    // 还原已开的锁门
    (f.openedL || []).forEach(function (key) {
      var parts = key.split('@');
      if (parts[0] === id) {
        var xy = parts[1].split(',');
        sc.g[+xy[1]][+xy[0]] = 'o';
      }
    });

    sc.objs.forEach(function (o, i) {
      var x = o.tx * T + T / 2, y = o.ty * T + T / 2;
      if (o.t === 'enemy') {
        // 地牢：已清掉的敌人不再刷
        if (sc.indoor && f.dead[id + '#' + id + i]) return;
        var e = makeEnemy(o.kind, o.tx, o.ty, id + i, o.grp);
        // Boss 续战：恢复此前已打掉的血量，不随玩家死亡回满
        if (o.kind === 'boss' && typeof f.bossHP === 'number')
          e.hp = Math.max(1, Math.min(e.def.hp, f.bossHP));
        game.enemies.push(e);
      } else if (o.t === 'npc') {
        game.npcs.push(Object.assign({ x: x, y: y }, o));
      } else if (o.t === 'shop') {
        game.npcs.push({ x: x, y: y, t: 'shop', name: o.name, kind: 'shop' });
      } else if (o.t === 'chest') {
        game.chests.push({
          x: x, y: y, id: o.id, item: o.item,
          needClear: o.needClear,
          opened: !!f.opened[id + o.id]
        });
      } else if (o.t === 'spring') game.springs.push({ x: x, y: y, tick: 0 });
      else if (o.t === 'sign') game.signs.push({ x: x, y: y, text: o.text });
    });

    // 玩家位置
    var p = game.player;
    var spot = tx !== undefined ? { tx: tx, ty: ty } : sc.start;
    p.x = spot.tx * T + T / 2;
    p.y = spot.ty * T + T / 2;
    p.vx = 0; p.vy = 0; p.invuln = 0.4;
    snapCamera();
  };

  function snapCamera() {
    var p = game.player, sc = game.scene;
    game.camera.x = clampCam(p.x - game.view.w / 2, sc.w * T, game.view.w);
    game.camera.y = clampCam(p.y - game.view.h / 2, sc.h * T, game.view.h);
  }
  function clampCam(v, worldW, viewSize) {
    if (worldW <= viewSize) return (worldW - viewSize) / 2;
    return Math.max(0, Math.min(worldW - viewSize, v));
  }

  /* ============================================================
   * 交互（E）
   * ============================================================ */
  function nearest(list, range) {
    var p = game.player, best = null, bd = range;
    list.forEach(function (o) {
      var dx = o.x - p.x, dy = o.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = o; }
    });
    return best;
  }

  SM.interact = function () {
    if (game.time - (game._lastTalk || -9) < 0.9) return;
    game._lastTalk = game.time;
    var n = nearest(game.npcs, 24);
    if (n) {
      if (n.t === 'shop') { LX.UI.openShop(n); return; }
      if (n.need === 'boss' && !game.flags.boss) return;
      LX.UI.openDialogue(n);
      return;
    }
    var c = nearest(game.chests, 22);
    if (c && !c.opened) { openChest(c); return; }
    var s = nearest(game.signs, 20);
    if (s) { LX.UI.toast(s.text, 2600); return; }
  };

  function openChest(c) {
    if (c.needClear && !game.flags.clear[c.needClear]) {
      LX.UI.toast('宝箱锁着——这屋里的敌人还没解决');
      return;
    }
    c.opened = true;
    game.flags.opened[game.sceneId + c.id] = true;
    LX.parts(c.x, c.y - 4, '#FFE3A3', 10, 80);
    LX.spawnPickup(c.item.k, c.item.n || 1, c.x, c.y - 6);
  }

  /* ============================================================
   * 锁门 L：走近即尝试用小钥匙
   * ============================================================ */
  var lockedCache = {};
  function lockedTiles(sc) {
    if (lockedCache[sc.id]) return lockedCache[sc.id];
    var list = [];
    for (var y = 0; y < sc.h; y++)
      for (var x = 0; x < sc.w; x++)
        if (sc.g[y][x] === 'L') list.push([x, y]);
    lockedCache[sc.id] = list;
    return list;
  }

  function checkLocked(dt) {
    var p = game.player, list = lockedTiles(game.scene);
    game._lToast = Math.max(0, (game._lToast || 0) - dt);
    list.forEach(function (xy) {
      // 已开的门不再判定（缓存列表不会自动更新）
      if (game.scene.g[xy[1]][xy[0]] !== 'L') return;
      var cx = xy[0] * T + T / 2, cy = xy[1] * T + T / 2;
      var d = Math.hypot(cx - p.x, cy - p.y);
      // 贴墙时玩家圆心到门中心最近为 21px，阈值须大于该值才能触发
      if (d < 26) {
        if (p.keys > 0) {
          p.keys--;
          game.scene.g[xy[1]][xy[0]] = 'o';
          game.flags.openedL = game.flags.openedL || [];
          game.flags.openedL.push(game.sceneId + '@' + xy[0] + ',' + xy[1]);
          LX.parts(cx, cy, CFG.C.cream, 8, 70);
          LX.UI.toast('小钥匙转开了锁');
        } else if (game._lToast <= 0) {
          game._lToast = 1.4;
          LX.UI.toast('门锁着，需要小钥匙');
        }
      }
    });
  }

  /* ============================================================
   * 开关
   * ============================================================ */
  SM.hitSwitch = function (px, py, memo) {
    var tx = Math.floor(px / T), ty = Math.floor(py / T);
    var key = tx + ',' + ty, f = game.flags;
    // 飞行实体备忘：同一实体对同一开关只生效一次
    // （回力镖返程再次经过时不会把刚打开的机关又关回去）
    if (memo) {
      if (memo[key]) return;
      memo[key] = 1;
    }
    if ((f.switchCD[key] || 0) > game.time) return;
    if (game.scene.g[ty] && game.scene.g[ty][tx] === 'S') {
      f.switchCD[key] = game.time + 0.6;
      var gates = SWITCH_MAP[key];
      if (!gates) return;
      var on = !f.switches[key];
      f.switches[key] = on;
      gates.forEach(function (gxy) {
        f.gates[gxy[0] + ',' + gxy[1]] = on;
        LX.parts(gxy[0] * T + T / 2, gxy[1] * T + T / 2,
          on ? '#9FE8C9' : '#FFB7D1', 5, 60);
      });
    }
  };

  /* ============================================================
   * 房间清敌
   * ============================================================ */
  SM.onRoomEnemyGone = function (grp) {
    var remain = game.enemies.some(function (e) {
      return e.alive && e.grp === grp;
    });
    if (!remain && !game.flags.clear[grp]) {
      game.flags.clear[grp] = true;
      LX.UI.toast('屋里安静了——好像有什么打开了');
    }
  };

  /* ============================================================
   * 砍灌木
   * ============================================================ */
  SM.cutArc = function (cx, cy, reach, v, dir) {
    var sc = game.scene;
    var x0 = Math.floor((cx - reach) / T), x1 = Math.floor((cx + reach) / T);
    var y0 = Math.floor((cy - reach) / T), y1 = Math.floor((cy + reach) / T);
    for (var ty = y0; ty <= y1; ty++)
      for (var tx = x0; tx <= x1; tx++) {
        if (ty < 0 || tx < 0 || ty >= sc.h || tx >= sc.w) continue;
        if (sc.g[ty][tx] !== 'b') continue;
        var px = tx * T + T / 2, py = ty * T + T / 2;
        var d = Math.hypot(px - cx, py - cy);
        if (d > reach + 10) continue;
        // 方向弧判定
        var dx = px - game.player.x, dy = py - game.player.y;
        var dot = (dx * v[0] + dy * v[1]) / (Math.hypot(dx, dy) || 1);
        if (dot < 0.15) continue;
        sc.g[ty][tx] = '.';
        LX.parts(px, py, '#9FE8C9', 5, 60);
        var roll = Math.random();
        if (roll < 0.30) LX.spawnPickup('rupee', 1 + Math.floor(Math.random() * 3), px, py);
        else if (roll < 0.36) LX.spawnPickup('heart', 1, px, py);
      }
  };

  /* ============================================================
   * 爆炸：碎裂缝石
   * ============================================================ */
  SM.explodeAt = function (x, y, r) {
    var sc = game.scene;
    var x0 = Math.floor((x - r) / T), x1 = Math.floor((x + r) / T);
    var y0 = Math.floor((y - r) / T), y1 = Math.floor((y + r) / T);
    for (var ty = y0; ty <= y1; ty++)
      for (var tx = x0; tx <= x1; tx++) {
        if (ty < 0 || tx < 0 || ty >= sc.h || tx >= sc.w) continue;
        if (sc.g[ty][tx] !== 'c') continue;
        var px = tx * T + T / 2, py = ty * T + T / 2;
        if (Math.hypot(px - x, py - y) < r) {
          sc.g[ty][tx] = '.';
          LX.parts(px, py, '#CDD7E6', 10, 90, true);
        }
      }
  };

  /* ============================================================
   * 淡入淡出 + 过门
   * ============================================================ */
  function startTransition(d) {
    game.pending = d;
    game.fadeDir = 1;
  }

  SM.update = function (dt) {
    // fade 推进
    if (game.fadeDir) {
      game.fade += game.fadeDir * dt / (CFG.FADE_MS / 1000);
      if (game.fade >= 1) {
        game.fade = 1;
        if (game.pending) {
          SM.enterScene(game.pending.to, game.pending.tx, game.pending.ty);
          game.pending = null;
        }
        game.fadeDir = -1;
      } else if (game.fade <= 0) {
        game.fade = 0; game.fadeDir = 0;
      }
    }
    if (game.fadeDir) return;

    if (game.state !== 'playing') return;
    // 门
    var p = game.player;
    var ptx = Math.floor(p.x / T), pty = Math.floor(p.y / T);
    game.scene.doors.forEach(function (d) {
      if (ptx >= d.z[0] && ptx < d.z[0] + d.z[2] &&
        pty >= d.z[1] && pty < d.z[1] + d.z[3]) {
        startTransition({ to: d.to, tx: d.tx, ty: d.ty });
      }
    });

    checkLocked(dt);
    updateCamera(dt);
  };

  function updateCamera(dt) {
    var p = game.player, sc = game.scene;
    var tx = clampCam(p.x - game.view.w / 2, sc.w * T, game.view.w);
    var ty = clampCam(p.y - game.view.h / 2, sc.h * T, game.view.h);
    game.camera.x += (tx - game.camera.x) * Math.min(1, dt * 8);
    game.camera.y += (ty - game.camera.y) * Math.min(1, dt * 8);
  }

  /* ---------- 死亡复活：回当前场景入口 ---------- */
  SM.respawn = function () {
    var sc = game.scene;
    SM.enterScene(sc.id, sc.start.tx, sc.start.ty);
    game.player.hearts = game.player.maxHearts;
    game.state = 'playing';
  };
})();
