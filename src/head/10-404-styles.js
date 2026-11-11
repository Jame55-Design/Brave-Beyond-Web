// 404 page styles (the page itself is built by src/site/20-404.js).
// Ink page, cream text, pixel 404. Everything is scoped to the 404 page's Barba namespace, and the ink/cream
// versions of the site's two button types and the footer live here so no other page changes.
(function () {
  var N = '[data-barba-namespace="404"]', INK = '#212121', CREAM = '#F5F1EA';
  var s = document.createElement('style');
  s.textContent = (
    'html:has(~),body:has(~){background:I}' +
    '~{display:block!important;width:100%!important;max-width:none!important;height:auto!important;min-height:100vh;min-height:100svh;padding:0!important;background:I;color:C}' +
    '~.bb404-on .utility-page-content{display:none}' +
    '~ .utility-page-content,~ .utility-page-content *{color:C}' +
    // hero
    '~ .bb404-hero{min-height:100vh;min-height:100svh;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:96px 5vw 72px}' +
    '~ .bb404-num{display:block;width:min(74vw,720px);height:auto;margin:0 0 clamp(28px,5vw,56px);overflow:visible}' +
    '~ .bb404-num rect{fill:C;transition:fill 1.4s ease}' +
    '~ .bb404-num rect:hover{fill:#CCFF00;transition:none}' +
    '~ .bb404-base{fill:C;stroke:C;stroke-width:.03;animation:bb404-base .2s 1.5s both}' +
    '@keyframes bb404-base{from{opacity:0}to{opacity:1}}' +
    '~ .bb404-in rect{animation:bb404-in .45s steps(4,end) both}' +
    '@keyframes bb404-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}' +
    '~ .bb404-h{margin:0 0 14px;font-size:clamp(22px,3.2vw,40px);line-height:1.05;font-weight:500;letter-spacing:-.01em;text-transform:uppercase;color:C}' +
    '~ .bb404-p{margin:0 0 30px;max-width:30em;font-size:clamp(15px,1.4vw,18px);line-height:1.45;color:C}' +
    // outline squiggle button on ink: cream outline, cream squiggle fill, ink text
    '~ .bbarc-h,~ .bbarc-p{color:C}' +
    '~ .bbarc-btn{color:C;border-color:C;text-decoration:none}' +
    '~ .bbarc-ic-r path{fill:C}~ .bbarc-ic-l path{fill:I}' +
    '~ .sq-l path{stroke:C}' +
    '~ .sq-on,~ .sq-on *{color:I!important}' +
    '~ .sq-full{background-color:C!important}' +
    // solid game button on ink: cream pill, ink text; hover wipes it clear to a cream outline
    '~ .bbpb{background:C;border-color:C;color:I}' +
    '~ .bbpb[data-theme]{color:I}' +
    '~ .bbpb.is-clear{background:transparent;color:C}' +
    '~ .bbpb-sq path{stroke:I}' +
    '~ .bbpb-ic-r path{fill:I}~ .bbpb-ic-l path{fill:C}' +
    // footer
    '~ .bb-footer{background:I}' +
    '~ .bbft-lm path{fill:C}' +
    '~ .bb-footer .bbft-bottom,~ .bb-footer .bbft-copy,~ .bb-footer a{color:C}' +
    '~ .bb-footer .bbft-ig{border-color:C;color:C}' +
    '~ .bb-footer .bbft-ig.sq-on,~ .bb-footer .bbft-ig.sq-on *{color:I!important}' +
    '@media (prefers-reduced-motion:reduce){~ .bb404-in rect,~ .bb404-base{animation:none}~ .bb404-num rect{transition:none}}'
  ).replace(/~/g, N).replace(/\bI\b/g, INK).replace(/\bC\b/g, CREAM);
  document.head.appendChild(s);
})();
