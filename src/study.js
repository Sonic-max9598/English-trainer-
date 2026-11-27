/* ===== study sets (Quizlet-style): flashcards, learn, test, match; my own sets with dictionaryapi.dev ===== */
X.sets=Array.isArray(X.sets)?X.sets:[];X.matchBest=X.matchBest||{};
const ST={src:null,title:'',words:[],mode:'cards',mix:false,i:0,flip:false,learn:null,test:null,match:null};
const dictLink=w=>`https://dictionary.cambridge.org/dictionary/${UI==='ru'?'english-russian':'english'}/${encodeURIComponent(bare(w).toLowerCase())}`;
const setWord=(s,x)=>({k:'set:'+s.id+':'+x.en.toLowerCase(),en:x.en,ru:x.tr||'',uz:x.tr||'',def:x.def||'',ex:x.ex||'',lv:'set',th:s.name,set:s.id,ref:x});
const setWords=s=>s.words.map(x=>setWord(s,x));
const known=w=>w.ref?(w.ref.b||0)>=3:lvlOf(w)>=4;
function recordStudy(w,good){
  if(w.ref){const r=w.ref;r.b=good?Math.min((r.b||0)+1,5):0;saveX()}
  else{WS.wc++;const s=WS.W[w.k]||{b:0,n:0};if(good){s.b=Math.min(s.b+1,6);s.n=WS.wc+IV[Math.min(s.b,6)]}else{s.b=1;s.n=WS.wc+2}WS.W[w.k]=s;WS.all++;if(good)WS.ok++;saveW();
    const t=dayN();X.wd[w.k]=[t,good?t+IVD[Math.min(s.b,7)]:t+1];saveX()}
  const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;saveProg();
  onAnswer(good,{kind:'study',id:w.k});
}
const trOf=w=>trw(w)||w.def||'—';
/* ---------- open a list of words for study ---------- */
function openStudy(title,words,src){
  if(!words.length){toast('<b>В этом наборе пока нет слов</b>');return}
  ST.src=src;ST.title=title;ST.words=words.slice(0,400);ST.i=0;ST.flip=false;ST.learn=null;ST.test=null;ST.match=null;
  wList=false;wView='study';showTab('train');renderStudy();window.scrollTo({top:0});
}
function order(a){return ST.mix?shuf(a):a.slice()}
function renderStudy(){
  $('sTitle').textContent=ST.title;
  const L=ST.words.filter(known).length;
  $('sMeta').textContent=`${ST.words.length} слов · выучено ${L}`;
  $('sModes').innerHTML=[['cards','Карточки'],['learn','Заучивание'],['test','Тест'],['match','Найди пару']].map(([k,n])=>`<button class="tog" data-sm="${k}" aria-pressed="${ST.mode===k}">${n}</button>`).join('')
    +`<button class="switch sm" data-smix aria-pressed="${ST.mix}"><span>Вперемешку</span><i></i></button>`;
  ({cards:renderCards,learn:renderLearn,test:renderTest,match:renderMatch})[ST.mode]();
}
/* ---------- flashcards ---------- */
function renderCards(){
  if(!ST.order||ST.order.length!==ST.words.length)ST.order=order(ST.words);
  const w=ST.order[ST.i%ST.order.length];
  $('sBody').innerHTML=`<div class="flash${ST.flip?' on':''}" id="flash" role="button" tabindex="0" aria-label="Перевернуть карточку">
     <div class="fface ffront"><b lang="en">${esc(bare(w.en))}</b>${known(w)?'<small class="kn">выучено</small>':''}<small>Нажми, чтобы перевернуть</small></div>
     <div class="fface fback"><b class="fword" lang="en">${esc(bare(w.en))}</b>${w.def?`<p class="wdef" lang="en" data-noi18n>${esc(w.def)}</p>`:''}${w.ex?`<p class="wex" lang="en" data-noi18n>${esc(w.ex)}</p>`:''}<p class="ftr">${esc(trOf(w))}</p></div></div>
   <div class="fnav"><button data-fc="prev" aria-label="Назад">←</button><span>${ST.i%ST.order.length+1} / ${ST.order.length}</span><button data-fc="next" aria-label="Дальше">→</button></div>
   <div class="row"><button data-fc="again">Ещё учу</button><button class="main" data-fc="know">Знаю</button></div>
   <p class="note"><a href="${dictLink(w.en)}" target="_blank" rel="noopener">Открыть в Cambridge</a></p>`;
}
/* ---------- learn: multiple choice first, then writing; each word needs both ---------- */
function learnInit(){const q=order(ST.words).slice(0,Math.min(ST.words.length,20)).map(w=>({w,st:0}));ST.learn={q,done:0,total:q.length,cur:null,answered:false}}
function renderLearn(){
  if(!ST.learn)learnInit();const S=ST.learn;
  if(!S.q.length){$('sBody').innerHTML=`<div class="card big"><div class="num">${S.total}/${S.total}</div><p><b>Все слова освоены!</b></p><div class="row" style="justify-content:center"><button class="main" data-learn-again>Ещё раунд</button></div></div>`;return}
  const it=S.q[0];S.cur=it;S.answered=false;const w=it.w;
  const bar=`<div class="sbar"><i style="width:${S.done/S.total*100}%"></i></div><p class="mk">Освоено ${S.done} из ${S.total}</p>`;
  if(it.st===0){
    const opts=shuf([w].concat(shuf(ST.words.filter(x=>x!==w&&trOf(x)!==trOf(w))).slice(0,3)));it.opts=opts;
    $('sBody').innerHTML=bar+`<div class="card" id="scard"><p class="mk">Выбери перевод</p><div class="wq"><span lang="en">${esc(bare(w.en))}</span></div>${w.def?`<p class="wdef" lang="en" data-noi18n>${esc(w.def)}</p>`:''}<div class="wopts">${opts.map((o,i)=>`<button data-lo="${i}">${esc(trOf(o))}</button>`).join('')}</div><div class="fb" id="sFb"></div></div>`;
  }else{
    $('sBody').innerHTML=bar+`<div class="card" id="scard"><p class="mk">Напиши по-английски</p><div class="wq"><span class="wq-tr">${esc(trOf(w))}</span></div>${w.def?`<p class="wdef" lang="en" data-noi18n>${esc(w.def)}</p>`:''}
      <div class="field"><input id="sIn" lang="en" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="Слово по-английски…"></div>
      <div class="row"><button class="main" id="sGo">Проверить</button><button id="sDunno">Не знаю</button></div><div class="fb" id="sFb"></div></div>`;
    setTimeout(()=>{const i=$('sIn');if(i)i.focus({preventScroll:true})},30);
  }
}
function learnAnswer(good,shownRight){
  const S=ST.learn,it=S.cur;if(S.answered)return;S.answered=true;recordStudy(it.w,good);feedback($('scard'),good);
  const fb=$('sFb');fb.className='fb '+(good?'ok':'no');fb.innerHTML=`<b>${good?'Верно!':'Правильно так:'}</b><div class="ans" lang="en">${esc(bare(it.w.en))}</div><div>${esc(trOf(it.w))}</div><div class="row"><button class="main" data-learn-next>Дальше</button></div>`;
  S.q.shift();
  if(good){if(it.st===0){it.st=1;S.q.splice(Math.min(S.q.length,2+Math.floor(Math.random()*3)),0,it)}else S.done++}
  else{it.st=0;S.q.splice(Math.min(S.q.length,3),0,it)}
  if(good)setTimeout(()=>{if(ST.mode==='learn'&&S.answered&&S.cur===it)renderLearn()},900);
}
/* ---------- test: mixed questions, result at the end ---------- */
function testInit(){
  const ws=order(ST.words).slice(0,Math.min(15,ST.words.length));
  ST.test={qs:ws.map((w,i)=>{const t=['mc','tf','write'][i%3];const q={w,t};if(t==='mc')q.opts=shuf([w].concat(shuf(ST.words.filter(x=>x!==w)).slice(0,3)));if(t==='tf'){q.truth=Math.random()<.5;q.shown=q.truth?w:pick(ST.words.filter(x=>x!==w))||w;if(q.shown===w)q.truth=true}return q}),i:0,ok:0,miss:[]};
}
function renderTest(){
  if(!ST.test)testInit();const T2=ST.test;
  if(T2.i>=T2.qs.length){$('sBody').innerHTML=`<div class="card big"><p>Результат теста</p><div class="num">${T2.ok} / ${T2.qs.length}</div>${T2.miss.length?`<div class="lsmist"><h3>Ошибки</h3><ul>${T2.miss.map(w=>`<li><b lang="en">${esc(bare(w.en))}</b> — ${esc(trOf(w))}</li>`).join('')}</ul></div>`:'<p>Без единой ошибки!</p>'}<div class="row" style="justify-content:center"><button class="main" data-test-again>Новый тест</button></div></div>`;if(T2.ok===T2.qs.length)celebrate();return}
  const q=T2.qs[T2.i],w=q.w,head=`<p class="mk">Вопрос ${T2.i+1} из ${T2.qs.length}</p>`;
  if(q.t==='mc')$('sBody').innerHTML=`<div class="card" id="scard">${head}<div class="wq"><span lang="en">${esc(bare(w.en))}</span></div><div class="wopts">${q.opts.map((o,i)=>`<button data-to="${i}">${esc(trOf(o))}</button>`).join('')}</div><div class="fb" id="sFb"></div></div>`;
  else if(q.t==='tf')$('sBody').innerHTML=`<div class="card" id="scard">${head}<p class="mk">Верно ли перевод?</p><div class="wq"><span lang="en">${esc(bare(w.en))}</span></div><p class="tfq">${esc(trOf(q.shown))}</p><div class="wopts"><button data-tt="1">Верно</button><button data-tt="0">Неверно</button></div><div class="fb" id="sFb"></div></div>`;
  else{$('sBody').innerHTML=`<div class="card" id="scard">${head}<p class="mk">Напиши по-английски</p><div class="wq"><span class="wq-tr">${esc(trOf(w))}</span></div><div class="field"><input id="sIn" lang="en" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="Слово по-английски…"></div><div class="row"><button class="main" id="sGo">Проверить</button><button id="sDunno">Не знаю</button></div><div class="fb" id="sFb"></div></div>`;setTimeout(()=>{const i=$('sIn');if(i)i.focus({preventScroll:true})},30)}
}
function testAnswer(good){
  const T2=ST.test,q=T2.qs[T2.i];if(q.done)return;q.done=1;recordStudy(q.w,good);feedback($('scard'),good);
  if(good)T2.ok++;else T2.miss.push(q.w);
  const fb=$('sFb');fb.className='fb '+(good?'ok':'no');fb.innerHTML=`<b>${good?'Верно!':'Правильно так:'}</b><div class="ans" lang="en">${esc(bare(q.w.en))}</div><div>${esc(trOf(q.w))}</div><div class="row"><button class="main" data-test-next>Дальше</button></div>`;
  if(good)setTimeout(()=>{if(ST.mode==='test'&&T2.qs[T2.i]===q){T2.i++;renderTest()}},800);
}
/* ---------- match: tap a word and its translation, against the clock ---------- */
function matchInit(){const ws=order(ST.words).slice(0,6);const tiles=shuf(ws.flatMap((w,i)=>[{i,t:bare(w.en),en:1},{i,t:trOf(w)}]));ST.match={ws,tiles,sel:null,left:ws.length,t0:Date.now(),miss:0}}
function renderMatch(){
  if(!ST.match)matchInit();const M=ST.match;const key=ST.src||'x';
  if(!M.left){const sec=((M.end-M.t0)/1000+M.miss).toFixed(1),best=X.matchBest[key];const rec=!best||+sec<best;if(rec){X.matchBest[key]=+sec;saveX();celebrate()}
    $('sBody').innerHTML=`<div class="card big"><p>Все пары найдены</p><div class="num">${sec} с</div><p>${rec?'Новый рекорд!':'Рекорд: '+best+' с'}${M.miss?` · штраф +${M.miss} с за ошибки`:''}</p><div class="row" style="justify-content:center"><button class="main" data-match-again>Ещё раз</button></div></div>`;return}
  $('sBody').innerHTML=`<p class="mk">Найди пары: слово и его перевод. За ошибку +1 секунда.</p><div class="mgrid">${M.tiles.map((x,j)=>x.gone?'<span class="mt gone"></span>':`<button class="mt${M.sel===j?' sel':''}" data-mt="${j}" ${x.en?'lang="en"':''}>${esc(x.t)}</button>`).join('')}</div>`;
}
function matchTap(j){
  const M=ST.match;const x=M.tiles[j];if(!x||x.gone)return;
  if(M.sel===null||M.sel===j){M.sel=M.sel===j?null:j;renderMatch();return}
  const y=M.tiles[M.sel];
  if(y.i===x.i&&!!y.en!==!!x.en){x.gone=y.gone=1;M.left--;M.sel=null;recordStudy(M.ws[x.i],true);if(!M.left)M.end=Date.now();renderMatch()}
  else{M.miss++;const a=document.querySelector(`[data-mt="${j}"]`),b=document.querySelector(`[data-mt="${M.sel}"]`);[a,b].forEach(e=>e&&e.classList.add('bad'));tone(false);buzz(false);M.sel=null;setTimeout(renderMatch,350)}
}
function checkWrite(){
  const i=$('sIn');if(!i)return;const u=i.value;if(!u.trim()){i.focus();return}
  const w=ST.mode==='learn'?ST.learn.cur.w:ST.test.qs[ST.test.i].w;
  const a=wnorm(u),b=wnorm(bare(w.en));const good=a===b||(b.length>=5&&lev(a,b)===1);
  if(ST.mode==='learn')learnAnswer(good);else testAnswer(good);
}
/* ---------- my sets ---------- */
let curSet=null;
function renderSets(){
  wView='sets';
  const lv=LEVELS.map(L=>`<button class="setc" data-oset="lv:${esc(L.n)}"><b>${esc(L.c)} · ${esc(L.n)}</b><small>${WD.filter(w=>w.lv===L.n).length} слов</small></button>`).join('');
  $('setsBody').innerHTML=`<h2 style="margin-top:4px">Мои наборы</h2>
   <div class="row"><input id="newSetName" placeholder="Название нового набора" autocomplete="off"><button class="main" id="newSetB">Создать</button></div>
   <div class="setl">${X.sets.map(s=>`<button class="setc mine" data-oset="my:${s.id}"><b>${esc(s.name)}</b><small>${s.words.length} слов</small></button>`).join('')||'<p class="note">Пока нет своих наборов. Создай первый — например, «Слова из сериала» или «Работа».</p>'}</div>
   ${OWN.length?`<div class="setl"><button class="setc" data-oset="own"><b>${esc(OWNTH)}</b><small>${OWN.length} слов</small></button></div>`:''}
   <h2>Готовые наборы по уровням</h2><div class="setl">${lv}</div>`;
}
function openSet(id){
  const s=X.sets.find(x=>x.id===id);if(!s)return;curSet=s;wView='set';showTab('train');renderSet();
}
function renderSet(){
  const s=curSet;
  $('setsBody').innerHTML=`<button class="link" data-back-sets>← Все наборы</button>
   <h2 style="margin-top:4px">${esc(s.name)}</h2><p class="mk">${s.words.length} слов</p>
   <div class="row"><button class="main" data-study-set="${s.id}" ${s.words.length?'':'disabled'}>Учить набор</button><button data-del-set="${s.id}">Удалить набор</button></div>
   <div class="card addw"><b>Добавить слово</b>
     <input id="awEn" lang="en" placeholder="Слово по-английски" autocomplete="off" autocapitalize="off" spellcheck="false">
     <input id="awTr" placeholder="Перевод (можно оставить пустым)" autocomplete="off">
     <div class="row"><button class="main" id="awAdd">Добавить</button></div>
     <p class="note" style="margin:6px 0 0">Объяснение и пример на английском подтянутся из словаря dictionaryapi.dev, если есть интернет.</p></div>
   <details class="own"><summary>Импорт списком</summary><p class="note" style="margin-top:0">По одному слову на строку: <b>word — перевод</b> или просто <b>word</b>.</p>
     <textarea id="awBulk" rows="6" placeholder="achieve — достигать&#10;reluctant" autocapitalize="off" spellcheck="false"></textarea><div class="row"><button class="main" id="awImport">Импортировать</button></div><p class="note" id="awMsg"></p></details>
   <div id="setList">${s.words.map((x,i)=>`<div class="wrow sw"><div><b lang="en">${esc(x.en)}</b>${x.def?`<p class="wdef" lang="en" data-noi18n>${esc(x.def)}</p>`:''}${x.ex?`<p class="wex" lang="en" data-noi18n>${esc(x.ex)}</p>`:''}${x.tr?`<button class="trbtn" data-showtr>Показать перевод</button><span class="trh" hidden>${esc(x.tr)}</span>`:''}
     <p class="wlinks"><a href="${dictLink(x.en)}" target="_blank" rel="noopener">Открыть в Cambridge</a>${x.def?'':` · <button class="link" data-fetchdef="${i}">Найти объяснение</button>`} · <button class="link" data-delw="${i}">Удалить</button></p></div></div>`).join('')}</div>`;
}
async function fetchDef(en){
  try{
    const r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(en.trim().toLowerCase()));
    if(!r.ok)return null;const j=await r.json();let def='',ex='';
    for(const e of j)for(const m of e.meanings||[])for(const d of m.definitions||[]){if(!def)def=d.definition;if(!ex&&d.example)ex=d.example;if(def&&ex)break}
    return def?{def,ex}:null;
  }catch(e){return null}
}
async function addWords(lines){
  const s=curSet;let add=0,skip=0;const fresh=[];
  for(const raw of lines){const l=raw.trim();if(!l)continue;const m=l.match(/^(.+?)\s*(?:\t|\s[-—–=:]\s|[—–=:])\s*(.+)$/);const en=(m?m[1]:l).trim().slice(0,60),tr=m?m[2].trim().slice(0,100):'';
    if(!/[a-z]/i.test(en)||s.words.some(x=>x.en.toLowerCase()===en.toLowerCase())){skip++;continue}
    const x={en,tr};s.words.push(x);fresh.push(x);add++}
  saveX();renderSet();
  let got=0;for(const x of fresh){const d=await fetchDef(x.en);if(d){x.def=d.def;x.ex=d.ex;got++;saveX()}}
  if(curSet===s&&wView==='set')renderSet();
  return{add,skip,got};
}
document.addEventListener('click',async e=>{
  const sm=e.target.closest('[data-sm]');if(sm){ST.mode=sm.dataset.sm;renderStudy();return}
  if(e.target.closest('[data-smix]')){ST.mix=!ST.mix;ST.order=null;ST.learn=null;ST.test=null;ST.match=null;renderStudy();return}
  if(e.target.closest('#flash')){ST.flip=!ST.flip;$('flash').classList.toggle('on',ST.flip);return}
  const fc=e.target.closest('[data-fc]');if(fc){const a=fc.dataset.fc,w=ST.order[ST.i%ST.order.length];
    if(a==='know'){recordStudy(w,true)}if(a==='again'){recordStudy(w,false)}
    ST.i=a==='prev'?(ST.i-1+ST.order.length)%ST.order.length:ST.i+1;ST.flip=false;renderCards();return}
  const lo=e.target.closest('[data-lo]');if(lo){const S=ST.learn;if(S.answered)return;const o=S.cur.opts[+lo.dataset.lo],good=o===S.cur.w;
    document.querySelectorAll('[data-lo]').forEach(b=>{b.disabled=true;const x=S.cur.opts[+b.dataset.lo];if(x===S.cur.w)b.className='ok';else if(b===lo)b.className='no'});learnAnswer(good);return}
  if(e.target.closest('[data-learn-next]')){renderLearn();return}
  if(e.target.closest('[data-learn-again]')){ST.learn=null;renderLearn();return}
  if(e.target.closest('#sGo')){checkWrite();return}
  if(e.target.closest('#sDunno')){if(ST.mode==='learn')learnAnswer(false);else testAnswer(false);return}
  const to=e.target.closest('[data-to]');if(to){const q=ST.test.qs[ST.test.i];if(q.done)return;const good=q.opts[+to.dataset.to]===q.w;document.querySelectorAll('[data-to]').forEach(b=>{b.disabled=true;if(q.opts[+b.dataset.to]===q.w)b.className='ok';else if(b===to)b.className='no'});testAnswer(good);return}
  const tt=e.target.closest('[data-tt]');if(tt){const q=ST.test.qs[ST.test.i];if(q.done)return;const good=(tt.dataset.tt==='1')===q.truth;tt.className=good?'ok':'no';testAnswer(good);return}
  if(e.target.closest('[data-test-next]')){ST.test.i++;renderTest();return}
  if(e.target.closest('[data-test-again]')){ST.test=null;renderTest();return}
  const mt=e.target.closest('[data-mt]');if(mt){matchTap(+mt.dataset.mt);return}
  if(e.target.closest('[data-match-again]')){ST.match=null;renderMatch();return}
  const os=e.target.closest('[data-oset]');if(os){const v=os.dataset.oset;
    if(v==='own')openStudy(OWNTH,allWords().filter(w=>w.lv===OWNTH),'own');
    else if(v.startsWith('lv:')){const n=v.slice(3);openStudy(LVC(n)+' · '+n,WD.filter(w=>w.lv===n),'lv:'+n)}
    else openSet(v.slice(3));return}
  if(e.target.closest('#newSetB')){const n=$('newSetName').value.trim();if(!n){$('newSetName').focus();return}const s={id:Date.now().toString(36),name:n.slice(0,60),words:[]};X.sets.unshift(s);saveX();openSet(s.id);return}
  if(e.target.closest('[data-back-sets]')){wView='sets';showTab('train');return}
  const ss=e.target.closest('[data-study-set]');if(ss){const s=X.sets.find(x=>x.id===ss.dataset.studySet);if(s)openStudy(s.name,setWords(s),'my:'+s.id);return}
  const ds=e.target.closest('[data-del-set]');if(ds){if(!ds.dataset.c){ds.dataset.c=1;ds.textContent='Точно удалить? Нажми ещё раз';return}X.sets=X.sets.filter(x=>x.id!==ds.dataset.delSet);saveX();wView='sets';showTab('train');return}
  if(e.target.closest('#awAdd')){const en=$('awEn').value.trim();if(!en){$('awEn').focus();return}const tr=$('awTr').value.trim();const r=await addWords([tr?en+' — '+tr:en]);toast(r.add?(r.got?'<b>Слово добавлено</b><br>Объяснение найдено':'<b>Слово добавлено</b><br>Объяснение не найдено — можно вписать позже'):'<b>Такое слово уже есть</b>');return}
  if(e.target.closest('#awImport')){const r=await addWords($('awBulk').value.split('\n'));toast(`<b>Добавлено слов: ${r.add}</b><br>С объяснением: ${r.got}${r.skip?` · пропущено: ${r.skip}`:''}`);return}
  const fd=e.target.closest('[data-fetchdef]');if(fd){const x=curSet.words[+fd.dataset.fetchdef];fd.textContent='Ищу…';const d=await fetchDef(x.en);if(d){x.def=d.def;x.ex=d.ex;saveX();renderSet()}else{fd.textContent='Не найдено (нет интернета или слова)'}return}
  const dw=e.target.closest('[data-delw]');if(dw){curSet.words.splice(+dw.dataset.delw,1);saveX();renderSet();return}
  const st=e.target.closest('[data-showtr]');if(st){const h=st.nextElementSibling;h.hidden=!h.hidden;st.textContent=h.hidden?'Показать перевод':'Скрыть перевод';return}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='sIn'){e.preventDefault();checkWrite()}if((e.key==='Enter'||e.key===' ')&&e.target.id==='flash'){e.preventDefault();ST.flip=!ST.flip;$('flash').classList.toggle('on',ST.flip)}});
/* keep the keyboard open while writing in learn/test */
const sKeep=e=>{if(e.target.closest('#scard button')&&$('sIn'))e.preventDefault()};
document.addEventListener('mousedown',sKeep);document.addEventListener('pointerdown',sKeep);
