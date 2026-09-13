/* POWER PLANT TYCOON — BUILD 8 RC2 RELEASE VERIFICATION */
(function(){
  if(window.__pptBuild8RC2)return;
  window.__pptBuild8RC2=true;
  document.body.classList.add("ppt8-rc2");

  const n=v=>Math.max(0,Number(v)||0);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||a));
  const fmtEnergy=v=>{try{return energy(v)}catch(e){return Math.round(n(v)).toLocaleString()+" kWh"}};
  const fmtPower=v=>{try{return powerRate(v)}catch(e){return Math.round(n(v)).toLocaleString()+" kWh/s"}};
  const fmtMoney=v=>{try{return money(v)}catch(e){return "$"+Math.round(n(v)).toLocaleString()}};
  const ownedPlants=()=>{try{return PLANTS.filter(p=>g.plants?.[p.id]?.unlocked)}catch(e){return []}};

  /* Build 6 Economy V5 replaced totalMult() after Build 10 and accidentally
     dropped the earned Build 10 operating-license bonus. Restore only that
     missing, bounded 1.00x–1.22x factor after the Build 7 economy cap. */
  if(typeof totalMult==="function"&&typeof b10LicenseMult==="function"&&!totalMult.__ppt8LicenseRestored){
    const balancedTotal=totalMult;
    const withLicense=function(){
      const base=n(balancedTotal())||1;
      let lic=1;try{lic=clamp(b10LicenseMult(),1,1.22)}catch(e){}
      return Math.max(.05,base*lic);
    };
    withLicense.__ppt8LicenseRestored=true;
    totalMult=withLicense;
  }

  /* Final offline curve. handleOffline() is now intentionally called only
     after this script loads, so it uses the SAME balanced output math players
     see while online. */
  if(typeof offlineEfficiency==="function"){
    offlineEfficiency=function(){
      const legacy=Math.min(.02,n(g?.legacy?.offline)*.001);
      const licensed=!!g?.offlineOperationsUnlocked;
      const base=licensed?.08:.03;
      return Math.min(licensed?.10:.05,base+legacy);
    };
  }

  /* RC2 AUTO SELL SAFETY
     The old loop generated fleet power and then sold the entire new tick in the
     same second. That made Stored Power appear stuck at zero and hid whether the
     fleet was actually producing. RC2 always keeps a visible production buffer:
       Immediate: 5 seconds of fleet output
       High Price: 10 seconds of fleet output
       Reserve:    30 seconds of fleet output (or 25% of storage, whichever is larger)
     Auto Sell may sell surplus above that buffer, but it cannot drain storage to zero. */
  window.__ppt8AutoSellLast={amount:0,cash:0,at:0};
  if(typeof autoSellTick==="function"){
    autoSellTick=function(){
      if(!g?.autoSell||n(g.stored)<=0){window.__ppt8AutoSellLast={amount:0,cash:0,at:Date.now()};return}
      const earned=n(g.research?.automation)>=1;
      if(!g.autoSellLicenseUnlocked&&!earned){g.autoSell=false;return}
      const mode=g.autoSellLicenseUnlocked?(g.autoSellMode||"high"):"high";
      const threshold=Math.max(.95,1.05-Math.min(.10,n(g.research?.gridAI)*.01));
      if(mode==="high"&&n(g.market?.price||1)<threshold&&g.policy!=="market"){
        window.__ppt8AutoSellLast={amount:0,cash:0,at:Date.now()};return;
      }
      const out=Math.max(0,(typeof output==="function"?output():0));
      const reserveSeconds=mode==="reserve"?30:(mode==="high"?10:5);
      const fixedReserve=out*reserveSeconds;
      const reserve=mode==="reserve"?Math.max(fixedReserve,n(g.stored)*.25):fixedReserve;
      const available=Math.max(0,n(g.stored)-reserve);
      if(available<=0){window.__ppt8AutoSellLast={amount:0,cash:0,at:Date.now()};return}
      const flow=Math.max(1,out); // at most one second of normal fleet output per tick
      const amount=Math.min(available,flow);
      const rate=(typeof safeSaleMultiplier==="function"?safeSaleMultiplier():.06)*.55;
      const cash=amount*rate;
      g.stored=Math.max(reserve,n(g.stored)-amount);
      if(typeof recordEarnedCash==="function")recordEarnedCash(cash);else g.cash=n(g.cash)+cash;
      g.sold=Math.min(1e300,n(g.sold)+amount);
      window.__ppt8AutoSellLast={amount,cash,at:Date.now(),reserve,mode};
    };
  }

  function injectStyles(){
    if(document.getElementById("ppt8RC2Styles"))return;
    const s=document.createElement("style");
    s.id="ppt8RC2Styles";
    s.textContent=`
      #ppt8FleetStatus{margin:8px 0 0;padding:10px 11px;border:1px solid rgba(78,198,255,.30);border-radius:11px;background:rgba(8,29,41,.78);display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11px;color:#9fc4d4}
      #ppt8FleetStatus b{color:#eaf8ff;font-size:12px}#ppt8FleetStatus .ok{color:#62e39b;font-weight:1000}#ppt8FleetStatus .warn{color:#ffcc72;font-weight:1000}
      #ppt8AutoSellState{margin-top:8px;padding:10px 11px;border-radius:11px;font-size:11px;font-weight:900;letter-spacing:.15px;border:1px solid rgba(113,152,173,.28);background:rgba(7,24,34,.82);color:#9fb9c6}
      #ppt8AutoSellState.on{border-color:rgba(255,184,71,.48);background:rgba(48,31,8,.86);color:#ffd28a}#ppt8AutoSellState strong{color:inherit}
      #ppt8GenerateHelp{margin-top:7px;font-size:10px;line-height:1.35;color:#8fb0bf;text-align:center}
      #ppt8GenerateFlash{position:fixed;left:50%;top:115px;transform:translate(-50%,-8px);z-index:10060;padding:9px 13px;border-radius:12px;background:rgba(6,29,40,.97);border:1px solid rgba(72,211,255,.48);box-shadow:0 12px 36px rgba(0,0,0,.32);font-weight:1000;color:#8ee8ff;opacity:0;pointer-events:none;transition:.18s ease;max-width:calc(100vw - 24px);white-space:nowrap}
      #ppt8GenerateFlash.show{opacity:1;transform:translate(-50%,0)}
      #ppt8FleetAudit{border-color:rgba(71,210,255,.32)}#ppt8FleetAudit .ppt8-audit-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:9px}#ppt8FleetAudit .ppt8-audit-head b{font-size:13px}#ppt8FleetAudit .ppt8-pass{color:#61e399;font-weight:1000}#ppt8FleetAudit .ppt8-warn{color:#ffcc72;font-weight:1000}
      #ppt8FleetAudit .ppt8-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:7px 0;border-top:1px solid rgba(129,166,184,.12);font-size:11px}#ppt8FleetAudit .ppt8-row:first-of-type{border-top:0}#ppt8FleetAudit .ppt8-row small{display:block;color:#7f9daa;margin-top:2px}#ppt8FleetAudit .ppt8-row strong{color:#dff6ff;text-align:right}
      #ppt8FleetAudit .ppt8-total{margin-top:9px;padding-top:9px;border-top:1px solid rgba(85,207,255,.25);display:flex;justify-content:space-between;gap:8px;font-size:12px}#ppt8FleetAudit .ppt8-total strong{color:#6de0ff}
      .ppt8-prod-note{margin-top:5px!important;color:#88aebb!important;font-size:10px!important}
      @media(max-width:760px){#ppt8GenerateFlash{top:106px}#ppt8FleetStatus{font-size:10px}}
    `;
    document.head.appendChild(s);
  }

  /* Independent fleet audit: sum every unlocked plant with level, condition,
     plant contribution and the final active multiplier, then compare to HUD. */
  function fleetBreakdown(){
    let mult=1;try{mult=n(totalMult())||1}catch(e){}
    const rows=[];
    try{
      PLANTS.forEach(p=>{
        const st=g.plants?.[p.id];
        if(!st?.unlocked)return;
        const condition=clamp(st.condition==null?100:st.condition,35,100);
        const conditionFactor=.6+.4*(condition/100);
        let base=0;try{base=n(plantBaseContribution(p,st))}catch(e){}
        const contribution=base*conditionFactor*mult;
        rows.push({id:p.id,name:p.name,level:n(st.level),condition,base,conditionFactor,contribution});
      });
    }catch(e){}
    const sum=rows.reduce((a,x)=>a+x.contribution,0);
    let hud=0;try{hud=n(output())}catch(e){}
    const tolerance=Math.max(.001,hud*.000001);
    return {rows,sum,hud,pass:Math.abs(sum-hud)<=tolerance,mult};
  }

  window.pptFleetAudit=function(){
    const a=fleetBreakdown();
    const out={ownedPlants:a.rows.length,totalPlantTypes:typeof PLANTS!=="undefined"?PLANTS.length:0,calculatedKWhPerSecond:a.sum,hudKWhPerSecond:a.hud,match:a.pass,plants:a.rows};
    console.table(a.rows.map(x=>({plant:x.name,level:x.level,condition:x.condition.toFixed(0)+"%",output:fmtPower(x.contribution)})));
    console.table({ownedPlants:out.ownedPlants,calculatedOutput:fmtPower(a.sum),hudOutput:fmtPower(a.hud),match:a.pass});
    return out;
  };

  window.pptReleaseAudit=function(){
    const a=fleetBreakdown();
    let productIDs=[];try{productIDs=Object.values(PPT_STOREKIT.products||{})}catch(e){}
    let license=1;try{license=b10LicenseMult()}catch(e){}
    const report={
      release:"Build 8 RC2",
      ownedPlants:a.rows.length,
      totalPlantTypes:typeof PLANTS!=="undefined"?PLANTS.length:0,
      fleetMathMatchesHUD:a.pass,
      hudOutput:fmtPower(a.hud),
      storedPower:fmtEnergy(n(g?.stored)),
      autoSell:!!g?.autoSell,
      autoSellMode:g?.autoSellMode||"high",
      autoGenerate:!!g?.autoGenerate,
      autoGenerateCoreLevel:n(g?.autoGenerateLevel),
      offlineEfficiency:typeof offlineEfficiency==="function"?offlineEfficiency():null,
      build10LicenseMultiplier:license,
      storeKitProductCount:productIDs.length,
      has16StoreKitProducts:productIDs.length===16,
      lastAutoSellEnergy:fmtEnergy(n(window.__ppt8AutoSellLast?.amount)),
      lastAutoSellCash:fmtMoney(n(window.__ppt8AutoSellLast?.cash))
    };
    console.table(report);return report;
  };

  function showGenerateFlash(amount){
    if(!(amount>0))return;
    let el=document.getElementById("ppt8GenerateFlash");
    if(!el){el=document.createElement("div");el.id="ppt8GenerateFlash";document.body.appendChild(el)}
    el.textContent="⚡ +"+fmtEnergy(amount)+" generated"+(g.autoSell?" • Auto Sell is ON":"");
    clearTimeout(window.__ppt8GenTimer);el.classList.remove("show");
    requestAnimationFrame(()=>el.classList.add("show"));
    window.__ppt8GenTimer=setTimeout(()=>el.classList.remove("show"),1800);
  }

  if(typeof tapGenerate==="function"&&!tapGenerate.__ppt8Feedback){
    const baseTapGenerate=tapGenerate;
    const wrapped=function(){
      const beforeGenerated=n(g.generated),r=baseTapGenerate.apply(this,arguments);
      const delta=Math.max(0,n(g.generated)-beforeGenerated);
      showGenerateFlash(delta);return r;
    };
    wrapped.__ppt8Feedback=true;tapGenerate=wrapped;
  }

  function ensureHomeVerification(){
    const est=document.getElementById("ppt7SaleEstimate")||document.getElementById("sellBtn")?.parentElement;
    if(est&&!document.getElementById("ppt8FleetStatus")){
      const el=document.createElement("div");el.id="ppt8FleetStatus";est.insertAdjacentElement("afterend",el);
      const as=document.createElement("div");as.id="ppt8AutoSellState";el.insertAdjacentElement("afterend",as);
    }
    const gen=document.querySelector("#home .generate-wrap")||document.querySelector("#home .generate")?.parentElement;
    if(gen&&!document.getElementById("ppt8GenerateHelp")){
      const h=document.createElement("div");h.id="ppt8GenerateHelp";
      h.textContent="Every owned plant contributes to fleet production automatically each second. GENERATE POWER adds an extra fleet-based pulse. Auto Sell now keeps a visible reserve.";
      gen.insertAdjacentElement("afterend",h);
    }
  }

  function renderHomeVerification(){
    ensureHomeVerification();
    const a=fleetBreakdown(),fs=document.getElementById("ppt8FleetStatus");
    if(fs){
      const total=typeof PLANTS!=="undefined"?PLANTS.length:a.rows.length;
      const last=window.__ppt8AutoSellLast||{}; const sold=n(last.amount)>0?' • Auto sold '+fmtEnergy(last.amount):''; fs.innerHTML='<span><b>'+a.rows.length+' / '+total+' plants online</b> • +'+fmtEnergy(a.hud)+'/sec to storage'+sold+'</span><span class="'+(a.pass?'ok':'warn')+'">'+(a.pass?'✓ VERIFIED':'⚠ CHECK')+'</span>';
    }
    const as=document.getElementById("ppt8AutoSellState");
    if(as){
      const mode=(g.autoSellMode||"high").toString().replace(/^./,x=>x.toUpperCase());
      as.classList.toggle("on",!!g.autoSell);
      as.innerHTML=g.autoSell
        ?'<strong>⚡ AUTO SELL ON</strong> • '+mode+' mode • RC2 keeps a visible reserve so Stored Power will not be drained to zero.'
        :'AUTO SELL OFF • every second of fleet production stays in Stored Power until you sell it.';
    }
    const tapInfo=document.getElementById("tapInfo");if(tapInfo)tapInfo.textContent=fmtEnergy(typeof tapPower==="function"?tapPower():0)+" active pulse";
  }

  function correctPlantCards(){
    const cards=[...document.querySelectorAll("#plantList .plant-v7")];
    if(!cards.length)return;
    const a=fleetBreakdown(),byId=new Map(a.rows.map(x=>[x.id,x]));
    try{
      PLANTS.forEach((p,i)=>{
        const card=cards[i],st=g.plants?.[p.id],row=byId.get(p.id);if(!card||!st?.unlocked||!row)return;
        const out=card.querySelector(".plant-card-output");if(out)out.textContent="Fleet contribution "+fmtPower(row.contribution);
        const meta=card.querySelector(".plant-card-meta");
        if(meta&&!card.querySelector(".ppt8-prod-note")){
          const note=document.createElement("div");note.className="ppt8-prod-note";note.textContent="Includes current condition and all active fleet bonuses.";meta.insertAdjacentElement("afterend",note);
        }
      });
    }catch(e){}
  }

  function fixHQCount(){
    const count=ownedPlants().length,total=typeof PLANTS!=="undefined"?PLANTS.length:count;
    const el=document.getElementById("hq6Plants");if(el)el.textContent=count+" / "+total;
    const stored=document.getElementById("hq6Stored");if(stored)stored.textContent=fmtEnergy(n(g.stored));
    const out=document.getElementById("hq6Output");if(out)out.textContent=fmtPower(typeof output==="function"?output():0);
    const goal=document.getElementById("hq6Goal"),arrow=document.getElementById("hq6GoalArrow");
    if(goal&&count>=total){goal.textContent="All generation technologies online";if(arrow)arrow.textContent="★"}
  }

  function ensureFleetAuditCard(){
    const stats=document.getElementById("stats");if(!stats||document.getElementById("ppt8FleetAudit"))return;
    const card=document.createElement("div");card.id="ppt8FleetAudit";card.className="card";
    const fleet=document.getElementById("fleetStats")?.closest(".card");
    if(fleet)fleet.insertAdjacentElement("beforebegin",card);else stats.appendChild(card);
  }

  function renderFleetAuditCard(){
    ensureFleetAuditCard();const card=document.getElementById("ppt8FleetAudit");if(!card)return;
    const a=fleetBreakdown(),total=typeof PLANTS!=="undefined"?PLANTS.length:a.rows.length;
    const rows=a.rows.map(x=>'<div class="ppt8-row"><div><b>'+x.name+'</b><small>Level '+x.level+' • '+Math.round(x.condition)+'% condition</small></div><strong>'+fmtPower(x.contribution)+'</strong></div>').join("");
    card.innerHTML='<div class="ppt8-audit-head"><div><small>BUILD 8 RELEASE CHECK</small><br><b>⚡ Fleet Production Audit</b></div><span class="'+(a.pass?'ppt8-pass':'ppt8-warn')+'">'+(a.pass?'✓ VERIFIED':'⚠ MISMATCH')+'</span></div><div class="small">'+a.rows.length+' of '+total+' plant technologies online. Every unlocked plant below is included in the total Output shown at the top.</div>'+rows+'<div class="ppt8-total"><span>Calculated fleet total</span><strong>'+fmtPower(a.sum)+'</strong></div><div class="ppt8-total"><span>Top HUD Output</span><strong>'+fmtPower(a.hud)+'</strong></div>';
  }

  function renderAutomationCoreCopy(){
    const auto=document.getElementById("automationCore");if(!auto)return;
    const lv=n(g.autoGenerateLevel),effective=Math.min(10,lv),boost=1+effective*.05;
    const maxed=lv>=10,c=typeof autoGenerateUpgradeCost==="function"?autoGenerateUpgradeCost():0;
    auto.innerHTML='<div class="automation-core"><div><small>STATUS</small><strong>'+(g.autoGenerateUnlocked?(g.autoGenerate?'ONLINE':'READY'):'LOCKED')+'</strong></div><div><small>CORE LEVEL</small><strong>LV '+lv+'</strong></div><div><small>AUTO PULSE</small><strong>'+boost.toFixed(2)+'×</strong></div></div><p class="small">Each Core Level adds +5% to the Auto Generate pulse, capped at +50%.</p><button class="btn '+(g.autoGenerateUnlocked&&!maxed?'blue':'dark')+'" style="width:100%" '+(g.autoGenerateUnlocked&&!maxed?'':'disabled')+' onclick="upgradeAutoGenerate()">'+(!g.autoGenerateUnlocked?'UNLOCK AUTO GENERATE IN STORE':maxed?'AUTOMATION CORE MAXED':'UPGRADE CORE • '+fmtMoney(c))+'</button>';
  }

  function correctStoreCopy(){
    document.querySelectorAll(".b6-product").forEach(card=>{
      const title=card.querySelector("h4")?.textContent?.trim(),p=card.querySelector("p");if(!p)return;
      if(title==="Executive License")p.textContent="Permanent +8% generation and +5% grid sale quality.";
      else if(title==="Founder's Energy Bundle")p.textContent="Permanent Founder status • +3% output • +3% sale quality • 5% staff & research discount.";
      else if(title==="Auto Generate")p.textContent="Permanent convenience upgrade that adds an automatic generation pulse every second.";
      else if(title==="Turbo Grid Pack")p.textContent="60 minutes of +35% generation.";
      else if(title==="Maintenance Crate")p.textContent="Fully repairs the fleet + 15 minutes of +35% output.";
    });
    document.querySelectorAll(".b6-autosell-note").forEach(x=>{
      if(g.autoSellLicenseUnlocked)x.textContent="Immediate sells power as it arrives. High Price waits for favorable market conditions. Reserve keeps roughly 25% / 30 seconds of output on hand.";
    });
  }

  function renderRC1(){
    renderHomeVerification();correctPlantCards();fixHQCount();renderFleetAuditCard();renderAutomationCoreCopy();correctStoreCopy();
  }

  /* Run after every existing renderer so release corrections win last. */
  if(typeof render==="function"&&!render.__ppt8Wrapped){
    const oldRender=render;
    const wrappedRender=function(){const r=oldRender.apply(this,arguments);renderRC1();return r};
    wrappedRender.__ppt8Wrapped=true;render=wrappedRender;
  }
  if(typeof renderPlants==="function"&&!renderPlants.__ppt8Wrapped){
    const oldRenderPlants=renderPlants;
    const wrappedPlants=function(){const r=oldRenderPlants.apply(this,arguments);correctPlantCards();return r};
    wrappedPlants.__ppt8Wrapped=true;renderPlants=wrappedPlants;
  }

  injectStyles();renderRC1();

  /* Offline is deliberately delayed until all Build 6/7/8 balance layers are active. */
  try{if(typeof handleOffline==="function")handleOffline()}catch(e){console.warn("Build 8 offline check failed",e)}
  try{if(typeof render==="function")render()}catch(e){}

  setInterval(()=>{renderHomeVerification();fixHQCount();renderFleetAuditCard()},1000);
  console.info("Power Plant Tycoon • Build 8 RC2 release verification active");
})();
