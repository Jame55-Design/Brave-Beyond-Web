// BB Footer Invaders: Space Invaders in the footer on the home and Free Goodies pages.
// Shots chip away at the pixelated Brave Beyond logo on their way up to the invaders.
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
    '.bb-footer.bbinv-on .bbft-ig{order:3;position:absolute;left:5vw;bottom:1.5vw;margin:0}' +
    '@media (max-width:479px){.bb-footer.bbinv-on{padding-top:32px}.bb-footer.bbinv-on .bbft-ig{left:16px;bottom:16px}}';
  document.head.appendChild(s);
  B.SEL = '[data-barba-namespace="home"] .bb-footer,[data-barba-namespace="goodies"] .bb-footer';
  B.COL = { g: '#07A87E', ink: '#000101', lime: '#CEFF38', lav: '#E9DBEC' };
  B.BLOB = [
    ['..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '.XX..XX.', 'X.X..X.X'],
    ['..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', 'XX.XX.XX', '.X....X.']
  ];
  B.SHIP = ['.....X.....', '....XXX....', '...XXXXX...', '.XXXXXXXXX.', 'XXXXXXXXXXX', 'XX.X...X.XX'];
  B.spr = function (ctx, rows, x, y, c, px) {
    ctx.fillStyle = c;
    for (var r = 0; r < rows.length; r++)
      for (var k = 0; k < rows[r].length; k++)
        if (rows[r][k] === 'X') ctx.fillRect(Math.round(x + k * px), Math.round(y + r * px), px, px);
  };
  B.part = (B.part || 0) + 1;
})();

// pixel logo build + damage
(function () {
  var B = window.BBI = window.BBI || {};
  var VB = [0, -15, 1697.27, 410];
  B.buildLogo = function (g) {
    var L = g.logo, C = g.C;
    var w = Math.floor(g.W * 0.98 / C), h = Math.round(w * VB[3] / VB[2]);
    var t = document.createElement('canvas'); t.width = w; t.height = h;
    var x = t.getContext('2d');
    x.scale(w / VB[2], h / VB[3]); x.translate(-VB[0], -VB[1]);
    for (var i = 0; i < g.paths.length; i++) x.fill(new Path2D(g.paths[i]));
    var src = x.getImageData(0, 0, w, h).data, y0 = h, y1 = 0, yy;
    for (i = 0; i < w * h; i++) if (src[i * 4 + 3] > 110) { yy = (i / w) | 0; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    var H2 = Math.max(1, y1 - y0 + 1), o = y0 * w;
    L.w = w; L.h = H2; L.cv.width = w; L.cv.height = H2;
    var lc = L.cv.getContext('2d');
    L.img = lc.createImageData(w, H2); L.cells = new Uint8Array(w * H2);
    var n = 0, d = L.img.data;
    for (i = 0; i < w * H2; i++) if (src[(i + o) * 4 + 3] > 110) { L.cells[i] = 1; n++; d[i * 4 + 1] = 1; d[i * 4 + 2] = 1; d[i * 4 + 3] = 255; }
    L.total = n || 1; L.alive = n;
    L.x = Math.round((g.W - w * C) / 2);
    L.y = g.H - 96 - H2 * C;
    lc.putImageData(L.img, 0, 0);
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
    x.font = '700 11px ' + g.font;
    var w = x.measureText(txt).width + 20, h = 24, px = right - w, py = y - h / 2;
    g.rb = { x: px, y: py, w: w, h: h };
    x.globalAlpha = L.alive < L.total ? 1 : .35;
    x.fillStyle = B.COL.ink; x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, 12); else x.rect(px, py, w, h); x.fill();
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
    var rows = W < 600 ? 2 : 3;
    g.W = W; g.rows = rows;
    g.C = Math.max(2, Math.min(4, Math.round(W / 420)));
    B.buildLogo(g);
    g.H = 48 + 24 + (rows - 1) * 44 + 64 + g.logo.h * g.C + 96;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    g.cv.width = W * dpr; g.cv.height = g.H * dpr; g.cv.style.height = g.H + 'px';
    g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.ship.y = g.H - 50;
    if (!g.ship.x) g.ship.x = g.ship.tx = W / 2;
    B.reset(g);
  };
  B.wave = function (g) {
    var cols = Math.max(4, Math.min(10, Math.floor((g.W - 120) / 72)));
    g.inv = [];
    for (var r = 0; r < g.rows; r++) for (var c = 0; c < cols; c++) g.inv.push({ ox: c * 64, oy: 48 + r * 44, row: r, on: 1 });
    g.fx = (g.W - ((cols - 1) * 64 + 32)) / 2; g.fdir = 1;
    g.fsp = 38 + g.wave * 14; g.eT = 1.2;
  };
  B.reset = function (g) {
    g.score = 0; g.wave = 1; g.lives = 3; g.b = []; g.e = []; g.ship.inv = 0;
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
  B.part = (B.part || 0) + 1;
})();

// game update
(function () {
  var B = window.BBI = window.BBI || {};
  B.update = function (g, dt) {
    g.t += dt;
    var sh = g.ship, i, v, b;
    if (g.mode === 'idle' && !g.rm) sh.tx = g.W / 2 + Math.sin(g.t * .8) * Math.min(260, g.W * .3);
    sh.x += (sh.tx - sh.x) * Math.min(1, dt * 12);
    if (sh.inv > 0) sh.inv -= dt;
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
        if (b.x > vx && b.x < vx + 32 && b.y > vy && b.y < vy + 24) {
          v.on = 0; b.p = 0; g.score += (3 - v.row) * 10 + 10;
          for (var k = 0; k < 18; k++) B.debris(g, vx + 16, vy + 12, v.row ? B.COL.lav : B.COL.lime, Math.random() < .5);
          break;
        }
      }
      if (b.y < -10) b.p = 0;
    }
    g.b = g.b.filter(function (x) { return x.p > 0; });
    var live = g.inv.filter(function (x) { return x.on; });
    if (live.length) {
      var mn = 1e9, mx = -1e9;
      live.forEach(function (x) { mn = Math.min(mn, x.ox); mx = Math.max(mx, x.ox + 32); });
      g.fx += g.fdir * g.fsp * (1 + (1 - live.length / g.inv.length) * 1.4) * dt;
      if (g.fx + mx > g.W - 16) { g.fx = g.W - 16 - mx; g.fdir = -1; }
      if (g.fx + mn < 16) { g.fx = 16 - mn; g.fdir = 1; }
      g.frT += dt; if (g.frT > .45) { g.frT = 0; g.fr ^= 1; }
      if (g.mode === 'play' && (g.eT -= dt) <= 0) {
        var cols = {};
        live.forEach(function (x) { if (!cols[x.ox] || x.oy > cols[x.ox].oy) cols[x.ox] = x; });
        var sh2 = Object.values(cols), s = sh2[(Math.random() * sh2.length) | 0];
        g.e.push({ x: g.fx + s.ox + 16, y: s.oy + 26, on: 1 });
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
    g.parts.forEach(function (p) { p.life -= dt; p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; });
    g.parts = g.parts.filter(function (p) { return p.life > 0 && p.y < g.H + 10; });
  };
  B.part = (B.part || 0) + 1;
})();

// draw
(function () {
  var B = window.BBI = window.BBI || {};
  B.draw = function (g) {
    var x = g.ctx, L = g.logo, K = B.COL, W = g.W, H = g.H;
    if (L.dirty) { L.cv.getContext('2d').putImageData(L.img, 0, 0); L.dirty = false; }
    x.clearRect(0, 0, W, H);
    x.globalAlpha = .2; x.fillStyle = K.ink; x.fillRect(0, H - 18, W, 1); x.globalAlpha = 1;
    x.imageSmoothingEnabled = false;
    x.drawImage(L.cv, L.x, L.y, L.w * g.C, L.h * g.C);
    g.inv.forEach(function (v) { if (v.on) B.spr(x, B.BLOB[g.fr], g.fx + v.ox, v.oy + Math.sin(g.t * 2 + v.ox * .05) * 3, v.row ? K.lav : K.lime, 4); });
    x.fillStyle = K.ink; g.b.forEach(function (b) { x.fillRect(Math.round(b.x - 1), Math.round(b.y), 3, 12); });
    x.fillStyle = K.lav;
    g.e.forEach(function (e) { var z = Math.floor(e.y / 6) % 2 ? 2 : -2; x.fillRect(Math.round(e.x - 1 + z), Math.round(e.y - 10), 3, 5); x.fillRect(Math.round(e.x - 1 - z), Math.round(e.y - 5), 3, 5); });
    g.parts.forEach(function (p) { x.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
    x.globalAlpha = 1;
    var sh = g.ship;
    if (g.mode !== 'over' && !(sh.inv > 0 && Math.floor(sh.inv * 10) % 2)) { x.globalAlpha = g.mode === 'idle' ? .55 : 1; B.spr(x, B.SHIP, sh.x - 22, sh.y, K.ink, 4); x.globalAlpha = 1; }
    x.font = '500 11px ' + g.font; x.fillStyle = K.ink; x.textBaseline = 'middle';
    x.textAlign = 'left'; x.fillText('SCORE ' + g.score + '   WAVE ' + g.wave + '   LIVES ' + g.lives, 16, 20);
    var px = B.pill(g, x, W - 16, 20);
    x.font = '500 11px ' + g.font; x.fillStyle = K.ink;
    x.textAlign = 'right'; x.fillText('LOGO ' + Math.round(100 * L.alive / L.total) + '%', px - 10, 20);
    var msg = g.mode === 'idle' ? (g.touch ? 'TOUCH TO PLAY' : 'MOVE HERE TO PLAY') : g.mode === 'over' ? 'GAME OVER · ' + g.score + ' PTS · ' + (g.touch ? 'TAP' : 'CLICK') + ' TO PLAY AGAIN' : '';
    if (msg) {
      x.font = '700 12px ' + g.font; var tw = x.measureText(msg).width + 28, cy = L.y - 36;
      x.fillStyle = K.ink; x.beginPath(); if (x.roundRect) x.roundRect(W / 2 - tw / 2, cy - 15, tw, 30, 15); else x.rect(W / 2 - tw / 2, cy - 15, tw, 30); x.fill();
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
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), paths: paths, logo: { cv: document.createElement('canvas') }, ship: { x: 0, tx: 0, y: 0, inv: 0 }, b: [], e: [], parts: [], inv: [], t: 0, fT: 0, frT: 0, fr: 0, mode: 'idle', W: 0, vis: true,
      touch: window.matchMedia && matchMedia('(hover: none)').matches, rm: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    B.input(g); B.size(g);
    var raf = 0, last = performance.now(), dead = false;
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) { g.vis = en[0].isIntersecting; }) : null;
    if (io) io.observe(st);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { B.size(g); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.min(.033, (now - last) / 1000); last = now;
      if (g.vis) { B.update(g, dt); B.draw(g); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    g.stop = function () { dead = true; cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect(); };
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
