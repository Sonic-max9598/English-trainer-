/* English Intensive — offline cache. Built by build.js: the version and file list are filled in on every build. */
const CACHE='english-intensive-54dc941941';
const FILES=["./","./index.html","./manifest.json","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/icon-maskable.svg","./icons/icon.svg","./fonts/literata-cyr.woff2","./fonts/literata-lat.woff2","./fonts/nunito-cyr.woff2","./fonts/nunito-lat.woff2"];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('english-intensive-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){
    e.respondWith(caches.match('./index.html').then(r=>r||fetch(req)));return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res;
  })));
});
