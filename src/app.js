/*@TENSES_META*/
const F={'+':'Утверждение','-':'Отрицание','?':'Вопрос'};
const FC={'+':'plus','-':'minus','?':'q'};
const L={ru:'Русский',uz:"O'zbekcha",mix:'Вперемешку'};
// t|f|ru|uz|en|alts (;)|key words
const BANK=__TENSES__.split("\n").map((l,i)=>{const[t,f,ru,uz,en,alt,h]=l.split("|");return{id:i,t,f,ru,uz,en,h,all:[en].concat(alt?alt.split(";"):[])}});
let recent=[];
let prog={cells:{},days:{}};
try{const pv=JSON.parse(localStorage.getItem('tenses3prog')||'null');if(pv&&pv.cells)prog=pv}catch(e){}
const saveProg=()=>{try{localStorage.setItem('tenses3prog',JSON.stringify(prog))}catch(e){}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function record(t,f,good){
  const k=t+f,c=prog.cells[k]||(prog.cells[k]=[0,0]);c[1]++;if(good)c[0]++;
  const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;
  const ks=Object.keys(prog.days).sort();while(ks.length>60)delete prog.days[ks.shift()];
  saveProg();
}
const acc=k=>{const c=prog.cells[k];return c&&c[1]?c[0]/c[1]:null};

let on={t:{past:1,pres:1,fut:1},f:{'+':1,'-':1,'?':1},lang:'mix',voice:1,slow:0,theme:'auto',snd:1,vib:1};
let best={streak:0,1:0,3:0,5:0};
try{const sv=JSON.parse(localStorage.getItem('tenses3')||'null');if(sv){if(sv.on&&sv.on.t)on=Object.assign(on,sv.on);if(sv.best&&typeof sv.best==='object')best=Object.assign(best,sv.best)}}catch(e){}
const save=()=>{try{localStorage.setItem('tenses3',JSON.stringify({on,best}))}catch(e){}};

const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
/* ---------- feedback: animation, sound, vibration ---------- */
const reduced=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function enter(el){el.classList.remove('enter','good','bad');void el.offsetWidth;el.classList.add('enter')}
function fx(el,good){if(!el)return;el.classList.remove('enter','good','bad');void el.offsetWidth;el.classList.add(good?'good':'bad');clearTimeout(el._fx);el._fx=setTimeout(()=>el.classList.remove('good','bad'),reduced()?900:750)}
let actx=null;
function tone(good){
  if(!on.snd)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    actx=actx||new AC();if(actx.state==='suspended')actx.resume();
    const t0=actx.currentTime,g=actx.createGain();g.connect(actx.destination);
    const notes=good?[[660,0],[990,.08]]:[[220,0],[185,.09]];
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(good?0.07:0.06,t0+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+(good?0.32:0.3));
    for(const[f,d]of notes){const o=actx.createOscillator();o.type=good?'sine':'triangle';o.frequency.setValueAtTime(f,t0+d);o.connect(g);o.start(t0+d);o.stop(t0+d+0.2)}
  }catch(e){}
}
function buzz(good){if(on.vib&&navigator.vibrate){try{navigator.vibrate(good?18:[35,45,35])}catch(e){}}}
function feedback(el,good){fx(el,good);tone(good);buzz(good);topToday()}
function topToday(){const d=prog.days[today()]||[0,0];$('topToday').textContent=d[0]}
function applyTheme(){const t=on.theme||'auto';if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t)}
/*@TENSE_TRAINER*/

/* speech */
let tts=null;
function say(text){
  stopSay();
  const rate=on.slow?0.75:1;
  if(tts)return tts.speak(text,{rate,language:'en'}).catch(e=>{if(e&&e.code==='not_granted')tts=null});
  const ss=window.speechSynthesis;
  if(!ss||typeof SpeechSynthesisUtterance==='undefined')return Promise.resolve();
  return new Promise(res=>{
    try{
      const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate*0.95;
      const vs=ss.getVoices();const v=vs.find(x=>/^en[-_]US/i.test(x.lang))||vs.find(x=>/^en/i.test(x.lang));if(v)u.voice=v;
      const done=()=>{clearTimeout(g);res()};const g=setTimeout(res,8000);
      u.onend=done;u.onerror=done;ss.speak(u);
    }catch(e){res()}
  });
}
function stopSay(){
  try{if(tts)tts.stop();else if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}
}
if(window.claude&&typeof window.claude.use==='function'){
  window.claude.use('tts').then(t=>{if(t)tts=t}).catch(()=>{});
}
try{if(window.speechSynthesis)speechSynthesis.getVoices()}catch(e){}

/* voice */
let dict=null,listening=false,base='';
const mic=$('mic');
mic.addEventListener('click',()=>{
  if(!dict){$('tip').classList.toggle('on');$('ans').focus();return}
  if(listening){dict.stop().catch(()=>{});return}
  base=$('ans').value.trim();
  dict.start().catch(e=>{if(String(e&&(e.message||e)).includes('not_granted')){dict=null;$('tip').classList.add('on')}});
});
if(window.claude&&typeof window.claude.use==='function'){
  window.claude.use('dictation').then(d=>{
    if(!d)return;dict=d;
    d.onPartial(({text})=>{$('ans').value=(base?base+' ':'')+text});
    d.onFinal(({text})=>{base=(base?base+' ':'')+text;$('ans').value=base});
    d.onState(({state})=>{listening=state==='listening';mic.classList.toggle('rec',listening)});
  }).catch(()=>{});
}

$('pFocus').addEventListener('click',()=>{on.focus=on.focus?0:1;save();renderProg();if(on.focus){showTab('train');if(sec==='words')wNext();else if(sec==='art')aNext();else if(!run)next()}});
$('pReset').addEventListener('click',()=>{if($('pReset').dataset.c){prog={cells:{},days:{}};saveProg();renderProg();$('pReset').textContent='Сброшено';delete $('pReset').dataset.c}else{$('pReset').dataset.c=1;$('pReset').textContent='Точно сбросить? Нажми ещё раз'}});
/* ===== articles ===== */
const RULES={
 r1:{g:'a',n:'Один из многих, упоминаем впервые',s:'Предмет впервые появляется в разговоре — «какой-то, один». Только с исчисляемыми в единственном числе.',
  d:'A/an произошёл от слова one — «один». Ставим, когда говорим о предмете впервые или когда неважно, какой именно — любой из многих. Работает только с исчисляемыми существительными в единственном числе: a book, но не a books и не a water.',
  ex:['I saw **a** dog in the park. — Я видел (какую-то) собаку.','There is **a** cafe near my house.','I need **a** pen. — Нужна ручка (любая).']},
 r2:{g:'a',n:'A или AN — по звуку',s:'AN — перед гласным звуком (an apple, an hour). A — перед согласным звуком (a university, a big apple).',
  d:'Выбор зависит от первого ЗВУКА следующего слова, а не от буквы. Перед гласным звуком — an: an apple, an hour (h немая). Перед согласным — a: a university (звук «ю»), a one-way ticket. Если есть прилагательное, смотрим на него: an old car, a big apple.',
  ex:['**an** apple, **an** hour, **an** interesting film','**a** university, **a** uniform, **a** European city','**a** big apple — но **an** apple']},
 r3:{g:'a',n:'Профессия и «кто такой»',s:'Когда говорим, кем человек работает или кто он такой: She is a doctor.',
  d:'По-русски «Мама — врач» без всяких слов, а по-английски обязательно a/an: человек — один из многих врачей. То же с описанием: He is a kind man. Во множественном числе артикля нет: They are doctors.',
  ex:['My mother is **a** doctor.','I want to be **an** engineer.','He is **a** very kind man.']},
 r4:{g:'a',n:'Устойчивые выражения с A',s:'What a…!, such a…, «раз в» (twice a week), a lot of, a few, a little.',
  d:'Выражения, которые нужно просто запомнить: what a… (Какой…!), such a… (такой…), «раз в»: once a day, three times a week, 60 km an hour; количество: a lot of, a few, a little, a couple of.',
  ex:['What **a** beautiful day!','It was such **an** easy test.','I go to the gym three times **a** week.','I have **a** lot of work.']},
 r5:{g:'the',n:'Уже упоминали',s:'О предмете уже говорили — теперь он «тот самый»: первый раз a, потом the.',
  d:'The произошёл от that — «тот». Когда о предмете уже говорили, во второй раз он известен обоим: «Я купил куртку. Куртка (та самая) была дорогой». Первое упоминание — a/an, дальше — the.',
  ex:['I bought **a** jacket. **The** jacket was expensive.','We have **a** cat. **The** cat is black.']},
 r6:{g:'the',n:'Единственный в мире или в ситуации',s:'Такой предмет один: the sun, the moon, the internet — или один в этой ситуации: the door, the kitchen.',
  d:'Если предмет единственный в мире (the sun, the moon, the sky, the world, the internet) или единственный в конкретной ситуации и обоим ясно, о чём речь, — ставим the. «Закрой дверь» — в комнате одна дверь: close the door. «Мама на кухне» — в квартире одна кухня: in the kitchen.',
  ex:['**The** sun is hot today.','Close **the** door, please.','I found it on **the** internet.','Mom is in **the** kitchen.']},
 r7:{g:'the',n:'Самый, первый, последний, тот же',s:'Перед best, biggest, first, last, same, only — всегда the.',
  d:'Самый лучший, первый, последний, единственный, тот же самый — такой может быть только один, поэтому the: the best, the most expensive, the first, the last, the same, the only. Внимание: next week, last year (считаем от сегодня) — без артикля.',
  ex:['This is **the** best plov in the city.','He was **the** first to help me.','We live in **the** same building.']},
 r8:{g:'the',n:'Уточнили, какой именно',s:'После слова есть уточнение: the man in the black jacket, the capital of Uzbekistan, the cake you made.',
  d:'Если дальше идёт уточнение, которое выделяет конкретный предмет из всех — с of, с предлогом места или со словами that / which / who — ставим the: the capital of France, the man in the black jacket, the cake (that) you made.',
  ex:['**The** capital of Uzbekistan is Tashkent.','Who is **the** man in the black jacket?','I liked **the** cake you made.']},
 r9:{g:'the',n:'География: реки, моря, пустыни, «составные» страны',s:'Реки, моря, океаны, пустыни, горные хребты и страны со словами States / Kingdom / Republic: the USA, the UK, the Aral Sea.',
  d:'С the: реки (the Amu Darya, the Thames), моря и океаны (the Aral Sea, the Pacific Ocean), пустыни (the Kyzylkum, the Sahara), горные хребты (the Alps, the Tian Shan), страны с «составными» названиями или во мн. числе (the USA, the UK, the UAE, the Netherlands). Без артикля: города, большинство стран, отдельные горы и озёра (Tashkent, Uzbekistan, Everest, Lake Issyk-Kul).',
  ex:['**the** USA, **the** UK, **the** Netherlands','**the** Aral Sea, **the** Amu Darya, **the** Kyzylkum','но: Tashkent, Uzbekistan, Russia — без артикля']},
 r10:{g:'the',n:'Инструменты, кино, театр, радио',s:'play the piano / the guitar, go to the cinema / the theatre, listen to the radio. Но: watch TV — без артикля.',
  d:'С музыкальными инструментами — the: play the piano, the guitar, the dutar. Кино и театр как место отдыха: go to the cinema, the theatre. Радио — the radio. Исключение: watch TV — без артикля.',
  ex:['She plays **the** piano.','Let’s go to **the** cinema.','Dad listens to **the** radio. (но: watch TV)']},
 r11:{g:'0',n:'Мн. число и неисчисляемое «вообще»',s:'Говорим о чём-то в целом — во мн. числе или о неисчисляемом (вода, сахар, деньги): артикля нет.',
  d:'Когда речь о предметах вообще, как о целом классе: I like cats (кошек вообще), Sugar is bad (сахар как таковой). Неисчисляемые — water, sugar, money, tea, bread, information, advice, furniture — никогда не бывают с a/an. Но если конкретно — the: The sugar is in the cupboard (тот сахар, что у нас дома).',
  ex:['I like cats.','Sugar is bad for your teeth.','Money isn’t everything.']},
 r12:{g:'0',n:'Имена, города, страны, языки',s:'Имена, города, большинство стран, улицы и языки — без артикля.',
  d:'Имена людей (Akmal, Malika), города (Tashkent, Samarkand), большинство стран (Uzbekistan, Russia, China), улицы (Navoi Street), языки (English, Uzbek) — без артикля. Исключения — «составные» страны: the USA, the UK (см. «География»).',
  ex:['I live in Tashkent.','Akmal is my best friend.','We are learning English.']},
 r13:{g:'0',n:'Еда, спорт, дни, месяцы',s:'have breakfast / lunch / dinner, play football, on Monday, in May — без артикля.',
  d:'Приёмы пищи (breakfast, lunch, dinner), виды спорта и игры (football, chess), дни недели, месяцы и праздники (on Monday, in May, at Navruz) — без артикля. Сравни: play football (без), но play the piano (с the).',
  ex:['What did you have for breakfast?','The boys play football.','See you on Monday!','My birthday is in May.']},
 r14:{g:'0',n:'School, work, bed, home, by bus',s:'go to school / work / bed, at home, at night, by bus / metro / car — без артикля.',
  d:'Когда место используется «по назначению», артикль не ставим: go to school (учиться), go to work, go to bed (спать), be in hospital (лечиться). Также: at home, at work, at night, by bus, by car, by metro. Сравни: Mom went to the school to talk to the teacher — пошла в здание, а не учиться.',
  ex:['The children go to school by bus.','I’m going to bed.','We stayed at home.']},
 r15:{g:'0',n:'После my, this, some, чисел и ’s',s:'Если перед словом уже есть my / your / this / that / some / any / no, число или чьё-то ’s — артикль не нужен.',
  d:'Артикль — это «определитель». Если у слова уже есть другой определитель, второй не ставят: my car (не the my car), this book, some water, two apples, Akmal’s phone, no time.',
  ex:['I can’t find my keys.','This bag is very heavy.','Akmal’s car is new.']}
};
const GT={a:['ga','A / AN'],the:['gt','THE'],'0':['g0','—']};
const md=s=>s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const AB=`r1|I saw ___ dog in the park.|a|Я видел собаку в парке.|Men parkda it ko'rdim.
r1|We need ___ new fridge.|a|Нам нужен новый холодильник.|Bizga yangi muzlatgich kerak.
r1|There is ___ cafe near my house.|a|Рядом с моим домом есть кафе.|Uyim yaqinida kafe bor.
r1|Can I have ___ glass of water?|a|Можно мне стакан воды?|Menga bir stakan suv bera olasizmi?
r2|She eats ___ apple every day.|an|Она ест яблоко каждый день.|U har kuni olma yeydi.
r2|I'll be back in ___ hour.|an|Я вернусь через час.|Bir soatdan keyin qaytaman.
r2|My brother studies at ___ university in Tashkent.|a|Мой брат учится в университете в Ташкенте.|Akam Toshkentdagi universitetda o'qiydi.
r2|It was ___ interesting film.|an|Это был интересный фильм.|Bu qiziqarli film edi.
r3|My mother is ___ doctor.|a|Моя мама — врач.|Oyim shifokor.
r3|Akmal wants to be ___ engineer.|an|Акмал хочет стать инженером.|Akmal muhandis bo'lishni xohlaydi.
r3|Her father is ___ taxi driver.|a|Её папа — таксист.|Uning dadasi taksi haydovchisi.
r3|I am ___ student.|a|Я студент.|Men talabaman.
r4|What ___ beautiful day!|a|Какой прекрасный день!|Qanday go'zal kun!
r4|I go to the gym three times ___ week.|a|Я хожу в спортзал три раза в неделю.|Men haftasiga uch marta sportzalga boraman.
r4|It was such ___ easy test.|an|Это был такой лёгкий тест.|Bu juda oson test edi.
r4|I have ___ lot of work today.|a|Сегодня у меня много работы.|Bugun ishim juda ko'p.
r5|I bought a shirt and a jacket. ___ jacket was expensive.|the|Я купил рубашку и куртку. Куртка была дорогой.|Ko'ylak va kurtka sotib oldim. Kurtka qimmat edi.
r5|We have a cat and a dog. ___ cat is black.|the|У нас есть кошка и собака. Кошка чёрная.|Bizda mushuk va it bor. Mushuk qora.
r5|I read a book yesterday. ___ book was boring.|the|Вчера я читал книгу. Книга была скучной.|Kecha kitob o'qidim. Kitob zerikarli edi.
r5|A man called me. ___ man asked about you.|the|Мне позвонил мужчина. Он спрашивал о тебе.|Menga bir kishi qo'ng'iroq qildi. U sen haqingda so'radi.
r6|___ sun is very hot today.|the|Солнце сегодня очень жаркое.|Bugun quyosh juda issiq.
r6|Can you close ___ door, please?|the|Закрой, пожалуйста, дверь.|Iltimos, eshikni yopib qo'ying.
r6|I found this recipe on ___ internet.|the|Я нашёл этот рецепт в интернете.|Bu retseptni internetdan topdim.
r6|Mom is in ___ kitchen.|the|Мама на кухне.|Oyim oshxonada.
r7|This is ___ best plov in the city.|the|Это лучший плов в городе.|Bu shahardagi eng mazali palov.
r7|He was ___ first person to help me.|the|Он был первым, кто мне помог.|U menga birinchi bo'lib yordam bergan odam edi.
r7|We live in ___ same building.|the|Мы живём в одном и том же доме.|Biz bir binoda yashaymiz.
r7|She is ___ only doctor in our village.|the|Она — единственный врач в нашем кишлаке.|U qishlog'imizdagi yagona shifokor.
r8|___ capital of Uzbekistan is Tashkent.|the|Столица Узбекистана — Ташкент.|O'zbekistonning poytaxti — Toshkent.
r8|Who is ___ man in the black jacket?|the|Кто этот мужчина в чёрной куртке?|Qora kurtka kiygan anavi kishi kim?
r8|I liked ___ cake you made.|the|Мне понравился торт, который ты испекла.|Sen pishirgan tort menga yoqdi.
r8|Where are ___ keys to the car?|the|Где ключи от машины?|Mashinaning kalitlari qayerda?
r9|Have you ever been to ___ USA?|the|Ты когда-нибудь был в США?|Hech AQShda bo'lganmisan?
r9|The Amu Darya flows into ___ Aral Sea.|the|Амударья впадает в Аральское море.|Amudaryo Orol dengiziga quyiladi.
r9|___ Kyzylkum is a big desert.|the|Кызылкум — большая пустыня.|Qizilqum — katta cho'l.
r9|My cousin lives in ___ UK.|the|Мой двоюродный брат живёт в Великобритании.|Amakivachcham Buyuk Britaniyada yashaydi.
r10|My sister plays ___ piano.|the|Моя сестра играет на пианино.|Singlim pianino chaladi.
r10|Let's go to ___ cinema tonight.|the|Давай сходим в кино сегодня вечером.|Bugun kechqurun kinoga boraylik.
r10|Dad listens to ___ radio in the car.|the|Папа слушает радио в машине.|Dadam mashinada radio tinglaydi.
r10|Can you play ___ guitar?|the|Ты умеешь играть на гитаре?|Gitara chala olasanmi?
r11|I really like ___ cats.|-|Я очень люблю кошек.|Men mushuklarni juda yaxshi ko'raman.
r11|___ sugar is bad for your teeth.|-|Сахар вреден для зубов.|Shakar tishlar uchun zararli.
r11|___ money isn't everything.|-|Деньги — это не всё.|Pul hamma narsa emas.
r11|She drinks ___ green tea every morning.|-|Она пьёт зелёный чай каждое утро.|U har kuni ertalab ko'k choy ichadi.
r12|I live in ___ Tashkent.|-|Я живу в Ташкенте.|Men Toshkentda yashayman.
r12|___ Akmal is my best friend.|-|Акмал — мой лучший друг.|Akmal — eng yaqin do'stim.
r12|We are learning ___ English.|-|Мы учим английский.|Biz ingliz tilini o'rganyapmiz.
r12|My uncle works in ___ Russia.|-|Мой дядя работает в России.|Tog'am Rossiyada ishlaydi.
r13|What did you have for ___ breakfast?|-|Что ты ел на завтрак?|Nonushtaga nima yeding?
r13|The boys play ___ football after school.|-|Мальчики играют в футбол после школы.|Bolalar maktabdan keyin futbol o'ynaydi.
r13|See you on ___ Monday!|-|Увидимся в понедельник!|Dushanba kuni ko'rishamiz!
r13|My birthday is in ___ May.|-|Мой день рождения в мае.|Tug'ilgan kunim mayda.
r14|The children go to ___ school by bus.|-|Дети ездят в школу на автобусе.|Bolalar maktabga avtobusda boradi.
r14|I'm tired. I'm going to ___ bed.|-|Я устал. Иду спать.|Charchadim. Uxlagani ketyapman.
r14|We stayed at ___ home all weekend.|-|Все выходные мы сидели дома.|Dam olish kunlari bo'yi uyda o'tirdik.
r14|I usually go to work by ___ metro.|-|Я обычно езжу на работу на метро.|Men odatda ishga metroda boraman.
r15|I can't find ___ my keys.|-|Не могу найти свои ключи.|Kalitlarimni topa olmayapman.
r15|___ this bag is very heavy.|-|Эта сумка очень тяжёлая.|Bu sumka juda og'ir.
r15|I bought ___ two kilos of apples.|-|Я купил два килограмма яблок.|Ikki kilo olma sotib oldim.
r15|___ Akmal's car is new.|-|Машина Акмала новая.|Akmalning mashinasi yangi.`.split('\n').map((l,i)=>{const[r,en,a,ru,uz]=l.split('|');return{id:i,r,en,a,ru,uz}});
if(!prog.art)prog.art={};
let aCur=null,aDone=false,aRecent=[],artFilter=null,aAuto=null,aSt={ok:0,all:0,streak:0};
let sec=['art','words'].includes(on.sec)?on.sec:'tense',curTab='train';
const capS=s=>s.replace(/(^|[.!?]\s+)([a-z])/g,(m,p,c)=>p+c.toUpperCase());
const fullA=it=>capS(it.en.replace('___ ',it.a==='-'?'':it.a+' '));
function recordArt(r,good){
  const c=prog.art[r]||(prog.art[r]=[0,0]);c[1]++;if(good)c[0]++;
  const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;
  saveProg();
}
function aStats(){$('aOk').textContent=aSt.ok;$('aAll').textContent=aSt.all;$('aSt').textContent=aSt.streak}
function aNext(){
  clearTimeout(aAuto);stopSay();
  let pool=AB.filter(x=>!artFilter||x.r===artFilter);
  const fresh=pool.filter(x=>!aRecent.includes(x.id));if(fresh.length)pool=fresh;
  let it;
  if(on.focus&&!artFilter){
    const w=pool.map(x=>{const c=prog.art[x.r];return !c||c[1]<2?0.7:1.15-c[0]/c[1]});
    let r=Math.random()*w.reduce((a,b)=>a+b,0);it=pool[pool.length-1];
    for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0){it=pool[i];break}}
  }else it=pick(pool);
  aRecent.push(it.id);if(aRecent.length>(artFilter?2:25))aRecent.shift();
  aCur=it;aDone=false;enter($('acard'));
  const lang=on.lang==='mix'?pick(['ru','uz']):on.lang;
  $('aTask').innerHTML=`<span class="chip lang">${lang==='ru'?'RU':'UZ'}</span><span class="chip t">Артикль</span>`;
  const parts=it.en.split('___');
  const en=$('aEn');en.textContent='';en.append(parts[0]);
  const g=document.createElement('span');g.className='gap';g.id='aGap';g.textContent='?';en.append(g,parts[1]||'');
  $('aTr').textContent=lang==='ru'?it.ru:it.uz;
  document.querySelectorAll('#aOpts button').forEach(b=>{b.disabled=false;b.className=''});
  $('aFb').className='fb';$('aFb').innerHTML='';$('aNextB').hidden=true;
  $('aFlt').hidden=!artFilter;if(artFilter)$('aFltT').textContent='Только правило: '+RULES[artFilter].n;
}
function aAnswer(v){
  if(aDone||!aCur)return;aDone=true;
  const good=v===aCur.a,ru=RULES[aCur.r];
  aSt.all++;if(good){aSt.ok++;aSt.streak++}else aSt.streak=0;
  recordArt(aCur.r,good);aStats();feedback($('acard'),good);
  document.querySelectorAll('#aOpts button').forEach(b=>{b.disabled=true;if(b.dataset.a===aCur.a)b.className='ok';else if(b.dataset.a===v)b.className='no'});
  const g=$('aGap');g.textContent=aCur.a==='-'?'∅':aCur.a;g.className='gap '+(good?'ok':'no');
  const fb=$('aFb');fb.className='fb '+(good?'ok':'no');fb.innerHTML='';
  const h=document.createElement('b');h.textContent=good?'Верно!':(aCur.a==='-'?'Здесь артикль не нужен:':'Правильно: '+aCur.a);fb.appendChild(h);
  const s=document.createElement('div');s.className='ans';s.textContent=fullA(aCur);fb.appendChild(s);
  const r=document.createElement('p');r.style.margin='8px 0 0';
  r.innerHTML=`<span class="tag ${GT[ru.g][0]}">${GT[ru.g][1]}</span><b style="display:inline">${ru.n}</b>`;fb.appendChild(r);
  const e=document.createElement('p');e.style.margin='4px 0 0';e.textContent=ru.s;fb.appendChild(e);
  const row=document.createElement('div');row.className='row';row.style.marginTop='8px';
  const sb=document.createElement('button');sb.className='say';sb.style.marginTop='0';sb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg><span>Послушать</span>';
  sb.addEventListener('click',()=>{clearTimeout(aAuto);say(fullA(aCur))});
  const tb=document.createElement('button');tb.className='say';tb.style.marginTop='0';tb.textContent='Правило подробно';
  const rid=aCur.r;tb.addEventListener('click',()=>{clearTimeout(aAuto);openRule(rid)});
  row.append(sb,tb);fb.appendChild(row);
  $('aNextB').hidden=false;
  const id=aCur;
  if(on.voice){const p=say(fullA(aCur));if(good)p.then(()=>{if(aDone&&aCur===id)aAuto=setTimeout(()=>{if(aDone&&aCur===id)aNext()},400)})}
  else if(good)aAuto=setTimeout(()=>{if(aDone&&aCur===id)aNext()},1100);
}
function renderRules(){
  $('rules').innerHTML=Object.keys(RULES).map(k=>{const r=RULES[k];
    return `<div class="rule" id="rule-${k}"><h3><span class="tag ${GT[r.g][0]}">${GT[r.g][1]}</span>${r.n}</h3><p>${r.d}</p><ul>${r.ex.map(x=>`<li>${md(x)}</li>`).join('')}</ul><button data-rule="${k}">Тренировать это правило</button></div>`}).join('');
}
function openRule(k){
  showTab('sheet');
  const el=$('rule-'+k);if(!el)return;
  el.scrollIntoView({behavior:'smooth',block:'start'});
  el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600);
}
function renderArtProg(){
  const ks=Object.keys(RULES);
  const rows=ks.map(k=>({k,c:prog.art[k]||[0,0]}));
  rows.sort((a,b)=>{const aa=a.c[1]?a.c[0]/a.c[1]:2,bb=b.c[1]?b.c[0]/b.c[1]:2;return aa-bb});
  $('pArt').innerHTML=rows.map(({k,c})=>{const r=RULES[k],p=c[1]?Math.round(c[0]/c[1]*100):null;
    return `<button class="ar" data-rule="${k}"><div class="top2"><span><span class="tag ${GT[r.g][0]}">${GT[r.g][1]}</span>${r.n}</span><b>${p===null?'—':p+'% · '+c[1]}</b></div><div class="tr"><i class="o" style="width:${c[1]?c[0]/c[1]*100:0}%"></i><i class="x" style="width:${c[1]?(c[1]-c[0])/c[1]*100:0}%"></i></div></button>`}).join('');
  const tot=Object.values(prog.cells).concat(Object.values(prog.art),[[WS.ok,WS.all]]).reduce((s,c)=>[s[0]+c[0],s[1]+c[1]],[0,0]);
  const td=prog.days[today()]||[0,0];
  $('pSum').innerHTML=`<div><b>${tot[1]?Math.round(tot[0]/tot[1]*100)+'%':'—'}</b><span>точность</span></div><div><b>${tot[1]}</b><span>всего ответов</span></div><div><b>${td[1]}</b><span>сегодня</span></div>`;
}
function setSec(s){
  sec=s;on.sec=s;save();
  document.querySelectorAll('.sec button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.sec===s));
  $('h1').textContent={tense:'Времена',art:'Артикли',words:'Слова'}[s];
  $('navSheet').textContent={tense:'Формулы',art:'Теория',words:'Словарь'}[s];
  showTab(curTab);
}
function showTab(v){
  curTab=v;
  document.querySelectorAll('.nav button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===v));
  const id=v==='train'&&sec!=='tense'?(sec==='art'?'v-art':'v-words'):v==='sheet'&&sec!=='tense'?(sec==='art'?'v-theory':'v-wlist'):'v-'+v;
  document.querySelectorAll('.view').forEach(x=>{const h=x.id!==id;if(!h&&x.hidden){x.classList.remove('vin');void x.offsetWidth;x.classList.add('vin')}x.hidden=h});
  if(v==='prog')renderProg();
  if(id==='v-sheet')sheet();
  if(id==='v-art'&&!aCur)aNext();
  if(id==='v-words'&&!wCur)wNext();
  if(id==='v-wlist')renderWList();
}
document.querySelectorAll('#aOpts button').forEach(b=>b.addEventListener('click',()=>aAnswer(b.dataset.a)));
$('aNextB').addEventListener('click',aNext);
$('aFltX').addEventListener('click',()=>{artFilter=null;aNext()});
document.addEventListener('click',e=>{
  const sb=e.target.closest('.sec button');if(sb){setSec(sb.dataset.sec);return}
  const rb=e.target.closest('[data-rule]');if(rb){artFilter=rb.dataset.rule;if(sec!=='art')setSec('art');showTab('train');aNext();window.scrollTo({top:0,behavior:'smooth'})}
});
document.addEventListener('keydown',e=>{
  if($('v-art').hidden||e.target.closest('input'))return;
  const m={'1':'a','2':'an','3':'the','4':'-'};
  if(m[e.key]){aAnswer(m[e.key]);e.preventDefault()}
  else if(e.key==='Enter'&&aDone){aNext();e.preventDefault()}
});
/* ===== words ===== */
const WORDS_RAW=__WORDS__;
const SPK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const WD=[],LEVELS=[];
{let lv='',th='';WORDS_RAW.split('\n').forEach(l=>{l=l.trim();if(!l)return;
  if(l[0]==='@'){const[n,c]=l.slice(1).split('|');lv=n;LEVELS.push({n,c,th:[]});return}
  if(l[0]==='#'){th=l.slice(1);LEVELS[LEVELS.length-1].th.push(th);return}
  const[en,ru,uz]=l.split('|');WD.push({k:en,en,ru,uz,lv,th})})}
const LVC=n=>{const L=LEVELS.find(x=>x.n===n);return L?L.c:''};
const OWNTH='Мои слова';
let OWN=[];try{const o=JSON.parse(localStorage.getItem('tenses3own')||'[]');if(Array.isArray(o))OWN=o.filter(x=>x&&typeof x.en==='string'&&typeof x.tr==='string')}catch(e){}
const saveOwn=()=>{try{localStorage.setItem('tenses3own',JSON.stringify(OWN))}catch(e){}};
const allWords=()=>WD.concat(OWN.map(o=>({k:'own:'+o.en.toLowerCase(),en:o.en,ru:o.tr,uz:o.tr,lv:OWNTH,th:OWNTH})));
let WS={W:{},wc:0,ok:0,all:0};
try{const x=JSON.parse(localStorage.getItem('tenses3words')||'null');if(x&&x.W&&typeof x.W==='object')WS=Object.assign(WS,x)}catch(e){}
const saveW=()=>{try{localStorage.setItem('tenses3words',JSON.stringify(WS))}catch(e){}};
const IV=[0,3,7,15,35,80,200];
let wTheme=null,wLevel=null,wCur=null,wDone=false,wLast=null,wAuto=null,wSes={ok:0,all:0};
const lvlOf=w=>{const s=WS.W[w.k];return s?s.b:0};
const dots=b=>`<span class="lvl" title="Знание слова">${[1,2,3,4,5].map(i=>`<i class="${i<=b?'on':''}"></i>`).join('')}</span>`;
function wPick(){
  const all=allWords();const pool=all.filter(w=>(!wLevel||w.lv===wLevel)&&(!wTheme||w.th===wTheme));
  if(!pool.length)return null;
  const alt=pool.length>1?pool.filter(w=>w.k!==wLast):pool;
  const due=alt.filter(w=>{const s=WS.W[w.k];return s&&s.n<=WS.wc}).sort((a,b)=>WS.W[a.k].n-WS.W[b.k].n);
  if(due.length)return pick(due.slice(0,3));
  const nw=alt.filter(w=>!WS.W[w.k]);
  if(nw.length)return nw[0];
  return alt.slice().sort((a,b)=>WS.W[a.k].n-WS.W[b.k].n)[0];
}
function wStats(){
  $('wOk').textContent=wSes.ok;$('wAll').textContent=wSes.all;
  $('wLearned').textContent=allWords().filter(w=>lvlOf(w)>=4).length;
}
function wNext(){
  clearTimeout(wAuto);stopSay();
  $('wFlt').hidden=!wLevel;if(wLevel)$('wFltT').textContent=(wLevel===OWNTH?OWNTH:wLevel+' ('+LVC(wLevel)+')')+(wTheme&&wTheme!==OWNTH?' · '+wTheme:'');
  const w=wPick();
  if(!w){$('wQ').textContent='Здесь пока нет слов';$('wOpts').innerHTML='';$('wSub').textContent='';$('wTask').innerHTML='';return}
  const all=allWords();
  const isNew=!WS.W[w.k];
  const lang=w.th===OWNTH?'ru':on.lang==='mix'?pick(['ru','uz']):on.lang;
  const dir=isNew?'en':pick(['en','tr']);
  const key=dir==='en'?(x=>x[lang]):(x=>x.en);
  const right=key(w);
  const cand=shuf(all.filter(x=>x.k!==w.k&&x.lv===w.lv&&x.th===w.th)).concat(shuf(all.filter(x=>x.lv===w.lv&&x.th!==w.th)),shuf(all.filter(x=>x.lv!==w.lv)));
  const opts=[right];for(const c of cand){const t=key(c);if(!opts.includes(t))opts.push(t);if(opts.length===4)break}
  wCur={w,lang,dir,right,opts:shuf(opts)};wLast=w.k;wDone=false;enter($('wcard'));
  $('wTask').innerHTML=`<span class="chip lang">${lang==='ru'?'RU':'UZ'}</span><span class="chip">${w.lv===OWNTH?esc(OWNTH):esc(LVC(w.lv)+' · '+w.th)}</span>${isNew?'<span class="chip f plus">Новое слово</span>':`<span class="chip">${dots(lvlOf(w))}</span>`}`;
  const q=$('wQ');q.innerHTML='';
  const t=document.createElement('span');t.textContent=dir==='en'?w.en:w[lang];q.appendChild(t);
  if(dir==='en'){const b=document.createElement('button');b.innerHTML=SPK;b.setAttribute('aria-label','Произношение');b.addEventListener('click',()=>say(w.en));q.appendChild(b)}
  $('wSub').textContent=dir==='en'?(lang==='ru'?'Выбери перевод':'Tarjimasini tanlang'):'Выбери английское слово';
  $('wOpts').innerHTML=wCur.opts.map((o,i)=>`<button data-wi="${i}">${esc(o)}</button>`).join('');
  $('wFb').className='fb';$('wFb').innerHTML='';$('wNextB').hidden=true;
  if(dir==='en'&&on.voice)say(w.en);
}
function wAnswer(i){
  if(wDone||!wCur)return;wDone=true;
  const {w}=wCur,good=wCur.opts[i]===wCur.right,first=!WS.W[w.k];
  WS.wc++;const s=WS.W[w.k]||{b:0,n:0};
  if(good){s.b=first?2:Math.min(s.b+1,6);s.n=WS.wc+IV[s.b]}else{s.b=1;s.n=WS.wc+2}
  WS.W[w.k]=s;WS.all++;if(good)WS.ok++;saveW();
  const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;saveProg();
  wSes.all++;if(good)wSes.ok++;wStats();feedback($('wcard'),good);
  document.querySelectorAll('#wOpts button').forEach((b,j)=>{b.disabled=true;if(wCur.opts[j]===wCur.right)b.className='ok';else if(j===i)b.className='no'});
  const fb=$('wFb');fb.className='fb '+(good?'ok':'no');fb.innerHTML='';
  const h=document.createElement('b');h.textContent=good?'Верно!':'Запомни:';fb.appendChild(h);
  const a=document.createElement('div');a.className='ans';a.textContent=w.en;fb.appendChild(a);
  const tr=document.createElement('div');tr.textContent=w.th===OWNTH?w.ru:`${w.ru}  ·  ${w.uz}`;fb.appendChild(tr);
  const lv=document.createElement('div');lv.style.marginTop='6px';lv.innerHTML=`Знание: ${dots(Math.min(s.b,5))}${s.b>=4?' <b style="display:inline">выучено</b>':''}`;fb.appendChild(lv);
  const sb=document.createElement('button');sb.className='say';sb.innerHTML=SPK+'<span>Послушать</span>';sb.addEventListener('click',()=>{clearTimeout(wAuto);say(w.en)});fb.appendChild(sb);
  $('wNextB').hidden=false;
  const id=wCur;
  if(on.voice){const p=say(w.en);if(good)p.then(()=>{if(wDone&&wCur===id)wAuto=setTimeout(()=>{if(wDone&&wCur===id)wNext()},350)})}
  else if(good)wAuto=setTimeout(()=>{if(wDone&&wCur===id)wNext()},900);
}
function renderWList(){
  const all=allWords(),q=$('wSearch').value.trim().toLowerCase();
  const lvs=LEVELS.map(L=>L.n).concat(OWN.length?[OWNTH]:[]);
  const cnt=f=>{const ws=all.filter(f);return `${ws.filter(w=>lvlOf(w)>=4).length}/${ws.length}`};
  $('wLevels').innerHTML=[null].concat(lvs).map(n=>`<button data-lv="${esc(n||'')}" aria-pressed="${wLevel===n}">${n?esc(n===OWNTH?n:n+' · '+LVC(n)):'Все'}<small>${cnt(w=>!n||w.lv===n)}</small></button>`).join('');
  const L=LEVELS.find(x=>x.n===wLevel);
  $('wThemesH').hidden=!L;$('wThemes').hidden=!L;
  $('wThemes').innerHTML=L?[null].concat(L.th).map(t=>`<button data-th="${esc(t||'')}" aria-pressed="${wTheme===t}">${esc(t||'Все темы')}<small>${cnt(w=>w.lv===wLevel&&(!t||w.th===t))}</small></button>`).join(''):'';
  const list=q?all.filter(w=>(w.en+' '+w.ru+' '+w.uz).toLowerCase().includes(q)):all.filter(w=>(!wLevel||w.lv===wLevel)&&(!wTheme||w.th===wTheme));
  const title=wLevel?(wLevel===OWNTH?OWNTH:wLevel+' · '+LVC(wLevel))+(wTheme&&wTheme!==OWNTH?' · '+wTheme:''):'Все слова';
  $('wListH').textContent=q?'Поиск':title;
  const Ln=list.filter(w=>lvlOf(w)>=4).length,P=list.filter(w=>{const b=lvlOf(w);return b>0&&b<4}).length;
  $('wSum').innerHTML=`<span>Слов: <b>${list.length}</b></span><span>Выучено: <b>${Ln}</b></span><span>Учу: <b>${P}</b></span><span>Новые: <b>${list.length-Ln-P}</b></span>`;
  $('wStudy').textContent=wLevel?'Учить: '+title:'Учить все слова по порядку';
  $('wStudy').hidden=!!q;
  const shown=list.slice(0,300);
  $('wList').innerHTML=shown.map(w=>{const b=lvlOf(w);return `<div class="wrow"><i class="d ${b>=4?'l2':b>0?'l1':''}"></i><div><b>${esc(w.en)}</b><span>${esc(w.lv===OWNTH?w.ru:w.ru+' · '+w.uz)}</span></div><button data-sk="${esc(w.k)}" aria-label="Произношение">${SPK}</button></div>`}).join('')
    +(list.length>shown.length?`<p class="note">Показаны первые 300 из ${list.length}. Выбери уровень или тему, чтобы увидеть остальные.</p>`:'')
    ||'<p class="note">Ничего не найдено.</p>';
}
function renderWordsProg(){
  const all=allWords();
  const rows=LEVELS.map(L=>L.n).concat(OWN.length?[OWNTH]:[]).map(n=>{const ws=all.filter(w=>w.lv===n);return{n,c:n===OWNTH?'':LVC(n),t:ws.length,l:ws.filter(w=>lvlOf(w)>=4).length,p:ws.filter(w=>{const b=lvlOf(w);return b>0&&b<4}).length}});
  const L=rows.reduce((s,r)=>s+r.l,0),N=rows.reduce((s,r)=>s+r.t,0),P=rows.reduce((s,r)=>s+r.p,0);
  $('pWords').innerHTML=`<div class="wsum"><span>Выучено <b>${L}</b> из <b>${N}</b></span><span>В процессе <b>${P}</b></span></div>`+
   rows.map(r=>`<button class="ar" data-wlv="${esc(r.n)}"><div class="top2"><span>${esc(r.n)}${r.c?' <span class="note" style="font-size:13px">'+r.c+'</span>':''}</span><b>${r.l}/${r.t}</b></div><div class="tr"><i class="o" style="width:${r.l/r.t*100}%"></i><i style="width:${r.p/r.t*100}%;background:var(--amber)"></i></div></button>`).join('');
}
$('wOpts').addEventListener('click',e=>{const b=e.target.closest('[data-wi]');if(b)wAnswer(+b.dataset.wi)});
$('wNextB').addEventListener('click',wNext);
$('wFltX').addEventListener('click',()=>{wTheme=null;wLevel=null;wNext()});
$('wSearch').addEventListener('input',renderWList);
$('wStudy').addEventListener('click',()=>{showTab('train');wNext();window.scrollTo({top:0,behavior:'smooth'})});
document.addEventListener('click',e=>{
  const lv=e.target.closest('[data-lv]');if(lv){wLevel=lv.dataset.lv||null;wTheme=wLevel===OWNTH?OWNTH:null;renderWList();return}
  const th=e.target.closest('[data-th]');if(th){wTheme=th.dataset.th||null;renderWList();return}
  const sk=e.target.closest('[data-sk]');if(sk){const w=allWords().find(x=>x.k===sk.dataset.sk);if(w)say(w.en);return}
  const wt=e.target.closest('[data-wlv]');if(wt){wLevel=wt.dataset.wlv;wTheme=wLevel===OWNTH?OWNTH:null;setSec('words');showTab('train');wNext();window.scrollTo({top:0,behavior:'smooth'})}
});
$('ownAdd').addEventListener('click',()=>{
  const lines=$('ownTa').value.split('\n');let add=0,bad=0;
  const have=new Set(OWN.map(o=>o.en.toLowerCase()));
  for(const raw of lines){const l=raw.trim();if(!l)continue;
    const m=l.match(/^(.+?)\s*(?:\t|\s[-—–=:]\s|[—–=:])\s*(.+)$/);
    if(!m){bad++;continue}
    const en=m[1].trim().slice(0,60),tr=m[2].trim().slice(0,80);
    if(!en||!tr||have.has(en.toLowerCase())){bad++;continue}
    OWN.push({en,tr});have.add(en.toLowerCase());add++}
  saveOwn();$('ownTa').value='';
  $('ownMsg').textContent=`Добавлено слов: ${add}`+(bad?`. Пропущено строк: ${bad} (нет разделителя или слово уже есть).`:'');
  renderWList();
});
$('ownClear').addEventListener('click',()=>{const b=$('ownClear');
  if(!b.dataset.c){b.dataset.c=1;b.textContent='Точно удалить? Нажми ещё раз';return}
  delete b.dataset.c;b.textContent='Удалить мои слова';
  for(const o of OWN)delete WS.W['own:'+o.en.toLowerCase()];OWN=[];saveOwn();saveW();
  if(wLevel===OWNTH){wLevel=null;wTheme=null}$('ownMsg').textContent='Твои слова удалены.';renderWList();
});
document.addEventListener('keydown',e=>{
  if($('v-words').hidden||e.target.closest('input,textarea'))return;
  if(['1','2','3','4'].includes(e.key)){wAnswer(+e.key-1);e.preventDefault()}
  else if(e.key==='Enter'&&wDone){wNext();e.preventDefault()}
});
/* keep the keyboard open: buttons in the card never take focus from the input */
const keepKb=e=>{if(e.target.closest('#card button')&&!$('card').hidden)e.preventDefault()};
document.addEventListener('mousedown',keepKb);
document.addEventListener('pointerdown',keepKb);
document.addEventListener('click',e=>{if(e.target.closest('#card button')&&!$('card').hidden&&cur&&cur.ex==='tr'&&!$('field').hidden)$('ans').focus({preventScroll:true})},true);
applyTheme();topToday();renderModes();settings();sheet();renderRules();stats();aStats();wStats();next();setSec(sec);
