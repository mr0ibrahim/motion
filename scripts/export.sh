#!/usr/bin/env bash
# export.sh — concat rendered chunks, mux the mix, and make the 30 fps phone/social file.
#   bash export.sh outDir mix.wav final/NAME     -> final/NAME_master.mp4 (render fps) + final/NAME_social30.mp4
# Social file: H.264 High, CRF 20, yuv420p, 30 fps, AAC 192k, +faststart — plays on every phone/app, small.
set -euo pipefail
D=$1; A=$2; O=$3; mkdir -p "$(dirname "$O")"
ffmpeg -v error -y -f concat -safe 0 -i "$D/list.txt" -i "$A" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "${O}_master.mp4"
ffmpeg -v error -y -i "${O}_master.mp4" -vf fps=30 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -level 4.2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -movflags +faststart "${O}_social30.mp4"
for f in "${O}_master.mp4" "${O}_social30.mp4"; do
  echo "$f  $(ffprobe -v error -select_streams v -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$f")  $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$f")"; done
