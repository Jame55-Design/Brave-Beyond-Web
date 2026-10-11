(function(){
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var C=['#66C9B0','#E8CAE9'],P='M12 21s-7.5-4.6-9.6-9.3C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.7 0 5.7 3.9 4.2 7.2C19.5 16.4 12 21 12 21z';
var L=null,H=[],raf=0,last=0;
function layer(){if(!L||!L.isConnected){L=document.createElement('div');L.setAttribute('aria-hidden','true');L.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:500;overflow:hidden';document.body.appendChild(L);}return L;}
function spawn(x,y){var s=14+Math.random()*16,e=document.createElement('div');e.innerHTML='<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'"><path fill="'+C[Math.random()<.5?0:1]+'" d="'+P+'"/></svg>';e.style.cssText='position:absolute;left:0;top:0;will-change:transform,opacity';layer().appendChild(e);
H.push({e:e,x:x-s/2,y:y-s/2,vx:(Math.random()-.5)*7,vy:-(4+Math.random()*5),r:(Math.random()-.5)*40,vr:(Math.random()-.5)*8,t:0,life:70+Math.random()*30,fy:y+40+Math.random()*60,b:0});if(!raf)raf=requestAnimationFrame(step);}
function step(){for(var i=H.length-1;i>=0;i--){var h=H[i];h.t++;h.vy+=.32;h.x+=h.vx;h.y+=h.vy;h.r+=h.vr;
if(h.y>h.fy&&h.vy>0&&h.b<2){h.vy*=-.55;h.vx*=.8;h.b++;}
var k=h.t/h.life,sc=h.t<8?.4+.6*h.t/8:1,o=k>.65?1-(k-.65)/.35:1;
h.e.style.transform='translate('+h.x+'px,'+h.y+'px) rotate('+h.r+'deg) scale('+sc+')';h.e.style.opacity=o;
if(h.t>=h.life){h.e.remove();H.splice(i,1);}}
raf=H.length?requestAnimationFrame(step):0;}
document.addEventListener('mousemove',function(ev){var t=ev.target;if(!t.closest||!t.closest('.bbft-lm'))return;var n=performance.now();if(n-last<45)return;last=n;spawn(ev.clientX,ev.clientY);if(Math.random()<.4)spawn(ev.clientX,ev.clientY);},{passive:true});
document.addEventListener('touchstart',function(ev){var t=ev.target;if(!t.closest||!t.closest('.bbft-lm'))return;var p=ev.touches[0];for(var i=0;i<8;i++)spawn(p.clientX,p.clientY);},{passive:true});
})();
