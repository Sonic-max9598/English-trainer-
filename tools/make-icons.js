// Draws the app icon (teacher on a valley landscape) → icons/icon.svg, icons/icon-maskable.svg
// PNGs are rendered from these by tools/make-icons.py (Playwright).
const fs=require('fs'),path=require('path');
eval(fs.readFileSync(path.join(__dirname,'../src/teacher.js'),'utf8')+';global.teacherSVG=teacherSVG');
function icon(scale){
  const t=teacherSVG('m').replace(/viewBox="[^"]+"/,'viewBox="8 6 104 104"').replace('<svg ','<svg x="'+(256-200*scale)+'" y="'+(472-400*scale)+'" width="'+400*scale+'" height="'+400*scale+'" ')
    .replace(/class="(p-happy|p-cheer|p-think|e-joy|mo-happy|mo-cheer|mo-think|x-think|x-happy|b-up|b-th|t-shadow)"/g,'class="$1" display="none"');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb8f5"/><stop offset=".62" stop-color="#d6ecff"/></linearGradient></defs>
<rect width="512" height="512" fill="url(#s)"/>
<circle cx="404" cy="104" r="44" fill="#ffd66b" opacity=".9"/>
<path d="M0 352L80 236 132 290 214 186 288 282 360 210 440 300 512 250V512H0z" fill="#9bb7de"/>
<path d="M214 186l-22 34 12-4 10 12 9-13 12 6z M360 210l-18 28 10-3 8 10 8-11 10 5z" fill="#fff"/>
<path d="M0 404Q128 350 256 386T512 376V512H0z" fill="#8fd17e"/>
${t}
<path d="M0 452Q140 420 280 444T512 436V512H0z" fill="#6cbc5f"/></svg>`;
}
fs.writeFileSync(path.join(__dirname,'../icons/icon.svg'),icon(1));
fs.writeFileSync(path.join(__dirname,'../icons/icon-maskable.svg'),icon(.78));
console.log('svg ok');
