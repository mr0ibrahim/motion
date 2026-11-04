// sfx.mjs — render the page's window.buildAudio(ctx) (synth SFX, optional music) to a 48 kHz stereo WAV (un-normalised).
//   node sfx.mjs film.html sfx.wav          -> then: bash mix.sh sfx.wav [vo.wav|-] mix.wav
// Also writes sfx.json (window.SFX_LIST: [time, kind]) when the page fills it, for sync QA.
import { chromium } from 'playwright'; import { writeFileSync } from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const [, , html, out] = process.argv;
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); p.on('pageerror', e => console.error('PAGE ERROR:', e.message));
await p.goto(pathToFileURL(path.resolve(html)).href + '?render'); await p.evaluate(async () => { await document.fonts.ready; if (window.ready) await window.ready; });
const r = await p.evaluate(async () => { const sr = 48000, dur = VIDEO.duration, ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  if (typeof window.buildAudio !== 'function') return null;
  await window.buildAudio(ctx); const buf = await ctx.startRendering(); const L = buf.getChannelData(0), R = buf.getChannelData(buf.numberOfChannels > 1 ? 1 : 0);
  const i16 = new Int16Array(L.length * 2); for (let i = 0; i < L.length; i++) { i16[2*i] = Math.max(-1, Math.min(1, L[i])) * 32767; i16[2*i+1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
  let s = ''; const u8 = new Uint8Array(i16.buffer); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return { b64: btoa(s), list: window.SFX_LIST || [] }; });
await b.close();
if (!r) { console.log('page has no buildAudio'); process.exit(2); }
const pcm = Buffer.from(r.b64, 'base64'), h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
h.writeUInt32LE(48000, 24); h.writeUInt32LE(192000, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
writeFileSync(out, Buffer.concat([h, pcm])); writeFileSync(out.replace(/\.wav$/, '') + '.json', JSON.stringify(r.list));
console.log('sfx ->', out, `(${r.list.length} cues)`);
