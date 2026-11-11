/* ───────────────────────── RULES ENGINE ─────────────────────────
   Each rule: when(answers) → {id, tier, why}. Tier: now | week | keep. Score orders within tier. */
// Food allergies and preferences (older saved answers used a single "diet" list)
const ALLERGY_LBL={nuts:"nut allergy",gluten:"coeliac disease",dairy:"dairy allergy or intolerance",otherallergy:"food allergy"};
function dietOf(a){ return [...(a.allergy||[]),...(a.dietpref||[]),...(a.diet||[])].filter(d=>d!=="none"); }

function plan(a){
  const out=[]; const rank={now:0,week:1,keep:2};
  // Add a service. If it's already in the plan, keep the more urgent reason.
  const add=(id,tier,why,score=50)=>{ const o=out.find(o=>o.id===id); if(!o) out.push({id,tier,why,score}); else if(rank[tier]<rank[o.tier]) Object.assign(o,{tier,why,score}); };
  const has=(k,v)=>(a[k]||[]).includes(v);
  const intl = a.origin!=="home";
  const halls = a.living==="halls_cat"||a.living==="halls_self"||a.living==="pbsa";
  const busy = a.schedule!=="day";
  const U = uniInfo(a);
  const uniHalls = a.living==="halls_cat"||a.living==="halls_self";

  // Mental health
  if(a.mood==="crisis"){ add("samaritans","now","You told us you're not safe right now",100); add("shout","now","If talking feels too hard, you can text",99); add(U.nation==="N"?"lifeline":"nhs111mh","now",U.nation==="N"?"24/7 crisis support where you study":"Urgent NHS mental health help",98); add("stayalive","week","A safety plan helps you through the next tough moment",80); }
  if(a.mood==="low"){ add("counselling","now","You said you're struggling to cope. Triage happens within 24 hours",95); add(busy?"nightline":"ucl247", "now", busy?(a.schedule==="packed"?"Your days are packed, and Nightline is open overnight"+(U.london?", 6pm–8am":""):"You're mostly free in the evenings, and Nightline runs overnight"+(U.london?", 6pm–8am":"")):(U.ucl?"Someone to talk to today, 24/7":"Someone to talk to today"), 90); add("samaritans","keep","Keep this number for a really bad moment",60); }
  if(a.mood==="stressed"){ add("ucl247","week",U.ucl?"For stress and anxiety, at any hour"+(intl?", and in 35+ languages":""):"For stress and anxiety, when you need someone to talk to",70); add("studentminds","keep","Self-help tools for stress and anxiety",40); if(busy) add("nightline","keep","Open the hours you're actually free",35); }
  if(a.mood==="good"||a.mood==="prefer"){ add("ucl247","keep","Save it now so it's there if you ever need it",20); }
  if(a.mhcond==="yes"){ add("sswsmh","week","Registering a condition gets support set up before deadlines hit",75); if(a.mood!=="low"&&a.mood!=="crisis") add("counselling","keep","Ongoing support alongside your GP",45); }
  if(a.mhcond==="unsure"&&(a.mood==="low"||a.mood==="stressed")) add("sswsmh","keep","An adviser can help, even without a diagnosis",40);

  // Physical health
  if(a.gp!=="yes"){
    const id = (U.ucl && a.area==="central")?"ridgmount":(U.map&&U.map.unigp?"unigp":"findgp");
    const why = a.gp==="home"?"You said you're still registered with your GP at home":a.gp==="unsure"?"You weren't sure if you're registered with a GP near university":"You said you're not registered with a GP near university";
    add(id,"now",why,92);
    if(intl) add("gpintl","week","The NHS works differently from most countries",65);
    add("vaccines","week","Starting university is a good time to check your vaccinations",55);
  }
  if(has("conditions","meds")) add("meds","week","You take regular medication",68);
  if(has("conditions","disability")||has("conditions","longterm")||has("conditions","neuro")){
    const what = has("conditions","neuro")?"ADHD / autism / dyslexia":(has("conditions","disability")?"a disability":"a long-term condition");
    add("disability","week",`You mentioned ${what}`,78);
    add("rarexam","keep","Exam adjustments have deadlines",50);
    if(a.origin==="home") add("dsa","week","Home students with "+what+" can usually apply",60);
  }

  // Food
  const diet = dietOf(a);
  const dietLbl = diet.map(d=>ALLERGY_LBL[d]).filter(Boolean);
  if(dietLbl.length){
    const d = dietLbl.join(" & ");
    if(a.living==="halls_cat") add("allergycat","now","You're in catered halls with "+d,88);
    add("allergyout","keep","Your rights when eating on campus and out",42);
  }
  if((diet.includes("halal")||diet.includes("kosher"))&&a.living==="halls_cat") add("allergycat","week","Let catering know your dietary requirements",58);
  if(diet.includes("gluten")) add("coeliac","keep","Built for coeliac students",38);
  const foodTight = !a.foodUnknown && a.food<=30;
  if(foodTight || a.money<=200){ add("pantry", (!a.foodUnknown&&a.food<=20)||a.money<=100?"now":"week", foodTight?`£${a.food}/week for food is tight${U.london?" in London":""}`:`£${a.money}/month for living costs is tight${U.london?" in London":""}`, 72); add("tgtg","week","Cuts food costs without cutting meals",52); }
  if(a.living!=="halls_cat"&&a.living!=="family") add("batch","keep","Matched to your budget and schedule",36);
  if(a.living==="halls_cat") add("catered","keep","You're already paying for most meals",18);

  // Money
  if(has("moneyissue","delay")){ add("stl","now","Your funding is delayed, so this bridges the gap",94); if(a.origin==="home") add("sfe","now","Find out why it's late",85); }
  if(has("moneyissue","unexpected")){ add("faf","week","For unexpected costs or a change in circumstances",76); add("sarah","keep","A back-up if UCL's fund can't help",44); }
  if(has("moneyissue","debt")) add("debt","week","Free advice before debt grows",74);
  if(a.money<=150 && !has("moneyissue","unexpected")) add("faf","week",`£${a.money}/month after rent is very tight`,70);
  if(has("moneyissue","work")){ add("work","week","You're looking for work",56); add("careersvc","week","They advertise student jobs and can check your CV",55); }
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
  if(has("worries","unsafe")){ add("reportsupport","now","You mentioned harassment or feeling unsafe",96); add("ucl247","week",U.ucl?"Talk it through with someone, at any hour":"Talk it through with someone",72); add("victimsupport","week","Independent support, whether or not you report it",66); }
  if(has("worries","grief")){ add("ucl247","now",U.ucl?"Bereavement is one of the things they support":"Support for coping with bereavement",88); add("ec","week","Grief can affect deadlines, and you can get mitigation",70); if(a.mood!=="good") add("counselling","week","Support through grief",68); add("cruse","week","Specialist bereavement support, free",64); }
  if(has("worries","homesick")){ add("ucl247","week",U.ucl?"They support homesickness specifically, any time of day":"Support with homesickness",62); if(intl) add("intl","week","Homesickness is very common for international students",64); add("societies","week","Meeting people with shared interests helps homesickness",58); if(uniHalls) add("sra","week","Your hall team can help you settle in and meet people",57); }
  if(has("worries","relationships")) add("ucl247","week",U.ucl?"Relationship and family worries are part of what they support":"Support with relationship and family worries",60);
  if(has("worries","academic")) add("tutor","week","You're feeling pressure from your course",63);

  // Home & study
  if(a.housing==="risk"){ add("emergencyhousing","now","You might lose your housing",93); add("advice","now","They can check your tenancy and your rights",86); }
  if(a.housing==="dispute") add("advice","week","They can check contracts and help with landlord or flatmate disputes",73);
  if(a.course==="event"){ add("ec","now","Something is affecting your deadlines, so apply before they pass",91); add("advice","keep","Independent help if your EC claim gets complicated",34); }
  if(a.course==="behind"){ add("tutor","week","You said you're falling behind",72); if(has("conditions","neuro")||has("conditions","disability")) add("rarexam","week","Adjustments can stop you falling further behind",66); }

  // Identity
  if(has("identity","lgbt")) add("lgbt","keep","You asked about LGBTQ+ support",40);
  if(has("identity","faith")) add("chaplaincy","keep","You asked about faith support",38);

  // Careers & opportunities
  if(has("career","parttime")){ add("work","week","You're looking for a part-time job",56); add("careersvc","week","They advertise student jobs and can check your CV",55); }
  if(has("career","internship")){ add("internships","week","Many internship deadlines fall in the autumn, so start early",64); add("careersvc","week","They can check your CV and applications before you send them",58); }
  if(has("career","volunteer")) add("volunteer","week","You're interested in volunteering",50);
  if(has("career","unsure")) add("careersvc","week","Exploring your options? That's exactly what careers advisers help with",54);
  if(has("circ","first")) add("careersvc","keep","First in your family? Careers advisers can explain internships and graduate schemes",34);
  if(!out.some(o=>R[o.id].pillar==="career")) add("careersvc","keep","Free while you're a student, and worth knowing about early",12);

  // International students
  if(intl){
    if(a.visa==="student"){ add("evisa","week","You're on a Student visa, and your eVisa proves your right to study, rent and work",80); add("visaadvice","keep","Check with them before changing your course, hours or travel plans",40); }
    if(a.visa==="other") add("visaadvice","week","Not sure about your immigration status? Check it before term gets busy",78);
    add("intl","keep","Settling-in support and events for international students",30);
    add("ukcisa","keep","Independent, plain-English guides for international students",26);
    add("gpintl","keep","How the NHS works, from GP to pharmacy to A&E",22);
  }

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
  const diet=dietOf(a).map(d=>ALLERGY_LBL[d]).filter(Boolean).join(" & ")||"dietary needs";
  if(a.foodUnknown) text=text.replace("your £{food}/week","your weekly food budget").replace("£{food}/week","your weekly food budget");
  const schedMap={day:"flexible",evenings:"evenings-only",packed:"packed"};
  const workRule = a.origin==="home" ? "As a home student there's no legal limit on hours, but keep term-time work manageable so your studies don't suffer." : "On a Student visa for a degree you can usually work up to 20 hours a week in term time and full-time in vacations. Check your visa conditions first.";
  const schedNote = a.schedule==="packed" ? "With a packed timetable, choose one that meets weekly at a fixed time, so it's easy to protect." : a.schedule==="evenings" ? "Most societies meet in the evenings and at weekends, which suits your schedule." : "";
  const U=uniInfo(a);
  return text.replace(/\{uni\}/g,U.name).replace("{diet}",diet).replace("{food}",a.food).replace("{money}",a.money).replace("{weekly}",Math.round(a.money*12/52)).replace("{schedule}",schedMap[a.schedule]||"busy").replace("{workRule}",workRule).replace("{schedNote}",schedNote);
}

/* ───────────────────────── UI ───────────────────────── */
const app=document.getElementById("app");
let state={view:"home",step:0,a:{}};
const pillarName={mental:"Mental health",physical:"Physical health",food:"Food",money:"Money",study:"Home & studies",social:"Social",career:"Careers",international:"International"};
const pillarShort={mental:"Mental",physical:"Physical",food:"Food",money:"Money",study:"Home",social:"Social",career:"Careers",international:"Intl"};
const pillarOrder=["mental","physical","food","money","study","social","career","international"];
const tierShort={now:"Today",week:"This week",keep:"Keep handy"};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function defaults(){ const a={}; STEPS.forEach(s=>s.qs.forEach(q=>{ if(q.type==="range") a[q.id]=q.def; if(q.type==="many") a[q.id]=[]; })); return a; }

function home(){
  app.innerHTML=`
  <div class="card">
    <h1>Your university experience, your personalised guide.</h1>
    <p class="sub">Answer a few questions to discover relevant university, NHS and charity services, organised into a personalised action plan.</p>
    <div class="how">
      <div><b>01 · Tell us about you</b>Your needs and university</div>
      <div><b>02 · We find your support</b>Relevant services, prioritised</div>
      <div><b>03 · Get your plan</b>Clear steps to follow</div>
    </div>
    <button class="btn btn-p" id="start" style="width:100%;margin-top:20px">Create my personalised plan →</button>
    <div class="explore">Just exploring? <button class="linkbtn" id="exToggle" aria-expanded="${state.showEx?"true":"false"}">View an example plan →</button></div>
    ${state.showEx?`<div class="examples">
      <p class="hint">Pick an example student to see the plan Owl would build for them.</p>
      <div class="personas">${PERSONAS.map((p,i)=>`<button class="persona" data-p="${i}"><b>${esc(p.name.split(",")[0])}</b><small>${esc(uniInfo(p.a).ucl?"UCL":p.a.uni)}</small><span class="ptags">${(p.tags||[]).map(([c,l])=>`<span class="tag t-${c}">${l}</span>`).join("")}</span></button>`).join("")}</div>
    </div>`:""}
    <p class="foot">You can explore without an account. If you choose to save your plan, we'll ask for your consent first. <a href="privacy.html" target="_blank" rel="noopener">Privacy notice</a></p>
  </div>`;
  app.querySelectorAll(".persona").forEach(b=>b.onclick=()=>{ state.a={...defaults(),...PERSONAS[+b.dataset.p].a}; state.done=new Set(); state.persona=PERSONAS[+b.dataset.p].name; state.view="results"; render(); });
  document.getElementById("exToggle").onclick=()=>{ state.showEx=!state.showEx; home(); };
  document.getElementById("start").onclick=()=>{ state={view:"form",step:0,a:defaults()}; render(); };
}

function visible(q){ return !q.show || q.show(state.a); }
function answered(q){ if(!visible(q)) return true; const v=state.a[q.id]; return q.optional||q.type==="range"||(q.type==="one"?!!v:(v&&v.length)); }

function form(){
  const s=STEPS[state.step];
  app.innerHTML=`
  <div class="card">
    <div class="progress">${STEPS.map((_,i)=>`<i class="${i<=state.step?"on":""}"></i>`).join("")}</div>
    <div class="steplbl">${state.only?"Updating one section":`Step ${state.step+1} of ${STEPS.length}`}</div>
    <h1>${s.title}</h1>
    <p class="reqnote">All questions are required unless marked optional.</p>
    ${s.qs.filter(visible).map(q=>{ const miss=state.showErr&&!answered(q); return `<div class="q${miss?" missing":""}" id="q-${q.id}">
      <span class="qt">${q.label} ${q.hint?`<span class="hint">· ${q.hint}</span>`:""}</span>
      ${q.type==="uni"
        ? `<select id="unisel" style="width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:12px;background:#fff;font-weight:600"><option value="">Choose your university…</option>${UNIS.map(u=>`<option value="${esc(u[0])}" ${state.a.uni===u[0]?"selected":""}>${esc(u[0])}${(u[0]===UCL_NAME||UNI_MAP[u[0]])?"  ✓":""}</option>`).join("")}</select>
           <p class="hint" style="margin-top:6px;font-size:.8rem;color:var(--muted)">${state.a.uni? (uniInfo(state.a).ucl? "✓ Fully mapped: you'll see UCL's own services." : uniInfo(state.a).map ? "✓ Mapped: you'll see "+esc(state.a.uni)+"'s own core services." : "You'll see national services, plus how to find "+esc(state.a.uni)+"'s own support.") : "Covers every UK university. UCL, King's, LSE and Imperial are mapped so far."}</p>`
        : q.type==="range"
        ? `<div class="range${q.unknown&&state.a[q.unknown]?" off":""}"><input type="range" id="r-${q.id}" min="${q.min}" max="${q.max}" step="${q.step}" value="${state.a[q.id]}" ${q.unknown&&state.a[q.unknown]?"disabled":""}><span class="rv" id="v-${q.id}">${q.unit}${state.a[q.id]}${q.id==="money"&&state.a[q.id]>=q.max?"+":""} <small style="font-weight:600;color:var(--muted)">${q.suffix}</small></span></div>
           ${q.unknown?`<div class="chips" style="margin-top:8px"><span class="chip ${state.a[q.unknown]?"sel":""}" data-unk="${q.unknown}" role="button" tabindex="0" aria-pressed="${!!state.a[q.unknown]}">I'm not sure yet</span></div>`:""}`
        : `<div class="chips">${q.opts.map(([v,l])=>{ const sel=q.type==="one"?state.a[q.id]===v:(state.a[q.id]||[]).includes(v); return `<span class="chip ${sel?"sel":""}" data-q="${q.id}" data-v="${v}" data-t="${q.type}" role="button" tabindex="0" aria-pressed="${sel}">${l}</span>`;}).join("")}</div>`}
      ${miss?`<div class="qerr" role="alert">Please choose an answer</div>`:""}
      ${q.id==="mood"&&state.a.mood==="crisis"?`<div class="crisis-now" role="alert">
        <h3>Need immediate support?</h3>
        <p>If you're in immediate danger, call <a href="tel:999">999</a>. You can also contact <a href="tel:111">NHS 111</a> for urgent advice, Samaritans on <a href="tel:116123">116 123</a>, or text <a href="sms:85258?body=SHOUT">SHOUT to 85258</a> for confidential support.</p>
        <p><b>You don't need to finish the questionnaire to access help.</b></p>
        <button class="btn btn-danger" id="crisisGo" type="button">See urgent support now →</button>
      </div>`:""}
    </div>`; }).join("")}
    <p class="privnote">🔒 Your answers are used to personalise your plan. You can explore without creating an account, and we'll always ask for your consent before saving anything. Health answers are never saved.</p>
    <div class="nav">
      <button class="btn btn-g" id="back">← ${state.only?"All sections":state.step===0?"Home":"Back"}</button>
      <button class="btn btn-p" id="next">${state.only?"Update my plan →":state.step===STEPS.length-1?"Show my plan →":"Next →"}</button>
    </div>
  </div>`;
  app.querySelectorAll(".chip[data-unk]").forEach(c=>{ const go=()=>{ state.a[c.dataset.unk]=!state.a[c.dataset.unk]; form(); }; c.onclick=go; c.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } }; });
  app.querySelectorAll(".chip[data-q]").forEach(c=>{ const go=()=>{
    const {q,v,t}=c.dataset;
    if(t==="one") state.a[q]=v;
    else { const solo=["none","prefer"]; let arr=state.a[q]||[]; if(solo.includes(v)) arr=arr.includes(v)?[]:[v]; else { arr=arr.filter(x=>!solo.includes(x)); arr=arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]; } state.a[q]=arr; }
    form(); };
    c.onclick=go; c.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } }; });
  const cg=document.getElementById("crisisGo"); if(cg) cg.onclick=()=>{ state.view="results"; state.persona=null; render(); };
  const us=document.getElementById("unisel"); if(us) us.onchange=()=>{ state.a.uni=us.value; form(); };
  s.qs.filter(q=>q.type==="range"&&visible(q)).forEach(q=>{ const r=document.getElementById("r-"+q.id); r.oninput=()=>{ state.a[q.id]=+r.value; document.getElementById("v-"+q.id).innerHTML=`${q.unit}${r.value}${q.id==="money"&&+r.value>=q.max?"+":""} <small style="font-weight:600;color:var(--muted)">${q.suffix}</small>`; }; });
  document.getElementById("back").onclick=()=>{ state.showErr=false; if(state.only){state.view="pick";} else if(state.step===0){state.view="home";} else state.step--; render(); };
  document.getElementById("next").onclick=()=>{
    if(!s.qs.every(answered)){ state.showErr=true; form(); const first=s.qs.find(q=>!answered(q)); const el=first&&document.getElementById("q-"+first.id); if(el) el.scrollIntoView({behavior:"smooth",block:"center"}); return; }
    state.showErr=false;
    if(state.only||state.step===STEPS.length-1) {state.view="results"; state.persona=null; state.only=false;} else state.step++; render(); };
}

function results(keep){
  if(!state.done) state.done=new Set();
  const a=state.a; const p=plan(a);
  const tiers=[["now","Do today","Most urgent for your situation"],["week","This week","Set these up while things are calm"],["keep","Keep handy","For later, or if things change"]];
  const mode=state.mode||"urgency";
  // One group at a time: the selected urgency tier, or the selected area
  const tierList=tiers.map(t=>t[0]).filter(t=>p.some(x=>x.tier===t));
  const areaList=pillarOrder.filter(pl=>p.some(x=>R[x.id].pillar===pl));
  const curTier=tierList.includes(state.tier)?state.tier:tierList[0];
  const curArea=areaList.includes(state.area)?state.area:(areaList.find(pl=>p.some(x=>R[x.id].pillar===pl&&x.tier==="now"))||areaList[0]);
  const nt=tierList[tierList.indexOf(curTier)+1], na=areaList[areaList.indexOf(curArea)+1];
  const nextTier=nt?[nt,tiers.find(t=>t[0]===nt)[1],p.filter(x=>x.tier===nt).length]:null;
  const nextArea=na?[na,pillarName[na],p.filter(x=>R[x.id].pillar===na).length]:null;
  const crisis=a.mood==="crisis";
  const lbl={living:{halls_cat:"Catered halls",halls_self:"Self-catered halls",pbsa:"Private student halls",private:"Private housing",family:"Living with family"},origin:{home:"UK student",eu:"EU student",intl:"International student"},living:{halls_cat:"Catered halls",halls_self:"Self-catered halls",private:"Private housing",family:"Living with family"},mood:{good:"Feeling OK",stressed:"Stressed",low:"Struggling",crisis:"In crisis"}};
  const pills=[uniInfo(a).short,lbl.origin[a.origin],lbl.living[a.living],lbl.mood[a.mood],a.gp!=="yes"?"No local GP":null,(a.foodUnknown?"Food budget not set":`£${a.food}/wk food`),`£${a.money}/mo after rent`].filter(Boolean);
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
    ${state.persona?`<button class="linkbtn backbtn" id="backTop">← Back to examples</button>`:""}
    <div class="plan-head">
      <h1>${state.persona?esc(state.persona.split(",")[0])+"'s plan":"Your plan"}</h1>
      <button class="btn btn-o" id="edit">${state.persona?`Change ${esc(state.persona.split(",")[0])}'s answers`:"Change my answers"}</button>
    </div>
    <p class="sub"><b>${p.length} recommended actions</b>, with the most important ones first.</p>
    <div id="savebox"></div>
    <div class="toggle"><button id="vu" class="${mode==="urgency"?"on":""}">By urgency</button><button id="va" class="${mode==="area"?"on":""}">By area</button><button id="vc" class="${mode==="check"?"on":""}">Checklist</button></div>
    ${mode==="urgency"?`<div class="seg">${tiers.map(([t,h])=>{ const it=p.filter(x=>x.tier===t), n=it.length, d=it.filter(x=>state.done.has(x.id)).length; return `<button class="segb seg-${t} ${t===curTier?"on":""}" data-tier="${t}" ${n?"":"disabled"} aria-pressed="${t===curTier}">${h}<span>${d}/${n}</span></button>`; }).join("")}</div>`:""}
    ${mode==="area"?`<div class="atabs">${areaList.map(pl=>{ const it=p.filter(x=>R[x.id].pillar===pl); const d=it.filter(x=>state.done.has(x.id)).length; return `<button class="atab ${pl===curArea?"on":""}" data-pl="${pl}" aria-pressed="${pl===curArea}"><span class="tag t-${pl}">${pillarShort[pl]}</span><span class="n">${d}/${it.length}</span></button>`; }).join("")}</div>`:""}
    ${mode==="check" ? checklist(p,a) : (()=>{
      const [k,h,sub,items] = mode==="area"
        ? [curArea,pillarName[curArea],"",p.filter(x=>R[x.id].pillar===curArea)]
        : (()=>{ const t=tiers.find(t=>t[0]===curTier); return [t[0],t[1],t[2],p.filter(x=>x.tier===curTier)]; })();
      const next = mode==="area" ? nextArea : nextTier;
      return `<div class="tier" id="sec-${k}"><div class="tier-h"><h2>${h}</h2><span class="count">${items.length}</span><span>${sub}</span></div>
      ${items.map(x=>card(x,a)).join("")}
      ${next?`<button class="btn btn-o nextgrp" id="nextGrp" data-k="${next[0]}">Next${mode==="area"?" area":""}: ${next[1]} (${next[2]}) →</button>`:""}</div>`; })()}
    <div class="actions">
      <button class="btn btn-p" id="copy">Copy my plan</button>
      <button class="btn btn-g" id="home">Try another student</button>
    </div>
    <p class="foot">Owl prototype. Not an official university service and not medical advice. Details were checked against official pages in November 2026; always confirm on the linked page.</p>
  </div>`;
  document.getElementById("vu").onclick=()=>{ state.mode="urgency"; results(true); };
  document.getElementById("va").onclick=()=>{ state.mode="area"; results(true); };
  document.getElementById("vc").onclick=()=>{ state.mode="check"; results(true); };
  app.querySelectorAll(".atab").forEach(o=>o.onclick=()=>{ state.mode="area"; state.area=o.dataset.pl; results(true); });
  app.querySelectorAll(".donechk input").forEach(c=>c.onchange=()=>{ c.checked?state.done.add(c.dataset.id):state.done.delete(c.dataset.id); results(true); });
  app.querySelectorAll(".segb").forEach(b=>b.onclick=()=>{ state.tier=b.dataset.tier; results(true); });
  const ng=document.getElementById("nextGrp"); if(ng) ng.onclick=()=>{ if(mode==="area") state.area=ng.dataset.k; else state.tier=ng.dataset.k; results(true); const t=document.querySelector(mode==="area"?".atabs":".seg"); if(t) t.scrollIntoView({behavior:"smooth",block:"start"}); };
  app.querySelectorAll(".chk input").forEach(c=>c.onchange=()=>{ c.checked?state.done.add(c.dataset.id):state.done.delete(c.dataset.id); results(true); });
  const bt=document.getElementById("backTop"); if(bt) bt.onclick=()=>{ state={view:"home",step:0,a:{},mode:state.mode,showEx:true}; render(); };
  document.getElementById("home").onclick=()=>{ state={view:"home",step:0,a:{},mode:state.mode,showEx:true}; render(); };
  document.getElementById("edit").onclick=()=>{ state.view="pick"; render(); };
  document.getElementById("copy").onclick=async()=>{
    const txt=["My Owl plan",""].concat(tiers.flatMap(([t,h])=>{ const it=p.filter(x=>x.tier===t); return it.length?[h.toUpperCase(),...it.map(x=>{ const r=svc(x.id,a); return `• ${fill(r.title,a)} (${r.meta.map(m=>fill(m[1],a)).join(", ")}) ${linkFor(r,a)}`+(r.steps||[]).map((t,i)=>`\n    ${i+1}. ${fill(t,a)}`).join(""); }),""]:[]; })).join("\n");
    try{ await navigator.clipboard.writeText(txt); toast("Plan copied"); }catch(e){ toast("Couldn't copy here. Select the text instead"); }
  };
  if(!keep) window.scrollTo(0,0);
  if(window.UGAccount) UGAccount.onPlan();
}

function card(x,a){ const r=svc(x.id,a); const d=state.done&&state.done.has(x.id); return `<div class="item ${x.tier}${d?" isdone":""}">
  <div class="item-top">${state.mode==="area"?`<span class="u u-${x.tier}" style="margin-left:0">${tierShort[x.tier]}</span>`:`<span class="tag t-${r.pillar}">${pillarName[r.pillar]}</span>`}<label class="donechk"><input type="checkbox" data-id="${x.id}" ${d?"checked":""}> ${d?"Done ✓":"Mark as done"}</label></div>
  <h3>${esc(fill(r.title,a))}</h3>
  <div class="why"><b>Why this matters:</b> ${esc(x.why)}</div>
  <p>${esc(fill(r.body,a))}</p>
  ${r.steps&&r.steps.length?`<details class="guide"><summary>How to do it · ${r.steps.length} steps</summary><ol>${r.steps.map(t=>`<li>${esc(fill(t,a))}</li>`).join("")}</ol></details>`:""}
  <div class="meta">${r.meta.map(([k,v])=>`<span><b>${k}:</b> ${esc(fill(v,a))}</span>`).join("")}<a href="${linkFor(r,a)}" target="_blank" rel="noopener">${r.generic?"Find it at your university ↗":"Official page ↗"}</a></div>
</div>`; }

function checklist(p,a){
  const done=p.filter(x=>state.done.has(x.id)).length; const pct=p.length?Math.round(done/p.length*100):0;
  return `<div class="bar"><i style="width:${pct}%"></i></div><p class="sub"><b>${done} of ${p.length}</b> done${done===p.length&&p.length?" 🎉 You're all set.":""}</p>
  <div style="margin-top:14px">${p.map(x=>{ const r=svc(x.id,a); const d=state.done.has(x.id); return `<label class="chk ${d?"done":""}"><input type="checkbox" data-id="${x.id}" ${d?"checked":""}><div><h3>${esc(fill(r.title,a))}</h3>${r.steps&&r.steps.length&&!d?`<div class="m" style="color:var(--brand-d)">Start: ${esc(fill(r.steps[0],a))}</div>`:""}<div class="m"><span class="u u-${x.tier}">${tierShort[x.tier]}</span>${pillarName[r.pillar]} · ${esc(r.meta.map(m=>m[1]).join(" · "))}</div></div></label>`; }).join("")}</div>`;
}

function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("on"); setTimeout(()=>t.classList.remove("on"),1800); }
// Pick one section to update, then go straight back to the plan
function pick(){
  app.innerHTML=`
  <div class="card">
    <h1>Update your answers</h1>
    <p class="sub">Choose the section you want to change. Your other answers stay the same.</p>
    <div class="personas">${STEPS.map((s,i)=>`<button class="persona" data-step="${i}"><b>${esc(s.title)}</b><small>${s.qs.filter(visible).length} questions</small></button>`).join("")}</div>
    <div class="nav">
      <button class="btn btn-g" id="back">← Back to my plan</button>
      <button class="btn btn-o" id="all">Go through all questions</button>
    </div>
  </div>`;
  app.querySelectorAll(".persona[data-step]").forEach(b=>b.onclick=()=>{ state.step=+b.dataset.step; state.only=true; state.showErr=false; state.view="form"; render(); window.scrollTo(0,0); });
  document.getElementById("back").onclick=()=>{ state.view="results"; render(); };
  document.getElementById("all").onclick=()=>{ state.step=0; state.only=false; state.view="form"; render(); };
}

function render(){ ({home,form,results,pick})[state.view](); }
function route(){
  const tool = location.hash==="#try";
  document.getElementById("landing").style.display = tool?"none":"";
  document.getElementById("tool").style.display = tool?"":"none";
  if(tool){ render(); window.scrollTo(0,0); }
  else if(location.hash==="#about"){ window.scrollTo(0,0); }
}
const svcCountEl=document.getElementById("svcCount");
if(svcCountEl) svcCountEl.textContent = Object.keys(R).length + Object.values(UNI_MAP).reduce((n,m)=>n+Object.keys(m).length,0);
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
