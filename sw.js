const CACHE='tangram2-offline-stable-20261014-missoes-organizadas';
const CORE=[
  './',
  './index.html',
  './rai-robotica-t3-v18.json',
  './style.css?v=2.0.209-rai-dialog',
  './app.js?v=2.0.233-laboratorio-aulas',
  './manifest.webmanifest?v=310',
  './app-icon.svg?v=310',
  './file_000000007ad0820ebb1af4cac165a68a.png?v=149',
  './hanoi/index.html',
 './circuitos/laboratorio.html',
 './circuitos/index.html',
 './circuitos/computador.html',
 './circuitos/aulas.html',
 './circuitos/glossario.html',
 './circuitos/lab-program.js?v=2',
 './circuitos/rai-lab.js?v=20261014-1',
 './circuitos/lab-workspace.js?v=20261014-1',
 './circuitos/lab-electronics.js?v=20261014-1',
 './rai-programacao-v17.json',
 './rai-mundo-digital-v17.json',
 './circuitos/laboratorio-icon.svg',
 './circuitos/circuitos-icon.svg',
 './circuitos/computador-icon.svg',
 './circuitos/programacao-icon.svg'
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
