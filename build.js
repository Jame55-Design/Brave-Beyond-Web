// Builds the two site bundles Webflow loads:
//   dist/bb-head.js  <- every file in src/head (loaded in the page <head>)
//   dist/bb-site.js  <- every file in src/site (loaded before </body>)
// Files run in filename order. Each one is wrapped so an error in one
// feature is logged to the console and doesn't stop the others.
// Run: npm run build
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function bundle(dir, out) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  const parts = files.map(f => {
    const code = fs.readFileSync(path.join(dir, f), 'utf8');
    return `/* ${f} */\ntry{\n${code}\n}catch(e){console.error('[bb] ${f}',e)}`;
  });
  const result = await minify(parts.join('\n'), { compress: true, mangle: true, ecma: 2017, format: { comments: false } });
  const banner = `/* Brave Beyond site scripts | ${path.basename(out)} | built ${new Date().toISOString()} | ${files.join(', ')} */\n`;
  fs.writeFileSync(out, banner + result.code + '\n');
  console.log(`${out}: ${files.length} files, ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
}

(async () => {
  fs.mkdirSync('dist', { recursive: true });
  await bundle('src/head', 'dist/bb-head.js');
  await bundle('src/site', 'dist/bb-site.js');
})();
