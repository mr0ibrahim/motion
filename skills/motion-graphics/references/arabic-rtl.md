# Arabic and RTL

## Setup
- `CFG.lang='ar'`, `CFG.dir='rtl'` → `<html lang="ar" dir="rtl">`, and `FWD=-1`. Transitions start "forward" for an RTL reader and alternate direction from there. `R.words` lays out right → left. The `draw` origin is the right edge.
- Mixed Latin inside Arabic: `<bdi>Dalla</bdi>` or `<span dir="ltr" style="unicode-bidi:isolate">` so punctuation and order stay right.
- Numbers: choose **Arabic-Indic (٠١٢٣)** or **Latin (0123)** per audience and brand, then use them everywhere. Counters format with `toLocaleString('ar-EG')` (gives ٠–٩) or `'en-US'`. Give the counter box `direction:ltr` so multi-digit numbers don't reorder.

## Animation rules
- **Never split Arabic words into letters.** That breaks the letter joining (contextual shaping). Animate **whole words or lines**: masks (`overflow:hidden`), `clip-path`, transforms. `R.words` splits only on spaces.
- For a "write-on" feel, use a `clip-path: inset()` that reveals from the **right** edge, or `R.textPath` along a curve.
- Arabic has tall ascenders, deep descenders and dots. Give masks **0.15–0.25 em** of extra vertical padding, and slide words by **≥ 110 %** of their height so dots don't peek out. Use line-height ≥ 1.25 (1.3–1.35 for multi-line).
- **No letter-spacing** on Arabic (0). Tight tracking is for Latin only.
- Hide not-yet-active text with `visibility` gated on `t`, not only by translating it.
- Timelines, progress bars and routes fill **right → left**. "Next" arrows point **left**. Lists read top-right first.
- Use diacritics (tashkeel) only where they disambiguate, and check they aren't clipped by masks.
- Hero words ≥ 120 px at 1080 width (demo-ar: 146 px for the hook, 290 px for the logo word). Labels ≥ 40 px.

## Dialect copy
Write in the dialect; never translate literally. The voice and the on-screen copy use the **same register**.

| | Gulf (Khaleeji) | Egyptian | Levantine | MSA (Fusha) |
|---|---|---|---|---|
| now | الحين | دلوقتي | هلّق | الآن |
| want? | تبي؟ | عايز؟ | بدّك؟ | هل تريد؟ |
| try it | جرّبه الحين | جرّبه | جرّبه هلّق | جرّبه الآن |
| download the app | حمّل التطبيق | نزّل الأبلكيشن | نزّل التطبيق | حمّل التطبيق |
| later… | بعدين… | بعدين… | بعدين… | لاحقًا… |
| minutes | دقايق | دقايق | دقايق | دقائق |

Keep it short and spoken: one idea per line, 2–5 words. Test TTS voices on one line for the dialect before generating the whole VO.

## Fonts (OFL, from github.com/google/fonts; embed with inline-fonts.mjs)
- Display/bold: **Noto Kufi Arabic** (variable, used in demo-ar), **Cairo** (variable 200–1000), **Lalezar**, **Rakkas** (retro cinema), **Reem Kufi**, **Blaka Ink**, **Marhey**.
- Text/UI: **IBM Plex Sans Arabic**, **Tajawal**, **Readex Pro**, **Noto Naskh Arabic**. Calligraphic: **Aref Ruqaa**.
- Latin pairs: Figtree, Inter, Geist.
```bash
mkdir -p fonts && cd fonts && G=https://github.com/google/fonts/raw/main/ofl
curl -sLo NotoKufiArabic.ttf "$G/notokufiarabic/NotoKufiArabic%5Bwght%5D.ttf"
curl -sLo Cairo.ttf          "$G/cairo/Cairo%5Bslnt,wght%5D.ttf"
curl -sLo Figtree.ttf        "$G/figtree/Figtree%5Bwght%5D.ttf"
curl -sLo Lalezar.ttf        "$G/lalezar/Lalezar-Regular.ttf"
curl -sLo Rakkas.ttf         "$G/rakkas/Rakkas-Regular.ttf"
curl -sLo PlexAr.ttf         "$G/ibmplexsansarabic/IBMPlexSansArabic-Bold.ttf"
cd .. && file fonts/*.ttf    # each must say "TrueType"; a 404 page saved as .ttf silently falls back
```
render.mjs warns if a font fell back. Always check a still for tofu boxes (□).

## Captions (VO films)
Captions are owned by the scene: they wipe, push and zoom with it and use its colours. There are up to 2 lines, ≤ 6 words a chunk, broken at punctuation (، . ؟ ! : ؛), and the current word is highlighted. Timing comes from `align.py --lang ar` forced onto the script (Arabic normalisation: hamza/alef forms, ة/ه, ى/ي, tatweel, diacritics). Check that the `interp` count is low.

## QA (Arabic-specific)
- [ ] Letters are joined, with no isolated forms in the middle of a word (zoom into a still).
- [ ] Words are in right-to-left order. Latin and numbers are isolated correctly. Digit style is consistent.
- [ ] No dots or diacritics are clipped by masks. There are no tofu boxes or fallback fonts.
- [ ] The dialect is consistent across VO, supers and CTA. Spelling has been checked (ة vs ه, ى vs ي, hamza).
- [ ] Motion flow is right → left (wipes, routes, progress, stagger order).
