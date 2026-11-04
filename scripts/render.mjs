// render.mjs — styleframes / stills sheets / single frames from a seek(t) page (no video; use render_chunks.mjs for video).
//   node render.mjs film.html sheet.png --stills 0.5,1.2,3     [--cols 4] [--w 360]   contact sheet of exact times
//   node render.mjs film.html frames/ --frames 0.5,1.2          one full-size PNG per time
//   node render.mjs film.html sheet.png --scenes [--at mid|end] one frame per scene (window.BOARD or window.SCENES)
//   node render.mjs film.html report.txt --check [step=0.1]       safe-zone + overlap scan (window.checkLayout) + missed word cues (window.MISS)
// Always write a NEW filename per pass (viewers cache images).
import { chromium } from 'playwright'; import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const a = process.argv.slice(2), [html, out, mode, list] = a, opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
if (!html || !out || !mode) { console.log('usage: see header'); process.exit(1); }
const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
const probe = await b.newPage(); await probe.goto(pathToFileURL(path.resolve(html)).href + '?render');
await probe.waitForFunction(() => window.VIDEO && typeof window.seek === 'function'); const V = await probe.evaluate(() => window.VIDEO); await probe.close();
const p = await b.newPage({ viewport: { width: V.w, height: V.h } }); const errs = [];
p.on('pageerror', e => { errs.push(e.message); console.error('PAGE ERROR:', e.message); });
await p.goto(pathToFileURL(path.resolve(html)).href + '?render'); await p.evaluate(async () => { await document.fonts.ready; if (window.ready) await window.ready; });
let T;
if (mode === '--check') { const step = +(list || .1);
  const r = await p.evaluate(step => { const o = new Map(); for (let t = 0; t < VIDEO.duration; t += step) (window.checkLayout ? window.checkLayout(t) : []).forEach(x => { const key = x.replace(/ @[\d.]+$/, '').replace(/\[.*?\]|\(.*?\)/g, ''); if (!o.has(key)) o.set(key, x); }); return { issues: [...o.values()], miss: window.MISS || [] }; }, step);
  const txt = [`layout issues: ${r.issues.length}`, ...r.issues, `missed word cues: ${r.miss.length} ${r.miss.join(' ')}`, `page errors: ${errs.length}`, ...errs].join('\n');
  writeFileSync(out, txt + '\n'); console.log(txt); await b.close(); process.exit(r.issues.length || r.miss.length || errs.length ? 1 : 0); }
if (mode === '--scenes') { const at = opt('--at') || 'mid';
  T = await p.evaluate(at => (window.BOARD || window.SCENES || []).map(s => s.key ?? (at === 'end' ? s.t1 - .3 : (s.t0 + s.t1) / 2)), at); }
else T = list.split(',').map(Number);
const shot = async t => { await p.evaluate(t => window.seek(t), t); return p.screenshot({ type: 'png' }); };
if (mode === '--frames') { mkdirSync(out, { recursive: true }); for (const t of T) writeFileSync(path.join(out, `f_${t.toFixed(2)}.png`), await shot(t)); }
else { const d = out + '.tmp'; mkdirSync(d, { recursive: true });
  for (let i = 0; i < T.length; i++) writeFileSync(`${d}/${String(i).padStart(3, '0')}.png`, await shot(T[i]));
  const cols = +(opt('--cols') || Math.min(T.length, V.w > V.h ? 3 : 6)), w = +(opt('--w') || (V.w > V.h ? 640 : 300));
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', `${d}/%03d.png`, '-vf',
    `scale=${w}:-2,drawtext=text='%{n}':x=8:y=8:fontsize=${Math.round(w / 12)}:fontcolor=yellow:box=1:boxcolor=black@0.7,tile=${cols}x${Math.ceil(T.length / cols)}:padding=6:color=gray`, '-frames:v', '1', out], { stdio: 'inherit' });
  rmSync(d, { recursive: true }); if (r.status) process.exit(1); }
await b.close(); console.log('stills ->', out, '@', T.map(t => t.toFixed(2)).join(','), errs.length ? `(${errs.length} page errors)` : '');
