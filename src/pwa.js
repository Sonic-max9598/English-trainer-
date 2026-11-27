/* ===== offline app: service worker + quiet "update available" banner; moving progress between Safari and the Home Screen app ===== */
$('appVer').textContent=tr('Версия')+' '+APP_VER+' · '+tr('работает без интернета после первого открытия');
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  let reloading=false;
  const offer=w=>{if(!w)return;const b=$('upd');b.hidden=false;b.onclick=()=>{b.disabled=true;b.querySelector('span').textContent='Обновляю…';w.postMessage('skipWaiting')}};
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
  addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').then(reg=>{
      if(reg.waiting&&navigator.serviceWorker.controller)offer(reg.waiting);
      reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;
        w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)offer(w)})});
      /* check for a new version when the app comes back to the screen */
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})});
    }).catch(()=>{});
  });
}
/* progress transfer: all tenses3* keys as one code */
const PKEYS=['tenses3','tenses3prog','tenses3words','tenses3own','tenses3x'];
function progCode(){const o={};for(const k of PKEYS){try{const v=localStorage.getItem(k);if(v!==null)o[k]=v}catch(e){}}return 'EI1:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))))}
$('expBtn').addEventListener('click',()=>{
  saveX();const code=progCode(),ta=$('expTa');ta.value=code;ta.select();
  const done=()=>{$('expMsg').textContent='Код скопирован. Открой приложение с экрана «Домой», зайди в Настройки и вставь его.'};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(done,()=>{$('expMsg').textContent='Код выделен — скопируй его вручную.'});
  else{try{document.execCommand('copy');done()}catch(e){$('expMsg').textContent='Код выделен — скопируй его вручную.'}}
});
$('impBtn').addEventListener('click',()=>{
  const raw=$('expTa').value.trim(),b=$('impBtn');
  let o=null;try{if(raw.startsWith('EI1:'))o=JSON.parse(decodeURIComponent(escape(atob(raw.slice(4)))))}catch(e){}
  if(!o||typeof o!=='object'||!Object.keys(o).every(k=>PKEYS.includes(k))){$('expMsg').textContent='Это не похоже на код прогресса. Скопируй его целиком, начиная с EI1:';return}
  if(!b.dataset.c){b.dataset.c=1;b.textContent='Заменить текущий прогресс? Нажми ещё раз';return}
  noSave=true;for(const k in o){try{localStorage.setItem(k,o[k])}catch(e){}}
  $('expMsg').textContent='Прогресс загружен. Перезапускаю…';setTimeout(()=>location.reload(),600);
});
