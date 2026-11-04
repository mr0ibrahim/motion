# Transitions: the 10 built-ins

A transition belongs to the **incoming** scene: `scene({at, tr, trOpt, trd?}, build)`. It runs from `t0 - trd` to `t0` and **finishes on the cut** (`t0` = the word or beat). Default length `trd = WIPE`; `zoom` uses WIPE×1.3 and `glitch` WIPE×0.8. The progress `p` is eased with `eIO` by the engine. Captions live inside the scene root, so they travel with it.

The SFX is added automatically (`TRS` in buildAudio). It starts 0.03 s before the transition and peaks on the cut. The audio pan follows `s.dir`.

**Direction:** the engine alternates `s.dir` at every cut, starting from the reading direction (`FWD`: +1 LTR, −1 RTL). Wipes and pushes therefore zig-zag instead of always sliding the same way, and the first one moves "forward" for the reader. Never hard-code left or right. Override with `dir:1|-1` only for a story reason (going "back", a rewind).

**Variety:** never use the same transition twice in a row. In a 10–15 s ad, use at least 3 kinds. In long-form, set a "house" transition (wipe or push) for chapter-internal cuts and save the big ones (zoom, iris, blob, morph) for chapter turns.

| # | `tr` | What it does | Duration | SFX | Use for | Don't |
|---|---|---|---|---|---|---|
| 1 | `wipe` | hard-edged clip from one side + accent edge line | WIPE | whoosh | default cut in ads and explainers | wipe against reading direction |
| 2 | `push` | the new scene shoves the old one out (whip pan) | WIPE | whoosh | next step, next screen, UI flows | with a camera zoom at the same time |
| 3 | `zoom` | old scene scales up ×2.6 and fades; new one settles 1.25→1 | WIPE×1.3 | riser | "go inside" (into a character, a screen, a word) | more than 2 per film |
| 4 | `iris` | circle opens from a point (`trOpt.at:[x,y]`) | WIPE | whoosh | match cut from a button, a dot, a pin | from the centre for no reason; give it the tapped point |
| 5 | `split` | the frame opens from the middle (vertical in 9:16) | WIPE | whoosh | reveal, CTA, before→after | in the middle of a sentence |
| 6 | `blinds` | n staggered vertical bars (`trOpt.n`, default 6) | WIPE | whoosh | lists, editorial, chapter turns | in calm/luxury |
| 7 | `glitch` | stepped, seeded slices | WIPE×0.8 | glitch | tech/cyber only, "error" moments | outside tech; more than once per minute |
| 8 | `blob` | liquid/ink circle from a point | WIPE | whoosh | playful brands, food, kids | in finance or B2B serious |
| 9 | `morph` | a card (`trOpt.from:[x,y,w,h,r]`) grows into the next frame | WIPE | whoosh | card → full screen, thumbnail → detail | if the card isn't at those coordinates in the old scene |
| 10 | `cut` | hard cut | 0 | (none; add a hit) | on a beat drop, a punchline | more than ~30 % of the cuts |

## Code (from the template; each sets styles on the incoming scene `s` and, when needed, the outgoing `q`)

```js
wipe:(p,s)=>{ s.root.style.clipPath=s.dir>0?`inset(0 0 0 ${(1-p)*100}%)`:`inset(0 ${(1-p)*100}% 0 0)`; return {edge:s.dir>0?(1-p)*VW:p*VW}; },
iris:(p,s)=>{ const [x,y]=s.trOpt?.at||[VW/2,VH/2]; s.root.style.clipPath=`circle(${p*Math.hypot(VW,VH)}px at ${x}px ${y}px)`; },
split:(p,s)=>{ const h=(1-p)*50; s.root.style.clipPath=VW<VH?`inset(${h}% 0 ${h}% 0)`:`inset(0 ${h}% 0 ${h}%)`; },
push:(p,s,q)=>{ const d=s.dir*VW; s.root.style.transform=`translateX(${(1-p)*d}px)`; if(q) q.root.style.transform=`translateX(${-p*d}px)`; },
zoom:(p,s,q)=>{ if(q){ q.root.style.transform=`scale(${1+p*1.6})`; q.root.style.opacity=1-seg(p,.35,.8); }
  s.root.style.opacity=seg(p,.35,.8); s.root.style.transform=`scale(${1.25-.25*p})`; },
blinds:(p,s)=>{ /* n bars, bar i eased over seg(p, i*.06, 1-(n-1-i)*.06) -> polygon clip */ },
glitch:(p,s)=>{ /* 10 slices, seeded delay r()*.35, progress quantised to quarters (stepped) */ },
blob:(p,s)=>{ /* 64-point circle, radius R*(1 + .10 sin(3θ+ph+2p) + .05 sin(5θ-ph)) -> polygon clip */ },
morph:(p,s)=>{ const [x,y,w,h,r]=s.trOpt.from; /* inset(top right bottom left round r) lerped to 0 */ },
cut:()=>{},
```

## Examples

```js
scene({at:2.45,bg:'C',tr:'zoom',...})                        // into the character (demo-ar 1→2)
scene({at:5.0,bg:'C',tr:'push',...})                          // into the app (2→3)
scene({at:7.8,bg:'A',tr:'iris',trOpt:{at:[540,1220]},...})    // from the tapped button (3→4)
scene({at:10.4,bg:'B',tr:'split',...})                        // open to the CTA (4→5)
scene({at:'dashboard',tr:'morph',trOpt:{from:[120,600,840,500,48]}})  // card from the previous scene grows
```

## QA
`qa.sh` reads `t0` and `trd` from the board. For each transition it samples **7 frames**: 0.12 s before it starts, 0/20/40/60/80 % through, and 1.15×trd after it starts. These go into `checks/transitions.png`, one row per transition. Look for: a blank frame in the middle (bad), text cut mid-read in the outgoing scene, the incoming scene's first element already landing on the cut (good), and the direction matching reading order.
