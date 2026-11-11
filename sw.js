const C='go-v61',FBC='go-fb-1';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))))});
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==FBC).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// الصفحة والملفات: network-first (بتتخطى كاش المتصفح بتاع GitHub Pages) لحد 3 ثواني، وإلا بتفتح من الكاش. مكتبات فايربيس: كاش دايم.
async function same(r){
 const k=await caches.open(C);
 const c=await k.match(r);
 const net=fetch(r.url,{cache:'no-cache'}).then(x=>{if(x&&x.ok)k.put(r,x.clone());return x});
 if(!c)return net.catch(()=>k.match('./index.html'));
 return Promise.race([net.catch(()=>c),new Promise(ok=>setTimeout(()=>ok(c),3000))]);
}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
if(u.origin===self.location.origin){e.respondWith(same(r));return}
if(u.hostname==='www.gstatic.com'&&u.pathname.indexOf('/firebasejs/')===0){e.respondWith(caches.match(r).then(c=>c||fetch(r).then(x=>{if(x&&x.ok){const cp=x.clone();caches.open(FBC).then(k=>k.put(r,cp))}return x})))}});
self.addEventListener('push',e=>{let j={};try{j=e.data?e.data.json():{}}catch(_){}const n=j.notification||{},d=j.data||{};
e.waitUntil(self.registration.showNotification(d.title||n.title||'جو سوبر ماركت',{body:d.body||n.body||'',icon:'./icon-192.png',badge:'./icon-192.png',tag:d.tag||('n'+Date.now()),requireInteraction:true,data:{url:d.url||'./'},dir:'rtl',lang:'ar',vibrate:[300,150,300,150,300]}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data&&e.notification.data.url)||'./';
e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return clients.openWindow(u)}))});
