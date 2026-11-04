// ==== SCENES START ====
// SAMPLE — "دلّة" coffee-delivery app is a FICTIONAL product. 13 s 9:16 Arabic (Gulf) ad, no VO: hook -> problem (character) -> proof (app) -> payoff (character) -> CTA.
SCRIPT.push([0.3,'تبي قهوتك الحين؟'],[2.45,'تعبان وما تبي تطلع من البيت؟'],[5.05,'اطلب من دلّة… توصلك خلال ١٠ دقايق'],[7.85,'قهوتك وصلت: حارّة، طازجة، على كيفك'],[10.45,'دلّة — حمّل التطبيق. إعلان تجريبي']);
const CR='#2B1A12', CM='#F4EBDD', AM='#E8A33D';
const cup=`<svg width="360" height="400" viewBox="0 0 360 400"><g fill="none" stroke="${AM}" stroke-width="12" stroke-linecap="round">
  <path pathLength="1" d="M130 110 C110 80 150 60 130 20"/><path pathLength="1" d="M180 110 C160 80 200 60 180 15"/><path pathLength="1" d="M230 110 C210 80 250 60 230 20"/></g>
  <rect x="70" y="140" width="220" height="36" rx="14" fill="${CM}"/><path d="M85 176 L275 176 L250 390 L110 390 Z" fill="${AM}"/><rect x="100" y="250" width="160" height="60" rx="10" fill="${CR}" opacity=".85"/></svg>`;
const steam=`<svg width="360" height="130" viewBox="0 0 360 130" style="overflow:visible"><g fill="none" stroke="${CM}" stroke-width="12" stroke-linecap="round" opacity=".9">
  <path pathLength="1" d="M130 120 C110 90 150 60 130 20"/><path pathLength="1" d="M180 120 C160 90 200 60 180 10"/><path pathLength="1" d="M230 120 C210 90 250 60 230 20"/></g></svg>`;
const cupBody=`<svg width="360" height="260" viewBox="0 140 360 260"><rect x="70" y="140" width="220" height="36" rx="14" fill="${CM}"/><path d="M85 176 L275 176 L250 390 L110 390 Z" fill="${AM}"/><text x="180" y="300" text-anchor="middle" font-size="58" font-weight="900" fill="${CR}" font-family="Noto Kufi Arabic">دلّة</text></svg>`;
const img=(f,h)=>`<img src="assets/${f}.png" style="height:${h}px;display:block">`;

// 1 HOOK — huge whole-word kinetic type + hero cup (fills ~70% of the frame)
scene({bg:'B',key:1.9,cam:{z:kf([[0,1],[2.5,1.06]])},board:{shot:'HOOK — question in 3 words, hero cup',motion:'whole words rise in masks (RTL order), cup drops on an arc with squash, steam draws on',sfx:'tick, swish, thud, swish'}},(s,w)=>{
  E(s,.15,'SAMPLE · منتج خيالي','left:0;right:0;top:190px;text-align:center;font-size:34px;font-weight:700;color:#a8957f',{a:'fade',sfx:'tick'});
  R.words(s,.35,'تبي قهوتك','left:0;right:0;top:300px;text-align:center;font-size:146px;font-weight:900;line-height:1.3',{sfx:'swish'});
  R.words(s,.85,'الحين؟','left:0;right:0;top:540px;text-align:center;font-size:250px;font-weight:900;line-height:1.25;color:'+AM,{sfx:'thud'});
  E(s,1.15,cupBody,'left:360px;top:1090px',{a:'drop',from:[90,-220],arc:[40,-360],sfx:'thud',depth:1.15});
  R.draw(s,1.45,steam,'left:360px;top:930px',{sfx:'swish',depth:1.15}); });

// 2 PROBLEM — illustrated character (GenerateImage -> cut2.py), 3-layer parallax + push
scene({at:2.4,bg:'A',tr:'zoom',key:4.4,cam:{z:kf([[2.4,1],[5.0,1.08]]),x:kf([[2.4,0],[5.0,-20]])},board:{shot:'PROBLEM — tired character, 3-layer parallax',motion:'back disc (depth .3), character rises (1), "بعدين…" bubble pops in front (1.4); camera push',sfx:'riser (zoom), swish, thud, pop, tick×3 (typing dots)'}},(s,w)=>{
  E(s,2.4,'','left:90px;top:620px;width:900px;height:900px;border-radius:50%;background:#EBD9BE',{a:'fade',depth:.3});
  R.words(s,2.6,'تعبان وما تبي','left:0;right:0;top:170px;text-align:center;font-size:110px;font-weight:900;line-height:1.3',{sfx:'swish'});
  R.words(s,3.05,'تطلع من البيت؟','left:0;right:0;top:340px;text-align:center;font-size:110px;font-weight:900;line-height:1.3;color:#B5651D');
  E(s,2.75,img('char_tired',1240),'left:120px;top:660px',{a:'in',from:[0,180],sfx:'thud',depth:1,bleed:true});
  E(s,3.7,pill(CR,CM,'بعدين…','font-size:52px;padding:18px 42px'),'left:640px;top:1010px',{a:'pop',sfx:'pop',depth:1.4,allowOverlap:true});
  [0,1,2].forEach(k=>E(s,4.05+k*.14,'','left:'+(700+k*44)+'px;top:1185px;width:26px;height:26px;border-radius:50%;background:'+CR,{a:'pop',sfx:'tick',depth:1.4,allowOverlap:true})); });

// 3 PROOF — the app: big phone, route draws on, counter, cursor taps the button
scene({at:5.0,bg:'C',tr:'push',key:7.2,cam:{z:kf([[5,1.0],[7.8,1.04]])},board:{shot:'PROOF — app UI demo',motion:'phone slides up, route draws on, pin pops, counter ٠→١٠, cursor arcs and taps',sfx:'whoosh (push), swish, pop, tick, click'}},(s,w)=>{
  E(s,5.1,`<div style="position:relative;width:760px;height:1140px;border-radius:72px;background:${CR};color:${CM};box-shadow:0 40px 80px rgba(43,26,18,.35)">
     <div style="position:absolute;top:56px;right:60px;font-size:64px;font-weight:900;color:${AM}">دلّة</div>
     <div style="position:absolute;top:170px;left:50px;width:660px;height:520px;border-radius:40px;background:#3a271d;overflow:hidden"><svg width="660" height="520" style="opacity:.35"><g stroke="#F4EBDD" stroke-width="10" fill="none" stroke-linecap="round"><path d="M0 120 L660 80"/><path d="M0 330 L660 380"/><path d="M180 0 L140 520"/><path d="M470 0 L520 520"/></g><g stroke="#F4EBDD" stroke-width="4" opacity=".6"><path d="M0 230 L660 220"/><path d="M320 0 L330 520"/><path d="M0 450 L660 470"/></g></svg></div>
     <div style="position:absolute;top:740px;right:60px;font-size:48px;font-weight:700;opacity:.8">توصلك خلال</div>
     <div style="position:absolute;top:960px;left:60px;right:60px;height:120px;border-radius:999px;background:${AM};color:${CR};font-size:56px;font-weight:900;display:flex;align-items:center;justify-content:center">اطلب الحين</div></div>`,
    'left:160px;top:180px',{a:'in',from:[0,160],sfx:'',depth:1});
  R.draw(s,5.55,`<svg width="560" height="420" viewBox="0 0 560 420"><path pathLength="1" d="M500 380 C420 300 520 220 400 180 S160 220 200 120 S90 40 60 40" fill="none" stroke="${AM}" stroke-width="16" stroke-linecap="round"/></svg>`,'left:260px;top:400px',{sfx:'swish'});
  E(s,6.15,'','left:292px;top:412px;width:56px;height:56px;border-radius:50%;background:'+CM+';border:12px solid '+AM,{a:'pop',sfx:'pop'});
  R.counter(s,6.0,'left:420px;top:880px;font-size:120px;font-weight:900;color:'+CM+';line-height:1;width:180px;text-align:center;direction:ltr',0,10,{dur:.9,sfx:'tick'});
  E(s,6.0,'دقايق','left:250px;top:905px;font-size:64px;font-weight:800;color:'+AM,{a:'fade'});
  R.cursor(s,[[6.35,820,1560],[7.15,560,1220,true]],{color:CR,ring:CM}); });

// 4 PAYOFF — same character (reference-consistent), iris opens from the tapped button
scene({at:7.8,bg:'A',tr:'iris',trOpt:{at:[540,1220]},key:9.8,cam:{z:kf([[7.8,1.02],[10.4,1.08]])},board:{shot:'PAYOFF — happy character with the cup',motion:'iris from the button, character slides in on an arc, burst at the cup, 3 benefit pills stagger (depth 1.3)',sfx:'whoosh (iris), thud, sparkle, pop×3, sparkle (rating)'}},(s,w)=>{
  E(s,7.8,'','left:90px;top:620px;width:900px;height:900px;border-radius:50%;background:#EBD9BE',{a:'fade',depth:.3});
  E(s,8.05,img('char_happy',1240),'left:150px;top:660px',{a:'in',from:[-140,60],arc:[-60,-40],sfx:'thud',depth:1,bleed:true});
  R.burst(s,8.45,420,1290,{n:18,color:AM,seed:9,dist:200}); E(s,8.47,'','left:420px;top:1290px;width:1px;height:1px',{a:'none',sfx:'sparkle'});
  R.words(s,8.0,'قهوتك وصلت','left:0;right:0;top:170px;text-align:center;font-size:126px;font-weight:900;line-height:1.3');
  ['حارّة','طازجة','على كيفك'].forEach((t,k)=>E(s,8.7+k*STAG*1.6,pill(k===2?AM:CR,k===2?CR:CM,t,'font-size:44px;padding:14px 32px'),
    `left:0;right:0;top:${430}px;display:flex;justify-content:${['flex-end','center','flex-start'][k]};padding:0 170px`,{a:'in',from:[0,50],arc:[0,-30],sfx:'pop',depth:1.3}));
  E(s,9.45,pill(CM,CR,'★ ٤٫٩ تقييم','font-size:40px;padding:12px 30px;border:4px solid '+CR),'left:0;right:0;top:590px;display:flex;justify-content:center',{a:'pop',sfx:'sparkle',depth:1.3,allowOverlap:true}); });

// 5 CTA — logo mask reveal, underline, CTA pill, SAMPLE disclaimer
scene({at:10.4,bg:'B',tr:'split',key:12.3,cam:{z:kf([[10.4,1.04],[13,1]])},board:{shot:'CTA — logo + download pill + SAMPLE',motion:'split, logo mask-reveals (pull-out), underline draws RTL, pills pop',sfx:'whoosh (split), thud, pop, chime'}},(s,w)=>{
  E(s,10.6,cup,'left:360px;top:175px',{a:'pop',depth:.8});
  E(s,10.75,'دلّة','left:0;right:0;top:610px;text-align:center;font-size:290px;font-weight:900;line-height:1.2;color:'+AM,{a:'mask',sfx:'thud'});
  E(s,11.1,'','left:290px;top:1040px;width:500px;height:14px;border-radius:7px;background:'+CM,{a:'draw'});
  E(s,11.4,pill(AM,CR,'حمّل التطبيق','font-size:60px;padding:22px 60px'),'left:0;right:0;top:1095px;display:flex;justify-content:center',{a:'pop',sfx:'pop'});
  E(s,11.8,pill('#3a271d','#cdb9a0','SAMPLE · إعلان تجريبي — منتج غير حقيقي','font-size:32px'),'left:0;right:0;top:1250px;display:flex;justify-content:center',{a:'fade',sfx:'chime'}); });
// ==== SCENES END ====
