/* POWER PLANT TYCOON BUILD 6 V2 — 16 PRODUCT STORE + AUTO SELL LICENSE */
(function(){
if(window.__pptB6Store16)return;window.__pptB6Store16=true;

const NEW={
  hqExecutiveTheme:"com.calascointeractive.powerplanttycoon.hqexecutivetheme",
  offlineOperations:"com.calascointeractive.powerplanttycoon.offlineoperations",
  marketIntelligence:"com.calascointeractive.powerplanttycoon.marketintelligence",
  emergencyEngineering:"com.calascointeractive.powerplanttycoon.emergencyengineering",
  rdAccelerator:"com.calascointeractive.powerplanttycoon.rdaccelerator",
  recruitmentDrive:"com.calascointeractive.powerplanttycoon.recruitmentdrive",
  gridReserve:"com.calascointeractive.powerplanttycoon.gridreserve",
  regionalExpansion:"com.calascointeractive.powerplanttycoon.regionalexpansion",
  foundersBundle:"com.calascointeractive.powerplanttycoon.foundersbundle",
  autoSellLicense:"com.calascointeractive.powerplanttycoon.autosell"
};
const PERMANENT=["hqExecutiveTheme","offlineOperations","foundersBundle","autoSellLicense"];
const CONSUMABLE=["marketIntelligence","emergencyEngineering","rdAccelerator","recruitmentDrive","gridReserve","regionalExpansion"];

function ensure(){
  if(typeof g==="undefined"||!g)return;
  if(g.hqExecutiveThemeUnlocked==null)g.hqExecutiveThemeUnlocked=false;
  if(g.offlineOperationsUnlocked==null)g.offlineOperationsUnlocked=false;
  if(g.foundersBundleUnlocked==null)g.foundersBundleUnlocked=false;
  if(g.autoSellLicenseUnlocked==null)g.autoSellLicenseUnlocked=false;
  if(!["immediate","high","reserve"].includes(g.autoSellMode))g.autoSellMode="high";
  if(g.marketIntelUntil==null)g.marketIntelUntil=0;
  if(g.engineeringShieldUntil==null)g.engineeringShieldUntil=0;
  if(g.store6ResearchVouchers==null)g.store6ResearchVouchers=0;
  if(g.store6RecruitmentVouchers==null)g.store6RecruitmentVouchers=0;
  if(!Array.isArray(g.processedStoreTransactions))g.processedStoreTransactions=[];
}
ensure();

if(typeof PPT_STOREKIT!=="undefined"){
  Object.assign(PPT_STOREKIT.products,NEW);
  PERMANENT.forEach(k=>{if(!PPT_STOREKIT.permanentKeys.includes(k))PPT_STOREKIT.permanentKeys.push(k)});
  CONSUMABLE.forEach(k=>{if(!PPT_STOREKIT.consumableKeys.includes(k))PPT_STOREKIT.consumableKeys.push(k)});
}

function flag(k){
  return k==="hqExecutiveTheme"?!!g.hqExecutiveThemeUnlocked:
         k==="offlineOperations"?!!g.offlineOperationsUnlocked:
         k==="foundersBundle"?!!g.foundersBundleUnlocked:
         k==="autoSellLicense"?!!g.autoSellLicenseUnlocked:false;
}
function setFlag(k,v){
  if(k==="hqExecutiveTheme")g.hqExecutiveThemeUnlocked=!!v;
  if(k==="offlineOperations")g.offlineOperationsUnlocked=!!v;
  if(k==="foundersBundle")g.foundersBundleUnlocked=!!v;
  if(k==="autoSellLicense")g.autoSellLicenseUnlocked=!!v;
}
function seen(tx){return !!(tx&&g.processedStoreTransactions.includes(tx))}
function remember(tx){
  if(tx&&!seen(tx))g.processedStoreTransactions.push(tx);
  g.processedStoreTransactions=g.processedStoreTransactions.slice(-120);
}
function cashAdd(v){
  if(typeof recordEarnedCash==="function")recordEarnedCash(v);
  else{g.cash=(g.cash||0)+v;g.lifetimeCash=(g.lifetimeCash||0)+v}
}

function grant(k,tx){
  ensure();if(seen(tx))return false;
  const now=Date.now();
  if(k==="marketIntelligence"){
    g.marketIntelUntil=Math.max(g.marketIntelUntil||0,now)+1800000;
    if(typeof addLog==="function")addLog("Market Intelligence active: +25% sale value for 30 minutes.");
  }else if(k==="emergencyEngineering"){
    g.maintenance=100;
    if(typeof PLANTS!=="undefined")PLANTS.forEach(p=>{if(g.plants?.[p.id]?.unlocked)g.plants[p.id].condition=100});
    g.engineeringShieldUntil=Math.max(g.engineeringShieldUntil||0,now)+3600000;
    if(typeof addLog==="function")addLog("Emergency Engineering Team deployed.");
  }else if(k==="rdAccelerator"){
    g.store6ResearchVouchers++;
    if(typeof addLog==="function")addLog("R&D Accelerator delivered: next research upgrade is 50% off.");
  }else if(k==="recruitmentDrive"){
    g.store6RecruitmentVouchers++;
    if(typeof addLog==="function")addLog("Recruitment Drive delivered: next staff hire is 50% off.");
  }else if(k==="gridReserve"){
    const v=Math.max(10000,(typeof output==="function"?output():0)*1800,(g.generated||0)*.01);
    g.stored=(g.stored||0)+v;
    if(typeof addLog==="function")addLog("Grid Reserve Pack delivered.");
  }else if(k==="regionalExpansion"){
    let v=Math.max(250000,(typeof netValuePerSecond==="function"?netValuePerSecond():0)*1200,(typeof output==="function"?output():0)*600);
    try{
      const next=(typeof PLANTS!=="undefined"?PLANTS:[]).find(p=>!g.plants?.[p.id]?.unlocked);
      if(next)v=Math.min(v,Math.max(250000,next.unlock*.20));
    }catch(e){}
    cashAdd(v);g.reputation=(g.reputation||0)+25;
    if(typeof addLog==="function")addLog("Regional Expansion Fund received: controlled expansion capital + 25 reputation.");
  }else return false;
  remember(tx);
  if(typeof saveGame==="function")saveGame();
  if(typeof render==="function")render();
  if(typeof feedback==="function")feedback("big");
  return true;
}

function visuals(){
  if(!document.body)return;
  document.body.classList.toggle("hq-executive-theme",!!g.hqExecutiveThemeUnlocked);
  document.body.classList.toggle("hq-founder",!!g.foundersBundleUnlocked);
}

window.purchaseB6Product=function(k){
  ensure();if(!NEW[k])return;
  if(PERMANENT.includes(k)&&flag(k)){if(typeof toast==="function")toast("Already owned.");return}
  if(typeof nativeStoreKitAvailable==="function"&&nativeStoreKitAvailable()){
    if(typeof setStoreKitStatus==="function")setStoreKitStatus("Opening Apple purchase…");
    postStoreKit("purchase",NEW[k]);return;
  }
  const tx="TEST-B6-"+k+"-"+Date.now();
  if(PERMANENT.includes(k)){
    setFlag(k,true);
    if(k==="autoSellLicense")g.autoSellMode="high";
    if(typeof saveGame==="function")saveGame();
    visuals();renderB6Store();
    if(typeof toast==="function")toast("✓ TEST permanent purchase unlocked");
  }else if(grant(k,tx)&&typeof toast==="function")toast("✓ TEST pack delivered");
};

const oldResult=window.powerPlantStoreKitResult;
window.powerPlantStoreKitResult=function(p){
  if(typeof oldResult==="function")oldResult(p);
  try{
    if(!p||typeof p!=="object")return;
    if(Array.isArray(p.ownedProductIDs)&&typeof nativeStoreKitAvailable==="function"&&nativeStoreKitAvailable()){
      PERMANENT.forEach(k=>setFlag(k,p.ownedProductIDs.includes(NEW[k])));
      if(!g.autoSellLicenseUnlocked&&(g.research?.automation||0)<1)g.autoSell=false;
      if(typeof saveGame==="function")saveGame();
      visuals();
    }
    if(p.status==="purchased"){
      const k=Object.keys(NEW).find(x=>NEW[x]===p.productID);
      if(k){
        if(PERMANENT.includes(k)){
          setFlag(k,true);
          if(k==="autoSellLicense")g.autoSellMode="high";
          if(typeof saveGame==="function")saveGame();
          visuals();
          if(typeof toast==="function")toast(k==="autoSellLicense"?"✓ Auto Sell License unlocked":"✓ Permanent upgrade unlocked");
        }else if(grant(k,p.transactionID)&&typeof toast==="function")toast("✓ Operations pack delivered");
      }
    }
    renderB6Store();
  }catch(e){console.warn("Build 6 StoreKit extension error",e)}
};

if(typeof offlineEfficiency==="function"){
  offlineEfficiency=function(){
    const legacy=Math.min(.10,Math.max(0,g.legacy?.offline||0)*.005);
    const base=g.offlineOperationsUnlocked?.40:.25;
    return Math.min(g.offlineOperationsUnlocked?.50:.35,base+legacy);
  };
}
if(typeof marketSaleMult==="function"){
  const f=marketSaleMult;
  marketSaleMult=function(){
    let m=f();
    if(Date.now()<(g.marketIntelUntil||0))m*=1.25;
    if(g.foundersBundleUnlocked)m*=1.05;
    return m;
  };
}
if(typeof totalMult==="function"){
  const f=totalMult;
  totalMult=function(){return f()*(g.foundersBundleUnlocked?1.05:1)};
}
if(typeof staffCost==="function"){
  const f=staffCost;
  staffCost=function(id){
    let c=f(id);
    if((g.store6RecruitmentVouchers||0)>0)c*=.5;
    if(g.foundersBundleUnlocked)c*=.95;
    return c;
  };
}
if(typeof researchCost==="function"){
  const f=researchCost;
  researchCost=function(id){
    let c=f(id);
    if((g.store6ResearchVouchers||0)>0)c*=.5;
    if(g.foundersBundleUnlocked)c*=.95;
    return c;
  };
}
if(typeof hireStaff==="function"){
  const f=hireStaff;
  hireStaff=function(id){
    const before=g.staff?.[id]||0,v=g.store6RecruitmentVouchers||0,r=f(id);
    if(v>0&&(g.staff?.[id]||0)>before){g.store6RecruitmentVouchers=v-1;saveGame()}
    return r;
  };
}
if(typeof buyResearch==="function"){
  const f=buyResearch;
  buyResearch=function(id){
    const before=g.research?.[id]||0,v=g.store6ResearchVouchers||0,r=f(id);
    if(v>0&&(g.research?.[id]||0)>before){g.store6ResearchVouchers=v-1;saveGame()}
    return r;
  };
}

/* AUTO SELL V2
   Free path: Advanced Automation research unlocks standard High Price Auto Sell.
   Purchase path: Auto Sell License unlocks immediately + Immediate / High Price / Reserve modes. */
function autoSellModeLabel(){
  return g.autoSellMode==="immediate"?"Immediate":
         g.autoSellMode==="reserve"?"Reserve 25%":"High Price";
}

if(typeof toggleAutoSell==="function"){
  toggleAutoSell=function(){
    ensure();
    const earned=(g.research?.automation||0)>=1;
    if(!g.autoSellLicenseUnlocked&&!earned){
      if(typeof toast==="function")toast("Unlock Auto Sell License or research Advanced Automation first.");
      return;
    }
    if(!g.autoSellLicenseUnlocked)g.autoSellMode="high";
    g.autoSell=!g.autoSell;
    if(typeof saveGame==="function")saveGame();
    if(typeof render==="function")render();
    renderB6Store();
    if(typeof toast==="function")toast("Auto Sell "+(g.autoSell?"enabled":"disabled")+(g.autoSell?" • "+autoSellModeLabel():""));
  };
}

window.setAutoSellMode=function(mode){
  ensure();
  if(!g.autoSellLicenseUnlocked){
    if(typeof toast==="function")toast("Advanced Auto Sell modes require the Auto Sell License.");
    return;
  }
  if(!["immediate","high","reserve"].includes(mode))return;
  g.autoSellMode=mode;
  if(typeof saveGame==="function")saveGame();
  if(typeof render==="function")render();
  renderB6Store();
  if(typeof toast==="function")toast("Auto Sell mode: "+autoSellModeLabel());
};

if(typeof autoSellTick==="function"){
  autoSellTick=function(){
    ensure();
    if(!g.autoSell||g.stored<=0)return;
    const earned=(g.research?.automation||0)>=1;
    if(!g.autoSellLicenseUnlocked&&!earned){g.autoSell=false;return}

    const mode=g.autoSellLicenseUnlocked?g.autoSellMode:"high";
    const threshold=Math.max(.95,1.05-Math.min(.10,Math.max(0,g.research?.gridAI||0)*.01));
    if(mode==="high"&&Number(g.market?.price||1)<threshold&&g.policy!=="market")return;

    let amount=Number(g.stored||0);
    if(mode==="reserve"){
      const reserve=Math.max((typeof output==="function"?output():0)*30,amount*.25);
      amount=Math.max(0,amount-reserve);
    }
    if(amount<=0)return;

    let mult=1;
    try{mult=typeof safeSaleMultiplier==="function"?safeSaleMultiplier():gridSaleMult()*marketSaleMult()}catch(e){}
    mult=Math.max(.25,Math.min(5,Number(mult)||1));
    const cash=amount*mult;
    g.stored=Math.max(0,g.stored-amount);
    if(typeof recordEarnedCash==="function")recordEarnedCash(cash);else cashAdd(cash);
    g.sold=Math.min(1e300,(g.sold||0)+amount);
  };
}

function ensureAutoSellControls(){
  const b=document.getElementById("autoSellBtn");
  if(!b)return;
  let box=document.getElementById("b6AutoSellModes");
  if(!box){
    box=document.createElement("div");
    box.id="b6AutoSellModes";
    box.className="b6-autosell-modes";
    b.insertAdjacentElement("afterend",box);
  }
  if(g.autoSellLicenseUnlocked){
    box.innerHTML=
      '<small>AUTO SELL MODE • LICENSE ACTIVE</small>'+
      '<button class="b6-autosell-mode '+(g.autoSellMode==="immediate"?"active":"")+'" onclick="setAutoSellMode(\'immediate\')">IMMEDIATE</button>'+
      '<button class="b6-autosell-mode '+(g.autoSellMode==="high"?"active":"")+'" onclick="setAutoSellMode(\'high\')">HIGH PRICE</button>'+
      '<button class="b6-autosell-mode '+(g.autoSellMode==="reserve"?"active":"")+'" onclick="setAutoSellMode(\'reserve\')">RESERVE</button>'+
      '<div class="b6-autosell-note">Immediate sells available power continuously. High Price waits for favorable market conditions. Reserve keeps roughly 25% / 30 seconds of output on hand.</div>';
  }else{
    const earned=(g.research?.automation||0)>=1;
    box.innerHTML=
      '<small>'+(earned?'STANDARD AUTO SELL • HIGH PRICE MODE':'AUTO SELL LOCKED')+'</small>'+
      '<div class="b6-autosell-note">'+
      (earned?'Advanced Automation research unlocked standard market-aware Auto Sell. The License adds Immediate and Reserve modes.':'Buy the Auto Sell License for immediate access, or earn standard Auto Sell through Advanced Automation research.')+
      '</div>';
  }
  b.textContent="AUTO SELL: "+(g.autoSell?"ON":"OFF");
  b.className="btn "+(g.autoSell?"green":"dark");
}

function renderB6Store(){
  if(typeof g==="undefined"||!g)return;
  ensure();visuals();
  Object.keys(NEW).forEach(k=>{
    const b=document.getElementById("b6Buy-"+k);
    if(!b)return;
    const native=typeof nativeStoreKitAvailable==="function"&&nativeStoreKitAvailable();
    const price=(typeof PPT_STOREKIT!=="undefined"&&PPT_STOREKIT.prices[NEW[k]])||"BUY";
    if(PERMANENT.includes(k)){
      const o=flag(k);
      b.disabled=o;
      b.textContent=o?"OWNED":(native?price:"TEST BUY");
    }else{
      b.disabled=false;
      b.textContent=native?price:"TEST BUY";
    }
  });
  const s=document.getElementById("storeKitStatus");
  if(s)s.textContent=(typeof nativeStoreKitAvailable==="function"&&nativeStoreKitAvailable())?"Apple StoreKit connected • 16-product catalog":"Browser test store • 16-product catalog";
  ensureAutoSellControls();
}

window.renderB6Store=renderB6Store;
if(typeof render==="function"){
  const f=render;
  render=function(){const r=f();renderB6Store();return r};
}
setInterval(()=>{
  if(typeof g==="undefined"||!g||Date.now()>=(g.engineeringShieldUntil||0))return;
  g.maintenance=Math.max(95,Number(g.maintenance||100));
  if(typeof PLANTS!=="undefined")PLANTS.forEach(p=>{const s=g.plants?.[p.id];if(s?.unlocked)s.condition=Math.max(90,Number(s.condition||100))});
},5000);

renderB6Store();
if(typeof requestStoreKitStatus==="function")setTimeout(requestStoreKitStatus,250);
})();
