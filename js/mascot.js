/* ===============================================================
   STUDIO MASCOT
   A small floating, clickable companion that sits in the corner of
   every page. Purely additive — doesn't touch any existing floating
   image / animation on the site. Click it for a fun tip or nudge
   toward a project.
   =============================================================== */

(function () {
  var quips = [
    { text: "Hi! I'm the site mascot — click around, I don't bite. 🐾" },
    { text: "Psst — the cooling loop sim hit 95.84% motor efficiency. Nerdy flex.", action: function () { openProjectDetail('cooling-sim'); }, actionLabel: "Show me →" },
    { text: "Tinah shaved 14% off the planet shaft's weight with FEA. Respect the gram count.", action: function () { openProjectDetail('planet-shafts'); }, actionLabel: "See the redesign →" },
    { text: "Fun fact: the Red Lamp robot got hacked together at 3am and still won 2nd place.", action: function () { openProjectDetail('red-lamp'); }, actionLabel: "Meet the lamp →" },
    { text: "10+ projects, 1 very tired but happy mechanical engineer.", action: function () { goToPage('projects'); }, actionLabel: "Browse projects →" },
    { text: "Formula SAE, aerospace UAS, hackathons... this portfolio really said 'why not all three.'" },
    { text: "Open to internships May–Sept 2027, in case anyone reading this is hiring. 👀", action: function () { goToPage('contact'); }, actionLabel: "Say hello →" },
    { text: "That drivetrain got machined down to a 22.3 kg unsprung mass. Every gram counted.", action: function () { openProjectDetail('drivetrain'); }, actionLabel: "See the build →" },
    { text: "Try clicking any project's photo — the gallery flips through the whole build." },
    { text: "🐶🐺🦊🦝🐱 more projects incoming, allegedly." }
  ];

  var quipOrder = [];
  var quipIdx = 0;
  var hideTimer = null;
  var greeted = false;

  function shuffledOrder() {
    var arr = quips.map(function (_, i) { return i; });
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function nextQuip() {
    if (!quipOrder.length) quipOrder = shuffledOrder();
    var q = quips[quipOrder[quipIdx % quipOrder.length]];
    quipIdx++;
    return q;
  }

  function showBubble(quip, autoHide) {
    var bubble = document.getElementById('mascotBubble');
    if (!bubble) return;
    clearTimeout(hideTimer);

    var html = '<p class="mascot-bubble-text">' + quip.text + '</p>';
    if (quip.action) {
      html += '<button class="mascot-bubble-cta" id="mascotBubbleCta">' + quip.actionLabel + '</button>';
    }
    bubble.innerHTML = html;
    bubble.classList.add('visible');

    if (quip.action) {
      var cta = document.getElementById('mascotBubbleCta');
      if (cta) {
        cta.addEventListener('click', function (e) {
          e.stopPropagation();
          hideBubble();
          quip.action();
        });
      }
    }

    if (autoHide) {
      hideTimer = setTimeout(hideBubble, 6000);
    }
  }

  function hideBubble() {
    var bubble = document.getElementById('mascotBubble');
    if (bubble) bubble.classList.remove('visible');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var mascot = document.getElementById('mascot');
    var body = document.getElementById('mascotBody');
    var eyeL = document.getElementById('mascotEyeL');
    var eyeR = document.getElementById('mascotEyeR');
    if (!mascot || !body) return;

    // Click cycles through quips / opens bubble
    body.addEventListener('click', function () {
      var bubble = document.getElementById('mascotBubble');
      var isVisible = bubble && bubble.classList.contains('visible');
      mascot.classList.add('bounce');
      setTimeout(function () { mascot.classList.remove('bounce'); }, 420);
      if (isVisible) {
        hideBubble();
      } else {
        showBubble(nextQuip(), true);
      }
    });

    // Eyes gently track the cursor
    document.addEventListener('mousemove', function (e) {
      if (!eyeL || !eyeR) return;
      var rect = body.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 400);
      var angle = Math.atan2(dy, dx);
      var maxShift = 2.2;
      var ox = Math.cos(angle) * maxShift * dist;
      var oy = Math.sin(angle) * maxShift * dist;
      eyeL.style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
      eyeR.style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
    });

    // Auto-greet once, shortly after the loader finishes
    setTimeout(function () {
      if (greeted) return;
      greeted = true;
      showBubble(quips[0], true);
    }, 2600);

    // Occasional idle wiggle to draw the eye without being distracting
    setInterval(function () {
      if (mascot.classList.contains('bounce')) return;
      mascot.classList.add('wiggle');
      setTimeout(function () { mascot.classList.remove('wiggle'); }, 700);
    }, 14000);
  });
})();
