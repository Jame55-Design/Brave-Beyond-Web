// Cookie consent banner + Google Analytics (Consent Mode v2). GA only loads after the visitor clicks Accept.
// Any element with the attribute data-cookie-settings reopens the banner (e.g. the footer "Cookie settings" link).
(function () {
  var GA_ID = 'G-GGV0NKKR7H';            // your Google Analytics Measurement ID
  var PRIVACY_URL = '/privacy-policy';   // link shown in the banner
  var KEY = 'bb_cookie_consent';         // where the visitor's choice is remembered
  var MAX_AGE_DAYS = 180;                // ask again after 6 months

  // Google Consent Mode v2: everything off until the visitor chooses
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', wait_for_update: 500
  });

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded || !GA_ID || GA_ID.indexOf('XXXX') > -1) return;
    gaLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date()); gtag('config', GA_ID);
  }
  function clearGA() {
    // remove Google Analytics cookies if someone withdraws consent
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0 || n === '_gid') {
        var host = location.hostname.replace(/^www\./, '');
        ['', '.' + host, location.hostname].forEach(function (d) {
          document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && Date.now() - v.t < MAX_AGE_DAYS * 864e5) return v;
    } catch (e) {}
    return null;
  }
  function save(analytics) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: analytics, t: Date.now() })); } catch (e) {}
    if (analytics) { loadGA(); }
    else { gtag('consent', 'update', { analytics_storage: 'denied' }); clearGA(); if (gaLoaded) location.reload(); }
  }

  var saved = read();
  if (saved && saved.analytics) loadGA();

  // z-index 99990 keeps the banner just under the custom cursor (.custom-cursor is 99999)
  var css = ''
    + '.bbcc{position:fixed;z-index:99990;left:16px;bottom:16px;width:min(400px,calc(100vw - 32px));background:#212121;color:#F5F1EA;'
    + 'border-radius:14px;padding:22px 22px 18px;font-family:"Space Grotesk",system-ui,sans-serif;font-size:14px;line-height:1.5;'
    + 'transform:translateY(16px);opacity:0;transition:transform .3s ease,opacity .3s ease}'
    + '.bbcc.is-in{transform:none;opacity:1}'
    + '.bbcc h2{margin:0 0 6px;font-family:"Bebas Neue",Impact,sans-serif;font-weight:400;font-size:28px;letter-spacing:.02em;line-height:1;color:#AE9AE4}'
    + '.bbcc p{margin:0 0 14px;color:#F5F1EA}'
    + '.bbcc a{color:#E9DBEC;text-decoration:underline;text-underline-offset:2px}'
    + '.bbcc-row{display:flex;gap:8px;flex-wrap:wrap}'
    + '.bbcc button{flex:1 1 0;min-width:110px;font:600 14px/1 "Space Grotesk",system-ui,sans-serif;padding:13px 14px;border-radius:999px;cursor:pointer;border:2px solid #AE9AE4;transition:background .15s,color .15s}'
    + '.bbcc .bbcc-yes{background:#AE9AE4;color:#212121}'
    + '.bbcc .bbcc-no{background:transparent;color:#F5F1EA}'
    + '.bbcc .bbcc-yes:hover{background:#E9DBEC;border-color:#E9DBEC}'
    + '.bbcc .bbcc-no:hover{background:#F5F1EA;color:#212121;border-color:#F5F1EA}'
    + '.bbcc-more{display:block;margin:12px 0 0!important;padding:0!important;background:none!important;border:0!important;color:#E9DBEC!important;font:500 13px/1.4 "Space Grotesk",system-ui,sans-serif!important;text-decoration:underline;text-underline-offset:2px;cursor:pointer;min-width:0!important;flex:none!important}'
    + '.bbcc-prefs{margin:0 0 14px;padding:12px 0 0;border-top:1px solid rgba(245,241,234,.15);display:grid;gap:10px}'
    + '.bbcc-prefs[hidden]{display:none}'
    + '.bbcc-opt{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}'
    + '.bbcc-opt b{display:block;font-weight:600}'
    + '.bbcc-opt small{display:block;color:rgba(245,241,234,.7);font-size:12.5px}'
    + '.bbcc-sw{position:relative;flex:none;width:44px;height:26px;margin-top:2px}'
    + '.bbcc-sw input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}'
    + '.bbcc-sw span{position:absolute;inset:0;border-radius:99px;background:rgba(245,241,234,.25);transition:background .15s;pointer-events:none}'
    + '.bbcc-sw span::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#F5F1EA;transition:transform .15s}'
    + '.bbcc-sw input:checked+span{background:#07A87E}'
    + '.bbcc-sw input:checked+span::after{transform:translateX(18px)}'
    + '.bbcc-sw input:disabled+span{opacity:.6}'
    + '.bbcc-sw input:focus-visible+span,.bbcc button:focus-visible{outline:2px solid #CCFF00;outline-offset:2px}'
    + '.bbcc-ck{position:absolute;top:10px;right:14px;width:52px;height:52px;pointer-events:none}'
    + '.bbcc h2{margin-bottom:14px!important}'
    + '.bbcc-ck svg{display:block;width:100%;height:100%;overflow:visible}'
    + '@media (max-width:480px){.bbcc{left:8px;right:8px;bottom:8px;width:auto}}'
    + '@media (prefers-reduced-motion:reduce){.bbcc{transition:none}}';

  var box;
  function open(showPrefs) {
    if (box) { box.remove(); box = null; }
    var current = read();
    box = document.createElement('div');
    box.className = 'bbcc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Cookie choices');
    box.innerHTML =
        '<h2>Cookies?</h2>'
      + '<p>We use Google Analytics to see which pages people visit, so we can make the site better. It only runs if you say yes. '
      + '<a href="' + PRIVACY_URL + '">Privacy policy</a></p>'
      + '<div class="bbcc-prefs"' + (showPrefs ? '' : ' hidden') + '>'
      +   '<div class="bbcc-opt"><div><b>Essential</b><small>Needed for the site to work. Always on.</small></div>'
      +   '<label class="bbcc-sw"><input type="checkbox" checked disabled aria-label="Essential cookies, always on"><span></span></label></div>'
      +   '<div class="bbcc-opt"><div><b>Analytics</b><small>Anonymous visit stats from Google Analytics.</small></div>'
      +   '<label class="bbcc-sw"><input type="checkbox" id="bbcc-analytics"' + (current && current.analytics ? ' checked' : '') + ' aria-label="Analytics cookies"><span></span></label></div>'
      + '</div>'
      + '<div class="bbcc-row">'
      +   '<button type="button" class="bbcc-no">Reject all</button>'
      +   '<button type="button" class="bbcc-yes">Accept all</button>'
      + '</div>'
      + '<button type="button" class="bbcc-more">' + (showPrefs ? 'Save my choices' : 'Choose which cookies') + '</button>';
    document.body.appendChild(box);
    cookie(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box && box.classList.add('is-in'); }); });

    var prefs = box.querySelector('.bbcc-prefs');
    var more = box.querySelector('.bbcc-more');
    box.querySelector('.bbcc-yes').onclick = function () { save(true); close(); };
    box.querySelector('.bbcc-no').onclick = function () { save(false); close(); };
    more.onclick = function () {
      if (prefs.hidden) { prefs.hidden = false; more.textContent = 'Save my choices'; }
      else { save(box.querySelector('#bbcc-analytics').checked); close(); }
    };
  }
  // A Purps cookie with ink chips in the banner's corner that gets eaten: four bites (each a scallop of three
  // teeth marks) with crumbs falling, then it pops back whole and starts again. Reduced motion: one bite, still.
  var ckN = 0;
  function cookie(box) {
    var id = 'bbcc-bite' + (++ckN), PURPS = '#AE9AE4', INK = '#212121';
    var chips = [[36, 35, 5.5], [60, 30, 4.5], [66, 55, 6], [41, 63, 5], [53, 46, 3.5], [27, 52, 4], [72, 38, 3], [55, 72, 3.5]];
    var html = '<svg viewBox="0 0 100 100"><defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160">'
      + '<rect x="-30" y="-30" width="160" height="160" fill="#fff"/>';
    // bite spots around the edge, in eating order
    var BITES = [-0.55, 0.75, 2.35, 3.6], bites = [];
    BITES.forEach(function (a, i) {
      var cx = 50 + 43 * Math.cos(a), cy = 50 + 43 * Math.sin(a), px = -Math.sin(a), py = Math.cos(a), ox = Math.cos(a) * 3, oy = Math.sin(a) * 3;
      bites.push({ x: 50 + 36 * Math.cos(a), y: 50 + 36 * Math.sin(a), a: a });
      html += '<g class="b" transform="translate(' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ') scale(0)">'
        + '<circle r="12.5" fill="#000"/>'   // three teeth marks side by side make the scalloped edge
        + '<circle cx="' + (px * 14 + ox).toFixed(1) + '" cy="' + (py * 14 + oy).toFixed(1) + '" r="10.5" fill="#000"/>'
        + '<circle cx="' + (-px * 14 + ox).toFixed(1) + '" cy="' + (-py * 14 + oy).toFixed(1) + '" r="10.5" fill="#000"/></g>';
    });
    html += '</mask></defs><g class="sh"><g mask="url(#' + id + ')"><circle cx="50" cy="50" r="40" fill="' + PURPS + '"/>';
    chips.forEach(function (c) { html += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + INK + '"/>'; });
    html += '</g></g><g class="cr"></g></svg>';
    var wrap = document.createElement('div');
    wrap.className = 'bbcc-ck'; wrap.setAttribute('aria-hidden', 'true'); wrap.innerHTML = html;
    box.appendChild(wrap);
    var svg = wrap.firstChild, bg = svg.querySelectorAll('.b'), sh = svg.querySelector('.sh'), cr = svg.querySelector('.cr');
    function setBite(i, k) { var b = bg[i]; b.setAttribute('transform', b.getAttribute('transform').replace(/scale\([^)]*\)/, 'scale(' + k.toFixed(3) + ')')); }
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { setBite(0, 1); return; }
    var T = [0.9, 2.2, 3.5, 4.8], LOOP = 6.6, GROW = 5.7, crumbs = [], t0 = performance.now(), last = t0, done = [];
    function back(x) { var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
    (function frame(now) {
      if (!wrap.isConnected) return;
      var t = ((now - t0) / 1000) % LOOP, dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      if (t < 0.05) done = [];
      var rot = 0, sc = 1;
      for (var i = 0; i < T.length; i++) {
        var u = t - T[i];
        setBite(i, t >= GROW ? 0 : u <= 0 ? 0 : Math.min(1, u / 0.09));
        if (u > 0 && t < GROW) {
          rot += 7 * Math.sin(u * 40) * Math.exp(-u * 9) * (i % 2 ? -1 : 1);   // the cookie jolts with each chomp
          if (!done[i]) {   // crumbs fly off the bite and tumble down
            done[i] = 1;
            for (var k = 0; k < 6; k++) {
              var a = bites[i].a + (Math.random() - 0.5) * 1.6, v = 25 + Math.random() * 35;
              var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              el.setAttribute('r', (1.8 + Math.random() * 2).toFixed(1)); el.setAttribute('fill', k % 3 ? PURPS : '#E9DBEC');
              cr.appendChild(el);
              crumbs.push({ el: el, x: bites[i].x + 6 * Math.cos(bites[i].a), y: bites[i].y + 6 * Math.sin(bites[i].a), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0 });
            }
          }
        }
      }
      if (t >= GROW) { var g = (t - GROW) / 0.45; sc = g >= 1 ? 1 : Math.max(0, back(g)); }   // pops back whole
      sh.setAttribute('transform', 'translate(50 50) rotate(' + rot.toFixed(2) + ') scale(' + sc.toFixed(3) + ') translate(-50 -50)');
      for (var j = crumbs.length - 1; j >= 0; j--) {
        var c = crumbs[j]; c.life += dt; c.vy += 180 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
        c.el.setAttribute('cx', c.x.toFixed(1)); c.el.setAttribute('cy', c.y.toFixed(1));
        c.el.setAttribute('opacity', Math.max(0, 1 - c.life / 0.8).toFixed(2));
        if (c.life > 0.8) { c.el.remove(); crumbs.splice(j, 1); }
      }
      requestAnimationFrame(frame);
    })(t0);
  }

  function close() {
    if (!box) return;
    var b = box; box = null;
    b.classList.remove('is-in');
    setTimeout(function () { b.remove(); }, 300);
  }


  // Footer: add a "Cookie settings" pill next to every Privacy Policy pill (works after Barba page swaps too)
  function addFooterLinks() {
    document.querySelectorAll('a.bb-tag[href$="privacy-policy"]:not([data-bbcc-done])').forEach(function (a) {
      if (a.closest('.bbcc')) return;
      a.setAttribute('data-bbcc-done', '');
      var cs = getComputedStyle(a);
      var w = document.createElement('div');
      w.className = 'bbcc-links';
      w.style.cssText = 'display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap;'
        + 'order:' + cs.order + ';margin:' + cs.margin + ';align-self:' + cs.alignSelf;
      a.parentNode.insertBefore(w, a);
      w.appendChild(a);
      a.style.margin = '0';
      var c = a.cloneNode(true);
      c.setAttribute('href', '#');
      c.setAttribute('data-cookie-settings', '');
      c.removeAttribute('data-bbcc-done');
      c.removeAttribute('id');
      c.querySelectorAll('.bb-tag-label').forEach(function (l) { l.textContent = 'Cookie Settings'; });
      w.appendChild(c);
    });
  }

  function boot() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    if (!read()) open(false);
    addFooterLinks();
    var queued = false;
    new MutationObserver(function () {
      if (queued) return; queued = true;
      requestAnimationFrame(function () { queued = false; addFooterLinks(); });
    }).observe(document.body, { childList: true, subtree: true });
    // Any link or button with the attribute data-cookie-settings reopens the banner (e.g. a footer link)
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); open(true); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
