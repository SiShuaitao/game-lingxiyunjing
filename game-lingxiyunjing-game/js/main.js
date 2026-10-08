/* ============================================================
 * main.js —— 启动、输入、存读档、主循环
 * ============================================================ */
(function () {
  'use strict';
  var LX = window.LX;
  var game = LX.game;

  function $(id) { return document.getElementById(id); }

  var Main = LX.Main = {};

  /* ============================================================
   * 存档（仅手动保存：暂停菜单 → 保存进度）
   * ============================================================ */
  Main.save = function () {
    if (!game.player || game.state !== 'playing') return;
    // 干净快照：不写入击退、挥剑等瞬态状态
    var snap = JSON.parse(JSON.stringify(game.player));
    snap.vx = 0; snap.vy = 0;
    snap.swingT = 0; snap.swingCD = 0; snap.swingHits = {};
    snap.invuln = 0.4;
    var data = {
      v: 1,
      sceneId: game.sceneId,
      px: game.player.x, py: game.player.y,
      player: snap, flags: game.flags, time: game.time,
      savedAt: Date.now()
    };
    try {
      localStorage.setItem(LX.CFG.STORAGE_KEY, JSON.stringify(data));
      LX.UI.toast('进度已保存 ✓');
    } catch (e) {
      LX.UI.toast('保存失败：浏览器存储不可用');
    }
  };

  Main.hasSave = function () {
    try { return !!localStorage.getItem(LX.CFG.STORAGE_KEY); }
    catch (e) { return false; }
  };

  // 读取存档元信息（不进入游戏），用于主菜单显示
  Main.saveInfo = function () {
    var raw;
    try { raw = localStorage.getItem(LX.CFG.STORAGE_KEY); } catch (e) { return null; }
    if (!raw) return null;
    try {
      var d = JSON.parse(raw);
      return { savedAt: d.savedAt || 0, sceneId: d.sceneId };
    } catch (e) { return null; }
  };

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // 刷新主菜单「上次保存」小字
  function refreshSaveInfo() {
    var el = $('last-save');
    if (!el) return;
    var info = Main.saveInfo();
    if (!info) { el.style.display = 'none'; return; }
    if (info.savedAt) {
      var d = new Date(info.savedAt);
      el.textContent = '上次保存 ' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
        ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    } else {
      // 兼容旧版无时间戳存档
      var sc = LX.DATA && LX.DATA.SCENES && LX.DATA.SCENES[info.sceneId];
      el.textContent = sc ? ('上次旅程：' + sc.name) : '已有存档可继续';
    }
    el.style.display = '';
  }

  Main.load = function () {
    var raw;
    try { raw = localStorage.getItem(LX.CFG.STORAGE_KEY); } catch (e) { return false; }
    if (!raw) return false;
    try {
      var d = JSON.parse(raw);
      // 先校验：场景存在、player 为对象；不合法直接拒绝，绝不半替换当前状态
      if (!d || !d.sceneId || !LX.DATA.SCENES[d.sceneId] ||
          !d.player || typeof d.player !== 'object') return false;

      // 以当前版本默认值为基底，旧存档缺失字段自动补齐
      LX.newGame();
      var baseP = game.player, baseF = game.flags;
      var savedTools = d.player.tools || {};
      Object.assign(baseP, d.player);
      // tools 是嵌套对象：默认四项 ← 存档覆盖
      baseP.tools = { sword: true, boomerang: false, bow: false, bombs: false };
      Object.assign(baseP.tools, savedTools);
      // flags：默认对象 ← 存档覆盖，缺失的子表保留默认空表
      Object.assign(baseF, d.flags);
      ['dead', 'opened', 'clear', 'gates', 'switches', 'switchCD', 'met']
        .forEach(function (k) {
          if (!baseF[k] || typeof baseF[k] !== 'object') baseF[k] = {};
        });

      game.time = d.time || 0;
      LX.Scene.enterScene(d.sceneId);
      if (typeof d.px === 'number') game.player.x = d.px;
      if (typeof d.py === 'number') game.player.y = d.py;

      // 血量合法性修正
      var p = game.player;
      if (!(p.maxHearts >= 1)) p.maxHearts = LX.CFG.P.startHearts;
      if (!(p.hearts >= 0) || p.hearts > p.maxHearts) p.hearts = p.maxHearts;
      if (p.hearts <= 0) p.hearts = p.maxHearts;   // 空血存档救回
      // curTool 合法性：旧档可能指向未拥有的道具
      if (p.curTool !== 'sword' && !p.tools[p.curTool]) p.curTool = 'sword';
      game.state = 'playing';
      return true;
    } catch (e) { return false; }
  };

  /* ============================================================
   * 开始
   * ============================================================ */
  Main.startNew = function () {
    LX.newGame();
    LX.Scene.enterScene('meadow');
    game.state = 'playing';
    hideAllOverlays();
  };

  Main.continueGame = function () {
    if (Main.load()) hideAllOverlays();
    else LX.UI.toast('没有找到存档');
  };

  Main.toMenu = function () {
    LX.UI.closePause && game.paused && LX.UI.closePause();
    game.state = 'menu';
    $('btn-continue').disabled = !Main.hasSave();
    refreshSaveInfo();
    $('menu').classList.add('show');
  };

  function hideAllOverlays() {
    $('menu').classList.remove('show');
  }

  /* ============================================================
   * 尺寸
   * ============================================================ */
  var canvas;
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    game.view = { w: w, h: h };
  }

  /* ============================================================
   * 输入
   * ============================================================ */
  var KEYMAP = {
    KeyW: 'w', KeyS: 's', KeyA: 'a', KeyD: 'd',
    ArrowUp: 'arrowup', ArrowDown: 'arrowdown',
    ArrowLeft: 'arrowleft', ArrowRight: 'arrowright'
  };

  function busy() {
    return !!(game.dialogue || game.shop || game.paused || game.ended);
  }

  function onKeyDown(ev) {
    var k = KEYMAP[ev.code];
    if (k) { game.keys[k] = true; ev.preventDefault(); }

    if (ev.repeat) return;

    if (ev.code === 'KeyE') {
      if (game.dialogue) LX.UI.advanceDialogue();
      else if (game.state === 'playing' && !busy()) LX.Scene.interact();
      return;
    }
    if (ev.code === 'Escape') {
      if (game.shop) { LX.UI.closeShop(); return; }
      LX.UI.togglePause();
      return;
    }
    if (game.state !== 'playing' || busy()) return;

    switch (ev.code) {
      case 'KeyJ': case 'Space': case 'KeyZ':
        // 键盘挥剑：朝当前移动面向攻击，不被停放的鼠标位置带偏
        LX.swing(); ev.preventDefault(); break;
      case 'KeyK': case 'KeyX':
        LX.useTool(); break;
      case 'KeyQ':
        LX.useTool('potion'); break;
      case 'Tab':
        LX.UI.cycleTool(1); ev.preventDefault(); break;
      case 'Digit1': LX.UI.selectTool('boomerang'); break;
      case 'Digit2': LX.UI.selectTool('bow'); break;
      case 'Digit3': LX.UI.selectTool('bombs'); break;
    }
  }

  function onKeyUp(ev) {
    var k = KEYMAP[ev.code];
    if (k) game.keys[k] = false;
  }

  function worldMouse() {
    return {
      x: game.mouse.x + game.camera.x,
      y: game.mouse.y + game.camera.y
    };
  }

  function onMouseMove(ev) {
    game.mouse.x = ev.clientX; game.mouse.y = ev.clientY;
  }
  function onMouseDown(ev) {
    if (game.state !== 'playing' || busy()) return;
    if (ev.target !== canvas) return;
    if (ev.button === 0) {
      LX.swing(worldMouse().x, worldMouse().y);
    } else if (ev.button === 2) LX.useTool();
  }

  /* ============================================================
   * DOM 按钮绑定
   * ============================================================ */
  function bindButtons() {
    $('btn-start').addEventListener('click', Main.startNew);
    $('btn-continue').addEventListener('click', Main.continueGame);
    $('btn-help').addEventListener('click', function () {
      $('help').classList.add('show');
    });
    $('help-close').addEventListener('click', function () {
      $('help').classList.remove('show');
    });
    $('btn-resume').addEventListener('click', LX.UI.closePause);
    $('btn-save').addEventListener('click', Main.save);
    $('btn-menu').addEventListener('click', Main.toMenu);
    $('btn-death-respawn').addEventListener('click', LX.UI.respawn);
    $('btn-death-menu').addEventListener('click', function () {
      LX.UI.hideDeath(); Main.toMenu();
    });
    $('btn-end-roam').addEventListener('click', LX.UI.closeEnding);
    $('btn-end-menu').addEventListener('click', function () {
      LX.UI.closeEnding(); Main.toMenu();
    });
    $('shop-close').addEventListener('click', LX.UI.closeShop);
    $('dialogue').addEventListener('click', function () {
      LX.UI.advanceDialogue();
    });

    document.querySelectorAll('.tool-slot').forEach(function (slot) {
      slot.addEventListener('click', function () {
        LX.UI.selectTool(slot.getAttribute('data-tool'));
      });
    });
  }

  /* ============================================================
   * 主循环
   * ============================================================ */
  var last = 0;

  function frame(ts) {
    try {
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;

      if (game.scene) {
        LX.Scene.update(dt);
        var canRun = game.state === 'playing' && !game.dialogue &&
          !game.shop && !game.paused && !game.ended && game.fadeDir === 0;
        if (canRun) {
          LX.CoreUpdate(dt);
        }
        LX.UI.update(dt);
        LX.UI.updateHUD();
        LX.Renderer.draw();
      }
    } catch (err) {
      console.error('[LX] 帧异常：', err);
    }
    requestAnimationFrame(frame);
  }

  /* ============================================================
   * 初始化
   * ============================================================ */
  function init() {
    canvas = $('game');
    LX.initRenderer(canvas);
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // 滚轮循环切换道具
    window.addEventListener('wheel', function (ev) {
      if (game.state !== 'playing' || busy()) return;
      ev.preventDefault();
      LX.UI.cycleTool(ev.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    bindButtons();

    $('btn-continue').disabled = !Main.hasSave();
    refreshSaveInfo();
    $('menu').classList.add('show');

    // 主动获取焦点，确保键盘操作立即生效
    try { window.focus(); canvas.focus(); } catch (e) {}

    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();
})();
