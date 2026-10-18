// BB Footer Cats ("Cat Noms"): pixel whack-a-mole, but kind. Cats pop out of four Brave Beyond boxes;
// tap/click one to drop it a fish biscuit before it ducks back in. 30 second rounds, combos up to x4,
// and a rare golden lucky cat (glows and sparkles, worth 50).
// Brand palette: Brave Dark, Purps, Lilac, Pink, Mint and Cream cats with Cream eyes. No lime on the cats.
// On a Purps footer the boxes are Lilac, the Purps cats sit out, any Purps markings swap to Mint so nothing
// blends into the background, and the Main Green tiger with Brave Dark stripes joins in (a nod to Battle Cat).
// The mouse turns into the pixel fish biscuit over the game. Boxes never spread wider than K.MAX_SPAN.
// Box logo = the stacked logo from 12-footer-bricks.js (BBB.LOGO), pixelated with its gaps opened.
// Instagram, Privacy Policy and the rights line stay under the game, like the other footer games.
// Pages: set in K.SEL / K.PATHS below (Barba namespace or URL path + .bb-footer).

(function () {
  var K = window.BBC = window.BBC || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbcat-on{padding-top:4vw}' +
    '.bb-footer.bbcat-on .bbft-lm{display:none}' +
    '.bbcat-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbcat-stage canvas{display:block;width:100%;cursor:url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'35\' height=\'15\' shape-rendering=\'crispEdges\'><g fill=\'%23E9A04A\'><rect x=\'5\' width=\'15\' height=\'5\'/><rect y=\'5\' width=\'35\' height=\'5\'/><rect x=\'5\' y=\'10\' width=\'15\' height=\'5\'/><rect x=\'30\' width=\'5\' height=\'15\'/></g><rect x=\'5\' y=\'5\' width=\'5\' height=\'5\' fill=\'%23212121\'/></svg>") 2 7,pointer;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}' +
    '.bb-footer.bbcat-on .bbft-ig{order:1;margin:2vw 0 0}' +
    // hide the site's lime custom cursor while the fish cursor is over the game
    'body.bbcat-hover .custom-cursor{opacity:0!important;visibility:hidden!important}' +
    '@media (max-width:479px){.bb-footer.bbcat-on{padding-top:24px}.bb-footer.bbcat-on .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);
  K.SEL = '[data-barba-namespace="contact"] .bb-footer';
  K.PATHS = ['/contact'];
  K.ROUND = 30;
  K.LUCKY = 0.11;         // chance a cat is the golden one while playing
  K.MAX_SPAN = 960;       // widest the four boxes spread (px) so the cats stay reachable on big screens
  K.LOGO_W = 1415.38; K.LOGO_H = 572.45;

  var C = { green: '#07A87E', ink: '#212121', cream: '#F4E9D6', purps: '#AE9AE4', lilac: '#D0C6E9', pink: '#E8CAE9', mint: '#66C9B0',
    lime: '#CCFF00', gold: '#FFE36E', white: '#FFFFFF', fish: '#E9A04A' };
  K.C = C;
  K.TYPES = {
    black: { fur: C.ink, nose: C.purps, closed: C.cream, eye: C.cream },
    purps: { fur: C.purps, nose: C.pink, closed: C.ink, eye: C.cream },
    lilac: { fur: C.lilac, nose: C.purps, closed: C.ink, eye: C.cream },
    tabby: { fur: C.lilac, nose: C.purps, closed: C.ink, eye: C.cream, mark: C.purps, pat: 'tabby' },
    pink: { fur: C.pink, nose: C.purps, closed: C.ink, eye: C.cream },
    mint: { fur: C.mint, nose: C.pink, closed: C.ink, eye: C.cream },
    tiger: { fur: C.green, nose: C.pink, closed: C.ink, eye: C.cream, mark: C.ink, pat: 'tiger' },
    calico: { fur: C.cream, nose: C.pink, closed: C.ink, eye: C.white, a: C.purps, b: C.ink, pat: 'calico' },
    lucky: { fur: '#F6C945', nose: '#C9654F', closed: C.ink, mark: '#E2483D', pat: 'lucky' }
  };
  // box palettes: kraft-free brand boxes. 'purple' is used on a green footer, 'lilac' on a Purps footer.
  K.BOXES = {
    purple: { front: C.purps, back: '#9583D1', edge: '#8D78C9', inside: C.ink, flap: C.lilac, tape: C.pink, logo: C.ink },
    lilac: { front: C.lilac, back: '#BFB2E3', edge: '#B4A6DE', inside: C.ink, flap: C.pink, tape: C.cream, logo: C.ink }
  };
  K.POOLS = {
    purple: ['black', 'black', 'black', 'purps', 'purps', 'purps', 'lilac', 'tabby', 'pink', 'mint', 'calico'],
    lilac: ['black', 'black', 'black', 'black', 'tiger', 'tiger', 'lilac', 'tabby', 'pink', 'mint', 'mint', 'calico']
  };

  // sprites: one char = one game pixel
  K.CAT = [
    '.F............F.', '.FF..........FF.', '.FFF........FFF.', '.FFFF......FFFF.',
    'FFFFFFFFFFFFFFFF', 'FFFFFFFFFFFFFFFF', 'FFWWWWFFFFWWWWFF', 'FFWWPPFFFFPPWWFF',
    'FFWWPPFFFFPPWWFF', 'FFWWWWFFFFWWWWFF', 'FFFFFFFNNFFFFFFF', 'FFFFFFFFFFFFFFFF',
    '.FFFFFFFFFFFFFF.', '..FFFFFFFFFFFF..'
  ];
  K.HEART = ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'];
  K.FISH = ['.XXX..X', 'XEXXXXX', '.XXX..X'];
  K.PAWUP = ['.FF.', 'FFFF', 'FFFF', 'FFFF', '.FF.'];
  K.FONT = {
    '0': ['.XXX.', 'X...X', 'X..XX', 'X.X.X', 'XX..X', 'X...X', '.XXX.'],
    '1': ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
    '2': ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'],
    '3': ['XXXXX', '...X.', '..X..', '...X.', '....X', 'X...X', '.XXX.'],
    '4': ['...X.', '..XX.', '.X.X.', 'X..X.', 'XXXXX', '...X.', '...X.'],
    '5': ['XXXXX', 'X....', 'XXXX.', '....X', '....X', 'X...X', '.XXX.'],
    '6': ['..XX.', '.X...', 'X....', 'XXXX.', 'X...X', 'X...X', '.XXX.'],
    '7': ['XXXXX', '....X', '...X.', '..X..', '.X...', '.X...', '.X...'],
    '8': ['.XXX.', 'X...X', 'X...X', '.XXX.', 'X...X', 'X...X', '.XXX.'],
    '9': ['.XXX.', 'X...X', 'X...X', '.XXXX', '....X', '...X.', '.XX..'],
    '+': ['.....', '..X..', '..X..', 'XXXXX', '..X..', '..X..', '.....'],
    'x': ['.....', '.....', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
    'C': ['.XXX.', 'X...X', 'X....', 'X....', 'X....', 'X...X', '.XXX.'],
    'O': ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
    'M': ['X...X', 'XX.XX', 'X.X.X', 'X.X.X', 'X...X', 'X...X', 'X...X'],
    'B': ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
    ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....']
  };
  K.CW = 16; K.CH = K.CAT.length; K.BW = 26; K.BH = 15;

  K.grid = function (type) {
    var T = K.TYPES[type], g = K.CAT.map(function (r) { return r.split(''); });
    function set(x, y, c) { if (g[y] && g[y][x] === 'F') g[y][x] = c; }
    var x, y;
    if (T.pat === 'calico') {
      for (y = 0; y < 6; y++) for (x = 0; x < 7 - Math.floor(y / 2); x++) set(x, y, 'A');
      for (y = 0; y < 5; y++) for (x = 11 + Math.floor(y / 2); x < 16; x++) set(x, y, 'B');
    }
    if (T.pat === 'tabby') { [5, 7, 8, 10].forEach(function (x) { set(x, 4, 'M'); set(x, 5, 'M'); }); [0, 1, 14, 15].forEach(function (x) { set(x, 10, 'M'); }); }
    if (T.pat === 'tiger') {
      [[5, 4], [5, 5], [7, 4], [8, 4], [7, 5], [8, 5], [10, 4], [10, 5], [0, 9], [1, 9], [0, 11], [1, 11], [14, 9], [15, 9], [14, 11], [15, 11]].forEach(function (c) { set(c[0], c[1], 'M'); });
    }
    if (T.pat === 'lucky') { set(7, 4, 'M'); set(8, 4, 'M'); }
    return g;
  };
  K.GRIDS = {}; for (var t in K.TYPES) K.GRIDS[t] = K.grid(t);
})();

// sizing, logo pixelation, game logic
(function () {
  var K = window.BBC;
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  K.headY = function (g, h) { return g.rimY + 0.8 * g.s + (-0.33 * g.s - 0.8 * g.s) * ease(h.p); };

  // Is the footer background purple? Then use the lilac boxes and keep Purps cats out.
  K.theme = function (g) {
    var el = g.st, bg = '';
    while (el && el !== document.documentElement) {
      bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) break;
      el = el.parentElement;
    }
    var m = (bg || '').match(/\d+/g) || [255, 255, 255];
    var r = +m[0], gg = +m[1], b = +m[2];
    return (b > gg + 25 && r > gg) ? 'lilac' : 'purple';
  };

  K.buildLogo = function (g) {
    var L = window.BBB && window.BBB.LOGO; g.logoCells = [];
    if (!L) return;
    var P = g.P, LP = g.LP = Math.max(1, Math.floor(P / 3));
    var lw = Math.floor((K.BW - 2) * P / LP), lh = Math.max(1, Math.round(lw * K.LOGO_H / K.LOGO_W));
    var maxH = Math.floor((K.BH - 4) * P / LP); if (lh > maxH) { lh = maxH; lw = Math.round(lh * K.LOGO_W / K.LOGO_H); }
    g.logoW = lw; g.logoH = lh;
    var k = 6, o = document.createElement('canvas'); o.width = lw * k; o.height = lh * k;
    var x = o.getContext('2d'), ps = L.map(function (d) { return new Path2D(d); });
    x.scale(o.width / K.LOGO_W, o.height / K.LOGO_H); x.fillStyle = '#000'; ps.forEach(function (p) { x.fill(p); });
    // open the counters and the gaps between letters so the script survives pixelating
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = 0.7 * K.LOGO_W / lw; x.lineJoin = 'round'; ps.forEach(function (p) { x.stroke(p); });
    var d = x.getImageData(0, 0, o.width, o.height).data, need = Math.round(k * k * 0.4);
    for (var j = 0; j < lh; j++) for (var i = 0; i < lw; i++) {
      var n = 0;
      for (var v = 0; v < k; v++) for (var u = 0; u < k; u++) if (d[((j * k + v) * o.width + i * k + u) * 4 + 3] > 128) n++;
      if (n >= need) g.logoCells.push(i, j);
    }
  };

  K.size = function (g) {
    var W = Math.round(g.st.getBoundingClientRect().width);
    if (!W || W === g.W) return;
    g.W = W;
    g.fs = Math.max(11, Math.min(16, Math.round(W / 96)));   // HUD text, same scale as the other footer games
    g.hy = Math.round(g.fs * 1.6);
    // gameH sets the box/cat size; the footer is twice that tall, the extra is open space above the boxes
    var gameH = W < 560 ? 250 : 340;
    g.H = g.hy + Math.round(g.fs * 1.4) + gameH * 2;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    g.cv.width = W * dpr; g.cv.height = g.H * dpr; g.cv.style.height = g.H + 'px';
    g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); g.ctx.imageSmoothingEnabled = false;
    var span = Math.min(W - (W < 560 ? 32 : Math.round(W * 0.1)), K.MAX_SPAN), pad = Math.round((W - span) / 2), lane = span / 4;
    g.span = span;
    // leave room for the side flaps so neighbouring boxes never overlap (phones let the flaps just touch)
    g.P = Math.max(2, Math.floor(Math.min(lane / (K.BW + (W < 560 ? 3 : 7)), gameH * 0.62 / (K.BH + K.CH))));
    var P = g.P;
    g.s = K.CW * P / 0.92; g.bw = K.BW * P; g.bh = K.BH * P;
    g.floorY = Math.floor((g.H - 6) / P) * P - P; g.rimY = g.floorY - g.bh;
    g.theme = K.theme(g); g.box = K.BOXES[g.theme]; g.pool = K.POOLS[g.theme];
    K.buildLogo(g);
    var old = g.holes || []; g.holes = [];
    for (var i = 0; i < 4; i++) {
      var x = Math.round((pad + lane * (i + .5)) / P) * P;
      g.holes.push(old[i] ? Object.assign(old[i], { x: x }) : { x: x, phase: 'idle', p: 0, t: 0, ht: 0, type: 'black', blink: Math.random() * 3 });
    }
  };

  K.spawn = function (g) {
    var free = g.holes.filter(function (h) { return h.phase === 'idle'; });
    if (!free.length) return;
    var h = free[Math.random() * free.length | 0], play = g.mode === 'play';
    var prog = play ? 1 - g.time / K.ROUND : 0;
    h.type = Math.random() < (play ? K.LUCKY : 0.06) ? 'lucky' : g.pool[Math.random() * g.pool.length | 0];
    // wider screens mean longer mouse travel between boxes, so cats stay up longer (phones 1x, desktop up to ~1.9x)
    var reach = Math.max(1, Math.min(1.7, g.span / 520));
    var up = play ? (1.1 - 0.45 * prog) * reach : 1.7 * reach;
    if (h.type === 'lucky') up *= 0.7;
    h.phase = 'up'; h.t = up; h.ht = 0;
  };

  K.burst = function (g, h) {
    if (g.rm) return;
    var hy = K.headY(g, h), s = g.s, lucky = h.type === 'lucky', i, a, v;
    g.fx.push({ kind: 'ring', x: h.x, y: hy - 0.15 * s, vx: 0, vy: 0, g: 0, life: 0.4, max: 0.4, col: lucky ? K.C.gold : K.C.mint });
    for (i = 0; i < (lucky ? 9 : 7); i++) {
      a = -Math.PI / 2 + (Math.random() - .5) * 2.2; v = 120 + Math.random() * 120;
      g.fx.push({ kind: 'heart', x: h.x, y: hy - 0.3 * s, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 160, life: 0.7 + Math.random() * 0.3, max: 1, col: lucky ? (i % 2 ? K.C.gold : K.C.cream) : [K.C.cream, K.C.pink, K.C.mint][i % 3] });
    }
    if (lucky) for (i = 0; i < 20; i++) {
      a = Math.random() * Math.PI * 2; v = 150 + Math.random() * 220;
      g.fx.push({ kind: 'twinkle', x: h.x, y: hy - 0.1 * s, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 60, life: 0.6 + Math.random() * 0.3, max: 0.9, col: i % 3 ? K.C.gold : K.C.white });
    }
  };

  K.update = function (g, dt) {
    g.clock += dt;
    if (g.mode === 'play') { g.time = Math.max(0, g.time - dt); if (g.time <= 0) K.end(g); }
    g.spawnT -= dt;
    if (g.spawnT <= 0) {
      K.spawn(g);
      var prog = g.mode === 'play' ? 1 - g.time / K.ROUND : 0;
      g.spawnT = g.mode === 'play' ? (0.75 - 0.38 * prog) * (0.7 + Math.random() * 0.6) * Math.max(1, Math.min(1.3, g.span / 700)) : 1.1 + Math.random() * 0.9;
      if (g.mode === 'play' && prog > 0.4 && Math.random() < 0.35) K.spawn(g);
    }
    g.holes.forEach(function (h) {
      h.blink -= dt; if (h.blink < -0.12) h.blink = 2 + Math.random() * 3;
      if (h.phase === 'up') { h.p = Math.min(1, h.p + dt / 0.14); h.t -= dt; if (h.t <= 0) { h.phase = 'down'; if (g.mode === 'play') g.combo = 0; } }
      else if (h.phase === 'down') { h.p = Math.max(0, h.p - dt / 0.16); if (!h.p) h.phase = 'idle'; }
      else if (h.phase === 'hit') {
        var was = h.ht; h.ht += dt;
        if (was <= 0.15 && h.ht > 0.15) K.burst(g, h);
        if (h.ht > 0.45) { h.p = Math.max(0, h.p - dt / 0.09); if (!h.p) h.phase = 'idle'; }
      }
      // golden cat sheds pixel sparkles while it's out
      if (!g.rm && h.type === 'lucky' && h.phase !== 'idle' && h.p > 0.3) {
        h.sp = (h.sp || 0) - dt;
        if (h.sp <= 0) {
          h.sp = 0.06; var a = Math.random() * Math.PI * 2, r = (0.5 + Math.random() * 0.45) * g.s;
          g.fx.push({ kind: 'twinkle', x: h.x + Math.cos(a) * r, y: K.headY(g, h) - 0.25 * g.s + Math.sin(a) * r * 0.75, vx: 0, vy: -15, g: 0, life: 0.5, max: 0.5, col: Math.random() < .5 ? K.C.white : K.C.gold });
        }
      }
    });
    g.fx = g.fx.filter(function (f) { return (f.life -= dt) > 0; });
    g.fx.forEach(function (f) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += f.g * dt; });
    if (g.pop > 0) g.pop -= dt;
  };

  K.start = function (g) {
    g.mode = 'play'; g.score = 0; g.time = K.ROUND; g.combo = 0; g.spawnT = 0.3;
    g.holes.forEach(function (h) { if (h.phase !== 'hit') h.phase = h.p ? 'down' : 'idle'; });
  };
  K.end = function (g) {
    g.mode = 'over'; g.newBest = g.score > g.best && g.score > 0;
    if (g.score > g.best) { g.best = g.score; try { localStorage.setItem('bbCatsBest', g.best); } catch (e) {} }
    g.spawnT = 1.5;
  };

  K.hit = function (g, px, py) {
    for (var i = 0; i < g.holes.length; i++) {
      var h = g.holes[i];
      if (h.phase !== 'up' || h.p < 0.35) continue;
      var hy = K.headY(g, h), dx = (px - h.x) / (0.62 * g.s), dy = (py - (hy - 0.1 * g.s)) / (0.62 * g.s);
      if (dx * dx + dy * dy <= 1 && py < g.rimY + g.P) return h;
    }
    return null;
  };

  K.input = function (g) {
    g.cv.addEventListener('pointerdown', function (e) {
      var r = g.cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      // HUD play pill
      if (g.btn && px >= g.btn.x && px <= g.btn.x + g.btn.w && py >= g.btn.y && py <= g.btn.y + g.btn.h) { K.start(g); return; }
      var h = K.hit(g, px, py);
      if (!h) {
        if (py > g.hy + g.fs) g.fx.push({ kind: 'fish', x: px - 3.5 * g.P, y: py, vx: (Math.random() - .5) * 60, vy: -140, g: 900, life: 0.6, max: 0.6 });
        if (g.mode === 'play') g.combo = 0;
        return;
      }
      if (g.mode !== 'play') K.start(g);
      h.phase = 'hit'; h.ht = 0; g.combo++;
      var lucky = h.type === 'lucky', mult = Math.min(4, 1 + Math.floor((g.combo - 1) / 4)), pts = (lucky ? 50 : 10) * mult;
      g.score += pts; g.pop = 0.18;
      var z = Math.max(2, Math.round(g.P * (lucky ? 1.1 : 0.8)));
      // stepping up a combo level (x2, x3, x4) gets a big pop in the open space above the boxes
      if (mult > 1 && (g.combo - 1) % 4 === 0) {
        var bz = Math.max(4, Math.round(g.P * 1.6));
        g.fx.push({ kind: 'big', text: 'x' + mult + ' COMBO', col: K.C.ink, x: g.W / 2, y: Math.round((g.hy + g.fs + g.rimY - 1.1 * g.s) / 2), vx: 0, vy: 0, g: 0, life: 1.3, max: 1.3, z: bz });
      }
      g.fx.push({ kind: 'text', text: '+' + pts, sub: mult > 1 ? 'x' + mult + ' COMBO' : '', col: lucky ? K.C.gold : K.C.lime, x: h.x, y: Math.max(g.hy + g.fs + 5 * z, K.headY(g, h) - 0.95 * g.s), vx: 0, vy: -30, g: 0, life: 1.1, max: 1.1, z: z });
    });
  };
})();

// drawing
(function () {
  var K = window.BBC;
  function rect(x, c, X, Y, W, H) { x.fillStyle = c; x.fillRect(X, Y, W, H); }
  function sprite(x, rows, X, Y, map, z) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) {
      var c = map[rows[j][i]]; if (c) { x.fillStyle = c; x.fillRect(X + i * z, Y + j * z, z, z); }
    }
  }
  function text(x, str, cx, cy, z, col) {
    var X = Math.round(cx - (str.length * 6 * z - z) / 2), Y = Math.round(cy - 3.5 * z);
    for (var i = 0; i < str.length; i++) { var gl = K.FONT[str[i]]; if (gl) sprite(x, gl, X, Y, { X: col }, z); X += 6 * z; }
  }

  function cat(g, h) {
    var x = g.ctx, P = g.P, T = K.TYPES[h.type], fed = h.phase === 'hit', happy = fed && h.ht > 0.15;
    var x0 = h.x - K.CW * P / 2, y0 = Math.round((K.headY(g, h) - 9 * P) / P) * P;
    var map = { F: T.fur, W: T.eye || K.C.white, P: K.C.ink, N: T.nose, A: T.a, B: T.b, M: T.mark };
    if (g.theme === 'lilac') for (var k in map) if (map[k] === K.C.purps) map[k] = K.C.mint;
    if (happy || h.blink < 0) { map.W = T.fur; map.P = T.fur; }
    if (h.type === 'lucky') sprite(x, K.PAWUP, x0 + K.CW * P, y0 + 4 * P - (g.rm ? 0 : (Math.floor(g.clock * 5) % 2) * P), { F: T.fur }, P);
    sprite(x, K.GRIDS[h.type], x0, y0, map, P);
    if (happy) {
      [2, 10].forEach(function (ex) {
        rect(x, T.closed, x0 + ex * P, y0 + 8 * P, P, P); rect(x, T.closed, x0 + (ex + 1) * P, y0 + 7 * P, 2 * P, P); rect(x, T.closed, x0 + (ex + 3) * P, y0 + 8 * P, P, P);
      });
      sprite(x, K.FISH, x0 + 5 * P, y0 + 11 * P, { X: K.C.fish, E: K.C.ink }, P);
    } else if (h.blink < 0) {
      [2, 10].forEach(function (ex) { rect(x, T.closed, x0 + ex * P, y0 + 8 * P, 4 * P, P); });
    }
    if (fed && !happy) sprite(x, K.FISH, x0 + 5 * P, Math.round((y0 - 8 * P + h.ht / 0.15 * 19 * P) / P) * P, { X: K.C.fish, E: K.C.ink }, P);
  }

  function glow(g, h) {
    var x = g.ctx, P = g.P, cy = Math.round((Math.min(K.headY(g, h), g.rimY) - 0.2 * g.s) / P) * P;
    var R = Math.round(g.s * 1.05 / P) + (g.rm ? 0 : Math.floor(g.clock * 6) % 2);
    [[R, 0.25], [R * 0.72, 0.45], [R * 0.45, 0.7]].forEach(function (b) {
      var r = b[0]; x.globalAlpha = b[1] * h.p; x.fillStyle = K.C.gold;
      for (var j = -Math.ceil(r); j <= r; j++) { var hw = Math.floor(Math.sqrt(Math.max(0, r * r - j * j))); x.fillRect(h.x - hw * P, cy + j * P, (hw * 2 + 1) * P, P); }
    });
    x.globalAlpha = 1;
  }

  function box(g, h) {
    var x = g.ctx, P = g.P, B = g.box, x0 = h.x - g.bw / 2, x1 = x0 + g.bw, rim = g.rimY, k;
    if (h.type === 'lucky' && h.phase !== 'idle') glow(g, h);
    rect(x, B.back, x0 + 2 * P, rim - 6 * P, g.bw - 4 * P, 4 * P);
    rect(x, B.inside, x0 + P, rim - 2 * P, g.bw - 2 * P, 2 * P);
    if (h.phase !== 'idle') { x.save(); x.beginPath(); x.rect(x0 - 3 * P, 0, g.bw + 6 * P, rim); x.clip(); cat(g, h); x.restore(); }
    for (k = 0; k < 4; k++) { rect(x, B.flap, x0 - (k + 1) * P, rim - (k + 1) * P, 3 * P, P); rect(x, B.flap, x1 - 2 * P + k * P, rim - (k + 1) * P, 3 * P, P); }
    rect(x, B.front, x0, rim, g.bw, g.bh);
    rect(x, B.edge, x0, g.floorY - P, g.bw, P); rect(x, B.edge, x1 - P, rim, P, g.bh);
    rect(x, B.flap, x0, rim, g.bw, 2 * P); rect(x, B.tape, h.x - 2 * P, rim, 4 * P, 2 * P);
    var LP = g.LP, lx = Math.round(h.x - g.logoW * LP / 2), ly = rim + 2 * P + Math.round(((K.BH - 3) * P - g.logoH * LP) / 2);
    x.fillStyle = B.logo; for (var i = 0; i < g.logoCells.length; i += 2) x.fillRect(lx + g.logoCells[i] * LP, ly + g.logoCells[i + 1] * LP, LP, LP);
    if (h.phase !== 'idle' && h.p > 0.85) { var fur = K.TYPES[h.type].fur, cx0 = h.x - K.CW * P / 2; rect(x, fur, cx0 + 3 * P, rim - P, 3 * P, 2 * P); rect(x, fur, cx0 + 10 * P, rim - P, 3 * P, 2 * P); }
  }

  function pill(g, txt, right, y) {
    var x = g.ctx; x.font = '700 ' + g.fs + 'px ' + g.font;
    var w = x.measureText(txt).width + g.fs * 1.8, h = Math.round(g.fs * 2.1), px = right - w, py = y - h / 2;
    x.fillStyle = K.C.ink; x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, h / 2); else x.rect(px, py, w, h); x.fill();
    x.fillStyle = K.C.lime; x.textAlign = 'center'; x.fillText(txt, px + w / 2, y + 1);
    g.btn = { x: px, y: py, w: w, h: h };
    return px;
  }

  K.draw = function (g) {
    var x = g.ctx, P = g.P;
    x.clearRect(0, 0, g.W, g.H);
    // HUD, same style as the other footer games
    x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = K.C.ink;
    x.font = '500 ' + g.fs + 'px ' + g.font;
    var left = g.W < 560 ? 16 : Math.round(g.W * 0.05), right = g.W - left;
    var hud = g.mode === 'play' ? 'SCORE ' + g.score + '   TIME ' + Math.ceil(g.time) + '   BEST ' + g.best
      : g.mode === 'over' ? (g.newBest ? 'NEW BEST ' : 'SCORE ') + g.score + '   BEST ' + g.best
        : 'FEED THE CATS   BEST ' + g.best;
    if (g.pop > 0 && g.mode === 'play') { x.font = '700 ' + g.fs + 'px ' + g.font; }
    x.fillText(hud, left, g.hy);
    g.btn = null;
    if (g.mode !== 'play') pill(g, g.mode === 'over' ? 'Play again' : 'Play', right, g.hy);
    // floor rule
    rect(x, K.C.ink, 0, g.floorY + P, g.W, 1.5);
    g.holes.forEach(function (h) { box(g, h); });
    g.fx.forEach(function (f) {
      var t = 1 - f.life / f.max;
      if (f.kind === 'big') {
        var bz = g.rm ? f.z : t < 0.08 ? Math.round(f.z * 0.6) : t < 0.16 ? Math.round(f.z * 1.25) : f.z;
        if (t < 0.85 || g.rm || Math.floor(t * 30) % 2) text(x, f.text, f.x, f.y, bz, f.col);
      } else if (f.kind === 'text') {
        var z = g.rm || t > 0.2 ? f.z : t < 0.1 ? Math.max(1, f.z - 1) : f.z + 1;
        text(x, f.text, f.x, f.y, z, f.col);
        if (f.sub) text(x, f.sub, f.x, f.y + 6 * f.z, Math.max(1, Math.round(f.z / 2)), f.col);
      } else if (f.kind === 'twinkle') {
        var tx = Math.round(f.x / P) * P, ty = Math.round(f.y / P) * P;
        rect(x, f.col, tx, ty, P, P);
        if (t > 0.3 && t < 0.7) { rect(x, f.col, tx - P, ty, P, P); rect(x, f.col, tx + P, ty, P, P); rect(x, f.col, tx, ty - P, P, P); rect(x, f.col, tx, ty + P, P, P); }
      } else if (f.kind === 'ring') {
        var r = Math.round(g.s * (0.35 + t * 1.1) / P), cy = Math.round(f.y / P) * P; x.fillStyle = f.col;
        for (var a = 0; a < 64; a++) { var an = a / 64 * Math.PI * 2; x.fillRect(Math.round((f.x + Math.cos(an) * r * P) / P) * P, Math.round((cy + Math.sin(an) * r * P) / P) * P, P, P); }
      } else if (f.kind === 'fish') sprite(x, K.FISH, Math.round(f.x / P) * P, Math.round(f.y / P) * P, { X: K.C.fish, E: K.C.ink }, P);
      else if (f.kind === 'heart') sprite(x, K.HEART, Math.round(f.x / P) * P, Math.round(f.y / P) * P, { X: f.col }, Math.max(2, Math.round(P * 0.75)));
    });
  };
})();

// mount on the footer (also after Barba page transitions)
(function () {
  var K = window.BBC;
  function footer() {
    var f = document.querySelector(K.SEL);
    if (f) return f;
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (K.PATHS.indexOf(path) < 0) return null;
    var cs = document.querySelectorAll('[data-barba="container"]'), c = cs[cs.length - 1];
    return (c && c.querySelector('.bb-footer')) || document.querySelector('.bb-footer');
  }
  K.mount = function () {
    if (K.g) { K.g.stop(); K.g = null; }
    var f = footer();
    if (!f || !(window.BBB && window.BBB.LOGO)) return;
    f.classList.add('bbcat-on');
    var st = f.querySelector('.bbcat-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbcat-stage'; st.innerHTML = '<canvas aria-label="Mini game: feed the cats a fish biscuit as they pop out of the boxes"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas'), best = 0;
    try { best = +localStorage.getItem('bbCatsBest') || 0; } catch (e) {}
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), W: 0, best: best, score: 0, time: K.ROUND, combo: 0, mode: 'idle', spawnT: 0.6, clock: 0, fx: [], pop: 0,
      rm: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    K.input(g); K.size(g);
    cv.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') document.body.classList.add('bbcat-hover'); });
    cv.addEventListener('pointerleave', function () { document.body.classList.remove('bbcat-hover'); });
    // open with two cats already peeking so the footer shows the game straight away
    if (g.holes) { var a = g.holes[0], b = g.holes[2]; a.type = 'black'; a.phase = 'up'; a.p = 1; a.t = 1.6; b.type = g.pool[4]; b.phase = 'up'; b.p = 1; b.t = 2.2; }
    var raf = 0, last = performance.now(), dead = false;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { K.size(g); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!g.W) K.size(g);
      var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      if (g.W && r.bottom > 0 && r.top < vh && r.width > 0) { K.update(g, dt); K.draw(g); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    g.stop = function () { document.body.classList.remove('bbcat-hover'); dead = true; cancelAnimationFrame(raf); if (ro) ro.disconnect(); };
    K.g = g;
  };
  K.mount();
  (function hook() {
    if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
    barba.hooks.before(function () { if (K.g) { K.g.stop(); K.g = null; } });
    barba.hooks.after(function () { K.mount(); });
  })();
})();
