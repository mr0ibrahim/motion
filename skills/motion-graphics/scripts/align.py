#!/usr/bin/env python3
"""align.py — robust word timings for a voice-over, forced onto the APPROVED SCRIPT text -> words.json.
   python3 align.py vo.(mp3|wav) script.txt words.json [--lang ar|en] [--models large-v3,medium] [--prompt "topic words"]
script.txt: the exact narration, one line per sentence/beat (blank lines and lines starting with # are ignored;
markdown table rows "| t0–t1 | text |" are also accepted). Output: [{w, s, e, line, interp}] for EVERY script word,
in script spelling, monotone in time. interp=true marks words whose time was interpolated (check them by ear).
Method (each step fixes a real failure seen in production):
  1. several transcription passes (faster-whisper large-v3 [+ medium], VAD on and off) — one pass alone drops words
     at low volume or merges short words; VAD-off catches words VAD cuts;
  2. gap passes: any stretch > 1.2 s with no recognised words is re-transcribed alone with the script line as prompt;
  3. each script word gets the MEDIAN start over all passes that matched it (difflib alignment on normalised text);
  4. out-of-order matches are dropped, then holes are filled by character-length interpolation between neighbours.
Arabic normalisation unifies hamza/alef forms, taa marbuta, alef maqsura, tatweel and strips diacritics.
Needs: pip install faster-whisper (CPU int8 is fine; large-v3 ≈ 0.5–1× real time on 8 cores)."""
import sys, re, json, difflib, statistics as st, subprocess, numpy as np
a = sys.argv[1:]; opt = lambda k, d: a[a.index(k) + 1] if k in a else d
audio, script, out = a[0], a[1], a[2]; LANG = opt('--lang', 'ar'); MODELS = opt('--models', 'large-v3').split(','); PROMPT = opt('--prompt', None)
from faster_whisper import WhisperModel
def norm(w):
    if LANG == 'ar':
        w = re.sub(r'[\u064B-\u0652\u0670\u0640]', '', w); w = re.sub(r'[^\u0621-\u064A0-9a-zA-Z]', '', w)
        return w.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').replace('ة', 'ه').replace('ى', 'ي')
    return re.sub(r"[^a-z0-9']", '', w.lower())
L = []
for ln in open(script, encoding='utf8'):
    m = re.match(r'\s*\|\s*[\d.:]+\s*[–-]\s*[\d.:]+\s*\|\s*(.+?)\s*\|', ln); s = m[1] if m else ln.strip()
    if s and not s.startswith('#') and not re.match(r'^\|?[-\s|:]+$', s): L.append(s)
SW = [(w, i) for i, s in enumerate(L) for w in s.split()]; A = [norm(w) for w, _ in SW]
pcm = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', audio, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
DUR = len(pcm) / 16000; runs = []
def tx(m, x, off=0, vad=True, prompt=None):
    segs, _ = m.transcribe(x, language=LANG, word_timestamps=True, beam_size=5, vad_filter=vad, temperature=0.0,
                           condition_on_previous_text=False, initial_prompt=prompt)
    return [(norm(w.word), w.start + off, w.end + off) for s in segs for w in s.words if norm(w.word)]
for name in MODELS:
    m = WhisperModel(name, device='cpu', compute_type='int8')
    for vad in (True, False):
        r = tx(m, pcm, vad=vad, prompt=PROMPT); runs.append(r); print(f'{name} vad={vad}: {len(r)} words', flush=True)
    base = sorted(runs[-2], key=lambda x: x[1]); gaps = []; prev = 0
    for _, s, e in base + [('', DUR, DUR)]:
        if s - prev > 1.2: gaps.append((max(0, prev - .3), min(DUR, s + .3)))
        prev = max(prev, e)
    g = []
    for g0, g1 in gaps: g += tx(m, pcm[int(g0 * 16000):int(g1 * 16000)], g0, vad=False, prompt=PROMPT)
    runs.append(g); print(f'{name} gap passes: {len(gaps)} gaps, {len(g)} words', flush=True)
C = [[] for _ in A]
for r in runs:
    r = sorted(r, key=lambda x: x[1]); B = [x[0] for x in r]
    for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
        if op == 'equal' or (op == 'replace' and a1 - a0 == b1 - b0):
            for k in range(a1 - a0):
                if op == 'equal' or difflib.SequenceMatcher(None, A[a0 + k], B[b0 + k]).ratio() > .6: C[a0 + k].append((r[b0 + k][1], r[b0 + k][2]))
T = [(st.median(x[0] for x in c), st.median(x[1] for x in c)) if c else None for c in C]
last = -1
for j, x in enumerate(T):                               # monotone: drop out-of-order matches
    if x is None: continue
    if x[0] < last: T[j] = None
    else: last = x[0]
real = [j for j, x in enumerate(T) if x]
res = []
for j, (w, li) in enumerate(SW):
    if T[j]: s, e, ip = T[j][0], T[j][1], False
    else:
        p = max([k for k in real if k < j], default=None); n = min([k for k in real if k > j], default=None)
        s0 = T[p][1] if p is not None else 0.0; s1 = T[n][0] if n is not None else DUR
        ks = range((p + 1) if p is not None else 0, n if n is not None else len(SW)); tot = sum(len(SW[k][0]) + 1 for k in ks)
        pre = sum(len(SW[k][0]) + 1 for k in ks if k < j); s = s0 + (s1 - s0) * pre / tot; e = s + (s1 - s0) * (len(w) + 1) / tot; ip = True
    res.append({'w': w, 's': round(s, 3), 'e': round(e, 3), 'line': li, 'interp': ip})
json.dump(res, open(out, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
ni = sum(r['interp'] for r in res); print(f'{out}: {len(res)} words, {len(res) - ni} matched, {ni} interpolated ({ni / len(res) * 100:.0f}%)')
for i in range(len(L)):
    ws = [r for r in res if r['line'] == i]; bad = sum(r['interp'] for r in ws)
    if bad > len(ws) / 2: print(f'  WARN line {i} mostly interpolated ({bad}/{len(ws)}): {L[i][:50]}')
