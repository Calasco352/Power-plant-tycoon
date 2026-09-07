
const PLANTS=[
{id:"diesel",icon:"⛽",name:"Diesel Generator",unlock:60,base:1.5,fuel:.08,reliability:98,scene:true,thumb:"diesel",era:"RIVERBEND"},
{id:"steam",icon:"🌀",name:"Steam Turbine",unlock:400,base:6,fuel:.18,reliability:95,scene:true,thumb:"steam",era:"RIVERBEND"},
{id:"gas",icon:"🔥",name:"Gas Turbine",unlock:2500,base:22,fuel:.55,reliability:96,scene:true,thumb:"gas",era:"RIVERBEND"},
{id:"solar",icon:"☀️",name:"Solar Farm",unlock:12000,base:80,fuel:0,reliability:99,scene:true,thumb:"solar",era:"RIVERBEND"},
{id:"nuclear",icon:"☢️",name:"Nuclear Plant",unlock:75000,base:320,fuel:2.1,reliability:93,scene:true,thumb:"nuclear",era:"RIVERBEND"},
{id:"offshore",icon:"🌬️",name:"Offshore Wind Array",unlock:350000,base:1600,fuel:0,reliability:97,scene:false,thumb:"solar",era:"REGIONAL"},
{id:"biomass",icon:"🌿",name:"Biomass CHP Campus",unlock:900000,base:3400,fuel:.4,reliability:97,scene:false,thumb:"steam",era:"REGIONAL"},
{id:"hydro",icon:"💧",name:"Pumped Hydro Complex",unlock:2500000,base:7200,fuel:.2,reliability:98,scene:false,thumb:"steam",era:"REGIONAL"},
{id:"tidal",icon:"🌊",name:"Tidal Power Basin",unlock:7500000,base:18500,fuel:0,reliability:98,scene:false,thumb:"solar",era:"NATIONAL"},
{id:"smr",icon:"⚛️",name:"SMR Reactor Campus",unlock:18000000,base:38000,fuel:18,reliability:97,scene:false,thumb:"nuclear",era:"NATIONAL"},
{id:"geothermal",icon:"🌋",name:"Deep Geothermal Field",unlock:85000000,base:145000,fuel:4,reliability:99,scene:false,thumb:"gas",era:"INTERCONNECT"},
{id:"hydrogen",icon:"💠",name:"Hydrogen Turbine Park",unlock:280000000,base:390000,fuel:35,reliability:96,scene:false,thumb:"gas",era:"CONTINENTAL"},
{id:"fusion",icon:"🔬",name:"Fusion Power Campus",unlock:1200000000,base:900000,fuel:95,reliability:96,scene:false,thumb:"nuclear",era:"CONTINENTAL"},
{id:"orbital",icon:"🛰️",name:"Orbital Solar Network",unlock:75000000000,base:8500000,fuel:0,reliability:99,scene:false,thumb:"solar",era:"GLOBAL"},
{id:"helium3",icon:"🌕",name:"Helium-3 Fusion Array",unlock:8000000000000,base:480000000,fuel:3500,reliability:97,scene:false,thumb:"nuclear",era:"LUNAR"},
{id:"solarswarm",icon:"✨",name:"Solar Swarm Receiver",unlock:1500000000000000,base:35000000000,fuel:0,reliability:99,scene:false,thumb:"solar",era:"STELLAR"}
 ];

// ===== BUILD 10 MAJOR UPGRADE SYSTEMS =====
const B10_LICENSES=[
  {id:"operator",name:"OPERATOR PERMIT",level:1,cash:0,bonus:1.00,icon:"🟦"},
  {id:"utility",name:"UTILITY LICENSE",level:5,cash:10000,bonus:1.03,icon:"🟩"},
  {id:"regional",name:"REGIONAL AUTHORITY",level:12,cash:250000,bonus:1.06,icon:"🟨"},
  {id:"national",name:"NATIONAL DISPATCH",level:25,cash:25000000,bonus:1.10,icon:"🟧"},
  {id:"interconnect",name:"INTERCONNECT CONTROL",level:40,cash:1000000000,bonus:1.15,icon:"🟪"},
  {id:"sovereign",name:"GRID SOVEREIGN",level:60,cash:1000000000000,bonus:1.22,icon:"💠"}
];
function currentB10License(){let cur=B10_LICENSES[0];B10_LICENSES.forEach(x=>{if((g?.operatorLevel||1)>=x.level&&(g?.lifetimeCash||0)>=x.cash)cur=x});return cur}
function nextB10License(){const cur=currentB10License();return B10_LICENSES[B10_LICENSES.indexOf(cur)+1]||null}
function b10LicenseMult(){return currentB10License().bonus}

// ===== APP STORE / STOREKIT + ADS BRIDGES =====
const PPT_STOREKIT={
  bridgeName:"powerPlantStoreKit",
  products:{
    autoGenerate:"com.calascointeractive.powerplanttycoon.autogenerate",
    removeAds:"com.calascointeractive.powerplanttycoon.removeads",
    executiveLicense:"com.calascointeractive.powerplanttycoon.executivelicense",
    turboGrid:"com.calascointeractive.powerplanttycoon.turbogrid",
    maintenanceCrate:"com.calascointeractive.powerplanttycoon.maintenancecrate",
    capitalInjection:"com.calascointeractive.powerplanttycoon.capitalinjection"
  },
  permanentKeys:["autoGenerate","removeAds","executiveLicense"],
  consumableKeys:["turboGrid","maintenanceCrate","capitalInjection"],
  prices:{}
};
const PPT_ADS={bridgeName:"powerPlantAds",ready:false};
function nativeStoreKitAvailable(){return !!(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers[PPT_STOREKIT.bridgeName])}
function nativeAdsAvailable(){return !!(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers[PPT_ADS.bridgeName])}
function postStoreKit(action,productID){if(!nativeStoreKitAvailable())return false;window.webkit.messageHandlers[PPT_STOREKIT.bridgeName].postMessage({action,productID:productID||null});return true}
function postAds(action,extra={}){if(!nativeAdsAvailable())return false;window.webkit.messageHandlers[PPT_ADS.bridgeName].postMessage(Object.assign({action},extra));return true}
function requestStoreKitStatus(){if(nativeStoreKitAvailable()){postStoreKit("status");postStoreKit("products")}}
function requestAdsStatus(){if(nativeAdsAvailable())postAds("status")}
function setStoreKitStatus(text){const el=document.getElementById("storeKitStatus");if(el)el.textContent=text}
function setAdStatus(text){const el=document.getElementById("adStatus");if(el)el.textContent=text}
function productPrice(key,fallback="BUY"){return PPT_STOREKIT.prices[PPT_STOREKIT.products[key]]||fallback}
function applyPermanentEntitlements(owned){
  if(!Array.isArray(owned))return;
  if(nativeStoreKitAvailable()){
    g.autoGenerateUnlocked=owned.includes(PPT_STOREKIT.products.autoGenerate);
    g.adsRemoved=owned.includes(PPT_STOREKIT.products.removeAds);
    g.executiveLicenseUnlocked=owned.includes(PPT_STOREKIT.products.executiveLicense);
    if(!g.autoGenerateUnlocked)g.autoGenerate=false;
    saveGame();
  }
}
function applyConsumablePurchase(productID,transactionID){
  if(!g.processedStoreTransactions)g.processedStoreTransactions=[];
  if(transactionID&&g.processedStoreTransactions.includes(transactionID))return false;
  if(productID===PPT_STOREKIT.products.turboGrid){
    g.boostUntil=Math.max(g.boostUntil||0,Date.now())+60*60*1000;
    addLog("Turbo Grid Pack applied: +60 minutes of 2× generation.");
  }else if(productID===PPT_STOREKIT.products.maintenanceCrate){
    g.maintenance=100;PLANTS.forEach(p=>{if(g.plants[p.id]?.unlocked)g.plants[p.id].condition=100});
    g.boostUntil=Math.max(g.boostUntil||0,Date.now())+15*60*1000;
    addLog("Maintenance Crate applied: fleet fully repaired + 15 minute boost.");
  }else if(productID===PPT_STOREKIT.products.capitalInjection){
    const cash=Math.max(25000,netValuePerSecond()*1800,output()*900);
    recordEarnedCash(cash);addLog("Capital Injection received: "+money(cash)+".");
  }else return false;
  if(transactionID){g.processedStoreTransactions.push(transactionID);g.processedStoreTransactions=g.processedStoreTransactions.slice(-80)}
  saveGame();render();feedback("big");return true;
}
window.powerPlantStoreKitResult=function(payload){
  try{
    if(!payload||typeof payload!=="object")return;
    if(payload.prices&&typeof payload.prices==="object")Object.assign(PPT_STOREKIT.prices,payload.prices);
    if(Array.isArray(payload.ownedProductIDs))applyPermanentEntitlements(payload.ownedProductIDs);
    if(payload.status==="purchased"){
      const id=payload.productID;
      if(id===PPT_STOREKIT.products.autoGenerate)completeAutoGeneratePurchase(true);
      else if(id===PPT_STOREKIT.products.removeAds)completeRemoveAdsPurchase(true);
      else if(id===PPT_STOREKIT.products.executiveLicense)completeExecutiveLicensePurchase(true);
      else if(applyConsumablePurchase(id,payload.transactionID))toast("✓ Operations pack delivered");
      else toast("✓ Purchase complete");
    }else if(payload.status==="restored"){
      const n=(payload.ownedProductIDs||[]).length;toast(n?"✓ Permanent purchases restored":"No restorable purchases found.");
    }else if(payload.status==="cancelled")toast("Purchase cancelled.");
    else if(payload.status==="pending")toast("Purchase pending approval.");
    else if(payload.status==="error")toast(payload.message||"App Store purchase error.");
    setStoreKitStatus(nativeStoreKitAvailable()?"Apple StoreKit connected.":"Browser test store active.");
    renderMonetizationUI();
  }catch(e){console.warn("StoreKit bridge result error",e)}
};
window.powerPlantAdsResult=function(payload){
  try{
    if(!payload||typeof payload!=="object")return;
    if(payload.status==="ready"){PPT_ADS.ready=true;setAdStatus("Google Mobile Ads test mode ready.")}
    else if(payload.status==="rewardEarned")applyRewardedAdReward(payload.rewardType||"boost10");
    else if(payload.status==="dismissed"){setAdStatus("Ad closed. Next test ad is preloading.")}
    else if(payload.status==="unavailable")setAdStatus(payload.message||"Ads SDK not connected yet.");
    else if(payload.status==="error")setAdStatus(payload.message||"Ad is not ready yet.");
    renderMonetizationUI();
  }catch(e){console.warn("Ads bridge result error",e)}
};
function applyRewardedAdReward(type){
  if(type!=="boost10")return;
  g.boostUntil=Math.max(g.boostUntil||0,Date.now())+10*60*1000;
  g.rewardedAdsWatched=(g.rewardedAdsWatched||0)+1;
  addLog("Rewarded ad completed: +10 minutes of 2× grid output.");saveGame();render();toast("⚡ 2× output added for 10 minutes!");
}
function watchRewardedAd(){
  if(nativeAdsAvailable()){setAdStatus("Loading rewarded ad…");postAds("showRewarded",{rewardType:"boost10"});return}
  applyRewardedAdReward("boost10");setAdStatus("Browser TEST AD completed instantly.");
}
function markInterstitialOpportunity(){
  if(!g.adState)g.adState={contractsSinceAd:0,lastInterstitial:0,pending:false};
  if(g.adsRemoved)return;
  g.adState.contractsSinceAd=(g.adState.contractsSinceAd||0)+1;
  if(g.adState.contractsSinceAd>=2)g.adState.pending=true;
}
function tryShowPendingInterstitial(){
  if(!nativeAdsAvailable()||g.adsRemoved||!g.adState?.pending)return;
  const now=Date.now();if(now-(g.adState.lastInterstitial||0)<180000)return;
  g.adState.pending=false;g.adState.contractsSinceAd=0;g.adState.lastInterstitial=now;saveGame();postAds("showInterstitial");
}
const REGIONS=[
{id:"riverbend",name:"Riverbend",cost:0,bonus:0,emoji:"🏭",desc:"Starter industrial grid."},
{id:"coast",name:"Coastal Grid",cost:15000,bonus:.10,emoji:"🌊",desc:"+10% production • coastal utility market."},
{id:"desert",name:"Sunbelt",cost:75000,bonus:.20,emoji:"🏜️",desc:"+20% production • high solar demand."},
{id:"metro",name:"Metroplex",cost:300000,bonus:.35,emoji:"🌆",desc:"+35% production • dense city load."},
{id:"mountain",name:"Mountain Relay",cost:900000,bonus:.45,emoji:"🏔️",desc:"+45% production • high-voltage mountain corridor."},
{id:"plains",name:"Great Plains Grid",cost:2500000,bonus:.60,emoji:"🌾",desc:"+60% production • continental transmission hub."},
{id:"atlantic",name:"Atlantic Energy Hub",cost:7000000,bonus:.80,emoji:"⚓",desc:"+80% production • industrial port and offshore load."},
{id:"national",name:"National Supergrid",cost:20000000,bonus:1.10,emoji:"🇺🇸",desc:"+110% production • nationwide balancing authority.",req:{contracts:5,reputation:40}},
{id:"eastern",name:"Eastern Interconnect",cost:65000000,bonus:1.50,emoji:"🔌",desc:"+150% production • synchronized transmission.",req:{lifetime:65000000,output:5000,contracts:8,reliability:85}},
{id:"western",name:"Western Interconnect",cost:250000000,bonus:2.00,emoji:"🏔️",desc:"+200% production • western balancing network.",req:{lifetime:250000000,output:18000,contracts:12,reputation:100}},
{id:"continental",name:"Continental HVDC Grid",cost:1000000000,bonus:3.00,emoji:"⚡",desc:"+300% production • continental backbone.",req:{lifetime:1000000000,output:75000,contracts:18,reliability:90}},
{id:"panamerican",name:"Pan-American Grid",cost:5000000000,bonus:4.50,emoji:"🌎",desc:"+450% production • cross-border bulk exchange.",req:{lifetime:5000000000,output:300000,contracts:25,reputation:250}},
{id:"global",name:"Global Energy Exchange",cost:25000000000,bonus:6.50,emoji:"🌐",desc:"+650% production • international dispatch network.",req:{lifetime:25000000000,output:1000000,contracts:35,projects:2}},
{id:"world",name:"World Supergrid",cost:100000000000,bonus:10.00,emoji:"🌍",desc:"+1000% production • planet-scale balancing authority.",req:{lifetime:100000000000,output:5000000,contracts:50,projects:4,reliability:94}},
{id:"orbitalgrid",name:"Orbital Power Relay",cost:1000000000000,bonus:15.00,emoji:"🛰️",desc:"+1500% production • space-based energy relay network.",req:{lifetime:1000000000000,output:25000000,contracts:70,projects:6,reputation:1000}},
{id:"planetary",name:"Planetary Energy Authority",cost:10000000000000,bonus:22.00,emoji:"🌐",desc:"+2200% production • unified planetary dispatch authority.",req:{lifetime:10000000000000,output:150000000,contracts:100,projects:8,reliability:96}},
{id:"helios",name:"Helios Energy Network",cost:250000000000000,bonus:35.00,emoji:"☀️",desc:"+3500% production • ultra-late-game solar infrastructure.",req:{lifetime:250000000000000,output:1000000000,contracts:150,projects:10,reputation:5000}}
];
const CONTRACTS=[
{id:"c1",name:"Town Utility Contract",required:2,duration:60,rate:1.15,reward:450},
{id:"c2",name:"Industrial Park Supply",required:12,duration:90,rate:1.30,reward:1800},
{id:"c3",name:"Regional Grid Support",required:50,duration:120,rate:1.45,reward:7500,reliability:75},
{id:"c4",name:"Metro Baseload Agreement",required:180,duration:180,rate:1.65,reward:30000,reliability:80},
{id:"c5",name:"National Capacity Market",required:1000,duration:240,rate:1.85,reward:250000,reliability:84,contracts:3},
{id:"c6",name:"Interconnect Reliability Award",required:5000,duration:300,rate:2.05,reward:1500000,reliability:88,contracts:6},
{id:"c7",name:"Continental Reserve Contract",required:25000,duration:360,rate:2.30,reward:10000000,reliability:90,contracts:10},
{id:"c8",name:"Global Energy Exchange",required:150000,duration:420,rate:2.60,reward:75000000,reliability:92,contracts:15},
{id:"c9",name:"World Supergrid Reserve",required:1000000,duration:480,rate:2.90,reward:600000000,reliability:94,contracts:25,region:"world"},
{id:"c10",name:"Planetary Baseload Accord",required:10000000,duration:540,rate:3.25,reward:5000000000,reliability:95,contracts:40,projects:5},
{id:"c11",name:"Orbital Energy Delivery",required:100000000,duration:600,rate:3.70,reward:60000000000,reliability:96,contracts:65,region:"orbitalgrid"},
{id:"c12",name:"Helios Strategic Reserve",required:1000000000,duration:720,rate:4.25,reward:750000000000,reliability:97,contracts:100,projects:9}
];
const CORPORATE=[{id:"eff",name:"High-Efficiency Operations",desc:"+5% production efficiency per level",base:2500},{id:"maint",name:"Predictive Maintenance",desc:"Slower equipment condition loss",base:4000},{id:"fuel",name:"Fuel Procurement",desc:"Reduces fuel expense by 5% per level",base:6000},{id:"grid",name:"Grid Optimization",desc:"+4% sale value per level",base:8000}];
const MISSIONS=[
{id:"m1",label:"Generate 100 kWh",type:"generated",target:100,reward:150},
{id:"m2",label:"Earn $1,000 lifetime cash",type:"lifetimeCash",target:1000,reward:500},
{id:"m3",label:"Own 5 plant levels",type:"levels",target:5,reward:1200},
{id:"m4",label:"Reach 180 MW output",type:"output",target:50,reward:3500},
{id:"m5",label:"Complete 3 contracts",type:"contracts",target:3,reward:7500},
{id:"m6",label:"Earn $1M lifetime cash",type:"lifetimeCash",target:1000000,reward:150000},
{id:"m7",label:"Reach 18 GW output",type:"output",target:5000,reward:1000000},
{id:"m8",label:"Complete 15 contracts",type:"contracts",target:15,reward:5000000},
{id:"m9",label:"Earn $65M lifetime cash",type:"lifetimeCash",target:65000000,reward:15000000},
{id:"m10",label:"Earn $1B lifetime cash",type:"lifetimeCash",target:1000000000,reward:200000000},
{id:"m11",label:"Master a generating asset",type:"masteries",target:1,reward:25000000},
{id:"m12",label:"Complete 4 mega projects",type:"projects",target:4,reward:750000000},
{id:"m13",label:"Reach 36 TW output",type:"output",target:10000000,reward:5000000000},
{id:"m14",label:"Earn $1T lifetime cash",type:"lifetimeCash",target:1000000000000,reward:100000000000},
{id:"m15",label:"Complete 75 contracts",type:"contracts",target:75,reward:500000000000},
{id:"m16",label:"Earn $1Qa lifetime cash",type:"lifetimeCash",target:1000000000000000,reward:100000000000000},
{id:"m17",label:"Reach 10 asset masteries",type:"masteries",target:10,reward:250000000000000},
{id:"m18",label:"Connect 16 grid regions",type:"regions",target:16,reward:500000000000000}
];
const ACH=[
{id:"a1",label:"First Spark",desc:"Generate your first 10 kWh",type:"generated",target:10},
{id:"a2",label:"Plant Operator",desc:"Unlock the Steam Turbine",type:"plant",plant:"steam",target:1},
{id:"a3",label:"Grid Builder",desc:"Unlock a second region",type:"regions",target:2},
{id:"a4",label:"Power Mogul",desc:"Earn $50,000 lifetime cash",type:"lifetimeCash",target:50000},
{id:"a5",label:"Nuclear Age",desc:"Unlock the Nuclear Plant",type:"plant",plant:"nuclear",target:1},
{id:"a6",label:"Master Operator",desc:"Reach operator level 10",type:"operator",target:10},
{id:"a7",label:"National Utility",desc:"Connect the National Supergrid",type:"region",region:"national",target:1},
{id:"a8",label:"Beyond $65M",desc:"Earn $65 million lifetime cash",type:"lifetimeCash",target:65000000},
{id:"a9",label:"Billion-Dollar Grid",desc:"Earn $1 billion lifetime cash",type:"lifetimeCash",target:1000000000},
{id:"a10",label:"Mega Builder",desc:"Complete 3 mega grid projects",type:"megaProjects",target:3},
{id:"a11",label:"Energy Titan",desc:"Earn $100 billion lifetime cash",type:"lifetimeCash",target:100000000000},
{id:"a12",label:"Trillion-Dollar Utility",desc:"Earn $1 trillion lifetime cash",type:"lifetimeCash",target:1000000000000},
{id:"a13",label:"Wind Empire",desc:"Commission Offshore Wind",type:"plant",plant:"offshore",target:1},
{id:"a14",label:"Fusion Era",desc:"Commission Fusion Power",type:"plant",plant:"fusion",target:1},
{id:"a15",label:"Fleet Master",desc:"Earn 5 total plant masteries",type:"masteries",target:5},
{id:"a16",label:"Planetary Operator",desc:"Connect the Planetary Energy Authority",type:"region",region:"planetary",target:1},
{id:"a17",label:"Quadrillion Utility",desc:"Earn $1 quadrillion lifetime cash",type:"lifetimeCash",target:1000000000000000},
{id:"a18",label:"Helios Authority",desc:"Connect the Helios Energy Network",type:"region",region:"helios",target:1},
{id:"a19",label:"Century of Contracts",desc:"Complete 100 contracts",type:"contracts",target:100},
{id:"a20",label:"Empire Ascendant",desc:"Reach Empire Level 5",type:"empireLevel",target:5}
];

const MEGA_PROJECTS=[
{id:"hvdc",icon:"⚡",name:"National HVDC Backbone",cost:65000000,bonus:.25,unlockAt:65000000,req:{contracts:8},desc:"High-voltage DC corridors add +25% total production."},
{id:"reactorFleet",icon:"☢️",name:"Advanced Reactor Fleet",cost:250000000,bonus:.40,unlockAt:250000000,req:{reliability:88},desc:"Standardized advanced nuclear fleet adds +40% total production."},
{id:"reserve",icon:"🔋",name:"National Storage Reserve",cost:1000000000,bonus:.60,unlockAt:1000000000,req:{contracts:15},desc:"Utility-scale storage reserve adds +60% total production."},
{id:"fusion",icon:"🔬",name:"Fusion Demonstrator Program",cost:5000000000,bonus:1.00,unlockAt:5000000000,req:{plant:"fusion",reliability:90},desc:"Commercial fusion demonstration adds +100% total production."},
{id:"smartgrid",icon:"🧠",name:"Continental Smart Grid",cost:25000000000,bonus:1.50,unlockAt:25000000000,req:{contracts:30},desc:"AI-coordinated continental dispatch adds +150% total production."},
{id:"exchange",icon:"🌐",name:"Global Energy Exchange",cost:100000000000,bonus:2.50,unlockAt:100000000000,req:{region:"world",reliability:94},desc:"Planet-scale energy trading adds +250% total production."},
{id:"superconduct",icon:"🧲",name:"Superconducting Transmission Ring",cost:1000000000000,bonus:4.00,unlockAt:1000000000000,req:{projects:6,contracts:60},desc:"Near-lossless transmission adds +400% total production."},
{id:"orbitalRelay",icon:"🛰️",name:"Orbital Power Relay Network",cost:10000000000000,bonus:7.00,unlockAt:10000000000000,req:{plant:"orbital",region:"orbitalgrid"},desc:"Space-based relays add +700% total production."},
{id:"planetaryAI",icon:"🧠",name:"Planetary Grid Intelligence",cost:100000000000000,bonus:12.00,unlockAt:100000000000000,req:{contracts:100,reliability:96},desc:"Planet-wide autonomous dispatch adds +1200% total production."},
{id:"heliosArray",icon:"☀️",name:"Helios Collector Program",cost:1000000000000000,bonus:20.00,unlockAt:1000000000000000,req:{region:"helios",projects:9},desc:"Ultra-scale solar collection adds +2000% total production."},
{id:"stellarReserve",icon:"✨",name:"Stellar Energy Reserve",cost:10000000000000000,bonus:35.00,unlockAt:10000000000000000,req:{contracts:150,reliability:97},desc:"The ultimate reserve system adds +3500% total production."}
];
const EMPIRE_MILESTONES=[
{id:"em1",label:"National Utility",desc:"Reach $20M lifetime cash.",value:()=>g.lifetimeCash,target:20000000},
{id:"em2",label:"Interconnection Era",desc:"Reach $65M lifetime cash — the long game begins here.",value:()=>g.lifetimeCash,target:65000000},
{id:"em3",label:"Quarter-Billion Operator",desc:"Reach $250M lifetime cash.",value:()=>g.lifetimeCash,target:250000000},
{id:"em4",label:"Billion-Dollar Grid",desc:"Reach $1B lifetime cash.",value:()=>g.lifetimeCash,target:1000000000},
{id:"em5",label:"Continental Utility",desc:"Reach $5B lifetime cash.",value:()=>g.lifetimeCash,target:5000000000},
{id:"em6",label:"Global Energy Company",desc:"Reach $25B lifetime cash.",value:()=>g.lifetimeCash,target:25000000000},
{id:"em7",label:"Energy Titan",desc:"Reach $100B lifetime cash.",value:()=>g.lifetimeCash,target:100000000000},
{id:"em8",label:"Half-Trillion Grid",desc:"Reach $500B lifetime cash.",value:()=>g.lifetimeCash,target:500000000000},
{id:"em9",label:"Trillion-Dollar Utility",desc:"Reach $1T lifetime cash.",value:()=>g.lifetimeCash,target:1000000000000},
{id:"em10",label:"Five-Trillion Authority",desc:"Reach $5T lifetime cash.",value:()=>g.lifetimeCash,target:5000000000000},
{id:"em11",label:"Planetary Conglomerate",desc:"Reach $25T lifetime cash.",value:()=>g.lifetimeCash,target:25000000000000},
{id:"em12",label:"Hundred-Trillion Grid",desc:"Reach $100T lifetime cash.",value:()=>g.lifetimeCash,target:100000000000000},
{id:"em13",label:"Half-Quadrillion Utility",desc:"Reach $500T lifetime cash.",value:()=>g.lifetimeCash,target:500000000000000},
{id:"em14",label:"Quadrillion Energy Authority",desc:"Reach $1Qa lifetime cash.",value:()=>g.lifetimeCash,target:1000000000000000},
{id:"em15",label:"Five-Quadrillion Empire",desc:"Reach $5Qa lifetime cash.",value:()=>g.lifetimeCash,target:5000000000000000},
{id:"em16",label:"Twenty-Five Quadrillion Grid",desc:"Reach $25Qa lifetime cash.",value:()=>g.lifetimeCash,target:25000000000000000},
{id:"em17",label:"Hundred-Quadrillion Sovereign",desc:"Reach $100Qa lifetime cash. The deep empire era begins here.",value:()=>g.lifetimeCash,target:100000000000000000},
{id:"em18",label:"Quintillion Energy State",desc:"Reach $1Qi lifetime cash.",value:()=>g.lifetimeCash,target:1e18},
{id:"em19",label:"Sextillion Grid",desc:"Reach $1Sx lifetime cash.",value:()=>g.lifetimeCash,target:1e21},
{id:"em20",label:"Septillion Authority",desc:"Reach $1Sp lifetime cash.",value:()=>g.lifetimeCash,target:1e24},
{id:"em21",label:"Octillion Power Network",desc:"Reach $1Oc lifetime cash.",value:()=>g.lifetimeCash,target:1e27},
{id:"em22",label:"Nonillion Energy Dominion",desc:"Reach $1No lifetime cash.",value:()=>g.lifetimeCash,target:1e30},
{id:"em23",label:"Decillion Grid Sovereign",desc:"Reach $1Dc lifetime cash. Prestige, Grid Credits and Empire Levels continue beyond this milestone.",value:()=>g.lifetimeCash,target:1e33}
];
const COMPANY_TIERS=[
{at:0,name:"LOCAL UTILITY"},{at:50000,name:"REGIONAL OPERATOR"},{at:1000000,name:"UTILITY GROUP"},{at:20000000,name:"NATIONAL UTILITY"},{at:65000000,name:"INTERCONNECT OPERATOR"},{at:250000000,name:"MEGA UTILITY"},{at:1000000000,name:"GRID CONGLOMERATE"},{at:5000000000,name:"CONTINENTAL ENERGY"},{at:25000000000,name:"GLOBAL ENERGY"},{at:100000000000,name:"ENERGY TITAN"},{at:1000000000000,name:"PLANETARY UTILITY"},{at:10000000000000,name:"PLANETARY AUTHORITY"},{at:100000000000000,name:"ENERGY DYNASTY"},{at:1000000000000000,name:"QUADRILLION GRID"},{at:25000000000000000,name:"HELIOS AUTHORITY"},{at:100000000000000000,name:"GRID SOVEREIGN"},{at:1e18,name:"QUINTILLION AUTHORITY"},{at:1e21,name:"SEXTILLION GRID"},{at:1e24,name:"SEPTILLION EMPIRE"},{at:1e27,name:"OCTILLION NETWORK"},{at:1e30,name:"NONILLION DOMINION"},{at:1e33,name:"DECILLION SOVEREIGN"}
];
const defaultGame=()=>({cash:0,stored:0,generated:0,sold:0,lifetimeCash:0,tapLevel:0,prestige:0,boostUntil:0,lastSeen:Date.now(),lastDaily:0,starter:false,autoGenerateUnlocked:false,autoGenerate:false,adsRemoved:false,executiveLicenseUnlocked:false,rewardedAdsWatched:0,processedStoreTransactions:[],adState:{contractsSinceAd:0,lastInterstitial:0,pending:false},maintenance:100,engineers:0,operatorXP:0,operatorLevel:1,regions:{riverbend:true},plants:Object.fromEntries(PLANTS.map(p=>[p.id,{unlocked:false,level:0,condition:100}])),corporate:{eff:0,maint:0,fuel:0,grid:0},contractsCompleted:0,activeContract:null,missions:{},achievements:{},event:null,eventCooldown:0,settings:{sound:true,haptics:true,reducedMotion:false,compact:true},
tutorialStep:0,finalShown:false,endgame:{},
market:{price:1,demand:1,trend:0,lastShift:Date.now()},
battery:{level:0,stored:0},
autoSell:false,reputation:0,reliability:100,
staff:{engineer:0,trader:0,safety:0,operator:0},
policy:"balanced",
research:{automation:0,storage:0,forecast:0,materials:0,controls:0,gridAI:0,superconductors:0,advancedNuclear:0,fusionControl:0,quantumGrid:0},
weekly:{weekKey:"",progress:0,claimed:false},
opsShift:{id:1,generatedStart:0,soldStart:0,dispatchStart:0,generatedTarget:25,soldTarget:10,dispatchTarget:1,reward:750,claimed:false,startedAt:Date.now()},
dispatches:0,finalTutorial:{step:0,done:false,disabled:false},
autoGenerateLevel:0,dailyStreak:{count:0,lastClaimDay:null},megaProjects:{},empireLevel:0,empireNotified:{},
gridCredits:0,lifetimeGridCredits:0,prestigeRunCash:0,legacy:{generation:0,markets:0,resilience:0,offline:0},stabilityVersion:21,
log:["Riverbend Station connected to the grid."]});
let g;

try{
  const existingSave=localStorage.getItem("PPT_V5");

  if(existingSave&&!localStorage.getItem("PPT_FINAL_BACKUP_1")){
    localStorage.setItem("PPT_FINAL_BACKUP_1",existingSave);
  }

  g=existingSave ? JSON.parse(existingSave) : defaultGame();

}catch(e){
  g=defaultGame();
}

function migrate(){
if(g.autoGenerateUnlocked==null)g.autoGenerateUnlocked=false;
if(g.autoGenerate==null)g.autoGenerate=false;
if(g.adsRemoved==null)g.adsRemoved=false;
if(g.executiveLicenseUnlocked==null)g.executiveLicenseUnlocked=false;
if(g.rewardedAdsWatched==null)g.rewardedAdsWatched=0;
if(!Array.isArray(g.processedStoreTransactions))g.processedStoreTransactions=[];
if(!g.adState)g.adState={contractsSinceAd:0,lastInterstitial:0,pending:false};
if(!g.plants)g.plants={};
PLANTS.forEach(p=>{
  if(!g.plants[p.id])g.plants[p.id]={unlocked:false,level:0,condition:100};
  const s=g.plants[p.id];
  if(s.level==null)s.level=0;
  s.level=Math.max(0,Number(s.level)||0);
  if(s.unlocked==null)s.unlocked=s.level>0;
  if(s.level>0)s.unlocked=true;
  if(s.unlocked&&s.level<1)s.level=1;
  if(s.condition==null)s.condition=100;
  s.condition=Math.max(35,Math.min(100,Number(s.condition)||100));
  if(s.mastery==null)s.mastery=0;
  s.mastery=Math.max(0,Number(s.mastery)||0);
});if(!g.regions)g.regions={riverbend:true};if(!g.corporate)g.corporate={eff:0,maint:0,fuel:0,grid:0};["eff","maint","fuel","grid"].forEach(id=>{if(g.corporate[id]==null)g.corporate[id]=0});if(g.maintenance==null)g.maintenance=100;if(g.engineers==null)g.engineers=0;if(g.operatorXP==null)g.operatorXP=0;if(g.operatorLevel==null)g.operatorLevel=1;if(g.contractsCompleted==null)g.contractsCompleted=0;if(g.activeContract===undefined)g.activeContract=null;if(!g.missions)g.missions={};if(!g.achievements)g.achievements={};if(!g.log)g.log=[];
if(!g.settings)g.settings={sound:true,haptics:true,reducedMotion:false,compact:true};
["sound","haptics","reducedMotion","compact"].forEach(k=>{if(g.settings[k]==null)g.settings[k]=(k==="sound"||k==="haptics"||k==="compact")});
if(g.tutorialStep==null)g.tutorialStep=0;if(g.finalShown==null)g.finalShown=false;if(!g.endgame)g.endgame={};
if(!g.market)g.market={price:1,demand:1,trend:0,lastShift:Date.now()};
if(g.market.price==null)g.market.price=1;if(g.market.demand==null)g.market.demand=1;if(g.market.trend==null)g.market.trend=0;if(g.market.lastShift==null)g.market.lastShift=Date.now();
if(!g.battery)g.battery={level:0,stored:0};if(g.battery.level==null)g.battery.level=0;if(g.battery.stored==null)g.battery.stored=0;
if(g.autoSell==null)g.autoSell=false;if(g.reputation==null)g.reputation=0;if(g.reliability==null)g.reliability=100;
if(!g.staff)g.staff={engineer:0,trader:0,safety:0,operator:0};["engineer","trader","safety","operator"].forEach(k=>{if(g.staff[k]==null)g.staff[k]=0});
if(!g.policy)g.policy="balanced";
if(!g.research)g.research={automation:0,storage:0,forecast:0,materials:0,controls:0,gridAI:0,superconductors:0,advancedNuclear:0,fusionControl:0,quantumGrid:0};["automation","storage","forecast","materials","controls","gridAI","superconductors","advancedNuclear","fusionControl","quantumGrid"].forEach(k=>{if(g.research[k]==null)g.research[k]=0});
if(!g.weekly)g.weekly={weekKey:"",progress:0,claimed:false};
if(!g.opsShift)g.opsShift={id:1,generatedStart:g.generated||0,soldStart:g.sold||0,dispatchStart:g.dispatches||0,generatedTarget:25,soldTarget:10,dispatchTarget:1,reward:750,claimed:false,startedAt:Date.now()};
if(g.dispatches==null)g.dispatches=0;
if(g.viewStage==null)g.viewStage=null;
if(!g.viewStage&&g.plants?.diesel?.unlocked&&!g.plants?.steam?.unlocked)g.viewStage="diesel";
if(g.settings.musicVolume==null)g.settings.musicVolume=16;
if(g.settings.sfxVolume==null)g.settings.sfxVolume=22;if(!g.finalTutorial)g.finalTutorial={step:0,done:false,disabled:false};if(g.finalTutorial.autoStart==null)g.finalTutorial.autoStart=true;
if(g.autoGenerateLevel==null)g.autoGenerateLevel=0;if(!g.dailyStreak)g.dailyStreak={count:0,lastClaimDay:null};if(!g.megaProjects)g.megaProjects={};if(g.empireLevel==null)g.empireLevel=0;if(!g.empireNotified)g.empireNotified={};
if(g.gridCredits==null)g.gridCredits=0;if(g.lifetimeGridCredits==null)g.lifetimeGridCredits=g.gridCredits||0;if(g.prestigeRunCash==null)g.prestigeRunCash=Math.max(0,Number(g.cash)||0);if(!g.legacy)g.legacy={generation:0,markets:0,resilience:0,offline:0};["generation","markets","resilience","offline"].forEach(k=>{if(g.legacy[k]==null)g.legacy[k]=0});

["generated","sold","lifetimeCash","tapLevel","prestige","boostUntil","lastSeen","lastDaily","eventCooldown"].forEach(k=>{if(g[k]==null)g[k]=0})}
function operatorXPRequirement(level=g.operatorLevel||1){return Math.max(100,Math.round(100*Math.pow(Math.max(1,level),1.65)))}
function repairLateGameState(){
  const clean=(v,f=0,min=0,max=1e300)=>{v=Number(v);if(!Number.isFinite(v))v=f;return Math.max(min,Math.min(max,v))};
  ["cash","stored","generated","sold","lifetimeCash","prestigeRunCash"].forEach(k=>g[k]=clean(g[k],0,0));
  g.prestige=Math.floor(clean(g.prestige,0,0,1000000));g.empireLevel=Math.floor(clean(g.empireLevel,0,0,1000000));
  g.operatorLevel=Math.floor(clean(g.operatorLevel,1,1,1000000));g.operatorXP=clean(g.operatorXP,0,0);
  const req=operatorXPRequirement();if(g.operatorXP>req*10)g.operatorXP=Math.floor(req*.75);
  g.maintenance=clean(g.maintenance,100,0,100);g.reliability=clean(g.reliability,100,40,100);g.reputation=clean(g.reputation,0,0);
  g.gridCredits=Math.floor(clean(g.gridCredits,0,0,1e12));g.lifetimeGridCredits=Math.floor(clean(g.lifetimeGridCredits,g.gridCredits,0,1e15));
  ["eff","maint","fuel","grid"].forEach(k=>g.corporate[k]=Math.floor(clean(g.corporate[k],0,0,25)));
  ["engineer","trader","safety","operator"].forEach(k=>g.staff[k]=Math.floor(clean(g.staff[k],0,0,50)));
  RESEARCH.forEach(r=>g.research[r.id]=Math.floor(clean(g.research[r.id],0,0,r.max)));
  PLANTS.forEach(p=>{const x=g.plants[p.id];x.level=Math.floor(clean(x.level,0,0,10000));x.mastery=Math.floor(clean(x.mastery,0,0,1000));x.condition=clean(x.condition,100,35,100)});
  ["generation","markets","resilience","offline"].forEach(k=>g.legacy[k]=Math.floor(clean(g.legacy[k],0,0,100)));
  if((g.stabilityVersion||0)<21)g.stabilityVersion=21
}
migrate();if((g.generated||0)>25&&g.tutorialStep===0)g.tutorialStep=5;
function completedMegaProjects(){return MEGA_PROJECTS.filter(p=>g.megaProjects&&g.megaProjects[p.id]).length}
function totalMasteries(){return PLANTS.reduce((a,p)=>a+(g.plants[p.id]?.mastery||0),0)}
function megaProjectMult(){let m=1;MEGA_PROJECTS.forEach(p=>{if(g.megaProjects&&g.megaProjects[p.id])m+=p.bonus});return m}
function empireLevelMult(){return 1+.18*Math.sqrt(Math.max(0,g.empireLevel||0))}
function empireBonusMult(){return 1+(megaProjectMult()-1)+(empireLevelMult()-1)}
function empireLevelCost(){return Math.min(1e300,1000000000000*Math.pow(4.25,g.empireLevel||0))}
function empireLevelLifetimeRequirement(){return Math.min(1e300,1000000000000*Math.pow(6,g.empireLevel||0))}
function empireLevelProjectRequirement(){return Math.min(MEGA_PROJECTS.length,6+Math.floor((g.empireLevel||0)/2))}
const PRESTIGE_MILESTONES=[10,25,50,100,250,500,1000];
const LEGACY_UPGRADES=[
{id:"generation",icon:"⚡",name:"Grid Engineering",desc:"+6% permanent production per level",base:1,max:50},
{id:"markets",icon:"📈",name:"Market Authority",desc:"+4% permanent sale value per level",base:1,max:40},
{id:"resilience",icon:"🛡️",name:"Reliability Doctrine",desc:"-2% fleet wear per level",base:2,max:30},
{id:"offline",icon:"🌙",name:"Autonomous Night Shift",desc:"+1% offline efficiency per level",base:2,max:20}
];
function legacyUpgradeCost(u){return Math.max(1,Math.ceil(u.base*Math.pow(1.7,g.legacy[u.id]||0)))}
function legacyProductionMult(){return 1+(g.legacy.generation||0)*.06}
function legacySaleMult(){return 1+(g.legacy.markets||0)*.04}
function legacyWearMult(){return Math.max(.35,1-(g.legacy.resilience||0)*.02)}
function offlineEfficiency(){return Math.min(.95,.75+(g.legacy.offline||0)*.01)}
function nextPrestigeMilestone(){return PRESTIGE_MILESTONES.find(x=>x>(g.prestige||0))||null}
function prestigeCreditReward(){const next=(g.prestige||0)+1,base=1+Math.floor(next/10),bonus=PRESTIGE_MILESTONES.includes(next)?Math.max(3,Math.floor(next/10)):0;return Math.min(5000,base+bonus)}
function buyLegacyUpgrade(id){const u=LEGACY_UPGRADES.find(x=>x.id===id);if(!u)return;const lv=g.legacy[id]||0;if(lv>=u.max){toast("Legacy upgrade maxed.");return}const c=legacyUpgradeCost(u);if(g.gridCredits<c){toast("Need "+c+" Grid Credits.");return}g.gridCredits-=c;g.legacy[id]=lv+1;addLog(u.name+" upgraded to Level "+g.legacy[id]+".");saveGame();render();feedback("big")}
function masteryRequirement(s){return 25*((s.mastery||0)+1)}
function masteryCost(p,s){return p.unlock*60*Math.pow(14,s.mastery||0)}
function plantBaseContribution(p,s){return p.base*s.level*(1+(s.mastery||0)*.75)}
function autoGenerateUpgradeCost(){return 5000*Math.pow(3.25,g.autoGenerateLevel||0)}
function companyTier(){let t=COMPANY_TIERS[0];COMPANY_TIERS.forEach(x=>{if(g.lifetimeCash>=x.at)t=x});return t.name}
function nextCompanyTier(){return COMPANY_TIERS.find(x=>g.lifetimeCash<x.at)||null}
function dayStamp(ms=Date.now()){const d=new Date(ms);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
const money=n=>{if(!isFinite(n))n=0;if(!g||!g.settings||!g.settings.compact)return"$"+n.toLocaleString(undefined,{maximumFractionDigits:1});if(n>=1e33)return"$"+(n/1e33).toFixed(2)+"Dc";if(n>=1e30)return"$"+(n/1e30).toFixed(2)+"No";if(n>=1e27)return"$"+(n/1e27).toFixed(2)+"Oc";if(n>=1e24)return"$"+(n/1e24).toFixed(2)+"Sp";if(n>=1e21)return"$"+(n/1e21).toFixed(2)+"Sx";if(n>=1e18)return"$"+(n/1e18).toFixed(2)+"Qi";if(n>=1e15)return"$"+(n/1e15).toFixed(2)+"Qa";if(n>=1e12)return"$"+(n/1e12).toFixed(2)+"T";if(n>=1e9)return"$"+(n/1e9).toFixed(2)+"B";if(n>=1e6)return"$"+(n/1e6).toFixed(2)+"M";if(n>=1e3)return"$"+(n/1e3).toFixed(2)+"K";return"$"+n.toFixed(1)};
const num=n=>{if(!isFinite(n))n=0;if(!g||!g.settings||!g.settings.compact)return n.toLocaleString(undefined,{maximumFractionDigits:1});if(n>=1e33)return(n/1e33).toFixed(2)+"Dc";if(n>=1e30)return(n/1e30).toFixed(2)+"No";if(n>=1e27)return(n/1e27).toFixed(2)+"Oc";if(n>=1e24)return(n/1e24).toFixed(2)+"Sp";if(n>=1e21)return(n/1e21).toFixed(2)+"Sx";if(n>=1e18)return(n/1e18).toFixed(2)+"Qi";if(n>=1e15)return(n/1e15).toFixed(2)+"Qa";if(n>=1e12)return(n/1e12).toFixed(2)+"T";if(n>=1e9)return(n/1e9).toFixed(2)+"B";if(n>=1e6)return(n/1e6).toFixed(2)+"M";if(n>=1e3)return(n/1e3).toFixed(2)+"K";return n.toFixed(1)};
// Electrical display helpers. Energy is stored internally in kWh. output() is kWh per second,
// so displayed power converts that rate to kW (1 kWh/s = 3,600 kW) before SI scaling.
function formatElectricalUnit(value,units){
  if(!isFinite(value))value=0;
  const a=Math.abs(value);
  let chosen=units[0];
  for(const u of units){if(a>=u.scale)chosen=u;else break}
  const v=value/chosen.scale,av=Math.abs(v);
  const digits=av>=100?0:av>=10?1:2;
  return v.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:digits})+" "+chosen.label;
}
const ENERGY_DISPLAY_UNITS=[
  {scale:1,label:"kWh"},{scale:1e3,label:"MWh"},{scale:1e6,label:"GWh"},{scale:1e9,label:"TWh"},
  {scale:1e12,label:"PWh"},{scale:1e15,label:"EWh"},{scale:1e18,label:"ZWh"},{scale:1e21,label:"YWh"},{scale:1e24,label:"RWh"},{scale:1e27,label:"QWh"}
];
const POWER_DISPLAY_UNITS=[
  {scale:1,label:"kW"},{scale:1e3,label:"MW"},{scale:1e6,label:"GW"},{scale:1e9,label:"TW"},
  {scale:1e12,label:"PW"},{scale:1e15,label:"EW"},{scale:1e18,label:"ZW"},{scale:1e21,label:"YW"},{scale:1e24,label:"RW"},{scale:1e27,label:"QW"}
];
function energy(n){return formatElectricalUnit(n,ENERGY_DISPLAY_UNITS)}
function powerRate(kwhPerSecond){return formatElectricalUnit(kwhPerSecond*3600,POWER_DISPLAY_UNITS)}
function missionDisplay(m,v){if(m.type==="generated")return energy(v);if(m.type==="output")return powerRate(v);if(m.type==="lifetimeCash")return money(v);return num(v)}
function prestigeMult(){return 1+.08*Math.pow(Math.max(0,g.prestige||0),.72)}function operatorMult(){return 1+Math.max(0,g.operatorLevel-1)*.01}function efficiencyMult(){return 1+g.corporate.eff*.05}function regionMult(){let m=1;REGIONS.forEach(r=>{if(r.id!=="riverbend"&&g.regions[r.id])m+=(r.bonus||0)});return m}function boostMult(){return Date.now()<g.boostUntil?2:1}function eventMult(){if(!g.event)return 1;if(g.event.type==="breakdown")return .5;if(g.event.type==="surge")return 1.5;return 1}function maintenanceMult(){return .65+.35*(g.maintenance/100)}function premiumLicenseMult(){return g.executiveLicenseUnlocked?1.25:1}function totalMult(){const core=1+(prestigeMult()-1)+(operatorMult()-1)+(efficiencyMult()-1)+(regionMult()-1)+(staffProductionMult()-1)+(researchProductionMult()-1)+(empireBonusMult()-1)+(premiumLicenseMult()-1)+(legacyProductionMult()-1)+(b10LicenseMult()-1);const result=core*boostMult()*eventMult()*maintenanceMult()*policyProductionMult();return Number.isFinite(result)?Math.max(.05,result):1}function tapPower(){return(1+g.tapLevel*2.5)*(1+(prestigeMult()-1)+(operatorMult()-1)+(legacyProductionMult()-1))*boostMult()}function tapUpgradeCost(){return 25*Math.pow(1.65,g.tapLevel)}
function rawOutput(){let n=0;PLANTS.forEach(p=>{const s=g.plants[p.id];if(s&&s.unlocked)n+=plantBaseContribution(p,s)*(.6+.4*s.condition/100)});return Number.isFinite(n)?n:1e300}function output(){const n=rawOutput()*totalMult();return Number.isFinite(n)?Math.min(1e300,n):1e300}function fuelCostPerSecond(){let n=0;PLANTS.forEach(p=>{const s=g.plants[p.id];if(s&&s.unlocked)n+=p.fuel*s.level});return n*Math.max(.35,1-g.corporate.fuel*.05-g.research.superconductors*.015)}function gridSaleMult(){return(1+g.corporate.grid*.04+g.research.quantumGrid*.08)*(g.executiveLicenseUnlocked?1.10:1)*legacySaleMult()}function netValuePerSecond(){return Math.max(0,output()*gridSaleMult()-fuelCostPerSecond())}function plantCost(p){const s=g.plants[p.id];if(!s.unlocked)return p.unlock;return p.unlock*.7*Math.pow(1.62,Math.max(1,s.level)-1)}function totalLevels(){return PLANTS.reduce((a,p)=>a+(g.plants[p.id].unlocked?g.plants[p.id].level:0),0)}function maintenanceCost(){return Math.max(250,rawOutput()*20+(100-g.maintenance)*18)}function engineerCost(){return 2500*Math.pow(1.75,g.engineers)}function corporateCost(up){return up.base*Math.pow(1.9,g.corporate[up.id]||0)}
function saveGame(){repairLateGameState();g.lastSeen=Date.now();localStorage.setItem("PPT_V5",JSON.stringify(g))}function toast(t){const e=document.getElementById("toast");if(!e)return;e.textContent=t;e.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>e.classList.remove("show"),1800)}function addLog(t){if(!Array.isArray(g.log))g.log=[];const x=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});g.log.unshift(x+" • "+t);g.log=g.log.slice(0,25)}function addXP(a){a=Number(a);if(!Number.isFinite(a)||a<=0)return;let req=operatorXPRequirement(),gain=Math.min(a,Math.max(250,req*.5));g.operatorXP+=gain;let levels=0;while(g.operatorXP>=req&&levels<25){g.operatorXP-=req;g.operatorLevel++;levels++;req=operatorXPRequirement()}if(levels){addLog("Company advanced "+levels+" level"+(levels===1?"":"s")+" to Level "+g.operatorLevel+".");toast("⭐ Company Level "+g.operatorLevel)}if(g.operatorXP>=req)g.operatorXP=Math.min(g.operatorXP,req*.95)}
function saleXPGain(amount){amount=Math.max(0,Number(amount)||0);return Math.max(1,15+Math.log10(1+amount)*18)}
function safeSaleMultiplier(){let p=gridSaleMult()*marketSaleMult();if(g.event&&g.event.type==="surge")p*=1.75;if(g.activeContract)p*=g.activeContract.rate;return Math.max(.25,Math.min(25,Number.isFinite(p)?p:1))}
function recordEarnedCash(amount){amount=Number(amount);if(!Number.isFinite(amount)||amount<=0)return 0;amount=Math.min(1e300,amount);g.cash=Math.min(1e300,g.cash+amount);g.lifetimeCash=Math.min(1e300,g.lifetimeCash+amount);g.prestigeRunCash=Math.min(1e300,(g.prestigeRunCash||0)+amount);return amount}


const STAFF_TYPES=[
{id:"engineer",name:"Plant Engineer",icon:"🛠️",desc:"Slows equipment degradation and improves maintenance.",base:5000},
{id:"trader",name:"Energy Trader",icon:"📈",desc:"Improves power sale value and market forecasting.",base:7000},
{id:"safety",name:"Safety Specialist",icon:"🦺",desc:"Improves reliability and reduces breakdown severity.",base:8500},
{id:"operator",name:"Senior Operator",icon:"🎛️",desc:"Boosts production and operator XP gain.",base:10000}
];
const RESEARCH=[
{id:"automation",name:"Advanced Automation",desc:"+4% production per level",base:12000,max:8,unlockAt:0},
{id:"storage",name:"Grid Storage Systems",desc:"+50% battery capacity per level",base:15000,max:8,unlockAt:0},
{id:"forecast",name:"Market Forecasting",desc:"+3% sale value per level",base:18000,max:8,unlockAt:0},
{id:"materials",name:"Advanced Materials",desc:"Slower plant condition loss",base:22000,max:8,unlockAt:0},
{id:"controls",name:"Digital Plant Controls",desc:"+2% reliability per level",base:30000,max:8,unlockAt:0},
{id:"gridAI",name:"Grid AI Dispatch",desc:"Improves auto-sell and dispatch bonuses",base:45000,max:8,unlockAt:0},
{id:"superconductors",name:"Superconducting Systems",desc:"Reduces fleet operating cost and expands storage",base:250000000,max:6,unlockAt:65000000},
{id:"advancedNuclear",name:"Advanced Reactor Engineering",desc:"+12% total production per level",base:2000000000,max:6,unlockAt:1000000000},
{id:"fusionControl",name:"Fusion Plasma Control",desc:"+25% total production per level",base:50000000000,max:6,unlockAt:25000000000},
{id:"quantumGrid",name:"Quantum Grid Optimization",desc:"+8% sale value and +20% production per level",base:1000000000000,max:8,unlockAt:1000000000000}
];
const POLICIES=[
{id:"balanced",name:"Balanced Operation",desc:"Stable production and maintenance."},
{id:"maximum",name:"Maximum Output",desc:"+15% output, faster wear."},
{id:"reliability",name:"Reliability First",desc:"-8% output, slower wear and fewer trips."},
{id:"market",name:"Market Responsive",desc:"Better sale prices during high demand."}
];
repairLateGameState();

function marketSaleMult(){
  let m=(g.market?.price||1)*(g.market?.demand||1);
  m*=1+(g.staff.trader||0)*.025;
  m*=1+(g.research.forecast||0)*.03;
  if(g.policy==="market")m*=1.08;
  if(g.research.gridAI>0&&g.autoSell)m*=1+g.research.gridAI*.025;
  return Math.max(.5,m);
}
function policyProductionMult(){
  if(g.policy==="maximum")return 1.15;
  if(g.policy==="reliability")return .92;
  return 1;
}
function staffProductionMult(){return 1+(g.staff.operator||0)*.025}
function researchProductionMult(){return (1+(g.research.automation||0)*.04+(g.research.advancedNuclear||0)*.12+(g.research.fusionControl||0)*.25+(g.research.quantumGrid||0)*.20)}
function batteryCapacity(){return g.battery.level<=0?0:500*Math.pow(2,g.battery.level-1)*(1+g.research.storage*.5)*(1+g.research.superconductors*.4)}
function batteryUpgradeCost(){return 10000*Math.pow(2.15,g.battery.level)}
function staffCost(id){const t=STAFF_TYPES.find(x=>x.id===id);return t.base*Math.pow(1.8,g.staff[id]||0)}
function researchCost(id){const r=RESEARCH.find(x=>x.id===id);return r.base*Math.pow(2.05,g.research[id]||0)}
function companyRating(){
  const score=(g.reputation||0)+(g.reliability||100)*3+g.contractsCompleted*15+Math.min(300,g.lifetimeCash/5000);
  if(score>=800)return"S";if(score>=600)return"A";if(score>=450)return"B";if(score>=300)return"C";if(score>=180)return"D";return"E";
}
function shiftMarket(){
  if(!g.market)return;
  const old=g.market.price;
  const volatility=.12-Math.min(.05,g.staff.trader*.005);
  g.market.price=Math.max(.55,Math.min(1.85,g.market.price+(Math.random()-.48)*volatility));
  g.market.demand=Math.max(.72,Math.min(1.45,g.market.demand+(Math.random()-.5)*.08));
  g.market.trend=g.market.price-old;
  g.market.lastShift=Date.now();
}
function toggleAutoSell(){
  if(g.research.automation<1){toast("Research Advanced Automation first.");return}
  g.autoSell=!g.autoSell;saveGame();render();
}
function dispatchPower(){
  if(g.stored<10){toast("Need at least 10 kWh stored.");return}
  const amount=Math.min(g.stored,Math.max(10,output()*20));
  const bonus=1.08+g.research.gridAI*.03;
  const cash=amount*gridSaleMult()*marketSaleMult()*bonus;
  g.stored-=amount;recordEarnedCash(cash);g.sold+=amount;g.dispatches++;
  g.reputation+=2;addXP(3);addLog("Grid dispatch sold "+energy(amount)+" for "+money(cash)+".");tutorialSignal("dispatch");feedback("big");saveGame();render();
}
function chargeBattery(){
  const cap=batteryCapacity();
  if(cap<=0){toast("Build the grid battery first.");return}
  const room=Math.max(0,cap-g.battery.stored);
  const amount=Math.min(g.stored,room);
  if(amount<=0){toast("Battery is full or no power is available.");return}
  g.stored-=amount;g.battery.stored+=amount;saveGame();render();
}
function dischargeBattery(){
  if(g.battery.stored<=0){toast("Battery is empty.");return}
  const amount=g.battery.stored;
  const cash=amount*gridSaleMult()*marketSaleMult()*1.12;
  g.battery.stored=0;recordEarnedCash(cash);g.sold+=amount;g.reputation+=1;
  addLog("Battery discharged "+energy(amount)+" for "+money(cash)+".");saveGame();render();
}
function upgradeBattery(){
  const c=batteryUpgradeCost();
  if(g.cash<c){toast("Battery upgrade requires "+money(c));return}
  g.cash-=c;g.battery.level++;g.reputation+=2;addXP(12);addLog("Grid battery upgraded to Level "+g.battery.level+".");saveGame();render();
}
function hireStaff(id){
  if((g.staff[id]||0)>=50){toast("Staff specialization maxed at 50.");return}
  const c=staffCost(id);
  if(g.cash<c){toast("Need "+money(c));return}
  g.cash-=c;g.staff[id]++;g.reputation+=3;addXP(12);addLog(STAFF_TYPES.find(x=>x.id===id).name+" hired.");saveGame();render();
}
function setPolicy(id){g.policy=id;addLog("Dispatch policy changed to "+POLICIES.find(x=>x.id===id).name+".");saveGame();render()}
function buyResearch(id){
  const r=RESEARCH.find(x=>x.id===id),lv=g.research[id]||0;
  if(lv>=r.max){toast("Research maxed.");return}
  if((r.unlockAt||0)>g.lifetimeCash){toast("Research unlocks at "+money(r.unlockAt)+" lifetime cash.");return}
  const c=researchCost(id);if(g.cash<c){toast("Need "+money(c));return}
  g.cash-=c;g.research[id]++;g.reputation+=5;addXP(20);addLog("Research completed: "+r.name+" Level "+g.research[id]+".");saveGame();render();
}
function weekKey(){
  const d=new Date(),onejan=new Date(d.getFullYear(),0,1);
  const week=Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7);
  return d.getFullYear()+"-"+week;
}
function updateWeekly(){
  const k=weekKey();
  if(g.weekly.weekKey!==k)g.weekly={weekKey:k,progress:0,claimed:false};
  g.weekly.progress=Math.max(g.weekly.progress,g.generated);
}
function claimWeekly(){
  renderCinematicHUD();updateWeekly();const target=250000;
  if(g.weekly.claimed){toast("Weekly reward already claimed.");return}
  if(g.weekly.progress<target){toast("Weekly challenge not complete.");return}
  const reward=50000;recordEarnedCash(reward);g.reputation+=20;g.weekly.claimed=true;addXP(50);saveGame();render();
}
function autoSellTick(){
  if(!g.autoSell||g.stored<=0)return;
  if(g.market.price<1.05&&g.policy!=="market")return;
  const amount=Math.min(g.stored,Math.max(1,output()*3));
  const cash=amount*gridSaleMult()*marketSaleMult()*(1+g.research.gridAI*.02);
  g.stored-=amount;recordEarnedCash(cash);g.sold+=amount;
}



const GUIDED_TUTORIAL=[
  {page:"home",sel:".generate",action:"generate",objective:"Generate electricity once",title:"Bring Riverbend Online",text:"Tap GENERATE POWER. The control room will immediately register your first electricity."},
  {page:"home",sel:"#sellBtn",action:"sell",objective:"Sell stored power to the grid",title:"Make Your First Grid Sale",text:"Sell stored electricity for cash. Market price and demand affect the value of every sale."},
  {page:"plants",sel:"#plantList",action:null,objective:"Open the Plants division",title:"Enter Generation Division",text:"The fleet screen is where you commission, upgrade and master every generation technology."},
  {page:"plants",sel:'button[data-tutorial="build-diesel"]',action:"build_diesel",objective:"Commission the Diesel Generator",title:"Commission Your First Plant",text:"Earn enough cash, then build the Diesel Generator. It creates automatic production every second."},
  {page:"map",sel:"#regionList",action:null,objective:"Open the Grid Expansion map",title:"Think Beyond Riverbend",text:"Regions add permanent production bonuses and unlock the route toward national and global operation."},
  {page:"home",sel:"#tutorialDispatchBtn",action:"dispatch",objective:"Dispatch at least 10 kWh",title:"Run an Operations Shift",text:"Build reserve, then use DISPATCH TO GRID. Build 10 adds repeatable operating shifts with cash, XP and reputation rewards."},
  {page:"company",sel:"#researchTree",action:null,objective:"Open Company HQ",title:"Run the Company",text:"Hire specialists, select operating policy and research technologies that reshape how the utility performs."},
  {page:"goals",sel:"#b10LicenseProgress",action:null,objective:"Review your Grid Authority License",title:"Advance Your Career",text:"Operator level and lifetime cash now advance your Grid Authority License, unlocking a small permanent production bonus."},
  {page:"stats",sel:"#weeklyChallenge",action:null,objective:"Open Company Analytics",title:"Build an Energy Empire",text:"Track long-term production, weekly challenges, prestige, mega projects, Empire Levels and the road to stellar generation."}
]
let tutSpotEl=null;
let guidedTutorialRenderKey=null;
let guidedTutorialAdvancing=false;
function tutorialSignal(action){
  if(!g?.finalTutorial||g.finalTutorial.disabled||g.finalTutorial.done||guidedTutorialAdvancing)return;
  const i=Math.max(0,Math.min(GUIDED_TUTORIAL.length-1,g.finalTutorial.step||0)),step=GUIDED_TUTORIAL[i];
  if(step.action!==action)return;
  guidedTutorialAdvancing=true;
  setTimeout(()=>{guidedTutorialAdvancing=false;if(g.finalTutorial.disabled||g.finalTutorial.done)return;if((g.finalTutorial.step||0)!==i)return;g.finalTutorial.step=i+1;if(g.finalTutorial.step>=GUIDED_TUTORIAL.length){g.finalTutorial.step=GUIDED_TUTORIAL.length-1;g.finalTutorial.done=true;toast("🎓 Operator onboarding complete!")}else toast("✓ Tutorial objective complete");saveGame();renderGuidedTutorial()},260);
}
function clearTutSpot(){if(tutSpotEl){tutSpotEl.classList.remove("tut-spot");tutSpotEl=null}}
function openTutorialPage(page){
  const nav=document.querySelector(`[data-nav="${page}"]`);
  if(nav)showPage(page,nav);
}
function renderGuidedTutorial(){
  const panel=document.getElementById("tutorialPanel2"),mask=document.getElementById("tutorialMask2");
  if(!panel||!mask)return;
  if(g.finalTutorial.disabled||g.finalTutorial.done){panel.classList.remove("show");mask.classList.remove("show");clearTutSpot();guidedTutorialRenderKey=null;return}
  const i=Math.max(0,Math.min(GUIDED_TUTORIAL.length-1,g.finalTutorial.step||0)),s=GUIDED_TUTORIAL[i];

  /* Build 10: one-time first-plant commissioning grant */
  if(i===3 && !g.b10TutorialCommissionGrant && !g.plants.diesel.unlocked){
    const diesel=PLANTS.find(p=>p.id==="diesel");
    const required=diesel ? plantCost(diesel) : 60;

    if(g.cash < required){
      const grant=required-g.cash;
      g.cash=required;
      g.b10TutorialCommissionGrant=true;
      addLog("Riverbend commissioning grant issued: "+money(grant)+".");
      saveGame();

      const cashEl=document.getElementById("cash");
      if(cashEl) cashEl.textContent=money(g.cash);

      setTimeout(()=>toast("🎓 Commissioning Grant: "+money(grant)),100);
    } else {
      g.b10TutorialCommissionGrant=true;
      saveGame();
    }
  }

  const renderKey=i+"|"+s.page;
  const stepChanged=guidedTutorialRenderKey!==renderKey;
  if(stepChanged){
    guidedTutorialRenderKey=renderKey;
    openTutorialPage(s.page);
  }
  panel.classList.add("show");mask.classList.add("show");
  document.getElementById("tutorialCount2").textContent=`TUTORIAL ${i+1}/${GUIDED_TUTORIAL.length}`;
  document.getElementById("tutorialTitle2").textContent=s.title;
  document.getElementById("tutorialText2").textContent=s.text;
  const obj=document.getElementById("tutorialObjective2");if(obj)obj.textContent="OBJECTIVE • "+(s.objective||"Continue training");
  document.getElementById("tutorialProgress2").style.width=((i+1)/GUIDED_TUTORIAL.length*100)+"%";
  document.getElementById("tutorialNext2").textContent=i===GUIDED_TUTORIAL.length-1?"FINISH":"NEXT ➜";
  if(stepChanged){
    clearTutSpot();
    setTimeout(()=>{
      const el=document.querySelector(s.sel);
      if(el){
        tutSpotEl=el;
        el.classList.add("tut-spot");

        el.scrollIntoView({
          behavior:g.settings.reducedMotion?"auto":"smooth",
          block:"center"
        });

        /* Build 10: keep tutorial panel away from the highlighted control */
        setTimeout(()=>{
          if(window.innerWidth<=560){
            const r=el.getBoundingClientRect();
            const targetMid=r.top+(r.height/2);

            if(targetMid>window.innerHeight*.50){
              panel.style.top="115px";
              panel.style.bottom="auto";
            }else{
              panel.style.top="auto";
              panel.style.bottom="102px";
            }
          }else{
            panel.style.top="";
            panel.style.bottom="";
          }
        },180);
      }
    },40);
  }
  /* Build 10: reattach tutorial spotlight after dynamic plant-list renders */
  setTimeout(()=>{
    const liveTarget=document.querySelector(s.sel);

    if(liveTarget && !liveTarget.classList.contains("tut-spot")){
      clearTutSpot();
      tutSpotEl=liveTarget;
      liveTarget.classList.add("tut-spot");
    }
  },0);

}
function nextGuidedTutorial(){
  if((g.finalTutorial.step||0)>=GUIDED_TUTORIAL.length-1){g.finalTutorial.done=true;saveGame();renderGuidedTutorial();toast("Tutorial complete!");return}
  g.finalTutorial.step=(g.finalTutorial.step||0)+1;saveGame();renderGuidedTutorial();
}
function prevGuidedTutorial(){g.finalTutorial.step=Math.max(0,(g.finalTutorial.step||0)-1);saveGame();renderGuidedTutorial()}
function skipGuidedTutorial(){g.finalTutorial.disabled=true;saveGame();renderGuidedTutorial();toast("Tutorial skipped")}
function restartGuidedTutorial(){guidedTutorialRenderKey=null;g.finalTutorial={step:0,done:false,disabled:false,autoStart:true};saveGame();renderGuidedTutorial()}

const FINAL_TUTORIAL_STEPS=[
{title:"Welcome to Riverbend",text:"Tap GENERATE POWER to produce your first electricity.",page:"home"},
{title:"Sell Electricity",text:"Use Sell All Power in Grid Controls to convert stored kWh into cash.",page:"home"},
{title:"Build Plants",text:"Open PLANTS and commission Diesel, Steam, Gas, Solar and Nuclear as you grow.",page:"plants"},
{title:"Expand the Grid",text:"Use MAP to connect new regions and unlock permanent production bonuses.",page:"map"},
{title:"Run Contracts",text:"Complete power contracts for large cash rewards and operator experience.",page:"home"},
{title:"Manage the Company",text:"HQ lets you hire staff, choose operating policies and research advanced technology.",page:"company"},
{title:"Build an Energy Empire",text:"Use Stats, Goals, Prestige and the live market to climb from Grid Rookie to Energy Mogul.",page:"stats"}
];
function renderFinalTutorial(){
  const box=document.getElementById("tutorialFinal");if(!box)return;
  if(g.finalTutorial.disabled||g.finalTutorial.done){box.classList.remove("show");return}
  const i=Math.max(0,Math.min(FINAL_TUTORIAL_STEPS.length-1,g.finalTutorial.step||0));
  const s=FINAL_TUTORIAL_STEPS[i];
  box.classList.add("show");
  document.getElementById("tutorialFinalStep").textContent="TUTORIAL "+(i+1)+"/"+FINAL_TUTORIAL_STEPS.length;
  document.getElementById("tutorialFinalTitle").textContent=s.title;
  document.getElementById("tutorialFinalText").textContent=s.text;
  const b=document.getElementById("tutorialFinalNext");if(b)b.textContent=i===FINAL_TUTORIAL_STEPS.length-1?"FINISH":"NEXT ➜";
}
function nextFinalTutorial(){
  const i=g.finalTutorial.step||0;
  if(i>=FINAL_TUTORIAL_STEPS.length-1){g.finalTutorial.done=true;saveGame();renderFinalTutorial();toast("Tutorial complete!");return}
  g.finalTutorial.step=i+1;
  const s=FINAL_TUTORIAL_STEPS[g.finalTutorial.step];
  saveGame();renderFinalTutorial();
  const nav=document.querySelector(`[data-nav="${s.page}"]`);
  if(nav)showPage(s.page,nav);
}
function skipFinalTutorial(){
  g.finalTutorial.disabled=true;saveGame();renderFinalTutorial();toast("Tutorial hidden");
}
function restartFinalTutorial(){
  g.finalTutorial={step:0,done:false,disabled:false};saveGame();renderFinalTutorial();
  const nav=document.querySelector('[data-nav="home"]');if(nav)showPage("home",nav);
}

function b10FleetHealth(){const states=PLANTS.map(p=>g.plants[p.id]).filter(x=>x&&x.unlocked);if(!states.length)return 100;return states.reduce((a,x)=>a+(x.condition||100),0)/states.length}
function b10ReserveMargin(){const demand=Math.max(.72,g.market?.demand||1),health=b10FleetHealth()/100,rel=(g.reliability||100)/100;return Math.max(3,Math.min(65,52-(demand-1)*75+(health-.75)*28+(rel-.8)*18))}
function renderB10CommandDeck(){
  const demand=Math.round((g.market?.demand||1)*100),reserve=b10ReserveMargin(),health=b10FleetHealth(),price=g.market?.price||1;
  const stress=Math.max(0,(demand-100)*1.4+(100-health)*.8+(20-reserve)*1.1);
  const alert=stress>42?"CRITICAL":stress>20?"ELEVATED":demand>112?"PEAK LOAD":"NORMAL";
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set("b10GridLoad",demand+"%");set("b10ReserveMargin",Math.round(reserve)+"%");set("b10FleetHealth",Math.round(health)+"%");set("b10MarketPrice","$"+price.toFixed(2)+"×");set("b10AlertState",alert);
  set("b10MarketSignal",g.market?.trend>0.01?"▲ RISING":g.market?.trend<-.01?"▼ FALLING":"● STABLE");
  const width=(id,v)=>{const el=document.getElementById(id);if(el)el.style.width=Math.max(4,Math.min(100,v))+"%"};
  width("b10GridLoadBar",demand/1.45);width("b10ReserveBar",reserve*1.55);width("b10HealthBar",health);
  document.body.classList.toggle("b10-grid-critical",alert==="CRITICAL");document.body.classList.toggle("b10-peak-load",alert==="PEAK LOAD"||alert==="ELEVATED");
}
function createB10Shift(nextId=(g.opsShift?.id||0)+1){
  const o=Math.max(1,output()),scale=Math.max(1,Math.pow(1.16,Math.max(0,nextId-1)));
  g.opsShift={id:nextId,generatedStart:g.generated||0,soldStart:g.sold||0,dispatchStart:g.dispatches||0,generatedTarget:Math.max(25,Math.round(o*24*scale)),soldTarget:Math.max(10,Math.round(o*10*scale)),dispatchTarget:Math.min(8,1+Math.floor((nextId-1)/3)),reward:Math.max(750,Math.round(netValuePerSecond()*180+nextId*400)),claimed:false,startedAt:Date.now()};
}
function ensureB10Shift(){if(!g.opsShift||!Number.isFinite(g.opsShift.generatedTarget)||g.opsShift.claimed)createB10Shift((g.opsShift?.id||0)+1)}
function b10ShiftProgress(){ensureB10Shift();const s=g.opsShift;return{generated:Math.max(0,(g.generated||0)-s.generatedStart),sold:Math.max(0,(g.sold||0)-s.soldStart),dispatch:Math.max(0,(g.dispatches||0)-s.dispatchStart)}}
function claimB10Shift(){const s=g.opsShift,p=b10ShiftProgress();if(p.generated<s.generatedTarget||p.sold<s.soldTarget||p.dispatch<s.dispatchTarget){toast("Complete all shift objectives first.");return}recordEarnedCash(s.reward);g.reputation+=6+Math.min(20,s.id);addXP(35+s.id*2);addLog("Operations Shift "+s.id+" completed for "+money(s.reward)+".");s.claimed=true;createB10Shift(s.id+1);saveGame();render();feedback("big");toast("🎛 Shift complete • "+money(s.reward))}
function renderB10Shift(){const el=document.getElementById("b10OpsShift");if(!el)return;const s=g.opsShift,p=b10ShiftProgress(),items=[["⚡ Generate",p.generated,s.generatedTarget,energy],["💵 Sell",p.sold,s.soldTarget,energy],["📡 Dispatch",p.dispatch,s.dispatchTarget,x=>Math.floor(x)+"×"]],ready=items.every(x=>x[1]>=x[2]);el.innerHTML=`<div class="b10-shift-summary"><div><small>SHIFT</small><strong>#${s.id}</strong></div><div><small>REWARD</small><strong>${money(s.reward)}</strong></div><div><small>STATUS</small><strong>${ready?"READY TO CLOSE":"IN PROGRESS"}</strong></div></div><div class="b10-shift-objectives">${items.map(([name,v,t,f])=>{const done=v>=t,pct=Math.min(100,v/t*100);return`<div class="b10-objective ${done?"done":""}"><div><span>${done?"✓":"○"} ${name}</span><b>${f(Math.min(v,t))} / ${f(t)}</b></div><div class="b10-objective-meter"><i style="width:${pct}%"></i></div></div>`}).join("")}</div><button class="btn ${ready?"green":"dark"}" style="width:100%;margin-top:10px" ${ready?"":"disabled"} onclick="claimB10Shift()">${ready?"CLOSE SHIFT • COLLECT "+money(s.reward):"COMPLETE SHIFT OBJECTIVES"}</button>`;const badge=document.getElementById("b10ShiftBadge");if(badge)badge.textContent=ready?"SHIFT READY":"ACTIVE SHIFT"}
function renderB10License(){const el=document.getElementById("b10LicenseProgress");if(!el)return;const cur=currentB10License(),next=nextB10License();let pct=100;if(next){const lp=Math.min(1,(g.operatorLevel||1)/next.level),cp=next.cash?Math.min(1,(g.lifetimeCash||0)/next.cash):1;pct=Math.min(lp,cp)*100}el.innerHTML=`<div class="b10-license-current"><div class="b10-license-icon">${cur.icon}</div><div><small>CURRENT AUTHORITY</small><strong>${cur.name}</strong><p>Permanent production authorization: +${Math.round((cur.bonus-1)*100)}%</p></div><span>LV ${g.operatorLevel}</span></div>${next?`<div class="b10-license-next"><div><span>NEXT • ${next.name}</span><b>+${Math.round((next.bonus-1)*100)}% OUTPUT</b></div><div class="b10-license-meter"><i style="width:${pct}%"></i></div><small>Requires Company Level ${next.level} and ${money(next.cash)} lifetime cash.</small></div>`:`<div class="b10-license-max">MAXIMUM GRID AUTHORITY ACHIEVED</div>`}`}

function renderCinematicHUD(){
  const eff=document.getElementById("cpEff"),rel=document.getElementById("cpRel"),out=document.getElementById("cpOut"),dem=document.getElementById("cpDemand");
  if(eff)eff.textContent=Math.round(totalMult()*100)+"%";
  if(rel)rel.textContent=Math.round(g.reliability||100)+"%";
  if(out)out.textContent=powerRate(output());
  if(dem)dem.textContent=Math.round((g.market?.demand||1)*100)+"%";
  const online=document.getElementById("cpOnline");if(online)online.textContent=g.event&&g.event.type==="breakdown"?"● UNIT TRIPPED":"● PLANT ONLINE";
  const condition=PLANTS.reduce((a,p)=>a+(g.plants[p.id].unlocked?g.plants[p.id].condition:0),0)/Math.max(1,PLANTS.filter(p=>g.plants[p.id].unlocked).length);
  ["cpFuelBar","cpTurbineBar","cpGeneratorBar","cpGridBar"].forEach((id,i)=>{const e=document.getElementById(id);if(e)e.style.width=Math.max(10,Math.min(100,condition-(i*2)))+"%"});
  const ft=document.getElementById("cpFuelText");if(ft)ft.textContent=fuelCostPerSecond()>0?money(fuelCostPerSecond())+"/s":"No fuel cost";
  const tt=document.getElementById("cpTurbineText");if(tt)tt.textContent=g.event&&g.event.type==="breakdown"?"Trip":"Online";
  const gt=document.getElementById("cpGeneratorText");if(gt)gt.textContent=Math.round(condition)+"% condition";
  const gr=document.getElementById("cpGridText");if(gr)gr.textContent=(g.reliability||100)>90?"Stable":"Watch";
}

function renderMegaSystems(){
  const price=g.market.price,trend=g.market.trend;
  const sp=document.getElementById("spotPrice");if(sp)sp.textContent="$"+price.toFixed(2)+"/kWh";
  const gd=document.getElementById("gridDemand");if(gd)gd.textContent=Math.round(g.market.demand*100)+"%";
  const rv=document.getElementById("reputationValue");if(rv)rv.textContent=Math.floor(g.reputation);
  const rel=document.getElementById("reliabilityValue");if(rel)rel.textContent=Math.round(g.reliability)+"%";
  const mt=document.getElementById("marketTrend");if(mt){mt.textContent=trend>=0?"▲ RISING":"▼ FALLING";mt.className=trend>=0?"market-up":"market-down"}
  const ab=document.getElementById("autoSellBtn");if(ab){ab.textContent="AUTO SELL: "+(g.autoSell?"ON":"OFF");ab.className="btn "+(g.autoSell?"green":"dark")}
  const cap=batteryCapacity(),bs=document.getElementById("batteryStored"),bm=document.getElementById("batteryMeter"),bc=document.getElementById("batteryCapacityText"),bl=document.getElementById("batteryLevel");
  if(bs)bs.textContent=energy(g.battery.stored);if(bm)bm.style.width=(cap?Math.min(100,g.battery.stored/cap*100):0)+"%";if(bc)bc.textContent="Capacity "+energy(cap);if(bl)bl.textContent="LV "+g.battery.level;
  const sc=document.getElementById("staffCount");if(sc)sc.textContent=Object.values(g.staff).reduce((a,b)=>a+b,0);
  const cr=document.getElementById("companyRating");if(cr)cr.textContent=companyRating();
  const ticker=document.getElementById("tickerText");if(ticker)ticker.textContent=`⚡ Spot ${"$"+price.toFixed(2)} • Demand ${Math.round(g.market.demand*100)}% • Reliability ${Math.round(g.reliability)}% • Reputation ${Math.floor(g.reputation)} • Company Rating ${companyRating()} • Battery ${energy(g.battery.stored)} / ${energy(cap)}`;
  const staffList=document.getElementById("staffList");
  if(staffList)staffList.innerHTML=STAFF_TYPES.map(t=>`<div class="uf-row"><div class="uf-staff-card"><div class="uf-avatar">${t.icon}</div><div><strong>${t.name} • LV ${g.staff[t.id]}</strong><small>${t.desc}</small></div></div><button class="uf-btn" onclick="hireStaff('${t.id}')">HIRE ${money(staffCost(t.id))}</button></div>`).join("");
  const policyList=document.getElementById("policyList");
  if(policyList)policyList.innerHTML=POLICIES.map(p=>`<div class="uf-panel ${g.policy===p.id?"uf-highlight":""}"><h4>${p.name}</h4><p>${p.desc}</p><button class="uf-btn ${g.policy===p.id?"green":"dark"}" onclick="setPolicy('${p.id}')">${g.policy===p.id?"ACTIVE":"SELECT"}</button></div>`).join("");
  const rt=document.getElementById("researchTree");
  if(rt)rt.innerHTML=RESEARCH.map((r,i)=>{const lv=g.research[r.id]||0,done=lv>=r.max,locked=g.lifetimeCash<(r.unlockAt||0);return`<div class="uf-node ${done?"done":""} ${locked?"locked":""}"><strong>${r.name} • LV ${lv}/${r.max}</strong><p>${r.desc}</p>${locked?`<small class="research-lock">UNLOCKS AT ${money(r.unlockAt)} LIFETIME</small>`:""}<button class="uf-btn ${done?"green":locked?"dark":"purple"}" ${done||locked?"disabled":""} onclick="buyResearch('${r.id}')">${done?"MAXED":locked?"LOCKED":"RESEARCH "+money(researchCost(r.id))}</button></div>`}).join("");
  const se=document.getElementById("statsEnergy");if(se)se.textContent=energy(g.generated);
  const scash=document.getElementById("statsCash");if(scash)scash.textContent=money(g.lifetimeCash);
  const scon=document.getElementById("statsContracts");if(scon)scon.textContent=g.contractsCompleted;
  const spr=document.getElementById("statsPrestige");if(spr)spr.textContent=g.prestige;
  const fs=document.getElementById("fleetStats");
  if(fs)fs.innerHTML=PLANTS.map(p=>{const s=g.plants[p.id];return`<div class="uf-row"><div><strong>${p.icon} ${p.name}</strong><small>${s.unlocked?"Level "+s.level+" • Mastery "+(s.mastery||0)+" • "+Math.round(s.condition)+"% condition":"Not commissioned"}</small></div><span class="uf-chip">${s.unlocked?powerRate(plantBaseContribution(p,s)):"LOCKED"}</span></div>`}).join("");
  updateWeekly();
  const wc=document.getElementById("weeklyChallenge");
  if(wc){const target=250000,p=Math.min(100,g.weekly.progress/target*100);wc.innerHTML=`<div class="uf-panel"><h4>Generate ${energy(target)} this week</h4><p>${energy(Math.min(g.weekly.progress,target))} / ${energy(target)}</p><div class="uf-meter"><i style="width:${p}%"></i></div><button class="uf-btn gold" style="margin-top:10px" onclick="claimWeekly()">${g.weekly.claimed?"CLAIMED":"CLAIM $50K"}</button></div>`}
}

const ENDGAME=EMPIRE_MILESTONES;

function beep(freq=520,duration=.05){
  if(!g.settings.sound)return;
  try{
    const A=window.AudioContext||window.webkitAudioContext;
    if(!A)return;
    const c=new A(),o=c.createOscillator(),v=c.createGain();
    o.frequency.value=freq;v.gain.value=.03;o.connect(v);v.connect(c.destination);o.start();
    v.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);
    o.stop(c.currentTime+duration);
  }catch(e){}
}
function feedback(type="tap"){
  if(g.settings.haptics&&navigator.vibrate)navigator.vibrate(type==="big"?45:15);
  beep(type==="big"?760:520,type==="big"?.08:.04);
}
function tutorialNext(){g.tutorialStep++;saveGame();renderTutorial()}
function renderTutorial(){
  const b=document.getElementById("tutorialBox"),title=document.getElementById("tutorialTitle"),text=document.getElementById("tutorialText");
  const steps=[
    ["Welcome to Riverbend","Tap GENERATE POWER to create electricity."],
    ["Sell to the Grid","Use Sell All Power to turn stored electricity into cash."],
    ["Build Your Fleet","Open PLANTS and commission the Diesel Generator, then Steam, Gas, Solar and Nuclear."],
    ["Run the Company","Complete contracts, maintain equipment, unlock regions, and earn operator XP."],
    ["You’re in Control","Reach $50,000 lifetime cash to prestige for permanent production bonuses."]
  ];
  if(g.tutorialStep>=steps.length){b.classList.remove("show");return}
  b.classList.add("show");title.textContent=steps[g.tutorialStep][0];text.textContent=steps[g.tutorialStep][1];
}
function toggleSetting(k){
  g.settings[k]=!g.settings[k];
  applySettings();saveGame();render();
}
function applySettings(){
  document.getElementById("soundToggle").textContent=g.settings.sound?"ON":"OFF";
  document.getElementById("hapticsToggle").textContent=g.settings.haptics?"ON":"OFF";
  document.getElementById("motionToggle").textContent=g.settings.reducedMotion?"ON":"OFF";
  document.getElementById("compactToggle").textContent=g.settings.compact?"ON":"OFF";
  document.getElementById("soundToggle").classList.toggle("on",g.settings.sound);
  document.getElementById("hapticsToggle").classList.toggle("on",g.settings.haptics);
  document.getElementById("motionToggle").classList.toggle("on",g.settings.reducedMotion);
  document.getElementById("compactToggle").classList.toggle("on",g.settings.compact);
  document.body.classList.toggle("reduced-motion",g.settings.reducedMotion);
}
function exportSave(){
  const data=btoa(unescape(encodeURIComponent(JSON.stringify(g))));
  navigator.clipboard?.writeText(data).then(()=>toast("Save copied to clipboard")).catch(()=>prompt("Copy your save code:",data));
}
function importSave(){
  const data=prompt("Paste your Power Plant Tycoon save code:");
  if(!data)return;
  try{
    const obj=JSON.parse(decodeURIComponent(escape(atob(data))));
    if(!obj||typeof obj!=="object")throw new Error("bad");
    g=obj;migrate();saveGame();render();toast("Save imported");
  }catch(e){toast("Invalid save code")}
}
let pendingConfirm=null;
function askConfirm(title,text,fn){
  pendingConfirm=fn;document.getElementById("confirmTitle").textContent=title;document.getElementById("confirmText").textContent=text;
  document.getElementById("confirmYes").onclick=()=>{const f=pendingConfirm;closeConfirm();if(f)f()};
  document.getElementById("confirmModal").classList.add("show");
}
function closeConfirm(){document.getElementById("confirmModal").classList.remove("show");pendingConfirm=null}
function renderEndgame(){
  const el=document.getElementById("endgameList");if(!el)return;
  el.innerHTML=ENDGAME.map(x=>{const v=x.value(),done=v>=x.target;return`<div class="questline empire-quest ${done?"done":""}"><div class="row"><span>${done?"✅":"⬜"} ${x.label}</span><span>${money(Math.min(v,x.target))}/${money(x.target)}</span></div><div class="small">${x.desc}</div><div class="milestone-meter"><i style="width:${Math.min(100,v/x.target*100)}%"></i></div></div>`}).join("");
  ENDGAME.forEach(x=>{if(x.value()>=x.target&&!g.empireNotified[x.id]){g.empireNotified[x.id]=true;addLog("Empire milestone reached: "+x.label);toast("🏆 "+x.label);saveGame()}});
}

function tapGenerate(){playPremiumSfx("generate");feedback("tap");const a=tapPower();g.stored+=a;g.generated+=a;addXP(.2);tutorialSignal("generate");render()}
// ===== AUTO GENERATE POWER =====
function toggleAutoGenerate(){
    if(!g.autoGenerateUnlocked){
        toast("Auto Generate is locked. Unlock it in the Store.");
        const storeNav=document.querySelector('[data-nav="store"]');
        if(typeof showPage==="function")showPage("store",storeNav);
        return;
    }

    g.autoGenerate = !g.autoGenerate;
    saveGame();
    render();
}

function completeAutoGeneratePurchase(fromStoreKit=false){
    g.autoGenerateUnlocked=true;
    g.autoGenerate=false;
    addLog(fromStoreKit?"Auto Generate entitlement verified by Apple StoreKit.":"Auto Generate browser test entitlement unlocked.");
    saveGame();
    render();
    toast("🤖 Auto Generate unlocked!");
}

function purchaseAutoGenerate(){
    if(g.autoGenerateUnlocked){
        toast("Auto Generate is already unlocked.");
        return;
    }
    if(nativeStoreKitAvailable()){
        setStoreKitStatus("Contacting the App Store…");
        postStoreKit("purchase",PPT_STOREKIT.products.autoGenerate);
        return;
    }
    // GitHub/browser preview keeps the existing test-purchase path.
    completeAutoGeneratePurchase(false);
}

function completeRemoveAdsPurchase(fromStoreKit=false){g.adsRemoved=true;addLog(fromStoreKit?"Remove Ads entitlement verified by Apple StoreKit.":"Remove Ads browser test entitlement unlocked.");saveGame();render();toast("🚫 Forced ads removed permanently!")}
function purchaseRemoveAds(){if(g.adsRemoved){toast("Remove Ads is already owned.");return}if(nativeStoreKitAvailable()){setStoreKitStatus("Contacting the App Store…");postStoreKit("purchase",PPT_STOREKIT.products.removeAds);return}completeRemoveAdsPurchase(false)}
function completeExecutiveLicensePurchase(fromStoreKit=false){g.executiveLicenseUnlocked=true;addLog(fromStoreKit?"Executive License verified by Apple StoreKit.":"Executive License browser test entitlement unlocked.");saveGame();render();toast("👔 Executive License activated!")}
function purchaseExecutiveLicense(){if(g.executiveLicenseUnlocked){toast("Executive License is already owned.");return}if(nativeStoreKitAvailable()){setStoreKitStatus("Contacting the App Store…");postStoreKit("purchase",PPT_STOREKIT.products.executiveLicense);return}completeExecutiveLicensePurchase(false)}
function purchaseConsumable(key){const id=PPT_STOREKIT.products[key];if(nativeStoreKitAvailable()){setStoreKitStatus("Contacting the App Store…");postStoreKit("purchase",id);return}const tx="browser-"+Date.now()+"-"+Math.random().toString(36).slice(2);if(applyConsumablePurchase(id,tx))toast("TEST PURCHASE • Pack delivered")}
function purchaseTurboGridPack(){purchaseConsumable("turboGrid")}
function purchaseMaintenanceCrate(){purchaseConsumable("maintenanceCrate")}
function purchaseCapitalInjection(){purchaseConsumable("capitalInjection")}
function renderMonetizationUI(){
  renderAutoGenerateUI();
  const native=nativeStoreKitAvailable();
  const permanent=[
    ["removeAdsPurchaseBtn","removeAds",!!g.adsRemoved,"gold"],
    ["executivePurchaseBtn","executiveLicense",!!g.executiveLicenseUnlocked,"purple"]
  ];
  permanent.forEach(([id,key,owned,cls])=>{const b=document.getElementById(id);if(!b)return;b.textContent=owned?"OWNED":(native?productPrice(key):"TEST BUY");b.disabled=owned;b.className="btn "+(owned?"dark":cls)});
  [["turboGridPurchaseBtn","turboGrid"],["maintenanceCratePurchaseBtn","maintenanceCrate"],["capitalInjectionPurchaseBtn","capitalInjection"]].forEach(([id,key])=>{const b=document.getElementById(id);if(b)b.textContent=native?productPrice(key):"TEST BUY"});
  const r=document.getElementById("restorePurchasesBtn");if(r)r.textContent=native?"RESTORE":"TEST RESTORE";
  const dev=document.getElementById("devTestStore");if(dev)dev.style.display=native?"none":"";
  const ad=document.getElementById("rewardedAdBtn");if(ad)ad.textContent=native?"WATCH AD":"TEST AD";
  document.body.classList.toggle("ads-removed",!!g.adsRemoved);
}

function renderAutoGenerateUI(){
    const btn=document.getElementById("autoGenerateBtn");
    if(btn){
        btn.classList.remove("locked","on");
        if(!g.autoGenerateUnlocked){
            btn.textContent="🔒 AUTO GENERATE";
            btn.classList.add("locked");
        }else if(g.autoGenerate){
            btn.textContent="🤖 AUTO GENERATE: ON";
            btn.classList.add("on");
        }else{
            btn.textContent="🤖 AUTO GENERATE: OFF";
        }
    }
    const buy=document.getElementById("autoGeneratePurchaseBtn");
    if(buy){
        const native=nativeStoreKitAvailable();
        const price=PPT_STOREKIT.prices[PPT_STOREKIT.products.autoGenerate];
        buy.textContent=g.autoGenerateUnlocked?"OWNED":(native?(price||"BUY"):"TEST BUY");
        buy.disabled=!!g.autoGenerateUnlocked;
        buy.className="btn "+(g.autoGenerateUnlocked?"dark":"purple");
    }
}

function runAutoGenerate(){
    if(!g.autoGenerateUnlocked || !g.autoGenerate) return;

    const amount = tapPower()*(1+(g.autoGenerateLevel||0)*.5);
    g.stored += amount;
    g.generated += amount;

    if(typeof addXP === "function"){
        addXP(.2);
    }
}

setInterval(runAutoGenerate, 1000);

function sellPower(){playPremiumSfx("cash");feedback("big");if(g.stored<=0){toast("Generate some power first.");return}const amount=g.stored,p=safeSaleMultiplier(),e=Math.min(1e300,amount*p);recordEarnedCash(e);g.sold=Math.min(1e300,g.sold+amount);addXP(saleXPGain(amount));addLog("Sold "+energy(amount)+" for "+money(e)+" at "+p.toFixed(2)+"× market value.");g.stored=0;tutorialSignal("sell");saveGame();render();toast("Grid sale: "+money(e))}
function upgradeTap(){const c=tapUpgradeCost();if(g.cash<c){toast("Need "+money(c));return}g.cash-=c;g.tapLevel++;addXP(4);addLog("Manual generator upgraded to Level "+(g.tapLevel+1)+".");saveGame();render()}function buildPlant(id){playPremiumSfx("upgrade");feedback("big");const p=PLANTS.find(x=>x.id===id),s=g.plants[id],c=plantCost(p);if(g.cash<c){toast("Need "+money(c));return}g.cash-=c;if(!s.unlocked){s.unlocked=true;if(p.scene!==false)g.viewStage=id;s.level=1;s.condition=100;addXP(20);addLog(p.name+" commissioned.");if(id==="diesel")tutorialSignal("build_diesel");toast(p.name+" ONLINE!")}else{s.level++;s.condition=Math.min(100,s.condition+8);addXP(10);addLog(p.name+" upgraded to Level "+s.level+".")}saveGame();render()}
function masterPlant(id){const p=PLANTS.find(x=>x.id===id),s=g.plants[id];if(!p||!s?.unlocked)return;const need=masteryRequirement(s),cost=masteryCost(p,s);if((s.mastery||0)>=5){toast("Maximum mastery reached.");return}if(s.level<need){toast("Reach Level "+need+" to earn the next mastery.");return}if(g.cash<cost){toast("Mastery requires "+money(cost));return}g.cash-=cost;s.mastery=(s.mastery||0)+1;g.reputation+=25;addXP(100);addLog(p.name+" reached Mastery "+s.mastery+".");saveGame();render();feedback("big");toast("⭐ "+p.name+" MASTERY "+s.mastery)}
function reqMet(req={}){if(req.lifetime&&g.lifetimeCash<req.lifetime)return false;if(req.output&&output()<req.output)return false;if(req.contracts&&g.contractsCompleted<req.contracts)return false;if(req.reputation&&g.reputation<req.reputation)return false;if(req.reliability&&g.reliability<req.reliability)return false;if(req.projects&&completedMegaProjects()<req.projects)return false;if(req.region&&!g.regions[req.region])return false;if(req.plant&&!g.plants[req.plant]?.unlocked)return false;return true}
function reqText(req={}){const a=[];if(req.lifetime)a.push(money(req.lifetime)+" lifetime");if(req.output)a.push(powerRate(req.output)+" output");if(req.contracts)a.push(req.contracts+" contracts");if(req.reputation)a.push(req.reputation+" reputation");if(req.reliability)a.push(req.reliability+"% reliability");if(req.projects)a.push(req.projects+" projects");if(req.region){const r=REGIONS.find(x=>x.id===req.region);a.push((r?r.name:req.region)+" connected")}if(req.plant){const p=PLANTS.find(x=>x.id===req.plant);a.push((p?p.name:req.plant)+" online")}return a.join(" • ")}
function buyRegion(id){feedback("big");const r=REGIONS.find(x=>x.id===id);if(g.regions[id])return;if(!reqMet(r.req||{})){toast("Requirements: "+reqText(r.req||{}));return}if(g.cash<r.cost){toast("Need "+money(r.cost));return}g.cash-=r.cost;g.regions[id]=true;addXP(30);addLog(r.name+" connected to company grid.");saveGame();render()}
function performMaintenance(){const c=maintenanceCost();if(g.cash<c){toast("Maintenance requires "+money(c));return}g.cash-=c;g.maintenance=100;PLANTS.forEach(p=>{const s=g.plants[p.id];if(s.unlocked)s.condition=Math.min(100,s.condition+35+g.engineers*5)});addXP(10);addLog("Scheduled maintenance completed.");saveGame();render()}
function hireEngineer(){const c=engineerCost();if(g.cash<c){toast("Engineer costs "+money(c));return}g.cash-=c;g.engineers++;addXP(15);addLog("Maintenance engineer hired.");saveGame();render()}
function buyCorporate(id){const up=CORPORATE.find(x=>x.id===id);if((g.corporate[id]||0)>=25){toast("Corporate upgrade maxed at Level 25.");return}const c=corporateCost(up);if(g.cash<c){toast("Need "+money(c));return}g.cash-=c;g.corporate[id]++;addXP(20);addLog(up.name+" upgraded to Level "+g.corporate[id]+".");saveGame();render()}
function startContract(id){if(g.activeContract){toast("Finish the current contract first.");return}const c=CONTRACTS.find(x=>x.id===id);if(output()<c.required){toast("Requires "+powerRate(c.required)+" output.");return}if(c.reliability&&g.reliability<c.reliability){toast("Requires "+c.reliability+"% reliability.");return}if(c.contracts&&g.contractsCompleted<c.contracts){toast("Complete "+c.contracts+" contracts first.");return}if(c.projects&&completedMegaProjects()<c.projects){toast("Complete "+c.projects+" mega projects first.");return}if(c.region&&!g.regions[c.region]){toast("Connect "+REGIONS.find(r=>r.id===c.region).name+" first.");return}g.activeContract={id:c.id,name:c.name,rate:c.rate,reward:c.reward,end:Date.now()+c.duration*1000};addLog("Contract started: "+c.name+".");saveGame();render()}
function updateContract(){if(g.activeContract&&Date.now()>=g.activeContract.end){const c=g.activeContract;recordEarnedCash(c.reward);g.contractsCompleted++;addXP(40);addLog("Contract completed: "+c.name+" +"+money(c.reward)+".");g.activeContract=null;markInterstitialOpportunity();toast("Contract complete! "+money(c.reward));saveGame()}}
function missionValue(m){if(m.type==="generated")return g.generated;if(m.type==="lifetimeCash")return g.lifetimeCash;if(m.type==="levels")return totalLevels();if(m.type==="output")return output();if(m.type==="contracts")return g.contractsCompleted;if(m.type==="masteries")return totalMasteries();if(m.type==="projects")return completedMegaProjects();if(m.type==="regions")return Object.values(g.regions).filter(Boolean).length;return 0}function claimMission(id){const m=MISSIONS.find(x=>x.id===id);if(g.missions[id]||missionValue(m)<m.target)return;g.missions[id]=true;recordEarnedCash(m.reward);addXP(15);addLog("Mission completed: "+m.label);saveGame();render()}
function achievementValue(a){if(a.type==="generated")return g.generated;if(a.type==="regions")return Object.values(g.regions).filter(Boolean).length;if(a.type==="lifetimeCash")return g.lifetimeCash;if(a.type==="operator")return g.operatorLevel;if(a.type==="megaProjects")return completedMegaProjects();if(a.type==="plant")return g.plants[a.plant]?.unlocked?1:0;if(a.type==="region")return g.regions[a.region]?1:0;if(a.type==="masteries")return totalMasteries();if(a.type==="contracts")return g.contractsCompleted;if(a.type==="empireLevel")return g.empireLevel||0;return 0}function updateAchievements(){ACH.forEach(a=>{if(!g.achievements[a.id]&&achievementValue(a)>=a.target){g.achievements[a.id]=true;addLog("Achievement unlocked: "+a.label);toast("🏆 "+a.label)}})}
function dailyReward(){
  const now=Date.now(),today=dayStamp(now),last=g.dailyStreak?.lastClaimDay;
  if(last===today){toast("Daily supply drop already claimed.");return}
  let count=g.dailyStreak?.count||0;
  if(last){const lastDate=new Date(last+"T12:00:00"),todayDate=new Date(today+"T12:00:00"),days=Math.round((todayDate-lastDate)/86400000);count=days===1?Math.min(7,count+1):1}else count=1;
  const mult=[1,1.35,1.75,2.25,3,4,6][count-1]||1;
  const r=Math.max(500,Math.round((750+output()*180)*mult));
  recordEarnedCash(r);g.lastDaily=now;g.dailyStreak={count,lastClaimDay:today};addXP(5+count*2);addLog("Day "+count+" supply drop received: "+money(r));saveGame();render();toast("🎁 Day "+count+" reward: "+money(r));
}
function activateBoost(){if(Date.now()<g.boostUntil){toast("2× boost is already active.");return}g.boostUntil=Date.now()+10*60*1000;addLog("Grid output boost activated.");saveGame();render()}function maintenancePack(){toast("TEST PURCHASE • Maintenance Pack");g.maintenance=100;PLANTS.forEach(p=>{if(g.plants[p.id].unlocked)g.plants[p.id].condition=100});saveGame();render()}function starterPack(){toast("TEST PURCHASE • Starter Pack");if(g.starter){toast("Starter Pack already claimed.");return}g.starter=true;recordEarnedCash(5000);g.boostUntil=Math.max(g.boostUntil,Date.now()+10*60*1000);saveGame();render()}
function prestigeRequirement(){const p=Math.max(0,g.prestige||0);return Math.min(1e300,50000*Math.pow(2.2,Math.min(p,12))*Math.pow(1.22,Math.max(0,p-12)))}
function prestige(){const req=prestigeRequirement(),run=g.prestigeRunCash||0;if(run<req){toast("This run needs "+money(req)+" earned. Current run: "+money(run));return}const credits=prestigeCreditReward(),next=(g.prestige||0)+1;askConfirm("Prestige Company","Reset this operating run and earn "+credits+" Grid Credit"+(credits===1?"":"s")+"? Lifetime empire progress, Mega Projects, purchases and Legacy upgrades remain.",()=>{const keep={achievements:g.achievements,settings:g.settings,autoGenerateUnlocked:g.autoGenerateUnlocked,autoGenerateLevel:g.autoGenerateLevel,adsRemoved:g.adsRemoved,executiveLicenseUnlocked:g.executiveLicenseUnlocked,processedStoreTransactions:g.processedStoreTransactions,megaProjects:g.megaProjects,empireLevel:g.empireLevel,empireNotified:g.empireNotified,dailyStreak:g.dailyStreak,lifetimeCash:g.lifetimeCash,gridCredits:(g.gridCredits||0)+credits,lifetimeGridCredits:(g.lifetimeGridCredits||0)+credits,legacy:g.legacy,stabilityVersion:21};g=defaultGame();Object.assign(g,keep);g.prestige=next;g.prestigeRunCash=0;g.tutorialStep=5;g.finalTutorial={step:0,done:true,disabled:true};g.log=["Company prestiged to tier "+next+" • +"+credits+" Grid Credits."];saveGame();render();feedback("big")})}
function resetGame(){askConfirm("Erase Save?","This permanently resets your local Power Plant Tycoon progress.",()=>{const keep={autoGenerateUnlocked:g.autoGenerateUnlocked,adsRemoved:g.adsRemoved,executiveLicenseUnlocked:g.executiveLicenseUnlocked,processedStoreTransactions:g.processedStoreTransactions};localStorage.removeItem("PPT_V5");g=defaultGame();Object.assign(g,keep);saveGame();render();if(nativeStoreKitAvailable())requestStoreKitStatus();toast("Save reset")})}
function buyMegaProject(id){
  const p=MEGA_PROJECTS.find(x=>x.id===id);if(!p)return;if(g.megaProjects[p.id]){toast("Mega project already completed.");return}
  if(g.lifetimeCash<(p.unlockAt||0)){toast("Project unlocks at "+money(p.unlockAt)+" lifetime cash.");return}
  if(!reqMet(p.req||{})){toast("Requirements: "+reqText(p.req||{}));return}
  if(g.cash<p.cost){toast("Need "+money(p.cost));return}
  g.cash-=p.cost;g.megaProjects[p.id]=true;g.reputation+=50;addXP(150);addLog("Mega project completed: "+p.name+".");saveGame();render();feedback("big");toast("🌐 "+p.name+" ONLINE");
}
function buyEmpireLevel(){
  const c=empireLevelCost(),life=empireLevelLifetimeRequirement(),projects=empireLevelProjectRequirement();
  if(g.lifetimeCash<life){toast("Empire Level requires "+money(life)+" lifetime cash.");return}
  if(completedMegaProjects()<projects){toast("Complete "+projects+" mega projects first.");return}
  if(g.cash<c){toast("Empire Level requires "+money(c));return}
  g.cash-=c;g.empireLevel=(g.empireLevel||0)+1;g.reputation+=100;addXP(250);addLog("Empire Level advanced to "+g.empireLevel+". Empire bonuses now use diminishing long-game scaling.");saveGame();render();feedback("big");
}
function upgradeAutoGenerate(){
  if(!g.autoGenerateUnlocked){toast("Unlock Auto Generate in the Store first.");return}
  const c=autoGenerateUpgradeCost();if(g.cash<c){toast("Automation upgrade requires "+money(c));return}
  g.cash-=c;g.autoGenerateLevel=(g.autoGenerateLevel||0)+1;addXP(20);addLog("Automation Core upgraded to Level "+g.autoGenerateLevel+".");saveGame();render();
}
function restorePurchases(){
  if(nativeStoreKitAvailable()){
    setStoreKitStatus("Restoring Apple purchases…");
    postStoreKit("restore");
    return;
  }
  const owned=[];if(g.autoGenerateUnlocked)owned.push("Auto Generate");if(g.adsRemoved)owned.push("Remove Ads");if(g.executiveLicenseUnlocked)owned.push("Executive License");toast(owned.length?"✓ Browser test entitlements: "+owned.join(", "):"No browser test entitlements found.");
}
function restorePurchasesTest(){restorePurchases()}
function renderDailyStreak(){
  const el=document.getElementById("dailyStreakUI");if(!el)return;
  const count=g.dailyStreak?.count||0,today=dayStamp(),claimed=g.dailyStreak?.lastClaimDay===today;
  el.innerHTML=`<div class="streak-days">${[1,2,3,4,5,6,7].map(d=>`<div class="streak-day ${d<=count?"done":""} ${d===Math.min(7,count+1)&&!claimed?"next":""}"><b>D${d}</b><small>${["1×","1.35×","1.75×","2.25×","3×","4×","6×"][d-1]}</small></div>`).join("")}</div><p class="small">${claimed?"Today’s drop claimed. Come back tomorrow to continue the streak.":"Claim today’s drop. Consecutive days increase the reward up to 6×."}</p>`;
  const b=document.getElementById("dailyClaimBtn");if(b){b.disabled=claimed;b.textContent=claimed?"CLAIMED TODAY":"CLAIM DAILY DROP";b.className="btn "+(claimed?"dark":"green")}
}
function renderEmpireSystems(){
  const tier=companyTier(),next=nextCompanyTier(),mega=completedMegaProjects(),bonus=empireBonusMult();
  const tierEl=document.getElementById("empireTier");if(tierEl)tierEl.textContent=tier;
  const mult=document.getElementById("empireMultiplier");if(mult)mult.textContent=bonus.toFixed(2)+"×";
  const lvl=document.getElementById("empireLevelLabel");if(lvl)lvl.textContent="Empire LV "+(g.empireLevel||0);
  const nextEl=document.getElementById("empireNextMilestone");if(nextEl)nextEl.textContent=next?"Next tier: "+money(next.at):"Top tier reached • Empire Levels continue";
  const bar=document.getElementById("empireProgressBar");if(bar){let prev=0,target=next?next.at:Math.max(1,g.lifetimeCash);COMPANY_TIERS.forEach(x=>{if(x.at<=g.lifetimeCash)prev=x.at});bar.style.width=(next?Math.max(2,Math.min(100,(g.lifetimeCash-prev)/(target-prev)*100)):100)+"%"}
  const megaEl=document.getElementById("megaProjectList");if(megaEl)megaEl.innerHTML=MEGA_PROJECTS.map(p=>{const done=!!g.megaProjects[p.id],lifeOk=g.lifetimeCash>=(p.unlockAt||0),reqOk=reqMet(p.req||{}),locked=!(lifeOk&&reqOk)&&!done;return`<div class="mega-project ${done?"done":""}"><div class="mega-icon">${p.icon}</div><div class="mega-copy"><strong>${p.name}</strong><small>${p.desc}</small>${!done&&locked?`<small class="gate-text">${!lifeOk?"UNLOCKS AT "+money(p.unlockAt):"REQUIRES: "+reqText(p.req||{})}</small>`:""}<div class="mega-cost">${done?"COMPLETED":money(p.cost)}</div></div><button class="btn ${done?"green":locked?"dark":"purple"}" ${done||locked?"disabled":""} onclick="buyMegaProject('${p.id}')">${done?"ONLINE":locked?"LOCKED":"BUILD"}</button></div>`}).join("");
  const auto=document.getElementById("automationCore");if(auto){const lv=g.autoGenerateLevel||0,boost=1+lv*.5,c=autoGenerateUpgradeCost();auto.innerHTML=`<div class="automation-core"><div><small>STATUS</small><strong>${g.autoGenerateUnlocked?(g.autoGenerate?"ONLINE":"READY"):"LOCKED"}</strong></div><div><small>CORE LEVEL</small><strong>LV ${lv}</strong></div><div><small>AUTO TAP POWER</small><strong>${boost.toFixed(1)}×</strong></div></div><p class="small">Each Core Level adds +50% to every automatic generation cycle. This upgrade uses normal in-game cash.</p><button class="btn ${g.autoGenerateUnlocked?"blue":"dark"}" style="width:100%" ${g.autoGenerateUnlocked?"":"disabled"} onclick="upgradeAutoGenerate()">${g.autoGenerateUnlocked?"UPGRADE CORE • "+money(c):"UNLOCK AUTO GENERATE IN STORE"}</button>`}
  const asc=document.getElementById("empireAscension");if(asc){const c=empireLevelCost(),life=empireLevelLifetimeRequirement(),projects=empireLevelProjectRequirement(),ready=g.lifetimeCash>=life&&completedMegaProjects()>=projects;asc.innerHTML=`<div class="ascension-grid"><div><small>CURRENT LEVEL</small><strong>${g.empireLevel||0}</strong></div><div><small>PERMANENT BONUS</small><strong>+${Math.round((empireLevelMult()-1)*100)}%</strong></div><div><small>NEXT LEVEL</small><strong>${money(c)}</strong></div></div><p class="small">Empire Levels are late-game ascensions. Each level adds a permanent diminishing-return production bonus and survives prestige.</p><div class="empire-gate">Requires ${money(life)} lifetime cash • ${projects} mega projects</div><button class="btn ${ready?"gold":"dark"}" style="width:100%" ${ready?"":"disabled"} onclick="buyEmpireLevel()">${ready?"ADVANCE EMPIRE LEVEL":"ASCENSION LOCKED"}</button>`}
  const board=document.getElementById("boardroomStatus");if(board)board.innerHTML=`<div class="board-grid"><div><small>COMPANY TIER</small><strong>${tier}</strong></div><div><small>MEGA PROJECTS</small><strong>${mega}/${MEGA_PROJECTS.length}</strong></div><div><small>EMPIRE LEVEL</small><strong>${g.empireLevel||0}</strong></div><div><small>GRID CREDITS</small><strong>${num(g.gridCredits||0)}</strong></div><div><small>PRESTIGE</small><strong>${g.prestige||0}</strong></div><div><small>FLEET MASTERIES</small><strong>${totalMasteries()}</strong></div></div>`;
  const legacy=document.getElementById("legacyGrid");if(legacy){const nextM=nextPrestigeMilestone();legacy.innerHTML=`<div class="legacy-summary"><div><small>GRID CREDITS</small><strong>${num(g.gridCredits||0)}</strong></div><div><small>LIFETIME CREDITS</small><strong>${num(g.lifetimeGridCredits||0)}</strong></div><div><small>NEXT PRESTIGE</small><strong>${prestigeCreditReward()} GC</strong></div><div><small>MILESTONE</small><strong>${nextM?"P"+nextM:"P1000+"}</strong></div></div><p class="small">Grid Credits survive prestige and fund permanent Legacy Grid upgrades. They cannot be bought with cash.</p>${LEGACY_UPGRADES.map(u=>{const lv=g.legacy[u.id]||0,c=legacyUpgradeCost(u),maxed=lv>=u.max;return`<div class="legacy-upgrade"><div class="legacy-icon">${u.icon}</div><div><strong>${u.name} • LV ${lv}</strong><small>${u.desc}</small></div><button class="btn ${maxed?"dark":g.gridCredits>=c?"gold":"dark"}" ${maxed||g.gridCredits<c?"disabled":""} onclick="buyLegacyUpgrade('${u.id}')">${maxed?"MAX":c+" GC"}</button></div>`}).join("")}`;}
  const st=document.getElementById("statsTier");if(st)st.textContent=tier;const sp=document.getElementById("statsProjects");if(sp)sp.textContent=mega+"/"+MEGA_PROJECTS.length;const sl=document.getElementById("statsEmpireLevel");if(sl)sl.textContent=g.empireLevel||0;const sb=document.getElementById("statsEmpireBonus");if(sb)sb.textContent="+"+Math.round((bonus-1)*100)+"%";
  renderNextPhase();
  renderDailyStreak();
}

function renderNextPhase(){
  const el=document.getElementById("nextPhase");if(!el)return;
  const phases=[
    {name:"INTERCONNECT ERA",cash:65000000,output:5000,contracts:8,projects:0},
    {name:"CONTINENTAL POWER",cash:1000000000,output:75000,contracts:18,projects:2},
    {name:"GLOBAL ENERGY",cash:25000000000,output:1000000,contracts:35,projects:4},
    {name:"PLANETARY GRID",cash:1000000000000,output:25000000,contracts:70,projects:6},
    {name:"ENERGY DYNASTY",cash:100000000000000,output:500000000,contracts:120,projects:9},
    {name:"GRID SOVEREIGN",cash:100000000000000000,output:5000000000,contracts:200,projects:11},
    {name:"HELIOS AUTHORITY",cash:1e18,output:20000000000,contracts:280,projects:11},
    {name:"STELLAR GRID",cash:1e21,output:1000000000000,contracts:500,projects:11},
    {name:"DEEP SPACE ENERGY",cash:1e24,output:50000000000000,contracts:800,projects:11}
  ];
  const p=phases.find(x=>g.lifetimeCash<x.cash||output()<x.output||g.contractsCompleted<x.contracts||completedMegaProjects()<x.projects)||phases[phases.length-1];
  const items=[["Lifetime",g.lifetimeCash,p.cash,money],["Output",output(),p.output,powerRate],["Contracts",g.contractsCompleted,p.contracts,x=>Math.floor(x)],["Mega Projects",completedMegaProjects(),p.projects,x=>Math.floor(x)]];
  el.innerHTML=`<div class="phase-head"><div><small>NEXT STRATEGIC PHASE</small><strong>${p.name}</strong></div><span>${companyTier()}</span></div><div class="phase-grid">${items.map(([n,v,t,f])=>{const done=v>=t,pct=t?Math.min(100,v/t*100):100;return`<div class="phase-item ${done?"done":""}"><div><span>${done?"✓":"○"} ${n}</span><b>${f(v)} / ${f(t)}</b></div><div class="phase-meter"><i style="width:${pct}%"></i></div></div>`}).join("")}</div>`;
}

function createEvent(){if(g.event||Date.now()<g.eventCooldown||output()<=0||Math.random()>.03)return;const r=Math.random();if(r<.4)g.event={type:"breakdown",title:"⚠ Turbine Breakdown",text:"Automatic production reduced by 50%.",cost:Math.max(300,output()*35)};else if(r<.72)g.event={type:"surge",title:"📈 Demand Surge",text:"Grid demand is elevated. Power sells for 75% more.",expires:Date.now()+60000};else g.event={type:"inspection",title:"🦺 Safety Inspection",text:"Complete the inspection for a cash and XP bonus.",reward:Math.max(150,output()*20)};g.eventCooldown=Date.now()+90000;addLog(g.event.title);render()}
function resolveEvent(){if(!g.event)return;if(g.event.type==="breakdown"){if(g.cash<g.event.cost){toast("Repair requires "+money(g.event.cost));return}g.cash-=g.event.cost;g.maintenance=Math.max(60,g.maintenance-5);g.event=null;addXP(8)}else if(g.event.type==="inspection"){const r=g.event.reward;recordEarnedCash(r);g.event=null;addXP(15)}else g.event=null;saveGame();render()}
function updateEvent(){if(g.event&&g.event.type==="surge"&&Date.now()>g.event.expires)g.event=null}
function updateDayNight(){const n=Math.floor(Date.now()/45000)%2===1;document.body.classList.toggle("night",n);document.getElementById("weather").textContent=n?"🌙 NIGHT SHIFT":"☀ CLEAR"}
function setVisual(id,on,l=1){const e=document.getElementById(id);if(!e)return;e.classList.toggle("hidden",!on);e.style.filter=on&&l>=8?"brightness(1.18) drop-shadow(0 0 12px #ffd24d55)":on&&l>=3?"brightness(1.08) drop-shadow(0 0 7px #4de3ff44)":""}
function tag(id,on,text){const e=document.getElementById(id);e.classList.toggle("show",!!on);if(on)e.textContent=text}
function selectStageView(id){
  const state=g.plants[id],def=PLANTS.find(x=>x.id===id);
  if(!state||!state.unlocked){toast("Commission this plant first.");return}
  if(!def||def.scene===false){toast(def.name+" is managed from the fleet screen.");return}
  g.viewStage=id;saveGame();render();toast("Viewing "+def.name);
}
function updateFacility(){
  const d=g.plants.diesel,s=g.plants.steam,ga=g.plants.gas,so=g.plants.solar,n=g.plants.nuclear;
  const yard=document.querySelector(".yard");

  let highest="starter";
  if(d.unlocked)highest="diesel";
  if(s.unlocked)highest="steam";
  if(ga.unlocked)highest="gas";
  if(so.unlocked)highest="solar";
  if(n.unlocked)highest="nuclear";

let stage=highest;

/* Automatically follow progression when a new plant is unlocked */
if(g.viewStage && g.plants[g.viewStage] && g.plants[g.viewStage].unlocked){
  const order=["diesel","steam","gas","solar","nuclear"];
  const viewedIndex=order.indexOf(g.viewStage);
  const highestIndex=order.indexOf(highest);

  if(viewedIndex>=highestIndex){
    stage=g.viewStage;
  }else{
    g.viewStage=highest;
    stage=highest;
  }
}

if(stage==="starter"){
  g.viewStage=null;
}else{
  g.viewStage=stage;
}  if(stage==="starter")g.viewStage=null;

  if(yard){
    ["stage-diesel","stage-steam","stage-gas","stage-solar","stage-nuclear","premium-steam","premium-nuclear","tier-1","tier-2","tier-3","tier-4"].forEach(c=>yard.classList.remove(c));
    if(stage!=="starter")yard.classList.add("stage-"+stage);

    const state=stage==="starter"?null:g.plants[stage];
    const lv=state?state.level:0;
    const tier=lv>=20?4:lv>=10?3:lv>=5?2:1;
    yard.classList.add("tier-"+tier);
  }

  document.body.classList.toggle("breakdown",!!(g.event&&g.event.type==="breakdown"));

  const stageMap=[["cpDiesel","diesel",d],["cpSteam","steam",s],["cpGas","gas",ga],["cpSolar","solar",so],["cpNuclear","nuclear",n]];
  stageMap.forEach(([id,key,p])=>{
    const el=document.getElementById(id);if(!el)return;
    el.classList.toggle("active",stage===key);
    el.classList.toggle("locked",!p.unlocked);
    el.disabled=!p.unlocked;
    el.setAttribute("aria-pressed",stage===key?"true":"false");
    el.setAttribute("aria-label",p.unlocked?("View "+PLANTS.find(x=>x.id===key).name):(PLANTS.find(x=>x.id===key).name+" locked"));
  });

  let label="RIVERBEND STARTER SITE",sub="Build your first generating unit.";
  if(stage==="diesel"){label="DIESEL GENERATION YARD";sub="Diesel generation operating";}
  if(stage==="steam"){label="RIVERBEND STEAM STATION";sub="Steam power generation online";}
  if(stage==="gas"){label="COMBINED-CYCLE COMPLEX";sub="Gas and steam generation online";}
  if(stage==="solar"){label="RIVERBEND ENERGY CAMPUS";sub="Solar expansion and thermal generation online";}
  if(stage==="nuclear"){label="RIVERBEND ENERGY MEGACOMPLEX";sub="Nuclear baseload complex online";}

  const viewed=stage==="starter"?null:g.plants[stage];
  const tier=viewed?(viewed.level>=20?4:viewed.level>=10?3:viewed.level>=5?2:1):0;
  const badge=document.getElementById("viewStageBadge");
  if(badge)badge.textContent=stage==="starter"?"STARTER SITE":`${label} • LEVEL ${viewed.level} • TIER ${tier}`;

  const lab=document.getElementById("stageArtLabel");if(lab)lab.textContent=label;
  const sceneSub=document.getElementById("sceneSub");if(sceneSub)sceneSub.textContent=sub;
}
function showPage(id,b){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));document.querySelectorAll(".nav button").forEach(x=>x.classList.remove("active"));if(b)b.classList.add("active");window.scrollTo({top:0,behavior:"smooth"});tutorialSignal("open_"+id);setTimeout(tryShowPendingInterstitial,450)}
function renderPlants(){
  document.getElementById("plantList").innerHTML=PLANTS.map(p=>{
    const s=g.plants[p.id],c=plantCost(p);
    const level=s.level||0,tier=level>=50?5:level>=20?4:level>=10?3:level>=5?2:1,mastery=s.mastery||0;
    const need=masteryRequirement(s),mc=masteryCost(p,s),masterMax=mastery>=5,canMaster=s.unlocked&&!masterMax&&level>=need;
    const bg=p.thumb?`images/thumbs/${p.thumb}.jpg`:`images/thumbs/${p.id}.jpg`;
    return `<div class="asset plant-v7 ${p.scene===false?"strategic-asset":""}">
      <div class="plant-card-bg" style="background-image:url('${bg}')"></div>
      <div class="plant-card-shade"></div>
      <div class="plant-card-content">
        <div class="plant-card-top">
          <div class="plant-card-name">${p.icon} ${p.name}<small class="plant-era">${p.era||"GENERATION"}</small></div>
          <span class="plant-card-level">${s.unlocked?"LV "+level+" • TIER "+tier:"LOCKED"}</span>
        </div>
        <div class="plant-card-meta">${s.unlocked?Math.round(s.condition)+"% condition • Mastery "+mastery+"/5":"Commission at "+money(p.unlock)}</div>
        <div class="plant-card-output">${s.unlocked?"Fleet contribution "+powerRate(plantBaseContribution(p,s)*totalMult()):"Unlock to add this technology to your generation portfolio"}</div>
        ${s.unlocked?`<div class="mastery-strip"><span>⭐ MASTERY ${mastery}/5</span><small>${masterMax?"MAXIMUM MASTERY":level<need?"NEXT AT LV "+need:money(mc)}</small></div>`:""}
        <div class="plant-card-actions">
          <button ${p.id==="diesel" && !s.unlocked?'data-tutorial="build-diesel"':""} class="${p.id==="diesel" && !s.unlocked && g.finalTutorial && !g.finalTutorial.disabled && !g.finalTutorial.done && g.finalTutorial.step===3 ? "tut-spot" : ""}" onclick="buildPlant('${p.id}')">${s.unlocked?"UPGRADE "+money(c):"BUILD "+money(c)}</button>
          ${s.unlocked&&p.scene!==false?`<button class="view-btn" onclick="selectStageView('${p.id}');showPage('home',document.querySelector('[data-nav=home]'))">VIEW</button>`:""}
          ${s.unlocked&&!masterMax?`<button class="master-btn ${canMaster?"ready":""}" ${canMaster?"":"disabled"} onclick="masterPlant('${p.id}')">${level<need?"MASTERY AT LV "+need:"MASTER "+money(mc)}</button>`:""}
        </div>
      </div>
    </div>`
  }).join("")
}
function renderCorporate(){document.getElementById("corporateUpgradeList").innerHTML=CORPORATE.map(u=>`<div class="asset"><div class="asset-icon">⚙️</div><div><div class="asset-name">${u.name}</div><div class="asset-meta">${u.desc}</div></div><button ${g.corporate[u.id]>=25?'disabled':''} onclick="buyCorporate('${u.id}')">${g.corporate[u.id]>=25?'MAX':'LV '+g.corporate[u.id]+'<br>'+money(corporateCost(u))}</button></div>`).join("")}
function renderRegions(){
  document.getElementById("regionList").innerHTML=REGIONS.map(r=>{const ok=reqMet(r.req||{}),owned=!!g.regions[r.id];return`<div class="region ${owned?"":"locked"}">
    <div class="region-icon">${r.emoji}</div>
    <h4>${r.name}</h4>
    <p>${r.desc}</p>
    ${!owned&&r.req?`<small class="gate-text">${ok?"✓ REQUIREMENTS MET":"REQUIRES: "+reqText(r.req)}</small>`:""}
    ${owned?'<span class="badge">CONNECTED</span>':`<button class="btn ${ok?"blue":"dark"}" ${ok?"":"disabled"} onclick="buyRegion('${r.id}')">${ok?"UNLOCK "+money(r.cost):"LOCKED"}</button>`}
  </div>`}).join("")
}
function renderContracts(){const el=document.getElementById("contractList");if(g.activeContract){const rem=Math.max(0,Math.ceil((g.activeContract.end-Date.now())/1000));el.innerHTML=`<div class="contract"><div class="contract-head"><span>📜 ${g.activeContract.name}</span><span>${rem}s</span></div><p class="small">Power sale multiplier ${g.activeContract.rate.toFixed(2)}×</p></div>`;return}el.innerHTML=CONTRACTS.map(c=>{const req={reliability:c.reliability,contracts:c.contracts,projects:c.projects,region:c.region},ok=output()>=c.required&&reqMet(req);return`<div class="contract"><div class="contract-head"><span>${c.name}</span><span>${money(c.reward)}</span></div><p class="small">Requires ${powerRate(c.required)} • ${c.duration}s • ${c.rate.toFixed(2)}× sales</p>${reqText(req)?`<small class="gate-text">${reqText(req)}</small>`:""}<button class="btn ${ok?"green":"dark"}" style="width:100%" ${ok?"":"disabled"} onclick="startContract('${c.id}')">${ok?"ACCEPT CONTRACT":"REQUIREMENTS NOT MET"}</button></div>`}).join("")}
function renderMissions(){document.getElementById("missionList").innerHTML=MISSIONS.map(m=>{const v=missionValue(m),pct=Math.min(100,v/m.target*100),done=!!g.missions[m.id];return`<div class="mission"><div class="mission-head"><span>${m.label}</span><span>${done?"✓ CLAIMED":money(m.reward)}</span></div><div class="small" style="margin:7px 0">${missionDisplay(m,Math.min(v,m.target))} / ${missionDisplay(m,m.target)}</div><div class="progress"><i style="width:${pct}%"></i></div>${!done&&v>=m.target?`<button class="btn green" style="width:100%;margin-top:9px" onclick="claimMission('${m.id}')">CLAIM REWARD</button>`:""}</div>`}).join("")}
function renderAchievements(){document.getElementById("achievementList").innerHTML=ACH.map(a=>`<div class="achievement"><div class="ach-head"><span>${g.achievements[a.id]?"🏆":"🔒"} ${a.label}</span><span>${g.achievements[a.id]?"UNLOCKED":""}</span></div><small>${a.desc}</small></div>`).join("")}
function renderEvent(){const b=document.getElementById("eventBox");if(!g.event){b.classList.remove("show");return}b.classList.add("show");document.getElementById("eventTitle").textContent=g.event.title;let t=g.event.text,bt="RESOLVE";if(g.event.type==="breakdown"){t+=" Repair cost: "+money(g.event.cost);bt="REPAIR"}if(g.event.type==="surge"){t+=" "+Math.max(0,Math.ceil((g.event.expires-Date.now())/1000))+"s remaining.";bt="END EVENT"}if(g.event.type==="inspection"){t+=" Reward: "+money(g.event.reward);bt="COMPLETE INSPECTION"}document.getElementById("eventText").textContent=t;document.getElementById("eventButton").textContent=bt}
function degradePlant(){if(output()<=0)return;let d=.015*(1-Math.min(.6,g.corporate.maint*.08))*(1-Math.min(.5,g.engineers*.08));
if(g.policy==="maximum")d*=1.35;if(g.policy==="reliability")d*=.55;
d*=1-Math.min(.45,g.research.materials*.07);d*=legacyWearMult();g.maintenance=Math.max(0,g.maintenance-d);
g.reliability=Math.max(40,Math.min(100,98-(100-g.maintenance)*.28+g.staff.safety*1.5+g.research.controls*2+g.research.advancedNuclear*.5));PLANTS.forEach(p=>{const s=g.plants[p.id];if(s.unlocked)s.condition=Math.max(35,s.condition-d*.7)})}
function payOperatingCosts(){const c=fuelCostPerSecond();if(g.cash>=c)g.cash-=c;else{g.cash=0;g.maintenance=Math.max(0,g.maintenance-.03)}}
function render(){updateEvent();updateContract();updateAchievements();updateDayNight();document.getElementById("cash").textContent=money(g.cash);document.getElementById("power").textContent=energy(g.stored);document.getElementById("output").textContent=powerRate(output());document.getElementById("tapInfo").textContent=energy(tapPower())+" / tap";document.getElementById("tapCost").textContent="Next manual generator upgrade: "+money(tapUpgradeCost());document.getElementById("operatorLevel").textContent=g.operatorLevel;document.getElementById("operatorXP").textContent=num(Math.floor(g.operatorXP))+" / "+num(operatorXPRequirement());document.getElementById("efficiencyValue").textContent=Math.round(totalMult()*100)+"%";document.getElementById("maintenanceValue").textContent=Math.round(g.maintenance)+"%";document.getElementById("fuelCostValue").textContent=money(fuelCostPerSecond())+"/s";document.getElementById("netValue").textContent=money(netValuePerSecond())+"/s";document.getElementById("maintenanceStatus").textContent=g.maintenance>80?"Healthy":g.maintenance>50?"Service Soon":"Maintenance Required";document.getElementById("engineerInfo").textContent="Engineers: "+g.engineers+" • Next hire: "+money(engineerCost())+" • Service cost: "+money(maintenanceCost());document.getElementById("gridStatus").textContent=g.event&&g.event.type==="breakdown"?"● UNIT TRIPPED":"● GRID ONLINE";let rank=companyTier();document.getElementById("rank").textContent=rank+" • LV "+g.operatorLevel;renderMonetizationUI();document.getElementById("prestigeInfo").innerHTML="Current prestige: <b>"+g.prestige+"</b> • Diminishing permanent bonus: <b>+"+Math.round((prestigeMult()-1)*100)+"%</b> • Grid Credits: <b>"+num(g.gridCredits||0)+"</b><br><span class='small'>This run: "+money(g.prestigeRunCash||0)+" / "+money(prestigeRequirement())+" • Next reward: "+prestigeCreditReward()+" GC</span>";renderPlants();renderCorporate();renderRegions();renderContracts();renderMissions();renderAchievements();renderEvent();updateFacility();document.getElementById("activityLog").innerHTML=g.log.map(x=>"<div>"+x+"</div>").join("");
document.getElementById("kpiLifetime").textContent=money(g.lifetimeCash);
document.getElementById("kpiContracts").textContent=g.contractsCompleted;
document.getElementById("kpiPrestige").textContent=g.prestige;
applySettings();renderTutorial();renderEndgame();renderMegaSystems();renderEmpireSystems();renderB10CommandDeck();renderB10Shift();renderB10License();renderGuidedTutorial();renderPremiumAssetState()}
function handleOffline(){const now=Date.now(),s=Math.min(12*3600,Math.max(0,(now-g.lastSeen)/1000));if(s<30||output()<=0){g.lastSeen=now;return}const oe=offlineEfficiency(),p=output()*s*oe,c=fuelCostPerSecond()*s*oe;g.stored+=p;g.generated+=p;g.cash=Math.max(0,g.cash-c);document.getElementById("offlineAmount").textContent=energy(p);document.getElementById("offlineText").textContent="Your facility operated for "+Math.floor(s/60)+" minutes at "+Math.round(offlineEfficiency()*100)+"% offline efficiency. Fuel cost: "+money(c)+".";document.getElementById("offlineModal").classList.add("show");addLog("Offline production added "+energy(p)+".")}
function closeOffline(){document.getElementById("offlineModal").classList.remove("show");saveGame();render()}

/* 100MB Premium Asset Edition runtime */
const premiumAudio={
  day:new Audio("audio/music/plant_day.wav"),
  night:new Audio("audio/music/plant_night.wav"),
  storm:new Audio("audio/music/storm_ambience.wav"),
  alarm:new Audio("audio/sfx/alarm.wav"),
  generate:new Audio("audio/sfx/generate.wav"),
  cash:new Audio("audio/sfx/cash.wav"),
  upgrade:new Audio("audio/sfx/upgrade.wav")
};
["day","night","storm"].forEach(k=>{premiumAudio[k].loop=true;premiumAudio[k].volume=.16});
premiumAudio.alarm.volume=.16;premiumAudio.generate.volume=.22;premiumAudio.cash.volume=.20;premiumAudio.upgrade.volume=.20;

function setPremiumVolume(type,value){
  const v=Math.max(0,Math.min(100,Number(value)));
  if(type==="music")g.settings.musicVolume=v;
  if(type==="sfx")g.settings.sfxVolume=v;
  saveGame();applyPremiumVolumes();
}
function applyPremiumVolumes(){
  const mv=(g.settings.musicVolume??16)/100,sv=(g.settings.sfxVolume??22)/100;
  premiumAudio.day.volume=mv;premiumAudio.night.volume=mv;premiumAudio.storm.volume=mv;
  premiumAudio.alarm.volume=sv*.8;premiumAudio.generate.volume=sv;premiumAudio.cash.volume=sv;premiumAudio.upgrade.volume=sv;
  const m=document.getElementById("musicVolume"),s=document.getElementById("sfxVolume");
  if(m)m.value=g.settings.musicVolume??16;if(s)s.value=g.settings.sfxVolume??22;
}

let premiumAmbience=null;
function playPremiumSfx(name){
  if(!g?.settings?.sound)return;
  const a=premiumAudio[name];if(!a)return;
  try{a.currentTime=0;a.play().catch(()=>{})}catch(e){}
}
function updatePremiumAmbience(){
  if(!g?.settings?.sound){Object.values(premiumAudio).forEach(a=>{if(a.loop)a.pause()});return}
  const wanted=document.body.classList.contains("storm-visual")?premiumAudio.storm:(document.body.classList.contains("night")?premiumAudio.night:premiumAudio.day);
  if(premiumAmbience!==wanted){
    [premiumAudio.day,premiumAudio.night,premiumAudio.storm].forEach(a=>a.pause());
    premiumAmbience=wanted;
    wanted.play().catch(()=>{});
  }
}
function renderPremiumAssetState(){applyPremiumVolumes();
  document.body.classList.toggle("prestige-visual",(g.prestige||0)>0);
  document.body.classList.toggle("storm-visual",!!(g.event&&g.event.type==="surge"&&g.market&&g.market.demand>1.18));
  updatePremiumAmbience();
}
document.addEventListener("pointerdown",()=>updatePremiumAmbience(),{once:true});
window.addEventListener("load",()=>{
  const splash=document.getElementById("bootSplashPremium");
  if(splash)setTimeout(()=>{splash.classList.add("hide");setTimeout(()=>splash.remove(),700)},1150);
});

console.log("Power Plant Tycoon BUILD 10 MAJOR UPGRADE loaded");handleOffline();render();setInterval(()=>{const p=output();g.stored+=p;g.generated+=p;payOperatingCosts();degradePlant();autoSellTick();createEvent();updateContract();saveGame();render()},1000);setInterval(()=>{shiftMarket();saveGame();render()},15000);document.addEventListener("visibilitychange",()=>{if(document.hidden)saveGame()});


// Ask the native iPhone wrapper for App Store products/entitlements after the web game has initialized.
setTimeout(()=>{requestStoreKitStatus();requestAdsStatus();setStoreKitStatus(nativeStoreKitAvailable()?"Apple StoreKit connected.":"Browser test store active.");setAdStatus(nativeAdsAvailable()?"Google Mobile Ads connecting…":"Browser ad simulation active.")},350);
