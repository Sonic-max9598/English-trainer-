/* ===== interface language: Русский / O'zbekcha =====
   Strings live in i18n/ru.json and i18n/uz.json (key = Russian text, numbers written as {0}, {1}…).
   Every text node and placeholder/title/aria-label that appears on screen is looked up there,
   so templates in the code stay as they are. Long texts (theory) are replaced from i18n/uz-content.json. */
const I18N=__I18N__;
/* the choice lives in tenses3x.ui (old keys keep their format); old on.lang = 'uz' is honoured once */
const UI=(()=>{try{const x=JSON.parse(localStorage.getItem('tenses3x')||'null');if(x&&(x.ui==='ru'||x.ui==='uz'))return x.ui;const s=JSON.parse(localStorage.getItem('tenses3')||'null');if(s&&s.on&&s.on.lang==='uz')return'uz'}catch(e){}return'ru'})();
document.documentElement.lang=UI==='uz'?'uz':'ru';
const DICT=Object.assign({},I18N.ru,UI==='uz'?I18N.uz:{});
const HASCYR=/[А-Яа-яЁё]/;
function tr(src){
  if(!src||!HASCYR.test(src))return src;
  const lead=src.match(/^\s*/)[0],trail=src.match(/\s*$/)[0],core=src.trim();
  const nums=[];const key=core.replace(/\d+(?:[.,]\d+)?/g,m=>'{'+(nums.push(m)-1)+'}');
  let v=DICT[key];
  if(v===undefined&&/ · /.test(core)){const parts=core.split(' · ').map(p=>tr(p));if(parts.join(' · ')!==core)return lead+parts.join(' · ')+trail}
  if(v===undefined||v===key&&!nums.length)return src;
  return lead+v.replace(/\{(\d+)\}/g,(m,i)=>nums[+i]!==undefined?nums[+i]:m)+trail;
}
const t=s=>tr(s);
/* translation of a word/verb/example in the chosen language */
const trw=o=>UI==='uz'&&o.uz?o.uz:o.ru;
/* key words of a task: in Uzbek mode Russian glosses ("холодно — cold") keep only the English part */
const hintTxt=h=>UI==='uz'&&HASCYR.test(h)?h.split(/;\s*/).map(p=>p.includes('—')?p.split('—').pop().trim():p).filter(p=>!HASCYR.test(p)).join(' · '):h;
const SKIP='script,style,[data-noi18n],.noi';
function trNode(n){
  if(n.nodeType===3){const p=n.parentElement;if(p&&!p.closest(SKIP)){const v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v}return}
  if(n.nodeType!==1||n.closest(SKIP))return;
  for(const a of ['placeholder','title','aria-label']){const v=n.getAttribute(a);if(v&&HASCYR.test(v)){const w=tr(v);if(w!==v)n.setAttribute(a,w)}}
  const tw=document.createTreeWalker(n,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let x;
  while((x=tw.nextNode())){if(x.nodeType===3)trNode(x);else if(x.closest(SKIP))continue;else for(const a of ['placeholder','title','aria-label']){const v=x.getAttribute(a);if(v&&HASCYR.test(v)){const w=tr(v);if(w!==v)x.setAttribute(a,w)}}}
}
/* translate whatever gets rendered, now and later */
function i18nStart(){
  document.title=tr(document.title);
  trNode(document.body);
  new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')trNode(m.target);else for(const n of m.addedNodes)trNode(n)}}).observe(document.body,{subtree:true,childList:true,characterData:true});
}
/* long texts: deep-replace fields by path, e.g. "book.seq.html" or "T.pres.use.0" */
function i18nContent(roots){
  if(UI!=='uz')return;const C=I18N.content||{};
  for(const path in C){const ps=path.split('.');let o=roots[ps[0]];for(let i=1;i<ps.length-1&&o;i++){const k=ps[i];o=Array.isArray(o)&&isNaN(+k)?o.find(x=>x&&x.id===k):o[k]}
    if(o&&ps.length>1)o[ps[ps.length-1]]=C[path]}
}
let uiSwitching=false;
function setUI(u){
  if(u===UI||uiSwitching)return;uiSwitching=true;
  on.lang=u;X.ui=u;save();saveX();
  try{const x=JSON.parse(localStorage.getItem('tenses3x')||'{}');x.ui=u;localStorage.setItem('tenses3x',JSON.stringify(x))}catch(e){}
  /* give the browser a moment to persist the choice before the page is reloaded */
  document.body.style.opacity='.6';setTimeout(()=>location.reload(),200);
}
function renderLangSw(){const el=$('langSw');if(!el)return;el.innerHTML=['ru','uz'].map(l=>`<button data-ui="${l}" aria-pressed="${UI===l}" lang="${l}">${l==='ru'?'RU':'UZ'}</button>`).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ui]');if(b)setUI(b.dataset.ui)});
