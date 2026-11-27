/* ===== speech: English read-aloud with the browser voice (or the Claude voice when the page runs inside Claude) =====
   on.voice — read the answer after a check, on.slow — 0.75 speed. Any element with data-say="text" speaks on tap. */
if(on.voice===undefined)on.voice=1;
const SPK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
let tts=null,voiceEn=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices();voiceEn=vs.find(x=>/^en[-_]US/i.test(x.lang)&&/samantha|google|natural|premium|enhanced/i.test(x.name))||vs.find(x=>/^en[-_](US|GB)/i.test(x.lang))||vs.find(x=>/^en/i.test(x.lang))||null}catch(e){}}
try{if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}}catch(e){}
if(window.claude&&typeof window.claude.use==='function')window.claude.use('tts').then(t=>{if(t)tts=t}).catch(()=>{});
function say(text){
  stopSay();if(!text)return Promise.resolve();
  const rate=on.slow?0.75:1;
  if(tts)return tts.speak(text,{rate,language:'en'}).catch(e=>{if(e&&e.code==='not_granted')tts=null});
  const ss=window.speechSynthesis;if(!ss||typeof SpeechSynthesisUtterance==='undefined')return Promise.resolve();
  return new Promise(res=>{try{
    const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate*0.95;if(voiceEn)u.voice=voiceEn;
    const g=setTimeout(res,9000);const done=()=>{clearTimeout(g);res()};u.onend=done;u.onerror=done;ss.speak(u);
  }catch(e){res()}});
}
function stopSay(){try{if(tts)tts.stop();else if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}}
/* a small round speaker button; label is translated by the i18n layer */
const spkBtn=(text,label='Послушать')=>`<button class="spk" type="button" data-say="${esc(text)}" aria-label="${label}" title="${label}">${SPK}</button>`;
const sayBtn=text=>`<button class="say" type="button" data-say="${esc(text)}">${SPK}<span>Послушать</span></button>`;
/* read the right answer after a check, then call next (only when the answer was right) */
function readAnswer(text,good,next,delay){
  if(on.voice){const p=say(text);if(good&&next)p.then(()=>setTimeout(next,delay||300));return true}
  return false;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b){e.stopPropagation();say(b.dataset.say)}},true);
/* buttons that only speak must not take focus away from an input (keeps the iPhone keyboard open) */
const spkKeep=e=>{if(e.target.closest('[data-say]')&&document.activeElement&&document.activeElement.tagName==='INPUT')e.preventDefault()};
document.addEventListener('mousedown',spkKeep);document.addEventListener('pointerdown',spkKeep);
