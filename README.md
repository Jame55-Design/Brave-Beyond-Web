# Brave Beyond web

Custom code for bravebeyond.com. Webflow loads two bundles from this repo through jsDelivr, so the site only uses two of Webflow's 15 script slots.

| Bundle | Built from | Loaded in |
| --- | --- | --- |
| `dist/bb-head.js` | `src/head/*.js` (styles: nav, goodies, radial cards, nav page colours) | Page head |
| `dist/bb-site.js` | `src/site/*.js` (hearts, buttons, transition fix, wave text, nav, submit, goodies, radial cards, footer game) | Before `</body>` |

## Changing something

1. Edit or add a file in `src/head` or `src/site`. Files run in filename order, so keep the number prefix.
2. `npm install` (first time only), then `npm run build`.
3. Commit and push.
4. In Webflow, register a new version of "BB Site Bundle" (or "BB Head Bundle") pointing at that commit, with its sha384 integrity hash (Claude can do this step):
   `https://cdn.jsdelivr.net/gh/Jame55-Design/brave-beyond-web@<commit-hash>/dist/bb-site.js`
   A tag (`@v1.0.1`) works the same way.

Always pin to a commit or tag, never `@main`. jsDelivr caches `@main` for up to 12 hours and Webflow checks each file against a fixed integrity hash, so a changing file would be blocked.

Current release:
- STAGING (19 Nov 2026, not yet live): `bb-site.js` 1.16.12 at `69619c1781573eb8db8712fdb3601e5435e40678` (on top of live 1.16.9: draggable wall stickers (1.16.10), desktop hoops pull sweet spot (1.16.11), and footer games fit under the nav on short laptop screens (shared height capped at window height - nav - 16px, 992px+, min 440; games re-size on window resize)).
- LIVE since 18 Nov 2026, 12:00 (bravebeyond.com + www): `bb-site.js` 1.16.9 at `566ae0abfd2f61c862ecc846e3fb3b03a092ead9` (on top of live 1.16.6: hoops pixel brick wall with graffiti tags (H.drawWall, H.GRAFF) at the right end of the court, desktop only (H.WALL_MIN 992px; phones and tablets bounce off the footer edge); ball dots fit before BEST on phones). 1.16.7 / 1.16.8 were earlier wall previews. To drop the wall: set H.WALL_MIN to 99999 (or re-apply 1.16.6, which is the previous live version).
- LIVE since 18 Nov 2026, 03:50 (bravebeyond.com + www): `bb-site.js` 1.16.6 at `7b829b7e2ccde80271187354adf8ef2d8bd6bf5c` (Fancy a game? pop-outs: bubble PLAY words replace DO IT!, letters step up while the extrusion stretches out; Purps + deep plum on green and ink footers, Main Green + mint on the Purps footer). Includes 1.16.5 below.
- LIVE since 18 Nov 2026, 03:18 (bravebeyond.com + www): `bb-site.js` 1.16.5 at `98736e0973ab8318ae9d6c958ac5d36ccba2ad8b` (consistent footer layout: one top padding for every arcade footer, with or without a game (.bbarc-on, 4vw / 24px); every game's score bar uses the footer's side padding (5vw, 16px under 560px) and sits on g.hy, so NEXT GAME stays put). Includes 1.16.4 and 1.16.3 below.
- STAGING: `bb-site.js` 1.16.4 at `65787db7fc67c7e180bd1199ccc8fb8976d5abbc` (every footer game is the same height as invaders at that width, via BBI.heightFor(W); the extra goes into the sky, or above the paddle in bricks). Includes 1.16.3 below.
- STAGING: `bb-site.js` 1.16.3 at `eb9e8190d3d1be26a4c02501a9c5e452ad288672` (hoops: court capped at 1440px wide (H.MAX_W) and centred on wider screens, so the far hoop stays in reach and fewer shots hit the top; score bar and floor still full width). Head unchanged (1.0.16).
- LIVE since 16 Nov 2026, 07:50 (published to bravebeyond.com + www; nothing newer on staging): `bb-head.js` 1.0.16 + `bb-site.js` 1.16.2, both at `58771b0424b745c070d920e1889a4d90f0694166` (includes 1.15.0, the CONTACT ME button and small footer logo from 1.16.0 / 1.16.1; latest change: 404: smooth number intro that plays after load with the footer held until it finishes; shorter hero so Fancy a game? shows on the first screen). Earlier releases, all now live: `bb-head.js` 1.0.15 at `41df32a` + `bb-site.js` 1.16.1 at `532300f1b152ad6fb2133a3ea7f5ad73ee758b4b` (tighter spacing round the small logo) on top of 1.16.0 (CONTACT ME outline button under Instagram on every footer except /contact; small hearts logo .bbft-lm2 above the privacy links while a game runs; cream on 404).
- LIVE (published 2026-11-16): `bb-site.js` 1.15.0 at `050305dbcb7c82ef86fa0f026493490c5649ef9a` (NEXT GAME is the only score-bar button: Restore logo removed from invaders + bricks, Play removed from cats; feeding a cat or tapping the game starts cats). Head unchanged (1.0.14).
- Previous live release (16 Nov 2026, 02:50): `bb-head.js` 1.0.14 at `80b7535`, `bb-site.js` 1.14.2 at `d529e9367b653ca09cde3ce6eb5ac39668cdfd43` (new 404 page with the ink set for the games, DO IT! words, NEXT GAME in the score bar; latest change: backpack swatches and camera take a deep purple line on the 404 page). Staging history before this went live: site 1.14.1 at `1433ce8011b8e0b226e33e1352ae0967d96d2a68` (404 ink set, second pass: deep purple outline on the bricks flame and elixir, the hoops flame and high-tops; Purps hoops catapult; backpack camera, swatch, pencil and twinkle fixes). Before that on staging: site 1.14.0 at `e59e96ab7b30739eb4304c7d58aaebd613a825eb` (NEXT GAME moved into each game's score bar as the small solid button, far right; top button is only PLAY A GAME and hides once a game runs). Earlier staging: site 1.13.1 (404 ink set fixes), 1.13.0 (DO IT! pop-outs), 1.12.x (Fancy a game? intro). The two lines below are the previous live release (head 1.0.12, site 1.11.4).
- `bb-head.js`: commit `b715dd92e400a364a72fe3b4c4db605fb88b5d41` (BB Head Bundle 1.0.12, live: cookie consent banner (z-index 99990, just under the custom cursor) with an animated Purps cookie that gets bitten (scalloped bites, crumbs, pops back; still with one bite under reduced motion) + Google Analytics G-GGV0NKKR7H + "Cookie Settings" footer pill, all in src/head/09-cookie-consent.js). Previous head 1.0.11 (`8442db0`). Blog links hidden in all menus via src/head/08-hide-blog-links.js; delete that file to bring Blog back)
- `bb-site.js`: commit `c2dca411f689e2acc47e69da7a3cde27792ed6cd` (BB Site Bundle 1.11.4, live: backpack footer game (src/site/19-footer-backpack.js): catching Comic Sans is an instant pixel GAME OVER; side-on pixel pavement; headphones at least twice a round, spiral at least once; chunkier pencil; custom cursor visible)
- Previous live: site 1.11.3 (`425ef07`: pixel pavement)
- Previous live: site 1.11.2 (`0a92858`: guaranteed headphones + spiral)
- Previous live: site 1.11.1 (`bccdc19`: chunkier pencil, visible cursor)
- Previous live: site 1.11.0 (`26c23bf`: backpack game added)
- Previous live: site 1.10.7 (`7f066702b3eea3ba5c6dd3d1ab9139d3ffd8fc0c`: footer arcade swapping invaders, bricks, cats and hoops in green or purple colour sets; one button family in every game (src/site/10z-footer-pill.js); hoops streak settles in throw order; cats height in line with the other games); before that 1.10.6 (`d24403a`), 1.10.5 (`6f43172`), 1.10.0 (`b0672bb`), 1.9.7 (`19a8355`)

## Rolling back

The original 15 scripts are still registered in Webflow (Site settings > Custom code > Registered scripts). Re-applying them and removing the two bundles restores the old setup exactly.

Every file is wrapped in its own try/catch in the bundle, so if one feature breaks, the console shows `[bb] filename` and the rest of the site keeps working.

## Footer game

`src/site/11-footer-invaders.js` runs on pages listed in `B.SEL` (currently `home` and `goodies` Barba namespaces). Every other page keeps the normal footer logo with hearts.

## Hero videos

`Brave_Hero_Chrome.webm` and `Brave_Hero_Safari.mov` are served from `@main` by `src/site/04-transition-reveal-fix.js`.
