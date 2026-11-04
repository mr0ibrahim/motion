# motion — Motion graphics studio skill

**English.** A skill for making professional motion-graphics videos of any genre (ads, explainers, product demos, reels, logo stings, data stories, long-form) in Arabic and English. It covers the brief, script, a full storyboard (PNG/PDF/HTML), AI assets from any model, a code animation engine (tokens, springs, 10 transitions, RTL), the SFX/VO mix at −14 LUFS, chunked rendering and automatic QA, through to a 60 fps master and a 30 fps social file.

Start with `SKILL.md`. Worked examples: `demo-ar/` (a 13 s Gulf-Arabic SAMPLE app ad: master, 30 fps social file, storyboard, QA sheets) and `demo/` (English).

```bash
npm i && npx playwright install chromium
cd demo && node ../scripts/render.mjs film.html checks_layout.txt --check
node ../scripts/storyboard.mjs film.html storyboard/lumo_storyboard --template ../templates/storyboard.html
node ../scripts/render_chunks.mjs film.html out 60 4
node ../scripts/sfx.mjs film.html sfx.wav && bash ../scripts/mix.sh sfx.wav - mix.wav
bash ../scripts/export.sh out mix.wav final/lumo_sample
bash ../scripts/qa.sh final/lumo_sample_master.mp4 storyboard/lumo_storyboard.json checks
```

**العربية.** مهارة لصناعة فيديوهات موشن جرافكس احترافية بكل أنواعها (إعلانات، شروحات، عرض منتجات، ريلز، شعارات متحركة، قصص بيانات، فيديوهات طويلة) بالعربي والإنجليزي. تغطي البريف والسكربت وستوري بورد كامل (PNG/PDF/HTML)، وأصول بالذكاء الاصطناعي من أي نموذج، ومحرك حركة بالكود (توكنز، سبرينغ، ١٠ انتقالات، دعم RTL)، ومكساج مؤثرات وتعليق صوتي على −14 LUFS، ورندر مقسّم وفحص جودة تلقائي، وصولاً إلى نسخة ماستر 60fps ونسخة سوشال 30fps.

ابدأ من `SKILL.md`. وأمثلة كاملة في `demo-ar/` (إعلان عربي خليجي ١٣ ثانية) و`demo/`.

License: MIT. See `LICENSE` for the credits.
