// Builds the single-file app: node build.js  →  "Тренажёр времён.html"
const fs=require('fs'),path=require('path');
const r=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const data=f=>JSON.stringify(r(f).replace(/\r/g,'').replace(/\n+$/,''));
const tenses=fs.readdirSync(path.join(__dirname,'data')).filter(f=>/^tenses-.*\.txt$/.test(f)).sort().map(f=>r('data/'+f).replace(/\n+$/,'')).join('\n');
// words: base list (+examples) then extra files by level; duplicates are skipped
function words(){
  const ex={};for(const l of r('data/examples-base.txt').split('\n')){const i=l.indexOf('|');if(i>0)ex[l.slice(0,i)]=l.slice(i+1)}
  const seen=new Set(),out=[];let dup=[],noEx=[];
  const add=(l)=>{if(!l.trim())return;if(/^[@#]/.test(l)){out.push(l);return}
    const p=l.split('|');const k=p[0].trim();if(seen.has(k.toLowerCase())){dup.push(k);return}seen.add(k.toLowerCase());
    if(p.length<4){if(ex[k])p[3]=ex[k];else noEx.push(k)}out.push(p.slice(0,4).join('|'))};
  r('data/words-base.txt').split('\n').forEach(add);
  fs.readdirSync(path.join(__dirname,'data')).filter(f=>/^words-\d.*\.txt$/.test(f)).sort().forEach(f=>r('data/'+f).split('\n').forEach(add));
  const n=out.filter(l=>!/^[@#]/.test(l)).length;
  console.log('words:',n,'duplicates skipped:',dup.length,dup.slice(0,40).join(', '),'| without example:',noEx.length,noEx.slice(0,10).join(', '));
  return out.join('\n');
}
let js=r('src/app.js').replace('/*@TENSES_META*/',()=>r('src/tenses-meta.js')).replace('/*@TENSE_TRAINER*/',()=>r('src/tense.js')).replace('/*@WORDS*/',()=>r('src/words.js')).replace('/*@GAME*/',()=>r('src/game.js')).replace('__TENSES__',JSON.stringify(tenses)).replace('__WORDS__',JSON.stringify(words()));
if(process.env.TEST)js+='\nwindow.__dbg=s=>eval(s);';
const html=r('src/head.html').replace('/*@CSS*/',()=>r('src/style.css'))
  +r('src/body-top.html')+r('src/views-a.html')+r('src/art-theory.html')+r('src/views-b.html')+r('src/views-set.html')
  +r('src/nav.html').replace('/*@JS*/',()=>js);
// keep the original file name exactly (it uses a decomposed «ё»)
const out=process.env.TEST?'test-build.html':(fs.readdirSync(__dirname).find(f=>f.endsWith('.html')&&f!=='test-build.html')||'Тренажёр времён.html');
fs.writeFileSync(path.join(__dirname,out),html);
console.log('ok',(html.length/1024).toFixed(0)+'KB');
