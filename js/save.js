'use strict';
/* =========================================================
   Super Noah – Spielstände (3 Plätze im Browser) + Export/Import
   ========================================================= */

const Store = (() => {
  const SLOTS_KEY = 'superNoah.slots.v1';
  const SET_KEY = 'superNoah.settings.v1';
  const mem = {};
  let ok = true;
  try { localStorage.setItem('__sn', '1'); localStorage.removeItem('__sn'); } catch (e) { ok = false; }

  const get = k => { try { return ok ? localStorage.getItem(k) : (mem[k] ?? null); } catch (e) { return mem[k] ?? null; } };
  const set = (k, v) => { mem[k] = v; if (!ok) return true; try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };

  function sanitize(s) {
    s = s || {};
    const o = {
      app: 'SuperNoah', version: 1,
      name: String(s.name || 'Noah').trim().slice(0, 16) || 'Noah',
      created: +s.created || Date.now(), updated: +s.updated || Date.now(),
      coins: Math.max(0, Math.floor(+s.coins || 0)),
      outfit: OUTFIT_IDS.includes(s.outfit) ? s.outfit : 'feuerwehr',
      owned: Array.isArray(s.owned) ? s.owned.filter(id => OUTFIT_IDS.includes(id)) : [],
      levels: {}, ending: !!s.ending,
    };
    if (!o.owned.includes('feuerwehr')) o.owned.unshift('feuerwehr');
    if (!o.owned.includes(o.outfit)) o.outfit = 'feuerwehr';
    if (s.levels && typeof s.levels === 'object') {
      for (const id of Object.keys(s.levels)) {
        if (!LEVEL_IDS.includes(id)) continue;
        const L = s.levels[id] || {};
        o.levels[id] = {
          done: !!L.done,
          stars: [0, 1, 2].map(i => !!(L.stars && L.stars[i])),
          best: Math.max(0, +L.best || 0),
        };
      }
    }
    return o;
  }

  function loadSlots() {
    try {
      const a = JSON.parse(get(SLOTS_KEY));
      if (Array.isArray(a)) return [0, 1, 2].map(i => a[i] ? sanitize(a[i]) : null);
    } catch (e) { /* kaputt → leer */ }
    return [null, null, null];
  }

  const slots = loadSlots();
  let active = -1;

  function persist() { return set(SLOTS_KEY, JSON.stringify(slots)); }
  function current() { return active >= 0 ? slots[active] : null; }
  function commit() {
    const s = current(); if (s) s.updated = Date.now();
    return persist();
  }
  function create(i, name) { slots[i] = sanitize({ name }); active = i; persist(); return slots[i]; }
  function remove(i) { slots[i] = null; if (active === i) active = -1; persist(); }
  function put(i, save) { slots[i] = sanitize(save); persist(); }

  const starCount = s => s ? Object.values(s.levels).reduce((n, l) => n + l.stars.filter(Boolean).length, 0) : 0;
  const doneCount = s => s ? Object.values(s.levels).filter(l => l.done).length : 0;
  const isUnlocked = (s, idx) => idx === 0 || !!(s && s.levels[LEVELS[idx - 1].id] && s.levels[LEVELS[idx - 1].id].done);

  function exportSave(s) {
    if (!s) return;
    const data = JSON.stringify(Object.assign({}, s, { exported: new Date().toISOString() }), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    const d = new Date();
    const date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const safe = s.name.replace(/[^\p{L}\p{N}_-]+/gu, '_');
    a.href = URL.createObjectURL(blob);
    a.download = `SuperNoah-${safe}-${date}.supernoah.json`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function parseImport(text) {
    let o;
    try { o = JSON.parse(text); } catch (e) { throw new Error('Die Datei ist kein gültiger Spielstand.'); }
    if (!o || o.app !== 'SuperNoah') throw new Error('Das ist kein Super-Noah-Spielstand.');
    return sanitize(o);
  }

  function loadSettings() {
    try { return Object.assign({ sfx: true, music: true, speech: true, touch: 'auto' }, JSON.parse(get(SET_KEY)) || {}); }
    catch (e) { return { sfx: true, music: true, speech: true, touch: 'auto' }; }
  }
  function saveSettings(o) { set(SET_KEY, JSON.stringify(o)); }

  return {
    slots, get active() { return active; }, set active(i) { active = i; },
    current, commit, create, remove, put, starCount, doneCount, isUnlocked,
    exportSave, parseImport, loadSettings, saveSettings, storageOk: ok,
  };
})();
