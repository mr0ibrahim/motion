# Genres — structure, pacing, hook

Pick the genre first: it sets the structure, the energy preset (`CFG.energy`), the cut rhythm and the hook.
Times are for the stated length; scale proportionally. "Beat" = one main motion. **One main motion at a time.**

| Genre | Length | Energy preset | Avg shot | Cut grid |
|---|---|---|---|---|
| Ad / promo (product, app, brand, launch, offer) | 6/15/30/60 s | `ad` | 0.8–2.2 s | on the beat, 100–130 BPM (0.46–0.6 s per beat) |
| UGC-style ad | 15–45 s | `ad` | 1.5–3 s | on speech phrases |
| Explainer (tech / edu / data) | 45 s–3 min | `explainer` | 2.5–5 s | on VO phrases |
| Kinetic typography | 10–60 s | `ad` or `sting` | per phrase | every word on its spoken time |
| Logo sting / ident | 3–8 s | `sting` | 1 continuous move | build → hit → hold ≥1.2 s |
| Social reel / short | 15–60 s | `ad` | 1–2.5 s | hook ≤1.5 s, a change every 2–3 s |
| YouTube long-form | 3–10 min | `explainer` + `calm` | 3–8 s | chapters, see long-form below |
| Data viz / charts | 15–90 s | `explainer` | 3–6 s | one number per beat |
| UI / app demo | 15–90 s | `explainer` (UI spring) | per action | cursor action → result → hold |
| Title sequence | 20–90 s | `calm` | 2–4 s | on the music/sfx hits |
| Lower-thirds / supers | 3–6 s each | `ad` | — | in 0.4 s, hold, out 0.25 s |
| Event / announcement | 10–30 s | `ad` | 1–2 s | date/place last, held ≥2 s |
| Loop / cover / canvas | 3–10 s | `calm` | seamless | frame N == frame 0 |

## Structures

**Product ad (15–30 s)** — Hook (problem or bold claim, ≤1.5 s) → Reveal (product hero, camera push) → Proof (1–3 features, each a visual demo, not a list) → Social proof / number → Offer → CTA + logo held ≥1.5 s.
Hooks: *pain question* ("Still losing receipts?"), *pattern break* (unexpected motion first frame), *number* ("3× faster"), *before/after split*.

**App ad** — Hook → phone/UI card enters → cursor/tap demo of the ONE core action → result counter → store badges/CTA. Show the real UI layout simplified to flat shapes (never a busy screenshot).

**Brand film** — Mood line → 3–5 values as kinetic type with matching icons/scenes → logo resolve. Slower: `calm`, longer holds.

**Launch / offer** — Teaser (mask reveal) → name → 3 headline features → date/price → CTA. Price and date: largest type, held ≥2 s.

**UGC-style** — Face-cam or phone-shot footage (GenerateVideo or user footage) as the base layer, motion graphics as stickers, captions word-by-word, arrows/circles drawn on (stroke anim), zoom punch-ins on key words (scale 1→1.08 over 0.25 s, eased, no shake).

**Explainer (tech)** — Hook question → the problem as a concept visual → the idea in one sentence → HOW, step by step with diagrams → example → recap → CTA.
**Rule: tech explainers use CONCEPT VISUALS** — flow diagrams (boxes + arrows drawn on), pipelines, layered stacks, comparison tables, timelines, before/after, input→process→output, node graphs, code cards with highlighted lines. Never decorative stock imagery for an abstract idea. Each VO claim gets a diagram element that appears ON its word.
**Edu** — Question → intuition (analogy illustration) → definition → worked example → common mistake → summary card.
**Data** — Context line → the chart builds (axis draw → bars grow with stagger → value counters) → the ONE insight highlighted (others dim to 35%) → source line (small, ≥2 s).

**Kinetic type** — each phrase is one composition; whole words, never letters (Arabic joining); size = emphasis; one accent word per phrase; moves: rise-in-mask, slam (scale 1.15→1 + thud), slide-push, rotate-in 90° (2.5D), line-swap (old words exit up as new rise).

**Logo sting** — shapes build the mark (draw-on / morph / particles converge) → hit (pop + thud/chime) → hold ≥1.2 s → optional tagline. 3–8 s, no VO.

**Social reel** — hook text in the first frame (no fade-in from black), captions always on, a visual change every 2–3 s, loopable ending or CTA, safe zones (UI covers top 150 px / bottom 560 px on 9:16).

**YouTube long-form (3–10 min)** — see the long-form section.

**UI demo** — set the scene (device/card) → cursor travels on an arc (MOVE) → press (scale .9) + ripple + click → state change cross-fades (XF) → result highlighted → next action. One action per beat; never move the cursor and the card at once.

**Title sequence** — names on lower-left grid, each in/out with mask; background loops slowly (parallax 3 layers); title card last, held.
**Lower-third** — bar draws on (0.38 s) → name rises in mask → role fades 0.12 s later → hold → reverse out.

**Event / announcement** — what → who → when/where (biggest) → how to join (URL/QR) held ≥3 s.

**Loop / cover** — every motion is periodic in the loop length: use `t % L` with sin/cos or keyframes that end where they start; check frame 0 vs last frame diff ≈ 0 (`stutter_scan.py` on a 2× concatenation shows no JUMP at the seam).

## Illustrated / cartoon style
When the brief wants characters, mascots or friendly scenes: flat illustrated assets (see ai-assets.md → *Illustrated style*): 2–4 colour fills from the palette + one dark outline weight, no gradients/photo textures, consistent character sheet, cut-outs via cut2.py. Animate as rigs: separate PNG/SVG parts (head, body, arms) with rotation pivots; secondary motion (follow-through) on hair/tails ≤ 4°; squash & stretch allowed ONLY on illustrated elements (≤8%).

## Long-form (3–10 min) planning
- **Scene count**: ≈ 1 scene per 4–7 s of VO → 3 min ≈ 30–45 scenes, 10 min ≈ 100–140. Group into chapters of 45–90 s with a title card each.
- **Pacing variety** (avoid 10 min of identical builds): rotate scene types in a cycle of ~5 — diagram build / kinetic-type statement / number+chart / example illustration / recap card. Every 60–90 s a "reset" moment (full-bleed colour change, chapter card, bigger camera move). Vary transitions per chapter (2–3 types, not all 9).
- **Energy curve**: explainer-calm baseline; peaks at chapter openings and the main reveal; slow down on definitions (+20% hold).
- **Build in chapters**: one film.src.html per chapter (same CFG/palette/tokens), WORDS sliced by time; render each with render_chunks.mjs, concat masters, mix the full VO once. This keeps pages light and re-renders local.
- **Chunk planning**: CH=120 frames at 60 fps (2 s) per chunk; ≈ 3–4 min of compute per minute of film at sub=4 on 8 cores. Use sub=2 for >5 min films if time-boxed. Resume is automatic after a crash.
- **Review**: storyboard per chapter; contact sheet per chapter; transition sheet for the whole film.

## Ad playbook (the strongest genre to get right)

**Universal ad rules**
- Hook in **≤ 1.5 s**: the first frame already has the hero or the question. No logo intro, no fade from black.
- **One promise** per ad, said once in big type, then shown and proved. Three features at most.
- The hero (product, phone, character) fills **60–70 % of the frame** in at least half the shots.
- A visual change every **1–2.5 s**. There are ≥ 3 different transitions in 15 s, never the same one twice in a row.
- The **CTA** (name + action + where) is held **≥ 2 s** (≥ 3 s at 30 s+), and the last frame is the CTA.
- Sound: SFX on every hit. VO is optional (supers carry the line). Music only if the user asks or supplies it.
- Fake products, prices, ratings and names must be labelled **SAMPLE** on screen and in the delivery note.

**Beat sheets (seconds)**

| Type | 6 s bumper | 15 s | 30 s |
|---|---|---|---|
| Product | 0–1.5 hook + hero · 1.5–4 one feature demo · 4–6 logo + CTA | 0–1.5 hook · 1.5–4 reveal (camera push) · 4–10 three features as visuals · 10–12 proof/number · 12–15 CTA | add the problem (2–6) + social proof (18–23) + offer (23–26) |
| App | 0–1.5 pain line · 1.5–4.5 tap demo · 4.5–6 CTA badge | 0–2 pain (character) · 2–5 zoom into the phone · 5–8 cursor taps the ONE action, route/counter shows the result · 8–11 payoff (happy character) · 11–15 logo + store CTA | two actions + a result counter + a rating |
| Brand | mood word → logo | 3 value words with matching scenes, `calm` energy, logo resolve held 2.5 s | values + one human story + manifesto line |
| Offer / sale | price slam + date + CTA | hook → product → price (largest type, counter) → deadline → CTA | add a bundle grid and a countdown |
| UGC-style | face line + caption + sticker CTA | footage base, word-by-word captions, drawn arrows/circles, zoom punch-ins, a product sticker, CTA card | 3 "reasons" with sticker graphics |

**Hook bank** (adapt to the dialect): a pain question («تبي قهوتك الحين؟» / "Still waiting for coffee?") · a bold number («١٠ دقايق») · a before/after split · a pattern break (the hero drops into the first frame) · "POV: …" for UGC · a result first, then "how?".

**CTA patterns**: a logo mask-reveal + an action pill («حمّل التطبيق») + a small line (store or URL) · a price + a deadline + an action · "link in bio" for organic. Keep a single action.

**Worked example (in this repo)**: `demo-ar/` — a 13 s Gulf-Arabic app ad (fictional "دلّة"). It follows the 15 s App row: a hook cup drop → a zoom into the tired character (3-layer parallax, camera push) → a push into the phone (route draw-on, ١٠ counter, cursor tap) → an iris from the button into the happy character (same character via reference image, burst, three pills, rating) → a split to the CTA. It uses 4 different transitions, every hit carries an SFX, and it is labelled SAMPLE.
