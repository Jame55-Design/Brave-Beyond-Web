// Stacking sticky cards with a bounce as each card locks (Services "Expertise" cards). Phones skip the scroll animation and show each card at its final angle.
// Markup: [data-stacking-cards-init] section > [data-stacking-card] items > [data-stacking-card-target].
// Per-breakpoint toggles/values: data-stacking-cards-{desktop|tablet|mobile}[-rotate|-x|-y].
// Re-runs after Barba page transitions and when the viewport tier changes.
(function () {
  var V = 'https://cdn.jsdelivr.net/npm/gsap@3.15/dist/';

  function load(n, cb) {
    if (window[n]) return cb();
    var s = document.createElement('script');
    s.src = V + n + '.min.js'; s.onload = cb; document.head.appendChild(s);
  }

  function tierNow() {
    var w = window.innerWidth;
    return w <= 767 ? 'mobile' : w <= 991 ? 'tablet' : 'desktop';
  }

  function parse(section, attr, fallback, numbers) {
    var raw = section.getAttribute(attr);
    if (!raw) return fallback;
    var v = raw.split(',').map(function (x) { x = x.trim(); return numbers ? parseFloat(x) : x; })
      .filter(function (x) { return numbers ? !isNaN(x) : x; });
    return v.length ? v : fallback;
  }

  function pulse(t) {
    var w = t.offsetWidth, h = t.offsetHeight, s = 1.5 * parseFloat(getComputedStyle(t).fontSize);
    if (!w || !h) return;
    gsap.timeline()
      .to(t, { scaleX: (w + s) / w, scaleY: (h - s * .33) / h, duration: .1, ease: 'power1.out' })
      .to(t, { scaleX: 1, scaleY: 1, duration: 1, ease: 'elastic.out(1, 0.3)' });
  }

  // iOS Safari moves sticky cards a frame late (a jittery bounce) when any ancestor
  // has overflow-x: clip. On phones, pages with stacking cards drop that clip and
  // stop sideways panning with touch-action instead.
  var FIX = 'bb-sticky-fix';
  (function () {
    var s = document.createElement('style');
    s.textContent = 'html.' + FIX + ',html.' + FIX + ' body,html.' + FIX + ' .cards-stack,html.' + FIX +
      ' [data-stacking-cards-init]{overflow-x:visible!important}html.' + FIX + '{touch-action:pan-y pinch-zoom}';
    document.head.appendChild(s);
  })();

  function kill() {
    document.documentElement.classList.remove(FIX);
    ScrollTrigger.getAll().forEach(function (t) {
      if (t.vars && t.vars.id && String(t.vars.id).indexOf('stacking-') === 0) t.kill();
    });
    document.querySelectorAll('[data-stacking-card-target]').forEach(function (t) {
      gsap.killTweensOf(t); gsap.set(t, { clearProps: 'all' });
    });
  }

  // Where each card sticks:
  // - roughly centred on screen (a touch above true centre, which reads as centred),
  //   but never higher than the CSS top, which keeps it clear of the nav;
  // - if a card is too tall for that, just high enough for its bottom to show.
  // clientHeight is the smallest viewport (iOS toolbars showing), so it doesn't
  // jump around as Safari's bars hide and show.
  // Phones: iOS Safari jitters a stuck card that hangs off the bottom of the screen,
  // so any card too tall for the space between the nav and the screen bottom is
  // zoomed down (CSS zoom, which shrinks its layout too) until it fits.
  function fitStickyTops(sections, tier) {
    var vh = document.documentElement.clientHeight;
    // the visible nav bar (the .navigation wrapper itself is shorter than the bar it shows)
    var nav = document.querySelector('.twostep-nav__bar') || document.querySelector('.navigation');
    var navBottom = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
    sections.forEach(function (section) {
      section.querySelectorAll('[data-stacking-card]').forEach(function (card) {
        card.style.top = '';
        var target = card.querySelector('[data-stacking-card-target]') || card;
        target.style.zoom = '';
        var cssTop = parseFloat(getComputedStyle(card).top);
        if (isNaN(cssTop)) return;
        var h = card.offsetHeight;
        var room = vh - (navBottom + 12) - 16;
        if (tier === 'mobile' && h > room && room > 0) {
          target.style.zoom = (Math.floor(room / h * 1000) / 1000).toString();
          h = card.offsetHeight;
        }
        var centred = (vh - h) * 0.45;
        var fit = vh - h - 16;
        var top = Math.min(Math.max(cssTop, centred), fit);
        // never tuck under the fixed nav (phones: tall cards would otherwise ride up behind it)
        top = Math.max(top, navBottom + 12);
        if (Math.round(top) !== Math.round(cssTop)) card.style.top = Math.round(top) + 'px';
      });
    });
  }

  function init() {
    kill();
    var cs = document.querySelectorAll('[data-barba="container"]');
    var scope = cs.length ? cs[cs.length - 1] : document;
    var sections = scope.querySelectorAll('[data-stacking-cards-init]');
    if (!sections.length) return;
    var tier = tierNow();
    if (tier === 'mobile') document.documentElement.classList.add(FIX);
    fitStickyTops(sections, tier);

    // The card images are lazy and have no size set, so cards start short and grow as
    // the images arrive mid-scroll (the first-scroll jitter). Load them straight away and
    // re-fit once each one lands.
    var refit = function () { fitStickyTops(sections, tierNow()); if (window.ScrollTrigger) ScrollTrigger.refresh(); };
    sections.forEach(function (section) {
      section.querySelectorAll('[data-stacking-card] img').forEach(function (img) {
        if (img.getAttribute('loading') === 'lazy') img.setAttribute('loading', 'eager');
        if (!img.complete) img.addEventListener('load', refit, { once: true });
      });
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
    if (document.readyState !== 'complete') window.addEventListener('load', refit, { once: true });

    // Hold on the last card: once it lands, freeze the whole section for a short
    // stretch of scrolling (data-stacking-cards-hold, in % of screen height,
    // default 35), then let the page carry on. Desktop and tablet only; phones
    // skip it because pinning fights iOS scrolling.
    if (tier !== 'mobile') {
      sections.forEach(function (section, si) {
        var cards = section.querySelectorAll('[data-stacking-card]');
        var list = section.querySelector('[data-stacking-card-stack]');
        if (cards.length < 2 || !list) return;
        var last = cards[cards.length - 1];
        var hold = parseFloat(section.getAttribute('data-stacking-cards-hold'));
        if (isNaN(hold)) hold = 35;
        ScrollTrigger.create({
          id: 'stacking-hold-' + si,
          trigger: list,
          // the list ends at the last card's bottom, so this fires the moment
          // the last card reaches its stuck position
          start: function () {
            var top = parseFloat(getComputedStyle(last).top) || 0;
            return 'bottom top+=' + Math.round(top + last.offsetHeight);
          },
          end: function () { return '+=' + Math.round(window.innerHeight * hold / 100); },
          pin: section,
          pinSpacing: true,
          invalidateOnRefresh: true
        });
      });
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { ScrollTrigger.refresh(); return; }
    sections.forEach(function (section, si) {
      if (section.getAttribute('data-stacking-cards-' + tier) !== 'true') return;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-stacking-card]'));
      if (!cards.length) return;
      var base = 'data-stacking-cards-' + tier;
      var rot = parse(section, base + '-rotate', [0, 4, -4], true);
      var xs = parse(section, base + '-x', ['0em']);
      var ys = parse(section, base + '-y', ['0em']);

      cards.forEach(function (card, i) {
        var target = card.querySelector('[data-stacking-card-target]');
        if (!target) return;
        var stickyTop = parseFloat(getComputedStyle(card).top) || 0;
        // Phones: no scroll-driven tilt or bounce, which jitter on stuck cards in iOS Safari.
        // Each card just sits at its final angle and the stacking stays native.
        if (tier === 'mobile') {
          gsap.set(target, { rotate: rot[i % rot.length], x: xs[i % xs.length], y: ys[i % ys.length], scale: 1, zIndex: cards.length - i });
          return;
        }
        gsap.set(target, { rotate: 0, x: 0, y: 0, scale: 1, zIndex: cards.length - i });
        gsap.to(target, {
          rotate: rot[i % rot.length], x: xs[i % xs.length], y: ys[i % ys.length],
          ease: 'power1.in', overwrite: 'auto',
          scrollTrigger: {
            id: 'stacking-rotate-' + si + '-' + i, trigger: card,
            start: 'top 75%', end: 'top-=' + stickyTop + ' top', scrub: true
          }
        });
        ScrollTrigger.create({
          id: 'stacking-bounce-' + si + '-' + i, trigger: card,
          start: 'top-=' + stickyTop + ' top', onEnter: function () { pulse(target); }
        });
      });
    });
    ScrollTrigger.refresh();
  }

  var lastTier = tierNow(), rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var t = tierNow();
      if (t !== lastTier) { lastTier = t; if (window.ScrollTrigger) init(); return; }
      // Desktop window height changes: re-centre the cards. Phones skip this,
      // since their height changes as the browser bars hide and show.
      if (t === 'desktop' && window.ScrollTrigger) init();
    }, 250);
  });

  (function wait() {
    if (!window.gsap) return setTimeout(wait, 50);
    load('ScrollTrigger', function () {
      gsap.registerPlugin(ScrollTrigger);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
      (function hook() {
        if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
        barba.hooks.before(kill);
        barba.hooks.after(init);
      })();
    });
  })();
})();
