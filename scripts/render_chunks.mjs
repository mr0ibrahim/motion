// render_chunks.mjs — DEFAULT renderer. Robust, resumable, parallel: a seek(t) page -> outDir/cNNN.mp4 chunks + list.txt.
//   node render_chunks.mjs film.html outDir [fps=60] [sub=4] [workers=nproc-1] [chunkFrames=120]
// - duration/size are read from the page (window.VIDEO); nothing is hard-coded.
// - finished chunks are skipped on rerun (resume after a crash: just run the same command again).
// - a fresh browser per chunk (memory/GPU leaks never accumulate on long films); every screenshot has a
//   120 s timeout and up to 3 retries on a brand-new browser.
// - motion blur: `sub` sub-frames spread over a 180° shutter, averaged by ffmpeg tmix. sub=1 = no blur (drafts).
// Then: bash export.sh outDir mix.wav final.mp4   (concat + mux + 30 fps social file)
// Adapted from Barty-Bart/motion-graphics (MIT).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, renameSync, rmSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const [, , html, outDir, fps = 60, sub = 4, workers = Math.max(1, os.cpus().length - 1), CH = 120] = process.argv.map((v, i) => i > 3 ? +v : v);
if (!html || !outDir) { console.log('usage: node render_chunks.mjs film.html outDir [fps] [sub] [workers] [chunkFrames]'); process.exit(1); }
const url = pathToFileURL(path.resolve(html)).href + '?render';
const launch = () => chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
  ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}) });
async function openPage(browser, V) {
  const p = await browser.newPage({ viewport: V ? { width: V.w, height: V.h } : undefined, deviceScaleFactor: 1 });
  p.setDefaultTimeout(120000); p.on('pageerror', e => console.error('PAGE ERROR:', e.message)); await p.goto(url);
  await p.waitForFunction(() => window.VIDEO && typeof window.seek === 'function');
  const bad = await p.evaluate(async () => { await Promise.all([...document.fonts].map(f => f.load().catch(() => {}))); await document.fonts.ready;
    if (window.ready) await window.ready; return [...document.fonts].filter(f => f.status !== 'loaded').map(f => f.family); });
  if (bad.length) console.warn('WARNING: fonts not loaded (fallback in use):', [...new Set(bad)].join(', '));
  return p; }
const pb = await launch(); const V = await (await openPage(pb)).evaluate(() => window.VIDEO); await pb.close();
const N = Math.round(V.duration * fps), NC = Math.ceil(N / CH);
mkdirSync(outDir, { recursive: true });
console.log(`${V.w}x${V.h} ${V.duration}s @${fps}fps sub=${sub}: ${N} frames, ${N * sub} screenshots, ${NC} chunks, ${workers} workers`);
const vf = sub > 1 ? ['-vf', `tmix=frames=${sub},select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/(${fps}*TB)`] : [];
let next = 0, done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: workers }, async () => {
  let browser, page;
  const shot = async t => { for (let k = 0; ; k++) { try { await page.evaluate(t => window.seek(t), t); return await page.screenshot({ type: 'jpeg', quality: 95, timeout: 120000 }); }
    catch (e) { if (k >= 3) throw e; console.error(`\nretry t=${t.toFixed(3)} (${e.message.split('\n')[0]})`); try { await browser.close(); } catch {} browser = await launch(); page = await openPage(browser, V); } } };
  while (next < NC) { const c = next++, f0 = c * CH, f1 = Math.min(N, f0 + CH), file = `${outDir}/c${String(c).padStart(3, '0')}.mp4`;
    if (existsSync(file)) { done += f1 - f0; continue; }
    browser = await launch(); page = await openPage(browser, V);
    const tmp = file + '.part.mp4';
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-', ...vf, '-r', String(fps),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'medium', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    const closed = new Promise(r => ff.on('close', r));
    for (let f = f0; f < f1; f++) for (let s = 0; s < sub; s++) { const b = await shot((f + (sub > 1 ? (s / sub) * 0.5 : 0)) / fps); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); const code = await closed; if (code) { rmSync(tmp, { force: true }); throw new Error('ffmpeg exit ' + code); }
    renameSync(tmp, file); await browser.close();
    done += f1 - f0; const el = (Date.now() - t0) / 1000;
    console.log(`chunk ${c + 1}/${NC}  ${done}/${N} frames  ${el.toFixed(0)}s  eta ${(el / done * (N - done)).toFixed(0)}s`); }
}));
writeFileSync(`${outDir}/list.txt`, Array.from({ length: NC }, (_, c) => `file '${path.resolve(outDir)}/c${String(c).padStart(3, '0')}.mp4'`).join('\n'));
writeFileSync(`${outDir}/meta.json`, JSON.stringify({ ...V, fps, sub, frames: N }));
console.log('ALL CHUNKS DONE ->', `${outDir}/list.txt`);
