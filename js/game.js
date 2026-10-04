/* ===============================================================
   GAME LAYER
   1) Project Grand Prix — drive a circuit; each pit board = a project
   2) Achievements — unlock badges by exploring the site
   3) Secret code (Konami) + confetti
   State is saved in localStorage (per-browser convenience only).
   =============================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  /* ============================================================
     ACHIEVEMENTS
     ============================================================ */
  var ACH = [
    { id: 'hello',    icon: '👋', name: 'Pit Lane Entry',    desc: 'Open the portfolio.' },
    { id: 'tour',     icon: '🗺️', name: 'Grand Tour',        desc: 'Visit every main page.' },
    { id: 'deep',     icon: '🔍', name: 'Deep Dive',         desc: 'Open 3 full project write-ups.' },
    { id: 'lights',   icon: '🚦', name: 'Lights Out',        desc: 'Start the Grand Prix.' },
    { id: 'react',    icon: '⚡', name: 'Quick Reflexes',    desc: 'React to lights-out in under 0.30 s.' },
    { id: 'lap',      icon: '⏱️', name: 'Lap One',           desc: 'Complete a full lap.' },
    { id: 'drs',      icon: '💨', name: 'DRS Enabled',       desc: 'Use the DRS boost.' },
    { id: 'grid',     icon: '🏁', name: 'Full Grid',         desc: 'Visit all 10 pit boards.' },
    { id: 'thermal',  icon: '🌡️', name: 'Thermal Engineer',  desc: 'Play with the heat-load calculator.' },
    { id: 'gear',     icon: '⚙️', name: 'Gearhead',          desc: 'Spin up the planetary gearbox.' },
    { id: 'night',    icon: '🌙', name: 'Night Shift',       desc: 'Switch on dark mode.' },
    { id: 'speed',    icon: '⌨️', name: 'Speed Dial',        desc: 'Use the ⌘K / Ctrl+K quick search.' },
    { id: 'hamster',  icon: '🐹', name: 'Hamster Whisperer', desc: 'Click the mascot 5 times.' },
    { id: 'secret',   icon: '🌈', name: '???',               desc: 'A classic code unlocks a special livery.', secret: true, realName: 'Gold Livery' }
  ];
  var unlocked = load('ry-ach', {});
  var achQueue = [], achShowing = false;

  function renderAch() {
    var n = 0;
    ACH.forEach(function (a) { if (unlocked[a.id]) n++; });
    if ($('achCount')) { $('achCount').textContent = n; $('achCount').classList.toggle('full', n === ACH.length); }
    if ($('achSummary')) $('achSummary').textContent = n + ' / ' + ACH.length;
    if ($('achBarFill')) $('achBarFill').style.width = (n / ACH.length * 100) + '%';
    var grid = $('achGrid');
    if (!grid) return;
    grid.innerHTML = ACH.map(function (a) {
      var on = !!unlocked[a.id];
      var name = a.secret && on ? a.realName : a.name;
      return '<li class="ach-item' + (on ? ' on' : '') + '"><span class="ach-ico">' + (on ? a.icon : '🔒') + '</span>' +
        '<span class="ach-txt"><b>' + name + '</b><i>' + (a.secret && !on ? 'Secret' : a.desc) + '</i></span></li>';
    }).join('');
  }

  function showNextAch() {
    var t = $('achToast');
    if (!t || achShowing || !achQueue.length) return;
    achShowing = true;
    var a = achQueue.shift();
    t.innerHTML = '<span class="at-ico">' + a.icon + '</span><span><small>Achievement unlocked</small><b>' + (a.secret ? a.realName : a.name) + '</b></span>';
    t.classList.add('show');
    var btn = $('achBtn');
    if (btn) { btn.classList.remove('ping'); void btn.offsetWidth; btn.classList.add('ping'); }
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { achShowing = false; showNextAch(); }, 350);
    }, 2600);
  }

  function unlock(id) {
    if (unlocked[id]) return;
    var a = ACH.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    unlocked[id] = Date.now();
    save('ry-ach', unlocked);
    renderAch();
    achQueue.push(a);
    showNextAch();
    var all = ACH.every(function (x) { return unlocked[x.id]; });
    if (all) setTimeout(function () { confetti(160); }, 600);
  }
  window.RYAch = { unlock: unlock };

  // panel
  function openAch() { var p = $('achPanel'); if (!p) return; renderAch(); document.body.classList.add('ach-open'); p.hidden = false; requestAnimationFrame(function () { p.classList.add('open'); }); }
  function closeAch() { var p = $('achPanel'); if (!p || p.hidden) return; document.body.classList.remove('ach-open'); p.classList.remove('open'); setTimeout(function () { p.hidden = true; }, 200); }
  if ($('achBtn')) $('achBtn').addEventListener('click', openAch);
  if ($('achPanel')) $('achPanel').addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeAch(); });
  if ($('achReset')) $('achReset').addEventListener('click', function () {
    unlocked = {}; save('ry-ach', unlocked);
    save('ry-gp', { visited: {}, best: null });
    gp.visited = {}; gp.best = null; updateBoards(); updateHud();
    setLivery(false);
    renderAch();
  });

  /* ---- hooks for achievements ---- */
  var MAIN_PAGES = ['home', 'about', 'projects', 'race', 'lab', 'experience', 'awards', 'skills', 'contact'];
  var seenPages = load('ry-pages', {});
  var projectsOpened = load('ry-proj', {});

  var prevGo = window.goToPage;
  window.goToPage = goToPage = function (name, skipHash) {
    prevGo(name, skipHash);
    if (MAIN_PAGES.indexOf(name) > -1) {
      seenPages[name] = 1; save('ry-pages', seenPages);
      if (MAIN_PAGES.every(function (p) { return seenPages[p]; })) unlock('tour');
    }
    if (name === 'race') raceEnter(); else raceLeave();
  };
  var prevOpen = window.openProjectDetail;
  window.openProjectDetail = openProjectDetail = function (id, skipHash) {
    prevOpen(id, skipHash);
    projectsOpened[id] = 1; save('ry-proj', projectsOpened);
    if (Object.keys(projectsOpened).length >= 3) unlock('deep');
  };

  document.addEventListener('themechange', function () {
    if (document.documentElement.getAttribute('data-theme') === 'dark') unlock('night');
  });
  if ($('cmdkOpenBtn')) $('cmdkOpenBtn').addEventListener('click', function () { unlock('speed'); });
  ['heatPin', 'heatEta'].forEach(function (id) { if ($(id)) $(id).addEventListener('input', function () { unlock('thermal'); }); });
  document.querySelectorAll('#labHeat .lab-presets button').forEach(function (b) { b.addEventListener('click', function () { unlock('thermal'); }); });
  ['gearIn', 'gearTq'].forEach(function (id) { if ($(id)) $(id).addEventListener('input', function () { unlock('gear'); }); });
  var mascotClicks = 0;
  if ($('mascotBody')) $('mascotBody').addEventListener('click', function () { if (++mascotClicks >= 5) unlock('hamster'); });

  /* ---- confetti ---- */
  function confetti(n) {
    var layer = $('confetti');
    if (!layer || reduceMotion) return;
    var colors = ['#C8748A', '#9B8FC2', '#E39A6F', '#7A9E8E', '#F9D58B', '#E0A3AD'];
    for (var i = 0; i < (n || 100); i++) {
      var c = document.createElement('i');
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      c.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      c.style.width = (6 + Math.random() * 6) + 'px';
      c.style.height = (8 + Math.random() * 8) + 'px';
      layer.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 4200); })(c);
    }
  }
  window.RYConfetti = confetti;

  /* ---- secret code: ↑ ↑ ↓ ↓ ← → ← → B A ---- */
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var kIdx = 0;
  document.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kIdx = (k === KONAMI[kIdx]) ? kIdx + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) {
      kIdx = 0;
      unlock('secret');
      setLivery(true);
      confetti(140);
    }
  });

  /* ============================================================
     PROJECT GRAND PRIX
     ============================================================ */
  var TRACK_D = 'M 170 478 L 600 478 C 700 478 760 462 800 420 C 842 376 838 318 880 282 C 930 240 948 176 912 124 C 876 72 800 70 748 98 L 640 156 C 590 182 540 172 506 136 C 462 88 392 60 330 88 C 270 116 262 176 300 220 C 334 260 318 312 262 326 C 196 342 128 352 100 400 C 74 446 110 478 170 478 Z';

  // sector order along the lap (fractions of lap length)
  var SECTORS = [
    { key: 'fsae',  label: 'S1 · Formula SAE',      cls: 's1', from: 0.04, to: 0.36, ids: ['cooling-sim', 'cooling-loop', 'drivetrain', 'planet-shafts'] },
    { key: 'aero',  label: 'S2 · Aerospace / UAS',  cls: 's2', from: 0.42, to: 0.66, ids: ['maple-structures', 'nose-gear', 'arming-housing'] },
    { key: 'other', label: 'S3 · Hackathons & more', cls: 's3', from: 0.70, to: 0.90, ids: ['red-lamp', 'face-tracking-robot', 'pg-marketing'] }
  ];

  var gp = {
    built: false, active: false, running: false, started: false,
    s: 0, v: 0, L: 1, lap: 0, lapStart: 0, best: null,
    keys: {}, auto: null, drsUntil: 0, drsReadyAt: 0,
    boards: [], near: null, visited: {}, trail: [], lastT: 0,
    lightsPhase: 'idle', lightsOutAt: 0
  };
  var saved = load('ry-gp', { visited: {}, best: null });
  gp.visited = saved.visited || {};
  gp.best = saved.best || null;
  function persist() { save('ry-gp', { visited: gp.visited, best: gp.best }); }

  var path, svg, car;

  function fmtTime(ms) {
    if (ms == null) return '—';
    var m = Math.floor(ms / 60000), s = (ms % 60000) / 1000;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(3);
  }

  function ptAt(s) {
    var L = gp.L;
    s = ((s % L) + L) % L;
    return path.getPointAtLength(s);
  }

  function buildTrack() {
    if (gp.built || typeof PROJECTS === 'undefined') return;
    svg = $('raceSvg'); car = $('raceCar'); path = $('trackPath');
    if (!svg || !path) return;
    ['trackPath', 'trackAsphalt', 'trackCenter'].forEach(function (id) { $(id).setAttribute('d', TRACK_D); });
    gp.L = path.getTotalLength();

    // sector colour bands along the track edge
    var sg = $('raceSectors');
    SECTORS.forEach(function (sec) {
      var a = sec.from - 0.03, b = sec.to + 0.03, pts = [];
      for (var t = a; t <= b; t += 0.004) { var p = ptAt(t * gp.L); pts.push(p.x.toFixed(1) + ' ' + p.y.toFixed(1)); }
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', 'M' + pts.join(' L'));
      el.setAttribute('class', 'sector-band ' + sec.cls);
      sg.appendChild(el);
    });

    // start / finish line
    var p0 = ptAt(0), p1 = ptAt(2);
    var ang0 = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    $('raceStartLine').innerHTML =
      '<g transform="translate(' + p0.x + ',' + p0.y + ') rotate(' + ang0 + ')">' +
      '<rect x="-4" y="-22" width="8" height="44" class="start-check"/>' +
      '<text x="-10" y="40" class="start-label" text-anchor="end">START / FINISH</text></g>';

    // pit boards
    var cx = 520, cy = 280, n = 0;
    var boardsG = $('raceBoards');
    var listHtml = '';
    SECTORS.forEach(function (sec) {
      sec.ids.forEach(function (id, i) {
        var proj = PROJECTS[id];
        if (!proj) return;
        n++;
        var frac = sec.ids.length === 1 ? (sec.from + sec.to) / 2 : sec.from + (sec.to - sec.from) * (i / (sec.ids.length - 1));
        var s = frac * gp.L;
        var p = ptAt(s);
        // place the label off the track along the normal, on the side away from the infield;
        // if that falls off the canvas, use the other side
        var q = ptAt(s + 2), tx = q.x - p.x, ty = q.y - p.y, tl = Math.sqrt(tx * tx + ty * ty) || 1;
        var nx = -ty / tl, ny = tx / tl;
        if (nx * (p.x - cx) + ny * (p.y - cy) < 0) { nx = -nx; ny = -ny; }
        var OFF = 54;
        var lx = p.x + nx * OFF, ly = p.y + ny * OFF;
        if (lx < 66 || lx > 934 || ly < 18 || ly > 542) { lx = p.x - nx * (OFF + 22); ly = p.y - ny * (OFF + 22); }
        lx = Math.max(66, Math.min(934, lx)); ly = Math.max(18, Math.min(542, ly));
        var short = proj.title.replace(/^UT26 (MAPLE — )?/, '').replace(/ —.*$/, '').replace(' System Simulation', ' Sim');
        if (short.length > 22) short = short.slice(0, 21) + '…';
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'pit ' + sec.cls);
        g.setAttribute('data-id', id);
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'Drive to ' + proj.title);
        g.innerHTML =
          '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + lx + '" y2="' + ly + '" class="pit-stem"/>' +
          '<circle cx="' + p.x + '" cy="' + p.y + '" r="9" class="pit-dot"/>' +
          '<text x="' + p.x + '" y="' + p.y + '" class="pit-num" text-anchor="middle" dominant-baseline="central">' + n + '</text>' +
          '<g class="pit-label" transform="translate(' + lx + ',' + ly + ')">' +
          '<rect x="-62" y="-12" width="124" height="24" rx="12"/>' +
          '<text x="0" y="4" text-anchor="middle">' + short + '</text></g>';
        g.addEventListener('click', function () { autopilotTo(id); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); autopilotTo(id); } });
        boardsG.appendChild(g);
        gp.boards.push({ id: id, s: s, num: n, sector: sec, el: g });
        listHtml += '<button class="pit-chip ' + sec.cls + '" data-id="' + id + '"><span>' + n + '</span>' + proj.title + '</button>';
      });
    });
    $('racePitList').innerHTML = listHtml;
    $('racePitList').querySelectorAll('.pit-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        autopilotTo(b.getAttribute('data-id'));
        $('raceStage').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });

    // controls
    function hold(btn, key) {
      if (!btn) return;
      var on = function (e) { e.preventDefault(); gp.keys[key] = true; startLights(); };
      var off = function () { gp.keys[key] = false; };
      btn.addEventListener('pointerdown', on);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, off); });
    }
    hold($('rtGo'), 'up'); hold($('rtBrake'), 'down');
    if ($('rtDrs')) $('rtDrs').addEventListener('click', drs);
    $('raceLights').addEventListener('click', startLights);
    $('rcOpen').addEventListener('click', openNear);
    $('rfClose').addEventListener('click', function () { $('raceFlag').hidden = true; });

    gp.built = true;
    updateBoards();
    placeCar();
    updateHud();
  }

  function updateBoards() {
    gp.boards.forEach(function (b) { b.el.classList.toggle('visited', !!gp.visited[b.id]); });
    document.querySelectorAll('.pit-chip').forEach(function (c) { c.classList.toggle('visited', !!gp.visited[c.getAttribute('data-id')]); });
  }

  function setLivery(gold) {
    var c = $('raceCar');
    if (c) c.classList.toggle('gold', !!gold);
    save('ry-livery', !!gold);
  }
  setLivery(load('ry-livery', false));

  function placeCar() {
    var p = ptAt(gp.s), q = ptAt(gp.s + 3);
    var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
    car.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ',' + p.y.toFixed(2) + ') rotate(' + ang.toFixed(1) + ')');
    // trail
    gp.trail.push(p.x.toFixed(1) + ' ' + p.y.toFixed(1));
    if (gp.trail.length > 28) gp.trail.shift();
    $('trackTrail').setAttribute('d', gp.trail.length > 1 && gp.v > 30 ? 'M' + gp.trail.join(' L') : '');
  }

  function updateHud(now) {
    $('hudLap').textContent = gp.lap;
    $('hudTime').textContent = gp.started && gp.lightsPhase === 'go' ? fmtTime((now || performance.now()) - gp.lapStart) : '0:00.000';
    $('hudBest').textContent = fmtTime(gp.best);
    $('hudSpeed').textContent = Math.round(Math.abs(gp.v) * 0.42);
    $('hudFound').textContent = Object.keys(gp.visited).length + ' / ' + gp.boards.length;
    var t = now || performance.now();
    var drsEl = $('hudDrs');
    if (t < gp.drsUntil) { drsEl.className = 'hud-cell hud-drs on'; drsEl.querySelector('b').textContent = 'OPEN'; }
    else if (t < gp.drsReadyAt) { drsEl.className = 'hud-cell hud-drs wait'; drsEl.querySelector('b').textContent = ((gp.drsReadyAt - t) / 1000).toFixed(1) + 's'; }
    else { drsEl.className = 'hud-cell hud-drs'; drsEl.querySelector('b').textContent = 'READY'; }
  }

  /* ---- start lights: five reds, then lights out ---- */
  function startLights() {
    if (gp.lightsPhase !== 'idle') return;
    gp.lightsPhase = 'counting';
    unlock('lights');
    var lamps = $('raceLights').querySelectorAll('.rl-row i');
    $('rlMsg').textContent = 'Wait for lights out…';
    var i = 0;
    var step = reduceMotion ? 150 : 600;
    var iv = setInterval(function () {
      if (i < lamps.length) { lamps[i].classList.add('on'); i++; return; }
      clearInterval(iv);
      setTimeout(function () {
        lamps.forEach(function (l) { l.classList.remove('on'); });
        gp.lightsPhase = 'go';
        gp.lightsOutAt = performance.now();
        gp.lapStart = performance.now();
        gp.started = true;
        $('rlMsg').innerHTML = '<b>GO GO GO!</b>';
        gp.awaitReaction = true;
        setTimeout(function () { $('raceLights').classList.add('gone'); }, 500);
      }, 400 + Math.random() * 1200);
    }, step);
  }

  function drs() {
    if (gp.lightsPhase !== 'go') { startLights(); return; }
    var t = performance.now();
    if (t < gp.drsReadyAt) return;
    gp.drsUntil = t + 1800;
    gp.drsReadyAt = t + 6000;
    unlock('drs');
  }

  function autopilotTo(id) {
    var b = gp.boards.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    if (gp.lightsPhase === 'idle') startLights();
    gp.auto = b;
  }

  function openNear() {
    if (gp.near) openProjectDetail(gp.near.id);
  }

  function showCard(b) {
    var card = $('raceCard');
    if (!b) { card.hidden = true; return; }
    var p = PROJECTS[b.id];
    $('rcSector').textContent = b.sector.label;
    $('rcSector').className = 'rc-sector ' + b.sector.cls;
    $('rcNum').textContent = String(b.num).padStart(2, '0') + ' / ' + gp.boards.length;
    $('rcTitle').textContent = p.title;
    $('rcOrg').textContent = p.org + ' · ' + p.date;
    $('rcMetrics').innerHTML = (p.metrics || []).map(function (m) { return '<span class="cm"><b>' + m.v + '</b><i>' + m.l + '</i></span>'; }).join('');
    card.hidden = false;
  }

  /* ---- physics loop ---- */
  var ACC = 260, BRAKE = 520, VMAX = 300, VMAX_DRS = 430, DRAG = 0.55;
  function tick(t) {
    if (!gp.running) return;
    var dt = gp.lastT ? Math.min(0.05, (t - gp.lastT) / 1000) : 0;
    gp.lastT = t;

    var canDrive = gp.lightsPhase === 'go';
    var up = gp.keys.up, down = gp.keys.down;
    if (up || down) gp.auto = null;

    // autopilot: accelerate toward target pit board, brake to stop on it
    if (canDrive && gp.auto) {
      var dist = gp.auto.s - gp.s;
      while (dist < 0) dist += gp.L;
      if (dist < 4 && Math.abs(gp.v) < 25) { gp.v = 0; gp.auto = null; }
      else {
        var stopDist = (gp.v * gp.v) / (2 * BRAKE) + 6;
        if (dist <= stopDist) down = true; else up = true;
      }
    }

    if (canDrive) {
      if (gp.awaitReaction && (up || down || gp.auto)) {
        gp.awaitReaction = false;
        var rt = (t - gp.lightsOutAt) / 1000;
        if (up && rt < 0.30) unlock('react');
        $('rlMsg').innerHTML = 'Reaction: <b>' + rt.toFixed(3) + ' s</b>';
      }
      var vmax = t < gp.drsUntil ? VMAX_DRS : VMAX;
      if (up) gp.v += ACC * (t < gp.drsUntil ? 1.6 : 1) * dt;
      if (down) gp.v -= BRAKE * dt;
      gp.v -= gp.v * DRAG * dt * (up ? 0.3 : 1);
      if (gp.v > vmax) gp.v = Math.max(vmax, gp.v - BRAKE * dt);
      if (gp.v < -60) gp.v = -60;
      if (!up && !down && Math.abs(gp.v) < 4) gp.v = 0;
    }

    var prevS = gp.s;
    gp.s += gp.v * dt;
    // lap detection: crossing the start line forwards
    if (gp.s >= gp.L) {
      gp.s -= gp.L;
      if (gp.started) {
        var lapMs = t - gp.lapStart;
        gp.lap++;
        if (gp.best == null || lapMs < gp.best) { gp.best = Math.round(lapMs); persist(); }
        gp.lapStart = t;
        unlock('lap');
        flashMsg(gp.lap === 1 ? 'Lap complete — ' + fmtTime(lapMs) : 'Lap ' + gp.lap + ' — ' + fmtTime(lapMs));
      }
    } else if (gp.s < 0) {
      gp.s += gp.L;
    }

    // nearest pit board
    var near = null;
    gp.boards.forEach(function (b) {
      var d = Math.abs(b.s - gp.s);
      d = Math.min(d, gp.L - d);
      if (d < 26) near = b;
    });
    if (near !== gp.near) {
      gp.near = near;
      gp.boards.forEach(function (b) { b.el.classList.toggle('near', b === near); });
      showCard(near);
      if (near && !gp.visited[near.id]) {
        gp.visited[near.id] = 1; persist(); updateBoards();
        if (Object.keys(gp.visited).length === gp.boards.length) {
          unlock('grid');
          confetti(120);
          $('raceFlag').hidden = false;
        }
      }
    }

    placeCar();
    updateHud(t);
    requestAnimationFrame(tick);
  }

  var msgTimer;
  function flashMsg(txt) {
    var m = $('rlMsg');
    $('raceLights').classList.remove('gone');
    $('raceLights').classList.add('msg-only');
    m.innerHTML = txt;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () { $('raceLights').classList.add('gone'); }, 1600);
  }

  function raceEnter() {
    buildTrack();
    if (!gp.built || gp.running) return;
    gp.active = true; gp.running = true; gp.lastT = 0;
    requestAnimationFrame(tick);
  }
  function raceLeave() {
    gp.active = false; gp.running = false;
    gp.keys = {};
  }

  // keyboard (only while the Grand Prix page is on screen and nothing modal is open)
  function raceKeysActive() {
    var page = $('page-race');
    var cmdk = $('cmdk'), ach = $('achPanel');
    return page && page.classList.contains('active') && (!cmdk || cmdk.hidden) && (!ach || ach.hidden);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAch();
    if (!raceKeysActive()) return;
    var k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { gp.keys.up = true; startLights(); e.preventDefault(); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { gp.keys.down = true; e.preventDefault(); }
    else if (k === ' ') { drs(); e.preventDefault(); }
    else if (k === 'Enter') { if (gp.near) { e.preventDefault(); openNear(); } }
  });
  document.addEventListener('keyup', function (e) {
    var k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') gp.keys.up = false;
    if (k === 'ArrowDown' || k === 's' || k === 'S') gp.keys.down = false;
  });
  window.addEventListener('blur', function () { gp.keys = {}; });

  /* ---- boot ---- */
  renderAch();
  setTimeout(function () { unlock('hello'); }, 3200);
  if ((location.hash || '').replace('#', '') === 'race') setTimeout(raceEnter, 1000);
})();
