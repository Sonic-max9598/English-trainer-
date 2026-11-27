// Builds the app: node build.js  →  index.html + sw.js (offline cache with a content-based version)
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const r=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const ls=d=>fs.readdirSync(path.join(__dirname,d)).sort();
const tenses=ls('data').filter(f=>/^tenses-.*\.txt$/.test(f)).map(f=>r('data/'+f).replace(/\r/g,'').replace(/\n+$/,'')).join('\n');
const mixed=r('data/mixed.txt').replace(/\r/g,'').replace(/\n+$/,'');
// words: base list (+examples) then extra files by level; duplicates are skipped
function words(){
  const ex={};for(const l of r('data/examples-base.txt').split('\n')){const i=l.indexOf('|');if(i>0)ex[l.slice(0,i)]=l.slice(i+1)}
  const seen=new Set(),out=[];let dup=[],noEx=[];
  const add=(l)=>{if(!l.trim())return;if(/^[@#]/.test(l)){out.push(l);return}
    const p=l.split('|');const k=p[0].trim();if(seen.has(k.toLowerCase())){dup.push(k);return}seen.add(k.toLowerCase());
    if(p.length<4){if(ex[k])p[3]=ex[k];else noEx.push(k)}out.push(p.slice(0,4).join('|'))};
  r('data/words-base.txt').split('\n').forEach(add);
  ls('data').filter(f=>/^words-\d.*\.txt$/.test(f)).forEach(f=>r('data/'+f).split('\n').forEach(add));
  const n=out.filter(l=>!/^[@#]/.test(l)).length;
  console.log('words:',n,'duplicates skipped:',dup.length,'| without example:',noEx.length);
  return out.join('\n');
}
console.log('mixed-tense sentences:',mixed.split('\n').length);
let js=r('src/app.js')
  .replace('/*@TEACHER*/',()=>r('src/teacher.js'))
  .replace('/*@TENSES_META*/',()=>r('src/tenses-meta.js'))
  .replace('/*@TENSE_TRAINER*/',()=>r('src/tense.js').replace('/*@MATCH*/',()=>r('src/match.js')))
  .replace('/*@WORDS*/',()=>r('src/words.js'))
  .replace('/*@I18N*/',()=>r('src/i18n.js').replace('__I18N__',()=>JSON.stringify({ru:JSON.parse(r('i18n/ru.json')),uz:JSON.parse(r('i18n/uz.json')),content:JSON.parse(r('i18n/uz-content.json'))})))
  .replace('/*@VERBS*/',()=>r('src/verbs.js').replace('__IRREG__',()=>JSON.stringify(r('data/irregular.txt').replace(/\r/g,'').trim())))
  .replace('/*@GAME*/',()=>r('src/game.js'))
  .replace('/*@BOOK*/',()=>r('src/theory-tenses.js')+r('src/theory-book.js')+r('src/book.js'))
  .replace('/*@PWA*/',()=>r('src/pwa.js'))
  .replace('__TENSES__',()=>JSON.stringify(tenses)).replace('__MIXED__',()=>JSON.stringify(mixed)).replace('__WORDS__',()=>JSON.stringify(words()));
if(process.env.TEST)js+='\nwindow.__dbg=s=>eval(s);';
let html=r('src/head.html').replace('/*@CSS*/',()=>r('src/style.css'))
  +r('src/body-top.html')+r('src/views-a.html')+r('src/views-b.html')+r('src/views-set.html')
  +r('src/nav.html').replace('/*@JS*/',()=>'const APP_VER="__APP_VER__";\n'+js);
// offline files: the page, manifest, icons, fonts
const assets=['manifest.json'].concat(ls('icons').filter(f=>/\.(png|svg)$/.test(f)).map(f=>'icons/'+f),ls('fonts').filter(f=>/\.woff2$/.test(f)).map(f=>'fonts/'+f));
const h=crypto.createHash('sha256');h.update(html);for(const a of assets)h.update(fs.readFileSync(path.join(__dirname,a)));
const ver=h.digest('hex').slice(0,10);
html=html.replace('__APP_VER__',ver.slice(0,7));
const out=process.env.TEST?'test-build.html':'index.html';
fs.writeFileSync(path.join(__dirname,out),html);
if(!process.env.TEST)fs.writeFileSync(path.join(__dirname,'sw.js'),r('src/sw.js').replace('__VERSION__',ver).replace('__FILES__',JSON.stringify(['./','./index.html'].concat(assets.map(a=>'./'+a)))));
console.log('ok',(html.length/1024).toFixed(0)+'KB','version',ver);
