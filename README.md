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
- `bb-site.js`: commit `225cb1f90d57c2d954ac43a17f2306fb9bbc1e9f` (BB Site Bundle 1.7.9, staging only: hydra power-up in the Services footer bricks game drawn at 70% on phone widths (under 600px); live is still 1.7.8 `dc1bf51`)
- Previous live: head 1.0.7 (`a913f9e`), site 1.7.2 (`3db7daa`)

## Rolling back

The original 15 scripts are still registered in Webflow (Site settings > Custom code > Registered scripts). Re-applying them and removing the two bundles restores the old setup exactly.

Every file is wrapped in its own try/catch in the bundle, so if one feature breaks, the console shows `[bb] filename` and the rest of the site keeps working.

## Footer game

`src/site/11-footer-invaders.js` runs on pages listed in `B.SEL` (currently `home` and `goodies` Barba namespaces). Every other page keeps the normal footer logo with hearts.

## Hero videos

`Brave_Hero_Chrome.webm` and `Brave_Hero_Safari.mov` are served from `@main` by `src/site/04-transition-reveal-fix.js`.
