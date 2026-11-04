#!/usr/bin/env bash
# re-apply the package template's engine to this demo, keeping the demo's CONFIG duration and SCENES block, then build
python3 - <<'P'
t=open('../../skills/motion-graphics/templates/film.src.html').read(); d=open('film.src.html').read()
M0,M1='// ==== SCENES START ====','// ==== SCENES END ===='
t=t[:t.index(M0)]+d[d.index(M0):d.index(M1)]+t[t.index(M1):]
t=t.replace("format:'9:16', duration:12.0","format:'9:16', duration:10.5")
open('film.src.html','w').write(t)
P
node ../../skills/motion-graphics/scripts/inline-fonts.mjs film.src.html film.html "Figtree|300 900|fonts/Figtree.ttf" "Cairo|200 1000|fonts/Cairo.ttf"
