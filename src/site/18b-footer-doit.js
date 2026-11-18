// "Fancy a game?" pop-outs: hovering the footer arcade heading (.bbarc-h, from 18-footer-arcade.js) throws out
// bubble PLAY words and little pixel game controllers that pop, tumble, bounce and fade, the same physics as the footer
// hearts (01-footer-hearts.js). PLAY letters step up one after another as their deep-purple extrusion stretches out
// (CSS transitions, so it costs nothing per frame). PLAY: Purps face + deep plum extrusion on the green footer,
// Main Green face + mint extrusion on the Purps footer. Controllers: Purps on green, Main Green on Purps.
// Touch: a tap on the heading throws a burst. Reduced motion: nothing.
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var PURPS = '#AE9AE4', GREEN = '#07A87E', INK = '#212121', MINT = '#66C9B0', PLUM = '#69559A';
  // PLAY outlines (Modak, outlined, letters tilted and bobbed), viewBox 0 0 236 90, one path per letter
  var PLAY = ["M30.8 37.9Q31 38 31.9 37.9Q32.8 37.8 33.3 37.1Q33.7 36.3 33.5 34.6L33.2 30.9Q33.1 29.2 32.6 28.5Q32.1 27.8 31.1 27.8Q30.2 27.9 29.9 28.2Q29.9 28.4 30 29ZM33.9 59.8 34.6 67.2Q32.6 69.2 28.8 70.7Q25 72.2 20.8 72.5Q14.7 73.1 10.7 71.1Q6.1 68.8 5.6 63.7L1.6 17.5Q1.5 15.9 3.4 14.2Q5.4 12.5 9 10.9Q16.8 7.4 27.1 6.5Q41.4 5.3 50.5 11.6Q59.6 18 60.6 30Q61.7 42 54.6 49.3Q47.8 56.3 34.8 57.4Q31.8 57.7 28.4 57.3Q24.9 56.9 23.7 56.4Q23.4 56.9 23.4 57.5Q23.6 60 33.9 59.8Z", "M64.8 73.2Q59.4 72.7 56.8 69.6Q54.1 66.5 54.6 60.7L58.7 13.1Q61.5 11.2 65.3 10.3Q69.2 9.4 73.1 9.8Q79 10.3 82.9 13.6Q87 17.3 86.5 23.1L84.2 49.7Q81.4 49.7 78.7 50.8Q75.9 51.8 75.8 53.2Q75.7 54 76.6 54.7Q81.8 51.1 91.3 51.9L102.8 52.9Q105.5 58.8 105 64.7Q104.7 67.6 103.4 71.1Q102.1 74.6 100.2 76.3Z", "M136.1 37.9Q134.3 30.6 133.8 29.2Q133.2 27.9 132.1 27.9Q131.6 28 130.9 28.3L133.5 38Q133.9 38.4 134.7 38.3Q135.5 38.3 136.1 37.9ZM124.9 53.3Q124.4 54 124.5 54.6Q124.6 56 127.3 56.8Q130 57.5 133.8 57.5Q134.9 64.5 135.7 65.4Q134.9 67.3 130.9 69.4Q126.8 71.5 121.5 71.9Q114.6 72.4 109.4 69.7Q104.2 67.1 103.9 62.4Q103.8 61.1 104 60.1L111.1 13Q114.8 10.2 120.1 8.4Q125.5 6.7 131.3 6.2Q139.7 5.7 145.8 8.1Q152.8 10.8 154.7 16.8L169 62Q164.4 68.9 153 69.7Q147.4 70.1 143.4 68.3Q139.4 66.6 138.5 63L137.1 57.1Q140 56.8 142.6 55.6Q145.3 54.3 145.2 53.1Q145.1 52.4 144.5 51.9Q142.7 53.4 140.1 54.2Q137.5 55.1 135.2 55.3Q128.6 55.7 124.9 53.3Z", "M180.8 57.6Q182.2 57.7 182.3 56.2Q172.3 48 167.8 37Q163.2 26 163.8 13.4Q166.4 10.4 170.9 9.1Q175.4 7.8 180 8.3Q186.1 8.9 190.2 11.7Q192.2 19.4 193.2 26.2Q189.7 36.4 189.7 36.4Q189.5 37.1 189.4 37.8Q189.2 39.4 191 39.6Q191.8 37.8 194.9 28.7Q195.7 26.4 197 22.2Q198.4 18.1 200.4 12.5Q205.1 10.8 210.8 11.4Q217.7 12.1 221.5 15.9Q225.3 19.7 224.6 26.1Q223.6 35.4 217.5 43.7Q212.6 50.3 205.2 55.6L203.5 71.7Q199.2 73.7 195.9 74.2Q192.6 74.6 189.1 74.3Q182.4 73.6 178.8 70.6Q175.2 67.7 175.7 62.7L176.6 54.2Q177.4 55.1 178.7 56.3Q179.9 57.5 180.8 57.6Z"];
  var STEPS = 10, SX = .9, SY = 1; // extrusion: 10 copies, each .9/1 units further down-right
  function sprite() {
    if (document.getElementById('bbpl-0')) return;
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML = '<defs>' + PLAY.map(function (d, i) { return '<path id="bbpl-' + i + '" d="' + d + '"/>'; }).join('') + '</defs>' +
      '<style>.bbpl .bbpl-l,.bbpl .bbpl-c{transition:transform .42s cubic-bezier(.3,1.7,.5,1);transition-delay:calc(var(--i) * 75ms)}' +
      '.bbpl .bbpl-l{transform:translate(' + STEPS * SX + 'px,' + STEPS * SY + 'px)}.bbpl.on .bbpl-l{transform:none}' +
      '.bbpl .bbpl-c{transform:none}.bbpl.on .bbpl-c{transform:translate(calc(var(--k) * ' + SX + 'px),calc(var(--k) * ' + SY + 'px))}</style>';
    document.body.appendChild(s);
  }
  function play(w) {
    var pur = window.BBA && BBA.t === 'purple', face = pur ? GREEN : PURPS, ext = pur ? MINT : PLUM, g = '';
    PLAY.forEach(function (d, i) {
      g += '<g class="bbpl-l" style="--i:' + i + '">';
      for (var k = STEPS; k > 0; k--) g += '<use href="#bbpl-' + i + '" class="bbpl-c" style="--k:' + k + '" fill="' + ext + '"/>';
      g += '<use href="#bbpl-' + i + '" fill="' + face + '"/></g>';
    });
    return '<svg class="bbpl" viewBox="0 0 236 90" width="' + w + '" height="' + (w * 90 / 236) + '" overflow="visible" style="display:block">' + g + '</svg>';
  }
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
      sprite();
      w = 100 + Math.random() * 60; h = w * 90 / 236;
      e.innerHTML = play(w);
    } else {
      w = 26 + Math.random() * 18; h = w / 2;
      e.innerHTML = pad(c, w);
    }
    e.style.position = 'absolute'; e.style.left = '0'; e.style.top = '0'; e.style.willChange = 'transform,opacity';
    layer().appendChild(e);
    if (word) { var sv = e.firstChild; sv.getBoundingClientRect(); requestAnimationFrame(function () { sv.classList.add('on'); }); }
    H.push({ e: e, x: x - w / 2, y: y - h / 2, vx: (Math.random() - .5) * 8, vy: -(4 + Math.random() * 5),
      r: (Math.random() - .5) * (word ? 18 : 40), vr: (Math.random() - .5) * (word ? .5 : 8), t: 0,
      life: (word ? 95 : 70) + Math.random() * 30, fy: y + 40 + Math.random() * 60, b: 0 });
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
