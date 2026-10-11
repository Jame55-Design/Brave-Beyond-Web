(function w(){if(!window.barba||!barba.hooks)return setTimeout(w,100);
var PURPLE='rgb(174, 154, 228)',GREEN='#07A87E',DEF='#AE9AE4';
var VID='https://cdn.jsdelivr.net/gh/Jame55-Design/Brave-Beyond-Web@main/Brave_Hero_';
barba.hooks.before(function(d){var s=document.querySelector('.transition__shape'),c=d&&d.current&&d.current.container;if(!s||!c)return;s.style.color=getComputedStyle(c).backgroundColor===PURPLE?GREEN:DEF;});
barba.hooks.beforeEnter(function(d){var c=d&&d.next&&d.next.container;if(!c)return;c.querySelectorAll('video').forEach(function(v){
if(v.id==='bbAlphaVideo'&&!v.getAttribute('src')){var sf=/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);v.src=VID+(sf?'Safari.mov':'Chrome.webm');}
if(v.hasAttribute('autoplay')){v.muted=true;var p=v.play();p&&p.catch(function(){});}});});
barba.hooks.after(function(){document.dispatchEvent(new CustomEvent('IX2_PAGE_UPDATE'));[60,300,800].forEach(function(t){setTimeout(function(){window.dispatchEvent(new Event('scroll'));window.dispatchEvent(new Event('resize'));},t);});});
})();
