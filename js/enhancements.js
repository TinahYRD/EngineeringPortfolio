/* ===============================================================
   ENHANCEMENTS
   - Dark mode toggle (persists per browser)
   - Command palette (Ctrl/⌘ + K or "/")
   - Terminal-style intro on the home page
   - Metric chips + CAD dimension lines on project cards
   - CAD-style cursor coordinate readout
   - Engineering Lab widgets (heat load, planetary gearbox, targets)
   All numbers used here come from projects-data.js / the resume.
   =============================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  function $(id) { return document.getElementById(id); }
  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- theme ---------- */
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('ry-theme', t); } catch (e) {}
    document.dispatchEvent(new CustomEvent('themechange'));
  }
  function toggleTheme() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    toast(next === 'dark' ? 'Dark mode on 🌙' : 'Light mode on ☀️');
  }
  var themeBtn = $('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  /* ---------- command palette ---------- */
  var EMAIL = 'ruodi.yuan@mail.utoronto.ca';
  var RESUME = 'Ruodi (Tinah) Yuan - Resume.pdf';

  function copyEmail() {
    function done() { toast('Email copied: ' + EMAIL); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, function () { location.href = 'mailto:' + EMAIL; });
    } else {
      location.href = 'mailto:' + EMAIL;
    }
  }

  function buildCommands() {
    var pages = [
      ['home', 'Home', '🏠', 'start intro'],
      ['about', 'About', '👋', 'background education'],
      ['projects', 'Projects', '🛠️', 'work portfolio'],
      ['race', 'Project Grand Prix', '🏁', 'game race drive play track'],
      ['lab', 'Engineering Lab', '🧪', 'interactive calculator gear widgets'],
      ['experience', 'Experience', '🏁', 'roles peripheral labs fsae utat'],
      ['awards', 'Awards', '🏆', 'honors hackathon'],
      ['skills', 'Skills', '⚙️', 'tools software certifications'],
      ['contact', 'Contact', '✉️', 'email hire']
    ];
    var cmds = pages.map(function (p) {
      return { group: 'Pages', icon: p[2], label: p[1], keys: p[3], run: function () { goToPage(p[0]); } };
    });
    if (typeof PROJECTS !== 'undefined') {
      PROJECTS_ORDER.forEach(function (id) {
        var p = PROJECTS[id];
        cmds.push({
          group: 'Projects', icon: '›', label: p.title, hint: p.categoryLabel,
          keys: (p.techUsed || []).join(' ') + ' ' + p.org,
          run: function () { openProjectDetail(id); }
        });
      });
    }
    cmds.push(
      { group: 'Actions', icon: '◐', label: 'Toggle dark mode', keys: 'theme light dark night', run: toggleTheme },
      { group: 'Actions', icon: '📄', label: 'Open résumé (PDF)', keys: 'resume cv pdf', run: function () { window.open(RESUME, '_blank', 'noopener'); } },
      { group: 'Actions', icon: '@', label: 'Copy email address', keys: 'mail contact ' + EMAIL, run: copyEmail },
      { group: 'Actions', icon: 'in', label: 'Open LinkedIn', keys: 'linkedin social', run: function () { window.open('https://www.linkedin.com/in/ruodiyuan', '_blank', 'noopener'); } }
    );
    return cmds;
  }

  var cmdk = $('cmdk'), cmdkInput = $('cmdkInput'), cmdkList = $('cmdkList');
  var commands = [], filtered = [], sel = 0, lastFocus = null;

  function score(c, q) {
    if (!q) return 1;
    var hay = (c.label + ' ' + (c.keys || '') + ' ' + (c.hint || '') + ' ' + c.group).toLowerCase();
    var label = c.label.toLowerCase();
    if (label.indexOf(q) === 0) return 4;
    if (label.indexOf(q) > -1) return 3;
    var words = q.split(/\s+/), all = true;
    words.forEach(function (w) { if (hay.indexOf(w) === -1) all = false; });
    if (all) return 2;
    // loose subsequence match on the label
    var i = 0;
    for (var k = 0; k < label.length && i < q.length; k++) if (label[k] === q[i]) i++;
    return i === q.length ? 1 : 0;
  }

  function renderCmdk() {
    var q = cmdkInput.value.trim().toLowerCase();
    filtered = commands
      .map(function (c, i) { return { c: c, s: score(c, q), i: i }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return q ? (b.s - a.s) || (a.i - b.i) : a.i - b.i; })
      .map(function (x) { return x.c; });
    sel = Math.min(sel, Math.max(0, filtered.length - 1));
    var html = '', group = null;
    if (!filtered.length) html = '<li class="cmdk-empty">No matches — try “drivetrain”, “lab”, or “resume”.</li>';
    filtered.forEach(function (c, i) {
      if (!q && c.group !== group) { group = c.group; html += '<li class="cmdk-group">' + group + '</li>'; }
      html += '<li class="cmdk-item' + (i === sel ? ' sel' : '') + '" role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '">' +
        '<span class="cmdk-ico">' + c.icon + '</span><span class="cmdk-label">' + c.label + '</span>' +
        (c.hint ? '<span class="cmdk-hint">' + c.hint + '</span>' : '') + '</li>';
    });
    cmdkList.innerHTML = html;
    var cur = cmdkList.querySelector('.sel');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  function openCmdk() {
    if (!cmdk) return;
    if (!commands.length) commands = buildCommands();
    lastFocus = document.activeElement;
    cmdk.hidden = false;
    requestAnimationFrame(function () { cmdk.classList.add('open'); });
    cmdkInput.value = '';
    sel = 0;
    renderCmdk();
    setTimeout(function () { cmdkInput.focus(); }, 30);
  }
  function closeCmdk() {
    if (!cmdk || cmdk.hidden) return;
    cmdk.classList.remove('open');
    setTimeout(function () { cmdk.hidden = true; }, 160);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function runSel(i) {
    var c = filtered[i];
    if (!c) return;
    closeCmdk();
    setTimeout(c.run, 120);
  }

  if (cmdk) {
    $('cmdkOpenBtn').addEventListener('click', openCmdk);
    cmdk.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeCmdk();
      var item = e.target.closest('.cmdk-item');
      if (item) runSel(+item.getAttribute('data-i'));
    });
    cmdkList.addEventListener('mousemove', function (e) {
      var item = e.target.closest('.cmdk-item');
      if (!item) return;
      var i = +item.getAttribute('data-i');
      if (i !== sel) { sel = i; renderCmdk(); }
    });
    cmdkInput.addEventListener('input', function () { sel = 0; renderCmdk(); });
    cmdkInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, filtered.length); renderCmdk(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(1, filtered.length); renderCmdk(); }
      else if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
    });
    // show the right shortcut glyph
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    var kbd = document.querySelector('.cmdk-kbd');
    if (kbd && !isMac) kbd.textContent = 'Ctrl K';
  }

  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (document.activeElement && document.activeElement.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (cmdk && !cmdk.hidden) closeCmdk(); else openCmdk();
    } else if (e.key === '/' && !typing && cmdk && cmdk.hidden) {
      e.preventDefault(); openCmdk();
    } else if (e.key === 'Escape') {
      if (cmdk && !cmdk.hidden) closeCmdk();
      else if ($('lightbox') && $('lightbox').style.display === 'flex' && typeof closeLightbox === 'function') closeLightbox();
    }
  });

  /* ---------- terminal intro ---------- */
  var TERM = [
    ['$ ', 'whoami'],
    ['', 'ruodi (tinah) yuan — mechanical engineering @ uoft'],
    ['$ ', 'cat roles.txt'],
    ['', '• mech eng intern, capture systems  @ peripheral labs'],
    ['', '• vehicle dynamics lead             @ uoft formula sae'],
    ['', '• payload specialist                @ uoft aerospace team'],
    ['$ ', 'status --internships'],
    ['', 'open · may 2028 → sept 2029 ▮']
  ];
  var termDone = false;
  function runTerminal() {
    var body = $('termBody');
    if (!body || termDone) return;
    termDone = true;
    function lineHtml(l) {
      return l[0] ? '<span class="t-prompt">' + l[0] + '</span><span class="t-cmd">' + l[1] + '</span>' : '<span class="t-out">' + l[1] + '</span>';
    }
    if (reduceMotion) { body.innerHTML = TERM.map(lineHtml).join('\n'); return; }
    var li = 0, ci = 0, out = [];
    (function tick() {
      if (li >= TERM.length) { body.innerHTML = out.join('\n'); return; }
      var l = TERM[li];
      if (!l[0]) { out.push(lineHtml(l)); li++; body.innerHTML = out.join('\n'); setTimeout(tick, 140); return; }
      ci++;
      var partial = [l[0], l[1].slice(0, ci)];
      body.innerHTML = out.concat(lineHtml(partial) + '<span class="t-caret">▮</span>').join('\n');
      if (ci >= l[1].length) { out.push(lineHtml(l)); li++; ci = 0; setTimeout(tick, 260); }
      else setTimeout(tick, 38 + Math.random() * 40);
    })();
  }

  /* ---------- card metric chips + dimension lines ---------- */
  function decorateCards() {
    if (typeof PROJECTS === 'undefined') return;
    document.querySelectorAll('#projectsGrid .card[data-project-id]').forEach(function (card) {
      var p = PROJECTS[card.getAttribute('data-project-id')];
      if (p && p.metrics && !card.querySelector('.card-metrics')) {
        var row = document.createElement('div');
        row.className = 'card-metrics';
        row.innerHTML = p.metrics.map(function (m) {
          return '<span class="cm"><b>' + m.v + '</b><i>' + m.l + '</i></span>';
        }).join('');
        var org = card.querySelector('.card-org');
        if (org) org.insertAdjacentElement('afterend', row);
      }
      var media = card.querySelector('.card-media');
      if (media && !media.querySelector('.card-dim')) {
        var dim = document.createElement('div');
        dim.className = 'card-dim';
        dim.setAttribute('aria-hidden', 'true');
        dim.innerHTML = '<span></span>';
        media.appendChild(dim);
        card.addEventListener('mouseenter', function () {
          var w = media.getBoundingClientRect().width;
          // treat 1 CSS px as 0.2645 mm (96 dpi) for the fun of it
          dim.querySelector('span').textContent = (w * 0.2645).toFixed(1) + ' mm';
        });
      }
    });
  }

  /* ---------- CAD cursor readout ---------- */
  var readout = $('cadReadout');
  if (readout && window.matchMedia && matchMedia('(pointer: fine)').matches) {
    var rx = $('cadX'), ry = $('cadY'), raf = null, mx = 0, my = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        rx.textContent = (mx * 0.2645).toFixed(1);
        ry.textContent = ((window.innerHeight - my) * 0.2645).toFixed(1);
        readout.classList.add('on');
      });
    });
    document.addEventListener('mouseleave', function () { readout.classList.remove('on'); });
  }

  /* ================= LAB ================= */

  /* --- Fig 01: heat load --- */
  var ETA = { min: 86.09, mean: 95.84, max: 97.97 };
  var TARGET_KW = 5.5, SCALE_KW = 10;
  function updateHeat() {
    var pin = parseFloat($('heatPin').value);
    var eta = parseFloat($('heatEta').value);
    var loss = pin * (1 - eta / 100);
    $('heatPinVal').textContent = pin.toFixed(1) + ' kW';
    $('heatEtaVal').textContent = eta.toFixed(2) + ' %';
    $('heatLoss').textContent = loss.toFixed(2);
    var pct = Math.min(100, (loss / SCALE_KW) * 100);
    var fill = $('heatFill');
    fill.style.width = pct + '%';
    fill.classList.toggle('over', loss > TARGET_KW);
    var note;
    if (loss > TARGET_KW) note = 'Above the 5.5 kW average design point.';
    else if (loss > TARGET_KW * 0.8) note = 'Close to the 5.5 kW design point.';
    else note = 'Comfortably under the 5.5 kW design point.';
    note += ' Every 1 % drop in η at ' + pin.toFixed(0) + ' kW adds ' + (pin * 0.01).toFixed(2) + ' kW of heat.';
    $('heatNote').textContent = note;
    document.querySelectorAll('#labHeat .lab-presets button').forEach(function (b) {
      b.classList.toggle('on', Math.abs(parseFloat(b.getAttribute('data-eta')) - eta) < 0.005);
    });
  }
  if ($('labHeat')) {
    $('heatPin').addEventListener('input', updateHeat);
    $('heatEta').addEventListener('input', updateHeat);
    document.querySelectorAll('#labHeat .lab-presets button').forEach(function (b) {
      b.addEventListener('click', function () { $('heatEta').value = b.getAttribute('data-eta'); updateHeat(); });
    });
    updateHeat();
  }

  /* --- Fig 02: planetary gearbox --- */
  var RATIO = 11.97;
  var gear = { sun: 0, carrier: 0, last: 0, running: false };
  function fmt(n, d) { return n.toLocaleString(undefined, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function updateGearText() {
    var rin = parseFloat($('gearIn').value), tq = parseFloat($('gearTq').value);
    $('gearInVal').textContent = fmt(rin) + ' rpm';
    $('gearTqVal').textContent = fmt(tq, 1) + ' N·m';
    $('gearOut').textContent = fmt(rin / RATIO) + ' rpm';
    $('gearTqOut').textContent = fmt(tq * RATIO, 1) + ' N·m';
  }
  function drawGear(ctx, cx, cy, r, teeth, ang, fill, stroke, inner) {
    var depth = Math.max(3, r * 0.09);
    ctx.beginPath();
    for (var i = 0; i < teeth * 2; i++) {
      var a = ang + (i / (teeth * 2)) * Math.PI * 2;
      var rr = inner ? (i % 2 ? r + depth : r) : (i % 2 ? r - depth : r);
      var a2 = a + (Math.PI * 2) / (teeth * 2);
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      ctx.lineTo(cx + Math.cos(a2) * rr, cy + Math.sin(a2) * rr);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.4; ctx.stroke();
  }
  function renderGear() {
    var cv = $('gearCanvas');
    if (!cv) return;
    var dpr = window.devicePixelRatio || 1;
    var size = cv.clientWidth || 420;
    if (cv.width !== Math.round(size * dpr)) { cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr); }
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    var c = size / 2, R = size * 0.45;
    var rose = cssVar('--rose'), lav = cssVar('--lavender'), sage = cssVar('--sage'), ink = cssVar('--ink-light'), surf = cssVar('--white');
    // ring (stationary)
    ctx.beginPath(); ctx.arc(c, c, R + 10, 0, Math.PI * 2); ctx.fillStyle = cssVar('--cream2'); ctx.fill();
    drawGear(ctx, c, c, R * 0.93, 72, 0, surf, ink, true);
    // carrier arms
    var orbit = R * 0.55, pr = R * 0.34, ps = R * 0.17, sr = R * 0.22;
    ctx.save(); ctx.strokeStyle = sage; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = 0.55;
    for (var k = 0; k < 3; k++) {
      var a = gear.carrier + k * (Math.PI * 2 / 3);
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(a) * orbit, c + Math.sin(a) * orbit); ctx.stroke();
    }
    ctx.restore();
    // stepped planets (large + small step drawn concentric)
    var spin = -(gear.sun - gear.carrier) * (sr / pr);
    for (var j = 0; j < 3; j++) {
      var b = gear.carrier + j * (Math.PI * 2 / 3);
      var px = c + Math.cos(b) * orbit, py = c + Math.sin(b) * orbit;
      drawGear(ctx, px, py, pr * 0.62, 24, spin, cssVar('--lavender-light'), lav);
      drawGear(ctx, px, py, pr * 0.34, 12, spin, lav, lav);
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fillStyle = surf; ctx.fill();
    }
    // sun
    drawGear(ctx, c, c, sr, 18, gear.sun, cssVar('--rose-light'), rose);
    ctx.beginPath(); ctx.arc(c, c, sr * 0.35, 0, Math.PI * 2); ctx.fillStyle = rose; ctx.fill();
    // labels
    ctx.font = '600 11px "DM Mono", monospace'; ctx.fillStyle = ink; ctx.textAlign = 'center';
    ctx.fillText('INPUT', c, c + sr + 16);
    ctx.fillStyle = sage; ctx.fillText('OUTPUT', c, size - 8);
  }
  function gearLoop(t) {
    if (!gear.running) return;
    var dt = gear.last ? Math.min(0.05, (t - gear.last) / 1000) : 0;
    gear.last = t;
    var rin = parseFloat($('gearIn').value);
    // visual speed: 6000 rpm → ~0.6 rev/s on screen (scaled down so it's watchable)
    var w = (rin / 6000) * Math.PI * 1.2;
    gear.sun += w * dt;
    gear.carrier += (w / RATIO) * dt;
    renderGear();
    requestAnimationFrame(gearLoop);
  }
  function startGear() {
    if (!$('gearCanvas') || gear.running) return;
    if (reduceMotion) { renderGear(); return; }
    gear.running = true; gear.last = 0;
    requestAnimationFrame(gearLoop);
  }
  function stopGear() { gear.running = false; }
  if ($('labGear')) {
    $('gearIn').addEventListener('input', updateGearText);
    $('gearTq').addEventListener('input', updateGearText);
    updateGearText();
    renderGear();
    document.addEventListener('themechange', renderGear);
    window.addEventListener('resize', renderGear);
  }

  /* --- Fig 03: targets vs achieved --- */
  var TARGETS = [
    { kind: 'TARGET', name: 'Drivetrain corner mass', proj: 'drivetrain', unit: 'kg', target: 40, actual: 22.304, better: 'lower',
      note: 'Unsprung mass vs < 40 kg corner target' },
    { kind: 'TARGET', name: 'Corner mass moment of inertia', proj: 'drivetrain', unit: 'kg·m²', target: 0.25, actual: 0.197, better: 'lower',
      note: 'Achieved vs < 0.25 kg·m² target' },
    { kind: 'BEFORE → AFTER', name: 'Weight — gearbox webbing optimization', proj: 'planet-shafts', unit: 'g', target: 830.7, actual: 711.49, better: 'lower',
      note: '830.7 g → 711.49 g (−14%), 580 h predicted gearbox fatigue life', ref: 'before' },
    { kind: 'MARGIN', name: 'Inboard motor mount — stress utilization', proj: 'drivetrain', unit: '', sf: 15, stress: '9.24 MPa', strict: true,
      note: 'σ / σ<sub>allow</sub> = 1 / SF; SF > 15 at 9.24 MPa max von Mises' },
    { kind: 'MARGIN', name: 'Planet shaft — stress utilization', proj: 'planet-shafts', unit: '', sf: 15, stress: '77.99 MPa',
      note: 'Minimum SF 15 at 77.99 MPa max von Mises under peak stage torque' }
  ];
  function renderTargets() {
    var list = $('tgtList');
    if (!list) return;
    list.innerHTML = TARGETS.map(function (t) {
      var pct, label, delta;
      if (t.sf) {
        pct = 100 / t.sf;
        label = (t.strict ? '< ' : '≤ ') + pct.toFixed(1) + '%';
        delta = 'SF ' + (t.strict ? '> ' : '≥ ') + t.sf + ' · ' + t.stress;
      } else {
        pct = (t.actual / t.target) * 100;
        label = t.actual + ' ' + t.unit;
        var d = (1 - t.actual / t.target) * 100;
        delta = (t.ref === 'before' ? '−' + d.toFixed(1) + '% vs before' : d.toFixed(0) + '% under target');
      }
      return '<button class="tgt" data-proj="' + t.proj + '">' +
        '<div class="tgt-top"><span class="tgt-kind">' + t.kind + '</span><span class="tgt-name">' + t.name + '</span><span class="tgt-delta">' + delta + '</span></div>' +
        '<div class="tgt-bar"><div class="tgt-fill" style="--w:' + pct.toFixed(2) + '%"></div>' +
        (t.sf ? '' : '<div class="tgt-limit"><span>' + (t.ref === 'before' ? 'before ' : 'target ') + t.target + ' ' + t.unit + '</span></div>') +
        '<span class="tgt-val">' + label + '</span></div>' +
        '<p class="tgt-note">' + t.note + '</p></button>';
    }).join('');
    list.querySelectorAll('.tgt').forEach(function (b) {
      b.addEventListener('click', function () { openProjectDetail(b.getAttribute('data-proj')); });
    });
  }
  renderTargets();

  /* ---------- hook into page navigation ---------- */
  var prevGo = window.goToPage;
  window.goToPage = goToPage = function (name, skipHash) {
    prevGo(name, skipHash);
    if (name === 'home') setTimeout(runTerminal, 700);
    if (name === 'lab') {
      startGear();
      var tl = $('tgtList');
      if (tl) { tl.classList.remove('go'); setTimeout(function () { tl.classList.add('go'); }, 450); }
    } else {
      stopGear();
    }
  };

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', decorateCards);
  if (document.readyState !== 'loading') decorateCards();
})();
