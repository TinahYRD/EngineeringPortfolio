/* ===== LOADER ===== */
window.addEventListener('load', function () {
  setTimeout(function () {
    document.getElementById('loader').classList.add('hidden');
    var mascot = document.getElementById('mascot');
    if (mascot) mascot.classList.add('visible');
  }, 900);
});

/* ===== PAGE NAVIGATION — directional transitions ===== */
function goToPage(name, skipHash) {
  var target = document.getElementById('page-' + name);
  if (!target) return;
  var current = document.querySelector('.page.active');

  if (current && current !== target) {
    var leaveDir = current.getAttribute('data-leave') || 'up';
    current.setAttribute('data-enter', leaveDir); // will snap to leave position after removal
    current.classList.add('leaving');
    current.classList.remove('active');
    setTimeout(function () {
      current.classList.remove('leaving');
      // restore original enter direction
      current.setAttribute('data-enter', ['home','project-detail'].indexOf(current.getAttribute('data-page')) >= 0 ? 'scale' :
        ['projects','awards','contact'].indexOf(current.getAttribute('data-page')) >= 0 ? 'left' : 'right');
    }, 420);
  }

  target.scrollTop = 0;
  target.classList.remove('reveal');
  // ensure enter transform is set before active
  var enterDir = target.getAttribute('data-enter') || 'up';
  target.style.transform = enterDir === 'left' ? 'translateX(48px)' :
                            enterDir === 'right' ? 'translateX(-48px)' :
                            enterDir === 'down' ? 'translateY(-36px)' :
                            enterDir === 'scale' ? 'scale(0.96) translateY(16px)' : 'translateY(36px)';
  target.classList.add('active');
  void target.offsetWidth;
  target.style.transform = '';
  setTimeout(function () { target.classList.add('reveal'); }, 60);

  document.querySelectorAll('.nav-link').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-page') === name);
  });
  if (!skipHash) history.replaceState(null, '', '#' + name);
  closeBurger();
}

function toggleBurger() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('navBurger').classList.toggle('open');
}
function closeBurger() {
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('navBurger').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function () {
  var initial = (location.hash || '#home').replace('#', '');
  var valid = ['home','projects','experience','awards','skills','about','contact'];
  // Support deep links like #project-cooling-sim straight into a project detail page
  if (initial.indexOf('project-') === 0 && typeof PROJECTS !== 'undefined') {
    var pid = initial.replace('project-', '');
    if (PROJECTS[pid]) {
      setTimeout(function () { openProjectDetail(pid, true); }, 950);
      return;
    }
  }
  if (valid.indexOf(initial) === -1) initial = 'home';
  // Slight delay so loader sits on top first, then reveal animates in
  setTimeout(function () { goToPage(initial, true); }, 950);
});

/* ===== PROJECT FILTERING ===== */
document.querySelectorAll('.filter-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    var f = tab.getAttribute('data-filter');
    var label = tab.textContent.trim();
    var grid = document.getElementById('projectsGrid');
    grid.classList.add('filtering');
    setTimeout(function () {
      var count = 0;
      document.querySelectorAll('#projectsGrid .card').forEach(function (card) {
        var cat = card.getAttribute('data-category');
        var show = (f === 'all' || cat === f || cat === 'all');
        card.style.display = show ? '' : 'none';
        if (show) count++;
      });
      var el = document.getElementById('visibleCount');
      if (el) { el.textContent = count; }
      var rl = document.getElementById('projectRowLabel');
      if (rl) rl.innerHTML = label + ' <span class="prl-count" id="visibleCount">' + count + '</span>';
      grid.classList.remove('filtering');
      // re-stamp numbers for visible cards
      stampCardNumbers();
    }, 250);
  });
});

/* ===== STAMP CARD NUMBERS & OVERLAYS ===== */
function stampCardNumbers() {
  var n = 1;
  document.querySelectorAll('#projectsGrid .card').forEach(function (card) {
    if (card.style.display === 'none') return;
    // number badge
    var existing = card.querySelector('.card-number');
    if (existing) existing.remove();
    var badge = document.createElement('div');
    badge.className = 'card-number';
    badge.textContent = String(n).padStart(2,'0');
    card.appendChild(badge);
    // hover overlay
    if (!card.querySelector('.card-overlay')) {
      var ov = document.createElement('div');
      ov.className = 'card-overlay';
      ov.innerHTML = '<span class="card-overlay-text">Click image to expand</span>';
      card.appendChild(ov);
    }
    n++;
  });
}
// Run on first load after cards are in DOM
setTimeout(stampCardNumbers, 1100);



/* ===== EXPAND / CAROUSEL / LIGHTBOX ===== */
function toggleExpand(btn) {
  var panel = btn.closest('.card-body').nextElementSibling;
  var isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
}

function initCarousel(el) {
  var track = el.querySelector('.media-track');
  var slides = track.querySelectorAll('.media-slide');
  var prevBtn = el.querySelector('.media-nav.prev');
  var nextBtn = el.querySelector('.media-nav.next');
  var dotsEl = el.querySelector('.media-dots');
  var countEl = el.querySelector('.media-count');
  var total = slides.length;
  var cur = 0;

  if (total <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    countEl.style.display = 'none';
    return;
  }

  for (var i = 0; i < total; i++) {
    var d = document.createElement('div');
    d.className = 'media-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('data-i', i);
    d.addEventListener('click', (function (idx) { return function () { go(idx); }; })(i));
    dotsEl.appendChild(d);
  }

  function update() {
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dotsEl.querySelectorAll('.media-dot').forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    prevBtn.classList.toggle('hidden', cur === 0);
    nextBtn.classList.toggle('hidden', cur === total - 1);
    countEl.textContent = (cur + 1) + ' / ' + total;
  }
  function go(n) { cur = Math.max(0, Math.min(total - 1, n)); update(); }
  prevBtn.addEventListener('click', function () { go(cur - 1); });
  nextBtn.addEventListener('click', function () { go(cur + 1); });
  update();
}

let currentGallery = [];
let currentIndex = 0;

function openLightbox(el) {
  const carousel = el.closest('[data-carousel]');
  const items = carousel.querySelectorAll('.media-slide');

  currentGallery = Array.from(items).map(slide => {
    const img = slide.querySelector('img');
    const video = slide.querySelector('video');
    if (video) {
      return { type: 'video', src: video.querySelector('source')?.src || video.src };
    }
    return { type: 'image', src: img?.src };
  });

  currentIndex = Array.from(items).indexOf(el.closest('.media-slide'));
  renderLightbox();
  document.getElementById('lightbox').style.display = 'flex';
}

function renderLightbox() {
  const container = document.getElementById('lightbox-content');
  container.innerHTML = '';
  const item = currentGallery[currentIndex];
  if (!item || !item.src) return;
  if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.src;
    video.controls = true;
    video.autoplay = true;
    container.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    container.appendChild(img);
  }
}

function nextImage() {
  currentIndex = (currentIndex + 1) % currentGallery.length;
  renderLightbox();
}
function prevImage() {
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  renderLightbox();
}
function closeLightbox() {
  const container = document.getElementById('lightbox-content');
  const video = container.querySelector('video');
  if (video) { video.pause(); video.currentTime = 0; }
  document.getElementById('lightbox').style.display = 'none';
  container.innerHTML = '';
}

document.querySelectorAll('.media-slide').forEach(slide => {
  if (slide.querySelector('img') || slide.querySelector('video')) {
    slide.addEventListener('click', () => openLightbox(slide));
  }
});
document.querySelector('.lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); nextImage(); });
document.querySelector('.lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); prevImage(); });
document.querySelectorAll('[data-carousel]').forEach(initCarousel);
/* ===== CURSOR SPARKLES ===== */
var sparkleColors = ['#C8748A','#9B8FC2','#7A9E8E','#E0A3AD','#C5BCDF'];
document.addEventListener('mousemove', function (e) {
  if (Math.random() > 0.18) return;
  var el = document.createElement('div');
  el.className = 'sparkle';
  el.style.left = e.clientX + (Math.random() * 14 - 7) + 'px';
  el.style.top  = e.clientY + (Math.random() * 14 - 7) + 'px';
  el.style.background = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
  var s = 5 + Math.random() * 7;
  el.style.width = s + 'px';
  el.style.height = s + 'px';
  document.body.appendChild(el);
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 750);
});

/* ===== SCROLL PROGRESS ===== */
document.querySelectorAll('.page').forEach(function (page) {
  page.addEventListener('scroll', function () {
    if (!page.classList.contains('active')) return;
    var scrolled = page.scrollTop;
    var max = page.scrollHeight - page.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    document.getElementById('scrollProgress').style.width = pct + '%';
  });
});

/* ===== COUNT-UP ANIMATION ===== */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || "";
    var current = 0;
    var step = Math.max(1, Math.ceil(target / 20));

    var timer = setInterval(function () {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;

      if (current >= target) clearInterval(timer);
    }, 45);
  });
}
// fire once when home page first reveals
var countersFired = false;
var origGoToPage = goToPage;
goToPage = function (name, skipHash) {
  origGoToPage(name, skipHash);
  if (name === 'home' && !countersFired) {
    countersFired = true;
    setTimeout(animateCounters, 600);
  }
};


/* ===== CARD SLIDE-IN on scroll within project page ===== */
var cardObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.card, .award-card, .skill-card, .timeline-card, .contact-card').forEach(function (card) {
  card.style.opacity = '0';
  card.style.transform = 'translateY(28px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.25s, border-color 0.25s';
  cardObserver.observe(card);
});
(function() {
  var origGo = goToPage;
  goToPage = function(name, skipHash) {
    origGo(name, skipHash);
    document.querySelectorAll('.npd-dot').forEach(function(d) {
      d.classList.toggle('active', d.getAttribute('data-page') === name);
    });
  };
})();

/* ── scroll-to-top button visibility ── */
function scrollCurrentPageTop() {
  var active = document.querySelector('.page.active');
  if (active) active.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.page').forEach(function(page) {
  page.addEventListener('scroll', function() {
    var btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    if (page.classList.contains('active') && page.scrollTop > 320) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
});

/* ── 3-D card tilt on mouse move ── */
document.querySelectorAll('.card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var rect = card.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = (e.clientX - cx) / (rect.width / 2);
    var dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = 'perspective(700px) rotateY(' + (dx * 4) + 'deg) rotateX(' + (-dy * 3) + 'deg) translateY(-2px)';
    card.classList.remove('tilt-transition');
  });
  card.addEventListener('mouseleave', function() {
    card.classList.add('tilt-transition');
    card.style.transform = '';
    setTimeout(function() { card.classList.remove('tilt-transition'); }, 420);
  });
});

/* ── stat card underline on scroll into view ── */
var statObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('in-view'); statObserver.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat').forEach(function(s) { statObserver.observe(s); });

/* ── trophy card ring reveal ── */
var trophyObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('revealed'); trophyObserver.unobserve(e.target); }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.trophy-card').forEach(function(t) {
  /* inject ring SVG */
  var ring = document.createElement('div');
  ring.className = 'award-ring';
  ring.innerHTML = '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11.5"/></svg>';
  t.style.position = 'relative';
  t.appendChild(ring);
  trophyObserver.observe(t);
});

/* ── hero resume card entrance animation ── */
setTimeout(function() {
  var hrc = document.getElementById('heroResumeCard');
  if (hrc) {
    hrc.style.opacity = '0';
    hrc.style.transform = 'translateY(14px)';
    hrc.style.transition = 'opacity 0.6s ease 1.1s, transform 0.6s ease 1.1s';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        hrc.style.opacity = '1';
        hrc.style.transform = '';
      });
    });
  }
}, 100);

/* ── fun-tag staggered entrance when home reveals ── */
// document.querySelectorAll('.fun-tag').forEach(function(tag, i) {
//   tag.style.opacity = '0';
//   tag.style.transform = 'translateY(10px)';
//   tag.style.transition = 'opacity 0.4s ease ' + (0.7 + i * 0.07) + 's, transform 0.4s ease ' + (0.7 + i * 0.07) + 's';
// });
// var funTagsFired = false;
// var origGoPage2 = goToPage;
// goToPage = function(name, skipHash) {
//   origGoPage2(name, skipHash);
//   if (name === 'home' && !funTagsFired) {
//     funTagsFired = true;
//     setTimeout(function() {
//       document.querySelectorAll('.fun-tag').forEach(function(tag) {
//         tag.style.opacity = '1';
//         tag.style.transform = 'translateY(0)';
//       });
//     }, 300);
//   }
// };

/* ── hero stats subtle entrance bounce ── */
document.querySelectorAll('.hero-stat').forEach(function(s, i) {
  s.style.opacity = '0';
  s.style.transform = 'translateY(16px)';
  s.style.transition = 'opacity 0.5s ease ' + (0.55 + i * 0.1) + 's, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ' + (0.55 + i * 0.1) + 's';
});
var statsFired = false;
var origGoPage3 = goToPage;
goToPage = function(name, skipHash) {
  origGoPage3(name, skipHash);
  if (name === 'home' && !statsFired) {
    statsFired = true;
    setTimeout(function() {
      document.querySelectorAll('.hero-stat').forEach(function(s) {
        s.style.opacity = '1';
        s.style.transform = 'translateY(0)';
      });
    }, 200);
  }
};

/* ── initial sync on first load ── */
document.addEventListener('DOMContentLoaded', function() {
  var initial = (location.hash || '#home').replace('#','');
  document.querySelectorAll('.npd-dot').forEach(function(d) {
    d.classList.toggle('active', d.getAttribute('data-page') === initial);
  });
});
