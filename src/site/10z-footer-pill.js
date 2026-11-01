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
