(function(){var V='https://cdn.jsdelivr.net/npm/gsap@3.15/dist/',live=[];
function load(n,cb){if(window[n])return cb();var s=document.createElement('script');s.src=V+n+'.min.js';s.onload=cb;document.head.appendChild(s);}
function kill(){live.forEach(function(x){x.revert();});live=[];}
function init(){kill();document.querySelectorAll('[data-gradient-wave-text]').forEach(function(h){
var A=function(n,d){return h.getAttribute('data-gradient-wave-'+n)||d;};
var st=A('scroll-start','top 90%'),en=A('scroll-end','center 40%'),c0=A('color-start','rgba(24,24,24,0.2)'),cw=A('color-wave','#E8CAE9'),dur=parseFloat(A('duration'))||0.4,scr=parseFloat(A('scrub'))||0.1,c1=getComputedStyle(h).color;
live.push(new SplitText(h,{type:'words, chars',autoSplit:true,onSplit:function(self){var ch=self.chars,on=new Set(),p={v:0},ready=false;
function sync(){var n=Math.round(p.v*ch.length);ch.forEach(function(c,i){var a=i<n;gsap.killTweensOf(c);gsap.set(c,{color:a?c1:c0});a?on.add(c):on.delete(c);});}
return gsap.context(function(){gsap.set(ch,{color:c0});gsap.to(p,{v:1,ease:'none',scrollTrigger:{trigger:h,start:st,end:en,scrub:scr,onRefresh:function(){ready=false;sync();requestAnimationFrame(function(){ready=true;});}},
onUpdate:function(){if(!ready)return;var n=Math.round(p.v*ch.length);ch.forEach(function(c,i){var a=i<n;
if(a&&!on.has(c)){on.add(c);gsap.killTweensOf(c);gsap.timeline().to(c,{color:cw,duration:dur*.3,ease:'power2.out'}).to(c,{color:c1,duration:dur*.7,ease:'power2.in'});}
if(!a&&on.has(c)){on.delete(c);gsap.killTweensOf(c);gsap.to(c,{color:c0,duration:dur*.5,ease:'none'});}});}});},h);}}));});
ScrollTrigger.refresh();}
(function w(){if(!window.gsap)return setTimeout(w,50);load('ScrollTrigger',function(){load('SplitText',function(){gsap.registerPlugin(ScrollTrigger,SplitText);
(document.fonts?document.fonts.ready:Promise.resolve()).then(init);
(function b(){if(!window.barba||!barba.hooks)return setTimeout(b,100);barba.hooks.after(function(){init();});})();});});})();})();
