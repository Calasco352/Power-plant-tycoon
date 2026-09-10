/* POWER PLANT TYCOON — BUILD 7 SIMPLIFIED EXPERIENCE V2 + ECONOMY */
(function(){
  if(window.__pptBuild7Simplified)return;
  window.__pptBuild7Simplified=true;
  document.body.classList.add("ppt7-simplified");

  const n=v=>Math.max(0,Number(v)||0);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||a));
  const cashText=v=>{try{return money(v)}catch(e){return "$"+Math.round(n(v)).toLocaleString()}};
  const energyText=v=>{try{return energy(v)}catch(e){return Math.round(n(v)).toLocaleString()+" kWh"}};
  const plantCount=()=>{try{return PLANTS.filter(p=>g.plants?.[p.id]?.unlocked).length}catch(e){return 0}};

  /* Hidden economy telemetry for balance testing. Players never see this. */
  const tracker=window.__ppt7IncomeTracker=window.__ppt7IncomeTracker||{
    started:Date.now(),startCash:n(g?.cash),gross:0,sources:{manualSale:0,autoSell:0,dispatch:0,battery:0,contract:0,mission:0,dailyReward:0,weeklyReward:0,event:0,other:0}
  };
  let incomeSource="other";
  function withIncomeSource(source,fn){const prev=incomeSource;incomeSource=source||"other";try{return fn()}finally{incomeSource=prev}}
  if(typeof recordEarnedCash==="function"&&!recordEarnedCash.__ppt7Tracked){
    const baseRecordEarnedCash=recordEarnedCash;
    const tracked=function(amount){
      const before=n(g?.cash),r=baseRecordEarnedCash.apply(this,arguments),delta=Math.max(0,n(g?.cash)-before);
      tracker.gross+=delta;tracker.sources[incomeSource]=(tracker.sources[incomeSource]||0)+delta;return r;
    };
    tracked.__ppt7Tracked=true;recordEarnedCash=tracked;
  }
  window.resetPPT7EconomyTracker=function(){tracker.started=Date.now();tracker.startCash=n(g?.cash);tracker.gross=0;Object.keys(tracker.sources).forEach(k=>tracker.sources[k]=0);return window.pptEconomy7Report?.()};

  /* =========================================================
     BUILD 7 ECONOMY
     V5 fixed the first round of runaway multipliers. Build 7
     intentionally goes much further because real testing still
     produced roughly $650M in five minutes.
     ========================================================= */
  if(typeof totalMult==="function"){
    const v5Total=totalMult;
    totalMult=function(){
      const empire=Math.sqrt(n(g?.empireLevel));
      const max=2.45+Math.min(1.55,empire*.10);
      return clamp(v5Total()*.72,.40,max);
    };
  }

  if(typeof safeSaleMultiplier==="function"){
    const v5Sale=safeSaleMultiplier;
    safeSaleMultiplier=function(){
      /* Typical sale value is now around 30% of V5. */
      return clamp(v5Sale()*.30,.045,.14);
    };
  }

  if(typeof fuelCostPerSecond==="function"){
    const oldFuel=fuelCostPerSecond;
    fuelCostPerSecond=function(){
      const f=Math.max(0,oldFuel());
      let gross=0;try{gross=output()*safeSaleMultiplier()}catch(e){}
      /* Keep operating costs meaningful without making the slower economy impossible. */
      return gross>0?Math.min(f,gross*.25):f*.50;
    };
  }

  if(typeof netValuePerSecond==="function"){
    netValuePerSecond=function(){return Math.max(0,output()*safeSaleMultiplier()-fuelCostPerSecond())};
  }

  if(typeof offlineEfficiency==="function"){
    offlineEfficiency=function(){
      const legacy=Math.min(.05,n(g?.legacy?.offline)*.0025);
      const base=g?.offlineOperationsUnlocked?.25:.12;
      return Math.min(g?.offlineOperationsUnlocked?.30:.18,base+legacy);
    };
  }

  /* Auto Sell was one of the largest online-income faucets. It now:
     - uses the same balanced sale formula as manual selling
     - sells at 55% of manual value in exchange for automation
     - moves roughly one second of output at a time instead of dumping everything instantly */
  if(typeof autoSellTick==="function"){
    autoSellTick=function(){
      if(!g?.autoSell||n(g.stored)<=0)return;
      const earned=n(g.research?.automation)>=1;
      if(!g.autoSellLicenseUnlocked&&!earned){g.autoSell=false;return}
      const mode=g.autoSellLicenseUnlocked?(g.autoSellMode||"high"):"high";
      const threshold=Math.max(.95,1.05-Math.min(.10,n(g.research?.gridAI)*.01));
      if(mode==="high"&&n(g.market?.price||1)<threshold&&g.policy!=="market")return;
      let available=n(g.stored);
      if(mode==="reserve"){
        const reserve=Math.max((typeof output==="function"?output():0)*30,available*.25);
        available=Math.max(0,available-reserve);
      }
      if(available<=0)return;
      const flow=Math.max(1,(typeof output==="function"?output():1)*1.10);
      const amount=Math.min(available,flow);
      const rate=(typeof safeSaleMultiplier==="function"?safeSaleMultiplier():.06)*.55;
      const earnedCash=amount*rate;
      g.stored=Math.max(0,n(g.stored)-amount);
      if(typeof recordEarnedCash==="function")withIncomeSource("autoSell",()=>recordEarnedCash(earnedCash));
      else g.cash=n(g.cash)+earnedCash;
      g.sold=Math.min(1e300,n(g.sold)+amount);
    };
  }

  /* Dispatch and battery sales use the same sale curve; neither can bypass it. */
  if(typeof dispatchPower==="function"){
    dispatchPower=function(){
      if(n(g.stored)<10){if(typeof toast==="function")toast("Need at least 10 kWh stored.");return}
      const amount=Math.min(n(g.stored),Math.max(10,(typeof output==="function"?output():1)*8));
      const rate=(typeof safeSaleMultiplier==="function"?safeSaleMultiplier():.06)*1.08;
      const earnedCash=amount*rate;
      g.stored=Math.max(0,n(g.stored)-amount);withIncomeSource("dispatch",()=>recordEarnedCash(earnedCash));g.sold=Math.min(1e300,n(g.sold)+amount);g.dispatches=n(g.dispatches)+1;g.reputation=n(g.reputation)+2;
      if(typeof addXP==="function")addXP(3);if(typeof addLog==="function")addLog("Grid dispatch sold "+energyText(amount)+" for "+cashText(earnedCash)+".");if(typeof feedback==="function")feedback("big");saveGame();render();if(typeof toast==="function")toast("Dispatch: +"+cashText(earnedCash));
    };
  }
  if(typeof dischargeBattery==="function"){
    dischargeBattery=function(){
      if(n(g.battery?.stored)<=0){if(typeof toast==="function")toast("Battery is empty.");return}
      const amount=n(g.battery.stored),rate=(typeof safeSaleMultiplier==="function"?safeSaleMultiplier():.06)*1.10,earnedCash=amount*rate;
      g.battery.stored=0;withIncomeSource("battery",()=>recordEarnedCash(earnedCash));g.sold=Math.min(1e300,n(g.sold)+amount);g.reputation=n(g.reputation)+1;
      if(typeof addLog==="function")addLog("Battery discharged "+energyText(amount)+" for "+cashText(earnedCash)+".");saveGame();render();if(typeof toast==="function")toast("Battery sale: +"+cashText(earnedCash));
    };
  }

  /* Further reduce side-reward faucets once per save. */
  if(!g.economy7Migrated){
    try{CONTRACTS.forEach(c=>{c.reward=Math.max(25,Math.round(n(c.reward)*.50));c.rate=1+(Math.max(0,n(c.rate)-1)*.55)})}catch(e){}
    try{MISSIONS.forEach(m=>m.reward=Math.max(15,Math.round(n(m.reward)*.50)))}catch(e){}
    if(g.activeContract){
      g.activeContract.reward=Math.max(25,Math.round(n(g.activeContract.reward)*.50));
      g.activeContract.rate=1+(Math.max(0,n(g.activeContract.rate)-1)*.55);
    }
    g.economy7Migrated=true;
    try{saveGame()}catch(e){}
  }

  if(typeof dailyReward==="function"){
    dailyReward=function(){
      const stamp=typeof dayStamp==="function"?dayStamp():new Date().toDateString();
      const last=g.dailyStreak?.lastClaimDay;
      if(last===stamp){if(typeof toast==="function")toast("Daily supply drop already claimed.");return}
      let count=n(g.dailyStreak?.count);
      if(last){
        const a=new Date(last+"T12:00:00"),b=new Date(stamp+"T12:00:00");
        const days=Math.round((b-a)/86400000);count=days===1?Math.min(7,count+1):1;
      }else count=1;
      const mult=[1,1.15,1.30,1.45,1.65,1.90,2.20][count-1]||1;
      const base=Math.max(200,Math.min(1500000,300+Math.sqrt(Math.max(0,output()))*900));
      const reward=Math.round(base*mult);
      withIncomeSource("dailyReward",()=>recordEarnedCash(reward));g.lastDaily=Date.now();g.dailyStreak={count,lastClaimDay:stamp};
      if(typeof addXP==="function")addXP(4+count);
      if(typeof addLog==="function")addLog("Day "+count+" supply drop received: "+cashText(reward));
      saveGame();render();if(typeof toast==="function")toast("🎁 Day "+count+" reward: "+cashText(reward));
    };
  }

  if(typeof createEvent==="function"){
    const oldCreateEvent=createEvent;
    createEvent=function(){
      const r=oldCreateEvent.apply(this,arguments);
      if(g.event?.type==="inspection")g.event.reward=Math.min(1000000,n(g.event.reward));
      return r;
    };
  }

  /* =========================================================
     PERMANENT HUD + SIMPLE NAVIGATION
     ========================================================= */
  function setupNav(){
    const nav=document.querySelector("nav.nav");if(!nav)return;
    ["map","goals","stats"].forEach(id=>document.querySelector('[data-nav="'+id+'"]')?.classList.add("ppt7-hide-nav"));
    if(!document.getElementById("ppt7MoreNav")){
      const store=document.querySelector('[data-nav="store"]');
      const b=document.createElement("button");b.id="ppt7MoreNav";b.innerHTML="<i>☰</i>MORE";b.onclick=openMore;
      if(store)nav.insertBefore(b,store);else nav.appendChild(b);
    }
    ensureMoreSheet();
  }

  function featureStatus(){
    const pc=plantCount(),life=n(g?.lifetimeCash);
    return {
      advanced:{ok:pc>=2||life>=250000,why:"Unlock after 2 plants"},
      business:{ok:pc>=1||life>=25000,why:"Unlock after your first plant"},
      technology:{ok:pc>=2||life>=250000,why:"Unlock after 2 plants"},
      goals:{ok:pc>=1||life>=25000,why:"Unlock after your first plant"},
      map:{ok:pc>=2||life>=250000,why:"Unlock after 2 plants"},
      stats:{ok:pc>=3||life>=1000000,why:"Unlock as your company grows"}
    };
  }

  function ensureMoreSheet(){
    if(document.getElementById("ppt7MoreSheet"))return;
    const shade=document.createElement("div");shade.id="ppt7MoreShade";shade.onclick=closeMore;
    const sheet=document.createElement("div");sheet.id="ppt7MoreSheet";
    sheet.innerHTML='<div class="ppt7-more-head"><strong>More</strong><button class="ppt7-close" onclick="closePPT7More()">CLOSE</button></div><div class="ppt7-more-grid" id="ppt7MoreGrid"></div>';
    document.body.append(shade,sheet);
  }

  function renderMore(){
    ensureMoreSheet();const s=featureStatus();const grid=document.getElementById("ppt7MoreGrid");if(!grid)return;
    const item=(icon,title,sub,id,ok=true)=>'<button class="ppt7-more-item '+(ok?"":"locked")+'" '+(ok?'onclick="openPPT7Page(\''+id+'\')"':'disabled')+'>'+icon+' '+title+'<small>'+(ok?sub:s[id]?.why||sub)+'</small></button>';
    grid.innerHTML=
      item("🎯","Goals","Missions and company objectives","goals",s.goals.ok)+
      item("🗺️","Grid Map","Expand into new regions","map",s.map.ok)+
      item("📊","Stats","Detailed company analytics","stats",s.stats.ok)+
      item("⚙️","Settings","Sound, haptics and save controls","settings",true);
  }

  const unlockLabels={
    advanced:["Advanced Operations","Market, contracts, battery and maintenance are now available."],
    business:["HQ Business","Trading, Finance and HR are now available in HQ."],
    technology:["HQ Technology","Research & Development is now available in HQ."],
    goals:["Goals","Missions and company objectives are now available under More."],
    map:["Grid Map","You can now expand Riverbend into new regions."],
    stats:["Company Stats","Detailed company analytics are now available under More."]
  };
  function showUnlock(title,copy){
    let el=document.getElementById("ppt7UnlockToast");if(!el){el=document.createElement("div");el.id="ppt7UnlockToast";document.body.appendChild(el)}
    el.innerHTML='<small>NEW SYSTEM UNLOCKED</small><strong>'+title+'</strong><span>'+copy+'</span>';
    clearTimeout(window.__ppt7UnlockTimer);el.classList.remove("show");requestAnimationFrame(()=>el.classList.add("show"));window.__ppt7UnlockTimer=setTimeout(()=>el.classList.remove("show"),4200);
  }
  function checkFeatureUnlocks(){
    const s=featureStatus();
    if(!g.ppt7UnlockSeen){g.ppt7UnlockSeen={};Object.keys(unlockLabels).forEach(k=>{if(s[k]?.ok)g.ppt7UnlockSeen[k]=true});try{saveGame()}catch(e){};return}
    Object.keys(unlockLabels).forEach(k=>{if(s[k]?.ok&&!g.ppt7UnlockSeen[k]){g.ppt7UnlockSeen[k]=true;showUnlock(unlockLabels[k][0],unlockLabels[k][1]);try{saveGame()}catch(e){}}});
  }

  function openMore(){renderMore();document.getElementById("ppt7MoreShade")?.classList.add("show");document.getElementById("ppt7MoreSheet")?.classList.add("show");document.getElementById("ppt7MoreNav")?.classList.add("active")}
  function closeMore(){document.getElementById("ppt7MoreShade")?.classList.remove("show");document.getElementById("ppt7MoreSheet")?.classList.remove("show");document.getElementById("ppt7MoreNav")?.classList.remove("active")}
  window.closePPT7More=closeMore;
  window.openPPT7Page=function(id){
    closeMore();
    if(id==="settings"){
      const b=document.querySelector('[data-nav="store"]');showPage("store",b);
      setTimeout(()=>document.querySelector("#store .settings-grid")?.closest(".card")?.scrollIntoView({behavior:"smooth",block:"start"}),120);
      return;
    }
    const b=document.querySelector('[data-nav="'+id+'"]');showPage(id,b);
    document.getElementById("ppt7MoreNav")?.classList.add("active");
  };

  if(typeof showPage==="function"){
    const oldShowPage=showPage;
    showPage=function(id,b){
      closeMore();
      const r=oldShowPage(id,b);
      if(["map","goals","stats"].includes(id))document.getElementById("ppt7MoreNav")?.classList.add("active");
      return r;
    };
  }

  /* =========================================================
     HOME — SHOW THE CORE LOOP FIRST
     ========================================================= */
  const advancedTitles=new Set(["📊 Operations Dashboard","📜 Power Contracts","🛠 Maintenance","📈 Live Power Market","🔋 Grid Battery","🏢 Company Management","📋 Activity Log"]);
  function findCardByTitle(title){
    return [...document.querySelectorAll("#home .card")].find(c=>(c.querySelector("h3")?.textContent||"").trim()===title)||null;
  }
  function setupHome(){
    document.querySelectorAll("#home .card").forEach(card=>{
      const t=(card.querySelector("h3")?.textContent||"").trim();
      if(advancedTitles.has(t))card.classList.add("ppt7-advanced-card");
    });
    const grid=findCardByTitle("⚡ Grid Controls");
    if(grid&&!document.getElementById("ppt7NextGoal")){
      const goal=document.createElement("div");goal.id="ppt7NextGoal";grid.insertAdjacentElement("beforebegin",goal);
    }
    if(grid&&!document.getElementById("ppt7SaleEstimate")){
      const e=document.createElement("div");e.id="ppt7SaleEstimate";grid.appendChild(e);
    }
    const firstAdvanced=document.querySelector("#home .ppt7-advanced-card");
    if(firstAdvanced&&!document.getElementById("ppt7AdvancedToggle")){
      const b=document.createElement("button");b.id="ppt7AdvancedToggle";b.innerHTML='<b>ADVANCED OPERATIONS</b><span>Market, contracts, battery, maintenance +</span>';
      b.onclick=()=>{document.body.classList.toggle("ppt7-show-advanced");renderAdvancedToggle()};
      firstAdvanced.insertAdjacentElement("beforebegin",b);
    }
    const toggle=document.getElementById("ppt7AdvancedToggle");
    if(toggle)toggle.classList.toggle("ppt7-feature-hidden",!featureStatus().advanced.ok);
  }
  function renderAdvancedToggle(){
    const b=document.getElementById("ppt7AdvancedToggle");if(!b)return;
    const open=document.body.classList.contains("ppt7-show-advanced");
    b.innerHTML='<b>'+(open?'HIDE ADVANCED OPERATIONS':'ADVANCED OPERATIONS')+'</b><span>'+(open?'Keep the main screen simple −':'Market, contracts, battery, maintenance +')+'</span>';
  }
  function nextGoal(){
    let target=0,title="Upgrade your power company",copy="Keep building capacity and improving your HQ.",page="company";
    try{
      const locked=PLANTS.find(p=>!g.plants?.[p.id]?.unlocked);
      if(locked){target=n(locked.unlock);title="Build "+locked.name;copy="Save enough cash to commission your next generating unit.";page="plants"}
      else{
        const region=REGIONS.find(r=>r.id!=="riverbend"&&!g.regions?.[r.id]);
        if(region){target=n(region.cost);title="Expand to "+region.name;copy="Connect a new region when your company is ready.";page="map"}
        else{title="Improve HQ Operations";copy="Strengthen one department and keep expanding your company.";page="company"}
      }
    }catch(e){}
    return {target,title,copy,page};
  }
  window.goPPT7NextGoal=function(){const x=nextGoal(),b=document.querySelector('[data-nav="'+x.page+'"]');showPage(x.page,b)};
  function renderHomeSimple(){
    setupHome();renderAdvancedToggle();
    const gbox=document.getElementById("ppt7NextGoal");if(gbox){
      const x=nextGoal(),have=n(g.cash),pct=x.target>0?Math.min(100,have/x.target*100):100;
      const cost=x.target>0?cashText(x.target):"READY";
      const need=x.target>have?"Need "+cashText(x.target-have)+" more":"You can do this now";
      gbox.innerHTML='<div class="ppt7-goal-top"><div><small>NEXT GOAL</small><strong>'+x.title+'</strong></div><div class="ppt7-goal-cost">'+cost+'</div></div><div class="ppt7-goal-copy">'+x.copy+' • '+need+'</div><div class="ppt7-goal-progress"><i style="width:'+pct+'%"></i></div><div class="ppt7-goal-actions"><button onclick="goPPT7NextGoal()">GO TO '+(x.page==="plants"?'PLANTS':x.page==="map"?'GRID MAP':'HQ')+'</button><button class="secondary" onclick="showPPT7Coach()">WHAT SHOULD I DO?</button></div>';
    }
    const est=document.getElementById("ppt7SaleEstimate"),sell=document.getElementById("sellBtn");
    if(est){
      const amount=n(g.stored),rate=typeof safeSaleMultiplier==="function"?safeSaleMultiplier():.06,earned=amount*rate;
      est.innerHTML=amount>0?'Sell '+energyText(amount)+' now for about <b>+'+cashText(earned)+'</b>':'Generate power, then sell it here for cash.';
    }
    if(sell){
      const amount=n(g.stored),earned=amount*(typeof safeSaleMultiplier==="function"?safeSaleMultiplier():.06);
      sell.textContent=amount>0?'💵 SELL POWER • +'+cashText(earned):'💵 SELL POWER';
    }
  }

  function coachAdvice(){
    const x=nextGoal(),cash=n(g.cash),stored=n(g.stored),out=typeof output==="function"?n(output()):0;
    if(x.target>0&&cash>=x.target)return {title:"You are ready to upgrade",text:"You have enough cash for "+x.title+". Buy it now to keep progressing.",action:"GO TO UPGRADE",fn:"goPPT7NextGoal()"};
    if(stored>=Math.max(100,out*8))return {title:"Sell your stored power",text:"You have "+energyText(stored)+" ready. Sell it, then put the cash into your next goal.",action:"SELL POWER",fn:"closePPT7Coach();document.getElementById('sellBtn')?.click()"};
    if(plantCount()===0)return {title:"Start generating",text:"Generate a little power, sell it, then buy your first plant. That is the fastest way to get Riverbend moving.",action:"BACK TO HOME",fn:"closePPT7Coach();showPage('home',document.querySelector('[data-nav=home]'))"};
    return {title:"Build power for your next goal",text:"Let your plants generate power. Sell when you have a useful amount stored, then save toward "+x.title+".",action:"VIEW NEXT GOAL",fn:"closePPT7Coach();goPPT7NextGoal()"};
  }
  function ensureCoach(){if(document.getElementById("ppt7CoachShade"))return;const shade=document.createElement("div");shade.id="ppt7CoachShade";shade.onclick=()=>window.closePPT7Coach();const box=document.createElement("div");box.id="ppt7Coach";document.body.append(shade,box)}
  window.showPPT7Coach=function(){ensureCoach();const a=coachAdvice(),box=document.getElementById("ppt7Coach");box.innerHTML='<small>POWER PLANT ASSISTANT</small><h3>'+a.title+'</h3><p>'+a.text+'</p><div><button onclick="'+a.fn+'">'+a.action+'</button><button class="secondary" onclick="closePPT7Coach()">CLOSE</button></div>';document.getElementById("ppt7CoachShade").classList.add("show");box.classList.add("show")};
  window.closePPT7Coach=function(){document.getElementById("ppt7CoachShade")?.classList.remove("show");document.getElementById("ppt7Coach")?.classList.remove("show")};

  function plantRecommendation(){
    try{
      const rows=PLANTS.map((p,i)=>({p,i,s:g.plants?.[p.id]||{},c:n(plantCost(p))}));
      const nextLocked=rows.find(x=>!x.s.unlocked);
      if(nextLocked&&n(g.cash)>=nextLocked.c)return nextLocked;
      const affordable=rows.filter(x=>x.s.unlocked&&n(g.cash)>=x.c).sort((a,b)=>a.c-b.c);
      if(affordable.length)return affordable[0];
      return nextLocked||rows.filter(x=>x.s.unlocked).sort((a,b)=>a.c-b.c)[0]||null;
    }catch(e){return null}
  }
  function markPlantRecommendation(){
    const cards=[...document.querySelectorAll("#plantList .plant-v7")];cards.forEach(c=>{c.classList.remove("ppt7-recommended");c.querySelector(".ppt7-rec-badge")?.remove();c.querySelector(".ppt7-afford")?.remove()});
    const rec=plantRecommendation();
    try{PLANTS.forEach((p,i)=>{const card=cards[i];if(!card)return;const cost=n(plantCost(p)),left=n(g.cash)-cost;const a=document.createElement("div");a.className="ppt7-afford "+(left>=0?"ready":"short");a.textContent=left>=0?"Ready now • "+cashText(left)+" left after purchase":"Need "+cashText(-left)+" more";card.querySelector(".plant-card-actions")?.insertAdjacentElement("beforebegin",a)})}catch(e){}
    if(rec&&cards[rec.i]){const card=cards[rec.i];card.classList.add("ppt7-recommended");const b=document.createElement("div");b.className="ppt7-rec-badge";b.textContent=rec.s.unlocked?"RECOMMENDED UPGRADE":"RECOMMENDED NEXT PLANT";card.querySelector(".plant-card-content")?.prepend(b)}
  }

  /* =========================================================
     HQ — THREE CLEAR CATEGORIES
     ========================================================= */
  const HQ_CATS={operations:["operations","engineering","grid"],business:["trading","finance","hr"],technology:["research"]};
  let activeHQCat="operations";
  function setupHQ(){
    const depts=document.querySelector(".hq6-depts");if(!depts)return;
    if(!document.getElementById("ppt7HQCategories")){
      const box=document.createElement("div");box.id="ppt7HQCategories";
      box.innerHTML='<button data-cat="operations" onclick="setPPT7HQCategory(\'operations\')"><i>⚙️</i>OPERATIONS</button><button data-cat="business" onclick="setPPT7HQCategory(\'business\')"><i>💼</i>BUSINESS</button><button data-cat="technology" onclick="setPPT7HQCategory(\'technology\')"><i>🔬</i>TECHNOLOGY</button>';
      depts.insertAdjacentElement("beforebegin",box);
    }
    const fs=featureStatus();
    document.querySelector('#ppt7HQCategories [data-cat="business"]')?.classList.toggle("ppt7-feature-hidden",!fs.business.ok);
    document.querySelector('#ppt7HQCategories [data-cat="technology"]')?.classList.toggle("ppt7-feature-hidden",!fs.technology.ok);
    if((activeHQCat==="business"&&!fs.business.ok)||(activeHQCat==="technology"&&!fs.technology.ok))activeHQCat="operations";
    applyHQCategory();
  }
  window.setPPT7HQCategory=function(cat){if(!HQ_CATS[cat])return;activeHQCat=cat;if(typeof window.closeHQ6Details==="function")window.closeHQ6Details();applyHQCategory()};
  function applyHQCategory(){
    const allow=new Set(HQ_CATS[activeHQCat]||HQ_CATS.operations);
    document.querySelectorAll(".hq6-dept").forEach(e=>e.classList.toggle("ppt7-filtered",!allow.has(e.dataset.dept)));
    document.querySelectorAll("#ppt7HQCategories button").forEach(b=>b.classList.toggle("active",b.dataset.cat===activeHQCat));
  }
  function simplifyHQCopy(){
    setupHQ();
    const copy={
      operations:"Make every plant produce more",
      engineering:"Reduce repair and maintenance costs",
      grid:"Improve grid performance",
      trading:"Earn more when selling power",
      finance:"Improve company sale returns",
      hr:"Hire staff for less",
      research:"Unlock technology for less"
    };
    Object.entries(copy).forEach(([id,text])=>{const e=document.getElementById("hq6Effect-"+id);if(e)e.textContent=text});
    const head=document.querySelector(".hq6-section-head h3");if(head)head.textContent="CHOOSE AN HQ AREA";
    markHQRecommendation();
  }
  function markHQRecommendation(){
    const bases={operations:10000,engineering:12000,trading:14000,hr:9000,research:16000,finance:18000,grid:20000};
    document.querySelectorAll(".hq6-dept").forEach(c=>{c.classList.remove("ppt7-recommended");c.querySelector(".ppt7-rec-badge")?.remove();c.querySelector(".ppt7-afford")?.remove()});
    const ids=HQ_CATS[activeHQCat]||HQ_CATS.operations,rows=ids.map(id=>{const lv=Math.max(1,n(g?.hq6?.departments?.[id])||1),cost=bases[id]*Math.pow(1.78,lv-1);return {id,cost}}).sort((a,b)=>a.cost-b.cost);
    const rec=rows.find(x=>n(g.cash)>=x.cost)||rows[0];
    rows.forEach(x=>{const card=document.querySelector('.hq6-dept[data-dept="'+x.id+'"]');if(!card)return;const left=n(g.cash)-x.cost,a=document.createElement("div");a.className="ppt7-afford "+(left>=0?"ready":"short");a.textContent=left>=0?"Ready now • "+cashText(left)+" left":"Need "+cashText(-left)+" more";card.querySelector(".hq6-upgrade")?.insertAdjacentElement("beforebegin",a)});
    if(rec){const card=document.querySelector('.hq6-dept[data-dept="'+rec.id+'"]');if(card){card.classList.add("ppt7-recommended");const b=document.createElement("div");b.className="ppt7-rec-badge";b.textContent="RECOMMENDED";card.querySelector(".hq6-dept-body")?.prepend(b)}}
  }

  /* =========================================================
     EVERY PURCHASE SHOWS CASH LEFT
     ========================================================= */
  function spendReceipt(spent,left){
    if(!(spent>0))return;let el=document.getElementById("ppt7SpendReceipt");
    if(!el){el=document.createElement("div");el.id="ppt7SpendReceipt";document.body.appendChild(el)}
    el.innerHTML='Spent <b>'+cashText(spent)+'</b> • Cash left <b>'+cashText(left)+'</b>';
    clearTimeout(window.__ppt7SpendTimer);el.classList.remove("show");requestAnimationFrame(()=>el.classList.add("show"));window.__ppt7SpendTimer=setTimeout(()=>el.classList.remove("show"),2600);
  }
  const spendWrapped=new Set();
  function wrapSpend(name){
    if(spendWrapped.has(name))return;
    const fn=window[name];if(typeof fn!=="function")return;
    const wrapped=function(){const before=n(g.cash),r=fn.apply(this,arguments),after=n(g.cash);if(after<before)spendReceipt(before-after,after);return r};
    wrapped.__ppt7SpendWrapped=true;window[name]=wrapped;spendWrapped.add(name);
  }
  function wrapSpendFunctions(){
    ["upgradeTap","buildPlant","buyRegion","buyCorporate","upgradeBattery","hireStaff","buyResearch","performMaintenance","hireEngineer","buyMegaProject","buyEmpireLevel","upgradeAutoGenerate"].forEach(wrapSpend);
    if(typeof window.upgradeHQ6Department==="function"&&!spendWrapped.has("upgradeHQ6Department")){
      const f=window.upgradeHQ6Department;const w=function(){const before=n(g.cash),r=f.apply(this,arguments),after=n(g.cash);if(after<before)spendReceipt(before-after,after);return r};w.__ppt7SpendWrapped=true;window.upgradeHQ6Department=w;spendWrapped.add("upgradeHQ6Department");
    }
  }

  /* =========================================================
     SHORT QUICK-START TUTORIAL
     ========================================================= */
  const QSTEPS=[
    {title:"Generate power",text:"Tap Generate Power three times.",sel:".generate",page:"home"},
    {title:"Sell power",text:"Turn stored electricity into cash with Sell Power.",sel:"#sellBtn",page:"home"},
    {title:"Open Plants",text:"Plants are where you build and upgrade generation.",sel:'[data-nav="plants"]'},
    {title:"Build your fleet",text:"Build or upgrade one plant.",sel:"#plantList",page:"plants"},
    {title:"Open HQ",text:"HQ improves Operations, Business and Technology.",sel:'[data-nav="company"]'}
  ];
  let qTarget=null,qLast=-1;
  function ensureQuickState(){
    if(!g.quickStart7){
      const experienced=n(g.lifetimeCash)>=10000||plantCount()>0;
      g.quickStart7={step:0,taps:0,done:experienced,disabled:experienced};
    }
    if(g.firstShift6&&!g.firstShift6.done)g.firstShift6.disabled=true;
  }
  function clearQTarget(){if(qTarget){qTarget.classList.remove("ppt7-tutorial-target");qTarget=null}}
  function renderQuickStart(){
    ensureQuickState();
    let box=document.getElementById("ppt7QuickStart");
    if(g.quickStart7.done||g.quickStart7.disabled){box?.remove();clearQTarget();return}
    if(!box){box=document.createElement("div");box.id="ppt7QuickStart";document.body.appendChild(box)}
    const i=Math.min(QSTEPS.length-1,n(g.quickStart7.step)),s=QSTEPS[i];
    box.innerHTML='<div class="head"><small>QUICK START '+(i+1)+'/'+QSTEPS.length+'</small><button onclick="skipPPT7QuickStart()">SKIP</button></div><h3>'+s.title+'</h3><p>'+s.text+'</p>';
    if(qLast!==i){qLast=i;clearQTarget();if(s.page){const b=document.querySelector('[data-nav="'+s.page+'"]');if(typeof showPage==="function")showPage(s.page,b)}setTimeout(()=>{const e=document.querySelector(s.sel);if(e){qTarget=e;e.classList.add("ppt7-tutorial-target")}},160)}
  }
  function advanceQuick(){ensureQuickState();if(g.quickStart7.step>=QSTEPS.length-1){g.quickStart7.done=true;g.quickStart7.disabled=false;clearQTarget();document.getElementById("ppt7QuickStart")?.remove();try{saveGame()}catch(e){};if(typeof toast==="function")toast("✓ Quick Start complete");return}g.quickStart7.step++;qLast=-1;try{saveGame()}catch(e){};renderQuickStart()}
  window.skipPPT7QuickStart=function(){ensureQuickState();g.quickStart7.disabled=true;clearQTarget();document.getElementById("ppt7QuickStart")?.remove();try{saveGame()}catch(e){}};

  function wrapTutorialActions(){
    if(typeof window.tapGenerate==="function"&&!window.tapGenerate.__ppt7Quick){const f=window.tapGenerate;const w=function(){const r=f.apply(this,arguments);ensureQuickState();if(!g.quickStart7.done&&!g.quickStart7.disabled&&g.quickStart7.step===0){g.quickStart7.taps=n(g.quickStart7.taps)+1;if(g.quickStart7.taps>=3)advanceQuick();else{saveGame();renderQuickStart()}}return r};w.__ppt7Quick=true;window.tapGenerate=w}
    if(typeof window.sellPower==="function"&&!window.sellPower.__ppt7Quick){const f=window.sellPower;const w=function(){const before=n(g.sold),r=withIncomeSource("manualSale",()=>f.apply(this,arguments));ensureQuickState();if(!g.quickStart7.done&&!g.quickStart7.disabled&&g.quickStart7.step===1&&n(g.sold)>before)advanceQuick();return r};w.__ppt7Quick=true;window.sellPower=w}
    if(typeof window.buildPlant==="function"&&!window.buildPlant.__ppt7Quick){const f=window.buildPlant;const w=function(){const before=typeof totalLevels==="function"?totalLevels():0,r=f.apply(this,arguments),after=typeof totalLevels==="function"?totalLevels():before;ensureQuickState();if(!g.quickStart7.done&&!g.quickStart7.disabled&&g.quickStart7.step===3&&after>before)advanceQuick();return r};w.__ppt7Quick=true;window.buildPlant=w}
    if(typeof window.showPage==="function"&&!window.showPage.__ppt7Quick){const f=window.showPage;const w=function(id,b){const r=f.apply(this,arguments);ensureQuickState();if(!g.quickStart7.done&&!g.quickStart7.disabled){if(g.quickStart7.step===2&&id==="plants")advanceQuick();else if(g.quickStart7.step===4&&id==="company")advanceQuick()}return r};w.__ppt7Quick=true;window.showPage=w}
  }

  function wrapIncomeFunction(name,source){
    const fn=window[name];if(typeof fn!=="function"||fn.__ppt7IncomeWrapped)return;
    const w=function(){return withIncomeSource(source,()=>fn.apply(this,arguments))};w.__ppt7IncomeWrapped=true;window[name]=w;
  }
  function wrapIncomeFunctions(){wrapIncomeFunction("updateContract","contract");wrapIncomeFunction("claimMission","mission");wrapIncomeFunction("claimWeekly","weeklyReward");wrapIncomeFunction("resolveEvent","event")}

  function simplifyUpgradeCopy(){
    const tap=document.getElementById("tapCost");if(tap&&typeof tapUpgradeCost==="function"){const c=n(tapUpgradeCost()),left=n(g.cash)-c;tap.textContent=left>=0?"Generator upgrade: "+cashText(c)+" • You can afford it":"Generator upgrade: "+cashText(c)+" • Need "+cashText(-left)+" more"}
    markPlantRecommendation();
  }

  /* Render last so every dynamic screen gets the simplified copy. */
  function renderBuild7(){setupNav();setupHome();renderHomeSimple();simplifyHQCopy();simplifyUpgradeCopy();renderMore();wrapSpendFunctions();wrapIncomeFunctions();renderQuickStart();checkFeatureUnlocks()}
  if(typeof render==="function"){
    const oldRender=render;render=function(){const r=oldRender();renderBuild7();return r};
  }

  setupNav();setupHome();wrapSpendFunctions();wrapTutorialActions();ensureQuickState();renderBuild7();
  try{saveGame()}catch(e){}
  setInterval(()=>{renderHomeSimple();simplifyHQCopy();simplifyUpgradeCopy();renderQuickStart();checkFeatureUnlocks()},1200);

  window.pptEconomy7Report=function(){
    const mins=Math.max(1/60,(Date.now()-tracker.started)/60000),out=typeof output==="function"?output():0,rate=typeof safeSaleMultiplier==="function"?safeSaleMultiplier():0;
    const report={version:"Build 7 Simplified V2",minutes:mins.toFixed(2),cashAtTrackerStart:tracker.startCash,currentCash:n(g.cash),grossEarnedTracked:tracker.gross,trackedCashPerMinute:tracker.gross/mins,outputKWhPerSecond:out,dollarPerMWh:rate*1000,estimatedManualCashPerMinute:out*rate*60,estimatedAutoSellCashPerMinute:out*rate*.55*60,offlineEfficiency:typeof offlineEfficiency==="function"?offlineEfficiency():null};
    console.table(report);console.table(tracker.sources);return {summary:report,sources:{...tracker.sources}};
  };
  window.pptEconomy7Diagnostics=window.pptEconomy7Report;
  console.info("Power Plant Tycoon • Build 7 Simplified V2 active");
})();
