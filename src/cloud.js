/* ===== "Учитель онлайн": optional link to the admin server (server/, Render).
   Off by default. When on, a short summary of progress (no answers, no words) goes to the teacher's register;
   the teacher's message is fetched and shown on the home screen. Offline nothing changes: requests just fail quietly.
   State lives in tenses3x → X.cloud: {id, name, code, on, last, err, log:{date:answers}, news:{text,updated,hide}} */
const API=window.EI_API||'__API_URL__';
X.cloud=Object.assign({id:null,name:'',code:'',on:0,last:0,err:'',log:{},news:null},X.cloud||{});
if(!X.cloud.id){const a=new Uint8Array(12);(crypto.getRandomValues?crypto.getRandomValues(a):a.forEach((_,i)=>a[i]=Math.random()*256|0));X.cloud.id=Array.from(a,b=>b.toString(16).padStart(2,'0')).join('')}
const cOnline=()=>/^https?:/.test(API)&&navigator.onLine!==false;
function cSummary(){
  const C=X.cloud,d=today();C.log[d]=Math.max(C.log[d]||0,qRec().ans);
  const ks=Object.keys(C.log).sort();while(ks.length>30)delete C.log[ks.shift()];
  const days={};for(const k of new Set(Object.keys(C.log).concat(Object.keys(prog.days)))){const p=prog.days[k]||[0,0];days[k]=[p[0],Math.max(p[1],C.log[k]||0)]}
  let ok=0,all=0;for(const k in prog.cells){ok+=prog.cells[k][0];all+=prog.cells[k][1]}
  const p=pRec();
  return {v:APP_VER,ui:UI,today:d,xp:X.g.xp,lv:lvlInfo().lv,streak:streakNow(),best:X.g.best,lessons:X.g.lessons,perfect:X.g.perfect,
    acc:all>=10?Math.round(ok/all*100):null,words:learned(),wordsSeen:Object.keys(WS.W).length,tenses:openT().length,
    read:Object.keys((X.book&&X.book.read)||{}).length,min:Math.floor((p.rev+p.nw)/60000),days};
}
let cBusy=false;
function cSync(force,bg){
  const C=X.cloud;if(!C.on||!C.name||!cOnline()||cBusy)return Promise.resolve();
  if(!force&&Date.now()-C.last<90000)return Promise.resolve();
  cBusy=true;
  return fetch(API+'/api/sync',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:!!bg,
    body:JSON.stringify({id:C.id,name:C.name,code:C.code,data:cSummary()})})
    .then(r=>{C.err=r.ok?'':r.status===403?'code':r.status===429?'':'server';if(r.ok)C.last=Date.now()})
    .catch(()=>{C.err='net'}).finally(()=>{cBusy=false;saveX();if(curTab==='set')cRender()});
}
function cNews(){
  if(!cOnline())return;
  fetch(API+'/api/news',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(n=>{if(!n)return;
    const o=X.cloud.news;X.cloud.news={text:String(n.text||'').slice(0,1000),updated:n.updated,hide:o&&o.updated===n.updated?o.hide:0};
    saveX();renderNews()}).catch(()=>{});
}
function renderNews(){
  const n=X.cloud.news,el=$('hNews');if(!el)return;
  if(!n||!n.text||n.hide){el.hidden=true;el.innerHTML='';return}
  el.hidden=false;
  el.innerHTML=`<div class="nw-h"><b>Сообщение от учителя</b><button class="nw-x" id="hNewsX">Понятно</button></div><p></p>`;
  el.querySelector('p').textContent=n.text;/* teacher's text as plain text, never HTML */
}
function cRender(){
  const C=X.cloud,box=$('setCloud');if(!box)return;
  if(document.activeElement!==$('cName'))$('cName').value=C.name;
  if(document.activeElement!==$('cCode'))$('cCode').value=C.code;
  $('cOn').setAttribute('aria-pressed',!!C.on);
  const ago=C.last?Math.round((Date.now()-C.last)/60000):null;
  $('cMsg').textContent=!C.on?'Выключено: прогресс остаётся только на этом устройстве.'
    :!C.name?'Впиши имя, чтобы учитель понял, кто это.'
    :C.err==='code'?'Учитель не принял код класса. Проверь его и включи снова.'
    :C.err==='net'?'Нет связи с сервером — отправлю, когда появится интернет.'
    :C.err==='server'?'Сервер учителя не ответил. Попробую позже.'
    :ago===null?'Отправлю после следующего задания.'
    :ago<1?'Прогресс отправлен только что.':'Прогресс отправлен '+ago+' мин назад.';
}
$('cName').addEventListener('change',()=>{X.cloud.name=$('cName').value.replace(/\s+/g,' ').trim().slice(0,60);saveX();cRender();cSync(true)});
$('cCode').addEventListener('change',()=>{X.cloud.code=$('cCode').value.trim().slice(0,40);X.cloud.err='';saveX();cRender();cSync(true)});
$('cOn').addEventListener('click',()=>{const C=X.cloud;C.on=C.on?0:1;C.err='';saveX();cRender();if(C.on){if(!C.name)$('cName').focus();cSync(true)}});
document.addEventListener('click',e=>{if(e.target.closest('#hNewsX')){X.cloud.news.hide=1;saveX();renderNews()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')cSync(true,true);else{cNews();cSync(false)}});
addEventListener('online',()=>{cNews();cSync(true)});
cRender();renderNews();
setTimeout(()=>{cNews();cSync(false)},1500);
setInterval(()=>cSync(false),5*60000);
