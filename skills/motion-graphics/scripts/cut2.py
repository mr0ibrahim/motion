#!/usr/bin/env python3
"""cut2.py — cut flat/illustrated assets (AI-generated on a plain light background) to clean transparent PNGs.
   python3 cut2.py in.png|in_dir out_dir [--tol 11] [--sat 10] [--fill] [--sides 4|3] [--min 60] [--hull]
How: background = near-white/low-saturation pixels CONNECTED TO THE IMAGE BORDER (flood from edges), so white parts
inside the subject (eyes, paper, a white shirt) survive. Then: remove specks < --min px, optional hole fill (--fill, for
solid objects), optional convex hull (--hull, for round objects with soft shadows), soft 2-px edge with white-fringe
un-premultiply, and a tight crop with 6 px padding.
The background colour is the median of the border pixels (any flat colour works; --white forces pure white).
--tol: how far from that colour counts as background (raise to 25-30 for soft grey shadows; lower to 8 for subjects with white rims)
--sides 3: do not flood from the bottom edge (characters cut by the frame bottom, so the body is not eaten)
For photos / complex backgrounds use a matting model instead (e.g. `pip install rembg` → `rembg i in.jpg out.png`),
or GenerateImage with an edit instruction "isolate on pure white #FFFFFF, no shadow" and then this script.
Needs numpy, scipy, pillow."""
import sys, os, glob, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
a = sys.argv[1:]; opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
src, dst = a[0], a[1]; os.makedirs(dst, exist_ok=True)
TOL, SAT, MIN, SIDES = opt('--tol', 11), opt('--sat', 10), opt('--min', 60), opt('--sides', 4)
files = sorted(glob.glob(os.path.join(src, '*.[pjPJ][pnPN]*[gG]'))) if os.path.isdir(src) else [src]
for f in files:
    n = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert('RGB'); a3 = np.asarray(im).astype(np.float32)
    ring = np.concatenate([a3[0], a3[:, 0], a3[:, -1]] + ([a3[-1]] if SIDES == 4 else []))
    BG = np.median(ring, 0) if '--white' not in a else np.array([255., 255, 255])   # background colour sampled from the border
    d = np.abs(a3 - BG).max(2); sat = np.abs((a3.max(2) - a3.min(2)) - (BG.max() - BG.min()))
    cand = (d < TOL) & (sat < SAT)
    lab, _ = nd.label(cand)
    borders = [lab[0], lab[:, 0], lab[:, -1]] + ([lab[-1]] if SIDES == 4 else [])
    edge = np.unique(np.concatenate(borders)); bg = np.isin(lab, edge[edge > 0]); fg = ~bg
    l2, k2 = nd.label(fg); sz = nd.sum(fg, l2, range(1, k2 + 1)); fg = np.isin(l2, 1 + np.where(sz >= MIN)[0])
    if '--fill' in a: fg = nd.binary_fill_holes(fg)
    if '--hull' in a:
        from scipy.spatial import ConvexHull
        ys, xs = np.where(fg); pts = np.c_[xs, ys]; h = ConvexHull(pts)
        mk = Image.new('L', (fg.shape[1], fg.shape[0]), 0); ImageDraw.Draw(mk).polygon([tuple(map(int, p)) for p in pts[h.vertices]], fill=1)
        fg = nd.binary_erosion(np.asarray(mk).astype(bool), iterations=2)
    near = nd.binary_dilation(fg, iterations=2) & ~nd.binary_erosion(fg, iterations=1)
    soft = np.clip((d + sat) / 22, 0, 1)
    al = fg.astype(np.float32); al = np.where(near & fg, np.minimum(1, soft * 1.0 + 0.0), al); al = np.where(near & ~fg, 0, al)
    rgb = a3.copy(); m = near & (al > .05) & (al < 1)
    for c in range(3): rgb[..., c] = np.where(m, np.clip((a3[..., c] - BG[c] * (1 - al)) / np.maximum(al, 1e-3), 0, 255), a3[..., c])
    out = np.dstack([rgb, al * 255]).astype(np.uint8); ys, xs = np.where(al > .03)
    if not len(ys): print(n, 'EMPTY — lower --tol'); continue
    y0, y1, x0, x1 = max(0, ys.min() - 6), ys.max() + 7, max(0, xs.min() - 6), xs.max() + 7
    Image.fromarray(out[y0:y1, x0:x1]).save(os.path.join(dst, n + '.png'))
    print(f'{n}: {x1 - x0}x{y1 - y0}  fg {fg.mean() * 100:.0f}%  bg≈#{"".join(f"{int(v):02x}" for v in BG)}')
