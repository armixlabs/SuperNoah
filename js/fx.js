'use strict';
/* =========================================================
   Super Noah – Feinschliff: Schatten, Tiefe, Licht,
   Übergänge, Fortschrittsanzeige und kleine Effekte
   ========================================================= */

const FX = { fade: 0, fadeX: VW / 2, fadeY: VH / 2, hurt: 0, lastHearts: 3, lastRank: 0, look: 0, touchKey: '' };

function fxWipe(x, y) { FX.fade = 1; FX.fadeX = x; FX.fadeY = y; }

/* ---------- Noah: Strecken beim Absprung, Stauchen bei der Landung ---------- */
function fxDust(p, n, spread) {
  const th = THEMES[G.lvl.theme];
  if (G.lvl.phys.swim) return;
  for (let i = 0; i < n; i++) {
    G.parts.push({ x: p.x + p.w / 2 + rand(-spread, spread), y: p.y + p.h - 2, vx: rand(-70, 70), vy: rand(-60, -10),
      life: rand(0.25, 0.45), max: 0.45, col: i % 2 ? 'rgba(255,255,255,0.7)' : th.topDark, size: rand(4, 8), g: 120, kind: 'dot' });
  }
}
function fxJump(p) { p.stT = G.t; fxDust(p, 4, 6); }
function fxLand(p) { p.sqT = G.t; fxDust(p, 7, 10); }
function fxSquash(c, p) {
  const cx = p.x + p.w / 2, by = p.y + p.h;
  let sx = 1, sy = 1;
  const a = p.sqT != null ? 1 - (G.t - p.sqT) / 0.16 : 0, b = p.stT != null ? 1 - (G.t - p.stT) / 0.2 : 0;
  if (a > 0) { sx = 1 + 0.24 * a; sy = 1 - 0.2 * a; }
  else if (b > 0) { sx = 1 - 0.14 * b; sy = 1 + 0.16 * b; }
  c.translate(cx, by); c.scale(sx, sy); c.translate(-cx, -by);
}

/* ---------- Weiche Schatten unter Figuren ---------- */
function fxGroundY(cx, fromY) {
  const tx = Math.floor(cx / T);
  for (let ty = Math.max(0, Math.floor(fromY / T)); ty < LH; ty++) {
    const ch = tileAt(tx, ty);
    if (isSolidChar(ch) || ch === 'P') return ty * T;
  }
  return null;
}
function drawShadows(c, cam) {
  const sea = G.lvl.theme === 'sea';
  const one = (e, wide) => {
    if (e.x + e.w < cam - 60 || e.x > cam + VW + 60) return;
    const cx = e.x + e.w / 2, bottom = e.y + e.h, gy = fxGroundY(cx, bottom - 6);
    if (gy == null) return;
    const k = clamp(1 - (gy - bottom) / 220, 0.35, 1);
    ellipse(c, cx, gy + 3, e.w * 0.5 * wide * k, 5 * k, `rgba(0,0,20,${(sea ? 0.14 : 0.24) * k})`);
  };
  for (const e of G.ents) {
    if (e.dead) continue;
    if (e.type === 'walker' || e.type === 'spiky' || e.type === 'flyer' || e.type === 'jelly' || e.type === 'item' || e.type === 'star') one(e, 1);
    else if (e.type === 'boss' && e.state !== 'dead') one(e, 0.9);
  }
  const p = G.player;
  if (p.visible && G.mode !== 'dying') one(p, 1.15);
}

/* ---------- Boden mit Tiefe: Kanten, Unterseiten, dunklere Schichten ---------- */
const _fxGround = drawGround;
drawGround = function (c, lvl, th, tx, ty, x, y) {
  _fxGround(c, lvl, th, tx, ty, x, y);
  const g = lvl.grid;
  const sol = (xx, yy) => yy < 0 ? false : yy >= lvl.h ? true : (xx < 0 || xx >= lvl.w) ? true : g[yy][xx] === 'G';
  let depth = 0;
  for (let k = 1; k <= 3; k++) { if (sol(tx, ty - k)) depth++; else break; }
  if (depth) { c.fillStyle = `rgba(0,0,40,${0.055 * depth})`; c.fillRect(x, y, T + 0.5, T + 0.5); }
  const topOpen = !sol(tx, ty - 1);
  if (!sol(tx - 1, ty)) { c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x, y + (topOpen ? 10 : 0), 3, T - (topOpen ? 10 : 0)); }
  if (!sol(tx + 1, ty)) { c.fillStyle = 'rgba(0,0,30,0.22)'; c.fillRect(x + T - 5, y + (topOpen ? 10 : 0), 5.5, T - (topOpen ? 10 : 0)); }
  if (ty < lvl.h - 1 && !sol(tx, ty + 1)) { c.fillStyle = 'rgba(0,0,30,0.28)'; c.fillRect(x, y + T - 6, T + 0.5, 6.5); }
};

/* ---------- Münzen mit Schimmer ---------- */
const _fxCoin = drawCoin;
drawCoin = function (c, x, y, t, seed = 0) {
  if (t) { const g = c.createRadialGradient(x, y, 4, x, y, 20); g.addColorStop(0, 'rgba(255,230,120,0.45)'); g.addColorStop(1, 'rgba(255,230,120,0)'); c.fillStyle = g; c.fillRect(x - 20, y - 20, 40, 40); }
  _fxCoin(c, x, y, t, seed);
  if (t && (t * 0.9 + seed * 0.37) % 1 < 0.14) star5(c, x + 6, y - 8, 5, 1.8, t * 4, 'rgba(255,255,255,0.95)');
};

/* ---------- Dunst am Horizont für mehr Tiefe ---------- */
const _fxBg = drawBackground;
drawBackground = function (c, theme, cam, t) {
  _fxBg(c, theme, cam, t);
  const haze = { dino: '255,255,255', city: '255,200,150', ice: '255,255,255', knight: '255,255,255', police: '90,120,220' }[theme];
  if (!haze) return;
  const g = c.createLinearGradient(0, 330, 0, 520);
  g.addColorStop(0, `rgba(${haze},0)`); g.addColorStop(0.6, `rgba(${haze},0.22)`); g.addColorStop(1, `rgba(${haze},0)`);
  c.fillStyle = g; c.fillRect(0, 330, VW, 190);
};

/* ---------- Stimmung über dem Bild: schwebende Teilchen, Wasser, Vignette ---------- */
function fxAmbient(c, theme, t, cam) {
  if (theme === 'city') {
    for (let i = 0; i < 16; i++) {
      const sp = 30 + hash(i) * 50, x = ((hash(i + 3) * VW - cam * 0.6 + Math.sin(t + i) * 30) % VW + VW) % VW, y = VH - ((t * sp + hash(i + 7) * VH) % VH);
      circle(c, x, y, 1.5 + hash(i) * 2, `rgba(255,${150 + Math.floor(hash(i + 1) * 80)},60,${0.35 + 0.4 * Math.abs(Math.sin(t * 3 + i))})`);
    }
  } else if (theme === 'dino' || theme === 'knight') {
    for (let i = 0; i < 9; i++) {
      const x = ((hash(i) * VW * 1.3 + t * (25 + i * 4) - cam * 0.7) % (VW + 40) + VW + 40) % (VW + 40) - 20, y = (hash(i + 5) * VH + t * (18 + hash(i) * 20)) % VH;
      c.save(); c.translate(x, y + Math.sin(t * 2 + i) * 10); c.rotate(t * 1.5 + i);
      ellipse(c, 0, 0, 6, 2.6, i % 3 ? 'rgba(120,200,80,0.55)' : 'rgba(250,210,80,0.6)'); c.restore();
    }
  } else if (theme === 'space' || theme === 'robo' || theme === 'police') {
    for (let i = 0; i < 12; i++) {
      const x = ((hash(i) * VW - cam * 0.8 + t * 8) % VW + VW) % VW, y = (hash(i + 4) * VH + Math.sin(t * 0.7 + i) * 20 + VH) % VH;
      circle(c, x, y, 1.4, `rgba(255,255,255,${0.12 + 0.2 * Math.abs(Math.sin(t + i))})`);
    }
  } else if (theme === 'sea') {
    c.fillStyle = 'rgba(20,110,190,0.10)'; c.fillRect(0, 0, VW, VH);
    c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 3;
    for (let k = 0; k < 5; k++) { c.beginPath(); for (let x = 0; x <= VW; x += 40) c.lineTo(x, 60 + k * 100 + Math.sin(x * 0.012 + t * 1.2 + k) * 14); c.stroke(); }
  }
}
function fxVignette(c, strength) {
  const g = c.createRadialGradient(VW / 2, VH / 2, VH * 0.42, VW / 2, VH / 2, VW * 0.72);
  g.addColorStop(0, 'rgba(0,0,25,0)'); g.addColorStop(1, `rgba(0,0,25,${strength})`);
  c.fillStyle = g; c.fillRect(0, 0, VW, VH);
}

const _fxDrawGame = drawGame;
drawGame = function (c) {
  _fxDrawGame(c);
  const theme = G.lvl.theme;
  fxAmbient(c, theme, G.t, G.cam);
  fxVignette(c, theme === 'lab' || theme === 'ice' ? 0.14 : 0.24);
};

const _fxDrawMap = drawMap;
drawMap = function (c, t, save, sel, tokenPos) { _fxDrawMap(c, t, save, sel, tokenPos); fxVignette(c, 0.2); };

/* ---------- HUD: Fortschritt im Level, Treffer-Anzeige, Touch-Knopf ---------- */
const _fxHud = drawHUD;
drawHUD = function (c, G) {
  _fxHud(c, G);
  const p = G.player, lvl = G.lvl;
  // Treffer erkennen
  if (p.hearts < FX.lastHearts || RANK[p.power] < FX.lastRank) FX.hurt = 0.55;
  FX.lastHearts = p.hearts; FX.lastRank = RANK[p.power];
  // Fortschrittsleiste (nicht im Bosskampf)
  const boss = G.boss;
  if (!(boss && boss.active && boss.state !== 'dead') && G.bannerT <= 0) {
    if (lvl._goalX == null) { const g = G.ents.find(e => e.type === 'goal'); lvl._goalX = g ? g.x : lvl.w * T; lvl._checks = G.ents.filter(e => e.type === 'check').map(e => e.x); }
    const w = 300, x0 = VW / 2 - w / 2, y = VH - 20, k = clamp(p.x / lvl._goalX, 0, 1);
    c.fillStyle = 'rgba(0,0,20,0.35)'; rr(c, x0 - 6, y - 7, w + 12, 14, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; rr(c, x0, y - 3, w, 6, 3); c.fill();
    c.fillStyle = '#ffd54f'; rr(c, x0, y - 3, Math.max(6, w * k), 6, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; for (const cx of lvl._checks) c.fillRect(x0 + w * clamp(cx / lvl._goalX, 0, 1) - 1, y - 5, 2, 10);
    // Ziel-Fähnchen
    c.fillStyle = '#fff'; c.fillRect(x0 + w + 9, y - 12, 2, 18);
    tri(c, x0 + w + 11, y - 12, x0 + w + 22, y - 8, x0 + w + 11, y - 4, '#e53935');
    // Noah-Kopf als Marker
    const mx = x0 + w * k;
    circle(c, mx, y, 8, '#fff'); circle(c, mx, y, 6.5, '#ffd3ad');
    c.fillStyle = '#e3261f'; c.beginPath(); c.arc(mx, y - 1, 6.8, Math.PI, 0); c.fill();
  }
  // letztes Herz pulsiert
  if (p.hearts === 1 && G.mode === 'play') {
    const a = 0.5 + 0.5 * Math.sin(G.t * 7);
    c.strokeStyle = `rgba(255,82,82,${0.4 + a * 0.5})`; c.lineWidth = 3; circle(c, 26, 30, 19 + a * 3); c.stroke();
  }
  // Touch-Knopf zeigt das aktuelle Werkzeug
  const tool = toolOf(lvl.theme), key = tool + '|' + (p.power === 'hose');
  if (key !== FX.touchKey) {
    FX.touchKey = key;
    const b = document.querySelector('#touch [data-act="spray"]');
    if (b) { b.textContent = { water: '💦', bubble: '🫧', foam: '🫧', sword: '🗡️', net: '🥅' }[tool]; b.style.opacity = p.power === 'hose' ? '' : '0.35'; }
  }
};

/* ---------- Über allem: roter Rand bei Treffern, Kreisblende ---------- */
function fxOverlay(c, dt) {
  if (FX.hurt > 0) {
    FX.hurt -= dt;
    if (G.lvl && (G.mode === 'play' || G.mode === 'dying')) {
      const g = c.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VW * 0.65);
      g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, `rgba(255,30,30,${Math.max(0, FX.hurt) * 0.8})`);
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    }
  }
  if (FX.fade > 0) {
    FX.fade -= dt * 1.5;
    const k = 1 - Math.max(0, FX.fade), r = k * k * 720;
    c.fillStyle = '#0d0a26'; c.beginPath(); c.rect(0, 0, VW, VH); c.arc(FX.fadeX, FX.fadeY, r, 0, Math.PI * 2, true); c.fill('evenodd');
    c.strokeStyle = 'rgba(255,213,79,0.9)'; c.lineWidth = 5; circle(c, FX.fadeX, FX.fadeY, r); c.stroke();
  }
}
