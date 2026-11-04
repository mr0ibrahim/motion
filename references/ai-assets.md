# AI assets: tools, prompts, consistent characters, compositing, licensing, QA

The pipeline only needs files. Use the built-in tools first, then any API the user has keys for. **Never ask a model for text, UI, charts or logos.** Those are typed and animated in HTML.

## 1. Tool table

| Need | Default | Alternatives | Output → next step |
|---|---|---|---|
| Characters, props, product illustrations | **GenerateImage** | Flux, Imagen, GPT-image, SDXL (local), user files | JPG/PNG on a flat bg → `scripts/cut2.py` → `assets/*.png` |
| The same character in new poses | **GenerateImage with the approved image as reference** | IP-Adapter / reference or "character" features of other APIs | one approved hero sheet = the reference for every later prompt |
| Filmed-looking plates (b-roll, hands, textures, skies) | **GenerateVideo** | Veo, Kling, Runway, Sora-class APIs, licensed stock | MP4 → frames or `<video>` plate UNDER the graphics (§5) |
| Voice-over | **ElevenLabs** with the user's key (multilingual v2 / v3 for Arabic dialects) | OpenAI TTS, Azure Neural (ar-SA/ar-AE/ar-EG voices), Google TTS, a recorded VO | `vo.mp3` → `scripts/align.py` |
| Word timings | **`scripts/align.py`**: faster-whisper large-v3, VAD on/off passes, gap passes, forced onto the script | ElevenLabs alignment endpoint (when TTS is ElevenLabs) | `words.json` → `/*WORDS*/` |
| SFX | built-in synth (`sfx.mjs`, 12 kinds, auto-placed on hits and transitions) | licensed libraries (§6) | `sfx.wav` → `mix.sh` |
| Music | **none by default** | user-supplied or licensed, opt-in | 4th argument of `mix.sh` |
| Vector icons | built-in set `I` (100-unit grid) | Lucide (ISC), Tabler (MIT), Phosphor (MIT), Heroicons (MIT): paste the path data | inline SVG |
| Background removal of photos | `rembg i in.jpg out.png` (pip, MIT) | GenerateImage edit "isolate on pure white" + cut2 | PNG with alpha |
| Arabic/Latin fonts | Google Fonts (OFL), see arabic-rtl.md | brand fonts the user supplies | `fonts/*.ttf` → `inline-fonts.mjs` |

Keys: read only what the user provides for this project (an env var or a file they point to). Never print a key or commit it.

## 2. Style bible (write it before generating anything)

```
STYLE: flat 2D editorial illustration, clean confident dark-brown outlines (uniform weight), flat fills with ONE
soft cel-shade tone, no gradients, no texture, warm palette #2B1A12 #F4EBDD #E8A33D #B5651D, soft daylight from
the upper left, 3/4 view, friendly proportions (head ≈ 1/6 of the body), plain flat off-white #F4F1EA background,
full figure centred with margin (or cropped at the waist if the shot needs it), no text, no logos, no watermark.
```
Paste the same block into every prompt. Change only the subject, the pose and the expression.

## 3. Prompt templates

- **Character (hero sheet)**: `A young Gulf Arab man in a white thobe and ghutra with a black agal, [expression: tired, looking down at his phone], waist-up, [STYLE]`
- **Same character, new pose (with the hero image as reference)**: `The SAME man as in the reference image — identical face, beard, ghutra, thobe, proportions and line style — now [smiling, holding an orange takeaway coffee cup in his right hand], waist-up, [STYLE]`
- **Prop**: `A single [orange takeaway coffee cup with a cream lid], front view, [STYLE]`. Often you should draw props as SVG in code instead (crisper, animatable).
- **Scene plate**: `An empty [living room corner with a sofa and a window], [STYLE], wide, nothing in the centre third` (leave room for the type).
- Negative wording that works: "no text, no letters, no watermark, no border, no shadow on the background".

## 4. Character sheet and consistency

1. Generate 3–4 candidates of the **neutral** pose. Pick one, and that image becomes `assets/raw/char_<name>_ref.jpg`.
2. Every other pose or expression goes through GenerateImage **with that reference image**. Use the prompt "the SAME person as the reference …".
3. Check consistency side by side: face shape, beard, clothing details, outline weight, palette. Reject any pose that drifts and regenerate it. Don't patch it.
4. Keep a `CHARACTERS.md`: name, reference file, the exact prompt, the palette, and allowed expressions.
5. Cut every pose with the same settings (`cut2.py --sides 3 --tol 14` for waist-up figures that touch the bottom edge).

Demo: `demo-ar/assets/raw/char_tired.jpg` (the first generation) was the reference for `char_happy.jpg`. Both were cut with `cut2.py --sides 3 --tol 14`.

## 5. Compositing filmed AI shots under the graphics

- Generate the plate with **no text** and an empty area where the type goes. Use 5–8 s and a slow camera.
- Put it under the stage: `E(s,t0,'<video src="plates/a.mp4" muted playsinline></video>','left:0;top:0;width:1080px;height:1920px;object-fit:cover',{a:'fade',depth:.3})`. In `seek`, set `video.currentTime = t - t0` and await `seeked` (or pre-extract frames with `ffmpeg -i a.mp4 -vf fps=60 plates/a_%04d.jpg` and swap `src` per frame, which is the most deterministic).
- Readability: a scrim (`linear-gradient` from rgba(0,0,0,.55) to 0) behind the type, or a solid card. Measure the contrast on a still.
- Grade the plate toward the palette (CSS `filter: saturate(.85) sepia(.1)` once, not animated).
- Never put a person's face from a plate on a real brand without consent. Label AI footage in the delivery note.

## 6. Licensing

| Source | Licence | Record |
|---|---|---|
| GenerateImage / GenerateVideo outputs | generated for this user; check the provider's terms for commercial use | the prompt + date in `CREDITS.md` |
| Google Fonts | OFL 1.1 (embedding OK) | the font name + URL |
| Lucide / Tabler / Phosphor / Heroicons | ISC / MIT | the icon name + repo |
| SFX: Kenney, Freesound CC0 | CC0 | the file + URL |
| Mixkit SFX/music | Mixkit licence (use in videos, no redistribution) | the file + URL |
| Freesound CC-BY | attribution required | the credit line in the description |
| User footage, logos, brand fonts | the user's | "supplied by the client" |

Fact rule: product names, prices, ratings and logos come from the user. Invented ones are labelled **SAMPLE** on screen.

## 7. Asset QA (every file, before it goes into a scene)

- [ ] After cut2: no halo on a dark and a light background (check on both; cut2 prints `bg≈#hex`). Holes inside the subject are kept (eyes, a white shirt). Raise `--tol` for grey shadows; use `--hull` for round objects.
- [ ] It reads at the smallest size used (render a still at 1080 wide).
- [ ] The palette matches the style bible, and the outline weight matches the other assets.
- [ ] No extra fingers, no melted faces, no garbled pseudo-text or fake logos.
- [ ] The character matches its reference (side-by-side).
- [ ] The source, prompt and licence are recorded.
- Reject and regenerate rather than retouch.
