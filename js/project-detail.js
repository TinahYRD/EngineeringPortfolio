/* ===============================================================
   PROJECT DETAIL PAGE
   Renders an individual project's full write-up (overview, key
   features, tech used, media gallery, design process, related
   projects) into the #page-project-detail template, using the data
   in js/projects-data.js. Reuses the same page-transition system,
   carousel/lightbox behavior, and card visuals as the rest of the
   site — no new animation systems introduced.
   =============================================================== */

var currentProjectId = null;

function openProjectDetail(id, skipHash) {
  var p = PROJECTS[id];
  if (!p) return;
  currentProjectId = id;

  // ---- Header ----
  document.getElementById('pdCategoryText').textContent = p.categoryLabel;
  document.getElementById('pdNumber').textContent = p.number;
  document.getElementById('pdOrgDate').textContent = p.org + '  ·  ' + p.date;

  var titleEl = document.getElementById('pdTitle');
  titleEl.innerHTML = wordWrapTitle(p.title);

  var awardWrap = document.getElementById('pdAwardTags');
  awardWrap.innerHTML = '';
  if (p.award) {
    var a = document.createElement('span');
    a.className = 'ph-tag pd-award-pill';
    a.textContent = p.award.replace('🏆', '').trim();
    awardWrap.appendChild(a);
  }
  p.techUsed.slice(0, 4).forEach(function (t) {
    var s = document.createElement('span');
    s.className = 'ph-tag';
    s.textContent = t;
    awardWrap.appendChild(s);
  });

  // ---- Gallery ----
  var track = document.getElementById('pdGalleryTrack');
  track.innerHTML = '';
  p.media.forEach(function (m) {
    var slide = document.createElement('div');
    slide.className = 'media-slide placeholder';
    if (m.type === 'image') {
      var img = document.createElement('img');
      img.src = m.src;
      img.alt = m.alt || p.title;
      slide.appendChild(img);
    } else {
      var vid = document.createElement('video');
      vid.width = 320; vid.height = 240; vid.controls = true;
      var src = document.createElement('source');
      src.src = m.src; src.type = 'video/mp4';
      vid.appendChild(src);
      slide.appendChild(vid);
    }
    track.appendChild(slide);
  });

  // ---- Overview ----
  document.getElementById('pdOverview').textContent = p.overview;

  // ---- Gallery (grid of clickable photos) ----
  var galleryGrid = document.getElementById('pdGalleryGrid');
  var gallerySection = document.getElementById('pdGallerySection');
  galleryGrid.innerHTML = '';
  if (p.gallery && p.gallery.length) {
    gallerySection.style.display = '';
    p.gallery.forEach(function (g, i) {
      var item = document.createElement('div');
      item.className = 'pd-gallery-item' + (g.wide ? ' wide' : '');
      item.title = 'Click to enlarge';
      var img = document.createElement('img');
      img.src = g.src;
      img.alt = g.alt || p.title;
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', function () { openGalleryLightbox(p.gallery, i); });
      galleryGrid.appendChild(item);
    });
  } else {
    gallerySection.style.display = 'none';
  }

  // ---- Key Features (icon + name + description cards) ----
  var feat = document.getElementById('pdFeatures');
  feat.innerHTML = '';
  p.keyFeatures.forEach(function (f) {
    var card = document.createElement('div');
    card.className = 'pd-feature-card';
    card.innerHTML =
      '<span class="pd-feature-icon">' + f.icon + '</span>' +
      '<span class="pd-feature-name">' + f.name + '</span>' +
      '<span class="pd-feature-desc">' + f.desc + '</span>';
    feat.appendChild(card);
  });

  // ---- Design Process ----
  var proc = document.getElementById('pdProcess');
  proc.innerHTML = '';
  p.designProcess.forEach(function (step) {
    var li = document.createElement('li');
    li.innerHTML = step;
    proc.appendChild(li);
  });

  // ---- Tech tags ----
  var tech = document.getElementById('pdTechTags');
  tech.innerHTML = '';
  p.techUsed.forEach(function (t) {
    var s = document.createElement('span');
    s.className = 'card-tag';
    s.textContent = t;
    tech.appendChild(s);
  });

  // ---- Quick facts ----
  var facts = document.getElementById('pdFacts');
  facts.innerHTML = '';
  var factList = [
    ['Organization', p.org],
    ['Timeline', p.date],
    ['Category', p.categoryLabel]
  ];
  if (p.award) factList.push(['Recognition', p.award]);
  factList.forEach(function (pair) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="pd-fact-label">' + pair[0] + '</span><span class="pd-fact-value">' + pair[1] + '</span>';
    facts.appendChild(li);
  });

  // ---- Related projects (same category first, then fill with others) ----
  renderRelatedProjects(p);

  // ---- Navigate ----
  goToPage('project-detail', skipHash);
  document.querySelectorAll('.nav-link').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-page') === 'projects');
  });
  if (!skipHash) history.replaceState(null, '', '#project-' + id);

  // rebuild the media carousel + lightbox wiring for the freshly-injected gallery
  refreshGalleryCarousel();
}

/* Reuses the same initCarousel()/openLightbox() logic from site.js that powers
   every project card, so the gallery behaves identically (dots, arrows, click-to-expand). */
function refreshGalleryCarousel() {
  var gallery = document.getElementById('pdGallery');
  if (!gallery) return;

  var dotsEl = gallery.querySelector('.media-dots');
  if (dotsEl) dotsEl.innerHTML = '';
  var prevBtn = gallery.querySelector('.media-nav.prev');
  var nextBtn = gallery.querySelector('.media-nav.next');
  var countEl = gallery.querySelector('.media-count');
  if (prevBtn) { prevBtn.style.display = ''; prevBtn.classList.remove('hidden'); }
  if (nextBtn) { nextBtn.style.display = ''; nextBtn.classList.remove('hidden'); }
  if (countEl) countEl.style.display = '';

  initCarousel(gallery);

  gallery.querySelectorAll('.media-slide').forEach(function (slide) {
    if (slide.querySelector('img') || slide.querySelector('video')) {
      slide.addEventListener('click', function () { openLightbox(slide); });
    }
  });
}

function wordWrapTitle(title) {
  return title.split(' ').map(function (w) {
    return '<span class="ph-word"><span>' + w + '</span></span>';
  }).join('&nbsp;');
}

/* Opens the site's existing lightbox (#lightbox) for a gallery-grid image,
   reusing the same currentGallery/currentIndex/renderLightbox globals from
   site.js so prev/next + close all work identically to the carousel. */
function openGalleryLightbox(images, index) {
  currentGallery = images.map(function (g) { return { type: 'image', src: g.src }; });
  currentIndex = index;
  renderLightbox();
  document.getElementById('lightbox').style.display = 'flex';
}

function renderRelatedProjects(current) {
  var wrap = document.getElementById('pdRelated');
  wrap.innerHTML = '';
  var sameCategory = PROJECTS_ORDER.filter(function (id) {
    return id !== current.id && PROJECTS[id].category === current.category;
  });
  var others = PROJECTS_ORDER.filter(function (id) {
    return id !== current.id && PROJECTS[id].category !== current.category;
  });
  var picks = sameCategory.concat(others).slice(0, 3);

  picks.forEach(function (id) {
    var rp = PROJECTS[id];
    var card = document.createElement('button');
    card.className = 'pd-related-card';
    card.onclick = function () { openProjectDetail(id); scrollCurrentPageTop(); };
    var thumb = rp.media[0];
    var thumbHtml = thumb && thumb.type === 'image'
      ? '<img src="' + thumb.src + '" alt="' + rp.title + '">'
      : '<div class="pd-related-thumb-fallback">⚙️</div>';
    card.innerHTML =
      '<div class="pd-related-media">' + thumbHtml + '</div>' +
      '<div class="pd-related-body">' +
      '  <span class="category-pill ' + rp.category + '">' + rp.categoryLabel + '</span>' +
      '  <h4>' + rp.title + '</h4>' +
      '  <span class="pd-related-cta">View project →</span>' +
      '</div>';
    wrap.appendChild(card);
  });
}


