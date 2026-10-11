(function(){
if(matchMedia('(hover: none) and (pointer: coarse)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var S='[data-elastic-pulse-btn],.button,.button-2,.bbft-ig';
document.addEventListener('mouseover',function(e){
var b=e.target.closest&&e.target.closest(S);if(!b||b.contains(e.relatedTarget)||b._pl)return;
var g=window.gsap;if(!g)return;
b._pl=1;setTimeout(function(){b._pl=0;},500);
var el=b.querySelector('[data-elastic-pulse-target]')||b;
var w=el.offsetWidth,h=el.offsetHeight,fs=parseFloat(getComputedStyle(el).fontSize)||14;
var st=Math.min(0.75*fs,0.15*w); // stretch: 0.75 x font size, capped at 15% of the width
if(el._pt)el._pt.kill();
el._pt=g.timeline().to(el,{scaleX:(w+st)/w,scaleY:(h-st*0.33)/h,duration:0.1,ease:'power1.out'}).to(el,{scaleX:1,scaleY:1,duration:1,ease:'elastic.out(1, 0.3)'});
});
})();
