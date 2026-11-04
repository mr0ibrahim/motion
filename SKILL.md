---
name: motion-graphics
description: Make professional motion-graphics videos of any genre (ads, explainers, tutorials, product demos, reels, logo stings, data stories, long-form up to 10 min) in Arabic or English, from brief and storyboard through AI assets, code animation, sound and QA to a delivered MP4.
---

# Motion graphics studio

Videos are rendered from code: an HTML page with a pure `seek(t)` is shot frame by frame with Playwright and encoded with ffmpeg. **Text, UI, charts, diagrams and motion are always code.** AI models supply illustrations, filmed plates and voice (`references/ai-assets.md`).

## Stage gates (never skip; get approval at each ✋)
1. **Brief**: goal, audience, platform/format, length, language + dialect, CTA, brand, VO yes/no, facts. Choose the genre (`references/genres.md`); it sets the structure, energy preset and hook.
2. **Concepts ✋**: three genuinely different ideas, each one line plus its hook. The user picks one.
3. **Script + storyboard ✋**: a beat sheet (one message per scene, hook ≤ 1.5 s), the style bible, and the hero assets (GenerateImage → `cut2.py`). Build the scenes as styleframes, then `node scripts/storyboard.mjs film.html storyboard/name --template templates/storyboard.html --title "…"` gives html/png/pdf/json made from the film itself (`references/storyboard.md`). **Nothing is animated in full until the storyboard is approved.**
4. **Animatic ✋**: `node scripts/render.mjs film.html checks_layout.txt --check` must give 0 layout issues, 0 missed cues and 0 page errors. Then make a 30 fps no-blur draft (`render_chunks.mjs film.html out_draft 30 1`) with the SFX mix, for timing review.
5. **Final**: `render_chunks.mjs film.html out 60 4` → `sfx.mjs` → `mix.sh` → `export.sh` → `qa.sh` on the master **and** the social file. Then LOOK at the contact sheet and the transition sheet (`references/render-qa.md`). Scoped revisions only after this: change only what was asked.

## Hard rules (each one is a lesson from a real failure)
1. **Grain is static**: one seeded tile drawn once, never re-randomised per frame. The stutter scan's FLICKER test must be ok.
2. **No music by default**: motion-synced SFX + VO. Music only on request and licensed (`references/sound.md`).
3. **One motion system**: durations only from the `ENERGY` tokens. Springs z ≥ 0.78 (overshoot ≤ 2 %), no shake, no bounce on type, arcs for long moves, a cross-fade on every state change (`references/motion-system.md`).
4. **Render with the chunked renderer** (`render_chunks.mjs`): a fresh browser per chunk, retries, and resume by re-running the same command. Never one long single-process render for films over ~20 s.
5. **Transcribe properly**: `align.py` (large-v3, VAD on/off passes, gap passes, forced onto the script) → `words.json`. Never use a single whisper pass.
6. **Captions belong to their scene**: they wipe and push with it and use its colours. An element is 80 % in ON its spoken word (±2 frames).
7. **Style**: illustrated, consistent characters (one reference image → every pose). **Tech explainers use concept visuals** (flows, diagrams, tables, comparisons, timelines) planned per spoken phrase, not decorative stock.
8. **Two exports**: the 60 fps master + a **30 fps phone/social file**. Send them as attachments. A direct download link, an upload or a post only with the user's explicit OK.
9. **Long-form (3–10 min)**: plan chapters, scene count (≈ 1 per 4–7 s), a pacing variety cycle and visual variety, one page per chapter (`references/genres.md` → Long-form).
10. **Keep the package split**: scripts/, references/, templates/. Don't grow one giant file.

Also: Arabic animates by whole words only (`references/arabic-rtl.md`) · no AI-generated text in the frame · fictional products, prices and ratings are labelled **SAMPLE** · facts come only from the user · the hero fills 60–70 % of the frame · ≥ 3 different transitions in an ad, never the same twice in a row (`references/transitions.md`) · no silence over 1 s.

## Defaults (say what you chose)
9:16 1080×1920 for social, 16:9 for web/YouTube · energy `ad` for ads and reels, `explainer` for VO explainers, `calm` for luxury/long chapters · 60 fps master + 30 fps social · −14 LUFS, true peak ≤ −1.5 dBTP · SFX + VO, no music · static grain 0.06 · illustrated flat style, one accent colour, Noto Kufi Arabic / Cairo + Figtree.

## Setup
`npm i` (Playwright), then `npx playwright install chromium` once. You also need ffmpeg/ffprobe, Python 3 with numpy/scipy/pillow (QA, cut2), and `pip install faster-whisper` for `align.py`.

Worked examples: `demo-ar/` (a 13 s Gulf-Arabic app ad: RTL kinetic type, AI characters, parallax, camera push, zoom/push/iris/split) · `demo/` (a 10.5 s English SAMPLE ad).
