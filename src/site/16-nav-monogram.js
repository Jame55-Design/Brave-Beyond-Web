// Nav monogram: the exported "bb" artwork had the right side of the second b squashed flat
// against the edge of its box. Rebuild that curve to match the favicon artwork and give it room.
(function () {
  var VB = '0 0 1216.81 725.64', NEW_VB = '0 0 1226 725.64';
  var FIXES = [
    ['M1204,274.75c-10.04-23.3-28.45-39.71-52.55-47.5', 'M1208.72,270.53c-9.68-23.36-33.17-35.49-57.27-43.28'],
    [',53.43-63.07,92.46-153.72,58.35-232.91Z', ',51.33-54.38,102.37-142.31,63.06-237.15Z']
  ];
  function fix() {
    document.querySelectorAll('svg[viewBox="' + VB + '"]').forEach(function (svg) {
      svg.querySelectorAll('path').forEach(function (p) {
        var d = p.getAttribute('d') || '', ok = 0;
        FIXES.forEach(function (f) { if (d.indexOf(f[0]) > -1) { d = d.replace(f[0], f[1]); ok++; } });
        if (ok === FIXES.length) p.setAttribute('d', d);
      });
      svg.setAttribute('viewBox', NEW_VB);
      svg.style.overflow = 'visible';
    });
  }
  fix();
  (function hook() {
    if (!window.barba || !barba.hooks) return setTimeout(hook, 100);
    barba.hooks.after(fix);
  })();
})();
