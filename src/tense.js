/* ===== answer normalisation (contractions, numbers) ===== */
const NUMW=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const NUMT={30:'thirty',40:'forty',50:'fifty',60:'sixty'};
function norm(x){
  return x.toLowerCase().replace(/[’`‘ʻʼ]/g,"'")
   .replace(/\b(\d{1,2})\b/g,(m,d)=>NUMW[+d]||NUMT[+d]||m)
   .replace(/\bcan't\b/g,'cannot').replace(/\bcan not\b/g,'cannot')
   .replace(/\bwon't\b/g,'will not')
   .replace(/\b(do|does|did|is|are|was|were|has|have|had|could|would|should)n't\b/g,'$1 not')
   .replace(/\bi'm\b/g,'i am').replace(/'s been\b/g,' has been').replace(/'re\b/g,' are').replace(/'ve\b/g,' have')
   .replace(/'ll\b/g,' will').replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
}
/* he's = he is / he has, I'd = I had / I would: try every reading */
const PRON="i|you|he|she|it|we|they|that|there|what|who|where|how|when|this|everyone|nobody";
function variants(x){
  let out=[norm(x)];
  const rs=[[new RegExp("\\b("+PRON+")'s\\b","g"),['is','has']],[new RegExp("\\b("+PRON+")'d\\b","g"),['had','would']]];
  for(const[re,ws]of rs){if(!out.some(s=>re.test(s)))continue;const n=[];for(const s of out)for(const w of ws)n.push(s.replace(re,'$1 '+w));out=n}
  return out;
}

/* ===== learning path: unlock rule — ≥85% on ≥30 answers in the previous step ===== */
const NEED_N=30,NEED_ACC=.85;
const tStat=t=>Object.keys(F).reduce((s,f)=>{const c=prog.cells[t+f]||[0,0];return[s[0]+c[0],s[1]+c[1]]},[0,0]);
const gStat=i=>GROUPS[i].reduce((s,t)=>{const c=tStat(t);return[s[0]+c[0],s[1]+c[1]]},[0,0]);
const gPassed=i=>{const c=gStat(i);return c[1]>=NEED_N&&c[0]/c[1]>=NEED_ACC};
function gOpen(i){if(i===0||on.allOpen)return true;for(let j=0;j<i;j++)if(!gPassed(j)&&!(prog.opened&&prog.opened[j+1]))return false;return true}
const gOf=t=>GROUPS.findIndex(g=>g.includes(t));
const tOpen=t=>gOpen(gOf(t));
const openT=()=>STOPS.filter(tOpen);
const tOn=t=>tOpen(t)&&on.t[t]!==0;
/* once a step is opened it stays opened, even if accuracy drops later */
function syncOpened(){
  prog.opened=prog.opened||{};let fresh=null;
  for(let i=1;i<GROUPS.length;i++){if(prog.opened[i])continue;
    let ok=true;for(let j=0;j<i;j++)if(!gPassed(j)&&!prog.opened[j+1]){ok=false;break}
    if(ok&&gPassed(i-1)){prog.opened[i]=Date.now();fresh=i;saveProg()}}
  return fresh;
}
const tName=t=>T[t].n;

/* ===== tense trainer ===== */
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
let cur=null,checked=false,auto=null;
let st={ok:0,all:0,streak:0};
let mode=0,run=null,tick=null;
let ex=['tr','tiles','choose','mix'].includes(on.ex)?on.ex:'tr';
const EXN={tr:'Перевод',tiles:'Собери',choose:'Выбери время',mix:'Смешанные времена'};
/* ===== mixed tenses: real-life sentences with two tenses ===== */
const MIXT={pacps:['Past Continuous + Past Simple',['pac','past']],ppps:['Present Perfect + Past Simple',['pp','past']],futif:['Future Simple + Present Simple',['fut','pres']],papps:['Past Perfect + Past Simple',['pap','past']],prespc:['Present Simple + Present Continuous',['pres','pc']],fcwhen:['Future Continuous + Present Simple',['fc','pres']],ppsince:['Present Perfect (Continuous) + Past Simple',['ppc','pp','past']]};
/* «When X, Y» is also right as «Y when X» (and back) */
const CONJ=/^(when|while|if|as soon as|before|after|until|by the time|because)\s+([^,]+),\s*(.+?)([.!?]?)$/i;
const CONJ2=/^(.+?)\s+(when|while|if|as soon as|before|after|until|by the time)\s+(.+?)([.!?]?)$/i;
function swapClauses(x){
  const out=[x];let m=x.match(CONJ);if(m&&m[1].toLowerCase()!=='because')out.push(m[3]+' '+m[1].toLowerCase()+' '+m[2]+m[4]);
  if(!m&&!x.includes('—')&&(m=x.match(CONJ2)))out.push(m[2]+' '+m[3]+', '+m[1]+m[4]);
  return out;
}
const MIX=__MIXED__.split("\n").map((l,i)=>{const[k,ru,uz,en,alt,h,why]=l.split("|");const all=[en].concat(alt?alt.split(";"):[]);return{id:i,k,ru,uz,en,h,why,all:[...new Set(all.flatMap(swapClauses).map(norm))]}});
let mixRecent=[];
function pickMix(){
  {const f=gameForce('mix');if(f){const x=MIX.find(m=>m.en===f);if(x)return x}}
  let pool=MIX.filter(x=>!mixRecent.includes(x.id));if(!pool.length)pool=MIX;
  const it=pick(pool);mixRecent.push(it.id);if(mixRecent.length>40)mixRecent.shift();return it;
}
const NAMES=/^(I|Akmal|Malika|Mom|Mum|Dad|Grandma|Tashkent|Samarkand|Bukhara|London|Moscow|Istanbul|England|English|Monday|Friday|September|March|May|June)$/;

function stats(){
  $('sOk').textContent=st.ok;$('sAll').textContent=st.all;$('sSt').textContent=st.streak;$('sBest').textContent=best.streak;
  $('sBestW').hidden=!!run;
}
function tPool(){
  const tf=on.tf&&tOpen(on.tf)?on.tf:null;
  let pool=BANK.filter(x=>(tf?x.t===tf:tOn(x.t))&&on.f[x.f]);
  if(!pool.length)pool=BANK.filter(x=>tOpen(x.t)&&on.f[x.f]);
  if(!pool.length)pool=BANK.filter(x=>tOpen(x.t));
  return pool;
}
function pickItem(){
  if(!run){const f=gameForce('tense');if(f){const x=BANK.find(b=>b.en===f);if(x)return x}}
  let pool=tPool();
  const fresh=pool.filter(x=>!recent.includes(x.id));if(fresh.length)pool=fresh;
  let it;
  if(on.focus){
    const w=pool.map(x=>{const c=prog.cells[x.t+x.f];return !c||c[1]<3?0.7:1.15-c[0]/c[1]});
    let r=Math.random()*w.reduce((a,b)=>a+b,0);it=pool[pool.length-1];
    for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0){it=pool[i];break}}
  }else it=pick(pool);
  recent.push(it.id);if(recent.length>Math.min(30,Math.max(1,tPool().length-5)))recent.shift();
  return it;
}
function exNow(){return run?'tr':ex}
function nextMix(lang){
  const it=pickMix(),M=MIXT[it.k];
  cur={t:M[1][0],mix:it,lang,a:it.en,all:it.all,it,ex:'mix'};checked=false;
  $('card').dataset.kind='mix';
  $('task').innerHTML=`<span class="chip lang">${lang==='ru'?'RU':'UZ'}</span><span class="chip t">${M[0]}</span>`;
  $('hint').className='hint';$('hint').innerHTML=M[1].map(t=>`<div><b>${tName(t)}</b>: ${T[t].f['+']}</div>`).join('');
  $('fb').className='fb';$('fb').innerHTML='';
  $('go').textContent='Проверить';$('go').hidden=false;$('hintBtn').hidden=false;
  $('field').hidden=false;$('tiles').hidden=true;$('chOpts').hidden=true;$('tClear').hidden=true;
  $('ru').textContent=lang==='ru'?it.ru:it.uz;$('mk').textContent='Слова: '+it.h;
  const a=$('ans');a.value='';base='';a.focus({preventScroll:true});
  enter($('card'));
}
function next(){
  clearTimeout(auto);
  if(!run&&lessonGate('tense'))return;
  const e=exNow(),lang=on.lang==='mix'?pick(['ru','uz']):on.lang;
  $('tsel').hidden=e==='mix';
  if(e==='mix')return nextMix(lang);
  const it=pickItem(),t=it.t,f=it.f;
  cur={t,f,lang,a:it.en,all:it.all.map(norm),it,ex:e};checked=false;
  $('card').dataset.kind=e;
  const chips=e==='choose'?`<span class="chip t">Какое это время?</span>`:`<span class="chip lang">${lang==='ru'?'RU':'UZ'}</span><span class="chip t">${tName(t)}</span><span class="chip f ${FC[f]}">${f} ${F[f]}</span>`;
  $('task').innerHTML=chips;
  $('hint').className='hint';$('hint').innerHTML='<b>Формула:</b> '+T[t].f[f]+'<br><span class="mk">'+TX[t].tip+'</span>';
  $('fb').className='fb';$('fb').innerHTML='';
  $('go').textContent='Проверить';$('go').hidden=e==='choose';$('hintBtn').hidden=e==='choose';
  $('field').hidden=e!=='tr';$('tiles').hidden=e!=='tiles';$('chOpts').hidden=e!=='choose';$('tClear').hidden=e!=='tiles';
  if(e==='choose'){
    $('ru').textContent=it.en;$('mk').textContent=lang==='ru'?it.ru:it.uz;
    const opts=shuf([t].concat(SIM[t].slice(0,3)));cur.opts=opts;
    $('chOpts').innerHTML=opts.map(o=>`<button data-ch="${o}">${tName(o)}</button>`).join('');
  }else{
    $('ru').textContent=lang==='ru'?it.ru:it.uz;
    $('mk').textContent='Слова: '+it.h;
  }
  if(e==='tiles')buildTiles(it);
  if(e==='tr'){const a=$('ans');a.value='';base='';a.focus({preventScroll:true})}
  enter($('card'));
}
/* --- tiles: build a sentence without a keyboard --- */
const AUX=['do','does','did','is','are','am','was','were','have','has','had','will','been','being'];
function buildTiles(it){
  const words=it.en.replace(/[.!?,:;]/g,'').split(/\s+/).filter(Boolean).map((w,i)=>i===0&&!NAMES.test(w)?w.toLowerCase():w);
  const low=new Set(words.map(w=>w.toLowerCase()));
  const extra=shuf(AUX.filter(a=>!low.has(a))).slice(0,words.length>=6?2:1);
  cur.tiles=shuf(words.concat(extra)).map((w,i)=>({w,i,used:false}));cur.line=[];
  renderTiles();
}
function renderTiles(){
  $('tLine').innerHTML=cur.line.length?cur.line.map((ti,j)=>`<button class="tile" data-tl="${j}">${esc(cur.tiles[ti].w)}</button>`).join(''):'<span class="tph">Нажимай на слова по порядку</span>';
  $('tPool').innerHTML=cur.tiles.map((t,i)=>`<button class="tile${t.used?' used':''}" data-tp="${i}" ${t.used||checked?'disabled':''}>${esc(t.w)}</button>`).join('');
}
function tileAnswer(){return cur.line.map(i=>cur.tiles[i].w).join(' ')}
function check(){
  if(checked){next();return}
  let u;
  if(cur.ex==='tiles'){u=tileAnswer();if(!u)return}
  else{u=$('ans').value.trim();if(!u){$('ans').focus();return}}
  if(listening&&dict)dict.stop().catch(()=>{});
  const good=variants(u).some(v=>cur.all.includes(v));
  finishAnswer(good);
}
function chooseAnswer(o){
  if(checked||cur.ex!=='choose')return;
  const good=o===cur.t;
  document.querySelectorAll('#chOpts button').forEach(b=>{b.disabled=true;if(b.dataset.ch===cur.t)b.className='ok';else if(b.dataset.ch===o)b.className='no'});
  finishAnswer(good);
}
function finishAnswer(good){
  checked=true;st.all++;
  if(cur.ex==='mix'){X.mixS=X.mixS||{};const c=X.mixS[cur.mix.k]||(X.mixS[cur.mix.k]=[0,0]);c[1]++;if(good)c[0]++;const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;saveProg();saveX()}
  else if(cur.ex==='choose'){prog.ch=prog.ch||{};const c=prog.ch[cur.t]||(prog.ch[cur.t]=[0,0]);c[1]++;if(good)c[0]++;const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;saveProg()}
  else record(cur.t,cur.f,good);
  feedback($('card'),good);
  if(good){st.ok++;st.streak++;if(!run&&st.streak>best.streak){best.streak=st.streak;save()}}else st.streak=0;
  if(run)onAnswer(good,{kind:'timer'});else if(cur.ex==='mix')onAnswer(good,{kind:'mix',id:cur.mix.en});else onAnswer(good,{kind:'tense',t:cur.t,f:cur.f,ex:cur.ex,id:cur.it.en});
  const fb=$('fb');fb.className='fb '+(good?'ok':'no');fb.innerHTML='';
  const h=document.createElement('b');h.textContent=good?'Верно!':(cur.ex==='choose'?'Это '+tName(cur.t):'Правильно так:');fb.appendChild(h);
  const a=document.createElement('div');a.className='ans';a.textContent=cur.a;fb.appendChild(a);
  if(cur.ex==='mix'){const w=document.createElement('p');w.className='why';w.textContent=cur.mix.why;fb.appendChild(w)}
  else{const fm=document.createElement('code');fm.textContent=tName(cur.t)+' · '+T[cur.t].f[cur.f];fb.appendChild(fm)}
  if(!good&&!run){const tb=document.createElement('button');tb.className='say';tb.type='button';tb.innerHTML=BOOKIC+'<span>Глава в теории</span>';tb.dataset.chap=cur.ex==='mix'?'t-'+MIXT[cur.mix.k][1][0]:'t-'+cur.t;fb.appendChild(tb)}
  $('go').textContent='Дальше';$('go').hidden=false;
  if(cur.ex==='tiles')renderTiles();
  stats();
  const fresh=syncOpened();if(fresh)unlockToast(fresh);
  const id=cur;
  if(good)auto=setTimeout(()=>{if(checked&&cur===id)next()},run?600:cur.ex==='mix'?2200:1100);
}
function unlockToast(i){
  for(const t of GROUPS[i])if(on.t[t]===undefined)on.t[t]=1;save();
  toast(`<b>Открыто новое время!</b><br>${GROUPS[i].map(tName).join(', ')}`);
  renderModes();settings();
  if(typeof onUnlock==='function')onUnlock(i);
}
function toast(html){
  const el=$('toast');el.innerHTML=html;el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  clearTimeout(el._t);el._t=setTimeout(()=>{el.hidden=true},4200);
}

/* ===== modes, timer ===== */
function show(p){$('startP').hidden=p!=='start';$('resP').hidden=p!=='res';$('card').hidden=p!=='card'}
const LOCK='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
function renderModes(){
  $('tsel').hidden=!mode&&ex==='mix';
  const tf=on.tf&&tOpen(on.tf)?on.tf:'';
  $('tsel').innerHTML=`<button class="tog" data-tf="" aria-pressed="${!tf}">Микс</button>`+STOPS.map(t=>tOpen(t)
    ?`<button class="tog" data-tf="${t}" aria-pressed="${tf===t}">${tName(t)}</button>`
    :`<button class="locked" data-tf="${t}" data-lock="1">${LOCK}${tName(t)}</button>`).join('');
  $('modes').innerHTML=['tr','tiles','choose','mix'].map(k=>`<button class="tog" data-ex="${k}" aria-pressed="${!mode&&ex===k}">${EXN[k]}</button>`).join('')
    +'<span>Таймер</span>'+[1,3,5].map(n=>`<button class="tog" data-m="${n}" aria-pressed="${mode===n}">${n} мин</button>`).join('');
}
function setMode(n){
  stopRun();mode=n;renderModes();
  if(!n){$('timer').hidden=true;show('card');st={ok:0,all:0,streak:0};stats();next();return}
  $('startMin').textContent=fmt(n*60);
  $('startBest').textContent=best[n]?`Твой рекорд за ${n} мин: ${best[n]}`:'Рекорда пока нет — поставь первый!';
  show('start');
}
function startRun(){
  st={ok:0,all:0,streak:0};
  run={end:Date.now()+mode*60000,t0:Date.now(),len:mode*60};
  $('timer').hidden=false;show('card');stats();next();upd();
  tick=setInterval(upd,250);
}
function upd(){
  if(!run)return;
  const left=Math.max(0,(run.end-Date.now())/1000);
  $('tLeft').textContent=fmt(Math.ceil(left));
  const b=$('tBar');b.style.width=(left/run.len*100)+'%';b.classList.toggle('low',left<=10);
  if(left<=0)finish();
}
function stopRun(){clearInterval(tick);tick=null;run=null;clearTimeout(auto)}
function finish(){
  const len=run.len;stopRun();
  if(listening&&dict)dict.stop().catch(()=>{});
  const rec=st.ok>(best[mode]||0);if(rec){best[mode]=st.ok;save()}
  $('rOk').textContent=st.ok;
  $('rMsg').textContent=rec&&st.ok?'верных ответов — новый рекорд!':'верных ответов';
  $('rAcc').textContent=(st.all?Math.round(st.ok/st.all*100):0)+'%';
  $('rSpd').textContent=st.all?Math.round(len/st.all):'—';
  $('rBest').textContent=best[mode];
  show('res');
  if(typeof onRecord==='function'&&rec&&st.ok)onRecord();
}

/* ===== settings ===== */
function settings(){
  $('setL').innerHTML=Object.keys(L).map(k=>`<button class="tog" data-k="lang" data-v="${k}" aria-pressed="${on.lang===k}">${L[k]}</button>`).join('');
  $('setT').innerHTML=openT().map(k=>`<button class="tog" data-k="t" data-v="${k}" aria-pressed="${tOn(k)}">${tName(k)}</button>`).join('')
    +(openT().length<STOPS.length?`<p class="note" style="margin:6px 0 0;width:100%">Остальные времена открываются по очереди: ≥ 85% верных минимум на 30 ответах по предыдущему.</p>`:'');
  const sw=(v,t,d)=>`<div class="set-row"><button class="switch" data-k="opt" data-v="${v}" aria-pressed="${!!on[v]}"><span>${t}<small>${d}</small></span><i></i></button></div>`;
  $('setV').innerHTML=sw('snd','Звуки','Короткий тихий сигнал на верный и неверный ответ')+sw('vib','Вибрация','Если телефон поддерживает');
  $('setOpen').innerHTML=sw('allOpen','Открыть все времена сразу','Без очереди — для тех, кто уже знает основы');
  $('setTheme').innerHTML=[['auto','Как в системе'],['light','Светлая'],['dark','Тёмная']].map(([k,n])=>`<button class="tog" data-k="theme" data-v="${k}" aria-pressed="${(on.theme||'auto')===k}">${n}</button>`).join('');
  $('setFs').innerHTML=[[0,'Обычный'],[1,'Крупный'],[2,'Очень крупный']].map(([k,n])=>`<button class="tog" data-fs="${k}" aria-pressed="${bookFs()===k}">${n}</button>`).join('');
  $('setTeacher').innerHTML=teacherCards();
  $('setF').innerHTML=Object.keys(F).map(k=>`<button class="tog" data-k="f" data-v="${k}" aria-pressed="${!!on.f[k]}">${k} ${F[k]}</button>`).join('');
}

/* ===== progress: tenses ===== */
function renderProg(){
  const ks=STOPS.filter(t=>tOpen(t)||tStat(t)[1]),fs=Object.keys(F);
  const cls=a=>a===null?'n':a>=.85?'g':a>=.6?'a':'r';
  const cell=(ok,all,tot)=>{const a=all?ok/all:null;return `<td class="${cls(a)}${tot?' tot':''}">${a===null?'—':Math.round(a*100)+'%'}<small>${all||0}</small></td>`};
  const sum=(arr)=>arr.reduce((s,k)=>{const c=prog.cells[k]||[0,0];return[s[0]+c[0],s[1]+c[1]]},[0,0]);
  let h=`<tr><th class="rl"></th>${fs.map(f=>`<th>${f} ${F[f].slice(0,5)}.</th>`).join('')}<th>Итого</th></tr>`;
  for(const t of ks){const r=sum(fs.map(f=>t+f));h+=`<tr><th class="rl">${tName(t).replace(' Simple','').replace('Continuous','Cont.').replace('Perfect','Perf.')}</th>${fs.map(f=>{const c=prog.cells[t+f]||[0,0];return cell(c[0],c[1])}).join('')}${cell(r[0],r[1],1)}</tr>`}
  const all=sum(ks.flatMap(t=>fs.map(f=>t+f)));
  h+=`<tr><th class="rl">Итого</th>${fs.map(f=>{const r=sum(ks.map(t=>t+f));return cell(r[0],r[1],1)}).join('')}${cell(all[0],all[1],1)}</tr>`;
  $('pMx').innerHTML=h;
  const list=ks.flatMap(t=>fs.map(f=>({t,f,c:prog.cells[t+f]||[0,0]}))).filter(x=>x.c[1]>=3).map(x=>({...x,a:x.c[0]/x.c[1]}));
  const weak=list.filter(x=>x.a<.85).sort((a,b)=>a.a-b.a).slice(0,3);
  const strong=list.filter(x=>x.a>=.85).sort((a,b)=>b.a-a.a||b.c[1]-a.c[1]).slice(0,3);
  const nm=x=>`${tName(x.t)} · ${x.f} ${F[x.f]} — <b>${Math.round(x.a*100)}%</b> (${x.c[0]} из ${x.c[1]})`;
  let w='';
  if(!list.length)w='<h3>Времена: пока мало данных</h3><p class="note" style="margin:0">Ответь хотя бы на 3 задания в каждой форме — здесь появится разбор сильных и слабых мест.</p>';
  else{
    w+=weak.length?`<h3>Времена: над этим поработать</h3><ul>${weak.map(x=>`<li>${nm(x)}<br><span class="note">Формула: ${T[x.t].f[x.f]}</span></li>`).join('')}</ul>`:'<h3>Слабых мест нет — отлично!</h3>';
    if(strong.length)w+=`<h3 style="margin-top:14px">Получается хорошо</h3><ul>${strong.map(x=>`<li>${nm(x)}</li>`).join('')}</ul>`;
    const untried=ks.flatMap(t=>fs.map(f=>t+f)).filter(k=>!(prog.cells[k]&&prog.cells[k][1]>=3)).length;
    if(untried)w+=`<p class="note">Ещё ${untried} из ${ks.length*3} сочетаний без достаточной статистики (нужно от 3 ответов).</p>`;
  }
  $('pWeak').innerHTML=w;
  const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push([d,prog.days[dkey(d)]||[0,0]])}
  const mx=Math.max(1,...days.map(x=>x[1][1]));
  const wd=['вс','пн','вт','ср','чт','пт','сб'];
  $('pDays').innerHTML=days.map(([d,c])=>`<div class="day"><span>${wd[d.getDay()]} ${d.getDate()}</span><div class="tr"><i class="o" style="width:${c[0]/mx*100}%"></i><i class="x" style="width:${(c[1]-c[0])/mx*100}%"></i></div><b>${c[1]?Math.round(c[0]/c[1]*100)+'%':'—'}</b></div>`).join('');
  const ms=X.mixS||{},mt=Object.keys(MIXT);
  $('pMix').innerHTML=mt.map(k=>{const c=ms[k]||[0,0],p=c[1]?Math.round(c[0]/c[1]*100):null;return `<div class="ar plain"><div class="top2"><span>${MIXT[k][0]}</span><b>${p===null?'—':p+'% · '+c[1]}</b></div><div class="tr"><i class="o" style="width:${c[1]?c[0]/c[1]*100:0}%"></i><i class="x" style="width:${c[1]?(c[1]-c[0])/c[1]*100:0}%"></i></div></div>`}).join('')+`<div class="row"><button class="main" data-ex="mix" data-gotrain="1">Тренировать смешанные времена</button></div>`;
  renderArtProg();renderWordsProg();if(typeof renderWordDays==='function')renderWordDays();
  $('pFocus').textContent=on.focus?'Слабые места: включено':'Тренировать слабые места';
  $('pFocus').classList.toggle('main',!on.focus);
  if(typeof renderGameProg==='function')renderGameProg();
}
const dkey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

/* ===== events ===== */
document.addEventListener('click',e=>{
  const tab=e.target.closest('.nav button');
  if(tab){showTab(tab.dataset.v);return}
  const mb=e.target.closest('[data-m]');if(mb){setMode(+mb.dataset.m);return}
  const eb=e.target.closest('button[data-ex]');if(eb){ex=eb.dataset.ex;on.ex=ex;save();if(eb.dataset.gotrain){if(sec!=='tense')setSec('tense');showTab('train');window.scrollTo({top:0})}setMode(0);return}
  const tf=e.target.closest('[data-tf]');if(tf){
    if(tf.dataset.lock){openChapter('t-'+tf.dataset.tf);return}
    on.tf=tf.dataset.tf||null;save();renderModes();if(!run)next();return}
  const tr=e.target.closest('[data-trt]');if(tr){on.tf=tr.dataset.trt;if(ex==='mix'){ex='tr';on.ex='tr'}save();if(sec!=='tense')setSec('tense');showTab('train');setMode(0);window.scrollTo({top:0});return}
  const ch=e.target.closest('[data-ch]');if(ch){chooseAnswer(ch.dataset.ch);return}
  const tp=e.target.closest('[data-tp]');if(tp){if(checked)return;const i=+tp.dataset.tp;if(cur.tiles[i].used)return;cur.tiles[i].used=true;cur.line.push(i);renderTiles();return}
  const tl=e.target.closest('[data-tl]');if(tl){if(checked)return;const j=+tl.dataset.tl;const i=cur.line[j];cur.line.splice(j,1);cur.tiles[i].used=false;renderTiles();return}
  const b=e.target.closest('[data-k]');if(!b)return;
  const k=b.dataset.k,v=b.dataset.v;
  if(k==='lang')on.lang=v;
  else if(k==='opt'){on[v]=on[v]?0:1;save();settings();if(v==='snd'&&on.snd)tone(true);if(v==='vib'&&on.vib)buzz(true);if(v==='allOpen'){renderModes();X.mapPos=null;saveX()}return}
  else if(k==='theme'){on.theme=v;applyTheme();save();settings();return}
  else if(k==='t'){const c=tOn(v);if(c&&openT().filter(tOn).length===1)return;on.t[v]=c?0:1}
  else{if(on[k][v]&&Object.values(on[k]).filter(Boolean).length===1)return;on[k][v]=on[k][v]?0:1}
  save();settings();if(!run&&mode===0)next();
});
$('go').addEventListener('click',check);
$('tClear').addEventListener('click',()=>{if(checked||!cur.tiles)return;cur.line=[];cur.tiles.forEach(t=>t.used=false);renderTiles()});
$('skip').addEventListener('click',()=>{if(!checked&&run){st.all++}st.streak=0;stats();next()});
$('hintBtn').addEventListener('click',()=>$('hint').classList.toggle('on'));
$('ans').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check()}});
$('startBtn').addEventListener('click',startRun);
$('again').addEventListener('click',()=>{show('start');startRun()});
$('toFree').addEventListener('click',()=>setMode(0));
$('reset').addEventListener('click',()=>{best={streak:0,1:0,3:0,5:0};save();stats();$('reset').textContent='Сброшено'});
