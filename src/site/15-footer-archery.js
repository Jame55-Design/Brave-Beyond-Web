// BB Footer Archery: bow and arrow game in the footer.
// One small section of the Brave Beyond logo glows purple. Shoot it and it pops (the chunk bursts and leaves a gap).
// Hold to draw the bow (harder, flatter shot), release to fire. A quick tap/click still fires.
// Points: 100 x streak (up to x5) per pop, +50 for popping within 1.5s of it lighting up.
// Arrows that hit the wrong part of the logo stick in it and break your streak.
// 45-second round, starts on the first shot. Pop the whole logo for +10K.
// Reads the logo paths from the footer SVG at runtime (.bbft-lm .bbft-l), like the invaders game.
// Pages: set in B.SEL / B.PATHS below (Barba namespace or URL path + .bb-footer).

(function () {
  var B = window.BBA = window.BBA || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbarc-on{padding-top:4vw}' +
    '.bb-footer.bbarc-on .bbft-lm{display:none}' +
    '.bbarc-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbarc-stage canvas{display:block;width:100%;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;cursor:crosshair}' +
    '.bb-footer .bbft-ig{order:1;margin:2vw 0 0}' +
    '@media (max-width:479px){.bb-footer.bbarc-on{padding-top:24px}.bb-footer .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);
  B.SEL = B.SEL || '[data-barba-namespace="archery"] .bb-footer'; // set the page(s) here
  B.PATHS = B.PATHS || [];
  B.COL = { ink: '#212121', purp: '#AE9AE4', lav: '#E9DBEC', lime: '#CCFF00' };
  B.TIME = 45;          // seconds per round
  B.PTS = 100;          // per pop, times the streak
  B.MAX_STREAK = 5;
  B.FAST = 1.5;         // pop within this many seconds of it lighting up...
  B.FAST_PTS = 50;      // ...for this bonus
  B.WIN_BONUS = 10000;
  B.RELOAD = .22;       // seconds between arrows
  B.VB = [0, -15, 1697.27, 410]; // fallback viewBox for the footer logo

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // Find the ink bounds of the logo (in viewBox units) so the game crops tight to the lettering
  B.bounds = function (paths, vb) {
    var w = 800, h = Math.max(1, Math.round(w * vb[3] / vb[2]));
    var t = document.createElement('canvas'); t.width = w; t.height = h;
    var x = t.getContext('2d'), k = w / vb[2];
    x.scale(k, k); x.translate(-vb[0], -vb[1]);
    for (var i = 0; i < paths.length; i++) x.fill(paths[i]);
    var d = x.getImageData(0, 0, w, h).data, x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (var y = 0; y < h; y++) for (var c = 0; c < w; c++) if (d[(y * w + c) * 4 + 3] > 60) {
      if (c < x0) x0 = c; if (c > x1) x1 = c; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < x0) return vb;
    return [vb[0] + (x0 - 1) / k, vb[1] + (y0 - 1) / k, (x1 - x0 + 3) / k, (y1 - y0 + 3) / k];
  };

  function paint(g, cv, w, h, col) {
    cv.width = Math.ceil(w); cv.height = Math.ceil(h);
    var x = cv.getContext('2d'), k = w / g.bb[2];
    x.clearRect(0, 0, cv.width, cv.height);
    x.scale(k, k); x.translate(-g.bb[0], -g.bb[1]); x.fillStyle = col;
    for (var i = 0; i < g.paths.length; i++) x.fill(g.paths[i]);
    return x;
  }

  // Lay out the stage and (re)build the logo, mask and chunks
  B.size = function (g) {
    var W = g.st.clientWidth;
    if (!W || W === g.W) return;
    g.W = W; g.dpr = Math.min(2, window.devicePixelRatio || 1);
    var phone = W < 560;
    g.fs = clamp(Math.round(W / 90), 11, 16);
    g.hud = Math.round(g.fs * 2.4);
    g.lw = W * (phone ? .92 : .9); g.lh = g.lw * g.bb[3] / g.bb[2];
    var maxH = W * (phone ? .34 : .26);
    if (g.lh > maxH) { g.lh = maxH; g.lw = g.lh * g.bb[2] / g.bb[3]; }
    g.lx = (W - g.lw) / 2; g.ly = g.hud + Math.round(g.fs * .8);
    g.R = clamp(W * .036, 28, 54); g.L = g.R * 1.9;
    var below = Math.max(phone ? 90 : 120, g.lh * .7);
    g.H = Math.round(g.ly + g.lh + below + g.R * 2 + 12);
    g.bx = W / 2; g.by = g.H - g.R - 10;
    g.V = Math.max(1100, g.H * 3.4); g.G = g.V * .45;
    g.cv.width = Math.round(W * g.dpr); g.cv.height = Math.round(g.H * g.dpr);
    g.cv.style.height = g.H + 'px';
    if (g.px == null) { g.px = g.bx; g.py = g.ly + g.lh / 2; }
    g.rows = phone ? 2 : 3;
    B.reset(g, 'idle');
  };

  B.reset = function (g, mode) {
    var dpr = g.dpr;
    paint(g, g.lc, g.lw * dpr, g.lh * dpr, B.COL.ink);
    paint(g, g.pc, g.lw * dpr, g.lh * dpr, B.COL.purp);
    // 1px-per-CSS-pixel hit mask
    var mx = paint(g, g.mk, g.lw, g.lh, '#000'), mw = g.mk.width, mh = g.mk.height;
    var d = mx.getImageData(0, 0, mw, mh).data, m = new Uint8Array(mw * mh);
    for (var i = 0; i < mw * mh; i++) m[i] = d[i * 4 + 3] > 100 ? 1 : 0;
    g.mask = m; g.mw = mw; g.mh = mh;
    // Chunks: the lettering is cut into irregular shards (nearest of a jittered grid of seed points)
    var ch = g.lh / g.rows, cols = Math.max(4, Math.round(g.lw / ch)), cw = g.lw / cols, sd = [];
    g.cols = cols; g.cw = cw; g.ch = ch;
    for (var r = 0; r < g.rows; r++) for (var c = 0; c < cols; c++)
      sd.push([(c + .5 + (Math.random() - .5) * .7) * cw, (r + .5 + (Math.random() - .5) * .7) * ch]);
    var id = new Int16Array(mw * mh).fill(-1);
    g.cells = sd.map(function () { return { x0: 1e9, y0: 1e9, x1: -1, y1: -1, ink: 0, sx: 0, sy: 0, alive: true }; });
    for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
      if (!m[y * mw + x]) continue;
      var c0 = (x / cw) | 0, r0 = (y / ch) | 0, best = -1, bd = 1e18;
      for (var rr = r0 - 1; rr <= r0 + 1; rr++) for (var cc = c0 - 1; cc <= c0 + 1; cc++) {
        if (rr < 0 || cc < 0 || rr >= g.rows || cc >= cols) continue;
        var k = rr * cols + cc, dx = x - sd[k][0], dy = y - sd[k][1], dd = dx * dx + dy * dy;
        if (dd < bd) { bd = dd; best = k; }
      }
      id[y * mw + x] = best;
      var q = g.cells[best]; q.ink++; q.sx += x; q.sy += y;
      if (x < q.x0) q.x0 = x; if (x > q.x1) q.x1 = x; if (y < q.y0) q.y0 = y; if (y > q.y1) q.y1 = y;
    }
    // Slivers too small to aim at are merged into the nearest proper shard
    var small = g.cells.map(function (q) { return q.ink <= cw * ch * .12; });
    for (y = 0; y < mh; y++) for (x = 0; x < mw; x++) {
      var v = id[y * mw + x];
      if (v < 0 || !small[v]) continue;
      c0 = (x / cw) | 0; r0 = (y / ch) | 0; best = -1; bd = 1e18;
      for (rr = r0 - 2; rr <= r0 + 2; rr++) for (cc = c0 - 2; cc <= c0 + 2; cc++) {
        if (rr < 0 || cc < 0 || rr >= g.rows || cc >= cols) continue;
        k = rr * cols + cc; if (small[k]) continue;
        dx = x - sd[k][0]; dy = y - sd[k][1]; dd = dx * dx + dy * dy;
        if (dd < bd) { bd = dd; best = k; }
      }
      if (best < 0) for (k = 0; k < sd.length; k++) {
        if (small[k]) continue;
        dx = x - sd[k][0]; dy = y - sd[k][1]; dd = dx * dx + dy * dy;
        if (dd < bd) { bd = dd; best = k; }
      }
      if (best < 0) continue;
      id[y * mw + x] = best; g.cells[v].ink--;
      q = g.cells[best]; q.ink++; q.sx += x; q.sy += y;
      if (x < q.x0) q.x0 = x; if (x > q.x1) q.x1 = x; if (y < q.y0) q.y0 = y; if (y > q.y1) q.y1 = y;
    }
    g.id = id;
    g.cells.forEach(function (q, i) { q.ok = !small[i] && q.ink > 0; if (q.ink) { q.cx = q.sx / q.ink; q.cy = q.sy / q.ink; q.x = q.x0; q.y = q.y0; q.w = q.x1 - q.x0 + 1; q.h = q.y1 - q.y0 + 1; } });
    g.total = g.cells.filter(function (c) { return c.ok; }).length; g.popped = 0;
    g.arrows = []; g.parts = []; g.rings = []; g.pops = [];
    g.score = 0; g.streak = 0; g.left = B.TIME; g.mode = mode; g.reload = 0; g.drawing = false; g.pull = 0; g.flash = 0;
    g.rise = mode === 'play' ? 1 : 0; g.tg = -1;
    B.pick(g);
  };

  // Alpha mask of one shard (CSS pixels, cropped to its box)
  // grow > 0 widens it by that many pixels (used when erasing, so no anti-aliased outline is left behind)
  function shard(g, i, grow) {
    var c = g.cells[i], e = grow || 0, w = c.w + e * 2, h = c.h + e * 2, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var x = cv.getContext('2d'), im = x.createImageData(w, h), d = im.data;
    for (var y = 0; y < c.h; y++) for (var k = 0; k < c.w; k++) if (g.id[(y + c.y) * g.mw + k + c.x] === i)
      for (var yy = y; yy <= y + e * 2; yy++) for (var kk = k; kk <= k + e * 2; kk++) d[(yy * w + kk) * 4 + 3] = 255;
    x.putImageData(im, 0, 0);
    cv.ox = c.x - e; cv.oy = c.y - e;
    return cv;
  }
  // Can a full-power arrow aimed at this shard reach it without hitting other letters first?
  function clear(g, i) {
    var c = g.cells[i], tries = [[c.cx, c.cy], [c.cx - c.w * .25, c.cy], [c.cx + c.w * .25, c.cy], [c.cx, c.cy + c.h * .25]];
    for (var t = 0; t < tries.length; t++) {
      var a = Math.atan2(g.ly + tries[t][1] - g.by, g.lx + tries[t][0] - g.bx);
      if (a > -.12 || a < -Math.PI + .12) continue;
      var x = g.bx + Math.cos(a) * g.L, y = g.by + Math.sin(a) * g.L, vx = Math.cos(a) * g.V, vy = Math.sin(a) * g.V, h = 2 / g.V;
      for (var n = 0; n < 4000; n++) {
        vy += g.G * h; x += vx * h; y += vy * h;
        var px = (x - g.lx) | 0, py = (y - g.ly) | 0;
        if (y < g.ly - 10 || x < 0 || x > g.W) break;
        if (px < 0 || py < 0 || px >= g.mw || py >= g.mh || !g.mask[py * g.mw + px]) continue;
        if (g.id[py * g.mw + px] === i) { c.ax = tries[t][0]; c.ay = tries[t][1]; return true; }
        break;
      }
    }
    return false;
  }
  // Light up a new shard, preferably not right next to the last one
  B.pick = function (g) {
    var old = g.cells[g.tg], best = -1, bd = -1, live = [], open = [];
    for (var i = 0; i < g.cells.length; i++) if (g.cells[i].ok && g.cells[i].alive && i !== g.tg) { live.push(i); if (clear(g, i)) open.push(i); }
    if (!live.length && old && old.alive) live.push(g.tg);
    if (!live.length) { g.tg = -1; return; }
    var pool = open.length ? open : live;
    for (var k = 0; k < 4; k++) {
      var j = pool[(Math.random() * pool.length) | 0], c = g.cells[j];
      var dd = old ? Math.abs(c.cx - old.cx) + Math.abs(c.cy - old.cy) : 1;
      if (dd > bd) { bd = dd; best = j; }
    }
    g.tg = best; g.tgT = g.t;
    // Purple copy of just this shard, with room around it for the glow
    var c2 = g.cells[best], dpr = g.dpr, pad = Math.ceil(g.ch * .5);
    g.tc.width = Math.ceil((c2.w + pad * 2) * dpr); g.tc.height = Math.ceil((c2.h + pad * 2) * dpr);
    var x = g.tc.getContext('2d');
    x.clearRect(0, 0, g.tc.width, g.tc.height);
    x.drawImage(g.pc, c2.x * dpr, c2.y * dpr, c2.w * dpr, c2.h * dpr, pad * dpr, pad * dpr, c2.w * dpr, c2.h * dpr);
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(shard(g, best), pad * dpr, pad * dpr, c2.w * dpr, c2.h * dpr);
    x.globalCompositeOperation = 'source-over';
    g.tpad = pad;
  };

  B.pop = function (g, i) {
    var c = g.cells[i], dpr = g.dpr;
    c.alive = false; g.popped++;
    g.streak = Math.min(B.MAX_STREAK, g.streak + 1);
    var pts = B.PTS * g.streak + (g.t - g.tgT < B.FAST ? B.FAST_PTS : 0);
    g.score += pts; g.flash = .35;
    // Burst: sample the chunk's ink into particles, then cut it out of the logo
    var mw = g.mw, st = Math.max(2, Math.round(g.ch / 14)), cx = c.cx, cy = c.cy, n = 0, sh = shard(g, i, 1);
    for (var y = c.y; y <= c.y1; y++) for (var x = c.x; x <= c.x1; x++) {
      if (g.id[y * mw + x] !== i || !g.mask[y * mw + x]) continue;
      if (x % st === 0 && y % st === 0 && n < 260) {
        var dx = x - cx, dy = y - cy, a = Math.atan2(dy, dx) + (Math.random() - .5) * .8, sp = (120 + Math.random() * 320) * (g.ch / 40);
        g.parts.push({ x: g.lx + x, y: g.ly + y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, s: st + (Math.random() < .3 ? 1 : 0), life: .6 + Math.random() * .5, t: 0, c: Math.random() < .65 ? B.COL.purp : B.COL.lav });
        n++;
      }
      g.mask[y * mw + x] = 0;
    }
    [g.lc, g.pc].forEach(function (cv) {
      var x = cv.getContext('2d'); x.globalCompositeOperation = 'destination-out';
      for (var k = 0; k < 2; k++) x.drawImage(sh, sh.ox * dpr, sh.oy * dpr, sh.width * dpr, sh.height * dpr);
      x.globalCompositeOperation = 'source-over';
    });
    g.rings.push({ x: g.lx + cx, y: g.ly + cy, r: g.ch * .3, t: 0 });
    g.pops.push({ x: g.lx + cx, y: g.ly + c.y, s: '+' + pts, t: 0 });
    // Arrows stuck in this chunk drop out
    for (var k = 0; k < g.arrows.length; k++) { var ar = g.arrows[k]; if (ar.stuck && ar.cell === i) { ar.stuck = false; ar.fall = true; ar.vx = (Math.random() - .5) * 60; ar.vy = -40; } }
    if (g.popped >= g.total) { g.score += B.WIN_BONUS; B.end(g, 'win'); g.tg = -1; }
    else B.pick(g);
  };

  B.end = function (g, mode) {
    g.mode = mode; g.endT = g.t; g.drawing = false;
    try { var b = +localStorage.getItem('bbarc-best') || 0; if (g.score > b) localStorage.setItem('bbarc-best', g.score); g.best = Math.max(b, g.score); } catch (e) { g.best = g.score; }
  };

  B.fire = function (g) {
    if (g.reload > 0 || g.mode === 'over' || g.mode === 'win') { g.pull = 0; return; }
    if (g.mode === 'idle') { g.mode = 'play'; g.left = B.TIME; g.tgT = g.t; }
    var a = g.ang, ux = Math.cos(a), uy = Math.sin(a), off = -g.R * .2 - g.pull * g.R * .55 + g.L;
    var sp = g.V * (.7 + .3 * g.pull);
    g.arrows.push({ x: g.bx + ux * off, y: g.by + uy * off, vx: ux * sp, vy: uy * sp, t: 0 });
    g.pull = 0; g.reload = B.RELOAD; g.kick = 1;
  };

  // Did the arrow tip hit anything? Returns true when the arrow stops.
  function hit(g, ar) {
    var lx = ar.x - g.lx, ly = ar.y - g.ly;
    if (lx < -8 || ly < -8 || lx > g.lw + 8 || ly > g.lh + 8) return false;
    var c = g.cells[g.tg], pad = Math.max(3, g.ch * .06), mx = lx | 0, my = ly | 0, inside = mx >= 0 && my >= 0 && mx < g.mw && my < g.mh;
    if (c && g.mode === 'play' && ((inside && g.id[my * g.mw + mx] === g.tg && g.mask[my * g.mw + mx]) || (lx > c.x - pad && lx < c.x + c.w + pad && ly > c.y - pad && ly < c.y + c.h + pad))) {
      ar.scored = true; B.pop(g, g.tg); return false; // flies on through the gap it made
    }
    if (inside && g.mask[my * g.mw + mx]) {
      ar.stuck = true; ar.t = 0; ar.cell = g.id[my * g.mw + mx];
      var sp = Math.hypot(ar.vx, ar.vy); ar.ux = ar.vx / sp; ar.uy = ar.vy / sp;
      ar.x += ar.ux * g.L * .12; ar.y += ar.uy * g.L * .12; ar.wob = 1;
      if (!ar.scored) g.streak = 0;
      return true;
    }
    return false;
  }

  B.update = function (g, dt) {
    g.t += dt;
    g.rise = Math.min(1, g.rise + dt * 2.2);
    // Aim at the pointer, upward only
    var a = Math.atan2(g.py - g.by, g.px - g.bx);
    if (a > 0) a = a < Math.PI / 2 ? -.12 : -Math.PI + .12;
    a = clamp(a, -Math.PI + .12, -.12);
    if (g.ang == null || g.snap) { g.ang = a; g.snap = false; } else g.ang += (a - g.ang) * Math.min(1, dt * 20);
    if (g.drawing) g.pull = Math.min(1, g.pull + dt / .5);
    g.reload -= dt; g.flash = Math.max(0, g.flash - dt); g.kick = Math.max(0, (g.kick || 0) - dt * 5);
    if (g.mode === 'play') { g.left -= dt; if (g.left <= 0) { g.left = 0; B.end(g, 'over'); } }
    var W = g.W, H = g.H;
    for (var i = g.arrows.length - 1; i >= 0; i--) {
      var ar = g.arrows[i]; ar.t += dt;
      if (ar.stuck) { ar.wob = Math.max(0, ar.wob - dt * 4); if (ar.t > 2.2) g.arrows.splice(i, 1); continue; }
      var sp = Math.hypot(ar.vx, ar.vy), n = Math.max(1, Math.ceil(sp * dt / 3)), h = dt / n, stop = false;
      for (var k = 0; k < n && !stop; k++) {
        ar.vy += g.G * h * (ar.fall ? 2 : 1); ar.x += ar.vx * h; ar.y += ar.vy * h;
        if (!ar.fall) stop = hit(g, ar);
      }
      if (!ar.stuck && (ar.x < -g.L || ar.x > W + g.L || ar.y < -g.L * 2 || ar.y > H + g.L)) {
        if (!ar.scored && !ar.fall && g.mode === 'play') g.streak = 0;
        g.arrows.splice(i, 1);
      }
    }
    for (i = g.parts.length - 1; i >= 0; i--) {
      var p = g.parts[i]; p.t += dt;
      if (p.t > p.life) { g.parts.splice(i, 1); continue; }
      p.vy += 900 * dt; p.vx *= 1 - dt * 1.5; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (i = g.rings.length - 1; i >= 0; i--) { g.rings[i].t += dt; if (g.rings[i].t > .45) g.rings.splice(i, 1); }
    for (i = g.pops.length - 1; i >= 0; i--) { g.pops[i].t += dt; if (g.pops[i].t > .9) g.pops.splice(i, 1); }
  };

  function arrow(g, x, tx, ty, ux, uy, al) {
    var L = g.L, hd = L * .16, K = B.COL;
    x.globalAlpha = al;
    var lw = Math.max(1.5, g.R * .07);
    x.lineCap = 'round'; x.beginPath(); x.moveTo(tx - ux * L, ty - uy * L); x.lineTo(tx - ux * hd, ty - uy * hd);
    x.strokeStyle = K.lav; x.lineWidth = lw + 2; x.stroke(); // thin lavender edge so arrows read against the black letters
    x.strokeStyle = K.ink; x.lineWidth = lw; x.stroke();
    var nx = -uy, ny = ux, hw = hd * .55;
    x.fillStyle = K.ink; x.beginPath();
    x.moveTo(tx, ty); x.lineTo(tx - ux * hd + nx * hw, ty - uy * hd + ny * hw); x.lineTo(tx - ux * hd - nx * hw, ty - uy * hd - ny * hw); x.closePath(); x.fill();
    // Purps fletching
    x.strokeStyle = K.purp; x.lineWidth = Math.max(2, g.R * .09);
    for (var f = 0; f < 2; f++) {
      var bx = tx - ux * (L - f * L * .07), by = ty - uy * (L - f * L * .07);
      x.beginPath(); x.moveTo(bx + ux * L * .1, by + uy * L * .1); x.lineTo(bx - nx * hw * 1.1, by - ny * hw * 1.1);
      x.moveTo(bx + ux * L * .1, by + uy * L * .1); x.lineTo(bx + nx * hw * 1.1, by + ny * hw * 1.1); x.stroke();
    }
    x.globalAlpha = 1;
  }

  B.draw = function (g) {
    var x = g.ctx, K = B.COL, W = g.W, H = g.H, dpr = g.dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    // Logo
    x.drawImage(g.lc, g.lx, g.ly, g.lw, g.lh);
    // Glowing target chunk
    var c = g.cells[g.tg];
    if (c && g.mode !== 'over') {
      var pu = .5 + .5 * Math.sin(g.t * 6), sc = 1 + .05 * pu, pad = g.tpad;
      var cx = g.lx + c.x + c.w / 2, cy = g.ly + c.y + c.h / 2, w = c.w + pad * 2, h = c.h + pad * 2;
      x.save(); x.translate(cx, cy); x.scale(sc, sc);
      x.shadowColor = K.purp; x.shadowBlur = (8 + 14 * pu) * dpr;
      x.drawImage(g.tc, -w / 2, -h / 2, w, h);
      x.shadowBlur = (4 + 6 * pu) * dpr; x.shadowColor = K.lav;
      x.drawImage(g.tc, -w / 2, -h / 2, w, h);
      x.restore();
    }
    // Arrows
    for (var i = 0; i < g.arrows.length; i++) {
      var ar = g.arrows[i], ux, uy;
      if (ar.stuck) { var w2 = Math.sin(ar.t * 40) * .06 * ar.wob; ux = ar.ux * Math.cos(w2) - ar.uy * Math.sin(w2); uy = ar.ux * Math.sin(w2) + ar.uy * Math.cos(w2); }
      else { var sp = Math.hypot(ar.vx, ar.vy) || 1; ux = ar.vx / sp; uy = ar.vy / sp; }
      arrow(g, x, ar.x, ar.y, ux, uy, ar.stuck ? Math.min(1, (2.2 - ar.t) / .5) : 1);
    }
    // Aim guide while drawing
    if (g.drawing && g.mode !== 'over' && g.mode !== 'win') {
      var a = g.ang, vx = Math.cos(a) * g.V * (.7 + .3 * g.pull), vy = Math.sin(a) * g.V * (.7 + .3 * g.pull), px = g.bx + Math.cos(a) * g.L, py = g.by + Math.sin(a) * g.L;
      x.fillStyle = K.ink; x.globalAlpha = .28;
      for (var d = 1; d <= 9; d++) { var tt = d * .022; x.beginPath(); x.arc(px + vx * tt, py + vy * tt + .5 * g.G * tt * tt, 1.6, 0, 7); x.fill(); }
      x.globalAlpha = 1;
    }
    // Bow
    var R = g.R, e = 1 - Math.pow(1 - g.rise, 3), pull = g.pull * R * .55;
    x.save(); x.translate(g.bx, g.by + (1 - e) * R * 3 + g.kick * 3); x.rotate(g.ang);
    x.lineCap = 'round'; x.strokeStyle = K.ink; x.lineWidth = Math.max(3.5, R * .14);
    x.beginPath(); x.moveTo(-R * .2, -R); x.quadraticCurveTo(R * .8 - pull * .15, 0, -R * .2, R); x.stroke();
    x.lineWidth = 1.5; x.beginPath(); x.moveTo(-R * .2, -R); x.lineTo(-R * .2 - pull, 0); x.lineTo(-R * .2, R); x.stroke();
    x.fillStyle = K.purp; x.fillRect(R * .22, -R * .16, R * .17, R * .32);
    x.restore();
    if (g.reload <= 0 && g.mode !== 'over' && g.mode !== 'win') {
      var ca = Math.cos(g.ang), sa = Math.sin(g.ang), off = -R * .2 - pull + g.L, by0 = g.by + (1 - e) * R * 3;
      arrow(g, x, g.bx + ca * off, by0 + sa * off, ca, sa, 1);
    }
    // Pop burst
    for (i = 0; i < g.rings.length; i++) {
      var rg = g.rings[i], k = rg.t / .45;
      x.strokeStyle = K.purp; x.globalAlpha = 1 - k; x.lineWidth = 3 * (1 - k) + 1;
      x.beginPath(); x.arc(rg.x, rg.y, rg.r + k * g.ch * 1.1, 0, 7); x.stroke();
    }
    x.globalAlpha = 1;
    for (i = 0; i < g.parts.length; i++) { var p = g.parts[i]; x.globalAlpha = 1 - p.t / p.life; x.fillStyle = p.c; x.fillRect(p.x, p.y, p.s, p.s); }
    x.globalAlpha = 1;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (i = 0; i < g.pops.length; i++) {
      var q = g.pops[i];
      x.globalAlpha = Math.min(1, (.9 - q.t) / .3); x.fillStyle = K.lime;
      x.font = '700 ' + Math.round(g.fs * 1.5) + 'px ' + g.font;
      x.fillText(q.s, q.x, q.y - 8 - q.t * 50);
    }
    x.globalAlpha = 1;
    // HUD
    var hy = Math.round(g.hud / 2);
    x.font = '500 ' + g.fs + 'px ' + g.font; x.textBaseline = 'middle';
    x.textAlign = 'left'; x.fillStyle = g.flash > 0 ? K.lime : K.ink; x.fillText('SCORE ' + fmt(g.score), 12, hy);
    x.fillStyle = K.ink;
    if (g.streak > 1) { x.textAlign = 'center'; x.fillText('STREAK x' + g.streak, W / 2, hy); }
    x.textAlign = 'right'; x.fillText('TIME 0:' + ('0' + Math.ceil(g.left)).slice(-2), W - 12, hy);
    // Message pill under the logo
    var msg = g.mode === 'idle' ? (g.touch ? 'TAP TO SHOOT THE PURPLE BIT' : 'AIM AND CLICK TO SHOOT THE PURPLE BIT') :
      g.mode === 'over' || g.mode === 'win' ? (g.mode === 'win' ? 'LOGO POPPED · ' : 'TIME’S UP · ') + fmt(g.score) + ' PTS' + (g.best > g.score ? ' · BEST ' + fmt(g.best) : g.score > 0 ? ' · NEW BEST' : '') + ' · ' + (g.touch ? 'TAP' : 'CLICK') + ' TO PLAY AGAIN' : '';
    if (msg) {
      var ms = clamp(Math.round(W / 90), 11, 16), bh = Math.round(ms * 2.5);
      x.font = '700 ' + ms + 'px ' + g.font;
      var tw = Math.min(W - 16, x.measureText(msg).width + ms * 2.4), my = g.ly + g.lh + (g.by - R - g.ly - g.lh) / 2;
      x.fillStyle = K.ink; x.beginPath();
      if (x.roundRect) x.roundRect(W / 2 - tw / 2, my - bh / 2, tw, bh, bh / 2); else x.rect(W / 2 - tw / 2, my - bh / 2, tw, bh);
      x.fill(); x.fillStyle = K.lime; x.textAlign = 'center'; x.fillText(msg, W / 2, my + 1, tw - ms);
    }
  };

  B.input = function (g) {
    var cv = g.cv;
    function pos(e) { var r = cv.getBoundingClientRect(); g.px = (e.clientX - r.left) * g.W / r.width; g.py = (e.clientY - r.top) * g.H / r.height; }
    cv.addEventListener('pointermove', pos);
    cv.addEventListener('pointerdown', function (e) {
      pos(e);
      if (e.pointerType !== 'mouse') g.snap = true;
      if (g.mode === 'over' || g.mode === 'win') { if (g.t - g.endT > .8) B.reset(g, 'play'); return; }
      g.drawing = true; g.pull = 0;
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cv.addEventListener('pointerup', function (e) { pos(e); if (g.drawing) { g.drawing = false; B.fire(g); } });
    cv.addEventListener('pointercancel', function () { g.drawing = false; g.pull = 0; });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  };

  function footer() {
    var f = document.querySelector(B.SEL);
    if (f) return f;
    if (B.PATHS.indexOf(location.pathname.replace(/\/$/, '') || '/') < 0) return null;
    var cs = document.querySelectorAll('[data-barba="container"]'), c = cs[cs.length - 1];
    return (c || document).querySelector('.bb-footer');
  }

  B.mount = function () {
    if (B.g) { B.g.stop(); B.g = null; }
    var f = footer();
    if (!f) return;
    var els = f.querySelectorAll('.bbft-lm .bbft-l');
    var raw = [].map.call(els, function (p) { return p.getAttribute('data-bb-d') || p.getAttribute('d'); }).filter(Boolean);
    if (!raw.length) return;
    var svg = els[0].ownerSVGElement, vb = B.VB;
    if (svg && svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) { var v = svg.viewBox.baseVal; vb = [v.x, v.y, v.width, v.height]; }
    var paths = raw.map(function (d) { return new Path2D(d); });
    f.classList.add('bbarc-on');
    var st = f.querySelector('.bbarc-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbarc-stage'; st.innerHTML = '<canvas aria-label="Mini game: shoot the glowing purple part of the Brave Beyond logo with a bow and arrow"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas');
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), paths: paths, bb: B.bounds(paths, vb), t: 0, W: 0,
      lc: document.createElement('canvas'), pc: document.createElement('canvas'), mk: document.createElement('canvas'), tc: document.createElement('canvas'),
      touch: window.matchMedia && matchMedia('(hover: none)').matches,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    try { g.best = +localStorage.getItem('bbarc-best') || 0; } catch (e) { g.best = 0; }
    B.input(g); B.size(g);
    var raf = 0, last = performance.now(), dead = false;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { B.size(g); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!g.W) B.size(g);
      var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      if (g.W && r.bottom > 0 && r.top < vh && r.width > 0) { B.update(g, dt); B.draw(g); }
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
