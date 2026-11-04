// inline-fonts.mjs — build film.html from film.src.html: /*FONTS*/ -> base64 @font-face, /*WORDS*/ -> words.json (optional).
//   node inline-fonts.mjs film.src.html film.html "Cairo|200 1000|fonts/Cairo.ttf" ["Figtree|300 900|fonts/Figtree.ttf"] [--words words.json]
// Adapted from Barty-Bart/motion-graphics (MIT).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const a = process.argv.slice(2); const wi = a.indexOf('--words'); let words = null;
if (wi >= 0) { words = a[wi + 1]; a.splice(wi, 2); }
const [src, out, ...specs] = a;
if (!src || !out) { console.log('usage: node inline-fonts.mjs src.html out.html "Family|weights|file" ... [--words words.json]'); process.exit(1); }
const fmt = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };
const css = specs.map(s => { const [fam, wt, file] = s.split('|'); if (!existsSync(file)) throw new Error('font not found: ' + file);
  const ext = file.split('.').pop().toLowerCase();
  return `@font-face{font-family:'${fam}';font-weight:${wt};font-style:normal;font-display:block;src:url(data:font/${ext};base64,${readFileSync(file).toString('base64')}) format('${fmt[ext]}');}`; }).join('\n');
let html = readFileSync(src, 'utf8').replace('/*FONTS*/', css);
if (html.includes('/*WORDS*/')) html = html.replace('/*WORDS*/', words ? JSON.stringify(JSON.parse(readFileSync(words, 'utf8'))) : 'null');
writeFileSync(out, html);
console.log(out, (css.length / 1024 | 0) + ' KB of fonts' + (words ? ', words from ' + words : ''));
