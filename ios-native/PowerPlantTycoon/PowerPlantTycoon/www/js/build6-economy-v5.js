/* POWER PLANT TYCOON — BUILD 6 ECONOMY V5 */
(function(){
  if(window.__pptBuild6EconomyV5)return;
  window.__pptBuild6EconomyV5=true;
  document.body.classList.add("b6-economy-v5");

  const clamp=(v,a,b)=>{v=Number(v);return Number.isFinite(v)?Math.max(a,Math.min(b,v)):a};
  const n=v=>Math.max(0,Number(v)||0);
  const now=()=>Date.now();
  const hqExtra=id=>Math.max(0,Number(g?.hq6?.departments?.[id]||1)-1);
  const megaCount=()=>{try{return typeof completedMegaProjects==="function"?Math.max(0,completedMegaProjects()):0}catch(e){return 0}};
  const empireLv=()=>Math.max(0,Number(g?.empireLevel||0));

  /* ---------------------------------------------------------
     ECONOMY TARGET
     11 GWh = 11,000,000 internal kWh. The normal effective
     sale band is now roughly $0.20-$0.40 per kWh, so a sale of
     that size is usually a few million dollars instead of ~$20M.
     --------------------------------------------------------- */

  /* Production bonuses: useful, but no longer multiplicative explosions. */
  if(typeof prestigeMult==="function")prestigeMult=function(){return 1+.045*Math.pow(n(g.prestige),.64)};
  if(typeof operatorMult==="function")operatorMult=function(){return 1+Math.min(.50,Math.max(0,n(g.operatorLevel)-1)*.005)};
  if(typeof efficiencyMult==="function")efficiencyMult=function(){return 1+Math.min(.50,n(g.corporate?.eff)*.02)};
  if(typeof staffProductionMult==="function")staffProductionMult=function(){return 1+Math.min(.35,n(g.staff?.operator)*.01)};
  if(typeof researchProductionMult==="function")researchProductionMult=function(){
    return 1+
      n(g.research?.automation)*.018+
      n(g.research?.advancedNuclear)*.04+
      n(g.research?.fusionControl)*.075+
      n(g.research?.quantumGrid)*.05;
  };
  if(typeof legacyProductionMult==="function")legacyProductionMult=function(){return 1+Math.min(1.20,n(g.legacy?.generation)*.03)};
  if(typeof legacySaleMult==="function")legacySaleMult=function(){return 1+Math.min(.60,n(g.legacy?.markets)*.015)};
  if(typeof empireLevelMult==="function")empireLevelMult=function(){return 1+.08*Math.sqrt(empireLv())};
  if(typeof empireBonusMult==="function")empireBonusMult=function(){
    return 1+Math.min(1.0,megaCount()*.12)+Math.min(1.0,(empireLevelMult()-1));
  };
  if(typeof premiumLicenseMult==="function")premiumLicenseMult=function(){return g.executiveLicenseUnlocked?1.08:1};

  /* Regions now use diminishing stacking instead of adding thousands of percent. */
  if(typeof regionMult==="function")regionMult=function(){
    let raw=0;
    try{REGIONS.forEach(r=>{if(r.id!=="riverbend"&&g.regions?.[r.id])raw+=n(r.bonus)})}catch(e){}
    return 1+Math.min(1.25,Math.log1p(raw)*.35);
  };

  /* Reduce output further by technology tier on top of Build 6 V4. */
  if(typeof plantBaseContribution==="function"){
    const v4PlantContribution=plantBaseContribution;
    plantBaseContribution=function(p,s){
      const unlock=n(p?.unlock);let f=.90;
      if(unlock>=75000000000)f=.45;
      else if(unlock>=1000000000)f=.55;
      else if(unlock>=75000000)f=.65;
      else if(unlock>=18000000)f=.70;
      else if(unlock>=2500000)f=.75;
      else if(unlock>=350000)f=.80;
      return v4PlantContribution(p,s)*f;
    };
  }

  /* All boost sources now use +35%, including Turbo Grid and rewarded boosts. */
  if(typeof boostMult==="function")boostMult=function(){return now()<n(g.boostUntil)?1.35:1};
  if(typeof eventMult==="function")eventMult=function(){
    if(!g.event)return 1;
    if(g.event.type==="breakdown")return .60;
    if(g.event.type==="surge")return 1.05;
    return 1;
  };
  if(typeof policyProductionMult==="function")policyProductionMult=function(){
    if(g.policy==="maximum")return 1.08;
    if(g.policy==="reliability")return .95;
    return 1;
  };

  /* Market and grid sale bonuses are intentionally compressed. */
  if(typeof marketSaleMult==="function")marketSaleMult=function(){
    const spot=clamp(n(g.market?.price||1)*n(g.market?.demand||1),.78,1.28);
    let bonus=0;
    bonus+=Math.min(.18,n(g.staff?.trader)*.0075);
    bonus+=Math.min(.08,n(g.research?.forecast)*.01);
    if(g.policy==="market")bonus+=.03;
    if(n(g.research?.gridAI)>0&&g.autoSell)bonus+=Math.min(.06,n(g.research.gridAI)*.0075);
    if(now()<n(g.marketIntelUntil))bonus+=.12;
    if(g.foundersBundleUnlocked)bonus+=.03;
    return clamp(spot*(1+bonus),.72,1.55);
  };
  if(typeof gridSaleMult==="function")gridSaleMult=function(){
    let bonus=0;
    bonus+=Math.min(.30,n(g.corporate?.grid)*.012);
    bonus+=Math.min(.16,n(g.research?.quantumGrid)*.02);
    bonus+=Math.min(.60,n(g.legacy?.markets)*.015);
    if(g.executiveLicenseUnlocked)bonus+=.05;
    if(g.foundersBundleUnlocked)bonus+=.03;
    bonus+=Math.min(.10,hqExtra("trading")*.008)+Math.min(.06,hqExtra("finance")*.004)+Math.min(.06,hqExtra("grid")*.004);
    return clamp(1+bonus,1,1.55);
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
    if(g.executiveLicenseUnlocked)core+=.08;
    try{core+=legacyProductionMult()-1}catch(e){}
    if(g.foundersBundleUnlocked)core+=.03;
    core+=Math.min(.10,hqExtra("operations")*.008)+Math.min(.06,hqExtra("grid")*.004);
    const permanentCap=2.75+Math.min(1.50,megaCount()*.12+Math.sqrt(empireLv())*.16);
    core=clamp(core,.25,permanentCap);
    let temp=1;
    try{temp*=boostMult()}catch(e){}
    try{temp*=eventMult()}catch(e){}
    try{temp*=maintenanceMult()}catch(e){}
    try{temp*=policyProductionMult()}catch(e){}
    return clamp(core*temp,.05,permanentCap*1.65);
  };

  /* Core cash-per-kWh sale formula. Typical 11 GWh sale: roughly $2M-$5M. */
  if(typeof safeSaleMultiplier==="function")safeSaleMultiplier=function(){
    let grid=1,market=1;
    try{grid=gridSaleMult()}catch(e){}
    try{market=marketSaleMult()}catch(e){}
    let quality=1+.45*(grid-1)+.55*(market-1);
    if(g.event?.type==="surge")quality+=.15;
    if(g.activeContract)quality+=Math.min(.20,Math.max(0,(n(g.activeContract.rate||1)-1)*.08));
    return clamp(.24*quality,.16,.48);
  };
  if(typeof netValuePerSecond==="function")netValuePerSecond=function(){
    let sale=.24;try{sale=safeSaleMultiplier()}catch(e){}
    return Math.max(0,output()*sale-fuelCostPerSecond());
  };

  /* Offline play stays useful but is not stronger than active play. */
  if(typeof offlineEfficiency==="function")offlineEfficiency=function(){
    const legacy=Math.min(.08,n(g.legacy?.offline)*.004);
    const base=g.offlineOperationsUnlocked?.35:.20;
    return Math.min(g.offlineOperationsUnlocked?.43:.28,base+legacy);
  };

  /* Contract and mission cash rewards were another major faucet. */
  try{CONTRACTS.forEach(c=>{c.reward=Math.max(50,Math.round(n(c.reward)*.30));c.rate=1+(Math.max(0,n(c.rate)-1)*.40)})}catch(e){}
  try{MISSIONS.forEach(m=>{m.reward=Math.max(25,Math.round(n(m.reward)*.30))})}catch(e){}
  if(!g.economyV5Migrated){
    if(g.activeContract){g.activeContract.reward=Math.max(50,Math.round(n(g.activeContract.reward)*.30));g.activeContract.rate=1+(Math.max(0,n(g.activeContract.rate)-1)*.40)}
    g.economyV5Migrated=true;try{if(typeof saveGame==="function")saveGame()}catch(e){}
  }

  /* Keep long-game cost growth meaningful after reducing income. */
  if(typeof plantCost==="function")plantCost=function(p){
    const s=g.plants[p.id];if(!s.unlocked)return p.unlock;
    return p.unlock*.85*Math.pow(1.70,Math.max(1,n(s.level))-1);
  };
  if(typeof corporateCost==="function")corporateCost=function(up){return up.base*Math.pow(1.94,n(g.corporate?.[up.id]))};
  if(typeof staffCost==="function"){
    const v5StaffBase=staffCost;
    staffCost=function(id){
      const t=STAFF_TYPES.find(x=>x.id===id);let c=t?t.base*Math.pow(1.84,n(g.staff?.[id])):v5StaffBase(id);
      if(n(g.store6RecruitmentVouchers)>0)c*=.5;if(g.foundersBundleUnlocked)c*=.95;return c;
    };
  }
  if(typeof researchCost==="function"){
    const v5ResearchBase=researchCost;
    researchCost=function(id){
      const r=RESEARCH.find(x=>x.id===id);let c=r?r.base*Math.pow(2.08,n(g.research?.[id])):v5ResearchBase(id);
      if(n(g.store6ResearchVouchers)>0)c*=.5;if(g.foundersBundleUnlocked)c*=.95;return c;
    };
  }

  /* -------- CLEAR SALE FEEDBACK -------- */
  function exactMoney(v){return "$"+Math.max(0,Math.round(n(v))).toLocaleString();}
  function exactRatePerMWh(cash,kwh){return kwh>0?"$"+Math.round(cash/(kwh/1000)).toLocaleString()+" / MWh":"";}
  function injectReceiptStyles(){
    if(document.getElementById("pptV5ReceiptStyle"))return;
    const s=document.createElement("style");s.id="pptV5ReceiptStyle";s.textContent=`
      #pptV5SaleReceipt{position:fixed;left:50%;top:22%;transform:translate(-50%,-12px) scale(.96);z-index:10050;width:min(430px,calc(100vw - 28px));padding:18px 20px;border-radius:18px;background:rgba(7,22,32,.97);border:1px solid rgba(77,218,153,.65);box-shadow:0 24px 70px rgba(0,0,0,.5),0 0 34px rgba(49,211,139,.15);text-align:center;opacity:0;pointer-events:none;transition:.2s ease;color:#eaf8ff}
      #pptV5SaleReceipt.show{opacity:1;transform:translate(-50%,0) scale(1)}
      #pptV5SaleReceipt small{display:block;color:#8fb7c8;font-size:11px;font-weight:900;letter-spacing:1.6px;margin-bottom:6px}
      #pptV5SaleReceipt .energy{font-size:18px;font-weight:800;color:#d8edf7}
      #pptV5SaleReceipt .earned{font-size:34px;line-height:1.05;font-weight:1000;color:#55e49d;margin:7px 0}
      #pptV5SaleReceipt .rate{font-size:12px;color:#9fc2d0}
      #pptV5LastSale{position:fixed;right:12px;top:92px;z-index:8500;max-width:270px;padding:8px 11px;border-radius:11px;background:rgba(6,24,34,.92);border:1px solid rgba(84,220,157,.35);font-size:11px;color:#b7d4df;box-shadow:0 8px 26px rgba(0,0,0,.25);pointer-events:none}
      #pptV5LastSale b{color:#55e49d;font-size:13px}
      @media(max-width:760px){#pptV5SaleReceipt{top:18%}#pptV5LastSale{top:100px;right:8px;max-width:220px;font-size:10px}}
    `;document.head.appendChild(s);
  }
  function showSaleReceipt(label,kwh,cash){
    if(!(kwh>0&&cash>0))return;injectReceiptStyles();
    let el=document.getElementById("pptV5SaleReceipt");if(!el){el=document.createElement("div");el.id="pptV5SaleReceipt";document.body.appendChild(el)}
    const eText=typeof energy==="function"?energy(kwh):Math.round(kwh).toLocaleString()+" kWh";
    el.innerHTML=`<small>⚡ ${String(label||"POWER SOLD").toUpperCase()}</small><div class="energy">${eText}</div><div class="earned">+${exactMoney(cash)}</div><div class="rate">${exactRatePerMWh(cash,kwh)}</div>`;
    clearTimeout(window.__pptV5SaleReceiptTimer);el.classList.remove("show");requestAnimationFrame(()=>el.classList.add("show"));
    window.__pptV5SaleReceiptTimer=setTimeout(()=>el.classList.remove("show"),4200);
    let last=document.getElementById("pptV5LastSale");if(!last){last=document.createElement("div");last.id="pptV5LastSale";document.body.appendChild(last)}
    last.innerHTML=`LAST SALE • ${eText}<br><b>+${exactMoney(cash)}</b>`;
    g.lastSaleV5={kwh,cash,at:now(),label:String(label||"Power sold")};
  }

  /* Preserve Build 6 tutorial wrappers while adding V5 sale math/receipts. */
  if(typeof sellPower==="function"){
    const v4SellPower=sellPower;
    sellPower=function(){
      const beforeStored=n(g.stored),beforeCash=n(g.cash),beforeSold=n(g.sold);
      const r=v4SellPower.apply(this,arguments);
      const amount=Math.max(0,beforeStored-n(g.stored));
      const cash=Math.max(0,n(g.cash)-beforeCash);
      if(amount>0&&cash>0&&n(g.sold)>beforeSold)showSaleReceipt("POWER SOLD",amount,cash);
      return r;
    };
  }

  /* Dispatch keeps the First Shift wrapper, but its legacy sale calculation is
     temporarily fed a V5-equivalent rate so it cannot bypass the new economy. */
  if(typeof dispatchPower==="function"){
    const v4DispatchPower=dispatchPower;
    dispatchPower=function(){
      const beforeStored=n(g.stored),beforeCash=n(g.cash),beforeSold=n(g.sold);
      const oldGrid=gridSaleMult,oldMarket=marketSaleMult;
      const aiBonus=1.08+n(g.research?.gridAI)*.03;
      const target=clamp(safeSaleMultiplier()*1.05,.16,.50);
      try{
        gridSaleMult=function(){return target/(.85*Math.max(1,aiBonus))};
        marketSaleMult=function(){return 1};
        const r=v4DispatchPower.apply(this,arguments);
        const amount=Math.max(0,beforeStored-n(g.stored)),cash=Math.max(0,n(g.cash)-beforeCash);
        if(amount>0&&cash>0&&n(g.sold)>beforeSold)showSaleReceipt("GRID DISPATCH",amount,cash);
        return r;
      }finally{gridSaleMult=oldGrid;marketSaleMult=oldMarket}
    };
  }

  if(typeof dischargeBattery==="function"){
    const v4DischargeBattery=dischargeBattery;
    dischargeBattery=function(){
      const beforeStored=n(g.battery?.stored),beforeCash=n(g.cash),beforeSold=n(g.sold);
      const oldGrid=gridSaleMult,oldMarket=marketSaleMult;
      const target=clamp(safeSaleMultiplier()*1.08,.16,.52);
      try{
        gridSaleMult=function(){return target/(.85*1.12)};
        marketSaleMult=function(){return 1};
        const r=v4DischargeBattery.apply(this,arguments);
        const amount=Math.max(0,beforeStored-n(g.battery?.stored)),cash=Math.max(0,n(g.cash)-beforeCash);
        if(amount>0&&cash>0&&n(g.sold)>beforeSold)showSaleReceipt("BATTERY SALE",amount,cash);
        return r;
      }finally{gridSaleMult=oldGrid;marketSaleMult=oldMarket}
    };
  }

  /* Rework free rewards so late-game output cannot turn them into jackpots. */
  if(typeof dailyReward==="function")dailyReward=function(){
    const stamp=typeof dayStamp==="function"?dayStamp():new Date().toDateString(),last=g.dailyStreak?.lastClaimDay;
    if(last===stamp){if(typeof toast==="function")toast("Daily supply drop already claimed.");return}
    let count=n(g.dailyStreak?.count);if(last){const a=new Date(last+"T12:00:00"),b=new Date(stamp+"T12:00:00"),days=Math.round((b-a)/86400000);count=days===1?Math.min(7,count+1):1}else count=1;
    const mult=[1,1.2,1.4,1.7,2,2.5,3][count-1]||1;
    const base=Math.max(250,Math.min(25000000,400+Math.sqrt(Math.max(0,output()))*3000));
    const reward=Math.round(base*mult);recordEarnedCash(reward);g.lastDaily=now();g.dailyStreak={count,lastClaimDay:stamp};
    if(typeof addXP==="function")addXP(5+count*2);if(typeof addLog==="function")addLog("Day "+count+" supply drop received: "+money(reward));if(typeof saveGame==="function")saveGame();if(typeof render==="function")render();if(typeof toast==="function")toast("🎁 Day "+count+" reward: "+money(reward));
  };

  if(typeof createEvent==="function")createEvent=function(){
    if(g.event||now()<n(g.eventCooldown)||output()<=0||Math.random()>.03)return;
    const r=Math.random();
    if(r<.4)g.event={type:"breakdown",title:"⚠ Turbine Breakdown",text:"Automatic production reduced until repaired.",cost:Math.max(400,Math.sqrt(output())*1200)};
    else if(r<.72)g.event={type:"surge",title:"📈 Demand Surge",text:"Grid sale prices are temporarily stronger.",expires:now()+60000};
    else g.event={type:"inspection",title:"🦺 Safety Inspection",text:"Complete the inspection for a controlled cash and XP bonus.",reward:Math.max(150,Math.min(5000000,Math.sqrt(output())*2500))};
    g.eventCooldown=now()+90000;if(typeof addLog==="function")addLog(g.event.title);if(typeof render==="function")render();
  };

  /* Existing consumable IAPs: scale with the new economy and update boost wording. */
  if(typeof applyConsumablePurchase==="function")applyConsumablePurchase=function(productID,transactionID){
    if(!Array.isArray(g.processedStoreTransactions))g.processedStoreTransactions=[];
    if(transactionID&&g.processedStoreTransactions.includes(transactionID))return false;
    if(productID===PPT_STOREKIT.products.turboGrid){
      g.boostUntil=Math.max(n(g.boostUntil),now())+60*60*1000;addLog("Turbo Grid Pack applied: +60 minutes of +35% generation.");
    }else if(productID===PPT_STOREKIT.products.maintenanceCrate){
      g.maintenance=100;PLANTS.forEach(p=>{if(g.plants?.[p.id]?.unlocked)g.plants[p.id].condition=100});g.boostUntil=Math.max(n(g.boostUntil),now())+15*60*1000;addLog("Maintenance Crate applied: fleet fully repaired + 15 minutes of +35% output.");
    }else if(productID===PPT_STOREKIT.products.capitalInjection){
      let cash=Math.max(500,netValuePerSecond()*900);try{const nextPlant=PLANTS.find(p=>!g.plants?.[p.id]?.unlocked);if(nextPlant)cash=Math.min(cash,Math.max(500,nextPlant.unlock*.12))}catch(e){}
      cash=Math.max(500,Math.round(cash));recordEarnedCash(cash);addLog("Capital Injection received: "+money(cash)+".");
    }else return false;
    if(transactionID){g.processedStoreTransactions.push(transactionID);g.processedStoreTransactions=g.processedStoreTransactions.slice(-120)}
    saveGame();render();if(typeof feedback==="function")feedback("big");return true;
  };
  if(typeof applyRewardedAdReward==="function")applyRewardedAdReward=function(type){
    if(type!=="boost10")return;g.boostUntil=Math.max(n(g.boostUntil),now())+10*60*1000;g.rewardedAdsWatched=n(g.rewardedAdsWatched)+1;
    if(typeof addLog==="function")addLog("Rewarded ad completed: +10 minutes of +35% grid output.");saveGame();render();if(typeof toast==="function")toast("⚡ +35% output added for 10 minutes!");
  };
  if(typeof activateBoost==="function")activateBoost=function(){
    if(now()<n(g.boostUntil)){if(typeof toast==="function")toast("Grid boost is already active.");return}g.boostUntil=now()+10*60*1000;if(typeof addLog==="function")addLog("+35% grid output boost activated.");saveGame();render();
  };

  /* Store/UI copy must match the actual V5 math. */
  function updateEconomyCopy(){
    try{
      const c=CORPORATE.find(x=>x.id==="eff");if(c)c.desc="+2% production efficiency per level (controlled cap)";
      const cg=CORPORATE.find(x=>x.id==="grid");if(cg)cg.desc="+1.2% grid sale quality per level (controlled cap)";
      const ro=RESEARCH.find(x=>x.id==="automation");if(ro)ro.desc="+1.8% production per level • unlocks standard Auto Sell";
      const rf=RESEARCH.find(x=>x.id==="forecast");if(rf)rf.desc="+1% sale quality per level";
      const rn=RESEARCH.find(x=>x.id==="advancedNuclear");if(rn)rn.desc="+4% total production per level";
      const rfu=RESEARCH.find(x=>x.id==="fusionControl");if(rfu)rfu.desc="+7.5% total production per level";
      const rq=RESEARCH.find(x=>x.id==="quantumGrid");if(rq)rq.desc="+2% sale quality and +5% production per level";
      const pm=POLICIES.find(x=>x.id==="maximum");if(pm)pm.desc="+8% output, faster wear.";
      const pr=POLICIES.find(x=>x.id==="reliability");if(pr)pr.desc="-5% output, slower wear and fewer trips.";
    }catch(e){}
    document.querySelectorAll(".b6-product").forEach(card=>{
      const title=card.querySelector("h4")?.textContent?.trim(),p=card.querySelector("p");if(!p)return;
      if(title==="Executive License")p.textContent="Permanent +8% generation and +5% grid sale quality.";
      else if(title==="Founder's Energy Bundle")p.textContent="Permanent Founder status • +3% output • +3% sale quality • 5% staff & research discount.";
      else if(title==="Turbo Grid Pack")p.textContent="60 minutes of +35% generation.";
      else if(title==="Maintenance Crate")p.textContent="Fully repairs the fleet + 15 minutes of +35% output.";
      else if(title==="Market Intelligence Pack")p.textContent="Improves electricity sale quality for 30 minutes without bypassing the economy cap.";
      else if(title==="Grid Reserve Pack")p.textContent="Adds a progression-scaled reserve of stored power.";
      else if(title==="Regional Expansion Fund")p.textContent="Progression-scaled expansion capital + 25 company reputation.";
    });
    document.querySelectorAll(".ad-reward-item small").forEach(x=>x.textContent="Optional rewarded ad • +35% output for 10 minutes");
  }

  /* Show last manual sale after reload without spamming a modal. */
  function restoreLastSaleChip(){
    const s=g.lastSaleV5;if(!s||!(n(s.cash)>0)||now()-n(s.at)>86400000)return;injectReceiptStyles();
    let last=document.getElementById("pptV5LastSale");if(!last){last=document.createElement("div");last.id="pptV5LastSale";document.body.appendChild(last)}
    const eText=typeof energy==="function"?energy(n(s.kwh)):Math.round(n(s.kwh)).toLocaleString()+" kWh";
    last.innerHTML=`LAST SALE • ${eText}<br><b>+${exactMoney(s.cash)}</b>`;
  }

  /* Diagnostics for balancing/testing in Safari console. */
  window.pptEconomyV5Diagnostics=function(){
    const perKwh=safeSaleMultiplier(),out=output(),perMin=Math.max(0,out*60*perKwh-fuelCostPerSecond()*60);
    const report={version:"Build 6 Economy V5",outputKWhPerSecond:out,effectiveDollarPerKWh:perKwh,effectiveDollarPerMWh:perKwh*1000,estimatedNetCashPerMinute:perMin,productionMultiplier:totalMult(),gridSaleQuality:gridSaleMult(),marketSaleQuality:marketSaleMult(),regionMultiplier:regionMult(),offlineEfficiency:offlineEfficiency()};
    console.table(report);return report;
  };

  injectReceiptStyles();updateEconomyCopy();restoreLastSaleChip();
  if(typeof render==="function"){
    const v5Render=render;render=function(){const r=v5Render();updateEconomyCopy();restoreLastSaleChip();return r};
  }
  setTimeout(()=>{updateEconomyCopy();restoreLastSaleChip()},250);
  console.info("Power Plant Tycoon • Build 6 Economy V5 active");
})();
