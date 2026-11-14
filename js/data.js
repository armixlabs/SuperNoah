'use strict';
/* =========================================================
   Super Noah – Daten: Konstanten, Kostüme, Welten und Level
   ========================================================= */

const T = 40;          // Kachelgröße in Pixeln
const LH = 14;         // Levelhöhe in Kacheln
const VW = 960, VH = 560;

const PHYSICS = {
  normal: { g: 2400, jump: 920, run: 290, accel: 2400, airAccel: 1700, friction: 2800, maxFall: 950 },
  space:  { g: 1350, jump: 780, run: 280, accel: 2000, airAccel: 1400, friction: 2200, maxFall: 620 },
  ice:    { g: 2400, jump: 920, run: 300, accel: 1100, airAccel: 1500, friction: 520, maxFall: 950 },
  water:  { g: 650, jump: 330, run: 190, accel: 1300, airAccel: 1300, friction: 900, maxFall: 200, swim: true },
};

const OUTFITS = [
  { id: 'feuerwehr', name: 'Feuerwehr-Noah',   price: 0,   jacket: '#25358a', pants: '#1c2a6b', stripe: '#ffd400', helmet: '#e3261f', boots: '#222', style: 'fire' },
  { id: 'astronaut', name: 'Astronauten-Noah', price: 80,  jacket: '#f4f4f4', pants: '#d9d9e0', stripe: '#ff7a00', helmet: '#ffffff', boots: '#5a5a66', style: 'space' },
  { id: 'dino',      name: 'Dino-Noah',        price: 120, jacket: '#4caf50', pants: '#388e3c', stripe: '#ffeb3b', helmet: '#43a047', boots: '#2e6b31', style: 'dino' },
  { id: 'lava',      name: 'Lava-Noah',        price: 180, jacket: '#2b2b2b', pants: '#1b1b1b', stripe: '#ff6a00', helmet: '#ff5a00', boots: '#111', style: 'fire' },
  { id: 'eis',       name: 'Eis-Noah',         price: 150, jacket: '#4fc3f7', pants: '#0288d1', stripe: '#ffffff', helmet: '#e1f5fe', boots: '#01579b', style: 'fire' },
  { id: 'taucher',   name: 'Taucher-Noah',     price: 200, jacket: '#fdd835', pants: '#263238', stripe: '#263238', helmet: '#fdd835', boots: '#263238', style: 'space' },
  { id: 'roboter',   name: 'Roboter-Noah',     price: 250, jacket: '#90a4ae', pants: '#546e7a', stripe: '#ff5252', helmet: '#b0bec5', boots: '#37474f', style: 'fire' },
  { id: 'gold',      name: 'Gold-Noah',        price: 400, jacket: '#e2b100', pants: '#b98f0a', stripe: '#fff6b0', helmet: '#ffd700', boots: '#7a5c00', style: 'fire', sparkle: true },
];
const OUTFIT_IDS = OUTFITS.map(o => o.id);
const outfitById = id => OUTFITS.find(o => o.id === id) || OUTFITS[0];

const WORLDS = [
  { name: 'Dino-Tal',         theme: 'dino',  collect: 'Dino-Eier',     collect1: 'Dino-Ei',      say: 'Ein Dino-Ei!',              color: '#43a047' },
  { name: 'Feuerwehr-Stadt',  theme: 'city',  collect: 'Kätzchen',      collect1: 'Kätzchen',     say: 'Kätzchen gerettet!',        color: '#e53935' },
  { name: 'Weltraum',         theme: 'space', collect: 'Sterne',        collect1: 'Stern',        say: 'Ein Stern!',                color: '#5e35b1' },
  { name: 'Eis-Land',         theme: 'ice',   collect: 'Pinguin-Babys', collect1: 'Pinguin-Baby', say: 'Pinguin-Baby gerettet!',    color: '#039be5' },
  { name: 'Tiefsee',          theme: 'sea',   collect: 'Perlen',        collect1: 'Perle',        say: 'Eine Perle!',               color: '#00838f' },
  { name: 'Roboter-Station',  theme: 'robo',  collect: 'Zahnräder',     collect1: 'Zahnrad',      say: 'Ein goldenes Zahnrad!',     color: '#f57c00' },
];

/* ---------- Level-Baukasten ---------- */
class LevelBuilder {
  constructor(w) {
    this.w = w; this.h = LH;
    this.grid = [];
    for (let y = 0; y < LH; y++) this.grid.push(new Array(w).fill('.'));
    this.ents = []; this.boxes = {}; this.stars = 0;
  }
  set(x, y, c) { if (x >= 0 && x < this.w && y >= 0 && y < this.h) this.grid[y][x] = c; }
  rect(x, y, w, h, c = 'G') { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  ground(x1, x2, top = 12) { this.rect(x1, top, x2 - x1 + 1, this.h - top, 'G'); }
  lava(x1, x2) { this.rect(x1, 13, x2 - x1 + 1, 1, 'L'); }
  plat(x, y, w) { for (let i = 0; i < w; i++) if (this.grid[y][x + i] === '.') this.set(x + i, y, 'P'); }
  stairs(x, n, base = 12) { for (let i = 0; i < n; i++) this.rect(x + i, base - i - 1, 1, i + 1); }
  blocks(x, y, s) {
    const map = { b: 'B', g: 'G', u: 'U' };
    const prize = { q: 'coin', h: 'helmet', w: 'hose', r: 'heart' };
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (map[c]) this.set(x + i, y, map[c]);
      else if (prize[c]) { this.set(x + i, y, 'Q'); this.boxes[(x + i) + ',' + y] = prize[c]; }
    }
  }
  e(type, x, y, o = {}) { this.ents.push(Object.assign({ type, x, y }, o)); }
  coins(x, y, n) { for (let i = 0; i < n; i++) this.e('coin', x + i, y); }
  coinArc(x, y, n) { for (let i = 0; i < n; i++) this.e('coin', x + i, y - Math.round(Math.sin(Math.PI * i / (n - 1)) * 2)); }
  star(x, y) { this.e('star', x, y, { idx: this.stars++ }); }
  sign(x, y, text) { this.e('sign', x, y, { text }); }
  walker(x, y) { this.e('walker', x, y); }
  spiky(x, y) { this.e('spiky', x, y); }
  flyer(x, y) { this.e('flyer', x, y); }
  fire(x, y) { this.e('fire', x, y); }
  jumper(x) { this.e('jumper', x, 13); }
  spring(x, y) { this.e('spring', x, y); }
  check(x, y) { this.e('check', x, y); }
  goal(x, y) { this.e('goal', x, y); }
  meteors(x, w) { this.e('meteors', x, 0, { w }); }
  jelly(x, y, amp) { this.e('jelly', x, y, { amp }); }
  urchin(x, y) { this.e('urchin', x, y); }
  laser(x, y1, y2, phase = 0) { this.e('laser', x, y1, { y2, phase }); }
  conv(x1, x2, y, dir) { this.rect(x1, y, x2 - x1 + 1, 1, dir > 0 ? '>' : '<'); this.rect(x1, y + 1, x2 - x1 + 1, this.h - y - 1, 'G'); }
  mplat(x, y, w, o = {}) { this.e('mplat', x, y, Object.assign({ w }, o)); }
  boss(ax1, ax2, x, y) {
    this.rect(ax2, 0, 1, 12, 'X');
    this.e('boss', x, y, { ax1, ax2, idx: this.stars++ });
  }
}

/* ---------- Die Level ---------- */
const LEVELS = [
  /* ================= WELT 1: DINO-TAL ================= */
  {
    id: '1-1', world: 0, name: 'Willkommen im Dino-Tal', w: 175,
    build(L) {
      L.ground(0, 24);
      L.sign(3, 11, 'Hallo {name}! {move}');
      L.coins(6, 10, 4);
      L.sign(10, 11, '{jump} Stoß von unten gegen die goldenen Kisten!');
      L.blocks(12, 8, 'bqbhb');
      L.walker(21, 11);
      L.coinArc(24, 9, 4);
      L.ground(27, 46);
      L.sign(28, 11, 'Hüpf den kleinen Dinos auf den Kopf!');
      L.plat(31, 9, 4); L.coins(31, 8, 4);
      L.walker(36, 11);
      L.plat(37, 6, 3); L.star(38, 5);
      L.walker(42, 11);
      L.ground(47, 51, 10); L.coins(47, 9, 5);
      L.ground(52, 82);
      L.spring(57, 11); L.plat(55, 4, 5); L.coins(55, 3, 5);
      L.check(62, 11);
      L.blocks(66, 8, 'qqq');
      L.flyer(70, 8); L.walker(76, 11);
      L.coinArc(82, 8, 5);
      L.ground(86, 104);
      L.sign(87, 11, 'Achtung! Auf Stachel-Dinos darf man nicht hüpfen. Spring einfach drüber!');
      L.spiky(93, 11);
      L.stairs(100, 4); L.rect(104, 8, 1, 4);
      L.ground(108, 135);
      L.blocks(112, 9, 'bbwbb');
      L.walker(118, 11); L.walker(121, 11);
      L.blocks(122, 9, 'gg');
      L.plat(125, 6, 3); L.star(126, 5);
      L.flyer(130, 7);
      L.ground(139, 175);
      L.walker(143, 11);
      L.blocks(146, 9, 'qrq');
      L.stairs(153, 4); L.rect(157, 8, 2, 4);
      L.star(158, 5);
      L.goal(167, 11);
    }
  },
  {
    id: '1-2', world: 0, name: 'Der Vulkan-Pfad', w: 185,
    build(L) {
      L.ground(0, 15);
      L.sign(3, 11, 'Vorsicht, heiße Lava! Spring über die Feuerbälle.');
      L.blocks(8, 9, 'bqb');
      L.lava(16, 18); L.jumper(17);
      L.ground(19, 30);
      L.walker(25, 11);
      L.lava(31, 34); L.jumper(32); L.coinArc(30, 8, 6);
      L.ground(35, 50);
      L.blocks(39, 9, 'qhq');
      L.flyer(45, 8); L.walker(48, 11);
      L.lava(51, 60); L.mplat(52, 10, 3, { dx: 5 }); L.star(56, 7);
      L.ground(61, 80);
      L.check(63, 11);
      L.rect(68, 10, 6, 2); L.walker(70, 9);
      L.spiky(77, 11);
      L.lava(81, 83); L.jumper(82);
      L.ground(84, 100);
      L.spring(88, 11); L.plat(86, 4, 6); L.coins(86, 3, 5); L.star(91, 3);
      L.flyer(95, 8);
      L.lava(101, 105); L.rect(103, 10, 1, 4);
      L.ground(106, 130);
      L.blocks(110, 9, 'bbqbb'); L.coins(110, 8, 5);
      L.walker(115, 11); L.walker(118, 11); L.spiky(123, 11);
      L.check(128, 11);
      L.lava(131, 145); L.mplat(132, 10, 3, { dx: 4 }); L.mplat(139, 9, 3, { dx: 3, speed: 60 });
      L.coins(136, 6, 3);
      L.ground(146, 185);
      L.blocks(150, 9, 'bbb'); L.star(152, 6);
      L.walker(156, 11);
      L.stairs(160, 4); L.rect(164, 8, 2, 4);
      L.goal(174, 11);
    }
  },
  {
    id: '1-3', world: 0, name: 'Der große T-Rex', w: 110, boss: true,
    build(L) {
      L.ground(0, 20);
      L.sign(3, 11, 'Der große T-Rex wartet! Hüpf ihm dreimal auf den Kopf.');
      L.blocks(7, 9, 'qhq');
      L.walker(14, 11); L.walker(17, 11);
      L.lava(21, 23); L.jumper(22);
      L.ground(24, 45);
      L.plat(27, 9, 3); L.plat(31, 6, 3); L.star(32, 5);
      L.flyer(36, 8); L.spiky(40, 11);
      L.lava(46, 50); L.mplat(47, 10, 2, { dx: 2 });
      L.ground(51, 110);
      L.check(53, 11);
      L.blocks(57, 9, 'brb'); L.star(58, 5);
      L.walker(62, 11); L.walker(65, 11); L.flyer(68, 7);
      L.check(72, 11);
      L.boss(75, 98, 88, 11);
      L.goal(103, 11);
    }
  },

  /* ================= WELT 2: FEUERWEHR-STADT ================= */
  {
    id: '2-1', world: 1, name: 'Feuer in der Stadt', w: 175, startPower: 'hose',
    build(L) {
      L.ground(0, 22);
      L.sign(3, 11, 'Du bist Feuerwehrmann! {spray} und lösch die Feuer.');
      L.fire(10, 11); L.fire(14, 11);
      L.blocks(17, 9, 'bqb');
      L.walker(20, 11);
      L.coinArc(22, 9, 5);
      L.ground(26, 45, 11);
      L.walker(30, 10);
      L.fire(34, 10); L.fire(35, 10); L.fire(36, 10);
      L.plat(39, 8, 4); L.fire(40, 7); L.star(42, 7);
      L.ground(49, 70);
      L.check(51, 11);
      L.spring(56, 11); L.plat(54, 4, 5); L.coins(54, 3, 3); L.fire(58, 3);
      L.flyer(62, 8); L.walker(66, 11);
      L.ground(74, 95, 10);
      L.blocks(78, 6, 'qrq');
      L.fire(80, 9); L.fire(81, 9);
      L.walker(85, 9); L.spiky(90, 9);
      L.ground(99, 125);
      L.check(101, 11);
      L.blocks(105, 10, 'g'); L.plat(107, 7, 4); L.fire(108, 6); L.star(110, 6);
      L.flyer(115, 7);
      L.fire(118, 11); L.fire(119, 11); L.fire(120, 11);
      L.ground(129, 175);
      L.stairs(138, 4); L.rect(142, 8, 4, 4);
      L.fire(142, 7); L.star(145, 7);
      L.walker(150, 11); L.spiky(155, 11);
      L.goal(165, 11);
    }
  },
  {
    id: '2-2', world: 1, name: 'Hochhaus-Rettung', w: 170, startPower: 'hose',
    build(L) {
      L.ground(0, 20);
      L.sign(3, 11, 'Manche Feuer musst du löschen, damit du weiterkommst!');
      L.blocks(8, 9, 'bqqb');
      L.walker(15, 11);
      L.ground(21, 45);
      L.rect(26, 0, 14, 10, 'G');
      L.coins(27, 11, 3); L.fire(30, 11); L.coins(31, 11, 3); L.fire(34, 11); L.coins(35, 11, 2); L.fire(37, 11);
      L.mplat(48, 10, 3, { dy: -4 });
      L.ground(53, 59);
      L.check(55, 11);
      L.spring(58, 11);
      L.ground(60, 70, 7);
      L.fire(63, 6); L.walker(66, 6); L.star(69, 6);
      L.ground(71, 80);
      L.flyer(76, 8);
      L.mplat(82, 10, 2, { dx: 2 });
      L.ground(86, 94);
      L.check(88, 11);
      L.mplat(93, 11, 2, { dy: -5, speed: 60 });
      L.ground(95, 105, 6);
      L.blocks(97, 2, 'qrq');
      L.fire(100, 5); L.fire(101, 5); L.star(104, 5);
      L.ground(106, 125);
      L.spiky(112, 11); L.walker(116, 11); L.flyer(120, 7);
      L.ground(129, 170);
      L.check(131, 11);
      L.rect(136, 0, 8, 10, 'G'); L.fire(138, 11); L.fire(141, 11);
      L.stairs(146, 3); L.plat(150, 6, 3); L.star(151, 5);
      L.walker(155, 11); L.walker(158, 11);
      L.goal(164, 11);
    }
  },
  {
    id: '2-3', world: 1, name: 'Der Feuer-Riese', w: 105, startPower: 'hose', boss: true,
    build(L) {
      L.ground(0, 25);
      L.sign(3, 11, 'Der Feuer-Riese! Spritz ihn nass oder hüpf ihm auf den Kopf.');
      L.blocks(8, 9, 'brb');
      L.fire(13, 11); L.walker(18, 11);
      L.ground(29, 50, 11);
      L.check(31, 10);
      L.plat(36, 8, 3); L.fire(37, 7); L.star(38, 7);
      L.flyer(44, 7); L.spiky(47, 10);
      L.ground(54, 105);
      L.check(56, 11);
      L.blocks(60, 9, 'bqb'); L.star(61, 6);
      L.boss(66, 89, 79, 11);
      L.goal(95, 11);
    }
  },

  /* ================= WELT 3: WELTRAUM ================= */
  {
    id: '3-1', world: 2, name: 'Mond-Spaziergang', w: 185, space: true,
    build(L) {
      L.ground(0, 20);
      L.sign(3, 11, 'Im Weltraum kannst du super hoch springen!');
      L.blocks(8, 8, 'bqhqb');
      L.walker(15, 11);
      L.coinArc(20, 8, 7);
      L.ground(26, 40, 11);
      L.plat(30, 7, 3); L.plat(35, 3, 3); L.star(36, 2);
      L.walker(38, 10);
      L.coinArc(40, 7, 8); L.plat(43, 9, 2);
      L.ground(47, 70);
      L.check(49, 11);
      L.blocks(55, 8, 'qqqqq');
      L.flyer(58, 5); L.spiky(62, 11); L.walker(66, 11);
      L.plat(72, 9, 3);
      L.ground(76, 100, 11);
      L.spring(81, 10); L.rect(83, 3, 3, 1); L.star(84, 2);
      L.walker(90, 10); L.flyer(94, 6);
      L.ground(106, 130);
      L.check(108, 11);
      L.spiky(115, 11); L.blocks(118, 8, 'brb'); L.walker(121, 11); L.walker(125, 11);
      L.plat(133, 8, 2);
      L.ground(137, 185);
      L.stairs(145, 4); L.plat(151, 5, 4); L.star(153, 4);
      L.walker(160, 11); L.spiky(165, 11);
      L.goal(175, 11);
    }
  },
  {
    id: '3-2', world: 2, name: 'Meteoriten-Regen', w: 195, space: true,
    build(L) {
      L.ground(0, 25);
      L.sign(3, 11, 'Achtung, Meteoriten! Lauf weg von den roten Kreisen.');
      L.blocks(9, 8, 'qhq');
      L.meteors(12, 12);
      L.mplat(28, 10, 3, { dx: 3 });
      L.ground(34, 55);
      L.check(36, 11);
      L.meteors(38, 16);
      L.plat(41, 8, 2); L.plat(44, 5, 3); L.star(45, 4);
      L.walker(47, 11); L.flyer(50, 6); L.spiky(53, 11);
      L.mplat(57, 10, 3, { dx: 3 }); L.mplat(63, 8, 3, { dy: 3 }); L.mplat(67, 10, 2, { dx: 1 }); L.star(64, 5);
      L.ground(71, 95);
      L.check(73, 11);
      L.meteors(75, 18);
      L.blocks(80, 8, 'bqrqb');
      L.walker(84, 11); L.walker(88, 11); L.spiky(92, 11);
      L.plat(98, 10, 2);
      L.ground(101, 125, 10);
      L.flyer(108, 6); L.flyer(114, 5); L.walker(118, 9);
      L.mplat(127, 9, 3, { dy: -3 });
      L.ground(132, 195);
      L.check(134, 11);
      L.meteors(140, 20);
      L.stairs(150, 4); L.plat(155, 5, 3); L.star(156, 4);
      L.walker(162, 11); L.spiky(166, 11); L.walker(170, 11);
      L.goal(182, 11);
    }
  },
  {
    id: '3-3', world: 2, name: 'Das Alien-UFO', w: 105, space: true, boss: true,
    build(L) {
      L.ground(0, 25);
      L.sign(3, 11, 'Das große Alien-UFO! Wenn es runterkommt, hüpf drauf!');
      L.blocks(8, 8, 'qhq');
      L.walker(14, 11); L.flyer(20, 7);
      L.plat(28, 10, 1);
      L.ground(31, 55);
      L.check(33, 11);
      L.plat(38, 7, 3); L.star(39, 5);
      L.spiky(44, 11); L.walker(48, 11);
      L.blocks(50, 8, 'bwb');
      L.mplat(57, 10, 2, { dx: 2 });
      L.ground(61, 105);
      L.check(63, 11);
      L.plat(66, 7, 3); L.star(67, 5);
      L.boss(70, 93, 81, 4);
      L.goal(99, 11);
    }
  },

  /* ================= WELT 4: EIS-LAND ================= */
  {
    id: '4-1', world: 3, name: 'Rutschpartie im Schnee', w: 170, phys: 'ice',
    build(L) {
      L.ground(0, 24);
      L.sign(3, 11, 'Brrr, hier ist alles aus Eis! Der Boden ist rutschig. Brems rechtzeitig!');
      L.coins(7, 10, 4);
      L.blocks(13, 9, 'bqhqb');
      L.walker(20, 11);
      L.coinArc(24, 9, 4);
      L.ground(27, 48);
      L.plat(31, 9, 4); L.coins(31, 8, 4);
      L.plat(36, 6, 3); L.star(37, 5);
      L.walker(38, 11); L.spiky(44, 11);
      L.lava(49, 52); L.jumper(50); L.coinArc(48, 8, 6);
      L.ground(53, 75);
      L.check(55, 11);
      L.ground(60, 66, 10);
      L.flyer(63, 6);
      L.walker(70, 11);
      L.spring(73, 11); L.plat(71, 4, 5); L.coins(71, 3, 5);
      L.lava(76, 79); L.mplat(76, 10, 2, { dx: 2 });
      L.ground(80, 100);
      L.sign(81, 11, 'Achtung, Eiszapfen fallen herunter! Lauf weg von den roten Kreisen.');
      L.meteors(84, 14);
      L.blocks(88, 9, 'bqrqb');
      L.spiky(94, 11);
      L.stairs(97, 3); L.rect(100, 9, 1, 3);
      L.ground(104, 130);
      L.check(106, 11);
      L.walker(111, 11); L.walker(115, 11); L.flyer(119, 7);
      L.blocks(121, 9, 'gg'); L.plat(124, 6, 3); L.star(125, 5);
      L.lava(131, 134); L.jumper(132);
      L.ground(135, 170);
      L.urchin(140, 11);
      L.blocks(144, 9, 'qqq');
      L.walker(149, 11);
      L.stairs(152, 4); L.rect(156, 8, 2, 4); L.star(157, 5);
      L.goal(163, 11);
    }
  },
  {
    id: '4-2', world: 3, name: 'Die Eiszapfen-Höhle', w: 180, phys: 'ice',
    build(L) {
      L.ground(0, 20);
      L.rect(8, 0, 172, 2);
      L.sign(3, 11, 'Eine Eishöhle! Pass auf die spitzen Eis-Stacheln am Boden auf.');
      L.blocks(10, 9, 'qhq');
      L.urchin(16, 11);
      L.lava(21, 24); L.mplat(21, 10, 2, { dx: 2 });
      L.ground(25, 45);
      L.meteors(27, 14);
      L.walker(30, 11); L.spiky(36, 11);
      L.plat(38, 8, 3); L.star(39, 7);
      L.ground(46, 49, 10); L.ground(50, 53, 8); L.coins(50, 7, 4);
      L.ground(57, 80);
      L.check(59, 11);
      L.rect(64, 2, 10, 6);
      L.urchin(67, 11); L.urchin(71, 11);
      L.flyer(77, 7);
      L.lava(81, 90); L.mplat(82, 10, 3, { dx: 5 }); L.star(86, 7);
      L.ground(91, 115);
      L.check(93, 11);
      L.meteors(95, 16);
      L.blocks(99, 9, 'bqwqb');
      L.walker(104, 11); L.walker(108, 11); L.spiky(112, 11);
      L.lava(116, 119); L.jumper(118);
      L.ground(120, 140);
      L.spring(124, 11); L.plat(126, 5, 4); L.coins(126, 4, 4); L.star(132, 3);
      L.urchin(136, 11);
      L.lava(141, 144); L.mplat(141, 10, 2, { dx: 2 });
      L.ground(145, 180);
      L.walker(150, 11); L.flyer(155, 7);
      L.stairs(160, 3);
      L.goal(170, 11);
    }
  },
  {
    id: '4-3', world: 3, name: 'Der Schnee-Yeti', w: 110, phys: 'ice', boss: true,
    build(L) {
      L.ground(0, 22);
      L.sign(3, 11, 'Der Schnee-Yeti wirft Schneebälle! Hüpf ihm dreimal auf den Kopf.');
      L.blocks(8, 9, 'qhq');
      L.walker(15, 11); L.urchin(19, 11);
      L.lava(23, 26); L.jumper(24);
      L.ground(27, 48);
      L.plat(30, 9, 3); L.plat(34, 6, 3); L.star(35, 5);
      L.flyer(39, 8); L.spiky(44, 11);
      L.lava(49, 53); L.mplat(49, 10, 2, { dx: 3 });
      L.ground(54, 110);
      L.check(56, 11);
      L.blocks(60, 9, 'brb'); L.star(61, 5);
      L.walker(65, 11); L.walker(68, 11);
      L.check(72, 11);
      L.boss(75, 98, 88, 11);
      L.goal(103, 11);
    }
  },

  /* ================= WELT 5: TIEFSEE ================= */
  {
    id: '5-1', world: 4, name: 'Ab ins Meer', w: 170, phys: 'water',
    build(L) {
      L.ground(0, 39);
      L.sign(3, 11, 'Hier kannst du schwimmen! Halte Springen gedrückt, dann schwimmst du nach oben.');
      L.coins(7, 8, 4); L.coins(12, 5, 4);
      L.rect(18, 7, 2, 5); L.coins(18, 5, 2);
      L.walker(24, 11); L.flyer(28, 6);
      L.blocks(31, 8, 'qhq');
      L.rect(36, 0, 2, 8);
      L.coinArc(39, 9, 6);
      L.ground(44, 99);
      L.jelly(47, 6);
      L.sign(49, 11, 'Quallen und Seeigel piksen! Schwimm einfach drum herum.');
      L.urchin(53, 11); L.urchin(54, 11);
      L.rect(58, 5, 2, 7); L.star(58, 3);
      L.flyer(63, 4); L.flyer(66, 8);
      L.check(70, 11);
      L.rect(74, 0, 12, 5); L.rect(74, 9, 12, 3);
      L.coins(75, 7, 10); L.flyer(80, 6);
      L.walker(92, 11); L.jelly(96, 7);
      L.coinArc(99, 8, 7);
      L.ground(105, 170);
      L.check(107, 11);
      L.blocks(111, 8, 'bqrqb');
      L.rect(118, 3, 2, 9);
      L.jelly(123, 5); L.jelly(127, 8);
      L.urchin(131, 11);
      L.rect(136, 5, 1, 7); L.rect(140, 5, 1, 7); L.star(138, 10);
      L.flyer(146, 6); L.walker(150, 11);
      L.rect(154, 0, 2, 7);
      L.star(158, 2);
      L.goal(162, 11);
    }
  },
  {
    id: '5-2', world: 4, name: 'Das versunkene Schiff', w: 180, phys: 'water',
    build(L) {
      L.ground(0, 45);
      L.sign(3, 11, 'Ein versunkenes Schiff! Morsche Planken kannst du von unten kaputt stoßen.');
      L.blocks(9, 8, 'qwq');
      L.jelly(14, 6); L.walker(18, 11);
      L.rect(22, 6, 2, 6); L.coins(22, 4, 2);
      L.flyer(27, 5); L.flyer(30, 9);
      L.urchin(34, 11); L.urchin(35, 11); L.jelly(38, 5);
      L.coinArc(45, 8, 7);
      L.ground(51, 110);
      L.check(53, 11);
      L.rect(58, 6, 17, 1, 'B'); L.rect(58, 7, 1, 3); L.rect(74, 7, 1, 5); L.rect(66, 1, 1, 5);
      L.coins(60, 10, 6); L.coins(68, 8, 5); L.star(71, 10); L.walker(64, 11);
      L.jelly(78, 6); L.flyer(82, 4);
      L.blocks(85, 8, 'bqrqb');
      L.rect(90, 0, 2, 8);
      L.urchin(94, 11); L.jelly(97, 7); L.jelly(101, 4);
      L.check(105, 11);
      L.jelly(113, 6);
      L.ground(117, 180);
      L.rect(121, 3, 2, 9); L.rect(127, 0, 2, 9); L.rect(133, 3, 2, 9);
      L.coins(123, 2, 3); L.coins(129, 10, 3); L.star(130, 2);
      L.urchin(124, 11);
      L.flyer(138, 6); L.check(140, 11); L.walker(144, 11); L.jelly(147, 5); L.jelly(151, 8);
      L.blocks(155, 8, 'qqq');
      L.rect(160, 4, 1, 8); L.rect(164, 4, 1, 8); L.star(162, 10);
      L.goal(170, 11);
    }
  },
  {
    id: '5-3', world: 4, name: 'Die Riesen-Krake', w: 110, phys: 'water', boss: true,
    build(L) {
      L.ground(0, 110);
      L.sign(3, 11, 'Die Riesen-Krake spritzt Tinte! Schwimm über sie und hüpf ihr auf den Kopf.');
      L.blocks(8, 8, 'qhq');
      L.jelly(14, 6); L.walker(18, 11);
      L.rect(22, 5, 2, 7); L.star(22, 3);
      L.flyer(27, 6); L.urchin(31, 11); L.jelly(35, 4); L.jelly(39, 8);
      L.rect(44, 0, 2, 8);
      L.check(48, 11);
      L.blocks(52, 8, 'brb');
      L.rect(57, 5, 1, 7); L.rect(61, 5, 1, 7); L.star(59, 10);
      L.flyer(65, 5); L.walker(68, 11);
      L.check(72, 11);
      L.boss(75, 98, 88, 6);
      L.goal(102, 11);
    }
  },

  /* ================= WELT 6: ROBOTER-STATION ================= */
  {
    id: '6-1', world: 5, name: 'Die Roboter-Fabrik', w: 175,
    build(L) {
      L.ground(0, 22);
      L.sign(3, 11, 'Eine Roboter-Station! Die Laufbänder schieben dich. Lauf mit oder dagegen!');
      L.blocks(8, 9, 'bqhqb');
      L.walker(16, 11);
      L.conv(23, 34, 12, 1); L.coins(24, 10, 10);
      L.ground(35, 46); L.spiky(40, 11);
      L.conv(47, 56, 12, -1); L.flyer(52, 8);
      L.ground(57, 62);
      L.coinArc(62, 9, 5);
      L.ground(66, 90);
      L.check(68, 11);
      L.sign(71, 11, 'Vorsicht, Laser! Warte, bis der rote Strahl aus ist, dann lauf schnell durch.');
      L.laser(75, 2, 11, 0); L.laser(81, 2, 11, 1.6);
      L.star(78, 7);
      L.blocks(85, 9, 'qrq');
      L.ground(94, 120);
      L.walker(98, 11); L.walker(102, 11);
      L.spring(106, 11); L.plat(108, 4, 5); L.coins(108, 3, 4); L.star(112, 3);
      L.urchin(116, 11);
      L.mplat(122, 10, 2, { dx: 3 });
      L.ground(127, 175);
      L.check(129, 11);
      L.conv(133, 142, 12, -1); L.laser(138, 2, 11, 0.8);
      L.flyer(146, 7); L.spiky(150, 11);
      L.stairs(153, 4); L.rect(157, 8, 2, 4); L.star(158, 5);
      L.goal(166, 11);
    }
  },
  {
    id: '6-2', world: 5, name: 'Das Laser-Labyrinth', w: 185,
    build(L) {
      L.ground(0, 20);
      L.sign(3, 11, 'Hier gibt es viele Laser und Schwebe-Plattformen. Nimm dir Zeit!');
      L.blocks(8, 9, 'qwq');
      L.walker(13, 11);
      L.laser(17, 2, 11, 0);
      L.mplat(22, 10, 3, { dx: 2 }); L.mplat(27, 9, 2, { dy: -3 });
      L.ground(31, 50);
      L.conv(34, 43, 12, 1); L.flyer(40, 5);
      L.plat(36, 8, 3); L.star(37, 7);
      L.urchin(47, 11);
      L.ground(54, 80);
      L.check(56, 11);
      L.rect(60, 0, 14, 9);
      L.laser(63, 9, 11, 0); L.laser(67, 9, 11, 1.0); L.laser(71, 9, 11, 2.0);
      L.coins(61, 11, 2); L.coins(64, 11, 3); L.coins(68, 11, 3);
      L.spiky(77, 11);
      L.mplat(81, 10, 2, { dx: 2 });
      L.ground(85, 110);
      L.check(87, 11);
      L.blocks(91, 9, 'bqrqb');
      L.walker(95, 11); L.walker(99, 11); L.flyer(103, 6);
      L.spring(108, 11);
      L.ground(111, 121, 6);
      L.laser(115, 2, 5, 0.5); L.star(119, 5);
      L.ground(122, 140);
      L.urchin(127, 11); L.conv(129, 138, 12, -1); L.flyer(134, 8);
      L.plat(142, 10, 2); L.mplat(145, 9, 2, { dy: 2 }); L.plat(148, 10, 2);
      L.ground(151, 185);
      L.check(153, 11);
      L.laser(158, 2, 11, 0); L.walker(162, 11);
      L.stairs(165, 3); L.plat(169, 6, 3); L.star(170, 5);
      L.goal(177, 11);
    }
  },
  {
    id: '6-3', world: 5, name: 'Der Mega-Roboter', w: 110, boss: true,
    build(L) {
      L.ground(0, 22);
      L.sign(3, 11, 'Der Mega-Roboter schießt Blitze! Spring drüber und hüpf ihm viermal auf den Kopf.');
      L.blocks(8, 9, 'qhq');
      L.walker(15, 11); L.laser(19, 2, 11, 0);
      L.ground(26, 48);
      L.conv(29, 38, 12, -1); L.flyer(34, 7);
      L.plat(40, 9, 3); L.plat(44, 6, 3); L.star(45, 5);
      L.mplat(49, 10, 2, { dx: 2 });
      L.ground(53, 110);
      L.check(55, 11);
      L.blocks(59, 9, 'brb'); L.star(60, 5);
      L.spiky(64, 11); L.urchin(68, 11);
      L.check(72, 11);
      L.boss(75, 98, 88, 11);
      L.goal(103, 11);
    }
  },
];
const LEVEL_IDS = LEVELS.map(l => l.id);

function buildLevel(def) {
  const L = new LevelBuilder(def.w);
  def.build(L);
  const world = WORLDS[def.world];
  return {
    def, id: def.id, w: L.w, h: L.h, grid: L.grid, boxes: L.boxes, ents: L.ents,
    theme: world.theme, phys: PHYSICS[def.phys] || (def.space ? PHYSICS.space : PHYSICS.normal),
    startPower: def.startPower || 'none', starTotal: L.stars,
  };
}
