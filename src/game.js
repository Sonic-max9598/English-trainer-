/* ===== motivation & game layer: XP, levels, streak, quests, lessons, achievements, path, mascot ===== */
X.g=Object.assign({xp:0,last:null,streak:0,best:0,freeze:1,lessons:0,perfect:0,comboBest:0,freezeUsed:null},X.g||{});
X.ach=X.ach||{};X.errs=Array.isArray(X.errs)?X.errs:[];
let combo=0;
const tdy=()=>dayN();

/* --- daily records (quests + program time) --- */
function qRec(){if(!X.q||X.q.d!==today())X.q={d:today(),ans:0,run:0,c5:0,newL:0,claimed:{}};return X.q}
function pRec(){if(!X.p||X.p.d!==today())X.p={d:today(),rev:0,nw:0};return X.p}

/* --- levels: level n needs 50·n·(n+1) XP in total --- */
const lvlNeed=n=>50*n*(n+1);
function lvlInfo(xp=X.g.xp){let n=0;while(xp>=lvlNeed(n+1))n++;const a=lvlNeed(n),b=lvlNeed(n+1);return{lv:n+1,cur:xp-a,need:b-a}}

/* --- streak with a 1-day freeze --- */
function streakNow(){const g=X.g,t=tdy();if(g.last===null)return 0;if(g.last>=t-1)return g.streak;if(g.last===t-2&&g.freeze>0)return g.streak;return 0}
function markActive(){
  const g=X.g,t=tdy();if(g.last===t)return;
  if(g.last===t-1)g.streak++;
  else if(g.last===t-2&&g.freeze>0){g.freeze--;g.freezeUsed=t-1;g.streak++;toast('<b>Заморозка спасла серию!</b><br>Вчерашний пропуск не считается.')}
  else g.streak=1;
  g.last=t;if(g.streak%7===0&&g.freeze<1)g.freeze=1;
  if(g.streak>g.best)g.best=g.streak;
  if([3,7,14,30,50,100].includes(g.streak))setTimeout(()=>celebrate(`${g.streak} дней подряд! Так держать!`,'Серия дней'),600);
}

/* --- program time: 10 min review + 15 min new --- */
let lastAct=0;
function newestTense(){const o=openT();for(let i=GROUPS.length-1;i>=0;i--){if(gOpen(i))return GROUPS[i]}return GROUPS[0]}
function isNewMaterial(info){
  if(!info)return false;
  if(info.kind==='word')return info.phase==='new';
  if(info.kind==='tense'){const g=gOf(info.t);return gOpen(g)&&!gPassed(g)}
  if(info.kind==='mix')return true;
  return false;
}
function onActivity(kind){
  const now=Date.now(),dt=lastAct?Math.min(now-lastAct,45000):8000;lastAct=now;
  const p=pRec();if(kind==='new')p.nw+=dt;else p.rev+=dt;
}

/* --- lessons of 10 tasks, per section --- */
const LES={};
const LN=10;
function les(s=sec){return LES[s]||(LES[s]={n:0,ok:0,xp:0,best:0,run:0,mist:[],retry:[],pending:false,t0:Date.now(),newT:0})}
function lessonGate(s){const L=les(s);if(L.pending){showSummary(s);return true}return false}
function gameForce(kind){
  const L=les();
  const i=L.retry.findIndex(r=>r.kind===kind);if(i>=0)return L.retry.splice(i,1)[0].id;
  const j=SR.findIndex(r=>r.kind===kind&&r.wait<=0);if(j>=0)return SR.splice(j,1)[0].id;
  const t=tdy(),k=X.errs.findIndex(e=>e.kind===kind&&e.due<=t);
  if(k>=0&&Math.random()<.3){const e=X.errs[k];e.due=t+1;return e.id}
  return null;
}
const SR=[];/* session retry: mistakes come back after 3–5 tasks */

function onAnswer(good,info){
  if(!info||info.kind==='timer'){qRec().ans++;markActive();saveX();return}
  onActivity(isNewMaterial(info)?'new':'rev');
  for(const r of SR)r.wait--;
  const kind=info.kind==='word'?'word':info.kind;const ownSR=info.kind==='word'||info.kind==='verb';/* these have their own repetition */
  const id=info.kind==='word'?{k:info.k,type:info.type}:info.id;
  const keyOf=v=>typeof v==='object'?v.k:v;
  if(!good){
    if(!ownSR)SR.push({kind,id,wait:3+Math.floor(Math.random()*3)});
    if(!ownSR&&!X.errs.some(e=>e.kind===kind&&e.id===id)){X.errs.push({kind,id,due:tdy()+1});if(X.errs.length>150)X.errs.shift()}
  }else if(!ownSR){const k=X.errs.findIndex(e=>e.kind===kind&&e.id===id&&e.due<=tdy());if(k>=0)X.errs.splice(k,1)}
  combo=good?combo+1:0;
  const mult=combo>=10?3:combo>=5?2:1;
  const gain=good?10*mult:1;
  X.g.xp+=gain;if(combo>X.g.comboBest){const was=X.g.comboBest;X.g.comboBest=combo;if(was>=5&&combo===was+1&&!COMBO_MS[combo])celebrate('Новый рекорд серии: '+combo+'!')}
  if(good&&COMBO_MS[combo])comboReward(combo);
  const L=les();L.n++;if(good)L.ok++;L.xp+=gain;L.run=good?L.run+1:0;L.best=Math.max(L.best,L.run);
  if(info.kind==='tense'&&isNewMaterial(info))L.newT++;
  if(!good)L.mist.push({kind,id,label:mistLabel(info)});
  const q=qRec();q.ans++;q.run=good?q.run+1:0;if(q.run>=5)q.c5=1;
  markActive();
  if(L.n>=LN)L.pending=true;
  checkQuests();checkAch();saveX();
  lessonBar(gain,mult);mascotReact(good,{tense:'fb',mix:'fb',art:'aFb',word:'wFb'}[kind],info);
}
function mistLabel(info){
  if(info.kind==='tense'){const b=BANK.find(x=>x.en===info.id);return b?b.en:''}
  if(info.kind==='art'){const a=AB.find(x=>x.en===info.id);return a?fullA(a):''}
  if(info.kind==='mix'){const m=MIX.find(x=>x.en===info.id);return m?m.en:''}
  if(info.kind==='word'){const w=wGet(info.k);return w?bare(w.en)+' — '+trw(w):''}
  if(info.kind==='verb'){const v=IRREG.find(x=>x.v1===info.id);return v?v.v1+' – '+v.v2+' – '+v.v3:''}
  return '';
}
function lessonBar(gain,mult){
  const el=$('lbar');const show=curTab==='train'&&!(sec==='tense'&&run);el.hidden=!show;if(!show)return;
  const L=les();
  $('lsegs').innerHTML=Array.from({length:LN},(_,i)=>`<i class="${i<L.n?'on':''}"></i>`).join('');
  $('lxp').textContent=X.g.xp+' XP';
  const c=$('lcombo');const m=combo>=10?3:combo>=5?2:1;c.hidden=m<2;c.textContent='×'+m;
  if(gain&&!reduced()){const f=document.createElement('span');f.className='xpfly';f.textContent='+'+gain;$('lbar').appendChild(f);setTimeout(()=>f.remove(),900)}
}
function showSummary(s){
  const L=les(s);
  $('lsum').hidden=false;document.body.classList.add('modal');
  const acc=L.n?Math.round(L.ok/L.n*100):0;
  $('lsNum').textContent=L.ok+' / '+L.n;
  $('lsAcc').textContent=acc+'%';$('lsXp').textContent='+'+(L.xp+(L.n>=LN?20:0));$('lsBest').textContent=L.best;
  $('lsMsg').textContent=L.n===0?'Урок ещё не начат':acc===100?'Без единой ошибки!':acc>=80?'Отличный урок!':acc>=50?'Хорошая работа — ошибки повторим.':'Не сдавайся — так и учатся!';
  $('lsMist').innerHTML=L.mist.length?'<h3>Ошибки</h3><ul>'+L.mist.map(m=>`<li>${esc(m.label)}</li>`).join('')+'</ul>':'';
  $('lsRetry').hidden=!L.mist.length;
  setMascot($('lsMascot'),acc>=80?'happy':'cheer');
  if(L.n>=LN&&!L.counted){L.counted=1;X.g.xp+=20;X.g.lessons++;if(acc===100){X.g.perfect++;celebrate('Идеальный урок!')}
    if(s==='tense'&&L.newT>=5)qRec().newL=1;checkQuests();checkAch();saveX()}
}
function closeSummary(again,retry){
  const L=les();const mist=L.mist.slice();
  $('lsum').hidden=true;document.body.classList.remove('modal');
  LES[sec]=null;const N=les();
  if(retry)N.retry=mist.map(m=>({kind:m.kind,id:m.id}));
  lessonBar();
  if(again||retry){wList=false;showTab('train');if(sec==='tense')next();else if(sec==='art')aNext();else if(sec==='verbs')vNext();else wNext()}
}

/* --- quests --- */
const QUESTS=[
  {id:'a20',n:'20 ответов',p:q=>Math.min(q.ans,20),max:20,xp:30},
  {id:'c5',n:'5 подряд без ошибок',p:q=>q.c5?1:Math.min(q.run,5)/5,max:1,xp:30,frac:1},
  {id:'nl',n:'1 урок нового времени',p:q=>q.newL?1:0,max:1,xp:40}
];
function checkQuests(){const q=qRec();for(const Q of QUESTS){if(!q.claimed[Q.id]&&Q.p(q)>=Q.max){q.claimed[Q.id]=1;X.g.xp+=Q.xp;toast(`<b>Задание выполнено: ${Q.n}</b><br>+${Q.xp} XP`)}}}

/* --- achievements --- */
const totalAns=()=>{let n=WS.all||0;for(const k in prog.cells)n+=prog.cells[k][1];for(const k in prog.art||{})n+=prog.art[k][1];for(const k in prog.ch||{})n+=prog.ch[k][1];return n};
const learned=()=>allWords().filter(w=>lvlOf(w)>=4).length;
const artStat=()=>Object.values(prog.art||{}).reduce((s,c)=>[s[0]+c[0],s[1]+c[1]],[0,0]);
const mastered=t=>{const c=tStat(t);return c[1]>=30&&c[0]/c[1]>=.85};
const ACH=[
  {id:'a100',i:'target',c:'q',n:'Первые 100 ответов',d:'Ответь на 100 заданий',ok:()=>totalAns()>=100},
  {id:'a1000',i:'mountain',c:'brand',n:'Тысяча ответов',d:'1000 заданий за всё время',ok:()=>totalAns()>=1000},
  {id:'les1',i:'bag',c:'plus',n:'Первый урок',d:'Пройди урок из 10 заданий',ok:()=>X.g.lessons>=1},
  {id:'les25',i:'books',c:'brand',n:'25 уроков',d:'Пройди 25 уроков',ok:()=>X.g.lessons>=25},
  {id:'perf',i:'sparkle',c:'amber',n:'Без ошибок',d:'Урок на 10 из 10',ok:()=>X.g.perfect>=1},
  {id:'c5',i:'bolt',c:'hot',n:'Серия ×5',d:'5 верных ответов подряд',ok:()=>X.g.comboBest>=5},
  {id:'c10',i:'bolt',c:'amber',n:'Серия ×10',d:'10 верных ответов подряд',ok:()=>X.g.comboBest>=10},
  {id:'c25',i:'rocket',c:'hot',n:'Серия ×25',d:'25 верных ответов подряд',ok:()=>X.g.comboBest>=25},
  {id:'s3',i:'flame',c:'hot',n:'Три дня подряд',d:'Занимайся 3 дня без пропусков',ok:()=>X.g.best>=3},
  {id:'s7',i:'calendar',c:'q',n:'Неделя без пропусков',d:'Серия 7 дней',ok:()=>X.g.best>=7},
  {id:'s30',i:'trophy',c:'amber',n:'Месяц без пропусков',d:'Серия 30 дней',ok:()=>X.g.best>=30},
  {id:'w100',i:'sprout',c:'plus',n:'100 слов',d:'Выучи 100 слов',ok:()=>learned()>=100},
  {id:'w500',i:'tree',c:'plus',n:'500 слов',d:'Выучи 500 слов',ok:()=>learned()>=500},
  {id:'w1000',i:'globe',c:'brand',n:'1000 слов',d:'Выучи 1000 слов',ok:()=>learned()>=1000},
  {id:'art',i:'letter',c:'q',n:'Мастер артиклей',d:'85%+ на 100 ответах по артиклям',ok:()=>{const c=artStat();return c[1]>=100&&c[0]/c[1]>=.85}},
  {id:'mix',i:'mix',c:'brand',n:'Смешанные времена',d:'30 верных переводов с двумя временами',ok:()=>Object.values(X.mixS||{}).reduce((s,c)=>s+c[0],0)>=30},
  {id:'book5',i:'book',c:'plus',n:'Читатель',d:'Прочитай 5 глав теории',ok:()=>Object.keys((X.book&&X.book.read)||{}).length>=5},
  {id:'book',i:'cap',c:'amber',n:'Вся грамматика',d:'Прочитай все главы теории',ok:()=>BOOK.every(c=>X.book&&X.book.read&&X.book.read[c.id])},
  {id:'lv5',i:'star',c:'amber',n:'Уровень 5',d:'Набери опыт до 5 уровня',ok:()=>lvlInfo().lv>=5},
  {id:'all',i:'map',c:'plus',n:'Вся тропа',d:'Открой все 12 времён',ok:()=>STOPS.every(t=>tOpen(t))&&!on.allOpen}
].concat(STOPS.map(t=>({id:'m_'+t,i:'cap',c:'brand',n:'Мастер '+tName(t),d:'85%+ минимум на 30 ответах',ok:()=>mastered(t)})));
let achInit=false;
function checkAch(){
  const fresh=[];for(const a of ACH){if(!X.ach[a.id]&&a.ok()){X.ach[a.id]=today();fresh.push(a)}}
  if(fresh.length&&achInit){const a=fresh[0];celebrate(a.n,'Новая награда')}
  achInit=true;
}

/* --- teacher mascot --- */
const tKind=()=>X.teacher==='f'?'f':'m';
function setMascot(el,mood){
  if(!el)return;const g=tKind();
  if(el.dataset.g!==g){el.innerHTML=teacherSVG(g,el.classList.contains('logo-t'));el.dataset.g=g}
  el.dataset.mood=mood;el.classList.remove('jump');void el.offsetWidth;if(mood==='happy')el.classList.add('jump');
}
function refreshTeachers(){document.querySelectorAll('.mascot').forEach(el=>{if(el.dataset.g)setMascot(el,el.dataset.mood||'idle')})}
const SAY_OK=['Отлично!','Так держать!','Супер!','Верно, молодец!','Красота!','Вот это да!','Great job!','Well done!',"Zo'r!","Barakalla!"];
const SAY_NO=['Ничего, получится!','Ошибки — это нормально.','Запомним и повторим.','Почти! Попробуем ещё.','Ты учишься — это главное.','Не сдавайся!',"Hechqisi yo'q!"];
function mascotReact(good,fbId,info){
  setTimeout(()=>{const fb=$(fbId);if(!fb||!fb.className.includes(good?'ok':'no'))return;
    const m=document.createElement('div');m.className='mline';m.innerHTML='<div class="mascot sm"></div><span></span>';
    m.querySelector('span').textContent=pick(good?SAY_OK:SAY_NO);fb.prepend(m);setMascot(m.firstChild,good?'happy':'cheer');
    if(!good&&info){let tip='';
      if(info.kind==='tense'&&TX[info.t])tip=TX[info.t].tip;
      else if(info.kind==='art'&&RULES[info.r])tip=RULES[info.r].s;
      if(tip){const p=document.createElement('p');p.className='ttip';p.innerHTML='<b>Подсказка учителя.</b> '+tip;fb.appendChild(p)}}
  },0);
}
/* teacher pops up in the corner with a short line */
function teacherPop(text,mood){
  const el=$('mpop');if(!el)return;el.querySelector('span').textContent=text;setMascot(el.querySelector('.mascot'),mood||'happy');
  el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  clearTimeout(el._t);el._t=setTimeout(()=>{el.hidden=true},2600);
}
const COMBO_MS={5:['Серия 5! Теперь опыт ×2','bolt'],10:['Серия 10! Опыт ×3 — ты в ударе!','rocket'],15:['15 подряд! Невероятно!','star'],20:['20 подряд! Мастер!','trophy'],30:['30 подряд! Легенда!','trophy']};
function comboReward(n){const m=COMBO_MS[n];teacherPop(m[0],'happy');if(n>=10)celebrate(null)}

/* --- confetti for records --- */
function celebrate(msg,head){
  if(msg)toast((head?'<small>'+head+'</small>':'')+'<b>'+msg+'</b>');
  if(reduced())return;
  const c=document.createElement('canvas');c.className='confetti';document.body.appendChild(c);
  const dpr=Math.min(2,devicePixelRatio||1),W=c.width=innerWidth*dpr,H=c.height=innerHeight*dpr,x=c.getContext('2d');
  const cols=['#2f66d0','#f2a51f','#2b9a4a','#e5484d','#7c5cd6','#ff7a45'];
  const P=Array.from({length:110},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*16*dpr,vy:(-Math.random()*14-4)*dpr,s:(5+Math.random()*6)*dpr,r:Math.random()*6,c:pick(cols)}));
  const t0=performance.now();
  (function f(t){const k=(t-t0)/1600;x.clearRect(0,0,W,H);for(const p of P){p.vy+=.45*dpr;p.x+=p.vx;p.y+=p.vy;p.r+=.15;x.save();x.globalAlpha=Math.max(0,1-k);x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()}
    if(k<1)requestAnimationFrame(f);else c.remove()})(t0);
}
function onRecord(){celebrate('Новый рекорд!')}
function onUnlock(i){X.mapAnim=i;saveX();celebrate();teacherPop('Новое время открыто! Бежим дальше по тропе!','happy');if(curTab==='home')renderHome()}
function onWordsDone(){celebrate()}

/* --- unified icon set (24×24, stroke) --- */
const ICO={target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',mountain:'<path d="M2 20 9 8l4 6 2-3 7 9z"/><path d="M7.5 10.5 9 12l1.5-1.5"/>',bag:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M9 8V6a3 3 0 0 1 6 0v2M4 13h16"/>',books:'<path d="M4 19V5h4v14zM10 19V7h4v12zM16 19l2-12 3 .5-2 12z"/><path d="M3 21h18"/>',sparkle:'<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M19 3v3M17.5 4.5h3"/>',bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',rocket:'<path d="M5 15c-1 2-1 4-1 5 1 0 3 0 5-1M9 15l-3-3c2-6 7-9 13-9 0 6-3 11-9 13z"/><circle cx="14.5" cy="9.5" r="1.8"/>',flame:'<path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1.2 2.6 2.5 3 0-3-1-6 0-9z"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 15l2.5 2 4.5-4"/>',trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9 18h6"/>',sprout:'<path d="M12 21v-9"/><path d="M12 12C12 7 8 5 4 5c0 4 3 7 8 7zM12 14c0-4 3-7 8-7 0 4-3 7-8 7"/>',tree:'<path d="M12 2 6 10h3l-4 6h14l-4-6h3z"/><path d="M12 16v6"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',letter:'<path d="M5 20 10 6h1l5 14M7 15h7"/><path d="M17 9h3M18.5 9v8"/>',mix:'<path d="M4 7h4l8 10h4M4 17h4l2.5-3M14 10l2-3h4M18 5l2 2-2 2M18 15l2 2-2 2"/>',book:'<path d="M2 5h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',play:'<path d="M8 5v14l11-7z"/>'};
const ico=(k,w)=>`<svg viewBox="0 0 24 24" ${w?`width="${w}" height="${w}"`:''} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;

/* --- home screen --- */
function ring(p){const r=42,C=2*Math.PI*r;return `<svg viewBox="0 0 100 100" class="ring"><circle cx="50" cy="50" r="${r}" class="rb"/><circle cx="50" cy="50" r="${r}" class="rf" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-Math.min(1,p))}"/></svg>`}
function allTips(){return STOPS.map(t=>TX[t].tip).concat(BOOK.filter(c=>c.tip&&!c.id.startsWith('t-')).map(c=>c.tip))}
function renderHome(){
  const s=streakNow(),li=lvlInfo(),p=pRec(),q=qRec();
  const rev=Math.min(10,p.rev/60000),nw=Math.min(15,p.nw/60000),tot=(rev+nw)/25;
  const hour=new Date().getHours();
  const hi=hour<5?'Доброй ночи!':hour<12?'Доброе утро!':hour<18?'Добрый день!':'Добрый вечер!';
  const msg=tot>=1?'Программа на сегодня выполнена. Ты молодец!':s>0&&X.g.last===tdy()?'Серия продолжается — так держать!':s>0?`Серия ${s} дн. ждёт — пара заданий, и она продолжится.`:'Начнём? Хватит и 10 минут.';
  $('hHero').innerHTML=`<button class="mascot hero-m" id="hMascot" aria-label="Учитель: совет дня"></button><div class="bubble" id="hBubble"><b>${hi}</b><span>${msg}</span></div>`;
  setMascot($('hMascot'),tot>=1?'happy':'idle');
  $('hStats').innerHTML=`<div class="hs fire"><span class="hsi ${s?'on':''}">${ico('flame')}</span><b>${s}</b><small>дн. подряд${X.g.freeze?' · заморозка есть':''}</small></div>
    <div class="hs"><span class="lvbadge">${li.lv}</span><b>${X.g.xp}</b><small>XP · уровень ${li.lv}</small><div class="xpbar"><i style="width:${li.cur/li.need*100}%"></i></div><small>${li.need-li.cur} XP до уровня ${li.lv+1}</small></div>`;
  $('hProg').innerHTML=`<div class="ringw">${ring(tot)}<div class="rt"><b>${Math.floor(rev+nw)}</b><small>из 25 мин</small></div></div>
    <div class="pl"><div class="pr"><span>Повтор</span><b>${Math.floor(rev)}/10 мин</b></div><div class="xpbar g"><i style="width:${rev/10*100}%"></i></div>
    <div class="pr"><span>Новое</span><b>${Math.floor(nw)}/15 мин</b></div><div class="xpbar"><i style="width:${nw/15*100}%"></i></div>
    <div class="row"><button class="main" data-go="rev">${rev>=10?'Ещё повтор':'Повторять'}</button><button data-go="new">Новое</button></div></div>`;
  $('hQuests').innerHTML=QUESTS.map(Q=>{const v=Q.p(q),d=!!q.claimed[Q.id]||v>=Q.max;const pct=Math.min(1,v/Q.max);
    return `<div class="quest${d?' done':''}"><i>${d?ico('check'):''}</i><div><b>${Q.n}</b><div class="xpbar"><i style="width:${pct*100}%"></i></div></div><small>+${Q.xp} XP</small></div>`}).join('');
  renderMap();renderAch();
}

/* --- path map: a winding trail through a landscape, from the meadow up to the snowy peaks --- */
const MW=360,MH=1000;
const MP=[[108,930],[248,850],[116,770],[246,690],[110,610],[236,528],[124,448],[246,372],[136,292],[214,206]];
function bez(pts){/* Catmull-Rom → cubic Bézier segments */
  const p=[[180,1004]].concat(pts),seg=[];
  for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],d=p[i+2]||c;
    seg.push([b,[b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6],[c[0]-(d[0]-b[0])/6,c[1]-(d[1]-b[1])/6],c])}
  return seg;
}
const MSEG=bez(MP);
const MPATH='M'+MSEG[0][0].join(' ')+MSEG.map(s=>'C'+s[1].join(' ')+' '+s[2].join(' ')+' '+s[3].join(' ')).join('');
const MSAMP=(()=>{const o=[];for(const[a,b,c,d]of MSEG)for(let t=0;t<=1;t+=.05){const u=1-t;o.push([u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]])}return o})();
const nearPath=(x,y,r)=>MSAMP.some(p=>Math.hypot(p[0]-x,p[1]-y)<r);
function rnd(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
let MSCENE=null;
function mapScene(){
  if(MSCENE)return MSCENE;
  const r=rnd(7);let pines='',oaks='',flowers='',stars='',flies='';
  for(let i=0;i<46;i++){const x=8+r()*344,y=598+r()*170;if(nearPath(x,y,30))continue;const s=.7+r()*.6;
    pines+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})"><rect x="-2" y="0" width="4" height="9" class="mp-trunk"/><path d="M0-34 13-8H-13z" class="mp-pine"/><path d="M0-24 11-1H-11z" class="mp-pine2"/></g>`}
  for(let i=0;i<22;i++){const x=10+r()*340,y=800+r()*170;if(nearPath(x,y,34))continue;const s=.8+r()*.5;
    oaks+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})"><rect x="-2.5" y="-4" width="5" height="14" rx="2" class="mp-trunk"/><circle cy="-14" r="13" class="mp-oak"/><circle cx="-6" cy="-18" r="6" class="mp-oak2"/></g>`}
  const fc=['mp-f1','mp-f2','mp-f3'];
  for(let i=0;i<70;i++){const x=6+r()*348,y=790+r()*200;if(nearPath(x,y,18))continue;flowers+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.8+r()*1.6).toFixed(1)}" class="${fc[i%3]}"/>`}
  for(let i=0;i<60;i++){const x=r()*360,y=r()*300;stars+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.5+r()*1.3).toFixed(1)}" style="animation-delay:${(r()*4).toFixed(1)}s"/>`}
  for(let i=0;i<16;i++){const x=10+r()*340,y=620+r()*360;flies+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" style="animation-delay:${(r()*3).toFixed(1)}s"/>`}
  const snow=(x,y,w)=>`<path d="M${x} ${y}l${-w} ${w*1.6}l${w*.45} ${-w*.25}l${w*.55} ${w*.55}l${w*.5} ${-w*.6}l${w*.5} ${w*.3}z" class="mp-snow"/>`;
  MSCENE=`<svg class="mscene" viewBox="0 0 ${MW} ${MH}" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="mpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="mg1"/><stop offset="1" class="mg2"/></linearGradient></defs>
  <rect width="${MW}" height="470" fill="url(#mpSky)"/>
  <g class="mp-stars">${stars}</g>
  <g class="mp-sun"><circle cx="292" cy="78" r="34" class="mp-sunglow"/><circle cx="292" cy="78" r="22" class="mp-sunc"/></g>
  <g class="mp-moon"><circle cx="292" cy="78" r="20" class="mp-moonc"/><circle cx="301" cy="71" r="17" class="mp-moonbite"/></g>
  <g class="mp-clouds"><g transform="translate(64 108)"><ellipse rx="30" ry="10"/><ellipse cx="-12" cy="-7" rx="14" ry="10"/><ellipse cx="10" cy="-10" rx="16" ry="12"/></g><g transform="translate(236 166) scale(.8)"><ellipse rx="30" ry="10"/><ellipse cx="-12" cy="-7" rx="14" ry="10"/><ellipse cx="10" cy="-10" rx="16" ry="12"/></g></g>
  <path d="M0 330L40 232 70 262 128 168 172 236 226 140 274 226 318 176 360 236V470H0z" class="mp-mtn1"/>
  ${snow(128,168,13)}${snow(226,140,15)}${snow(318,176,11)}${snow(40,232,9)}
  <path d="M0 400L56 300 96 340 156 262 206 330 268 252 322 318 360 292V500H0z" class="mp-mtn2"/>
  ${snow(156,262,12)}${snow(268,252,13)}${snow(56,300,9)}
  <path d="M206 150v-30l14 6-14 6" class="mp-flag"/>
  <path d="M0 468Q60 428 120 452T240 444 360 450V620H0z" class="mp-hill1"/>
  <path d="M0 520Q90 482 180 512T360 500V660H0z" class="mp-hill2"/>
  <ellipse cx="62" cy="520" rx="58" ry="19" class="mp-lake"/><path d="M30 516h22M60 525h30M44 531h14" class="mp-ripple"/>
  <path d="M0 598Q90 574 180 592T360 582V800H0z" class="mp-forest"/>
  <path d="M0 772Q100 748 200 766T360 760V1000H0z" class="mp-meadow"/>
  ${pines}${oaks}${flowers}
  <g class="mp-flies">${flies}</g>
  <path d="${MPATH}" class="mp-road-edge" vector-effect="non-scaling-stroke"/>
  <path d="${MPATH}" class="mp-road" vector-effect="non-scaling-stroke"/>
  <path d="${MPATH}" class="mp-road-dash" vector-effect="non-scaling-stroke"/>
  </svg>`;
  return MSCENE;
}
function curStop(){for(let i=0;i<GROUPS.length;i++)if(gOpen(i)&&!gPassed(i))return i;return GROUPS.length-1}
const stopName=i=>i===0?'Simple':tName(GROUPS[i][0]);
function renderMap(){
  const el=$('hMap');if(!el)return;
  const anim=X.mapAnim,cs=curStop();X.mapAnim=null;
  let from=X.mapPos;if(from==null||from>=GROUPS.length||!gOpen(from))from=cs;
  if(anim!=null&&gOpen(anim)){if(from>=anim)from=Math.max(0,anim-1)}
  const to=anim!=null&&gOpen(anim)?cs:from;
  X.mapPos=to;saveX();
  const stops=GROUPS.map((g,i)=>{const open=gOpen(i),done=gPassed(i),c=gStat(i),acc=c[1]?Math.round(c[0]/c[1]*100):0,cur=i===cs&&open&&!done;
    const [x,y]=MP[i],right=x<180;
    const info=done?'пройдено':cur?`${Math.min(c[1],NEED_N)}/${NEED_N} · ${acc}%`:open?'открыто':'закрыто';
    return `<button class="stop ${open?'open':'locked'}${done?' done':''}${cur?' cur':''}${anim===i?' pop':''}${right?'':' l'}" data-stop="${i}" style="left:${x/MW*100}%;top:${y/MH*100}%" aria-label="${stopName(i)}: ${info}"><span class="dot">${done?ico('check'):open?i+1:ico('lock')}</span><span class="lbl">${stopName(i)}<small>${info}</small></span></button>`}).join('');
  el.innerHTML=`<div class="mapbox" id="mapBox">${mapScene()}${stops}<div class="maptch mascot" id="mapT" data-mood="idle"></div></div>
   <p class="note" style="margin:10px 4px 0">Следующая остановка открывается при 85%+ верных минимум на 30 ответах.</p>`;
  setMascot($('mapT'),'idle');
  placeTeacher(to,to===from?null:from);
}
let hopRun=0;
function placeTeacher(i,from){
  const el=$('mapT');if(!el)return 0;const [x,y]=MP[i];
  el.style.left=x/MW*100+'%';el.style.top=y/MH*100+'%';
  const run=++hopRun;
  if(from==null||from===i){el.style.transform='';return 0}
  const box=$('mapBox').getBoundingClientRect(),kx=box.width/MW,ky=box.height/MH;
  const off=k=>[(MP[k][0]-x)*kx,(MP[k][1]-y)*ky];
  if(reduced()||!box.width){
    el.style.transition='none';const o=off(from);el.style.transform=`translate(${o[0]}px,${o[1]}px)`;void el.offsetWidth;
    el.style.transition='transform .9s ease-in-out';el.style.transform='translate(0,0)';
    setTimeout(()=>{if(run===hopRun)el.style.transition=''},950);return 900;
  }
  const seq=[];const st=from<i?1:-1;for(let k=from;k!==i;k+=st)seq.push(k);seq.push(i);
  const n=seq.length-1,dur=Math.min(520,2600/n);
  el.style.transition='none';setMascot(el,'happy');
  let h=0,t0=null;
  const step=t=>{if(run!==hopRun)return;if(t0===null)t0=t;let k=(t-t0)/dur;
    if(k>=1){h++;t0=t;k=0;el.classList.remove('land');void el.offsetWidth;el.classList.add('land');if(h>=n){el.style.transform='translate(0,0)';setTimeout(()=>{if(run===hopRun)setMascot(el,'idle')},350);return}}
    const a=off(seq[h]),b=off(seq[h+1]),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,arc=Math.min(80,40+Math.hypot(b[0]-a[0],b[1]-a[1])*.25);
    el.style.transform=`translate(${a[0]+(b[0]-a[0])*e}px,${a[1]+(b[1]-a[1])*e-arc*4*k*(1-k)}px)`;
    requestAnimationFrame(step)};
  const o=off(from);el.style.transform=`translate(${o[0]}px,${o[1]}px)`;requestAnimationFrame(step);
  return n*dur;
}
/* tapping a stop: the teacher hops there (if it is open), then a sheet offers training and theory */
function openStop(i){
  const open=gOpen(i);let wait=0;
  if(open&&X.mapPos!==i){const from=X.mapPos==null?curStop():X.mapPos;X.mapPos=i;saveX();wait=Math.min(700,placeTeacher(i,from))}
  setTimeout(()=>stopSheet(i),wait);
}
function stopSheet(i){
  const g=GROUPS[i],open=gOpen(i),done=gPassed(i),c=gStat(i),acc=c[1]?Math.round(c[0]/c[1]*100):0;
  let status;
  if(done)status=`<p class="st ok">${ico('check',18)} Пройдено: ${acc}% верных на ${c[1]} ответах</p>`;
  else if(open)status=`<p class="st">Сейчас: ${Math.min(c[1],NEED_N)} из ${NEED_N} ответов, точность ${acc}%. Нужно 85%.</p><div class="xpbar"><i style="width:${Math.min(1,c[1]/NEED_N)*100}%"></i></div>`;
  else status=`<p class="st lock">${ico('lock',18)} Откроется после остановки «${stopName(i-1)}». Теорию можно читать уже сейчас.</p>`;
  $('ssBox').innerHTML=`<div class="shead"><span class="snum">Остановка ${i+1} из ${GROUPS.length}</span><h2 id="ssTitle">${stopName(i)}</h2></div>${status}
   <div class="srows">${g.map(t=>`<div class="srow"><div><b>${tName(t)}</b><small>${T[t].ru} · ${T[t].f['+']}</small></div><div class="row"><button class="main" data-trt="${t}" ${open?'':'disabled'}>${ico('play',18)}Тренировать</button><button data-chap="t-${t}">${ico('book',18)}Глава</button></div></div>`).join('')}</div>
   <button class="link" data-close>Закрыть</button>`;
  openModal('ssheet');
}
function openModal(id){$(id).hidden=false;document.body.classList.add('modal')}
function closeModal(id){$(id).hidden=true;if(![...document.querySelectorAll('.lsum')].some(m=>!m.hidden))document.body.classList.remove('modal')}
addEventListener('resize',()=>{const el=$('mapT');if(el&&!hopRun)el.style.transform=''});

/* --- awards --- */
const ACC={q:'var(--q)',brand:'var(--brand)',plus:'var(--plus)',amber:'var(--amber)',hot:'var(--hot)'};
function renderAch(){
  const n=ACH.filter(a=>X.ach[a.id]).length;
  $('hAchN').textContent=`${n} из ${ACH.length}`;
  const got=ACH.filter(a=>X.ach[a.id]),rest=ACH.filter(a=>!X.ach[a.id]);
  const list=achAll?got.concat(rest):got.concat(rest.slice(0,Math.max(4,8-got.length)));
  $('hAch').innerHTML=list.map(a=>`<div class="ach${X.ach[a.id]?' got':''}" style="--ac:${ACC[a.c]||ACC.brand}"><span class="aci">${ico(a.i)}</span><b>${esc(a.n)}</b><small>${esc(a.d)}</small></div>`).join('')+(list.length<ACH.length||achAll?`<button class="achmore" data-achall>${achAll?'Свернуть':'Все награды ('+ACH.length+')'}</button>`:'');
}
let achAll=false;
function renderGameProg(){}

/* --- choose a teacher: first run and settings --- */
function teacherCards(){return ['m','f'].map(g=>`<button class="tcard" data-teacher="${g}" aria-pressed="${X.teacher===g}"><span class="mascot" data-mood="idle">${teacherSVG(g)}</span><b>${TCH[g].name}</b><small>${TCH[g].who}</small></button>`).join('')}
function teacherFirstRun(){if(!X.teacher){$('tpickBox').innerHTML=teacherCards();openModal('tpickM')}}

document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(g){
    wList=false;
    if(g.dataset.go==='rev'){wMode='day';on.wMode='day';D.skipRev=false;setSec('words');showTab('train');wNext()}
    else{const t=newestTense();on.tf=t.length>1?null:t[0];if(ex==='mix'){ex='tr';on.ex='tr'}save();setSec('tense');showTab('train');setMode(0)}
    window.scrollTo({top:0});return}
  if(e.target.closest('[data-achall]')){achAll=!achAll;renderAch();return}
  const st=e.target.closest('[data-stop]');if(st){openStop(+st.dataset.stop);return}
  const tc=e.target.closest('[data-teacher]');if(tc){X.teacher=tc.dataset.teacher;saveX();refreshTeachers();settings();
    document.querySelectorAll('[data-teacher]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.teacher===X.teacher));
    if(!$('tpickM').hidden){const m=tc.querySelector('.mascot');m.dataset.mood='happy';setTimeout(()=>{closeModal('tpickM');teacherPop('Привет! Я '+TCH[X.teacher].name+'. Начнём?','happy')},450)}
    if(curTab==='home')renderHome();return}
  if(e.target.closest('#hMascot')){const m=$('hMascot');setMascot(m,'happy');const b=$('hBubble');b.innerHTML='<b>Совет учителя</b><span>'+pick(allTips())+'</span>';setTimeout(()=>{if(m.isConnected)setMascot(m,'idle')},1200);return}
  if(e.target.closest('[data-close]')||e.target.id==='ssheet'){closeModal('ssheet');return}
  if(e.target.closest('#ssheet [data-trt],#ssheet [data-chap]'))closeModal('ssheet');
  if(e.target.closest('#lend')){showSummary(sec);return}
  if(e.target.closest('#lsMore')){closeSummary(true,false);return}
  if(e.target.closest('#lsRetry')){closeSummary(false,true);return}
  if(e.target.closest('#lsClose')){closeSummary(false,false);return}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('ssheet').hidden)closeModal('ssheet')});
