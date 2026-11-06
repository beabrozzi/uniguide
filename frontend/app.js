/* ───────────────────────── RULES ENGINE ─────────────────────────
   Each rule: when(answers) → {id, tier, why}. Tier: now | week | keep. Score orders within tier. */
function plan(a){
  const out=[]; const add=(id,tier,why,score=50)=>{ if(!out.find(o=>o.id===id)) out.push({id,tier,why,score}); };
  const has=(k,v)=>(a[k]||[]).includes(v);
  const intl = a.origin!=="home";
  const halls = a.living==="halls_cat"||a.living==="halls_self"||a.living==="pbsa";
  const busy = a.schedule!=="day";
  const U = uniInfo(a);
  const uniHalls = a.living==="halls_cat"||a.living==="halls_self";

  // Mental health
  if(a.mood==="crisis"){ add("samaritans","now","You told us you're not safe right now",100); add("shout","now","If talking feels too hard, you can text",99); add(U.nation==="N"?"lifeline":"nhs111mh","now",U.nation==="N"?"24/7 crisis support where you study":"Urgent NHS mental health help",98); add("stayalive","week","A safety plan helps you through the next tough moment",80); }
  if(a.mood==="low"){ add("counselling","now","You said you're struggling to cope. Triage happens within 24 hours",95); add(busy?"nightline":"ucl247", "now", busy?(a.schedule==="packed"?"Your days are packed, and Nightline is open overnight, 6pm–8am":"You're mostly free in the evenings, and Nightline runs 6pm–8am"):"Someone to talk to today, 24/7", 90); add("samaritans","keep","Keep this number for a really bad moment",60); }
  if(a.mood==="stressed"){ add("ucl247","week","For stress and anxiety, at any hour"+(intl?", and in 35+ languages":""),70); add("studentminds","keep","Self-help tools for stress and anxiety",40); if(busy) add("nightline","keep","Open the hours you're actually free",35); }
  if(a.mood==="good"){ add("ucl247","keep","Save it now so it's there if you ever need it",20); }
  if(a.mhcond==="yes"){ add("sswsmh","week","Registering a condition gets support set up before deadlines hit",75); if(a.mood!=="low"&&a.mood!=="crisis") add("counselling","keep","Ongoing support alongside your GP",45); }
  if(a.mhcond==="unsure"&&(a.mood==="low"||a.mood==="stressed")) add("sswsmh","keep","An adviser can help, even without a diagnosis",40);

  // Physical health
  if(a.gp!=="yes"){
    const id = (U.ucl && a.area==="central")?"ridgmount":(U.map&&U.map.unigp?"unigp":"findgp");
    const why = (a.mood==="low"||a.mood==="crisis")?"You need a GP to access UCL counselling, so do this first":(a.gp==="unsure"?"A GP back home won't cover you where you study":"You don't have a GP where you study yet");
    add(id,"now",why,92);
    if(intl) add("gpintl","week","The NHS works differently from most countries",65);
    add("vaccines","week","Freshers' weeks are when meningitis and mumps spread",55);
  }
  if(has("conditions","meds")) add("meds","week","You take regular medication",68);
  if(has("conditions","disability")||has("conditions","longterm")||has("conditions","neuro")){
    const what = has("conditions","neuro")?"ADHD / autism / dyslexia":(has("conditions","disability")?"a disability":"a long-term condition");
    add("disability","week",`You mentioned ${what}`,78);
    add("rarexam","keep","Exam adjustments have deadlines",50);
    if(a.origin==="home") add("dsa","week","Home students with "+what+" can usually apply",60);
  }

  // Food
  const dietLbl = (a.diet||[]).filter(d=>!["none","veg","halal"].includes(d)).map(d=>({nuts:"nut allergy",gluten:"coeliac disease",dairy:"dairy-free diet"}[d]));
  if(dietLbl.length){
    const d = dietLbl.join(" & ");
    if(a.living==="halls_cat") add("allergycat","now","You're in catered halls with "+d,88);
    add("allergyout","keep","Your rights when eating on campus and out",42);
  }
  if((a.diet||[]).includes("halal")&&a.living==="halls_cat") add("allergycat","week","Let catering know your dietary requirements",58);
  if(has("diet","gluten")) add("coeliac","keep","Built for coeliac students",38);
  if(a.food<=30 || a.money<=200){ add("pantry", a.food<=20||a.money<=100?"now":"week", `£${a.food}/week for food is tight${U.london?" in London":""}`, 72); add("tgtg","week","Cuts food costs without cutting meals",52); }
  if(a.living!=="halls_cat"&&a.living!=="family") add("batch","keep","Matched to your budget and schedule",36);
  if(a.living==="halls_cat") add("catered","keep","You're already paying for most meals",18);

  // Money
  if(has("moneyissue","delay")){ add("stl","now","Your funding is delayed, so this bridges the gap",94); if(a.origin==="home") add("sfe","now","Find out why it's late",85); }
  if(has("moneyissue","unexpected")){ add("faf","week","For unexpected costs or a change in circumstances",76); add("sarah","keep","A back-up if UCL's fund can't help",44); }
  if(has("moneyissue","debt")) add("debt","week","Free advice before debt grows",74);
  if(a.money<=150 && !has("moneyissue","unexpected")) add("faf","week",`£${a.money}/month after rent is very tight`,70);
  if(has("moneyissue","work")) add("work","week","You're looking for work",56);
  if(U.london) add("oyster","keep","Travel is a big cost in London",30); else add("railcard","keep","Cheaper trips home and around the country",30);
  if(intl) add("bank","week","You'll need a UK account for rent and wages",54);
  if(a.money<=300||has("moneyissue","debt")) add("col","keep","Everything else UCL offers for money",28);

  // Social
  if(a.living==="pbsa" && a.social!=="good") add("resteam","week","You're in private student halls",60);
  if(a.social==="lonely"){ if(uniHalls) add("sra","week","Lonely in halls? This is exactly what they're there for",71); add("societies","week","You said you're feeling lonely",69); if(intl) add("intl","week","Homesickness is very common for international students",64); add("tutor","keep","Someone at UCL who knows you",30); }
  if(a.social==="some"){ add("societies","keep","Turn a few contacts into a group",32); }
  if(a.social==="good" && uniHalls) add("sra","keep","Your go-to person in halls",15);

  // Circumstances
  if(has("circ","care")) add("carebursary","week","You're care-experienced, and this is £1,000 a year",77);
  if(has("circ","estranged")) add("estrangedbursary","week","You're estranged from your parents, and this is £1,000 a year",77);
  if(has("circ","carer")) add("carers","week","You're juggling study with caring",66);
  if(has("circ","first")) add("tutor","week","First in your family? Nobody at home has done this before, so your tutor can explain how things work",62);

  // Worries
  if(has("worries","unsafe")) add("reportsupport","now","You mentioned harassment or feeling unsafe",96);
  if(has("worries","grief")){ add("ucl247","now","Bereavement is one of the things they support",88); add("ec","week","Grief can affect deadlines, and you can get mitigation",70); if(a.mood!=="good") add("counselling","week","Support through grief",68); }
  if(has("worries","homesick")){ add("ucl247","week","They support homesickness specifically, any time of day",62); if(intl) add("intl","week","Homesickness is very common for international students",64); }
  if(has("worries","relationships")) add("ucl247","week","Relationship and family worries are part of what they support",60);
  if(has("worries","academic")) add("tutor","week","You're feeling pressure from your course",63);

  // Home & study
  if(a.housing==="risk"){ add("emergencyhousing","now","You might lose your housing",93); add("advice","now","They can check your tenancy and your rights",86); }
  if(a.housing==="dispute") add("advice","week","They can check contracts and help with landlord or flatmate disputes",73);
  if(a.course==="event"){ add("ec","now","Something is affecting your deadlines, so apply before they pass",91); add("advice","keep","Independent help if your EC claim gets complicated",34); }
  if(a.course==="behind"){ add("tutor","week","You said you're falling behind",72); if(has("conditions","neuro")||has("conditions","disability")) add("rarexam","week","Adjustments can stop you falling further behind",66); }

  // Identity
  if(has("identity","lgbt")) add("lgbt","keep","You asked about LGBTQ+ support",40);
  if(has("identity","faith")) add("chaplaincy","keep","You asked about faith support",38);

  const order={now:0,week:1,keep:2};
  // One SSWS registration covers both disability and mental health; don't show it twice
  if(out.find(o=>o.id==="disability")) { const i=out.findIndex(o=>o.id==="sswsmh"); if(i>-1){ out.find(o=>o.id==="disability").why+=" and a mental health condition, so one registration covers both"; out.splice(i,1);} }
  // In crisis, only show what helps right now; the rest can wait
  if(a.mood==="crisis") return out.filter(o=>R[o.id].pillar==="mental"||["ridgmount","findgp"].includes(o.id)).sort((x,y)=>order[x.tier]-order[y.tier]||y.score-x.score);
  return out.sort((x,y)=>order[x.tier]-order[y.tier]||y.score-x.score);
}

function uniInfo(a){
  const row = UNIS.find(u=>u[0]===a.uni) || [UCL_NAME,"L"];
  const nation = row[1]==="L" ? "E" : row[1];
  return { map: UNI_MAP[row[0]]||null, name: row[0], short: row[0].replace(/^University of (the )?/,"").replace(/ \(.*\)$/,""), ucl: row[0]===UCL_NAME, london: row[1]==="L", nation };
}
// Pick the right version of a service: UCL-mapped entry, or the generic "ask your university" version
function svc(id,a){
  const r=R[id], U=uniInfo(a);
  let o=r;
  if(!U.ucl && U.map && U.map[id]) o={...r,...U.map[id]};
  else if(r.uni==="ucl" && !U.ucl && r.alt) o={...r,...r.alt};
  else if(r.london && !U.london && r.alt) o={...r,...r.alt};
  let steps = GUIDES.base[id]||[];
  if(!U.ucl && (r.uni==="ucl"||id==="unigp")) steps = (U.map&&GUIDES.map[U.name]&&GUIDES.map[U.name][id]) || GUIDES.alt[id] || (["societies","tutor","gpintl","work","vaccines","catered"].includes(id)?GUIDES.base[id]:[]);
  if(r.london && !U.london) steps = GUIDES.alt[id]||[];
  return {...o, steps, generic:(o.link||"").startsWith("search:")};
}
function linkFor(r,a){
  const U=uniInfo(a);
  const gp={E:"https://www.nhs.uk/service-search/find-a-gp",S:"https://www.nhsinform.scot",W:"https://111.wales.nhs.uk",N:"https://www.nidirect.gov.uk"}[U.nation];
  let l=r.link.replace("{gpLink}",gp);
  if(l.startsWith("search:")) l="https://www.google.com/search?q="+encodeURIComponent(l.slice(7).replace(/\{uni\}/g,U.name));
  return l;
}

function fill(text,a){
  const dietMap={nuts:"nut allergy",gluten:"coeliac disease",dairy:"dairy-free diet"};
  const diet=(a.diet||[]).map(d=>dietMap[d]).filter(Boolean).join(" & ")||"dietary needs";
  const schedMap={day:"flexible",evenings:"evenings-only",packed:"packed"};
  const workRule = a.origin==="home" ? "As a home student there's no legal limit on hours, but keep term-time work manageable so your studies don't suffer." : "On a Student visa for a degree you can usually work up to 20 hours a week in term time and full-time in vacations. Check your visa conditions first.";
  const schedNote = a.schedule==="packed" ? "With a packed timetable, choose one that meets weekly at a fixed time, so it's easy to protect." : a.schedule==="evenings" ? "Most societies meet in the evenings and at weekends, which suits your schedule." : "";
  const U=uniInfo(a);
  return text.replace(/\{uni\}/g,U.name).replace("{diet}",diet).replace("{food}",a.food).replace("{money}",a.money).replace("{weekly}",Math.round(a.money*12/52)).replace("{schedule}",schedMap[a.schedule]||"busy").replace("{workRule}",workRule).replace("{schedNote}",schedNote);
}

/* ───────────────────────── UI ───────────────────────── */
const app=document.getElementById("app");
let state={view:"home",step:0,a:{}};
const pillarName={mental:"Mental health",physical:"Physical health",food:"Food",money:"Money",study:"Home & studies",social:"Social"};
const pillarShort={mental:"Mental",physical:"Physical",food:"Food",money:"Money",study:"Home",social:"Social"};
const pillarOrder=["mental","physical","food","money","study","social"];
const tierShort={now:"Today",week:"This week",keep:"Keep handy"};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function defaults(){ const a={}; STEPS.forEach(s=>s.qs.forEach(q=>{ if(q.type==="range") a[q.id]=q.def; if(q.type==="many") a[q.id]=[]; })); return a; }

function home(){
  app.innerHTML=`
  <div class="card">
    <h1>Your first term, sorted.</h1>
    <p class="sub">The support you need at UCL already exists. It's just spread across dozens of websites, phone lines and charities. UniGuide asks a few questions and shows you what matters for you, in order.</p>
    <div class="how">
      <div><b>1 · Tell us</b>Health, food, money, housing, studies, social life: 7 short screens.</div>
      <div><b>2 · We match</b>Your answers are checked against UCL, NHS and charity services.</div>
      <div><b>3 · You act</b>A ranked plan: what to do today, this week, and what to keep handy.</div>
    </div>
    <div class="or">try it as a sample student</div>
    <div class="personas">${PERSONAS.map((p,i)=>`<button class="persona" data-p="${i}"><b>${p.name}</b><small>${p.desc}</small></button>`).join("")}</div>
    <div class="or">or</div>
    <button class="btn btn-p" id="start" style="width:100%">Start with my own answers →</button>
    <p class="foot">Prototype by Beatrice Brozzi & Mélusine Jurd de Girancourt. Not an official university service. Service details checked against UCL, Students' Union UCL, NHS and charity websites in November 2026. Nothing you enter leaves your browser.</p>
  </div>`;
  app.querySelectorAll(".persona").forEach(b=>b.onclick=()=>{ state.a={...defaults(),...PERSONAS[+b.dataset.p].a}; state.done=new Set(); state.persona=PERSONAS[+b.dataset.p].name; state.view="results"; render(); });
  document.getElementById("start").onclick=()=>{ state={view:"form",step:0,a:defaults()}; render(); };
}

function visible(q){ return !q.show || q.show(state.a); }
function answered(q){ if(!visible(q)) return true; const v=state.a[q.id]; return q.optional||q.type==="range"||(q.type==="one"?!!v:(v&&v.length)); }

function form(){
  const s=STEPS[state.step];
  app.innerHTML=`
  <div class="card">
    <div class="progress">${STEPS.map((_,i)=>`<i class="${i<=state.step?"on":""}"></i>`).join("")}</div>
    <div class="steplbl">Step ${state.step+1} of ${STEPS.length}</div>
    <h1>${s.title}</h1>
    ${s.qs.filter(visible).map(q=>`<div class="q">
      <span class="qt">${q.label} ${q.hint?`<span class="hint">· ${q.hint}</span>`:""}</span>
      ${q.type==="uni"
        ? `<select id="unisel" style="width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:12px;background:#fff;font-weight:600"><option value="">Choose your university…</option>${UNIS.map(u=>`<option value="${esc(u[0])}" ${state.a.uni===u[0]?"selected":""}>${esc(u[0])}${(u[0]===UCL_NAME||UNI_MAP[u[0]])?"  ✓":""}</option>`).join("")}</select>
           <p class="hint" style="margin-top:6px;font-size:.8rem;color:var(--muted)">${state.a.uni? (uniInfo(state.a).ucl? "✓ Fully mapped: you'll see UCL's own services." : uniInfo(state.a).map ? "✓ Mapped: you'll see "+esc(state.a.uni)+"'s own core services." : "We've mapped UCL, King's, LSE and Imperial so far. For "+esc(state.a.uni)+" you'll get national services, plus what to ask your university for and where to find it.") : "Covers every UK university. UCL, King's, LSE and Imperial are mapped so far."}</p>`
        : q.type==="range"
        ? `<div class="range"><input type="range" id="r-${q.id}" min="${q.min}" max="${q.max}" step="${q.step}" value="${state.a[q.id]}"><span class="rv" id="v-${q.id}">${q.unit}${state.a[q.id]}${q.id==="money"&&state.a[q.id]>=q.max?"+":""} <small style="font-weight:600;color:var(--muted)">${q.suffix}</small></span></div>`
        : `<div class="chips">${q.opts.map(([v,l])=>{ const sel=q.type==="one"?state.a[q.id]===v:(state.a[q.id]||[]).includes(v); return `<span class="chip ${sel?"sel":""}" data-q="${q.id}" data-v="${v}" data-t="${q.type}" role="button" tabindex="0">${l}</span>`;}).join("")}</div>`}
    </div>`).join("")}
    <div class="nav">
      <button class="btn btn-g" id="back">← ${state.step===0?"Home":"Back"}</button>
      <button class="btn btn-p" id="next" ${s.qs.every(answered)?"":"disabled"}>${state.step===STEPS.length-1?"Show my plan →":"Next →"}</button>
    </div>
  </div>`;
  app.querySelectorAll(".chip").forEach(c=>{ const go=()=>{
    const {q,v,t}=c.dataset;
    if(t==="one") state.a[q]=v;
    else { let arr=state.a[q]||[]; if(v==="none") arr=arr.includes("none")?[]:["none"]; else { arr=arr.filter(x=>x!=="none"); arr=arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]; } state.a[q]=arr; }
    if(q==="mood"&&v==="crisis"){ state.view="results"; state.persona=null; render(); return; }
    form(); };
    c.onclick=go; c.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } }; });
  const us=document.getElementById("unisel"); if(us) us.onchange=()=>{ state.a.uni=us.value; form(); };
  s.qs.filter(q=>q.type==="range"&&visible(q)).forEach(q=>{ const r=document.getElementById("r-"+q.id); r.oninput=()=>{ state.a[q.id]=+r.value; document.getElementById("v-"+q.id).innerHTML=`${q.unit}${r.value}${q.id==="money"&&+r.value>=q.max?"+":""} <small style="font-weight:600;color:var(--muted)">${q.suffix}</small>`; }; });
  document.getElementById("back").onclick=()=>{ if(state.step===0){state.view="home";} else state.step--; render(); };
  document.getElementById("next").onclick=()=>{ if(state.step===STEPS.length-1) {state.view="results"; state.persona=null;} else state.step++; render(); };
}

function results(keep){
  if(!state.done) state.done=new Set();
  const a=state.a; const p=plan(a);
  const tiers=[["now","Do today","Most urgent for your situation"],["week","This week","Set these up while things are calm"],["keep","Keep handy","For later, or if things change"]];
  const crisis=a.mood==="crisis";
  const lbl={living:{halls_cat:"Catered halls",halls_self:"Self-catered halls",pbsa:"Private student halls",private:"Private housing",family:"Living with family"},origin:{home:"UK student",eu:"EU student",intl:"International student"},living:{halls_cat:"Catered halls",halls_self:"Self-catered halls",private:"Private housing",family:"Living with family"},mood:{good:"Feeling OK",stressed:"Stressed",low:"Struggling",crisis:"In crisis"}};
  const pills=[uniInfo(a).short,lbl.origin[a.origin],lbl.living[a.living],lbl.mood[a.mood],a.gp!=="yes"?"No local GP":null,`£${a.food}/wk food`,`£${a.money}/mo after rent`].filter(Boolean);
  app.innerHTML=`
  ${crisis?`<div class="crisis">
    <h2>If you're in danger right now, call 999 or go to A&E</h2>
    <p class="sub" style="color:#7A2A2A">${uniInfo(a).ucl?"The nearest A&E to UCL is at University College Hospital, 235 Euston Road.":"Go to your nearest A&E."} You don't have to go through this alone. These lines are free and open now:</p>
    <div class="lines">
      <div class="ln"><b>116 123</b>Samaritans · call, 24/7</div>
      <div class="ln"><b>Text SHOUT to 85258</b>Shout · text, 24/7</div>
      ${uniInfo(a).nation==="N"?'<div class="ln"><b>0808 808 8000</b>Lifeline · 24/7</div>':'<div class="ln"><b>111</b>NHS · choose the mental health option</div>'}
      <div class="ln"><b>999</b>Emergency services</div>
    </div></div>`:""}
  <div class="card">
    <h1>${state.persona?esc(state.persona.split(",")[0])+"'s plan":"Your plan"}</h1>
    <p class="sub">${p.length} actions for ${esc(uniInfo(a).name)}, ranked for this situation. Each one shows why it's here.</p>
    ${uniInfo(a).ucl?"":(uniInfo(a).map?`<div class="why" style="display:block;margin-top:12px">✓ ${esc(uniInfo(a).name)}'s core services are mapped: GP, counselling, out-of-hours support, hardship funds, advice and reporting. A few items are general guidance, with a link to find them.</div>`:`<div class="why" style="display:block;margin-top:12px">We've mapped UCL, King's, LSE and Imperial so far. For ${esc(uniInfo(a).name)} you're seeing national services, plus what to ask your university for, each with a link to find it.</div>`)}
    <div id="savebox"></div>
    <div class="summary">${pills.map(x=>`<span class="pill">${esc(x)}</span>`).join("")}</div>
    <div class="overview">${pillarOrder.map(pl=>{ const it=p.filter(x=>R[x.id].pillar===pl); const urgent=it.some(x=>x.tier==="now"); return `<button class="ov ${it.length?"":"zero"}" data-pl="${pl}"><span class="tag t-${pl}" style="white-space:nowrap">${pillarShort[pl]}</span><b>${it.length}</b><small>${urgent?'<span class="dot"></span>urgent':'actions'}</small></button>`; }).join("")}</div>
    <div class="toggle"><button id="vu" class="${!state.mode||state.mode==="urgency"?"on":""}">By urgency</button><button id="va" class="${state.mode==="area"?"on":""}">By area</button><button id="vc" class="${state.mode==="check"?"on":""}">Checklist</button></div>
    ${state.mode==="check" ? checklist(p,a) : (state.mode==="area"
      ? pillarOrder.map(pl=>[pl,pillarName[pl],"",p.filter(x=>R[x.id].pillar===pl)])
      : tiers.map(([t,h,s])=>[t,h,s,p.filter(x=>x.tier===t)])
    ).map(([k,h,s,items])=>{ if(!items.length) return ""; return `
      <div class="tier" id="sec-${k}"><div class="tier-h"><h2>${h}</h2><span class="count">${items.length}</span><span>${s}</span></div>
      ${items.map(x=>card(x,a)).join("")}</div>`; }).join("")}
    <div class="actions">
      <button class="btn btn-p" id="copy">Copy my plan</button>
      ${state.persona?`<button class="btn btn-o" id="edit">Change ${esc(state.persona.split(",")[0])}'s answers</button>`:`<button class="btn btn-o" id="edit">Change my answers</button>`}
      <button class="btn btn-g" id="home">Try another student</button>
    </div>
    <p class="foot">UniGuide prototype. Not an official UCL service and not medical advice. Details were checked against official pages in November 2026; always confirm on the linked page.</p>
  </div>`;
  document.getElementById("vu").onclick=()=>{ state.mode="urgency"; results(); };
  document.getElementById("va").onclick=()=>{ state.mode="area"; results(); };
  document.getElementById("vc").onclick=()=>{ state.mode="check"; results(); };
  app.querySelectorAll(".ov").forEach(o=>o.onclick=()=>{ state.mode="area"; results(); const el=document.getElementById("sec-"+o.dataset.pl); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); });
  app.querySelectorAll(".chk input").forEach(c=>c.onchange=()=>{ c.checked?state.done.add(c.dataset.id):state.done.delete(c.dataset.id); results(true); });
  document.getElementById("home").onclick=()=>{ state={view:"home",step:0,a:{},mode:state.mode}; render(); };
  document.getElementById("edit").onclick=()=>{ state.view="form"; state.step=0; render(); };
  document.getElementById("copy").onclick=async()=>{
    const txt=["My UniGuide plan",""].concat(tiers.flatMap(([t,h])=>{ const it=p.filter(x=>x.tier===t); return it.length?[h.toUpperCase(),...it.map(x=>{ const r=svc(x.id,a); return `• ${fill(r.title,a)} (${r.meta.map(m=>fill(m[1],a)).join(", ")}) ${linkFor(r,a)}`+(r.steps||[]).map((t,i)=>`\n    ${i+1}. ${fill(t,a)}`).join(""); }),""]:[]; })).join("\n");
    try{ await navigator.clipboard.writeText(txt); toast("Plan copied"); }catch(e){ toast("Couldn't copy here. Select the text instead"); }
  };
  if(!keep) window.scrollTo(0,0);
  if(window.UGAccount) UGAccount.onPlan();
}

function card(x,a){ const r=svc(x.id,a); return `<div class="item ${x.tier}">
  <div class="item-top">${state.mode==="area"?`<span class="u u-${x.tier}" style="margin-left:0">${tierShort[x.tier]}</span>`:`<span class="tag t-${r.pillar}">${pillarName[r.pillar]}</span>`}</div>
  <h3>${esc(fill(r.title,a))}</h3>
  <div class="why">Why you're seeing this: ${esc(x.why)}</div>
  <p>${esc(fill(r.body,a))}</p>
  ${r.steps&&r.steps.length?`<details class="guide" ${x.tier==="now"?"open":""}><summary>How to do it · ${r.steps.length} steps</summary><ol>${r.steps.map(t=>`<li>${esc(fill(t,a))}</li>`).join("")}</ol></details>`:""}
  <div class="meta">${r.meta.map(([k,v])=>`<span><b>${k}:</b> ${esc(fill(v,a))}</span>`).join("")}<a href="${linkFor(r,a)}" target="_blank" rel="noopener">${r.generic?"Find it at your university ↗":"Official page ↗"}</a></div>
</div>`; }

function checklist(p,a){
  const done=p.filter(x=>state.done.has(x.id)).length; const pct=p.length?Math.round(done/p.length*100):0;
  return `<div class="bar"><i style="width:${pct}%"></i></div><p class="sub"><b>${done} of ${p.length}</b> done${done===p.length&&p.length?" 🎉 You're all set.":""}</p>
  <div style="margin-top:14px">${p.map(x=>{ const r=svc(x.id,a); const d=state.done.has(x.id); return `<label class="chk ${d?"done":""}"><input type="checkbox" data-id="${x.id}" ${d?"checked":""}><div><h3>${esc(fill(r.title,a))}</h3>${r.steps&&r.steps.length&&!d?`<div class="m" style="color:var(--brand-d)">Start: ${esc(fill(r.steps[0],a))}</div>`:""}<div class="m"><span class="u u-${x.tier}">${tierShort[x.tier]}</span>${pillarName[r.pillar]} · ${esc(r.meta.map(m=>m[1]).join(" · "))}</div></div></label>`; }).join("")}</div>`;
}

function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("on"); setTimeout(()=>t.classList.remove("on"),1800); }
function render(){ ({home,form,results})[state.view](); }
function route(){
  const tool = location.hash==="#try";
  document.getElementById("landing").style.display = tool?"none":"";
  document.getElementById("tool").style.display = tool?"":"none";
  if(tool){ render(); window.scrollTo(0,0); }
  else if(location.hash==="#about"){ window.scrollTo(0,0); }
}
document.getElementById("svcCount").textContent = Object.keys(R).length + Object.values(UNI_MAP).reduce((n,m)=>n+Object.keys(m).length,0);
const LANDING_UNIS = {
  "UCL":{uni:["Counselling Services","24/7 Student Support Line","Financial Assistance Fund","Short Term Loans","Disability & Neurodiversity","Report + Support","Care & estranged bursaries"],su:["Students' Union UCL Advice Service","Essentials Pantry","Sarah Douglas Hardship Fund","Clubs & societies","LGBTQ+ & carers networks"],gp:"Ridgmount Practice (UCL's partner GP)",suName:"Students' Union UCL"},
  "King's":{uni:["Counselling & Mental Health Support","King's Counselling Online (out of hours)","King's Hardship Fund","International Hardship Fund","Money & Housing Advice","Report + Support"],su:["KCLSU Advice","400+ clubs & societies"],gp:"King's College NHS Health Centre",suName:"KCLSU"},
  "LSE":{uni:["Student Wellbeing Service","24/7 support line (Spectrum.Life)","Disability & Mental Health Service","\"My Adjustments\"","LSE Hardship Fund","Report + Support"],su:["LSESU Advice Service","LSESU Hardship Fund"],gp:"St Philips Medical Centre (on campus)",suName:"LSESU"},
  "Imperial":{uni:["Counselling & Mental Health Advice","SilverCloud 24/7 self-help","Disability Advisory Service","Student Support Fund (up to £5,000)","Emergency interest-free loans","Report + Support","Chaplaincy Multi-Faith Centre"],su:["ICU Advice Service"],gp:"Imperial College Health Centre",suName:"Imperial College Union"},
};
function showUniTab(k){
  const d=LANDING_UNIS[k];
  document.getElementById("uniColTitle").textContent=k;
  document.getElementById("uniColList").innerHTML=d.uni.map(x=>`<li>${esc(x)}</li>`).join("");
  document.getElementById("suColTitle").textContent=d.suName;
  document.getElementById("suColList").innerHTML=d.su.map(x=>`<li>${esc(x)}</li>`).join("");
  document.getElementById("gpLi").textContent=d.gp;
  document.querySelectorAll("#unitabs button[data-k]").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
}
document.getElementById("unitabs").innerHTML=Object.keys(LANDING_UNIS).map(k=>`<button data-k="${k}">${k}</button>`).join("")+`<button class="more">+ any UK university</button>`;
document.querySelectorAll("#unitabs button[data-k]").forEach(b=>b.onclick=()=>showUniTab(b.dataset.k));
showUniTab("UCL");
window.addEventListener("hashchange", route);
route();
