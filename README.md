# motion — Motion graphics studio skill

**English.** An agent skill for making professional motion-graphics videos of any genre (ads, explainers, product demos, reels, logo stings, data stories, long-form) in Arabic and English: brief, script, full storyboard (PNG/PDF/HTML), AI assets from any model, a code animation engine (tokens, springs, 10 transitions, RTL), SFX/VO mix at −14 LUFS, chunked rendering and automatic QA, to a 60 fps master and a 30 fps social file.

## Install

**One command (any agent)**, via the open [skills](https://skills.sh) CLI:

```bash
npx skills add mr0ibrahim/motion                       # pick agents interactively
npx skills add mr0ibrahim/motion -a claude-code -a cursor -a codex -a opencode -y
npx skills add mr0ibrahim/motion -g                    # global (user-level)
```

**Claude Code plugin:**

```
/plugin marketplace add mr0ibrahim/motion
/plugin install motion-graphics@mr0ibrahim-motion
```

**npm installer** *(available after `npm publish`)*:

```bash
npx motion-graphics-skill                    # detects your agents / asks
npx motion-graphics-skill --agent all -y
npx motion-graphics-skill -a claude-code,cursor -g
npx motion-graphics-skill --list             # show target folders
```

**Manual:** copy `skills/motion-graphics/` to one of the folders below.

| Agent | Project | Global |
|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Cursor, Codex, OpenCode, Gemini CLI, GitHub Copilot, Amp, … | `.agents/skills/` | `~/.agents/skills/` |
| Windsurf | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` |

**Then once**, inside the installed skill folder: `npm i && npx playwright install chromium`. Also needs ffmpeg/ffprobe and Python 3 (numpy, scipy, pillow; `faster-whisper` for `align.py`).

## Layout

- `skills/motion-graphics/` — the skill (SKILL.md, references/, scripts/, templates/). This is all that gets installed (~180 KB).
- `examples/demo-ar/`, `examples/demo/` — worked examples with media (not installed).
- `.claude-plugin/` — Claude Code plugin + marketplace manifests. `bin/install.mjs` — npm installer.

Run an example:

```bash
cd examples/demo && S=../../skills/motion-graphics
node $S/scripts/render.mjs film.html checks_layout.txt --check
node $S/scripts/render_chunks.mjs film.html out 60 4
node $S/scripts/sfx.mjs film.html sfx.wav && bash $S/scripts/mix.sh sfx.wav - mix.wav
bash $S/scripts/export.sh out mix.wav final/lumo_sample
```

---

## العربية

مهارة لصناعة فيديوهات موشن جرافكس احترافية بكل أنواعها (إعلانات، شروحات، عرض منتجات، ريلز، شعارات متحركة، قصص بيانات، فيديوهات طويلة) بالعربي والإنجليزي: بريف وسكربت وستوري بورد كامل، أصول بالذكاء الاصطناعي من أي نموذج، محرك حركة بالكود، مكساج مؤثرات وتعليق صوتي، رندر وفحص جودة تلقائي.

### التثبيت

بأمر واحد على أي منصة (Claude Code وCursor وCodex وOpenCode وGemini CLI وCopilot وWindsurf وغيرها):

```bash
npx skills add mr0ibrahim/motion
npx skills add mr0ibrahim/motion -g      # لكل المشاريع
```

كإضافة في Claude Code:

```
/plugin marketplace add mr0ibrahim/motion
/plugin install motion-graphics@mr0ibrahim-motion
```

عن طريق npm (بعد النشر): `npx motion-graphics-skill`

يدوياً: انسخ مجلد `skills/motion-graphics/` إلى مجلد المهارات في منصتك (الجدول فوق).

بعد التثبيت مرة وحدة داخل مجلد المهارة: `npm i && npx playwright install chromium`، وتحتاج ffmpeg وPython 3.

الأمثلة الكاملة في `examples/demo-ar/` (إعلان عربي خليجي ١٣ ثانية) و`examples/demo/`.

License: MIT. See `LICENSE` for the credits.
