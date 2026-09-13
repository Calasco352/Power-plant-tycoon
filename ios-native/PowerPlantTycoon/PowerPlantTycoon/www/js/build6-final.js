/* POWER PLANT TYCOON — BUILD 6 FINAL SYSTEMS OVERHAUL */
(function(){
  if(window.__pptBuild6Final)return;
  window.__pptBuild6Final=true;

  document.body.classList.add("b6-final");

  function clamp(v,a,b){v=Number(v);return Number.isFinite(v)?Math.max(a,Math.min(b,v)):a}
  function hqExtra(id){return Math.max(0,Number(g?.hq6?.departments?.[id]||1)-1)}
  function megaCount(){try{return typeof completedMegaProjects==="function"?completedMegaProjects():0}catch(e){return 0}}
  function empireLv(){return Math.max(0,Number(g?.empireLevel||0))}

  /* ---------- BUILD 6 ECONOMY BALANCE ----------
     Permanent bonuses are additive inside controlled pools. Temporary boosts
     remain exciting without multiplying every other system into runaway income. */
  if(typeof prestigeMult==="function")prestigeMult=function(){return 1+.06*Math.pow(Math.max(0,g.prestige||0),.68)};
  if(typeof operatorMult==="function")operatorMult=function(){return 1+Math.max(0,(g.operatorLevel||1)-1)*.0075};
  if(typeof efficiencyMult==="function")efficiencyMult=function(){return 1+Math.max(0,g.corporate?.eff||0)*.03};
  if(typeof staffProductionMult==="function")staffProductionMult=function(){return 1+Math.max(0,g.staff?.operator||0)*.015};
  if(typeof researchProductionMult==="function")researchProductionMult=function(){
    return 1+
      Math.max(0,g.research?.automation||0)*.025+
      Math.max(0,g.research?.advancedNuclear||0)*.06+
      Math.max(0,g.research?.fusionControl||0)*.12+
      Math.max(0,g.research?.quantumGrid||0)*.08;
  };
  if(typeof legacyProductionMult==="function")legacyProductionMult=function(){return 1+Math.max(0,g.legacy?.generation||0)*.04};
  if(typeof legacySaleMult==="function")legacySaleMult=function(){return 1+Math.max(0,g.legacy?.markets||0)*.025};
  if(typeof empireLevelMult==="function")empireLevelMult=function(){return 1+.12*Math.sqrt(empireLv())};
  if(typeof empireBonusMult==="function")empireBonusMult=function(){
    let projects=0;try{projects=Math.max(0,(typeof megaProjectMult==="function"?megaProjectMult():1)-1)}catch(e){}
    return 1+Math.min(1.75,projects*.55)+Math.min(1.75,(empireLevelMult()-1));
  };

  if(typeof plantBaseContribution==="function"){
    const basePlantContribution=plantBaseContribution;
    plantBaseContribution=function(p,s){
      let factor=1;
      const unlock=Number(p?.unlock||0);
      if(unlock>=75000000000)factor=.40;
      else if(unlock>=1000000000)factor=.45;
      else if(unlock>=75000000)factor=.55;
      else if(unlock>=2500000)factor=.75;
      return basePlantContribution(p,s)*factor;
    };
  }

  if(typeof fuelCostPerSecond==="function")fuelCostPerSecond=function(){
    let n=0;
    try{PLANTS.forEach(p=>{const s=g.plants?.[p.id];if(s?.unlocked)n+=Number(p.fuel||0)*Math.max(0,Number(s.level||0))})}catch(e){}
    const discount=Math.min(.30,Math.max(0,g.corporate?.fuel||0)*.03+Math.max(0,g.research?.superconductors||0)*.01);
    return Math.max(0,n*(1-discount));
  };

  if(typeof marketSaleMult==="function")marketSaleMult=function(){
    let base=clamp((g.market?.price||1)*(g.market?.demand||1),.55,2.05);
    let bonus=Math.max(0,g.staff?.trader||0)*.015+Math.max(0,g.research?.forecast||0)*.02;
    if(g.policy==="market")bonus+=.05;
    if((g.research?.gridAI||0)>0&&g.autoSell)bonus+=Math.max(0,g.research.gridAI)*.015;
    if(Date.now()<(g.marketIntelUntil||0))bonus+=.25;
    return clamp(base*(1+bonus),.55,2.35);
  };

  if(typeof gridSaleMult==="function")gridSaleMult=function(){
    let bonus=0;
    bonus+=Math.max(0,g.corporate?.grid||0)*.025;
    bonus+=Math.max(0,g.research?.quantumGrid||0)*.04;
    bonus+=Math.max(0,g.legacy?.markets||0)*.025;
    if(g.executiveLicenseUnlocked)bonus+=.10;
    if(g.foundersBundleUnlocked)bonus+=.05;
    bonus+=hqExtra("trading")*.015+hqExtra("finance")*.0075+hqExtra("grid")*.0075;
    return clamp(1+bonus,1,2.50);
  };

  if(typeof totalMult==="function")totalMult=function(){
    let core=1;
    try{core+=prestigeMult()-1}catch(e){}
    try{core+=operatorMult()-1}catch(e){}
    try{core+=efficiencyMult()-1}catch(e){}
    try{core+=regionMult()-1}catch(e){}
    try{core+=staffProductionMult()-1}catch(e){}
    try{core+=researchProductionMult()-1}catch(e){}
    try{core+=empireBonusMult()-1}catch(e){}
    try{core+=(g.executiveLicenseUnlocked?.25:0)}catch(e){}
    try{core+=legacyProductionMult()-1}catch(e){}
    if(g.foundersBundleUnlocked)core+=.05;
    core+=hqExtra("operations")*.015+hqExtra("grid")*.0075;
    const permanentCap=4.5+Math.min(4,megaCount()*.35+Math.sqrt(empireLv())*.40);
    core=clamp(core,.25,permanentCap);
    let temp=1;
    try{temp*=boostMult()}catch(e){}
    try{temp*=eventMult()}catch(e){}
    try{temp*=maintenanceMult()}catch(e){}
    try{temp*=policyProductionMult()}catch(e){}
    return clamp(core*temp,.05,permanentCap*3);
  };

  if(typeof safeSaleMultiplier==="function")safeSaleMultiplier=function(){
    let p=1;
    try{p+=gridSaleMult()-1}catch(e){}
    try{p+=marketSaleMult()-1}catch(e){}
    if(g.event?.type==="surge")p+=.45;
    if(g.activeContract)p+=Math.min(.90,Math.max(0,(Number(g.activeContract.rate||1)-1)*.45));
    const cap=3.5+Math.min(.75,megaCount()*.08);
    return clamp(p,.45,cap);
  };

  if(typeof netValuePerSecond==="function")netValuePerSecond=function(){return Math.max(0,output()*gridSaleMult()-fuelCostPerSecond())};

  /* Offline base: 25%, 8 hours. License: 40%, 12 hours.
     Legacy Night Shift adds only a modest +0.5%/level, with strict caps. */
  if(typeof offlineEfficiency==="function")offlineEfficiency=function(){
    const legacy=Math.min(.10,Math.max(0,g.legacy?.offline||0)*.005);
    const base=g.offlineOperationsUnlocked?.40:.25;
    return Math.min(g.offlineOperationsUnlocked?.50:.35,base+legacy);
  };

  /* ---------- STICKY RESOURCE HUD ---------- */
  let scrollTick=false;
  function updateStickyHUD(){
    const y=window.scrollY||document.documentElement.scrollTop||0;
    document.body.classList.toggle("b6-scrolled",y>72);
    scrollTick=false;
  }
  window.addEventListener("scroll",()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(updateStickyHUD)}},{passive:true});
  updateStickyHUD();

  /* ---------- HOME FACILITY CLEANUP ---------- */
  const FACILITY_NAMES={diesel:"RIVERBEND • DIESEL GENERATOR",steam:"RIVERBEND • STEAM FACILITY",gas:"PINE RIDGE • GAS FACILITY",solar:"SUNCREST • SOLAR FACILITY",nuclear:"BLACKRIDGE • NUCLEAR FACILITY",starter:"RIVERBEND • STARTER SITE"};
  function currentFacility(){
    let id=g.viewStage;
    if(!id||!g.plants?.[id]?.unlocked){
      id="starter";
      ["diesel","steam","gas","solar","nuclear"].forEach(k=>{if(g.plants?.[k]?.unlocked)id=k});
    }
    return {id,name:FACILITY_NAMES[id]||String(id).toUpperCase()};
  }
  function ensureFacilityChip(){
    if(document.getElementById("b6ActiveFacility"))return;
    const home=document.getElementById("home"),equip=home?.querySelector(".cp-equipment");
    if(!home||!equip)return;
    const chip=document.createElement("div");
    chip.id="b6ActiveFacility";chip.className="b6-active-facility";
    chip.innerHTML='<div><small>ACTIVE FACILITY</small><b id="b6ActiveFacilityName">RIVERBEND</b><em>● LIVE CONTROL VIEW</em></div><button onclick="showPage(\'plants\',document.querySelector(\'[data-nav=plants]\'))">MANAGE PLANTS</button>';
    equip.insertAdjacentElement("afterend",chip);
  }
  function renderFacilityChip(){ensureFacilityChip();const f=currentFacility(),e=document.getElementById("b6ActiveFacilityName");if(e)e.textContent=f.name}

  /* ---------- UPGRADE CLARITY ---------- */
  function renderEconomyStatus(){
    const page=document.getElementById("plants");if(!page)return;
    let e=document.getElementById("b6EconomyStatus");
    if(!e){e=document.createElement("div");e.id="b6EconomyStatus";page.insertBefore(e,page.firstChild)}
    const off=Math.round(offlineEfficiency()*100),hours=g.offlineOperationsUnlocked?12:8;
    e.innerHTML='<b>BALANCED ECONOMY</b> • Active play is prioritized • Offline progress '+off+'% • long absences use diminishing returns';
  }
  function addCurrentBonus(el,text){
    if(!el)return;let n=el.querySelector(".b6-current-bonus");if(!n){n=document.createElement("div");n.className="b6-current-bonus";el.appendChild(n)}n.textContent=text;
  }
  function renderUpgradeBonuses(){
    const corp=document.querySelectorAll("#corporateUpgradeList .asset");
    const vals=[
      "+"+((g.corporate?.eff||0)*3).toFixed(0)+"% current production bonus",
      "Reliability upgrade • condition-loss protection",
      "-"+Math.min(30,(g.corporate?.fuel||0)*3).toFixed(0)+"% current fuel expense",
      "+"+((g.corporate?.grid||0)*2.5).toFixed(1)+"% current sale-value bonus"
    ];
    corp.forEach((el,i)=>addCurrentBonus(el.querySelector("div:nth-child(2)")||el,vals[i]||"Balanced bonus"));
    document.querySelectorAll("#researchTree .uf-node").forEach((el,i)=>{
      const r=typeof RESEARCH!=="undefined"?RESEARCH[i]:null;if(!r)return;
      const lv=g.research?.[r.id]||0;
      let t="";
      if(r.id==="automation")t="Effective: +"+(lv*2.5).toFixed(1)+"% production";
      else if(r.id==="forecast")t="Effective: +"+(lv*2).toFixed(0)+"% market bonus";
      else if(r.id==="advancedNuclear")t="Effective: +"+(lv*6).toFixed(0)+"% production";
      else if(r.id==="fusionControl")t="Effective: +"+(lv*12).toFixed(0)+"% production";
      else if(r.id==="quantumGrid")t="Effective: +"+(lv*8).toFixed(0)+"% production / +"+(lv*4).toFixed(0)+"% sale";
      if(t)addCurrentBonus(el,t);
    });
  }

  /* ---------- FIRST SHIFT — 10 STEP GUIDED TUTORIAL ---------- */
  const STEPS=[
    {title:"Welcome to Riverbend",text:"Generate power five times. This is the basic manual control you use before automation.",target:".generate",page:"home",mode:"generate"},
    {title:"Sell Power to the Grid",text:"Stored power is energy, not cash. Sell it to the grid to fund your first upgrades.",target:'[onclick="sellPower()"]',page:"home",mode:"sell"},
    {title:"Upgrade the Generator",text:"Use in-game cash to improve your manual generator. Upgrade bonuses stay useful while keeping progression balanced.",target:'[onclick="upgradeTap()"]',page:"home",mode:"upgrade"},
    {title:"Open Your Plant Fleet",text:"Plant construction and upgrades live on the Plants screen. Tap PLANTS below.",target:'[data-nav="plants"]',mode:"openPlants"},
    {title:"Commission or Upgrade a Plant",text:"Build your first generating asset, or upgrade one you already own. Plant technology is the main source of long-term output.",target:"#plantList",page:"plants",mode:"plant"},
    {title:"Dispatch to the Grid",text:"Return to operations and make a dispatch. Dispatching is part of your active shift and rewards operating the system instead of only watching numbers rise.",target:'[onclick="dispatchPower()"]',page:"home",mode:"dispatch"},
    {title:"Read the Market & Contracts",text:"Demand and spot price change over time. Contracts offer stronger rewards but should be taken when your fleet can support them.",target:"#contractList",page:"home",mode:"read"},
    {title:"Open Company HQ",text:"HQ controls the people and systems behind your plants. Tap HQ below.",target:'[data-nav="company"]',mode:"openHQ"},
    {title:"Upgrade an HQ Department",text:"Your first HQ department upgrade is free during the First Shift. Department bonuses are deliberately controlled so every system stays valuable.",target:".hq6-upgrade",page:"company",mode:"hq"},
    {title:"R&D, Staff & Automation",text:"Research and staff create long-term advantages. Auto Generate is an optional permanent convenience. Visit the Store, then finish your First Shift.",target:'[data-nav="store"]',mode:"store"}
  ];
  let tutTarget=null,lastTutKey="";
  function ensureTutorialState(){
    if(!g.firstShift6)g.firstShift6={step:0,done:false,disabled:false,generateTaps:0,visitedStore:false};
    if(g.firstShift6.generateTaps==null)g.firstShift6.generateTaps=0;
    if(g.firstShift6.visitedStore==null)g.firstShift6.visitedStore=false;
    if(g.firstShift6RewardClaimed==null)g.firstShift6RewardClaimed=false;
    if(g.hqTrainingUpgradeClaimed==null)g.hqTrainingUpgradeClaimed=false;
    if(g.finalTutorial){g.finalTutorial.done=true;g.finalTutorial.disabled=true}
    if((g.tutorialStep||0)<5)g.tutorialStep=5;
  }
  function ensureTutorialUI(){
    if(document.getElementById("b6FirstShiftPanel"))return;
    const mask=document.createElement("div");mask.id="b6FirstShiftMask";
    const panel=document.createElement("div");panel.id="b6FirstShiftPanel";
    panel.innerHTML='<div class="b6-tut-head"><div><span class="b6-next-action">YOUR NEXT ACTION</span><small id="b6TutCount">STEP 1 OF 10</small></div><button onclick="skipFirstShift6()">SKIP</button></div><h3 id="b6TutTitle">First Shift</h3><p id="b6TutText"></p><div class="b6-tut-progress"><i id="b6TutProgress"></i></div><div class="b6-tut-actions"><button onclick="restartFirstShift6()">RESTART</button><button id="b6TutNext" class="primary" onclick="firstShift6Next()">CONTINUE</button></div>';
    const pointer=document.createElement("div");pointer.id="b6TutPointer";pointer.setAttribute("aria-hidden","true");pointer.textContent="▼";
    document.body.append(mask,panel,pointer);
  }
  function hideTutPointer(){const p=document.getElementById("b6TutPointer");if(p)p.classList.remove("show","up")}
  function positionTutPointer(el){
    const p=document.getElementById("b6TutPointer");if(!p||!el)return;
    const r=el.getBoundingClientRect(),w=window.innerWidth||document.documentElement.clientWidth;
    const cx=Math.max(28,Math.min(w-28,r.left+r.width/2)),above=r.top>74;
    p.classList.toggle("up",!above);p.textContent=above?"▼":"▲";
    p.style.left=cx+"px";p.style.top=(above?Math.max(8,r.top-49):Math.min(window.innerHeight-52,r.bottom+10))+"px";p.classList.add("show");
  }
  function clearTutTarget(){document.querySelectorAll(".b6-tut-spot").forEach(el=>el.classList.remove("b6-tut-spot"));tutTarget=null;hideTutPointer()}
  function currentStep(){ensureTutorialState();return clamp(Math.floor(g.firstShift6.step||0),0,STEPS.length-1)}
  function setPage(id){const b=document.querySelector('[data-nav="'+id+'"]');if(b&&typeof showPage==="function")showPage(id,b)}
  function trainingGrant(amount,label){
    amount=Math.max(0,Number(amount)||0);if(!amount)return;
    g.cash=(g.cash||0)+amount;g.lifetimeCash=(g.lifetimeCash||0)+amount;
    if(typeof addLog==="function")addLog("First Shift training budget: "+(typeof money==="function"?money(amount):amount)+" for "+label+".");
    if(typeof saveGame==="function")saveGame();
  }
  function canManualContinue(s){
    if(s.mode==="read")return true;
    if(s.mode==="upgrade"&&Number(g.tapLevel||0)>0)return true;
    if(s.mode==="plant")return typeof totalLevels==="function"&&totalLevels()>0;
    if(s.mode==="hq"&&g.hqTrainingUpgradeClaimed)return true;
    if(s.mode==="store")return !!g.firstShift6.visitedStore;
    return false;
  }
  function prepareStep(i){
    const s=STEPS[i];
    if(i===0||i===1||i===2||i===5||i===6)setPage("home");
    if(i===4)setPage("plants");
    if(i===8)setPage("company");
    if(s.mode==="upgrade"&&Number(g.tapLevel||0)===0&&typeof tapUpgradeCost==="function"&&g.cash<tapUpgradeCost())trainingGrant(Math.min(100,tapUpgradeCost()-g.cash+10),"generator training");
    if(s.mode==="plant"&&typeof totalLevels==="function"&&totalLevels()===0){
      try{const cheapest=Math.min(...PLANTS.filter(p=>!g.plants?.[p.id]?.unlocked).map(p=>p.unlock));if(Number.isFinite(cheapest)&&g.cash<cheapest)trainingGrant(Math.min(125,cheapest-g.cash+10),"plant commissioning") }catch(e){}
    }
  }
  function renderFirstShift(){
    ensureTutorialState();ensureTutorialUI();
    const panel=document.getElementById("b6FirstShiftPanel"),mask=document.getElementById("b6FirstShiftMask");
    if(g.firstShift6.done||g.firstShift6.disabled){panel.classList.remove("show","b6-complete-flash");mask.classList.remove("show");document.body.classList.remove("b6-tutorial-live");clearTutTarget();return}
    const i=currentStep(),s=STEPS[i],key=i+"|"+s.mode;
    panel.classList.add("show");mask.classList.add("show");document.body.classList.add("b6-tutorial-live");
    document.getElementById("b6TutCount").textContent="STEP "+(i+1)+" OF "+STEPS.length;
    document.getElementById("b6TutTitle").textContent=s.title;
    let text=s.text;
    if(s.mode==="generate")text+="  Progress: "+Math.min(5,g.firstShift6.generateTaps||0)+"/5.";
    document.getElementById("b6TutText").textContent=text;
    document.getElementById("b6TutProgress").style.width=((i+1)/STEPS.length*100)+"%";
    const next=document.getElementById("b6TutNext");
    const manual=canManualContinue(s);
    next.style.display=(s.mode==="read"||manual||s.mode==="store")?"inline-flex":"none";
    next.textContent=s.mode==="store"?(g.firstShift6.visitedStore?"FINISH FIRST SHIFT":"VISIT STORE FIRST"):"CONTINUE";
    next.disabled=s.mode==="store"&&!g.firstShift6.visitedStore;
    if(key!==lastTutKey){
      lastTutKey=key;prepareStep(i);clearTutTarget();
      setTimeout(()=>{
        const el=document.querySelector(s.target);if(!el)return;tutTarget=el;el.classList.add("b6-tut-spot");
        if(!el.matches('[data-nav]'))try{el.scrollIntoView({behavior:"smooth",block:"center"})}catch(e){}
        setTimeout(()=>positionTutPointer(el),220);
      },160);
    }
  }
  function advanceTutorial(){
    ensureTutorialState();
    const i=currentStep();
    if(i>=STEPS.length-1){completeFirstShift6();return}
    g.firstShift6.step=i+1;lastTutKey="";if(typeof saveGame==="function")saveGame();renderFirstShift();
  }
  window.firstShift6Next=function(){
    const s=STEPS[currentStep()];
    if(s.mode==="store"&&!g.firstShift6.visitedStore)return;
    if(s.mode==="read"||canManualContinue(s))advanceTutorial();
  };
  window.skipFirstShift6=function(){ensureTutorialState();g.firstShift6.disabled=true;if(typeof saveGame==="function")saveGame();renderFirstShift();if(typeof toast==="function")toast("First Shift skipped. Replay it from Store > Settings.")};
  window.restartFirstShift6=function(){ensureTutorialState();g.firstShift6={step:0,done:false,disabled:false,generateTaps:0,visitedStore:false};lastTutKey="";if(typeof saveGame==="function")saveGame();setPage("home");renderFirstShift()};
  window.completeFirstShift6=function(){
    ensureTutorialState();g.firstShift6.done=true;g.firstShift6.disabled=false;
    if(!g.firstShift6RewardClaimed){g.firstShift6RewardClaimed=true;const reward=1500;g.cash=(g.cash||0)+reward;g.lifetimeCash=(g.lifetimeCash||0)+reward;g.stored=(g.stored||0)+250;if(typeof addLog==="function")addLog("First Shift completed: $1,500 training grant + 250 kWh reserve.")}
    if(typeof saveGame==="function")saveGame();renderFirstShift();if(typeof render==="function")render();if(typeof toast==="function")toast("✓ First Shift complete — Riverbend is yours to run.")
  };

  /* Attach tutorial progress to real controls. */
  if(typeof tapGenerate==="function"){
    const f=tapGenerate;tapGenerate=function(){const r=f();ensureTutorialState();if(!g.firstShift6.done&&!g.firstShift6.disabled&&STEPS[currentStep()].mode==="generate"){g.firstShift6.generateTaps=(g.firstShift6.generateTaps||0)+1;if(g.firstShift6.generateTaps>=5)advanceTutorial();else{saveGame();renderFirstShift()}}return r};
  }
  if(typeof sellPower==="function"){
    const f=sellPower;sellPower=function(){const before=Number(g.sold||0),r=f();ensureTutorialState();if(STEPS[currentStep()].mode==="sell"&&Number(g.sold||0)>before)advanceTutorial();return r};
  }
  if(typeof upgradeTap==="function"){
    const f=upgradeTap;upgradeTap=function(){const before=Number(g.tapLevel||0),r=f();ensureTutorialState();if(STEPS[currentStep()].mode==="upgrade"&&Number(g.tapLevel||0)>before)advanceTutorial();return r};
  }
  if(typeof buildPlant==="function"){
    const f=buildPlant;buildPlant=function(id){const before=typeof totalLevels==="function"?totalLevels():0,r=f(id),after=typeof totalLevels==="function"?totalLevels():before;ensureTutorialState();if(STEPS[currentStep()].mode==="plant"&&after>before)advanceTutorial();return r};
  }
  if(typeof dispatchPower==="function"){
    const f=dispatchPower;dispatchPower=function(){const r=f();ensureTutorialState();if(STEPS[currentStep()].mode==="dispatch")advanceTutorial();return r};
  }
  function syncActiveNav(preferredId){
    const nav=document.querySelector(".nav");if(!nav)return;
    let id=preferredId;if(!id){const p=document.querySelector(".page.active");id=p?.id||"home"}
    nav.querySelectorAll("[data-nav]").forEach(btn=>btn.classList.toggle("active",btn.getAttribute("data-nav")===id));
  }
  if(typeof showPage==="function"){
    const f=showPage;showPage=function(id,b){
      const r=f(id,b);syncActiveNav(id);ensureTutorialState();const mode=STEPS[currentStep()].mode;
      if(mode==="openPlants"&&id==="plants")advanceTutorial();
      else if(mode==="openHQ"&&id==="company")advanceTutorial();
      else if(mode==="store"&&id==="store"){g.firstShift6.visitedStore=true;saveGame();renderFirstShift()}
      return r
    };
  }
  if(typeof window.openHQ6Department==="function"){
    const f=window.openHQ6Department;window.openHQ6Department=function(id){const r=f(id);ensureTutorialState();if(STEPS[currentStep()].mode==="hq"&&g.hqTrainingUpgradeClaimed)renderFirstShift();return r};
  }
  if(typeof window.upgradeHQ6Department==="function"){
    const f=window.upgradeHQ6Department;window.upgradeHQ6Department=function(id){
      ensureTutorialState();
      if(STEPS[currentStep()].mode==="hq"&&!g.hqTrainingUpgradeClaimed){
        if(!g.hq6)g.hq6={departments:{}};if(!g.hq6.departments)g.hq6.departments={};
        g.hq6.departments[id]=Math.max(1,Number(g.hq6.departments[id]||1))+1;g.hqTrainingUpgradeClaimed=true;g.reputation=(g.reputation||0)+4;
        if(typeof addLog==="function")addLog("First Shift: complimentary HQ "+id+" department upgrade completed.");
        if(typeof saveGame==="function")saveGame();if(typeof render==="function")render();if(typeof feedback==="function")feedback("big");if(typeof toast==="function")toast("✓ First HQ upgrade is on the company.");advanceTutorial();return;
      }
      return f(id);
    };
  }

  /* ---------- FINAL RENDER HOOK ---------- */
  function renderBuild6Final(){renderFacilityChip();renderEconomyStatus();renderUpgradeBonuses();renderFirstShift();syncActiveNav()}
  window.addEventListener("resize",()=>{if(tutTarget)positionTutPointer(tutTarget)},{passive:true});
  window.addEventListener("scroll",()=>{if(tutTarget)positionTutPointer(tutTarget)},{passive:true});
  if(typeof render==="function"){
    const f=render;render=function(){const r=f();renderBuild6Final();return r};
  }
  ensureTutorialState();
  renderBuild6Final();
  setInterval(()=>{renderFacilityChip();renderFirstShift()},1200);
})();
