# Render, QA, delivery

Requirements: Node ≥ 18, ffmpeg + ffprobe on PATH, Python 3 with numpy/scipy/pillow (QA + cut2), `npm i` (Playwright). Run `npx playwright install chromium` once per machine.

## 1. Build and check (every edit)
```bash
node scripts/inline-fonts.mjs film.src.html film.html "Cairo|200 1000|fonts/Cairo.ttf" "Figtree|300 900|fonts/Figtree.ttf"
node scripts/render.mjs film.html checks_layout.txt --check          # MUST print: layout issues 0, missed word cues 0, page errors 0
node scripts/render.mjs film.html checks/look-01.png --stills 0.6,2.1,4.4,6.6,9.8,12.5 --cols 6 --w 300   # styleframes / stills sheet
```
- `--check` seeks every 0.1 s and reports: elements outside the format's **safe zone** (measured on the ink, at the camera's zoom), partial **overlaps** between settled elements (full containment = layering, which is OK), **missed word cues** (`W()` words not found), and page JS errors. A scene that is being transitioned OUT is not judged. Use `bleed:true` for a hero cut by the frame edge on purpose, and `allowOverlap:true` for a deliberate overlap (a speech bubble on a character).
- Stills: write each pass to a **new filename** (`look-01`, `look-02`, …), because image viewers cache.
- A page error such as "Unexpected end of input" usually means a `//` comment was inserted into a one-line function. Use `/* */` in the template.

## 2. Render (the default renderer is chunked and resumable)
```bash
node scripts/render_chunks.mjs film.html out 60 4            # fps=60, sub=4 (motion blur), workers=nproc-1, 120 frames per chunk
node scripts/render_chunks.mjs film.html out_draft 30 1      # fast draft for review, no blur
```
- It launches a **fresh browser per chunk** (no memory build-up on long films). Each screenshot has a 120 s timeout and up to **3 retries** on a new browser.
- **Resume**: finished `cNNN.mp4` chunks are skipped on rerun, and half-written `.part.mp4` files are redone. Tested: a 13 s film was killed at 40 s (1 chunk finished). On rerun, chunk 1 was not re-rendered (its md5 was unchanged), and the joined file had all 780 frames.
- Time: a 13 s 9:16 film at 60 fps × sub 4 took ~55 s on 7 workers on the test box. Estimate `duration × fps × sub / workers` screenshots and tell the user before a long render.
- `render.mjs film.html out.mp4 fps sub workers` (single process) is fine for clips under ~20 s.

## 3. Audio + export
```bash
node scripts/sfx.mjs film.html sfx.wav && bash scripts/mix.sh sfx.wav vo.mp3 mix.wav    # or "-" for no VO
bash scripts/export.sh out mix.wav final/name     # -> final/name_master.mp4 (60 fps) + final/name_social30.mp4 (30 fps)
```

| File | Spec | For |
|---|---|---|
| `_master.mp4` | H.264 High, yuv420p, render fps (60), AAC 48 kHz, +faststart | archive, YouTube, web |
| `_social30.mp4` | H.264 High, CRF 20, yuv420p, **30 fps**, AAC 192k, +faststart | phones, WhatsApp, Reels/TikTok uploads (plays everywhere, small) |

Per platform: 9:16 1080×1920 (Reels/TikTok/Shorts/Stories, keep UI-clear top 150 / bottom ~560 px / right ~120 px) · 16:9 1920×1080 (YouTube/web/X, 90 % title-safe) · 1:1 1080×1080 · 4:5 1080×1350 (avoid the bottom ~200 px). **Recompose each format**; never centre-crop.
Extras: `ffmpeg -ss 3.9 -i final/name_master.mp4 -frames:v 1 -q:v 2 poster.jpg` · GIF: `-vf "fps=15,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=none"` · alpha sting: ProRes 4444 `-c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le` from PNG frames with a transparent stage.

## 4. QA (the Critic, on the rendered file)
```bash
PY=python3 bash scripts/qa.sh final/name_master.mp4 storyboard/name.json checks
PY=python3 bash scripts/qa.sh final/name_social30.mp4 storyboard/name.json checks_social
```
qa.sh checks format/codec/fps, decode, loudness (−14 ±1 LUFS, TP ≤ −1.5), freezes > 2.5 s, **silence > 1 s**, black stretches, then writes `contact_sheet.png` and `transitions.png` (7 frames per transition: before / 0–80 % / after the cut, with times from the board). It ends with `stutter_scan.py`:

| Test | Catches | How |
|---|---|---|
| JUMP | a position jump (a missing frame or a seek bug) | spikes in low-pass frame difference vs neighbours |
| DUP | duplicated frames inside motion (a renderer hiccup) | zero low-pass change between moving neighbours, with no high-pass change either |
| JERK | stop-go motion | a motion-energy dip between two moving frames |
| FLICKER | per-frame re-randomised grain / shimmer | still frames (low-pass ≈ 0) whose high-pass detail changes; ratio > 0.2 = FAIL |

FLICKER verification: a synthetic 60 fps clip with grain re-randomised at 30 Hz → **FAIL, ratio 0.498, exit 1**. The same clip with static grain → **ok, exit 0**. The demo masters → ok.

**Then LOOK** at both sheets and at one frame per shot. A PASS is not approval. Check: the hook is readable at 1–3 s · holds ≥ 0.3 s/word + 0.6 s · Arabic joined, RTL order, no tofu, no clipped dots · safe zones · contrast · SFX on hits · the CTA is held · facts are traceable and placeholders say SAMPLE. Score hook, readability, continuity, motion, sound sync, brand, type and ending 1–10, fix the three worst, and re-render until all are ≥ 8. Fix one thing per note.

## 5. Long-form (3–10 min)
- One page per **chapter** (45–90 s) sharing one CFG/palette/tokens block. Slice WORDS by time. Render each with `render_chunks.mjs` (resume makes crashes cheap), concatenate the masters, and mix the full VO once.
- Budget ≈ 3–4 min of compute per minute of film at sub 4 on 8 cores. Use sub 2 if time-boxed.
- Review per chapter: storyboard, contact sheet, transition sheet.

## 6. Delivery
- Hand over: `_master.mp4`, `_social30.mp4`, the storyboard (png/pdf/html), `film.html` (it scrubs in any browser: `?t=3.2` freezes a time, `?safe` shows the safe zone), and a note covering the beat sheet, fonts and licences, SFX credits, what is SAMPLE/placeholder, and one alternative direction.
- Send the files as attachments in chat. **A public or direct download link, or any upload to Drive, YouTube or social, only with the user's explicit OK.**
- Keep each approved version (`v01/`, `v02/`) so any can be restored. Revision notes are scoped: change only what was asked.
