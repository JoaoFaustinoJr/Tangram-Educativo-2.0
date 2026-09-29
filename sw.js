const CACHE='tangram2-v363';
const ASSETS=['./style.css?v=363','./app.js?v=363','./manifest.webmanifest?v=310','./app-icon.svg?v=310','./file_000000007ad0820ebb1af4cac165a68a.png?v=149'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tangram2-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'reload'}).then(r=>r).catch(()=>caches.match('./index.html')));return}if(u.origin===location.origin){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r&&r.ok)caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));}});
