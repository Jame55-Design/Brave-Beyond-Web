// Blog is parked until it moves to a proper CMS setup: hide every Blog link in the menus
// (main two-step nav and the older nav on About/Portfolio). The blog pages themselves stay up.
// To bring Blog back, delete this file and rebuild.
(function(){var s=document.createElement('style');s.textContent='.twostep-nav__ul a[href="/blog"],.navigation-menu a[href="/blog"],.w-nav-menu a[href="/blog"]{display:none!important}';document.head.appendChild(s);})();
