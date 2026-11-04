// BB Footer Backpack: ride a Brave Beyond backpack on a skateboard along the footer. Catch good design (+10, golden
// spiral +25, headphones +40), dodge the glitching bad design (-15). 45s rounds. Green and purple colour sets: on the
// Purps footer every Purps part goes Main Green, and the pencil swaps to the green one.
// Artwork: the bag + board are James's master SVG (BAG_SVG); the wheels are redrawn so they roll and turn lime on a
// catch. Pencils are James's Brave_Pencil_Happy SVGs. Caught things poke out along the bag's domed top.
// Buttons: Play / Play again via BBPILL.place (10z-footer-pill.js). Instructions and results are plain text.
// Registered on the footer arcade (18-footer-arcade.js); no page default yet.
// Test: BBBP.update(BBBP.g, 1/60); BBBP.draw(BBBP.g).
(function () {
  var BP = window.BBBP = window.BBBP || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbbp-on{padding-top:4vw}' +
    '.bb-footer.bbbp-on .bbft-lm{display:none}' +
    '.bbbp-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbbp-stage canvas{display:block;width:100%;touch-action:pan-y}' +
    '.bb-footer.bbbp-on .bbft-ig{order:1;margin:2vw 0 0}' +
    // the site's custom cursor stays visible over the game so you can see where you're steering
    '@media (max-width:479px){.bb-footer.bbbp-on{padding-top:24px}.bb-footer.bbbp-on .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);
  // Comic Sans for the bad "Comic Sans" item; Comic Neue stands in where it isn't installed (phones)
  if (!document.getElementById('bbbp-comic')) {
    var l = document.createElement('link'); l.id = 'bbbp-comic'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap'; document.head.appendChild(l);
  }

  BP.ROUND = 45;
  BP.BAG_SVG = `<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 640 550" width="640" height="550">
  <defs>
    <style>
      .st0 {
        fill: #e9dbec;
      }

      .st0, .st1, .st2, .st3, .st4, .st5, .st6 {
        stroke-linecap: round;
      }

      .st0, .st2, .st3, .st4, .st5 {
        stroke: #212121;
      }

      .st0, .st4, .st5 {
        stroke-linejoin: round;
        stroke-width: 13.2px;
      }

      .st1 {
        stroke: #f3e9d2;
        stroke-width: 10.6px;
      }

      .st1, .st2, .st3, .st6 {
        fill: none;
        stroke-miterlimit: 8;
      }

      .st7 {
        fill: #212121;
      }

      .st8, .st5 {
        fill: #ae9ae4;
      }

      .st2 {
        stroke-width: 9.2px;
      }

      .st3 {
        stroke-width: 18px;
      }

      .st4 {
        fill: #66c9b0;
      }

      .st6 {
        stroke: #e9dbec;
        stroke-width: 7.8px;
      }
    </style>
  </defs>
  <g id="grab-loop">
    <path class="st3" d="M276.8,58.2c0-23.9,19.3-43.2,43.2-43.2s43.2,19.3,43.2,43.2"/>
  </g>
  <g id="bottle">
    <rect class="st7" x="502.1" y="101.4" width="40.3" height="43.2" rx="7.2" ry="7.2"/>
    <path class="st4" d="M515.1,137.4h14.4c15.9,0,28.8,12.9,28.8,28.8h0v218.6c0,7.2-5.8,13-13,13h-46.1c-7.2,0-13-5.8-13-13v-218.6c0-15.9,12.9-28.8,28.8-28.8h0Z"/>
    <line class="st1" x1="538.1" y1="184.3" x2="538.1" y2="246.8"/>
  </g>
  <g id="bottle-pocket">
    <path class="st0" d="M475.2,288.4h82.1c4,0,7.2,3.2,7.2,7.2h0v80.6c0,11.9-9.7,21.6-21.6,21.6h-53.3c-11.9,0-21.6-9.7-21.6-21.6v-80.6c0-4,3.2-7.2,7.2-7.2Z"/>
    <line class="st2" x1="486.7" y1="312.5" x2="563.9" y2="312.5"/>
  </g>
  <g id="bag-body">
    <path class="st5" d="M284,51h72c79.5,0,144,64.5,144,144v180c0,19.9-16.1,36-36,36H176c-19.9,0-36-16.1-36-36v-180c0-79.5,64.5-144,144-144Z"/>
  </g>
  <g id="front-pocket">
    <rect class="st0" x="186.8" y="216.6" width="266.4" height="158.4" rx="36" ry="36"/>
    <g id="logo">
      <path class="st7" d="M410.6,269.3c0-.2-.2-.3-.2-.5-1.2-2.1-4.4-3-6.7-3.3-10.5-1.4-19.3,5.7-26.4,12.5,0,0-.2,0-.1,0,1.1-2,2.4-3.7,3.3-5.7.5-1.3,1-2.6.9-4,0-1.7-1.3-2.9-3-2.9-3.1,0-6.1,2.8-8.2,5.2-2.4,2.7-4.6,5.6-6.7,8.6l-5.4,7.9c-.2.2-.2.1-.1-.1l3.7-8.5,2.2-5.7c.4-1.1.6-2.4.5-3.6,0-1.9-1.5-3.2-3.4-3.4-3.6-.3-6.6,2.6-8.7,5.4l-5.7,7.5s-.1,0-.1,0c.1-.6.6-2.1.6-2.1,1-3.3.5-6.8-2.6-8.5-1.6-.9-3.4-1.2-5.2-1.1-6,.2-11.9,3.6-15.9,7.9-3,3.2-2.9,3.1-4.3,4.6,1.4-2.4,3.6-5.2,4.1-7.9,1.6-8.7-11.5-3.6-14.5-1l-2.9,2.8s0,0,0,0c.3-1,.7-1.8.7-2.7.1-1.6-.9-2.9-2.5-3.2-5.2-.7-10.4,5.2-13.5,9.2.1-1.6-.1-3.2-.8-4.7-.6-1.4-1.7-2.4-3.2-2.9-2.6-.8-5.5-.2-8,.8-2.1.9-3.9,2.2-5.6,3.6l3-4.5c1.1-1.6,2-3.1,3-4.7.6-.9,1-1.9,1.4-2.9.8-2.2.6-4.8-1.7-5.8-3.2-1.4-7.5.9-10.1,2.9-1.9,1.4-3.6,2.9-5.2,4.6-2.5,2.7-5.3,6-7,9.3-.2.4-.3.7-.2,1.1,0,.6.5,1.1,1.2,1,1.2-.1,2.7-1.3,3.8-2,0,0,0,0,0,0l-2,2.8-3.1,4.6c-1.3,2-2.4,4-3.4,6.1-.6,1.3-1,2.6-1.3,4-.4,2.3.3,4.5,1.9,6.2,2.1,2.2,5.5,2.7,8.5,2.5,1.7-.1,3.3-.4,4.9-.9,5.2-1.4,10.4-4.1,14.8-7.4-1,2.3-1.6,4.9-.2,6.9.8,1.1,2.2,1.6,3.6,1.7,4.1.1,7.6-3,10.2-6l5.1-5.6c1.9-2.1,6-5.4,7-6.3,0,0,.2,0,.1.1-.6,1.6-1.3,2.8-1.4,4.3-.1,2.1,1.3,3.7,3.4,3.8,1.6,0,3-.5,4.4-1.3,0,0,0,0,0,0-1.1,2-1.9,3.9-1.9,6,0,2.5,1.3,4.6,3.6,5.4,3.7,1.3,8.2-.5,11.3-2.9,1.5-1.2,2.9-2.6,4.1-4.1,0,0,.3-.5.4-.4.2,0-.2,1.2-.2,1.4-.4,1.5-.4,3.3.9,4.4,2.3,2,6.1.7,8.6-1.2,1.7-1.3,3.2-2.9,4.6-4.6l3.9-4.8c0-.1.2,0,.2.1-.5,1.9-1.1,3.5-1,5.4,0,2,.9,4,2.6,5.1,2.8,1.8,6.8.4,9.7-1.3,2.2-1.3,4.3-2.7,6.3-4.3,2.7-2.3,5.4-4.6,8.2-6.8-.6.5-.8,1.4-1.1,2.1-1.4,3-2,6.9,1.1,9,3,2.1,7,2.4,10.5,2.4,7.7.2,15.7-2.8,20.8-8.7,1.7-1.9,1.4-4.2-1-5.4-.9-.5-2-.4-3.1,0-1.1.3-2.2.9-3.1,1.3-1.3.5-2.6,1-3.9,1.6-1.9.9-7.8,2.5-9,1.6-.4-.4.6-1.1,1.9-1.5,4.9-1.5,9.6-3.5,13.9-6.3,3-1.9,6.5-4.3,8.1-7.6.7-1.4.9-3,.4-4.4h0ZM276.7,281.5c-1.7,2.5-3.9,4.7-6.5,6.3-.8.5-1.9,1.1-2.8,1.1-.8,0-.5-1.2-.2-2,1.2-2.7,3.6-5.4,5.9-7.2,1.1-.9,2.9-2,4.2-2.1.4,0,.7.3.7.6,0,1.1-.7,2.4-1.3,3.3h0ZM336.3,274.8c-2.2,3.7-5,6.9-8,9.8-.8.8-1.6,1.4-2.5,1.9-.1,0-.3,0-.2-.2.3-1.3.9-2.3,1.5-3.5,2.1-3.4,5-6.6,9-8.3.2,0,.3.1.2.3ZM397.5,275c-1.2,1.3-2.6,2.4-4,3.4-.5.4-1.1.7-1.7,1-.6.4-1.5.9-2.3,1,0-.6.7-1.2,1.1-1.6.4-.5.8-.9,1.3-1.4,1-1,2.1-1.9,3.2-2.7.6-.4,1.1-.8,1.8-1.1.5-.3,1-.6,1.6-.6.1,0,.2,0,.3,0,.5.3-1,1.7-1.2,1.9h0Z"/>
      <path class="st7" d="M420.9,292.7s0,0,0,0c-.7-1.8-2.3-2.3-4.1-1.7-2.1.8-4,2.2-5.8,3.6-2,1.6-3.8,3.4-5.6,5.3-1.6,1.6-3.1,3.5-4.9,4.9-.1,0-.3,0-.4-.1-.1-.3-.3-.8-.3-.9-.2-.4-.4-.8-.7-1.1-.6-.7-1.4-1.1-2.3-1.4-5.3-1.2-10.4,3.4-13.9,6.8-2.3,2.3-3.9,5.1-6.2,7.3-.3.2-.7,0-.5-.4l2.6-5.5c.5-1.1.8-2.3.8-3.5,0-.2,0-.3,0-.5,0-1.8-1.1-3.1-2.8-3.6-3.5-.9-7.7,1.3-10.4,3.7-1.4,1.2-4.1,5.3-5.2,6.5-.2.3-.7,0-.5-.3l1-2.7c.5-1.1.5-2.5,0-3.7-.6-1.5-2.3-2.2-3.9-2.1-5.4.3-10,6-14.3,8.7-.3.2-.6.3-.9.2-.5-.2-.5-.9-.4-1.4.5-2.1,1.2-4.3.8-6.4-.9-4.6-7-4.5-10.6-3.7-4.5,1-8.8,3.6-12,7l-4,4.4c-.1.1-.3,0-.2-.2l2-3.8c.7-1.3,1-2.8,1-4.3,0-2.2-1.6-3.6-3.8-3.5-3.3.2-6.6,3-9.1,5.3l-6.3,5.9c-.4.3-.7.6-1.1.9-.4.3-.9-.2-.6-.6,1.6-2.4,3.2-5,3.3-7.7.1-1.9-1.1-3.3-2.9-3.6-7.2-1.1-11.2,6.8-15.2,11.1-5.1,5.4-11.5,9.4-18.6,11.6-1.2.4-2.6.6-3.4-.3,1-1,2.5-1.4,3.9-1.9,4.1-1.4,7.9-3.5,11.3-6.1,2.4-1.9,4.6-4.1,5.7-7,1.1-3,0-5.9-3-7.1-7.8-3.1-16.3,2.5-21.4,8.9,0-1-.3-1.9-.7-2.9-.6-1.4-1.7-2.4-3.2-2.9-2.6-.8-5.5-.2-8,.9-2.1.9-3.9,2.2-5.6,3.6l3-4.5c1.1-1.6,2-3.1,3-4.7.6-.9,1-1.9,1.4-2.9.8-2.2.6-4.8-1.7-5.8-3.2-1.4-7.5.9-10.1,2.9-1.9,1.4-3.6,2.9-5.2,4.6-2.5,2.7-5.3,6-7,9.3-.2.4-.3.7-.2,1.1,0,.6.5,1.1,1.2,1,1.2-.1,2.7-1.3,3.8-2,0,0,0,0,0,0l-2,2.8-3.1,4.6c-1.3,2-2.4,4-3.4,6.1-.6,1.3-1,2.6-1.3,4-.4,2.3.3,4.5,1.9,6.2,2.1,2.2,5.5,2.7,8.5,2.5,1.7-.1,3.3-.4,4.9-.9,6.2-1.7,12.6-5.2,17.4-9.6-1,4.1-1,8.3,1.9,9.7,4.1,1.9,9.8.8,14.1-.7,5.3-1.8,10-4.5,14.5-7.8l4.4-3.5c.2-.1.4-.1.6,0,1.8,1.9,5.3,1.4,7.9.5,0,0,0,0,0,0,.5-.2.8.6.4.8-2.6,1.3-5.5,2.1-8.4,2.4-3.6.3-7.1,1.5-9.1,4.5-.9,1.3-1.2,3-.4,4.5.7,1.5,2.2,2.3,3.9,2.6,5.6,1.1,11.2-.6,16.3-3.2,4-2,7.4-4.6,10.5-7.8l2.7-2.9c0,0,.2,0,.2,0-.2.8-.6,2.8-.6,3.9-.2,2.8,1.3,5.2,3.8,6.4,3.9,1.8,8.8.8,12.9-.8,3.8-1.6,7.2-3.8,10.3-6.5,0,0,0,0,0,0l4.9-4.9c.1-.1.2-.2.3-.3.4-.4,1,0,.7.5-1.6,2.8-4.6,7.4-3.2,10.8.6,1.5,2.1,2.4,3.7,2.5,3.6.1,7-1.2,9.8-3.4,3.1-2.4,5-5.9,7.5-8.9.4-.5.8-1,1.3-1.4.1-.1.3,0,.2.2-.8,1.8-1.7,3.5-2.5,5.2-.7,1.6-1.7,3.7-1.4,5.5,0,.4.1.7.3,1,.4.7,1.2,1.1,2,1.3,1,.2,2.1.3,3.1.2,2.9-.1,5.4-1.6,7.6-3.3,1-.8,2-1.8,3-2.8.5-.5,1-1,1.6-1.4.2-.1.7-.5.8-.2,0,0,0,.2,0,.3-.2,1-.5,2.1-.4,3.2.2,2,1.5,3.5,3.4,4.1,1.6.5,3.3.4,4.9-.1,1.3-.4,2.5-1,3.7-1.7.6-.3,1.2-.7,1.7-1.1.5-.3,1.1-1,1.8-.9.5,0,.6,2.1.7,2.4.8,3.3,4.8.4,6.4-.6,3.2-2.1,6-4.9,8.2-8,.4-.5.7-1.1,1.1-1.6.2-.3.3-.6.5-.9,0-.1.4-.5.4-.7.3-.6.7-1.3.6-2,0-.6-.6-1-1.2-.9-1.2.2-2.7,1.3-3.8,2,0,0,0,0,0,0,2.3-2.7,4.2-5.8,6.4-8.7,3.2-4.4,7.6-8.1,9.5-13.3.6-1.5.9-3.3.3-4.9h0ZM264.8,314.6c1.7-2.2,3.9-4.1,6.2-5.6,0,0,.1,0,.2-.1.7-.4,1.4.4.9,1-.2.2-.4.5-.6.7-.5.5-1,1-1.6,1.5-1,.9-2,1.8-3.2,2.5-.4.3-.8.5-1.2.7-.5.3-1-.3-.6-.8ZM244.3,316.9c-1.7,2.5-3.9,4.7-6.5,6.3-.8.5-1.9,1.1-2.8,1.1-.8,0-.5-1.2-.2-2,1.2-2.7,3.6-5.4,5.9-7.2,1.1-.9,2.9-2,4.2-2.1.4,0,.7.3.7.6,0,1.1-.7,2.4-1.3,3.3h0ZM330.9,312.1c0,.1,0,.2,0,.2-1.5,2.8-3.4,5.4-5.7,7.6-.5.4-.9.8-1.4,1.2-.2.2-1.3,1-1.6.7-.3-.2.2-1.2.3-1.4,1.5-2.9,3.8-5.6,6.3-7.7.6-.5,1.2-1.2,2-1.4.4-.1.3.4.2.8ZM395.6,313.3c-.9,2.3-2.1,4.4-3.6,6.4-.5.6-.9,1.2-1.4,1.7-.9,1-2.6,2.4-3,1.9-.1-.2-.1-.5,0-.8.2-.9.8-2.1,1.2-2.9,1.3-2.5,2.9-4.7,5-6.6.5-.4.9-.7,1.5-1,.3-.2.7,0,.6.4,0,.3,0,.6-.2.9h0Z"/>
    </g>
  </g>
  <g id="skateboard">
    <path id="deck" class="st7" d="M42.8,389.8c-1.9-.7-4.2-.5-6.2,0-2.6.8-4.9,2.6-6.4,4.9-2.4,3.7-2.5,8.4-.3,12.1,13.5,22.8,34.2,34.1,62,34.1h456c29.7,0,51.3-13,64.7-38.9,3.5-6.8-2.2-14.5-9.6-13.7s-1.7.3-2.5.6c-3.5,1.2-6,3.8-8.4,6.5s-3.7,3.9-5.9,5.5c-4.7,3.5-10.3,5.9-16,7.4s-14.3,2.5-21.5,2.6-.6,0-.9,0H92c-6.9,0-13.9-.2-20.7-1.3-5.2-.9-10.3-2.3-14.7-5.2s-3.9-2.9-5.5-4.7-1.6-1.9-2.4-3c-1.3-1.8-2.1-4.1-3.6-5.7-.6-.6-1.4-1.1-2.2-1.4Z"/>
    <rect class="st7" x="116" y="441" width="60" height="21"/>
    <rect class="st7" x="464" y="441" width="60" height="21"/>
    <g>
      <path class="st7" d="M144,462.1c23.1-1.2,42.2,17.8,41,41s-17.1,35.9-36.9,36.9c-23.1,1.2-42.2-17.8-41-41,1-19.8,17.1-35.9,36.9-36.9Z"/>
      <g>
        <line class="st6" x1="168.3" y1="510.4" x2="123.7" y2="491.6"/>
        <line class="st6" x1="136.6" y1="523.3" x2="155.4" y2="478.7"/>
      </g>
      <circle class="st8" cx="146" cy="501" r="10.9"/>
    </g>
    <g>
      <path class="st7" d="M492,462.1c23.1-1.2,42.2,17.8,41,41-1,19.8-17.1,35.9-36.9,36.9-23.1,1.2-42.2-17.8-41-41,1-19.8,17.1-35.9,36.9-36.9Z"/>
      <g>
        <line class="st6" x1="516.3" y1="510.4" x2="471.7" y2="491.6"/>
        <line class="st6" x1="484.6" y1="523.3" x2="503.4" y2="478.7"/>
      </g>
      <circle class="st8" cx="494" cy="501" r="10.9"/>
    </g>
  </g>
</svg>`;
  BP.PENCIL_SVG = { purple: `<svg width="117" height="1062" viewBox="0 0 117 1062" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M116 930.56V69.8496H0V930.56C0 936.09 1.15 941.56 3.37 946.63L52.01 1057.57C54.3 1062.8 61.71 1062.8 64 1057.57L112.64 946.63C114.86 941.56 116.01 936.09 116.01 930.56H116Z" fill="#212121"/>
<path d="M36.4583 135.25H12.2383V933.86H36.4583V135.25Z" fill="#AE9AE4"/>
<path d="M70.1067 135.25H45.8867V933.86H70.1067V135.25Z" fill="#D0C6E9"/>
<path d="M103.759 135.25H79.5391V933.86H103.759V135.25Z" fill="#AE9AE4"/>
<path d="M4 65.85V26.08C4 13.9 13.9 4 26.08 4H89.92C102.09 4 112 13.9 112 26.08V65.85H4Z" fill="#AE9AE4"/>
<path d="M89.92 8C99.89 8 108 16.11 108 26.08V61.85H8V26.08C8 16.11 16.11 8 26.08 8H89.92ZM89.92 0H26.08C11.68 0 0 11.68 0 26.08V69.85H116V26.08C116 11.68 104.32 0 89.92 0Z" fill="#231F20"/>
<path d="M59.9217 1052.19L66.7717 1036.56C67.0217 1035.98 66.6017 1035.34 65.9717 1035.34H50.0217C49.3917 1035.34 48.9717 1035.99 49.2217 1036.56L56.0717 1052.19C56.8017 1053.86 59.1817 1053.86 59.9117 1052.19H59.9217Z" fill="#D0C6E9"/>
<path d="M32.6602 37.3903C34.317 37.3903 35.6602 35.192 35.6602 32.4803C35.6602 29.7686 34.317 27.5703 32.6602 27.5703C31.0033 27.5703 29.6602 29.7686 29.6602 32.4803C29.6602 35.192 31.0033 37.3903 32.6602 37.3903Z" fill="#212121"/>
<path d="M83.3398 37.3903C84.9967 37.3903 86.3398 35.192 86.3398 32.4803C86.3398 29.7686 84.9967 27.5703 83.3398 27.5703C81.683 27.5703 80.3398 29.7686 80.3398 32.4803C80.3398 35.192 81.683 37.3903 83.3398 37.3903Z" fill="#212121"/>
<path d="M57.9982 47.0706C52.0182 47.0706 46.7682 44.0106 44.6282 39.2606C44.1682 38.2506 44.6282 37.0706 45.6282 36.6106C46.6382 36.1506 47.8182 36.6106 48.2782 37.6106C49.7582 40.8706 53.6582 43.0706 58.0082 43.0706C62.3582 43.0706 66.2582 40.8806 67.7382 37.6106C68.1982 36.6006 69.3782 36.1606 70.3882 36.6106C71.3982 37.0706 71.8382 38.2506 71.3882 39.2606C69.2482 44.0006 63.9982 47.0706 58.0182 47.0706H57.9982Z" fill="#231F20"/>
</svg>`, green: `<svg width="117" height="1062" viewBox="0 0 117 1062" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M116 930.56V69.8496H0V930.56C0 936.09 1.15 941.56 3.37 946.63L52.01 1057.57C54.3 1062.8 61.71 1062.8 64 1057.57L112.64 946.63C114.86 941.56 116.01 936.09 116.01 930.56H116Z" fill="#212121"/>
<path d="M36.4583 135.25H12.2383V933.86H36.4583V135.25Z" fill="#02A87E"/>
<path d="M70.1067 135.25H45.8867V933.86H70.1067V135.25Z" fill="#66C9B0"/>
<path d="M103.759 135.25H79.5391V933.86H103.759V135.25Z" fill="#02A87E"/>
<path d="M4 65.85V26.08C4 13.9 13.9 4 26.08 4H89.92C102.09 4 112 13.9 112 26.08V65.85H4Z" fill="#02A87E"/>
<path d="M89.92 8C99.89 8 108 16.11 108 26.08V61.85H8V26.08C8 16.11 16.11 8 26.08 8H89.92ZM89.92 0H26.08C11.68 0 0 11.68 0 26.08V69.85H116V26.08C116 11.68 104.32 0 89.92 0Z" fill="#231F20"/>
<path d="M59.9217 1052.19L66.7717 1036.56C67.0217 1035.98 66.6017 1035.34 65.9717 1035.34H50.0217C49.3917 1035.34 48.9717 1035.99 49.2217 1036.56L56.0717 1052.19C56.8017 1053.86 59.1817 1053.86 59.9117 1052.19H59.9217Z" fill="#66C9B0"/>
<path d="M32.6602 37.3903C34.317 37.3903 35.6602 35.192 35.6602 32.4803C35.6602 29.7686 34.317 27.5703 32.6602 27.5703C31.0033 27.5703 29.6602 29.7686 29.6602 32.4803C29.6602 35.192 31.0033 37.3903 32.6602 37.3903Z" fill="#212121"/>
<path d="M83.3398 37.3903C84.9967 37.3903 86.3398 35.192 86.3398 32.4803C86.3398 29.7686 84.9967 27.5703 83.3398 27.5703C81.683 27.5703 80.3398 29.7686 80.3398 32.4803C80.3398 35.192 81.683 37.3903 83.3398 37.3903Z" fill="#212121"/>
<path d="M57.9982 47.0706C52.0182 47.0706 46.7682 44.0106 44.6282 39.2606C44.1682 38.2506 44.6282 37.0706 45.6282 36.6106C46.6382 36.1506 47.8182 36.6106 48.2782 37.6106C49.7582 40.8706 53.6582 43.0706 58.0082 43.0706C62.3582 43.0706 66.2582 40.8806 67.7382 37.6106C68.1982 36.6006 69.3782 36.1606 70.3882 36.6106C71.3982 37.0706 71.8382 38.2506 71.3882 39.2606C69.2482 44.0006 63.9982 47.0706 58.0182 47.0706H57.9982Z" fill="#231F20"/>
</svg>` };
})();

(function () {
  var BP = window.BBBP;
  const C = { green:'#07A87E', ink:'#212121', purps:'#AE9AE4', lav:'#E9DBEC', lime:'#CCFF00', mint:'#66C9B0', cream:'#F3E9D2' };
  const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let THEME = 'green';
  // the running game's state; module-level so the artwork can read the clock (only one game runs at a time)
  let g = { clock: 0 };

  /* ---------- item artwork (all drawn around 0,0 at size s) ---------- */
  const LW = s => Math.max(1.5, s*0.055);

  function swatch(c, s){
    const cols=[C.purps, C.lav, C.mint], w=s*0.26, h=s*0.72;
    c.save(); c.translate(0, s*0.34);
    [-1,0,1].forEach((k,i)=>{
      c.save(); c.rotate(k*0.42);
      c.beginPath(); c.roundRect(-w/2,-h,w,h,s*0.05);
      c.fillStyle=cols[i]; c.fill();
      c.fillStyle=C.cream; c.fillRect(-w/2+LW(s)/2, -h*0.24, w-LW(s), h*0.2);
      c.strokeStyle=C.ink; c.lineWidth=LW(s); c.stroke();
      c.restore();
    });
    c.fillStyle=C.ink; c.beginPath(); c.arc(0,-s*0.05,s*0.05,0,6.28); c.fill();
    c.restore();
  }

  function pen(c, s){
    c.lineJoin='round'; c.lineWidth=LW(s); c.strokeStyle=C.ink;
    c.beginPath();
    c.moveTo(0,s*0.48);
    c.lineTo(-s*0.3,s*0.02);
    c.quadraticCurveTo(-s*0.32,-s*0.14,-s*0.17,-s*0.2);
    c.lineTo(s*0.17,-s*0.2);
    c.quadraticCurveTo(s*0.32,-s*0.14,s*0.3,s*0.02);
    c.closePath(); c.fillStyle=C.purps; c.fill(); c.stroke();
    c.fillStyle=C.ink; c.beginPath(); c.roundRect(-s*0.2,-s*0.42,s*0.4,s*0.16,s*0.03); c.fill();
    c.beginPath(); c.moveTo(0,s*0.46); c.lineTo(0,s*0.12); c.stroke();
    c.beginPath(); c.arc(0,s*0.07,s*0.06,0,6.28); c.fillStyle=C.lav; c.fill(); c.stroke();
  }

  function bezier(c, s){
    const A=[-s*0.42,s*0.22], B=[s*0.42,-s*0.22], h1=[-s*0.12,-s*0.4], h2=[s*0.12,s*0.4];
    c.lineCap='round';
    c.strokeStyle=C.lav; c.lineWidth=Math.max(1.2,s*0.035);
    c.beginPath(); c.moveTo(...A); c.lineTo(...h1); c.moveTo(...B); c.lineTo(...h2); c.stroke();
    c.strokeStyle=C.ink; c.lineWidth=s*0.09;
    c.beginPath(); c.moveTo(...A); c.bezierCurveTo(...h1,...h2,...B); c.stroke();
    c.lineWidth=LW(s)*0.8;
    for (const p of [h1,h2]){ c.beginPath(); c.arc(p[0],p[1],s*0.065,0,6.28); c.fillStyle=C.lav; c.fill(); c.stroke(); }
    const a=s*0.15;
    for (const p of [A,B]){ c.fillStyle=C.cream; c.fillRect(p[0]-a/2,p[1]-a/2,a,a); c.strokeRect(p[0]-a/2,p[1]-a/2,a,a); }
  }

  function spiral(c, s){
    c.beginPath(); c.roundRect(-s*0.46,-s*0.46,s*0.92,s*0.92,s*0.14);
    c.fillStyle=C.lime; c.fill(); c.strokeStyle=C.ink; c.lineWidth=LW(s); c.stroke();
    // true golden rectangle, cut into squares 10 times; one quarter-arc per square
    const P=(1+Math.sqrt(5))/2, H0=Math.PI/2;
    let w=s*0.74, h=w/P, x=-w/2, y=-h/2;
    const lines=[], arcs=[];
    for (let i=0;i<7;i++){
      const d=i%4;
      if (d===0){ const q=h; lines.push([x+q,y,x+q,y+h]); arcs.push([x+q,y+h,q,2*H0,3*H0]); x+=q; w-=q; }
      else if (d===1){ const q=w; lines.push([x,y+q,x+w,y+q]); arcs.push([x,y+q,q,3*H0,4*H0]); y+=q; h-=q; }
      else if (d===2){ const q=h; lines.push([x+w-q,y,x+w-q,y+h]); arcs.push([x+w-q,y,q,0,H0]); w-=q; }
      else { const q=w; lines.push([x,y+h-q,x+w,y+h-q]); arcs.push([x+w,y+h-q,q,H0,2*H0]); h-=q; }
    }
    const W0=s*0.74;
    c.lineWidth=Math.max(1,s*0.022);
    c.strokeRect(-W0/2,-W0/P/2,W0,W0/P);
    c.beginPath(); for (const l of lines){ c.moveTo(l[0],l[1]); c.lineTo(l[2],l[3]); } c.stroke();
    c.lineWidth=Math.max(1.5,s*0.055); c.lineCap='round'; c.lineJoin='round';
    c.beginPath(); for (const a of arcs) c.arc(a[0],a[1],a[2],a[3],a[4]); c.stroke();
  }

  // "Comic Sans" set in Comic Sans (Comic Neue where it isn't installed), with the clashing rainbow and drop shadow
  const COMIC = '"Comic Sans MS", "Comic Sans", "Comic Neue", "Chalkboard SE", cursive';
  function wordart(c, s){
    const fs = s*0.44, o = s*0.07;
    c.save();
    c.font = `700 ${fs}px ${COMIC}`; c.textAlign='center'; c.textBaseline='middle'; c.lineJoin='round';
    c.rotate(-0.21);   // set at a slightly annoying slant
    const gr = c.createLinearGradient(0,-s*0.4,0,s*0.4);
    gr.addColorStop(0,'#FF3EA5'); gr.addColorStop(0.5,'#FFE14D'); gr.addColorStop(1,'#3EC6FF');
    for (const [t,y] of [['Comic',-s*0.22],['Sans',s*0.24]]){
      c.fillStyle='#FF3EA5'; c.fillText(t, o, y+o);
      c.strokeStyle=C.ink; c.lineWidth=s*0.07; c.strokeText(t, 0, y);
      c.fillStyle=gr; c.fillText(t, 0, y);
    }
    c.restore();
  }


  const PENCIL = {};
  for (const k of ['purple','green']){
    const im = new Image();
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BP.PENCIL_SVG[k]);
    PENCIL[k] = im;
  }
  function pencil(c, s){
    const im = THEME==='purple' ? PENCIL.green : PENCIL.purple;
    if (!(im.complete && im.naturalWidth)) return;
    const L = s*1.55, w = L*117/1062*1.6;   // drawn a bit longer and 1.6x wider so it stands out
    c.save(); c.rotate(0.62); c.drawImage(im, -w/2, -L/2, w, L); c.restore();
  }

  function camera(c, s){
    const w=s*0.96,h=s*0.52,x=-w/2,y=-h/2+s*0.05,lw=LW(s);
    c.lineJoin='round'; c.strokeStyle=C.ink; c.lineWidth=lw;
    c.fillStyle=C.ink; c.beginPath(); c.roundRect(x+w*0.66,y-s*0.08,w*0.16,s*0.1,s*0.03); c.fill();
    c.beginPath(); c.roundRect(x,y,w,h,s*0.09); c.fillStyle=C.purps; c.fill();
    c.save(); c.clip(); c.fillStyle=C.lav; c.fillRect(x,y,w,h*0.34); c.restore();
    c.beginPath(); c.moveTo(x,y+h*0.34); c.lineTo(x+w,y+h*0.34); c.stroke();
    c.beginPath(); c.roundRect(x,y,w,h,s*0.09); c.stroke();
    c.fillStyle=C.ink; c.beginPath(); c.roundRect(x+w*0.08,y+h*0.1,w*0.16,h*0.14,s*0.02); c.fill();
    c.fillStyle=C.lime; c.beginPath(); c.arc(x+w*0.84,y+h*0.17,s*0.04,0,6.28); c.fill();
    c.beginPath(); c.arc(0,y+h*0.6,s*0.2,0,6.28); c.fillStyle=C.lav; c.fill(); c.stroke();
    c.beginPath(); c.arc(0,y+h*0.6,s*0.11,0,6.28); c.fillStyle=C.ink; c.fill();
  }

  // headphones bonus: lime fades behind the cups, notes drifting off, cups jump on the beat
  const bass = t => RM ? 0 : Math.pow(Math.max(0, Math.sin(t*Math.PI*4)), 3);
  function note(c,x,y,s,a,dbl,lw){
    c.globalAlpha=a; c.fillStyle=C.ink; c.strokeStyle=C.ink; c.lineWidth=lw; c.lineCap='round'; c.lineJoin='round';
    const heads = dbl ? [[0,0],[s*0.6,-s*0.2]] : [[0,0]];
    for (const [hx,hy] of heads){
      c.beginPath(); c.ellipse(x+hx,y+hy,s*0.22,s*0.16,-0.4,0,6.28); c.fill();
      c.beginPath(); c.moveTo(x+hx+s*0.19,y+hy-s*0.05); c.lineTo(x+hx+s*0.19,y+hy-s*0.75); c.stroke();
    }
    c.beginPath();
    if (dbl){ c.moveTo(x+s*0.19,y-s*0.75); c.lineTo(x+s*0.79,y-s*0.95); }
    else { c.moveTo(x+s*0.19,y-s*0.75); c.quadraticCurveTo(x+s*0.55,y-s*0.6,x+s*0.45,y-s*0.3); }
    c.stroke(); c.globalAlpha=1;
  }
  function headphones(c, s){
    const t=g.clock, b=bass(t), lw=LW(s), cx=s*0.34, cy=s*0.2;
    for (const sx of [-1,1]){
      const R=s*(0.3+0.14*b), gr=c.createRadialGradient(sx*cx,cy,0,sx*cx,cy,R);
      gr.addColorStop(0,'rgba(204,255,0,0.95)'); gr.addColorStop(0.45,'rgba(204,255,0,0.55)'); gr.addColorStop(1,'rgba(204,255,0,0)');
      c.fillStyle=gr; c.beginPath(); c.arc(sx*cx,cy,R,0,6.28); c.fill();
    }
    for (let i=0;i<4;i++){
      const ph=((t*0.8+i*0.25)%1), sx=i%2?1:-1;
      note(c, sx*(cx+s*0.16+ph*s*0.18)-(sx<0?s*0.12:0), cy-s*0.16-ph*s*0.4, s*0.2, RM?0.8:Math.sin(ph*Math.PI), i===1||i===2, lw*0.85);
    }
    c.lineJoin='round'; c.lineCap='round'; c.strokeStyle=C.ink;
    c.lineWidth=lw*2; c.beginPath(); c.moveTo(-cx,cy); c.lineTo(-cx,cy-s*0.06); c.ellipse(0,cy-s*0.06,cx,s*0.42,0,Math.PI,2*Math.PI); c.lineTo(cx,cy); c.stroke();
    c.lineWidth=lw;
    for (const sx of [-1,1]){
      c.save(); c.translate(sx*cx,cy+s*0.04); c.scale(1+0.1*b,1+0.1*b); c.translate(0,-s*0.03*b);
      c.beginPath(); c.roundRect(-s*0.1,-s*0.16,s*0.2,s*0.32,s*0.1); c.fillStyle=C.purps; c.fill(); c.stroke();
      c.restore();
    }
  }

  function crumple(c, s){
    const P=[[0,-0.44],[0.2,-0.36],[0.36,-0.4],[0.42,-0.16],[0.46,0.06],[0.36,0.22],[0.4,0.38],[0.14,0.44],[-0.06,0.38],[-0.26,0.44],[-0.42,0.28],[-0.38,0.06],[-0.46,-0.12],[-0.32,-0.3],[-0.18,-0.42]];
    const outline=()=>{ c.beginPath(); P.forEach((p,i)=>i?c.lineTo(p[0]*s,p[1]*s):c.moveTo(p[0]*s,p[1]*s)); c.closePath(); };
    c.lineJoin='round'; c.lineCap='round';
    outline(); c.fillStyle=C.cream; c.fill();
    const F=[[[0,-0.44],[0.06,-0.1],[-0.18,-0.42]],[[0.42,-0.16],[0.12,0.02],[0.46,0.06]],[[-0.06,0.38],[-0.04,0.1],[-0.26,0.44]],[[-0.46,-0.12],[-0.16,-0.06],[-0.38,0.06]],[[0.36,0.22],[0.12,0.02],[0.14,0.44]]];
    c.fillStyle='#D9CBAA';
    for (const fc of F){ c.beginPath(); fc.forEach((p,i)=>i?c.lineTo(p[0]*s,p[1]*s):c.moveTo(p[0]*s,p[1]*s)); c.closePath(); c.fill(); }
    c.strokeStyle=C.ink; c.lineWidth=Math.max(1,s*0.028);
    const L=[[0,-0.44,0.06,-0.1],[0.06,-0.1,0.12,0.02],[0.12,0.02,0.42,-0.16],[0.12,0.02,0.14,0.44],[0.06,-0.1,-0.16,-0.06],[-0.16,-0.06,-0.46,-0.12],[-0.16,-0.06,-0.04,0.1],[-0.04,0.1,-0.06,0.38],[-0.04,0.1,-0.42,0.28],[0.2,-0.36,0.06,-0.1],[0.12,0.02,0.36,0.22]];
    c.beginPath(); for (const l of L){ c.moveTo(l[0]*s,l[1]*s); c.lineTo(l[2]*s,l[3]*s); } c.stroke();
    c.lineWidth=LW(s); outline(); c.stroke();
  }

  // missing-footage colour bars
  function bars(c, s){
    const w=s*0.92, h=s*0.66, x=-w/2, y=-h/2, bw=w/7;
    ['#E8E8E8','#E6E14A','#3EC6E0','#4CC35A','#D24FC0','#E2523E','#3E5BD8'].forEach((col,i)=>{ c.fillStyle=col; c.fillRect(x+i*bw,y,bw+0.5,h*0.72); });
    ['#3E5BD8','#212121','#D24FC0','#212121','#3EC6E0','#212121','#E8E8E8'].forEach((col,i)=>{ c.fillStyle=col; c.fillRect(x+i*bw,y+h*0.72,bw+0.5,h*0.1); });
    ['#1B2B5E','#E8E8E8','#3A1F6B','#212121'].forEach((col,i)=>{ c.fillStyle=col; c.fillRect(x+i*w*0.25,y+h*0.82,w*0.25+0.5,h*0.18); });
    c.strokeStyle=C.ink; c.lineWidth=LW(s); c.lineJoin='round'; c.strokeRect(x,y,w,h);
  }

  const PIX = ['ssssuu','sswsus','ssmsss','smmmws','mmmmmm','ggwgwg'];
  const PCOL = { s:'#8FA9B8', u:'#D9B55A', w:'#B3AA8C', m:'#5E6046', g:'#8A7650' };
  function pixel(c, s){
    const n=6, cell=s*0.8/n, x0=-s*0.4, y0=-s*0.4;
    PIX.forEach((row,r)=>[...row].forEach((ch,k)=>{ c.fillStyle=PCOL[ch]; c.fillRect(x0+k*cell-0.3, y0+r*cell-0.3, cell+0.6, cell+0.6); }));
    c.strokeStyle=C.ink; c.lineWidth=LW(s); c.strokeRect(x0,y0,s*0.8,s*0.8);
  }

  const ART = { swatch, pencil, bezier, camera, spiral, headphones, wordart, pixel, crumple, bars };

  // the shared "bad" treatment: a broken-signal glitch (RGB split + sliced, shifting rows)
  const DPR = Math.min(2, devicePixelRatio || 1);
  const SPR = new Map();
  function sprite(k, s, tint){
    const key = k+'|'+Math.round(s)+'|'+(tint||'');
    let cv = SPR.get(key); if (cv) return cv;
    const box = Math.ceil(s*1.35);
    cv = document.createElement('canvas'); cv.width = cv.height = box*DPR; cv.box = box;
    const c = cv.getContext('2d'); c.setTransform(DPR,0,0,DPR,0,0); c.translate(box/2, box/2); ART[k](c, s);
    if (tint){ c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation='source-in'; c.fillStyle=tint; c.fillRect(0,0,cv.width,cv.height); }
    SPR.set(key, cv); return cv;
  }
  const hash = (a,b,c) => { const h = Math.sin(a*127.1 + b*311.7 + c*74.7)*43758.5453; return h - Math.floor(h); };
  function glitch(c, k, s, x, y, t, seed, force){
    const spr = sprite(k, s), box = spr.box, frame = Math.floor(t*14);
    const burst = force || (!RM && hash(seed, Math.floor(t*3), 1) < 0.45);
    const split = RM ? s*0.05 : s*(burst ? 0.1 : 0.05)*(0.6 + 0.4*hash(seed, frame, 2));
    const jx = RM ? 0 : (hash(seed, frame, 3) - 0.5)*s*0.06;
    const X = x - box/2 + jx, Y = y - box/2;
    c.globalAlpha = 0.9;
    c.drawImage(sprite(k, s, '#FF3EA5'), X - split, Y, box, box);
    c.drawImage(sprite(k, s, '#3EC6FF'), X + split, Y, box, box);
    c.globalAlpha = 1;
    if (!burst){ c.drawImage(spr, X, Y, box, box); return; }
    const n = 7, sh = box/n, sp = spr.width/n;
    for (let i=0; i<n; i++){
      const off = hash(seed, frame, i+4) < 0.45 ? 0 : (hash(seed, frame, i+20) - 0.5)*s*0.5;
      c.drawImage(spr, 0, i*sp, spr.width, sp, X + off, Y + i*sh, box, sh + 0.5);
    }
    if (hash(seed, frame, 40) < 0.45){
      c.fillStyle = C.cream;
      c.fillRect(X + box*0.1 + (hash(seed, frame, 41) - 0.5)*s*0.3, Y + box*(0.15 + 0.7*hash(seed, frame, 42)), box*0.55, Math.max(2, s*0.045));
    }
  }
  // the shared "good" marker: a small lime twinkle
  function twinkle(c, x, y, r){
    if (r<=0.5) return;
    c.fillStyle=C.lime; c.strokeStyle=C.ink; c.lineWidth=Math.max(1,r*0.18);
    c.beginPath();
    for (let i=0;i<8;i++){ const a=i*Math.PI/4, rr= i%2 ? r*0.32 : r; c.lineTo(x+Math.cos(a-Math.PI/2)*rr, y+Math.sin(a-Math.PI/2)*rr); }
    c.closePath(); c.fill(); c.stroke();
  }


  BP.setTheme = function(t){
    THEME = t; C.purps = t==='purple' ? '#07A87E' : '#AE9AE4';
    SPR.clear(); buildBag();
  };

  /* ---------- game ---------- */
  const GOOD = [
    { k:'swatch', pts:10, w:24 }, { k:'pencil', pts:10, w:24 }, { k:'bezier', pts:10, w:22 }, { k:'camera', pts:10, w:22 },
    { k:'spiral', pts:25, w:10, big:true }, { k:'headphones', pts:40, w:5, big:true }
  ];
  const BAD = [ { k:'wordart', pts:-15 }, { k:'pixel', pts:-15 }, { k:'crumple', pts:-15 }, { k:'bars', pts:-15 } ];
  const pick = list => { const tot=list.reduce((a,b)=>a+(b.w||1),0); let r=Math.random()*tot; for (const it of list){ r-=(it.w||1); if (r<=0) return it; } return list[0]; };
  const clampX = x => Math.max(g.cart.w/2+4, Math.min(g.W-g.cart.w/2-4, x));

  // bag + board images, split from the master SVG (Purps parts go Main Green on the purple footer)
  const IMG = {};
  const ready = im => im && im.complete && im.naturalWidth > 0;
  function buildBag(){
    const src = THEME==='purple' ? BP.BAG_SVG.replace(/#ae9ae4/gi, '#07A87E') : BP.BAG_SVG;
    const base = new DOMParser().parseFromString(src, 'image/svg+xml').documentElement;
    const make = (name, edit) => {
      const sv = base.cloneNode(true); edit(sv);
      const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(sv));
      IMG[name] = im;
    };
    const dropBoard = sv => { const n=sv.querySelector('#skateboard'); if (n) n.remove(); };
    make('bag', dropBoard);
    make('bagLit', sv => { dropBoard(sv); const p=sv.querySelector('#grab-loop path'); if (p) p.setAttribute('style','stroke:#CCFF00'); });
    make('board', sv => {
      ['#grab-loop','#bottle','#bottle-pocket','#bag-body','#front-pocket'].forEach(id => { const n=sv.querySelector(id); if (n) n.remove(); });
      const sb = sv.querySelector('#skateboard');
      if (sb) [...sb.children].forEach(n => { if (n.id!=='deck' && n.tagName.toLowerCase()!=='rect') n.remove(); });
    });
  }

  // geometry in the SVG's units: deck spans ~580 of its 640, wheels at x 146 / 494, y 501, r 39; bag sits on y 411
  function geo(){
    const k = g.cart.w/580, ox = g.cart.x - 320*k, oy = g.ground - 540*k;
    return { k, ox, oy, top: oy + 62*k, half: 180*k };
  }
  // caught things poke out of the top, following the bag's domed top (body x 140-500, flat top y 51 from x 284-356, r 144)
  const LOAD_SLOTS = [320, 268, 372, 222, 418, 296, 344, 246, 394];
  function bagTop(x){
    if (x < 284) { const d=Math.min(144, 284-x); return { y: 195-Math.sqrt(144*144-d*d), a: -Math.atan2(d, Math.sqrt(Math.max(1,144*144-d*d))) }; }
    if (x > 356) { const d=Math.min(144, x-356); return { y: 195-Math.sqrt(144*144-d*d), a: Math.atan2(d, Math.sqrt(Math.max(1,144*144-d*d))) }; }
    return { y: 51, a: 0 };
  }

  BP.size = function(gm){
    g = gm;
    const W = Math.round(gm.st.getBoundingClientRect().width);
    if (!W || W === gm.W) return;
    gm.W = W;
    gm.fs = Math.max(11, Math.min(16, Math.round(W/96)));   // HUD text, same scale as the other footer games
    gm.hy = Math.round(gm.fs*1.6);
    gm.H = gm.hy + Math.round(gm.fs*1.4) + (W < 560 ? 350 : 476);   // in line with the other footer games
    const dpr = Math.min(2, window.devicePixelRatio || 1); gm.dpr = dpr;
    gm.cv.width = W*dpr; gm.cv.height = gm.H*dpr; gm.cv.style.height = gm.H + 'px';
    gm.ctx.setTransform(dpr,0,0,dpr,0,0);
    gm.ground = gm.H - 20;
    gm.size = Math.max(30, Math.min(48, W*0.045));
    gm.cart.w = Math.max(110, Math.min(170, W*0.15));
    if (!gm.cart.x) gm.cart.x = gm.cart.tx = W/2;
    gm.cart.tx = clampX(gm.cart.tx); gm.cart.x = clampX(gm.cart.x);
    SPR.clear();
  };

  function spawn(){
    const bad = g.mode==='play' ? Math.random() < Math.min(0.42, 0.28 + g.elapsed*0.004) : Math.random()<0.35;
    const def = bad ? BAD[Math.random()*BAD.length|0] : pick(GOOD);
    const sz = g.size * (def.big ? 1.1 : 1);
    const speed = g.H*(0.32 + Math.random()*0.1) * (g.mode==='play' ? 1 + g.elapsed*0.018 : 0.65);
    g.items.push({ def, bad, s: sz, x: sz + Math.random()*(g.W - 2*sz), y: -sz, vy: speed, rot: Math.random()*6.28, seed: Math.random()*100 });
  }

  BP.start = function(gm){
    Object.assign(gm, { mode:'play', score:0, t:BP.ROUND, elapsed:0, items:[], pops:[], puffs:[], spawn:0.4 });
    gm.cart.load = [];
  };
  function end(){
    g.mode = 'over'; g.overT = 0;
    g.newBest = g.score > g.best && g.score > 0;
    if (g.newBest){ g.best = g.score; try { localStorage.setItem('bbBackpackBest', g.best); } catch(e){} }
  }

  function catchItem(it){
    const c=g.cart, pts=it.def.pts;
    g.score = Math.max(0, g.score + pts);
    g.flash = 0.22; g.flashGood = pts>0;
    g.pops.push({ x:it.x, y:geo().top-14, txt:(pts>0?'+':'−')+Math.abs(pts), good:pts>0, life:0.8 });
    if (pts>0){
      c.glow = 0.35; if (!RM) c.sq = 0.22;
      c.load.push({ k:it.def.k, j:Math.random()*2-1 });
      if (c.load.length > LOAD_SLOTS.length) c.load.shift();
    } else {
      if (!RM) c.shake = 0.3;
      c.load.splice(-2, 2);   // a bad catch knocks a couple of things back out
      for (let i=0;i<7;i++){ const a=-Math.PI*(0.15+Math.random()*0.7); g.puffs.push({ x:it.x, y:geo().top, vx:Math.cos(a)*90, vy:Math.sin(a)*90, r:3+Math.random()*4, life:0.45 }); }
    }
  }

  BP.update = function(gm, dt){
    g = gm; const c = gm.cart;
    gm.clock += dt;
    if (gm.mode==='play'){ gm.t -= dt; gm.elapsed += dt; if (gm.t <= 0){ gm.t = 0; end(); } }
    if (gm.mode==='over') gm.overT += dt;
    if (gm.flash>0) gm.flash -= dt;
    const dir = (gm.keys.r?1:0) - (gm.keys.l?1:0);
    if (dir) c.tx = clampX(c.tx + dir*gm.W*0.95*dt);
    const prev = c.x;
    c.x += (c.tx - c.x) * Math.min(1, dt*14);
    c.wheel += (c.x - prev) / (c.w*39/580);
    const vx = dt>0 ? (c.x - prev)/dt : 0;
    c.vx += (vx - c.vx)*Math.min(1, dt*10);
    if (c.shake>0) c.shake -= dt;
    if (c.glow>0) c.glow -= dt;
    if (c.sq>0) c.sq -= dt;
    gm.spawn -= dt;
    if (gm.spawn <= 0){ spawn(); gm.spawn = gm.mode==='play' ? Math.max(0.32, 0.85 - gm.elapsed*0.012) * (0.7+Math.random()*0.6) : 1.1; }
    const G = geo(), top = G.top, half = G.half + gm.size*0.15;
    for (let i=gm.items.length-1; i>=0; i--){
      const it = gm.items[i];
      it.y += it.vy*dt; it.rot += dt*(it.bad?0:0.9);
      const bottom = it.y + it.s*0.4;
      if (gm.mode==='play' && bottom >= top && it.y <= top + 16 && Math.abs(it.x - c.x) < half){ catchItem(it); gm.items.splice(i,1); continue; }
      if (it.y - it.s > gm.H) gm.items.splice(i,1);
    }
    for (let i=gm.pops.length-1; i>=0; i--){ const p=gm.pops[i]; p.life-=dt; p.y-=34*dt; if (p.life<=0) gm.pops.splice(i,1); }
    for (let i=gm.puffs.length-1; i>=0; i--){ const p=gm.puffs[i]; p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if (p.life<=0) gm.puffs.splice(i,1); }
  };

  function drawItem(ctx, it){
    const sz=it.s, t=g.clock;
    if (it.bad){ glitch(ctx, it.def.k, sz, it.x, it.y, t, it.seed); return; }
    ctx.save(); ctx.translate(it.x,it.y); ctx.rotate(Math.sin(it.rot)*0.22); ART[it.def.k](ctx,sz); ctx.restore();
    if (it.def.k!=='headphones') twinkle(ctx, it.x-sz*0.46, it.y-sz*0.44, sz*0.16*(RM ? 1 : 0.6+0.4*Math.abs(Math.sin(t*4+it.seed))));
  }

  function drawBag(ctx){
    const c=g.cart, G=geo(), k=G.k;
    const sx = c.shake>0 ? Math.sin(c.shake*90)*4 : 0;
    const ox=G.ox+sx, oy=G.oy, W=640*k, H=550*k, lit=c.glow>0;
    const lean = RM ? 0 : Math.max(-0.12, Math.min(0.12, -c.vx*0.00022));
    const sq = c.sq>0 ? Math.sin((1 - c.sq/0.22)*Math.PI) : 0;
    const px=ox+320*k, py=oy+411*k;
    ctx.save(); ctx.translate(px,py); ctx.rotate(lean); ctx.scale(1+sq*0.1, 1-sq*0.12); ctx.translate(-px,-py);
    const ls = g.size*0.7;
    c.load.forEach((l, i) => {
      const lx = LOAD_SLOTS[i] + l.j*8, t = bagTop(lx);
      const qx = ox + lx*k + Math.sin(t.a)*ls*0.34, qy = oy + t.y*k - Math.cos(t.a)*ls*0.34 + (i>4 ? ls*0.14 : 0);
      ctx.save(); ctx.translate(qx, qy); ctx.rotate(t.a*0.9 + l.j*0.18); ART[l.k](ctx, ls); ctx.restore();
    });
    const bag = lit ? IMG.bagLit : IMG.bag;
    if (ready(bag)) ctx.drawImage(bag, ox, oy, W, H);
    ctx.restore();
    if (ready(IMG.board)) ctx.drawImage(IMG.board, ox, oy, W, H);
    const r=39*k;
    for (const wxs of [146, 494]){
      const wx=ox+wxs*k, wy=oy+501*k;
      ctx.fillStyle = lit ? C.lime : C.ink; ctx.beginPath(); ctx.arc(wx,wy,r,0,6.28); ctx.fill();
      ctx.strokeStyle = lit ? C.ink : C.lav; ctx.lineWidth=Math.max(1.5,r*0.2); ctx.lineCap='round';
      ctx.beginPath();
      for (let a=0;a<2;a++){ const ang=c.wheel+a*Math.PI/2; ctx.moveTo(wx+Math.cos(ang)*r*0.62, wy+Math.sin(ang)*r*0.62); ctx.lineTo(wx-Math.cos(ang)*r*0.62, wy-Math.sin(ang)*r*0.62); }
      ctx.stroke();
      ctx.fillStyle=C.purps; ctx.beginPath(); ctx.arc(wx,wy,r*0.28,0,6.28); ctx.fill();
    }
  }

  // the key on the start / end screen: plain labels + the items (bad ones glitching)
  function drawKey(ctx, cx, y){
    const ic = g.W < 560 ? 30 : 40, gap = 4, lab = g.W < 560 ? 64 : 82;
    const rows = [[GOOD, 'Catch', '+10 to +40'], [BAD, 'Dodge', '−15']];
    const w = lab + GOOD.length*(ic+gap);
    rows.forEach(([defs, a, b], r) => {
      const ry = y + r*(ic+10), x0 = Math.round(cx - w/2);
      ctx.fillStyle=C.ink; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.font = '600 ' + (g.fs-1) + 'px ' + g.font; ctx.fillText(a.toUpperCase(), x0, ry + ic*0.45);
      ctx.font = '500 ' + (g.fs-3) + 'px ' + g.font; ctx.fillText(b.toUpperCase(), x0, ry + ic*0.45 + g.fs);
      defs.forEach((d, i) => {
        const ix = x0 + lab + i*(ic+gap) + ic/2, iy = ry + ic/2, sz = ic*0.62;
        if (r) glitch(ctx, d.k, sz, ix, iy, g.clock, i*13+5);
        else { ctx.save(); ctx.translate(ix, iy); ART[d.k](ctx, sz); ctx.restore(); if (d.k!=='headphones') twinkle(ctx, ix-sz*0.46, iy-sz*0.44, sz*0.16); }
      });
    });
    return y + 2*ic + 10;
  }

  BP.draw = function(gm){
    g = gm; const ctx = gm.ctx;
    ctx.clearRect(0,0,gm.W,gm.H);
    // HUD, same style as the other footer games
    ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.fillStyle=C.ink;
    ctx.font = (gm.flash>0 && gm.flashGood ? '700 ' : '500 ') + gm.fs + 'px ' + gm.font;
    const left = gm.W < 560 ? 16 : Math.round(gm.W*0.05);
    const hud = gm.mode==='play' ? 'SCORE ' + gm.score + '   TIME ' + Math.ceil(gm.t) + '   BEST ' + gm.best : 'BEST ' + gm.best;
    ctx.fillText(hud, left, gm.hy);
    // pavement
    ctx.fillRect(0, gm.ground, gm.W, 1.5);
    for (let x=40; x<gm.W; x+=120) ctx.fillRect(x, gm.ground+1.5, 1.5, 8);
    for (const it of gm.items) drawItem(ctx, it);
    drawBag(ctx);
    ctx.fillStyle=C.ink;
    for (const p of gm.puffs){ ctx.globalAlpha=Math.max(0,p.life*2); ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.28); ctx.fill(); }
    ctx.globalAlpha=1;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font = '600 ' + Math.round(gm.size*0.55) + 'px ' + gm.font;
    for (const p of gm.pops){ ctx.globalAlpha=Math.min(1,p.life*2); ctx.fillStyle = p.good ? C.lime : C.ink; ctx.fillText(p.txt,p.x,p.y); }
    ctx.globalAlpha=1;
    // start / end screen: plain text, the key, and the shared Play / Play again button
    const show = gm.mode!=='play', bh = gm.W < 480 ? 36 : 40;
    if (show){
      const blockH = 20 + 2*(gm.W<560?30:40) + 10 + 16 + bh;
      let y = Math.round(gm.hy + gm.fs*2 + (geo().top - 30 - gm.hy - gm.fs*2 - blockH)/2);
      const msg = gm.mode==='over' ? (gm.newBest ? 'New best · ' : "Time's up · ") + gm.score + ' pts' : 'Catch good design · dodge the glitches';
      window.BBPILL.say(ctx, gm.W/2, y, msg, { W: gm.W, font: gm.font });
      y = drawKey(ctx, gm.W/2, y + 20) + 16;
      window.BBPILL.place(gm.st, 'play', { show: true, x: gm.W/2, y: y + bh/2, text: gm.mode==='over' ? 'Play again' : 'Play', theme: THEME,
        enabled: gm.mode!=='over' || gm.overT > 0.6 || RM, onClick: function(){ if (gm.mode!=='play') BP.start(gm); } });
    } else window.BBPILL.place(gm.st, 'play', { show: false });
  };
})();

// mount on the footer when the arcade starts it
(function () {
  var BP = window.BBBP;
  BP.mount = function (f, theme) {
    if (BP.g) { BP.g.stop(); BP.g = null; }
    if (!f) return false;
    f.classList.add('bbbp-on');
    var st = f.querySelector('.bbbp-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbbp-stage'; st.innerHTML = '<canvas aria-label="Mini game: ride the backpack, catch good design, dodge the glitching bad design"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas'), best = 0;
    try { best = +localStorage.getItem('bbBackpackBest') || 0; } catch (e) {}
    var gm = { st: st, cv: cv, ctx: cv.getContext('2d'), W: 0, H: 0, best: best, score: 0, t: BP.ROUND, mode: 'idle', clock: 0, elapsed: 0,
      items: [], pops: [], puffs: [], spawn: 0.3, overT: 0, flash: 0, keys: { l: false, r: false },
      cart: { x: 0, tx: 0, w: 140, wheel: 0, vx: 0, shake: 0, glow: 0, sq: 0, load: [] },
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    BP.setTheme(theme === 'purple' ? 'purple' : 'green');
    BP.size(gm);
    var aim = function (e) { var r = cv.getBoundingClientRect(); gm.cart.tx = Math.max(gm.cart.w / 2 + 4, Math.min(gm.W - gm.cart.w / 2 - 4, e.clientX - r.left)); };
    cv.addEventListener('pointermove', aim);
    cv.addEventListener('pointerdown', aim);
    cv.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') document.body.classList.add('bbbp-hover'); });
    cv.addEventListener('pointerleave', function () { document.body.classList.remove('bbbp-hover'); });
    var key = function (down) { return function (e) {
      var k = e.key, L = k === 'ArrowLeft' || k === 'a' || k === 'A', R = k === 'ArrowRight' || k === 'd' || k === 'D';
      if (!L && !R) return;
      if (L) gm.keys.l = down; if (R) gm.keys.r = down;
      if (gm.mode === 'play' && down) e.preventDefault();
    }; };
    var kd = key(true), ku = key(false);
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    // open with a few things already falling so the footer shows the game straight away
    BP.update(gm, 0);
    for (var i = 0; i < 5; i++) { BP.update(gm, 0.9); }
    var raf = 0, last = performance.now(), dead = false;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { BP.size(gm); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
      if (!gm.W) BP.size(gm);
      var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      if (gm.W && r.bottom > 0 && r.top < vh && r.width > 0) { BP.update(gm, dt); BP.draw(gm); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    gm.stop = function () {
      document.body.classList.remove('bbbp-hover'); dead = true; cancelAnimationFrame(raf); if (ro) ro.disconnect();
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
    };
    BP.g = gm;
    return true;
  };
  // started by the footer arcade (18-footer-arcade.js); in the NEXT GAME rotation on green and purple footers
  (window.BBARCADE = window.BBARCADE || []).push({ id: 'backpack', name: 'Backpack', themes: ['green', 'purple'],
    ns: [], paths: [], cls: 'bbbp-on', stage: '.bbbp-stage',
    mount: function (f, t) { return BP.mount(f, t); }, stop: function () { if (BP.g) { BP.g.stop(); BP.g = null; } } });
})();
