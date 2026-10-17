// BB Footer Sling: a slingshot in the footer. Pull the pebble back, let go, and whatever bit of the logo it hits shatters.
// The hit area breaks into irregular shards (cut straight from the logo) that tumble away under gravity, cracks run out
// into the logo around the hole, and the pebble keeps going through for up to 3 hits.
// Mouse: press anywhere on the game and drag back. Touch: start the drag below the logo (so the page still scrolls).
// Reads the footer logo paths at runtime (.bbft-lm .bbft-l), falling back to the stacked logo from the bricks game.
// Instagram, Privacy Policy and the rights line stay in the footer underneath, like the other footer games.
// Pages: set in B.SEL / B.PATHS below (Barba namespace or URL path + .bb-footer).

(function () {
  var B = window.BBS = window.BBS || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbsl-on{padding-top:4vw}' +
    '.bb-footer.bbsl-on .bbft-lm{display:none}' +
    '.bbsl-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbsl-stage canvas{display:block;width:100%;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;cursor:grab}' +
    '.bbsl-stage canvas.bbsl-drag{cursor:grabbing}' +
    '.bb-footer.bbsl-on .bbft-ig{order:1;margin:2vw 0 0}' +
    '@media (max-width:479px){.bb-footer.bbsl-on{padding-top:24px}.bb-footer.bbsl-on .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);

  B.SEL = '.bb-footer[data-bb-sling]';   // page(s) still to be picked
  B.PATHS = [];
  B.COL = { ink: '#212121', lime: '#CCFF00', purp: '#AE9AE4', lav: '#E9DBEC' };
  B.FOOT_VB = [0, -15, 1697.27, 410];    // footer logo viewBox (same as the invaders game)
  B.CRUMB = 22;                           // loose bits smaller than about this (css px, squared) drop off on their own
  B.WIN_BONUS = 5000;
  B.PTS = 10000;                          // points for smashing the whole logo (scaled by hit combo and fire)
  B.PU_EVERY = 7;                         // seconds between flames dropping (give or take 2s)
  B.FACE = false;                         // true = the pebble is a little character (face + stick arms); or add data-bb-face to the footer
  B.FIRE_TIME = 8;                        // seconds the FIRE power-up lasts
  // FIRE power-up sprite (same pixel flame as the bricks game). O = ink outline, L = lime flame, V = lavender core
  B.FIRE = ['.....O.....', '....OLO....', '...OLLO.O..', '...OLLLOLO.', '..OLLLLLLO.', '.OLLLVLLLLO', '.OLLVVLLLLO', 'OLLVVVVLLLO', 'OLLVVVVVLLO', 'OLLVVVVVLLO', '.OLLVVVLLO.', '..OLLLLLO..', '...OOOOO...'];
  B.MAX_HITS = 3;                         // shatters per pebble before it just drops
  B.MAX_PIECES = 160;

  // Bounding box of the drawn logo in viewBox units (logos don't always fill their viewBox)
  B.bbox = function (paths, vb) {
    var w = 600, h = Math.max(1, Math.round(600 * vb[3] / vb[2])), c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.scale(w / vb[2], h / vb[3]); x.translate(-vb[0], -vb[1]);
    for (var i = 0; i < paths.length; i++) x.fill(new Path2D(paths[i]));
    var d = x.getImageData(0, 0, w, h).data, x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) if (d[(yy * w + xx) * 4 + 3] > 40) {
      if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
    }
    if (x1 < 0) return { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
    return { x: vb[0] + x0 * vb[2] / w, y: vb[1] + y0 * vb[3] / h, w: (x1 - x0 + 1) * vb[2] / w, h: (y1 - y0 + 1) * vb[3] / h };
  };

  B.size = function (g) {
    var W = g.st.clientWidth;
    if (!W) return;
    var vh = window.innerHeight || 800, phone = W < 600;
    g.W = W; g.dpr = Math.min(2, window.devicePixelRatio || 1);
    g.fs = Math.round(Math.max(11, Math.min(16, W / 90)));
    g.u = Math.max(0.55, Math.min(1.3, W / 1100));
    var lw = Math.min(W * (phone ? 0.92 : 0.86), 1300), lh = lw * g.bb.h / g.bb.w, maxH = Math.max(160, vh * 0.42);
    if (lh > maxH) { lw *= maxH / lh; lh = maxH; }
    g.lw = Math.round(lw); g.lh = Math.round(lh);
    g.maxPull = Math.round(Math.max(64, Math.min(130, 110 * g.u)));
    g.forkH = Math.round(Math.max(60, Math.min(110, 90 * g.u)));
    g.fw = Math.round(Math.max(18, Math.min(34, 28 * g.u)));
    g.br = g.face ? Math.max(12, Math.round(15 * g.u)) : Math.max(6, Math.round(9 * g.u));
    g.puP = Math.max(2, Math.round(2.2 * g.u));   // flame pixel size (kept small: it's a hard shot)
    var top = Math.round(g.fs * 3.4 + 6), gap = Math.max(phone ? 90 : 120, g.lh * 0.35);
    g.H = Math.round(top + g.lh + gap + g.maxPull + 18);
    g.forkTop = g.H - g.maxPull - 18;
    g.sx = Math.round(W / 2); g.restY = g.forkTop + 3;
    g.grav = 1.7 * g.H;
    g.vmax = Math.sqrt(2 * g.grav * (g.restY - top + 30)) * 1.3;
    g.cv.width = Math.round(W * g.dpr); g.cv.height = Math.round(g.H * g.dpr); g.cv.style.height = g.H + 'px';
    g.ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
    g.ly = top;
    B.buildLogo(g);
  };

  B.buildLogo = function (g) {
    var L = g.L = g.L || { cv: document.createElement('canvas') };
    L.k = g.dpr; L.w = g.lw; L.h = g.lh; L.x = Math.round((g.W - g.lw) / 2); L.y = g.ly;
    L.cw = Math.ceil(g.lw * L.k); L.ch = Math.ceil(g.lh * L.k);
    L.cv.width = L.cw; L.cv.height = L.ch;
    var x = L.ctx = L.cv.getContext('2d', { willReadFrequently: true }), bb = g.bb;
    x.setTransform(L.cw / bb.w, 0, 0, L.ch / bb.h, -bb.x * L.cw / bb.w, -bb.y * L.ch / bb.h);
    x.fillStyle = B.COL.ink;
    for (var i = 0; i < g.paths.length; i++) x.fill(new Path2D(g.paths[i]));
    x.setTransform(1, 0, 0, 1, 0, 0);
    L.m = new Uint8Array(L.cw * L.ch);
    B.readMask(L, 0, 0, L.cw, L.ch);
    L.total = B.count(L) || 1; L.alive = L.total;
    g.pct = 0; g.win = 0; g.pieces = []; g.parts = []; g.pops = []; g.fade = 0;
    g.pu = null; g.puT = B.PU_EVERY; g.fire = 0; g.score = 0;
  };
  B.readMask = function (L, x0, y0, w, h) {
    x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0);
    w = Math.min(L.cw - x0, Math.ceil(w)); h = Math.min(L.ch - y0, Math.ceil(h));
    if (w <= 0 || h <= 0) return;
    var d = L.ctx.getImageData(x0, y0, w, h).data;
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) L.m[(y0 + yy) * L.cw + x0 + xx] = d[(yy * w + xx) * 4 + 3];
  };
  B.count = function (L) {
    var n = 0, m = L.m;
    for (var yy = 0; yy < L.ch; yy += 3) for (var xx = 0, o = yy * L.cw; xx < L.cw; xx += 3) if (m[o + xx] > 100) n++;
    return n;
  };
  B.solid = function (g, x, y) {
    var L = g.L, px = ((x - L.x) * L.k) | 0, py = ((y - L.y) * L.k) | 0;
    if (px < 0 || py < 0 || px >= L.cw || py >= L.ch) return false;
    return L.m[py * L.cw + px] > 100;
  };
  B.hitLogo = function (g, b) {
    if (B.solid(g, b.x, b.y)) return true;
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6, rr = (i & 1 ? 0.55 : 1) * g.br;
      if (B.solid(g, b.x + Math.cos(a) * rr, b.y + Math.sin(a) * rr)) return true;
    }
    return false;
  };
})();

// Shattering: radial cracks + jittered rings make irregular shards; each one is cut from the logo and set loose
(function () {
  var B = window.BBS;
  B.shatter = function (g, b) {
    var L = g.L, k = L.k, sp = Math.hypot(b.vx, b.vy), e = Math.max(0.35, Math.min(1, sp / g.vmax));
    var ix = b.x - L.x, iy = b.y - L.y;                       // impact, logo-local css px
    var R = (28 + 52 * e) * Math.max(0.6, L.w / 1000) * (b.fire ? 1.5 : 1);
    var nr = 7 + ((Math.random() * 4) | 0), ang = [], i, j;
    for (i = 0; i < nr; i++) ang.push((i + 0.25 + Math.random() * 0.5) * Math.PI * 2 / nr + Math.random() * 0.2);
    ang.sort(function (p, q) { return p - q; });
    var rings = [0, 0.38, 0.72, 1], P = [];                     // P[ray][ring] = vertex
    for (i = 0; i < nr; i++) {
      P.push([]);
      for (j = 0; j < rings.length; j++) {
        var rr = j ? R * rings[j] * (0.78 + Math.random() * 0.44) : 0, aj = ang[i] + (j ? (Math.random() - 0.5) * 0.25 : 0);
        P[i].push({ x: ix + Math.cos(aj) * rr, y: iy + Math.sin(aj) * rr });
      }
    }
    // cut every shard before erasing anything
    var made = 0;
    for (i = 0; i < nr; i++) {
      var i2 = (i + 1) % nr;
      for (j = 0; j < rings.length - 1; j++) {
        var poly = j ? [P[i][j], P[i2][j], P[i2][j + 1], P[i][j + 1]] : [P[i][0], P[i2][1], P[i][1]];
        if (B.cutShard(g, poly, ix, iy, b, e)) made++;
      }
    }
    // erase the whole broken area
    var x = L.ctx;
    x.save(); x.globalCompositeOperation = 'destination-out'; x.scale(k, k);
    x.beginPath();
    for (i = 0; i < nr; i++) { var o = P[i][rings.length - 1]; i ? x.lineTo(o.x, o.y) : x.moveTo(o.x, o.y); }
    x.closePath(); x.fill();
    // hairline cracks running out from the hole
    x.lineWidth = Math.max(0.8, 1.2 * g.u); x.lineCap = 'round'; x.lineJoin = 'round';
    var reach = 0;
    for (i = 0; i < nr; i++) {
      if (Math.random() > 0.65) continue;
      var v = P[i][rings.length - 1], a = ang[i], len = R * (0.35 + Math.random() * 0.75) * e, mx, my, ex, ey;
      a += (Math.random() - 0.5) * 0.5; mx = v.x + Math.cos(a) * len * 0.5; my = v.y + Math.sin(a) * len * 0.5;
      a += (Math.random() - 0.5) * 0.9; ex = mx + Math.cos(a) * len * 0.5; ey = my + Math.sin(a) * len * 0.5;
      x.beginPath(); x.moveTo(v.x, v.y); x.lineTo(mx, my); x.lineTo(ex, ey); x.stroke();
      reach = Math.max(reach, Math.hypot(ex - ix, ey - iy));
    }
    x.restore();
    var ext = Math.max(R * 1.3, reach) + 4;
    B.readMask(L, (ix - ext) * k, (iy - ext) * k, ext * 2 * k, ext * 2 * k);
    var before = L.alive;
    L.alive = B.count(L);
    g.pct = Math.max(0, Math.min(1, 1 - L.alive / L.total));
    // score: share of the logo knocked out, x combo for each extra hit by the same pebble, x2 on fire
    var pts = Math.round((before - L.alive) / L.total * B.PTS) * (b.hits + 1) * (b.fire ? 2 : 1);
    if (pts > 0) { g.score += pts; B.pop(g, b.x, b.y - 14, '+' + pts); }
    var left = B.sweep(g);   // tiny loose crumbs and slivers fall away; win only once nothing at all is left
    if (!left) B.finale(g);
    else { L.alive = B.count(L); g.pct = Math.min(0.999, 1 - L.alive / L.total); }
    // sparks + a little shake
    B.burst(g, b.x, b.y, g.rm ? 6 : 14, e);
    if (!g.rm) g.shake = Math.max(g.shake, 5 * e);
    while (g.pieces.length > B.MAX_PIECES * 2) g.pieces.shift();
    return made;
  };
  // Crumb sweep: find every separate bit of logo left (2px grid); bits too small or thin to aim at drop off and fall.
  // Returns how many grid cells of logo are still standing.
  B.sweep = function (g) {
    var L = g.L, k = L.k, gw = Math.ceil(L.cw / 2), gh = Math.ceil(L.ch / 2), m = L.m, cw = L.cw, ch = L.ch;
    var on = new Uint8Array(gw * gh), lab = new Int32Array(gw * gh), x, y, i;
    for (y = 0; y < gh; y++) for (x = 0; x < gw; x++) {
      var px = x * 2, py = y * 2, o = py * cw + px;
      if (m[o] > 20 || (px + 1 < cw && m[o + 1] > 20) || (py + 1 < ch && (m[o + cw] > 20 || (px + 1 < cw && m[o + cw + 1] > 20)))) on[y * gw + x] = 1;
    }
    var q = new Int32Array(gw * gh), n = 0, left = 0, cell = 2 / k, minA = B.CRUMB * B.CRUMB * g.u * g.u, cut = [];
    for (i = 0; i < gw * gh; i++) {
      if (!on[i] || lab[i]) continue;
      n++; var h = 0, t = 0, x0 = gw, x1 = 0, y0 = gh, y1 = 0; q[t++] = i; lab[i] = n;
      while (h < t) {
        var c = q[h++], cx = c % gw, cy = (c / gw) | 0;
        if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
        if (cx > 0 && on[c - 1] && !lab[c - 1]) { lab[c - 1] = n; q[t++] = c - 1; }
        if (cx < gw - 1 && on[c + 1] && !lab[c + 1]) { lab[c + 1] = n; q[t++] = c + 1; }
        if (cy > 0 && on[c - gw] && !lab[c - gw]) { lab[c - gw] = n; q[t++] = c - gw; }
        if (cy < gh - 1 && on[c + gw] && !lab[c + gw]) { lab[c + gw] = n; q[t++] = c + gw; }
      }
      var area = t * cell * cell, span = Math.max(x1 - x0 + 1, y1 - y0 + 1) * cell;
      if (area < minA || area / span < 3.5 * g.u) cut.push({ n: n, x0: x0, y0: y0, x1: x1, y1: y1 });
      else left += t;
    }
    for (i = 0; i < cut.length; i++) B.dropCrumb(g, cut[i], lab, gw);
    return left;
  };
  B.dropCrumb = function (g, c, lab, gw) {
    var L = g.L, k = L.k, X = c.x0 * 2, Y = c.y0 * 2, w = Math.min(L.cw - X, (c.x1 - c.x0 + 1) * 2), h = Math.min(L.ch - Y, (c.y1 - c.y0 + 1) * 2);
    var img = L.ctx.getImageData(X, Y, w, h), d = img.data, keep = new Uint8ClampedArray(d.length);
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
      var j = (yy * w + xx) * 4;
      if (lab[(((Y + yy) >> 1)) * gw + ((X + xx) >> 1)] === c.n) {
        keep[j] = d[j]; keep[j + 1] = d[j + 1]; keep[j + 2] = d[j + 2]; keep[j + 3] = d[j + 3];
        d[j + 3] = 0; L.m[(Y + yy) * L.cw + X + xx] = 0;
      }
    }
    L.ctx.putImageData(img, X, Y);
    var pc = document.createElement('canvas'); pc.width = w; pc.height = h;
    pc.getContext('2d').putImageData(new ImageData(keep, w, h), 0, 0);
    g.pieces.push({ c: pc, w: w / k, h: h / k, x: L.x + (X + w / 2) / k, y: L.y + (Y + h / 2) / k,
      vx: (Math.random() - 0.5) * 60 * g.u, vy: -Math.random() * 40 * g.u, a: 0, va: (Math.random() - 0.5) * 6 });
  };
  // Win: the logo is completely gone
  B.finale = function (g) {
    var L = g.L;
    L.ctx.clearRect(0, 0, L.cw, L.ch); L.m.fill(0); L.alive = 0; g.pct = 1;
    g.score += B.WIN_BONUS; g.win = g.t; g.pu = null; g.fire = 0;
    B.pop(g, g.W / 2, L.y + L.h * 0.45 - 60, '+' + B.WIN_BONUS);
    if (g.score > g.best) { g.best = g.score; try { localStorage.setItem('bbSlingBest', g.best); } catch (e) {} }
    B.burst(g, g.sx, L.y + L.h / 2, g.rm ? 12 : 40, 1);
  };
  B.pop = function (g, x, y, txt) { g.pops.push({ x: x, y: y, t: 0, s: txt }); };
  B.cutShard = function (g, poly, ix, iy, b, e, boost) {
    var L = g.L, k = L.k, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, i;
    for (i = 0; i < poly.length; i++) { x0 = Math.min(x0, poly[i].x); y0 = Math.min(y0, poly[i].y); x1 = Math.max(x1, poly[i].x); y1 = Math.max(y1, poly[i].y); }
    x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.ceil(x1); y1 = Math.ceil(y1);
    if (x1 < 0 || y1 < 0 || x0 > L.w || y0 > L.h) return false;
    var w = x1 - x0, h = y1 - y0;
    if (w < 1 || h < 1) return false;
    var c = document.createElement('canvas'); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
    var x = c.getContext('2d', { willReadFrequently: true });
    x.scale(k, k); x.beginPath();
    for (i = 0; i < poly.length; i++) i ? x.lineTo(poly[i].x - x0, poly[i].y - y0) : x.moveTo(poly[i].x - x0, poly[i].y - y0);
    x.closePath(); x.clip();
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.drawImage(L.cv, -x0 * k, -y0 * k);
    var d = x.getImageData(0, 0, c.width, c.height).data, n = 0;
    for (i = 3; i < d.length; i += 16) if (d[i] > 100) n++;
    if (n < 1) return false;
    var cx = x0 + w / 2, cy = y0 + h / 2, dx = cx - ix, dy = cy - iy, dl = Math.hypot(dx, dy) || 1, kick = (50 + Math.random() * 170) * e * g.u * (boost || 1);
    g.pieces.push({
      c: c, w: w, h: h, x: L.x + cx, y: L.y + cy,
      vx: dx / dl * kick + b.vx * 0.12 + (Math.random() - 0.5) * 40,
      vy: dy / dl * kick + b.vy * 0.12 - (120 + Math.random() * 160) * g.u,
      a: 0, va: (Math.random() - 0.5) * 8
    });
    return true;
  };
  B.burst = function (g, x, y, n, e) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = (80 + Math.random() * 320) * e * g.u;
      g.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.35 + Math.random() * 0.45, t: 0,
        c: Math.random() < 0.7 ? B.COL.lime : B.COL.ink, s: Math.random() < 0.5 ? 2 : 3 });
    }
  };
})();

// Input, physics and drawing
(function () {
  var B = window.BBS;
  B.input = function (g) {
    var cv = g.cv;
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function onPill(p) { var b = g.rb; return b && p.x >= b.x - 6 && p.x <= b.x + b.w + 6 && p.y >= b.y - 6 && p.y <= b.y + b.h + 6; }
    // touch only grabs below the logo (or right by the sling) so the rest of the footer still scrolls the page
    function zone(p) { return p.y > g.L.y + g.L.h - 4 || Math.hypot(p.x - g.sx, p.y - g.restY) < 100; }
    cv.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      var r = cv.getBoundingClientRect(), t = e.touches[0], p = { x: t.clientX - r.left, y: t.clientY - r.top };
      if (zone(p) || onPill(p)) e.preventDefault();
    }, { passive: false });
    cv.addEventListener('pointerdown', function (e) {
      var p = pos(e);
      if (onPill(p)) { B.restore(g); return; }
      if (e.button > 0 || (e.pointerType !== 'mouse' && !zone(p))) return;
      g.drag = { x: p.x, y: p.y, id: e.pointerId }; g.pull = { x: 0, y: 0 };
      cv.classList.add('bbsl-drag');
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) {
      var p = pos(e);
      cv.style.cursor = onPill(p) ? 'pointer' : '';
      if (!g.drag || e.pointerId !== g.drag.id) return;
      var dx = p.x - g.drag.x, dy = p.y - g.drag.y, l = Math.hypot(dx, dy);
      if (l > g.maxPull) { dx *= g.maxPull / l; dy *= g.maxPull / l; }
      g.pull = { x: dx, y: dy };
    });
    function end(e, shoot) {
      if (!g.drag || e.pointerId !== g.drag.id) return;
      g.drag = null; cv.classList.remove('bbsl-drag');
      if (shoot) B.fire(g); else g.pull = { x: 0, y: 0 };
    }
    cv.addEventListener('pointerup', function (e) { end(e, true); });
    cv.addEventListener('pointercancel', function (e) { end(e, false); });
  };
  B.fire = function (g) {
    var p = g.pull, l = Math.hypot(p.x, p.y);
    g.twang = { x: p.x, y: p.y, t: 0 };
    g.pull = { x: 0, y: 0 };
    if (l < 10 || !g.loaded) return;
    var sp = g.vmax * (0.3 + 0.7 * l / g.maxPull);
    g.balls.push({ x: g.sx + p.x, y: g.restY + p.y, vx: -p.x / l * sp, vy: -p.y / l * sp, hits: 0, cool: 0, fire: g.fire > 0 });
    if (g.balls.length > 6) g.balls.shift();
    g.loaded = false; g.reload = 0.32; g.shots++;
  };
  B.restore = function (g) {
    if (g.win && g.score > g.best) { g.best = g.score; try { localStorage.setItem('bbSlingBest', g.best); } catch (e) {} }
    B.buildLogo(g);
    g.balls = []; g.shots = 0;
  };
  B.path = function (g, n, dt) {   // aim preview dots
    var p = g.pull, l = Math.hypot(p.x, p.y), out = [];
    if (l < 10) return out;
    var sp = g.vmax * (0.3 + 0.7 * l / g.maxPull), x = g.sx + p.x, y = g.restY + p.y, vx = -p.x / l * sp, vy = -p.y / l * sp;
    for (var i = 0; i < n; i++) { for (var s = 0; s < 3; s++) { vy += g.grav * dt / 3; x += vx * dt / 3; y += vy * dt / 3; } out.push({ x: x, y: y }); }
    return out;
  };

  B.update = function (g, dt) {
    g.t += dt;
    if (!g.loaded) { g.reload -= dt; if (g.reload <= 0) { g.loaded = true; g.pop = 0; } }
    g.pop = Math.min(1, g.pop + dt * 5);
    if (g.fade < 1) g.fade = Math.min(1, g.fade + dt * 2.5);
    g.shake *= Math.pow(0.0005, dt);
    if (g.twang) { g.twang.t += dt; if (g.twang.t > 0.4) g.twang = null; }
    if (g.fire > 0) g.fire = Math.max(0, g.fire - dt);
    // falling flame: only once you've started playing; shoot it to light up
    if (g.shots && !g.win && !g.pu && !g.fire) {
      g.puT -= dt;
      if (g.puT <= 0) {
        var L0 = g.L;
        g.pu = { x0: L0.x + L0.w * (0.06 + Math.random() * 0.88), x: 0, y: -20, vy: g.H * (0.5 + Math.random() * 0.25), t: Math.random() * 6 };
        g.puT = B.PU_EVERY + (Math.random() - 0.5) * 4;
      }
    }
    if (g.pu) {
      var pu = g.pu; pu.t += dt; pu.y += pu.vy * dt;                  // drops fast, top to bottom, with a little wobble
      pu.x = pu.x0 + Math.sin(pu.t * 7) * 10 * g.u;
      if (!g.rm && Math.random() < 0.6) g.parts.push({ x: pu.x + (Math.random() - 0.5) * 8, y: pu.y - 12, vx: 0, vy: -pu.vy * 0.15, life: 0.25, t: 0, c: B.COL.lime, s: 2 });
      if (pu.y > g.H + 30) g.pu = null;
    }
    for (var pi = g.pops.length - 1; pi >= 0; pi--) { g.pops[pi].t += dt; if (g.pops[pi].t > 1) g.pops.splice(pi, 1); }
    var i, b;
    for (i = g.balls.length - 1; i >= 0; i--) {
      b = g.balls[i]; b.t = (b.t || 0) + dt;
      var sp = Math.hypot(b.vx, b.vy), n = Math.min(20, Math.max(1, Math.ceil(sp * dt / (g.br * 0.7)))), h = dt / n;
      for (var s = 0; s < n; s++) {
        b.vy += g.grav * h; b.x += b.vx * h; b.y += b.vy * h;
        if (g.pu && Math.hypot(b.x - g.pu.x, b.y - g.pu.y) < g.br + 7 * g.puP) {   // shot the flame
          g.fire = B.FIRE_TIME; b.fire = true; B.burst(g, g.pu.x, g.pu.y, g.rm ? 8 : 24, 1);
          B.pop(g, g.pu.x, g.pu.y - 16, 'FIRE!'); g.pu = null;
        }
        if (b.cool > 0) { b.cool -= h; continue; }
        if (b.hits < (b.fire ? B.MAX_HITS + 2 : B.MAX_HITS) && B.hitLogo(g, b)) { B.shatter(g, b); b.hits++; b.vx *= b.fire ? 0.82 : 0.6; b.vy *= b.fire ? 0.82 : 0.6; b.cool = 0.05; }
      }
      if (b.fire && !g.rm && Math.random() < 0.8) g.parts.push({ x: b.x + (Math.random() - 0.5) * g.br, y: b.y + (Math.random() - 0.5) * g.br, vx: -b.vx * 0.08, vy: -b.vy * 0.08 - 40, life: 0.25 + Math.random() * 0.25, t: 0, c: Math.random() < 0.6 ? B.COL.lime : B.COL.lav, s: 3 });
      if (b.y > g.H + 40 || b.x < -80 || b.x > g.W + 80) g.balls.splice(i, 1);
    }
    for (i = g.pieces.length - 1; i >= 0; i--) {
      var pc = g.pieces[i];
      pc.vy += g.grav * dt; pc.x += pc.vx * dt; pc.y += pc.vy * dt; pc.a += pc.va * dt;
      if (pc.y - Math.max(pc.w, pc.h) > g.H + 10) g.pieces.splice(i, 1);
    }
    for (i = g.parts.length - 1; i >= 0; i--) {
      var q = g.parts[i];
      q.t += dt; q.vy += g.grav * 0.6 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.t > q.life) g.parts.splice(i, 1);
    }
  };

  function band(x, ax, ay, bx, by, w) {
    x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.lineWidth = w; x.stroke();
  }
  B.draw = function (g) {
    var x = g.ctx, C = B.COL, L = g.L, u = g.u;
    x.clearRect(0, 0, g.W, g.H);
    x.save();
    if (g.shake > 0.3) x.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
    // logo (fades back in after a restore)
    x.globalAlpha = g.fade;
    x.drawImage(L.cv, L.x, L.y, L.w, L.h);
    x.globalAlpha = 1;
    // falling shards
    for (var i = 0; i < g.pieces.length; i++) {
      var p = g.pieces[i];
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.drawImage(p.c, -p.w / 2, -p.h / 2, p.w, p.h); x.restore();
    }
    // slingshot
    var sx = g.sx, ft = g.forkTop, fw = g.fw, lx = sx - fw, rx = sx + fw, pull = g.pull;
    if (!g.drag && g.twang) {   // band snaps back past the fork and wobbles to rest
      var tt = g.twang.t, damp = Math.exp(-tt * 9) * Math.cos(tt * 38);
      pull = { x: -g.twang.x * 0.35 * damp, y: -g.twang.y * 0.35 * damp };
    }
    var px = sx + pull.x, py = g.restY + pull.y;
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = C.purp;
    band(x, lx, ft, px - g.br * 0.6, py, Math.max(3, 4 * u));            // back band
    x.strokeStyle = C.ink; x.lineWidth = Math.max(5, 7 * u);
    x.beginPath(); x.moveTo(lx, ft); x.quadraticCurveTo(lx, ft + g.forkH * 0.55, sx, ft + g.forkH * 0.6);
    x.quadraticCurveTo(rx, ft + g.forkH * 0.55, rx, ft); x.stroke();
    x.beginPath(); x.moveTo(sx, ft + g.forkH * 0.6); x.lineTo(sx, Math.min(g.H - 4, ft + g.forkH * 1.25)); x.lineWidth = Math.max(6, 9 * u); x.stroke();
    if (g.face) { x.strokeStyle = C.purp; band(x, rx, ft, px + g.br * 0.6, py, Math.max(3, 4 * u)); }   // front band goes behind the character so his face stays clear
    if (g.loaded) {   // pebble in the pouch
      var r = g.br * (0.4 + 0.6 * easeOut(g.pop));
      if (g.face) B.guy(g, x, px, py, r, g.drag ? 'grit' : 'chill', g.t, Math.hypot(pull.x, pull.y) / g.maxPull);
      else { x.fillStyle = C.lime; x.beginPath(); x.arc(px, py, r * (g.fire ? 1.25 : 1), 0, Math.PI * 2); x.fill(); }
    }
    if (!g.face) { x.strokeStyle = C.purp; band(x, rx, ft, px + g.br * 0.6, py, Math.max(3, 4 * u)); }   // front band (in front of a plain pebble)
    x.fillStyle = C.ink;
    x.beginPath(); x.arc(lx, ft, Math.max(3, 4 * u), 0, Math.PI * 2); x.arc(rx, ft, Math.max(3, 4 * u), 0, Math.PI * 2); x.fill();
    // aim dots
    if (g.drag) {
      var pts = B.path(g, 12, 0.045);
      for (i = 0; i < pts.length; i++) {
        x.globalAlpha = 0.75 * (1 - i / pts.length); x.fillStyle = C.ink;
        x.beginPath(); x.arc(pts[i].x, pts[i].y, Math.max(1.5, 2.5 * u * (1 - i / pts.length * 0.5)), 0, Math.PI * 2); x.fill();
      }
      x.globalAlpha = 1;
    }
    // pebbles in flight
    for (i = 0; i < g.balls.length; i++) {
      var b = g.balls[i];
      if (g.face) B.guy(g, x, b.x, b.y, g.br * (b.fire ? 1.15 : 1), 'cheer', b.t, 1);
      else { x.fillStyle = C.lime; x.beginPath(); x.arc(b.x, b.y, g.br * (b.fire ? 1.25 : 1), 0, Math.PI * 2); x.fill(); }
    }
    if (g.pu) B.sprite(x, B.FIRE, g.pu.x, g.pu.y + (Math.sin(g.t * 9) > 0 ? 0 : -1), g.puP);
    // sparks
    for (i = 0; i < g.parts.length; i++) {
      var q = g.parts[i];
      x.globalAlpha = Math.max(0, 1 - q.t / q.life); x.fillStyle = q.c;
      x.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
    }
    x.globalAlpha = 1;
    x.restore();
    B.hud(g);
  };
  // The pebble as a character: lime ball, ink face and stick arms. Moods: chill (waiting), grit (being pulled), cheer (flying)
  B.guy = function (g, x, cx, cy, r, mood, t, k) {
    var C = B.COL, lw = Math.max(1.6, r * 0.13);
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = C.ink; x.lineWidth = lw;
    function arm(side, a1, a2) {   // shoulder -> elbow -> hand; angles in radians, 0 = pointing outwards
      var sx = cx + side * r * 0.92, sy = cy + r * 0.2, L1 = r * 0.6, L2 = r * 0.55;
      var ex = sx + side * Math.cos(a1) * L1, ey = sy + Math.sin(a1) * L1, hx = ex + side * Math.cos(a2) * L2, hy = ey + Math.sin(a2) * L2;
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(ex, ey); x.lineTo(hx, hy); x.stroke();
    }
    var shake = mood === 'grit' ? (Math.random() - 0.5) * r * 0.08 * k : 0;
    cx += shake;
    if (mood === 'chill') {          // arms hanging loose, a gentle sway
      var sw = Math.sin(t * 2) * 0.08;
      arm(-1, 1.15 + sw, 1.45 + sw); arm(1, 1.15 - sw, 1.45 - sw);
    } else if (mood === 'grit') {    // gripping the bands up by the fork
      var tr = Math.sin(t * 40) * 0.05 * k;
      arm(-1, -0.7 + tr, -1.3 + tr); arm(1, -0.7 - tr, -1.3 - tr);
    } else {                          // cheering: both arms up, waving
      var wv = Math.sin(t * 16) * 0.35;
      arm(-1, -1.0, -1.5 + wv); arm(1, -1.0, -1.5 - wv);
    }
    x.fillStyle = C.lime; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    var ex = r * 0.34, ey = cy - r * 0.16, er = r * 0.15;
    x.fillStyle = C.ink;
    if (mood === 'chill') {
      var blink = (t % 3.2) < 0.12;
      for (var s = -1; s <= 1; s += 2) {
        x.beginPath();
        if (blink) { x.moveTo(cx + s * ex - er, ey); x.lineTo(cx + s * ex + er, ey); x.stroke(); }
        else { x.arc(cx + s * ex, ey, er, 0, Math.PI); x.fill(); }   // relaxed, half-closed
      }
      x.beginPath(); x.arc(cx, cy + r * 0.12, r * 0.28, 0.25 * Math.PI, 0.75 * Math.PI); x.stroke();   // easy smile
    } else if (mood === 'grit') {
      for (s = -1; s <= 1; s += 2) {   // screwed-up eyes: > <
        x.beginPath(); x.moveTo(cx + s * ex - s * er, ey - er); x.lineTo(cx + s * ex + s * er * 0.6, ey); x.lineTo(cx + s * ex - s * er, ey + er); x.stroke();
      }
      var mw = r * (0.55 + 0.2 * k), mh = r * 0.26, my = cy + r * 0.38;   // gritted teeth
      x.beginPath(); if (x.roundRect) x.roundRect(cx - mw / 2, my - mh / 2, mw, mh, mh * 0.3); else x.rect(cx - mw / 2, my - mh / 2, mw, mh); x.fill();
      x.strokeStyle = C.lime; x.lineWidth = Math.max(1, lw * 0.6);
      x.beginPath(); x.moveTo(cx - mw / 2 + lw, my); x.lineTo(cx + mw / 2 - lw, my);
      for (var tq = 1; tq < 4; tq++) { var tx2 = cx - mw / 2 + mw * tq / 4; x.moveTo(tx2, my - mh / 2 + lw * 0.4); x.lineTo(tx2, my + mh / 2 - lw * 0.4); }
      x.stroke();
    } else {
      for (s = -1; s <= 1; s += 2) { x.beginPath(); x.arc(cx + s * ex, ey - r * 0.04, er * 1.15, 0, Math.PI * 2); x.fill(); }   // wide-eyed
      x.beginPath(); x.moveTo(cx - r * 0.38, cy + r * 0.14); x.arc(cx, cy + r * 0.14, r * 0.38, 0, Math.PI); x.closePath(); x.fill();   // big open grin
    }
    x.restore();
  };
  B.sprite = function (x, rows, cx, cy, P) {
    var c = { O: B.COL.ink, L: B.COL.lime, V: B.COL.lav }, w = rows[0].length, h = rows.length, ox = Math.round(cx - w * P / 2), oy = Math.round(cy - h * P / 2);
    for (var r = 0; r < h; r++) for (var q = 0; q < w; q++) { var ch = rows[r][q]; if (c[ch]) { x.fillStyle = c[ch]; x.fillRect(ox + q * P, oy + r * P, P, P); } }
  };
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  B.hud = function (g) {
    var x = g.ctx, fs = g.fs, y = Math.round(fs * 1.6), C = B.COL;
    x.font = '500 ' + fs + 'px ' + g.font; x.textBaseline = 'middle'; x.fillStyle = C.ink;
    x.textAlign = 'left';
    x.fillText('Score ' + g.score.toLocaleString('en-GB') + (g.best ? '   Best ' + g.best.toLocaleString('en-GB') : ''), 16, y);
    x.textAlign = 'center';
    if (g.fire > 0) {
      B.sprite(x, B.FIRE, g.W / 2 - fs * 2.4, y, Math.max(1, Math.round(fs / 10)));
      x.fillText('Fire ' + Math.ceil(g.fire) + 's', g.W / 2 + 6, y);
    } else if (g.shots) x.fillText(Math.floor(g.pct * 100) + '% smashed', g.W / 2, y);
    for (var pi = 0; pi < g.pops.length; pi++) {   // score pop-ups
      var pp = g.pops[pi];
      x.globalAlpha = Math.max(0, 1 - pp.t); x.fillStyle = '#CCFF00';
      x.font = '700 ' + Math.round(fs * 1.3) + 'px ' + g.font;
      x.fillText(pp.s, pp.x, pp.y - pp.t * 30);
    }
    x.globalAlpha = 1; x.fillStyle = C.ink; x.font = '500 ' + fs + 'px ' + g.font;
    g.rb = null;
    if (g.pct > 0) {   // Restore logo pill, top right
      var t = 'Restore logo', tw = x.measureText(t).width, ph = fs + 12, pw = tw + 24, bx = g.W - 16 - pw, by = y - ph / 2;
      x.strokeStyle = C.ink; x.lineWidth = 1.5;
      x.beginPath(); if (x.roundRect) x.roundRect(bx, by, pw, ph, ph / 2); else x.rect(bx, by, pw, ph); x.stroke();
      x.textAlign = 'center'; x.fillText(t, bx + pw / 2, y);
      g.rb = { x: bx, y: by, w: pw, h: ph };
    }
    if (!g.shots && !g.drag) {   // first-time hint above the sling
      x.textAlign = 'center'; x.globalAlpha = 0.6 + 0.4 * Math.sin(g.t * 3);
      x.fillText(g.touch ? 'Drag the pebble back and let go' : 'Pull back and let go', g.sx, g.forkTop - g.br - fs * 1.4);
      x.globalAlpha = 1;
    }
    if (g.win) {
      var a = Math.min(1, (g.t - g.win) * 3), big = Math.round(Math.max(28, Math.min(72, g.W / 14)));
      x.globalAlpha = a; x.textAlign = 'center';
      x.font = '700 ' + big + 'px ' + g.font; x.fillText('Smashed it.', g.W / 2, g.L.y + g.L.h * 0.45);
      x.font = '500 ' + fs + 'px ' + g.font;
      x.fillText('Score ' + g.score.toLocaleString('en-GB') + ' in ' + g.shots + ' shots. Restore the logo to go again', g.W / 2, g.L.y + g.L.h * 0.45 + big * 0.85);
      x.globalAlpha = 1;
    }
  };
})();

// Mount on the chosen footer (also after Barba page transitions)
(function () {
  var B = window.BBS;
  function footer() {
    var f = document.querySelector(B.SEL);
    if (f) return f;
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (B.PATHS.indexOf(path) < 0) return null;
    var cs = document.querySelectorAll('[data-barba="container"]'), c = cs[cs.length - 1];
    return (c && c.querySelector('.bb-footer')) || document.querySelector('.bb-footer');
  }
  B.mount = function () {
    if (B.g) { B.g.stop(); B.g = null; }
    var f = footer();
    if (!f) return;
    var paths = [].map.call(f.querySelectorAll('.bbft-lm .bbft-l'), function (p) { return p.getAttribute('data-bb-d') || p.getAttribute('d'); }).filter(Boolean), vb = B.FOOT_VB;
    if (!paths.length && window.BBB && window.BBB.LOGO) { paths = window.BBB.LOGO; vb = [0, 0, window.BBB.VW, window.BBB.VH]; }
    if (!paths.length) return;
    f.classList.add('bbsl-on');
    var st = f.querySelector('.bbsl-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbsl-stage'; st.innerHTML = '<canvas aria-label="Mini game: pull back the slingshot and shatter the Brave Beyond logo"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas');
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), paths: paths, bb: B.bbox(paths, vb), balls: [], pieces: [], parts: [], pull: { x: 0, y: 0 },
      drag: null, best: 0, loaded: true, reload: 0, pop: 1, shots: 0, shake: 0, t: 0, W: 0, pct: 0, fade: 1,
      touch: window.matchMedia && matchMedia('(hover: none)').matches, rm: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    g.face = !!(B.FACE || f.hasAttribute('data-bb-face'));
    try { g.best = +localStorage.getItem('bbSlingBest') || 0; } catch (e) {}
    B.size(g); B.input(g);
    if (g.L) g.fade = 1;
    var raf = 0, last = performance.now(), dead = false, lastW = g.W;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { if (st.clientWidth !== lastW) { lastW = st.clientWidth; B.size(g); g.fade = 1; } }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (!g.W) { B.size(g); g.fade = 1; }
      var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      g.vis = r.bottom > 0 && r.top < vh && r.width > 0;
      if (g.vis && g.W) { B.update(g, dt); B.draw(g); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    g.stop = function () { dead = true; cancelAnimationFrame(raf); if (ro) ro.disconnect(); };
    B.g = g;
  };
  B.mount();
  (function hook() {
    if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
    barba.hooks.before(function () { if (B.g) { B.g.stop(); B.g = null; } });
    barba.hooks.after(function () { B.mount(); });
  })();
})();
