// Stop the page sliding sideways on phones when something (tilted cards, bounce
// stretch, wide headings) pokes past the screen edge. "clip" (not "hidden") keeps
// position: sticky working.
(function(){var s=document.createElement('style');s.textContent='html,body{overflow-x:clip;max-width:100%}';document.head.appendChild(s);})();
