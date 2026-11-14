'use strict';
/* =========================================================
   Super Noah – Spiellogik: Physik, Gegner, Bosse, Kamera
   ========================================================= */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const G = {
  mode: 'title', lvl: null, player: null, ents: [], drops: [], parts: [], shots: [],
  cam: 0, t: 0, time: 0, coins: 0, stars: [false, false, false], boss: null, lock: null,
  shake: 0, bannerT: 0, check: null, levelIndex: 0, mapSel: 0, mapToken: null,
  goalEnt: null, goalPhase: '', goalT: 0, dyingT: 0, dieReason: '', signNear: null, sprayTick: 0,
};

/* ---------------- Eingabe ---------------- */
const Input = {
  left: false, right: false, jump: false, spray: false, down: false,
  jumpP: false, sprayP: false, pauseP: false, okP: false, leftP: false, rightP: false,
};
const keyState = {}, touchState = {}, padState = {};
const edges = new Set();
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyK: 'jump',
  KeyX: 'spray', KeyJ: 'spray', ShiftLeft: 'spray', ShiftRight: 'spray', KeyC: 'spray',
  ArrowDown: 'down', KeyS: 'down', Escape: 'pause', KeyP: 'pause', Enter: 'ok', NumpadEnter: 'ok',
};
window.addEventListener('keydown', e => {
  Sfx.ensure();
  const a = KEYMAP[e.code];
  if (!a) return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (tag === 'INPUT') return;
  if (G.mode === 'play' || G.mode === 'map' || G.mode === 'goal' || G.mode === 'dying') e.preventDefault();
  if (!e.repeat) edges.add(a);
  keyState[a] = true;
});
window.addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (a) keyState[a] = false; });
window.addEventListener('blur', () => { for (const k in keyState) keyState[k] = false; for (const k in touchState) touchState[k] = false; });

function bindTouch() {
  document.querySelectorAll('#touch [data-act]').forEach(btn => {
    const act = btn.dataset.act;
    const on = ev => { ev.preventDefault(); Sfx.ensure(); touchState[act] = true; edges.add(act); btn.classList.add('on'); try { btn.setPointerCapture(ev.pointerId); } catch (e) { } };
    const off = ev => { ev.preventDefault(); touchState[act] = false; btn.classList.remove('on'); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off); btn.addEventListener('pointercancel', off); btn.addEventListener('lostpointercapture', off);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });
}

function pollPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null; for (const p of pads) if (p && p.connected) { gp = p; break; }
  const now = {};
  if (gp) {
    const b = i => gp.buttons[i] && gp.buttons[i].pressed;
    const ax = gp.axes[0] || 0;
    now.left = ax < -0.4 || b(14); now.right = ax > 0.4 || b(15);
    now.jump = b(0) || b(1); now.spray = b(2) || b(3) || b(7) || b(5);
    now.pause = b(9); now.ok = b(0);
  }
  for (const k of ['left', 'right', 'jump', 'spray', 'pause', 'ok']) {
    if (now[k] && !padState[k]) edges.add(k);
    padState[k] = !!now[k];
  }
}

function readInput() {
  pollPad();
  const any = k => !!(keyState[k] || touchState[k] || padState[k]);
  Input.left = any('left'); Input.right = any('right'); Input.jump = any('jump');
  Input.spray = any('spray'); Input.down = any('down');
  Input.jumpP = Input.jumpP || edges.has('jump');
  Input.sprayP = Input.sprayP || edges.has('spray');
  Input.pauseP = Input.pauseP || edges.has('pause');
  Input.okP = Input.okP || edges.has('ok');
  Input.leftP = Input.leftP || edges.has('left');
  Input.rightP = Input.rightP || edges.has('right');
  edges.clear();
}
function clearEdges() { Input.jumpP = Input.sprayP = Input.pauseP = Input.okP = Input.leftP = Input.rightP = false; }

/* ---------------- Hilfsfunktionen ---------------- */
const RANK = { none: 0, helmet: 1, hose: 2 };
function tileAt(tx, ty) {
  if (ty < 0 || ty >= G.lvl.h) return '.';
  if (tx < 0 || tx >= G.lvl.w) return 'G';
  return G.lvl.grid[ty][tx];
}
const overlap = (a, b, s = 0) => a.x + s < b.x + b.w && a.x + a.w - s > b.x && a.y + s < b.y + b.h && a.y + a.h - s > b.y;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

function moveBody(b, dt) {
  const res = { wall: 0, head: null, ground: false };
  b.x += b.vx * dt;
  let top = Math.floor(b.y / T), bot = Math.floor((b.y + b.h - 0.01) / T);
  if (b.vx > 0) {
    const tx = Math.floor((b.x + b.w) / T);
    for (let ty = top; ty <= bot; ty++) if (isSolidChar(tileAt(tx, ty))) { b.x = tx * T - b.w - 0.01; b.vx = 0; res.wall = 1; break; }
  } else if (b.vx < 0) {
    const tx = Math.floor(b.x / T);
    for (let ty = top; ty <= bot; ty++) if (isSolidChar(tileAt(tx, ty))) { b.x = (tx + 1) * T + 0.01; b.vx = 0; res.wall = -1; break; }
  }
  const prevBottom = b.y + b.h;
  b.y += b.vy * dt;
  const left = Math.floor(b.x / T), right = Math.floor((b.x + b.w - 0.01) / T);
  if (b.vy > 0) {
    const ty = Math.floor((b.y + b.h) / T);
    for (let tx = left; tx <= right; tx++) {
      const c = tileAt(tx, ty);
      if (isSolidChar(c) || (c === 'P' && prevBottom <= ty * T + 1)) { b.y = ty * T - b.h; b.vy = 0; res.ground = true; break; }
    }
  } else if (b.vy < 0) {
    const ty = Math.floor(b.y / T);
    const hits = [];
    for (let tx = left; tx <= right; tx++) if (isSolidChar(tileAt(tx, ty))) hits.push(tx);
    if (hits.length) {
      b.y = (ty + 1) * T; b.vy = 0;
      const mid = Math.floor((b.x + b.w / 2) / T);
      res.head = { tx: hits.includes(mid) ? mid : hits[0], ty };
    }
  }
  return res;
}

/* ---------------- Partikel ---------------- */
function burst(x, y, n, col, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(o.min || 60, o.max || 260);
    G.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 80), life: rand(0.4, o.life || 0.9), max: 1, col: Array.isArray(col) ? col[i % col.length] : col, size: rand(3, o.size || 6), g: o.g ?? 600, kind: o.kind || 'dot' });
  }
}
function floatText(x, y, text, col = '#fff') { G.parts.push({ x, y, vx: 0, vy: -70, life: 0.9, max: 0.9, col, kind: 'text', text, g: 0, size: 20 }); }
function coinPop(x, y) { G.parts.push({ x, y, vx: 0, vy: -420, life: 0.5, max: 0.5, kind: 'coin', g: 1200, size: 1 }); }
function addCoins(n, x, y) {
  G.coins += n; Sfx.play('coin');
  if (x != null) floatText(x, y, '+' + n, '#ffd54f');
}

/* ---------------- Texte passend zu Spieler und Gerät ---------------- */
function hintText(text) {
  const s = Store.current(), touch = UI.touchOn();
  const parts = {
    name: s ? s.name : 'Noah',
    move: touch ? 'Lauf mit dem Pfeil-Knopf nach rechts.' : 'Lauf mit den Pfeiltasten nach rechts.',
    jump: touch ? 'Spring mit dem roten Knopf.' : 'Spring mit der Leertaste.',
    spray: (n => touch ? n.hintTouch : n.hint)(TOOL_NAMES[toolOf(G.lvl ? G.lvl.theme : 'city')]),
  };
  return text.replace(/\{(\w+)\}/g, (m, k) => parts[k] ?? m);
}

/* ---------------- Level starten ---------------- */
function spawn(s) {
  const e = { type: s.type, sx: s.x, sy: s.y, t: 0, dead: false };
  const place = (w, h) => { e.w = w; e.h = h; e.x = s.x * T + (T - w) / 2; e.y = (s.y + 1) * T - h; };
  const theme = G.lvl.theme;
  const rec = Store.current() && Store.current().levels[G.lvl.id];
  switch (s.type) {
    case 'coin': place(22, 26); e.y -= 7; break;
    case 'star': place(34, 34); e.idx = s.idx; e.y -= 3; e.had = !!(rec && rec.stars[s.idx]); break;
    case 'walker': place(32, 28); e.speed = theme === 'space' ? 45 : theme === 'sea' ? 40 : 55; e.vx = -e.speed; e.vy = 0; e.enemy = true; e.stompable = true; break;
    case 'spiky': place(34, 30); e.speed = 40; e.vx = -e.speed; e.vy = 0; e.enemy = true; e.stompable = false; e.hp = theme === 'city' ? 3 : 2; break;
    case 'flyer': place(40, 28); e.bx = e.x; e.by = e.y; e.enemy = true; e.stompable = true; e.face = -1; break;
    case 'jumper': place(28, 28); e.baseY = LH * T + 6; e.y = e.baseY; e.vy = 0; e.timer = 0.5 + (s.x % 3) * 0.5; e.enemy = true; e.immune = true; break;
    case 'fire': place(32, 36); e.enemy = true; e.hp = e.maxHp = 4; e.isFire = true; break;
    case 'meteors': e.x1 = s.x * T; e.x2 = (s.x + s.w) * T; e.timer = 1.0; e.w = e.x2 - e.x1; e.h = 10; e.x = e.x1; e.y = 0; break;
    case 'spring': place(34, 26); e.squash = 0; break;
    case 'mplat': e.w = s.w * T; e.h = 16; e.x0 = s.x * T; e.y0 = s.y * T; e.x = e.x0; e.y = e.y0; e.dx = (s.dx || 0) * T; e.dy = (s.dy || 0) * T;
      e.len = Math.hypot(e.dx, e.dy) || 1; e.u = 0; e.dir = 1; e.speed = s.speed || 70; e.mx = 0; e.my = 0; break;
    case 'jelly': place(34, 40); e.by = e.y; e.enemy = true; e.stompable = false; e.amp = (s.amp || 1.4) * T; break;
    case 'urchin': place(34, 30); e.enemy = true; e.stompable = false; e.hp = 2; break;
    case 'laser': e.w = 12; e.x = s.x * T + T / 2 - 6; e.y = s.y * T; e.h = (s.y2 - s.y + 1) * T; e.phase = s.phase || 0; e.on = false; e.warn = false; break;
    case 'check': place(30, 80); e.active = false; break;
    case 'goal': e.w = 50; e.h = 260; e.x = s.x * T; e.y = (s.y + 1) * T - e.h; e.anim = 0; break;
    case 'sign': place(34, 42); e.text = hintText(s.text); e.said = false; break;
    case 'boss': setupBoss(e, s, theme); break;
    default: return null;
  }
  return e;
}

function setupBoss(e, s, theme) {
  Object.assign(e, { kind: theme, hp: 3, maxHp: 3, ax1: s.ax1 * T, ax2: s.ax2 * T, gateCol: s.ax2, idx: s.idx,
    active: false, state: 'wait', timer: 1.5, hurtT: 0, flashT: 0, vx: 0, vy: 0, face: -1, onGround: false, deadT: 0, dropT: 1, t2: 0 });
  if (theme === 'dino') { e.w = 110; e.h = 100; e.name = 'Großer T-Rex'; }
  else if (theme === 'city') { e.w = 96; e.h = 116; e.name = 'Feuer-Riese'; }
  else if (theme === 'ice') { e.w = 92; e.h = 108; e.name = 'Schnee-Yeti'; }
  else if (theme === 'sea') { e.w = 116; e.h = 92; e.name = 'Riesen-Krake'; }
  else if (theme === 'robo') { e.w = 96; e.h = 124; e.name = 'Mega-Roboter'; e.hp = e.maxHp = 4; }
  else if (theme === 'knight') { e.w = 130; e.h = 104; e.name = 'Feuer-Drache'; }
  else if (theme === 'lab') { e.w = 70; e.h = 104; e.name = 'Professor Blubb'; }
  else if (theme === 'police') { e.w = 72; e.h = 100; e.name = 'Meister-Räuber'; e.hp = e.maxHp = 4; }
  else { e.w = 150; e.h = 64; e.name = 'Alien-UFO'; }
  e.x = s.x * T + T / 2 - e.w / 2;
  e.y = (theme === 'space' || theme === 'sea') ? s.y * T : (s.y + 1) * T - e.h;
  e.homeX = e.x; e.homeY = e.y;
}

function makePlayer(x, by, power) {
  return { x, y: by - 44, w: 26, h: 44, vx: 0, vy: 0, onGround: false, facing: 1, coyote: 0, buffer: 0, inv: 0,
    power, hearts: 3, ride: null, run: 0, sprayCD: 0, swimCD: 0, swing: 0, swingCD: 0, swingId: 0, jumping: false, prevBottom: by, visible: true, rot: 0 };
}

function startLevel(idx) {
  const def = LEVELS[idx];
  G.levelIndex = idx;
  G.lvl = buildLevel(def); G.lvl.bumps = {};
  G.ents = []; G.drops = []; G.parts = []; G.shots = []; G.boss = null; G.lock = null;
  G.coins = 0; G.stars = [false, false, false]; G.time = 0; G.shake = 0; G.bannerT = 3.2;
  G.goalEnt = null; G.signNear = null;
  for (const s of G.lvl.ents) {
    const e = spawn(s); if (!e) continue;
    G.ents.push(e); if (e.type === 'boss') G.boss = e;
  }
  G.check = { x: 2 * T, y: 12 * T };
  G.player = makePlayer(G.check.x, G.check.y, levelStartPower());
  announceCarry();
  G.cam = 0; G.mode = 'play';
  Sfx.music(G.lvl.theme);
  Sfx.speak(def.name);
  UI.onLevelStart();
}

/* ---------------- Mitgenommener Gegenstand ---------------- */
// Was Noah am Ende eines Levels in der Hand hatte, nimmt er ins nächste Level mit.
// Kommt er in eine andere Welt, verwandelt sich das Werkzeug passend dazu.
function levelStartPower() {
  const s = Store.current(), start = G.lvl.startPower;
  const carry = s && s.carry ? s.carry : 'none';
  return RANK[carry] > RANK[start] ? carry : start;
}
function announceCarry() {
  const s = Store.current(); G.transform = null;
  if (!s || s.carry !== 'hose' || G.player.power !== 'hose') return;
  const from = toolOf(s.carryTheme || 'city'), to = toolOf(G.lvl.theme);
  if (from === to) return;
  const text = TOOL_NAMES[from].mine + ' hat sich in ' + TOOL_NAMES[to].a + ' verwandelt!';
  G.transform = { text, from, to, t: 4.5 };
  setTimeout(() => { if (G.mode === 'play') { Sfx.play('power'); Sfx.speak(text + ' ' + hintText('{spray}.')); } }, 2600);
}

/* ---------------- Spieler ---------------- */
function updatePlayer(dt) {
  const p = G.player, ph = G.lvl.phys;
  if (p.ride) { p.x += p.ride.mx; p.y += p.ride.my; }
  const dir = (Input.right ? 1 : 0) - (Input.left ? 1 : 0);
  const acc = p.onGround ? ph.accel : ph.airAccel;
  if (dir) {
    if (Math.sign(p.vx) === -dir) p.vx += dir * acc * dt * 1.5;
    p.vx += dir * acc * dt; p.facing = dir;
    if (Math.abs(p.vx) > ph.run) p.vx = Math.sign(p.vx) * ph.run;
  } else {
    const f = (p.onGround ? ph.friction : ph.friction * 0.35) * dt;
    p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
  }
  // Springen (mit Puffer und "Kojotenzeit", damit es sich fair anfühlt)
  if (ph.swim) {
    // Schwimmen: jeder Druck (oder gedrückt halten) ist ein Schwimmzug nach oben
    p.swimCD -= dt;
    if ((Input.jumpP && p.swimCD <= 0) || (Input.jump && p.swimCD <= -0.2)) {
      p.vy = -ph.jump; p.swimCD = 0.15; p.onGround = false;
      Sfx.play('swim');
      G.parts.push({ x: p.x + p.w / 2 - p.facing * 8, y: p.y + 30, vx: rand(-15, 15), vy: -50, life: 0.9, max: 0.9, col: 'rgba(255,255,255,0.7)', size: rand(5, 9), g: -40, kind: 'dot' });
    }
    p.jumping = false;
  } else {
    if (Input.jumpP) p.buffer = 0.14;
    p.buffer -= dt; p.coyote -= dt;
    if (p.onGround) p.coyote = 0.1;
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -ph.jump; p.buffer = 0; p.coyote = 0; p.onGround = false; p.jumping = true; p.ride = null;
      Sfx.play('jump');
    }
    if (!Input.jump && p.jumping && p.vy < 0) { p.vy *= 0.5; p.jumping = false; }
    if (p.vy >= 0) p.jumping = false;
  }
  p.vy = Math.min(ph.maxFall, p.vy + ph.g * dt);

  // Laufband schiebt mit
  let cv = 0;
  if (p.onGround) {
    const c = tileAt(Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h + 2) / T));
    cv = c === '>' ? 110 : c === '<' ? -110 : 0;
  }
  p.prevBottom = p.y + p.h;
  p.vx += cv;
  const r = moveBody(p, dt);
  if (r.wall) p.vx = 0; else p.vx -= cv;
  if (ph.swim && p.y < 6) { p.y = 6; if (p.vy < 0) p.vy = 0; }
  p.onGround = r.ground; p.ride = null;
  for (const e of G.ents) {
    if (e.type !== 'mplat' || p.vy < 0) continue;
    if (p.x + p.w > e.x + 2 && p.x < e.x + e.w - 2 && p.prevBottom <= e.y - e.my + 8 && p.y + p.h >= e.y) {
      p.y = e.y - p.h; p.vy = 0; p.onGround = true; p.ride = e;
    }
  }
  if (r.head) bumpTile(r.head.tx, r.head.ty);

  // Grenzen
  if (G.lock != null) {
    if (p.x < G.lock) { p.x = G.lock; p.vx = Math.max(0, p.vx); }
    if (p.x > G.lock + VW - p.w) { p.x = G.lock + VW - p.w; p.vx = Math.min(0, p.vx); }
  }
  if (p.x < 0) { p.x = 0; p.vx = 0; }
  if (p.x > G.lvl.w * T - p.w) p.x = G.lvl.w * T - p.w;

  if (p.y > G.lvl.h * T + 40) { killPlayer('fall'); return; }
  // Lava
  const ty = Math.floor((p.y + p.h - 4) / T);
  for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w) / T); tx++) {
    if (tileAt(tx, ty) === 'L' && p.y + p.h > ty * T + 10) { killPlayer('lava'); return; }
  }

  // Werkzeug: Schwert und Fangnetz schwingen, Spritzen sprühen
  const tool = toolOf(G.lvl.theme);
  if (p.swingCD > 0) p.swingCD -= dt;
  if (p.swing > 0) { p.swing -= dt; swingHits(p); }
  if (p.power === 'hose' && (tool === 'sword' || tool === 'net')) {
    if (Input.sprayP && p.swingCD <= 0) { p.swing = 0.24; p.swingCD = 0.34; p.swingId = (p.swingId || 0) + 1; Sfx.play('swish'); }
  } else if (p.power === 'hose' && Input.spray) {
    p.sprayCD -= dt;
    if (p.sprayCD <= 0) {
      p.sprayCD = 0.075;
      if (ph.swim) G.drops.push({ x: p.x + p.w / 2 + p.facing * 26, y: p.y + 19, vx: p.facing * rand(340, 400) + p.vx * 0.5, vy: rand(-30, 30), life: 0.75, r: rand(4, 7), bubble: true });
      else G.drops.push({ x: p.x + p.w / 2 + p.facing * 26, y: p.y + 19, vx: p.facing * rand(560, 640) + p.vx * 0.5, vy: rand(-150, -40), life: 0.8, r: rand(4, 6), foam: tool === 'foam' });
      if (G.sprayTick++ % 3 === 0) Sfx.play('spray');
    }
  } else p.sprayCD = 0;

  p.inv -= dt;
  p.run += Math.abs(p.vx) * dt * 0.045;
}

function hurtPlayer(srcX) {
  const p = G.player;
  if (p.inv > 0 || G.mode !== 'play') return;
  const start = RANK[G.lvl.startPower];
  if (RANK[p.power] > start) {
    p.power = RANK[p.power] === 2 ? 'helmet' : 'none';
    if (RANK[p.power] < start) p.power = G.lvl.startPower;
  } else {
    p.hearts--;
    if (p.hearts <= 0) { killPlayer('hit'); return; }
  }
  Sfx.play('hurt');
  p.inv = 1.6;
  const d = p.x + p.w / 2 < srcX ? -1 : 1;
  p.vx = d * 260; p.vy = -Math.min(420, G.lvl.phys.jump * 1.2); p.jumping = false;
}

function killPlayer(reason) {
  const p = G.player;
  G.mode = 'dying'; G.dyingT = 0; G.dieReason = reason;
  p.vx = 0; p.vy = reason === 'fall' ? 0 : -720;
  if (reason === 'lava') burst(p.x + p.w / 2, p.y + p.h, 18, G.lvl.theme === 'ice' ? ['#64b5f6', '#e3f2fd', '#1e88e5'] : ['#ff9800', '#ffeb3b', '#e53935'], { up: 200 });
  Sfx.play('fall');
}

function updateDying(dt) {
  const p = G.player;
  G.dyingT += dt;
  if (G.dieReason !== 'fall') { p.vy += G.lvl.phys.g * 0.7 * dt; p.y += p.vy * dt; p.rot += dt * 8; }
  if (G.dyingT > 1.5) respawn();
}

function respawn() {
  const old = G.player;
  let hearts = G.dieReason === 'hit' ? 3 : old.hearts - 1;
  if (hearts <= 0) hearts = 3;
  G.player = makePlayer(G.check.x, G.check.y, levelStartPower());
  G.player.hearts = hearts; G.player.inv = 1.5;
  G.shots = []; G.drops = [];
  const b = G.boss;
  if (b && b.state !== 'dead' && !b.dead) {
    b.active = false; b.state = 'wait'; b.x = b.homeX; b.y = b.homeY; b.vx = b.vy = 0; b.hurtT = 0;
    G.lock = null; Sfx.music(G.lvl.theme);
  }
  G.cam = clamp(G.player.x - VW * 0.4, 0, G.lvl.w * T - VW);
  G.mode = 'play';
}

/* ---------------- Kisten und Steine ---------------- */
function bumpTile(tx, ty) {
  const lvl = G.lvl, c = tileAt(tx, ty), key = tx + ',' + ty;
  if (c === 'Q') {
    const what = lvl.boxes[key] || 'coin';
    lvl.grid[ty][tx] = 'U'; lvl.bumps[key] = 0;
    if (what === 'coin') { coinPop(tx * T + T / 2, ty * T); addCoins(1); }
    else {
      G.ents.push({ type: 'item', item: what, x: tx * T + 5, y: ty * T, w: 30, h: 30, rise: T + 4, t: 0, dead: false });
      Sfx.play('power');
    }
  } else if (c === 'B') {
    lvl.grid[ty][tx] = '.';
    burst(tx * T + T / 2, ty * T + T / 2, 10, [THEMES[lvl.theme].brick, THEMES[lvl.theme].brickLine], { kind: 'chunk', size: 9, up: 250, g: 1400 });
    Sfx.play('brick');
  } else { Sfx.play('bump'); lvl.bumps[key] = 0; }
  // Gegner und Münzen oberhalb
  const area = { x: tx * T, y: ty * T - 10, w: T, h: 12 };
  for (const e of G.ents) {
    if (e.dead) continue;
    if (e.enemy && !e.immune && !e.isFire && overlap(e, area)) killEnemy(e);
    if (e.type === 'coin' && overlap(e, { x: tx * T, y: ty * T - T, w: T, h: T })) { e.dead = true; coinPop(e.x + e.w / 2, e.y); addCoins(1); }
  }
}

/* ---------------- Gegner ---------------- */
function awake(e) {
  if (!e.awake) { if (e.x < G.cam + VW + 80) e.awake = true; else return false; }
  return true;
}

function swingHits(p) {
  const reach = 56;
  const box = { x: p.facing > 0 ? p.x + p.w / 2 : p.x + p.w / 2 - reach, y: p.y - 14, w: reach, h: p.h + 18 };
  for (const e of G.ents) {
    if (e.dead || !e.enemy || e.immune || e.squash || e.swingHit === p.swingId) continue;
    if (!overlap(box, e)) continue;
    e.swingHit = p.swingId;
    if (e.hp && e.hp > 2) { e.hp -= 2; burst(e.x + e.w / 2, e.y + e.h / 2, 5, ['#fff', '#ffeb3b'], { kind: 'star', size: 6 }); }
    else killEnemy(e, 'swing');
  }
  const b = G.boss;
  if (b && b.active && b.state !== 'dead' && b.swingHit !== p.swingId && overlap(box, b)) {
    b.swingHit = p.swingId; damageBoss(b, 0.25, false); b.flashT = 0.15; Sfx.play('bump');
    burst(box.x + reach / 2, p.y + 20, 6, ['#fff', '#ffeb3b'], { kind: 'star', size: 6 });
  }
  for (const s of G.shots) {
    if (s.life > 0 && !s.splat && overlap(box, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 })) {
      s.life = 0; burst(s.x, s.y, 8, ['#fff', '#ffeb3b', '#bdbdbd'], { kind: 'star', size: 6 });
    }
  }
}

function killEnemy(e, how) {
  if (e.dead) return;
  e.dead = true;
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (e.isFire || (G.lvl.theme === 'city' && e.type === 'spiky')) {
    burst(cx, cy, 14, ['#eceff1', '#cfd8dc', '#b0bec5'], { kind: 'steam', up: 120, g: -150, size: 12, max: 100 });
    Sfx.play('steam');
  } else {
    burst(cx, cy, 12, ['#fff', '#ffeb3b', '#bbb'], { kind: 'star', size: 7 });
    if (how !== 'stomp') Sfx.play('stomp');
  }
  if (G.lvl.theme === 'police' && e.type !== 'flyer') floatText(cx, e.y - 10, 'Gefangen!', '#90caf9');
  coinPop(cx, e.y); addCoins(1);
}

function enemyContact(e) {
  const p = G.player;
  if (G.mode !== 'play' || e.dead || e.squash) return;
  if (!overlap(p, e, 5)) return;
  if (e.stompable && p.vy > 0 && p.prevBottom <= e.y + 14) {
    const ph = G.lvl.phys;
    p.vy = Input.jump ? -ph.jump * 0.95 : -ph.jump * 0.55; p.jumping = Input.jump;
    Sfx.play('stomp');
    if (e.type === 'walker') {
      e.squash = 0.35; coinPop(e.x + e.w / 2, e.y); addCoins(1);
    } else killEnemy(e, 'stomp');
    return;
  }
  hurtPlayer(e.x + e.w / 2);
}

function updWalker(e, dt) {
  if (!awake(e)) return;
  if (e.squash) { e.squash -= dt; if (e.squash <= 0) e.dead = true; return; }
  const ph = G.lvl.phys;
  e.vy = Math.min(ph.maxFall, e.vy + ph.g * dt);
  const dir = Math.sign(e.vx) || -1;
  const r = moveBody(e, dt);
  if (r.wall) e.vx = -dir * e.speed;
  else if (r.ground) {
    const fx = dir > 0 ? e.x + e.w + 2 : e.x - 2;
    const c = tileAt(Math.floor(fx / T), Math.floor((e.y + e.h + 4) / T));
    if (!isSolidChar(c) && c !== 'P') e.vx = -dir * e.speed;
  }
  if (e.y > LH * T + 50) { e.dead = true; return; }
  if (tileAt(Math.floor((e.x + e.w / 2) / T), Math.floor((e.y + e.h - 2) / T)) === 'L') { e.dead = true; return; }
  enemyContact(e);
}

function updFlyer(e, dt) {
  if (!awake(e)) return;
  e.t += dt;
  const nx = e.bx + Math.sin(e.t * 0.9) * 70;
  e.face = nx > e.x ? 1 : -1;
  e.x = nx; e.y = e.by + Math.sin(e.t * 2.4) * 18;
  enemyContact(e);
}

function updJumper(e, dt) {
  e.timer -= dt;
  if (e.timer <= 0 && e.y >= e.baseY) { e.vy = -G.lvl.phys.jump * 1.1; e.timer = 2.4; }
  e.vy += G.lvl.phys.g * dt; e.y += e.vy * dt;
  if (e.y >= e.baseY) { e.y = e.baseY; e.vy = 0; }
  if (e.y < e.baseY - 10) enemyContact(e);
}

function updMeteors(e, dt) {
  const p = G.player;
  const px = p.x + p.w / 2;
  if (px < e.x1 - 240 || px > e.x2 + 60) return;
  e.timer -= dt;
  if (e.timer > 0) return;
  e.timer = rand(1.3, 2.2);
  const tx = clamp(px + rand(-60, 240), e.x1, e.x2);
  let gy = LH * T + 40;
  const col = Math.floor(tx / T);
  let ty0 = 0; while (ty0 < LH && isSolidChar(tileAt(col, ty0))) ty0++;
  for (let ty = Math.max(2, ty0); ty < LH; ty++) { const c = tileAt(col, ty); if (isSolidChar(c) || c === 'P') { gy = ty * T; break; } }
  const ice = G.lvl.theme === 'ice';
  const startY = ty0 > 0 ? ty0 * T - 20 : -60, drift = ice ? 0 : 110, speed = ice ? 300 : 380;
  const fallT = (gy - startY) / speed;
  G.ents.push({ type: 'meteor', x: tx - 15 - drift * fallT, y: startY, w: 30, h: 30, vx: drift, vy: speed, tx, groundY: gy, enemy: true, immune: true, t: 0, dead: false });
}

function updMeteor(e, dt) {
  e.x += e.vx * dt; e.y += e.vy * dt;
  if (e.y + e.h >= e.groundY) {
    e.dead = true;
    burst(e.x + e.w / 2, e.groundY - 6, 16, G.lvl.theme === 'ice' ? ['#9fd8f5', '#fff', '#e0f7ff'] : ['#ff9800', '#795548', '#ffeb3b'], { up: 250, size: 7 });
    if (Math.abs(e.x - G.player.x) < VW) { Sfx.play('boom'); G.shake = Math.max(G.shake, 0.15); }
    return;
  }
  enemyContact(e);
}

function updMplat(e, dt) {
  const px = e.x, py = e.y;
  e.u += e.dir * e.speed * dt / e.len;
  if (e.u >= 1) { e.u = 1; e.dir = -1; }
  if (e.u <= 0) { e.u = 0; e.dir = 1; }
  const k = e.u * e.u * (3 - 2 * e.u);
  e.x = e.x0 + e.dx * k; e.y = e.y0 + e.dy * k;
  e.mx = e.x - px; e.my = e.y - py;
}

/* ---------------- Bosse ---------------- */
const BOSS_TEXT = {
  dino: ['Rooaar! Der große T-Rex! Hüpf ihm auf den Kopf!', 'Super! Du hast den T-Rex besiegt!'],
  city: ['Der Feuer-Riese! Spritz ihn nass!', 'Super! Das Feuer ist aus!'],
  space: ['Das Alien-UFO! Warte, bis es runterkommt!', 'Super! Das UFO fliegt weg!'],
  knight: ['Der Feuer-Drache! Spring über das Feuer und hüpf ihm auf den Kopf!', 'Super! Der Drache ist jetzt ganz lieb!'],
  lab: ['Professor Blubb wirft mit Säure-Kolben! Hüpf ihm auf den Kopf!', 'Super! Der Professor räumt jetzt sein Labor auf!'],
  police: ['Der Meister-Räuber! Fang ihn ein und hol die Juwelen zurück!', 'Super! Der Räuber ist gefangen!'],
  ice: ['Der Schnee-Yeti! Weich den Schneebällen aus!', 'Super! Der Yeti gibt auf!'],
  sea: ['Die Riesen-Krake! Schwimm über sie und hüpf ihr auf den Kopf!', 'Super! Die Krake schwimmt davon!'],
  robo: ['Der Mega-Roboter! Spring über die Blitze!', 'Super! Der Mega-Roboter ist kaputt!'],
};

function updBoss(e, dt) {
  const p = G.player, ph = G.lvl.phys;
  if (e.flashT > 0) e.flashT -= dt;
  if (!e.active) {
    if (G.mode === 'play' && p.x > e.ax1 + T * 1.5) {
      e.active = true; G.lock = e.ax1; e.state = 'intro'; e.timer = 1.4;
      Sfx.music('boss'); Sfx.play('roar'); Sfx.speak(BOSS_TEXT[e.kind][0]);
    }
    return;
  }
  e.t += dt;
  if (e.hurtT > 0) e.hurtT -= dt;
  if (e.state === 'dead') {
    e.deadT += dt;
    if (Math.random() < dt * 12) burst(e.x + rand(0, e.w), e.y + rand(0, e.h), 6, ['#ff9800', '#ffeb3b', '#fff'], { up: 100 });
    if (e.deadT > 1.6) e.dead = true;
    return;
  }
  const minX = e.ax1 + T * 0.5, maxX = e.ax2 - e.w - 4;
  const pcx = p.x + p.w / 2, ecx = e.x + e.w / 2;

  if (e.kind === 'dino' || e.kind === 'robo' || e.kind === 'knight' || e.kind === 'police') {
    if (e.state === 'intro') { e.timer -= dt; e.face = pcx < ecx ? -1 : 1; if (e.timer <= 0) { e.state = 'walk'; e.timer = 2.4; } }
    else {
      const sp = e.kind === 'police' ? 110 + (e.maxHp - e.hp) * 25 : e.kind !== 'dino' ? 70 + (e.maxHp - e.hp) * 22 : 95 + (3 - e.hp) * 40;
      e.vx = e.hurtT > 0 ? e.face * sp * 0.4 : e.face * sp;
      e.timer -= dt;
      if (e.timer <= 0 && e.onGround) { e.vy = -820; e.onGround = false; e.timer = rand(2.0, 3.2); }
      if (e.onGround && Math.random() < dt * 0.7) e.face = pcx < ecx ? -1 : 1;
      e.vy = Math.min(ph.maxFall, e.vy + ph.g * dt);
      const was = e.onGround;
      const r = moveBody(e, dt); e.onGround = r.ground;
      if (!was && e.onGround) { G.shake = 0.3; Sfx.play('boom'); }
      if (e.kind !== 'dino') {
        e.dropT -= dt;
        if (e.dropT <= 0 && e.onGround && e.hurtT <= 0) {
          e.dropT = 2.6 - (e.maxHp - e.hp) * 0.35; e.face = pcx < ecx ? -1 : 1;
          const sk = { robo: 'bolt', knight: 'fire', police: 'bag' }[e.kind];
          G.shots.push({ kind: sk, x: ecx + e.face * e.w * 0.5, y: sk === 'fire' ? e.y + 40 : e.y + e.h - (sk === 'bag' ? 14 : 24), vx: e.face * (sk === 'bag' ? 220 : 260), vy: 0, g: 0, r: sk === 'fire' ? 13 : 10, life: 4 });
          Sfx.play('bossHit');
        }
      }
    }
    if (e.x < minX) { e.x = minX; e.face = 1; }
    if (e.x > maxX) { e.x = maxX; e.face = -1; }
  } else if (e.kind === 'city' || e.kind === 'ice' || e.kind === 'lab') {
    if (e.state === 'intro') { e.timer -= dt; if (e.timer <= 0) { e.state = 'walk'; e.timer = 1.6; } }
    else {
      const sp = 55 + (3 - e.hp) * 25;
      if (Math.random() < dt * 0.5) e.face = pcx < ecx ? -1 : 1;
      e.x += e.face * sp * dt;
      if (e.x < minX) { e.x = minX; e.face = 1; }
      if (e.x > maxX) { e.x = maxX; e.face = -1; }
      e.timer -= dt;
      if (e.timer <= 0) {
        e.timer = 2.5 - (3 - e.hp) * 0.45;
        const times = e.hp <= 1.5 ? [0.9, 1.3] : [1.1];
        for (const ft of times) {
          const sx = ecx, sy = e.y + 30, g = 900;
          const tx = pcx + rand(-30, 30), ty = p.y + p.h - 12;
          G.shots.push({ kind: { ice: 'snow', lab: 'flask' }[e.kind] || 'fire', x: sx, y: sy, vx: (tx - sx) / ft, vy: (ty - sy - 0.5 * g * ft * ft) / ft, g, r: 13, life: 3 });
        }
        Sfx.play('steam');
      }
    }
  } else if (e.kind === 'sea') {
    if (e.state === 'intro') { e.timer -= dt; if (e.timer <= 0) { e.state = 'swim'; e.timer = 2; } }
    else {
      e.t2 += dt;
      const cx0 = (minX + maxX) / 2, range = (maxX - minX) / 2;
      const tx = cx0 + Math.sin(e.t2 * 0.6) * range, ty = e.homeY + Math.sin(e.t2 * 1.1) * 80;
      e.x += (tx - e.x) * Math.min(1, dt * 2); e.y += (ty - e.y) * Math.min(1, dt * 2);
      e.face = pcx < ecx ? -1 : 1;
      e.timer -= dt;
      if (e.timer <= 0 && e.hurtT <= 0) {
        e.timer = 2.6 - (3 - e.hp) * 0.5;
        const dx = pcx - ecx, dy = (p.y + p.h / 2) - (e.y + e.h / 2), d = Math.hypot(dx, dy) || 1;
        G.shots.push({ kind: 'ink', x: ecx, y: e.y + e.h / 2, vx: dx / d * 150, vy: dy / d * 150, g: 0, r: 13, life: 4.5 });
        Sfx.play('steam');
      }
    }
  } else {
    const lowY = 12 * T - 96 - e.h, cx0 = (minX + maxX) / 2, range = (maxX - minX) / 2;
    if (e.state === 'intro') { e.timer -= dt; if (e.timer <= 0) { e.state = 'hover'; e.timer = 4.5; } }
    else if (e.state === 'hover') {
      e.t2 += dt;
      const tx = cx0 + Math.sin(e.t2 * 0.8) * range;
      e.x += (tx - e.x) * Math.min(1, dt * 3);
      e.y = e.homeY + Math.sin(e.t * 2) * 8;
      e.dropT -= dt;
      if (e.dropT <= 0) {
        e.dropT = 1.5 - (3 - e.hp) * 0.3;
        G.shots.push({ kind: 'slime', x: ecx, y: e.y + e.h - 4, vx: rand(-40, 40), vy: 60, g: 800, r: 11, life: 4 });
      }
      e.timer -= dt; if (e.timer <= 0) e.state = 'down';
    } else if (e.state === 'down') {
      e.y += 220 * dt; if (e.y >= lowY) { e.y = lowY; e.state = 'low'; e.timer = 2.8; }
    } else if (e.state === 'low') {
      e.timer -= dt; if (e.timer <= 0) e.state = 'up';
    } else if (e.state === 'up') {
      e.y -= 160 * dt; if (e.y <= e.homeY) { e.y = e.homeY; e.state = 'hover'; e.timer = 5 - (3 - e.hp) * 0.8; }
    }
  }

  // Berührung mit Noah
  if (G.mode === 'play' && e.state !== 'intro' && overlap(p, e, 8)) {
    if (p.vy > 0 && p.prevBottom <= e.y + 26 && e.hurtT <= 0) {
      p.vy = -ph.jump * 1.05; p.jumping = false;
      damageBoss(e, 1, true);
      if (e.kind === 'space' && e.state !== 'dead') e.state = 'up';
    } else if (e.hurtT <= 0) hurtPlayer(e.x + e.w / 2);
  }
}

function damageBoss(e, d, stomp) {
  if (e.state === 'dead') return;
  e.hp -= d;
  if (stomp) { e.hurtT = 1.2; Sfx.play('bossHit'); G.shake = 0.25; }
  else e.flashT = 0.07;
  if (e.hp <= 0) defeatBoss(e);
}

function defeatBoss(e) {
  e.hp = 0; e.state = 'dead'; e.deadT = 0;
  Sfx.play('boom'); G.shake = 0.6;
  Sfx.speak(BOSS_TEXT[e.kind][1]);
  G.shots = [];
  addCoins(10, e.x + e.w / 2, e.y);
  for (let i = 0; i < 6; i++) coinPop(e.x + rand(0, e.w), e.y + rand(0, e.h / 2));
  setTimeout(() => {
    if (G.boss !== e) return;
    for (let ty = 0; ty < G.lvl.h; ty++) if (G.lvl.grid[ty][e.gateCol] === 'X') {
      G.lvl.grid[ty][e.gateCol] = '.';
      burst(e.gateCol * T + T / 2, ty * T + T / 2, 4, ['#9e9e9e', '#ffd54f'], { up: 100, kind: 'chunk', size: 8, g: 1200 });
    }
    Sfx.play('gate');
    G.lock = null;
    Sfx.music(G.lvl.theme);
    const st = spawn({ type: 'star', x: Math.floor((e.ax1 + e.ax2) / 2 / T), y: 8, idx: e.idx });
    G.ents.push(st);
    burst(st.x + 17, st.y + 17, 20, ['#ffeb3b', '#fff'], { kind: 'star' });
  }, 1600);
}

function updShots(dt) {
  const p = G.player;
  for (const s of G.shots) {
    s.life -= dt;
    if (s.splat) { s.splat -= dt; if (s.splat <= 0) s.life = 0; continue; }
    s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    const c = tileAt(Math.floor(s.x / T), Math.floor((s.y + s.r * 0.6) / T));
    if (isSolidChar(c) || c === 'P') {
      if (s.kind === 'slime') { s.splat = 0.6; s.vx = s.vy = 0; }
      else { s.life = 0; burst(s.x, s.y, 8, { snow: ['#fff', '#dff1fb'], ink: ['#311b92', '#5e35b1'], bolt: ['#ffeb3b', '#fff'], flask: ['#76ff03', '#b2ff59', '#e0f2f1'], bag: ['#8d6e63', '#ffd54f'] }[s.kind] || ['#ff9800', '#ffeb3b'], { up: 120 }); }
      continue;
    }
    if (G.mode === 'play' && overlap(p, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 }, 4)) { hurtPlayer(s.x); }
  }
  G.shots = G.shots.filter(s => s.life > 0 && s.y < LH * T + 60);
}

/* ---------------- Wasser ---------------- */
function updDrops(dt) {
  for (const d of G.drops) {
    d.vy += (d.bubble ? -60 : 1000) * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt;
    if (isSolidChar(tileAt(Math.floor(d.x / T), Math.floor(d.y / T)))) {
      d.life = 0; if (Math.random() < 0.5) burst(d.x, d.y, 2, '#81d4fa', { up: 80, max: 100, size: 4 });
      continue;
    }
    const box = { x: d.x - d.r, y: d.y - d.r, w: d.r * 2, h: d.r * 2 };
    for (const e of G.ents) {
      if (e.dead || !e.enemy || e.immune || e.squash) continue;
      if (!overlap(box, e)) continue;
      d.life = 0;
      if (e.hp) {
        e.hp -= 1;
        burst(d.x, d.y, 3, ['#e1f5fe', '#b3e5fc'], { kind: 'steam', g: -100, up: 60, size: 8, max: 80 });
        if (e.hp <= 0) killEnemy(e, 'water');
      } else killEnemy(e, 'water');
      break;
    }
    if (d.life > 0 && G.boss && G.boss.active && G.boss.state !== 'dead' && overlap(box, G.boss)) {
      d.life = 0; damageBoss(G.boss, 0.1, false);
      burst(d.x, d.y, 2, ['#e1f5fe', '#b3e5fc'], { kind: 'steam', g: -100, up: 60, size: 8, max: 80 });
    }
    if (d.life > 0) for (const s of G.shots) {
      if ((s.kind === 'fire' || s.kind === 'flask') && Math.hypot(s.x - d.x, s.y - d.y) < s.r + d.r) {
        s.life = 0; d.life = 0; burst(s.x, s.y, 6, ['#eceff1', '#cfd8dc'], { kind: 'steam', g: -150, up: 60, size: 10 }); Sfx.play('steam'); break;
      }
    }
  }
  G.drops = G.drops.filter(d => d.life > 0);
}

/* ---------------- Alles andere ---------------- */
function updEntity(e, dt) {
  const p = G.player, ph = G.lvl.phys;
  switch (e.type) {
    case 'walker': case 'spiky': updWalker(e, dt); break;
    case 'flyer': updFlyer(e, dt); break;
    case 'jumper': updJumper(e, dt); break;
    case 'fire': enemyContact(e); break;
    case 'meteors': updMeteors(e, dt); break;
    case 'meteor': updMeteor(e, dt); break;
    case 'boss': updBoss(e, dt); break;
    case 'coin':
      if (overlap(p, e)) { e.dead = true; addCoins(1); burst(e.x + e.w / 2, e.y + e.h / 2, 5, '#fff59d', { kind: 'star', size: 5, max: 120 }); }
      break;
    case 'star':
      if (overlap(p, e, -4)) {
        e.dead = true; G.stars[e.idx] = true; Sfx.play('star');
        burst(e.x + e.w / 2, e.y + e.h / 2, 24, ['#ffeb3b', '#fff', '#ffd54f'], { kind: 'star', size: 8 });
        const w = WORLDS[G.lvl.def.world];
        floatText(e.x + e.w / 2, e.y, w.collect1 + '!', '#fff59d');
        Sfx.speak(w.say);
      }
      break;
    case 'item':
      if (e.rise > 0) { const d = Math.min(e.rise, 110 * dt); e.y -= d; e.rise -= d; }
      e.t += dt;
      if (e.rise <= 0 && overlap(p, e)) {
        e.dead = true;
        if (e.item === 'heart') {
          if (p.hearts < 3) { p.hearts++; Sfx.play('heart'); Sfx.speak('Ein Herz!'); } else addCoins(5, e.x, e.y);
        } else {
          if (RANK[e.item] >= RANK[p.power]) p.power = e.item;
          Sfx.play('power');
          Sfx.speak(e.item === 'helmet' ? 'Ein Helm! Der schützt dich.' : TOOL_NAMES[toolOf(G.lvl.theme)].the + '! ' + hintText('{spray}.'));
        }
        burst(e.x + 15, e.y + 15, 16, ['#fff', '#ffeb3b', '#4fc3f7'], { kind: 'star', size: 6 });
      }
      break;
    case 'spring':
      if (e.squash > 0) e.squash -= dt;
      if (p.vy > 0 && overlap(p, e) && p.prevBottom <= e.y + 14) {
        p.y = e.y - p.h; p.vy = -Math.sqrt(2 * ph.g * 8.6 * T); p.jumping = false;
        e.squash = 0.25; Sfx.play('spring');
      }
      break;
    case 'check':
      if (!e.active && overlap(p, e)) {
        e.active = true; G.check = { x: e.x, y: e.y + e.h }; p.hearts = 3;
        Sfx.play('check'); burst(e.x + 20, e.y + 10, 14, ['#ffeb3b', '#fff', '#81c784'], { kind: 'star' });
      }
      break;
    case 'jelly':
      if (!awake(e)) break;
      e.t += dt; e.y = e.by + Math.sin(e.t * 1.5 + e.sx) * e.amp;
      enemyContact(e);
      break;
    case 'urchin': enemyContact(e); break;
    case 'laser': {
      const cyc = (G.time + e.phase) % 3.2;
      e.on = cyc < 1.3; e.warn = cyc > 2.7;
      if (e.on && overlap(p, e, 2)) hurtPlayer(e.x + 6);
      break;
    }
    case 'sign':
      if (Math.abs((p.x + p.w / 2) - (e.x + e.w / 2)) < 60 && Math.abs(p.y - e.y) < 90) {
        G.signNear = e;
        if (!e.said) { e.said = true; Sfx.speak(e.text); }
      }
      break;
    case 'goal':
      if (G.mode === 'play' && p.x + p.w > e.x + 10) startGoal(e);
      break;
  }
}

function updParticles(dt) {
  for (const q of G.parts) {
    q.life -= dt; q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.kind === 'steam') { q.vx *= 0.96; q.size += dt * 10; }
  }
  G.parts = G.parts.filter(q => q.life > 0);
  if (G.parts.length > 600) G.parts.splice(0, G.parts.length - 600);
}

/* ---------------- Ziel ---------------- */
function startGoal(e) {
  G.mode = 'goal'; G.goalEnt = e; G.goalPhase = 'walk'; G.goalT = 0; G.bannerT = 0; G.signNear = null;
  G.player.inv = 0;
  Sfx.music('');
  Sfx.play('win');
  const s = Store.current();
  Sfx.speak('Geschafft! Super gemacht, ' + (s ? s.name : 'Noah') + '!');
}

function updateGoal(dt) {
  const p = G.player, e = G.goalEnt, ph = G.lvl.phys, theme = G.lvl.theme;
  G.goalT += dt;
  const kind = { dino: 'cheer', knight: 'cheer', city: 'drive', ice: 'drive', sea: 'drive', police: 'drive', lab: 'beam' }[theme] || 'launch';
  const targetX = kind === 'cheer' ? e.x - 20 : kind === 'drive' ? e.x + e.w / 2 + 40 : e.x + e.w / 2 - p.w / 2;
  if (G.goalPhase === 'walk') {
    const d = targetX - p.x;
    p.vx = Math.abs(d) < 6 ? 0 : Math.sign(d) * 200; if (p.vx) p.facing = Math.sign(p.vx);
    if ((Math.abs(d) < 6 && p.onGround) || G.goalT > 2.5) {
      G.goalPhase = 'anim'; G.goalT = 0; p.vx = 0;
      if (kind !== 'cheer') p.visible = false;
      if (theme === 'city' || theme === 'police') Sfx.play('siren');
      else if (kind === 'beam') Sfx.play('power');
      else if (theme === 'knight') Sfx.play('check');
      else if (theme === 'ice') Sfx.play('star');
      else if (theme === 'sea') Sfx.play('steam');
      else if (kind === 'launch') setTimeout(() => Sfx.play('rocket'), 500);
    }
  } else {
    e.anim = G.goalT;
    if (kind === 'cheer' && p.onGround) { p.vy = -560; p.facing = 1; }
    if (kind === 'beam' && Math.random() < dt * 25) burst(e.x + e.w / 2 + rand(-30, 30), e.y + e.h - rand(0, 120), 2, ['#69f0ae', '#e0f7fa', '#fff'], { kind: 'star', size: 6, up: 60 });
    if (Math.random() < dt * 20) {
      G.parts.push({ x: G.cam + rand(0, VW), y: -10, vx: rand(-40, 40), vy: rand(80, 160), life: 3, max: 3, col: ['#e53935', '#ffeb3b', '#43a047', '#1e88e5', '#ff6f91'][Math.floor(rand(0, 5))], size: rand(5, 9), g: 30, kind: 'confetti', rot: rand(0, 6) });
    }
    if (kind === 'launch' && G.goalT > 0.8) burst(e.x + e.w / 2, e.y + e.h - Math.pow(G.goalT - 0.8, 2) * 300 + 20, 2, ['#ff9800', '#ffeb3b', '#bdbdbd'], { up: -200, g: 0, kind: 'steam', size: 10 });
    if (G.goalT > 3.0) { finishLevel(); return; }
  }
  p.vy = Math.min(ph.maxFall, p.vy + ph.g * dt);
  p.prevBottom = p.y + p.h;
  const r = moveBody(p, dt); p.onGround = r.ground;
  p.run += Math.abs(p.vx) * dt * 0.045;
}

function finishLevel() {
  const s = Store.current();
  const id = G.lvl.id;
  const rec = s.levels[id] || { done: false, stars: [false, false, false], best: 0 };
  const firstClear = !rec.done;
  const newStars = G.stars.map((v, i) => v && !rec.stars[i]);
  rec.done = true;
  rec.stars = rec.stars.map((v, i) => v || G.stars[i]);
  if (!rec.best || G.time < rec.best) rec.best = Math.round(G.time * 10) / 10;
  s.levels[id] = rec;
  s.coins += G.coins;
  s.carry = G.player.power; s.carryTheme = G.lvl.theme;
  let ending = false;
  if (G.levelIndex === LEVELS.length - 1 && firstClear) { s.ending = true; ending = true; }
  const ok = Store.commit();
  G.mode = 'results';
  const next = G.levelIndex + 1;
  if (next < LEVELS.length) G.mapSel = next;
  const newWorld = firstClear && next < LEVELS.length && LEVELS[next].world !== LEVELS[G.levelIndex].world ? WORLDS[LEVELS[next].world] : null;
  UI.showResults({ stars: G.stars.slice(), newStars, coins: G.coins, time: G.time, firstClear, newWorld, ending, saveOk: ok, theme: G.lvl.theme });
}

/* ---------------- Kamera ---------------- */
function updateCamera(dt) {
  const p = G.player, maxCam = G.lvl.w * T - VW;
  let target = p.x + p.w / 2 - VW * 0.4;
  if (G.lock != null) target = G.lock;
  target = clamp(target, 0, maxCam);
  G.cam += (target - G.cam) * Math.min(1, dt * (G.lock != null ? 5 : 10));
  if (Math.abs(target - G.cam) < 0.3) G.cam = target;
}

/* ---------------- Haupt-Update ---------------- */
function update(dt) {
  G.t += dt;
  if (G.shake > 0) G.shake -= dt;
  if (G.mode === 'dying') { updateDying(dt); updParticles(dt); return; }
  if (G.mode === 'goal') {
    updateGoal(dt);
    for (const e of G.ents) if (e.type === 'mplat') updMplat(e, dt);
    updParticles(dt); updateCamera(dt); return;
  }
  G.time += dt; G.bannerT -= dt;
  if (G.transform && G.bannerT <= 0) { G.transform.t -= dt; if (G.transform.t <= 0) G.transform = null; }
  const lvl = G.lvl;
  for (const k in lvl.bumps) { lvl.bumps[k] += dt; if (lvl.bumps[k] > 0.18) delete lvl.bumps[k]; }
  for (const e of G.ents) if (e.type === 'mplat') updMplat(e, dt);
  updatePlayer(dt);
  if (G.mode !== 'play') return;
  G.signNear = null;
  const n = G.ents.length;
  for (let i = 0; i < n; i++) { const e = G.ents[i]; if (!e.dead && e.type !== 'mplat') updEntity(e, dt); }
  updDrops(dt); updShots(dt); updParticles(dt);
  G.ents = G.ents.filter(e => !e.dead);
  updateCamera(dt);
}

/* ---------------- Zeichnen ---------------- */
function drawParticles(c) {
  for (const q of G.parts) {
    const a = Math.max(0, Math.min(1, q.life / (q.max || 1) * 1.5));
    c.globalAlpha = a;
    if (q.kind === 'text') {
      c.font = 'bold 20px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
      c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillText(q.text, q.x + 2, q.y + 2);
      c.fillStyle = q.col; c.fillText(q.text, q.x, q.y);
    } else if (q.kind === 'coin') drawCoin(c, q.x, q.y, G.t * 4);
    else if (q.kind === 'star') star5(c, q.x, q.y, q.size, q.size * 0.45, q.life * 5, q.col);
    else if (q.kind === 'steam') { c.fillStyle = q.col; circle(c, q.x, q.y, q.size); c.fill(); }
    else if (q.kind === 'chunk') { c.fillStyle = q.col; c.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size); }
    else if (q.kind === 'confetti') { c.save(); c.translate(q.x, q.y); c.rotate(q.rot + G.t * 4); c.fillStyle = q.col; c.fillRect(-q.size / 2, -q.size / 4, q.size, q.size / 2); c.restore(); }
    else { c.fillStyle = q.col; circle(c, q.x, q.y, q.size / 2); c.fill(); }
  }
  c.globalAlpha = 1;
}

function drawGame(c) {
  const lvl = G.lvl, theme = lvl.theme, cam = Math.round(G.cam), t = G.t;
  let sx = 0, sy = 0;
  if (G.shake > 0) { sx = rand(-1, 1) * 10 * Math.min(1, G.shake * 3); sy = rand(-1, 1) * 8 * Math.min(1, G.shake * 3); }
  c.save(); c.translate(sx, sy);
  drawBackground(c, theme, cam, t);
  drawTiles(c, lvl, cam, t);
  c.save(); c.translate(-cam, 0);
  const vis = (e, m = 120) => e.x + e.w > cam - m && e.x < cam + VW + m;
  const order = ['goal', 'check', 'sign', 'spring', 'mplat', 'laser', 'coin', 'star', 'item', 'fire', 'urchin', 'jumper', 'walker', 'spiky', 'flyer', 'jelly', 'boss', 'meteor'];
  for (const type of order) {
    for (const e of G.ents) {
      if (e.type !== type || !vis(e, type === 'goal' ? 300 : 120)) continue;
      switch (type) {
        case 'goal': drawGoal(c, e, theme, t, e.anim); break;
        case 'check': drawCheck(c, e, theme, t); break;
        case 'sign': drawSign(c, e); break;
        case 'spring': drawSpring(c, e); break;
        case 'mplat': drawMplat(c, e, theme, 0, t); break;
        case 'coin': drawCoin(c, e.x + e.w / 2, e.y + e.h / 2, t, e.sx); break;
        case 'star': if (e.had) c.globalAlpha = 0.55; drawStarItem(c, e, theme, t); c.globalAlpha = 1; break;
        case 'item': drawItem(c, e, t); break;
        case 'fire': drawFire(c, e, t); break;
        case 'jumper': drawJumper(c, e, t, theme); break;
        case 'laser': drawLaser(c, e, t); break;
        case 'urchin': drawUrchin(c, e, theme, t); break;
        case 'jelly': drawJelly(c, e, t); break;
        case 'walker': drawWalker(c, e, theme, t); break;
        case 'spiky': drawSpiky(c, e, theme, t); break;
        case 'flyer': drawFlyer(c, e, theme, t); break;
        case 'boss': drawBoss(c, e, t); break;
        case 'meteor': drawMeteor(c, e, t, theme); break;
      }
    }
  }
  // Noah
  const p = G.player;
  if (p.visible && !(p.inv > 0 && G.mode === 'play' && Math.floor(G.t * 15) % 2)) {
    const s = Store.current();
    drawNoah(c, p.x + p.w / 2, p.y + p.h, {
      outfit: s ? s.outfit : 'feuerwehr', power: p.power, facing: p.facing, run: p.run, tool: toolOf(theme), swing: p.swing > 0 ? p.swing / 0.24 : 0,
      moving: Math.abs(p.vx) > 20, air: !p.onGround, t, rot: G.mode === 'dying' && G.dieReason !== 'fall' ? p.rot : 0,
    });
  }
  // Wasser und Geschosse
  for (const d of G.drops) {
    if (d.bubble) { c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2; circle(c, d.x, d.y, d.r, 'rgba(180,230,255,0.35)'); c.stroke(); }
    else { circle(c, d.x, d.y, d.r, d.foam ? '#b9f6ca' : '#4fc3f7'); circle(c, d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.4, '#e1f5fe'); }
  }
  for (const s of G.shots) {
    if (s.kind === 'fire') { flame(c, s.x, s.y + s.r, s.r * 2.2, s.r * 3, t, s.x); circle(c, s.x, s.y + 2, s.r * 0.6, '#ffeb3b'); }
    else if (s.kind === 'snow') { circle(c, s.x, s.y, s.r, '#fff'); circle(c, s.x + 3, s.y + 3, s.r * 0.6, '#dcefff'); }
    else if (s.kind === 'ink') { circle(c, s.x, s.y, s.r, '#311b92'); circle(c, s.x - 4, s.y - 4, 4, '#5e35b1'); circle(c, s.x - s.vx * 0.06, s.y - s.vy * 0.06, s.r * 0.7, 'rgba(49,27,146,0.5)'); }
    else if (s.kind === 'flask' || s.kind === 'bag') drawShotExtra(c, s, t);
    else if (s.kind === 'bolt') { ellipse(c, s.x, s.y, s.r * 1.8, s.r * 0.9, 'rgba(255,235,59,0.35)'); ellipse(c, s.x, s.y, s.r * 1.2, s.r * 0.5, '#ffeb3b'); ellipse(c, s.x, s.y, s.r * 0.6, s.r * 0.25, '#fff'); }
    else if (s.splat) { ellipse(c, s.x, s.y + s.r - 2, s.r * 1.8, 5, 'rgba(118,255,3,0.7)'); }
    else { ellipse(c, s.x, s.y, s.r, s.r * 1.2, '#76ff03'); circle(c, s.x - 3, s.y - 4, 3, '#ccff90'); }
  }
  drawParticles(c);
  c.restore();
  if (G.signNear && G.mode === 'play') drawBubble(c, G.signNear.text, G.signNear.x + G.signNear.w / 2 - cam, G.signNear.y);
  c.restore();
  drawHUD(c, G);
  if (G.mode === 'dying' && G.dyingT > 0.4) {
    c.globalAlpha = Math.min(1, (G.dyingT - 0.4) * 3);
    c.font = 'bold 54px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillText('Hoppla!', VW / 2 + 3, VH / 2 + 3);
    c.fillStyle = '#fff'; c.fillText('Hoppla!', VW / 2, VH / 2);
    c.font = 'bold 24px "Arial Rounded MT Bold", Arial, sans-serif';
    c.fillText('Nochmal probieren!', VW / 2, VH / 2 + 40);
    c.globalAlpha = 1;
  }
}

/* ---------------- Titel und Karte ---------------- */
const attract = { x: 200, vy: 0, y: 0 };
function drawTitleScene(c, dt) {
  const t = G.t, cam = t * 120;
  drawBackground(c, 'dino', cam, t);
  const th = THEMES.dino;
  c.fillStyle = th.dirt; c.fillRect(0, 480, VW, 80);
  c.fillStyle = th.top; c.fillRect(0, 480, VW, 12);
  c.fillStyle = th.topDark;
  for (let x = -(cam % 10); x < VW; x += 10) { circle(c, x, 492, 5); c.fill(); }
  // Noah läuft und springt
  attract.vy += 2000 * dt; attract.y += attract.vy * dt;
  if (attract.y > 0) { attract.y = 0; attract.vy = Math.random() < 0.02 ? -700 : 0; }
  if (Math.random() < dt * 0.6 && attract.y === 0) attract.vy = -700;
  drawNoah(c, 300, 480 + attract.y, { outfit: 'feuerwehr', power: 'hose', facing: 1, run: t * 14, moving: true, air: attract.y < 0, t });
  // Dino, der hinterherläuft
  const dx = 120 + Math.sin(t * 0.7) * 30;
  drawWalker(c, { x: dx, y: 452, w: 32, h: 28, vx: 1, sx: 1 }, 'dino', t);
}

function mapNav(dir) {
  const s = Store.current();
  let i = G.mapSel + dir;
  if (i < 0 || i >= LEVELS.length) return;
  if (!Store.isUnlocked(s, i)) return;
  if (Math.floor(i / 9) !== Math.floor(G.mapSel / 9)) G.mapToken = null;
  G.mapSel = i; Sfx.play('select');
}

function updateMap(dt) {
  if (Input.leftP) mapNav(-1);
  if (Input.rightP) mapNav(1);
  if (Input.okP || Input.jumpP) { UI.startSelected(); return; }
  const [tx, ty] = MAP_NODES[G.mapSel];
  if (!G.mapToken) G.mapToken = [tx, ty];
  G.mapToken[0] += (tx - G.mapToken[0]) * Math.min(1, dt * 8);
  G.mapToken[1] += (ty - G.mapToken[1]) * Math.min(1, dt * 8);
}

function mapClick(x, y) {
  const s = Store.current();
  const page = Math.floor(G.mapSel / 9);
  if (Math.hypot(x - 26, y - 300) < 30 || Math.hypot(x - (VW - 26), y - 300) < 30) {
    const np = page + (x < VW / 2 ? -1 : 1), first = np * 9;
    if (np < 0 || first >= LEVELS.length) return;
    let pick = -1;
    for (let i = Math.min(LEVELS.length, first + 9) - 1; i >= first; i--) if (Store.isUnlocked(s, i)) { pick = i; break; }
    if (pick < 0) { Sfx.play('bump'); Sfx.speak('Diese Welten sind noch verschlossen.'); return; }
    G.mapSel = pick; G.mapToken = null; Sfx.play('select'); return;
  }
  for (let i = page * 9; i < Math.min(LEVELS.length, page * 9 + 9); i++) {
    const [nx, ny] = MAP_NODES[i];
    if (Math.hypot(x - nx, y - ny) < 34) {
      if (!Store.isUnlocked(s, i)) { Sfx.play('bump'); return; }
      if (G.mapSel === i) UI.startSelected();
      else { G.mapSel = i; Sfx.play('select'); Sfx.speak(LEVELS[i].name); }
      return;
    }
  }
}

canvas.addEventListener('pointerdown', ev => {
  Sfx.ensure();
  if (G.mode !== 'map') return;
  const r = canvas.getBoundingClientRect();
  mapClick((ev.clientX - r.left) / r.width * VW, (ev.clientY - r.top) / r.height * VH);
});

/* ---------------- Schleife ---------------- */
function resize() {
  const ww = window.innerWidth, wh = window.innerHeight;
  const s = Math.min(ww / VW, wh / VH);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cw = Math.floor(VW * s), ch = Math.floor(VH * s);
  const app = document.getElementById('app');
  app.style.width = cw + 'px'; app.style.height = ch + 'px';
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  canvas.width = Math.floor(cw * dpr); canvas.height = Math.floor(ch * dpr);
  document.documentElement.style.setProperty('--s', s);
}
window.addEventListener('resize', resize);

let last = performance.now(), acc = 0;
const STEP = 1 / 120;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  readInput();
  if (G.mode === 'play' && Input.pauseP) { UI.pause(); clearEdges(); }
  if (G.mode === 'play' || G.mode === 'dying' || G.mode === 'goal') {
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 20) { update(STEP); acc -= STEP; n++; clearEdges(); }
  } else {
    acc = 0;
    G.t += dt;
    if (G.mode === 'map') updateMap(dt);
    else if (G.mode === 'results' || G.mode === 'paused') updParticlesSafe(dt);
    clearEdges();
  }
  ctx.setTransform(canvas.width / VW, 0, 0, canvas.height / VH, 0, 0);
  ctx.clearRect(0, 0, VW, VH);
  try {
    if (G.mode === 'title') drawTitleScene(ctx, dt);
    else if (G.mode === 'map' || (G.mode === 'menu' && !G.lvl)) drawMap(ctx, G.t, Store.current(), G.mapSel, G.mapToken || MAP_NODES[G.mapSel]);
    else if (G.lvl) drawGame(ctx);
  } catch (err) { console.error(err); }
}
function updParticlesSafe(dt) { if (G.lvl) for (const q of G.parts) if (q.kind === 'confetti') { q.life -= dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; } }

document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play') UI.pause(); });

function bootGame() {
  resize();
  bindTouch();
  requestAnimationFrame(t => { last = t; frame(t); });
}
