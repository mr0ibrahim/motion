# Pre-production — brief → concepts → script → visual plan → storyboard → style frames → animatic → final

Never jump to rendering. Each gate produces an artifact the user can approve.

## 1. Brief (ask only what is missing; defaults in brackets)
Goal & audience · genre · length [explainer 60 s / ad 15 s] · format [9:16] · language/dialect [as the user writes] · VO? [yes for explainers; ads: supers only unless asked] · brand (logo, colours, fonts) · must-say lines · CTA · music [NO — motion-synced SFX only; music only on request] · deadline/quality bar.

## 2. Three concepts
Each: a one-line idea, the hook (first 1.5 s), visual world (palette + style: flat-vector / illustrated / UI / typographic / mixed with filmed plates), signature motion (e.g. "everything enters through a liquid blob", "one continuous camera push"), and why it fits. Recommend one.

## 3. Script & VO plan
- Spoken-length check: Arabic ≈ 2.0–2.4 words/s, English ≈ 2.4–2.8 words/s. 60 s ≈ 130–150 words.
- One idea per sentence; the key word near the end of the phrase (lands on the visual hit).
- Mark emphasis words (they become accent highlights / `hl`).
- TTS: see ai-assets.md. Then align.py → words.json.

## 4. Phrase-by-phrase visual plan (table)
| # | time | VO phrase | visual (what appears ON which word) | motion | transition out | SFX |
Every noun/claim in the VO gets a visual that appears ON its word (80% in, ±2 frames) — never before it is said.

## 5. Storyboard (generated from the film itself)
Write the scenes in film.src.html with `board:{shot, motion, sfx, notes}` per scene, then:
```
node scripts/storyboard.mjs film.html board/NAME --title "Project — v1"
```
→ `NAME.html` (shareable), `NAME.png` (full sheet), `NAME.pdf` (A3 landscape), `NAME.json`.
Each panel: number, thumbnail at the scene's key time (`key:` or 60% in), time range + duration, shot, VO, on-screen text, motion, transition (type, duration, ends on the cut), SFX, notes. Because it is rendered from the same page, the board never drifts from the edit. Re-run after every change.
For a pre-animation board (before motion exists), put static compositions in each scene (a:'none') — the same tool gives a board of style frames.

## 6. Style frames → APPROVAL GATE
`node scripts/render.mjs film.html frames/ --scenes --at end` (full-size key frames) or a stills sheet. Show 3–5 frames. Do not animate the whole film before the look is approved.

## 7. Animatic (30 fps, fast)
`node scripts/render_chunks.mjs film.html anim 30 1` (no motion blur, ~4× faster) + mix with VO → check timing and sync with the user.

## 8. Final
60 fps sub=4 → mix → export master + social30 → qa.sh. Deliver (see render-qa.md → Delivery).
