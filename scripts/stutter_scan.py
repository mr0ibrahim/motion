#!/usr/bin/env python3
"""stutter_scan.py — frame-delta QA on a RENDERED file (numpy only).
   python3 stutter_scan.py film.mp4 [--cuts board.json|t1,t2,...] [--json report.json]
Detects:
  JUMP     single-frame spike in motion energy (a snap / missing in-between) — not at a planned cut
  DUP      a frozen (identical) frame in the middle of motion (renderer stall, duplicated frame, 0-delta easing step)
  FLICKER  per-frame noise change while the picture is otherwise still (animated grain / dithering / shimmer)
  JERK     motion energy that drops to ~0 and resumes within 2 frames (stop-start easing, unsmoothed keyframes)
Exit code 1 if any JUMP/DUP/FLICKER is found."""
import subprocess, sys, json, numpy as np
a = sys.argv[1:]; f = a[0]; opt = lambda k: a[a.index(k) + 1] if k in a else None
W, H = 288, 512
pr = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip().split(',')
w0, h0 = int(pr[0]), int(pr[1]); n_, d_ = pr[2].split('/'); fps = float(n_) / float(d_)
if w0 > h0: W, H = H, W
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={W}:{H}:flags=area,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
A = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
def blur(x, k=9):  # k x k box blur via cumulative sums (numpy only); wide enough that grain stays out of the low band
    r = k // 2; p = np.pad(x, ((0, 0), (r, r), (r, r)), mode='edge'); c = p.cumsum(1).cumsum(2); c = np.pad(c, ((0, 0), (1, 0), (1, 0)))
    return (c[:, k:, k:] - c[:, :-k, k:] - c[:, k:, :-k] + c[:, :-k, :-k]) / (k * k)
lo = blur(A)[:, ::2, ::2]; hi = A - blur(A, 3)   # motion on a smoothed half-res band; noise in the fine band
dl = np.abs(np.diff(lo, axis=0)).mean(axis=(1, 2))          # motion energy per frame step
dh = np.abs(np.diff(hi, axis=0)).mean(axis=(1, 2))          # fine-detail (noise) change per step
cuts = []
c = opt('--cuts')
if c: cuts = [x['t0'] for x in json.load(open(c))][1:] if c.endswith('.json') else [float(x) for x in c.split(',')]
near_cut = lambda i: any(abs(i / fps - t) < 0.6 for t in cuts)
R = {'file': f, 'fps': fps, 'frames': int(len(A)), 'jump': [], 'dup': [], 'jerk': [], 'flicker_frames': 0}
for i in range(2, len(dl) - 2):
    t = round((i + 1) / fps, 3)
    if dl[i] > 3 and dl[i] > 4 * max(dl[i - 1], dl[i + 1], .3) and not near_cut(i): R['jump'].append([t, round(float(dl[i]), 2)])
    if dl[i] < .01 and dh[i] < .01 and dl[i - 1] > .6 and dl[i + 1] > .6 and dh[i - 1] < 3 * dl[i - 1]: R['dup'].append(t)
    if dl[i] < .05 and dl[i - 1] > .8 and dl[i + 1] > .8 and not near_cut(i): R['jerk'].append(t)
still = dl < .6                        # the low band barely moves...
fl = still & (dh > .35) & (dh > 4 * dl) # ...while the fine band changes: grain/dither re-rolling
R['flicker_frames'] = int(fl.sum()); R['still_frames'] = int(still.sum())
R['flicker_ratio'] = round(float(fl.sum()) / max(1, still.sum()), 3)
R['noise_change_on_still_frames'] = round(float(np.median(dh[still])) if still.any() else 0, 3)
R['max_motion'] = [round(float(dl.max()), 2), round(float(dl.argmax() + 1) / fps, 2)]
FLK = R['flicker_ratio'] > 0.2 and R['flicker_frames'] > fps
print(f"{f}: {len(A)} frames @{fps:g}  max motion {R['max_motion'][0]} at {R['max_motion'][1]}s")
print(f"  JUMP spikes   : {len(R['jump'])} {R['jump'][:12]}")
print(f"  DUP in motion : {len(R['dup'])} {R['dup'][:12]}")
print(f"  JERK (stop-go): {len(R['jerk'])} {R['jerk'][:12]}")
print(f"  FLICKER       : {'FAIL' if FLK else 'ok'}  noise change on still frames median {R['noise_change_on_still_frames']} (static grain ≈ 0), ratio {R['flicker_ratio']}")
if opt('--json'): json.dump(R, open(opt('--json'), 'w'), indent=1)
sys.exit(1 if (R['jump'] or R['dup'] or FLK) else 0)
