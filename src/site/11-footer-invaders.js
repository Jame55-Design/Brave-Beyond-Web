// BB Footer Invaders: Space Invaders in the footer on the home and Free Goodies pages.
// Shots chip away at the pixelated Brave Beyond logo on their way up to the invaders.
// A black propeller plane towing the Brave Beyond logo flies over about every 15 seconds: hit it for 100 points.
// Pages: set in B.SEL below (Barba namespace + .bb-footer).

// Styles, pages it runs on, colours and sprites
(function () {
  var B = window.BBI = window.BBI || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbinv-on{padding-top:6vw}' +
    '.bb-footer.bbinv-on .bbft-lm{display:none}' +
    '.bbinv-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbinv-stage canvas{display:block;width:100%;touch-action:pan-y;-webkit-user-select:none;user-select:none}' +
    // Instagram sits centred just above Privacy Policy (order 1, before the tag in the DOM) on every footer
    '.bb-footer .bbft-ig{order:1;margin:2vw 0 0}' +
    '@media (max-width:479px){.bb-footer.bbinv-on{padding-top:32px}.bb-footer .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);
  B.SEL = '[data-barba-namespace="home"] .bb-footer,[data-barba-namespace="goodies"] .bb-footer';
  B.COL = { g: '#07A87E', ink: '#212121', lime: '#CEFF38', lav: '#E9DBEC', pts: '#CCFF00' };
  B.ROWC = ['#CCFF00', '#D0C6E9', '#E9DBEC']; // alien colour per row, top to bottom
  B.BLOB = [
    // Cyclops blob: one big eye, wobbly frill
    ['..XXXX..', '.XXXXXX.', 'XXX..XXX', 'XXXXXXXX', 'XXXXXXXX', 'X.X.X.X.'],
    ['..XXXX..', '.XXXXXX.', 'XXX..XXX', 'XXXXXXXX', 'XXXXXXXX', '.X.X.X.X']
  ];
  B.SHIP = ['.....X.....', '....XXX....', '...XXXXX...', '.XXXXXXXXX.', 'XXXXXXXXXXX', 'XX.X...X.XX'];
  // 3x5 pixel font for score pop-ups
  B.FONT = {
    '+': ['...', '.X.', 'XXX', '.X.', '...'],
    '0': ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
    '1': ['.X.', 'XX.', '.X.', '.X.', 'XXX']
  };
  // Draw pixel text centred on (cx, cy)
  B.pixText = function (ctx, str, cx, cy, px, c) {
    var w = str.length * 4 * px - px, x0 = Math.round(cx - w / 2), y0 = Math.round(cy - 2.5 * px);
    for (var i = 0; i < str.length; i++) { var gl = B.FONT[str[i]]; if (gl) B.spr(ctx, gl, x0 + i * 4 * px, y0, c, px); }
  };
  // Old-school propeller plane, nose facing right, all black
  B.PLANE = [
    'XX..................',
    'XXX......WWWWWWW....',
    'XXXX.....W.....W....',
    'XXXXXXXXXXXXXXXXXXX.',
    '.XXXXXXXXXXXCCXXXXXX',
    '..XXXXXXXXXXXXXXXXX.',
    '.........WWWWWWW....',
    '..........X....X....',
    '.........XXX..XXX...'
  ];
  B.spr = function (ctx, rows, x, y, c, px) {
    ctx.fillStyle = c;
    for (var r = 0; r < rows.length; r++)
      for (var k = 0; k < rows[r].length; k++)
        if (rows[r][k] === 'X') ctx.fillRect(Math.round(x + k * px), Math.round(y + r * px), px, px);
  };
  // Multi-colour sprite; flip mirrors it left-right
  B.spr2 = function (ctx, rows, x, y, px, map, flip) {
    var n = rows[0].length;
    for (var r = 0; r < rows.length; r++)
      for (var k = 0; k < n; k++) {
        var c = map[rows[r][k]];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(Math.round(x + (flip ? n - 1 - k : k) * px), Math.round(y + r * px), px, px);
      }
  };
  B.part = (B.part || 0) + 1;
})();

// pixel logo build + damage, banner, HUD button
(function () {
  var B = window.BBI = window.BBI || {};
  var VB = [0, -15, 1697.27, 410];
  // Rasterise the logo paths at w cells wide; returns {w, h, a} cropped to the lettering (a = alpha mask)
  B.raster = function (paths, w) {
    var h = Math.round(w * VB[3] / VB[2]);
    var t = document.createElement('canvas'); t.width = w; t.height = h;
    var x = t.getContext('2d');
    x.scale(w / VB[2], h / VB[3]); x.translate(-VB[0], -VB[1]);
    for (var i = 0; i < paths.length; i++) x.fill(new Path2D(paths[i]));
    var src = x.getImageData(0, 0, w, h).data, y0 = h, y1 = 0, yy;
    for (i = 0; i < w * h; i++) if (src[i * 4 + 3] > 110) { yy = (i / w) | 0; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    var H2 = Math.max(1, y1 - y0 + 1), o = y0 * w, a = new Uint8Array(w * H2);
    for (i = 0; i < w * H2; i++) a[i] = src[(i + o) * 4 + 3] > 110 ? 1 : 0;
    return { w: w, h: H2, a: a };
  };
  B.buildLogo = function (g) {
    var L = g.logo, C = g.C, r = B.raster(g.paths, Math.floor(g.W * 0.98 / C));
    L.w = r.w; L.h = r.h; L.cv.width = r.w; L.cv.height = r.h;
    var lc = L.cv.getContext('2d');
    L.img = lc.createImageData(r.w, r.h); L.cells = r.a;
    var n = 0, d = L.img.data;
    for (var i = 0; i < r.w * r.h; i++) if (r.a[i]) { n++; d[i * 4 + 1] = 1; d[i * 4 + 2] = 1; d[i * 4 + 3] = 255; }
    L.total = n || 1; L.alive = n;
    L.x = Math.round((g.W - r.w * C) / 2);
    L.y = g.H - 96 - r.h * C;
    lc.putImageData(L.img, 0, 0);
  };
  // Banner: the logo on its own in ink (transparent background), rendered fine like the footer logo
  B.buildBanner = function (g) {
    var r = B.raster(g.paths, g.W < 600 ? 170 : 260), pad = 3;
    var bw = r.w + pad * 2, bh = r.h + pad * 2;
    var c = document.createElement('canvas'); c.width = bw; c.height = bh;
    var x = c.getContext('2d'), img = x.createImageData(bw, bh), d = img.data;
    for (var yy = 0; yy < bh; yy++) for (var xx = 0; xx < bw; xx++) {
      var i = (yy * bw + xx) * 4, on = xx >= pad && yy >= pad && xx < pad + r.w && yy < pad + r.h && r.a[(yy - pad) * r.w + (xx - pad)];
      if (on) { d[i] = 0; d[i + 1] = 1; d[i + 2] = 1; d[i + 3] = 255; }
    }
    x.putImageData(img, 0, 0);
    g.ban = { cv: c, w: bw, h: bh };
  };
  B.cellAt = function (g, px, py) {
    var L = g.logo, gx = Math.floor((px - L.x) / g.C), gy = Math.floor((py - L.y) / g.C);
    if (gx < 0 || gy < 0 || gx >= L.w || gy >= L.h) return -1;
    return L.cells[gy * L.w + gx] ? gy * L.w + gx : -1;
  };
  B.carve = function (g, idx, rad, up) {
    var L = g.logo, cx = idx % L.w, cy = (idx / L.w) | 0, r = Math.ceil(rad);
    for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > rad * rad) continue;
      var x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= L.w || y >= L.h) continue;
      var i = y * L.w + x;
      if (!L.cells[i]) continue;
      L.cells[i] = 0; L.alive--; L.img.data[i * 4 + 3] = 0;
      if (Math.random() < .45) B.debris(g, L.x + x * g.C, L.y + y * g.C, B.COL.ink, up);
    }
    L.dirty = true;
  };
  B.debris = function (g, x, y, c, up) {
    if (g.parts.length > 500) return;
    g.parts.push({ x: x, y: y, c: c, vx: (Math.random() - .5) * 120, vy: (up ? -1 : 1) * (40 + Math.random() * 120), life: .6 + Math.random() * .7, s: Math.random() < .5 ? 2 : 3 });
  };
  // HUD 'Restore logo' pill (top right); stores its box so a click/tap can hit it
  B.pill = function (g, x, right, y) {
    var L = g.logo, txt = g.W < 480 ? 'RESTORE' : 'RESTORE LOGO';
    x.font = '700 ' + g.fs + 'px ' + g.font;
    var w = x.measureText(txt).width + g.fs * 1.8, h = Math.round(g.fs * 2.1), px = right - w, py = y - h / 2;
    g.rb = { x: px, y: py, w: w, h: h };
    x.globalAlpha = L.alive < L.total ? 1 : .35;
    x.fillStyle = B.COL.ink; x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, h / 2); else x.rect(px, py, w, h); x.fill();
    x.fillStyle = B.COL.lime; x.textAlign = 'center'; x.fillText(txt, px + w / 2, y + 1);
    x.globalAlpha = 1;
    return px;
  };
  B.part = (B.part || 0) + 1;
})();

// sizing, waves, input
(function () {
  var B = window.BBI = window.BBI || {};
  B.size = function (g) {
    var W = Math.round(g.st.getBoundingClientRect().width);
    if (!W || W === g.W) return;
    var small = W < 600;
    g.W = W;
    g.rows = 3;
    g.P = small ? 3 : 4;                                   // invader pixel size (smaller on phones so more fit)
    g.Pl = small ? 2 : 3;                                  // plane pixel size
    g.Bp = 1;                                              // banner pixel size (fine, so the logo stays clean)
    g.C = Math.max(2, Math.min(4, Math.round(W / 420)));   // logo pixel size
    g.fs = Math.max(11, Math.min(16, Math.round(W / 96))); // HUD text: 11px on phones, ~15px at 1440
    g.hy = Math.round(g.fs * 1.6);                         // HUD row centre
    g.lane = Math.round(g.hy + g.fs + 8);                  // top of the plane's flight lane
    B.buildBanner(g);
    g.laneH = Math.max(9 * g.Pl, g.ban.h * g.Bp) + 12;
    g.top = g.lane + g.laneH + 10;                         // top of the invader formation
    B.buildLogo(g);
    g.H = g.top + g.rows * 11 * g.P + 56 + g.logo.h * g.C + 96;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    g.cv.width = W * dpr; g.cv.height = g.H * dpr; g.cv.style.height = g.H + 'px';
    g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.ship.y = g.H - 50;
    if (!g.ship.x) g.ship.x = g.ship.tx = W / 2;
    g.pl = null; g.plT = 6 + Math.random() * 3;
    B.reset(g);
  };
  B.wave = function (g) {
    var P = g.P, sx = 16 * P, sy = 11 * P;
    var cols = g.W < 600 ? Math.max(5, Math.min(8, Math.floor((g.W - 40) / sx))) : Math.max(4, Math.min(10, Math.floor((g.W - 120) / 72)));
    g.inv = [];
    for (var r = 0; r < g.rows; r++) for (var c = 0; c < cols; c++) g.inv.push({ ox: c * sx, oy: g.top + r * sy, row: r, on: 1 });
    g.fx = (g.W - ((cols - 1) * sx + 8 * P)) / 2; g.fdir = 1;
    g.fsp = 38 + g.wave * 14; g.eT = 1.2;
  };
  B.reset = function (g) {
    g.score = 0; g.wave = 1; g.lives = 3; g.b = []; g.e = []; g.pop = []; g.ship.inv = 0;
    B.buildLogo(g); B.wave(g);
  };
  B.input = function (g) {
    var cv = g.cv;
    function tx(e) { var r = cv.getBoundingClientRect(); g.ship.tx = Math.max(24, Math.min(g.W - 24, e.clientX - r.left)); }
    function go() { if (g.mode === 'idle') g.mode = 'play'; }
    cv.addEventListener('pointermove', function (e) { tx(e); if (e.pointerType === 'mouse') { go(); g.fire = g.mode === 'play'; } });
    cv.addEventListener('pointerdown', function (e) {
      var r = cv.getBoundingClientRect(), b = g.rb, px = e.clientX - r.left, py = e.clientY - r.top;
      if (b && px >= b.x - 6 && px <= b.x + b.w + 6 && py >= b.y - 6 && py <= b.y + b.h + 6) { B.buildLogo(g); g.fire = false; return; }
      tx(e);
      if (g.mode === 'over') { B.reset(g); g.mode = 'play'; }
      go(); g.fire = true;
    });
    function off(e) { if (e.pointerType !== 'mouse') g.fire = false; }
    cv.addEventListener('pointerup', off);
    cv.addEventListener('pointercancel', function () { g.fire = false; });
    cv.addEventListener('pointerleave', function () { g.fire = false; });
  };
  B.hit = function (g) {
    g.lives--; g.ship.inv = 1.6;
    for (var k = 0; k < 26; k++) B.debris(g, g.ship.x, g.ship.y + 10, B.COL.ink, Math.random() < .5);
    if (g.lives <= 0) { g.mode = 'over'; g.fire = false; }
  };
  // Plane + banner boxes (plane first), in canvas px
  B.planeBoxes = function (g) {
    var p = g.pl, Pl = g.Pl, pw = B.PLANE[0].length * Pl, ph = B.PLANE.length * Pl;
    var bw = g.ban.w * g.Bp, bh = g.ban.h * g.Bp, rope = 5 * Pl;
    var bx = p.dir > 0 ? p.x - rope - bw : p.x + pw + rope;
    return [{ x: p.x, y: p.y, w: pw, h: ph }, { x: bx, y: p.y + ph / 2 - bh / 2, w: bw, h: bh, rope: rope }];
  };
  B.part = (B.part || 0) + 1;
})();

// game update
(function () {
  var B = window.BBI = window.BBI || {};
  B.update = function (g, dt) {
    g.t += dt;
    var sh = g.ship, i, v, b, P = g.P, aw = 8 * P, ah = 6 * P;
    if (g.mode === 'idle' && !g.rm) sh.tx = g.W / 2 + Math.sin(g.t * .8) * Math.min(260, g.W * .3);
    sh.x += (sh.tx - sh.x) * Math.min(1, dt * 12);
    if (sh.inv > 0) sh.inv -= dt;
    // plane: flies over roughly every 15 seconds, alternating direction
    if (g.pl) {
      g.pl.x += g.pl.dir * g.pl.sp * dt;
      var bx = B.planeBoxes(g)[1];
      if ((g.pl.dir > 0 && bx.x > g.W + 10) || (g.pl.dir < 0 && bx.x + bx.w < -10)) { g.pl = null; g.plT = 13 + Math.random() * 4; }
    } else if ((g.plT -= dt) <= 0) {
      g.pdir = -(g.pdir || -1);
      var pw = B.PLANE[0].length * g.Pl;
      g.pl = { dir: g.pdir, sp: Math.max(70, g.W / 9), x: g.pdir > 0 ? -pw - 4 * g.Pl : g.W + 4 * g.Pl, y: g.lane + (g.laneH - 9 * g.Pl) / 2 };
    }
    g.fT -= dt;
    if (g.mode === 'play' && g.fire && g.fT <= 0) { g.b.push({ x: sh.x, y: sh.y - 4, p: 3 }); g.fT = .16; }
    for (i = 0; i < g.b.length; i++) {
      b = g.b[i];
      var dist = 620 * dt;
      while (dist > 0 && b.p > 0) {
        var d = Math.min(g.C / 2, dist); dist -= d; b.y -= d;
        var idx = B.cellAt(g, b.x, b.y);
        if (idx >= 0) { B.carve(g, idx, 2 + Math.random() * 1.2, 0); b.p--; }
      }
      if (b.p > 0) for (var j = 0; j < g.inv.length; j++) {
        v = g.inv[j]; if (!v.on) continue;
        var vx = g.fx + v.ox, vy = v.oy + Math.sin(g.t * 2 + v.ox * .05) * 3;
        if (b.x > vx && b.x < vx + aw && b.y > vy && b.y < vy + ah) {
          v.on = 0; b.p = 0; g.score += (3 - v.row) * 10 + 10;
          for (var k = 0; k < 18; k++) B.debris(g, vx + aw / 2, vy + ah / 2, B.ROWC[v.row] || B.COL.lav, Math.random() < .5);
          break;
        }
      }
      if (b.p > 0 && g.pl && g.mode === 'play') {
        var bxs = B.planeBoxes(g);
        for (var q = 0; q < 2; q++) {
          var o = bxs[q];
          if (b.x > o.x && b.x < o.x + o.w && b.y > o.y && b.y < o.y + o.h) {
            b.p = 0; g.score += 100;
            g.pop.push({ x: b.x, y: o.y + o.h / 2, t: 0 });
            var cx = bxs[0].x + bxs[0].w / 2, cy = bxs[0].y + bxs[0].h / 2;
            for (k = 0; k < 30; k++) B.debris(g, cx, cy, k % 3 ? B.COL.ink : B.COL.pts, Math.random() < .5);
            for (k = 0; k < 24; k++) B.debris(g, bxs[1].x + Math.random() * bxs[1].w, bxs[1].y + Math.random() * bxs[1].h, k % 2 ? B.COL.lav : B.COL.ink, Math.random() < .3);
            g.pl = null; g.plT = 13 + Math.random() * 4;
            break;
          }
        }
      }
      if (b.y < -10) b.p = 0;
    }
    g.b = g.b.filter(function (x) { return x.p > 0; });
    var live = g.inv.filter(function (x) { return x.on; });
    if (live.length) {
      var mn = 1e9, mx = -1e9;
      live.forEach(function (x) { mn = Math.min(mn, x.ox); mx = Math.max(mx, x.ox + aw); });
      g.fx += g.fdir * g.fsp * (1 + (1 - live.length / g.inv.length) * 1.4) * dt;
      if (g.fx + mx > g.W - 16) { g.fx = g.W - 16 - mx; g.fdir = -1; }
      if (g.fx + mn < 16) { g.fx = 16 - mn; g.fdir = 1; }
      g.frT += dt; if (g.frT > .45) { g.frT = 0; g.fr ^= 1; }
      if (g.mode === 'play' && (g.eT -= dt) <= 0) {
        var cols = {};
        live.forEach(function (x) { if (!cols[x.ox] || x.oy > cols[x.ox].oy) cols[x.ox] = x; });
        var sh2 = Object.values(cols), s = sh2[(Math.random() * sh2.length) | 0];
        g.e.push({ x: g.fx + s.ox + aw / 2, y: s.oy + ah + 2, on: 1 });
        g.eT = Math.max(.35, 1.6 - g.wave * .12) * (.6 + Math.random() * .8);
      }
    } else if (g.mode === 'play') { g.wave++; g.score += 100; B.wave(g); }
    g.e.forEach(function (e) {
      var dist = 240 * dt;
      while (dist > 0 && e.on) {
        var d = Math.min(g.C / 2, dist); dist -= d; e.y += d;
        var idx = B.cellAt(g, e.x, e.y);
        if (idx >= 0) { B.carve(g, idx, 1.8 + Math.random() * .8, 1); e.on = 0; }
      }
      if (e.on && sh.inv <= 0 && Math.abs(e.x - sh.x) < 22 && e.y > sh.y && e.y < sh.y + 24) { e.on = 0; B.hit(g); }
      if (e.y > g.H + 10) e.on = 0;
    });
    g.e = g.e.filter(function (x) { return x.on; });
    g.pop.forEach(function (p) { p.t += dt; });
    g.pop = g.pop.filter(function (p) { return p.t < 1.2; });
    g.parts.forEach(function (p) { p.life -= dt; p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; });
    g.parts = g.parts.filter(function (p) { return p.life > 0 && p.y < g.H + 10; });
  };
  B.part = (B.part || 0) + 1;
})();

// draw
(function () {
  var B = window.BBI = window.BBI || {};
  B.drawPlane = function (g, x) {
    var p = g.pl, K = B.COL, Pp = g.Pl, Bp = g.Bp, bob = Math.round(Math.sin(g.t * 3) * 1.5), bx = B.planeBoxes(g), pl = bx[0], bn = bx[1];
    var py = pl.y + bob, n = B.PLANE[0].length, flip = p.dir < 0;
    B.spr2(x, B.PLANE, pl.x, py, Pp, { X: K.ink, W: K.ink, C: K.ink }, flip);
    // spinning propeller just ahead of the nose: hub plus blades that flick up and down
    var nose = flip ? pl.x - Pp : pl.x + n * Pp, f = Math.floor(g.t * 24) % 2;
    x.fillStyle = K.ink;
    x.fillRect(Math.round(nose), Math.round(py + 4 * Pp), Pp, Pp);
    x.fillRect(Math.round(nose), Math.round(py + (f ? 1 : 5) * Pp), Pp, 3 * Pp);
    // tow rope from the tail to the banner
    var tailX = flip ? pl.x + pl.w - 2 * Pp : pl.x + 2 * Pp, ropeY = Math.round(py + 4.5 * Pp);
    var endX = flip ? bn.x : bn.x + bn.w;
    x.fillRect(Math.min(tailX, endX), ropeY, Math.abs(endX - tailX), 1);
    // banner, drawn in thin strips that ripple in a wave, more towards the free end
    var cols = g.ban.w, step = 6;
    for (var i = 0; i < cols; i += step) {
      var dFromRope = flip ? i : cols - 1 - i, amp = dFromRope / cols;
      var off = Math.round(Math.sin(g.t * 7 - dFromRope * .045) * amp * 3.5) * Bp + bob;
      var sw = Math.min(step, cols - i);
      x.drawImage(g.ban.cv, i, 0, sw, g.ban.h, Math.round(bn.x + i * Bp), Math.round(bn.y + off), sw * Bp, g.ban.h * Bp);
    }
  };
  B.draw = function (g) {
    var x = g.ctx, L = g.logo, K = B.COL, W = g.W, H = g.H, P = g.P;
    if (L.dirty) { L.cv.getContext('2d').putImageData(L.img, 0, 0); L.dirty = false; }
    x.clearRect(0, 0, W, H);
    x.globalAlpha = .2; x.fillStyle = K.ink; x.fillRect(0, H - 18, W, 1); x.globalAlpha = 1;
    x.imageSmoothingEnabled = false;
    x.drawImage(L.cv, L.x, L.y, L.w * g.C, L.h * g.C);
    if (g.pl) B.drawPlane(g, x);
    g.inv.forEach(function (v) { if (v.on) B.spr(x, B.BLOB[g.fr], g.fx + v.ox, v.oy + Math.sin(g.t * 2 + v.ox * .05) * 3, B.ROWC[v.row] || K.lav, P); });
    x.fillStyle = K.ink; g.b.forEach(function (b) { x.fillRect(Math.round(b.x - 1), Math.round(b.y), 3, 12); });
    x.fillStyle = K.lav;
    g.e.forEach(function (e) { var z = Math.floor(e.y / 6) % 2 ? 2 : -2; x.fillRect(Math.round(e.x - 1 + z), Math.round(e.y - 10), 3, 5); x.fillRect(Math.round(e.x - 1 - z), Math.round(e.y - 5), 3, 5); });
    g.parts.forEach(function (p) { x.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
    x.globalAlpha = 1;
    var sh = g.ship;
    if (g.mode !== 'over' && !(sh.inv > 0 && Math.floor(sh.inv * 10) % 2)) { x.globalAlpha = g.mode === 'idle' ? .55 : 1; B.spr(x, B.SHIP, sh.x - 22, sh.y, K.ink, 4); x.globalAlpha = 1; }
    // +100 pop-ups: flash, rise and fade
    var ppx = W < 600 ? 4 : 6;
    g.pop.forEach(function (p) {
      var k = p.t / 1.2, flash = p.t < .45 && Math.floor(p.t * 14) % 2;
      x.globalAlpha = flash ? .25 : (k > .6 ? 1 - (k - .6) / .4 : 1);
      var cx = Math.max(60, Math.min(W - 60, p.x));
      B.pixText(x, '+100', cx, p.y - Math.round(k * 40 / ppx) * ppx, ppx, K.pts);
    });
    x.globalAlpha = 1;
    // HUD
    x.font = '500 ' + g.fs + 'px ' + g.font; x.fillStyle = K.ink; x.textBaseline = 'middle';
    x.textAlign = 'left'; x.fillText('SCORE ' + g.score + '   WAVE ' + g.wave + '   LIVES ' + g.lives, 16, g.hy);
    var px = B.pill(g, x, W - 16, g.hy);
    x.font = '500 ' + g.fs + 'px ' + g.font; x.fillStyle = K.ink;
    x.textAlign = 'right'; x.fillText('LOGO ' + Math.round(100 * L.alive / L.total) + '%', px - 10, g.hy);
    var msg = g.mode === 'idle' ? (g.touch ? 'TOUCH TO PLAY' : 'MOVE HERE TO PLAY') : g.mode === 'over' ? 'GAME OVER · ' + g.score + ' PTS · ' + (g.touch ? 'TAP' : 'CLICK') + ' TO PLAY AGAIN' : '';
    if (msg) {
      var ms = Math.max(12, Math.min(16, Math.round(W / 90))), bh = Math.round(ms * 2.5);
      x.font = '700 ' + ms + 'px ' + g.font; var tw = x.measureText(msg).width + ms * 2.4, cy = L.y - 36;
      x.fillStyle = K.ink; x.beginPath(); if (x.roundRect) x.roundRect(W / 2 - tw / 2, cy - bh / 2, tw, bh, bh / 2); else x.rect(W / 2 - tw / 2, cy - bh / 2, tw, bh); x.fill();
      x.fillStyle = K.lime; x.textAlign = 'center'; x.fillText(msg, W / 2, cy + 1);
    }
  };
  B.part = (B.part || 0) + 1;
})();

// mount on the home and free goodies footers (also after Barba page transitions)
(function () {
  var B = window.BBI = window.BBI || {};
  B.mount = function () {
    if (B.g) { B.g.stop(); B.g = null; }
    var f = document.querySelector(B.SEL);
    if (!f) return;
    var paths = [].map.call(f.querySelectorAll('.bbft-lm .bbft-l'), function (p) { return p.getAttribute('data-bb-d') || p.getAttribute('d'); });
    if (!paths.length) return;
    f.classList.add('bbinv-on');
    var st = f.querySelector('.bbinv-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbinv-stage'; st.innerHTML = '<canvas aria-label="Mini game: shoot the invaders through the Brave Beyond logo"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas');
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), paths: paths, logo: { cv: document.createElement('canvas') }, ship: { x: 0, tx: 0, y: 0, inv: 0 }, b: [], e: [], pop: [], parts: [], inv: [], t: 0, fT: 0, frT: 0, fr: 0, mode: 'idle', W: 0, vis: true,
      touch: window.matchMedia && matchMedia('(hover: none)').matches, rm: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    B.input(g); B.size(g);
    var raf = 0, last = performance.now(), dead = false;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { B.size(g); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!g.W) B.size(g);
      // Only run while the game is on screen (measured directly; works inside iframes too)
      var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      g.vis = r.bottom > 0 && r.top < vh && r.width > 0;
      if (g.vis) { B.update(g, dt); B.draw(g); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    g.stop = function () { dead = true; cancelAnimationFrame(raf); if (ro) ro.disconnect(); };
    B.g = g;
  };
  (function wait(n) {
    if ((B.part || 0) < 5) return n < 100 ? setTimeout(function () { wait(n + 1); }, 50) : 0;
    B.mount();
    (function hook() {
      if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
      barba.hooks.before(function () { if (B.g) { B.g.stop(); B.g = null; } });
      barba.hooks.after(function () { B.mount(); });
    })();
  })(0);
})();
