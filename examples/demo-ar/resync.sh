#!/usr/bin/env bash
# template engine + this demo's CONFIG overrides + scenes.js -> film.src.html -> film.html (fonts inlined)
cd "$(dirname "$0")" && python3 - <<'P'
t=open('../../skills/motion-graphics/templates/film.src.html').read(); d=open('scenes.js').read()
M0,M1='// ==== SCENES START ====','// ==== SCENES END ===='
t=t[:t.index(M0)]+d.strip()+t[t.index(M1)+len(M1):]
rep={"format:'9:16', duration:12.0, lang:'en', dir:'ltr',":"format:'9:16', duration:13.0, lang:'ar', dir:'rtl',",
 'font:"Figtree, Cairo, sans-serif",':'font:"\'Noto Kufi Arabic\', Cairo, Figtree, sans-serif",',
 "bgs:{ A:['#F2F2EF','#141316','#FF4F1A'], B:['#141316','#F2F2EF','#FF4F1A'], C:['#FF4F1A','#FFFFFF','#141316'] },":"bgs:{ A:['#F4EBDD','#2B1A12','#E8A33D'], B:['#2B1A12','#F4EBDD','#E8A33D'], C:['#E8A33D','#2B1A12','#F4EBDD'] },",
 "acc:'#FF4F1A'":"acc:'#E8A33D'"}
for a,b in rep.items():
  assert a in t, a; t=t.replace(a,b)
open('film.src.html','w').write(t)
P
node ../../skills/motion-graphics/scripts/inline-fonts.mjs film.src.html film.html "Noto Kufi Arabic|100 900|fonts/NotoKufiArabic.ttf" "Cairo|200 1000|fonts/Cairo.ttf" "Figtree|300 900|fonts/Figtree.ttf"
