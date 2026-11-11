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
- STAGING ONLY (not live yet): `bb-head.js` + `bb-site.js` at commits head `80b7535` / site `03c12ec0ca96e7317e411a0e7bc3f63433c1b8fe` (BB Head Bundle 1.0.14, BB Site Bundle 1.13.0: DO IT! words + pixel controllers pop out on hover/tap of the heading, src/site/18b-footer-doit.js; bold "Fancy a game? / Take five. Go on." intro above the footer arcade button, cream on the 404 page). Before that on staging: 1.0.13 / 1.12.0 at `81ea17a` (new 404 page). Live is still the two lines below until the site is published to the custom domains.
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
