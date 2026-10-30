// BB Footer Bricks: brick breaker in the Services page footer.
// The bricks are a pixelated version of the stacked Brave Beyond logo (design system: bb-stacked-ink.svg).
// The logo's gaps are opened up slightly before pixelating so the e, y and o stay readable.
// Instagram, Privacy Policy and the rights line stay in the footer underneath, like the invaders game.
// Power-ups drop from the top about every 10 seconds while playing; catch them with the paddle:
//   FIRE (pixel flame)  - the ball becomes a fireball and cuts straight through every brick it touches for a few seconds
//   HYDRA (three heads) - the ball splits into 6
// 5 lives. Clearing the whole logo scores +100K and shows GET THE F*$£ IN! in purple pixel letters.
// Losing every life shows GIT GUD in the same letters, with the logo faded behind it.
// Pages: set in B.SEL / B.PATHS below (Barba namespace or URL path + .bb-footer).

(function () {
  var B = window.BBB = window.BBB || {};
  var s = document.createElement('style');
  s.textContent =
    '.bb-footer.bbbrk-on{padding-top:4vw}' +
    '.bb-footer.bbbrk-on .bbft-lm{display:none}' +
    '.bbbrk-stage{order:0;align-self:stretch;margin:0 -5vw;position:relative}' +
    '.bbbrk-stage canvas{display:block;width:100%;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    '.bb-footer .bbft-ig{order:1;margin:2vw 0 0}' +
    '@media (max-width:479px){.bb-footer.bbbrk-on{padding-top:24px}.bb-footer .bbft-ig{margin:16px 0 0}}';
  document.head.appendChild(s);
  B.SEL = '[data-barba-namespace="services"] .bb-footer';
  B.PATHS = ['/services'];
  // Colour sets. On the Purps footer anything Purps swaps to Main Green so it doesn't vanish, and the ball goes ink.
  B.PALS = {
    green:  { ink: '#212121', lime: '#CCFF00', lav: '#E9DBEC', purp: '#AE9AE4', ball: '#E9DBEC' },
    purple: { ink: '#212121', lime: '#CCFF00', lav: '#E9DBEC', purp: '#07A87E', ball: '#212121' }
  };
  B.COL = B.PALS.green;
  B.setTheme = function (t) { B.COL = B.PALS[t] || B.PALS.green; };
  B.LIVES = 5;
  B.WIN_BONUS = 100000;
  B.PU_EVERY = 10;     // seconds between power-up drops (give or take 1.5s)
  B.THRU_TIME = 7;     // seconds the FIRE power-up lasts
  B.SPLIT = 6;         // balls after an X6
  B.MAX_BALLS = 18;    // cap so it never gets silly
  B.LIFE_EVERY = 30;   // seconds between extra-life elixirs (on their own timer, so they can fall alongside another power-up)
  B.MAX_LIVES = 9;
  // Stacked logo, viewBox 0 0 1415.38 572.45
  B.VW = 1415.38; B.VH = 572.45;
  B.LOGO = ["M1341.2,100.9c-.48-1.2-1.05-2.37-1.7-3.51-8.61-14.91-30.5-21.15-46.54-23.33-73.24-10-134.87,40.02-184.37,87.26-.43.41-1.1-.12-.81-.64,8.03-14.12,16.9-25.58,22.78-39.87,3.77-9.14,6.7-18.21,6.34-28.05-.44-11.96-8.76-20.42-20.84-20.58-21.33-.31-42.72,19.78-57.17,36.01-17.07,19.19-32.13,39.1-46.77,60.31l-37.91,54.92c-1.38,1.43-1.66.85-.92-.98l26.06-59.71,15.41-39.69c3.09-7.95,4-16.6,3.63-24.96-.59-13.3-10.45-22.55-23.62-23.7-25.46-2.22-45.87,17.93-60.9,37.94l-39.89,52.17c-.27.34-.82.09-.72-.33.95-4.02,4.38-14.68,4.38-14.68,7.07-23.4,3.42-47.68-18.52-59.58-11.23-6.09-23.51-8.17-36.36-7.77-41.61,1.29-83.25,25.39-111.31,55.5-20.87,22.37-20.33,21.98-30.18,32.34,9.68-16.83,25.13-36.15,28.62-55.42,11.05-61.04-80.06-24.97-101.36-6.81l-19.96,19.23c-.21.2-.55-.03-.45-.31,2.35-6.71,4.58-12.57,5.18-19.18,1.03-11.28-6.28-20.58-17.61-22.05-36.69-4.75-72.73,36.17-94.34,64.37.79-11.01-.71-22.05-5.26-32.61-4.28-9.94-12.13-16.93-22.41-20.26-18.25-5.9-38.68-1.7-56.11,5.94-14.42,6.33-26.99,15.09-39,25.49l21.1-31.5c7.35-10.98,14.24-21.76,20.92-33.13,3.86-6.55,7.06-13.09,9.64-20.18,5.7-15.69,4.14-33.34-11.85-40.5-22.15-9.92-52.17,6.41-70.69,20.19-13.07,9.73-25.04,20.45-36.31,32.25-17.8,18.66-36.95,42.23-48.72,65.03-1.26,2.46-1.79,5.11-1.72,7.84.11,4.46,3.7,7.67,8.33,7.11,8.05-.95,18.86-9.1,26.6-13.82.49-.21.61.05.27.54l-13.88,19.66-21.89,32.21c-8.92,13.9-17.05,27.9-23.87,42.94-4.14,9.14-7.32,18.22-8.98,28.08-2.67,15.78,1.92,31.63,13.09,43.03,14.94,15.24,38.69,19.21,59.45,17.64,11.78-.89,22.88-3.12,34.31-6.24,36.07-9.84,72.55-28.45,103.16-52-7.07,16.07-11.08,34.48-1.2,47.95,5.74,7.83,15.22,11.45,24.95,11.75,28.73.89,52.82-20.88,71.58-41.78l35.34-39.38c13.11-14.6,41.7-37.82,49.02-43.7.48-.38,1.15.13.92.7-4.36,10.94-9.03,19.63-9.7,30.31-.94,14.99,9.11,26.13,24.09,26.56,11.04.31,20.79-3.42,31.07-8.84.18-.09.37.1.28.29-7.67,13.78-13.11,26.94-13.5,42.03-.45,17.2,9.03,31.97,25.3,37.41,26.1,8.74,57.39-3.19,79.3-19.97,10.83-8.3,19.98-18.33,28.71-28.75.48-.57,2.22-3.19,3.07-2.99,1.26.3-1.46,8.67-1.7,9.51-3.05,10.63-2.73,23,6.13,30.88,16.05,14.16,42.8,4.7,60.15-8.72,12.04-9.33,22.4-19.95,31.97-31.85l27.07-33.68c.56-.71,1.69-.13,1.46.75-3.59,13.38-7.59,24.47-7.06,37.72.57,14.21,6.06,27.94,18.22,35.77,19.87,12.78,47.55,2.71,67.74-8.92,15.72-9.04,30.38-18.7,44.36-30.39,18.97-15.88,37.74-32.04,57.06-47.49-4.22,3.38-5.66,9.9-7.87,14.59-9.98,21.16-14.04,48.22,7.78,63.11,21.1,14.4,48.66,16.48,73.4,17.1,54.05,1.34,109.85-19.73,145.74-60.91,11.81-13.55,9.46-29.53-6.82-37.9-6.61-3.4-14.02-2.64-21.33-.37-7.61,2.36-15.12,6.36-21.54,8.97-8.93,3.65-18.48,6.72-27.11,11.07-12.97,6.54-54.71,17.45-62.94,10.88-3.12-2.49,4.08-7.54,13.27-10.38,34.46-10.64,66.91-24.69,97.26-44.1,21.11-13.5,45.18-29.91,56.68-53.08,4.71-9.48,6.4-21.05,2.53-30.74ZM405.07,186.29c-11.94,17.79-27.41,32.75-45.51,44.21-5.46,3.45-13.56,7.71-19.71,7.63-5.65-.08-3.82-8.51-1.36-14.12,8.31-18.93,25.24-37.78,41.51-50.47,7.87-6.14,20.29-14.18,29.68-14.73,2.79-.17,4.84,1.75,4.79,4.51-.14,7.39-5.07,16.51-9.41,22.98ZM821.47,139.58c-15.35,26.12-34.91,48.07-55.66,68.67-5.64,5.6-11.17,9.95-17.67,13.12-.83.4-1.77-.32-1.58-1.23,1.92-9.38,6.2-16.19,10.32-24.15,14.9-24.05,34.85-46.4,63.01-58.2,1.11-.47,2.2.75,1.58,1.79ZM1249.83,140.58c-8.26,8.98-18.3,16.88-28.15,23.86-3.78,2.68-7.74,5.07-11.81,7.28-4.51,2.45-10.64,6.36-15.76,6.83.64-3.9,4.83-8.32,7.38-11.27,2.8-3.22,5.75-6.39,8.81-9.45,6.9-6.89,14.42-13.26,22.35-18.7,4.03-2.77,8.01-5.65,12.33-7.95,3.6-1.93,7.1-3.89,11.28-4.19.73-.06,1.53-.05,2.12.38,3.17,2.32-7.05,11.58-8.53,13.2Z", "M1413.32,264.7c-.03-.09-.06-.18-.1-.26-4.7-12.59-16.1-16.28-28.36-11.58-14.75,5.65-28.17,15.3-40.34,25.23-13.86,11.32-26.49,24.05-38.85,36.95-10.97,11.45-21.45,24.62-34.04,34.42-.88.69-2.18.25-2.5-.82-.71-2.35-1.9-5.69-2.09-6.17-1.14-2.75-2.7-5.32-4.65-7.57-4.18-4.81-9.93-7.89-15.9-9.88-37.2-8.59-72.74,23.53-96.96,47.34-16.02,15.75-27.24,35.64-43.39,51.24-1.79,1.73-4.63-.32-3.56-2.57l18.27-38.53c3.68-7.78,5.25-16.23,5.37-24.73.01-1.17.01-2.35-.03-3.52-.35-12.26-7.7-21.9-19.64-25.01-24.46-6.39-53.74,9.38-73.04,25.98-9.53,8.22-28.7,36.78-36.67,45.67-1.66,1.85-4.66.07-3.84-2.27l6.77-19.17c3.28-7.96,3.37-17.67.08-25.76-4.35-10.71-15.96-15.11-27.26-14.47-37.42,2.12-69.67,42.11-99.76,60.96-1.9,1.19-4.15,2.41-6.26,1.68-3.48-1.2-3.37-6.12-2.47-9.68,3.66-14.45,8.59-29.97,5.56-44.95-6.44-31.89-49.17-31.16-73.85-25.8-31.55,6.85-61.8,25.07-83.61,48.76,0,0-28.27,30.73-28.27,30.73-.81.88-2.2-.12-1.63-1.17l14.22-26.51c5.01-9.34,7.19-19.84,7.16-30.18-.05-15.1-11.15-25.46-26.29-24.68-23.19,1.21-46.42,20.65-63.77,36.87l-44.15,41.26c-2.5,2.34-5,4.52-7.59,6.59-2.7,2.16-6.36-1.14-4.49-4.05,10.92-16.99,22.21-34.95,23.22-53.57.72-12.98-7.39-23.25-20.39-25.29-50.08-7.87-78.16,47.72-106.35,77.72-35.34,37.6-80.47,66.05-129.84,81.18-8.15,2.5-18.39,4.1-23.98-2.33,7.32-7.06,17.54-10,27.17-13.27,28.42-9.63,55.18-24.12,78.79-42.64,16.68-13.09,32.23-28.86,39.51-48.77,7.63-20.88.26-41.16-21.31-49.64-54.8-21.55-113.91,17.8-149.82,62.34-.66-6.76-2.26-13.47-5.07-19.98-4.28-9.94-12.13-16.93-22.4-20.26-18.25-5.9-38.68-1.7-56.12,5.95-14.41,6.32-26.99,15.08-39,25.48l21.11-31.5c7.35-10.98,14.24-21.76,20.92-33.13,3.86-6.55,7.07-13.09,9.64-20.18,5.7-15.69,4.14-33.34-11.85-40.5-22.15-9.92-52.18,6.41-70.69,20.19-13.07,9.73-25.05,20.45-36.31,32.25-17.8,18.66-36.95,42.23-48.72,65.03-1.27,2.46-1.8,5.11-1.73,7.84.12,4.46,3.71,7.66,8.34,7.11,8.05-.95,18.86-9.1,26.6-13.82.49-.21.6.05.28.55l-13.88,19.65-21.9,32.21c-8.91,13.9-17.05,27.9-23.86,42.94-4.14,9.14-7.33,18.22-8.99,28.09-2.66,15.77,1.93,31.62,13.1,43.02,14.94,15.24,38.69,19.21,59.45,17.64,11.77-.89,22.88-3.12,34.31-6.24,43.64-11.9,87.89-36.62,121.59-67.44-6.98,28.96-7.21,57.72,13.46,67.52,28.37,13.44,68.25,5.6,98.25-4.73,36.77-12.67,70.12-31.68,101.22-54.85l30.82-24.69c1.24-1,3.04-.89,4.13.28,12.6,13.52,37.2,9.74,55.15,3.31.12-.05.25-.1.37-.14,3.63-1.32,5.9,3.86,2.46,5.61-18.24,9.32-38.27,14.96-59.01,16.84-25.01,2.26-49.95,10.62-63.72,31.74-6.02,9.25-8.13,21.15-3.13,31.12,5.21,10.39,15.52,16.18,26.92,18.42,39.1,7.68,78.53-4.5,113.8-22.12,27.76-13.85,51.83-32.08,73.2-54.51l18.68-20.06c.47-.51,1.31-.08,1.16.6-1.17,5.51-3.96,19.23-4.47,27.52-1.23,19.73,8.77,36.65,26.81,44.9,27.55,12.58,61.78,5.86,89.89-5.6,26.78-10.92,50.46-26.49,72.15-45.6.05-.05.11-.1.16-.14l34.41-34.26c.76-.75,1.49-1.51,2.21-2.28,2.49-2.67,6.73.46,4.9,3.61-11.25,19.38-32.15,51.72-22.26,75.33,4.3,10.25,14.56,16.82,25.67,17.26,25.09.99,49.2-8.3,68.85-23.58,21.93-17.06,35.09-41.01,52.28-62.27,2.83-3.49,5.78-6.89,8.89-10.13.77-.8,2.1.1,1.66,1.12-5.41,12.38-11.81,24.3-17.24,36.66-5.03,11.45-11.64,25.62-10.02,38.43.31,2.48,1,4.92,2.23,7.1,2.77,4.9,8.24,7.73,13.73,8.96,6.87,1.54,14.44,1.83,21.47,1.52,19.98-.88,37.8-11.09,53.05-23.34,7.34-5.9,14.12-12.84,21.02-19.37,3.54-3.36,7.13-6.76,11.02-9.72,1.09-.83,4.73-3.77,5.82-1.74.37.69.25,1.53.12,2.31-1.22,7.12-3.25,14.81-2.5,22.08,1.42,13.69,10.45,24.26,23.57,28.64,11.11,3.71,23.38,2.63,34.56-.86,9.13-2.85,17.76-7.08,25.97-11.94,4.12-2.43,8.15-5.01,12.09-7.72,3.36-2.31,7.78-7.02,12.25-6.5,3.25.37,4.07,14.47,4.65,16.89,5.34,22.75,33.9,3.07,44.58-4.01,22.48-14.9,41.9-34,57.22-56.19,2.59-3.75,5.06-7.57,7.42-11.46,1.22-2.01,2.4-4.04,3.55-6.09.55-.98,2.65-3.61,2.65-4.75,2.21-4.02,4.99-9.32,4.33-14.03-.59-4.18-4.16-6.95-8.38-6.39-8.04,1.06-18.74,9.36-26.41,14.18-.22.1-.36.1-.43.03,16.34-19.14,29.7-40.43,44.47-60.76,22.25-30.63,52.9-56.82,66.22-93.18,3.86-10.54,6.21-22.96,2.22-33.95ZM321.85,417.68c11.84-15.71,26.99-28.81,43.28-39.3.45-.29.88-.56,1.33-.83,4.66-2.79,9.6,3.04,6.13,7.22-1.39,1.67-2.89,3.24-4.39,4.73-3.64,3.59-7.21,7.26-10.89,10.81-6.86,6.63-14.23,12.68-22.34,17.73-2.81,1.76-5.7,3.39-8.63,4.94-3.33,1.75-6.75-2.29-4.49-5.3ZM178.3,433.89c-11.94,17.79-27.41,32.75-45.52,44.21-5.45,3.45-13.56,7.71-19.7,7.63-5.65-.08-3.82-8.51-1.36-14.12,8.29-18.93,25.24-37.78,41.5-50.47,7.87-6.14,20.3-14.18,29.69-14.73,2.78-.17,4.84,1.75,4.79,4.51-.14,7.39-5.07,16.51-9.41,22.98ZM784.22,400.05c-.27.73-.53,1.33-.68,1.6-10.3,19.7-23.76,37.72-39.99,52.94-3.21,2.99-6.47,5.94-10.04,8.51-1.7,1.22-8.77,6.77-10.84,5.2-2.07-1.58,1.52-8.14,2.35-9.73,10.76-20.53,26.43-38.9,43.84-54.09,4.25-3.71,8.69-8.16,14.24-9.78,2.88-.86,1.98,2.97,1.12,5.35ZM1236.26,408.47c-6.55,16-14.96,30.98-25.35,44.6-3.19,4.18-6.56,8.23-10.13,12.14-6.26,6.88-18.33,17.01-20.89,13.56-.86-1.15-.83-3.28-.24-5.9,1.32-5.98,5.48-14.56,8.42-20.14,9.26-17.5,20.54-33.18,35.14-46.45,3.22-2.92,6.24-5.17,10.15-7.12,2.13-1.06,4.61.68,4.44,3.05-.16,2.14-.68,4.12-1.55,6.26Z"];
})();

// Pixel art: power-up sprites and a 5x7 pixel font for pop-ups and the win screen
(function () {
  var B = window.BBB;
  // FIRE (cuts through bricks). O = ink outline, L = lime flame, V = lavender core
  B.FIRE = [
    '.....O.....',
    '....OLO....',
    '...OLLO.O..',
    '...OLLLOLO.',
    '..OLLLLLLO.',
    '.OLLLVLLLLO',
    '.OLLVVLLLLO',
    'OLLVVVVLLLO',
    'OLLVVVVVLLO',
    'OLLVVVVVLLO',
    '.OLLVVVLLO.',
    '..OLLLLLO..',
    '...OOOOO...'
  ];
  // HYDRA (splits the ball): James's own pixel hydra (Brave_Hydra.svg), sampled to an 88 x 85 pixel grid.
  // X = ink, P = purps, V = light lavender, E = lime eyes.
  // Tongues are lime, one letter set per tongue, ordered outwards from the mouth: a-i, j-r, s-z + '#'.
  B.HYDRA = [
    '..........................................X...XX........................................',
    '..........................................XX...XX.......................................',
    '..........................................XXX..XXX......................................',
    '..........................................XPX...XXXXXX..................................',
    '..........................................XPPXXXXXXPXXXX................................',
    '...........................................XPPPPXXXPPPPXX...............................',
    '............................................XXPPPXXXXPPXX...............................',
    '.............................................XXPPPPXXXXXXX..............................',
    '..........................................XXXXXXXPPXXPPPXXXX............................',
    '........................................XXXVXXXXXXPPXXPPPPXXX...........................',
    '......................................XXXXXXVVVVXXXXXXXPPPPPPX..........................',
    '.....................................XXXVVVVVVVVVVXXXXXXXPPPPXX.........................',
    '....................................XXXXVVVPPPPVVVXXVVXXXXPPPXX.........................',
    '...................................XXXXVVPPPPPPPVVVXXVPXEEXPPXXX........................',
    '....................................XXVVPPPPPXXXXVVVVVPPXXXXPPXXX.......................',
    '...................................XXVVPPPPXXXXXXXXVVVXPPPPXXPPPXXX.....................',
    '..................................XXXVPPPPPXXX..XXXVVXXXXXXPPPPPPXX.....................',
    '..................................XXVPPPPPXXX....XXVVXXEXXXXXXXPPPX.....................',
    '.................................XXXVPPPPXXX......XXVVXXXX..XXXXPPX.....................',
    '.................................XXVVPPPPXX........XXVVVXj....XXXX......................',
    '.................................XXVVPPPPXX.........XXVVXXjk....XX......................',
    '.................................XXVVPPPPXX.........XXXVXXXklm..........................',
    '................................XXXVVPPPPXX...........XVVX..lmn.........................',
    '................................XXXVVPPPPXX...........XXVVXX..no........................',
    '................................XXXVVPPPPXXX...........XVVVX...o...r....................',
    '...................X............XXXXVVPPPPXXX..........XXXXX...ppqr.....................',
    '.............X....XX............XXXXVVPPPPPXXX...........XXX....qqr.....................',
    '............XX...XX..............XXXXVVPPPPPXXX.........................................',
    '...........XX...XPX..............XXXXVVVPPPPPXXX........................X...............',
    '..........XPXXXXPPX.XXXX..........XXXXVVVVPPPPPXX.................X.....XX..............',
    '.........XPPXXPPPXXXXVVXXXXX......XXXXXVVVVVPPPPXX................XXX...XXX.............',
    '........XXPPXPPPXXXVVXXXXXXXX......XXXXXVVVVVPPPPXX...............XPXXX.XPXX............',
    '.......XXPPXPPPXXXXXXXPPPPPXXXX....XXXXXXXVVVVPPPPXX..............XPPPXXXPPXX...........',
    '......XXPPXXPPPXXXXPPPPPPPPPPXXXXX..XXXXXXXVVVVPPPPX..........XXX..XXPPPXXPPXX..........',
    '......XPXXXXPPXXXPPPPPPPPPPPPPPXXX...XXXXXXVVVVPPPPXX........XXXXX.XXPPPXXXPPXX.........',
    '.....XXXXXXXPPXXPPPPPPPPPPPPPPPPPXXX..XXXXXXVVVPPPPXXX....XXXXXXVVXXXXPPPXXPPPXX........',
    '.....XXXXPPPXPXXPPPPPPPPPPPPPPPPPPXXX..XXXXXXVVVPPPPXX..XXXVVXXXXXVVXXXPPPXXPPXX........',
    '....XXXPPPPPXXXVPPPPXXXXXXVVVPPPPPPXXX..XXXXXVVVPPPPXX.XXXXXXPPPXXVVVXXXPPXXXXXX........',
    '...XXPPPPPPXXXVVPPXXXXXXXXXXVVVPPPPPXXX.XXXXXXVVVPPPXXXXXXXPPPPPPPVVVVVXXXXPPXXX........',
    '...XPPPPPXXXPXVVVXXX.....XXXXVVVPPPPPXX..XXXXXVVVPPPXXXXXPPPPPPPPPPPVVVVXPPPPPPXXX......',
    '...XPPPXEXPPXXVVXXX........XXXVVPPPPPXXX.XXXXXVVVPPXXXXXPPPPPPPPPPPPVVVVXXPPPPPPXXX.....',
    '..XXPPXEEXPVVVVVXX..........XXVVVPPPPPXX..XXXXVVPPPXXXXPPPPPPPPXXXXXXVVVVXXXXXXPPPX.....',
    'XXXPPXXXXPPVVVVVX............XXVVVPPPPXXX.XXXVVVPPXXXXPPPPPPPXXXXXXXXXVVVVPXEXXPPPX.....',
    'XXXPPPPPPPXXVVXXX............XXVVVPPPPPXX.XXXVVVPXXXXVPPPPPXXXX.....XXXVVVPPXEEXPPPXX...',
    'XPPPPPPPPXXXVVXX.............XXXVVPPPPPXX.XXVVVPPXXXVVPPPPXXX........XXVVVVPPXXXXPPPXX..',
    'XPPXXXXXXXXXVXX..............XXXVVPPPPPXXXXVVVPPXXXXVPPPPXXX..........XXVVXXPPPPPPPPPXX.',
    'XXXXXXX.EXXVVXX.............XXXXVVPPPPPXXXVVVVPPXXXXVPPPPXXX..........XXVVXXXXXPPPPPPPX.',
    '.XX.X...XXXVX...............XXXVVPPPPPXXXXVVVPPXXXXXVPPPXXX............XXVXXsXXXXXXXPPX.',
    '..X....aXXVVX..............XXXVVPPPPPPXXXVVVPPPXXXXVVPPPXXX.............XVVXXst..XXXXPX.',
    '......aXXXVX...............XXVVPPPPPPXXXXVVPPPPXXXXVVVPPXXX..............XVVXXtu...XXX..',
    '.....bbXXVVX.............XXXVVPPPPPPXXXXXVVPPPPXXXXVVVPPXXXX..............XVVXXuu...X...',
    '....cc.XVVX............XXXXVPPPPPPPPXXXXVVVVPPPPXXXXVVVPPXXXX..............XVXXXuvw.....',
    '....dd.XXX............XXXXVPPPPPPPXXXXXXVVVVPPPPPXXXVVVPPPXXXXXX...........XVVXX..w.....',
    '...ee................XXXPPPPPPXXXXXXXXXXXVVVVPPPPPXXXVVVPPPXXXXXX...........XVVXX.xx....',
    '...ff...............XXXPPPPXXXXPPPPPXXXXXXVVVVPPPPPPXXXVVPPPPXXXXX..........XXVX...x....',
    'ihgg................XXXPPPXXXPPPPPPPPPPXXXXXVVVPPPPPXXXXVVVVPPPXXX..................yz##',
    '.hh................XXVVPPXXPPPPPPPPPPPPPPXXXXVVVPPPPPPXXXVVVVPPPXXXX................zz..',
    '.i.................XXVVPXXXPPPPPPPPPPPPPPPPXXXXVVVPPPPPXXXVVVPPPPXXXX................#..',
    '..................XXVVVXXPPPPPPPPPPPPPPPPPPPPXXXVVVPPPPPXXXXVVVPPPXXXX...............#..',
    '..................XXVVXXXPPPPPPVVVVVVVVPPPPPPXXXXVVVPPPPPPXXVVVPPPPPXX..................',
    '..................XXVXXXPPPPPPVVVVVVVVVVVPPPPPXXXXVVVPPPPPPXXVVVPPPPPXX.................',
    '..................XXXXXPPPPPVVVVXXXXXVVVVVPPPPPXXXXVVPPPPPPXXXVVVPPPPXX.................',
    '..................XXXXPPPPPPVVXXXXXXXXXVVVVPPPPPPXXVVVPPPPPPXXXVVPPPPPXX................',
    '..................XXXXPPPPPVVXXXXXXXXXXXVVVVPPPPPXXXVVVPPPPPXXXVVVPPPPXX................',
    '..................XXXPPPPPPVXXXXXX..XXXXXVVVVPPPPXXXVVVPPPPPXXXVVVPPPPXX................',
    '..................XXXPPPPPPVXXXXX....XXXXVVVVPPPPXXXXVVPPPPPPXXXVVVPPPPX................',
    '................XXXPPPPPPPPVXXXX......XXXXVVVPPPVXXXXVVPPPPPPXXXVVVPPPPX................',
    '................XXXPPPPPPPPVXXXX.......XXXXVVPVVXXXXXVPPPPPPPXXXXVVPPPPX................',
    '................XXXPPPPPPPPPXXXX........XXXVVVVVXXXXXPPPPPPPPXXXXVVVPPPX................',
    '................XXXPPPPPPPPPPXXXX......XXXXVVVVXXXXXPPPPPPPPPXXXXVVVPPXX................',
    '................XXXVVPPPPPPPPPXXXXX...XXXXXXVVXXXXXPPPPPPPPPXXXXXVVVPPXX................',
    '................XXXVVVPPPPPPPPPXXXXX..XXXXXXXXXXXPPPPPPPPPPPXXXXVVVVXXX.................',
    '................XXXXVVVPPPPPPPPPXXXXXXXXXXXXXXXPPPPPPPPPPPPVXXXXVVVVXXX.................',
    '................XXXXVVVPPPPPPPPPPPPXXXXXXXXXPPPPPPPPPPPPPPVVXXXVVVVXXX..................',
    '..................XXVVVVVPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPVVXXXXVVVXXX...................',
    '..................XXXXVVVVPPPPPPPPPPPPPPPPPPPPPPPPPPPPPVVVVXXXXVVXXX....................',
    '...................XXXXVVVVVPPPPPPPPPPPPPPPPPPPPPPPPPVVVVVXXXXXXXXX.....................',
    '....................XXXXXVVVVVPPPPPPPPPPPPPPPPPPPPPVVVVVVXXXXXXXX.......................',
    '.....................XXXXXXVVVVVVVPPPPPPPPPPPPPPVVVVVVVXXXXXXXX.........................',
    '......................XXXXXXVVVVVVVVPPPPPPPPPPPVVVVVVVXXXXX.............................',
    '.......................XXXXXXXVVVVVVVVVPPPPVVVVVVVVVVXXXXX..............................',
    '.........................XXXXXXXVVVVVVVVVVVVVVVVVXXXXXXXX...............................',
    '...........................XXXXXXXXXVVVVVVVVVXXXXXXXXX..................................',
    '..............................XXXXXXXXXXXXXXXXXXXXXX....................................',
    '..................................XXXXXXXXXXXXXX........................................'
  ];
  B.TONGUES = ['abcdefghi', 'jklmnopqr', 'stuvwxyz#'];
  // Heads: eye centre (in sprite pixels) and the direction the neck leaves the head.
  // Each head is cut out along its neck (B.HEAD_CUT pixels back from the eye) so it can wiggle on its own;
  // the body keeps a 2px overlap band under the cut so no gaps show when a head moves.
  B.HEADS = [
    { x: 57.0, y: 13.5, nx: -1, ny: 0.9 },
    { x: 8.2, y: 41.2, nx: 1, ny: 0.8 },
    { x: 77.5, y: 43.2, nx: -1, ny: 0.8 }
  ];
  B.HEAD_R = 19; B.HEAD_CUT = 5; B.HEAD_BAND = 2;
  // How far each tongue is out (-1 = in, 8 = fully out). They flick out and back in turn.
  B.tongueStage = function (t, i) {
    var c = ((t / 1.6) + i / 3) % 1;
    if (c < .12) return Math.floor(c / .12 * 9);
    if (c < .4) return 8;
    if (c < .52) return 8 - Math.floor((c - .4) / .12 * 9);
    return -1;
  };
  // Which head a sprite pixel belongs to: { i, proj } or null for the body
  B.headOf = function (x, y) {
    var best = null, bd = 1e9;
    for (var i = 0; i < B.HEADS.length; i++) {
      var h = B.HEADS[i], dx = x + .5 - h.x, dy = y + .5 - h.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d > B.HEAD_R) continue;
      var proj = (dx * h.nx + dy * h.ny) / Math.sqrt(h.nx * h.nx + h.ny * h.ny);
      if (proj > B.HEAD_CUT || d >= bd) continue;
      best = { i: i, proj: proj }; bd = d;
    }
    return best;
  };
  // Build once per pixel size: a body layer, one layer per head, and each tongue's pixels (tied to its head)
  B.hydraParts = function (px) {
    B._hp = B._hp || {};
    var key = px + B.COL.purp;   // one cache per pixel size and colour set
    if (B._hp[key]) return B._hp[key];
    var K = B.COL, map = { X: K.ink, P: K.purp, V: '#E8CAE9', E: K.lime }, w = B.HYDRA[0].length, h = B.HYDRA.length;
    function layer() { var c = document.createElement('canvas'), x = c.getContext && c.getContext('2d'); if (!x) return null; c.width = w * px; c.height = h * px; return { c: c, x: x }; }
    var body = layer(), heads = [layer(), layer(), layer()], tongues = [[], [], []], tHead = [0, 0, 0], list = [];
    for (var r = 0; r < h; r++) for (var k = 0; k < w; k++) {
      var ch = B.HYDRA[r][k];
      if (ch === '.') continue;
      var ti = -1, stage = 0;
      for (var i = 0; i < 3; i++) { var n = B.TONGUES[i].indexOf(ch); if (n >= 0) { ti = i; stage = n; break; } }
      if (ti >= 0) { tongues[ti].push([k, r, stage]); continue; }
      var hd = B.headOf(k, r), col = map[ch];
      if (!hd || hd.proj > B.HEAD_CUT - B.HEAD_BAND) list.push([body, k, r, col]);
      if (hd) list.push([heads[hd.i], k, r, col]);
    }
    // each tongue moves with the head whose eye is nearest its root
    tongues.forEach(function (cells, ti) {
      var root = cells.filter(function (c) { return c[2] === 0; })[0] || cells[0]; if (!root) return;
      var bd = 1e9; B.HEADS.forEach(function (hh, i) { var d = Math.pow(root[0] - hh.x, 2) + Math.pow(root[1] - hh.y, 2); if (d < bd) { bd = d; tHead[ti] = i; } });
    });
    var parts = { body: body, heads: heads, tongues: tongues, tHead: tHead, list: list };
    if (body) list.forEach(function (p) { p[0].x.fillStyle = p[3]; p[0].x.fillRect(p[1] * px, p[2] * px, px, px); });
    return (B._hp[key] = parts);
  };
  B.drawHydra = function (x, left, top, px, t, off) {
    var P = B.hydraParts(px), o = [];
    for (var i = 0; i < 3; i++) o.push([Math.round(Math.sin(t * 3.2 + off + i * 2.1) * .7), Math.round(Math.sin(t * 4.4 + off + i * 1.7 + 1) * .8)]);
    left = Math.round(left); top = Math.round(top);
    if (P.body) {
      x.drawImage(P.body.c, left, top);
      for (i = 0; i < 3; i++) x.drawImage(P.heads[i].c, left + o[i][0] * px, top + o[i][1] * px);
    } else {
      // no offscreen canvas (shouldn't happen in a browser): draw pixels directly, without the wiggle
      P.list.forEach(function (p) { if (p[0] === null) { x.fillStyle = p[3]; x.fillRect(left + p[1] * px, top + p[2] * px, px, px); } });
    }
    x.fillStyle = B.COL.lime;
    P.tongues.forEach(function (cells, ti) {
      var st = B.tongueStage(t + off, ti), oo = o[P.tHead[ti]];
      cells.forEach(function (c) { if (c[2] <= st) x.fillRect(left + (c[0] + oo[0]) * px, top + (c[1] + oo[1]) * px, px, px); });
    });
  };
  // ELIXIR (extra life): glass bottle with a purps cork, lime potion and a purps heart. X ink, V lavender glass, H highlight.
  B.ELIXIR = [
    '....XXXXX....',
    '....XPPPX....',
    '....XXXXX....',
    '.....XVX.....',
    '.....XVX.....',
    '...XXVVVXX...',
    '..XVVVVVVVX..',
    '.XVVVVVVVVVX.',
    'XLLLLLLLLLLLX',
    'XLHLPLLLPLLLX',
    'XHLPPPLPPPLLX',
    'XLLPPPPPPPLLX',
    'XLLLPPPPPLLLX',
    'XLLLLPPPLLLLX',
    '.XLLLLPLLLLX.',
    '..XXXXXXXXX..'
  ];
  B.FONT = {
    'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'C': ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    'G': ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
    'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'I': ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
    'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    'V': ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    '0': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
    '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
    '!': ['#', '#', '#', '#', '#', '.', '#'],
    '*': ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....'],
    '$': ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'],
    '\u00a3': ['..##.', '.#..#', '.#...', '####.', '.#...', '.#...', '#####'],
    ' ': ['..', '..', '..', '..', '..', '..', '..']
  };
  // Draw a sprite; map turns each letter into a colour
  B.sprite = function (x, rows, left, top, px, map, flip) {
    var n = rows[0].length;
    for (var r = 0; r < rows.length; r++) for (var k = 0; k < n; k++) {
      var c = map[rows[r][k]]; if (!c) continue;
      x.fillStyle = c; x.fillRect(Math.round(left + (flip ? n - 1 - k : k) * px), Math.round(top + r * px), px, px);
    }
  };
  // Chunky letters: every pixel of the 5x7 font is drawn two pixels wide
  B.textW = function (str, px) {
    var w = 0; for (var i = 0; i < str.length; i++) w += ((B.FONT[str[i]] || B.FONT[' '])[0].length + 2) * px;
    return w - px;
  };
  // Pixel text centred on (cx, cy). wave = how far each letter bobs (0 for none)
  B.ptext = function (x, str, cx, cy, px, c, wave, t) {
    var lx = Math.round(cx - B.textW(str, px) / 2), top = Math.round(cy - 3.5 * px);
    x.fillStyle = c;
    for (var i = 0; i < str.length; i++) {
      var gl = B.FONT[str[i]] || B.FONT[' '], dy = wave ? Math.round(Math.sin(t * 6 - i * .5) * wave) * px : 0;
      for (var r = 0; r < 7; r++) for (var k = 0; k < gl[r].length; k++) if (gl[r][k] === '#') x.fillRect(lx + k * px, top + dy + r * px, px * 2, px);
      lx += (gl[0].length + 2) * px;
    }
  };
})();

(function () {
  var B = window.BBB;

  // Pixelate the stacked logo into a cols x rows grid. Returns [[x,y],...] for filled cells.
  B.sample = function (cols, rows) {
    var k = 6, o = document.createElement('canvas'); o.width = cols * k; o.height = rows * k;
    var c = o.getContext('2d'); c.scale(o.width / B.VW, o.height / B.VH);
    var ps = B.LOGO.map(function (d) { return new Path2D(d); });
    c.fillStyle = '#000'; ps.forEach(function (p) { c.fill(p); });
    // open up the counters/gaps by about half a brick so they survive pixelating
    c.globalCompositeOperation = 'destination-out'; c.lineWidth = 1.2 * B.VW / cols; c.lineJoin = 'round';
    ps.forEach(function (p) { c.stroke(p); });
    var a = c.getImageData(0, 0, o.width, o.height).data, m = [], need = Math.round(k * k * 0.45);
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var n = 0;
      for (var j = 0; j < k; j++) for (var i = 0; i < k; i++) if (a[((y * k + j) * o.width + x * k + i) * 4 + 3] > 128) n++;
      if (n >= need) m.push([x, y]);
    }
    return m;
  };

  B.size = function (g) {
    var W = Math.round(g.st.getBoundingClientRect().width);
    if (!W || W === g.W) return;
    g.W = W;
    g.fs = Math.max(11, Math.min(16, Math.round(W / 96)));   // HUD text, same scale as the invaders game
    g.hy = Math.round(g.fs * 1.6);
    var lw = Math.min(W * (W < 600 ? 0.86 : 0.62), 820);
    g.s = Math.max(4, Math.min(9, Math.round(lw / 85)));     // brick size
    g.cols = Math.floor(lw / g.s); g.rows = Math.round(g.cols * B.VH / B.VW);
    g.ox = Math.round((W - g.cols * g.s) / 2);
    g.ceil = Math.round(g.hy + g.fs * 1.05 + 10);              // top line the ball bounces off
    g.oy = g.ceil + 18;
    g.py = g.oy + g.rows * g.s + Math.max(110, Math.round(W * 0.14)); // paddle row
    g.H = g.py + 46;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    g.cv.width = W * dpr; g.cv.height = g.H * dpr; g.cv.style.height = g.H + 'px';
    g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.pad.w = Math.max(64, Math.min(150, W * 0.14)); g.pad.x = W / 2;
    B.reset(g);
  };
  B.build = function (g) {
    g.bricks = B.sample(g.cols, g.rows).map(function (p) { return { x: g.ox + p[0] * g.s, y: g.oy + p[1] * g.s, a: 1 }; });
    g.total = g.bricks.length || 1; g.alive = g.bricks.length;
  };
  B.serve = function (g) {
    g.balls = [{ x: g.pad.x, y: g.py - 6, vx: 0, vy: 0, r: Math.max(3, Math.round(g.s * 0.6)), stuck: 1 }];
    g.pu = []; g.thru = 0; g.puT = B.PU_EVERY * (.85 + Math.random() * .3);
  };
  B.reset = function (g) { g.score = 0; g.lives = B.LIVES; g.lifeT = B.LIFE_EVERY * (.9 + Math.random() * .2); g.mode = 'idle'; g.flash = []; g.parts = []; g.pops = []; g.win = null; B.build(g); B.serve(g); };
  B.launch = function (g) {
    if (g.mode === 'over' || g.mode === 'clear') { B.reset(g); }
    var b = g.balls[0];
    if (!b || !b.stuck) return;
    var sp = Math.max(260, Math.min(520, g.W * 0.42));
    b.vx = sp * 0.5 * (Math.random() < .5 ? -1 : 1); b.vy = -sp * 0.86; b.stuck = 0; g.mode = 'play';
  };
  B.debris = function (g, x, y, c) {
    if (g.parts.length > 300) return;
    g.parts.push({ x: x, y: y, c: c, vx: (Math.random() - .5) * 120, vy: -40 - Math.random() * 100, life: .5 + Math.random() * .5 });
  };
  // Break the brick(s) the ball overlaps. With THRU on it breaks every brick it touches and doesn't bounce.
  B.hitBrick = function (g, b) {
    var s = g.s, list = g.bricks, hit = false, all = g.thru > 0;
    for (var i = 0; i < list.length; i++) {
      var k = list[i];
      if (k.a && b.x + b.r > k.x && b.x - b.r < k.x + s && b.y + b.r > k.y && b.y - b.r < k.y + s) {
        k.a = 0; g.alive--; g.score += 10; hit = true;
        g.flash.push({ x: k.x, y: k.y, t: .25 });
        B.debris(g, k.x, k.y, B.COL.ink);
        if (!all) break;
      }
    }
    if (hit && g.score > g.best) { g.best = g.score; try { localStorage.setItem('bbBricksBest', g.best); } catch (e) {} }
    return hit && !all;   // true = bounce
  };
  B.step = function (g, b, dt) {
    var W = g.W;
    b.x += b.vx * dt; if (B.hitBrick(g, b)) b.vx *= -1;
    if (b.x < b.r || b.x > W - b.r) { b.vx *= -1; b.x = Math.max(b.r, Math.min(W - b.r, b.x)); }
    b.y += b.vy * dt; if (B.hitBrick(g, b)) b.vy *= -1;
    if (b.y < g.ceil + 1 + b.r) { b.y = g.ceil + 1 + b.r; b.vy = Math.abs(b.vy); }
    var p = g.pad;
    if (b.vy > 0 && b.y + b.r >= g.py && b.y < g.py + 10 && Math.abs(b.x - p.x) < p.w / 2 + b.r) {
      var o = (b.x - p.x) / (p.w / 2), sp = Math.min(Math.hypot(b.vx, b.vy) * 1.015, 760);
      b.vx = sp * Math.sin(o * 1.05); b.vy = -sp * Math.cos(o * 1.05); b.y = g.py - b.r;
    }
  };
  B.update = function (g, dt) {
    if (g.mode === 'over') g.ot = (g.ot || 0) + dt;
    g.t += dt;
    var p = g.pad, kp = g.W * 1.3;
    if (g.keys.ArrowLeft) p.x -= kp * dt;
    if (g.keys.ArrowRight) p.x += kp * dt;
    if (g.mode === 'idle' && !g.rm && !g.moved) p.x = g.W / 2 + Math.sin(g.t * .8) * Math.min(220, g.W * .25);
    p.x = Math.max(p.w / 2, Math.min(g.W - p.w / 2, p.x));
    var b0 = g.balls[0];
    if (b0 && b0.stuck) { b0.x = p.x; b0.y = g.py - b0.r - 1; }
    else {
      g.balls.forEach(function (b) { for (var i = 0; i < 4; i++) B.step(g, b, dt / 4); });
      g.balls = g.balls.filter(function (b) { return b.y < g.H + 10; });
      if (!g.balls.length) { g.lives--; B.serve(g); g.mode = g.lives > 0 ? 'serve' : 'over'; g.ot = 0; }
      else if (!g.alive) { g.balls = [g.balls[0]]; g.balls[0].stuck = 1; g.pu = []; g.thru = 0; g.mode = 'clear'; B.winner(g); }
    }
    if (g.mode === 'play') B.powerups(g, dt);
    g.pops.forEach(function (q) { q.t += dt; }); g.pops = g.pops.filter(function (q) { return q.t < 1; });
    if (g.win) {
      g.win.t += dt;
      // flames rain down everywhere while the win screen is up
      var fl = g.win.flames || (g.win.flames = []);
      var dens = Math.max(.3, g.W / 1440);   // fewer flames on narrow screens
      if (fl.length < 70 * dens && Math.random() < dt * 22 * dens) fl.push({ x: Math.random() * g.W, y: g.ceil - 40, vy: 110 + Math.random() * 180, px: Math.random() < .5 ? 2 : 3, ph: Math.random() * 6 });
      fl.forEach(function (q) { q.y += q.vy * dt; });
      g.win.flames = fl.filter(function (q) { return q.y < g.H; });
      if (g.win.t < 2.5 && Math.random() < .5) { for (var c = 0; c < 4; c++) B.debris(g, Math.random() * g.W, g.oy + Math.random() * g.rows * g.s, [B.COL.purp, B.COL.lime, B.COL.lav][c % 3]); }
    }
    // fireball trail
    if (g.thru > 0) g.balls.forEach(function (b) { if (Math.random() < .6) g.parts.push({ x: b.x - 1, y: b.y - 1, c: Math.random() < .6 ? B.COL.lime : B.COL.lav, vx: (Math.random() - .5) * 40, vy: 20 + Math.random() * 30, life: .25 + Math.random() * .2 }); });
    g.flash.forEach(function (f) { f.t -= dt; }); g.flash = g.flash.filter(function (f) { return f.t > 0; });
    g.parts.forEach(function (q) { q.life -= dt; q.vy += 260 * dt; q.x += q.vx * dt; q.y += q.vy * dt; });
    g.parts = g.parts.filter(function (q) { return q.life > 0; });
  };
  // Power-ups: one drops from the top about every 10 seconds; catch it with the paddle
  B.puPx = function (g) { return g.W < 600 ? 3 : 4; };
  B.puPxFor = function (g, type) { return type === 'x6' ? 1 : B.puPx(g); };   // hydra is a detailed 88px sprite, drawn 1:1 on desktop
  B.hyScale = function (g) { return g.W < 600 ? .7 : g.W < 1200 ? .8 : 1; };   // scaled to 70% on phones, 80% on iPads/tablets
  B.puSize = function (g, type) { var px = B.puPxFor(g, type), r = type === 'thru' ? B.FIRE : type === 'life' ? B.ELIXIR : B.HYDRA, k = type === 'x6' ? B.hyScale(g) : 1; return { w: Math.round(r[0].length * px * k), h: Math.round(r.length * px * k) }; };
  B.powerups = function (g, dt) {
    if (g.thru > 0) g.thru = Math.max(0, g.thru - dt);
    if ((g.puT -= dt) <= 0) {
      var type = Math.random() < .5 ? 'thru' : 'x6', sz = B.puSize(g, type), m = sz.w / 2 + 12;
      g.pu.push({ type: type, x: m + Math.random() * (g.W - m * 2), y: g.ceil + 4, vy: Math.max(70, g.H * .22) });
      g.puT = B.PU_EVERY * (.85 + Math.random() * .3);
    }
    if ((g.lifeT -= dt) <= 0) {
      var ls = B.puSize(g, 'life'), lm = ls.w / 2 + 12, lx, tries = 0;
      do { lx = lm + Math.random() * (g.W - lm * 2); tries++; }
      while (tries < 12 && g.pu.some(function (o) { return Math.abs(o.x - lx) < g.W / 4; }));
      g.pu.push({ type: 'life', x: lx, y: g.ceil + 4, vy: Math.max(70, g.H * .22) });
      g.lifeT = B.LIFE_EVERY * (.9 + Math.random() * .2);
    }
    var p = g.pad;
    g.pu.forEach(function (u) {
      var sz2 = B.puSize(g, u.type);
      u.y += u.vy * dt;
      if (u.y + sz2.h / 2 >= g.py && u.y - sz2.h / 2 <= g.py + 8 && Math.abs(u.x - p.x) < p.w / 2 + sz2.w / 2) { u.got = 1; B.collect(g, u); }
    });
    g.pu = g.pu.filter(function (u) { return !u.got && u.y < g.H + 20; });
  };
  B.collect = function (g, u) {
    g.pops.push({ x: u.x, y: g.py - 24, txt: u.type === 'thru' ? 'FIRE!' : u.type === 'life' ? '+1 LIFE' : 'X' + B.SPLIT, t: 0 });
    for (var k = 0; k < 10; k++) B.debris(g, u.x, g.py, B.COL.lime);
    if (u.type === 'life') { g.lives = Math.min(B.MAX_LIVES, g.lives + 1); return; }
    if (u.type === 'thru') { g.thru = B.THRU_TIME; return; }
    // X6: every ball in play splits into 6, fanned out upwards, up to the cap
    var out = [];
    g.balls.forEach(function (b) {
      var sp = Math.max(260, Math.hypot(b.vx, b.vy));
      for (var i = 0; i < B.SPLIT && out.length < B.MAX_BALLS; i++) {
        var a = (-0.75 + 1.5 * i / (B.SPLIT - 1));
        out.push({ x: b.x, y: Math.min(b.y, g.py - b.r - 2), vx: sp * Math.sin(a), vy: -sp * Math.cos(a), r: b.r, stuck: 0 });
      }
    });
    if (out.length) g.balls = out;
  };
  // Logo cleared: +100K and the win message
  B.winner = function (g) {
    g.score += B.WIN_BONUS; g.win = { t: 0 };
    if (g.score > g.best) { g.best = g.score; try { localStorage.setItem('bbBricksBest', g.best); } catch (e) {} }
  };
  // HUD 'Restore logo' pill, same as the invaders game
  B.pill = function (g, x, right, y) {
    var txt = g.W < 480 ? 'RESTORE' : 'RESTORE LOGO';
    x.font = '700 ' + g.fs + 'px ' + g.font;
    var w = x.measureText(txt).width + g.fs * 1.8, h = Math.round(g.fs * 2.1), px = right - w, py = y - h / 2;
    g.rb = { x: px, y: py, w: w, h: h };
    x.globalAlpha = g.alive < g.total ? 1 : .35;
    x.fillStyle = B.COL.ink; x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, h / 2); else x.rect(px, py, w, h); x.fill();
    x.fillStyle = B.COL.lime; x.textAlign = 'center'; x.fillText(txt, px + w / 2, y + 1);
    x.globalAlpha = 1;
    return px;
  };
  B.draw = function (g) {
    var x = g.ctx, K = B.COL, W = g.W, H = g.H, s = g.s;
    x.clearRect(0, 0, W, H);
    // top and bottom rules: solid ink, 1.5px
    x.fillStyle = K.ink; x.fillRect(0, g.ceil - .5, W, 1.5); x.fillRect(0, H - 18, W, 1.5);
    x.fillStyle = K.ink;
    var gap = s >= 6 ? 1 : .5;
    if (g.mode === 'over') x.globalAlpha = .3;   // logo fades back behind GIT GUD
    g.bricks.forEach(function (k) { if (k.a) x.fillRect(k.x + gap / 2, k.y + gap / 2, s - gap, s - gap); });
    x.globalAlpha = 1;
    x.fillStyle = K.lime; g.flash.forEach(function (f) { x.fillRect(f.x, f.y, s, s); });
    g.parts.forEach(function (q) { x.globalAlpha = Math.max(0, Math.min(1, q.life * 2)); x.fillStyle = q.c; x.fillRect(Math.round(q.x), Math.round(q.y), 2, 2); });
    x.globalAlpha = 1;
    // logo cleared: flickering pixel flames raining down everywhere (behind the win text)
    if (g.win && g.win.flames) {
      x.save(); x.beginPath(); x.rect(0, g.ceil + 1, W, H - 18 - g.ceil - 1); x.clip();
      g.win.flames.forEach(function (q) {
        var fw = B.FIRE[0].length * q.px, fh = B.FIRE.length * q.px;
        B.sprite(x, B.FIRE, Math.round(q.x - fw / 2), Math.round(q.y - fh / 2), q.px, { O: K.ink, L: K.lime, V: K.lav }, Math.floor(g.t * 8 + q.ph) % 2);
      });
      x.restore();
    }
    var p = g.pad;
    x.globalAlpha = g.mode === 'idle' ? .55 : 1;
    x.fillStyle = K.ink; x.fillRect(Math.round(p.x - p.w / 2), g.py, Math.round(p.w), 8);
    x.globalAlpha = 1;
    // balls: lavender; lime fireballs while FIRE is on (flickers in its last second)
    x.fillStyle = g.thru > 0 && (g.thru > 1 || Math.floor(g.t * 10) % 2) ? K.lime : K.ball;
    g.balls.forEach(function (b) { x.fillRect(Math.round(b.x - b.r), Math.round(b.y - b.r), b.r * 2, b.r * 2); });
    // falling power-ups: pixel flame (flickers) and pixel hydra (heads bob)
    var ppx = B.puPx(g), fr = Math.floor(g.t * 6) % 2;
    g.pu.forEach(function (u) {
      var sz = B.puSize(g, u.type), ux = u.x - sz.w / 2, uy = u.y - sz.h / 2;
      if (u.type === 'life') B.sprite(x, B.ELIXIR, ux, uy + Math.round(Math.sin(g.t * 5 + u.x) * 1.5) * ppx, ppx, { X: K.ink, P: K.purp, V: K.lav, L: K.lime, H: '#FFFFFF' });
      else if (u.type === 'thru') B.sprite(x, B.FIRE, ux, uy, ppx, { O: K.ink, L: K.lime, V: K.lav }, fr);
      else { var hk = B.hyScale(g); x.save(); x.translate(Math.round(ux), Math.round(uy + Math.sin(g.t * 4 + u.x) * 2)); x.scale(hk, hk); B.drawHydra(x, 0, 0, B.puPxFor(g, 'x6'), g.t, u.x * .01); x.restore(); }
    });
    // pick-up label: pixel text, rises and fades
    g.pops.forEach(function (q) { x.globalAlpha = 1 - q.t; B.ptext(x, q.txt, q.x, q.y - q.t * 30, ppx, K.lime, 0, 0); });
    x.globalAlpha = 1;
    // logo cleared: +100K and GET THE F*$£ IN! in chunky purple pixel letters, laid out to fit between the top
    // line and the play-again message, bobbing in a wave
    if (g.win) {
      var line2 = 'GET THE F*$\u00a3 IN!', top = g.ceil + 12, avail = (g.py - 72) - top;
      var px2 = Math.max(2, Math.floor(Math.min(W * (W < 600 ? .9 : .62) / B.textW(line2, 1), avail / 27)));
      var px1 = Math.max(3, Math.min(Math.round(px2 * 1.5), Math.floor(W * .9 / B.textW('+100K', 1))));
      var blockH = 9 * px1 + 4 * px2 + 9 * px2, y0 = top + Math.max(0, (avail - blockH) / 2);
      if (g.win.t > .25 || Math.floor(g.win.t * 20) % 2) {
        B.ptext(x, '+100K', W / 2, y0 + px1 + 3.5 * px1, px1, K.purp, .5, g.t);
        B.ptext(x, line2, W / 2, y0 + 9 * px1 + 4 * px2 + px2 + 3.5 * px2, px2, K.purp, .5, g.t + 1);
      }
    }
    // out of lives: GIT GUD, centred in the space the win message uses
    if (g.mode === 'over') {
      var gl = 'GIT GUD', gt = g.ceil + 12, ga = (g.py - 72) - gt;
      var gp = Math.max(2, Math.floor(Math.min(10, W * (W < 600 ? .8 : .45) / B.textW(gl, 1), ga / 9)));   // same size as the invaders game
      if (g.ot > .25 || Math.floor(g.ot * 20) % 2) B.ptext(x, gl, W / 2, gt + ga / 2, gp, K.purp, .5, g.t);
    }
    // HUD
    x.font = '500 ' + g.fs + 'px ' + g.font; x.fillStyle = K.ink; x.textBaseline = 'middle'; x.textAlign = 'left';
    x.fillText('SCORE ' + g.score + '   BEST ' + g.best + '   LIVES ' + g.lives + (g.thru > 0 ? '   FIRE ' + Math.ceil(g.thru) : ''), 16, g.hy);
    var px = B.pill(g, x, W - 16, g.hy);
    x.font = '500 ' + g.fs + 'px ' + g.font; x.fillStyle = K.ink; x.textAlign = 'right';
    x.fillText('LOGO ' + Math.round(100 * g.alive / g.total) + '%', px - 10, g.hy);
    var tap = g.touch ? 'TAP' : 'CLICK';
    var msg = g.mode === 'idle' ? (g.touch ? 'SLIDE TO MOVE · TAP TO PLAY' : 'MOVE TO STEER · CLICK TO PLAY') :
      g.mode === 'serve' ? tap + ' TO LAUNCH' :
      g.mode === 'over' ? 'GAME OVER · ' + g.score + ' PTS · ' + tap + ' TO PLAY AGAIN' :
      g.mode === 'clear' ? g.score + ' PTS · ' + tap + ' TO PLAY AGAIN' : '';
    if (msg) {
      var ms = Math.max(12, Math.min(16, Math.round(W / 90))), bh = Math.round(ms * 2.5);
      x.font = '700 ' + ms + 'px ' + g.font; var tw = x.measureText(msg).width + ms * 2.4, cy = g.py - 44;
      x.fillStyle = K.ink; x.beginPath(); if (x.roundRect) x.roundRect(W / 2 - tw / 2, cy - bh / 2, tw, bh, bh / 2); else x.rect(W / 2 - tw / 2, cy - bh / 2, tw, bh); x.fill();
      x.fillStyle = K.lime; x.textAlign = 'center'; x.fillText(msg, W / 2, cy + 1);
    }
  };
  B.input = function (g) {
    var cv = g.cv, drag = null;
    function rx(e) { return e.clientX - cv.getBoundingClientRect().left; }
    function inPill(e) {
      var r = cv.getBoundingClientRect(), b = g.rb, px = e.clientX - r.left, py = e.clientY - r.top;
      return b && px >= b.x - 6 && px <= b.x + b.w + 6 && py >= b.y - 6 && py <= b.y + b.h + 6;
    }
    cv.addEventListener('pointerdown', function (e) {
      if (inPill(e)) { B.reset(g); return; }
      drag = { x: rx(e), p: g.pad.x, moved: false, touch: e.pointerType !== 'mouse' };
      if (!drag.touch) { g.moved = true; g.pad.x = rx(e); }
    });
    cv.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse') { g.moved = true; g.pad.x = rx(e); return; }
      if (!drag) return;
      var dx = rx(e) - drag.x;
      if (Math.abs(dx) > 6) { drag.moved = true; g.moved = true; }
      g.pad.x = drag.p + dx * 1.4;   // relative steering: small thumb moves, start anywhere
    });
    cv.addEventListener('pointerup', function () { if (drag && !drag.moved) B.launch(g); drag = null; });
    cv.addEventListener('pointercancel', function () { drag = null; });
    // stop sideways drags on the game from swiping the page; vertical scrolling still works (touch-action: pan-y)
    cv.addEventListener('touchmove', function (e) { if (drag && drag.moved) e.preventDefault(); }, { passive: false });
    // keys live on window, so they're removed again when the game stops (the footer arcade swaps games)
    g.kd = function (e) {
      if (!g.vis || !g.focus) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); g.moved = true; }
      g.keys[e.key] = true; if (e.key === ' ') B.launch(g);
    };
    g.ku = function (e) { g.keys[e.key] = false; };
    window.addEventListener('keydown', g.kd);
    window.addEventListener('keyup', g.ku);
    cv.addEventListener('pointerenter', function () { g.focus = true; });
  };
})();

// mount on the Services footer (also after Barba page transitions)
(function () {
  var B = window.BBB;
  function footer() {
    var f = document.querySelector(B.SEL);
    if (f) return f;
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (B.PATHS.indexOf(path) < 0) return null;
    var cs = document.querySelectorAll('[data-barba="container"]'), c = cs[cs.length - 1];
    return (c && c.querySelector('.bb-footer')) || document.querySelector('.bb-footer');
  }
  B.mount = function (f0, theme) {
    if (B.g) { B.g.stop(); B.g = null; }
    var f = f0 || footer();
    if (!f) return false;
    B.setTheme(theme);
    f.classList.add('bbbrk-on');
    var st = f.querySelector('.bbbrk-stage');
    if (!st) { st = document.createElement('div'); st.className = 'bbbrk-stage'; st.innerHTML = '<canvas aria-label="Mini game: break the Brave Beyond logo brick by brick"></canvas>'; f.insertBefore(st, f.firstChild); }
    var cv = st.querySelector('canvas'), best = 0;
    try { best = +localStorage.getItem('bbBricksBest') || 0; } catch (e) {}
    var g = { st: st, cv: cv, ctx: cv.getContext('2d'), pad: { x: 0, w: 80 }, keys: {}, flash: [], parts: [], pops: [], pu: [], balls: [], thru: 0, puT: 10, bricks: [], t: 0, W: 0, best: best, mode: 'idle', vis: true, focus: false, moved: false,
      touch: window.matchMedia && matchMedia('(hover: none)').matches, rm: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      font: getComputedStyle(document.body).fontFamily || 'sans-serif' };
    B.input(g); B.size(g);
    var raf = 0, last = performance.now(), dead = false;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { B.size(g); }) : null;
    if (ro) ro.observe(st);
    function loop(now) {
      if (dead || !cv.isConnected) return;
      var dt = Math.min(.033, (now - last) / 1000); last = now;
      if (!g.W) B.size(g);
      var r = st.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      g.vis = r.bottom > 0 && r.top < vh && r.width > 0;
      if (g.vis) { B.update(g, dt); B.draw(g); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    g.stop = function () {
      dead = true; g.vis = g.focus = false; cancelAnimationFrame(raf); if (ro) ro.disconnect();
      window.removeEventListener('keydown', g.kd); window.removeEventListener('keyup', g.ku);
    };
    B.g = g;
    return true;
  };
  // started by the footer arcade (18-footer-arcade.js)
  (window.BBARCADE = window.BBARCADE || []).push({ id: 'bricks', name: 'Bricks', themes: ['green', 'purple'],
    ns: ['services'], paths: B.PATHS, cls: 'bbbrk-on', stage: '.bbbrk-stage',
    mount: function (f, t) { return B.mount(f, t); }, stop: function () { if (B.g) { B.g.stop(); B.g = null; } } });
})();
