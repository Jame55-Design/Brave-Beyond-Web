// Stacking sticky cards with a bounce as each card locks (Services "Expertise" cards).
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

  function kill() {
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
  function fitStickyTops(sections) {
    var vh = document.documentElement.clientHeight;
    sections.forEach(function (section) {
      section.querySelectorAll('[data-stacking-card]').forEach(function (card) {
        card.style.top = '';
        var cssTop = parseFloat(getComputedStyle(card).top);
        if (isNaN(cssTop)) return;
        var h = card.offsetHeight;
        var centred = (vh - h) * 0.45;
        var fit = vh - h - 16;
        var top = Math.min(Math.max(cssTop, centred), fit);
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
    fitStickyTops(sections);
    var tier = tierNow();

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
