/* ============================================================
 * ui.js —— DOM 界面：HUD、对白、商店、暂停、死亡、结局、提示
 * ============================================================ */
(function () {
  'use strict';
  var LX = window.LX = window.LX || {};
  var CFG = LX.CFG;
  var game = LX.game;

  function $(id) { return document.getElementById(id); }

  var UI = LX.UI = {};

  /* ============================================================
   * 轻提示 toast（排队）
   * ============================================================ */
  var toastQueue = [], toastUntil = 0;
  UI.toast = function (text, ms) {
    toastQueue.push({ text: text, ms: ms || 1700 });
  };
  function updateToast() {
    var el = $('toast');
    if (Date.now() < toastUntil) return;
    if (toastQueue.length) {
      var t = toastQueue.shift();
      el.textContent = t.text;
      el.classList.add('show');
      toastUntil = Date.now() + t.ms;
    } else el.classList.remove('show');
  }

  /* ============================================================
   * HUD
   * ============================================================ */
  UI.updateHUD = function () {
    updateToast();
    if (!game.player) return;
    var p = game.player;

    // 心
    var hearts = $('hud-hearts');
    if (hearts) hearts.textContent = heartRow(p.hearts, p.maxHearts);
    var rupee = $('hud-rupees');
    if (rupee) rupee.textContent = '◆ ' + p.rupees;
    var keyEl = $('hud-keys');
    if (keyEl) {
      keyEl.style.display = p.keys > 0 ? '' : 'none';
      keyEl.textContent = '⚷ ' + p.keys;
    }
    var loc = $('hud-loc');
    if (loc && game.scene) loc.textContent = game.scene.name;

    // 工具栏
    document.querySelectorAll('.tool-slot').forEach(function (slot) {
      var tool = slot.getAttribute('data-tool');
      var have = tool === 'sword' ? true : !!p.tools[tool];
      slot.classList.toggle('locked', !have);
      slot.classList.toggle('active', p.curTool === tool);
      var countEl = slot.querySelector('.tc');
      if (tool === 'bow') countEl.textContent = p.arrows;
      else if (tool === 'bombs') countEl.textContent = p.bombs;
      else countEl.textContent = '';
    });
  };

  function heartRow(hp, max) {
    var full = Math.floor(hp), half = hp - full >= 0.5, out = '';
    for (var i = 0; i < max; i++) {
      if (i < full) out += '♥';
      else if (i === full && half) out += '⌓';
      else out += '♡';
    }
    return out;
  }

  UI.selectTool = function (tool) {
    var p = game.player;
    if (!p) return;
    if (tool !== 'sword' && !p.tools[tool]) return;
    p.curTool = tool;
  };

  // 道具循环顺序：短剑 → 回力镖 → 星弓 → 爆弹（仅已拥有）
  var CYCLE = ['sword', 'boomerang', 'bow', 'bombs'];
  UI.cycleTool = function (dir) {
    var p = game.player;
    if (!p) return;
    var owned = CYCLE.filter(function (t) { return t === 'sword' || p.tools[t]; });
    var i = owned.indexOf(p.curTool);
    if (i < 0) i = 0;
    i = (i + (dir > 0 ? 1 : -1) + owned.length) % owned.length;
    p.curTool = owned[i];
  };

  /* ============================================================
   * 对白（打字机；E 先补全再推进）
   * ============================================================ */
  var dlg = null;
  function dlgEl() { return $('dialogue'); }

  UI.openDialogue = function (npc) {
    // 记录已交谈（用于解除头顶引导气泡）
    if (game.flags) { game.flags.met = game.flags.met || {}; game.flags.met[game.sceneId + '@' + npc.name] = true; }
    dlg = {
      npc: npc, lines: npc.dlg.slice(), idx: 0,
      shown: 0, text: ''
    };
    game.dialogue = dlg;
    $('dlg-name').textContent = npc.name;
    dlgEl().classList.add('show');
    renderLine();
  };

  function renderLine() {
    dlg.text = dlg.lines[dlg.idx];
    dlg.shown = 0;
    $('dlg-text').textContent = '';
  }

  function updateDialogue(dt) {
    if (!dlg) return;
    if (dlg.shown < dlg.text.length) {
      dlg.shown = Math.min(dlg.text.length, dlg.shown + dt * 46);
      $('dlg-text').textContent = dlg.text.slice(0, Math.floor(dlg.shown));
    } else {
      $('dlg-text').textContent = dlg.text;
    }
  }

  UI.advanceDialogue = function () {
    if (!dlg) return false;
    if (dlg.shown < dlg.text.length) {
      dlg.shown = dlg.text.length;
      $('dlg-text').textContent = dlg.text;
      return true;
    }
    dlg.idx++;
    if (dlg.idx >= dlg.lines.length) {
      closeDialogue();
      return true;
    }
    renderLine();
    return true;
  };

  function closeDialogue() {
    var npc = dlg.npc;
    dlg = null;
    game.dialogue = null;
    game._lastTalk = game.time;
    dlgEl().classList.remove('show');
    if (npc.heal && game.player) {
      game.player.hearts = game.player.maxHearts;
      LX.parts(game.player.x, game.player.y - 6, CFG.C.pink, 10, 70);
    }
    if (npc.need === 'boss') openEnding();
  }

  /* ============================================================
   * 商店
   * ============================================================ */
  var GOODS = [
    { id: 'bombs', name: '爆弹 ×5', price: 30, give: function () { LX.grant('bombs', 5); } },
    { id: 'arrows', name: '光箭 ×10', price: 20, give: function () { LX.grant('arrows', 10); } },
    { id: 'potion', name: '仙露 ×1', price: 40, give: function () { LX.grant('potion', 1); } },
    { id: 'piece', name: '心之碎片', price: 50, once: true,
      give: function () { LX.grant('piece', 1); } }
  ];

  UI.openShop = function (npc) {
    if (game.flags) { game.flags.met = game.flags.met || {}; game.flags.met[game.sceneId + '@' + npc.name] = true; }
    game.shop = npc;
    var list = $('shop-list');
    list.innerHTML = '';
    GOODS.forEach(function (g) {
      var sold = g.once && game.flags.shopPiece;
      var row = document.createElement('div');
      row.className = 'shop-row';
      row.innerHTML =
        '<span class="sg-name">' + g.name + '</span>' +
        '<span class="sg-price">◆ ' + g.price + '</span>' +
        '<button class="sg-buy"' + (sold ? ' disabled' : '') + '>' +
        (sold ? '已售出' : '购买') + '</button>';
      row.querySelector('.sg-buy').addEventListener('click', function () {
        var p = game.player;
        if (p.rupees < g.price) { UI.toast('星币不够'); return; }
        p.rupees -= g.price;
        g.give();
        if (g.once) game.flags.shopPiece = true;
        UI.closeShop();
        UI.toast('买到了：' + g.name);
      });
      list.appendChild(row);
    });
    $('shop').classList.add('show');
  };

  UI.closeShop = function () {
    game.shop = null;
    $('shop').classList.remove('show');
  };

  /* ============================================================
   * 暂停
   * ============================================================ */
  UI.togglePause = function () {
    if (game.state !== 'playing' && !game.paused) return;
    if (game.dialogue || game.shop || game.ended) return;
    game.paused = !game.paused;
    $('pause').classList.toggle('show', game.paused);
  };
  UI.closePause = function () {
    game.paused = false;
    $('pause').classList.remove('show');
  };

  /* ============================================================
   * 死亡
   * ============================================================ */
  UI.showDeath = function () {
    $('death').classList.add('show');
  };
  UI.hideDeath = function () {
    $('death').classList.remove('show');
  };
  UI.respawn = function () {
    UI.hideDeath();
    LX.Scene.respawn();
  };

  /* ============================================================
   * 结局
   * ============================================================ */
  function openEnding() {
    if (game.flags.ending) return;
    game.flags.ending = true;
    game.ended = true;
    $('ending').classList.add('show');
  }
  UI.openEnding = openEnding;
  UI.closeEnding = function () {
    game.ended = false;
    $('ending').classList.remove('show');
  };

  /* ---------- 每帧驱动 UI 内部动画 ---------- */
  UI.update = function (dt) {
    updateDialogue(dt);
  };
})();
