// BB 404 page. Webflow's 404 is a bare utility page (no footer, and its button went nowhere), so this builds it:
// an ink page with a big pixel 404 in cream, a Back to home button, and the site footer with the footer arcade.
// Styles are in src/head/10-404-styles.js.
// - The footer is fetched from the home page (same markup, logo and links, nothing copied here), then the arcade
//   (18-footer-arcade.js) is mounted on it, so every game is there behind PLAY A GAME / NEXT GAME.
// - Ink set for the games: the games only have green and purple sets, so on this page they run their green set
//   and the colours are swapped as they are drawn: ink -> cream, the green background -> ink (N.MAP). That covers
//   canvas fills and strokes, gradients, pixel data (the invaders logo) and the backpack's SVG artwork. The swap
//   is switched on only while the 404 page is showing and switched off again when Barba leaves it.
(function () {
  var N = window.BB404 = window.BB404 || {};
  N.INK = '#212121'; N.CREAM = '#F5F1EA'; N.HOME = '/';
  N.MAP = { '#212121': N.CREAM, '#07a87e': N.INK };
  N.RGB = [[/rgba?\(\s*33\s*,\s*33\s*,\s*33\b/i, '245,241,234'], [/rgba?\(\s*7\s*,\s*168\s*,\s*126\b/i, '33,33,33']];
  // 5x7 pixel digits
  N.GLYPH = {
    '4': ['10001', '10001', '10001', '11111', '00001', '00001', '00001'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110']
  };

  function container() { var cs = document.querySelectorAll('[data-barba="container"]'); return cs[cs.length - 1] || null; }
  N.is404 = function () { var c = container(); return !!c && c.getAttribute('data-barba-namespace') === '404'; };

  // ---- colour swap for the games ----
  N.swap = function (v) {
    if (typeof v !== 'string') return v;
    var k = v.trim().toLowerCase();
    if (N.MAP[k]) return N.MAP[k];
    if (k.charCodeAt(0) === 114) {   // rgb( / rgba(
      for (var i = 0; i < N.RGB.length; i++) if (N.RGB[i][0].test(k)) {
        var a = k.match(/,\s*([\d.]+)\s*\)$/), four = (k.match(/,/g) || []).length === 3;
        return four && a ? 'rgba(' + N.RGB[i][1] + ',' + a[1] + ')' : 'rgb(' + N.RGB[i][1] + ')';
      }
    }
    return v;
  };
  var undo = [];
  function wrapSetter(proto, prop) {
    var d = proto && Object.getOwnPropertyDescriptor(proto, prop);
    if (!d || !d.set) return;
    Object.defineProperty(proto, prop, { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) { d.set.call(this, N.swap(v)); } });
    undo.push(function () { Object.defineProperty(proto, prop, d); });
  }
  function wrapMethod(proto, name, make) {
    if (!proto || !proto[name]) return;
    var orig = proto[name];
    proto[name] = make(orig);
    undo.push(function () { proto[name] = orig; });
  }
  N.patch = function () {
    if (N.on) return;
    N.on = true;
    [window.CanvasRenderingContext2D, window.OffscreenCanvasRenderingContext2D].forEach(function (K) {
      var p = K && K.prototype;
      ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (k) { wrapSetter(p, k); });
      // pixel data: near-black pixels (the invaders logo is written straight into ImageData) become cream
      wrapMethod(p, 'putImageData', function (orig) {
        return function (img) {
          var s = img.data, c = new ImageData(img.width, img.height), d = c.data;
          for (var i = 0; i < s.length; i += 4) {
            var dark = s[i + 3] && s[i] < 40 && s[i + 1] < 40 && s[i + 2] < 40;
            d[i] = dark ? 245 : s[i]; d[i + 1] = dark ? 241 : s[i + 1]; d[i + 2] = dark ? 234 : s[i + 2]; d[i + 3] = s[i + 3];
          }
          var a = [].slice.call(arguments); a[0] = c;
          return orig.apply(this, a);
        };
      });
    });
    wrapMethod(window.CanvasGradient && CanvasGradient.prototype, 'addColorStop', function (orig) {
      return function (o, c) { return orig.call(this, o, N.swap(c)); };
    });
    // SVG artwork loaded as an image (the backpack and board): swap the same colours inside the SVG
    var P = 'data:image/svg+xml;charset=utf-8,';
    var d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (d && d.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) {
        if (typeof v === 'string' && v.indexOf(P) === 0) {
          try {
            v = P + encodeURIComponent(decodeURIComponent(v.slice(P.length)).replace(/#212121|#07a87e/gi, function (m) { return N.MAP[m.toLowerCase()]; }));
          } catch (e) {}
        }
        d.set.call(this, v);
      } });
      undo.push(function () { Object.defineProperty(HTMLImageElement.prototype, 'src', d); });
    }
  };
  N.unpatch = function () {
    if (!N.on) return;
    N.on = false;
    while (undo.length) { try { undo.pop()(); } catch (e) {} }
  };

  // ---- page ----
  N.number = function () {
    var px = '', d = '', col = 0, n = 0;
    '404'.split('').forEach(function (ch) {
      N.GLYPH[ch].forEach(function (row, y) {
        for (var x = 0; x < 5; x++) if (row.charAt(x) === '1') {
          d += 'M' + (col + x) + ' ' + y + 'h1v1h-1z';
          px += '<rect x="' + (col + x) + '" y="' + y + '" width="1" height="1" style="animation-delay:' + (40 * (col + x) + 25 * y + (n++ % 3) * 30) + 'ms"/>';
        }
      });
      col += 6;
    });
    // one solid shape under the pixels, so no hairlines show between them at odd sizes
    return '<svg class="bb404-num bb404-in" viewBox="0 0 17 7" role="img" aria-label="404"><path class="bb404-base" d="' + d + '"/>' + px + '</svg>';
  };
  var star = function () { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.7 6.5 17.5 11.3 24 12C17.5 12.7 12.7 17.5 12 24C11.3 17.5 6.5 12.7 0 12C6.5 11.3 11.3 6.5 12 0Z"/></svg>'; };

  N.goHome = function (a) {
    if (a._busy) return;
    a._busy = true;
    var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // the press plays out first: dip + squiggle fill, then go
    a.classList.add('bbarc-press');
    try { a.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body })); } catch (e) {}
    setTimeout(function () { a.classList.remove('bbarc-press'); }, 140);
    setTimeout(function () { location.href = N.HOME; }, rm ? 0 : 420);
  };

  N.footer = function (c) {
    if (!window.fetch || !window.DOMParser) return;
    fetch(N.HOME, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      if (!html || !c.isConnected || c.querySelector('.bb-footer')) return;
      var f = new DOMParser().parseFromString(html, 'text/html').querySelector('.bb-footer');
      if (!f) return;
      f = document.importNode(f, true);
      [].forEach.call(f.querySelectorAll('script'), function (s) { s.remove(); });
      c.appendChild(f);
      try { if (window.initFooterBend) window.initFooterBend(); } catch (e) {}
      try { if (window.BBA && window.BBA.mount) window.BBA.mount(); } catch (e) { console.error('[bb] 404 arcade', e); }
      try { document.dispatchEvent(new CustomEvent('bb404:footer')); } catch (e) {}
    }).catch(function () {});
  };

  N.build = function () {
    if (!N.is404()) { N.unpatch(); return; }
    N.patch();
    var c = container();
    if (c.querySelector('.bb404-hero')) return;
    document.title = 'Page not found | Brave Beyond';
    var hero = document.createElement('main');
    hero.className = 'bb404-hero';
    hero.innerHTML = N.number() +
      '<h1 class="bb404-h">Page not found</h1>' +
      '<p class="bb404-p">This page has wandered off. Head back home, or scroll down and play a game while you’re here.</p>' +
      '<a class="bbarc-btn bb404-home" data-squiggle href="' + N.HOME + '"><span class="bbarc-ic bbarc-ic-l">' + star() + '</span>' +
      '<span class="bbarc-tx">Back to home</span><span class="bbarc-ic bbarc-ic-r">' + star() + '</span></a>';
    c.insertBefore(hero, c.firstChild);
    c.classList.add('bb404-on');
    var a = hero.querySelector('.bb404-home');
    a.setAttribute('data-barba-prevent', 'self');   // a plain page load home, so the colour swap is gone for sure
    a.addEventListener('pointerdown', function () { a.classList.add('bbarc-press'); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { a.addEventListener(ev, function () { if (!a._busy) a.classList.remove('bbarc-press'); }); });
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault(); e.stopPropagation(); N.goHome(a);
    });
    N.footer(c);
  };

  N.build();
  (function hook() {
    if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
    barba.hooks.before(function () { N.unpatch(); });
    barba.hooks.after(function () { N.build(); });
  })();
})();
