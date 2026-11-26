/* ===== words: daily plan (reviews → new words in blocks of 10) + free practice ===== */
let wTheme=null,wLevel=null,wCur=null,wDone=false,wLast=null,wAuto=null,wSes={ok:0,all:0};
let wMode=on.wMode==='free'?'free':'day';
const lvlOf=w=>{const s=WS.W[w.k];return s?s.b:0};
const dots=b=>`<span class="lvl" title="Знание слова">${[1,2,3,4,5].map(i=>`<i class="${i<=b?'on':''}"></i>`).join('')}</span>`;
const GOALS=[10,20,30,50,100];
const wGoal=()=>GOALS.includes(+on.wGoal)?+on.wGoal:30;

/* extra state lives in its own key so the old ones keep their format */
let X={wd:{},daily:{}};
try{const x=JSON.parse(localStorage.getItem('tenses3x')||'null');if(x&&typeof x==='object')X=Object.assign(X,x)}catch(e){}
const saveX=()=>{try{localStorage.setItem('tenses3x',JSON.stringify(X))}catch(e){}};
const dayN=(d=new Date())=>Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);
const IVD=[0,1,1,3,7,14,30,60];
const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
/* words learned before this version have no day schedule: spread them out instead of flooding today */
function dueOf(k){const d=X.wd[k];if(d)return d[1];const s=WS.W[k];if(!s)return Infinity;const b=Math.min(s.b,6);return b<4?dayN():dayN()+hash(k)%Math.max(1,IVD[b])}
function dayRec(){const d=today();return X.daily[d]||(X.daily[d]={n:0,r:0,ok:0,all:0})}
function pruneDaily(){const ks=Object.keys(X.daily).sort();while(ks.length>120)delete X.daily[ks.shift()]}

const wByK=k=>allWords().find(w=>w.k===k);
let WMAP=null;const wGet=k=>{if(!WMAP||WMAP.size!==allWords().length){WMAP=new Map(allWords().map(w=>[w.k,w]))}return WMAP.get(k)};
const bare=en=>en.replace(/\s*\(.*?\)/g,'').trim();
function gapOf(w){
  if(!w.ex)return null;const word=bare(w.en);const stem=word.length>4?word.replace(/e$/,''):word;
  const re=new RegExp('\\b'+stem.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"[a-z']*",'i');const m=w.ex.match(re);
  return m?{pre:w.ex.slice(0,m.index),hit:m[0],post:w.ex.slice(m.index+m[0].length)}:null;
}
function dueList(){
  const t=dayN();const out=[];
  for(const k in WS.W){if(D.seen.has(k))continue;const w=wGet(k);if(!w)continue;const d=dueOf(k);if(d<=t)out.push([k,d,WS.W[k].b])}
  out.sort((a,b)=>a[1]-b[1]||a[2]-b[2]);return out.map(x=>x[0]);
}
function newPool(){
  const own=allWords().filter(w=>w.lv===OWNTH&&!WS.W[w.k]);
  const base=WD.filter(w=>!WS.W[w.k]);
  return own.concat(base).filter(w=>!D.introduced.has(w.k));
}

/* session state for the daily plan */
const D={block:[],introIdx:0,test:[],retry:[],seen:new Set(),introduced:new Set(),skipRev:false,extra:0,blockOk:0,blockAll:0};
const TYPES={tr:'Выбери перевод',en:'Выбери английское слово',write:'Напиши слово',audio:'Выбери на слух',gap:'Вставь слово'};
function typeFor(w,isNew){
  const t=['tr','en','audio'];if(gapOf(w))t.push('gap');if(!isNew)t.push('write','write');
  return pick(t);
}
function dayStats(){
  const r=dayRec(),g=wGoal()+D.extra,due=dueList().length;
  $('wDay').innerHTML=`<div class="dstat"><b>${r.n}</b><span>/${g} новых</span></div><div class="dstat"><b>${r.r}</b><span>повторено</span></div><div class="dstat"><b>${due}</b><span>ждут повтора</span></div>
   <div class="dbar"><i style="width:${Math.min(100,r.n/g*100)}%"></i></div>`;
  $('wWarn').hidden=!(due>200&&wGoal()>10);
  if(!$('wWarn').hidden)$('wWarnT').textContent=`Повторений накопилось ${due}. Может, уменьшить число новых слов в день, чтобы успевать?`;
}
function wModes(){
  $('wModes').innerHTML=`<button class="tog" data-wm="day" aria-pressed="${wMode==='day'}">План дня</button><button class="tog" data-wm="free" aria-pressed="${wMode==='free'}">Свободная практика</button>`;
  $('wDay').hidden=wMode!=='day';if(wMode!=='day')$('wWarn').hidden=true;
}
function wNext(){
  clearTimeout(wAuto);stopSay();wModes();
  if(lessonGate('words'))return;
  $('wDoneP').hidden=true;$('wcard').hidden=false;
  {const f=gameForce('word');if(f){const w=wGet(f.k||f);if(w){$('wFlt').hidden=true;showTask(w,f.type||'tr','free');return}}}
  if(wMode==='day'){dayNext();return}
  $('wFlt').hidden=!wLevel;if(wLevel)$('wFltT').textContent=(wLevel===OWNTH?OWNTH:wLevel+' ('+LVC(wLevel)+')')+(wTheme&&wTheme!==OWNTH?' · '+wTheme:'');
  const w=wPick();
  if(!w){showWordsEmpty();return}
  const isNew=!WS.W[w.k];
  showTask(w,isNew?'tr':typeFor(w,false),'free');
}
function showWordsEmpty(){$('wQ').textContent='Здесь пока нет слов';$('wOpts').innerHTML='';$('wSub').textContent='';$('wTask').innerHTML='';$('wEx').innerHTML='';$('wField').hidden=true;$('wWriteRow').hidden=true}
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
function tickRetry(){for(const r of D.retry)r.wait--}
function dayNext(){
  $('wFlt').hidden=true;dayStats();
  const ready=D.retry.findIndex(r=>r.wait<=0);
  if(ready>=0){const r=D.retry.splice(ready,1)[0];const w=wGet(r.k);if(w){tickRetry();return showTask(w,r.type,r.phase)}}
  if(D.block.length&&D.introIdx<D.block.length){const w=D.block[D.introIdx++];return showIntro(w)}
  if(D.test.length){const t=D.test.shift();tickRetry();return showTask(t.w,t.type,'new')}
  if(D.block.length&&!D.retry.some(r=>r.phase==='new')){
    const n=D.block.length;D.block=[];
    toast(`<b>Блок пройден!</b><br>${D.blockOk} из ${D.blockAll} с первой попытки`);
  }
  const due=D.skipRev?[]:dueList();
  if(due.length){const w=wGet(due[0]);D.seen.add(w.k);tickRetry();return showTask(w,typeFor(w,false),'rev')}
  const r=dayRec(),left=wGoal()+D.extra-r.n;
  if(left>0){
    const pool=newPool().slice(0,Math.min(10,left));
    if(pool.length){
      D.block=pool;D.introIdx=0;D.blockOk=0;D.blockAll=0;
      D.test=shuf(pool).map(w=>({w,type:typeFor(w,true)}));
      const w=D.block[D.introIdx++];return showIntro(w);
    }
  }
  if(D.retry.length){const r=D.retry.shift();const w=wGet(r.k);if(w)return showTask(w,r.type,r.phase)}
  showDone();
}
function showDone(){
  const r=dayRec();
  $('wcard').hidden=true;$('wDoneP').hidden=false;
  $('wDoneT').innerHTML=`Новых слов: <b>${r.n}</b> · повторено: <b>${r.r}</b> · верно ${r.all?Math.round(r.ok/r.all*100):0}%`;
  if(typeof onWordsDone==='function')onWordsDone();
}
function chipLang(lang){return `<span class="chip lang">${lang==='ru'?'RU':'UZ'}</span>`}
function wLang(w){return w.lv===OWNTH?'ru':on.lang==='mix'?pick(['ru','uz']):on.lang}
function showIntro(w){
  wCur={w,type:'intro',phase:'intro'};wDone=true;
  if(!D.introduced.has(w.k)){D.introduced.add(w.k);dayRec().n++;saveX()}
  $('wTask').innerHTML=`<span class="chip f plus">Новое слово ${D.introIdx}/${D.block.length}</span><span class="chip">${w.lv===OWNTH?esc(OWNTH):esc(LVC(w.lv)+' · '+w.th)}</span>`;
  const q=$('wQ');q.innerHTML='';const t=document.createElement('span');t.textContent=bare(w.en);q.appendChild(t);
  const b=document.createElement('button');b.innerHTML=SPK;b.setAttribute('aria-label','Произношение');b.addEventListener('click',()=>say(bare(w.en)));q.appendChild(b);
  $('wSub').innerHTML=w.lv===OWNTH?`<b class="tr1">${esc(w.ru)}</b>`:`<b class="tr1">${esc(w.ru)}</b><span class="tr2">${esc(w.uz)}</span>`;
  $('wEx').innerHTML=w.ex?`<button class="exs" data-say="${esc(w.ex)}">${SPK}<span>${exHTML(w)}</span></button>`:'';
  $('wOpts').innerHTML='';$('wField').hidden=true;$('wWriteRow').hidden=true;
  $('wFb').className='fb';$('wFb').innerHTML='';
  $('wNextB').hidden=false;$('wNextB').textContent=D.introIdx<D.block.length?'Следующее слово':'Проверим себя';
  enter($('wcard'));dayStats();onActivity('new');
  if(on.voice)say(bare(w.en));
}
function exHTML(w){const g=gapOf(w);return g?esc(g.pre)+'<b>'+esc(g.hit)+'</b>'+esc(g.post):esc(w.ex)}
function showTask(w,type,phase){
  const all=allWords(),lang=wLang(w),isNew=!WS.W[w.k];
  if(type==='gap'&&!gapOf(w))type='tr';
  if(type==='write'&&w.lv===OWNTH&&/[^a-z' -]/i.test(bare(w.en)))type='en';
  const key=type==='tr'?(x=>x[lang]):(x=>bare(x.en));
  const right=key(w);
  const cand=shuf(all.filter(x=>x.k!==w.k&&x.lv===w.lv&&x.th===w.th)).concat(shuf(all.filter(x=>x.lv===w.lv&&x.th!==w.th)).slice(0,30),shuf(all.filter(x=>x.lv!==w.lv)).slice(0,30));
  const opts=[right];for(const c of cand){const t=key(c);if(t&&!opts.includes(t))opts.push(t);if(opts.length===4)break}
  wCur={w,lang,type,phase,right,opts:shuf(opts)};wLast=w.k;wDone=false;
  const ph=phase==='rev'?'<span class="chip">Повтор</span>':phase==='new'?'<span class="chip f plus">Мини-тест</span>':'';
  $('wTask').innerHTML=`${type==='tr'||type==='en'||type==='write'?chipLang(lang):''}${ph}<span class="chip">${w.lv===OWNTH?esc(OWNTH):esc(LVC(w.lv)+' · '+w.th)}</span>${isNew?'':`<span class="chip">${dots(lvlOf(w))}</span>`}`;
  const q=$('wQ');q.innerHTML='';
  const addSpk=(txt)=>{const b=document.createElement('button');b.innerHTML=SPK;b.setAttribute('aria-label','Произношение');b.addEventListener('click',()=>say(txt));q.appendChild(b)};
  $('wEx').innerHTML='';
  if(type==='tr'){const t=document.createElement('span');t.textContent=bare(w.en);q.appendChild(t);addSpk(bare(w.en))}
  else if(type==='en'||type==='write'){const t=document.createElement('span');t.className='wq-tr';t.textContent=w[lang];q.appendChild(t)}
  else if(type==='audio'){const b=document.createElement('button');b.className='bigspk';b.innerHTML=SPK+'<span>Послушать ещё</span>';b.addEventListener('click',()=>say(bare(w.en)));q.appendChild(b)}
  else if(type==='gap'){const g=gapOf(w);$('wEx').innerHTML=`<p class="gapq">${esc(g.pre)}<span class="gap">?</span>${esc(g.post)}</p><p class="mk" style="margin:4px 0 0">${esc(w[lang])}</p>`}
  $('wSub').textContent=TYPES[type]+(type==='tr'&&lang==='uz'?' · Tarjimasini tanlang':'');
  const write=type==='write';
  $('wOpts').innerHTML=write?'':wCur.opts.map((o,i)=>`<button data-wi="${i}">${esc(o)}</button>`).join('');
  $('wField').hidden=!write;$('wWriteRow').hidden=!write;
  if(write){const i=$('wIn');i.value='';i.disabled=false;i.focus({preventScroll:true})}
  $('wFb').className='fb';$('wFb').innerHTML='';$('wNextB').hidden=true;$('wNextB').textContent='Дальше';
  enter($('wcard'));
  if(type==='audio'||(type==='tr'&&on.voice))say(bare(w.en));
}
function lev(a,b){if(Math.abs(a.length-b.length)>1)return 2;const m=[];for(let i=0;i<=a.length;i++){m[i]=[i];for(let j=1;j<=b.length;j++)m[i][j]=i?Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1)):j}return m[a.length][b.length]}
const wnorm=s=>s.toLowerCase().replace(/[’`‘ʻʼ]/g,"'").replace(/^to /,'').replace(/[^a-z0-9' -]/g,'').replace(/\s+/g,' ').trim();
function wWrite(skip){
  if(wDone||!wCur||wCur.type!=='write')return;
  const u=skip?'':$('wIn').value;if(!skip&&!u.trim()){$('wIn').focus();return}
  const a=wnorm(u),b=wnorm(bare(wCur.w.en));
  const exact=a===b,typo=!exact&&b.length>=5&&lev(a,b)===1;
  wAnswer(null,exact||typo,typo);
}
function wAnswer(i,forced,typo){
  if(wDone||!wCur||wCur.type==='intro')return;wDone=true;
  const {w}=wCur,good=forced!==undefined?forced:wCur.opts[i]===wCur.right,first=!WS.W[w.k];
  WS.wc++;const s=WS.W[w.k]||{b:0,n:0};
  if(good){s.b=first?2:Math.min(s.b+1,6);s.n=WS.wc+IV[s.b]}else{s.b=1;s.n=WS.wc+2}
  WS.W[w.k]=s;WS.all++;if(good)WS.ok++;saveW();
  const t=dayN();X.wd[w.k]=[t,good?t+IVD[Math.min(s.b,7)]:t+1];
  const r=dayRec();r.all++;if(good)r.ok++;if(wCur.phase==='rev'&&!D.seen.has('r:'+w.k)){r.r++;D.seen.add('r:'+w.k)}
  if(wCur.phase==='new'){D.blockAll++;if(good)D.blockOk++}
  pruneDaily();saveX();
  const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;saveProg();
  wSes.all++;if(good)wSes.ok++;wStats();feedback($('wcard'),good);
  if(!good&&wMode==='day'&&wCur.phase!=='free'){const alt=['tr','en','audio'].filter(x=>x!==wCur.type);D.retry.push({k:w.k,type:pick(alt),phase:wCur.phase==='rev'?'rev':'new',wait:3+Math.floor(Math.random()*3)})}
  onAnswer(good,{kind:'word',k:w.k,type:wCur.type,phase:wCur.phase});
  if(wCur.type==='write'){$('wIn').disabled=true;$('wWriteRow').hidden=true}
  document.querySelectorAll('#wOpts button').forEach((b,j)=>{b.disabled=true;if(wCur.opts[j]===wCur.right)b.className='ok';else if(j===i)b.className='no'});
  if(wCur.type==='gap'){const g=gapOf(w);$('wEx').querySelector('.gap').outerHTML=`<span class="gap ${good?'ok':'no'}">${esc(g.hit)}</span>`}
  const fb=$('wFb');fb.className='fb '+(good?'ok':'no');fb.innerHTML='';
  const h=document.createElement('b');h.textContent=good?(typo?'Верно, но с опечаткой:':'Верно!'):'Запомни:';fb.appendChild(h);
  const a=document.createElement('div');a.className='ans';a.textContent=bare(w.en);fb.appendChild(a);
  const tr=document.createElement('div');tr.textContent=w.lv===OWNTH?w.ru:`${w.ru}  ·  ${w.uz}`;fb.appendChild(tr);
  if(w.ex&&wCur.type!=='gap'){const e=document.createElement('div');e.className='exl';e.textContent=w.ex;fb.appendChild(e)}
  const lv=document.createElement('div');lv.style.marginTop='6px';lv.innerHTML=`Знание: ${dots(Math.min(s.b,5))}${s.b>=4?' <b style="display:inline">выучено</b>':''}`;fb.appendChild(lv);
  const sb=document.createElement('button');sb.className='say';sb.innerHTML=SPK+'<span>Послушать</span>';sb.addEventListener('click',()=>{clearTimeout(wAuto);say(bare(w.en))});fb.appendChild(sb);
  $('wNextB').hidden=false;
  if(wMode==='day')dayStats();
  const id=wCur;
  if(on.voice&&wCur.type!=='audio'){const p=say(bare(w.en));if(good)p.then(()=>{if(wDone&&wCur===id)wAuto=setTimeout(()=>{if(wDone&&wCur===id)wNext()},350)})}
  else if(good)wAuto=setTimeout(()=>{if(wDone&&wCur===id)wNext()},900);
}
function wStats(){
  $('wOk').textContent=wSes.ok;$('wAll').textContent=wSes.all;
  $('wLearned').textContent=allWords().filter(w=>lvlOf(w)>=4).length;
}
/* words per day chart (progress tab) */
function renderWordDays(){
  const days=[];for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push([d,X.daily[dkey(d)]||{n:0,r:0}])}
  const mx=Math.max(5,...days.map(x=>x[1].n+x[1].r));
  $('pWDays').innerHTML=`<div class="wchart" role="img" aria-label="Слова по дням за 2 недели">${days.map(([d,c])=>`<div class="wcol" title="${d.getDate()}.${d.getMonth()+1}: новых ${c.n}, повторено ${c.r}"><div class="wstack"><i class="r" style="height:${c.r/mx*100}%"></i><i class="n" style="height:${c.n/mx*100}%"></i></div><span>${d.getDate()}</span></div>`).join('')}</div>
  <div class="legend"><span><i class="n"></i>новые</span><span><i class="r"></i>повторено</span><span>Сегодня: ${dayRec().n} новых, ${dayRec().r} повторено</span></div>`;
}
function wSettings(){
  $('setWG').innerHTML=GOALS.map(g=>`<button class="tog" data-wg="${g}" aria-pressed="${wGoal()===g}">${g}</button>`).join('');
}
$('wOpts').addEventListener('click',e=>{const b=e.target.closest('[data-wi]');if(b)wAnswer(+b.dataset.wi)});
$('wNextB').addEventListener('click',wNext);
$('wGo').addEventListener('click',()=>wWrite(false));
$('wSkip').addEventListener('click',()=>wWrite(true));
$('wIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(wDone)wNext();else wWrite(false)}});
$('wFltX').addEventListener('click',()=>{wTheme=null;wLevel=null;wNext()});
$('wMore').addEventListener('click',()=>{D.extra+=10;wNext()});
$('wFree').addEventListener('click',()=>{wMode='free';on.wMode='free';save();wNext()});
$('wWarnB').addEventListener('click',()=>{on.wGoal=10;save();wSettings();dayStats()});
$('wSkipRev').addEventListener('click',()=>{D.skipRev=true;wNext()});
document.addEventListener('click',e=>{
  const m=e.target.closest('[data-wm]');if(m){wMode=m.dataset.wm;on.wMode=wMode;save();if(wMode==='day'){wLevel=null;wTheme=null}wNext();return}
  const g=e.target.closest('[data-wg]');if(g){on.wGoal=+g.dataset.wg;save();wSettings();if(sec==='words')dayStats();return}
  const s=e.target.closest('[data-say]');if(s){say(s.dataset.say);return}
});
document.addEventListener('keydown',e=>{
  if($('v-words').hidden||e.target.closest('input,textarea'))return;
  if(['1','2','3','4'].includes(e.key)&&wCur&&wCur.opts&&!wDone){wAnswer(+e.key-1);e.preventDefault()}
  else if(e.key==='Enter'&&wDone){wNext();e.preventDefault()}
});
