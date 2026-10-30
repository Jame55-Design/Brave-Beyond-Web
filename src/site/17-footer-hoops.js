// BB Footer Hoops ("Fling"): slingshot basketball in the footer.
// A cute lime ball with a face sits in the slingshot on the left. Drag it back, let go, and fling it
// into the hoops on the right. Hoops sit at different heights and distances and score more the harder
// they are (10 / 20 / 30 / 50); the top hoop bobs up and down. Clean shots (no rim or board) are a SWISH x2.
// The ball is the Sling footer's character (lime, solid ink face, stick arms) with legs added: it hangs loose,
// grits its teeth as you pull, flails its arms and legs in flight, goes dizzy off the rim, cheers when it scores
// and slumps when it misses. Score 3 in a row and YOU'RE ON FIRE: the ball becomes the Brave Beyond pixel fireball
// and every basket counts double until a ball misses. Sink 3 more while on fire and he gets a pair of pixel
// high-tops (Purps, lavender, lime laces) for the rest of the round. 20 balls a round, and the next ball loads while the last is still flying, best score saved in this browser.
// Instagram, Privacy Policy and the rights line stay under the game, like the other footer games.
// Pages: set in H.SEL / H.PATHS below (Barba namespace or URL path + .bb-footer). Not on any page yet.

(function () {
  var H = window.BBH = window.BBH || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbhp-on{padding-top:4vw}' +
    '.bb-footer.bbhp-on .bbft-lm{display:none}' +
    '.bbhp-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbhp-stage canvas{display:block;width:100%;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    '.bb-footer.bbhp-on .bbft-ig{order:1;margin:2vw 0 0}' +
    '@media (max-width:479px){.bb-footer.bbhp-on{padding-top:24px}.bb-footer.bbhp-on .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);
  H.SEL = '[data-barba-namespace="hoops"] .bb-footer';
  H.PATHS = [];
  H.BALLS = 20;          // balls per round
  H.RELOAD = 0.45;       // seconds before the next ball pops into the sling (the last one can still be flying)
  H.SWISH = 2;           // multiplier for a clean shot
  H.FIRE_AT = 3;         // baskets in a row to catch fire (a nod to the old 90s arcade basketball games)
  H.FIRE_X = 2;          // points multiplier while on fire
  H.KICKS_AT = 3;        // baskets made while already on fire to earn the high-tops (kept for the rest of the round)
  // Pixel basketball high-top (our own design), facing right with the heel at the left.
  // O = ink outline/sole, P = Purps collar, L = lime laces, V = lavender upper
  H.KICKS = ['OOO....', 'OPPO...', 'OVPO...', 'OVLLOO.', 'OVVVVVO', 'OOOOOOO'];
  // Brave Beyond pixel flame (same as the bricks game). O = ink outline, L = lime flame, V = lavender core
  H.FLAME = ['.....O.....', '....OLO....', '...OLLO.O..', '...OLLLOLO.', '..OLLLLLLO.', '.OLLLVLLLLO', '.OLLVVLLLLO', 'OLLVVVVLLLO', 'OLLVVVVVLLO', 'OLLVVVVVLLO', '.OLLVVVLLO.', '..OLLLLLO..', '...OOOOO...'];
  var C = { ink: '#212121', lime: '#CCFF00', lav: '#E9DBEC', purps: '#AE9AE4', pink: '#E8CAE9', cream: '#F4E9D6', mint: '#66C9B0' };
  H.C = C;
  // Hoops: x as a share of the width, height above the floor as a share of the play height, points.
  H.HOOPS = [
    { fx: 0.40, fh: 0.28, pts: 10 },
    { fx: 0.56, fh: 0.60, pts: 20 },
    { fx: 0.73, fh: 0.38, pts: 30 },
    { fx: 0.89, fh: 0.68, pts: 50, bob: 1 }
  ];
  H.HOOPS_PHONE = [
    { fx: 0.50, fh: 0.30, pts: 10 },
    { fx: 0.70, fh: 0.58, pts: 20 },
    { fx: 0.88, fh: 0.36, pts: 30, bob: 1 }
  ];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // Frame mode (window.BBH_FRAME = { w, h, bg }): the game lays itself out in a fixed-size frame (e.g. a 1080 x 1350
  // Instagram post), shown scaled to fit, paints its own background and draws the footer links row along the bottom,
  // so recording the canvas captures exactly what you see. Without it the game sizes itself to the footer as normal.
  H.size = function (g) {
    var F = window.BBH_FRAME, rw = Math.round(g.st.getBoundingClientRect().width);
    if (!rw) return;
    if (F) { g.k = F.w / rw; g.cv.style.height = Math.round(rw * F.h / F.w) + 'px'; if (g.W === F.w && g.H === F.h) return; }
    else { g.k = 1; if (rw === g.W) return; }
    var W = g.W = F ? F.w : rw;
    g.frame = F || null;
    g.fs = F ? Math.round(W / 40) : Math.max(11, Math.min(16, Math.round(W / 96)));
    g.hy = Math.round(g.fs * (F ? 2.6 : 1.6));
    g.phone = !F && W < 560;
    g.H = F ? F.h : g.phone ? 400 : Math.round(clamp(W * 0.36, 440, 560));
    var dpr = F ? 1 : Math.min(2, window.devicePixelRatio || 1);
    g.cv.width = W * dpr; g.cv.height = g.H * dpr; if (!F) g.cv.style.height = g.H + 'px';
    g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var u = g.u = F ? 1.2 * W / 1080 : clamp(Math.min(W / 1200, g.H / 440), 0.62, 1.25);
    g.footH = F ? Math.round(g.fs * 4) : 0;
    g.floorY = g.H - g.footH - Math.round(10 * u);
    g.top = g.hy + g.fs * 2;
    g.r = Math.max(12, 17 * u);
    g.G = 1500 * u;
    g.sx = Math.round(Math.max(56, W * (g.phone ? 0.13 : 0.11)));
    g.forkY = g.floorY - 118 * u;
    g.pouch = { x: g.sx, y: g.forkY + 4 * u };
    g.maxPull = 92 * u;
    g.vmax = Math.sqrt(g.G * ((W * 0.98 - g.sx) * 1.3 + (g.floorY - g.top) * 0.8));
    var list = g.phone ? H.HOOPS_PHONE : H.HOOPS, playH = (g.floorY - g.top - 70 * u) * (F ? 0.8 : 1);
    var old = g.hoops || [];
    g.hoops = list.map(function (d, i) {
      var rw = g.r * (g.phone ? 3.4 : 3.2);
      return { pts: d.pts, bob: d.bob, x: Math.round(W * d.fx), baseY: g.floorY - 40 * u - d.fh * playH, y: 0, rw: rw, rr: 3.5 * u, sw: old[i] ? old[i].sw : 0 };
    });
    // keep the far hoop's backboard inside the canvas
    var last = g.hoops[g.hoops.length - 1], edge = last.x + last.rw / 2 + 14 * u;
    if (edge > W - 6) last.x -= edge - (W - 6);
    H.placeHoops(g);
    if (g.b) H.toPouch(g, true);
  };

  H.placeHoops = function (g) {
    for (var i = 0; i < g.hoops.length; i++) {
      var h = g.hoops[i];
      h.y = h.baseY + (h.bob ? Math.sin(g.clock * 0.9) * 34 * g.u : 0);
      h.lx = h.x - h.rw / 2; h.rx = h.x + h.rw / 2;
      h.bx = h.rx + 8 * g.u;                    // backboard line
      h.bt = h.y - 62 * g.u; h.bb = h.y + 12 * g.u;
    }
  };

  H.newBall = function () {
    return { x: 0, y: 0, vx: 0, vy: 0, held: true, pull: 0, mood: 'idle', moodT: 0, blink: 2, sq: 0, sqa: 0, pop: 0, hit: {}, fade: 1 };
  };
  H.toPouch = function (g, keep) {
    var b = g.b = g.b || H.newBall();
    b.x = g.pouch.x; b.y = g.pouch.y; b.vx = b.vy = 0; b.held = true; b.drag = false;
    b.rest = 0; b.fly = 0; b.touched = false; b.scored = 0; b.hit = {};
    if (!keep) { b.pop = 0; b.mood = 'idle'; b.moodT = 0; }
  };

  // ---- input --------------------------------------------------------------------------------------
  H.input = function (g) {
    var cv = g.cv;
    function pt(e) { var r = cv.getBoundingClientRect(), k = g.k || 1; return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }; }
    function nearBall(p) { var b = g.b; return !!b && Math.hypot(p.x - b.x, p.y - b.y) < Math.max(g.r * 2.6, 34); }
    // stop the page scrolling only when a touch starts on the ball, so the footer still scrolls on phones
    cv.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; if (!t) return;
      if (g.mode === 'over' || nearBall(pt(t))) e.preventDefault();
    }, { passive: false });
    cv.addEventListener('pointerdown', function (e) {
      var p = pt(e);
      if (g.mode === 'over') {
        var bt = g.btn;
        if (bt && g.overT > 0.6 && p.x > bt.x && p.x < bt.x + bt.w && p.y > bt.y && p.y < bt.y + bt.h) H.reset(g);
        return;
      }
      if (!nearBall(p)) return;
      if (!g.b) return;
      g.b.drag = true; g.pid = e.pointerId; g.hint = 0;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      H.aim(g, p);
    });
    cv.addEventListener('pointermove', function (e) {
      var p = pt(e); g.mx = p.x; g.my = p.y; g.mT = 2.5;
      if (g.b && g.b.drag && e.pointerId === g.pid) H.aim(g, p);
      else cv.style.cursor = g.mode === 'over' ? (g.btn && p.x > g.btn.x && p.x < g.btn.x + g.btn.w && p.y > g.btn.y && p.y < g.btn.y + g.btn.h ? 'pointer' : '') : nearBall(p) ? 'grab' : '';
    });
    function up(e) {
      if (!g.b || !g.b.drag || e.pointerId !== g.pid) return;
      g.b.drag = false; cv.style.cursor = '';
      H.release(g);
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', function (e) { if (g.b && g.b.drag && e.pointerId === g.pid) { g.b.drag = false; H.toPouch(g, true); } });
  };

  H.aim = function (g, p) {
    var b = g.b, dx = p.x - g.pouch.x, dy = p.y - g.pouch.y, d = Math.hypot(dx, dy);
    if (d > g.maxPull) { dx *= g.maxPull / d; dy *= g.maxPull / d; d = g.maxPull; }
    // keep the ball above the floor while pulling down
    if (g.pouch.y + dy > g.floorY - g.r) dy = g.floorY - g.r - g.pouch.y;
    b.x = g.pouch.x + dx; b.y = g.pouch.y + dy;
    b.pull = Math.hypot(dx, dy) / g.maxPull;
    g.cv.style.cursor = 'grabbing';
  };

  H.launchV = function (g) {
    var b = g.b, dx = g.pouch.x - b.x, dy = g.pouch.y - b.y, d = Math.hypot(dx, dy);
    if (d < 1) return null;
    var sp = (d / g.maxPull) * g.vmax;
    return { vx: dx / d * sp, vy: dy / d * sp };
  };

  H.release = function (g) {
    var b = g.b;
    if (b.pull < 0.14) { H.toPouch(g, true); return; }
    var v = H.launchV(g);
    b.held = false; b.drag = false; b.vx = v.vx; b.vy = v.vy; b.fly = 0; b.pop = 1;
    b.mood = 'wheee'; b.moodT = 0;
    g.fly.push(b); g.b = null; g.reload = H.RELOAD;
    while (g.fly.length > 6) g.fly.shift();
    g.left--; g.mode = 'play'; g.snap = 0.35;
  };

  H.reset = function (g) {
    g.score = 0; g.left = H.BALLS; g.mode = 'ready'; g.overT = 0; g.streak = 0; g.onFire = false; g.fireMsg = 0; g.fireRun = 0; g.kicks = false; g.fx = []; g.confetti = []; g.fly = []; g.parts = [];
    g.b = null; H.toPouch(g);
  };

  // ---- physics -----------------------------------------------------------------------------------
  function bump(g, b, nx, ny, e, what) {
    var vn = b.vx * nx + b.vy * ny;
    if (vn >= 0) return;
    b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
    var hard = -vn;
    if (hard > 120) { b.sq = Math.min(0.35, hard / 2600); b.sqa = Math.atan2(ny, nx); }
    if (what !== 'floor') { b.touched = true; if (hard > 140) { b.mood = 'dizzy'; b.moodT = 0; } }
  }

  H.step = function (g, b, dt) {
    var r = g.r, u = g.u;
    b.vy += g.G * dt;
    var px = b.x, py = b.y;
    b.x += b.vx * dt; b.y += b.vy * dt;
    // floor: it lands on its feet
    var foot = r * 1.95;
    if (b.y > g.floorY - foot) {
      b.y = g.floorY - foot;
      if (b.vy > 0) {
        if (b.vy > 140) { b.sq = Math.min(0.35, b.vy / 2600); b.sqa = Math.PI / 2; }
        b.vy = b.vy > 90 ? -b.vy * 0.5 : 0;
        b.vx *= 0.82;
        if (!b.scored && b.mood !== 'dizzy') { b.mood = 'sad'; b.moodT = 0; }
      }
      b.vx *= Math.pow(0.35, dt);    // rolling friction
    }
    // side walls
    if (b.x > g.W - r && b.vx > 0) { b.x = g.W - r; b.vx *= -0.5; }
    if (b.x < r && b.vx < 0) { b.x = r; b.vx *= -0.5; }
    for (var i = 0; i < g.hoops.length; i++) {
      var h = g.hoops[i];
      // rim ends
      var ends = [h.lx, h.rx];
      for (var k = 0; k < 2; k++) {
        var dx = b.x - ends[k], dy = b.y - h.y, d = Math.hypot(dx, dy), m = r + h.rr;
        if (d < m && d > 0) { var nx = dx / d, ny = dy / d; b.x = ends[k] + nx * m; b.y = h.y + ny * m; bump(g, b, nx, ny, 0.55, 'rim'); }
      }
      // backboard: a short vertical capsule
      var cy = clamp(b.y, h.bt, h.bb), ddx = b.x - h.bx, ddy = b.y - cy, dd = Math.hypot(ddx, ddy), mm = r + 3 * u;
      if (dd < mm && dd > 0) { var bx = ddx / dd, by = ddy / dd; b.x = h.bx + bx * mm; b.y = cy + by * mm; bump(g, b, bx, by, 0.5, 'board'); }
      // scored: centre crosses the rim line going down, between the rim ends
      if (!b.hit[i] && b.vy > 0 && py < h.y && b.y >= h.y && b.x > h.lx + h.rr && b.x < h.rx - h.rr) {
        b.hit[i] = 1; H.scored(g, b, h);
      }
    }
  };

  H.scored = function (g, b, h) {
    var swish = !b.touched, pts = h.pts * (swish ? H.SWISH : 1);
    b.scored++; g.streak++;
    if (g.onFire) pts *= H.FIRE_X;
    g.score += pts; g.flash = 0.5;
    b.mood = 'happy'; b.moodT = 0;
    h.sw = 1;
    g.fx.push({ x: h.x, y: h.y - 28 * g.u, t: 0, text: (swish ? 'SWISH +' : '+') + pts });
    if (g.onFire && !g.kicks && ++g.fireRun >= H.KICKS_AT) {
      g.kicks = true; g.fx.push({ x: h.x, y: h.y - 52 * g.u, t: -0.2, text: 'FRESH KICKS!' });
    }
    if (!g.onFire && g.streak >= H.FIRE_AT) { g.onFire = true; g.fireMsg = 2.2; g.fireRun = 0; }
    if (!g.rm) for (var i = 0; i < (g.phone ? 10 : 18); i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, sp = (180 + Math.random() * 260) * g.u;
      g.confetti.push({ x: h.x, y: h.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0, c: [C.lime, C.purps, C.pink, C.lav][i % 4], s: (3 + Math.random() * 3) * g.u, rot: Math.random() * 6 });
    }
  };

  H.update = function (g, dt) {
    g.clock += dt;
    H.placeHoops(g);
    if (g.snap > 0) g.snap -= dt;
    if (g.flash > 0) g.flash -= dt;
    if (g.mT > 0) g.mT -= dt;
    if (g.mode === 'over') g.overT += dt;
    if (g.fireMsg > 0) g.fireMsg -= dt;
    // fireball trail: lime and lavender pixel sparks
    if (g.onFire && !g.rm) {
      var on = g.fly.concat(g.b ? [g.b] : []);
      for (var q = 0; q < on.length; q++) if (on[q].fade > 0.5 && Math.random() < (on[q].held ? 0.25 : 0.7)) {
        var ob = on[q];
        g.parts.push({ x: ob.x + (Math.random() - 0.5) * g.r, y: ob.y + (Math.random() - 0.5) * g.r, vx: -ob.vx * 0.08 + (Math.random() - 0.5) * 40, vy: -ob.vy * 0.08 - 50 * g.u, t: 0, life: 0.25 + Math.random() * 0.25, c: Math.random() < 0.6 ? C.lime : C.lav, s: Math.max(2, Math.round(2.6 * g.u)) });
      }
    }
    for (var pi = g.parts.length - 1; pi >= 0; pi--) {
      var pp = g.parts[pi]; pp.t += dt; pp.x += pp.vx * dt; pp.y += pp.vy * dt;
      if (pp.t > pp.life) g.parts.splice(pi, 1);
    }
    for (var i = 0; i < g.hoops.length; i++) if (g.hoops[i].sw > 0) g.hoops[i].sw = Math.max(0, g.hoops[i].sw - dt * 1.4);
    // the ball in the sling (or the next one loading)
    var b = g.b;
    if (b) {
      b.moodT += dt; b.pop = Math.min(1, b.pop + dt * 4);
      if (b.drag) b.mood = 'grit';
      else if (b.mood !== 'idle' && b.moodT > 0.4) { b.mood = 'idle'; b.moodT = 0; }
    } else if (g.left > 0 && g.mode !== 'over') {
      g.reload -= dt;
      if (g.reload <= 0) H.toPouch(g);
    }
    // balls in flight
    for (var j = g.fly.length - 1; j >= 0; j--) {
      b = g.fly[j];
      b.moodT += dt;
      if (b.sq > 0) b.sq = Math.max(0, b.sq - dt * 1.6);
      var n = 4, h = dt / n;
      for (var k = 0; k < n; k++) H.step(g, b, h);
      b.fly += dt;
      if (b.mood === 'wheee' && b.vy > 260 && b.moodT > 0.25) { b.mood = 'scared'; b.moodT = 0; }
      if ((b.mood === 'dizzy' && b.moodT > 0.7) || (b.mood === 'happy' && b.moodT > 1.3)) {
        if (b.y < g.floorY - g.r * 1.95 - 2) { b.mood = b.vy > 200 ? 'scared' : 'wheee'; b.moodT = 0; }
        else if (b.mood === 'dizzy') { b.mood = b.scored ? 'happy' : 'sad'; b.moodT = 0; }
      }
      var onFloor = b.y >= g.floorY - g.r * 1.95 - 0.5, slow = Math.hypot(b.vx, b.vy) < 30 * g.u;
      b.rest = onFloor && slow ? b.rest + dt : 0;
      if (b.rest > 0.6 || b.fly > 9) b.fade -= dt * 3.5;     // settles, then fades away
      if (b.fade <= 0) {
        if (!b.scored) {
          g.streak = 0;
          if (g.onFire) { g.onFire = false; g.fx.push({ x: b.x, y: b.y - 30 * g.u, t: 0, text: 'FIRE\u2019S OUT' }); }
        }
        g.fly.splice(j, 1);
      }
    }
    if (g.mode !== 'over' && g.mode !== 'ready' && g.left <= 0 && !g.b && !g.fly.length) {
      g.mode = 'over'; g.overT = 0; g.newBest = g.score > g.best;
      if (g.newBest) { g.best = g.score; try { localStorage.setItem('bbHoopsBest', g.score); } catch (e) {} }
    }
    for (i = g.fx.length - 1; i >= 0; i--) { g.fx[i].t += dt; if (g.fx[i].t > 1.1) g.fx.splice(i, 1); }
    for (i = g.confetti.length - 1; i >= 0; i--) {
      var c = g.confetti[i]; c.t += dt; c.vy += g.G * 0.6 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vx *= Math.pow(0.4, dt); c.rot += dt * 8;
      if (c.t > 1.4 || c.y > g.floorY) g.confetti.splice(i, 1);
    }
  };

  // ---- drawing -----------------------------------------------------------------------------------
  function line(x, a, b, c, d, w, col) { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); }

  H.drawHoopBack = function (g, h) {
    var x = g.ctx, u = g.u;
    // pole down to the floor, behind everything
    x.fillStyle = C.ink;
    x.fillRect(h.bx + 2 * u, h.bb, 3 * u, g.floorY - h.bb);
    x.fillRect(h.bx - 6 * u, g.floorY - 3 * u, 19 * u, 3 * u);
    // backboard
    var bw = 9 * u;
    x.fillStyle = C.lav; x.fillRect(h.bx, h.bt, bw, h.bb - h.bt);
    x.lineWidth = 1.5; x.strokeStyle = C.ink; x.strokeRect(h.bx, h.bt, bw, h.bb - h.bt);
    // points sign above the board
    x.font = '700 ' + g.fs + 'px ' + g.font; x.textAlign = 'center'; x.textBaseline = 'bottom';
    x.fillStyle = C.ink; x.fillText(h.pts, h.bx + bw / 2, h.bt - 4 * u);
    // bracket from board to rim
    line(x, h.rx, h.y, h.bx, h.y, 3 * u, C.ink);
    // back half of the rim
    x.lineWidth = 4 * u; x.strokeStyle = h.pts >= 50 ? C.lime : C.purps;
    x.beginPath(); x.ellipse(h.x, h.y, h.rw / 2, h.rw * 0.11, 0, Math.PI, Math.PI * 2); x.stroke();
  };

  H.drawHoopFront = function (g, h) {
    var x = g.ctx, u = g.u, hw = h.rw / 2, depth = h.rw * 0.62, bw = hw * 0.62;
    var sw = Math.sin(h.sw * 18) * h.sw * 5 * u, stretch = 1 + h.sw * 0.25;
    var by = h.y + depth * stretch;
    // net: lavender lattice, swishes when the ball drops through
    x.strokeStyle = C.lav; x.lineWidth = 1.5;
    x.beginPath();
    var cols = 6;
    for (var i = 0; i <= cols; i++) {
      var t = i / cols, tx = h.x - hw + t * 2 * hw, bx = h.x - bw + t * 2 * bw + sw;
      x.moveTo(tx, h.y); x.lineTo(bx, by);
      if (i < cols) { var nx = h.x - bw + (t + 1 / cols) * 2 * bw + sw; x.moveTo(tx, h.y); x.lineTo(nx, by); }
    }
    for (var j = 1; j <= 2; j++) {
      var f = j / 3, yy = h.y + (by - h.y) * f, ww = hw + (bw - hw) * f;
      x.moveTo(h.x - ww + sw * f, yy); x.lineTo(h.x + ww + sw * f, yy);
    }
    x.moveTo(h.x - bw + sw, by); x.lineTo(h.x + bw + sw, by);
    x.stroke();
    // front half of the rim
    x.lineWidth = 4 * u; x.strokeStyle = h.pts >= 50 ? C.lime : C.purps; x.lineCap = 'round';
    x.beginPath(); x.ellipse(h.x, h.y, hw, h.rw * 0.11, 0, 0, Math.PI); x.stroke();
    x.lineCap = 'butt';
  };

  H.drawSling = function (g, part) {
    var x = g.ctx, u = g.u, sx = g.sx, fy = g.forkY, fl = 26 * u, b = g.b;
    var lx = sx - fl, rx = sx + fl * 0.9;
    if (part === 'back') {
      // stem and fork (ink), back band
      x.strokeStyle = C.ink; x.lineCap = 'round'; x.lineJoin = 'round';
      x.lineWidth = 11 * u;
      x.beginPath(); x.moveTo(sx, g.floorY); x.lineTo(sx, fy + 46 * u); x.stroke();
      x.lineWidth = 9 * u;
      x.beginPath(); x.moveTo(sx, fy + 50 * u); x.quadraticCurveTo(sx, fy + 26 * u, rx, fy - 6 * u); x.stroke();
      if (b) band(rx, fy - 2 * u);
      x.lineCap = 'butt';
    } else {
      x.strokeStyle = C.ink; x.lineCap = 'round'; x.lineWidth = 9 * u;
      x.beginPath(); x.moveTo(sx, fy + 50 * u); x.quadraticCurveTo(sx, fy + 26 * u, lx, fy - 6 * u); x.stroke();
      if (b) band(lx, fy - 2 * u);
      else if (g.snap > 0) {
        // bands twang back after release
        var k = g.snap / 0.35, wob = Math.sin(k * 30) * k * 12 * u;
        x.strokeStyle = C.lav; x.lineWidth = 5 * u;
        x.beginPath(); x.moveTo(lx, fy - 2 * u); x.quadraticCurveTo(sx + wob, fy + 6 * u, rx, fy - 2 * u); x.stroke();
      } else {
        x.strokeStyle = C.lav; x.lineWidth = 5 * u;
        x.beginPath(); x.moveTo(lx, fy - 2 * u); x.quadraticCurveTo(sx, fy + 4 * u, rx, fy - 2 * u); x.stroke();
      }
      x.lineCap = 'butt';
    }
    function band(ax, ay) {
      // band runs to the back of the ball
      var dx = b.x - g.pouch.x, dy = b.y - g.pouch.y, d = Math.hypot(dx, dy) || 1;
      var bx = b.x + dx / d * g.r * 0.7, by = b.y + dy / d * g.r * 0.7;
      x.strokeStyle = C.lav; x.lineWidth = (5 - 2 * (b.pull || 0)) * u;
      x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    }
  };

  H.drawAim = function (g) {
    var b = g.b; if (!b || !b.drag || b.pull < 0.14) return;
    var v = H.launchV(g); if (!v) return;
    var x = g.ctx, px = b.x, py = b.y, vx = v.vx, vy = v.vy, dt = 0.055;
    x.fillStyle = C.lav;
    for (var i = 1; i <= 9; i++) {
      vy += g.G * dt; px += vx * dt; py += vy * dt;
      if (py > g.floorY) break;
      x.globalAlpha = 1 - i / 11;
      x.beginPath(); x.arc(px, py, (4.2 - i * 0.28) * g.u, 0, Math.PI * 2); x.fill();
    }
    x.globalAlpha = 1;
  };

  // The ball as a character, same style as the Sling footer's: lime ball, solid ink face, stick arms and legs.
  // Drawn in ball space (radius r). k = how hard it's being pulled (0-1).
  H.drawGuy = function (x, r, mood, t, k, kicks) {
    var lw = Math.max(1.6, r * 0.13);
    x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = C.ink; x.fillStyle = C.ink; x.lineWidth = lw;
    var feet = [];
    function limb(sx, sy, a1, a2, L1, L2) {   // joint -> elbow/knee -> hand/foot, angles in radians
      var ex = sx + Math.cos(a1) * L1, ey = sy + Math.sin(a1) * L1, fx = ex + Math.cos(a2) * L2, fy = ey + Math.sin(a2) * L2;
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(ex, ey); x.lineTo(fx, fy); x.stroke();
      return { x: fx, y: fy };
    }
    function arms(a1, a2, b1, b2) {   // left arm angles, right arm angles (0 = pointing right, PI/2 = down)
      limb(-r * 0.9, r * 0.15, a1, a2, r * 0.6, r * 0.55);
      limb(r * 0.9, r * 0.15, b1, b2, r * 0.6, r * 0.55);
    }
    function legs(a1, a2, b1, b2) {
      feet = [limb(-r * 0.38, r * 0.86, a1, a2, r * 0.5, r * 0.5), limb(r * 0.38, r * 0.86, b1, b2, r * 0.5, r * 0.5)];
    }
    var P = Math.PI, f, g2, sw;
    // limbs go behind the ball
    if (mood === 'idle') {                       // hanging loose, a gentle sway
      sw = Math.sin(t * 2) * 0.08;
      arms(P - 1.15 + sw, P - 1.45 + sw, 1.15 - sw, 1.45 - sw);
      legs(P / 2 + 0.25, P / 2 + 0.1, P / 2 - 0.25, P / 2 - 0.1);
    } else if (mood === 'grit') {                // gripping the bands, legs braced
      var tr = Math.sin(t * 40) * 0.05 * k;
      arms(P + 0.7 + tr, P + 1.3 + tr, -0.7 - tr, -1.3 - tr);
      legs(P / 2 + 0.55, P / 2 + 0.2, P / 2 - 0.55, P / 2 - 0.2);
    } else if (mood === 'wheee' || mood === 'scared') {   // flailing: arms windmill, legs kick
      var sp = mood === 'scared' ? 22 : 16;
      f = Math.sin(t * sp) * 0.6; g2 = Math.sin(t * sp + 1.7) * 0.6;
      arms(P + 1.0 + f, P + 1.5 - f * 1.2, -1.0 + g2, -1.5 - g2 * 1.2);
      legs(P / 2 + 0.4 + g2 * 0.7, P / 2 + f * 0.8, P / 2 - 0.4 + f * 0.7, P / 2 + g2 * 0.8);
    } else if (mood === 'happy') {               // both arms up, waving, little kicks
      f = Math.sin(t * 16) * 0.35;
      arms(P + 1.0, P + 1.5 + f, -1.0, -1.5 - f);
      legs(P / 2 + 0.3 + f * 0.5, P / 2 + 0.1, P / 2 - 0.3 - f * 0.5, P / 2 - 0.1);
    } else if (mood === 'dizzy') {               // floppy
      f = Math.sin(t * 9) * 0.3;
      arms(P - 0.6 + f, P - 1.2 + f, 0.6 - f, 1.2 - f);
      legs(P / 2 + 0.5, P / 2 + 0.2 + f, P / 2 - 0.5, P / 2 - 0.2 - f);
    } else {                                     // sad: arms limp, slumped
      arms(P - 1.35, P - 1.5, 1.35, 1.5);
      legs(P / 2 + 0.15, P / 2, P / 2 - 0.15, P / 2);
    }
    x.fillStyle = C.lime; x.beginPath(); x.arc(0, 0, r, 0, P * 2); x.fill();
    // high-tops on the feet, toes pointing outwards
    if (kicks && feet.length) {
      var kp = Math.max(1.5, r * 0.12), rows = H.KICKS, kw = rows[0].length, kh = rows.length, col = { O: C.ink, P: C.purps, L: C.lime, V: C.lav };
      for (var fi = 0; fi < 2; fi++) {
        var ft = feet[fi], dir = fi ? 1 : -1;
        for (var ky = 0; ky < kh; ky++) for (var kx = 0; kx < kw; kx++) {
          var kc = col[rows[ky][kx]]; if (!kc) continue;
          x.fillStyle = kc;
          x.fillRect(ft.x + dir * (kx - 1.5) * kp - (dir < 0 ? kp : 0), ft.y + (ky - kh + 1.5) * kp, kp + 0.3, kp + 0.3);
        }
      }
    }
    x.fillStyle = C.ink;
    var ex = r * 0.34, ey = -r * 0.16, er = r * 0.15, s;
    if (mood === 'idle' || mood === 'sad') {     // relaxed, half-closed eyes
      var blink = (t % 3.2) < 0.12;
      for (s = -1; s <= 1; s += 2) {
        x.beginPath();
        if (blink) { x.moveTo(s * ex - er, ey); x.lineTo(s * ex + er, ey); x.stroke(); }
        else { x.arc(s * ex, ey, er, 0, P); x.fill(); }
      }
      x.beginPath();
      if (mood === 'idle') x.arc(0, r * 0.12, r * 0.28, 0.25 * P, 0.75 * P);     // easy smile
      else x.arc(0, r * 0.62, r * 0.26, 1.25 * P, 1.75 * P);                     // frown
      x.stroke();
    } else if (mood === 'grit') {                // focused: eyes narrow, a cheeky smirk that grows as you pull
      var nar = 0.55 - 0.2 * k;
      for (s = -1; s <= 1; s += 2) { x.beginPath(); x.ellipse(s * ex, ey + er * 0.2, er, er * nar, 0, 0, P * 2); x.fill(); }
      var sr = r * (0.2 + 0.1 * k);
      x.beginPath(); x.arc(r * 0.06, r * 0.22, sr, 0.15 * P, 0.7 * P); x.stroke();
    } else if (mood === 'wheee') {               // wide-eyed with a big open grin
      for (s = -1; s <= 1; s += 2) { x.beginPath(); x.arc(s * ex, ey - r * 0.04, er * 1.15, 0, P * 2); x.fill(); }
      x.beginPath(); x.moveTo(-r * 0.38, r * 0.14); x.arc(0, r * 0.14, r * 0.38, 0, P); x.closePath(); x.fill();
    } else if (mood === 'scared') {              // wide eyes, open O
      for (s = -1; s <= 1; s += 2) { x.beginPath(); x.arc(s * ex, ey - r * 0.04, er * 1.3, 0, P * 2); x.fill(); }
      x.beginPath(); x.ellipse(0, r * 0.4, r * 0.15, r * 0.2, 0, 0, P * 2); x.fill();
    } else if (mood === 'happy') {               // ^ ^ eyes and a big grin
      for (s = -1; s <= 1; s += 2) { x.beginPath(); x.arc(s * ex, ey + r * 0.06, er, P * 1.1, P * 1.9); x.stroke(); }
      x.beginPath(); x.moveTo(-r * 0.4, r * 0.14); x.arc(0, r * 0.14, r * 0.4, 0, P); x.closePath(); x.fill();
    } else if (mood === 'dizzy') {               // X eyes, wobbly mouth
      for (s = -1; s <= 1; s += 2) {
        x.beginPath(); x.moveTo(s * ex - er, ey - er); x.lineTo(s * ex + er, ey + er); x.moveTo(s * ex + er, ey - er); x.lineTo(s * ex - er, ey + er); x.stroke();
      }
      x.beginPath();
      for (q = 0; q <= 6; q++) { var wx = -r * 0.24 + q * r * 0.08, wy = r * 0.38 + (q % 2 ? -1 : 1) * r * 0.05; if (q) x.lineTo(wx, wy); else x.moveTo(wx, wy); }
      x.stroke();
    }
    x.lineCap = 'butt'; x.lineJoin = 'miter';
  };

  H.drawBall = function (g, b) {
    var x = g.ctx, r = g.r * (b.held ? (0.4 + 0.6 * easeBack(b.pop)) : 1);
    var sp = Math.hypot(b.vx, b.vy);
    x.save(); x.translate(b.x, b.y);
    if (g.onFire) H.drawFlame(g, b, r, sp);
    // stretch along the flight path, squash on impact
    if (!b.held && sp > 200) {
      var st = 1 + Math.min(0.12, sp / 9000), a = Math.atan2(b.vy, b.vx);
      x.rotate(a); x.scale(st, 1 / st); x.rotate(-a);
    } else if (b.drag) {
      var pa = Math.atan2(b.y - g.pouch.y, b.x - g.pouch.x), ps = 1 + b.pull * 0.12;
      x.rotate(pa); x.scale(ps, 1 / ps); x.rotate(-pa);
    }
    if (b.sq > 0) { x.rotate(b.sqa); x.scale(1 - b.sq, 1 + b.sq * 0.8); x.rotate(-b.sqa); }
    H.drawGuy(x, r, b.mood, g.clock, b.pull || 0, g.kicks);
    x.restore();
  };
  // the Brave Beyond pixel flame wrapped round the ball, trailing behind it and flickering
  H.drawFlame = function (g, b, r, sp) {
    var x = g.ctx, rows = H.FLAME, w = rows[0].length, h = rows.length, P = Math.max(2, Math.round(r / 3.6));
    var flip = Math.floor(g.clock * 12) % 2, grow = 1 + Math.sin(g.clock * 23) * 0.06;
    var a = (!b.held && sp > 60) ? Math.atan2(-b.vy, -b.vx) + Math.PI / 2 : 0;   // tip points away from travel
    x.save(); x.rotate(a); x.scale(1, grow);
    var ox = -w * P / 2, oy = -h * P + r * 1.05, col = { O: C.ink, L: C.lime, V: C.lav };
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var ch = rows[j][flip ? w - 1 - i : i];
      if (col[ch]) { x.fillStyle = col[ch]; x.fillRect(Math.round(ox + i * P), Math.round(oy + j * P), P, P); }
    }
    x.restore();
  };
  function easeBack(t) { var c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }

  H.draw = function (g) {
    var x = g.ctx, W = g.W, u = g.u, i;
    x.clearRect(0, 0, W, g.H);
    if (g.frame) { x.fillStyle = g.frame.bg || '#07A87E'; x.fillRect(0, 0, W, g.H); H.drawFoot(g); }
    // HUD
    x.textBaseline = 'alphabetic'; x.fillStyle = C.ink;
    x.font = '700 ' + g.fs + 'px ' + g.font; x.textAlign = 'left';
    var pad = Math.max(16, Math.round(W * 0.05));
    x.fillStyle = g.flash > 0 ? C.lime : C.ink;
    x.fillText('SCORE ' + g.score, pad, g.hy);
    x.fillStyle = C.ink; x.font = '500 ' + g.fs + 'px ' + g.font;
    var sw = x.measureText('SCORE 0000').width + g.fs * 1.5;
    x.font = '700 ' + g.fs + 'px ' + g.font;
    for (i = 0; i < H.BALLS; i++) {
      x.beginPath(); x.arc(pad + sw + i * g.fs * 0.8, g.hy - g.fs * 0.34, g.fs * 0.26, 0, Math.PI * 2);
      if (i < g.left) { x.fillStyle = C.lime; x.fill(); }
      x.lineWidth = 1.5; x.strokeStyle = C.ink; x.stroke();
    }
    if (g.onFire && !g.phone && Math.floor(g.clock * 6) % 2) { x.textAlign = 'left'; x.fillStyle = C.lime; x.font = '700 ' + g.fs + 'px ' + g.font; x.fillText('ON FIRE x' + H.FIRE_X, pad + sw + H.BALLS * g.fs * 0.8 + g.fs, g.hy); }
    x.textAlign = 'right'; x.fillStyle = C.ink; x.font = '500 ' + g.fs + 'px ' + g.font;
    x.fillText('BEST ' + g.best, W - pad, g.hy);
    // floor rule
    x.fillStyle = C.ink; x.fillRect(0, g.floorY, W, 1.5);
    for (i = 0; i < g.hoops.length; i++) H.drawHoopBack(g, g.hoops[i]);
    H.drawSling(g, 'back');
    H.drawAim(g);
    for (i = 0; i < g.fly.length; i++) { x.globalAlpha = Math.max(0, g.fly[i].fade); H.drawBall(g, g.fly[i]); }
    x.globalAlpha = 1;
    if (g.b) H.drawBall(g, g.b);
    H.drawSling(g, 'front');
    for (i = 0; i < g.hoops.length; i++) H.drawHoopFront(g, g.hoops[i]);
    // confetti
    for (i = 0; i < g.confetti.length; i++) {
      var c = g.confetti[i]; x.save(); x.translate(c.x, c.y); x.rotate(c.rot); x.globalAlpha = Math.max(0, 1 - c.t / 1.4);
      x.fillStyle = c.c; x.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2); x.restore();
    }
    x.globalAlpha = 1;
    // fire sparks
    for (i = 0; i < g.parts.length; i++) {
      var q = g.parts[i]; x.globalAlpha = Math.max(0, 1 - q.t / q.life); x.fillStyle = q.c;
      x.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
    }
    x.globalAlpha = 1;
    // YOU'RE ON FIRE! slams in, holds, then fades
    if (g.fireMsg > 0) {
      var e = 2.2 - g.fireMsg, sc = e < 0.18 ? 1.6 - (e / 0.18) * 0.6 : 1, big = Math.round(Math.min(g.fs * 3.4, W / 9));
      x.save(); x.translate(W / 2, g.top + (g.floorY - g.top) * 0.3); x.scale(sc, sc);
      x.globalAlpha = g.fireMsg < 0.4 ? g.fireMsg / 0.4 : 1;
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = C.lime;
      x.font = '700 ' + big + 'px ' + g.font; x.fillText('YOU\u2019RE ON FIRE!', 0, 0);
      x.restore(); x.globalAlpha = 1; x.textBaseline = 'alphabetic';
    }
    // score pop-ups
    x.textAlign = 'center'; x.font = '700 ' + Math.round(g.fs * 1.25) + 'px ' + g.font;
    for (i = 0; i < g.fx.length; i++) {
      var f = g.fx[i]; if (f.t < 0) continue;
      x.globalAlpha = f.t < 0.8 ? 1 : 1 - (f.t - 0.8) / 0.3;
      x.fillStyle = C.lime; x.fillText(f.text, f.x, f.y - f.t * 40 * u);
    }
    x.globalAlpha = 1;
    // first-time hint
    if (g.mode === 'ready' && g.b && !g.b.drag) {
      x.textAlign = 'left'; x.font = '500 ' + g.fs + 'px ' + g.font; x.fillStyle = C.ink;
      if (g.phone) x.fillText('Drag the ball back, let go', Math.max(16, Math.round(W * 0.05)), g.top + g.fs * 0.6);
      else x.fillText('Pull the ball back and let go', g.sx - 30 * u, g.forkY - 48 * u + Math.sin(g.clock * 3) * 2 * u);
    }
    if (g.mode === 'over') H.drawOver(g);
  };

  // frame mode only: the footer's links row (ink rule, Instagram / Privacy Policy / rights line), like the site
  H.drawFoot = function (g) {
    var x = g.ctx, W = g.W, pad = Math.round(W * 0.05), y0 = g.H - g.footH, lw = Math.max(1.5, W / 720);
    x.fillStyle = C.ink;
    x.fillRect(0, 0, W, lw);
    x.fillRect(pad, y0, W - pad * 2, lw);
    x.font = '500 ' + Math.round(g.fs * 0.85) + 'px ' + g.font; x.textBaseline = 'middle';
    var y = y0 + g.footH * 0.48;
    var rights = '\u00A9 ' + new Date().getFullYear() + ' Brave Beyond. All rights reserved.';
    var l = x.measureText('Instagram').width, r = x.measureText(rights).width;
    x.textAlign = 'left'; x.fillText('Instagram', pad, y);
    x.textAlign = 'center'; x.fillText('Privacy Policy', (pad + l + W - pad - r) / 2, y);   // spaced between, like the site
    x.textAlign = 'right'; x.fillText(rights, W - pad, y);
    x.textBaseline = 'alphabetic';
  };

  H.drawOver = function (g) {
    var x = g.ctx, W = g.W, cy = g.top + (g.floorY - g.top) * 0.34, a = Math.min(1, g.overT * 3);
    x.globalAlpha = a; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillStyle = C.ink; x.font = '700 ' + Math.round(g.fs * 2.6) + 'px ' + g.font;
    x.fillText(g.newBest ? 'NEW BEST' : 'OUT OF BALLS', W / 2, cy);
    x.font = '500 ' + Math.round(g.fs * 1.3) + 'px ' + g.font;
    x.fillText(g.score + ' points', W / 2, cy + g.fs * 2);
    var bw = Math.round(g.fs * 10), bh = Math.round(g.fs * 2.8), bx = Math.round(W / 2 - bw / 2), by = Math.round(cy + g.fs * 3.4);
    g.btn = { x: bx, y: by, w: bw, h: bh };
    x.fillStyle = C.ink; x.beginPath();
    if (x.roundRect) x.roundRect(bx, by, bw, bh, bh / 2); else x.rect(bx, by, bw, bh);
    x.fill();
    x.fillStyle = C.lime; x.font = '700 ' + g.fs + 'px ' + g.font; x.textBaseline = 'middle';
    x.fillText('Play again', W / 2, by + bh / 2 + 1);
    x.globalAlpha = 1; x.textBaseline = 'alphabetic';
  };

  // ---- mount -------------------------------------------------------------------------------------
  function footer() {
    if (window.BBH_PREVIEW) return document.querySelector('.bb-footer');
    var f = document.querySelector(H.SEL);
    if (f) return f;
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (H.PATHS.indexOf(path) < 0) return null;
    var cs = document.querySelectorAll('[data-barba="container"]'), c = cs[cs.length - 1];
    return (c && c.querySelector('.bb-footer')) || document.querySelector('.bb-footer');
  }
  H.mount = function () {
    if (H.g) { H.g.stop(); H.g = null; }
    var f = footer();
    if (!f) return;
    f.classList.add('bbhp-on');
    var st = f.querySelector('.bbhp-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbhp-stage'; st.innerHTML = '<canvas aria-label="Mini game: pull the ball back in the slingshot and fling it into the hoops"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas'), best = 0;
    try { best = +localStorage.getItem('bbHoopsBest') || 0; } catch (e) {}
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), W: 0, best: best, clock: 0, fx: [], confetti: [], streak: 0, flash: 0, snap: 0, mT: 0, mx: 0, my: 0,
      rm: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif',
      fly: [], parts: [], reload: 0, b: null };
    H.size(g); H.reset(g); H.input(g);
    var raf = 0, last = performance.now(), dead = false;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { H.size(g); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!g.W) H.size(g);
      var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      if (g.W && r.bottom > 0 && r.top < vh && r.width > 0) { H.update(g, dt); H.draw(g); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    g.stop = function () { dead = true; cancelAnimationFrame(raf); if (ro) ro.disconnect(); };
    H.g = g;
  };
  H.mount();
  (function hook() {
    if (window.BBH_PREVIEW) return;
    if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
    barba.hooks.before(function () { if (H.g) { H.g.stop(); H.g = null; } });
    barba.hooks.after(function () { H.mount(); });
  })();
})();
