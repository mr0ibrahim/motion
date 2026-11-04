# Sound: SFX + voice-over by default, no music

**Default: motion-synced SFX + VO, no music.** Music is opt-in: only when the user asks for it or supplies a track, and only licensed music. (Lesson from reel3/reel4: a default music bed fought the VO, needed ducking everywhere and was the most-criticised element.)

## Pipeline
```bash
node scripts/sfx.mjs film.html sfx.wav            # renders window.buildAudio -> 48 kHz stereo, and writes sfx.json = [[time, kind], ...]
bash scripts/mix.sh sfx.wav vo.mp3 mix.wav         # with VO
bash scripts/mix.sh sfx.wav - mix.wav              # no VO (supers-only ad)
bash scripts/mix.sh sfx.wav vo.mp3 mix.wav music.wav   # music only if asked: MG=-20dB default, sidechain-ducked under the VO
```
Env: `LUFS=-14` (social; `-16` web/YouTube, `-23` broadcast) · `TP=-1.5` · `SG=0dB` SFX gain · `MG=-20dB` music gain.
mix.sh does the sidechain duck under the voice, then a **two-pass** loudnorm (measure → exact linear gain → a true-peak limiter at 192 kHz). Single-pass loudnorm on short clips lands ±2 LU off target, so never use it.

## Where the SFX come from (automatic, in sync)
- **Transitions**: `TRS` = wipe/push/split/blinds/iris/blob/morph → `whoosh`, zoom → `riser`, glitch → `glitch`, cut → none. Each starts 0.03 s before the transition and peaks on the cut. It is panned by direction.
- **Elements**: `E(..., {sfx:'pop'})` fires at `at - LEAD + 0.07`, which is the visual peak of the entrance (particles and ripples fire at `at`). The pan follows the element's x position.
- **Kinds** (12): `whoosh riser swish pop tick click thud chime sparkle glitch buzz` + transitions. These are synthesised from seeded noise and oscillators, so they are deterministic.

| Visual | SFX |
|---|---|
| A word or line lands | `tick` (light) / `thud` (slam) |
| Pill, badge, icon pops | `pop` |
| Line, underline or route draws on | `swish` |
| Something drops or lands | `thud` |
| Cursor click / tap | `click` (automatic in `R.cursor`) |
| Success, payoff, logo resolve | `chime` / `sparkle` |
| Number counter | `tick` at the start |
| Error, warning | `buzz` |

## Rules
- The hook makes sound in the first ~0.3 s. **QA flags any silence over 1 s.** In a no-VO ad, fill gaps with a real motion event that carries its own SFX (demo-ar: typing dots, a rating pill). Don't fill them with noise.
- No more than 2 SFX at the same instant (stagger by ≥ 0.06 s). Every SFX sits under the VO.
- Mix priority: **VO > SFX > music**. The music bed sits ~−20 dB and ducks 8–12 dB under the voice.
- Every hit is in sync within ±1 frame. Compare `sfx.json` against the board and look/listen at the cut frames.
- The SFX-only pre-mix is quiet (≈ −36 LUFS). mix.sh adds the gain, so don't hand-boost the page.

## Voice-over
1. Write the script in the target dialect (see arabic-rtl.md). One line per beat.
2. TTS: ElevenLabs (the user's key) multilingual v2/v3. Test one line in 2–3 voices first, and check the dialect by ear. Or use the user's own recording (48 kHz WAV, a quiet room).
3. `python3 scripts/align.py vo.mp3 script.txt words.json --lang ar` (faster-whisper large-v3, VAD on/off passes, gap re-transcription, median over passes, forced onto the script spelling). Check the `interp` count. Words marked `interp:true` must be checked by ear.
4. Paste `words.json` into `/*WORDS*/`. Scenes, captions and SFX then time themselves to words with `W('word')`.

## Licensed sources
CC0: Kenney, Freesound (CC0 filter). Mixkit (use in videos, no redistribution). YouTube Audio Library (YouTube only). Record each file + URL + licence in `CREDITS.md`.
