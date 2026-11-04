#!/usr/bin/env bash
# qa.sh — the Critic, on the RENDERED file. Writes everything into a checks folder.
#   bash qa.sh film.mp4 [board.json] [checksDir=checks]   (board.json from storyboard.mjs gives the cut times)
# Env: PY=python3 (needs numpy)  LUFS=-14  TP=-1.5
set -uo pipefail
F=$1; B=${2:-}; C=${3:-checks}; PY=${PY:-python3}; LUFS=${LUFS:--14}; TP=${TP:--1.5}; HERE=$(cd "$(dirname "$0")" && pwd); mkdir -p "$C"; FAIL=0
say(){ printf '%-14s %s\n' "$1" "$2"; }
say format "$(ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels -of compact=p=0:nk=1 "$F" | tr '\n' ' ')"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"); say duration "${DUR}s  size $(du -h "$F" | cut -f1)"
ffmpeg -v error -i "$F" -f null - 2>"$C/decode.txt" && say decode ok || { say decode FAIL; FAIL=1; }
read I P < <(ffmpeg -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | awk '/ I:/{i=$2} /Peak:/{p=$2} END{print i, p}')
ok=$(python3 -c "print('ok' if abs($I-($LUFS))<=1 and $P<=$TP+0.05 else 'FAIL')"); say loudness "I=$I LUFS (target $LUFS±1)  true-peak=$P dBTP (≤$TP)  $ok"; [ "$ok" = ok ] || FAIL=1
FR=$(ffmpeg -nostats -i "$F" -vf freezedetect=n=0.0005:d=2.5 -map 0:v -f null - 2>&1 | grep -c freeze_start); say "freeze>2.5s" "$FR (holds longer than 2.5 s with zero change — check they are intentional)"
SI=$(ffmpeg -nostats -i "$F" -af silencedetect=n=-45dB:d=1.0 -map 0:a -f null - 2>&1 | grep silence_start | sed 's/.*silence_start: //' | tr '\n' ' '); say "silence>1s" "${SI:-none}  (starts in seconds; a silent hook or long silent gap in an ad/reel is a defect)"
BL=$(ffmpeg -nostats -i "$F" -vf blackdetect=d=0.1:pix_th=0.05 -an -f null - 2>&1 | grep -c black_start); say black "$BL black stretches"
ffmpeg -v error -y -i "$F" -vf "fps=$(python3 -c "print(min(4,48/$DUR))"),scale=240:-2,tile=8x6:padding=4:color=gray" -frames:v 1 "$C/contact_sheet.png" && say contact "$C/contact_sheet.png"
CUTS=""; [ -n "$B" ] && [ -f "$B" ] && CUTS=$(python3 -c "import json;print(' '.join(f\"{x['t0']}:{x.get('trd',0.4)}\" for x in json.load(open('$B'))[1:]))")
if [ -n "$CUTS" ]; then  # one row per transition: 1 frame BEFORE it starts, 5 across it, 1 AFTER the cut (transitions end on t0)
  T=$(mktemp -d); j=0
  for c in $CUTS; do t=${c%%:*}; d=${c##*:}; for k in -0.12 0 0.2 0.4 0.6 0.8 1.15; do
    ffmpeg -v error -y -ss "$(python3 -c "print(max(0,$t-$d+$k*$d if $k>=0 else $t-$d+$k))")" -i "$F" -frames:v 1 -vf scale=180:-2 "$T/$(printf %04d $j).png"; j=$((j+1)); done; done
  ffmpeg -v error -y -framerate 1 -i "$T/%04d.png" -vf "tile=7x$(( j/7 )):padding=3:color=gray" -frames:v 1 "$C/transitions.png"; rm -r "$T"; say transitions "$C/transitions.png ($((j/7)) transitions × 7 frames: before, 0-80% through, after the cut)"; fi
$PY "$HERE/stutter_scan.py" "$F" ${B:+--cuts "$B"} --json "$C/stutter.json" || FAIL=1
[ $FAIL = 0 ] && echo "QA: PASS (now LOOK at the sheets: readability, safe zone, overlaps, RTL)" || echo "QA: FAIL (see above)"; exit $FAIL
