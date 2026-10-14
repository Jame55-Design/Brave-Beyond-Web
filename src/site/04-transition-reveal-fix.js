(function w(){if(!window.barba||!barba.hooks)return setTimeout(w,100);
var PURPLE='rgb(174, 154, 228)',GREEN='#07A87E',DEF='#AE9AE4';
var VID='https://cdn.jsdelivr.net/gh/Jame55-Design/Brave-Beyond-Web@main/Brave_Hero_';
/* Every browser on iPhone/iPad (Chrome "CriOS", Firefox "FxiOS", etc.) runs on Safari's engine and can't play the .webm, so they all get the .mov */
var UA=navigator.userAgent,IOS=/iP(hone|ad|od)/.test(UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var MOV=IOS||/^((?!chrome|android|crios|fxios).)*safari/i.test(UA);
function heroSrc(){return VID+(MOV?'Safari.mov':'Chrome.webm');}
/* First page load: the hero embed may already have set the .webm; swap it for the .mov where needed */
(function(){var v=document.getElementById('bbAlphaVideo');if(!v||!MOV)return;var s=v.getAttribute('src')||'';if(s.indexOf('Safari.mov')>-1)return;v.src=heroSrc();v.muted=true;v.load();var p=v.play();p&&p.catch(function(){});})();
barba.hooks.before(function(d){var s=document.querySelector('.transition__shape'),c=d&&d.current&&d.current.container;if(!s||!c)return;s.style.color=getComputedStyle(c).backgroundColor===PURPLE?GREEN:DEF;});
barba.hooks.beforeEnter(function(d){var c=d&&d.next&&d.next.container;if(!c)return;c.querySelectorAll('video').forEach(function(v){
if(v.id==='bbAlphaVideo'&&!v.getAttribute('src')){v.src=heroSrc();}
if(v.hasAttribute('autoplay')){v.muted=true;var p=v.play();p&&p.catch(function(){});}});});
barba.hooks.after(function(){document.dispatchEvent(new CustomEvent('IX2_PAGE_UPDATE'));[60,300,800].forEach(function(t){setTimeout(function(){window.dispatchEvent(new Event('scroll'));window.dispatchEvent(new Event('resize'));},t);});});
})();
