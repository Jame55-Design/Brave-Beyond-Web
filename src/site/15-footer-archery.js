// BB Footer Archery: bow and arrow game in the footer.
// A small purple bullseye sits on the Brave Beyond logo. Shoot it and it pops, punching a round hole in the letters.
// Hold to draw the bow (harder, flatter shot), release to fire. A quick tap/click still fires.
// Points: 100 x streak (up to x5) per pop, +100 for a dead-centre BULLSEYE, +50 for hitting within 1.5s of it appearing.
// Arrows never stick: they fly straight past the letters. A shot that misses the bullseye breaks your streak.
// A hit blows out a big round chunk of the logo around the bullseye (B.BLAST).
// 45-second round, starts on the first shot.
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
  B.BULL_PTS = 100;     // dead-centre bonus
  B.NEW_LOGO = 1000;    // bonus when the logo is shot away and a fresh one goes up
  B.TARGET = .11;       // bullseye radius as a share of the logo height
  B.BLAST = 2.2;        // hole blown out by a hit, as a multiple of the bullseye radius
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
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
    x.scale(k, k); x.translate(-g.bb[0], -g.bb[1]); x.fillStyle = col;
    for (var i = 0; i < g.paths.length; i++) x.fill(g.paths[i]);
    x.setTransform(1, 0, 0, 1, 0, 0); // back to plain pixels, so holes punched later land where they should
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
    B.reset(g, 'idle');
  };

  // Draw a fresh, whole logo and its hit mask
  B.fresh = function (g) {
    var dpr = g.dpr;
    paint(g, g.lc, g.lw * dpr, g.lh * dpr, B.COL.ink);
    // 1px-per-CSS-pixel hit mask
    var mx = paint(g, g.mk, g.lw, g.lh, '#000'), mw = g.mk.width, mh = g.mk.height;
    var d = mx.getImageData(0, 0, mw, mh).data, m = new Uint8Array(mw * mh);
    for (var i = 0; i < mw * mh; i++) m[i] = d[i * 4 + 3] > 100 ? 1 : 0;
    g.mask = m; g.mw = mw; g.mh = mh;
  };

  B.reset = function (g, mode) {
    B.fresh(g);
    g.tr = clamp(g.lh * B.TARGET, 9, 24);
    g.arrows = []; g.parts = []; g.rings = []; g.pops = [];
    g.score = 0; g.streak = 0; g.left = B.TIME; g.mode = mode; g.reload = 0; g.drawing = false; g.pull = 0; g.flash = 0;
    g.rise = mode === 'play' ? 1 : 0; g.tg = null; g.next = 0;
    B.pick(g);
  };

  // Move an arrow on by dt in small steps (the game and the reach check both use this, so they always agree)
  function fly(g, ar, dt, probe) {
    var sp = Math.hypot(ar.vx, ar.vy), n = Math.max(1, Math.ceil(sp * dt / 3)), h = dt / n;
    for (var k = 0; k < n; k++) {
      ar.vy += g.G * h * (ar.fall ? 2 : 1); ar.x += ar.vx * h; ar.y += ar.vy * h;
      if (probe) { var r = probe(ar); if (r) return r; }
    }
    return 0;
  }
  // Solid ink at (px, py)? Ignores hairline slivers so arrows don't snag on nothing
  function solid(g, px, py) {
    if (px < 1 || py < 1 || px >= g.mw - 1 || py >= g.mh - 1 || !g.mask[py * g.mw + px]) return false;
    var n = 0, m = g.mask, w = g.mw;
    for (var y = -1; y <= 1; y++) for (var x = -1; x <= 1; x++) n += m[(py + y) * w + px + x];
    return n >= 6;
  }
  // Share of the circle (cx, cy, r) in logo coords that is still ink
  function cover(g, cx, cy, r) {
    var n = 0, k = 0, st = Math.max(1, Math.round(r / 6));
    for (var y = -r; y <= r; y += st) for (var x = -r; x <= r; x += st) {
      if (x * x + y * y > r * r) continue;
      var px = (cx + x) | 0, py = (cy + y) | 0; n++;
      if (px >= 0 && py >= 0 && px < g.mw && py < g.mh && g.mask[py * g.mw + px]) k++;
    }
    return n ? k / n : 0;
  }
  // Would a full-power arrow aimed at this spot reach it before hitting other letters?
  function clear(g, cx, cy, r) {
    var a = Math.atan2(g.ly + cy - g.by, g.lx + cx - g.bx);
    if (a > -.12 || a < -Math.PI + .12) return false;
    var o = g.L - g.R * .75, ar = { x: g.bx + Math.cos(a) * o, y: g.by + Math.sin(a) * o, vx: Math.cos(a) * g.V, vy: Math.sin(a) * g.V };
    var probe = function (q) {
      if (q.y < g.ly - 10 || q.x < 0 || q.x > g.W) return 3;
      var lx = q.x - g.lx, ly = q.y - g.ly;
      if ((lx - cx) * (lx - cx) + (ly - cy) * (ly - cy) < r * r * 1.1) return 2;
      return 0; // arrows fly through letters, so nothing blocks the shot
    };
    for (var f = 0; f < 240; f++) { var res = fly(g, ar, 1 / 60, probe); if (res) return res === 2; }
    return false;
  }
  B.clear = function (g, x, y) { return clear(g, x, y, g.tr); }; B.cover = function (g, x, y) { return cover(g, x, y, g.tr); };
  // Place a new bullseye on the letters, somewhere the bow can reach, away from the last one
  B.pick = function (g) {
    var r = g.tr, old = g.tg, best = null, bd = -1, fall = null;
    for (var t = 0; t < 400; t++) {
      var cx = r + Math.random() * (g.mw - 2 * r), cy = r * .6 + Math.random() * (g.mh - r * 1.2);
      if (!g.mask[(cy | 0) * g.mw + (cx | 0)] || cover(g, cx, cy, r) < .8) continue;
      if (!fall) fall = { x: cx, y: cy };
      if (!clear(g, cx, cy, r)) continue;
      var dd = old ? Math.hypot(cx - old.x, cy - old.y) : 1;
      if (dd > bd) { bd = dd; best = { x: cx, y: cy }; }
      if (bd > g.lw * .25) break;
    }
    // Nothing clear found: trace real full-power shots and sit the bullseye where one lands on the letters
    for (t = 0; t < 240 && !best; t++) {
      var a = -Math.PI + .2 + Math.random() * (Math.PI - .4), o = g.L - g.R * .75;
      var x = g.bx + Math.cos(a) * o, y = g.by + Math.sin(a) * o, vx = Math.cos(a) * g.V, vy = Math.sin(a) * g.V, h = 2 / g.V;
      for (var n = 0; n < 4000; n++) {
        vy += g.G * h; x += vx * h; y += vy * h;
        if (y < g.ly - 10 || x < 0 || x > g.W) break;
        var px = (x - g.lx) | 0, py = (y - g.ly) | 0;
        if (px < 0 || py < 0 || px >= g.mw || py >= g.mh || !g.mask[py * g.mw + px]) continue;
        var sp = Math.hypot(vx, vy), qx = px + vx / sp * r * .75, qy = py + vy / sp * r * .75, qi = (qy | 0) * g.mw + (qx | 0);
        if (qx > 0 && qy > 0 && qx < g.mw && qy < g.mh && g.mask[qi] && cover(g, qx, qy, r) > .55 && clear(g, qx, qy, r)) {
          var d2 = old ? Math.hypot(qx - old.x, qy - old.y) : 1;
          if (d2 > bd) { bd = d2; best = { x: qx, y: qy }; }
        }
        break;
      }
    }
    // Last resort: the first spot a straight-up shot would land on
    if (!best) for (t = 0; t < 120 && !best; t++) {
      var cx2 = g.bx - g.lx + (Math.random() - .5) * g.lw * .9, cy2 = g.mh - 1;
      while (cy2 > 0 && !(g.mask[(cy2 | 0) * g.mw + (cx2 | 0)])) cy2--;
      if (cy2 > 0 && cover(g, cx2, cy2 - r * .6, r) > .55 && clear(g, cx2, cy2 - r * .6, r)) best = { x: cx2, y: cy2 - r * .6 };
    }
    if (!best && !g.rebuilt) {
      // Nothing left the bow can reach: put up a fresh logo and carry on (+1,000)
      B.fresh(g); g.rebuilt = true;
      if (g.mode === 'play') { g.score += B.NEW_LOGO; g.flash = .35; g.pops.push({ x: g.W / 2, y: g.ly + g.lh / 2, s: 'NEW LOGO +' + fmt(B.NEW_LOGO), t: 0 }); }
      for (var k = 0; k < g.arrows.length; k++) if (g.arrows[k].stuck) g.arrows[k].t = 2;
      B.pick(g); g.rebuilt = false;
      return;
    }
    g.tg = best || fall; g.tgT = g.t;
    if (g.tg) g.tg.n = g.tgN = (g.tgN || 0) + 1;
  };

  B.pop = function (g, bull) {
    var c = g.tg, dpr = g.dpr, R = g.tr * B.BLAST;
    g.streak = Math.min(B.MAX_STREAK, g.streak + 1);
    var pts = B.PTS * g.streak + (bull ? B.BULL_PTS : 0) + (g.t - g.tgT < B.FAST ? B.FAST_PTS : 0);
    g.score += pts; g.flash = .35;
    // Burst the ink inside the circle into particles, then punch the hole
    var st = Math.max(2, Math.round(R / 7)), mw = g.mw;
    var RM = R + 1.5; // hit mask hole is a touch bigger than the visible one, so no invisible ring is left
    for (var y = Math.max(0, c.y - RM | 0); y < Math.min(g.mh, c.y + RM + 1); y++) for (var x = Math.max(0, c.x - RM | 0); x < Math.min(mw, c.x + RM + 1); x++) {
      var dx = x - c.x, dy = y - c.y;
      if (dx * dx + dy * dy > RM * RM || !g.mask[y * mw + x]) continue;
      g.mask[y * mw + x] = 0;
      if (x % st || y % st) continue;
      var a = Math.atan2(dy, dx) + (Math.random() - .5) * .9, sp = 60 + Math.random() * 160;
      g.parts.push({ x: g.lx + x, y: g.ly + y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 140, s: st, life: .45 + Math.random() * .4, t: 0, c: Math.random() < .6 ? B.COL.purp : B.COL.lav });
    }
    var hx = g.lc.getContext('2d');
    hx.setTransform(1, 0, 0, 1, 0, 0); hx.globalCompositeOperation = 'destination-out';
    hx.beginPath(); hx.arc(c.x * dpr, c.y * dpr, RM * dpr, 0, 7); hx.fill(); // same size as the hit map hole
    hx.globalCompositeOperation = 'source-over';
    g.rings.push({ x: g.lx + c.x, y: g.ly + c.y, r: R * .6, t: 0 });
    g.pops.push({ x: g.lx + c.x, y: g.ly + c.y - R * .7, s: (bull ? 'BULLSEYE +' : '+') + pts, t: 0 });
    // Arrows stuck inside the hole drop out
    for (var k = 0; k < g.arrows.length; k++) {
      var ar = g.arrows[k];
      if (ar.stuck && Math.hypot(ar.x - g.lx - c.x, ar.y - g.ly - c.y) < R + 4) { ar.stuck = false; ar.fall = true; ar.vx = (Math.random() - .5) * 60; ar.vy = -40; }
    }
    g.tg = null; g.next = .35; // short pause, then a new bullseye on what's left
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
    // Each arrow can only pop the bullseye that was up when it was fired, never one that appears while it's in the air
    g.arrows.push({ x: g.bx + ux * off, y: g.by + uy * off, vx: ux * sp, vy: uy * sp, t: 0, tn: g.tg ? g.tg.n : -1 });
    g.pull = 0; g.reload = B.RELOAD; g.kick = 1;
  };

  // Did the arrow tip hit anything? Returns true when the arrow stops.
  function hit(g, ar) {
    var lx = ar.x - g.lx, ly = ar.y - g.ly;
    if (lx < -8 || ly < -8 || lx > g.lw + 8 || ly > g.lh + 8) return false;
    var c = g.tg, mx = lx | 0, my = ly | 0, inside = mx >= 0 && my >= 0 && mx < g.mw && my < g.mh;
    if (c && g.mode === 'play' && !ar.scored && c.n === ar.tn) {
      var d = Math.hypot(lx - c.x, ly - c.y);
      if (d < g.tr * 1.1) { ar.scored = true; B.pop(g, d < g.tr * .35); } // pop, and the arrow flies on
    }
    return false; // arrows never stick in the letters
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
    if (g.next > 0) { g.next -= dt; if (g.next <= 0) B.pick(g); }
    if (g.mode === 'play') { g.left -= dt; if (g.left <= 0) { g.left = 0; B.end(g, 'over'); } }
    var W = g.W, H = g.H;
    for (var i = g.arrows.length - 1; i >= 0; i--) {
      var ar = g.arrows[i]; ar.t += dt;
      if (ar.stuck) { ar.wob = Math.max(0, ar.wob - dt * 4); if (ar.t > 2.2) g.arrows.splice(i, 1); continue; }
      fly(g, ar, dt, ar.fall ? null : function (q) { return hit(g, q) ? 1 : 0; });
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
    // Bullseye: purple rings that pulse with a soft purple glow
    var c = g.tg;
    if (c && g.mode !== 'over') {
      var pu = .5 + .5 * Math.sin(g.t * 6), r = g.tr * (1 + .06 * pu), cx = g.lx + c.x, cy = g.ly + c.y;
      x.save(); x.shadowColor = K.purp; x.shadowBlur = (6 + 12 * pu) * dpr;
      x.fillStyle = K.purp; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
      x.restore();
      x.fillStyle = K.lav; x.beginPath(); x.arc(cx, cy, r * .68, 0, 7); x.fill();
      x.fillStyle = K.purp; x.beginPath(); x.arc(cx, cy, r * .4, 0, 7); x.fill();
      x.fillStyle = K.ink; x.beginPath(); x.arc(cx, cy, Math.max(1.5, r * .12), 0, 7); x.fill();
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
      x.beginPath(); x.arc(rg.x, rg.y, rg.r + k * g.tr * 2.2, 0, 7); x.stroke();
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
    var msg = g.mode === 'idle' ? (g.touch ? 'TAP TO HIT THE BULLSEYE' : 'AIM AND CLICK TO HIT THE BULLSEYE') :
      g.mode === 'over' || g.mode === 'win' ? 'TIME’S UP · ' + fmt(g.score) + ' PTS' + (g.best > g.score ? ' · BEST ' + fmt(g.best) : g.score > 0 ? ' · NEW BEST' : '') + ' · ' + (g.touch ? 'TAP' : 'CLICK') + ' TO PLAY AGAIN' : '';
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
      lc: document.createElement('canvas'), mk: document.createElement('canvas'), 
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
