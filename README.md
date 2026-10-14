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
- `bb-head.js`: commit `1ab765e11d13450d53168edcff4cb03c6a774b47` (BB Head Bundle 1.0.8, live: Blog links hidden in all menus via src/head/08-hide-blog-links.js; delete that file to bring Blog back)
- `bb-site.js`: commit `b69a861cbd11f7b683d981153766694e4b1bafa5` (BB Site Bundle 1.8.2, live: invaders game has 5 blob waves then a hydra FINAL WAVE (3 hits each, fires from all three heads, twice as fast), win screen with +100K and GET THE FUCK IN!, GIT GUD on game over in both footer games; plus the smaller hydra power-up on phones/iPads from 1.7.10)
- Previous live: head 1.0.7 (`a913f9e`), site 1.7.10 (`6306ca4`)

## Rolling back

The original 15 scripts are still registered in Webflow (Site settings > Custom code > Registered scripts). Re-applying them and removing the two bundles restores the old setup exactly.

Every file is wrapped in its own try/catch in the bundle, so if one feature breaks, the console shows `[bb] filename` and the rest of the site keeps working.

## Footer game

`src/site/11-footer-invaders.js` runs on pages listed in `B.SEL` (currently `home` and `goodies` Barba namespaces). Every other page keeps the normal footer logo with hearts.

## Hero videos

`Brave_Hero_Chrome.webm` and `Brave_Hero_Safari.mov` are served from `@main` by `src/site/04-transition-reveal-fix.js`.
