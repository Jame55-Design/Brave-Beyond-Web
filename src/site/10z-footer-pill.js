// BB Footer Pill: one look for every button the footer games draw on their canvases, so they all match each other
// and the NEXT GAME button (18-footer-arcade.js): ink pill, uppercase 600 text, centred exactly on its cap height.
//   main: 40px tall, 13px text (36px / 12px under 480px wide), same as NEXT GAME. Play again, Move here to play, etc.
//   hud:  28px tall, 11px text (26px on phones). Small buttons in a game's score bar: Restore logo, Play.
// Text is light pink on the green footer and lime on the Purps footer.
// BBPILL.draw(ctx, x, y, text, { size, align: 'center'|'left'|'right', W, font, theme, alpha }) -> { x, y, w, h }
(function () {
  var P = window.BBPILL = window.BBPILL || {};
  P.INK = '#212121';
  P.TEXT = { green: '#E8CAE9', purple: '#CCFF00' };
  P.draw = function (x, at, cy, txt, o) {
    o = o || {};
    var W = o.W || 1000, phone = W < 480, hud = o.size === 'hud';
    var h = hud ? (phone ? 26 : 28) : (phone ? 36 : 40), fs = hud ? 11 : (phone ? 12 : 13), padX = hud ? 12 : (phone ? 15 : 18);
    txt = String(txt).toUpperCase();
    x.save();
    x.font = '600 ' + fs + 'px ' + (o.font || 'sans-serif');
    try { if ('letterSpacing' in x) x.letterSpacing = (fs * 0.02).toFixed(2) + 'px'; } catch (e) {}
    var w = Math.round(x.measureText(txt).width + padX * 2);
    var left = Math.round(o.align === 'right' ? at - w : o.align === 'left' ? at : at - w / 2), top = Math.round(cy - h / 2);
    if (o.alpha != null) x.globalAlpha *= o.alpha;
    x.fillStyle = P.INK; x.beginPath();
    if (x.roundRect) x.roundRect(left, top, w, h, h / 2); else x.rect(left, top, w, h);
    x.fill();
    // centre on the capital height, not the font's box, so the label sits dead centre in every font and browser
    var m = x.measureText('H'), cap = m.actualBoundingBoxAscent || fs * 0.72;
    x.fillStyle = o.color || P.TEXT[o.theme] || P.TEXT.green;
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillText(txt, left + w / 2, top + h / 2 + cap / 2);
    x.restore();
    return { x: left, y: top, w: w, h: h };
  };
})();

// BB Play-again button: a real button laid over the game (so it gets the site's button feel) for the main
// end-of-game action. Same pill as NEXT GAME, with the sparkle. Reverse squiggle: solid ink at rest; on hover a
// squiggle in the footer's own colour wipes it clear to an ink outline with ink text (GSAP DrawSVG, like
// 02-squiggle-buttons.js), with a little bounce. A press dips it, wipes it if it isn't already, then acts.
// BBPILL.place(stage, key, { show, x, y, text, theme, enabled, onClick }) -> the button (or null when hidden).
// x / y are the centre in the stage's own px. Called every frame; only touches the DOM when something changes.
(function () {
  var P = window.BBPILL;
  var BG = { green: '#07A87E', purple: '#AE9AE4' };
  var css = document.createElement('style');
  css.textContent =
    '.bbpb{position:absolute;z-index:4;transform:translate(-50%,-50%);-webkit-appearance:none;appearance:none;margin:0;box-sizing:border-box;' +
      'isolation:isolate;overflow:hidden;cursor:pointer;display:inline-flex;align-items:center;gap:10px;height:40px;padding:0 18px;' +
      'background:#212121;color:#E8CAE9;border:1px solid #212121;border-radius:80px;font-family:inherit;font-weight:600;font-size:13px;line-height:1;' +
      'letter-spacing:.01em;text-transform:uppercase;white-space:nowrap;-webkit-user-select:none;user-select:none;transition:color .25s,opacity .25s}' +
    '.bbpb[hidden]{display:none!important}.bbpb[data-theme="purple"]{color:#CCFF00}' +
    '.bbpb.is-clear{color:#212121;background:transparent}' +
    '.bbpb[disabled]{opacity:.5;cursor:default}' +
    '.bbpb:focus-visible{outline:2px solid #CCFF00;outline-offset:3px}' +
    '.bbpb-sq{position:absolute;inset:0;z-index:-1;pointer-events:none}.bbpb-sq svg{display:block;width:100%;height:100%}' +
    '.bbpb-in{display:inline-flex;align-items:center;gap:10px;transform-origin:50% 50%}' +
    '.bbpb.is-pop .bbpb-in{animation:bbpb-pop .5s cubic-bezier(.3,.7,.4,1)}' +
    '.bbpb.is-press .bbpb-in{transform:scale(.94);transition:transform .12s}' +
    '@keyframes bbpb-pop{0%{transform:scale(1)}35%{transform:scale(1.08)}65%{transform:scale(.97)}100%{transform:scale(1)}}' +
    '.bbpb-ic{display:inline-flex;flex:none;width:12px;height:12px;overflow:hidden;transition:width .3s,margin .3s,opacity .2s}' +
    '.bbpb-ic svg{display:block;flex:none;width:12px;height:12px}' +
    '.bbpb-ic-l{width:0;margin-right:-10px;opacity:0}' +
    '.bbpb.is-clear .bbpb-ic-l{width:12px;margin-right:0;opacity:1}.bbpb.is-clear .bbpb-ic-r{width:0;margin-left:-10px;opacity:0}' +
    '.bbpb.is-hud{height:30px;font-size:11px;padding:0 12px;gap:8px}.bbpb.is-hud .bbpb-in{gap:8px}.bbpb.is-hud .bbpb-ic,.bbpb.is-hud .bbpb-ic svg{width:10px;height:10px}' +
    '.bbpb.is-hud .bbpb-ic-l{width:0;margin-right:-8px}.bbpb.is-hud.is-clear .bbpb-ic-l{width:10px;margin-right:0}.bbpb.is-hud.is-clear .bbpb-ic-r{width:0;margin-left:-8px}' +
    '.bbpb.is-right{transform:translate(-100%,-50%)}' +
    '@media (max-width:479px){.bbpb{height:36px;font-size:12px;padding:0 15px}.bbpb.is-hud{height:28px;font-size:11px;padding:0 11px}}' +
    '@media (prefers-reduced-motion:reduce){.bbpb.is-pop .bbpb-in{animation:none}.bbpb-ic{transition:none}}';
  document.head.appendChild(css);
  var rm = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var star = function (c) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="' + c + '" d="M12 0C12.7 6.5 17.5 11.3 24 12C17.5 12.7 12.7 17.5 12 24C11.3 17.5 6.5 12.7 0 12C6.5 11.3 11.3 6.5 12 0Z"/></svg>'; };

  // squiggle path across the button, as in 02-squiggle-buttons.js
  function path(b) {
    var p = b._p, w = b.clientWidth, h = b.clientHeight;
    var n = Math.max(4, Math.round(w / (h * .45))), dx = (w + h * .4) / n, x = -h * .2, a = h * .22, z = h * .78, y = a, d = 'M' + x + ' ' + y;
    for (var i = 0; i < n; i++) { var c = x + dx / 2 | 0, ny = y == a ? z : a; x += dx; d += 'C' + c + ' ' + y + ' ' + c + ' ' + ny + ' ' + (x | 0) + ' ' + ny; y = ny; }
    p.parentNode.setAttribute('viewBox', '0 0 ' + w + ' ' + h); p.parentNode.setAttribute('preserveAspectRatio', 'none');
    p.setAttribute('d', d); p.setAttribute('stroke', BG[b.dataset.theme] || BG.green); p._h = h;
    return p;
  }
  function gs() { var g = window.gsap; if (!g || !window.DrawSVGPlugin) return null; try { g.registerPlugin(window.DrawSVGPlugin); } catch (e) {} return g; }
  function wipe(b) {   // solid -> clear
    b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop');
    var g = gs(), k = rm() ? 0 : 1;
    if (!g || !k) { b.classList.add('is-clear'); return; }
    var p = path(b); b._on = 1;
    g.killTweensOf(p); if (b._t) b._t.kill();
    b._t = g.timeline().fromTo(p, { drawSVG: 0, strokeWidth: 2 }, { drawSVG: '100%', strokeWidth: p._h * 1.3, duration: .65, ease: 'sine.inOut' })
      .call(function () { if (b._on) b.classList.add('is-clear'); }, null, .45);
  }
  function unwipe(b) {   // clear -> solid
    b._on = 0; if (b._t) b._t.kill();
    b.classList.remove('is-clear');
    var g = gs(), p = b._p;
    if (!g || !p.getAttribute('d')) return;
    g.killTweensOf(p); g.to(p, { drawSVG: '100% 100%', strokeWidth: 1.5, duration: rm() ? 0 : .55, ease: 'sine.inOut' });
  }
  function reset(b) {
    b._on = 0; if (b._t) b._t.kill(); b.classList.remove('is-clear', 'is-pop', 'is-press'); b._busy = 0;
    var g = gs(); if (g) { g.killTweensOf(b._p); g.set(b._p, { drawSVG: 0 }); } else b._p.removeAttribute('d');
  }
  function make() {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'bbpb';
    b.innerHTML = '<span class="bbpb-sq"><svg aria-hidden="true" fill="none"><path stroke-linecap="round"/></svg></span>'
      + '<span class="bbpb-in"><span class="bbpb-ic bbpb-ic-l">' + star('#212121') + '</span><span class="bbpb-tx"></span>'
      + '<span class="bbpb-ic bbpb-ic-r"></span></span>';
    b._p = b.querySelector('path');
    b.addEventListener('mouseenter', function () { if (!b.disabled) wipe(b); });
    b.addEventListener('mouseleave', function () { if (!b._busy) unwipe(b); b.classList.remove('is-press'); });
    b.addEventListener('pointerdown', function () { if (!b.disabled) b.classList.add('is-press'); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { b.classList.remove('is-press'); }); });
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      if (b.disabled || b._busy) return;
      b._busy = 1;
      var wait = rm() ? 0 : b.classList.contains('is-clear') ? 120 : 420;
      if (!b._on) wipe(b);
      setTimeout(function () { var f = b._click; b._busy = 0; if (f) f(); }, wait);
    });
    return b;
  }
  P.place = function (st, key, o) {
    if (!st) return null;
    var all = st._pb || (st._pb = {}), b = all[key];
    if (!o || !o.show) { if (b && !b.hidden) { b.hidden = true; reset(b); } return null; }
    if (!b) { b = all[key] = make(); st.appendChild(b); }
    b._click = o.onClick;
    if (b.hidden) { b.hidden = false; reset(b); }
    var th = o.theme === 'purple' ? 'purple' : 'green';
    if (b.dataset.theme !== th) { b.dataset.theme = th; b.querySelector('.bbpb-ic-r').innerHTML = star(th === 'purple' ? '#CCFF00' : '#E8CAE9'); }
    var t = String(o.text); if (b._txt !== t) { b._txt = t; b.querySelector('.bbpb-tx').textContent = t; }
    var l = Math.round(o.x) + 'px', tp = Math.round(o.y) + 'px';
    if (b.style.left !== l) b.style.left = l;
    if (b.style.top !== tp) b.style.top = tp;
    var hud = o.size === 'hud', right = o.align === 'right';
    if (b.classList.contains('is-hud') !== hud) { b.classList.toggle('is-hud', hud); b._w = 0; }
    if (b.classList.contains('is-right') !== right) b.classList.toggle('is-right', right);
    var dis = o.enabled === false; if (b.disabled !== dis) b.disabled = dis;
    if (!b._w || b._wt !== t) { b._w = b.offsetWidth; b._wt = t; }   // width, cached until the label changes
    return b;
  };

  // Instructions ("Move here to play", "Game over · 120 pts") are plain text, never a pill, so the only thing
  // that looks like a button is a button. Uppercase 500, ink, centred on cap height.
  P.say = function (x, cx, cy, txt, o) {
    o = o || {};
    var fs = (o.W || 1000) < 480 ? 12 : 13;
    x.save();
    x.font = '500 ' + fs + 'px ' + (o.font || 'sans-serif');
    try { if ('letterSpacing' in x) x.letterSpacing = (fs * 0.04).toFixed(2) + 'px'; } catch (e) {}
    var cap = x.measureText('H').actualBoundingBoxAscent || fs * 0.72;
    x.fillStyle = o.color || '#212121'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillText(String(txt).toUpperCase(), cx, cy + cap / 2);
    x.restore();
  };
})();
