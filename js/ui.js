'use strict';
/* =========================================================
   Super Noah – Menüs, Spielstände, Kleiderschrank
   ========================================================= */

const UI = (() => {
  const $ = id => document.getElementById(id);
  const COIN = '<i class="coin"></i>';
  const MAXSTARS = LEVELS.length * 3;
  const esc = t => String(t).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const SCREENS = ['scrTitle', 'scrSlots', 'scrSaveMenu', 'scrShop', 'scrSettings', 'scrHelp', 'scrPause', 'scrResults', 'scrEnding'];
  const settings = Store.loadSettings();
  let backFromSettings = 'scrTitle', lastResult = null;

  function show(id) { SCREENS.forEach(s => $(s).classList.toggle('hidden', s !== id)); }
  const touchOn = () => settings.touch === 'on' || (settings.touch === 'auto' && (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0));
  function setHud(mode) {
    $('hud').classList.toggle('hidden', mode !== 'play');
    $('touch').classList.toggle('hidden', mode !== 'play' || !touchOn());
    $('mapBar').classList.toggle('hidden', mode !== 'map');
    $('btnGo').classList.toggle('hidden', mode !== 'map');
  }

  let toastTimer = null;
  function toast(msg, ms = 2800) {
    const t = $('toast'); t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
  }

  /* ---------- Dialog ---------- */
  function ask(title, text, buttons, input) {
    return new Promise(res => {
      $('modalTitle').textContent = title; $('modalText').textContent = text || '';
      const inp = $('modalInput');
      inp.classList.toggle('hidden', input == null);
      if (input != null) { inp.value = input; setTimeout(() => { inp.focus(); inp.select(); }, 50); }
      const box = $('modalBtns'); box.innerHTML = '';
      const close = v => { $('modal').classList.add('hidden'); inp.onkeydown = null; res(v); };
      buttons.forEach(b => {
        const el = document.createElement('button');
        el.textContent = b.label; if (b.cls) el.className = b.cls;
        el.onclick = () => { Sfx.play('select'); close(input != null && b.value === true ? inp.value : b.value); };
        box.appendChild(el);
      });
      if (input != null) inp.onkeydown = e => { if (e.key === 'Enter') close(inp.value); if (e.key === 'Escape') close(null); };
      $('modal').classList.remove('hidden');
    });
  }

  /* ---------- Vorschau-Bild ---------- */
  function drawPreview(cv, outfit, power = 'helmet') {
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H);
    const g = c.createRadialGradient(W / 2, H * 0.55, 5, W / 2, H * 0.55, W * 0.6);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    drawNoah(c, W / 2, H - 14, { outfit, power, facing: 1, t: 0, scale: H / 70 });
  }

  /* ---------- Bildschirme ---------- */
  function goTitle() {
    G.mode = 'title'; setHud('title'); show('scrTitle');
    Sfx.music('map');
  }
  function goSlots() { renderSlots(); show('scrSlots'); setHud('menu'); if (!Store.storageOk) toast('Hinweis: Dieser Browser kann nicht speichern. Bitte exportiere deinen Spielstand als Datei!', 5000); }
  function goMap() {
    if (!Store.current()) { goSlots(); return; }
    G.mode = 'map'; G.mapToken = null; G.lvl = null; fxWipe(VW / 2, VH / 2); show(null); setHud('map'); updateMapBar();
    Sfx.music('map');
  }
  function updateMapBar() {
    const s = Store.current(); if (!s) return;
    $('mapName').textContent = '🙂 ' + s.name;
    $('mapCoins').textContent = s.coins;
    $('mapStars').textContent = Store.starCount(s); $('mapStarsMax').textContent = MAXSTARS;
  }
  function startSelected() {
    if (G.mode !== 'map') return;
    if (!Store.isUnlocked(Store.current(), G.mapSel)) return;
    Sfx.play('select');
    show(null); startLevel(G.mapSel);
  }
  function onLevelStart() { show(null); setHud('play'); }
  function pause() {
    if (G.mode !== 'play') return;
    G.mode = 'paused'; show('scrPause'); setHud('paused'); syncPauseIcons();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  function resume() { edges.clear(); clearEdges(); show(null); G.mode = 'play'; setHud('play'); }

  /* ---------- Spielstände ---------- */
  function firstUnfinished(s) {
    for (let i = 0; i < LEVELS.length; i++) if (!(s.levels[LEVELS[i].id] && s.levels[LEVELS[i].id].done)) return i;
    return LEVELS.length - 1;
  }
  function useSlot(i) {
    Store.active = i;
    G.mapSel = firstUnfinished(Store.slots[i]);
    Sfx.speak('Hallo ' + Store.slots[i].name + '!');
    goMap();
  }

  function renderSlots() {
    const list = $('slotList'); list.innerHTML = '';
    Store.slots.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'slot' + (s ? '' : ' empty-slot');
      if (s) {
        const cv = document.createElement('canvas'); cv.width = 110; cv.height = 128;
        card.appendChild(cv); drawPreview(cv, s.outfit);
        const nm = document.createElement('div'); nm.className = 'sname'; nm.textContent = s.name; card.appendChild(nm);
        const info = document.createElement('div'); info.className = 'sinfo';
        info.innerHTML = `⭐ ${Store.starCount(s)}/${MAXSTARS} · ${COIN} ${s.coins}`; card.appendChild(info);
        const info2 = document.createElement('div'); info2.className = 'sinfo';
        info2.textContent = `${Store.doneCount(s)} von ${LEVELS.length} Leveln geschafft`; card.appendChild(info2);
        const b = document.createElement('div'); b.className = 'sbtns';
        b.innerHTML = '<button class="p">▶ Spielen</button><button class="x" title="Als Datei exportieren">💾</button><button class="d" title="Löschen">🗑️</button>';
        b.querySelector('.p').onclick = () => { Sfx.play('select'); useSlot(i); };
        b.querySelector('.x').onclick = () => { Store.exportSave(s); toast('Spielstand „' + s.name + '“ wurde als Datei gespeichert.'); };
        b.querySelector('.d').onclick = async () => {
          const ok = await ask('Spielstand löschen?', `Willst du den Spielstand von „${s.name}“ wirklich löschen? Das kann man nicht rückgängig machen. Tipp: Vorher mit 💾 exportieren.`,
            [{ label: 'Nein', value: false }, { label: '🗑️ Ja, löschen', value: true, cls: 'big2' }]);
          if (ok) { Store.remove(i); renderSlots(); toast('Gelöscht.'); }
        };
        card.appendChild(b);
      } else {
        card.innerHTML = '<div class="empty">＋</div><div class="sname">Freier Platz</div>';
        const nb = document.createElement('button'); nb.className = 'big2'; nb.textContent = 'Neues Spiel';
        nb.onclick = async () => {
          const name = await ask('Wie heißt du?', 'Gib deinen Namen ein:', [{ label: 'Abbrechen', value: null }, { label: '✔ Los geht’s', value: true, cls: 'big2' }], 'Noah');
          if (name == null) return;
          Store.create(i, name.trim() || 'Noah');
          useSlot(i);
        };
        card.appendChild(nb);
      }
      list.appendChild(card);
    });
  }

  /* ---------- Import ---------- */
  let importReturn = 'slots';
  function startImport(from) { importReturn = from; $('fileInput').value = ''; $('fileInput').click(); }
  async function onImportFile(ev) {
    const f = ev.target.files && ev.target.files[0]; if (!f) return;
    let save;
    try { save = Store.parseImport(await f.text()); }
    catch (e) { await ask('Das hat nicht geklappt', e.message, [{ label: 'OK', value: true }]); return; }
    const btns = Store.slots.map((s, i) => ({ label: `Platz ${i + 1}: ${s ? s.name : 'frei'}`, value: i }));
    btns.push({ label: 'Abbrechen', value: null });
    const slot = await ask('Spielstand „' + save.name + '“ laden', `${Store.starCount(save)} Schätze · ${save.coins} Münzen. In welchen Platz soll er?`, btns);
    if (slot == null) return;
    if (Store.slots[slot]) {
      const ok = await ask('Überschreiben?', `Auf Platz ${slot + 1} ist schon „${Store.slots[slot].name}“. Ersetzen?`, [{ label: 'Nein', value: false }, { label: 'Ja, ersetzen', value: true, cls: 'big2' }]);
      if (!ok) return;
    }
    Store.put(slot, save);
    toast('„' + save.name + '“ wurde importiert!');
    if (importReturn === 'map') { useSlot(slot); }
    else renderSlots();
  }

  /* ---------- Kleiderschrank ---------- */
  function renderShop() {
    const s = Store.current(); if (!s) return;
    $('shopCoins').textContent = s.coins;
    const list = $('shopList'); list.innerHTML = '';
    OUTFITS.forEach(o => {
      const owned = s.owned.includes(o.id), worn = s.outfit === o.id;
      const card = document.createElement('div'); card.className = 'outfit' + (worn ? ' worn' : '');
      const cv = document.createElement('canvas'); cv.width = 100; cv.height = 120; card.appendChild(cv);
      drawPreview(cv, o.id, 'hose');
      const nm = document.createElement('div'); nm.className = 'oname'; nm.textContent = o.name; card.appendChild(nm);
      const b = document.createElement('button');
      if (worn) { b.textContent = '✔ Angezogen'; b.disabled = true; }
      else if (owned) { b.textContent = '👕 Anziehen'; b.onclick = () => { s.outfit = o.id; Store.commit(); Sfx.play('select'); Sfx.speak(o.name); renderShop(); }; }
      else {
        b.innerHTML = COIN + ' ' + o.price; b.disabled = s.coins < o.price;
        b.title = s.coins < o.price ? 'Noch ' + (o.price - s.coins) + ' Münzen sammeln' : 'Kaufen';
        b.onclick = () => {
          if (s.coins < o.price) return;
          s.coins -= o.price; s.owned.push(o.id); s.outfit = o.id; Store.commit();
          Sfx.play('buy'); Sfx.speak('Super! Ein neues Kostüm: ' + o.name);
          renderShop(); updateMapBar();
        };
      }
      card.appendChild(b);
      list.appendChild(card);
    });
  }

  /* ---------- Ergebnis ---------- */
  function showResults(r) {
    lastResult = r;
    setHud('results');
    $('resTitle').textContent = r.firstClear ? 'Geschafft! 🎉' : 'Super gemacht! 🎉';
    const st = $('resStars'); st.innerHTML = '';
    r.stars.forEach((got, i) => {
      const sp = document.createElement('span');
      const cv = document.createElement('canvas'); cv.width = 80; cv.height = 80;
      drawCollectIcon(cv.getContext('2d'), r.theme, 40, 42, 2.3, 0, !got);
      sp.appendChild(cv);
      if (got && r.newStars[i]) { sp.className = 'new'; sp.style.animationDelay = (i * 0.25) + 's'; }
      st.appendChild(sp);
    });
    $('resCoins').textContent = '+' + r.coins;
    const m = Math.floor(r.time / 60), sec = Math.floor(r.time % 60);
    $('resTime').textContent = m + ':' + String(sec).padStart(2, '0');
    let note = '';
    if (r.newWorld) { note = 'Neue Welt freigeschaltet: ' + r.newWorld.name + '!'; setTimeout(() => Sfx.speak('Neue Welt: ' + r.newWorld.name + '!'), 2200); }
    else if (r.stars.every(Boolean)) note = 'Alle drei gefunden – toll!';
    if (!r.saveOk) note += ' (Speichern im Browser hat nicht geklappt – bitte exportieren!)';
    $('resNote').textContent = note;
    const hasNext = !r.ending && G.levelIndex + 1 < LEVELS.length;
    $('btnResLevel').classList.toggle('hidden', !hasNext);
    $('btnResNext').textContent = hasNext ? '🗺️ Karte' : 'Weiter ➜';
    $('btnResNext').classList.toggle('big', !hasNext);
    show('scrResults');
    setTimeout(() => { if (G.mode === 'results') (hasNext ? $('btnResLevel') : $('btnResNext')).focus(); }, 1500);
    updateMapBar();
  }
  function resultsNext() {
    Sfx.play('select');
    if (lastResult && lastResult.ending) {
      const s = Store.current();
      $('endText').textContent = `Super ${s.name} hat alle neun Welten gerettet, den Drachen gezähmt und den Meister-Räuber gefangen! Du hast ${Store.starCount(s)} von ${MAXSTARS} Schätzen gefunden.` +
        (Store.starCount(s) < MAXSTARS ? ' Findest du auch noch die anderen?' : ' Wow, wirklich alle!');
      show('scrEnding');
      Sfx.music('map'); Sfx.play('win');
      Sfx.speak('Du hast es geschafft! Super ' + s.name + ' hat alle Welten gerettet!');
      return;
    }
    goMap();
  }

  /* ---------- Einstellungen ---------- */
  function applySettings() {
    Sfx.setOpts({ sfx: settings.sfx, music: settings.music, speech: settings.speech });
    $('setSfx').checked = settings.sfx; $('setMusic').checked = settings.music; $('setSpeech').checked = settings.speech;
    $('setTouch').value = settings.touch;
    Store.saveSettings(settings);
    syncPauseIcons();
  }
  function syncPauseIcons() {
    $('btnPSound').style.opacity = settings.sfx ? 1 : 0.4;
    $('btnPMusic').style.opacity = settings.music ? 1 : 0.4;
    $('btnPSpeech').style.opacity = settings.speech ? 1 : 0.4;
  }
  function openSettings(from) { backFromSettings = from; applySettings(); show('scrSettings'); setHud('menu'); }
  function closeSettings() {
    if (backFromSettings === 'map') goMap();
    else show(backFromSettings);
  }

  /* ---------- Knöpfe verbinden ---------- */
  function wire() {
    const on = (id, fn) => $(id).addEventListener('click', e => { Sfx.ensure(); fn(e); e.currentTarget.blur(); });
    on('btnPlay', () => { Sfx.play('select'); goSlots(); });
    on('btnHelp', () => { Sfx.play('select'); show('scrHelp'); });
    on('btnHelpBack', () => show('scrTitle'));
    on('btnSettings', () => openSettings('scrTitle'));
    on('btnSetBack', closeSettings);
    on('btnSlotsBack', goTitle);
    on('btnImport', () => startImport('slots'));
    on('btnImport2', () => startImport('map'));
    $('fileInput').addEventListener('change', onImportFile);

    on('btnShop', () => { Sfx.play('select'); G.mode = 'menu'; setHud('menu'); renderShop(); show('scrShop'); });
    on('btnShopBack', goMap);
    on('btnSaveMenu', () => {
      Sfx.play('select'); G.mode = 'menu'; setHud('menu');
      const s = Store.current();
      $('saveInfo').innerHTML = `Spieler: <b>${esc(s.name)}</b> · ⭐ ${Store.starCount(s)}/${MAXSTARS} · ${COIN} ${s.coins} · Platz ${Store.active + 1}`;
      show('scrSaveMenu');
    });
    on('btnExportCur', () => { const s = Store.current(); Store.exportSave(s); toast('Spielstand „' + s.name + '“ wurde als Datei gespeichert.'); });
    on('btnSwitch', goSlots);
    on('btnSaveBack', goMap);
    on('btnMapSettings', () => { G.mode = 'menu'; openSettings('map'); });
    on('btnHome', goTitle);
    on('btnGo', startSelected);

    on('btnPause', pause);
    on('btnResume', resume);
    on('btnRestart', () => { show(null); startLevel(G.levelIndex); });
    on('btnToMap', goMap);
    on('btnPSound', () => { settings.sfx = !settings.sfx; applySettings(); });
    on('btnPMusic', () => { settings.music = !settings.music; applySettings(); });
    on('btnPSpeech', () => { settings.speech = !settings.speech; applySettings(); });

    on('btnResNext', resultsNext);
    on('btnResLevel', () => { Sfx.play('select'); show(null); startLevel(G.mapSel); });
    on('btnResAgain', () => { show(null); startLevel(G.levelIndex); });
    on('btnEndMap', goMap);

    $('setSfx').onchange = e => { settings.sfx = e.target.checked; applySettings(); Sfx.play('coin'); };
    $('setMusic').onchange = e => { settings.music = e.target.checked; applySettings(); };
    $('setSpeech').onchange = e => { settings.speech = e.target.checked; applySettings(); if (settings.speech) Sfx.speak('Hallo Noah!'); };
    $('setTouch').onchange = e => { settings.touch = e.target.value; applySettings(); };
    on('btnFull', () => {
      const el = document.documentElement;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen().catch(() => toast('Vollbild ist hier nicht möglich.'));
      else toast('Vollbild ist hier nicht möglich.');
    });

    // Menüs auch mit Esc schließen
    window.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !$('modal').classList.contains('hidden')) return;
      if (G.mode === 'paused') resume();
      else if (!$('scrShop').classList.contains('hidden') || !$('scrSaveMenu').classList.contains('hidden')) goMap();
      else if (!$('scrSettings').classList.contains('hidden')) closeSettings();
      else if (!$('scrHelp').classList.contains('hidden') || !$('scrSlots').classList.contains('hidden')) goTitle();
    });
    document.addEventListener('pointerdown', () => Sfx.ensure(), { once: true });
  }

  function boot() {
    wire();
    applySettings();
    bootGame();
    goTitle();
  }

  return { touchOn, goMap, goTitle, startSelected, onLevelStart, pause, resume, showResults, toast, boot };
})();

UI.boot();
