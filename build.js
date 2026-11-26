// Builds the single-file app: node build.js  →  "Тренажёр времён.html"
const fs=require('fs'),path=require('path');
const r=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const data=f=>JSON.stringify(r(f).replace(/\r/g,'').replace(/\n+$/,''));
const tenses=fs.readdirSync(path.join(__dirname,'data')).filter(f=>/^tenses-.*\.txt$/.test(f)).sort().map(f=>r('data/'+f).replace(/\n+$/,'')).join('\n');
let js=r('src/app.js').replace('/*@TENSES_META*/',()=>r('src/tenses-meta.js')).replace('/*@TENSE_TRAINER*/',()=>r('src/tense.js')).replace('__TENSES__',JSON.stringify(tenses)).replace('__WORDS__',data('data/words-base.txt'));
if(process.env.TEST)js+='\nwindow.__dbg=s=>eval(s);';
const html=r('src/head.html').replace('/*@CSS*/',()=>r('src/style.css'))
  +r('src/body-top.html')+r('src/views-a.html')+r('src/art-theory.html')+r('src/views-b.html')+r('src/views-set.html')
  +r('src/nav.html').replace('/*@JS*/',()=>js);
// keep the original file name exactly (it uses a decomposed «ё»)
const out=process.env.TEST?'test-build.html':(fs.readdirSync(__dirname).find(f=>f.endsWith('.html')&&f!=='test-build.html')||'Тренажёр времён.html');
fs.writeFileSync(path.join(__dirname,out),html);
console.log('ok',(html.length/1024).toFixed(0)+'KB');
