#!/usr/bin/env bash
# mix.sh — SFX (+ optional voice, + optional music) -> sidechain duck under voice -> TWO-PASS loudnorm -> true-peak safe.
#   bash mix.sh sfx.wav [vo.(wav|mp3)|-] mix.wav [music.wav]
# Env: LUFS=-14 (social; -16 web; -23 broadcast)  TP=-1.5  SG=0dB (SFX gain)  MG=-20dB (music gain, only if a music file is given)
# Default (no music argument) = voice + motion-synced SFX only. Music is opt-in.
set -euo pipefail
SFX=$1; VO=${2:--}; OUT=${3:-mix.wav}; MUS=${4:-}
LUFS=${LUFS:--14}; TP=${TP:--1.5}; SG=${SG:-0dB}; MG=${MG:--20dB}
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SFX")
IN=(-i "$SFX"); n=1
F="[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=$SG[sf0]"
SPL="asplit=2[vo][k1]"; [ -n "$MUS" ] && SPL="asplit=3[vo][k1][k2]"
if [ "$VO" != "-" ]; then IN+=(-i "$VO"); V=$n; n=$((n+1))
  F="$F;[$V:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur=$D,$SPL;[sf0][k1]sidechaincompress=threshold=0.08:ratio=2:attack=10:release=200[sf]"
else F="$F;[sf0]anull[sf]"; fi
if [ -n "$MUS" ]; then IN+=(-i "$MUS"); M=$n; n=$((n+1))
  F="$F;[$M:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=$MG,apad=whole_dur=$D[m0]"
  if [ "$VO" != "-" ]; then F="$F;[m0][k2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[m]"; else F="$F;[m0]anull[m]"; fi; fi
L="[sf]"; c=1; [ "$VO" != "-" ] && { L="[vo]$L"; c=$((c+1)); }; [ -n "$MUS" ] && { L="$L[m]"; c=$((c+1)); }
if [ $c -gt 1 ]; then F="$F;${L}amix=inputs=$c:normalize=0:duration=longest,atrim=0:$D[mx]"; else F="$F;[sf]atrim=0:$D[mx]"; fi
# PASS 1: measure integrated loudness of the pre-mix.  PASS 2: exact gain to target -> 4x-oversampled limiter
# 0.5 dB under TP (true-peak safe incl. AAC). Re-measure; one corrective pass if off by > 0.4 LU
# (limiting removes some loudness on sparse, peaky SFX-only mixes — loudnorm's linear mode cannot reach -14 there).
meas(){ ffmpeg -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/ I:/{i=$2} /Peak:/{p=$2} END{print i, p}'; }
PRE=$(mktemp --suffix=.wav); ffmpeg -v error -y "${IN[@]}" -filter_complex "$F" -map "[mx]" -c:a pcm_f32le "$PRE"
read I0 P0 < <(meas "$PRE"); G=$(python3 -c "print(round($LUFS-($I0),2))")
LIM=$(python3 -c "print(round(10**(($TP-0.5)/20),4))")
for pass in 1 2 3 4; do
  ffmpeg -v error -y -i "$PRE" -af "volume=${G}dB,aresample=192000,alimiter=limit=$LIM:level=false:attack=1:release=60:asc=1,aresample=48000" -c:a pcm_s16le "$OUT"
  read I1 P1 < <(meas "$OUT"); d=$(python3 -c "print(round($LUFS-($I1),2))")
  python3 -c "import sys;sys.exit(0 if abs($d)>0.4 else 1)" || break; G=$(python3 -c "print(round($G+$d*1.6,2))"); done
rm -f "$PRE"; echo " pre-mix I: $I0 LUFS  gain: ${G} dB"; echo " I: $I1 LUFS (target $LUFS)"; echo " Peak: $P1 dBTP (ceiling $TP)"
