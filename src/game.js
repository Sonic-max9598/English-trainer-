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
}

/* --- program time: 10 min review + 15 min new --- */
let lastAct=0;
function newestTense(){const o=openT();for(let i=GROUPS.length-1;i>=0;i--){if(gOpen(i))return GROUPS[i]}return GROUPS[0]}
function isNewMaterial(info){
  if(!info)return false;
  if(info.kind==='word')return info.phase==='new';
  if(info.kind==='tense'){const g=gOf(info.t);return gOpen(g)&&!gPassed(g)}
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
  const kind=info.kind==='word'?'word':info.kind;
  const id=info.kind==='word'?{k:info.k,type:info.type}:info.id;
  const keyOf=v=>typeof v==='object'?v.k:v;
  if(!good){
    if(info.kind!=='word')SR.push({kind,id,wait:3+Math.floor(Math.random()*3)});
    if(info.kind!=='word'&&!X.errs.some(e=>e.kind===kind&&e.id===id)){X.errs.push({kind,id,due:tdy()+1});if(X.errs.length>150)X.errs.shift()}
  }else if(info.kind!=='word'){const k=X.errs.findIndex(e=>e.kind===kind&&e.id===id&&e.due<=tdy());if(k>=0)X.errs.splice(k,1)}
  combo=good?combo+1:0;
  const mult=combo>=10?3:combo>=5?2:1;
  const gain=good?10*mult:1;
  X.g.xp+=gain;if(combo>X.g.comboBest){const was=X.g.comboBest;X.g.comboBest=combo;if(was>=5&&combo===was+1)celebrate('Новый рекорд серии: '+combo+'!')}
  const L=les();L.n++;if(good)L.ok++;L.xp+=gain;L.run=good?L.run+1:0;L.best=Math.max(L.best,L.run);
  if(info.kind==='tense'&&isNewMaterial(info))L.newT++;
  if(!good)L.mist.push({kind,id,label:mistLabel(info)});
  const q=qRec();q.ans++;q.run=good?q.run+1:0;if(q.run>=5)q.c5=1;
  markActive();
  if(L.n>=LN)L.pending=true;
  checkQuests();checkAch();saveX();
  lessonBar(gain,mult);mascotReact(good,{tense:'fb',art:'aFb',word:'wFb'}[kind]);
}
function mistLabel(info){
  if(info.kind==='tense'){const b=BANK.find(x=>x.en===info.id);return b?b.en:''}
  if(info.kind==='art'){const a=AB.find(x=>x.en===info.id);return a?fullA(a):''}
  if(info.kind==='word'){const w=wGet(info.k);return w?bare(w.en)+' — '+w.ru:''}
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
  setMascot($('lsMascot'),acc>=80?'happy':'calm');
  if(L.n>=LN&&!L.counted){L.counted=1;X.g.xp+=20;X.g.lessons++;if(acc===100){X.g.perfect++;celebrate('Идеальный урок!')}
    if(s==='tense'&&L.newT>=5)qRec().newL=1;checkQuests();checkAch();saveX()}
}
function closeSummary(again,retry){
  const L=les();const mist=L.mist.slice();
  $('lsum').hidden=true;document.body.classList.remove('modal');
  LES[sec]=null;const N=les();
  if(retry)N.retry=mist.map(m=>({kind:m.kind,id:m.id}));
  lessonBar();
  if(again||retry){showTab('train');if(sec==='tense')next();else if(sec==='art')aNext();else wNext()}
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
  {id:'a100',i:'💯',n:'Первые 100 ответов',d:'Ответь на 100 заданий',ok:()=>totalAns()>=100},
  {id:'a1000',i:'🏔️',n:'Тысяча ответов',d:'1000 заданий за всё время',ok:()=>totalAns()>=1000},
  {id:'les1',i:'🎒',n:'Первый урок',d:'Пройди урок из 10 заданий',ok:()=>X.g.lessons>=1},
  {id:'les25',i:'📚',n:'25 уроков',d:'Пройди 25 уроков',ok:()=>X.g.lessons>=25},
  {id:'perf',i:'✨',n:'Без ошибок',d:'Урок на 10 из 10',ok:()=>X.g.perfect>=1},
  {id:'c10',i:'⚡',n:'Серия ×10',d:'10 верных ответов подряд',ok:()=>X.g.comboBest>=10},
  {id:'c25',i:'🚀',n:'Серия ×25',d:'25 верных ответов подряд',ok:()=>X.g.comboBest>=25},
  {id:'s3',i:'🔥',n:'Три дня подряд',d:'Занимайся 3 дня без пропусков',ok:()=>X.g.best>=3},
  {id:'s7',i:'🗓️',n:'Неделя без пропусков',d:'Серия 7 дней',ok:()=>X.g.best>=7},
  {id:'s30',i:'🏆',n:'Месяц без пропусков',d:'Серия 30 дней',ok:()=>X.g.best>=30},
  {id:'w100',i:'🌱',n:'100 слов',d:'Выучи 100 слов',ok:()=>learned()>=100},
  {id:'w500',i:'🌳',n:'500 слов',d:'Выучи 500 слов',ok:()=>learned()>=500},
  {id:'w1000',i:'🌍',n:'1000 слов',d:'Выучи 1000 слов',ok:()=>learned()>=1000},
  {id:'art',i:'🅰️',n:'Мастер артиклей',d:'85%+ на 100 ответах по артиклям',ok:()=>{const c=artStat();return c[1]>=100&&c[0]/c[1]>=.85}},
  {id:'lv5',i:'⭐',n:'Уровень 5',d:'Набери опыт до 5 уровня',ok:()=>lvlInfo().lv>=5},
  {id:'all',i:'🗺️',n:'Весь маршрут',d:'Открой все 12 времён',ok:()=>STOPS.every(t=>tOpen(t))&&!on.allOpen}
].concat(STOPS.map(t=>({id:'m_'+t,i:'🎓',n:'Мастер '+tName(t),d:'85%+ минимум на 30 ответах',ok:()=>mastered(t)})));
let achInit=false;
function checkAch(){
  const fresh=[];for(const a of ACH){if(!X.ach[a.id]&&a.ok()){X.ach[a.id]=today();fresh.push(a)}}
  if(fresh.length&&achInit){const a=fresh[0];celebrate(`${a.i} Новое достижение: ${a.n}`)}
  achInit=true;
}

/* --- mascot: Paxta, a cotton boll --- */
const MASCOT=`<svg viewBox="0 0 120 120" aria-hidden="true"><g class="m-body">
 <path d="M60 92c-10 8-24 12-34 10 8-4 14-10 18-17zM60 92c10 8 24 12 34 10-8-4-14-10-18-17z" fill="#3aa35b"/><path d="M60 90l-8 18h16z" fill="#2f8a4b"/>
 <g fill="#fff" stroke="#d9d4ee" stroke-width="2"><circle cx="38" cy="60" r="23"/><circle cx="82" cy="60" r="23"/><circle cx="60" cy="38" r="25"/><circle cx="60" cy="72" r="25"/></g>
 <circle cx="60" cy="58" r="30" fill="#fff"/>
 <ellipse class="m-ch" cx="44" cy="70" rx="6" ry="4" fill="#ffb3c1"/><ellipse class="m-ch" cx="76" cy="70" rx="6" ry="4" fill="#ffb3c1"/>
 <g class="m-eyes"><circle cx="49" cy="58" r="5" fill="#26244a"/><circle cx="71" cy="58" r="5" fill="#26244a"/><circle cx="50.5" cy="56.5" r="1.6" fill="#fff"/><circle cx="72.5" cy="56.5" r="1.6" fill="#fff"/></g>
 <g class="m-joy" fill="none" stroke="#26244a" stroke-width="3" stroke-linecap="round"><path d="M44 59q5-6 10 0M66 59q5-6 10 0"/></g>
 <path class="m-smile" d="M53 70q7 6 14 0" fill="none" stroke="#26244a" stroke-width="3" stroke-linecap="round"/>
 <path class="m-grin" d="M51 68q9 12 18 0z" fill="#26244a"/>
 <path class="m-calm" d="M54 72q6-3 12 0" fill="none" stroke="#26244a" stroke-width="3" stroke-linecap="round"/>
</g></svg>`;
const SAY_OK=['Отлично!','Так держать!','Супер!','Верно, молодец!','Красота!','Вот это да!',"Zo'r!","Barakalla!"];
const SAY_NO=['Ничего, получится!','Ошибки — это нормально.','Запомним и повторим.','Почти! Попробуем ещё.','Ты учишься — это главное.',"Hechqisi yo'q!"];
function setMascot(el,mood){if(!el)return;if(!el.firstChild)el.innerHTML=MASCOT;el.dataset.mood=mood;el.classList.remove('jump');void el.offsetWidth;if(mood==='happy')el.classList.add('jump')}
function mascotReact(good,fbId){
  setTimeout(()=>{const fb=$(fbId);if(!fb||!fb.className.includes(good?'ok':'no'))return;
    const m=document.createElement('div');m.className='mline';m.innerHTML='<div class="mascot sm"></div><span></span>';
    m.querySelector('span').textContent=pick(good?SAY_OK:SAY_NO);fb.prepend(m);setMascot(m.firstChild,good?'happy':'calm')},0);
}

/* --- confetti for records --- */
function celebrate(msg){
  if(msg)toast('<b>'+msg+'</b>');
  if(reduced())return;
  const c=document.createElement('canvas');c.className='confetti';document.body.appendChild(c);
  const W=c.width=innerWidth*devicePixelRatio,H=c.height=innerHeight*devicePixelRatio,x=c.getContext('2d');
  const cols=['#5b4cf5','#ffb020','#0f9d58','#e5383b','#1e6bff','#ff6a3d'];
  const P=Array.from({length:130},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*16*devicePixelRatio,vy:(-Math.random()*14-4)*devicePixelRatio,s:(5+Math.random()*6)*devicePixelRatio,r:Math.random()*6,c:pick(cols)}));
  const t0=performance.now();
  (function f(t){const k=(t-t0)/1600;x.clearRect(0,0,W,H);for(const p of P){p.vy+=.45*devicePixelRatio;p.x+=p.vx;p.y+=p.vy;p.r+=.15;x.save();x.globalAlpha=Math.max(0,1-k);x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()}
    if(k<1)requestAnimationFrame(f);else c.remove()})(t0);
}
function onRecord(){celebrate('Новый рекорд!')}
function onUnlock(i){X.mapAnim=i;saveX();celebrate();if(curTab==='home')renderHome()}
function onWordsDone(){celebrate()}

/* --- home screen --- */
function ring(p){const r=42,C=2*Math.PI*r;return `<svg viewBox="0 0 100 100" class="ring"><circle cx="50" cy="50" r="${r}" class="rb"/><circle cx="50" cy="50" r="${r}" class="rf" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-Math.min(1,p))}"/></svg>`}
function renderHome(){
  const s=streakNow(),li=lvlInfo(),p=pRec(),q=qRec();
  const rev=Math.min(10,p.rev/60000),nw=Math.min(15,p.nw/60000),tot=(rev+nw)/25;
  const hour=new Date().getHours();
  const hi=hour<5?'Доброй ночи!':hour<12?'Доброе утро!':hour<18?'Добрый день!':'Добрый вечер!';
  const msg=tot>=1?'Программа на сегодня выполнена. Ты молодец!':s>0&&X.g.last===tdy()?'Серия продолжается — так держать!':s>0?`Серия ${s} дн. ждёт — пара заданий, и она продолжится.`:'Начнём? Хватит и 10 минут.';
  $('hHero').innerHTML=`<div class="mascot" id="hMascot"></div><div class="bubble"><b>${hi}</b><span>${msg}</span></div>`;
  setMascot($('hMascot'),tot>=1?'happy':'idle');
  $('hStats').innerHTML=`<div class="hs fire"><span class="flame${s?'':' off'}">🔥</span><b>${s}</b><small>дн. подряд${X.g.freeze?' · ❄️ заморозка есть':''}</small></div>
    <div class="hs"><span class="lvbadge">${li.lv}</span><b>${X.g.xp}</b><small>XP · уровень ${li.lv}</small><div class="xpbar"><i style="width:${li.cur/li.need*100}%"></i></div><small>${li.need-li.cur} XP до уровня ${li.lv+1}</small></div>`;
  $('hProg').innerHTML=`<div class="ringw">${ring(tot)}<div class="rt"><b>${Math.floor(rev+nw)}</b><small>из 25 мин</small></div></div>
    <div class="pl"><div class="pr"><span>Повтор</span><b>${Math.floor(rev)}/10 мин</b></div><div class="xpbar g"><i style="width:${rev/10*100}%"></i></div>
    <div class="pr"><span>Новое</span><b>${Math.floor(nw)}/15 мин</b></div><div class="xpbar"><i style="width:${nw/15*100}%"></i></div>
    <div class="row"><button class="main" data-go="rev">${rev>=10?'Ещё повтор':'Повторять'}</button><button data-go="new">Новое</button></div></div>`;
  $('hQuests').innerHTML=QUESTS.map(Q=>{const v=Q.p(q),d=!!q.claimed[Q.id]||v>=Q.max;const pct=Math.min(1,v/Q.max);
    return `<div class="quest${d?' done':''}"><i>${d?'✓':''}</i><div><b>${Q.n}</b><div class="xpbar"><i style="width:${pct*100}%"></i></div></div><small>+${Q.xp} XP</small></div>`}).join('');
  renderMap();renderAch();
}
function renderMap(){
  const el=$('hMap');if(!el)return;
  const anim=X.mapAnim;X.mapAnim=null;saveX();
  const XS=[20,50,80,50],H=84,pts=[],rows=[];
  GROUPS.forEach((g,i)=>{const open=gOpen(i),done=gPassed(i),c=gStat(i),acc=c[1]?Math.round(c[0]/c[1]*100):0,cur=open&&!done;
    g.forEach((t,j)=>{const n=rows.length,x=XS[n%4];pts.push([x,n*H+H/2]);
      const info=cur&&j===g.length-1?`<small>${Math.min(c[1],30)}/30 ответов · ${acc}%</small>`:done?'<small>пройдено</small>':open?'':'<small>закрыто</small>';
      rows.push(`<button class="stop ${open?'open':'locked'}${done?' done':''}${cur?' cur':''}${anim===i?' pop':''}${x>60?' l':''}" data-stop="${t}" style="--x:${x}%;top:${n*H}px"><span class="dot">${done?'✓':open?n+1:LOCK}</span><span class="lbl">${tName(t)}${info}</span></button>`)})});
  const hgt=rows.length*H;
  const d=pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
  el.innerHTML=`<div class="path" style="height:${hgt}px"><svg viewBox="0 0 100 ${hgt}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" class="road"/></svg>${rows.join('')}</div><p class="note" style="margin:8px 0 0">Следующая остановка открывается при 85%+ верных минимум на 30 ответах.</p>`;
}
function renderAch(){
  const n=ACH.filter(a=>X.ach[a.id]).length;
  $('hAchN').textContent=`${n} из ${ACH.length}`;
  $('hAch').innerHTML=ACH.map(a=>`<div class="ach${X.ach[a.id]?' got':''}" title="${esc(a.d)}"><span>${a.i}</span><b>${esc(a.n)}</b><small>${esc(a.d)}</small></div>`).join('');
}
function renderGameProg(){}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(g){
    if(g.dataset.go==='rev'){wMode='day';on.wMode='day';D.skipRev=false;setSec('words');showTab('train');wNext()}
    else{const t=newestTense();on.tf=t[t.length-1];if(t.length>1)on.tf=null;save();setSec('tense');showTab('train');setMode(0)}
    window.scrollTo({top:0});return}
  const st=e.target.closest('[data-stop]');if(st){const t=st.dataset.stop;if(tOpen(t)){on.tf=t;save();setSec('tense');showTab('train');setMode(0)}else{shT=t;setSec('tense');showTab('sheet')}window.scrollTo({top:0});return}
  if(e.target.closest('#lend')){showSummary(sec);return}
  if(e.target.closest('#lsMore')){closeSummary(true,false);return}
  if(e.target.closest('#lsRetry')){closeSummary(false,true);return}
  if(e.target.closest('#lsClose')){closeSummary(false,false);return}
});
checkAch();
