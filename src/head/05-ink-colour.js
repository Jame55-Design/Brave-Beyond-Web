// Brand ink: every black in the nav logo and footer embeds shows as #212121
// (the embeds have #000101 / #020202 written into them; CSS fill/colour wins over those).
(function () {
  var s = document.createElement('style');
  s.textContent =
    '.bb-nav-logo svg path,.bbnl-back path,.bbft-lm path{fill:#212121}' +
    '.bbft-bottom,.bbft-copy{color:#212121}' +
    '.bbft-ig{border-color:#212121;color:#212121}';
  document.head.appendChild(s);
})();
