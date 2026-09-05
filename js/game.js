"use strict";

/* POWER PLANT TYCOON — GRID DOMINION V8 */
const SAVE_KEY="PPT_V5";
const BACKUP_KEY="PPT_V8_BACKUP_1";
const ENTITLEMENT_KEY="PPT_ENTITLEMENTS_V8";
const V8_VERSION="8.0";
const CORE_IDS=["diesel","steam","gas","solar","nuclear"];
const ADVANCED_IDS=["wind","hydro","geo","ccgt","smr","fusion"];

const PLANTS=[
  {id:"diesel",icon:"⛽",name:"Diesel Generator",unlock:60,base:1.5,fuel:.08,reliability:98,type:"thermal",desc:"Fast-start local generation. Cheap to commission, expensive to fuel."},
  {id:"steam",icon:"🌀",name:"Steam Turbine",unlock:400,base:6,fuel:.18,reliability:95,type:"thermal",desc:"Classic thermal baseload with strong early-game scaling."},
  {id:"gas",icon:"🔥",name:"Gas Turbine",unlock:2500,base:22,fuel:.55,reliability:96,type:"thermal",desc:"Responsive utility generation for peak demand and contracts."},
  {id:"solar",icon:"☀️",name:"Solar Farm",unlock:12000,base:80,fuel:0,reliability:99,type:"solar",desc:"Fuel-free renewable output. Strongest during clear daytime conditions."},
  {id:"nuclear",icon:"☢️",name:"Nuclear Plant",unlock:75000,base:320,fuel:2.1,reliability:93,type:"nuclear",desc:"Massive baseload power with high capital cost and excellent scale."},
  {id:"wind",icon:"🌬️",name:"Offshore Wind Array",unlock:150000,base:500,fuel:0,reliability:96,type:"wind",desc:"Weather-responsive renewable generation with zero fuel cost."},
  {id:"hydro",icon:"💧",name:"Hydroelectric Complex",unlock:600000,base:1400,fuel:.04,reliability:99,type:"hydro",desc:"Stable renewable baseload with excellent reliability."},
  {id:"geo",icon:"🌋",name:"Geothermal Field",unlock:2500000,base:4200,fuel:.08,reliability:98,type:"geo",desc:"Deep-earth baseload generation with high availability."},
  {id:"ccgt",icon:"♨️",name:"Advanced Combined Cycle",unlock:9000000,base:8500,fuel:1.4,reliability:97,type:"thermal",desc:"High-efficiency gas and steam combined-cycle generation."},
  {id:"smr",icon:"⚛️",name:"Small Modular Reactor",unlock:18000000,base:12000,fuel:1.1,reliability:98,type:"nuclear",desc:"Modular nuclear fleet with strong reliability and compact footprint."},
  {id:"fusion",icon:"🧬",name:"Fusion Demonstration Plant",unlock:65000000,base:32000,fuel:.18,reliability:99,type:"fusion",desc:"Endgame clean baseload. Requires the Fusion Research Campus megaproject."}
];

const REGIONS=[
  {id:"riverbend",name:"Riverbend",cost:0,bonus:0,emoji:"🏭",tier:"LOCAL",desc:"Starter industrial grid.",requires:null},
  {id:"coast",name:"Coastal Grid",cost:15000,bonus:.10,emoji:"🌊",tier:"REGIONAL",desc:"Coastal utility market and port demand.",requires:"riverbend"},
  {id:"desert",name:"Sunbelt",cost:75000,bonus:.20,emoji:"☀️",tier:"REGIONAL",desc:"High solar demand and fast-growing load.",requires:"coast"},
  {id:"metro",name:"Metroplex",cost:300000,bonus:.35,emoji:"🌆",tier:"REGIONAL",desc:"Dense commercial and residential city load.",requires:"desert"},
  {id:"mountain",name:"Mountain Relay",cost:900000,bonus:.45,emoji:"🏔️",tier:"REGIONAL",desc:"High-voltage mountain transmission corridor.",requires:"metro"},
  {id:"plains",name:"Great Plains Grid",cost:2500000,bonus:.60,emoji:"🌾",tier:"NATIONAL",desc:"Continental transmission and wind balancing hub.",requires:"mountain"},
  {id:"atlantic",name:"Atlantic Energy Hub",cost:7000000,bonus:.80,emoji:"⚓",tier:"NATIONAL",desc:"Industrial port, offshore load and trading hub.",requires:"plains"},
  {id:"national",name:"National Supergrid",cost:20000000,bonus:1.10,emoji:"🇺🇸",tier:"NATIONAL",desc:"Nationwide balancing authority and market access.",requires:"atlantic"},
  {id:"gulf",name:"Gulf Coast Intertie",cost:60000000,bonus:1.35,emoji:"🛢️",tier:"INTERCONNECT",desc:"Refinery, LNG and coastal industrial corridor.",requires:"national"},
  {id:"pacific",name:"Pacific Renewable Corridor",cost:180000000,bonus:1.65,emoji:"🌅",tier:"INTERCONNECT",desc:"Western hydro, solar, wind and storage exchange.",requires:"gulf"},
  {id:"greatlakes",name:"Great Lakes Power Exchange",cost:500000000,bonus:2.00,emoji:"🌊",tier:"INTERCONNECT",desc:"Major cross-market transmission exchange.",requires:"pacific"},
  {id:"arctic",name:"Arctic HVDC Link",cost:1500000000,bonus:2.50,emoji:"❄️",tier:"CONTINENTAL",desc:"Ultra-long-distance high-voltage DC backbone.",requires:"greatlakes"},
  {id:"continental",name:"Continental Interconnect",cost:5000000000,bonus:3.20,emoji:"🌎",tier:"CONTINENTAL",desc:"Synchronized continent-scale balancing network.",requires:"arctic"},
  {id:"global",name:"Global Energy Network",cost:20000000000,bonus:4.50,emoji:"🌐",tier:"GLOBAL",desc:"Worldwide power exchange and settlement market.",requires:"continental"},
  {id:"international",name:"International Intertie",cost:75000000000,bonus:5.50,emoji:"🔗",tier:"GLOBAL",desc:"Cross-border dispatch and reserve sharing.",requires:"global"},
  {id:"northamerica",name:"North American Supergrid",cost:250000000000,bonus:7.00,emoji:"🗺️",tier:"GLOBAL",desc:"Unified continental supergrid and capacity market.",requires:"international"},
  {id:"transatlantic",name:"Transatlantic HVDC Network",cost:900000000000,bonus:9.00,emoji:"🌊",tier:"PLANETARY",desc:"Subsea HVDC links join two major power markets.",requires:"northamerica"},
  {id:"renewable",name:"Global Renewable Exchange",cost:3000000000000,bonus:12.00,emoji:"🌱",tier:"PLANETARY",desc:"Worldwide renewable balancing and storage exchange.",requires:"transatlantic"},
  {id:"pacificrim",name:"Pacific Rim Interconnect",cost:10000000000000,bonus:16.00,emoji:"🌏",tier:"PLANETARY",desc:"Ring-of-fire interconnection across Pacific markets.",requires:"renewable"},
  {id:"orbital",name:"Orbital Energy Relay",cost:50000000000000,bonus:25.00,emoji:"🛰️",tier:"ENDGAME",desc:"Space-based relay and global energy routing network.",requires:"pacificrim"}
];

const CONTRACTS=[
  {id:"c1",name:"Town Utility Supply",required:2,duration:60,rate:1.15,reward:450,icon:"🏘️"},
  {id:"c2",name:"Industrial Park Power",required:12,duration:90,rate:1.30,reward:1800,icon:"🏗️"},
  {id:"c3",name:"Hospital Reliability Reserve",required:45,duration:120,rate:1.45,reward:6500,icon:"🏥"},
  {id:"c4",name:"Regional Grid Support",required:90,duration:140,rate:1.55,reward:13000,icon:"⚡"},
  {id:"c5",name:"Metro Baseload Agreement",required:180,duration:180,rate:1.70,reward:30000,icon:"🌆"},
  {id:"c6",name:"Hyperscale Data Center",required:420,duration:210,rate:1.85,reward:70000,icon:"🖥️"},
  {id:"c7",name:"Military Installation Reserve",required:900,duration:240,rate:2.00,reward:165000,icon:"🛡️"},
  {id:"c8",name:"Interstate Transmission Support",required:1800,duration:280,rate:2.20,reward:350000,icon:"🗼"},
  {id:"c9",name:"National Capacity Commitment",required:4000,duration:320,rate:2.45,reward:900000,icon:"🇺🇸"},
  {id:"c10",name:"Global Energy Exchange",required:12000,duration:420,rate:2.80,reward:3500000,icon:"🌐"}
];

const CORPORATE=[
  {id:"eff",name:"High-Efficiency Operations",desc:"+5% total production per level",base:2500,max:20,icon:"⚙️"},
  {id:"maint",name:"Predictive Maintenance",desc:"Slower equipment degradation",base:4000,max:20,icon:"🛠️"},
  {id:"fuel",name:"Fuel Procurement",desc:"Reduces fuel expense by 5% per level",base:6000,max:12,icon:"⛽"},
  {id:"grid",name:"Grid Optimization",desc:"+4% power sale value per level",base:8000,max:20,icon:"⚡"},
  {id:"construction",name:"Construction Division",desc:"Reduces plant and grid build cost by 2% per level",base:14000,max:15,icon:"🏗️"},
  {id:"finance",name:"Utility Finance",desc:"+3% contract rewards per level",base:18000,max:15,icon:"💼"}
];

const STAFF_TYPES=[
  {id:"engineer",name:"Plant Engineering",icon:"🛠️",desc:"Slows fleet wear and improves maintenance effectiveness.",base:5000},
  {id:"trader",name:"Energy Trading",icon:"📈",desc:"Improves market sale value and price forecasting.",base:7000},
  {id:"safety",name:"Safety & Compliance",icon:"🦺",desc:"Improves reliability and reduces event severity.",base:8500},
  {id:"operator",name:"Operations",icon:"🎛️",desc:"Boosts generation and operator experience.",base:10000},
  {id:"construction",name:"Project Construction",icon:"🏗️",desc:"Reduces new plant and grid expansion costs.",base:15000},
  {id:"research",name:"Research Division",icon:"🧪",desc:"Reduces technology research cost and boosts Company XP.",base:18000}
];

const RESEARCH=[
  {id:"automation",name:"Advanced Automation",desc:"+4% production per level and unlocks Auto Sell",base:12000,max:8},
  {id:"storage",name:"Grid Storage Systems",desc:"+50% battery capacity per level",base:15000,max:8},
  {id:"forecast",name:"Market Forecasting",desc:"+3% sale value and better forecasts",base:18000,max:8},
  {id:"materials",name:"Advanced Materials",desc:"Slower plant condition loss",base:22000,max:8},
  {id:"controls",name:"Digital Plant Controls",desc:"+2% reliability per level",base:30000,max:8},
  {id:"gridAI",name:"Grid AI Dispatch",desc:"Improves auto-sell and emergency dispatch",base:45000,max:8},
  {id:"renewables",name:"Renewable Forecasting",desc:"+6% Solar/Wind/Hydro output per level",base:60000,max:6},
  {id:"nuclear",name:"Advanced Reactor Physics",desc:"+6% Nuclear/SMR output per level",base:90000,max:6},
  {id:"thermal",name:"High-Temperature Turbomachinery",desc:"+5% thermal output per level",base:120000,max:6},
  {id:"fusion",name:"Fusion Plasma Control",desc:"+8% Fusion output per level",base:250000,max:5}
];

const POLICIES=[
  {id:"balanced",name:"Balanced Operation",desc:"Stable production, wear and market exposure."},
  {id:"maximum",name:"Maximum Output",desc:"+18% output but faster equipment wear."},
  {id:"reliability",name:"Reliability First",desc:"-8% output, much slower wear and fewer outages."},
  {id:"market",name:"Market Responsive",desc:"Better value when spot prices and demand are high."},
  {id:"renewable",name:"Clean Dispatch",desc:"+12% renewable output and +5 reputation on major expansion."}
];

const MEGAPROJECTS=[
  {id:"controlCenter",icon:"🏢",name:"Regional Control Center",cost:1500000,desc:"+10% total production and +10 reliability."},
  {id:"smartGrid",icon:"🧠",name:"National Smart Grid",cost:5000000,desc:"+15% production and smarter dispatch coordination."},
  {id:"storageHub",icon:"🔋",name:"Continental Storage Hub",cost:15000000,desc:"+40% battery capacity and +8% sale value."},
  {id:"hvdc",icon:"🗼",name:"HVDC Transmission Backbone",cost:30000000,desc:"+15% region bonuses and +5% market value."},
  {id:"nuclearServices",icon:"☢️",name:"Nuclear Services Division",cost:40000000,desc:"+15% nuclear output and slower fleet degradation."},
  {id:"gridAI",icon:"🤖",name:"Autonomous Grid AI",cost:70000000,desc:"+12% production and enhanced Auto Sell."},
  {id:"fusionCampus",icon:"🧬",name:"Fusion Research Campus",cost:100000000,desc:"Unlocks Fusion and +25% Fusion output."},
  {id:"orbitalOps",icon:"🛰️",name:"Orbital Operations Authority",cost:1000000000000,desc:"+20% global output and required for Orbital Energy Relay."}
];

const PRESTIGE_TREE=[
  {id:"generation",name:"Legacy Turbines",cost:1,desc:"+8% permanent production per rank",max:10},
  {id:"markets",name:"Legacy Contracts",cost:1,desc:"+6% permanent sale value per rank",max:10},
  {id:"construction",name:"Legacy Construction",cost:1,desc:"-3% permanent build costs per rank",max:8},
  {id:"offline",name:"Remote Operations",cost:2,desc:"+4% offline efficiency per rank",max:6},
  {id:"storage",name:"Grid Reserve Legacy",cost:2,desc:"+15% battery capacity per rank",max:6},
  {id:"xp",name:"Executive Experience",cost:2,desc:"+8% Company XP per rank",max:6}
];

const MISSIONS=[
  {id:"m1",label:"Generate 100 kWh",type:"generated",target:100,reward:150},
  {id:"m2",label:"Earn $1,000 lifetime cash",type:"lifetimeCash",target:1000,reward:500},
  {id:"m3",label:"Own 5 total plant levels",type:"levels",target:5,reward:1200},
  {id:"m4",label:"Reach 50 kWh/s",type:"output",target:50,reward:3500},
  {id:"m5",label:"Complete 3 contracts",type:"contracts",target:3,reward:7500},
  {id:"m6",label:"Reach Company Level 5",type:"companyLevel",target:5,reward:10000},
  {id:"m7",label:"Build Battery Level 2",type:"battery",target:2,reward:15000},
  {id:"m8",label:"Hire 8 staff",type:"staff",target:8,reward:25000},
  {id:"m9",label:"Connect 8 grid regions",type:"regions",target:8,reward:250000},
  {id:"m10",label:"Complete 2 megaprojects",type:"mega",target:2,reward:500000},
  {id:"m11",label:"Reach 5,000 kWh/s",type:"output",target:5000,reward:1000000},
  {id:"m12",label:"Connect 14 grid regions",type:"regions",target:14,reward:5000000},
  {id:"m13",label:"Commission Fusion",type:"fusion",target:1,reward:10000000},
  {id:"m14",label:"Complete the Orbital Energy Relay",type:"regions",target:20,reward:50000000}
];

const ACHIEVEMENTS=[
  {id:"a1",label:"First Spark",desc:"Generate your first 10 kWh",type:"generated",target:10},
  {id:"a2",label:"Plant Operator",desc:"Commission the Steam Turbine",type:"plant:steam",target:1},
  {id:"a3",label:"Grid Builder",desc:"Connect a second grid region",type:"regions",target:2},
  {id:"a4",label:"Power Mogul",desc:"Earn $50,000 lifetime cash",type:"lifetimeCash",target:50000},
  {id:"a5",label:"Nuclear Age",desc:"Commission Nuclear Power",type:"plant:nuclear",target:1},
  {id:"a6",label:"Automation Era",desc:"Unlock Auto Generate",type:"autogen",target:1},
  {id:"a7",label:"Company Builder",desc:"Reach Company Level 10",type:"companyLevel",target:10},
  {id:"a8",label:"National Operator",desc:"Connect 8 grid regions",type:"regions",target:8},
  {id:"a9",label:"Megaproject Authority",desc:"Complete 4 megaprojects",type:"mega",target:4},
  {id:"a10",label:"Continental Grid",desc:"Connect 13 grid regions",type:"regions",target:13},
  {id:"a11",label:"Fusion Pioneer",desc:"Commission the Fusion Demonstration Plant",type:"fusion",target:1},
  {id:"a12",label:"Global Grid Authority",desc:"Connect the Global Energy Network",type:"regions",target:14},
  {id:"a13",label:"Planetary Operator",desc:"Connect 18 grid regions",type:"regions",target:18},
  {id:"a14",label:"Orbital Utility",desc:"Complete all 20 grid regions",type:"regions",target:20},
  {id:"a15",label:"Utility Titan",desc:"Reach Company Level 25",type:"companyLevel",target:25},
  {id:"a16",label:"Prestige Dynasty",desc:"Prestige 5 times",type:"prestige",target:5}
];

const POWER_PASS_REWARDS=Array.from({length:20},(_,i)=>{
  const tier=i+1;const xp=i===0?0:Math.round(90*Math.pow(1.24,i));
  return {tier,xp,free:{cash:Math.round(1000*Math.pow(1.48,i)),label:"Cash Reward"},premium:i%4===1?{boost:600+120*i,label:"Grid Boost"}:{cash:Math.round(2500*Math.pow(1.5,i)),label:"Premium Cash"}};
});

const WEATHER=[
  {id:"clear",label:"CLEAR",icon:"☀️",solar:1.22,wind:.92,hydro:1,event:1},
  {id:"clouds",label:"CLOUDY",icon:"☁️",solar:.82,wind:1.05,hydro:1,event:1},
  {id:"windy",label:"HIGH WINDS",icon:"🌬️",solar:.95,wind:1.35,hydro:1,event:1.05},
  {id:"rain",label:"RAIN",icon:"🌧️",solar:.72,wind:1.12,hydro:1.18,event:1.05},
  {id:"storm",label:"STORM",icon:"⛈️",solar:.55,wind:1.18,hydro:1.28,event:1.30},
  {id:"heat",label:"HEAT WAVE",icon:"🔥",solar:1.15,wind:.85,hydro:.92,event:1.10}
];

const AUDIO_FILES={generate:"audio/sfx/generate.wav",cash:"audio/sfx/cash.wav",upgrade:"audio/sfx/upgrade.wav",alarm:"audio/sfx/alarm.wav"};
const audioBank={};
if(typeof Audio!=="undefined"){for(const [k,v] of Object.entries(AUDIO_FILES)){try{audioBank[k]=new Audio(v);audioBank[k].volume=k==="alarm" ? .16 : .20;}catch(e){}}}
function playGameSound(name){if(!g?.settings?.sound)return;const a=audioBank[name];if(!a)return;try{a.currentTime=0;a.play().catch(()=>{});}catch(e){}}
const byId=id=>document.getElementById(id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const now=()=>Date.now();
function deepClone(x){return JSON.parse(JSON.stringify(x));}
function defaultCorePlants(){return Object.fromEntries(CORE_IDS.map(id=>[id,{unlocked:false,level:0,condition:100}]));}
function defaultAdvanced(){return Object.fromEntries(ADVANCED_IDS.map(id=>[id,{unlocked:false,level:0,condition:100}]));}
function defaultGame(){return {
  cash:0,stored:0,generated:0,sold:0,lifetimeCash:0,tapLevel:0,prestige:0,boostUntil:0,lastSeen:now(),lastDaily:0,starter:false,
  autoGenerateUnlocked:false,autoGenerate:false,autoGenerateLevel:0,maintenance:100,engineers:0,operatorXP:0,operatorLevel:1,companyXP:0,companyLevel:1,
  regions:{riverbend:true},plants:defaultCorePlants(),advancedAssets:defaultAdvanced(),corporate:{eff:0,maint:0,fuel:0,grid:0,construction:0,finance:0},
  contractsCompleted:0,activeContract:null,missions:{},achievements:{},event:null,eventCooldown:0,
  settings:{sound:true,haptics:true,reducedMotion:false,compact:true},market:{price:1,demand:1,trend:0,lastShift:now(),history:[1],forecast:1},
  battery:{level:0,stored:0},autoSell:false,reputation:0,reliability:100,
  staff:{engineer:0,trader:0,safety:0,operator:0,construction:0,research:0},policy:"balanced",
  research:{automation:0,storage:0,forecast:0,materials:0,controls:0,gridAI:0,renewables:0,nuclear:0,thermal:0,fusion:0},
  weekly:{weekKey:"",baseGenerated:0,claimed:false},dispatches:0,log:["Riverbend Station connected to the grid."],viewStage:"diesel",
  daily:{streak:0,best:0,lastClaimDay:""},megaProjects:Object.fromEntries(MEGAPROJECTS.map(x=>[x.id,false])),plantSpecialization:Object.fromEntries(PLANTS.map(x=>[x.id,0])),
  powerPass:{xp:0,premium:false,freeClaimed:{},premiumClaimed:{}},gridCredits:0,prestigeTree:Object.fromEntries(PRESTIGE_TREE.map(x=>[x.id,0])),
  weather:{id:"clear",lastShift:now()},stats:{bestSale:0,bestOutput:0,totalFuelCost:0,totalMaintenance:0,totalBuildSpend:0,totalContractRewards:0,marketSales:0}
};}

function loadEntitlements(){
  try{return Object.assign({autoGenerate:false,premiumPass:false},JSON.parse(localStorage.getItem(ENTITLEMENT_KEY)||"{}"));}catch(e){return {autoGenerate:false,premiumPass:false};}
}
function saveEntitlements(){localStorage.setItem(ENTITLEMENT_KEY,JSON.stringify(entitlements));}
let entitlements=loadEntitlements();
let g;
try{
  const raw=localStorage.getItem(SAVE_KEY);
  if(raw&&!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,raw);
  g=raw?JSON.parse(raw):defaultGame();
}catch(e){g=defaultGame();}

function migrate(){
  const d=defaultGame();
  if(!g||typeof g!=="object")g=d;
  for(const [k,v] of Object.entries(d)){if(g[k]===undefined||g[k]===null)g[k]=deepClone(v);}
  if(!g.plants)g.plants=defaultCorePlants();
  CORE_IDS.forEach(id=>{if(!g.plants[id])g.plants[id]={unlocked:false,level:0,condition:100};const s=g.plants[id];s.level=Math.max(0,Number(s.level)||0);if(s.level>0)s.unlocked=true;if(s.unlocked&&s.level<1)s.level=1;s.condition=clamp(Number(s.condition)||100,20,100);});
  if(!g.advancedAssets)g.advancedAssets=defaultAdvanced();
  ADVANCED_IDS.forEach(id=>{if(!g.advancedAssets[id])g.advancedAssets[id]={unlocked:false,level:0,condition:100};const s=g.advancedAssets[id];s.level=Math.max(0,Number(s.level)||0);if(s.level>0)s.unlocked=true;if(s.unlocked&&s.level<1)s.level=1;if(s.condition==null)s.condition=100;s.condition=clamp(Number(s.condition)||100,20,100);});
  if(g.autoGenerateUnlocked)entitlements.autoGenerate=true;
  if(g.powerPass?.premium)entitlements.premiumPass=true;
  g.autoGenerateUnlocked=!!entitlements.autoGenerate;
  if(g.autoGenerateUnlocked&&(Number(g.autoGenerateLevel)||0)<1)g.autoGenerateLevel=1;
  g.powerPass=g.powerPass||deepClone(d.powerPass);g.powerPass.premium=!!entitlements.premiumPass;
  g.daily=Object.assign({},d.daily,g.daily||{});
  g.battery=Object.assign({},d.battery,g.battery||{});
  g.market=Object.assign({},d.market,g.market||{});if(!Array.isArray(g.market.history)||!g.market.history.length)g.market.history=[Number(g.market.price)||1];
  g.staff=Object.assign({},d.staff,g.staff||{});g.research=Object.assign({},d.research,g.research||{});g.corporate=Object.assign({},d.corporate,g.corporate||{});
  g.megaProjects=Object.assign({},d.megaProjects,g.megaProjects||{});g.prestigeTree=Object.assign({},d.prestigeTree,g.prestigeTree||{});g.plantSpecialization=Object.assign({},d.plantSpecialization,g.plantSpecialization||{});
  g.settings=Object.assign({},d.settings,g.settings||{});g.stats=Object.assign({},d.stats,g.stats||{});g.weather=Object.assign({},d.weather,g.weather||{});
  if(!g.regions)g.regions={riverbend:true};g.regions.riverbend=true;
  if(!g.log)g.log=[];if(!g.missions)g.missions={};if(!g.achievements)g.achievements={};
  if(!PLANTS.find(p=>p.id===g.viewStage)||!plantState(g.viewStage).unlocked){const last=[...PLANTS].reverse().find(p=>plantState(p.id).unlocked);g.viewStage=last?last.id:"diesel";}
  saveEntitlements();
}
migrate();

function saveGame(){g.lastSeen=now();localStorage.setItem(SAVE_KEY,JSON.stringify(g));}
function money(n){n=Number(n)||0;if(!g.settings.compact)return"$"+n.toLocaleString(undefined,{maximumFractionDigits:1});const a=Math.abs(n);if(a>=1e15)return"$"+(n/1e15).toFixed(2)+"Q";if(a>=1e12)return"$"+(n/1e12).toFixed(2)+"T";if(a>=1e9)return"$"+(n/1e9).toFixed(2)+"B";if(a>=1e6)return"$"+(n/1e6).toFixed(2)+"M";if(a>=1e3)return"$"+(n/1e3).toFixed(2)+"K";return"$"+n.toFixed(1);}
function num(n){n=Number(n)||0;if(!g.settings.compact)return n.toLocaleString(undefined,{maximumFractionDigits:1});const a=Math.abs(n);if(a>=1e15)return(n/1e15).toFixed(2)+"Q";if(a>=1e12)return(n/1e12).toFixed(2)+"T";if(a>=1e9)return(n/1e9).toFixed(2)+"B";if(a>=1e6)return(n/1e6).toFixed(2)+"M";if(a>=1e3)return(n/1e3).toFixed(2)+"K";return n.toFixed(1);}
function toast(t){const e=byId("toast");if(!e)return;e.textContent=t;e.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.classList.remove("show"),1900);}
function addLog(t){const x=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});g.log.unshift(x+" • "+t);g.log=g.log.slice(0,50);}
function beep(freq=520,duration=.05){if(!g.settings.sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),o=c.createOscillator(),v=c.createGain();o.frequency.value=freq;v.gain.value=.025;o.connect(v);v.connect(c.destination);o.start();v.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.stop(c.currentTime+duration);}catch(e){}}
function feedback(big=false){if(g.settings.haptics&&navigator.vibrate)navigator.vibrate(big?45:14);beep(big?780:520,big ? .08 : .04);}
function plantState(id){return CORE_IDS.includes(id)?g.plants[id]:g.advancedAssets[id];}
function plantById(id){return PLANTS.find(p=>p.id===id);}
function unlockedPlantCount(){return PLANTS.filter(p=>plantState(p.id)?.unlocked).length;}
function totalPlantLevels(){return PLANTS.reduce((n,p)=>n+(plantState(p.id)?.unlocked?plantState(p.id).level:0),0);}
function totalStaff(){return Object.values(g.staff).reduce((a,b)=>a+(Number(b)||0),0);}
function megaCount(){return MEGAPROJECTS.filter(m=>g.megaProjects[m.id]).length;}
function connectedRegions(){return REGIONS.filter(r=>g.regions[r.id]).length;}
function weatherObj(){return WEATHER.find(w=>w.id===g.weather.id)||WEATHER[0];}
function dayPhase(){const m=(Date.now()/60000)%6;return m<3?"DAY":"NIGHT";}
function constructionDiscount(){return clamp((g.corporate.construction||0)*.02+(g.staff.construction||0)*.01+(g.prestigeTree.construction||0)*.03,0,.55);}
function plantCost(p){const s=plantState(p.id);const base=s.unlocked?p.unlock*.72*Math.pow(1.58,Math.max(1,s.level)-1):p.unlock;return base*(1-constructionDiscount());}
function regionCost(r){return r.cost*(1-constructionDiscount()*.6);}
function corporateCost(u){return u.base*Math.pow(1.82,g.corporate[u.id]||0);}
function staffCost(t){return t.base*Math.pow(1.72,g.staff[t.id]||0);}
function researchCost(r){return r.base*Math.pow(1.92,g.research[r.id]||0)*Math.max(.65,1-(g.staff.research||0)*.025);}
function specializationCost(id){const p=plantById(id),s=plantState(id),lv=g.plantSpecialization[id]||0;return Math.max(5000,p.unlock*12)*Math.pow(2.5,lv)*Math.max(1,s.level/5);}
function tapUpgradeCost(){return 25*Math.pow(1.62,g.tapLevel);}
function batteryUpgradeCost(){return 10000*Math.pow(2.05,g.battery.level);}
function maintenanceCost(){return Math.max(250,rawOutput()*.7+(100-g.maintenance)*20);}
function autoGenerateUpgradeCost(){return 2000*Math.pow(1.85,Math.max(0,g.autoGenerateLevel-1));}
function companyTarget(level=g.companyLevel){return Math.round(75*Math.pow(1.31,Math.max(0,level-1)));}
function prestigeLegacyMult(){return 1+g.prestige*.12;}
function prestigeTreeMult(id,per){return 1+(g.prestigeTree[id]||0)*per;}
function companyMult(){return 1+(g.companyLevel-1)*.018;}
function operatorMult(){return 1+(g.operatorLevel-1)*.01;}
function regionMult(){let add=0;REGIONS.forEach(r=>{if(r.id!=="riverbend"&&g.regions[r.id])add+=r.bonus||0;});if(g.megaProjects.hvdc)add*=1.15;return 1+add;}
function policyProductionMult(){if(g.policy==="maximum")return 1.18;if(g.policy==="reliability")return .92;return 1;}
function staffProductionMult(){return 1+(g.staff.operator||0)*.025;}
function corporateProductionMult(){return 1+(g.corporate.eff||0)*.05;}
function researchGeneralMult(){return 1+(g.research.automation||0)*.04;}
function megaProductionMult(){let m=1;if(g.megaProjects.controlCenter)m*=1.10;if(g.megaProjects.smartGrid)m*=1.15;if(g.megaProjects.gridAI)m*=1.12;if(g.megaProjects.orbitalOps)m*=1.20;return m;}
function boostMult(){return now()<g.boostUntil?2:1;}
function maintenanceMult(){return .62+.38*(g.maintenance/100);}
function eventProductionMult(){if(!g.event)return 1;if(g.event.type==="breakdown")return .50;if(g.event.type==="transformer")return .65;if(g.event.type==="storm")return .80;if(g.event.type==="heat")return .88;if(g.event.type==="surge")return 1.10;return 1;}
function specializationMult(id){return 1+(g.plantSpecialization[id]||0)*.09;}
function milestoneMult(level){if(level>=50)return 1.95;if(level>=25)return 1.55;if(level>=15)return 1.32;if(level>=10)return 1.20;if(level>=5)return 1.10;return 1;}
function weatherPlantMult(p){const w=weatherObj();if(p.type==="solar")return (dayPhase()==="DAY"?w.solar:.22);if(p.type==="wind")return w.wind;if(p.type==="hydro")return w.hydro;return 1;}
function techPlantMult(p){let m=1;if(["solar","wind","hydro"].includes(p.type))m*=1+(g.research.renewables||0)*.06;if(p.type==="nuclear")m*=1+(g.research.nuclear||0)*.06;if(p.type==="thermal")m*=1+(g.research.thermal||0)*.05;if(p.type==="fusion")m*=1+(g.research.fusion||0)*.08;if(p.id==="fusion"&&g.megaProjects.fusionCampus)m*=1.25;if(["nuclear","smr"].includes(p.id)&&g.megaProjects.nuclearServices)m*=1.15;return m;}
function plantBaseOutput(p){const s=plantState(p.id);if(!s?.unlocked)return 0;return p.base*s.level*(.55+.45*s.condition/100)*milestoneMult(s.level)*specializationMult(p.id)*weatherPlantMult(p)*techPlantMult(p);}
function rawOutput(){return PLANTS.reduce((n,p)=>n+plantBaseOutput(p),0);}
function totalMult(){return prestigeLegacyMult()*prestigeTreeMult("generation",.08)*companyMult()*operatorMult()*regionMult()*policyProductionMult()*staffProductionMult()*corporateProductionMult()*researchGeneralMult()*megaProductionMult()*boostMult()*maintenanceMult()*eventProductionMult();}
function output(){return rawOutput()*totalMult();}
function tapPower(){return(1+g.tapLevel*2.5)*prestigeLegacyMult()*prestigeTreeMult("generation",.08)*companyMult()*operatorMult()*boostMult();}
function fuelCostPerSecond(){let n=0;PLANTS.forEach(p=>{const s=plantState(p.id);if(s?.unlocked)n+=p.fuel*s.level;});const reduction=clamp((g.corporate.fuel||0)*.05,0,.55);return n*(1-reduction);}
function marketSaleMult(){let m=(g.market.price||1)*(g.market.demand||1);m*=1+(g.staff.trader||0)*.025;m*=1+(g.research.forecast||0)*.03;m*=1+(g.corporate.grid||0)*.04;m*=prestigeTreeMult("markets",.06);if(g.megaProjects.storageHub)m*=1.08;if(g.megaProjects.hvdc)m*=1.05;if(g.policy==="market")m*=1.08;if(g.event?.type==="surge")m*=1.35;return Math.max(.35,m);}
function netValuePerSecond(){return Math.max(0,output()*marketSaleMult()-fuelCostPerSecond());}
function batteryCapacity(){if(g.battery.level<=0)return 0;let cap=500*Math.pow(2,g.battery.level-1)*(1+(g.research.storage||0)*.5)*prestigeTreeMult("storage",.15);if(g.megaProjects.storageHub)cap*=1.4;return cap;}
function autoGenerateAmount(){return tapPower()*(1+Math.max(0,g.autoGenerateLevel-1)*.75)*(1+(g.research.automation||0)*.06);}
function contractReward(c){return c.reward*(1+(g.corporate.finance||0)*.03);}
function gridBonusPercent(){return Math.round((regionMult()-1)*100);}

function addCompanyXP(amount){const mult=prestigeTreeMult("xp",.08)*(1+(g.staff.research||0)*.02);const a=(amount||0)*mult;g.companyXP+=a;g.powerPass.xp+=a;while(g.companyXP>=companyTarget()){g.companyXP-=companyTarget();g.companyLevel++;g.reputation+=2;addLog("Company Level increased to "+g.companyLevel+".");toast("🏢 Company Level "+g.companyLevel);}}
function addXP(amount){g.operatorXP+=amount;while(g.operatorXP>=g.operatorLevel*100){g.operatorXP-=g.operatorLevel*100;g.operatorLevel++;addLog("Operator Level increased to "+g.operatorLevel+".");toast("⭐ Operator Level "+g.operatorLevel);}addCompanyXP(Math.max(.4,amount*1.25));}

function showPage(id,b){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("active",x.dataset.nav===id));window.scrollTo({top:0,behavior:g.settings.reducedMotion?"auto":"smooth"});render();}
function selectStageView(id){const s=plantState(id);if(!s?.unlocked){toast("Commission this plant first.");return;}g.viewStage=id;saveGame();renderHero();}
function tapGenerate(){playGameSound("generate");feedback(false);const a=tapPower();g.stored+=a;g.generated+=a;addXP(.2);renderTop();renderHero();}
function toggleAutoGenerate(){if(!g.autoGenerateUnlocked){toast("Auto Generate is locked. Unlock it in the Store.");showPage("store");return;}g.autoGenerate=!g.autoGenerate;saveGame();renderAutoGenerate();}
function runAutoGenerate(){if(!g.autoGenerateUnlocked||!g.autoGenerate)return;const a=autoGenerateAmount();g.stored+=a;g.generated+=a;addXP(.32);}
function completeAutoGeneratePurchase(){entitlements.autoGenerate=true;saveEntitlements();g.autoGenerateUnlocked=true;if(g.autoGenerateLevel<1)g.autoGenerateLevel=1;g.autoGenerate=false;addLog("Auto Generate permanently unlocked.");saveGame();toast("🤖 Auto Generate unlocked!");render();}
function purchaseAutoGenerate(){if(g.autoGenerateUnlocked){toast("Auto Generate already owned.");return;}completeAutoGeneratePurchase();}
function upgradeAutoGenerate(){if(!g.autoGenerateUnlocked){toast("Unlock Auto Generate first.");return;}const c=autoGenerateUpgradeCost();if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.autoGenerateLevel++;addXP(5);g.stats.totalBuildSpend+=c;addLog("Auto Generate upgraded to Level "+g.autoGenerateLevel+".");saveGame();render();}

function buildPlant(id){playGameSound("upgrade");const p=plantById(id),s=plantState(id);if(!p||!s)return;if(id==="fusion"&&!g.megaProjects.fusionCampus){toast("Complete Fusion Research Campus first.");return;}const c=plantCost(p);if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.stats.totalBuildSpend+=c;if(!s.unlocked){s.unlocked=true;s.level=1;s.condition=100;g.viewStage=id;g.reputation+=4;addXP(25);addLog(p.name+" commissioned.");toast(p.name+" ONLINE!");}else{s.level++;s.condition=Math.min(100,s.condition+6);addXP(12);addLog(p.name+" upgraded to Level "+s.level+".");}feedback(true);saveGame();render();}
function specializePlant(id){const s=plantState(id);if(!s?.unlocked||s.level<5){toast("Reach Level 5 first.");return;}const lv=g.plantSpecialization[id]||0;if(lv>=4){toast("Specialization maxed.");return;}const c=specializationCost(id);if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.plantSpecialization[id]++;g.stats.totalBuildSpend+=c;g.reputation+=3;addXP(15);addLog(plantById(id).name+" specialization advanced to Rank "+g.plantSpecialization[id]+".");saveGame();render();}
function upgradeTap(){const c=tapUpgradeCost();if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.tapLevel++;g.stats.totalBuildSpend+=c;addXP(4);addLog("Manual generator upgraded to Level "+(g.tapLevel+1)+".");saveGame();render();}
function buyCorporate(id){const u=CORPORATE.find(x=>x.id===id);if(!u)return;const lv=g.corporate[id]||0;if(lv>=u.max){toast("Upgrade maxed.");return;}const c=corporateCost(u);if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.corporate[id]++;g.stats.totalBuildSpend+=c;addXP(18);saveGame();render();}

function regionRequirementMet(r){if(!r.requires)return true;if(r.id==="orbital"&&!g.megaProjects.orbitalOps)return false;return !!g.regions[r.requires];}
function buyRegion(id){const r=REGIONS.find(x=>x.id===id);if(!r||g.regions[id])return;if(r.id==="orbital"&&!g.megaProjects.orbitalOps){toast("Complete Orbital Operations Authority first.");return;}if(!regionRequirementMet(r)){const p=REGIONS.find(x=>x.id===r.requires);toast("Connect "+(p?.name||"the previous grid")+" first.");return;}const c=regionCost(r);if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.regions[id]=true;g.stats.totalBuildSpend+=c;g.reputation+=Math.max(3,Math.round(r.bonus));if(g.policy==="renewable")g.reputation+=5;addXP(30+Math.min(120,r.bonus*5));addLog(r.name+" connected to the company grid.");feedback(true);toast("⚡ "+r.name+" CONNECTED");saveGame();render();}

function startContract(id){if(g.activeContract){toast("Finish the current contract first.");return;}const c=CONTRACTS.find(x=>x.id===id);if(!c)return;if(output()<c.required){toast("Requires "+num(c.required)+" kWh/s output.");return;}g.activeContract={id:c.id,name:c.name,rate:c.rate,reward:contractReward(c),end:now()+c.duration*1000,started:now()};addLog("Contract started: "+c.name+".");saveGame();renderContracts();}
function updateContract(){if(g.activeContract&&now()>=g.activeContract.end){const c=g.activeContract;g.cash+=c.reward;g.lifetimeCash+=c.reward;g.contractsCompleted++;g.stats.totalContractRewards+=c.reward;g.reputation+=4;addXP(40);addLog("Contract completed: "+c.name+" +"+money(c.reward)+".");g.activeContract=null;toast("Contract complete! "+money(c.reward));}}

function sellPower(){playGameSound("cash");if(g.stored<=0){toast("Generate some power first.");return;}const amount=g.stored;const cash=amount*marketSaleMult();g.cash+=cash;g.lifetimeCash+=cash;g.sold+=amount;g.stored=0;g.stats.marketSales+=cash;g.stats.bestSale=Math.max(g.stats.bestSale,cash);addXP(Math.max(1,amount/300));addLog("Sold "+num(amount)+" kWh for "+money(cash)+".");feedback(true);saveGame();render();toast("Grid sale: "+money(cash));}
function dispatchPower(){if(g.stored<10){toast("Need at least 10 kWh stored.");return;}const amount=Math.min(g.stored,Math.max(10,output()*20));const bonus=1.08+(g.research.gridAI||0)*.035+(g.megaProjects.gridAI ? .04 : 0);const cash=amount*marketSaleMult()*bonus;g.stored-=amount;g.cash+=cash;g.lifetimeCash+=cash;g.sold+=amount;g.dispatches++;g.stats.marketSales+=cash;g.stats.bestSale=Math.max(g.stats.bestSale,cash);g.reputation+=2;addXP(3);addLog("Emergency grid dispatch sold "+num(amount)+" kWh for "+money(cash)+".");saveGame();render();}
function toggleAutoSell(){if((g.research.automation||0)<1){toast("Research Advanced Automation first.");return;}g.autoSell=!g.autoSell;saveGame();render();}
function autoSellTick(){if(!g.autoSell||g.stored<=0)return;const threshold=g.megaProjects.gridAI ? .95 : 1.05;if(g.market.price<threshold&&g.policy!=="market")return;const amount=Math.min(g.stored,Math.max(1,output()*4));const cash=amount*marketSaleMult()*(1+(g.research.gridAI||0)*.025);g.stored-=amount;g.cash+=cash;g.lifetimeCash+=cash;g.sold+=amount;g.stats.marketSales+=cash;}

function chargeBattery(){const cap=batteryCapacity();if(cap<=0){toast("Build the grid battery first.");return;}const room=Math.max(0,cap-g.battery.stored),amount=Math.min(g.stored,room);if(amount<=0){toast("Battery is full or no power is available.");return;}g.stored-=amount;g.battery.stored+=amount;saveGame();render();}
function dischargeBattery(){if(g.battery.stored<=0){toast("Battery is empty.");return;}const amount=g.battery.stored,cash=amount*marketSaleMult()*1.12;g.battery.stored=0;g.cash+=cash;g.lifetimeCash+=cash;g.sold+=amount;g.stats.marketSales+=cash;g.stats.bestSale=Math.max(g.stats.bestSale,cash);g.reputation+=1;addLog("Battery discharged "+num(amount)+" kWh for "+money(cash)+".");saveGame();render();}
function upgradeBattery(){const c=batteryUpgradeCost();if(g.cash<c){toast("Battery upgrade requires "+money(c));return;}g.cash-=c;g.battery.level++;g.stats.totalBuildSpend+=c;g.reputation+=2;addXP(12);addLog("Utility battery upgraded to Level "+g.battery.level+".");saveGame();render();}

function performMaintenance(){const c=maintenanceCost();if(g.cash<c){toast("Maintenance requires "+money(c));return;}g.cash-=c;g.stats.totalMaintenance+=c;g.maintenance=100;PLANTS.forEach(p=>{const s=plantState(p.id);if(s?.unlocked)s.condition=Math.min(100,s.condition+38+(g.staff.engineer||0)*3);});addXP(10);addLog("Fleet maintenance completed.");saveGame();render();}
function hireStaff(id){const t=STAFF_TYPES.find(x=>x.id===id);if(!t)return;const c=staffCost(t);if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.staff[id]++;g.stats.totalBuildSpend+=c;g.reputation+=2;addXP(12);addLog(t.name+" department expanded to Level "+g.staff[id]+".");saveGame();render();}
function setPolicy(id){if(!POLICIES.some(p=>p.id===id))return;g.policy=id;addLog("Dispatch policy changed to "+POLICIES.find(p=>p.id===id).name+".");saveGame();render();}
function buyResearch(id){const r=RESEARCH.find(x=>x.id===id);if(!r)return;const lv=g.research[id]||0;if(lv>=r.max){toast("Research maxed.");return;}const c=researchCost(r);if(g.cash<c){toast("Need "+money(c));return;}g.cash-=c;g.research[id]++;g.stats.totalBuildSpend+=c;g.reputation+=3;addXP(20);addLog("Research completed: "+r.name+" Level "+g.research[id]+".");saveGame();render();}
function buyMegaProject(id){const m=MEGAPROJECTS.find(x=>x.id===id);if(!m||g.megaProjects[id])return;if(g.cash<m.cost){toast("Need "+money(m.cost));return;}g.cash-=m.cost;g.megaProjects[id]=true;g.stats.totalBuildSpend+=m.cost;g.reputation+=25;addXP(100);addLog("Megaproject completed: "+m.name+".");feedback(true);toast("🌐 "+m.name+" COMPLETE");saveGame();render();}
function buyPrestigeUpgrade(id){const p=PRESTIGE_TREE.find(x=>x.id===id);if(!p)return;const lv=g.prestigeTree[id]||0;if(lv>=p.max){toast("Legacy upgrade maxed.");return;}const cost=p.cost+Math.floor(lv/2);if(g.gridCredits<cost){toast("Need "+cost+" Grid Credits.");return;}g.gridCredits-=cost;g.prestigeTree[id]++;addLog("Prestige Grid upgraded: "+p.name+" Rank "+g.prestigeTree[id]+".");saveGame();render();}
function prestigeCreditAward(){if(g.lifetimeCash<50000)return 0;const cashScore=Math.max(1,Math.floor(Math.log10(g.lifetimeCash/50000+1)*3));return cashScore+Math.floor((connectedRegions()-1)/4)+Math.floor(megaCount()/2);}
function prestige(){const award=prestigeCreditAward();if(award<=0){toast("Earn $50,000 lifetime cash first.");return;}askConfirm("Prestige Company","Reset cash, fleet, battery and grid expansion for +12% production and earn "+award+" Grid Credits. Megaprojects, Prestige Grid, achievements and permanent purchases stay.",()=>{const keep={prestige:g.prestige+1,achievements:g.achievements,settings:g.settings,megaProjects:g.megaProjects,powerPass:g.powerPass,prestigeTree:g.prestigeTree,gridCredits:g.gridCredits+award,daily:g.daily,stats:g.stats};g=defaultGame();Object.assign(g,keep);g.companyLevel=Math.max(1,Math.floor((g.companyLevel||1)*.35));g.log=["Company prestiged. Earned "+award+" Grid Credits."];migrate();saveGame();render();feedback(true);});}

function createEvent(){if(g.event||now()<g.eventCooldown||output()<=0)return;const chance=.032*weatherObj().event;if(Math.random()>chance)return;const r=Math.random();if(r<.18)g.event={type:"breakdown",title:"⚠ Turbine Trip",text:"A major generating unit tripped. Output reduced 50%.",cost:Math.max(500,output()*18)};else if(r<.34)g.event={type:"transformer",title:"⚡ Transformer Failure",text:"Transmission equipment failed. Output reduced until repair.",cost:Math.max(1200,output()*25)};else if(r<.50)g.event={type:"surge",title:"📈 Record Demand",text:"Grid demand surged. Sale value is temporarily elevated.",expires:now()+75000};else if(r<.62)g.event={type:"inspection",title:"🦺 Regulatory Inspection",text:"Complete the inspection for reputation and cash.",reward:Math.max(1500,output()*15)};else if(r<.74)g.event={type:"fuel",title:"⛽ Fuel Price Shock",text:"Fuel markets tightened. Hedge the exposure.",cost:Math.max(2500,fuelCostPerSecond()*600)};else if(r<.84)g.event={type:"grant",title:"🏛 Energy Infrastructure Grant",text:"A public infrastructure grant is available.",reward:Math.max(5000,output()*30)};else if(r<.92)g.event={type:"storm",title:"⛈️ Severe Grid Storm",text:"Storm conditions reduced transmission efficiency.",expires:now()+60000};else g.event={type:"heat",title:"🔥 Extreme Heat Alert",text:"Cooling systems are under stress during peak demand.",expires:now()+60000};g.eventCooldown=now()+90000;playGameSound("alarm");addLog(g.event.title);}
function resolveEvent(){if(!g.event)return;const e=g.event;if(["breakdown","transformer","fuel"].includes(e.type)){if(g.cash<e.cost){toast("Requires "+money(e.cost));return;}g.cash-=e.cost;g.stats.totalMaintenance+=e.cost;g.maintenance=Math.max(55,g.maintenance-3);addXP(8);}else if(["inspection","grant"].includes(e.type)){g.cash+=e.reward;g.lifetimeCash+=e.reward;g.reputation+=e.type==="grant"?5:3;addXP(12);}g.event=null;saveGame();render();}
function updateEvent(){if(g.event?.expires&&now()>=g.event.expires)g.event=null;}
function shiftWeather(){if(now()-(g.weather.lastShift||0)<60000)return;const old=g.weather.id;let next=WEATHER[Math.floor(Math.random()*WEATHER.length)].id;if(next===old&&Math.random()<.7)next="clear";g.weather={id:next,lastShift:now()};addLog("Weather changed to "+weatherObj().label+".");}
function shiftMarket(){const old=g.market.price;const trader=(g.staff.trader||0)*.004;const volatility=Math.max(.035,.115-Math.min(.06,trader));const weatherDemand=g.weather.id==="heat"?0.03:g.weather.id==="storm"?0.02:0;g.market.price=clamp(old+(Math.random()-.47)*volatility+weatherDemand,.45,2.4);g.market.demand=clamp(g.market.demand+(Math.random()-.48)*.09+(g.weather.id==="heat" ? .035 : 0),.65,1.55);g.market.trend=g.market.price-old;g.market.lastShift=now();g.market.history.push(g.market.price);g.market.history=g.market.history.slice(-64);const avg=g.market.history.slice(-8).reduce((a,b)=>a+b,0)/Math.min(8,g.market.history.length);g.market.forecast=clamp(avg+(g.market.trend||0)*2,.45,2.4);}

function degradePlant(){if(output()<=0)return;let d=.012*(1-Math.min(.65,(g.corporate.maint||0)*.04))*(1-Math.min(.55,(g.staff.engineer||0)*.05));if(g.policy==="maximum")d*=1.45;if(g.policy==="reliability")d*=.48;d*=1-Math.min(.5,(g.research.materials||0)*.06);if(g.megaProjects.nuclearServices)d*=.88;g.maintenance=Math.max(0,g.maintenance-d);PLANTS.forEach(p=>{const s=plantState(p.id);if(s?.unlocked)s.condition=Math.max(20,s.condition-d*.7);});g.reliability=clamp(97-(100-g.maintenance)*.34+(g.staff.safety||0)*1.4+(g.research.controls||0)*2+(g.megaProjects.controlCenter?10:0),35,100);}
function payOperatingCosts(){const c=fuelCostPerSecond();g.stats.totalFuelCost+=c;if(g.cash>=c)g.cash-=c;else{g.cash=0;g.maintenance=Math.max(0,g.maintenance-.025);}}

function missionValue(m){if(m.type==="generated")return g.generated;if(m.type==="lifetimeCash")return g.lifetimeCash;if(m.type==="levels")return totalPlantLevels();if(m.type==="output")return output();if(m.type==="contracts")return g.contractsCompleted;if(m.type==="companyLevel")return g.companyLevel;if(m.type==="battery")return g.battery.level;if(m.type==="staff")return totalStaff();if(m.type==="regions")return connectedRegions();if(m.type==="mega")return megaCount();if(m.type==="fusion")return plantState("fusion").unlocked?1:0;return 0;}
function claimMission(id){const m=MISSIONS.find(x=>x.id===id);if(!m||g.missions[id]||missionValue(m)<m.target)return;g.missions[id]=true;g.cash+=m.reward;g.lifetimeCash+=m.reward;addXP(15);addLog("Mission completed: "+m.label);saveGame();render();}
function achievementValue(a){if(a.type==="generated")return g.generated;if(a.type==="regions")return connectedRegions();if(a.type==="lifetimeCash")return g.lifetimeCash;if(a.type==="companyLevel")return g.companyLevel;if(a.type==="mega")return megaCount();if(a.type==="fusion")return plantState("fusion").unlocked?1:0;if(a.type==="autogen")return g.autoGenerateUnlocked?1:0;if(a.type==="prestige")return g.prestige;if(a.type.startsWith("plant:"))return plantState(a.type.split(":")[1]).unlocked?1:0;return 0;}
function updateAchievements(){ACHIEVEMENTS.forEach(a=>{if(!g.achievements[a.id]&&achievementValue(a)>=a.target){g.achievements[a.id]=true;g.reputation+=2;addLog("Achievement unlocked: "+a.label);toast("🏆 "+a.label);}});}
function weekKey(){const d=new Date(),one=new Date(d.getFullYear(),0,1),week=Math.ceil((((d-one)/86400000)+one.getDay()+1)/7);return d.getFullYear()+"-"+week;}
function updateWeekly(){const k=weekKey();if(g.weekly.weekKey!==k)g.weekly={weekKey:k,baseGenerated:g.generated,claimed:false};}
function weeklyProgress(){updateWeekly();return Math.max(0,g.generated-(g.weekly.baseGenerated||0));}
function claimWeekly(){const target=Math.max(250000,output()*2500),p=weeklyProgress();if(g.weekly.claimed){toast("Weekly reward already claimed.");return;}if(p<target){toast("Weekly challenge not complete.");return;}const reward=Math.max(50000,output()*100);g.cash+=reward;g.lifetimeCash+=reward;g.reputation+=20;g.weekly.claimed=true;addXP(50);saveGame();render();}

function dayKey(ts=now()){const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function dayDiff(a,b){if(!a||!b)return 999;return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000);}
function dailyReward(){const today=dayKey();if(g.daily.lastClaimDay===today){toast("Daily reward already claimed today.");return;}const diff=dayDiff(g.daily.lastClaimDay,today);g.daily.streak=diff===1?Math.min(7,g.daily.streak+1):1;g.daily.best=Math.max(g.daily.best,g.daily.streak);g.daily.lastClaimDay=today;g.lastDaily=now();const base=[800,1200,1800,2800,4200,6500,10000][g.daily.streak-1];const reward=base+Math.round(output()*50*g.daily.streak);g.cash+=reward;g.lifetimeCash+=reward;g.reputation+=g.daily.streak;addXP(6+g.daily.streak);if(g.daily.streak===7)g.boostUntil=Math.max(g.boostUntil,now()+15*60*1000);addLog("Daily supply drop: "+money(reward)+" (Day "+g.daily.streak+").");saveGame();render();}
function starterPack(){if(g.starter){toast("Starter Pack already claimed.");return;}g.starter=true;g.cash+=5000;g.lifetimeCash+=5000;g.boostUntil=Math.max(g.boostUntil,now()+10*60*1000);addXP(10);saveGame();render();toast("TEST PURCHASE • Starter Pack");}
function maintenancePack(){g.maintenance=100;PLANTS.forEach(p=>{const s=plantState(p.id);if(s?.unlocked)s.condition=100;});saveGame();render();toast("TEST PURCHASE • Maintenance Pack");}
function activateBoost(){if(now()<g.boostUntil){toast("2× boost already active.");return;}g.boostUntil=now()+10*60*1000;saveGame();render();toast("⚡ 2× Grid Output activated");}
function purchasePremiumPass(){if(entitlements.premiumPass){toast("Premium Power Pass already owned.");return;}entitlements.premiumPass=true;saveEntitlements();g.powerPass.premium=true;addLog("Premium Power Pass test entitlement unlocked.");saveGame();render();toast("⭐ Premium Power Pass unlocked!");}
function restorePurchasesPlaceholder(){g.autoGenerateUnlocked=!!entitlements.autoGenerate;g.powerPass.premium=!!entitlements.premiumPass;if(g.autoGenerateUnlocked&&g.autoGenerateLevel<1)g.autoGenerateLevel=1;saveGame();render();toast("Browser entitlements restored.");}
function powerPassTier(){let t=1;POWER_PASS_REWARDS.forEach(r=>{if(g.powerPass.xp>=r.xp)t=r.tier;});return t;}
function claimPowerPass(tier,lane){const r=POWER_PASS_REWARDS.find(x=>x.tier===tier);if(!r)return;if(g.powerPass.xp<r.xp){toast("Keep playing to reach this tier.");return;}if(lane==="premium"&&!g.powerPass.premium){toast("Premium Power Pass is locked.");return;}const claims=lane==="premium"?g.powerPass.premiumClaimed:g.powerPass.freeClaimed;if(claims[tier]){toast("Reward already claimed.");return;}const reward=r[lane];if(reward.cash){g.cash+=reward.cash;g.lifetimeCash+=reward.cash;}if(reward.boost)g.boostUntil=Math.max(g.boostUntil,now()+reward.boost*1000);claims[tier]=true;addLog("Power Pass Tier "+tier+" "+lane+" reward claimed.");saveGame();render();}

function toggleSetting(k){g.settings[k]=!g.settings[k];applySettings();saveGame();}
function applySettings(){[["soundToggle","sound"],["hapticsToggle","haptics"],["motionToggle","reducedMotion"],["compactToggle","compact"]].forEach(([id,k])=>{const e=byId(id);if(e){e.textContent=g.settings[k]?"ON":"OFF";e.classList.toggle("on",!!g.settings[k]);}});document.body.classList.toggle("reduced-motion",!!g.settings.reducedMotion);}
function exportSave(){const data=btoa(unescape(encodeURIComponent(JSON.stringify(g))));navigator.clipboard?.writeText(data).then(()=>toast("Save copied to clipboard")).catch(()=>prompt("Copy your save code:",data));}
function importSave(){const data=prompt("Paste your Power Plant Tycoon save code:");if(!data)return;try{const obj=JSON.parse(decodeURIComponent(escape(atob(data))));if(!obj||typeof obj!=="object")throw new Error("bad");g=obj;migrate();saveGame();render();toast("Save imported");}catch(e){toast("Invalid save code");}}
let pendingConfirm=null;function askConfirm(title,text,fn){pendingConfirm=fn;byId("confirmTitle").textContent=title;byId("confirmText").textContent=text;byId("confirmYes").onclick=()=>{const f=pendingConfirm;closeConfirm();if(f)f();};byId("confirmModal").classList.add("show");}function closeConfirm(){byId("confirmModal").classList.remove("show");pendingConfirm=null;}
function resetGame(){askConfirm("Erase Save?","Reset local gameplay while keeping browser purchase entitlements?",()=>{const settings=g.settings;localStorage.removeItem(SAVE_KEY);g=defaultGame();g.settings=settings;migrate();saveGame();render();toast("Save reset");});}

function nextLockedRegion(){return REGIONS.find(r=>r.id!=="riverbend"&&!g.regions[r.id])||null;}
function nextTarget(){const p=PLANTS.find(x=>!plantState(x.id).unlocked&&(x.id!=="fusion"||g.megaProjects.fusionCampus));if(p)return {title:"Build "+p.name,hint:"Need "+money(plantCost(p))};const r=nextLockedRegion();if(r)return {title:"Connect "+r.name,hint:"Need "+money(regionCost(r))};const m=MEGAPROJECTS.find(x=>!g.megaProjects[x.id]);if(m)return {title:m.name,hint:"Megaproject "+money(m.cost)};return {title:"Prestige & Dominate",hint:"Expand the legacy grid"};}
function rankName(){if(g.companyLevel>=40)return"GLOBAL ENERGY AUTHORITY";if(g.companyLevel>=30)return"PLANETARY GRID DIRECTOR";if(g.companyLevel>=20)return"UTILITY TITAN";if(g.lifetimeCash>=100000000)return"ENERGY CORPORATION";if(g.lifetimeCash>=1000000)return"ENERGY MOGUL";if(g.lifetimeCash>=250000)return"GRID BARON";if(g.lifetimeCash>=50000)return"POWER EXECUTIVE";if(g.lifetimeCash>=10000)return"PLANT MANAGER";return"GRID ROOKIE";}
function currentSelectedPlant(){let id=g.viewStage;if(!plantById(id)||!plantState(id).unlocked){const p=[...PLANTS].reverse().find(x=>plantState(x.id).unlocked);id=p?p.id:"diesel";}return plantById(id);}
function plantImage(id){if(id==="ccgt")return"gas";if(id==="smr")return"nuclear";return id;}

function renderTop(){byId("cash").textContent=money(g.cash);byId("power").textContent=num(g.stored)+" kWh";byId("output").textContent=num(output())+"/s";byId("incomeRate").textContent=money(netValuePerSecond())+"/s";byId("batteryMini").textContent="Battery "+num(g.battery.stored);byId("gridBonusMini").textContent="Grid +"+gridBonusPercent()+"%";byId("companyLevelTop").textContent="LV "+g.companyLevel;byId("companyXPTop").textContent=Math.floor(g.companyXP)+" / "+companyTarget()+" XP";byId("rank").textContent=rankName()+" • LV "+g.operatorLevel;byId("weatherTop").textContent=weatherObj().icon+" "+weatherObj().label;}
function renderAutoGenerate(){const btn=byId("autoGenerateBtn");if(btn){btn.classList.remove("locked","on");if(!g.autoGenerateUnlocked){btn.textContent="🔒 AUTO GENERATE";btn.classList.add("locked");}else if(g.autoGenerate){btn.textContent=`🤖 AUTO GENERATE: ON • LV ${g.autoGenerateLevel}`;btn.classList.add("on");}else btn.textContent=`🤖 AUTO GENERATE: OFF • LV ${g.autoGenerateLevel}`;}const buy=byId("autoGeneratePurchaseBtn");if(buy){buy.textContent=g.autoGenerateUnlocked?"OWNED":"TEST BUY";buy.disabled=g.autoGenerateUnlocked;}const up=byId("autoGenerateUpgradeBtn");if(up){up.disabled=!g.autoGenerateUnlocked;up.textContent=g.autoGenerateUnlocked?"UPGRADE "+money(autoGenerateUpgradeCost()):"LOCKED";}if(byId("autoGenerateStoreInfo"))byId("autoGenerateStoreInfo").textContent=g.autoGenerateUnlocked?`Owned • Level ${g.autoGenerateLevel}`:"Locked";if(byId("autoGenerateUpgradeInfo"))byId("autoGenerateUpgradeInfo").textContent=`Level ${g.autoGenerateLevel} • ${num(autoGenerateAmount())} kWh/s`;}
function renderHero(){const p=currentSelectedPlant(),s=plantState(p.id);byId("facilityTitle").textContent=p.name==="Diesel Generator"?"Riverbend Station":p.name;byId("facilitySub").textContent=s.unlocked?`${p.desc} • Level ${s.level}`:"Build your first generating unit.";byId("facilityStage").textContent=`RIVERBEND • ${p.name.toUpperCase()} • ${dayPhase()} SHIFT`;byId("plantRail").innerHTML=PLANTS.map(x=>{const st=plantState(x.id),locked=!st.unlocked;return `<button class="rail-btn ${g.viewStage===x.id?"active":""} ${locked?"locked":""}" onclick="selectStageView('${x.id}')"><img src="images/v8/plants/${plantImage(x.id)}.jpg" alt=""><span><strong>${x.icon} ${x.name.replace(" Demonstration Plant","").replace(" Generator","")}</strong><small>${st.unlocked?"LV "+st.level:"LOCKED"}</small></span></button>`;}).join("");byId("gridStatus").textContent=g.event&&["breakdown","transformer"].includes(g.event.type)?"ALERT":"ONLINE";byId("statusEfficiency").textContent=Math.round(totalMult()*100)+"%";byId("statusReliability").textContent=Math.round(g.reliability)+"%";byId("statusOutput").textContent=num(output())+"/s";byId("statusDemand").textContent=Math.round(g.market.demand*100)+"%";byId("statusWeather").textContent=weatherObj().label;const cond=PLANTS.filter(x=>plantState(x.id).unlocked).reduce((a,x)=>a+plantState(x.id).condition,0)/Math.max(1,unlockedPlantCount());byId("fuelSystemText").textContent=fuelCostPerSecond()>0?money(fuelCostPerSecond())+"/s":"Fuel Free";byId("turbineText").textContent=unlockedPlantCount()?"Online":"Standby";byId("generatorText").textContent=Math.round(cond)+"% condition";byId("gridLinkText").textContent=g.reliability>85?"Stable":"Watch";[["fuelSystemBar",100-Math.min(70,fuelCostPerSecond()/Math.max(1,output())*100)],["turbineBar",cond],["generatorBar",cond],["gridLinkBar",g.reliability]].forEach(([id,val])=>byId(id).style.width=clamp(val,8,100)+"%");renderAutoGenerate();}
function renderEmpireStrip(){byId("companyLevelValue").textContent=g.companyLevel;byId("companyXPValue").textContent=Math.floor(g.companyXP)+" / "+companyTarget()+" XP";byId("dailyStreakValue").textContent=g.daily.streak;byId("dailyBestValue").textContent="Best "+g.daily.best;byId("powerPassTierHome").textContent="Tier "+powerPassTier();byId("passXPHome").textContent=num(g.powerPass.xp)+" XP";const t=nextTarget();byId("nextGoalValue").textContent=t.title;byId("nextGoalHint").textContent=t.hint;byId("empireHeadline").textContent=rankName();byId("empireSub").textContent=`${unlockedPlantCount()} plants • ${connectedRegions()} regions • ${megaCount()} megaprojects • ${g.gridCredits} Grid Credits`;}
function renderEvent(){const b=byId("eventBanner");if(!g.event){b.classList.remove("show");return;}b.classList.add("show");byId("eventTitle").textContent=g.event.title;let txt=g.event.text,bt="RESOLVE";if(g.event.cost){txt+=" Cost: "+money(g.event.cost);bt="RESOLVE "+money(g.event.cost);}if(g.event.reward){txt+=" Reward: "+money(g.event.reward);bt="CLAIM";}if(g.event.expires){txt+=" "+Math.max(0,Math.ceil((g.event.expires-now())/1000))+"s remaining.";bt="END EVENT";}byId("eventText").textContent=txt;byId("eventButton").textContent=bt;}
function renderHomeCards(){byId("spotPrice").textContent="$"+g.market.price.toFixed(2);byId("gridDemand").textContent=Math.round(g.market.demand*100)+"%";byId("marketTrend").textContent=g.market.trend>=.01?"▲ RISING":g.market.trend<=-.01?"▼ FALLING":"STABLE";byId("marketForecastMini").textContent=g.market.forecast>g.market.price+.04?"Rising":g.market.forecast<g.market.price-.04?"Falling":"Stable";byId("autoSellMini").textContent=g.autoSell?"ON":"OFF";drawMarket(byId("marketMiniCanvas"),false);renderHomeContract();byId("gridConnectedMini").textContent=connectedRegions()+" / "+REGIONS.length;byId("gridConnectedCountHome").textContent=connectedRegions();byId("gridBonusHome").textContent="+"+gridBonusPercent()+"%";const nr=nextLockedRegion();byId("gridNextHome").textContent=nr?nr.name:"COMPLETE";byId("kpiLifetime").textContent=money(g.lifetimeCash);byId("kpiContracts").textContent=g.contractsCompleted;byId("megaProjectCountHome").textContent=megaCount()+" / "+MEGAPROJECTS.length;byId("kpiPrestige").textContent=g.prestige;byId("gridCreditsHome").textContent=g.gridCredits+" Grid Credits";}
function renderHomeContract(){const e=byId("homeContract");if(g.activeContract){const rem=Math.max(0,Math.ceil((g.activeContract.end-now())/1000));e.innerHTML=`<div class="contract-card active"><div class="row"><h4>${g.activeContract.name}</h4><strong class="reward">${money(g.activeContract.reward)}</strong></div><p>${rem}s remaining • ${g.activeContract.rate.toFixed(2)}× sale multiplier</p><div class="progress"><i style="width:${clamp(100-rem/Math.max(1,(g.activeContract.end-g.activeContract.started)/1000)*100,0,100)}%"></i></div></div>`;}else{const c=CONTRACTS.find(x=>output()>=x.required)||CONTRACTS[0];e.innerHTML=`<div class="contract-card"><div class="row"><h4>${c.icon} ${c.name}</h4><strong class="reward">${money(contractReward(c))}</strong></div><p>Requires ${num(c.required)} kWh/s • ${c.rate.toFixed(2)}× sales</p><button class="btn ${output()>=c.required?"green":"dark"} wide" onclick="startContract('${c.id}')">${output()>=c.required?"ACCEPT CONTRACT":"OUTPUT TOO LOW"}</button></div>`;}}

function renderPlants(){byId("plantCountBadge").textContent=unlockedPlantCount()+" / "+PLANTS.length+" ONLINE";byId("plantList").innerHTML=PLANTS.map(p=>{const s=plantState(p.id),c=plantCost(p),spec=g.plantSpecialization[p.id]||0;return `<div class="plant-card ${s.unlocked?"":"locked"}"><div class="plant-card-bg" style="background-image:url('images/v8/plants/${plantImage(p.id)}.jpg')"></div><div class="plant-card-shade"></div><div class="plant-card-content"><div class="plant-card-head"><strong>${p.icon} ${p.name}</strong><span>${s.unlocked?"LV "+s.level:"LOCKED"}</span></div><p>${p.desc}</p><small>${s.unlocked?`${num(plantBaseOutput(p)*totalMult())}/s fleet contribution • ${Math.round(s.condition)}% condition • Spec ${spec}/4`:"Commission for "+money(c)}</small><div class="plant-actions"><button onclick="buildPlant('${p.id}')">${s.unlocked?"UPGRADE "+money(c):"BUILD "+money(c)}</button>${s.unlocked?`<button class="view" onclick="selectStageView('${p.id}');showPage('home')">VIEW</button>`:""}${s.unlocked&&s.level>=5?`<button class="spec" onclick="specializePlant('${p.id}')" ${spec>=4?"disabled":""}>${spec>=4?"SPECIALIZED":"SPECIALIZE "+money(specializationCost(p.id))}</button>`:""}</div></div></div>`;}).join("");byId("corporateUpgradeList").innerHTML=CORPORATE.map(u=>{const lv=g.corporate[u.id]||0,done=lv>=u.max;return `<div class="upgrade-card"><div class="row"><h4>${u.icon} ${u.name}</h4><b>LV ${lv}/${u.max}</b></div><p>${u.desc}</p><button class="btn ${done?"green":"blue"} wide" onclick="buyCorporate('${u.id}')" ${done?"disabled":""}>${done?"MAXED":money(corporateCost(u))}</button></div>`;}).join("");const award=prestigeCreditAward();byId("prestigeInfo").innerHTML=`<div class="dashboard-grid four"><div class="metric-card"><small>PRESTIGE</small><b>${g.prestige}</b><i>+${g.prestige*12}% legacy production</i></div><div class="metric-card"><small>GRID CREDITS</small><b>${g.gridCredits}</b><i>Spend at Company HQ</i></div><div class="metric-card"><small>NEXT PRESTIGE</small><b>${award||"LOCKED"}</b><i>${award?"Grid Credits":"Need $50K lifetime cash"}</i></div><div class="metric-card"><small>LIFETIME CASH</small><b>${money(g.lifetimeCash)}</b><i>Current company run</i></div></div>`;}

const MAP_POS=[[8,74],[16,62],[24,55],[32,45],[39,35],[47,42],[55,58],[62,47],[69,63],[75,41],[80,55],[85,32],[72,24],[61,18],[51,28],[42,19],[31,25],[22,18],[13,28],[91,18]];
function renderRegions(){byId("gridConnectedCount").textContent=connectedRegions()+" / "+REGIONS.length;byId("gridBonusValue").textContent="+"+gridBonusPercent()+"%";const nr=nextLockedRegion();byId("gridNextRegion").textContent=nr?nr.name:"GRID COMPLETE";byId("regionList").innerHTML=REGIONS.map((r,i)=>{const owned=!!g.regions[r.id],available=regionRequirementMet(r),prior=REGIONS.find(x=>x.id===r.requires);let action;if(owned)action='<span class="badge">CONNECTED</span>';else if(available)action=`<button class="btn blue" onclick="buyRegion('${r.id}')">CONNECT ${money(regionCost(r))}</button>`;else action=`<button class="btn dark" disabled>REQUIRES ${r.id==="orbital"&&!g.megaProjects.orbitalOps?"ORBITAL AUTHORITY":(prior?.name||"PRIOR GRID")}</button>`;return `<div class="region ${owned?"connected":available?"available":"locked"}"><div class="region-tier">${r.tier} • NODE ${i+1}</div><div class="region-icon">${r.emoji}</div><h4>${r.name}</h4><p>+${Math.round(r.bonus*100)}% production • ${r.desc}</p>${action}</div>`;}).join("");const nextId=nr?.id;byId("mapNodeLayer").innerHTML=REGIONS.map((r,i)=>`<span class="map-node ${g.regions[r.id]?"on":r.id===nextId?"next":""}" style="left:${MAP_POS[i][0]}%;top:${MAP_POS[i][1]}%" title="${r.name}"></span>`).join("");}

function renderContracts(){byId("contractCountLabel").textContent=g.contractsCompleted+" COMPLETED";const active=byId("activeContractPanel");if(g.activeContract){const rem=Math.max(0,Math.ceil((g.activeContract.end-now())/1000)),total=Math.max(1,(g.activeContract.end-g.activeContract.started)/1000);active.innerHTML=`<div class="contract-card active"><div class="row"><h4>📜 ${g.activeContract.name}</h4><strong class="reward">${money(g.activeContract.reward)}</strong></div><p>${rem}s remaining • ${g.activeContract.rate.toFixed(2)}× sales while active</p><div class="progress"><i style="width:${clamp((1-rem/total)*100,0,100)}%"></i></div></div>`;}else active.innerHTML='<div class="small">No active contract. Choose an agreement below.</div>';byId("contractList").innerHTML=CONTRACTS.map(c=>`<div class="contract-card"><div class="row"><h4>${c.icon} ${c.name}</h4><strong class="reward">${money(contractReward(c))}</strong></div><p>Requires ${num(c.required)} kWh/s • ${c.duration}s • ${c.rate.toFixed(2)}× sale multiplier</p><button class="btn ${output()>=c.required&&!g.activeContract?"green":"dark"} wide" onclick="startContract('${c.id}')" ${g.activeContract?"disabled":""}>${g.activeContract?"CONTRACT ACTIVE":output()>=c.required?"ACCEPT":"OUTPUT TOO LOW"}</button></div>`).join("");}

function renderMarket(){const hist=g.market.history;byId("spotPriceLarge").textContent="$"+g.market.price.toFixed(2);byId("gridDemandLarge").textContent=Math.round(g.market.demand*100)+"%";byId("demandBand").textContent=g.market.demand>1.25?"Very High":g.market.demand>1.05?"High":g.market.demand<.82?"Low":"Normal";byId("marketHigh").textContent="$"+Math.max(...hist).toFixed(2);byId("marketLow").textContent="$"+Math.min(...hist).toFixed(2);byId("marketForecastLabel").textContent=g.market.forecast>g.market.price+.04?"RISING FORECAST":g.market.forecast<g.market.price-.04?"FALLING FORECAST":"STABLE FORECAST";drawMarket(byId("marketCanvas"),true);const trend=(g.market.forecast-g.market.price)/Math.max(.01,g.market.price);byId("forecastMetrics").innerHTML=`<div><small>NEXT FORECAST</small><b>$${g.market.forecast.toFixed(2)}</b></div><div><small>PRICE MOMENTUM</small><b>${trend>=0?"+":""}${(trend*100).toFixed(1)}%</b></div><div><small>WEATHER IMPACT</small><b>${weatherObj().icon} ${weatherObj().label}</b></div><div><small>TRADER LEVEL</small><b>LV ${g.staff.trader}</b></div>`;const cap=batteryCapacity(),pct=cap?clamp(g.battery.stored/cap*100,0,100):0;byId("batteryLevel").textContent="LV "+g.battery.level;byId("batteryStored").textContent=num(g.battery.stored)+" kWh";byId("batteryCapacityText").textContent="Capacity "+num(cap)+" kWh";document.querySelector(".battery-ring")?.style.setProperty("--battery-pct",pct+"%");byId("autoSellBtn").textContent="AUTO SELL: "+(g.autoSell?"ON":"OFF");byId("autoSellBtn").className="btn "+(g.autoSell?"green":"dark")+" wide";byId("autoSellState").textContent=g.autoSell?"AUTO SELL ONLINE":"AUTO SELL OFF";}
function drawMarket(canvas,large){if(!canvas)return;const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle="#193e53";ctx.lineWidth=1;for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(0,h*i/5);ctx.lineTo(w,h*i/5);ctx.stroke();}const data=g.market.history.slice(large?-48:-24);const mn=Math.min(...data,.45),mx=Math.max(...data,2.0),pad=12;ctx.beginPath();data.forEach((v,i)=>{const x=pad+(w-pad*2)*(i/Math.max(1,data.length-1));const y=h-pad-(h-pad*2)*((v-mn)/Math.max(.01,mx-mn));if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.strokeStyle=g.market.trend>=0?"#2ee176":"#ff6467";ctx.lineWidth=large?4:3;ctx.stroke();}

function renderCompany(){byId("staffList").innerHTML=STAFF_TYPES.map(t=>`<div class="staff-card"><div class="row"><h4><span class="avatar">${t.icon}</span> ${t.name}</h4><b>LV ${g.staff[t.id]}</b></div><p>${t.desc}</p><button class="btn blue wide" onclick="hireStaff('${t.id}')">EXPAND ${money(staffCost(t))}</button></div>`).join("");byId("policyList").innerHTML=POLICIES.map(p=>`<div class="policy-card ${g.policy===p.id?"active":""}"><h4>${g.policy===p.id?"✅":"⚪"} ${p.name}</h4><p>${p.desc}</p><button class="btn ${g.policy===p.id?"green":"dark"} wide" onclick="setPolicy('${p.id}')">${g.policy===p.id?"ACTIVE":"SELECT"}</button></div>`).join("");byId("researchTree").innerHTML=RESEARCH.map(r=>{const lv=g.research[r.id]||0,done=lv>=r.max;return `<div class="research-card ${done?"done":""}"><div class="row"><h4>🧪 ${r.name}</h4><b>LV ${lv}/${r.max}</b></div><p>${r.desc}</p><button class="btn ${done?"green":"purple"} wide" onclick="buyResearch('${r.id}')" ${done?"disabled":""}>${done?"MAXED":"RESEARCH "+money(researchCost(r))}</button></div>`;}).join("");byId("megaProjectList").innerHTML=MEGAPROJECTS.map(m=>`<div class="mega-card ${g.megaProjects[m.id]?"done":""}"><div class="row"><h4>${m.icon} ${m.name}</h4><b>${g.megaProjects[m.id]?"COMPLETE":"PROJECT"}</b></div><p>${m.desc}</p><button class="btn ${g.megaProjects[m.id]?"green":"purple"} wide" onclick="buyMegaProject('${m.id}')" ${g.megaProjects[m.id]?"disabled":""}>${g.megaProjects[m.id]?"COMPLETE":money(m.cost)}</button></div>`).join("");byId("gridCreditBalance").textContent=g.gridCredits+" GRID CREDITS";byId("prestigeTree").innerHTML=PRESTIGE_TREE.map(p=>{const lv=g.prestigeTree[p.id]||0,done=lv>=p.max,cost=p.cost+Math.floor(lv/2);return `<div class="prestige-card ${done?"done":""} ${g.gridCredits<cost&&!done?"locked":""}"><div class="row"><h4>💠 ${p.name}</h4><b>RANK ${lv}/${p.max}</b></div><p>${p.desc}</p><button class="btn ${done?"green":"gold"} wide" onclick="buyPrestigeUpgrade('${p.id}')" ${done?"disabled":""}>${done?"MAXED":cost+" GRID CREDITS"}</button></div>`;}).join("");}

function renderGoals(){byId("missionList").innerHTML=MISSIONS.map(m=>{const v=missionValue(m),pct=clamp(v/m.target*100,0,100),done=!!g.missions[m.id];return `<div class="mission-card"><div class="row"><h4>${done?"✅":"🎯"} ${m.label}</h4><b>${done?"CLAIMED":money(m.reward)}</b></div><p>${num(Math.min(v,m.target))} / ${num(m.target)}</p><div class="progress"><i style="width:${pct}%"></i></div>${!done&&v>=m.target?`<button class="btn green wide" style="margin-top:9px" onclick="claimMission('${m.id}')">CLAIM REWARD</button>`:""}</div>`;}).join("");byId("achievementList").innerHTML=ACHIEVEMENTS.map(a=>`<div class="achievement-card"><h4>${g.achievements[a.id]?"🏆":"🔒"} ${a.label}</h4><p>${a.desc}</p><small>${g.achievements[a.id]?"UNLOCKED":"IN PROGRESS"}</small></div>`).join("");const target=Math.max(250000,output()*2500),prog=weeklyProgress(),pct=clamp(prog/target*100,0,100);byId("weeklyChallenge").innerHTML=`<div class="mission-card"><div class="row"><h4>Generate ${num(target)} kWh this week</h4><b>${g.weekly.claimed?"CLAIMED":money(Math.max(50000,output()*100))}</b></div><p>${num(Math.min(prog,target))} / ${num(target)} kWh</p><div class="progress"><i style="width:${pct}%"></i></div><button class="btn gold wide" style="margin-top:10px" onclick="claimWeekly()" ${g.weekly.claimed?"disabled":""}>${g.weekly.claimed?"REWARD CLAIMED":"CLAIM WEEKLY REWARD"}</button></div>`;}

function renderStats(){g.stats.bestOutput=Math.max(g.stats.bestOutput,output());const rows=[
  ["⚡ Current Output",num(output())+"/s","Live generation"],["🏭 Fleet Plants",unlockedPlantCount()+" / "+PLANTS.length,"Commissioned technologies"],["🌐 Grid Regions",connectedRegions()+" / "+REGIONS.length,"Transmission nodes"],["💰 Lifetime Cash",money(g.lifetimeCash),"Total company earnings"],["🔌 Lifetime Energy",num(g.generated)+" kWh","All generated energy"],["📜 Contracts",g.contractsCompleted,"Completed agreements"],["💠 Grid Credits",g.gridCredits,"Prestige currency"],["🏆 Best Output",num(g.stats.bestOutput)+"/s","Record generation"],["💵 Best Sale",money(g.stats.bestSale),"Largest single sale"],["⛽ Fuel Spend",money(g.stats.totalFuelCost),"Lifetime operating fuel"],["🛠 Maintenance",money(g.stats.totalMaintenance),"Service and event spend"],["🏗 Build Spend",money(g.stats.totalBuildSpend),"Capital construction"],["⭐ Pass Tier",powerPassTier()+" / "+POWER_PASS_REWARDS.length,"Power Pass progress"],["🏢 Company Level",g.companyLevel,"Executive progression"],["♻ Prestige",g.prestige,"Legacy resets"],["🌐 Megaprojects",megaCount()+" / "+MEGAPROJECTS.length,"Permanent empire systems"]
];byId("statsGrid").innerHTML=rows.map(r=>`<div class="metric-card"><small>${r[0]}</small><b>${r[1]}</b><i>${r[2]}</i></div>`).join("");byId("fleetStats").innerHTML=PLANTS.map(p=>{const s=plantState(p.id);return `<div class="stats-row"><div><strong>${p.icon} ${p.name}</strong><small>${s.unlocked?`Level ${s.level} • ${Math.round(s.condition)}% condition • Specialization ${g.plantSpecialization[p.id]||0}/4`:"Not commissioned"}</small></div><b>${s.unlocked?num(plantBaseOutput(p)*totalMult())+"/s":"LOCKED"}</b></div>`;}).join("");byId("activityLog").innerHTML=g.log.map(x=>"<div>"+x+"</div>").join("");}

function renderDaily(){const rewards=[800,1200,1800,2800,4200,6500,10000];const today=dayKey(),claimed=g.daily.lastClaimDay===today;byId("dailyRewardMeta").textContent=claimed?"Claimed today. Return tomorrow to continue your streak.":`Current streak ${g.daily.streak} • Best ${g.daily.best}`;byId("dailyStreakGrid").innerHTML=rewards.map((r,i)=>{const day=i+1,state=day<=g.daily.streak&&claimed?"claimed":day===Math.min(7,g.daily.streak+1)?"next":"";return `<div class="daily-day ${state}"><span>DAY ${day}</span><b>${money(r)}</b></div>`;}).join("");const b=byId("dailyClaimBtn");b.disabled=claimed;b.textContent=claimed?"CLAIMED TODAY":"CLAIM DAY "+Math.min(7,g.daily.streak+1);b.className="btn "+(claimed?"dark":"green")+" wide";}
function renderPass(){const tier=powerPassTier(),next=POWER_PASS_REWARDS.find(r=>r.tier===Math.min(POWER_PASS_REWARDS.length,tier+1));byId("powerPassPanel").innerHTML=`<div class="pass-shell"><div class="pass-summary"><div><small>PASS XP</small><b>${num(g.powerPass.xp)}</b></div><div><small>CURRENT TIER</small><b>${tier} / ${POWER_PASS_REWARDS.length}</b></div><div><small>PREMIUM</small><b>${g.powerPass.premium?"OWNED":"LOCKED"}</b></div><div><small>NEXT TIER</small><b>${next?num(next.xp)+" XP":"COMPLETE"}</b></div></div><div class="pass-track">${POWER_PASS_REWARDS.map(r=>{const unlocked=g.powerPass.xp>=r.xp;return `<div class="pass-tier ${unlocked?"unlocked":""}"><div class="pass-tier-top"><strong>TIER ${r.tier}</strong><span>${num(r.xp)} XP</span></div><div class="pass-lanes"><button class="pass-reward ${g.powerPass.freeClaimed[r.tier]?"claimed":""}" onclick="claimPowerPass(${r.tier},'free')" ${!unlocked?"disabled":""}>FREE • ${g.powerPass.freeClaimed[r.tier]?"CLAIMED":r.free.label+" "+money(r.free.cash||0)}</button><button class="pass-reward premium ${g.powerPass.premiumClaimed[r.tier]?"claimed":""}" onclick="claimPowerPass(${r.tier},'premium')" ${!unlocked||!g.powerPass.premium?"disabled":""}>PREMIUM • ${g.powerPass.premiumClaimed[r.tier]?"CLAIMED":r.premium.label+(r.premium.cash?" "+money(r.premium.cash):"")}</button></div></div>`;}).join("")}</div></div>`;const pb=byId("premiumPassBuyBtn");if(pb){pb.textContent=g.powerPass.premium?"OWNED":"TEST BUY";pb.disabled=g.powerPass.premium;}}
function renderStore(){renderDaily();renderAutoGenerate();renderPass();applySettings();}

function render(){migrate();updateEvent();updateContract();shiftWeather();updateAchievements();renderTop();renderEmpireStrip();renderHero();renderEvent();renderHomeCards();renderPlants();renderRegions();renderContracts();renderMarket();renderCompany();renderGoals();renderStats();renderStore();}

function handleOffline(){const seconds=Math.min(8*3600,Math.max(0,(now()-g.lastSeen)/1000));if(seconds<30||output()<=0){g.lastSeen=now();return;}let eff=.65+(g.research.automation||0)*.025+(g.staff.operator||0)*.008+(g.prestigeTree.offline||0)*.04+(g.autoGenerateUnlocked ? .03 : 0);eff=clamp(eff,.65,.95);const prod=output()*seconds*eff,autogen=g.autoGenerateUnlocked?autoGenerateAmount()*Math.min(seconds,3600)*.15:0,cost=fuelCostPerSecond()*seconds*eff;g.stored+=prod+autogen;g.generated+=prod+autogen;g.cash=Math.max(0,g.cash-cost);byId("offlineAmount").textContent=num(prod+autogen)+" kWh";byId("offlineText").textContent=`Operated for ${Math.floor(seconds/60)} minutes at ${Math.round(eff*100)}% offline efficiency. Fuel cost: ${money(cost)}.`;byId("offlineModal").classList.add("show");addLog("Offline production added "+num(prod+autogen)+" kWh.");}
function closeOffline(){byId("offlineModal").classList.remove("show");saveGame();render();}

function gameTick(){const p=output();g.stored+=p;g.generated+=p;runAutoGenerate();payOperatingCosts();degradePlant();autoSellTick();createEvent();updateContract();g.stats.bestOutput=Math.max(g.stats.bestOutput,p);saveGame();render();}
function marketTick(){shiftMarket();shiftWeather();saveGame();render();}

window.addEventListener("load",()=>{const splash=byId("bootSplash");setTimeout(()=>{splash?.classList.add("hide");setTimeout(()=>splash?.remove(),700);},900);handleOffline();render();});
document.addEventListener("visibilitychange",()=>{if(document.hidden)saveGame();});
setInterval(gameTick,1000);
setInterval(marketTick,15000);
console.log("Power Plant Tycoon GRID DOMINION V8 loaded");
