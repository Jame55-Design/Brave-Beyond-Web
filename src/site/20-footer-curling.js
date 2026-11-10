// BB Footer Curling: top-down curling along the footer ice.
// Hold to run the stone up from the hack, let go before the near hog line, then rub just in front of the moving
// stone to sweep it: sweeping carries it further and takes out most of the curl. 8 stones an end. Points for every
// stone of yours in the rings when the end is over (button 100, 4ft 50, 8ft 25, 12ft 10), +20 for knocking a rival
// stone off the ice. The camera follows the stone, so the house slides into view as it gets there; a mini house in
// the bottom corner shows the rings the rest of the time.
// In the arcade rotation (18-footer-arcade.js) on green and purple footers, no page default yet (ns: []).
// Buttons: Play / Play again via BBPILL.place. Instructions and results are plain text via BBPILL.say.
// Keys: hold Space to run, Up / Down to aim, tap Space (or Up / Down) to sweep. Best in localStorage bbCurlingBest.
// Test: BBCU.update(BBCU.g, 1/60); BBCU.draw(BBCU.g).
(function () {
  var CU = window.BBCU = window.BBCU || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbcu-on{padding-top:4vw}' +
    '.bb-footer.bbcu-on .bbft-lm{display:none}' +
    '.bbcu-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbcu-stage canvas{display:block;width:100%;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    '.bb-footer.bbcu-on .bbft-ig{order:1;margin:2vw 0 0}' +
    '@media (max-width:479px){.bb-footer.bbcu-on{padding-top:24px}.bb-footer.bbcu-on .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);

  // Sheet geometry in sheet widths (1 = the ice between the two rules). x runs from the near end; y -0.5..0.5, 0 = centre line.
  CU.R = 0.048;                 // stone radius (bigger than real so it reads on a footer)
  CU.HACK = 0.3; CU.START = 0.42;
  CU.HOG1 = 1.45;               // let go before this line
  CU.HOG2 = 4.0;                // a stone has to get past this one to stay in play
  CU.TEE = 5.3;
  CU.RINGS = [0.36, 0.24, 0.12, 0.04];   // 12ft, 8ft, 4ft, button
  CU.PTS = [10, 25, 50, 100];
  CU.BACK = CU.TEE + CU.RINGS[0];
  CU.END = 6.15;
  CU.STONES = 8;
  CU.TAKEOUT = 20;
  CU.RUN = 0.64;                // run-up acceleration while held
  CU.MU = 0.147;                // ice friction
  CU.SWEEP = 0.34;              // full sweeping cuts friction by this much (about 1.5x the distance)
  CU.CURL = 0.06;               // sideways drift, small at speed, big late on as the stone slows
  CU.SWEEP_CURL = 0.7;          // full sweeping takes this much of the curl out
  CU.C = { ink: '#212121', lime: '#CCFF00', lav: '#E9DBEC', pink: '#E8CAE9', green: '#07A87E', purps: '#AE9AE4' };
  CU.THEMES = {
    green:  { bg: '#07A87E', ring: '#AE9AE4', cap: '#AE9AE4', pad: '#E8CAE9' },
    purple: { bg: '#AE9AE4', ring: '#07A87E', cap: '#07A87E', pad: '#CCFF00' }
  };
})();

(function () {
  var CU = window.BBCU, C = CU.C, R = CU.R;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  CU.size = function (g) {
    var W = Math.round(g.st.getBoundingClientRect().width);
    if (!W || W === g.W) return;
    g.W = W;
    g.fs = Math.max(11, Math.min(16, Math.round(W / 96)));      // HUD text, same scale as the other footer games
    g.hy = Math.round(g.fs * 1.6);
    g.H = g.hy + Math.round(g.fs * 1.4) + (W < 560 ? 350 : 476);
    g.top = g.hy + Math.round(g.fs * 1.4);
    g.S = g.H - g.top - 6;                                        // ice width in px
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    g.cv.width = W * dpr; g.cv.height = g.H * dpr; g.cv.style.height = g.H + 'px';
    g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.view = W / g.S;
    g.cam = clamp(g.cam, 0, camMax(g));
  };
  function camMax(g) { return Math.max(0, CU.END - g.view); }
  function sx(g, x) { return (x - g.cam) * g.S; }
  function sy(g, y) { return g.top + (y + 0.5) * g.S; }

  function camTo(g, x, dur) {
    x = clamp(x, 0, camMax(g));
    if (RM || !dur) { g.cam = x; g.camD = 0; return; }
    g.camA = g.cam; g.camB = x; g.camT = 0; g.camD = dur;
  }
  function follow(g, st) { return clamp(st.x - g.view * 0.32, 0, camMax(g)); }
  function houseCam(g) { return clamp(CU.TEE - g.view * 0.5, 0, camMax(g)); }

  // rival stones: one guard short of the house, one in the rings, sometimes a third
  function rivals() {
    var a = [], tries = 0;
    var put = function (fx, fy) {
      for (var k = 0; k < 40; k++) {
        var p = { x: fx(), y: fy() }, ok = true;
        for (var i = 0; i < a.length; i++) if (Math.hypot(a[i].x - p.x, a[i].y - p.y) < R * 3) ok = false;
        if (ok) { a.push(stone(p.x, p.y, false)); return; }
      }
    };
    put(function () { return CU.TEE - CU.RINGS[0] - 0.2 - Math.random() * 0.5; }, function () { return (Math.random() - 0.5) * 0.24; });
    put(function () { return CU.TEE + (Math.random() - 0.5) * 0.36; }, function () { return (Math.random() - 0.5) * 0.36; });
    if (Math.random() < 0.5) put(function () { return CU.TEE + (Math.random() - 0.5) * 0.5; }, function () { return (Math.random() < .5 ? -1 : 1) * (0.12 + Math.random() * 0.16); });
    return a;
  }
  function stone(x, y, mine) { return { x: x, y: y, vx: 0, vy: 0, mine: mine, spin: 0, ang: Math.random() * 6.28, moving: false, out: 0 }; }

  function ringOf(st) {   // 0..3 = 12ft..button, -1 = not in the house
    var d = Math.hypot(st.x - CU.TEE, st.y), r = -1;
    for (var i = 0; i < 4; i++) if (d < CU.RINGS[i] + R) r = i;
    return r;
  }
  function houseScore(g) {
    var n = 0;
    for (var i = 0; i < g.stones.length; i++) { var st = g.stones[i]; if (st.mine && !st.out) { var r = ringOf(st); if (r >= 0) n += CU.PTS[r]; } }
    return n;
  }
  function inHouse(g) {
    var n = 0;
    for (var i = 0; i < g.stones.length; i++) if (g.stones[i].mine && !g.stones[i].out && ringOf(g.stones[i]) >= 0) n++;
    return n;
  }

  function pop(g, x, y, txt, big) { g.pops.push({ x: x, y: y, txt: txt, life: 1.3, big: !!big }); }
  function say(g, txt) { g.msg = txt; g.msgT = 1.6; }

  function kill(g, st, why) {
    if (st.out) return;
    st.out = 0.001; st.moving = false; st.vx = st.vy = 0;
    if (!st.mine) { g.take += CU.TAKEOUT; g.takes++; pop(g, clamp(st.x, CU.HOG2, CU.BACK), clamp(st.y, -0.4, 0.4), '+' + CU.TAKEOUT + ' takeout', true); }
    else if (st === g.cur) say(g, why === 'hog' ? 'Short of the hog line' : why === 'foul' ? 'Over the line · let go sooner' : why === 'side' ? 'Off the side' : 'Through the house');
  }

  function newStone(g) {
    var dir = Math.random() < 0.5 ? 1 : -1;
    g.cur = stone(CU.START, 0, true); g.cur.spin = dir; g.cur.ang = dir > 0 ? 0 : Math.PI;
    g.stones.push(g.cur);
    g.thrower = { x: CU.START - R * 2.4, y: 0, vx: 0 };
    g.aim = 0; g.sw = 0; g.sweep = 0; g.holdT = 0;
  }

  CU.start = function (g) {
    Object.assign(g, { mode: 'pan', score: 0, take: 0, takes: 0, n: 0, pops: [], marks: [], msg: '', msgT: 0, overT: 0, overPanned: false });
    g.stones = rivals();
    newStone(g);
    camTo(g, 0, 0.8);
  };
  CU.idle = function (g) {
    Object.assign(g, { mode: 'idle', score: 0, take: 0, takes: 0, n: 0, pops: [], marks: [], msg: '', msgT: 0 });
    g.stones = rivals();
    newStone(g);
    g.cam = 0; g.camD = 0;
  };
  function end(g) {
    g.mode = 'over'; g.overT = 0; g.overPanned = false;
    g.score = houseScore(g) + g.take;
    g.newBest = g.score > g.best && g.score > 0;
    if (g.newBest) { g.best = g.score; try { localStorage.setItem('bbCurlingBest', g.best); } catch (e) {} }
  }

  // input -------------------------------------------------------------------------------------------------------
  CU.press = function (g) {
    if (g.mode !== 'ready') return;
    g.mode = 'run'; g.holdT = 0; g.cur.vx = 0;
  };
  CU.release = function (g) {
    if (g.mode !== 'run') return;
    var cur = g.cur;
    if (g.holdT < 0.15) {   // a tap, not a throw: back to the hack
      cur.x = CU.START; cur.vx = 0; g.thrower.x = CU.START - R * 2.4; g.mode = 'ready'; return;
    }
    cur.vy = clamp(cur.vyRun || 0, -0.35, 0.35) * 0.12;
    cur.moving = true;
    g.thrower.vx = cur.vx * 0.85;
    g.mode = 'slide'; g.n++; g.sw = 0; g.sweep = 0; g.slideT = 0;
  };
  CU.aimAt = function (g, py) { g.aim = clamp((py - g.top) / g.S - 0.5, -0.5 + R + 0.03, 0.5 - R - 0.03); };
  function sweepZone(g, px, py) {
    var c = g.cur; if (!c || c.out) return false;
    var x = sx(g, c.x), y = sy(g, c.y), rp = R * g.S;
    return px > x - rp * 0.5 && px < x + rp * 8 && Math.abs(py - y) < rp * 4;
  }
  CU.move = function (g, px, py, dx, dy) {
    g.px = px; g.py = py;
    if (g.mode === 'run') CU.aimAt(g, py);
    if (g.mode === 'slide' && g.cur && g.cur.moving && sweepZone(g, px, py)) {
      g.sw += Math.abs(dy) + Math.abs(dx) * 0.4;   // sweeping is across the stone's path, so up / down counts most
      g.brushT = g.clock; g.bx = px; g.by = py;
    }
  };
  CU.keySweep = function (g) {
    if (g.mode !== 'slide' || !g.cur || !g.cur.moving) return;
    g.sw += R * g.S * 1.7; g.kSweepT = g.clock;
  };

  // physics -----------------------------------------------------------------------------------------------------
  function step(g, h) {
    var a = g.stones, i, j, st;
    for (i = 0; i < a.length; i++) {
      st = a[i];
      if (st.out || !st.moving) continue;
      var v = Math.hypot(st.vx, st.vy), e = st === g.cur ? g.sweep : 0;
      var nv = Math.max(0, v - CU.MU * (1 - CU.SWEEP * e) * h);
      if (v > 0) { st.vx *= nv / v; st.vy *= nv / v; }
      if (st.spin && nv > 0) {
        var c = CU.CURL * st.spin * (1 - CU.SWEEP_CURL * e) * Math.min(2.4, 0.22 / (nv + 0.09));
        st.vx += -st.vy / nv * c * h; st.vy += st.vx / nv * c * h;
      }
      st.x += st.vx * h; st.y += st.vy * h;
      st.ang += (st.spin || 0.5) * nv * 2.2 * h;
      if (nv < 0.003) { st.vx = st.vy = 0; st.moving = false; }
      if (Math.abs(st.y) > 0.5 - R) kill(g, st, 'side');
      else if (st.x - R > CU.BACK) kill(g, st, 'back');
    }
    for (i = 0; i < a.length; i++) {
      var p = a[i]; if (p.out) continue;
      for (j = i + 1; j < a.length; j++) {
        var q = a[j]; if (q.out) continue;
        var dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
        if (d >= 2 * R || d === 0) continue;
        var nx = dx / d, ny = dy / d, o = (2 * R - d) / 2;
        p.x -= nx * o; p.y -= ny * o; q.x += nx * o; q.y += ny * o;
        var rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
        if (rv < 0) {
          var imp = -(1 + 0.9) * rv / 2;
          p.vx -= imp * nx; p.vy -= imp * ny; q.vx += imp * nx; q.vy += imp * ny;
          p.moving = q.moving = true;
          g.hits.push({ x: p.x + nx * R, y: p.y + ny * R, life: 0.35 });
        }
      }
    }
  }

  CU.update = function (g, dt) {
    g.clock += dt;
    var cur = g.cur, i;
    // camera
    if (g.camD) { g.camT += dt; var t = Math.min(1, g.camT / g.camD); g.cam = g.camA + (g.camB - g.camA) * ease(t); if (t >= 1) g.camD = 0; }

    if (g.mode === 'pan' && !g.camD) g.mode = 'ready';
    if (g.mode === 'ready' || g.mode === 'idle') {
      // nudge the stone toward the aim while waiting, so the line can be set before running
      if (g.mode === 'ready') cur.y += clamp((g.aim - cur.y) * 6, -0.4, 0.4) * dt;
      g.thrower.y = cur.y;
    }
    if (g.mode === 'run') {
      g.holdT += dt;
      cur.vx += CU.RUN * dt;
      cur.vyRun = clamp((g.aim - cur.y) * 5, -0.35, 0.35);
      cur.y += cur.vyRun * dt;
      cur.x += cur.vx * dt;
      cur.ang += cur.spin * 0.8 * dt;
      g.thrower.x = cur.x - R * 2.4; g.thrower.y = cur.y;
      if (cur.x + R >= CU.HOG1) {   // held over the line: burned
        kill(g, cur, 'foul'); g.n++; g.mode = 'settle'; g.setT = 0;
      }
      if (g.mode === 'run') g.cam = follow(g, cur);
    }
    if (g.mode === 'slide') {
      g.slideT += dt;
      g.sw *= Math.exp(-dt * 5);
      var target = clamp(g.sw / (R * g.S * 4.5), 0, 1);
      g.sweep += (target - g.sweep) * Math.min(1, dt * 10);
      if (g.thrower.vx) { g.thrower.vx *= Math.exp(-dt * 2.2); g.thrower.x += g.thrower.vx * dt; if (g.thrower.vx < 0.01) g.thrower.vx = 0; }
      var steps = Math.max(1, Math.ceil(dt / 0.008));
      for (i = 0; i < steps; i++) step(g, dt / steps);
      if (!cur.out) g.cam += (follow(g, cur) - g.cam) * Math.min(1, dt * 8);
      // sweep marks on the ice under the brush
      var brushing = g.brushT != null && g.clock - g.brushT < 0.12, keyb = g.kSweepT != null && g.clock - g.kSweepT < 0.3;
      if ((brushing || keyb) && g.sweep > 0.15 && cur.moving) {
        g.markT = (g.markT || 0) - dt;
        if (g.markT <= 0) {
          g.markT = 0.025;
          var bx = keyb && !brushing ? cur.x + R * 2.4 : g.cam + g.bx / g.S;
          var by = keyb && !brushing ? cur.y : (g.by - g.top) / g.S - 0.5;
          g.marks.push({ x: bx, y: clamp(by, -0.48, 0.48), life: 1.4 });
          if (g.marks.length > 240) g.marks.shift();
        }
      }
      var any = false;
      for (i = 0; i < g.stones.length; i++) if (g.stones[i].moving && !g.stones[i].out) any = true;
      if (!any) {
        if (!cur.out && cur.x + R < CU.HOG2) kill(g, cur, 'hog');
        if (!cur.out) { var rg = ringOf(cur); if (rg >= 0) pop(g, cur.x, cur.y - R * 2.2, '+' + CU.PTS[rg], rg >= 2); }
        g.mode = 'settle'; g.setT = 0;
      }
    } else if (g.mode !== 'run') {
      // stones knocked earlier keep sliding to a stop
      var still = false;
      for (i = 0; i < g.stones.length; i++) if (g.stones[i].moving) still = true;
      if (still) { var n2 = Math.max(1, Math.ceil(dt / 0.008)); for (i = 0; i < n2; i++) step(g, dt / n2); }
    }
    if (g.mode === 'settle') {
      g.setT += dt;
      if (g.setT > 1.1) {
        g.stones = g.stones.filter(function (st) { return !st.out || st.out < 1; });
        if (g.n >= CU.STONES) { end(g); camTo(g, houseCam(g), 0.6); }
        else { newStone(g); g.mode = 'pan'; camTo(g, 0, 0.9); }
      }
    }
    if (g.mode === 'over') {
      g.overT += dt;
      if (!overRoom(g) && g.overT > 1.6 && !g.overPanned) { g.overPanned = true; camTo(g, 0, 0.8); }
    }
    g.score = houseScore(g) + g.take;
    // fades
    for (i = 0; i < g.stones.length; i++) if (g.stones[i].out) g.stones[i].out += dt * 2.5;
    for (i = g.pops.length - 1; i >= 0; i--) { g.pops[i].life -= dt; g.pops[i].y -= dt * 0.06; if (g.pops[i].life <= 0) g.pops.splice(i, 1); }
    for (i = g.marks.length - 1; i >= 0; i--) { g.marks[i].life -= dt; if (g.marks[i].life <= 0) g.marks.splice(i, 1); }
    for (i = g.hits.length - 1; i >= 0; i--) { g.hits[i].life -= dt; if (g.hits[i].life <= 0) g.hits.splice(i, 1); }
    if (g.msgT > 0) g.msgT -= dt;
  };

  // the result sits beside the house when there's room for it (desktop), otherwise back at the hack
  function overRoom(g) { var r = sx(g, CU.TEE - CU.RINGS[0] - 0.12); return r >= 380 && r <= g.W; }
  // centre of the widest stretch between the ice lines in [a, b], so text never sits on a line
  function freeSpot(g, a, b) {
    var xs = [a, b];
    [0, CU.HACK, CU.HOG1, CU.HOG2, CU.TEE, CU.BACK, CU.END].forEach(function (v) { var p = sx(g, v); if (p > a && p < b) xs.push(p); });
    xs.sort(function (m, n) { return m - n; });
    var best = 0, at = (a + b) / 2;
    for (var i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > best) { best = xs[i] - xs[i - 1]; at = (xs[i] + xs[i - 1]) / 2; }
    return best >= 340 ? at : (a + b) / 2;
  }

  // drawing -----------------------------------------------------------------------------------------------------
  function circle(x, cx, cy, r, fill, line) {
    x.beginPath(); x.arc(cx, cy, r, 0, 6.2832);
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (line) { x.strokeStyle = line; x.lineWidth = 1; x.stroke(); }
  }
  function drawHouse(x, cx, cy, k, pal) {   // k = px per sheet width
    var rr = CU.RINGS, fills = [pal.ring, pal.bg, C.lime, pal.bg];
    for (var i = 0; i < 4; i++) circle(x, cx, cy, rr[i] * k, fills[i], C.ink);
  }
  function drawStone(x, cx, cy, rp, st, pal, alpha) {
    x.save();
    x.globalAlpha = alpha;
    var mine = st.mine;
    circle(x, cx, cy, rp, mine ? C.ink : C.lav, C.ink);
    circle(x, cx, cy, rp * 0.68, mine ? pal.cap : C.ink);
    x.translate(cx, cy); x.rotate(st.ang);
    x.fillStyle = mine ? C.lime : C.lav;
    var hw = rp * 0.26, hl = rp * 0.95;
    x.beginPath();
    if (x.roundRect) x.roundRect(-hl / 2, -hw / 2, hl, hw, hw / 2); else x.rect(-hl / 2, -hw / 2, hl, hw);
    x.fill();
    x.fillStyle = mine ? C.ink : C.ink;
    x.beginPath(); x.arc(-hl * 0.18, 0, hw * 0.32, 0, 6.2832); x.fill();
    x.restore();
  }
  function drawThrower(x, g, rp, holding) {
    var t = g.thrower, cx = sx(g, t.x), cy = sy(g, t.y);
    if (cx < -rp * 4 || cx > g.W + rp * 4) return;
    var bob = (g.mode === 'run' && !RM) ? Math.sin(g.clock * 16) * rp * 0.12 : 0;
    x.save();
    x.strokeStyle = C.ink; x.lineCap = 'round';
    // broom trailing behind, held in the left hand
    x.lineWidth = rp * 0.2;
    x.beginPath(); x.moveTo(cx - rp * 0.1, cy + rp * 1.1); x.lineTo(cx - rp * 2.6, cy + rp * 2.3); x.stroke();
    x.fillStyle = C.ink; x.beginPath();
    x.ellipse(cx - rp * 2.75, cy + rp * 2.36, rp * 0.28, rp * 0.75, -1.1, 0, 6.2832); x.fill();
    // right arm reaching to the handle
    if (holding) {
      x.lineWidth = rp * 0.36;
      x.beginPath(); x.moveTo(cx + rp * 0.3, cy - rp * 0.7); x.lineTo(sx(g, g.cur.x) - rp * 0.3, sy(g, g.cur.y) - rp * 0.1); x.stroke();
    }
    // body + beanie from above
    x.fillStyle = C.ink; x.beginPath(); x.ellipse(cx + bob, cy, rp * 0.95, rp * 1.45, 0, 0, 6.2832); x.fill();
    circle(x, cx + rp * 0.1 + bob, cy, rp * 0.62, C.lime);
    circle(x, cx + rp * 0.1 + bob, cy, rp * 0.2, C.ink);
    x.restore();
  }
  function drawBroom(x, bx, by, rp, pal, wob) {
    x.save();
    x.strokeStyle = C.ink; x.lineCap = 'round'; x.lineWidth = rp * 0.22;
    x.beginPath(); x.moveTo(bx, by); x.lineTo(bx - rp * 2.2, by + rp * 3.6 + wob); x.stroke();
    x.translate(bx, by);
    x.fillStyle = C.ink; x.beginPath();
    if (x.roundRect) x.roundRect(-rp * 0.32, -rp, rp * 0.64, rp * 2, rp * 0.3); else x.rect(-rp * 0.32, -rp, rp * 0.64, rp * 2);
    x.fill();
    x.fillStyle = pal.pad; x.beginPath();
    if (x.roundRect) x.roundRect(-rp * 0.18, -rp * 0.84, rp * 0.36, rp * 1.68, rp * 0.18); else x.rect(-rp * 0.18, -rp * 0.84, rp * 0.36, rp * 1.68);
    x.fill();
    x.restore();
  }
  function drawMini(x, g, pal) {
    var m = Math.round(clamp(g.S * 0.15, 38, 70)), cx = g.W - m - (g.W < 560 ? 12 : Math.round(g.W * 0.03)), cy = g.top + g.S - m - 12;   // bottom corner, clear of the text up top
    var span = 0.46, k = m / span;
    x.save();
    x.beginPath(); x.arc(cx, cy, m, 0, 6.2832); x.fillStyle = pal.bg; x.fill(); x.strokeStyle = C.ink; x.lineWidth = 1; x.stroke();
    x.clip();
    drawHouse(x, cx, cy, k, pal);
    x.strokeStyle = C.ink; x.globalAlpha = 0.4;
    x.beginPath(); x.moveTo(cx - m, cy); x.lineTo(cx + m, cy); x.moveTo(cx, cy - m); x.lineTo(cx, cy + m); x.stroke();
    x.globalAlpha = 1;
    for (var i = 0; i < g.stones.length; i++) {
      var st = g.stones[i]; if (st.out && st.out > 1) continue;
      var dx = st.x - CU.TEE, dy = st.y;
      if (Math.abs(dx) > span + R || Math.abs(dy) > span + R) continue;
      drawStone(x, cx + dx * k, cy + dy * k, R * k, st, pal, st.out ? Math.max(0, 1 - st.out) : 1);
    }
    x.restore();
  }

  CU.draw = function (g) {
    var x = g.ctx, pal = CU.THEMES[g.theme], S = g.S, rp = R * S, top = g.top, i;
    x.clearRect(0, 0, g.W, g.H);
    var left = g.W < 560 ? 16 : Math.round(g.W * 0.05);
    // HUD
    x.textBaseline = 'middle'; x.fillStyle = C.ink; x.font = '500 ' + g.fs + 'px ' + g.font;
    x.textAlign = 'left';
    var playing = g.mode !== 'idle' && g.mode !== 'over';
    var hud = playing ? 'STONE ' + Math.min(CU.STONES, g.n + (g.mode === 'slide' || g.mode === 'settle' ? 0 : 1)) + '/' + CU.STONES + '   SCORE ' + g.score + '   BEST ' + g.best
      : g.mode === 'over' ? 'SCORE ' + g.score + '   BEST ' + g.best : 'BEST ' + g.best;
    x.fillText(hud, left, g.hy);
    if ((g.mode === 'ready' || g.mode === 'run' || g.mode === 'pan') && g.cur) {
      x.textAlign = 'right';
      x.fillText(g.cur.spin > 0 ? 'CURLS DOWN' : 'CURLS UP', g.W - left, g.hy);
    }

    // ice
    x.save();
    x.beginPath(); x.rect(0, top, g.W, S); x.clip();
    var X = function (v) { return sx(g, v); }, Y = function (v) { return sy(g, v); };
    // sweep marks
    x.fillStyle = 'rgba(255,255,255,.5)';
    for (i = 0; i < g.marks.length; i++) {
      var mk = g.marks[i]; x.globalAlpha = Math.min(1, mk.life) * 0.55;
      x.fillRect(X(mk.x) - rp * 0.22, Y(mk.y) - rp * 0.9, rp * 0.44, rp * 1.8);
    }
    x.globalAlpha = 1;
    drawHouse(x, X(CU.TEE), Y(0), S, pal);
    x.strokeStyle = C.ink;
    // centre line, tee line, back line
    x.globalAlpha = 0.45; x.lineWidth = 1;
    x.beginPath(); x.moveTo(X(CU.HACK), Y(0)); x.lineTo(X(CU.BACK + 0.25), Y(0));
    x.moveTo(X(CU.TEE), top); x.lineTo(X(CU.TEE), top + S);
    x.moveTo(X(CU.BACK), top); x.lineTo(X(CU.BACK), top + S); x.stroke();
    x.globalAlpha = 1;
    // hog lines: the near one flashes lime as you run up to it
    var warn = g.mode === 'run' && g.cur.x > CU.HOG1 - 0.45;
    x.lineWidth = 2.5; x.strokeStyle = warn && (RM || Math.floor(g.clock * 10) % 2 === 0) ? C.lime : C.ink;
    x.beginPath(); x.moveTo(X(CU.HOG1), top); x.lineTo(X(CU.HOG1), top + S); x.stroke();
    x.strokeStyle = C.ink;
    x.beginPath(); x.moveTo(X(CU.HOG2), top); x.lineTo(X(CU.HOG2), top + S); x.stroke();
    // ends of the sheet and the hack
    x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(X(0), top); x.lineTo(X(0), top + S); x.moveTo(X(CU.END), top); x.lineTo(X(CU.END), top + S); x.stroke();
    x.fillStyle = C.ink;
    x.fillRect(X(CU.HACK) - rp * 0.5, Y(-0.065) - rp * 0.35, rp, rp * 0.7);
    x.fillRect(X(CU.HACK) - rp * 0.5, Y(0.065) - rp * 0.35, rp, rp * 0.7);
    // aim guide while lining up
    if ((g.mode === 'ready' || g.mode === 'run') && g.cur) {
      x.save(); x.globalAlpha = 0.35; x.setLineDash([4, 6]); x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(X(g.cur.x) + rp * 1.4, Y(g.cur.y)); x.lineTo(g.W, Y(g.cur.y)); x.stroke(); x.restore();
    }
    // stones
    for (i = 0; i < g.stones.length; i++) {
      var st = g.stones[i], a = st.out ? Math.max(0, 1 - st.out) : 1;
      if (a <= 0) continue;
      var cx = X(st.x), cy = Y(st.y);
      if (cx < -rp * 2 || cx > g.W + rp * 2) continue;
      drawStone(x, cx, cy, rp, st, pal, a);
    }
    for (i = 0; i < g.hits.length; i++) {
      var hh = g.hits[i]; x.globalAlpha = hh.life / 0.35; x.strokeStyle = C.ink; x.lineWidth = 2;
      x.beginPath(); x.arc(X(hh.x), Y(hh.y), rp * (1.3 - hh.life * 2), 0, 6.2832); x.stroke();
    }
    x.globalAlpha = 1;
    drawThrower(x, g, rp, g.mode === 'ready' || g.mode === 'run' || g.mode === 'idle' || g.mode === 'pan');
    // brooms while sweeping
    if (g.mode === 'slide' && g.cur && g.cur.moving) {
      var brushing = g.brushT != null && g.clock - g.brushT < 0.15, keyb = g.kSweepT != null && g.clock - g.kSweepT < 0.3;
      if (brushing) drawBroom(x, clamp(g.bx, X(g.cur.x) + rp * 1.2, X(g.cur.x) + rp * 8), g.by, rp, pal, 0);
      else if (keyb) drawBroom(x, X(g.cur.x) + rp * 2.4, Y(g.cur.y) + Math.sin(g.clock * 26) * rp * 1.4, rp, pal, 0);
    }
    // points
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (i = 0; i < g.pops.length; i++) {
      var p = g.pops[i];
      x.globalAlpha = Math.min(1, p.life * 2); x.fillStyle = C.ink;
      x.font = '600 ' + Math.round(g.fs * (p.big ? 1.25 : 1.05)) + 'px ' + g.font;
      x.fillText(p.txt.toUpperCase(), X(p.x), Y(p.y));
    }
    x.globalAlpha = 1;
    x.restore();
    // rules above and below the ice
    x.fillStyle = C.ink; x.fillRect(0, top - 0.75, g.W, 1.5); x.fillRect(0, top + S - 0.75, g.W, 1.5);

    // mini house while the real one is off screen
    if (X(CU.TEE - CU.RINGS[0]) > g.W - 20) drawMini(x, g, pal);

    // text and buttons
    var P = window.BBPILL, o = { W: g.W, font: g.font }, bh = g.W < 480 ? 36 : 40;
    if (g.msgT > 0 && g.msg) {
      x.save(); x.globalAlpha = Math.min(1, g.msgT * 3); P.say(x, g.W / 2, top + Math.max(24, S * 0.12), g.msg, o); x.restore();
    }
    if (g.mode === 'idle' || (g.mode === 'over' && (overRoom(g) || (g.overPanned && !g.camD)))) {
      var over = g.mode === 'over';
      var bx = over && overRoom(g) ? freeSpot(g, 0, sx(g, CU.TEE - CU.RINGS[0] - 0.12))
        : g.W >= 560 ? freeSpot(g, over ? 0 : sx(g, CU.START) + rp * 3, g.W) : g.W / 2;
      var y = over && overRoom(g) ? top + S / 2 - (36 + bh) / 2 : top + Math.max(30, S * 0.2);
      if (over) {
        P.say(x, bx, y, (g.newBest ? 'New best · ' : 'End over · ') + g.score + ' pts', o);
        var hn = inHouse(g);
        P.say(x, bx, y + 18, hn + ' in the house' + (g.takes ? ' · ' + g.takes + ' takeout' + (g.takes > 1 ? 's' : '') : ''), o);
      } else {
        P.say(x, bx, y, 'Hold to run · let go before the line', o);
        P.say(x, bx, y + 18, 'Then rub in front of the stone to sweep', o);
      }
      P.place(g.st, 'play', { show: true, x: bx, y: y + 36 + bh / 2, text: over ? 'Play again' : 'Play', theme: g.theme,
        enabled: !over || g.overT > 0.6 || RM, onClick: function () { if (g.mode === 'idle' || g.mode === 'over') CU.start(g); } });
    } else {
      P.place(g.st, 'play', { show: false });
      if (g.mode === 'ready' && !(g.msgT > 0)) {
        var ty = top + Math.max(24, S * 0.12);
        P.say(x, g.W / 2 + (g.W < 560 ? rp * 2 : 0), ty, g.n === 0 ? 'Hold to run · let go before the line' : 'Hold to throw', o);
      }
      if (g.mode === 'slide' && g.n <= 2 && g.sweep < 0.3 && g.slideT > 0.3 && !(g.msgT > 0)) {
        P.say(x, g.W / 2, top + Math.max(24, S * 0.12), g.W < 560 ? 'Rub in front of it to sweep' : 'Rub in front of the stone to sweep', o);
      }
    }
  };
})();

// mount on the footer when the arcade starts it
(function () {
  var CU = window.BBCU;
  CU.mount = function (f, theme) {
    if (CU.g) { CU.g.stop(); CU.g = null; }
    if (!f) return false;
    f.classList.add('bbcu-on');
    var st = f.querySelector('.bbcu-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbcu-stage'; st.innerHTML = '<canvas aria-label="Mini game: curling. Hold to run the stone, let go before the line, then rub in front of it to sweep"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas'), best = 0;
    try { best = +localStorage.getItem('bbCurlingBest') || 0; } catch (e) {}
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), W: 0, H: 0, cam: 0, camD: 0, clock: 0, best: best, score: 0,
      theme: theme === 'purple' ? 'purple' : 'green', stones: [], pops: [], marks: [], hits: [], n: 0, take: 0, takes: 0,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    CU.size(g);
    CU.idle(g);
    var lx = 0, ly = 0, down = false;
    var pos = function (e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', function (e) {
      var p = pos(e); lx = p[0]; ly = p[1]; down = true;
      if (g.mode === 'ready') { CU.aimAt(g, p[1]); CU.press(g); try { cv.setPointerCapture(e.pointerId); } catch (er) {} }
    });
    cv.addEventListener('pointermove', function (e) {
      var p = pos(e), dx = p[0] - lx, dy = p[1] - ly; lx = p[0]; ly = p[1];
      if (g.mode === 'ready' && e.pointerType === 'mouse') CU.aimAt(g, p[1]);
      if (e.pointerType !== 'mouse' && !down) return;
      CU.move(g, p[0], p[1], dx, dy);
    });
    var up = function () { down = false; CU.release(g); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    // touch: no page scroll while running the stone or sweeping
    var tm = function (e) { if (g.mode === 'run' || g.mode === 'slide') e.preventDefault(); };
    cv.addEventListener('touchmove', tm, { passive: false });
    cv.addEventListener('contextmenu', function (e) { if (g.mode === 'run' || g.mode === 'slide') e.preventDefault(); });
    var seen = function () { var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight; return r.bottom > 0 && r.top < vh; };
    var kd = function (e) {
      if (!seen() || (e.target && /input|textarea|select/i.test(e.target.tagName))) return;
      var k = e.key, sp = k === ' ' || k === 'Spacebar', ud = k === 'ArrowUp' || k === 'ArrowDown';
      if (!sp && !ud) return;
      if (g.mode === 'ready' && sp && !e.repeat) { CU.press(g); e.preventDefault(); }
      else if (g.mode === 'run') { if (ud) g.aim = Math.max(-0.42, Math.min(0.42, g.aim + (k === 'ArrowUp' ? -0.06 : 0.06))); e.preventDefault(); }
      else if (g.mode === 'slide') { if (!e.repeat) CU.keySweep(g); e.preventDefault(); }
      else if (g.mode === 'ready' && ud) { g.aim = Math.max(-0.42, Math.min(0.42, g.aim + (k === 'ArrowUp' ? -0.06 : 0.06))); e.preventDefault(); }
    };
    var ku = function (e) { if ((e.key === ' ' || e.key === 'Spacebar') && g.mode === 'run') { CU.release(g); e.preventDefault(); } };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    var raf = 0, last = performance.now(), dead = false;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { CU.size(g); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
      if (!g.W) CU.size(g);
      if (g.W && seen()) { CU.update(g, dt); CU.draw(g); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    g.stop = function () {
      dead = true; cancelAnimationFrame(raf); if (ro) ro.disconnect();
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
    };
    CU.g = g;
    return true;
  };
  // started by the footer arcade (18-footer-arcade.js); in the NEXT GAME rotation on green and purple footers
  (window.BBARCADE = window.BBARCADE || []).push({ id: 'curling', name: 'Curling', themes: ['green', 'purple'],
    ns: [], paths: [], cls: 'bbcu-on', stage: '.bbcu-stage',
    mount: function (f, t) { return CU.mount(f, t); }, stop: function () { if (CU.g) { CU.g.stop(); CU.g = null; } } });
})();
