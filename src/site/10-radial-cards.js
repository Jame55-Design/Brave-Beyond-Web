(function(){function init(){document.querySelectorAll('[data-radial-cards-marquee-list]').forEach(function(l){if(l._rcm)return;l._rcm=1;var t=parseInt(getComputedStyle(l).getPropertyValue('--total'),10),o=[].slice.call(l.children);if(!t||!o.length)return;
while(l.children.length>t)l.lastElementChild.remove();for(var i=l.children.length;i<t;i++){var c=o[i%o.length].cloneNode(true);c.setAttribute('aria-hidden','true');l.appendChild(c)}
[].forEach.call(l.children,function(it,i){it.style.setProperty('--card',i+1)});
function u(){if(!l.isConnected){removeEventListener('scroll',u);removeEventListener('resize',u);return}var r=l.parentNode.getBoundingClientRect();l.style.animationPlayState=r.bottom>0&&r.top<innerHeight?'running':'paused'}
addEventListener('scroll',u,{passive:true});addEventListener('resize',u);u()})}
init();(function b(){if(!window.barba||!barba.hooks)return setTimeout(b,100);barba.hooks.after(init)})();})();
