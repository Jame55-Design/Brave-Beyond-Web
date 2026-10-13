// Scroll-driven "How it works" process timeline (Services page).
// Markup: [data-step-timeline-init] > [data-step-timeline-line] > [data-step-timeline-fill],
// plus [data-step-timeline-item] rows each holding a [data-step-timeline-marker].
// Re-runs after Barba page transitions.
(function () {
  var V = 'https://cdn.jsdelivr.net/npm/gsap@3.15/dist/', live = [];

  function load(n, cb) {
    if (window[n]) return cb();
    var s = document.createElement('script');
    s.src = V + n + '.min.js'; s.onload = cb; document.head.appendChild(s);
  }

  function kill() { live.forEach(function (fn) { fn(); }); live = []; }

  function setup(root) {
    var line = root.querySelector('[data-step-timeline-line]');
    var fill = root.querySelector('[data-step-timeline-fill]');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-step-timeline-item]'));
    if (!line || !fill || !items.length) return;

    var anchors = items.map(function (it) { return it.querySelector('[data-step-timeline-marker]') || it; });
    var a = parseFloat(root.getAttribute('data-step-timeline-activation'));
    var pct = (isNaN(a) ? 0.5 : Math.min(Math.max(a, 0), 1)) * 100;
    var last = items.length - 1, fr = [0], cur = -2;

    function measure() {
      if (items.length < 2) { line.style.height = '0px'; fr = [0]; return; }
      var base = line.parentElement.getBoundingClientRect().top;
      var c = anchors.map(function (el) { var b = el.getBoundingClientRect(); return b.top + b.height / 2 - base; });
      var span = c[last] - c[0];
      line.style.top = c[0] + 'px'; line.style.height = span + 'px'; line.style.bottom = 'auto';
      fr = c.map(function (v) { return span > 0 ? (v - c[0]) / span : 0; });
    }

    function setIndex(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (it, k) {
        var st = i >= 0 && k <= i ? 'active' : 'inactive';
        if (it.getAttribute('data-status') !== st) it.setAttribute('data-status', st);
        it.toggleAttribute('data-current', k === i);
        it.toggleAttribute('data-previous', k === i - 1);
        it.toggleAttribute('data-next', k === i + 1);
      });
    }

    function update(self) {
      var reached = self.isActive || self.progress >= 1, idx = -1;
      if (reached) { idx = 0; for (var k = 0; k < fr.length; k++) if (self.progress + 0.0001 >= fr[k]) idx = k; }
      setIndex(idx);
    }

    setIndex(-1);
    gsap.set(fill, { transformOrigin: 'top', scaleY: 0 });

    var mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      measure();
      ScrollTrigger.addEventListener('refreshInit', measure);
      if (items.length > 1) {
        gsap.fromTo(fill, { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: {
            trigger: line, start: 'top ' + pct + '%', end: 'bottom ' + pct + '%', scrub: true,
            onUpdate: update, onToggle: update, onRefresh: update
          }
        });
      } else { setIndex(0); }
      var refresh = function () { ScrollTrigger.refresh(); };
      window.addEventListener('load', refresh);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
      ScrollTrigger.refresh();
      return function () {
        window.removeEventListener('load', refresh);
        ScrollTrigger.removeEventListener('refreshInit', measure);
      };
    });
    mm.add('(prefers-reduced-motion: reduce)', function () {
      measure(); gsap.set(fill, { scaleY: 1 }); setIndex(last);
    });
    live.push(function () { mm.revert(); });
  }

  function init() {
    kill();
    var cs = document.querySelectorAll('[data-barba="container"]');
    var scope = cs.length ? cs[cs.length - 1] : document;
    scope.querySelectorAll('[data-step-timeline-init]').forEach(setup);
  }

  (function wait() {
    if (!window.gsap) return setTimeout(wait, 50);
    load('ScrollTrigger', function () {
      gsap.registerPlugin(ScrollTrigger);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
      (function hook() {
        if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
        barba.hooks.before(kill);
        barba.hooks.after(init);
      })();
    });
  })();
})();
