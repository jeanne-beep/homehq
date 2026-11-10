'use strict';
// Whole-house cleans, home care, projects, and design views. Loaded before app.js.
const SEASONS=['winter','spring','summer','fall'];
function seasonOf(d=new Date()){const m=d.getMonth();
  const name=m===11||m<2?'winter':m<5?'spring':m<8?'summer':'fall';
  return {name,key:(m<2?d.getFullYear()-1:d.getFullYear())+name}}
const SEASON_EMOJI={winter:'❄️',spring:'🌸',summer:'☀️',fall:'🍂'};
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';

// ---------- whole house ----------
function houseItems(lk){const out=[];HOUSE_LISTS[lk].zones.forEach((z,zi)=>z.jobs.forEach((j,ji)=>out.push({id:`${lk}:${zi}:${ji}`,zi,txt:j[0],who:j[1]})));return out}
function vHouse(me){
  const lk=S.house.list;
  if(lk==='game')return houseTabs(lk)+`<div id="game">${gameHtml(me)}</div>`;
  const L=HOUSE_LISTS[lk],items=houseItems(lk),dn=S.house.done,n=items.filter(x=>dn[x.id]).length,all=n===items.length;
  const chip=p=>{const mine=items.filter(x=>x.who===p.id);return mine.length?`<span class="pill">${p.emoji} ${mine.filter(x=>dn[x.id]).length}/${mine.length}</span>`:''};
  const job=x=>{const p=person(x.who);return `<div class="row"><button class="chk ${dn[x.id]?'done':''}" onclick="houseTog('${x.id}')">${dn[x.id]?'✓':''}</button>
    <span class="grow ${dn[x.id]?'mut':''}">${esc(x.txt)}</span><span title="${p.name}">${p.emoji}</span></div>`};
  const mine=items.filter(x=>x.who===me.id);
  return `${houseTabs(lk)}
  <div class="card"><h3>${esc(L.title)}</h3><p class="sm mut">${esc(L.intro)}</p>
   <div class="bar"><i style="width:${n/items.length*100}%"></i></div><p class="sm mut">${n}/${items.length} done</p>
   <p>${PEOPLE.map(chip).join(' ')}</p>
   ${me.parent?`<button class="btn g" ${all?'':'disabled'} onclick="houseFinish()">Everyone finished! +25 each</button> `:''}
   <button class="btn s" onclick="houseReset()">Start a fresh round</button></div>
  ${mine.length?`<div class="card"><h2>${me.emoji} My jobs</h2>${mine.map(job).join('')}</div>`:''}
  ${L.zones.map((z,zi)=>`<div class="card"><h3>${z.z}</h3>${items.filter(x=>x.zi===zi).map(job).join('')}</div>`).join('')}`;
}
function houseTabs(lk){return `<h1>🧽 Whole House</h1><div class="opts" style="margin-bottom:12px"><button class="opt ${lk==='game'?'on':''}" onclick="houseSwitch('game')">🎵 Musical Chores (game)</button>${Object.keys(HOUSE_LISTS).map(k=>`<button class="opt ${lk===k?'on':''}" onclick="houseSwitch('${k}')">${esc(HOUSE_LISTS[k].title)}</button>`).join('')}</div>`}
function houseTog(id){const me=person(S.me),it=houseItems(S.house.list).find(x=>x.id===id);
  if(!me.parent&&it.who!==S.me)return toast('That one is someone else\u2019s job');
  if(S.house.done[id])delete S.house.done[id];else S.house.done[id]=1;save();render()}
function houseSwitch(k){S.house.list=k;save();render()}
function houseReset(){if(!confirm('Clear all checkmarks on this list?'))return;houseItems(S.house.list).forEach(x=>delete S.house.done[x.id]);save();render()}
function houseFinish(){const k=dkey(),note='Whole-house clean: '+HOUSE_LISTS[S.house.list].title;
  if(S.bonus.some(b=>b.date===k&&b.note===note))return toast('Already awarded today');
  PEOPLE.forEach(p=>S.bonus.push({who:p.id,pts:25,note,date:k}));save();toast('Team clean! +25 each 🎉');render()}

// ---------- home care ----------
function maintAll(){return HOME_TASKS.map((t,i)=>({...t,id:'h'+i})).concat((S.customMaint||[]))}
function maintPeriod(t){const s=seasonOf();return t.f==='weekly'?wkey():t.f==='monthly'?dkey().slice(0,7):s.key}
const maintDone=t=>S.maint[maintPeriod(t)+'|'+t.id];
function maintDue(){const s=seasonOf().name;
  return maintAll().filter(t=>t.f!=='seasonal'||(t.s||[]).includes(s))}
function vMaint(me){
  const s=seasonOf(),due=maintDue(),next=SEASONS[(SEASONS.indexOf(s.name)+1)%4];
  const row=t=>{const d=maintDone(t),w=t.w==='either'?'🏠':person(t.w).emoji;
    return `<div class="row"><button class="chk ${d?'done':''}" onclick="maintTog('${t.id}')">${d?'✓':''}</button>
     <span class="grow ${d?'mut':''}"><b>${esc(t.a)}</b> ${esc(t.t)}</span><span title="${t.w}">${w}</span>
     ${t.custom?`<button class="btn s" onclick="delMaint('${t.id}')">✕</button>`:''}</div>`};
  const sec=(title,f)=>{const l=due.filter(t=>t.f===f),n=l.filter(maintDone).length;
    return `<div class="card"><h2>${title} <span class="pill">${n}/${l.length}</span></h2>${l.map(row).join('')||'<p class="mut sm">Nothing here.</p>'}</div>`};
  const pre=maintAll().filter(t=>t.f==='seasonal'&&(t.s||[]).includes(next));
  return `<h1>🛠️ Home Care</h1><p class="mut sm">Recurring jobs for the house, pool, bees, well, septic, yard and animals. 🛠️ = Eli, 🌻 = Jeanne, 🏠 = whoever has time. Jeanne: follow your surgeon\u2019s restrictions; pick the light ones.</p>
  ${sec('This week','weekly')}${sec('This month','monthly')}${sec(SEASON_EMOJI[s.name]+' This season: '+s.name,'seasonal')}
  <div class="card"><details><summary><b>Coming up: ${SEASON_EMOJI[next]} ${next}</b></summary>${pre.map(t=>`<div class="row"><span class="grow"><b>${esc(t.a)}</b> ${esc(t.t)}</span></div>`).join('')}</details></div>
  <div class="card"><h3>Add a task</h3><input id="ma" placeholder="Area (e.g. 🌿 Yard)"><input id="mt" placeholder="Task">
   <select id="mf"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="seasonal">This season</option></select>
   <select id="mw"><option value="either">Anyone</option><option value="eli">Eli</option><option value="jeanne">Jeanne</option></select>
   <button class="btn" onclick="addMaint()">Add</button></div>`;
}
function vHomeDue(){
  const open=maintDue().filter(t=>!maintDone(t)&&t.w!=='either'||!maintDone(t)&&t.f==='weekly').slice(0,5);
  return `<div class="card"><h3>🛠️ Home to-dos</h3>${open.map(t=>`<div class="row"><span class="grow"><b>${esc(t.a)}</b> ${esc(t.t)}</span></div>`).join('')||'<p class="mut sm">All caught up. 🎉</p>'}
   <button class="btn s" onclick="go('maint')">Open Home Care</button></div>`}
function maintTog(id){const t=maintAll().find(x=>x.id===id),k=maintPeriod(t)+'|'+id;
  if(S.maint[k])delete S.maint[k];else S.maint[k]=dkey();save();render()}
function addMaint(){const t=$('#mt').value.trim();if(!t)return toast('Add a task');const f=$('#mf').value;
  S.customMaint.push({id:'hc'+Date.now(),a:$('#ma').value||'🏠',t,f,s:f==='seasonal'?[seasonOf().name]:undefined,w:$('#mw').value,custom:true});save();render()}
function delMaint(id){S.customMaint=S.customMaint.filter(x=>x.id!==id);save();render()}

// ---------- design & projects ----------
const DSUBS=[['proj','🏗️ Projects'],['paint','🎨 Paint & Palette'],['cords','🔌 Cord Plan'],['shop','🛍️ Shopping'],['rooms','💡 Room Ideas']];
function vDesign(me){
  const sub=S.dsub||'proj';
  const body={proj:dProj,paint:dPaint,cords:dCords,shop:dShop,rooms:dRooms}[sub](me);
  return `<h1>🎨 Design & Home Improvements</h1><div class="opts" style="margin-bottom:12px">${DSUBS.map(s=>`<button class="opt ${sub===s[0]?'on':''}" onclick="dsub('${s[0]}')">${s[1]}</button>`).join('')}</div>${body}`;
}
function dsub(k){S.dsub=k;save();render()}
const PSTAT=['todo','doing','done'],PLABEL={todo:'To do',doing:'In progress',done:'Done ✓'};
function dProj(me){
  return `<p class="mut sm">Suggested order: urgent/seasonal first (pool, coop, side door, driveway), then garage + upstairs, then paint, then the new couches.</p>`+
  HOME_PROJECTS.slice().sort((a,b)=>a.p-b.p).map(p=>{const st=S.proj[p.id]||'todo';
   return `<div class="card"><h3>${esc(p.title)} <span class="pill">${esc(p.when)}</span> <span class="pill">${esc(p.cost)}</span></h3>
    <details><summary class="sm mut">${p.steps.length} steps</summary><div class="steps">${p.steps.map(s=>`<div class="step">${esc(s)}</div>`).join('')}</div></details>
    <p>${me.parent?`<button class="btn ${st==='done'?'g':'s'}" onclick="projCycle('${p.id}')">${PLABEL[st]}</button>`:`<span class="pill">${PLABEL[st]}</span>`}</p></div>`}).join('');
}
function projCycle(id){const c=S.proj[id]||'todo';S.proj[id]=PSTAT[(PSTAT.indexOf(c)+1)%3];save();render()}
function dPaint(){
  const D=DESIGN_NOTES.living;
  return `<div class="grid">${PALETTE.map(c=>`<div class="card"><div style="height:60px;border-radius:10px;background:${c.hex};margin-bottom:8px"></div><h3>${esc(c.n)}</h3>
   <div class="sm mut">${esc(c.b)}</div><p class="sm">${esc(c.use)}</p>
   <a target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(c.b+' '+c.n)}">See in rooms</a></div>`).join('')}</div>
  <p class="sm mut">Swatches are approximate on screen. Buy sample pots and test on two walls in morning and evening light, next to the sofa fabric.</p>
  ${D.map(d=>`<div class="card"><h3>${esc(d[0])}</h3><p>${esc(d[1])}</p></div>`).join('')}`;
}
function dCords(){const C=CORD_PLAN;
  return `<div class="card"><p>${esc(C.intro)}</p></div><div class="card"><h2>Options</h2>${C.options.map(o=>`<div class="row"><span class="grow"><b>${esc(o[0])}</b><div class="sm mut">${esc(o[1])}</div></span></div>`).join('')}</div>
  <div class="card"><h2>Safety rules</h2>${C.rules.map(r=>`<div class="step">${esc(r)}</div>`).join('')}</div>`;
}
const shopLinks=q=>SHOPS.map(s=>`<a class="btn s" target="_blank" rel="noopener" href="${s[1]}${encodeURIComponent(q)}">${s[0]}</a>`).join(' ');
const imgTile=(src,e)=>src?`<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:140px;object-fit:cover;border-radius:10px" onerror="this.outerHTML='<div class=&quot;tile&quot;>${e||'🛍️'}</div>'">`:`<div class="tile">${e||'🛍️'}</div>`;
function dShop(me){
  return `<p class="mut sm">Each item opens searches at several stores so you can compare. Tap \u201cAdd photo\u201d to paste a product image address once you find one.</p><div class="grid">`+
  DECOR.map(d=>`<div class="card">${imgTile(S.design.img[d.id],d.e)}<h3>${esc(d.name)}</h3><div class="sm mut">${esc(d.cat)} · ${esc(d.price)}</div><p class="sm">${esc(d.why)}</p>
   <p>${shopLinks(d.q)}</p>${me.parent?`<button class="btn s" onclick="setDecorImg('${d.id}')">Add photo</button>`:''}</div>`).join('')+'</div>';
}
function setDecorImg(id){const u=prompt('Paste the image address (https://...):');if(u===null)return;
  if(u&&!safeUrl(u))return toast('Must start with https://');S.design.img[id]=u;save();render()}
function dRooms(me){
  const ideas=S.design.ideas,def=me.parent?'Living room':{sophie:'Sophie\u2019s room',sam:'Sam\u2019s room',jack:'Jack\u2019s room'}[me.id];
  const vis=me.parent?ideas:ideas.filter(i=>i.by===me.id||i.status==='approved');
  const card=i=>{const p=person(i.by),u=safeUrl(i.url);
    return `<div class="card">${imgTile(i.img,'🏷️')}<h3>${esc(i.title)}</h3><div class="sm mut">${p.emoji} ${p.name} · ${esc(i.room)}${i.price?' · '+esc(i.price):''}</div>
     ${i.note?`<p class="sm">${esc(i.note)}</p>`:''}
     <p><span class="pill">${i.status==='approved'?'✅ Approved':i.status==='declined'?'❌ Not this time':'⏳ Waiting'}</span></p>
     ${i.reason?`<p class="sm mut">Parent: ${esc(i.reason)}</p>`:''}
     <p>${u?`<a class="btn s" target="_blank" rel="noopener" href="${esc(u)}">Open link</a> `:''}<a class="btn s" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=shop&q=${encodeURIComponent(i.title)}">Find cheaper</a>
     ${me.parent?`<button class="btn g" onclick="ideaSet('${i.id}','approved')">Approve</button><button class="btn s" onclick="ideaSet('${i.id}','declined')">Decline</button>`:''}
     ${me.parent||i.by===me.id?`<button class="btn s" onclick="ideaDel('${i.id}')">✕</button>`:''}</p></div>`};
  return `<p class="mut sm">Everyone can suggest ideas for their room. Parents approve or decline. Paste a link and the picture fills in when the store allows it.</p>
  <div class="card"><h3>Suggest something</h3>
   <select id="ir">${DESIGN_ROOMS.map(r=>`<option ${r===def?'selected':''}>${r}</option>`).join('')}</select>
   <input id="it" placeholder="What is it? (e.g. LED strip lights)"><input id="iu" placeholder="Link to buy (https://...)">
   <input id="ii" placeholder="Image address (optional)"><input id="ip" placeholder="Price (optional)"><input id="in" placeholder="Why do you want it?">
   <button class="btn" onclick="addIdea()">Send</button></div>
  <div class="grid">${vis.map(card).join('')||'<p class="mut">No ideas yet.</p>'}</div>`;
}
function addIdea(){const title=$('#it').value.trim();if(!title)return toast('What is it?');
  const url=safeUrl($('#iu').value.trim()),img=safeUrl($('#ii').value.trim()),me=person(S.me);
  const i={id:'i'+Date.now(),by:S.me,room:$('#ir').value,title,url,img,price:$('#ip').value,note:$('#in').value,status:me.parent?'approved':'pending',reason:''};
  S.design.ideas.push(i);save();toast(me.parent?'Added':'Sent for parent approval');render();if(url&&!img)fetchPreview(i.id)}
async function fetchPreview(id){const i=S.design.ideas.find(x=>x.id===id);if(!i||!i.url||i.img)return;
  try{const r=await fetch('https://api.microlink.io/?url='+encodeURIComponent(i.url)),j=await r.json(),u=safeUrl(j&&j.data&&j.data.image&&j.data.image.url);
    if(u){i.img=u;save();render()}}catch{}}
function ideaSet(id,st){const i=S.design.ideas.find(x=>x.id===id);let r='';if(st==='declined'){r=prompt('Reason (optional):')||''}
  i.status=st;i.reason=r;save();render()}
function ideaDel(id){S.design.ideas=S.design.ideas.filter(x=>x.id!==id);save();render()}

// ---------- pop-up reminders ----------
const snoozed={};let alertShown=null;
function beep(){try{const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.15;o.start();o.stop(a.currentTime+.25)}catch{}
  if(navigator.vibrate)navigator.vibrate([200,100,200])}
function showAlert(t,nk){alertShown={t,nk};delete snoozed[nk];S.notified[nk]=1;save();
  const el=$('#alert');el.innerHTML=`<div class="ab"><b>⏰ ${fmt12(t.t)}</b><div>${esc(t.title)}</div>
   <div><button class="btn g" onclick="alertDone()">Done ✓</button> <button class="btn s" onclick="alertSnooze()">Snooze 10 min</button> <button class="btn s" onclick="alertClose()">Dismiss</button></div></div>`;
  el.classList.remove('hidden');beep();
  if(S.notify&&window.Notification&&Notification.permission==='granted')new Notification('HomeHQ ⏰',{body:t.title})}
function alertClose(){alertShown=null;$('#alert').classList.add('hidden')}
function alertDone(){const id=alertShown.t.id;alertClose();if(!status(id))toggle(id)}
function alertSnooze(){snoozed[alertShown.nk]=Date.now()+600000;alertClose()}
// ---------- Musical Chores game ----------
// Like musical chairs: N-1 cleaning rags on the floor, music plays, grab a rag when it stops.
// Whoever has no rag does a bonus Wild Card chore (worth more points, so nobody is "out").
let G=null;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function gameZones(){return HOUSE_LISTS.whole.zones.map((z,zi)=>({z:z.z,zi,
  jobs:z.jobs.filter(j=>!/^Seated/.test(j[0])).map(j=>j[0].replace(/^(Sophie|Sam|Jack|Eli[^:]*): /,''))})).filter(z=>!/Laundry/.test(z.z)).concat(GAME_EXTRA)}
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+pad(s%60)};
function gameHtml(me){
  if(!G||G.phase==='setup'){
    const sel=G?G.players:['sophie','sam','jack','eli'];
    return `<div class="card"><h2>🎵 Musical Chores</h2>
     <p>Like musical chairs, but with cleaning rags. Lay out <b>one fewer rag than players</b> in a circle on the floor. Play a playlist, walk around the circle, and when the music stops <b>grab a rag</b>. Everyone with a rag races to that round\u2019s zone for a timed cleaning sprint. The one without a rag gets the <b>Wild Card</b> chore, worth double points. Nobody is out.</p>
     <p class="sm mut">Play your own music from a phone or speaker; this app picks the surprise stop time and buzzes. Jeanne can be the DJ and judge from the couch.</p>
     <h3>Who\u2019s racing?</h3><div class="opts">${PEOPLE.map(p=>`<label class="opt"><input type="checkbox" id="gp_${p.id}" ${sel.includes(p.id)?'checked':''}> <span class="e">${p.emoji}</span>${p.name}</label>`).join('')}</div>
     <p>Rounds <select id="gr">${[4,5,6,7,8,10].map(n=>`<option ${n===(G?G.rounds:6)?'selected':''}>${n}</option>`).join('')}</select>
      Sprint <select id="gs">${[2,3,4,5].map(n=>`<option ${n===(G?G.sprint:3)?'selected':''} value="${n}">${n} min</option>`).join('')}</select></p>
     <p class="sm mut">Safety: gloves for disinfectant, never mix bleach with ammonia or other cleaners, open a window, leave disinfectant wet for the time on its label, keep pets away until dry.</p>
     <button class="btn g" onclick="gameStart()">Start the game</button></div>`;
  }
  const rags=G.players.length-1,sc=G.players.map(id=>{const p=person(id);return `<span class="pill">${p.emoji} ${G.scores[id]||0}</span>`}).join(' ');
  const head=`<div class="card"><div class="sm mut">Round ${G.round+1} of ${G.rounds}</div><p>${sc}</p></div>`;
  const z=G.zones[G.round];
  if(G.phase==='music')return head+`<div class="card" style="text-align:center"><div class="big">🎵💃🕺🎵</div><h2>Music is playing!</h2>
    <p>Walk around the circle. Rags on the floor: <b>${rags}</b>. Scoop up any clutter you pass.</p>
    <button class="btn r" onclick="gameStop()">🛑 STOP THE MUSIC</button></div>`;
  if(G.phase==='race')return head+`<div class="card" style="text-align:center"><div class="big">🛑 FREEZE!</div><h2>Grab a rag!</h2>
    <p>Who did NOT get a rag? They get the Wild Card.</p><div class="opts">${G.players.map(id=>`<button class="opt" onclick="gameLeft('${id}')"><span class="e">${person(id).emoji}</span>${person(id).name}</button>`).join('')}</div></div>`;
  if(G.phase==='sprint'){const left=G.endsAt-Date.now(),w=person(G.wild);
    return head+`<div class="card"><h2>🏃 Sprint: ${esc(z.z)}</h2><div class="big" id="gtime">${left>0?mmss(left):'⏰ Time!'}</div>
     <div class="steps">${z.jobs.map(j=>`<div class="step">${esc(j)}</div>`).join('')}</div>
     <p>🃏 <b>${w.emoji} ${w.name}\u2019s Wild Card:</b> ${esc(G.wildJob)} <span class="pill">+20</span></p>
     <p class="sm mut">Everyone else: +10 for finishing the zone.</p><button class="btn g" onclick="gameRoundDone()">We\u2019re done ✓</button></div>`}
  if(G.phase==='between')return head+`<div class="card" style="text-align:center"><h2>Round ${G.round} complete 🎉</h2><p>Reset the rags (${rags}) in the circle.</p>
    <button class="btn g" onclick="gameMusic()">🎵 Start the music</button></div>`;
  return `<div class="card" style="text-align:center"><div class="big">🏆</div><h2>Game over!</h2><p>${sc}</p>
    <p>Everyone gets <b>+25</b> team points for finishing the whole house together. Zone checklists were updated. Don\u2019t forget pizza! 🍕</p>
    <button class="btn" onclick="G=null;render()">Play again</button></div>`;
}
function gameRender(){const el=$('#game');if(el)el.innerHTML=gameHtml(person(S.me))}
function gameStart(){const players=PEOPLE.filter(p=>$('#gp_'+p.id).checked).map(p=>p.id);
  if(players.length<3)return toast('Need at least 3 players');
  const rounds=+$('#gr').value,all=gameZones();let zs=shuffle(all);while(zs.length<rounds)zs=zs.concat(shuffle(all));
  G={players,rounds,sprint:+$('#gs').value,zones:zs.slice(0,rounds),round:0,scores:{},phase:'between'};G.round=0;gameMusic()}
function gameMusic(){G.phase='music';G.endsAt=Date.now()+(20+Math.random()*25)*1000;gameRender()}
function gameStop(){G.phase='race';beep();gameRender()}
function gameLeft(id){G.wild=id;G.wildJob=rnd(GAME_WILD);G.phase='sprint';G.buzzed=false;G.endsAt=Date.now()+G.sprint*60000;gameRender()}
function gameRoundDone(){const z=G.zones[G.round],k=dkey();
  G.players.forEach(id=>{const pts=id===G.wild?20:10;G.scores[id]=(G.scores[id]||0)+pts;S.bonus.push({who:id,pts,note:'Musical Chores: '+z.z,date:k})});
  if(z.zi!=null)houseItems('whole').filter(x=>x.zi===z.zi).forEach(x=>S.house.done[x.id]=1);
  G.round++;
  if(G.round>=G.rounds){G.phase='done';PEOPLE.forEach(p=>S.bonus.push({who:p.id,pts:25,note:'Musical Chores team clean',date:k}));beep()}else G.phase='between';
  save();toast('+points awarded 🎉');gameRender()}
setInterval(()=>{if(!G)return;
  if(G.phase==='music'&&Date.now()>=G.endsAt)return gameStop();
  if(G.phase==='sprint'){const t=$('#gtime');if(t)t.textContent=G.endsAt>Date.now()?mmss(G.endsAt-Date.now()):'⏰ Time!';
    if(Date.now()>=G.endsAt&&!G.buzzed){G.buzzed=true;beep()}}},500);

// ---------- one-time calendar entry + upcoming events ----------
function seedEvents(){
  const seeds=[
    ['e-mc-1110','2026-11-10','15:30','🎵 Musical Chores: whole-house clean + sanitize (Whole House tab)',[]],
    ['e-postop-1118','2026-11-18','11:00','🩺 Jeanne: post-op check-up (Eli drives)',['jeanne','eli']],
    ['e-fieldtrip-1118','2026-11-18','','🐠 Jack field trip: Gulfport Aquarium (date may be 11/18 or 11/19; Sophie or Eli chaperones)',['jack','sophie','eli']],
    ['e-sw-1111','2026-11-11','10:30','💼 Sophie works 10:30 AM–3:00 PM',['sophie']],
    ['e-sw-1112','2026-11-12','10:30','💼 Sophie works 10:30 AM–8:00 PM',['sophie']],
    ['e-sw-1113','2026-11-13','11:00','💼 Sophie works 11:00 AM–3:00 PM',['sophie']],
    ['e-sw-1114','2026-11-14','10:30','💼 Sophie works 10:30 AM–3:00 PM',['sophie']],
    ['e-sc-1116a','2026-11-16','16:00','🎓 Sophie: class',['sophie']],
    ['e-sc-1116b','2026-11-16','19:00','🎓 Sophie: class',['sophie']]];
  let ch=0;seeds.forEach(([id,date,time,title,who])=>{if(S.seedIds&&S.seedIds[id])return;
    (S.seedIds=S.seedIds||{})[id]=1;ch=1;if(!S.events.some(e=>e.id===id))S.events.push({id,date,time,title,who,by:'jeanne'})});
  if(S.seedMC&&!S.seedIds['e-mc-1110'])S.seedIds['e-mc-1110']=1;
  if(ch)save()}
function vSoon(){const t=dkey(),tm=dkey(new Date(Date.now()+864e5));
  const ev=S.events.filter(e=>e.date===t||e.date===tm).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  return ev.length?`<div class="card"><h3>📌 Coming up</h3>${ev.map(e=>`<div class="row"><span class="time">${e.date===t?'Today':'Tomorrow'}${e.time?' '+fmt12(e.time):''}</span><span class="grow">${esc(e.title)}</span></div>`).join('')}</div>`:''}

function checkDue(){
  if(!S.me||alertShown||(G&&G.phase!=='done'&&G.phase!=='setup'))return;
  const now=new Date(),nm=now.getHours()*60+now.getMinutes(),k=dkey();
  for(const t of tasksFor(S.me)){
    if(status(t.id))continue;
    const [h,m]=t.t.split(':').map(Number),diff=nm-(h*60+m),nk=k+S.me+t.id,sn=snoozed[nk];
    if(sn?Date.now()>=sn:(diff>=0&&diff<=5&&!S.notified[nk])){showAlert(t,nk);return}
  }
}
