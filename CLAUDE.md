# Brave Beyond website (bravebeyond.com)

James's studio site. Built in Webflow, with custom JS served from this repo via jsDelivr. See README.md for the full release workflow and the current live commits.

## Keep it cheap
- Work in small steps, one task per chat.
- Don't paste large files (logo paths, full scripts) into the chat; read only the file you need.
- Small tweaks: one quick check, no screenshots or staging run unless asked.
- Show James a preview before pushing new features; small fixes he's approved can go straight out.

## Where things live
- Webflow site ID: 683b15fc7583963ba10b4d51. Staging: https://brave-beyond-1620a0-6b3e3-02af519fdc4e3.webflow.io. Live custom domain IDs: 684105c8617e7ac784c44808, 684105c7617e7ac784c447fa.
- Branch site-script-bundle holds the bundle work. Hero videos load from @main.
- src/head/*.js -> dist/bb-head.js (styles). src/site/*.js -> dist/bb-site.js (everything else). Build: npm install && npm run build.
- Webflow loads only 2 registered scripts: "BB Head Bundle" (header) and "BB Site Bundle" (footer). Webflow caps site scripts at 15 and inline scripts at 2000 chars, so new code goes in the bundle.
- Site freeform footer code holds Barba page transitions, footer logo bend, nav logo flip. Pages swap via Barba: hook barba.hooks.after for anything that must re-run.

## Releasing a change
1. Edit src, npm run build, commit, push (tag pushes are blocked; pin by commit).
2. Hash: openssl dgst -sha384 -binary dist/bb-site.js | openssl base64 -A
3. Register a new version of the hosted script in Webflow at https://cdn.jsdelivr.net/gh/Jame55-Design/brave-beyond-web@<full-commit>/dist/bb-site.js with integrity sha384-..., then apply that version. Never use @main.
4. Publish (staging only unless James says live; once per minute max).
5. Update "Current release" in README.md.

## Brand
- Main Green #07A87E, Purps #AE9AE4, ink #000101, lime #CEFF38, lavender #E9DBEC, score flash #CCFF00.
- Plain text only: no text shadows or effects unless asked.
- Contact + privacy pages are purple; home and Free Goodies footers are green.

## Button rules (always follow these; James shouldn't have to ask)
- Never invent a new button style. Every button on the site is one of the two below. If something genuinely needs a third kind, ask James before building it.
- **Outline squiggle button** (page-level actions, e.g. "Drop me an email", NEXT GAME): the site's .button or any element with data-squiggle, so 02-squiggle-buttons.js handles it. Ink 1px outline pill (radius 80px), transparent, ink text, sparkle on the right. Hover: the ink squiggle draws in and fills it, text turns Purps, sparkle jumps to the left in white.
- **Solid reverse-squiggle button** (actions inside the footer games: Play again, Restore logo, Play): always made with BBPILL.place (src/site/10z-footer-pill.js). Solid ink pill with a sparkle; text light pink #E8CAE9 on green backgrounds, lime #CCFF00 on Purps. Hover: a squiggle in the background colour wipes it clear to an ink outline with ink text, with a small bounce.
- Sizes are fixed. Main: 40px tall, 13px text, 18px side padding (36px / 12px / 15px under 480px wide). Small (score bars only): 30px tall, 11px text (28px on phones). Sparkle 12px (10px small), 10px gap.
- Text: uppercase, weight 600, the site font (Overused Grotesk). Never 700/bold, never text shadows or effects.
- Every press plays out before it acts (about 0.4s): the button dips (scale .94), the squiggle runs (on phones it starts on touch), then the action happens and the button resets. prefers-reduced-motion: no animation, act straight away.
- Buttons are real <button> elements, never drawn into a canvas. The only exception is the Hoops Recorder video, where BBPILL.draw paints the same look so it shows in the recording.
- Only clickable things look like buttons. Instructions and results ("Move here to play", "Game over · 120 pts") are plain uppercase text (BBPILL.say), never in a pill.
- After changing any button, check it on a phone width and a desktop width, on a green and a purple background, at rest and on hover/press.

## Footer game (src/site/11-footer-invaders.js)
- Runs on Barba namespaces home and goodies only (B.SEL). Other pages keep the logo with footer hearts.
- Reads logo paths from the footer SVG at runtime; no need to copy logo data.
- Test without a visible browser by stepping BBI.update(g, 1/60) and BBI.draw(g) on BBI.g.

## Footer bricks (src/site/12-footer-bricks.js)
- Brick breaker on the Services footer (namespace services or /services path). Bricks are the stacked logo (paths embedded, from the design system), gaps opened before pixelating.
- Keeps Instagram, Privacy Policy and the rights line under the game. Top and bottom rules are 1.5px solid ink.
- Power-ups drop from the top about every 10s while playing (B.PU_EVERY), drawn as pixel sprites: FIRE flame (ball becomes a lime fireball that cuts through bricks, B.THRU_TIME s) and HYDRA (each ball splits into 6, capped at B.MAX_BALLS). The hydra is James's own Brave_Hydra.svg sampled to an 88x85 pixel grid (B.HYDRA); tongues are letter-staged per tongue (B.TONGUES) so they flick out and in. Each head (B.HEADS: eye centre + neck direction) is cut out along its neck and wiggles by a pixel on its own; body and head layers are cached to offscreen canvases.
- Extra-life ELIXIR (pixel potion) drops about every 30s on its own timer (B.LIFE_EVERY), away from anything already falling; +1 life up to B.MAX_LIVES (9).
- 5 lives (B.LIVES). Clearing the logo adds +100K (B.WIN_BONUS) and shows GET THE FUCK IN! in chunky purps pixel letters (B.FONT 5x7, drawn 2px wide) while pixel flames rain down everywhere (fewer on phones).

## Footer cats (src/site/15-footer-cats.js)
- "Cat Noms" pixel whack-a-mole (feed fish biscuits) on the Contact footer (K.SEL / K.PATHS). 30s rounds, combos to x4, golden lucky cat (K.LUCKY).
- Box logo reuses BBB.LOGO from 12-footer-bricks.js. Detects a Purps footer: Lilac boxes, no Purps cats, Purps markings swap to Mint, adds the Main Green tiger (Battle Cat nod).
- Boxes never spread wider than K.MAX_SPAN (960px). Canvas is K.SKY (1.4) x gameH tall, open space above the boxes; kept close to the other games' heights. Mouse becomes the pixel fish over the game and the site's .custom-cursor hides. Stepping up a combo level pops a big Pink (#E8CAE9) 'xN COMBO' in the middle.
- When time runs out: cats duck in, no new ones, big Pink TIME'S UP + score (or NEW BEST) and a centred Play again button (active after 0.6s). Cats can't be tapped on that screen.
- Test: BBC.update(BBC.g, 1/60); BBC.draw(BBC.g).

## Footer backpack (src/site/19-footer-backpack.js)
- Ride a Brave Beyond backpack on a skateboard along the footer: catch good design (swatches, James's pencil, bézier curve, camera +10; lime golden spiral +25; headphones +40 with lime fades and notes), dodge glitching bad design (Comic Sans at a slant, low-res JPEG, crumpled paper, colour bars) -15. 45s rounds, best in localStorage bbBackpackBest.
- Bag + board are James's master SVG (BP.BAG_SVG, Illustrator metadata stripped); wheels redrawn so they roll and turn lime on a catch, grab loop goes lime, bag squashes. Caught items poke out along the domed top; a bad catch knocks two out.
- Green and purple sets: on Purps every #AE9AE4 part goes Main Green and the green pencil replaces the purple one (BP.PENCIL_SVG).
- In the arcade rotation on both footers, no page default yet (ns: []). Play / Play again via BBPILL.place; instructions and results via BBPILL.say.
- The site's custom cursor stays visible over the game (unlike cats). Pencil is drawn 1.55x item size long and 1.6x wide so it stands out.
- Parked (not in the file): side-on pavement + storm drain with eyes and a grabbing hand, waiting on James's hand artwork.
- Test: BBBP.update(BBBP.g, 1/60); BBBP.draw(BBBP.g).

## Footer arcade (src/site/18-footer-arcade.js)
- Every footer can play every footer game. Games no longer start themselves: each registers on window.BBARCADE ({ id, name, themes, ns, paths, cls, stage, mount(footer, theme), stop }) and the arcade starts one.
- Page defaults: invaders on home + goodies, bricks on services, cats on contact (from each game's ns / paths). Other pages keep the logo + hearts with a PLAY A GAME pill.
- NEXT GAME button styled like the site's squiggle buttons (outline pill + sparkle, data-squiggle so 02-squiggle-buttons.js fills it on hover) sits at the top of the footer and cycles the games that have a colour set for the footer background. A press plays out (A.go): button dips, squiggle fills, old game fades out, next fades in, button clears.
- Footer colour = first painted background behind the footer: Purps -> 'purple', anything else -> 'green'. Every game has both sets (invaders/bricks: Purps bits swap to Main Green, blob bullets and the bricks ball go ink; cats: 'lilac' set; hoops: H.THEMES).
- Only one game runs at a time; switching calls stop(), removes the game's stage and its -on class. Bricks removes its window key listeners on stop.
- Hoops (17) has no page default yet (ns: []). High balls fly on over the button (a .bbhp-sky canvas above the stage) and bounce off the top of the footer. Its stand-alone preview / recorder page sets window.BBH_PREVIEW and window.BBH_FRAME.
- One button family across every game (src/site/10z-footer-pill.js): every clickable thing is a real button made by BBPILL.place over the canvas, same pill + sparkle + reverse squiggle as Play again. Main size (Play again in all four games) matches NEXT GAME; size 'hud' (30px / 28px phones) for score-bar buttons (Restore logo in invaders + bricks, Play in cats). Instructions and results (Move here to play, Game over · 120 pts) are plain text via BBPILL.say, never a pill. BBPILL.draw only remains for the Hoops Recorder video.
- Hoops settles its streak in throw order (H.resolve): a ball counts as a miss the moment it lands unscored, and later baskets can't start YOU'RE ON FIRE until every earlier ball is settled. Once he has the kicks, baskets stay x2 for the rest of the round even after the fire goes out (x2 max, no stacking; HUD shows KICKS x2).
