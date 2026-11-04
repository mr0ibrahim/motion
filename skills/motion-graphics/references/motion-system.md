# Motion system: one set of tokens, the 12 principles in code, camera, recipes

Everything moves from ONE token set (`ENERGY[CFG.energy]` in `templates/film.src.html`). Never hand-pick a duration per element: if a scene feels slow, change the energy preset or the token, not one tween.

## 1. Tokens (exact)

| Token | ad | sting | explainer | calm | Used for |
|---|---|---|---|---|---|
| `IN` | 0.34 s | 0.30 | 0.40 | 0.50 | element entrance (eOut) |
| `OUT` | 0.22 | 0.20 | 0.25 | 0.30 | element exit (eIn), faster than IN |
| `WIPE` | 0.34 | 0.30 | 0.42 | 0.55 | transition length `trd` (zoom ×1.3, glitch ×0.8) |
| `MOVE` | 0.55 | 0.50 | 0.70 | 0.90 | later moves (`mv`), cursor legs, camera re-frames |
| `STAG` | 0.09 | 0.08 | 0.12 | 0.15 | gap between siblings (words, bars, pills) |
| `XF` | 0.15 | 0.15 | 0.15 | 0.15 | cross-fade on every state change (never snap) |
| `LEAD` | IN×0.415 | | | | an element is 80 % in ON its word (eOut(0.415)=0.80) |

Pick the preset by genre: **ad** = product/app/offer ads, reels · **sting** = logo stings, 3–6 s · **explainer** = tech/edu/VO-driven · **calm** = luxury, wellness, long-form chapters.

Eases (only these): `eOut` (cubic out) entrances · `eIn` exits · `eIO` moves, camera, transitions · `eOutQ` (quint out) whips and zooms. No `linear` except continuous drifts; no elastic or bounce eases.

Springs: `spring(t,w,z)` clamps `z ≥ 0.78`, so overshoot is **≤ 2 %**. Presets `SP.settle [14,.9]`, `SP.ui [22,.86]`, `SP.soft [10,.95]`, `SP.cam [7.5,1]` (no overshoot). **No shake, no wobble, no bounce on type.**

## 2. The 12 principles, as code you can paste in `seek`-pure form

```js
// 1 Squash & stretch — ONLY for illustrated/cartoon objects (a:'drop' does it). Keep volume: sx = 2 - sy.
E(s,1.0,cupSVG,'left:380px;top:900px',{a:'drop',from:[0,-500],sfx:'thud'});
// 2 Anticipation — a small move AGAINST the direction before the action (8–12 % of the travel, 0.12–0.18 s).
const ant=t=>{ const a=seg(t,at-.32,at-.16), g=seg(t,at-.16,at+.2); return -12*Math.sin(Math.PI*a)*(1-g) + 300*eOut(g); };
// 3 Staging — one focal point; everything else at depth .3–.6, lower contrast, or out of frame.
// 4 Straight-ahead vs pose-to-pose — always pose-to-pose: kf() keys, never accumulated per-frame state.
// 5 Follow-through & overlapping action — children lag the parent by 1–2 STAG and settle later:
E(s,at,card,css,{a:'in'}); E(s,at+STAG,title,css2,{a:'in'}); E(s,at+2*STAG,icon,css3,{a:'pop'});
// 6 Slow in / slow out — eIO for moves, eOut for arrivals; the last 20 % of any move takes ~40 % of its time.
// 7 Arcs — anything travelling > 200 px moves on a curve (quadratic bezier), never a straight diagonal:
E(s,at,hero,css,{a:'in',from:[-260,120],arc:[-60,-80]});            // qb(from, arc, 0, k)
// 8 Secondary action — a smaller motion that supports the main one (steam draws after the cup lands, a ripple on a tap):
R.draw(s,at+.25,steamSVG,css); R.burst(s,at+.1,540,900,{n:12,dist:140});
// 9 Timing — durations ONLY from tokens; heavier = slower (hero IN×1.2), small UI = IN×0.8.
// 10 Exaggeration — scale the idea, not the wobble: a hero at 60–70 % of the frame, a 1.16→1.0 settle, never > 2 % overshoot.
// 11 Solid drawing — consistent light direction and shadow (one shadow token: 0 40px 80px rgba(0,0,0,.3)), same stroke width per icon set.
// 12 Appeal — clear silhouettes, 2–3 sizes of type, one accent colour, generous margins.
```

## 3. Stagger math

- Siblings: `at + k*STAG`. Total spread for n items = `(n-1)*STAG`; keep it ≤ 0.5 s (cap n or use `STAG*min(1, 4/(n-1))`).
- Kinetic words: per-word delay `per = STAG*0.9` on speech, `STAG*1.3` on supers without VO.
- Cascades from a point: delay by distance, `d = hypot(x-x0,y-y0)/maxD * 0.35`.
- Ordering: follow reading direction (RTL: right → left; `R.words` does this). Grids: row-major in reading order.
- Exits: reverse order, and `OUT` < `IN`. Everything leaves within 0.3 s of the cut, or rides out with the transition.

## 4. Camera

Every scene may take `cam:{z,x,y}` (functions of t, usually `kf`). Items move by `depth`: 0.3 = far background, 1 = mid, 1.3–1.4 = foreground. **Use 3+ layers for real parallax.**

```js
// push-in (slow, the default "alive" move): +3–8 % over the scene
scene({at:2.4,cam:{z:kf([[2.4,1.0],[5.0,1.06]])}},(s)=>{ ... });
// pull-out reveal: start at 1.25, end at 1.0 with eOutQ
cam:{z:kf([[t0,1.25],[t0+1.2,1,eOutQ]])}
// parallax: 3 layers — bg circle depth .3, character 1, bubble 1.4  (demo-ar scene 2)
// lateral truck: cam.x = kf([[t0,0],[t1,-80]]) — foreground moves 1.3×, background 0.3×
// whip pan: the 'push' transition + motion blur (render with sub ≥ 4) + a whoosh starting 0.03 s before
// match cut: end scene A on a shape (button, circle) and open B from the same place:
scene({tr:'iris',trOpt:{at:[540,1220]}},...)    // iris opens FROM the tapped button
scene({tr:'morph',trOpt:{from:[x,y,w,h,r]}},...)  // a card grows into the next frame
```
Rules: one camera move per scene; never zoom and pan in opposite directions at once; the camera never overshoots (`SP.cam`). Keep text inside the safe zone at the camera's maximum zoom (the layout check measures it).

## 5. Recipes (all in the template)

| Recipe | Call | Notes |
|---|---|---|
| Kinetic type | `R.words(s,at,'تبي قهوتك',css)` | whole words in masks, reading order; never split Arabic letters |
| Counter | `R.counter(s,at,css,0,10,{dur:.9})` | `ar-EG` or `en-US` digits from `CFG.lang`; `direction:ltr` on the box |
| Bar chart | `R.bars(s,at,x,y,[.4,.7,1],{bw:90,h:400})` | grows from the baseline with stagger; values 0..1 |
| Line draw-on | `R.draw(s,at,'<svg>…<path pathLength="1" …/></svg>',css)` | routes, underlines, arrows, steam |
| UI cursor | `R.cursor(s,[[t,x,y],[t2,x2,y2,true]])` | arcs between points, press scale .9 + ripple + click |
| Particles | `R.burst(s,at,x,y,{n:14,dist:160,seed:7})` | seeded and deterministic |
| 2.5D flip | `R.flip(s,show,at,front,back,css)` | perspective card flip, before/after |
| Text on a path | `R.textPath(s,at,'M… C…',text,css)` | the text writes along the curve |
| Pills / cards | `pill(bg,fg,html,css)`, `card(...)` | one radius token per film |
| Icons | `I.check(c)`, `I.bolt(c)`, … | 100-unit grid; add Lucide/Tabler/Phosphor paths (MIT); no emoji |

## 6. Motion polish checklist (before every final render)

- [ ] Every element enters on its word or beat (MISS = []); nothing appears before it is said.
- [ ] Nothing moves straight diagonally more than 200 px (arcs); nothing snaps (XF).
- [ ] Overshoot ≤ 2 %, no shake, no wobble, no bounce on type.
- [ ] Every scene has ONE camera move or a deliberate lock-off; something always moves (no dead 1 s).
- [ ] 3+ depth layers in hero scenes; the hero fills 60–70 % of the frame.
- [ ] Siblings stagger (STAG) and exits are faster than entries.
- [ ] Every cut is a designed transition (no two identical transitions in a row; direction follows reading order).
- [ ] Each visual hit has its SFX within ±1 frame (sfx.json vs the board).
- [ ] Grain is STATIC (the stutter scan FLICKER = ok); 60 fps master with motion blur (sub 4).
- [ ] `node scripts/render.mjs film.html checks_layout.txt --check` → 0 layout issues, 0 page errors, 0 missed cues.
