'use strict';
const KEY='homehq_v1', BKEY='homehq_budget_v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dkey=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const wkey=(d=new Date())=>{const x=new Date(d);x.setDate(x.getDate()-x.getDay());return dkey(x)};
const person=id=>PEOPLE.find(p=>p.id===id);
const age=b=>{if(!b)return'';const d=new Date(b),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;return a};
const fmt12=t=>{let [h,m]=t.split(':').map(Number);const s=h<12?'AM':'PM';h=h%12||12;return`${h}:${pad(m)} ${s}`};

let S=load(KEY,{ver:2,me:null,log:{},bonus:[],spent:[],votes:{},picks:{},moods:{},well:{},coop:{},pins:{},rewards:DEFAULT_REWARDS,wins:{},events:[],extras:DEFAULT_EXTRAS,claims:[],bank:{},outings:[],outVotes:{},notified:{},notify:false,browse:null,house:{list:'whole',done:{}},maint:{},customMaint:[],proj:{},dsub:'proj',design:{img:{},ideas:[]}});
if(S.ver<2){S.ver=2;S.rewards=DEFAULT_REWARDS}
let B=load(BKEY,{income:[],expenses:[],sophie:{carNote:0,gas:0,insurance:0,paid:{}}});
let SB=load('homehq_sophie_budget_v1',{income:[],expenses:[],goal:'',goalAmt:0});
let unlocked=JSON.parse(sessionStorage.getItem('hq_unl')||'{}'), ownPin=JSON.parse(sessionStorage.getItem('hq_own')||'{}'), tab='today', calMonth=new Date(), calSel=dkey();
function load(k,d){try{return Object.assign(d,JSON.parse(localStorage.getItem(k)||'{}'))}catch{return d}}
const save=()=>{localStorage.setItem(KEY,JSON.stringify(S));localStorage.setItem(BKEY,JSON.stringify(B));localStorage.setItem('homehq_sophie_budget_v1',JSON.stringify(SB));
  if(typeof syncPush==='function')syncPush();
  sessionStorage.setItem('hq_unl',JSON.stringify(unlocked));sessionStorage.setItem('hq_own',JSON.stringify(ownPin))};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function modal(html){const m=$('#modal');m.innerHTML=`<div>${html}</div>`;m.classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden')}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

// ---------- points ----------
const LEAVERS=['eli','sam','jack'];
const isWk=d=>{const w=d.getDay();return w>0&&w<6};
const effTask=(t,d)=>t.tw&&isWk(d)?{...t,t:t.tw}:t;
const coreTime=(c,pid,d)=>c.early&&LEAVERS.includes(pid)&&isWk(d)?c.early:c.t;
function taskById(id,date=new Date()){
  if(id.startsWith('c:')){const [,cid,pid]=id.split(':'),c=CORE.find(x=>x.id===cid);return c&&{id,who:pid,t:coreTime(c,pid,date),title:c.title,pts:c.pts,verify:(c.verifyFor||[]).includes(pid),core:true}}
  const t=TASKS.find(t=>t.id===id);return t&&effTask(t,date)}
function earned(pid){let n=0;for(const d in S.log)for(const id in S.log[d]){const t=taskById(id);if(t&&t.who===pid&&S.log[d][id]==='done')n+=t.pts}
  S.bonus.filter(b=>b.who===pid).forEach(b=>n+=b.pts);return n}
const spent=pid=>S.spent.filter(x=>x.who===pid).reduce((a,x)=>a+x.cost,0);
const balance=pid=>earned(pid)-spent(pid);
const teamPoints=()=>PEOPLE.reduce((a,p)=>a+earned(p.id),0);
function tasksFor(pid,date=new Date()){const dow=date.getDay(),wk=dow>0&&dow<6;
  const core=CORE.map(c=>taskById(`c:${c.id}:${pid}`,date));
  return TASKS.filter(t=>t.who===pid&&(!t.days||t.days.includes(dow))&&(!t.school||wk)).map(t=>effTask(t,date)).concat(core).sort((a,b)=>a.t.localeCompare(b.t))}
function status(id,d=dkey()){return(S.log[d]||{})[id]||''}
function streak(pid){let n=0;const d=new Date();for(let i=0;i<60;i++){const k=dkey(d);const ts=tasksFor(pid,d);
  const any=ts.some(t=>status(t.id,k)==='done');if(any)n++;else if(i>0)break;d.setDate(d.getDate()-1)}return n}

function toggle(id){
  const me=person(S.me),t=taskById(id),k=dkey();S.log[k]=S.log[k]||{};
  const cur=S.log[k][id];
  if(cur){ if(cur==='done'&&!me.parent){toast('Ask a parent to undo verified tasks');return} delete S.log[k][id]; }
  else S.log[k][id]=(t.verify&&!me.parent)?'pending':'done';
  save();
  if(!cur){toast(S.log[k][id]==='done'?`+${t.pts} points! 🎉`:'Sent to a parent to verify ✅')}
  render();
}
function verify(d,id,ok){if(ok)S.log[d][id]='done';else delete S.log[d][id];save();toast(ok?'Verified, points awarded':'Sent back');render()}

// ---------- shell ----------
const TABS=[['today','📅 Today'],['cal','🗓️ Calendar'],['family','🏠 Family'],['chores','🧹 Extra Chores'],['house','🧽 Whole House'],['maint','🛠️ Home Care'],['design','🎨 Design & Projects'],['bank','🏦 Allowance Bank'],['dinner','🍽️ Dinner'],['outings','🎡 Outings'],['well','🧘 10-Min Plan'],['rewards','🏆 Rewards'],['coop','🐔 Coop & Pets'],['rules','🤝 Agreements'],['mybudget','💵 My Budget',2],['verify','✅ Verify',1],['budget','💰 Budget',1]];
function renderShell(){
  $('#who').innerHTML=PEOPLE.map(p=>`<button class="av ${S.me===p.id?'on':''}" onclick="pick('${p.id}')">${p.emoji} ${p.name}</button>`).join('')+`<button class="av" onclick="lock()" title="Lock">🔒</button>`;
  const me=S.me&&person(S.me);
  $('#nav').innerHTML=TABS.filter(t=>!t[2]||(t[2]===1&&me&&me.parent)||(t[2]===2&&me&&me.id==='sophie')).map(t=>`<button class="${tab===t[0]?'on':''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('');
}
function go(t){tab=t;render();window.scrollTo(0,0)}
const parentOpen=()=>PEOPLE.some(p=>p.parent&&unlocked[p.id]);
function pick(id){
  const p=person(id);
  if(unlocked[id]||(!p.parent&&parentOpen())){S.me=id;save();return render()}
  askPin(id);
}
function askPin(id){
  const p=person(id),has=S.pins[id];
  modal(`<h2>${p.emoji} ${p.name}</h2><p class="mut">${has?'Enter your PIN.':'Create your own 4+ digit PIN. Only you will be able to open your profile.'}</p>
    <input id="pin" type="password" inputmode="numeric" maxlength="8" placeholder="PIN" autofocus onkeydown="if(event.key==='Enter')checkPin('${id}')">
    <p><button class="btn g" onclick="checkPin('${id}')">${has?'Unlock':'Set PIN'}</button> <button class="btn s" onclick="closeModal()">Cancel</button></p>`);
}
async function hash(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('homehq:'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function checkPin(id){
  const v=$('#pin').value;if(v.length<4)return toast('At least 4 digits');
  const h=await hash(v);
  if(!S.pins[id]){S.pins[id]=h}else if(S.pins[id]!==h)return toast('Wrong PIN');
  if(!person(id).parent){unlocked={};ownPin={}}
  unlocked[id]=true;ownPin[id]=true;S.me=id;save();closeModal();render();
}
function lock(){unlocked={};ownPin={};S.me=null;save();render()}
function resetPin(id){if(!confirm('Reset '+person(id).name+'\u2019s PIN? They will choose a new one next time.'))return;delete S.pins[id];delete unlocked[id];delete ownPin[id];save();toast('PIN reset');render()}
function render(){
  renderShell();
  const v=$('#view');
  if(!S.me){v.innerHTML=`<div class="card"><h1>Welcome to HomeHQ 👋</h1><p class="mut">Tap your name above to begin. Everyone has their own PIN.</p></div>`;return}
  if(!unlocked[S.me]&&!(!person(S.me).parent&&parentOpen())){S.me=null;return render()}
  const me=person(S.me);
  if((tab==='verify'||tab==='budget')&&!me.parent)tab='today';
  if(tab==='mybudget'&&me.id!=='sophie')tab='today';
  v.innerHTML=({today:vToday,cal:vCal,family:vFamily,chores:vChores,house:vHouse,maint:vMaint,design:vDesign,bank:vBank,dinner:vDinner,outings:vOutings,well:vWell,rewards:vRewards,coop:vCoop,rules:vRules,mybudget:vMyBudget,verify:vVerify,budget:vBudget}[tab])(me);
}

// ---------- views ----------
function vToday(me){
  const ts=tasksFor(me.id),done=ts.filter(t=>status(t.id)==='done').length;
  const pct=ts.length?Math.round(done/ts.length*100):0;
  const hr=new Date().getHours(),greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  const mood=(S.moods[dkey()]||{})[me.id];
  return `<h1>${greet}, ${me.name} ${me.emoji}</h1>
  <div class="grid">
   <div class="card"><div class="mut sm">POINTS</div><div class="big">${balance(me.id)}</div>
     <div class="sm mut">🔥 ${streak(me.id)}-day streak</div>
     <div class="bar" style="margin-top:10px"><i style="width:${pct}%"></i></div><div class="sm mut">${done}/${ts.length} done today</div></div>
   <div class="card"><h3>How are you feeling? <span class="sm mut">(private)</span></h3>
     <div class="opts">${MOODS.map((m,i)=>`<button class="opt ${mood===i?'on':''}" onclick="setMood(${i})"><span class="e">${m[0]}</span>${m[1]}</button>`).join('')}</div>
     ${me.parent?'':'<p class="sm mut">Only you see this. Parents just see that you checked in.</p>'}</div>
  </div>
  ${vSoon()}<div class="card"><h2>${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</h2>
   ${ts.map(t=>{const s=status(t.id);return `<div class="row"><span class="time">${fmt12(t.t)}</span>
     <span class="grow">${esc(t.title)}</span>${t.pts?`<span class="pill">+${t.pts}</span>`:''}
     <button class="chk ${s}" onclick="toggle('${t.id}')" title="${s==='pending'?'Waiting for parent':''}">${s==='done'?'✓':s==='pending'?'⏳':''}</button></div>`}).join('')||'<p class="mut">Nothing scheduled.</p>'}
  </div>
  <div class="card"><h3>📲 Reminders</h3><p class="sm mut">While HomeHQ is open, a pop-up (with a beep) appears at each task\u2019s time with Done / Snooze. To get buzzes when the app is closed, download your schedule as a calendar file (iPhone &amp; Google Calendar).</p>
   <button class="btn" onclick="exportReminders('${me.id}')">Download my reminders (.ics)</button>
     <button class="btn s" onclick="enableNotify()">${S.notify?'🔔 System notifications on':'Also send system notifications'}</button></div>
    ${me.parent?vHomeDue():''}
    ${vSyncCard()}
  ${me.id==='jeanne'?`<div class="card"><h3>🩹 Recovery mode</h3><p class="mut">Plan is gentle by design. Always follow your surgeon\u2019s restrictions (lifting, driving, neck movement). Kids and Eli cover animals, chickens and chores for now; dinners use the sheet-pan/slow-cooker picks.</p></div>`:''}`;
}
function setMood(i){const k=dkey();S.moods[k]=S.moods[k]||{};S.moods[k][S.me]=i;save();toast('Checked in 💙');render()}

function vFamily(){
  const goal=FAMILY_GOAL,tp=teamPoints(),k=dkey();
  return `<h1>Family Dashboard</h1>
  <div class="card"><h3>${goal.emoji} Team goal: ${esc(goal.name)}</h3>
   <div class="bar"><i style="width:${Math.min(100,tp/goal.target*100)}%"></i></div>
   <p class="sm mut">${tp} / ${goal.target} team points. Everyone\u2019s effort counts together.</p></div>
  <div class="grid">${PEOPLE.map(p=>{const ts=tasksFor(p.id),d=ts.filter(t=>status(t.id)==='done').length,
    pend=ts.filter(t=>status(t.id)==='pending').length,chk=(S.moods[k]||{})[p.id]!==undefined,wd=(S.well[k]||{})[p.id];
    return `<div class="card"><h3>${p.emoji} ${p.name} ${p.born?`<span class="sm mut">(${age(p.born)})</span>`:''}</h3>
     <div class="bar"><i style="width:${ts.length?d/ts.length*100:0}%"></i></div>
     <p class="sm mut">${d}/${ts.length} tasks · ${pend?pend+' awaiting verify · ':''}🔥${streak(p.id)} · ${balance(p.id)} pts</p>
     <p class="sm">${chk?'✅ Mood check-in':'⬜ Mood check-in'} · ${wd?'✅ 10-min plan':'⬜ 10-min plan'}</p></div>`}).join('')}</div>`;
}

function vVerify(){
  const items=[];
  for(const d of Object.keys(S.log).sort().reverse())for(const id in S.log[d])if(S.log[d][id]==='pending')items.push([d,id]);
  const ex=S.claims.filter(c=>c.status==='pending');
  return `<h1>Verify & track</h1><div class="card">${items.map(([d,id])=>{const t=taskById(id),p=person(t.who);
    return `<div class="row"><span>${p.emoji}</span><span class="grow"><b>${p.name}</b>: ${esc(t.title)}<div class="sm mut">${d}</div></span>
     <button class="btn g" onclick="verify('${d}','${id}',true)">Approve +${t.pts}</button>
     <button class="btn s" onclick="verify('${d}','${id}',false)">Redo</button></div>`}).join('')+ex.map(c=>{const p=person(c.who);
    return `<div class="row"><span>${p.emoji}</span><span class="grow"><b>${p.name}</b> extra: ${esc(c.name)}<div class="sm mut">${c.date}</div></span>
     <button class="btn g" onclick="verifyExtra('${c.id}',true)">Approve +${c.pts}</button><button class="btn s" onclick="verifyExtra('${c.id}',false)">Redo</button></div>`}).join('')||'<p class="mut">Nothing waiting. 🎉</p>'}</div>
  <div class="card"><h3>PINs</h3><p class="sm mut">Forgot a PIN? Reset it; the person picks a new one on next open.</p>
   ${PEOPLE.filter(p=>p.id!==S.me).map(p=>`<button class="btn s" onclick="resetPin('${p.id}')">Reset ${p.name}</button>`).join(' ')}</div>
  <div class="card"><h3>Award bonus points</h3>
   <select id="bw">${PEOPLE.filter(p=>!p.parent).map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
   <input id="bp" type="number" placeholder="Points (e.g. 25)"><input id="bn" placeholder="Why? (good grade, kindness, initiative)">
   <button class="btn" onclick="addBonus()">Award</button></div>
  <div class="card"><h3>Mental-health check-ins</h3><p class="sm mut">Parents see who checked in, not what they chose. Use it as a conversation cue.</p>
   ${PEOPLE.filter(p=>!p.parent).map(p=>{const k=dkey();return `<div class="row"><span class="grow">${p.emoji} ${p.name}</span><span>${(S.moods[k]||{})[p.id]!==undefined?'✅ checked in':'⬜ not yet'}</span></div>`}).join('')}</div>`;
}
function addBonus(){const pts=+$('#bp').value;if(!pts)return;S.bonus.push({who:$('#bw').value,pts,note:$('#bn').value,date:dkey()});save();toast('Awarded!');render()}

function vDinner(me){
  const wk=wkey(),v=S.votes[wk]||{};
  const counts={};Object.values(v).forEach(x=>counts[x]=(counts[x]||0)+1);
  const max=Math.max(0,...Object.values(counts)),win=Object.keys(counts).filter(k=>counts[k]===max);
  const wid=win.length===1?win[0]:null,sel=S.picks[wk];
  let html=`<h1>Family Dinner</h1><div class="card"><h2>🗳️ This week\u2019s vote</h2>
   <p class="mut sm">Everyone votes once. Winner decides the protein; ties are broken by Jeanne.</p>
   <div class="opts">${MEAT_OPTIONS.map(o=>`<button class="opt ${v[me.id]===o.id?'on':''}" onclick="vote('${o.id}')"><span class="e">${o.emoji}</span>${o.name}<div class="sm mut">${counts[o.id]||0} votes · ${PEOPLE.filter(p=>v[p.id]===o.id).map(p=>p.emoji).join('')}</div></button>`).join('')}</div>
   <p class="sm mut">${Object.keys(v).length}/5 voted</p>`;
  if(win.length>1&&me.id==='jeanne')html+=`<p>Tie: break it → ${win.map(w=>`<button class="btn s" onclick="breakTie('${w}')">${w}</button>`).join(' ')}</p>`;
  html+='</div>';
  const protein=S.browse||S.picks[wk+'_p']||wid||'chicken';
  {
    html+=`<h2>High-protein, low-carb ideas</h2><div class="opts" style="margin-bottom:12px">${MEAT_OPTIONS.map(o=>`<button class="opt ${protein===o.id?'on':''}" onclick="browse('${o.id}')"><span class="e">${o.emoji}</span>${o.name}${wid===o.id?'<div class="sm pos">vote leader</div>':''}</button>`).join('')}</div><div class="grid">`+RECIPES[protein].map((r,i)=>`
     <div class="card"><h3>${esc(r.name)}</h3><div class="sm mut">${r.protein} protein · ${r.carbs} carbs · ${r.time}</div>
      <button class="btn ${sel===protein+i?'g':''}" onclick="pickRecipe('${protein}',${i})">${sel===protein+i?'✓ Tonight\u2019s pick':'Pick this'}</button></div>`).join('')+'</div>';
    if(sel&&sel.startsWith(protein)){const r=RECIPES[protein][+sel.slice(protein.length)];
      html+=`<div class="card"><h2>🛒 ${esc(r.name)}</h2><h3>Where to buy</h3><table>${r.ing.map(i=>`<tr><td>${esc(i[0])}</td><td class="sm mut">${esc(i[1])}</td><td><a target="_blank" rel="noopener" href="https://www.walmart.com/search?q=${encodeURIComponent(i[0].replace(/\(.*?\)/g,''))}">search</a></td></tr>`).join('')}</table>
       <p class="sm">Stores near 70461: ${STORES.map(s=>`<a target="_blank" rel="noopener" href="${s.q}${s.q.includes('search?q=')?'':''}">${s.name}</a>`).join(' · ')}</p>
       <h3>Make it (team up!)</h3><div class="steps">${r.steps.map(s=>`<div class="step">${esc(s)}</div>`).join('')}</div>
       <p class="sm mut">Assign: Sophie cooks/sous-chef · Sam preps & sets table · Jack washes veg & pours drinks · Eli grills/hosts · Jeanne supervises seated.</p></div>`}
  }
  const k=dkey();
  html+=`<div class="card"><h2>🕯️ At the table tonight</h2><p class="mut sm">Phones in the basket. Each person shares from their day:</p>
   ${PEOPLE.map(p=>{const ts=tasksFor(p.id).filter(t=>status(t.id)==='done');const w=(S.wins[k]||{})[p.id];
     return `<div class="row"><span>${p.emoji}</span><span class="grow"><b>${p.name}</b>: ${ts.length?esc(ts.slice(-2).map(t=>t.title.split(':')[0]).join(' · ')):'<span class="mut">no tasks done yet</span>'}${w?`<div class="sm">⭐ ${esc(w)}</div>`:''}</span>
      ${p.id===me.id?`<button class="btn s" onclick="addWin()">${w?'Edit':'+'} my win</button>`:''}</div>`}).join('')}
   <p><b>Prompt:</b> ${esc(DINNER_PROMPTS[new Date().getDate()%DINNER_PROMPTS.length])}</p>
   <button class="btn g" onclick="dinnerDone()">We ate together! +15 each</button></div>`;
  return html;
}
function vote(o){const wk=wkey();S.votes[wk]=S.votes[wk]||{};S.votes[wk][S.me]=o;S.browse=o;save();render()}
function browse(o){S.browse=o;save();render()}
function breakTie(o){S.picks[wkey()+'_p']=o;save();render()}
function pickRecipe(p,i){S.picks[wkey()]=p+i;save();render()}
function addWin(){const k=dkey();modal(`<h3>What\u2019s your win today?</h3><input id="wn" value="${esc((S.wins[k]||{})[S.me]||'')}" placeholder="Something you did well"><p><button class="btn g" onclick="saveWin()">Save</button></p>`)}
function saveWin(){const k=dkey();S.wins[k]=S.wins[k]||{};S.wins[k][S.me]=$('#wn').value;save();closeModal();render()}
function dinnerDone(){const k=dkey();if(S.bonus.some(b=>b.date===k&&b.note==='Family dinner'))return toast('Already counted today');
  PEOPLE.forEach(p=>S.bonus.push({who:p.id,pts:15,note:'Family dinner',date:k}));save();toast('Family dinner! +15 each 🍽️');render()}

function vWell(me){
  const w=WELLNESS[me.id],k=dkey(),done=(S.well[k]||{})[me.id];
  return `<h1>🧘 ${esc(w.title)} <span class="sm mut">· ${w.mins} minutes</span></h1>
   <div class="card"><div class="steps">${w.steps.map(s=>`<div class="step"><span class="pill">${s[0]}</span> ${esc(s[1])}</div>`).join('')}</div>
   <p><button class="btn ${done?'':'g'}" ${done?'disabled':''} onclick="wellDone()">${done?'✓ Done today':'I did it (+10)'}</button></p></div>
   <div class="card"><h3>Private notebook</h3><p class="sm mut">Stored only on this device. Not shown to anyone.</p>
    <textarea id="jn" rows="4" placeholder="Brain dump…" onchange="saveNote(this.value)">${esc(localStorage.getItem('note_'+me.id+'_'+k)||'')}</textarea></div>
   <div class="card"><h3>If things feel heavy</h3><p class="sm">Talk to a parent or trusted adult. Call or text <b>988</b> (Suicide & Crisis Lifeline), 24/7. Text HOME to <b>741741</b> (Crisis Text Line).</p></div>`;
}
function wellDone(){const k=dkey();S.well[k]=S.well[k]||{};S.well[k][S.me]=1;S.bonus.push({who:S.me,pts:10,note:'10-min plan',date:k});save();toast('+10 🧘');render()}
function saveNote(v){localStorage.setItem('note_'+S.me+'_'+dkey(),v)}

function vRewards(me){
  const kids=!me.parent;
  return `<h1>🏆 Rewards</h1><div class="card"><div class="mut sm">YOUR BALANCE</div><div class="big">${balance(me.id)} pts</div></div>
  <div class="grid">${S.rewards.map(r=>`<div class="card"><div style="font-size:34px">${r.emoji}</div><h3>${esc(r.name)}</h3><span class="pill">${r.cost} pts</span>
    <p><button class="btn g" ${balance(me.id)<r.cost?'disabled':''} onclick="redeem('${r.id}')">Redeem</button></p></div>`).join('')}</div>
  <div class="card"><h3>History</h3>${S.spent.filter(x=>x.who===me.id).slice(-6).reverse().map(x=>`<div class="row"><span class="grow">${esc(x.name)}</span><span class="sm mut">${x.date}</span></div>`).join('')||'<p class="mut sm">No redemptions yet.</p>'}</div>`;
}
function redeem(id){const r=S.rewards.find(x=>x.id===id);if(balance(S.me)<r.cost)return;
  S.spent.push({who:S.me,cost:r.cost,name:r.name,date:dkey()});
  if(r.bank)bankAdd(S.me,r.bank,'Reward: '+r.name);
  save();toast(r.bank?`$${r.bank} added to your bank 💰`:'Redeemed! Show a parent 🎁');render()}

// ---------- extra chores ----------
function vChores(me){
  const today=dkey(),mine=S.claims.filter(c=>c.who===me.id&&c.status!=='done'),todayCount=S.claims.filter(c=>c.who===me.id&&c.date===today).length;
  return `<h1>🧹 Extra chores <span class="sm mut">earn bonus points</span></h1>
  <div class="card"><h3>My claimed chores</h3>${mine.map(c=>`<div class="row"><span class="grow">${esc(c.name)}</span><span class="pill">+${c.pts}</span>
    ${c.status==='claimed'?`<button class="btn g" onclick="finishExtra('${c.id}')">I did it</button><button class="btn s" onclick="dropExtra('${c.id}')">Drop</button>`:'<span class="sm mut">⏳ waiting for parent</span>'}</div>`).join('')||'<p class="mut sm">Nothing claimed. Pick one below (max 3 a day).</p>'}</div>
  <div class="card"><h3>Chore board</h3>${S.extras.map(x=>{const a=S.claims.find(c=>c.exId===x.id&&c.status!=='done');
    return `<div class="row"><span class="grow">${esc(x.name)}</span><span class="pill">+${x.pts}</span>
     ${a?`<span class="sm mut">${person(a.who).emoji} ${person(a.who).name} has it</span>`:`<button class="btn" ${todayCount>=3?'disabled':''} onclick="claim('${x.id}')">Claim</button>`}
     ${me.parent?`<button class="btn s" onclick="delExtra('${x.id}')">✕</button>`:''}</div>`}).join('')}</div>
  ${me.parent?`<div class="card"><h3>Add a chore</h3><input id="xn" placeholder="Chore"><input id="xp" type="number" placeholder="Points (10-35)"><button class="btn" onclick="addExtra()">Add</button></div>`:''}`;
}
function claim(id){const x=S.extras.find(e=>e.id===id);S.claims.push({id:'c'+Date.now(),who:S.me,exId:id,name:x.name,pts:x.pts,date:dkey(),status:'claimed'});save();toast('Claimed!');render()}
function finishExtra(id){S.claims.find(c=>c.id===id).status='pending';save();toast('Sent to a parent ✅');render()}
function dropExtra(id){S.claims=S.claims.filter(c=>c.id!==id);save();render()}
function verifyExtra(id,ok){const c=S.claims.find(x=>x.id===id);if(ok){c.status='done';S.bonus.push({who:c.who,pts:c.pts,note:'Extra: '+c.name,date:dkey()});toast('Points awarded')}else c.status='claimed';save();render()}
function addExtra(){const n=$('#xn').value,p=+$('#xp').value;if(!n||!p)return;S.extras.push({id:'x'+Date.now(),name:n,pts:p});save();render()}
function delExtra(id){S.extras=S.extras.filter(x=>x.id!==id);save();render()}

// ---------- allowance bank ----------
const bk=pid=>S.bank[pid]=S.bank[pid]||{weekly:0,goal:'',goalAmt:0,entries:[]};
const bankBal=pid=>bk(pid).entries.reduce((a,e)=>a+e.amt,0);
function bankAdd(pid,amt,note){bk(pid).entries.push({date:dkey(),amt,note})}
function weekPct(pid){let t=0,d=0;const x=new Date();for(let i=0;i<7;i++){const k=dkey(x),ts=tasksFor(pid,x);t+=ts.length;d+=ts.filter(q=>status(q.id,k)==='done').length;x.setDate(x.getDate()-1)}return t?d/t:0}
function vBank(me){
  const kids=PEOPLE.filter(p=>!p.parent),show=me.parent?kids:[me];
  return `<h1>🏦 Allowance Bank</h1>`+show.map(p=>{const b=bk(p.id),bal=bankBal(p.id),pct=weekPct(p.id),amt=Math.round(b.weekly*pct*4)/4;
   return `<div class="card"><h2>${p.emoji} ${p.name}</h2><div class="big pos">$${bal.toFixed(2)}</div>
    ${b.goal?`<p class="sm">🎯 Saving for <b>${esc(b.goal)}</b> ($${(+b.goalAmt).toFixed(2)})</p><div class="bar"><i style="width:${Math.min(100,b.goalAmt?bal/b.goalAmt*100:0)}%"></i></div>`:''}
    <p class="sm mut">Weekly allowance $${(+b.weekly).toFixed(2)} · last 7 days completed ${Math.round(pct*100)}% → earns $${amt.toFixed(2)}</p>
    ${me.parent?`<p><button class="btn g" onclick="payAllow('${p.id}',${amt})">Pay this week ($${amt.toFixed(2)})</button>
      <button class="btn s" onclick="bankTx('${p.id}',1)">+ Deposit</button><button class="btn s" onclick="bankTx('${p.id}',-1)">− Withdraw</button>
      <label class="sm mut">Weekly base $<input type="number" step="0.25" value="${b.weekly}" onchange="setBank('${p.id}','weekly',+this.value)"></label></p>`:''}
    ${p.id===me.id?`<p><input id="bg" placeholder="Savings goal (e.g. headset)" value="${esc(b.goal)}"><input id="bga" type="number" placeholder="Goal $" value="${b.goalAmt||''}"><button class="btn s" onclick="setGoal()">Save goal</button></p>`:''}
    <details><summary class="sm mut">History</summary>${b.entries.slice(-10).reverse().map(e=>`<div class="row"><span class="grow">${esc(e.note)}</span><span class="sm mut">${e.date}</span><span class="${e.amt<0?'neg':'pos'}">${e.amt<0?'−':'+'}$${Math.abs(e.amt).toFixed(2)}</span></div>`).join('')||'<p class="sm mut">Empty</p>'}</details></div>`}).join('');
}
function payAllow(pid,amt){if(!amt)return toast('Set a weekly base first');bankAdd(pid,amt,'Weekly allowance');save();toast('Deposited');render()}
function setBank(pid,k,v){bk(pid)[k]=v;save();render()}
function setGoal(){const b=bk(S.me);b.goal=$('#bg').value;b.goalAmt=+$('#bga').value;save();render()}
function bankTx(pid,sign){const v=prompt((sign>0?'Deposit':'Withdraw')+' amount ($):');const a=parseFloat(v);if(!a||a<=0)return;
  const n=prompt('Note:',sign>0?'Gift / job':'Cash out')||'';if(sign<0&&a>bankBal(pid))return toast('Not enough in bank');bankAdd(pid,sign*a,n);save();render()}

// ---------- calendar ----------
const BDAYS=PEOPLE.filter(p=>p.born).map(p=>({who:p,md:p.born.slice(5)}));
function eventsOn(k){const ev=S.events.filter(e=>e.date===k).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const bd=BDAYS.filter(b=>b.md===k.slice(5)).map(b=>({id:'bd'+b.who.id,title:`🎂 ${b.who.name}\u2019s birthday`,who:[],by:'',builtin:true}));return bd.concat(ev)}
function vCal(me){
  const y=calMonth.getFullYear(),m=calMonth.getMonth(),first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate();
  let cells='';for(let i=0;i<first;i++)cells+='<div></div>';
  for(let d=1;d<=dim;d++){const k=`${y}-${pad(m+1)}-${pad(d)}`,ev=eventsOn(k);
    cells+=`<button class="cd ${k===calSel?'sel':''} ${k===dkey()?'today':''}" onclick="calSel='${k}';render()"><span>${d}</span><div>${ev.slice(0,4).map(e=>`<i style="background:${e.by?(person(e.by)||{}).color:'#fbbf24'}"></i>`).join('')}</div></button>`}
  const evs=eventsOn(calSel);
  return `<h1>🗓️ Family Calendar</h1><div class="card"><div class="row"><button class="btn s" onclick="calNav(-1)">◀</button><h2 class="grow" style="text-align:center;margin:0">${calMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2><button class="btn s" onclick="calNav(1)">▶</button></div>
   <div class="calg">${['S','M','T','W','T','F','S'].map(x=>`<b class="mut sm">${x}</b>`).join('')}${cells}</div></div>
  <div class="card"><h3>${new Date(calSel+'T12:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</h3>
   ${evs.map(e=>`<div class="row"><span class="time">${e.time?fmt12(e.time):'All day'}</span><span class="grow">${esc(e.title)}<div class="sm mut">${e.by?(person(e.by).emoji+' '+person(e.by).name+' · '):''}${e.who&&e.who.length?e.who.map(w=>person(w).name).join(', '):'Everyone'}</div></span>
    ${!e.builtin&&(me.parent||e.by===me.id)?`<button class="btn s" onclick="delEvent('${e.id}')">✕</button>`:''}</div>`).join('')||'<p class="mut sm">Nothing yet.</p>'}
   <h3 style="margin-top:14px">Add to this day</h3><input id="et" placeholder="What? (practice, shift, appointment, birthday party…)"><input id="etm" type="time">
   <div class="sm mut">Who is involved?</div><div>${PEOPLE.map(p=>`<label class="sm" style="margin-right:10px"><input type="checkbox" class="ew" value="${p.id}" style="width:auto" ${p.id===me.id?'checked':''}> ${p.emoji} ${p.name}</label>`).join('')}</div>
   <p><button class="btn g" onclick="addEvent()">Add event</button> <button class="btn s" onclick="exportCal()">Export all (.ics)</button></p></div>`;
}
function calNav(n){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+n,1);render()}
function addEvent(){const t=$('#et').value.trim();if(!t)return toast('Add a title');
  const who=[...document.querySelectorAll('.ew:checked')].map(x=>x.value);
  S.events.push({id:'e'+Date.now(),date:calSel,time:$('#etm').value,title:t,who,by:S.me});save();toast('Added to calendar');render()}
function delEvent(id){S.events=S.events.filter(e=>e.id!==id);save();render()}

// ---------- outings ----------
const periodKey=t=>t==='monthly'?dkey().slice(0,7):wkey();
function vOutings(me){
  return `<h1>🎡 Family Outings</h1><p class="mut sm">Anyone can suggest. Parents approve. Then everyone votes. Low-effort picks are best while Jeanne recovers.</p>`+['weekly','monthly'].map(type=>{
   const pk=periodKey(type),votes=(S.outVotes[type+pk]||{}),list=S.outings.filter(o=>o.type===type),ok=list.filter(o=>o.approved),pend=list.filter(o=>!o.approved);
   const cnt=o=>Object.values(votes).filter(v=>v===o.id).length,best=Math.max(0,...ok.map(cnt)),lead=best?ok.filter(o=>cnt(o)===best):[];
   const idea=OUTING_IDEAS.filter(i=>i.type===type&&!list.some(o=>o.title===i.title));
   return `<div class="card"><h2>${type==='monthly'?'🌟 Monthly BIG outing':'🍦 Weekly small outing'}</h2>
    ${ok.map(o=>`<div class="row"><span class="grow">${esc(o.title)} <span class="sm mut">${esc(o.cost||'')}</span><div class="sm mut">${PEOPLE.filter(p=>votes[p.id]===o.id).map(p=>p.emoji).join(' ')}</div></span>
      <span class="pill">${cnt(o)}</span><button class="btn ${votes[me.id]===o.id?'g':''}" onclick="voteOut('${type}','${o.id}')">${votes[me.id]===o.id?'✓ Voted':'Vote'}</button>
      ${me.parent?`<button class="btn s" onclick="delOut('${o.id}')">✕</button>`:''}</div>`).join('')||'<p class="mut sm">No approved outings yet.</p>'}
    ${lead.length===1?`<p>🏆 Leading: <b>${esc(lead[0].title)}</b> <button class="btn s" onclick="outToCal('${lead[0].id}')">Put on calendar</button></p>`:lead.length>1?'<p class="sm mut">Tie, parents decide.</p>':''}
    ${pend.length?`<h3>Waiting for parent approval</h3>${pend.map(o=>`<div class="row"><span class="grow">${esc(o.title)}<div class="sm mut">by ${person(o.by).name}</div></span>${me.parent?`<button class="btn g" onclick="approveOut('${o.id}')">Approve</button><button class="btn s" onclick="delOut('${o.id}')">✕</button>`:''}</div>`).join('')}`:''}
    <h3>Suggest</h3><input id="os_${type}" placeholder="Your idea"><button class="btn" onclick="suggestOut('${type}',document.getElementById('os_${type}').value)">Suggest</button>
    <details><summary class="sm mut">Idea box (${idea.length})</summary>${idea.map(i=>`<div class="row"><span class="grow">${esc(i.title)} <span class="sm mut">${i.cost}</span></span><button class="btn s" onclick="suggestOut('${type}','${esc(i.title).replace(/&#39;/g,"\\'")}','${i.cost}')">Suggest</button></div>`).join('')}</details></div>`}).join('');
}
function suggestOut(type,title,cost){title=(title||'').trim();if(!title)return;S.outings.push({id:'o'+Date.now(),type,title,cost:cost||'',by:S.me,approved:person(S.me).parent});save();toast(person(S.me).parent?'Added':'Sent for parent approval');render()}
function approveOut(id){S.outings.find(o=>o.id===id).approved=true;save();render()}
function delOut(id){S.outings=S.outings.filter(o=>o.id!==id);save();render()}
function voteOut(type,id){const k=type+periodKey(type);S.outVotes[k]=S.outVotes[k]||{};S.outVotes[k][S.me]=id;save();render()}
function outToCal(id){const o=S.outings.find(x=>x.id===id);modal(`<h3>${esc(o.title)}</h3><p class="mut sm">Pick a date</p><input id="od" type="date" value="${dkey()}"><p><button class="btn g" onclick="saveOutCal('${id}')">Add</button></p>`)}
function saveOutCal(id){const o=S.outings.find(x=>x.id===id);S.events.push({id:'e'+Date.now(),date:$('#od').value,time:'',title:'Outing: '+o.title,who:[],by:S.me});save();closeModal();toast('On the calendar 📅');render()}

// ---------- reminders & .ics ----------
const icsEsc=s=>String(s).replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
const icsDT=(k,t)=>k.replace(/-/g,'')+'T'+(t||'09:00').replace(':','')+'00';
function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/calendar'}));a.download=name;a.click()}
function exportReminders(pid){
  const p=person(pid),start=dkey().replace(/-/g,'');let o=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HomeHQ//EN','CALSCALE:GREGORIAN'];
  const all=[];
  const addT=t=>{if(t.tw){all.push({...t,id:t.id+'wk',t:t.tw,days:null,school:true},{...t,id:t.id+'we',days:[0,6],school:false})}else all.push(t)};
  TASKS.filter(t=>t.who===pid).forEach(addT);
  CORE.forEach(c=>{const base={id:`c:${c.id}:${pid}`,title:c.title,t:c.t};
    if(c.early&&LEAVERS.includes(pid))all.push({...base,id:base.id+'wk',t:c.early,school:true},{...base,id:base.id+'we',days:[0,6]});else all.push(base)});
  all.forEach(t=>{const by=t.days?t.days.map(d=>['SU','MO','TU','WE','TH','FR','SA'][d]).join(','):t.school?'MO,TU,WE,TH,FR':'';
    o.push('BEGIN:VEVENT',`UID:${t.id}-${pid}@homehq`,`DTSTAMP:${start}T000000`,`DTSTART:${start}T${t.t.replace(':','')}00`,'DURATION:PT15M',
      'RRULE:FREQ='+(by?'WEEKLY;BYDAY='+by:'DAILY'),`SUMMARY:${icsEsc(p.emoji+' '+t.title)}`,'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY',`DESCRIPTION:${icsEsc(t.title)}`,'END:VALARM','END:VEVENT')});
  o.push('END:VCALENDAR');download(`HomeHQ-${p.name}.ics`,o.join('\r\n'));toast('Open the file on your phone to add reminders')}
function exportCal(){
  const o=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HomeHQ//EN'];
  S.events.forEach(e=>{o.push('BEGIN:VEVENT',`UID:${e.id}@homehq`,`DTSTAMP:${e.date.replace(/-/g,'')}T000000`);
    if(e.time)o.push('DTSTART:'+icsDT(e.date,e.time),'DURATION:PT1H');else o.push('DTSTART;VALUE=DATE:'+e.date.replace(/-/g,''));
    o.push('SUMMARY:'+icsEsc(e.title),'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(e.title),'END:VALARM','END:VEVENT')});
  o.push('END:VCALENDAR');download('HomeHQ-Calendar.ics',o.join('\r\n'))}
async function enableNotify(){
  if(!('Notification'in window))return toast('Not supported here; use the .ics file');
  const r=await Notification.requestPermission();S.notify=r==='granted';save();toast(S.notify?'Alerts on while this page is open':'Blocked');render()}
setInterval(checkDue,15000);setTimeout(checkDue,1500);


function vCoop(me){
  const done=COOP_MILESTONES.filter((_,i)=>S.coop[i]).length;
  return `<h1>🐔 Coop & Pets</h1>
  <div class="card"><h2>Coop build · ${done}/${COOP_MILESTONES.length}</h2><div class="bar"><i style="width:${done/COOP_MILESTONES.length*100}%"></i></div>
   <p class="sm mut">Rule: coop block first, then anything else. Parking-lot list for new ideas. Kids earn bonus points as helpers.</p>
   ${COOP_MILESTONES.map((m,i)=>`<div class="row"><button class="chk ${S.coop[i]?'done':''}" onclick="coopTog(${i})">${S.coop[i]?'✓':''}</button><span class="grow">${esc(m)}</span></div>`).join('')}</div>
  <div class="card"><h2>Animal care</h2><table><tr><th>Who</th><th>Dogs (3)</th><th>Cats (2)</th></tr>
   <tr><td>Daily</td><td>Food + water AM (Sam) & PM (Jack)</td><td>Feed (Sophie), litter scoop (Sophie)</td></tr>
   <tr><td>Weekly (Sat)</td><td>Bath one dog (Sam+Jack) \u2014 3 dogs rotate over 3 weeks, or all in 1 morning</td><td>Deep-clean boxes (Sophie)</td></tr>
   <tr><td>Chickens</td><td colspan="2">Eli AM feed/eggs · Jack egg check · Sam weekly run refresh</td></tr></table>
   <p class="sm mut">Today: ${['a1','a2','a3','s3'].map(id=>`${taskById(id).title.split(':')[0]} ${status(id)==='done'?'✅':status(id)==='pending'?'⏳':'⬜'}`).join(' · ')}</p></div>`;
}
function coopTog(i){S.coop[i]=!S.coop[i];if(S.coop[i]&&S.me==='eli')S.bonus.push({who:'eli',pts:30,note:'Coop milestone',date:dkey()});save();render()}

function vRules(){
  return `<h1>🤝 Agreements & private time</h1>
  <div class="card"><h3>Screens & Discord (talk first, rules second)</h3><ul class="mut">
   <li>Start with a calm, curious chat: "What do you love about those games/friends? What would make school and home feel better?" Feeling heard reduces secret use.</li>
   <li>Earned window: homework + hygiene + animals done → gaming/Discord until 9:00 pm. Devices charge outside bedrooms at night.</li>
   <li>Parents know who the online friends are; chats stay in common areas on school nights.</li>
   <li>Consistent consequences, predictable and short (e.g., lose that night\u2019s window), never surprise punishments.</li>
   <li>Offline social anchors for Sam: a club, gym, band, or friend meetups. If withdrawal, low mood, or sleep loss continues, mention it to his pediatrician/counselor.</li></ul></div>
  <div class="card"><h3>Private time is protected</h3><p class="mut">Each teen gets a daily "own space" block (Sam 20:00\u201321:00, Jack 19:30\u201320:30, Sophie after 20:30). Closed door OK, no hovering. Parents knock first. Trade-off: show up for dinner and routines.</p></div>
  <div class="card"><h3>Sophie\u2019s responsibilities</h3><p class="mut">Car note, gas, and an agreed insurance share are tracked privately by Eli and Jeanne in Budget. Sophie sees only her own checklist.</p></div>
  <div class="card"><h3>Evidence-based pillars used in this app</h3><ul class="mut"><li>Visual schedules, external reminders (ADHD)</li><li>Token economy / positive reinforcement</li><li>Shared family meals & routines</li><li>CBT & mindfulness micro-practices</li><li>Behavioral activation (move, connect, plan)</li></ul>
  <p class="sm mut">This app supports, not replaces, your care team. Mention it to your children\u2019s and your own providers.</p></div>`;
}

// ---------- Sophie's personal budget (only visible after her own PIN) ----------
function vMyBudget(){
  if(!ownPin.sophie)return `<div class="card"><h1>💵 My Budget <span class="pill">Private</span></h1><p class="mut">This page opens only with Sophie\u2019s own PIN (parents can\u2019t bypass it).</p><button class="btn g" onclick="askPin('sophie')">Enter my PIN</button></div>`;
  const o=B.sophie,owed=(+o.carNote)+(+o.gas)+(+o.insurance),inc=SB.income.reduce((a,x)=>a+x.amt,0),exp=SB.expenses.reduce((a,x)=>a+x.amt,0),left=inc-exp-owed;
  return `<h1>💵 My Budget <span class="pill">Private</span></h1>
  <div class="grid"><div class="card"><div class="mut sm">PAY (Middendorf\u2019s etc.)</div><div class="big pos">$${inc.toFixed(2)}</div></div>
   <div class="card"><div class="mut sm">MY BILLS</div><div class="big neg">$${(exp+owed).toFixed(2)}</div><div class="sm mut">incl. $${owed.toFixed(2)} car/gas/insurance agreement</div></div>
   <div class="card"><div class="mut sm">LEFT TO SAVE/SPEND</div><div class="big ${left<0?'neg':'pos'}">$${left.toFixed(2)}</div></div></div>
  <div class="card"><h3>Add</h3><select id="st"><option value="income">Paycheck / money in</option><option value="expenses">Expense</option></select>
   <input id="sn" placeholder="Name"><input id="sa" type="number" step="0.01" placeholder="Amount"><button class="btn" onclick="addSB()">Add</button></div>
  <div class="card"><h3>This month</h3>${[...SB.income.map((x,i)=>['income',i,x]),...SB.expenses.map((x,i)=>['expenses',i,x])].map(([t,i,x])=>
   `<div class="row"><span class="grow">${esc(x.name)}</span><span class="${t==='income'?'pos':'neg'}">${t==='income'?'+':'−'}$${x.amt.toFixed(2)}</span><button class="btn s" onclick="delSB('${t}',${i})">✕</button></div>`).join('')||'<p class="mut sm">Nothing yet.</p>'}</div>
  <div class="card"><h3>Planning tip</h3><p class="mut sm">When paid: car note first, then gas set-aside, then insurance share, then savings, and only then fun money. Set a phone alarm for payday.</p></div>`;
}
function addSB(){const a=+$('#sa').value,n=$('#sn').value;if(!a||!n)return;SB[$('#st').value].push({name:n,amt:a});save();render()}
function delSB(t,i){SB[t].splice(i,1);save();render()}

// ---------- Budget (parents only; separate storage key) ----------
function vBudget(){
  const inc=B.income.reduce((a,x)=>a+x.amt,0),exp=B.expenses.reduce((a,x)=>a+x.amt,0),net=inc-exp;
  const so=B.sophie,m=wkey().slice(0,7);
  return `<h1>💰 Budget <span class="pill">Parents only</span></h1>
  <div class="grid"><div class="card"><div class="mut sm">INCOME</div><div class="big pos">$${inc.toFixed(2)}</div></div>
   <div class="card"><div class="mut sm">EXPENSES</div><div class="big neg">$${exp.toFixed(2)}</div></div>
   <div class="card"><div class="mut sm">LEFT</div><div class="big ${net<0?'neg':'pos'}">$${net.toFixed(2)}</div></div></div>
  <div class="card"><h3>Add entry</h3><select id="bt"><option value="income">Income</option><option value="expenses">Expense</option></select>
   <input id="bn2" placeholder="Name (e.g. Mortgage, Paycheck)"><input id="ba" type="number" step="0.01" placeholder="Amount">
   <input id="bc" placeholder="Category (optional)"><button class="btn" onclick="addB()">Add</button></div>
  <div class="card"><h3>Entries</h3>${[...B.income.map((x,i)=>['income',i,x]),...B.expenses.map((x,i)=>['expenses',i,x])].map(([t,i,x])=>
    `<div class="row"><span class="grow">${esc(x.name)} <span class="sm mut">${esc(x.cat||'')}</span></span><span class="${t==='income'?'pos':'neg'}">${t==='income'?'+':'−'}$${x.amt.toFixed(2)}</span><button class="btn s" onclick="delB('${t}',${i})">✕</button></div>`).join('')||'<p class="mut">No entries yet.</p>'}</div>
  <div class="card"><h3>Sophie\u2019s monthly contributions</h3>
   <div class="grid"><label class="sm mut">Car note<input type="number" value="${so.carNote}" onchange="setSo('carNote',this.value)"></label>
   <label class="sm mut">Gas<input type="number" value="${so.gas}" onchange="setSo('gas',this.value)"></label>
   <label class="sm mut">Insurance share<input type="number" value="${so.insurance}" onchange="setSo('insurance',this.value)"></label></div>
   <p>Total owed: <b>$${(+so.carNote + +so.gas + +so.insurance).toFixed(2)}</b> · ${so.paid[m]?'✅ paid this month':'⬜ not paid'} <button class="btn s" onclick="soPaid('${m}')">Toggle</button></p></div>
  <p class="sm mut">Stored only in this browser under a separate key, never shown to kids. For multi-device sync, see README (Firebase with parent-only rules).</p>`;
}
function addB(){const a=+$('#ba').value,n=$('#bn2').value;if(!a||!n)return;B[$('#bt').value].push({name:n,amt:a,cat:$('#bc').value});save();render()}
function delB(t,i){B[t].splice(i,1);save();render()}
function setSo(k,v){B.sophie[k]=+v;save();render()}
function soPaid(m){B.sophie.paid[m]=!B.sophie.paid[m];save();render()}

if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
seedEvents();
render();
if(typeof syncInit==='function')syncInit();