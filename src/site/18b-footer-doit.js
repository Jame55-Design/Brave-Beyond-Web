// "Fancy a game?" pop-outs: hovering the footer arcade heading (.bbarc-h, from 18-footer-arcade.js) throws out
// DO IT! words and little pixel game controllers that pop, tumble, bounce and fade, the same physics as the footer
// hearts (01-footer-hearts.js). Purps on the green footer, Main Green on the Purps footer. Plain text, no effects.
// Touch: a tap on the heading throws a burst. Reduced motion: nothing.
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var PURPS = '#AE9AE4', GREEN = '#07A87E', INK = '#212121';
  // 16x8 pixel controller: X body, o ink (d-pad and buttons)
  var PAD = ['..XXXX....XXXX..', '.XXXXXXXXXXXXXX.', 'XXXoXXXXXXXXoXXX', 'XXoooXXXXXXoXoXX',
             'XXXoXXXXXXXXoXXX', 'XXXXXXXXXXXXXXXX', 'XXXXX......XXXXX', '.XXX........XXX.'];
  var L = null, H = [], raf = 0, last = 0;

  function colour() { return window.BBA && BBA.t === 'purple' ? GREEN : PURPS; }
  function pad(c, w) {
    var r = '';
    PAD.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) if (row[x] !== '.') r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + (row[x] === 'o' ? INK : c) + '"/>';
    });
    return '<svg viewBox="0 0 16 8" width="' + w + '" height="' + (w / 2) + '" shape-rendering="crispEdges" style="display:block">' + r + '</svg>';
  }
  function layer() {
    if (!L || !L.isConnected) {
      L = document.createElement('div');
      L.setAttribute('aria-hidden', 'true');
      L.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:500;overflow:hidden';
      document.body.appendChild(L);
    }
    return L;
  }
  function spawn(x, y) {
    var c = colour(), e = document.createElement('div'), w, h, word = Math.random() < .55;
    if (word) {
      var fs = 18 + Math.random() * 16;
      e.textContent = 'DO IT!';
      e.style.cssText = 'font-family:inherit;font-weight:800;font-size:' + fs + 'px;line-height:1;letter-spacing:-.01em;white-space:nowrap;color:' + c;
      w = fs * 3.2; h = fs;
    } else {
      w = 26 + Math.random() * 18; h = w / 2;
      e.innerHTML = pad(c, w);
    }
    e.style.position = 'absolute'; e.style.left = '0'; e.style.top = '0'; e.style.willChange = 'transform,opacity';
    layer().appendChild(e);
    H.push({ e: e, x: x - w / 2, y: y - h / 2, vx: (Math.random() - .5) * 8, vy: -(4 + Math.random() * 5),
      r: (Math.random() - .5) * (word ? 24 : 40), vr: (Math.random() - .5) * (word ? 4 : 8), t: 0,
      life: 70 + Math.random() * 30, fy: y + 40 + Math.random() * 60, b: 0 });
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step() {
    for (var i = H.length - 1; i >= 0; i--) {
      var p = H[i];
      p.t++; p.vy += .32; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      if (p.y > p.fy && p.vy > 0 && p.b < 2) { p.vy *= -.55; p.vx *= .8; p.b++; }
      var k = p.t / p.life, sc = p.t < 8 ? .4 + .6 * p.t / 8 : 1, o = k > .65 ? 1 - (k - .65) / .35 : 1;
      p.e.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + p.r + 'deg) scale(' + sc + ')';
      p.e.style.opacity = o;
      if (p.t >= p.life) { p.e.remove(); H.splice(i, 1); }
    }
    raf = H.length ? requestAnimationFrame(step) : 0;
  }
  function onH(t) { return t && t.closest && t.closest('.bbarc-h'); }
  document.addEventListener('mousemove', function (ev) {
    if (!onH(ev.target)) return;
    var n = performance.now();
    if (n - last < 70) return;
    last = n;
    spawn(ev.clientX, ev.clientY);
  }, { passive: true });
  document.addEventListener('touchstart', function (ev) {
    if (!onH(ev.target)) return;
    var p = ev.touches[0];
    for (var i = 0; i < 7; i++) spawn(p.clientX, p.clientY);
  }, { passive: true });
})();
