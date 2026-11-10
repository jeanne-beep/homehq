const C='homehq-v3',F=['./','index.html','styles.css','data.js','homedata.js','home.js','sync.js','config.js','supabase.js','app.js','manifest.json','icon-192.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(F)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch{}
  e.waitUntil(self.registration.showNotification(d.title||'HomeHQ',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag,data:{url:'./'}}))});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
