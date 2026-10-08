/* ============================================================
 * render.js —— Canvas 渲染：瓦片、实体、特效、过场黑纱
 * ============================================================ */
(function () {
  'use strict';
  var LX = window.LX = window.LX || {};
  var CFG = LX.CFG, T = CFG.TILE;
  var game = LX.game;

  var canvas, ctx;
  LX.initRenderer = function (cv) {
    canvas = cv;
    ctx = canvas.getContext('2d');
  };

  function hash(x, y) {
    var n = (x * 73856093) ^ (y * 19349663);
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }

  /* ============================================================
   * 瓦片
   * ============================================================ */
  function grassBase(c, tx, ty, x, y) {
    c.fillStyle = (tx + ty) % 2 ? '#B9E7C2' : '#B2E3BB';
    c.fillRect(x, y, T, T);
    var h = hash(tx, ty);
    if (h > 0.72) {
      c.strokeStyle = 'rgba(90,160,110,0.5)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x + 6 + h * 8, y + 18);
      c.lineTo(x + 6 + h * 8, y + 12);
      c.stroke();
    }
  }

  function drawFlower(c, tx, ty, x, y) {
    grassBase(c, tx, ty, x, y);
    var h = hash(tx + 9, ty), cx = x + T / 2, cy = y + T / 2;
    var col = h < 0.34 ? '#FFB7D1' : h < 0.67 ? '#C9B8F0' : '#FFE3A3';
    c.fillStyle = col;
    for (var i = 0; i < 4; i++) {
      var a = i * Math.PI / 2;
      circle(c, cx + Math.cos(a) * 3.2, cy + Math.sin(a) * 3.2, 2.4); c.fill();
    }
    c.fillStyle = '#F2B24E';
    circle(c, cx, cy, 1.8); c.fill();
  }

  function drawBush(c, tx, ty, x, y) {
    grassBase(c, tx, ty, x, y);
    c.fillStyle = '#79CC96';
    circle(c, x + 8, y + 15, 5.5); c.fill();
    circle(c, x + 16, y + 14, 6.5); c.fill();
    circle(c, x + 13, y + 10, 5); c.fill();
    c.fillStyle = '#F5A3C7';
    circle(c, x + 16, y + 11, 1.6); c.fill();
    circle(c, x + 9, y + 14, 1.4); c.fill();
  }

  function drawTree(c, tx, ty, x, y, mushroom) {
    grassBase(c, tx, ty, x, y);
    if (mushroom) {
      // 茎
      c.fillStyle = '#FFF1D6';
      rr(c, x + 8, y + 8, 8, 13, 3); c.fill();
      // 伞盖
      var cols = ['#F5A3C7', '#C9B8F0', '#9FE8C9'];
      var col = cols[Math.floor(hash(tx, ty) * 3)];
      c.fillStyle = col;
      c.beginPath();
      c.arc(x + T / 2, y + 9, 10, Math.PI, 0);
      c.fill();
      c.fillRect(x + 2, y + 8, 20, 3);
      c.fillStyle = 'rgba(255,255,255,0.75)';
      circle(c, x + 9, y + 6, 1.6); c.fill();
      circle(c, x + 16, y + 4, 1.4); c.fill();
      return;
    }
    c.fillStyle = '#C79A6F';
    c.fillRect(x + 10, y + 15, 4, 7);
    c.fillStyle = '#7CCB9C';
    circle(c, x + 12, y + 11, 8); c.fill();
    c.fillStyle = '#8FD6A8';
    circle(c, x + 11, y + 9, 7); c.fill();
    circle(c, x + 16, y + 12, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.4)';
    circle(c, x + 9, y + 8, 2); c.fill();
  }

  function drawWater(c, tx, ty, x, y, time) {
    c.fillStyle = '#96D0F2';
    c.fillRect(x, y, T, T);
    c.fillStyle = 'rgba(255,255,255,0.55)';
    var off = Math.sin(time * 1.8 + tx + ty) * 2;
    c.fillRect(x + 3, y + 7 + off, 7, 1.5);
    c.fillRect(x + 14, y + 15 - off, 6, 1.5);
  }

  function drawRock(c, tx, ty, x, y, cracked) {
    grassBase(c, tx, ty, x, y);
    c.fillStyle = cracked ? '#C2CCDC' : '#C6CFDD';
    rr(c, x + 4, y + 6, 16, 13, 5); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)';
    rr(c, x + 7, y + 8, 7, 4, 2); c.fill();
    if (cracked) {
      c.strokeStyle = 'rgba(70,85,110,0.7)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x + 8, y + 7); c.lineTo(x + 12, y + 12);
      c.lineTo(x + 10, y + 17);
      c.moveTo(x + 16, y + 8); c.lineTo(x + 13, y + 13);
      c.stroke();
    }
  }

  function drawHouse(c, x, y, door) {
    grassBase(c, x / T, y / T, x, y);
    c.fillStyle = '#FFE9C7';
    c.fillRect(x + 2, y + 5, 20, 17);
    c.fillStyle = '#F5A3C7';
    c.beginPath();
    c.moveTo(x, y + 8); c.lineTo(x + 12, y); c.lineTo(x + 24, y + 8);
    c.fill();
    c.strokeStyle = 'rgba(190,120,90,0.5)';
    c.lineWidth = 1;
    c.strokeRect(x + 2, y + 5, 20, 17);
    if (door) {
      c.fillStyle = '#D89A6F';
      rr(c, x + 9, y + 12, 6, 10, 2); c.fill();
    }
  }

  /* ---------- 地牢瓦片 ---------- */
  function dgFloor(c, tx, ty, x, y) {
    c.fillStyle = (tx + ty) % 2 ? '#E8E4F6' : '#E2DEF2';
    c.fillRect(x, y, T, T);
    if (hash(tx - 3, ty) > 0.85) {
      c.fillStyle = 'rgba(140,125,190,0.25)';
      c.fillRect(x + 5, y + 6, 3, 2);
    }
  }
  function dgWall(c, x, y) {
    c.fillStyle = '#8E80C4';
    c.fillRect(x, y, T, T);
    c.fillStyle = '#A99BD8';
    c.fillRect(x, y, T, 5);
    c.strokeStyle = 'rgba(90,75,140,0.45)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x, y + 12); c.lineTo(x + T, y + 12);
    c.moveTo(x + 12, y + 5); c.lineTo(x + 12, y + 12);
    c.stroke();
  }
  function dgLock(c, x, y) {
    c.fillStyle = '#E8E4F6'; c.fillRect(x, y, T, T);
    c.fillStyle = '#D9944A';
    rr(c, x + 4, y + 3, 16, 19, 3); c.fill();
    c.strokeStyle = '#9A6A30'; c.lineWidth = 1.2;
    c.strokeRect(x + 11, y + 9, 3, 6);
  }
  function dgGate(c, x, y, open) {
    c.fillStyle = '#E8E4F6'; c.fillRect(x, y, T, T);
    if (open) {
      c.fillStyle = 'rgba(156,143,201,0.25)';
      c.fillRect(x + 2, y + 2, 20, 3);
      return;
    }
    c.fillStyle = '#9C8FC9';
    for (var i = 0; i < 4; i++) c.fillRect(x + 3 + i * 5, y + 2, 2.5, 20);
    c.fillStyle = '#8578BE';
    c.fillRect(x + 2, y + 2, 20, 3);
  }
  function dgFence(c, x, y) {
    c.fillStyle = '#E8E4F6'; c.fillRect(x, y, T, T);
    c.fillStyle = '#B7A9DC';
    for (var i = 0; i < 3; i++) c.fillRect(x + 3 + i * 7, y + 14, 3, 7);
    c.fillRect(x + 2, y + 13, 20, 2.5);
  }
  function dgSwitch(c, x, y, on) {
    c.fillStyle = '#E8E4F6'; c.fillRect(x, y, T, T);
    c.fillStyle = on ? '#7FDCAE' : '#E8879E';
    circle(c, x + 12, y + 13, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)';
    circle(c, x + 10, y + 11, 2.2); c.fill();
  }

  function drawTile(sc, tx, ty, time) {
    var ch = sc.g[ty][tx], x = tx * T, y = ty * T;
    if (sc.indoor) {
      switch (ch) {
        case 'X': dgWall(ctx, x, y); return;
        case 'L': dgLock(ctx, x, y); return;
        case 'G': dgGate(ctx, x, y, !!game.flags.gates[tx + ',' + ty]); return;
        case 'g': dgFence(ctx, x, y); return;
        case 'S': dgSwitch(ctx, x, y, !!game.flags.switches[tx + ',' + ty]); return;
        default: dgFloor(ctx, tx, ty, x, y); return;
      }
    }
    switch (ch) {
      case 'T': drawTree(ctx, tx, ty, x, y, sc.treeStyle === 'mushroom'); break;
      case 'W': drawWater(ctx, tx, ty, x, y, time); break;
      case '#': drawRock(ctx, tx, ty, x, y, false); break;
      case 'c': drawRock(ctx, tx, ty, x, y, true); break;
      case 'b': drawBush(ctx, tx, ty, x, y); break;
      case 'f': drawFlower(ctx, tx, ty, x, y); break;
      case 'H': drawHouse(ctx, x, y, false); break;
      case 'd': drawHouse(ctx, x - 9, y - 6, true); break;
      case 's':
        ctx.fillStyle = '#DFF3E8'; ctx.fillRect(x, y, T, T); break;
      case 'p':
        grassBase(ctx, tx, ty, x, y);
        ctx.fillStyle = '#F1E2C4'; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = 'rgba(180,150,110,0.4)';
        ctx.fillRect(x + 5, y + 8, 2, 2); ctx.fillRect(x + 16, y + 15, 2, 2);
        break;
      default: grassBase(ctx, tx, ty, x, y);
    }
  }

  /* ============================================================
   * 实体
   * ============================================================ */
  function shadow(x, y, rx, ry) {
    ctx.fillStyle = 'rgba(58,74,102,0.18)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---------- 温泉 / 牌子 / 宝箱 ---------- */
  function drawSpring(s, time) {
    ctx.fillStyle = '#C6CFDD';
    ctx.beginPath(); ctx.ellipse(s.x, s.y, 17, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8FE3D2';
    ctx.beginPath(); ctx.ellipse(s.x, s.y, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(s.x - 3, s.y - 2 + Math.sin(time * 2) * 1, 5, 2, 0, 0, Math.PI);
    ctx.stroke();
  }

  function drawSign(o) {
    shadow(o.x, o.y + 7, 5, 2.5);
    ctx.fillStyle = '#C79A6F';
    ctx.fillRect(o.x - 1.5, o.y, 3, 8);
    ctx.fillStyle = '#D89A6F';
    rr(ctx, o.x - 8, o.y - 7, 16, 10, 2); ctx.fill();
    ctx.strokeStyle = '#9A6A30';
    ctx.strokeRect(o.x - 8, o.y - 7, 16, 10);
  }

  function drawChest(o, time) {
    shadow(o.x, o.y + 7, 9, 3.5);
    if (!o.opened) {
      ctx.fillStyle = '#C79A6F';
      rr(ctx, o.x - 9, o.y - 5, 18, 12, 2.5); ctx.fill();
      ctx.fillStyle = '#F2C14E';
      rr(ctx, o.x - 9, o.y - 5, 18, 4, 2); ctx.fill();
      ctx.fillStyle = '#F2C14E';
      ctx.fillRect(o.x - 1.5, o.y - 1, 3, 5);
    } else {
      ctx.fillStyle = '#9A6A30';
      rr(ctx, o.x - 9, o.y + 1, 18, 6, 2); ctx.fill();
    }
  }

  /* ---------- 拾取 ---------- */
  function drawPickup(pk, time) {
    var bob = Math.sin(time * 3 + pk.t) * 2;
    var x = pk.x, y = pk.y + bob;
    switch (pk.k) {
      case 'rupee':
        ctx.fillStyle = CFG.C.rupee;
        ctx.beginPath();
        ctx.moveTo(x, y - 6); ctx.lineTo(x + 4.5, y); ctx.lineTo(x, y + 6);
        ctx.lineTo(x - 4.5, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(x - 1.5, y - 3, 1.5, 4);
        break;
      case 'heart': case 'container':
        var big = pk.k === 'container', s = big ? 1.5 : 1;
        ctx.fillStyle = big ? '#FF8FB4' : CFG.C.heart;
        heartShape(x, y, 7 * s);
        if (big) { ctx.strokeStyle = CFG.C.cream; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        circle(ctx, x - 2.6 * s, y - 2 * s, 1.4 * s); ctx.fill();
        break;
      case 'piece':
        ctx.fillStyle = '#FFB7D1';
        heartShape(x, y, 6.5);
        ctx.strokeStyle = '#FF6F9E'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 4, y - 1); ctx.lineTo(x + 3, y + 3); ctx.stroke();
        break;
      case 'key':
        ctx.fillStyle = CFG.C.key;
        circle(ctx, x - 3, y - 2, 3.5); ctx.fill();
        ctx.fillRect(x - 1, y - 3, 8, 2.5);
        ctx.fillRect(x + 5, y - 0.5, 2, 3);
        ctx.fillRect(x + 2, y - 0.5, 2, 3);
        break;
      case 'bombs':
        ctx.fillStyle = '#3A4A66';
        circle(ctx, x, y, 5); ctx.fill();
        ctx.strokeStyle = '#F2C14E'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 3, y - 8); ctx.stroke();
        break;
      case 'arrows':
        ctx.strokeStyle = '#C79A6F'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 5, y + 3); ctx.lineTo(x + 4, y - 4); ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x + 1, y - 5); ctx.lineTo(x + 3, y - 1); ctx.fill();
        break;
      case 'potion':
        ctx.fillStyle = 'rgba(255,150,190,0.9)';
        rr(ctx, x - 3.5, y - 4, 7, 9, 2); ctx.fill();
        ctx.fillStyle = '#D89A6F'; ctx.fillRect(x - 2, y - 7, 4, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        circle(ctx, x - 1, y - 1, 1.3); ctx.fill();
        break;
      case 'bow':
        ctx.strokeStyle = '#C79A6F'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(x, y, 7, -0.9, 0.9); ctx.stroke();
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath(); ctx.moveTo(x - 4.5, y - 4.5); ctx.lineTo(x - 4.5, y + 4.5); ctx.stroke();
        break;
      case 'boomerang':
        ctx.save(); ctx.translate(x, y); ctx.rotate(time * 5);
        ctx.strokeStyle = '#C79A6F'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
        ctx.moveTo(0, -6); ctx.lineTo(0, 6);
        ctx.stroke();
        ctx.restore();
        break;
    }
  }

  function heartShape(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.3, y - s * 0.2, x - s * 0.5, y - s, x, y - s * 0.25);
    ctx.bezierCurveTo(x + s * 0.5, y - s, x + s * 1.3, y - s * 0.2, x, y + s * 0.9);
    ctx.fill();
  }

  /* ---------- NPC ---------- */
  function drawNPC(o, time) {
    var bob = Math.sin(time * 2.4 + o.tx) * 1.2;
    var x = o.x, y = o.y + bob;
    shadow(o.x, o.y + 8, 8, 3);

    // 身体底色
    var body = '#FFFFFF';
    if (o.kind === 'cat') body = '#B7A9C9';
    if (o.kind === 'elder') body = '#FFF1D6';
    if (o.kind === 'dormouse') body = '#E8C9A8';
    if (o.kind === 'mayor') body = '#F2D8A8';
    if (o.kind === 'dream') body = '#DCEAFF';

    ctx.fillStyle = body;
    circle(ctx, x, y + 1, 8); ctx.fill();

    switch (o.kind) {
      case 'rabbit':
        ctx.fillStyle = '#FFFFFF';
        rr(ctx, x - 6, y - 12, 4, 9, 2); ctx.fill();
        rr(ctx, x + 2, y - 12, 4, 9, 2); ctx.fill();
        ctx.fillStyle = '#FFB7D1';
        rr(ctx, x - 5, y - 10, 2, 5, 1); ctx.fill();
        ctx.fillStyle = '#7EC8F7';
        rr(ctx, x - 6, y - 1, 12, 5, 2); ctx.fill();
        // 怀表
        ctx.fillStyle = CFG.C.cream;
        circle(ctx, x + 6, y + 5, 2.4); ctx.fill();
        faceDot(x, y);
        break;
      case 'cat':
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 2); ctx.lineTo(x - 8, y - 8); ctx.lineTo(x - 3, y - 5);
        ctx.moveTo(x + 6, y - 2); ctx.lineTo(x + 8, y - 8); ctx.lineTo(x + 3, y - 5);
        ctx.fill();
        // 尾
        ctx.strokeStyle = body; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 4);
        ctx.quadraticCurveTo(x + 13, y + 2, x + 10, y - 4);
        ctx.stroke();
        faceDot(x, y);
        ctx.strokeStyle = '#3A4A66'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y + 3, 3, 0.2, Math.PI - 0.2); ctx.stroke();
        break;
      case 'elder':
        ctx.fillStyle = '#F5A3C7';
        ctx.beginPath(); ctx.arc(x, y - 6, 9, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        circle(ctx, x - 3, y - 8, 1.6); ctx.fill();
        circle(ctx, x + 3, y - 6, 1.4); ctx.fill();
        // 白胡子
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.ellipse(x, y + 4, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        faceDot(x, y);
        break;
      case 'card':
        ctx.fillStyle = '#FFFFFF';
        rr(ctx, x - 6, y - 8, 12, 16, 2); ctx.fill();
        ctx.strokeStyle = '#F08CAE'; ctx.lineWidth = 1.2;
        rr(ctx, x - 6, y - 8, 12, 16, 2); ctx.stroke();
        ctx.fillStyle = '#F08CAE';
        ctx.font = 'bold 7px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('7', x, y - 2);
        // 小纸枪
        ctx.strokeStyle = '#9C8FC9'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + 6, y + 2); ctx.lineTo(x + 11, y - 3); ctx.stroke();
        break;
      case 'dormouse':
        // 圆耳
        ctx.fillStyle = body;
        circle(ctx, x - 5, y - 6, 3.5); ctx.fill();
        circle(ctx, x + 5, y - 6, 3.5); ctx.fill();
        // 茶杯帽
        ctx.fillStyle = '#FFFFFF';
        rr(ctx, x - 4, y - 13, 8, 4, 1.5); ctx.fill();
        ctx.fillStyle = '#F5A3C7';
        rr(ctx, x - 3, y - 17, 6, 3, 1.5); ctx.fill();
        faceDot(x, y, true);
        break;
      case 'mayor':
        ctx.fillStyle = F2(x);
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 6); ctx.lineTo(x, y - 13); ctx.lineTo(x + 7, y - 6);
        ctx.fill();
        ctx.fillStyle = CFG.C.cream;
        circle(ctx, x, y - 8, 2); ctx.fill();
        faceDot(x, y);
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 4, y + 3); ctx.lineTo(x - 1, y + 2);
        ctx.moveTo(x + 4, y + 3); ctx.lineTo(x + 1, y + 2);
        ctx.stroke();
        break;
      case 'shop':
        ctx.fillStyle = '#9FE8C9';
        rr(ctx, x - 7, y - 1, 14, 6, 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        rr(ctx, x - 5, y - 10, 10, 5, 2); ctx.fill();
        faceDot(x, y);
        break;
      case 'balloon':
        ctx.fillStyle = '#F5A3C7';
        circle(ctx, x, y - 13, 5); ctx.fill();
        ctx.strokeStyle = 'rgba(156,143,201,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y - 2); ctx.stroke();
        faceDot(x, y);
        break;
      case 'dream':
        ctx.fillStyle = '#9DB8F0';
        ctx.beginPath(); ctx.ellipse(x, y - 5, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
        faceDot(x, y);
        // 水晶光晕
        ctx.strokeStyle = 'rgba(157,184,240,0.5)';
        ctx.beginPath(); ctx.arc(x, y - 2, 12 + Math.sin(time * 2) * 1.5, 0, Math.PI * 2); ctx.stroke();
        break;
    }

    // 未交谈引导气泡（非任务箭头，仅提示可按 E）
    // 有前置条件（如汐音 need boss）未满足时不显示
    if (game.flags && (!o.need || game.flags[o.need]) &&
        !(game.flags.met && game.flags.met[game.sceneId + '@' + o.name])) {
      var by = y - 20 + Math.sin(time * 3) * 1.2;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      circle(ctx, x, by, 6.5); ctx.fill();
      ctx.strokeStyle = 'rgba(94,178,238,0.55)';
      ctx.lineWidth = 1;
      circle(ctx, x, by, 6.5); ctx.stroke();
      ctx.fillStyle = '#5EB2EE';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', x, by + 0.5);
      ctx.textBaseline = 'alphabetic';
    }
  }
  function F2(x) { return '#F2B24E'; }

  function faceDot(x, y, sleepy) {
    ctx.fillStyle = '#3A4A66';
    if (sleepy) {
      ctx.strokeStyle = '#3A4A66'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 1); ctx.lineTo(x - 2, y - 1);
      ctx.moveTo(x + 2, y - 1); ctx.lineTo(x + 4, y - 1);
      ctx.stroke();
    } else {
      circle(ctx, x - 3, y - 1, 1.1); ctx.fill();
      circle(ctx, x + 3, y - 1, 1.1); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,150,180,0.5)';
    circle(ctx, x - 4.5, y + 1.5, 1.3); ctx.fill();
    circle(ctx, x + 4.5, y + 1.5, 1.3); ctx.fill();
  }

  /* ---------- 敌人 ---------- */
  function drawEnemy(e, time) {
    var x = e.x, y = e.y;
    shadow(x, y + e.radius - 2, e.radius - 1, e.radius * 0.4);
    var col = e.flash > 0 ? '#FFFFFF' : e.def.color;

    if (e.kind === 'slime' || e.kind === 'blueslime') {
      var sq = e.vx || e.vy ? 1 : Math.abs(Math.sin(e.t * 3)) * 0.15;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, y, e.radius * (1 + sq), e.radius * (1 - sq * 0.7), 0, 0, Math.PI * 2);
      ctx.fill();
      eyes(x, y);
    } else if (e.kind === 'beetle') {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(x, y, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(90,50,20,0.5)';
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
      eyes(x, y);
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 7, y + 4); ctx.lineTo(x - 11, y + 7);
      ctx.moveTo(x + 7, y + 4); ctx.lineTo(x + 11, y + 7);
      ctx.stroke();
    } else if (e.kind === 'bat') {
      var f = Math.sin(time * 10) * 4;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x - 8, y - 6 - f, x - 12, y - 1);
      ctx.quadraticCurveTo(x - 6, y + 2, x, y + 4);
      ctx.quadraticCurveTo(x + 6, y + 2, x + 12, y - 1);
      ctx.quadraticCurveTo(x + 8, y - 6 - f, x, y);
      ctx.fill();
      ctx.fillStyle = '#3A4A66';
      circle(ctx, x - 2, y - 1, 1); ctx.fill();
      circle(ctx, x + 2, y - 1, 1); ctx.fill();
    } else if (e.kind === 'shroom') {
      ctx.fillStyle = '#FFF1D6';
      rr(ctx, x - 6, y - 2, 12, 9, 3); ctx.fill();
      ctx.fillStyle = e.flash > 0 ? '#FFFFFF' : '#E89ABE';
      ctx.beginPath(); ctx.arc(x, y - 2, 10, Math.PI, 0); ctx.fill();
      ctx.fillRect(x - 10, y - 3, 20, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      circle(ctx, x - 4, y - 6, 1.6); ctx.fill();
      circle(ctx, x + 3, y - 8, 1.3); ctx.fill();
      eyes(x, y + 2);
    } else if (e.kind === 'card') {
      var wind = e.phase === 'wind';
      ctx.fillStyle = wind ? '#FFD9E6' : '#FFFFFF';
      rr(ctx, x - 8, y - 11, 16, 22, 3); ctx.fill();
      ctx.strokeStyle = '#E0608C'; ctx.lineWidth = 1.5;
      rr(ctx, x - 8, y - 11, 16, 22, 3); ctx.stroke();
      ctx.fillStyle = '#E0608C';
      heartAt(x, y - 2, 3);
      // 长矛
      ctx.strokeStyle = '#9C8FC9'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 8, y - 6); ctx.lineTo(x + 14, y + 8); ctx.stroke();
      eyes(x, y - 6);
    } else if (e.kind === 'boss') {
      drawBoss(e, time, col);
    }

    // 眩晕星星
    if (e.stun > 0.3 && !e.def.boss) {
      ctx.fillStyle = CFG.C.cream;
      for (var i = 0; i < 3; i++) {
        var a = time * 4 + i * 2.1;
        ctx.font = '10px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('★', x + Math.cos(a) * 11, y - e.radius - 2 + Math.sin(a) * 3);
      }
    }
  }

  function eyes(x, y) {
    ctx.fillStyle = '#3A4A66';
    circle(ctx, x - 2.6, y - 1, 1.2); ctx.fill();
    circle(ctx, x + 2.6, y - 1, 1.2); ctx.fill();
  }
  function heartAt(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.3, y - s * 0.2, x - s * 0.5, y - s, x, y - s * 0.25);
    ctx.bezierCurveTo(x + s * 0.5, y - s, x + s * 1.3, y - s * 0.2, x, y + s * 0.9);
    ctx.fill();
  }

  function drawBoss(e, time, col) {
    var x = e.x, y = e.y;
    // 冲刺预警：红色脉冲圈 + 颤抖，提示玩家侧向躲避
    if (e.phase === 'wind') {
      x += Math.sin(time * 60) * 2;
      var pulse = 34 + Math.sin(time * 18) * 4;
      ctx.strokeStyle = 'rgba(255,80,120,0.85)'; ctx.lineWidth = 3;
      circle(ctx, e.x, e.y, pulse); ctx.stroke();
    }
    // 披风光圈
    ctx.fillStyle = 'rgba(242,178,78,0.25)';
    circle(ctx, x, y, 33); ctx.fill();
    // 卡牌身体
    ctx.fillStyle = '#FFFFFF';
    rr(ctx, x - 20, y - 24, 40, 48, 8); ctx.fill();
    ctx.strokeStyle = '#E0608C'; ctx.lineWidth = 2;
    rr(ctx, x - 20, y - 24, 40, 48, 8); ctx.stroke();
    // 王冠
    ctx.fillStyle = CFG.C.cream;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 24);
    ctx.lineTo(x - 12, y - 33); ctx.lineTo(x - 6, y - 27);
    ctx.lineTo(x, y - 34); ctx.lineTo(x + 6, y - 27);
    ctx.lineTo(x + 12, y - 33); ctx.lineTo(x + 12, y - 24);
    ctx.fill();
    // 大眼
    var cast = e.phase === 'cast';
    ctx.fillStyle = cast ? '#F5A3C7' : '#3A4A66';
    circle(ctx, x - 8, y - 8, 3.5); ctx.fill();
    circle(ctx, x + 8, y - 8, 3.5); ctx.fill();
    if (cast) {
      ctx.strokeStyle = '#3A4A66';
      ctx.beginPath(); ctx.arc(x - 8, y - 8, 2, 0, Math.PI * 2);
      ctx.arc(x + 8, y - 8, 2, 0, Math.PI * 2); ctx.stroke();
    }
    // 红心纹章
    ctx.fillStyle = '#E0608C';
    heartAt(x, y + 6, 6);
    // 受击闪白：整副卡牌身体瞬间变白（命中反馈，此前 drawBoss 忽略了受击色）
    if (e.flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      rr(ctx, x - 20, y - 24, 40, 48, 8); ctx.fill();
    }
  }

  /* ---------- 玩家 ---------- */
  function drawPlayer(time) {
    var p = game.player;
    if (p.invuln > 0 && Math.floor(time * 12) % 2) return;
    var x = p.x, y = p.y;
    shadow(x, y + 9, 8, 3);

    var bob = p.moving ? Math.abs(Math.sin(time * 10)) * 1.5 : 0;
    y -= bob;

    // 身体（天蓝斗篷）
    ctx.fillStyle = '#7EC8F7';
    circle(ctx, x, y + 1, 8.5); ctx.fill();
    // 头
    ctx.fillStyle = '#FFE8D6';
    circle(ctx, x, y - 5, 6.5); ctx.fill();
    // 头发
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath(); ctx.arc(x, y - 7.5, 6.5, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    // 粉围巾
    ctx.strokeStyle = '#FFB7D1'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 1);
    ctx.quadraticCurveTo(x, y + 2, x + 5, y - 1);
    ctx.stroke();
    // 眼（按方向）
    ctx.fillStyle = '#3A4A66';
    var ex = p.dir === 'left' ? -1 : p.dir === 'right' ? 1 : 0;
    var eyy = p.dir === 'up' ? -1 : p.dir === 'down' ? 1 : 0;
    circle(ctx, x - 2.2 + ex, y - 5 + eyy, 0.9); ctx.fill();
    circle(ctx, x + 2.2 + ex, y - 5 + eyy, 0.9); ctx.fill();

    // 剑挥弧
    if (p.swingT > 0) {
      var v = LX.game && DIRV(p.dir);
      var prog = 1 - p.swingT / CFG.P.swingTime;
      var a0 = Math.atan2(v[1], v[0]) - CFG.P.swingArc / 2 + prog * CFG.P.swingArc;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + v[0] * 6, y + v[1] * 6, CFG.P.swingReach - 2,
        a0 - 0.5, a0 + 0.1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(126,200,247,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + v[0] * 6, y + v[1] * 6, CFG.P.swingReach - 2,
        a0 - 0.5, a0 + 0.1);
      ctx.stroke();
    }
  }
  var DIRMAP = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function DIRV(d) { return DIRMAP[d] || [0, 1]; }

  /* ---------- 弹道 / 回力镖 / 爆弹 ---------- */
  function drawProjectiles() {
    game.projectiles.forEach(function (b) {
      if (b.type === 'arrow') {
        var a = Math.atan2(b.vy, b.vx);
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
        ctx.strokeStyle = '#C79A6F'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(4, 0); ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(3, -2.5); ctx.lineTo(3, 2.5); ctx.fill();
        ctx.restore();
      } else if (b.type === 'card') {
        ctx.save(); ctx.translate(b.x, b.y);
        ctx.rotate(game.time * 6);
        ctx.fillStyle = '#FFFFFF';
        rr(ctx, -4, -5, 8, 10, 1.5); ctx.fill();
        ctx.strokeStyle = '#E0608C'; ctx.lineWidth = 1;
        rr(ctx, -4, -5, 8, 10, 1.5); ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = '#E89ABE';
        circle(ctx, b.x, b.y, 5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        circle(ctx, b.x - 1, b.y - 1, 1.5); ctx.fill();
      }
    });
    game.boomerangs.forEach(function (b) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.spin);
      ctx.strokeStyle = '#C79A6F'; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-7, 0); ctx.lineTo(7, 0);
      ctx.moveTo(0, -7); ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.fillStyle = '#F5A3C7';
      circle(ctx, 0, 0, 2); ctx.fill();
      ctx.restore();
    });
    game.bombs.forEach(function (b) {
      shadow(b.x, b.y + 6, 6, 2.5);
      ctx.fillStyle = '#3A4A66';
      circle(ctx, b.x, b.y, 7); ctx.fill();
      ctx.strokeStyle = '#9A7A4A'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(b.x, b.y - 7); ctx.lineTo(b.x + 3, b.y - 11); ctx.stroke();
      ctx.fillStyle = b.fuse < 0.6 && Math.floor(game.time * 10) % 2 ? '#FFE3A3' : '#FF9E5C';
      circle(ctx, b.x + 3, b.y - 11, 2); ctx.fill();
    });
  }

  /* ============================================================
   * 主绘制
   * ============================================================ */
  /* ---------- Boss 顶部血条（屏幕空间） ---------- */
  function drawBossBar(e, screenW) {
    var max = e.def.hp, ratio = Math.max(0, e.hp / max);
    var bw = Math.min(340, screenW - 80), bx = (screenW - bw) / 2, by = 16, bh = 13;
    // 底板
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(58,74,102,0.28)';
    rr(ctx, bx - 3, by - 3, bw + 6, bh + 6, 7); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    rr(ctx, bx, by, bw, bh, 5); ctx.fill();
    // 血量
    if (ratio > 0) {
      ctx.save();
      rr(ctx, bx, by, bw, bh, 5); ctx.clip();
      ctx.fillStyle = ratio < 0.3 ? '#F580A8' : '#E0608C';
      ctx.fillRect(bx, by, bw * ratio, bh);
      ctx.restore();
    }
    // 名称
    ctx.fillStyle = '#3A4A66';
    ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('乌有王', screenW / 2, by + bh + 13);
  }

  LX.Renderer = {
    draw: function () {
      var sc = game.scene, p = game.player;
      var w = canvas.width, h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var sx = 0, sy = 0;
      if (game.shake > 0) {
        sx = (Math.random() - 0.5) * game.shake * 16;
        sy = (Math.random() - 0.5) * game.shake * 16;
      }
      var camX = Math.round(game.camera.x + sx), camY = Math.round(game.camera.y + sy);

      // 可见瓦片
      var x0 = Math.max(0, Math.floor(camX / T) - 1);
      var y0 = Math.max(0, Math.floor(camY / T) - 1);
      var x1 = Math.min(sc.w, Math.ceil((camX + w) / T) + 1);
      var y1 = Math.min(sc.h, Math.ceil((camY + h) / T) + 1);
      for (var ty = y0; ty < y1; ty++)
        for (var tx = x0; tx < x1; tx++) {
          ctx.setTransform(1, 0, 0, 1, -camX, -camY);
          drawTile(sc, tx, ty, game.time);
        }

      ctx.setTransform(1, 0, 0, 1, -camX, -camY);

      game.springs.forEach(function (s) { drawSpring(s, game.time); });
      game.signs.forEach(drawSign);
      game.chests.forEach(function (c) { drawChest(c, game.time); });
      game.pickups.forEach(function (pk) { drawPickup(pk, game.time); });
      drawProjectiles();

      // 深度排序：NPC + 敌人 + 玩家
      var list = [];
      game.npcs.forEach(function (n) { list.push({ y: n.y, f: function () { drawNPC(n, game.time); } }); });
      game.enemies.filter(function (e) { return e.alive; }).forEach(function (e) {
        list.push({ y: e.y, f: function () { drawEnemy(e, game.time); } });
      });
      list.push({ y: p.y, f: function () { drawPlayer(game.time); } });
      list.sort(function (a, b) { return a.y - b.y; });
      list.forEach(function (o) { o.f(); });

      // 粒子
      game.parts.forEach(function (q) {
        ctx.globalAlpha = Math.max(0, q.life / q.max);
        ctx.fillStyle = q.color;
        ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
      });
      ctx.globalAlpha = 1;

      // 飘字（屏幕空间）
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.textAlign = 'center';
      game.floaters.forEach(function (f) {
        ctx.globalAlpha = Math.max(0, f.life / f.max);
        ctx.font = (f.big ? 'bold 19px' : 'bold 14px') + ' "Trebuchet MS", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText(f.text, f.x - camX + 1, f.y - camY + 1);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x - camX, f.y - camY);
      });
      ctx.globalAlpha = 1;

      // Boss 血条（屏幕顶部居中，仅 Boss 存活时显示）
      var bossE = null;
      game.enemies.forEach(function (e) { if (e.def.boss && e.alive) bossE = e; });
      if (bossE) drawBossBar(bossE, w);

      // 过场黑纱
      if (game.fade > 0) {
        ctx.fillStyle = 'rgba(30,40,60,' + game.fade + ')';
        ctx.fillRect(0, 0, w, h);
      }
    }
  };
})();
