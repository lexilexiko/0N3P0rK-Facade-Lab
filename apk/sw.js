// ФасадЛаб: офлайн-режим. Кэшируем оболочку приложения; обновления подтягиваются в фоне.
const CACHE='fasadlab-v135';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==location.origin)return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(request,{ignoreSearch:true});
    const network=fetch(request).then(response=>{if(response&&response.ok)cache.put(request,response.clone());return response;}).catch(()=>null);
    return cached||(await network)||(request.mode==='navigate'?cache.match('index.html'):Response.error());
  }));
});
