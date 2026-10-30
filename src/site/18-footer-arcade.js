// BB Footer Arcade: every footer can play every footer game.
// Each game file registers itself on window.BBARCADE ({ id, name, themes, ns, paths, cls, stage, mount, stop })
// instead of starting itself. This file starts the right one for the page, and puts a small NEXT GAME pill at the
// top of the footer that swaps to the next game. Only games with a colour set for this footer's background are in
// the rotation (green footer: green sets, Purps footer: purple sets), and each game is started in that colour set.
// Only one game runs at a time; switching stops the old one, removes its canvas and hands the footer back.
// Page defaults: a game whose ns / paths list this page starts there (invaders on home and goodies, bricks on
// services, cats on contact). Every other page keeps the logo with footer hearts until PLAY A GAME is pressed.

(function () {
  var A = window.BBA = window.BBA || {};
  var s = document.createElement('style');
  // The button matches the site's squiggle buttons (.button): ink outline pill, uppercase, sparkle on the right.
  // data-squiggle hands it to 02-squiggle-buttons.js, so on hover the ink squiggle draws in and fills it, the text
  // turns Purps (.sq-on) and the sparkle jumps to the left in white, like the site's buttons.
  s.textContent =
    '.bbarc-bar{order:-1;align-self:center;display:flex;justify-content:center;margin:0 0 1.2vw;position:relative;z-index:2}' +
    '.bbarc-btn{-webkit-appearance:none;appearance:none;margin:0;box-sizing:border-box;position:relative;isolation:isolate;overflow:hidden;cursor:pointer;' +
      'display:inline-flex;align-items:center;gap:10px;height:40px;padding:0 18px;background:transparent;color:#212121;border:1px solid #212121;border-radius:80px;' +
      'font-family:inherit;font-weight:600;font-size:13px;line-height:1;letter-spacing:.01em;text-transform:uppercase;-webkit-user-select:none;user-select:none}' +
    '.bbarc-btn:focus-visible{outline:2px solid #CCFF00;outline-offset:3px}' +
    '.bbarc-ic{display:inline-flex;flex:none;width:12px;height:12px;overflow:hidden;transition:width .3s,margin .3s,opacity .2s}' +
    '.bbarc-ic svg{display:block;flex:none;width:12px;height:12px}' +
    '.bbarc-ic-l{width:0;margin-right:-10px;opacity:0}' +
    '.bbarc-btn.sq-on .bbarc-ic-l{width:12px;margin-right:0;opacity:1}' +
    '.bbarc-btn.sq-on .bbarc-ic-r{width:0;margin-left:-10px;opacity:0}' +
    '@media (max-width:479px){.bbarc-bar{margin:0 0 12px}.bbarc-btn{height:36px;font-size:12px;padding:0 15px}}' +
    '@media (prefers-reduced-motion:reduce){.bbarc-ic{transition:none}}';
  document.head.appendChild(s);

  A.PURPS = [174, 154, 228];

  function container() { var cs = document.querySelectorAll('[data-barba="container"]'); return cs[cs.length - 1] || null; }
  function footer() { var c = container(); return (c && c.querySelector('.bb-footer')) || document.querySelector('.bb-footer'); }

  // footer colour: the first painted background behind it, Purps -> 'purple', anything else -> 'green'
  A.theme = function (f) {
    var el = f, bg = '';
    while (el && el !== document.documentElement) {
      bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) break;
      el = el.parentElement;
    }
    var m = (bg || '').match(/\d+/g) || [];
    if (m.length < 3) return 'green';
    var d = Math.abs(m[0] - A.PURPS[0]) + Math.abs(m[1] - A.PURPS[1]) + Math.abs(m[2] - A.PURPS[2]);
    return d < 60 ? 'purple' : 'green';
  };

  A.games = function (t) { return (window.BBARCADE || []).filter(function (g) { return g.themes.indexOf(t) >= 0; }); };

  A.pageGame = function (t) {
    var c = container(), ns = c ? c.getAttribute('data-barba-namespace') : '';
    var path = location.pathname.replace(/\/+$/, '') || '/';
    return A.games(t).filter(function (g) { return (ns && g.ns.indexOf(ns) >= 0) || (g.paths || []).indexOf(path) >= 0; })[0] || null;
  };

  A.clear = function () {
    var g = A.cur, f = A.f;
    A.cur = null;
    if (!g) return;
    try { g.stop(); } catch (e) {}
    if (f) { f.classList.remove(g.cls); var st = f.querySelector(g.stage); if (st) st.remove(); }
  };

  A.start = function (g) {
    A.clear();
    if (!g || !A.f) return false;
    var ok = false;
    try { ok = g.mount(A.f, A.t) !== false; } catch (e) { console.error('[bb] arcade', g.id, e); }
    if (!ok) { A.cur = g; A.clear(); return false; }
    A.cur = g;
    A.label();
    return true;
  };

  A.next = function () {
    var list = A.games(A.t), i = A.cur ? list.indexOf(A.cur) : -1;
    for (var k = 1; k <= list.length; k++) if (A.start(list[(i + k) % list.length])) return;
  };

  // after a press the squiggle fill clears again (the squiggle script only clears on mouseout, which never comes on
  // phones or while the pointer is still on the button); it refills the next time the pointer comes over it
  A.unfill = function () {
    if (!A.btn) return;
    try { A.btn.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })); } catch (e) {}
  };

  A.label = function () {
    if (!A.btn) return;
    A.btn.querySelector('.bbarc-tx').textContent = A.cur ? 'Next game' : 'Play a game';
    A.btn.setAttribute('aria-label', A.cur ? 'Switch footer game (playing ' + A.cur.name + ')' : 'Play a footer game');
  };

  A.mount = function () {
    A.clear();
    if (A.bar && A.bar.parentNode) A.bar.parentNode.removeChild(A.bar);
    A.f = footer();
    if (!A.f) return;
    A.t = A.theme(A.f);
    if (!A.games(A.t).length) return;
    var bar = A.bar = document.createElement('div');
    bar.className = 'bbarc-bar';
    var star = function (c) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="' + c + '" d="M12 0C12.7 6.5 17.5 11.3 24 12C17.5 12.7 12.7 17.5 12 24C11.3 17.5 6.5 12.7 0 12C6.5 11.3 11.3 6.5 12 0Z"/></svg>'; };
    bar.innerHTML = '<button type="button" class="bbarc-btn" data-squiggle><span class="bbarc-ic bbarc-ic-l">' + star('#F4F4F4') + '</span><span class="bbarc-tx">Next game</span><span class="bbarc-ic bbarc-ic-r">' + star('#212121') + '</span></button>';
    A.btn = bar.firstChild;
    A.btn.addEventListener('click', function () { A.next(); A.unfill(); });
    A.f.insertBefore(bar, A.f.firstChild);
    A.start(A.pageGame(A.t));
    A.label();
  };

  A.mount();
  (function hook() {
    if (window.BBA_PREVIEW) return;
    if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
    barba.hooks.before(function () { A.clear(); });
    barba.hooks.after(function () { A.mount(); });
  })();
})();
