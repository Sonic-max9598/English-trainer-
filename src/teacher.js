/* ===== teacher mascot: original character, two variants ('m' — teacher, 'f' — teacher with a red bow) =====
   One SVG holds every pose; CSS shows the right parts by data-mood on the wrapper:
   idle · happy (correct answer) · cheer (after a mistake) · think (theory). No ids, so many copies can live on a page. */
const TCH={
  m:{name:'Мистер Сэм',who:'учитель',hair:'#7b4a2c',hairHi:'#9a6240'},
  f:{name:'Мисс Лола',who:'учительница',hair:'#5a2f25',hairHi:'#7a4234'}
};
function teacherSVG(g,crop){
  const L='#2c2540',SK='#f7d2b4',SKD='#e9b693',RED='#e5484d',RED2='#c23136',NAVY='#33416b',POINT='#a8743f';
  const h=TCH[g==='f'?'f':'m'];
  const vb=crop?'20 10 80 80':'0 0 120 150';
  const arm=(d,cls)=>`<g class="${cls}"><path d="${d}" fill="none" stroke="${L}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const hand=(x,y,cls)=>`<circle class="${cls}" cx="${x}" cy="${y}" r="5.4" fill="${SK}" stroke="${L}" stroke-width="2"/>`;
  const pointer=(x1,y1,x2,y2,cls)=>`<g class="${cls}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${L}" stroke-width="5" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${POINT}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="3.2" fill="${RED}" stroke="${L}" stroke-width="1.6"/></g>`;
  /* legs & lower body */
  const lower=g==='f'
    ?`<path d="M52 128v10M68 128v10" stroke="${L}" stroke-width="7" stroke-linecap="round"/><path d="M52 128v10M68 128v10" stroke="${SK}" stroke-width="3.6" stroke-linecap="round"/>
      <ellipse cx="51" cy="141" rx="6.5" ry="3.8" fill="${RED2}" stroke="${L}" stroke-width="2"/><ellipse cx="69" cy="141" rx="6.5" ry="3.8" fill="${RED2}" stroke="${L}" stroke-width="2"/>
      <path d="M43 112h34l5 18q0 3-3 3H41q-3 0-3-3z" fill="${NAVY}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`
    :`<path d="M47 116h26v22q0 3-3 3h-7l-3-14-3 14h-7q-3 0-3-3z" fill="${NAVY}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="51" cy="142" rx="7" ry="3.8" fill="#4a3329" stroke="${L}" stroke-width="2"/><ellipse cx="69" cy="142" rx="7" ry="3.8" fill="#4a3329" stroke="${L}" stroke-width="2"/>`;
  const backHair=g==='f'?`<path d="M28 52q-2-30 32-32q34 2 32 32l2 30q-6 6-14 3l-4-26H44l-4 26q-8 3-14-3z" fill="${h.hair}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`:'';
  /* torso: white shirt */
  const torso=`<path d="M40 96q0-14 13-15h14q13 1 13 15v22q0 4-4 4H44q-4 0-4-4z" fill="#fff" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M60 84v36" stroke="#d9dbe7" stroke-width="1.6"/><circle cx="60" cy="98" r="1.3" fill="#c3c6d6"/><circle cx="60" cy="107" r="1.3" fill="#c3c6d6"/>
    <path d="M52 81l8 7 8-7" fill="#fff" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
  const neckwear=g==='f'
    ?`<path d="M53 82q7 6 14 0l1 3q-8 6-16 0z" fill="${RED}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/><path d="M62 86l7 14-5 1-4-12z" fill="${RED}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="61" cy="86" r="3" fill="${RED2}" stroke="${L}" stroke-width="1.6"/>`
    :`<path d="M60 87l-10-5v11zM60 87l10-5v11z" fill="${RED}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><rect x="57" y="84" width="6" height="6" rx="2" fill="${RED2}" stroke="${L}" stroke-width="1.8"/>`;
  /* arms by pose (left = viewer's left) */
  const arms=
     arm('M44 88q-8 10-8 22','p-idle')+hand(36,111,'p-idle')
    +arm('M76 88q9 6 10 16','p-idle')+pointer(85,106,110,70,'p-idle')+hand(86,105,'p-idle')
    +arm('M44 88q-10-2-16-14','p-happy')+hand(27,72,'p-happy')
    +arm('M76 88q10-2 16-14','p-happy')+pointer(93,72,104,28,'p-happy')+hand(93,71,'p-happy')
    +arm('M44 88q-12-2-17-16','p-cheer')+`<g class="p-cheer"><rect x="20" y="62" width="12" height="11" rx="5" fill="${SK}" stroke="${L}" stroke-width="2"/><path d="M22 66h8M22 69.5h8" stroke="${SKD}" stroke-width="1.4" stroke-linecap="round"/><path d="M14 60q-3 5 0 10M10 57q-5 8 0 16" stroke="${L}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/></g>`
    +arm('M76 88q9 6 10 16','p-cheer')+pointer(85,106,110,70,'p-cheer')+hand(86,105,'p-cheer')
    +arm('M46 90q4 0 12-8','p-think')+hand(60,80,'p-think')
    +arm('M76 88q8 8 10 20','p-think')+pointer(86,108,96,142,'p-think')+hand(86,108,'p-think');
  /* head */
  const ears=`<circle cx="30" cy="56" r="6" fill="${SK}" stroke="${L}" stroke-width="2.2"/><circle cx="90" cy="56" r="6" fill="${SK}" stroke="${L}" stroke-width="2.2"/>`;
  const head=`<circle cx="60" cy="52" r="30" fill="${SK}" stroke="${L}" stroke-width="2.4"/>`;
  const hair=g==='f'
    ?`<path d="M30 55q-3-35 30-35q33 0 30 35q-4-13-13-17q-7 8-17 8q-9 0-15-7q-9 5-15 16z" fill="${h.hair}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>
       <path d="M50 30q6-4 14-3" stroke="${h.hairHi}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
       <g transform="rotate(-18 80 25)"><path d="M80 25l-13-8v16zM80 25l13-8v16z" fill="${RED}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><circle cx="80" cy="25" r="3.6" fill="${RED2}" stroke="${L}" stroke-width="1.8"/></g>`
    :`<path d="M31 52q-3-31 27-32q30-1 32 28q-6-10-17-12q-10 7-28 4q-8 3-11 12z" fill="${h.hair}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>
       <path d="M46 27q10-5 22-2" stroke="${h.hairHi}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  const cheeks=`<ellipse cx="40" cy="68" rx="5.5" ry="3.4" fill="#ff9aa6" opacity=".55"/><ellipse cx="80" cy="68" rx="5.5" ry="3.4" fill="#ff9aa6" opacity=".55"/>`;
  const brows=`<g class="e-brow" stroke="${h.hair}" stroke-width="3" stroke-linecap="round" fill="none"><path class="b-n" d="M42 39q6-3 12 0M66 39q6-3 12 0"/><path class="b-up" d="M42 37q6-4 12-1M66 36q6-3 12 1"/><path class="b-th" d="M42 40q6-2 12 0M66 35q6-4 12-1"/></g>`;
  const eyes=`<g class="e-open"><circle cx="48" cy="55" r="8.4" fill="#fff"/><circle cx="72" cy="55" r="8.4" fill="#fff"/>
      <g class="pup"><circle cx="48.5" cy="56" r="5.2" fill="${L}"/><circle cx="72.5" cy="56" r="5.2" fill="${L}"/><circle cx="50.3" cy="54" r="1.9" fill="#fff"/><circle cx="74.3" cy="54" r="1.9" fill="#fff"/></g></g>
    <g class="e-joy" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"><path d="M42.5 58q5.5-7 11 0M66.5 58q5.5-7 11 0"/></g>`;
  const glasses=`<g fill="none" stroke="${L}" stroke-width="2.6"><circle cx="48" cy="55" r="11.5" fill="rgba(255,255,255,.18)"/><circle cx="72" cy="55" r="11.5" fill="rgba(255,255,255,.18)"/><path d="M59.5 54q.5-2 1 0M36.6 54l-5-2M83.4 54l5-2" stroke-linecap="round"/></g>
    <path d="M41 49q3-3 6-3.5M65 49q3-3 6-3.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`;
  const nose=`<path d="M58.5 63q1.5 2 3 0" stroke="${SKD}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  const mouths=`<path class="mo-idle" d="M53 70q7 6.5 14 0" fill="none" stroke="${L}" stroke-width="2.8" stroke-linecap="round"/>
    <g class="mo-happy"><path d="M50 68.5q10 14 20 0z" fill="${L}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><path d="M55 75.5q5-3 10 0q-5 3-10 0z" fill="#ff8a8f"/></g>
    <path class="mo-cheer" d="M52 70q8 8 16 0q-8 3-16 0z" fill="${L}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>
    <path class="mo-think" d="M55 73q4-2.5 9 .5" fill="none" stroke="${L}" stroke-width="2.8" stroke-linecap="round"/>`;
  const extras=`<g class="x-think" fill="#fff" stroke="${L}" stroke-width="1.8"><circle cx="97" cy="30" r="3"/><circle cx="104" cy="20" r="4.2"/><circle cx="112" cy="8" r="5.4"/></g>
    <g class="x-happy" fill="#ffc43d" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"><path d="M16 46l2.2 4.6 4.8.8-3.5 3.3.9 4.9-4.4-2.4-4.4 2.4.9-4.9-3.5-3.3 4.8-.8z"/><path d="M104 52l1.6 3.3 3.5.6-2.5 2.4.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.5-2.4 3.5-.6z"/></g>`;
  return `<svg viewBox="${vb}" aria-hidden="true" focusable="false"><g class="t-shadow"><ellipse cx="60" cy="144" rx="24" ry="4.5" fill="#1b2540" opacity=".16"/></g><g class="t-body">`
    +backHair+lower+torso+neckwear+arms+ears+head+hair+cheeks+brows+eyes+glasses+nose+mouths+extras+'</g></svg>';
}
