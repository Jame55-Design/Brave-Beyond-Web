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
- Boxes never spread wider than K.MAX_SPAN (960px). Footer is twice gameH tall (open space above boxes). Mouse becomes the pixel fish over the game and the site's .custom-cursor hides. Stepping up a combo level pops a big Pink (#E8CAE9) 'xN COMBO' in the middle.
- When time runs out: cats duck in, no new ones, big Pink TIME'S UP + score (or NEW BEST) and a centred Play again button (active after 0.6s). Cats can't be tapped on that screen.
- Test: BBC.update(BBC.g, 1/60); BBC.draw(BBC.g).
