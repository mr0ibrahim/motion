// storyboard.mjs — the STORYBOARD deliverable, generated from the film page itself (so it never drifts from the edit).
//   node storyboard.mjs film.html outBase [--template ../templates/storyboard.html] [--title "Project"]
//   -> outBase.html (self-contained, thumbnails embedded), outBase.png (full sheet), outBase.pdf (A4/A3 print), outBase.json
// Reads window.BOARD = [{n, t0, t1, key?, shot, vo, text, motion, transition, sfx, notes?}] (the template fills it from scene()).
// Works for styleframe-stage pages too: scenes with only a static layout still produce a frame.
import { chromium } from 'playwright'; import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const a = process.argv.slice(2), [html, base] = a, opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const here = path.dirname(fileURLToPath(import.meta.url));
const tpl = readFileSync(opt('--template', path.join(here, '../templates/storyboard.html')), 'utf8');
const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
let p = await b.newPage(); await p.goto(pathToFileURL(path.resolve(html)).href + '?render');
await p.waitForFunction(() => window.VIDEO && typeof window.seek === 'function'); const V = await p.evaluate(() => window.VIDEO); await p.close();
p = await b.newPage({ viewport: { width: V.w, height: V.h } }); await p.goto(pathToFileURL(path.resolve(html)).href + '?render');
await p.evaluate(async () => { await document.fonts.ready; if (window.ready) await window.ready; });
const B = await p.evaluate(() => (window.BOARD || []).map(x => ({ ...x })));
if (!B.length) { console.error('page has no window.BOARD'); process.exit(2); }
const fmt = t => { const m = Math.floor(t / 60), s = (t - m * 60).toFixed(1).padStart(4, '0'); return `${m}:${s}`; };
for (const x of B) { const k = x.key ?? Math.min(x.t1 - .25, x.t0 + Math.max(.9, (x.t1 - x.t0) * .6));
  await p.evaluate(t => window.seek(t), k); x.img = 'data:image/jpeg;base64,' + (await p.screenshot({ type: 'jpeg', quality: 80, scale: 'css' })).toString('base64'); x.key = k; }
await p.close();
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const portrait = V.h > V.w, title = opt('--title', path.basename(html, '.html'));
const cards = B.map(x => `<article class="panel"><div class="thumb" style="aspect-ratio:${V.w}/${V.h}"><img src="${x.img}"><span class="num">${x.n}</span></div>
<div class="meta"><div class="time">${fmt(x.t0)} – ${fmt(x.t1)} <b>${(x.t1 - x.t0).toFixed(1)}s</b> · key ${fmt(x.key)}</div>
${x.shot ? `<div class="shot">${esc(x.shot)}</div>` : ''}<dl><dt>VO</dt><dd dir="auto">${esc(x.vo) || '—'}</dd><dt>On-screen</dt><dd dir="auto">${esc(x.text) || '—'}</dd>
<dt>Motion</dt><dd>${esc(x.motion) || '—'}</dd><dt>Transition</dt><dd>${esc(x.transition) || 'cut'}</dd><dt>SFX</dt><dd>${esc(x.sfx) || '—'}</dd>${x.notes ? `<dt>Notes</dt><dd>${esc(x.notes)}</dd>` : ''}</dl></div></article>`).join('\n');
const info = `${V.w}×${V.h} · ${fmt(V.duration)} · ${B.length} panels · generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
const out = tpl.replace(/<!--[\s\S]*?-->/g, '').replaceAll('{{TITLE}}', () => esc(title)).replaceAll('{{INFO}}', () => info)
  .replaceAll('{{COLS}}', () => String(portrait ? (B.length <= 5 ? 5 : 4) : 3)).replaceAll('{{PANELS}}', () => cards);
mkdirSync(path.dirname(path.resolve(base)), { recursive: true }); writeFileSync(base + '.html', out); writeFileSync(base + '.json', JSON.stringify(B.map(({ img, ...r }) => r), null, 1));
const s = await b.newPage({ viewport: { width: 1800, height: 1000 } }); await s.goto(pathToFileURL(path.resolve(base + '.html')).href);
await s.screenshot({ path: base + '.png', fullPage: true });
await s.pdf({ path: base + '.pdf', format: 'A3', landscape: true, printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
await b.close(); console.log('storyboard ->', base + '.{html,png,pdf,json}', `(${B.length} panels)`);
