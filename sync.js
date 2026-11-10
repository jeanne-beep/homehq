// ---------- family sync (Supabase) + phone push alerts ----------
// Every top-level key of S (objects split one level deeper) is one row in the `kv` table.
const SYNC_LOCAL=new Set(['me','notified','notify','browse','dsub','ver','seedMC']);
const SYNC_LOCAL_SUB=new Set(['house/list']);
let sb=null,syncOn=false,syncState='',snap=JSON.parse(localStorage.getItem('hq_snap')||'{}'),pushT=0,pushing=false,renderT=0;
const saveSnap=()=>localStorage.setItem('hq_snap',JSON.stringify(snap));
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);

function flat(){const o={};
  for(const k in S){if(SYNC_LOCAL.has(k))continue;const v=S[k];
    if(isObj(v)){for(const s in v){const p=k+'/'+s;if(!SYNC_LOCAL_SUB.has(p)&&v[s]!==undefined)o[p]=JSON.stringify(v[s])}}
    else if(v!==undefined)o[k]=JSON.stringify(v)}
  return o}
function setPath(p,v){const i=p.indexOf('/');if(i<0){S[p]=v;return}
  const a=p.slice(0,i),b=p.slice(i+1);if(!isObj(S[a]))S[a]={};S[a][b]=v}
function delPath(p){const i=p.indexOf('/');if(i>0){const a=p.slice(0,i);if(isObj(S[a]))delete S[a][p.slice(i+1)]}}

function setSyncState(s){syncState=s;let d=document.getElementById('syncdot');
  if(!d){d=document.createElement('div');d.id='syncdot';d.className='syncdot';document.body.appendChild(d)}
  d.textContent=s==='ok'?'☁️ synced':s==='offline'?'⚠️ offline, will retry':'☁️ …';d.classList.toggle('bad',s==='offline')}

function softRender(){
  const a=document.activeElement,busy=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName),
    modalOpen=!$('#modal').classList.contains('hidden'),
    gaming=typeof G!=='undefined'&&G&&G.phase&&!['setup','done'].includes(G.phase);
  if(busy||modalOpen||gaming){clearTimeout(renderT);renderT=setTimeout(softRender,3000);return}
  render()}

async function syncPull(){
  const {data,error}=await sb.from('kv').select('key,value');if(error)throw error;
  const srv={};data.forEach(r=>srv[r.key]=JSON.stringify(r.value));
  const loc=flat();let changed=false;
  for(const p in srv){
    if(loc[p]===srv[p]){snap[p]=srv[p];continue}
    if(p in snap&&p in loc&&loc[p]!==snap[p])continue; // edited on this phone while offline; it will be pushed
    setPath(p,JSON.parse(srv[p]));snap[p]=srv[p];changed=true}
  for(const p in snap)if(!(p in srv)){
    if(p in loc&&loc[p]===snap[p]){delPath(p);changed=true}
    delete snap[p]}
  saveSnap();if(changed){save();softRender()}}

function syncPush(){if(!syncOn)return;clearTimeout(pushT);pushT=setTimeout(doPush,700)}
async function doPush(){
  if(pushing){pushT=setTimeout(doPush,700);return}
  pushing=true;
  try{const loc=flat(),up=[],del=[];
    for(const p in loc)if(snap[p]!==loc[p])up.push({key:p,value:JSON.parse(loc[p]),updated_at:new Date().toISOString()});
    for(const p in snap)if(!(p in loc))del.push(p);
    for(let i=0;i<up.length;i+=100){const {error}=await sb.from('kv').upsert(up.slice(i,i+100));if(error)throw error}
    if(del.length){const {error}=await sb.from('kv').delete().in('key',del);if(error)throw error}
    up.forEach(r=>snap[r.key]=loc[r.key]);del.forEach(p=>delete snap[p]);saveSnap();setSyncState('ok');
    if(up.some(r=>r.key==='events'))setTimeout(syncReminders,3000)
  }catch(e){setSyncState('offline')}finally{pushing=false}}

function onRemote(pl){
  const old=pl.eventType==='DELETE',p=(old?pl.old:pl.new).key;if(!p)return;
  const loc=flat();
  if(old){if(p in loc&&loc[p]===snap[p]){delPath(p);delete snap[p];saveSnap();save();softRender()}return}
  const js=JSON.stringify(pl.new.value);
  if(snap[p]===js)return;
  if(p in loc&&loc[p]!==snap[p])return; // unsent local edit wins
  if(loc[p]!==js){setPath(p,pl.new.value);save();softRender()}
  snap[p]=js;saveSnap()}

async function syncReminders(){
  if(!syncOn)return;
  const rows=[],now=Date.now();
  for(let i=0;i<3;i++){const d=new Date();d.setDate(d.getDate()+i);const dk=dkey(d);
    for(const p of PEOPLE)for(const t of tasksFor(p.id,d)){
      const [h,m]=t.t.split(':').map(Number),f=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m);
      if(f.getTime()<=now)continue;
      rows.push({id:`${dk}:${p.id}:${t.id}`,person:p.id,task_date:dk,task_id:t.id,fire_at:f.toISOString(),title:'⏰ '+fmt12(t.t),body:t.title})}
    for(const e of S.events.filter(e=>e.date===dk&&e.time)){
      const [h,m]=e.time.split(':').map(Number),f=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m-30);
      if(f.getTime()<=now)continue;
      (e.who&&e.who.length?e.who:PEOPLE.map(p=>p.id)).forEach(w=>rows.push({id:`ev:${e.id}:${w}`,person:w,task_date:null,task_id:null,fire_at:f.toISOString(),title:'📅 In 30 min: '+fmt12(e.time),body:e.title}))}}
  try{
    for(let i=0;i<rows.length;i+=150){const {error}=await sb.from('reminders').upsert(rows.slice(i,i+150));if(error)throw error}
    const keep=new Set(rows.map(r=>r.id)),{data}=await sb.from('reminders').select('id').eq('sent',false).gt('fire_at',new Date().toISOString()).limit(5000);
    const stale=(data||[]).map(r=>r.id).filter(id=>!keep.has(id));
    for(let i=0;i<stale.length;i+=100)await sb.from('reminders').delete().in('id',stale.slice(i,i+100));
    localStorage.setItem('hq_rem',Date.now())
  }catch(e){}}

const b64u=s=>{const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))};
const pushCapable=()=>'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
async function savePushSub(sub){await sb.from('push_subs').upsert({endpoint:sub.endpoint,person:S.me,sub:sub.toJSON()})}
async function enablePush(){
  if(!S.me)return toast('Pick your profile first');
  if(!pushCapable())return alert('On iPhone: open this link in Safari, tap Share → Add to Home Screen, then open HomeHQ from your Home Screen and tap this button again.');
  try{
    if(await Notification.requestPermission()!=='granted')return toast('Notifications are blocked in Settings');
    const reg=await navigator.serviceWorker.ready;
    const sub=await reg.pushManager.getSubscription()||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(HQ_CFG.vapidPublic)});
    await savePushSub(sub);localStorage.setItem('hq_push',S.me);toast('Phone alerts are on 🔔');render()
  }catch(e){alert('Could not turn on alerts: '+e.message)}}
async function testPush(){
  const {error}=await sb.from('reminders').upsert({id:'test:'+S.me+':'+Date.now(),person:S.me,fire_at:new Date().toISOString(),title:'🔔 HomeHQ test',body:'Phone alerts work!'});
  toast(error?'Could not queue test':'Test alert sent. Arrives within a minute.')}
async function syncSignOut(){if(!confirm('Sign this phone out of family sync?'))return;await sb.auth.signOut();snap={};saveSnap();location.reload()}

function vSyncCard(){
  if(!sb)return'';
  const on=localStorage.getItem('hq_push')===S.me&&pushCapable()&&Notification.permission==='granted';
  return`<div class="card"><h3>☁️ Family sync &amp; phone alerts</h3>
    <p class="sm mut">Everyone's calendar, tasks and points stay in sync across phones.${on?' Alerts will arrive even when the app is closed.':''}</p>
    <div class="row">${on?`<button class="btn g" onclick="testPush()">Send me a test alert</button>`:`<button class="btn g" onclick="enablePush()">🔔 Turn on phone alerts</button>`}
    <button class="btn s" onclick="syncSignOut()">Sign out</button></div>
    ${pushCapable()?'':'<p class="sm mut">iPhone: open in Safari → Share → Add to Home Screen, then open it from your Home Screen to enable alerts.</p>'}</div>`}

function syncGate(msg){
  let g=document.getElementById('gate');if(!g){g=document.createElement('div');g.id='gate';g.className='modal';document.body.appendChild(g)}
  g.innerHTML=`<div><h2>🏡 Family sign-in</h2><p class="sm mut">Enter the family email and password once on this phone.</p>
    <input id="gem" type="email" placeholder="Family email" autocapitalize="none" autocomplete="username">
    <input id="gpw" type="password" placeholder="Family password" autocomplete="current-password" onkeydown="if(event.key==='Enter')syncLogin()">
    <p class="sm" style="color:#f87171">${msg||''}</p><button class="btn g" onclick="syncLogin()">Sign in</button></div>`}
async function syncLogin(){
  const {error}=await sb.auth.signInWithPassword({email:$('#gem').value.trim(),password:$('#gpw').value});
  if(error)return syncGate('Could not sign in: '+error.message);
  document.getElementById('gate').remove();syncStart()}

async function syncStart(){
  setSyncState('');
  try{await syncPull();syncOn=true;setSyncState('ok');syncPush()}catch(e){syncOn=true;setSyncState('offline')}
  sb.channel('kv-live').on('postgres_changes',{event:'*',schema:'public',table:'kv'},onRemote).subscribe();
  setInterval(()=>{if(!document.hidden)syncPull().then(()=>{if(syncState!=='ok')setSyncState('ok');syncPush()}).catch(()=>setSyncState('offline'))},60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncPull().then(()=>{setSyncState('ok');syncPush()}).catch(()=>setSyncState('offline'))});
  addEventListener('online',()=>{syncPull().then(syncPush).catch(()=>{})});
  if(localStorage.getItem('hq_push')&&pushCapable()&&Notification.permission==='granted'&&S.me)
    navigator.serviceWorker.ready.then(r=>r.pushManager.getSubscription()).then(s=>s&&savePushSub(s)).catch(()=>{});
  setTimeout(syncReminders,4000);setInterval(syncReminders,3*3600e3);
  if(typeof seedEvents==='function')seedEvents();render()}

async function syncInit(){
  if(!HQ_CFG.url||!HQ_CFG.anonKey||typeof supabase==='undefined')return;
  sb=supabase.createClient(HQ_CFG.url,HQ_CFG.anonKey);
  const {data}=await sb.auth.getSession();
  if(data.session)syncStart();else syncGate();
  sb.auth.onAuthStateChange((ev,s)=>{if(ev==='SIGNED_OUT'&&!s)syncGate()})}
