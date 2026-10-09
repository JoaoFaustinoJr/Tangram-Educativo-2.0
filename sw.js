const CACHE='tangram2-offline-stable-20261009-rotate45';
const CORE=[
  './',
  './index.html',
  './rai-robotica-t3-v18.json',
  './style.css?v=2.0.209-rai-dialog',
  './app.js?v=2.0.216-mosaic-rotate45',
  './manifest.webmanifest?v=310',
  './app-icon.svg?v=310',
  './file_000000007ad0820ebb1af4cac165a68a.png?v=149',
  './hanoi/index.html'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url))))
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('tangram2-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(event.request,{ignoreSearch:true})
          .then(hit=>hit||caches.match('./index.html')))
    );
    return;
  }

  const critical=/\.(?:css|js)$/.test(url.pathname)||url.pathname.endsWith('/hanoi/index.html');
  if(critical){
    event.respondWith(fetch(event.request).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request,{ignoreSearch:true})));
    return;
  }
  event.respondWith((/\.(?:js|css)$/i.test(url.pathname)?fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request,{ignoreSearch:true})):caches.match(event.request,{ignoreSearch:true}).then(hit=>hit||fetch(event.request).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }))));
});