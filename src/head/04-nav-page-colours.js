(function(){var s=document.createElement('style'),G='#07A87E',P='#AE9AE4',A='[data-nav-status=active] ';
// Green-nav pages (home and services) share the same menu colours.
function green(H){return H+'~back-bg{background-color:G}'+H+A+'~back-bg{background-color:P}'+
H+A+'~visual{background-color:transparent}'+H+A+'~visual:hover{color:#CCFF00}'+
H+A+'~link:hover,'+H+A+'~eyebrow:hover{color:#66C9B0}';}
s.textContent=('~back-bg{transition:background-color .45s cubic-bezier(.625,.05,0,1)}'+
A+'~back-bg{background-color:G}'+
A+'~visual{background-color:transparent}'+A+'~visual:hover{color:#CCFF00}'+
A+'~link:hover,'+A+'~eyebrow:hover{color:P}'+
green('[data-barba-namespace=home] ')+green('[data-barba-namespace=services] ')).replace(/~/g,'.twostep-nav__').replace(/\bG\b/g,G).replace(/\bP\b/g,P);
document.head.appendChild(s);})();
