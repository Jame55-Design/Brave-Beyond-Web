// Scroll states for the Services "How it works" timeline.
// Base styles live on the step-timeline classes in Webflow; these are the
// attribute-driven states set by src/site/13-step-timeline.js.
(function(){var s=document.createElement('style');s.textContent=
'[data-step-timeline-item][data-status=active] [data-step-timeline-marker]{background-color:#AE9AE4;color:#212121;border-color:#AE9AE4}'+
'[data-step-timeline-item][data-current] [data-step-timeline-marker]{box-shadow:0 0 0 .5em rgba(174,154,228,.35)}'+
'[data-step-timeline-item][data-status=active] .step-timeline__content{opacity:.5}'+
'[data-step-timeline-item][data-current] .step-timeline__content{opacity:1}';
document.head.appendChild(s);})();
