/* ===== lenient answer check =====
   Accepts: any case and punctuation, contractions, swapped clause order
   ("When I was…, the phone rang" = "The phone rang when I was…"), a time phrase moved to the front or end,
   common synonyms / British–American spelling, and one small typo in a content word.
   A missing or extra article is accepted with a note. */
const SYN={while:'when',film:'movie',films:'movies',mum:'mom',mother:'mom',mommy:'mom',father:'dad',daddy:'dad',kids:'children',kid:'child',
  store:'shop',stores:'shops',apartment:'flat',apartments:'flats',elevator:'lift',subway:'metro',underground:'metro',
  begin:'start',begins:'starts',began:'started',begun:'started',beginning:'starting',large:'big',huge:'big',
  repair:'fix',repairs:'fixes',repaired:'fixed',repairing:'fixing',centre:'center',colour:'color',favourite:'favorite',
  received:'got',receive:'get',receives:'gets',return:'come back',returned:'came back',returns:'comes back',
  quickly:'fast',rapidly:'fast',ill:'sick',unwell:'sick',autumn:'fall',holiday:'vacation',holidays:'vacations',
  cellphone:'phone',mobile:'phone',smartphone:'phone',grandma:'grandmother',granny:'grandmother',grandpa:'grandfather',
  realise:'realize',realised:'realized',organise:'organize',organised:'organized',travelling:'traveling',travelled:'traveled',
  learnt:'learned',dreamt:'dreamed',burnt:'burned',spelt:'spelled',ok:'okay',tv:'television',
  reply:'answer',replied:'answered',replies:'answers',respond:'answer',responded:'answered',
  arrive:'come',arrived:'came',arrives:'comes',arriving:'coming',
};
const M_CONJ="when|while|because|before|after|if|until|as soon as|by the time|since|although|though|unless|as";
const TIMEP=["yesterday","tomorrow","today","tonight","now","right now","at the moment","every day","every morning","every evening","every week","last week","last month","last year","last night","next week","next month","next year","this morning","this evening","this weekend","this year","on sundays","on weekends","in the morning","in the evening","in summer","in the summer","in winter","soon","already","at that time","at this time yesterday","this time tomorrow","at this time tomorrow","by then","by the end of the year"];
const ART=new Set(['a','an','the']);
const GRAM=new Set(['do','does','did','is','are','am','was','were','be','been','being','have','has','had','will','would','not','no','never','can','could','should','must','shall']);
function synWords(s){return s.split(' ').map(w=>SYN[w]||w).join(' ').replace(/\s+/g,' ').trim()}
/* clause swap on raw text: "When X, Y" <-> "Y when X" */
function clauseSwaps(raw){
  const out=[raw];const t=raw.trim().replace(/[.!?]+$/,'');
  const m=t.match(new RegExp('^('+M_CONJ+')\\b(.+?),\\s*(.+)$','i'));
  if(m)out.push(m[3]+' '+m[1]+m[2]);
  const k=t.match(new RegExp('^(.+?),?\\s+\\b('+M_CONJ+')\\b\\s+(.+)$','i'));
  if(k&&k[1].split(' ').length>1)out.push(k[2]+' '+k[3]+', '+k[1]);
  return out;
}
function timeMoves(n){
  const out=[n];
  for(const p of TIMEP){
    if(n.endsWith(' '+p)&&n.length>p.length+2)out.push(p+' '+n.slice(0,-p.length-1));
    if(n.startsWith(p+' ')&&n.length>p.length+2)out.push(n.slice(p.length+1)+' '+p);
  }
  return out;
}
/* every normalised reading of a raw string */
function readings(raw){
  const set=new Set();
  for(const r of clauseSwaps(raw))for(const v of variants(r))for(const t of timeMoves(v))set.add(synWords(t));
  return [...set];
}
const noArt=s=>s.split(' ').filter(w=>!ART.has(w)).join(' ');
function charDist(a,b){if(Math.abs(a.length-b.length)>2)return 3;const m=[];for(let i=0;i<=a.length;i++){m[i]=[i];for(let j=1;j<=b.length;j++)m[i][j]=i?Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1)):j}return m[a.length][b.length]}
/* one content word with a small typo (not a grammar word, not a changed ending like -s/-ed/-ing) */
function typoOnly(a,b){
  const x=a.split(' '),y=b.split(' ');if(x.length!==y.length)return false;let diff=0;
  for(let i=0;i<x.length;i++){if(x[i]===y[i])continue;diff++;if(diff>1)return false;
    const u=x[i],v=y[i];if(GRAM.has(u)||GRAM.has(v))return false;if(v.length<4||u.length<3)return false;
    if(knownWords().has(u))return false;/* a real word, so it is a different word, not a typo */
    const stem=s=>s.replace(/(ing|ed|es|s)$/,'');if(stem(u)===stem(v))return false;
    if(charDist(u,v)>(v.length>=8?2:1))return false}
  return diff===1;
}
let KNOWN=null;
function knownWords(){
  if(KNOWN)return KNOWN;KNOWN=new Set();
  const add=s=>{for(const w of norm(s).split(' '))if(w)KNOWN.add(w)};
  for(const it of BANK)it.all.forEach(add);
  for(const w of WD){add(w.en);if(w.ex)add(w.ex)}
  if(typeof IRREG!=='undefined')for(const v of IRREG)[v.v1,v.v2,v.v3].forEach(add);
  return KNOWN;
}
let ACC_CACHE=new WeakMap();
function judge(user,item){
  let acc=ACC_CACHE.get(item);
  if(!acc){acc=new Set();for(const a of item.all)for(const r of readings(a))acc.add(r);ACC_CACHE.set(item,acc)}
  const mine=readings(user);
  if(mine.some(v=>acc.has(v)))return{good:true};
  const accNo=[...acc].map(noArt);
  if(mine.some(v=>accNo.includes(noArt(v))))return{good:true,note:'Засчитано. Обрати внимание на артикли (a / an / the).'};
  for(const v of mine)for(const a of acc)if(typoOnly(v,a))return{good:true,note:'Засчитано, но есть опечатка.'};
  return{good:false};
}
