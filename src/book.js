/* ===== theory as a book: contents with search, chapters, examples ru/uz, common mistakes, 5-question quiz =====
   State lives in tenses3x → X.book: {cur, last, pos:{id:scrollY}, read:{id:date}, quiz:{id:best}, fs} */
X.book=Object.assign({cur:null,last:null,pos:{},read:{},quiz:{},fs:0},X.book||{});
const bookFs=()=>[0,1,2].includes(X.book.fs)?X.book.fs:0;
const OVERVIEW={id:'tenses',part:0,n:'Как устроены 12 времён',s:'Одна схема на все времена',
  tip:'Время = КОГДА (прошлое, настоящее, будущее) + КАК (просто, в процессе, с результатом, процесс до момента). 3 × 4 = 12.',
  html:`<p>12 времён пугают только названием. На самом деле это сетка: <b>3 момента</b> (Past, Present, Future) × <b>4 вида</b> действия.</p>
  <table><tr><th>Вид</th><th>Что показывает</th><th>Подсказка</th></tr>
  <tr><td><b>Simple</b></td><td>факт, привычка, действие целиком</td><td>V, V2, will V</td></tr>
  <tr><td><b>Continuous</b></td><td>процесс в момент времени</td><td>be + V‑ing</td></tr>
  <tr><td><b>Perfect</b></td><td>результат к моменту</td><td>have + V3</td></tr>
  <tr><td><b>Perfect Continuous</b></td><td>сколько длилось до момента</td><td>have been + V‑ing</td></tr></table>
  <p>Учить их лучше по тропе — от простых к сложным. На главном экране каждая остановка тропы открывает тренировку и главу.</p>
  <h3>Обозначения</h3><p><b>S</b> — подлежащее (I, you, he…). <b>V</b> — глагол в начальной форме. <b>V2</b> — вторая форма, <b>V3</b> — третья (‑ed или неправильный глагол: go — went — gone). <b>V‑ing</b> — глагол с окончанием ‑ing.</p>
  <div data-alltenses></div>`,
  ex:[['I work every day.','Я работаю каждый день.','Men har kuni ishlayman.'],['I am working now.','Я работаю сейчас.','Men hozir ishlayapman.'],['I have worked here for two years.','Я работаю здесь два года.','Men bu yerda ikki yildan beri ishlayman.'],['I have been working since morning.','Я работаю с утра.','Men ertalabdan beri ishlayapman.']],
  err:[['I am work.','I work. / I am working.','Am / is / are + обычный глагол без ‑ing не бывает.'],['I have seen him yesterday.','I saw him yesterday.','Точное прошлое время — Past Simple.'],['When I will come, I will call.','When I come, I will call.','После when / if о будущем — Present Simple.']],
  quiz:[['I ___ to school every day.',['go','am going','have gone'],0,'Every day — привычка: Present Simple.'],['Look! The children ___.',['play','are playing','played'],1,'Look! — сейчас: Present Continuous.'],['I ___ my keys. I can\'t open the door.',['lost','have lost','lose'],1,'Результат сейчас — Present Perfect.'],['We ___ dinner when you called.',['had','were having','have'],1,'Процесс, который прервали, — Past Continuous.'],['By 2030 I ___ university.',['will finish','will have finished','finish'],1,'By + будущее — Future Perfect.']]};
function tenseChapter(t){
  const x=T[t],tx=TX[t];
  const exs=[];for(const f of ['+','-','?','+']){const it=BANK.find(b=>b.t===t&&b.f===f&&!exs.some(e=>e[0]===b.en));if(it)exs.push([it.en,it.ru,it.uz])}
  const html=tx.more+`<div class="fgrid">${Object.keys(F).map(f=>`<div class="f3 ${FC[f]}"><span>${f} ${F[f]}</span><b>${x.f[f]}</b><em>${x.ex[f]}</em></div>`).join('')}</div>
   <h3>Когда используется</h3><ul class="use">${x.use.map(u=>`<li>${u}</li>`).join('')}</ul>
   <h3>Маркеры — слова-подсказки</h3><div class="mkl">${x.mk.map(m=>`<div><b>${m[0]}</b><span>${UI==='uz'?m[2]:m[1]}</span></div>`).join('')}</div>
   <h3>Не путай</h3>${x.vs.map(([o,s])=>`<div class="vs"><button class="chip t" data-chap="t-${o}">${tName(o)}</button><p>${s}</p></div>`).join('')}
   <div data-train="${t}"></div>`;
  return{id:'t-'+t,part:0,n:x.n,s:x.ru,tip:tx.tip,html,ex:exs,err:tx.err,quiz:tx.quiz,t};
}
/* Uzbek texts must be in place before the chapters are assembled */
i18nContent({T,TX,book:CH_MORE,OVERVIEW,PARTS,RULES});
const BOOK=[OVERVIEW].concat(STOPS.map(tenseChapter),CH_MORE.filter(c=>c.part===0),CH_MORE.filter(c=>c.part>0).sort((a,b)=>a.part-b.part));
const chIdx=id=>BOOK.findIndex(c=>c.id===id);
const strip=h=>h.replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ');
let BIDX=null;
function bookIndex(){if(!BIDX)BIDX=BOOK.map(c=>[c.n,c.s,c.tip,strip(c.html),c.ex.map(e=>e.join(' ')).join(' '),c.err.map(e=>e.join(' ')).join(' '),c.t?T[c.t].mk.map(m=>m.join(' ')).join(' '):''].join(' ').replace(/\s+/g,' '));return BIDX}
const fold=s=>s.toLowerCase().replace(/ё/g,'е').replace(/[’`‘ʻʼ]/g,"'");

/* --- contents --- */
let bookQ='';
function renderBook(){
  const cur=X.book.cur&&chIdx(X.book.cur)>=0?X.book.cur:null;
  $('bookToc').hidden=!!cur;$('bookChap').hidden=!cur;
  if(cur)renderChap(cur);else renderToc();
}
function readN(){return BOOK.filter(c=>X.book.read[c.id]).length}
function renderToc(){
  const n=readN(),last=X.book.last&&chIdx(X.book.last)>=0?BOOK[chIdx(X.book.last)]:null;
  $('bookToc').innerHTML=`<div class="bhead"><div class="mascot" id="bookM" data-mood="think"></div><div><h2>Справочник по грамматике</h2><p class="mk">${BOOK.length} глав · прочитано ${n}</p><div class="xpbar g"><i style="width:${n/BOOK.length*100}%"></i></div></div></div>
   <div class="bsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="bookQ" placeholder="Поиск: Present Perfect, артикли, since…" autocomplete="off" value="${esc(bookQ)}" aria-label="Поиск по теории"></div>
   ${last&&!bookQ?`<button class="bcont" data-chap="${last.id}"><span class="bci">${ico('book')}</span><span><small>Продолжить чтение · глава ${chIdx(last.id)+1}</small><b>${last.n}</b></span><span class="bgo">${ico('play',20)}</span></button>`:''}
   <div id="bookList"></div>`;
  setMascot($('bookM'),'think');
  $('bookQ').addEventListener('input',e=>{bookQ=e.target.value;renderTocList()});
  renderTocList();
}
function crow(c,snip){const i=chIdx(c.id),rd=X.book.read[c.id],q=X.book.quiz[c.id];
  return `<button class="crow${rd?' rd':''}" data-chap="${c.id}"><span class="cn">${i+1}</span><span class="ct"><b>${c.n}</b><small>${snip||c.s}</small></span><span class="cr">${rd?ico('check',18):''}${q!=null?`<em>${q}/5</em>`:''}</span></button>`}
function renderTocList(){
  const q=fold(bookQ.trim());let h='';
  if(q){const idx=bookIndex();const hits=BOOK.map((c,i)=>{const s=fold(idx[i]),k=s.indexOf(q);if(k<0)return null;const tl=fold(c.n).includes(q)?0:1;return{c,k,tl}}).filter(Boolean).sort((a,b)=>a.tl-b.tl||chIdx(a.c.id)-chIdx(b.c.id));
    h=hits.length?`<p class="note">Найдено глав: ${hits.length}</p>`+hits.map(({c,k})=>{const raw=bookIndex()[chIdx(c.id)],a=Math.max(0,k-38),frag=raw.slice(a,k+q.length+50);
      const j=fold(frag).indexOf(q);const snip=(a?'…':'')+esc(frag.slice(0,j))+'<mark>'+esc(frag.slice(j,j+q.length))+'</mark>'+esc(frag.slice(j+q.length))+'…';return crow(c,snip)}).join('')
      :`<div class="empty"><p><b>Ничего не нашлось.</b> Попробуй по-другому: «perfect», «артикль», «if», «предлоги».</p></div>`}
  else h=PARTS.map((p,pi)=>{const cs=BOOK.filter(c=>c.part===pi);return `<h3 class="ppart">${p}<small>${cs.filter(c=>X.book.read[c.id]).length}/${cs.length}</small></h3><div class="clist">${cs.map(c=>crow(c)).join('')}</div>`}).join('');
  $('bookList').innerHTML=h;
}

/* --- chapter --- */
let quizSt=null;
function renderChap(id){
  const i=chIdx(id),c=BOOK[i],prev=BOOK[i-1],nxt=BOOK[i+1];
  X.book.last=id;saveX();
  $('bookChap').innerHTML=`<div class="cbar"><button data-toc>${ico('book',18)}Оглавление</button><span>${i+1} / ${BOOK.length}</span><button data-fsz aria-label="Размер текста">Aa</button></div>
  <article class="chap fs${bookFs()}">
   <p class="cpart">${PARTS[c.part]}</p><h2 class="ctitle">${c.n}</h2><p class="csub">${c.s}</p>
   <div class="ctip"><div class="mascot" id="chM" data-mood="think"></div><p><b>Главное</b>${c.tip}</p></div>
   <div class="ctext">${c.html}</div>
   <h3>Примеры с переводом</h3><div class="exlist">${c.ex.map(e=>`<div class="exi"><b>${e[0]}</b><span>${UI==='uz'?e[2]:e[1]}</span></div>`).join('')}</div>
   <h3>Частые ошибки</h3><div class="errlist">${c.err.map(e=>`<div class="erri"><p><s>${e[0]}</s></p><p class="r">${e[1]}</p><small>${e[2]}</small></div>`).join('')}</div>
   <h3>Мини-тест</h3><div class="quiz" id="quiz"></div>
   <button class="readbtn${X.book.read[id]?' on':''}" data-read="${id}">${ico('check',20)}<span>${X.book.read[id]?'Глава прочитана':'Отметить как прочитанную'}</span></button>
   <nav class="cnav">${prev?`<button data-chap="${prev.id}"><small>← Предыдущая</small><b>${prev.n}</b></button>`:'<span></span>'}${nxt?`<button class="nx" data-chap="${nxt.id}"><small>Следующая →</small><b>${nxt.n}</b></button>`:'<span></span>'}</nav>
  </article>`;
  setMascot($('chM'),'think');
  document.querySelectorAll('#bookChap .ctext table').forEach(t=>{const w=document.createElement('div');w.className='tw';t.replaceWith(w);w.appendChild(t)});
  const at=document.querySelector('#bookChap [data-alltenses]');
  if(at)at.innerHTML=`<table><tr><th>Время</th><th>+ Утверждение</th></tr>${STOPS.map(t=>`<tr><td><button class="lnk" data-chap="t-${t}">${tName(t)}</button><br><small>${T[t].ru}</small></td><td>${T[t].f['+']}<br><small>${T[t].ex['+']}</small></td></tr>`).join('')}</table>`;
  const tr=document.querySelector('#bookChap [data-train]');
  if(tr){const t=tr.dataset.train;tr.innerHTML=tOpen(t)?`<div class="row"><button class="main" data-trt="${t}">${ico('play',18)}Тренировать ${tName(t)}</button></div>`:`<p class="flt">${ico('lock',18)} Тренировка откроется на тропе после предыдущих времён. Читать главу можно уже сейчас.</p>`}
  if(document.querySelector('#bookChap [data-rules]'))renderRules();
  quizSt={id,q:c.quiz.map(q=>{const o=shuf(q[1].map((t,k)=>({t,ok:k===q[2]})));return{q:q[0],o,why:q[3],sel:null}})};
  renderQuiz();
}
function renderQuiz(){
  const S=quizSt,done=S.q.every(x=>x.sel!==null),score=S.q.filter(x=>x.sel!==null&&x.o[x.sel].ok).length;
  $('quiz').innerHTML=S.q.map((x,qi)=>{const ans=x.sel!==null;
    return `<div class="qq${ans?(x.o[x.sel].ok?' ok':' no'):''}"><p><span class="qn">${qi+1}</span>${esc(x.q).replace('___','<span class="gap">'+(ans?esc(x.o.find(o=>o.ok).t):'?')+'</span>')}</p>
    <div class="qo">${x.o.map((o,oi)=>`<button data-qo="${qi}:${oi}" ${ans?'disabled':''} class="${ans&&o.ok?'ok':ans&&oi===x.sel?'no':''}">${esc(o.t)}</button>`).join('')}</div>${ans?`<small class="why">${esc(x.why)}</small>`:''}</div>`}).join('')
   +(done?`<div class="qres"><div class="mascot" id="qM"></div><div><b>${score} из 5</b><span>${score===5?'Идеально! Ты всё понял.':score>=4?'Отлично! Почти без ошибок.':score>=3?'Хорошо. Перечитай ошибки выше.':'Ничего страшного — перечитай главу и попробуй ещё.'}</span><button data-qagain>Пройти ещё раз</button></div></div>`:'');
  if(done)setMascot($('qM'),score>=4?'happy':'cheer');
}
function quizAnswer(qi,oi){
  const S=quizSt,x=S.q[qi];if(!x||x.sel!==null)return;x.sel=oi;const good=x.o[oi].ok;
  tone(good);buzz(good);
  renderQuiz();
  const el=document.querySelectorAll('#quiz .qq')[qi];if(el)fx(el,good);
  if(S.q.every(y=>y.sel!==null)){
    const score=S.q.filter(y=>y.o[y.sel].ok).length,first=X.book.quiz[S.id]==null;
    X.book.quiz[S.id]=Math.max(X.book.quiz[S.id]||0,score);
    if(first){X.g.xp+=score*4;markActive()}
    if(!X.book.read[S.id])setRead(S.id,true);
    saveX();checkAch();
    if(score===5)celebrate('Мини-тест: 5 из 5!');
  }
}
function setRead(id,v){if(v)X.book.read[id]=today();else delete X.book.read[id];saveX();
  const b=document.querySelector('[data-read]');if(b){b.classList.toggle('on',v);b.querySelector('span').textContent=v?'Глава прочитана':'Отметить как прочитанную'}
  if(v)checkAch();
}
let bookNoRestore=false;
function openChapter(id,o){
  if(chIdx(id)<0)return;bookSave();X.book.cur=id;saveX();bookNoRestore=!!(o&&o.noRestore);
  if(curTab!=='book')showTab('book');else renderBook();
  const y=bookNoRestore?0:(X.book.pos[id]||0);bookNoRestore=false;
  requestAnimationFrame(()=>window.scrollTo({top:y}));
}
function bookSave(){if(curTab==='book'&&X.book.cur&&!$('bookChap').hidden){X.book.pos[X.book.cur]=Math.round(scrollY);saveX()}}
let bookT=null;
addEventListener('scroll',()=>{if(curTab!=='book'||!X.book.cur)return;clearTimeout(bookT);bookT=setTimeout(bookSave,400)},{passive:true});
addEventListener('pagehide',bookSave);
document.addEventListener('click',e=>{
  const ch=e.target.closest('[data-chap]');if(ch){openChapter(ch.dataset.chap);return}
  if(e.target.closest('[data-toc]')){bookSave();X.book.cur=null;saveX();renderBook();window.scrollTo({top:0});return}
  const qo=e.target.closest('[data-qo]');if(qo){const[a,b]=qo.dataset.qo.split(':').map(Number);quizAnswer(a,b);return}
  if(e.target.closest('[data-qagain]')){renderChap(quizSt.id);const q=$('quiz');if(q)q.scrollIntoView({block:'start'});return}
  const rd=e.target.closest('[data-read]');if(rd){setRead(rd.dataset.read,!X.book.read[rd.dataset.read]);return}
  if(e.target.closest('[data-fsz]')){X.book.fs=(bookFs()+1)%3;saveX();const a=document.querySelector('.chap');if(a)a.className='chap fs'+X.book.fs;settings();return}
  const fs=e.target.closest('[data-fs]');if(fs){X.book.fs=+fs.dataset.fs;saveX();settings();return}
});
