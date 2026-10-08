/* ============================================================
 * data.js —— 场景地图、NPC、敌人、宝箱、对话
 * 地图用印章构建器生成 g[y][x]，杜绝手工等长串错误
 * ============================================================ */
(function () {
  'use strict';
  var LX = window.LX = window.LX || {};

  /* ---------- 地图构建 ---------- */
  function grid(w, h, fill) {
    var g = new Array(h);
    for (var y = 0; y < h; y++) g[y] = new Array(w).fill(fill);
    return g;
  }
  function rect(g, c, x, y, w, h) {
    for (var j = 0; j < h; j++)
      for (var i = 0; i < w; i++)
        if (g[y + j] && g[y + j][x + i] !== undefined) g[y + j][x + i] = c;
  }
  function pts(g, c, list) {
    for (var i = 0; i < list.length; i++) g[list[i][1]][list[i][0]] = c;
  }
  function build(w, h, fill, stamps) {
    var g = grid(w, h, fill);
    for (var i = 0; i < stamps.length; i++) {
      var s = stamps[i];
      if (s.r) rect(g, s.c, s.r[0], s.r[1], s.r[2], s.r[3]);
      else pts(g, s.c, s.p);
    }
    return g;
  }

  /* 便捷：四境边框（T），cuts 是开口列表 [x,y,w,h] */
  function border(g, w, h, c, cuts) {
    rect(g, c, 0, 0, w, 1);
    rect(g, c, 0, h - 1, w, 1);
    rect(g, c, 0, 0, 1, h);
    rect(g, c, w - 1, 0, 1, h);
    for (var i = 0; i < cuts.length; i++) rect(g, '.', cuts[i][0], cuts[i][1], cuts[i][2], cuts[i][3]);
  }

  /* ============================================================
   * 场景一：云汐草原 40x28
   * ============================================================ */
  var meadowG = grid(40, 28, '.');
  border(meadowG, 40, 28, 'T', [[39, 13, 1, 2], [19, 0, 2, 1]]);
  // 水潭
  pts(meadowG, 'W', [[5, 4], [6, 4], [7, 4], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
    [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [5, 7], [6, 7], [7, 7]]);
  // 树丛
  pts(meadowG, 'T', [[10, 8], [11, 8], [10, 9], [28, 10], [29, 10], [29, 9],
    [15, 20], [16, 20], [15, 21], [30, 22], [31, 22], [32, 22],
    [6, 18], [7, 18], [3, 12], [4, 12]]);
  // 灌木
  rect(meadowG, 'b', 20, 14, 4, 2);
  pts(meadowG, 'b', [[24, 6], [25, 6], [13, 16], [14, 16], [33, 12], [34, 12],
    [26, 20], [27, 20], [28, 20]]);
  // 花
  pts(meadowG, 'f', [[12, 12], [13, 13], [22, 18], [23, 18], [36, 8], [37, 9], [8, 22], [9, 23]]);
  // 裂缝石壁龛（心之碎片）
  rect(meadowG, '#', 11, 2, 4, 1);
  pts(meadowG, '#', [[11, 3], [11, 4], [14, 3], [14, 4]]);
  pts(meadowG, 'c', [[12, 4], [13, 4]]);
  // 小径
  pts(meadowG, 'p', [[38, 13], [38, 14], [19, 1], [20, 1], [19, 2], [20, 2]]);
  // 温泉地面
  meadowG[23][35] = 's';

  var meadow = {
    id: 'meadow', name: '云汐草原', sub: '风把草吹成一层层波浪',
    w: 40, h: 28, g: meadowG,
    start: { tx: 5, ty: 14 },
    doors: [
      { z: [39, 13, 1, 2], to: 'village', tx: 2, ty: 14 },
      { z: [19, 0, 2, 1], to: 'forest', tx: 22, ty: 27 }
    ],
    objs: [
      { t: 'sign', tx: 9, ty: 13, text: '东：风铃镇　北：倒生森林　草里有星币，裂缝石怕爆弹。' },
      {
        t: 'npc', tx: 8, ty: 14, name: '拾时', kind: 'rabbit',
        dlg: [
          '哎哎哎，就是你！能在涨潮时走进云隙，算你运气好。',
          '东边是风铃镇，镇长人不错——就是话特别长。北边的倒生森林能去蘑菇高地。',
          '草里藏着星币，挥剑就能砍出来；裂了缝的石头？等你有了爆弹再回来找它。'
        ]
      },
      { t: 'enemy', kind: 'slime', tx: 16, ty: 10 },
      { t: 'enemy', kind: 'slime', tx: 27, ty: 16 },
      { t: 'enemy', kind: 'slime', tx: 22, ty: 23 },
      { t: 'chest', id: 'm1', tx: 26, ty: 6, item: { k: 'rupee', n: 10 } },
      { t: 'chest', id: 'mp', tx: 12, ty: 3, item: { k: 'piece' } },
      { t: 'spring', tx: 35, ty: 23 },
      { t: 'sign', tx: 33, ty: 23, text: '星露温泉：站进来，心就慢慢长回来。' }
    ]
  };

  /* ============================================================
   * 场景二：风铃镇 40x28
   * ============================================================ */
  var villageG = grid(40, 28, '.');
  border(villageG, 40, 28, 'T', [[0, 13, 1, 2]]);
  // 三栋房子
  rect(villageG, 'H', 4, 4, 6, 4);  villageG[7][6] = 'd';
  rect(villageG, 'H', 28, 4, 6, 4); villageG[7][30] = 'd';
  rect(villageG, 'H', 6, 18, 6, 5); villageG[22][8] = 'd';
  // 十字街
  rect(villageG, 'p', 12, 10, 16, 2);
  rect(villageG, 'p', 19, 8, 2, 18);
  // 花园环
  pts(villageG, 'f', [[29, 14], [30, 14], [31, 14], [32, 14], [33, 14],
    [29, 15], [33, 15], [29, 16], [33, 16],
    [29, 17], [30, 17], [31, 17], [32, 17], [33, 17]]);
  pts(villageG, 'T', [[14, 4], [15, 4], [16, 4], [22, 22], [23, 22], [24, 22], [36, 18], [37, 18], [2, 12], [3, 12]]);
  pts(villageG, 'b', [[26, 10], [27, 10], [13, 24], [14,24], [25, 25]]);

  var village = {
    id: 'village', name: '风铃镇', sub: '铃声此起彼伏，茶永远温热',
    w: 40, h: 28, g: villageG,
    start: { tx: 6, ty: 14 },
    doors: [
      { z: [0, 13, 1, 2], to: 'meadow', tx: 37, ty: 14 }
    ],
    objs: [
      { t: 'sign', tx: 2, ty: 10, text: '风铃镇：铃声不停，小镇不散。' },
      {
        t: 'npc', tx: 20, ty: 13, name: '铃铎镇长', kind: 'mayor',
        dlg: [
          '哦——外乡人！云境可是好久没来过新人了。',
          '梦源出事啦。乌有王把神殿封成了纸牌迷宫，云境再飘下去，迟早要沉。',
          '能救我们的，只有进得了神殿的人。去北边吧，倒生森林尽头的蘑菇高地，有炸得开的入口。'
        ]
      },
      { t: 'chest', id: 'v1', tx: 15, ty: 13, item: { k: 'rupee', n: 5 } },
      {
        t: 'npc', tx: 31, ty: 16, name: '月桂', kind: 'dormouse', heal: true,
        dlg: [
          '嘘……松饼还没好，先喝杯茶。',
          '茶会是不会散的啦。受了伤就坐下，啃块松饼再走。'
        ]
      },
      {
        t: 'npc', tx: 14, ty: 20, name: '红七', kind: 'card',
        dlg: [
          '……你、你不怕我吗？我以前是乌有王那边的。',
          '我不想替谁打仗，就逃出来了。镇长他们肯收留我……这地方的人真好。',
          '你要是去神殿，替我看看那些还在里面的弟兄。'
        ]
      },
      { t: 'shop', tx: 23, ty: 13, name: '杂货商巴鲁', kind: 'shop' },
      {
        t: 'npc', tx: 5, ty: 12, name: '泡泡', kind: 'balloon',
        dlg: [
          '今天风向偏南，适合出发！',
          '等云境没事了，我要开一条环游四境的热气球航线。'
        ]
      }
    ]
  };

  /* ============================================================
   * 场景三：倒生森林 44x30
   * ============================================================ */
  var forestG = grid(44, 30, '.');
  border(forestG, 44, 30, 'T', [[21, 29, 2, 1], [43, 15, 1, 2]]);
  // 小溪
  pts(forestG, 'W', [[18, 6], [19, 6], [19, 7], [19, 8], [20, 8], [20, 9],
    [20, 10], [21, 10], [21, 11], [22, 11], [22, 12], [23, 12]]);
  // 密林块
  var blocks = [[4, 3, 6, 5], [12, 3, 5, 2], [28, 3, 8, 4], [36, 8, 5, 6],
    [4, 10, 4, 6], [10, 11, 5, 4], [26, 14, 5, 5], [12, 17, 6, 4],
    [4, 20, 5, 5], [32, 20, 7, 5], [14, 23, 6, 3], [24, 25, 5, 3]];
  blocks.forEach(function (b) { rect(forestG, 'T', b[0], b[1], b[2], b[3]); });
  // 心器灌木神龛（x34,y10）
  rect(forestG, 'b', 33, 9, 3, 1);
  pts(forestG, 'b', [[33, 10], [35, 10], [33, 11], [34, 11], [35, 11]]);
  pts(forestG, 'b', [[22, 17], [23, 17], [8, 18], [9, 18], [19, 20], [20, 20], [30, 16], [31, 16]]);
  pts(forestG, 'f', [[6, 26], [7, 26], [16, 26], [17, 26], [38, 26], [39, 26]]);

  var forest = {
    id: 'forest', name: '倒生森林', sub: '树根朝天，雾里挂着笑',
    w: 44, h: 30, g: forestG,
    start: { tx: 22, ty: 26 },
    doors: [
      { z: [21, 29, 2, 1], to: 'meadow', tx: 20, ty: 2 },
      { z: [43, 15, 1, 2], to: 'highland', tx: 2, ty: 16 }
    ],
    objs: [
      { t: 'sign', tx: 19, ty: 27, text: '倒生森林：路在脚下，也在头顶。东：蘑菇高地。' },
      {
        t: 'npc', tx: 9, ty: 12, name: '杳笑', kind: 'cat',
        dlg: [
          '……（树梢上挂着一个笑，半天才传来声音）找我？',
          '森林的路，有时候在脚底下，有时候在头顶。多砍砍灌木。',
          '我哪儿也不去——我走了，笑还在这儿呢。'
        ]
      },
      { t: 'enemy', kind: 'beetle', tx: 16, ty: 14 },
      { t: 'enemy', kind: 'beetle', tx: 30, ty: 12 },
      { t: 'enemy', kind: 'bat', tx: 24, ty: 8 },
      { t: 'enemy', kind: 'bat', tx: 36, ty: 18 },
      { t: 'enemy', kind: 'bat', tx: 16, ty: 22 },
      { t: 'enemy', kind: 'slime', tx: 27, ty: 24 },
      { t: 'enemy', kind: 'slime', tx: 9, ty: 25 },
      { t: 'chest', id: 'f1', tx: 20, ty: 5, item: { k: 'rupee', n: 15 } },
      { t: 'chest', id: 'fp', tx: 34, ty: 10, item: { k: 'piece' } }
    ]
  };

  /* ============================================================
   * 场景四：蘑菇高地 42x30（T 渲染为巨菇）
   * ============================================================ */
  var highG = grid(42, 30, '.');
  border(highG, 42, 30, 'T', [[0, 15, 1, 2], [19, 0, 2, 2]]);
  rect(highG, 'c', 19, 2, 2, 1);
  var mb = [[5, 4, 3, 3], [12, 6, 2, 2], [30, 3, 3, 3], [35, 10, 2, 2],
    [4, 12, 2, 2], [30, 14, 3, 2], [8, 18, 2, 2], [14, 20, 3, 2],
    [28, 22, 2, 2], [34, 24, 3, 2]];
  mb.forEach(function (b) { rect(highG, 'T', b[0], b[1], b[2], b[3]); });
  pts(highG, 'W', [[38, 4], [39, 4], [37, 5], [38, 5], [39, 5]]);
  pts(highG, '#', [[24, 8], [25, 8], [26, 12], [27, 12], [18, 24], [19, 24]]);
  pts(highG, 'b', [[22, 16], [23, 16], [6, 25], [7, 25], [32, 27], [33, 27]]);
  pts(highG, 'f', [[16, 12], [17, 12], [24, 20], [25, 20]]);
  pts(highG, 'p', [[1, 15], [1, 16], [19, 3], [20, 3]]);
  highG[6][36] = 's';
  // 东南裂缝石壁龛：爆弹炸开裂缝石才能进入，内藏星弓
  rect(highG, '#', 37, 24, 3, 1);
  pts(highG, '#', [[37, 25], [37, 27], [39, 25], [39, 27]]);
  pts(highG, 'c', [[38, 27]]);

  var highland = {
    id: 'highland', name: '蘑菇高地', sub: '巨菇如塔，露水改变大小',
    w: 42, h: 30, g: highG, treeStyle: 'mushroom',
    start: { tx: 5, ty: 16 },
    doors: [
      { z: [0, 15, 1, 2], to: 'forest', tx: 41, ty:16 },
      { z: [19, 0, 2, 2], to: 'dungeon', tx: 23, ty: 37 }
    ],
    objs: [
      { t: 'sign', tx: 3, ty: 13, text: '蘑菇高地：北：云镜神殿。裂缝的墙，爆弹认得路。' },
      {
        t: 'npc', tx: 10, ty: 14, name: '蒲宁', kind: 'elder',
        dlg: [
          '嚯，生人！来，尝一口晨露——哎哎别真喝！那是会变大的！',
          '高地的风把菇都吹成了塔。神殿入口在北边，裂了缝的墙怕爆弹。',
          '仙露我这儿可没有，风铃镇的杂货商兴许有卖。'
        ]
      },
      { t: 'enemy', kind: 'blueslime', tx: 20, ty: 12 },
      { t: 'enemy', kind: 'blueslime', tx: 16, ty: 24 },
      { t: 'enemy', kind: 'shroom', tx: 26, ty: 18 },
      { t: 'enemy', kind: 'shroom', tx: 38, ty: 20 },
      { t: 'enemy', kind: 'beetle', tx: 24, ty: 26 },
      { t: 'chest', id: 'h1', tx: 8, ty: 6, item: { k: 'bombs', n: 3 } },
      { t: 'chest', id: 'hp', tx: 33, ty: 23, item: { k: 'piece' } },
      { t: 'chest', id: 'hb', tx: 38, ty: 26, item: { k: 'bow' } },
      { t: 'sign', tx: 40, ty: 26, text: '石龛封得严实——裂缝石怕爆弹，里面好像藏着什么。' },
      { t: 'spring', tx: 36, ty: 6 },
      { t: 'sign', tx: 33, ty: 6, text: '星露温泉：喘口气，再上路。' }
    ]
  };

  /* ============================================================
   * 场景五：云镜神殿 50x40（室内）
   * ============================================================ */
  var dgG = grid(50, 40, 'o');
  // 外边框
  rect(dgG, 'X', 0, 0, 50, 1);
  rect(dgG, 'X', 0, 39, 50, 1);
  rect(dgG, 'X', 0, 0, 1, 40);
  rect(dgG, 'X', 49, 0, 1, 40);
  rect(dgG, 'o', 23, 39, 2, 1);
  // 全图先填实、再逐间雕刻：保证每个房间都有门互通，不留封闭死区
  rect(dgG, 'X', 1, 1, 48, 38);
  // 入口大厅 x17-30 / y30-38（南侧 x23-24 为出入口）
  rect(dgG, 'o', 17, 30, 14, 9);
  // 南北主道 x23-24：同时穿通大厅北墙(y29)与中枢南墙(y19)
  rect(dgG, 'o', 23, 19, 2, 11);
  // 中枢 x17-30 / y12-18
  rect(dgG, 'o', 17, 12, 14, 7);
  // 中枢北门 + 北走廊（通往 Boss 锁门）
  rect(dgG, 'o', 23, 11, 2, 1);
  rect(dgG, 'o', 19, 10, 12, 1);
  // 东西连接廊 y14-15：中枢侧门 → 廊 → 两翼
  rect(dgG, 'o', 16, 14, 1, 2);
  rect(dgG, 'o', 13, 14, 3, 2);
  rect(dgG, 'o', 12, 14, 1, 2);
  rect(dgG, 'o', 31, 14, 1, 2);
  rect(dgG, 'o', 32, 14, 3, 2);
  // 西翼 x4-11 / y12-18；北门通往西北室
  rect(dgG, 'o', 4, 12, 8, 7);
  rect(dgG, 'o', 10, 11, 1, 1);
  // 东翼 x36-43 / y12-18（仅西侧锁门可入）
  rect(dgG, 'o', 36, 12, 8, 7);
  // 西北室 x9-14 / y2-8；南门孔在 y9
  rect(dgG, 'o', 9, 2, 6, 7);
  rect(dgG, 'o', 10, 9, 1, 1);
  // 汐音内室 x20-29 / y1-2
  rect(dgG, 'o', 20, 1, 10, 2);
  // 内室南墙 y3（仅 G 门，击败乌有王后开启）
  rect(dgG, 'X', 20, 3, 10, 1);
  // Boss 战场 x20-29 / y4-8（5 格高 120px，留足闪避纵深）
  rect(dgG, 'o', 20, 4, 10, 5);
  // 战场南墙 y9：由全图填充形成平直整墙（内侧零死角）；L 门直通 y10 走廊
  // 锁门 L（各耗一把小钥匙）：东翼回力镖 / 西北室 / Boss 房
  rect(dgG, 'L', 35, 14, 1, 1);
  rect(dgG, 'L', 10, 10, 1, 1);
  rect(dgG, 'L', 24, 9, 1, 1);
  // Boss 内门 G：击败乌有王后开启
  rect(dgG, 'G', 24, 3, 1, 1);
  // 中枢钥匙围栏（G）——由远射开关控制
  rect(dgG, 'G', 23, 14, 3, 1);
  pts(dgG, 'G', [[23, 15], [25, 15], [23, 16]]);
  rect(dgG, 'G', 23, 16, 3, 1);
  // 中枢远射开关围栏（g：人不过，弹道过）
  rect(dgG, 'g', 27, 16, 3, 1);
  pts(dgG, 'g', [[27, 17], [29, 17]]);
  rect(dgG, 'g', 27, 18, 3, 1);
  dgG[17][28] = 'S';
  // 西北室机关：G 围栏 + 地面开关
  rect(dgG, 'G', 11, 4, 3, 1);
  dgG[6][10] = 'S';

  var dungeon = {
    id: 'dungeon', name: '云镜神殿', sub: '镜子后面，房间永远数不完',
    w: 50, h: 40, g: dgG, indoor: true,
    start: { tx: 24, ty: 37 },
    doors: [
      { z: [23, 39, 2, 1], to: 'highland', tx: 20, ty: 4 }
    ],
    objs: [
      // 西翼：清敌 → key1
      { t: 'enemy', kind: 'card', tx: 6, ty: 14, grp: 'W' },
      { t: 'enemy', kind: 'card', tx: 10, ty: 16, grp: 'W' },
      { t: 'enemy', kind: 'bat', tx: 8, ty: 13, grp: 'W' },
      { t: 'chest', id: 'dk1', tx: 8, ty: 15, item: { k: 'key' }, needClear: 'W' },
      // 西北室：开关 → key2
      { t: 'chest', id: 'dk2', tx: 12, ty: 3, item: { k: 'key' } },
      // 东翼：守卫 → 回力镖
      { t: 'enemy', kind: 'card', tx: 38, ty: 13, grp: 'E' },
      { t: 'enemy', kind: 'card', tx: 42, ty: 16, grp: 'E' },
      { t: 'enemy', kind: 'shroom', tx: 40, ty: 15, grp: 'E' },
      { t: 'chest', id: 'dboom', tx: 40, ty: 14, item: { k: 'boomerang' }, needClear: 'E' },
      // 中枢：远射开关 → key3
      { t: 'chest', id: 'dk3', tx: 24, ty: 15, item: { k: 'key' } },
      // Boss
      { t: 'enemy', kind: 'boss', tx: 25, ty: 6, grp: 'B' },
      // 汐音（boss 亡、内门开后可交互 → 通关）
      { t: 'npc', tx: 25, ty: 2, name: '汐音', kind: 'dream', need: 'boss',
        dlg: [
          '……光好暖。是你吗？',
          '我都听见了。你一路走来的声音，怀表兔的铃声，还有风。',
          '替我去看看云隙外面吧——他还在等你回去喝茶呢。'
        ] }
    ]
  };

  LX.DATA = {
    ORDER: ['meadow', 'village', 'forest', 'highland', 'dungeon'],
    SCENES: {
      meadow: meadow, village: village, forest: forest,
      highland: highland, dungeon: dungeon
    }
  };
})();
