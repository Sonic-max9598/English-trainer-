/* ===== irregular verbs: list, groups of 10 by frequency, V2/V3 drill with spaced repetition ===== */
const IRREG=__IRREG__.split('\n').map((l,i)=>{const[v1,v2,v3,ru,uz]=l.split('|');return{i,v1,v2,v3,ru,uz,g:Math.floor(i/10)}});
const VG=Math.ceil(IRREG.length/10);
X.iv=X.iv&&typeof X.iv==='object'?X.iv:{};/* v1 -> {b: correct in a row, n: due at counter, e: mistakes} */
X.ivc=X.ivc||0;
const VIV=[0,2,5,10,20,40];
const vSt=v=>X.iv[v.v1];
const vLearned=v=>{const s=vSt(v);return!!s&&s.b>=3};
const forms=f=>f.split('/').map(x=>x.trim().toLowerCase());
let vVals=null,vMode='drill',vGroup=null,vCur=null,vDone=false,vLast=null,vSes={ok:0,all:0};
function vCurGroup(){if(vGroup!==null)return vGroup;for(let g=0;g<VG;g++)if(IRREG.filter(v=>v.g===g).some(v=>!vLearned(v)))return g;return VG-1}
/* mistakes come back sooner and more often */
function vPick(){
  {const f=gameForce('verb');if(f){const v=IRREG.find(x=>x.v1===f);if(v)return v}}
  const g=vCurGroup(),pool=IRREG.filter(v=>v.g===g||(vGroup===null&&v.g<g&&vSt(v)&&vSt(v).n<=X.ivc));
  const alt=pool.length>1?pool.filter(v=>v.v1!==vLast):pool;
  const due=alt.filter(v=>{const s=vSt(v);return s&&s.n<=X.ivc});
  if(due.length){const w=due.map(v=>1+2*(vSt(v).e||0));let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<due.length;i++){r-=w[i];if(r<=0)return due[i]}return due[0]}
  const fresh=alt.filter(v=>!vSt(v));if(fresh.length)return fresh[0];
  return alt.slice().sort((a,b)=>vSt(a).n-vSt(b).n)[0];
}
function vModes(){
  $('vModes').innerHTML=`<button class="tog" data-vm="drill" aria-pressed="${vMode==='drill'}">Тренировка</button><button class="tog" data-vm="list" aria-pressed="${vMode==='list'}">Список</button>`;
  const L=IRREG.filter(vLearned).length;
  $('vProg').innerHTML=`<div class="dstat"><b>${L}</b><span>из ${IRREG.length} выучено</span></div><div class="dstat"><b>${vCurGroup()+1}</b><span>группа из ${VG}</span></div><div class="dbar"><i style="width:${L/IRREG.length*100}%"></i></div>`;
  $('vGroups').innerHTML=`<button class="tog" data-vg="" aria-pressed="${vGroup===null}">По порядку</button>`+Array.from({length:VG},(_,g)=>{const vs=IRREG.filter(v=>v.g===g),l=vs.filter(vLearned).length;return `<button class="tog${l===vs.length?' vdone':''}" data-vg="${g}" aria-pressed="${vGroup===g}">${g+1}<small>${l}/${vs.length}</small></button>`}).join('');
  $('vDrill').hidden=vMode!=='drill';$('vList').hidden=vMode!=='list';
}
function vNext(){
  if(lessonGate('verbs'))return;
  vModes();if(vMode==='list'){renderVList();return}
  const v=vPick();vCur=v;vLast=v.v1;vDone=false;
  const lang=UI;
  const s=vSt(v);
  $('vTask').innerHTML=`<span class="chip">Группа ${v.g+1}</span>${s?`<span class="chip">${dots(Math.min(s.b,5))}</span>`:'<span class="chip f plus">Новый глагол</span>'}${s&&s.e>=2?'<span class="chip f minus">Часто ошибаешься</span>':''}`;
  $('vV1').textContent=v.v1;$('vTr').textContent=v[lang];
  for(const k of ['2','3']){const i=$('vIn'+k);i.value='';i.disabled=false;i.className='';$('vS'+k).className='vslot'}
  $('vFb').className='fb';$('vFb').innerHTML='';$('vGo').textContent='Проверить';
  enter($('vcard'));$('vIn2').focus({preventScroll:true});
}
function vCheck(){
  if(!vCur){vMode='drill';vNext();return}
  if(vDone){vNext();return}
  const a2=$('vIn2').value.trim().toLowerCase(),a3=$('vIn3').value.trim().toLowerCase();
  if(!a2){$('vIn2').focus();return}if(!a3){$('vIn3').focus();return}
  const v=vCur,ok2=forms(v.v2).includes(a2),ok3=forms(v.v3).includes(a3),good=ok2&&ok3;vDone=true;
  X.ivc++;const s=X.iv[v.v1]||{b:0,n:0,e:0};
  if(good){s.b=Math.min(s.b+1,5);s.n=X.ivc+VIV[s.b]}else{s.b=0;s.e=(s.e||0)+1;s.n=X.ivc+2}
  X.iv[v.v1]=s;saveX();
  const d=today(),dd=prog.days[d]||(prog.days[d]=[0,0]);dd[1]++;if(good)dd[0]++;saveProg();
  vSes.all++;if(good)vSes.ok++;
  vVals=[$('vIn2').value,$('vIn3').value];
  $('vS2').className='vslot '+(ok2?'ok':'no');$('vS3').className='vslot '+(ok3?'ok':'no');
  const fb=$('vFb');fb.className='fb '+(good?'ok':'no');
  fb.innerHTML=`<b>${good?(s.b>=3?'Верно! Глагол выучен.':'Верно!'):'Правильно так:'}</b><div class="ans vline">${esc(v.v1)} – ${esc(v.v2)} – ${esc(v.v3)}</div><div>${esc(trw(v))}</div>`+(good?'':'<div class="fbnote">Этот глагол будет попадаться чаще, пока не запомнится.</div>');
  $('vGo').textContent='Дальше';
  feedback($('vcard'),good);onAnswer(good,{kind:'verb',id:v.v1});vModes();
  if(document.activeElement!==$('vIn2')&&document.activeElement!==$('vIn3'))$('vIn3').focus({preventScroll:true});
  const id=vCur;if(good)setTimeout(()=>{if(vDone&&vCur===id)vNext()},1100);
}
function renderVList(){
  let h='';for(let g=0;g<VG;g++){const vs=IRREG.filter(v=>v.g===g);
    h+=`<div class="vgh"><b>Группа ${g+1}</b><span>${vs.filter(vLearned).length} из ${vs.length} выучено</span><button data-vtrain="${g}">Учить</button></div><div class="vtab">`+vs.map(v=>{const s=vSt(v);return `<div class="vrow${vLearned(v)?' on':s?' mid':''}"><i></i><b>${esc(v.v1)}</b><b>${esc(v.v2)}</b><b>${esc(v.v3)}</b><span>${esc(trw(v))}</span></div>`}).join('')+'</div>'}
  $('vListBody').innerHTML=h;
}
$('vGo').addEventListener('click',vCheck);
/* after the check the fields stay focusable (disabling them would close the iPhone keyboard), edits are just undone */
for(const k of ['2','3'])$('vIn'+k).addEventListener('input',()=>{if(vDone&&vVals)$('vIn'+k).value=vVals[+k-2]});
$('vIn2').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(vDone)vNext();else $('vIn3').focus()}});
$('vIn3').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();vCheck()}});
document.addEventListener('click',e=>{
  const m=e.target.closest('[data-vm]');if(m){vMode=m.dataset.vm;vNext();return}
  const g=e.target.closest('[data-vg]');if(g){vGroup=g.dataset.vg===''?null:+g.dataset.vg;vMode='drill';vNext();return}
  const t=e.target.closest('[data-vtrain]');if(t){vGroup=+t.dataset.vtrain;vMode='drill';vNext();window.scrollTo({top:0,behavior:'smooth'});return}
});
/* keep the keyboard open: buttons in the verb card never take focus from the inputs */
const vKeep=e=>{if(e.target.closest('#vcard button'))e.preventDefault()};
document.addEventListener('mousedown',vKeep);document.addEventListener('pointerdown',vKeep);
