
const PLANTS=[
{id:"diesel",icon:"⛽",name:"Diesel Generator",unlock:60,base:1.5,fuel:.08,reliability:98},
{id:"steam",icon:"🌀",name:"Steam Turbine",unlock:400,base:6,fuel:.18,reliability:95},
{id:"gas",icon:"🔥",name:"Gas Turbine",unlock:2500,base:22,fuel:.55,reliability:96},
{id:"solar",icon:"☀️",name:"Solar Farm",unlock:12000,base:80,fuel:0,reliability:99},
{id:"nuclear",icon:"☢️",name:"Nuclear Plant",unlock:75000,base:320,fuel:2.1,reliability:93}
];
const REGIONS=[
{id:"riverbend",name:"Riverbend",cost:0,bonus:0,emoji:"🏭",desc:"Starter industrial grid."},
{id:"coast",name:"Coastal Grid",cost:15000,bonus:.10,emoji:"🌊",desc:"+10% production • coastal utility market."},
{id:"desert",name:"Sunbelt",cost:75000,bonus:.20,emoji:"🏜️",desc:"+20% production • high solar demand."},
{id:"metro",name:"Metroplex",cost:300000,bonus:.35,emoji:"🌆",desc:"+35% production • dense city load."},
{id:"mountain",name:"Mountain Relay",cost:900000,bonus:.45,emoji:"🏔️",desc:"+45% production • high-voltage mountain corridor."},
{id:"plains",name:"Great Plains Grid",cost:2500000,bonus:.60,emoji:"🌾",desc:"+60% production • continental transmission hub."},
{id:"atlantic",name:"Atlantic Energy Hub",cost:7000000,bonus:.80,emoji:"⚓",desc:"+80% production • industrial port and offshore load."},
{id:"national",name:"National Supergrid",cost:20000000,bonus:1.10,emoji:"🇺🇸",desc:"+110% production • nationwide balancing authority."}
];
const CONTRACTS=[{id:"c1",name:"Town Utility Contract",required:2,duration:60,rate:1.15,reward:450},{id:"c2",name:"Industrial Park Supply",required:12,duration:90,rate:1.3,reward:1800},{id:"c3",name:"Regional Grid Support",required:50,duration:120,rate:1.45,reward:7500},{id:"c4",name:"Metro Baseload Agreement",required:180,duration:180,rate:1.65,reward:30000}];
const CORPORATE=[{id:"eff",name:"High-Efficiency Operations",desc:"+5% production efficiency per level",base:2500},{id:"maint",name:"Predictive Maintenance",desc:"Slower equipment condition loss",base:4000},{id:"fuel",name:"Fuel Procurement",desc:"Reduces fuel expense by 5% per level",base:6000},{id:"grid",name:"Grid Optimization",desc:"+4% sale value per level",base:8000}];
const MISSIONS=[{id:"m1",label:"Generate 100 kWh",type:"generated",target:100,reward:150},{id:"m2",label:"Earn $1,000 lifetime cash",type:"lifetimeCash",target:1000,reward:500},{id:"m3",label:"Own 5 plant levels",type:"levels",target:5,reward:1200},{id:"m4",label:"Reach 50 kWh/s",type:"output",target:50,reward:3500},{id:"m5",label:"Complete 3 contracts",type:"contracts",target:3,reward:7500}];
const ACH=[{id:"a1",label:"First Spark",desc:"Generate your first 10 kWh",type:"generated",target:10},{id:"a2",label:"Plant Operator",desc:"Unlock the Steam Turbine",type:"steam",target:1},{id:"a3",label:"Grid Builder",desc:"Unlock a second region",type:"regions",target:2},{id:"a4",label:"Power Mogul",desc:"Earn $50,000 lifetime cash",type:"lifetimeCash",target:50000},{id:"a5",label:"Nuclear Age",desc:"Unlock the Nuclear Plant",type:"nuclear",target:1},{id:"a6",label:"Master Operator",desc:"Reach operator level 10",type:"operator",target:10}];
const defaultGame=()=>({cash:0,stored:0,generated:0,sold:0,lifetimeCash:0,tapLevel:0,prestige:0,boostUntil:0,lastSeen:Date.now(),lastDaily:0,starter:false,autoGenerateUnlocked:false,autoGenerate:false,maintenance:100,engineers:0,operatorXP:0,operatorLevel:1,regions:{riverbend:true},plants:Object.fromEntries(PLANTS.map(p=>[p.id,{unlocked:false,level:0,condition:100}])),corporate:{eff:0,maint:0,fuel:0,grid:0},contractsCompleted:0,activeContract:null,missions:{},achievements:{},event:null,eventCooldown:0,settings:{sound:true,haptics:true,reducedMotion:false,compact:true},
tutorialStep:0,finalShown:false,endgame:{},
market:{price:1,demand:1,trend:0,lastShift:Date.now()},
battery:{level:0,stored:0},
autoSell:false,reputation:0,reliability:100,
staff:{engineer:0,trader:0,safety:0,operator:0},
policy:"balanced",
research:{automation:0,storage:0,forecast:0,materials:0,controls:0,gridAI:0},
weekly:{weekKey:"",progress:0,claimed:false},
dispatches:0,finalTutorial:{step:0,done:false,disabled:false},
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
if(!g.research)g.research={automation:0,storage:0,forecast:0,materials:0,controls:0,gridAI:0};["automation","storage","forecast","materials","controls","gridAI"].forEach(k=>{if(g.research[k]==null)g.research[k]=0});
if(!g.weekly)g.weekly={weekKey:"",progress:0,claimed:false};
if(g.dispatches==null)g.dispatches=0;
if(g.viewStage==null)g.viewStage=null;
if(!g.viewStage&&g.plants?.diesel?.unlocked&&!g.plants?.steam?.unlocked)g.viewStage="diesel";
if(g.settings.musicVolume==null)g.settings.musicVolume=16;
if(g.settings.sfxVolume==null)g.settings.sfxVolume=22;if(!g.finalTutorial)g.finalTutorial={step:0,done:false,disabled:false};if(g.finalTutorial.autoStart==null)g.finalTutorial.autoStart=true;

["generated","sold","lifetimeCash","tapLevel","prestige","boostUntil","lastSeen","lastDaily","eventCooldown"].forEach(k=>{if(g[k]==null)g[k]=0})}migrate();if((g.generated||0)>25&&g.tutorialStep===0)g.tutorialStep=5;
const money=n=>{if(!isFinite(n))n=0;if(!g||!g.settings||!g.settings.compact)return"$"+n.toLocaleString(undefined,{maximumFractionDigits:1});if(n>=1e12)return"$"+(n/1e12).toFixed(2)+"T";if(n>=1e9)return"$"+(n/1e9).toFixed(2)+"B";if(n>=1e6)return"$"+(n/1e6).toFixed(2)+"M";if(n>=1e3)return"$"+(n/1e3).toFixed(2)+"K";return"$"+n.toFixed(1)};
const num=n=>{if(!isFinite(n))n=0;if(!g||!g.settings||!g.settings.compact)return n.toLocaleString(undefined,{maximumFractionDigits:1});if(n>=1e12)return(n/1e12).toFixed(2)+"T";if(n>=1e9)return(n/1e9).toFixed(2)+"B";if(n>=1e6)return(n/1e6).toFixed(2)+"M";if(n>=1e3)return(n/1e3).toFixed(2)+"K";return n.toFixed(1)};
function prestigeMult(){return 1+g.prestige*.1}function operatorMult(){return 1+(g.operatorLevel-1)*.01}function efficiencyMult(){return 1+g.corporate.eff*.05}function regionMult(){let m=1;REGIONS.forEach(r=>{if(r.id!=="riverbend"&&g.regions[r.id])m+=(r.bonus||0)});return m}function boostMult(){return Date.now()<g.boostUntil?2:1}function eventMult(){if(!g.event)return 1;if(g.event.type==="breakdown")return .5;if(g.event.type==="surge")return 1.5;return 1}function maintenanceMult(){return .65+.35*(g.maintenance/100)}function totalMult(){return prestigeMult()*operatorMult()*efficiencyMult()*regionMult()*boostMult()*eventMult()*maintenanceMult()*policyProductionMult()*staffProductionMult()*researchProductionMult()}function tapPower(){return(1+g.tapLevel*2.5)*prestigeMult()*operatorMult()*boostMult()}function tapUpgradeCost(){return 25*Math.pow(1.65,g.tapLevel)}
function rawOutput(){let n=0;PLANTS.forEach(p=>{const s=g.plants[p.id];if(s&&s.unlocked)n+=p.base*s.level*(.6+.4*s.condition/100)});return n}function output(){return rawOutput()*totalMult()}function fuelCostPerSecond(){let n=0;PLANTS.forEach(p=>{const s=g.plants[p.id];if(s&&s.unlocked)n+=p.fuel*s.level});return n*Math.max(.55,1-g.corporate.fuel*.05)}function gridSaleMult(){return 1+g.corporate.grid*.04}function netValuePerSecond(){return Math.max(0,output()*gridSaleMult()-fuelCostPerSecond())}function plantCost(p){const s=g.plants[p.id];if(!s.unlocked)return p.unlock;return p.unlock*.7*Math.pow(1.58,Math.max(1,s.level)-1)}function totalLevels(){return PLANTS.reduce((a,p)=>a+(g.plants[p.id].unlocked?g.plants[p.id].level:0),0)}function maintenanceCost(){return Math.max(250,rawOutput()*20+(100-g.maintenance)*18)}function engineerCost(){return 2500*Math.pow(1.75,g.engineers)}function corporateCost(up){return up.base*Math.pow(1.9,g.corporate[up.id]||0)}
function saveGame(){g.lastSeen=Date.now();localStorage.setItem("PPT_V5",JSON.stringify(g))}function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>e.classList.remove("show"),1800)}function addLog(t){const x=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});g.log.unshift(x+" • "+t);g.log=g.log.slice(0,25)}function addXP(a){g.operatorXP+=a;while(g.operatorXP>=g.operatorLevel*100){g.operatorXP-=g.operatorLevel*100;g.operatorLevel++;addLog("Operator Level increased to "+g.operatorLevel+".");toast("⭐ Operator Level "+g.operatorLevel)}}


const STAFF_TYPES=[
{id:"engineer",name:"Plant Engineer",icon:"🛠️",desc:"Slows equipment degradation and improves maintenance.",base:5000},
{id:"trader",name:"Energy Trader",icon:"📈",desc:"Improves power sale value and market forecasting.",base:7000},
{id:"safety",name:"Safety Specialist",icon:"🦺",desc:"Improves reliability and reduces breakdown severity.",base:8500},
{id:"operator",name:"Senior Operator",icon:"🎛️",desc:"Boosts production and operator XP gain.",base:10000}
];
const RESEARCH=[
{id:"automation",name:"Advanced Automation",desc:"+4% production per level",base:12000,max:5},
{id:"storage",name:"Grid Storage Systems",desc:"+50% battery capacity per level",base:15000,max:5},
{id:"forecast",name:"Market Forecasting",desc:"+3% sale value per level",base:18000,max:5},
{id:"materials",name:"Advanced Materials",desc:"Slower plant condition loss",base:22000,max:5},
{id:"controls",name:"Digital Plant Controls",desc:"+2% reliability per level",base:30000,max:5},
{id:"gridAI",name:"Grid AI Dispatch",desc:"Improves auto-sell and dispatch bonuses",base:45000,max:5}
];
const POLICIES=[
{id:"balanced",name:"Balanced Operation",desc:"Stable production and maintenance."},
{id:"maximum",name:"Maximum Output",desc:"+15% output, faster wear."},
{id:"reliability",name:"Reliability First",desc:"-8% output, slower wear and fewer trips."},
{id:"market",name:"Market Responsive",desc:"Better sale prices during high demand."}
];

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
function researchProductionMult(){return 1+(g.research.automation||0)*.04}
function batteryCapacity(){return g.battery.level<=0?0:500*Math.pow(2,g.battery.level-1)*(1+g.research.storage*.5)}
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
  g.stored-=amount;g.cash+=cash;g.lifetimeCash+=cash;g.sold+=amount;g.dispatches++;
  g.reputation+=2;addXP(3);addLog("Grid dispatch sold "+num(amount)+" kWh for "+money(cash)+".");feedback("big");saveGame();render();
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
  g.battery.stored=0;g.cash+=cash;g.lifetimeCash+=cash;g.sold+=amount;g.reputation+=1;
  addLog("Battery discharged "+num(amount)+" kWh for "+money(cash)+".");saveGame();render();
}
function upgradeBattery(){
  const c=batteryUpgradeCost();
  if(g.cash<c){toast("Battery upgrade requires "+money(c));return}
  g.cash-=c;g.battery.level++;g.reputation+=2;addXP(12);addLog("Grid battery upgraded to Level "+g.battery.level+".");saveGame();render();
}
function hireStaff(id){
  const c=staffCost(id);
  if(g.cash<c){toast("Need "+money(c));return}
  g.cash-=c;g.staff[id]++;g.reputation+=3;addXP(12);addLog(STAFF_TYPES.find(x=>x.id===id).name+" hired.");saveGame();render();
}
function setPolicy(id){g.policy=id;addLog("Dispatch policy changed to "+POLICIES.find(x=>x.id===id).name+".");saveGame();render()}
function buyResearch(id){
  const r=RESEARCH.find(x=>x.id===id),lv=g.research[id]||0;
  if(lv>=r.max){toast("Research maxed.");return}
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
  const reward=50000;g.cash+=reward;g.lifetimeCash+=reward;g.reputation+=20;g.weekly.claimed=true;addXP(50);saveGame();render();
}
function autoSellTick(){
  if(!g.autoSell||g.stored<=0)return;
  if(g.market.price<1.05&&g.policy!=="market")return;
  const amount=Math.min(g.stored,Math.max(1,output()*3));
  const cash=amount*gridSaleMult()*marketSaleMult()*(1+g.research.gridAI*.02);
  g.stored-=amount;g.cash+=cash;g.lifetimeCash+=cash;g.sold+=amount;
}



const GUIDED_TUTORIAL=[
  {page:"home",sel:".generate",title:"Generate Power",text:"Tap GENERATE POWER. This creates electricity and stores it at Riverbend."},
  {page:"home",sel:"#sellBtn",title:"Sell to the Grid",text:"Sell stored electricity for cash. Cash funds upgrades, staff, research and new plants."},
  {page:"plants",sel:"#plantList",title:"Build Your Fleet",text:"Use PLANTS to commission and upgrade Diesel, Steam, Gas, Solar and Nuclear generation."},
  {page:"map",sel:"#regionList",title:"Expand the Grid",text:"Use MAP to connect new regions. Each region adds permanent production bonuses."},
  {page:"home",sel:"#contractList",title:"Complete Contracts",text:"Contracts reward cash and experience for supplying the grid."},
  {page:"company",sel:"#researchTree",title:"Run the Company",text:"HQ lets you hire staff, choose operating policies and unlock research upgrades."},
  {page:"stats",sel:"#weeklyChallenge",title:"Build an Energy Empire",text:"Track your fleet, complete weekly goals and prestige when you are ready for permanent bonuses."}
];
let tutSpotEl=null;
function clearTutSpot(){if(tutSpotEl){tutSpotEl.classList.remove("tut-spot");tutSpotEl=null}}
function openTutorialPage(page){
  const nav=document.querySelector(`[data-nav="${page}"]`);
  if(nav)showPage(page,nav);
}
function renderGuidedTutorial(){
  const panel=document.getElementById("tutorialPanel2"),mask=document.getElementById("tutorialMask2");
  if(!panel||!mask)return;
  if(g.finalTutorial.disabled||g.finalTutorial.done){panel.classList.remove("show");mask.classList.remove("show");clearTutSpot();return}
  const i=Math.max(0,Math.min(GUIDED_TUTORIAL.length-1,g.finalTutorial.step||0)),s=GUIDED_TUTORIAL[i];
  openTutorialPage(s.page);
  panel.classList.add("show");mask.classList.add("show");
  document.getElementById("tutorialCount2").textContent=`TUTORIAL ${i+1}/${GUIDED_TUTORIAL.length}`;
  document.getElementById("tutorialTitle2").textContent=s.title;
  document.getElementById("tutorialText2").textContent=s.text;
  document.getElementById("tutorialProgress2").style.width=((i+1)/GUIDED_TUTORIAL.length*100)+"%";
  document.getElementById("tutorialNext2").textContent=i===GUIDED_TUTORIAL.length-1?"FINISH":"NEXT ➜";
  clearTutSpot();
  setTimeout(()=>{
    const el=document.querySelector(s.sel);
    if(el){tutSpotEl=el;el.classList.add("tut-spot");el.scrollIntoView({behavior:g.settings.reducedMotion?"auto":"smooth",block:"center"})}
  },40);
}
function nextGuidedTutorial(){
  if((g.finalTutorial.step||0)>=GUIDED_TUTORIAL.length-1){g.finalTutorial.done=true;saveGame();renderGuidedTutorial();toast("Tutorial complete!");return}
  g.finalTutorial.step=(g.finalTutorial.step||0)+1;saveGame();renderGuidedTutorial();
}
function prevGuidedTutorial(){g.finalTutorial.step=Math.max(0,(g.finalTutorial.step||0)-1);saveGame();renderGuidedTutorial()}
function skipGuidedTutorial(){g.finalTutorial.disabled=true;saveGame();renderGuidedTutorial();toast("Tutorial skipped")}
function restartGuidedTutorial(){g.finalTutorial={step:0,done:false,disabled:false,autoStart:true};saveGame();renderGuidedTutorial()}

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

function renderCinematicHUD(){
  const eff=document.getElementById("cpEff"),rel=document.getElementById("cpRel"),out=document.getElementById("cpOut"),dem=document.getElementById("cpDemand");
  if(eff)eff.textContent=Math.round(totalMult()*100)+"%";
  if(rel)rel.textContent=Math.round(g.reliability||100)+"%";
  if(out)out.textContent=num(output())+"/s";
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
  if(bs)bs.textContent=num(g.battery.stored)+" kWh";if(bm)bm.style.width=(cap?Math.min(100,g.battery.stored/cap*100):0)+"%";if(bc)bc.textContent="Capacity "+num(cap)+" kWh";if(bl)bl.textContent="LV "+g.battery.level;
  const sc=document.getElementById("staffCount");if(sc)sc.textContent=Object.values(g.staff).reduce((a,b)=>a+b,0);
  const cr=document.getElementById("companyRating");if(cr)cr.textContent=companyRating();
  const ticker=document.getElementById("tickerText");if(ticker)ticker.textContent=`⚡ Spot ${"$"+price.toFixed(2)} • Demand ${Math.round(g.market.demand*100)}% • Reliability ${Math.round(g.reliability)}% • Reputation ${Math.floor(g.reputation)} • Company Rating ${companyRating()} • Battery ${num(g.battery.stored)}/${num(cap)} kWh`;
  const staffList=document.getElementById("staffList");
  if(staffList)staffList.innerHTML=STAFF_TYPES.map(t=>`<div class="uf-row"><div class="uf-staff-card"><div class="uf-avatar">${t.icon}</div><div><strong>${t.name} • LV ${g.staff[t.id]}</strong><small>${t.desc}</small></div></div><button class="uf-btn" onclick="hireStaff('${t.id}')">HIRE ${money(staffCost(t.id))}</button></div>`).join("");
  const policyList=document.getElementById("policyList");
  if(policyList)policyList.innerHTML=POLICIES.map(p=>`<div class="uf-panel ${g.policy===p.id?"uf-highlight":""}"><h4>${p.name}</h4><p>${p.desc}</p><button class="uf-btn ${g.policy===p.id?"green":"dark"}" onclick="setPolicy('${p.id}')">${g.policy===p.id?"ACTIVE":"SELECT"}</button></div>`).join("");
  const rt=document.getElementById("researchTree");
  if(rt)rt.innerHTML=RESEARCH.map((r,i)=>{const lv=g.research[r.id]||0,done=lv>=r.max;return`<div class="uf-node ${done?"done":""}"><strong>${r.name} • LV ${lv}/${r.max}</strong><p>${r.desc}</p><button class="uf-btn ${done?"green":"purple"}" ${done?"disabled":""} onclick="buyResearch('${r.id}')">${done?"MAXED":"RESEARCH "+money(researchCost(r.id))}</button></div>`}).join("");
  const se=document.getElementById("statsEnergy");if(se)se.textContent=num(g.generated)+" kWh";
  const scash=document.getElementById("statsCash");if(scash)scash.textContent=money(g.lifetimeCash);
  const scon=document.getElementById("statsContracts");if(scon)scon.textContent=g.contractsCompleted;
  const spr=document.getElementById("statsPrestige");if(spr)spr.textContent=g.prestige;
  const fs=document.getElementById("fleetStats");
  if(fs)fs.innerHTML=PLANTS.map(p=>{const s=g.plants[p.id];return`<div class="uf-row"><div><strong>${p.icon} ${p.name}</strong><small>${s.unlocked?"Level "+s.level+" • "+Math.round(s.condition)+"% condition":"Not commissioned"}</small></div><span class="uf-chip">${s.unlocked?num(p.base*s.level)+" kWh/s":"LOCKED"}</span></div>`}).join("");
  updateWeekly();
  const wc=document.getElementById("weeklyChallenge");
  if(wc){const target=250000,p=Math.min(100,g.weekly.progress/target*100);wc.innerHTML=`<div class="uf-panel"><h4>Generate 250K kWh this week</h4><p>${num(Math.min(g.weekly.progress,target))} / ${num(target)} kWh</p><div class="uf-meter"><i style="width:${p}%"></i></div><button class="uf-btn gold" style="margin-top:10px" onclick="claimWeekly()">${g.weekly.claimed?"CLAIMED":"CLAIM $50K"}</button></div>`}
}

const ENDGAME=[
{id:"e1",label:"Commission Nuclear Power",desc:"Unlock the Nuclear Plant.",value:()=>g.plants.nuclear.unlocked?1:0,target:1},
{id:"e2",label:"Connect Metroplex",desc:"Expand into the Metroplex region.",value:()=>g.regions.metro?1:0,target:1},
{id:"e3",label:"Reach 1,000 kWh/s",desc:"Build a utility-scale generation fleet.",value:()=>output(),target:1000},
{id:"e4",label:"Earn $1,000,000",desc:"Reach one million dollars lifetime cash.",value:()=>g.lifetimeCash,target:1000000},
{id:"e5",label:"Complete 10 Contracts",desc:"Become a trusted grid supplier.",value:()=>g.contractsCompleted,target:10}
];

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
  el.innerHTML=ENDGAME.map(x=>{const v=x.value(),done=v>=x.target;return`<div class="questline"><div class="row"><span>${done?"✅":"⬜"} ${x.label}</span><span>${num(Math.min(v,x.target))}/${num(x.target)}</span></div><div class="small">${x.desc}</div></div>`}).join("");
  const complete=ENDGAME.every(x=>x.value()>=x.target);
  if(complete&&!g.finalShown){g.finalShown=true;saveGame();document.getElementById("finalModal").classList.add("show")}
}

function tapGenerate(){playPremiumSfx("generate");feedback("tap");const a=tapPower();g.stored+=a;g.generated+=a;addXP(.2);render()}
// ===== AUTO GENERATE POWER =====
const AUTO_GENERATE_PRODUCT_ID="powerplanttycoon.autogenerate";

function grantAutoGeneratePurchase(){
  g.autoGenerateUnlocked=true;
  g.autoGenerate=false;
  addLog("Auto Generate permanently unlocked.");
  saveGame();
  render();
  toast("🤖 Auto Generate unlocked!");
}

function purchaseAutoGenerate(){
  if(g.autoGenerateUnlocked){toast("Auto Generate is already owned.");return}

  // iPhone/App Store build: the native StoreKit wrapper can register this message handler.
  const iosPurchase=window.webkit?.messageHandlers?.purchaseAutoGenerate;
  if(iosPurchase){
    iosPurchase.postMessage({productId:AUTO_GENERATE_PRODUCT_ID});
    toast("Opening purchase…");
    return;
  }

  // Browser/GitHub Pages testing only. No real money is charged here.
  toast("TEST PURCHASE • Auto Generate");
  grantAutoGeneratePurchase();
}

// Native iOS wrapper calls this after StoreKit confirms ownership/purchase.
window.completeAutoGeneratePurchase=function(success){
  if(success)grantAutoGeneratePurchase();
  else toast("Purchase not completed.");
};

function toggleAutoGenerate(){
  if(!g.autoGenerateUnlocked){
    toast("Auto Generate is locked. Purchase it in the Store.");
    const storeNav=document.querySelector('[data-nav="store"]');
    if(storeNav)showPage("store",storeNav);
    return;
  }

  g.autoGenerate=!g.autoGenerate;
  addLog("Auto Generate switched "+(g.autoGenerate?"ON":"OFF")+".");
  saveGame();
  render();
}

function runAutoGenerate(){
  if(!g.autoGenerateUnlocked||!g.autoGenerate)return;
  const amount=tapPower();
  g.stored+=amount;
  g.generated+=amount;
  addXP(.2);
}

setInterval(runAutoGenerate,1000);

function sellPower(){playPremiumSfx("cash");feedback("big");if(g.stored<=0){toast("Generate some power first.");return}let p=gridSaleMult()*marketSaleMult();if(g.event&&g.event.type==="surge")p*=1.75;if(g.activeContract)p*=g.activeContract.rate;const e=g.stored*p;g.cash+=e;g.lifetimeCash+=e;g.sold+=g.stored;addXP(Math.max(1,g.stored/200));addLog("Sold "+num(g.stored)+" kWh for "+money(e)+".");g.stored=0;saveGame();render();toast("Grid sale: "+money(e))}
function upgradeTap(){const c=tapUpgradeCost();if(g.cash<c){toast("Need "+money(c));return}g.cash-=c;g.tapLevel++;addXP(4);addLog("Manual generator upgraded to Level "+(g.tapLevel+1)+".");saveGame();render()}function buildPlant(id){playPremiumSfx("upgrade");feedback("big");const p=PLANTS.find(x=>x.id===id),s=g.plants[id],c=plantCost(p);if(g.cash<c){toast("Need "+money(c));return}g.cash-=c;if(!s.unlocked){s.unlocked=true;g.viewStage=id;s.level=1;s.condition=100;addXP(20);addLog(p.name+" commissioned at Riverbend.");toast(p.name+" ONLINE!")}else{s.level++;s.condition=Math.min(100,s.condition+8);addXP(10);addLog(p.name+" upgraded to Level "+s.level+".")}saveGame();render()}
function buyRegion(id){feedback("big");const r=REGIONS.find(x=>x.id===id);if(g.regions[id])return;if(g.cash<r.cost){toast("Need "+money(r.cost));return}g.cash-=r.cost;g.regions[id]=true;addXP(30);addLog(r.name+" connected to company grid.");saveGame();render()}
function performMaintenance(){const c=maintenanceCost();if(g.cash<c){toast("Maintenance requires "+money(c));return}g.cash-=c;g.maintenance=100;PLANTS.forEach(p=>{const s=g.plants[p.id];if(s.unlocked)s.condition=Math.min(100,s.condition+35+g.engineers*5)});addXP(10);addLog("Scheduled maintenance completed.");saveGame();render()}
function hireEngineer(){const c=engineerCost();if(g.cash<c){toast("Engineer costs "+money(c));return}g.cash-=c;g.engineers++;addXP(15);addLog("Maintenance engineer hired.");saveGame();render()}
function buyCorporate(id){const up=CORPORATE.find(x=>x.id===id),c=corporateCost(up);if(g.cash<c){toast("Need "+money(c));return}g.cash-=c;g.corporate[id]++;addXP(20);addLog(up.name+" upgraded to Level "+g.corporate[id]+".");saveGame();render()}
function startContract(id){if(g.activeContract){toast("Finish the current contract first.");return}const c=CONTRACTS.find(x=>x.id===id);if(output()<c.required){toast("Requires "+num(c.required)+" kWh/s output.");return}g.activeContract={id:c.id,name:c.name,rate:c.rate,reward:c.reward,end:Date.now()+c.duration*1000};addLog("Contract started: "+c.name+".");saveGame();render()}
function updateContract(){if(g.activeContract&&Date.now()>=g.activeContract.end){const c=g.activeContract;g.cash+=c.reward;g.lifetimeCash+=c.reward;g.contractsCompleted++;addXP(40);addLog("Contract completed: "+c.name+" +"+money(c.reward)+".");g.activeContract=null;toast("Contract complete! "+money(c.reward));saveGame()}}
function missionValue(m){if(m.type==="generated")return g.generated;if(m.type==="lifetimeCash")return g.lifetimeCash;if(m.type==="levels")return totalLevels();if(m.type==="output")return output();if(m.type==="contracts")return g.contractsCompleted;return 0}function claimMission(id){const m=MISSIONS.find(x=>x.id===id);if(g.missions[id]||missionValue(m)<m.target)return;g.missions[id]=true;g.cash+=m.reward;g.lifetimeCash+=m.reward;addXP(15);addLog("Mission completed: "+m.label);saveGame();render()}
function achievementValue(a){if(a.type==="generated")return g.generated;if(a.type==="steam")return g.plants.steam.unlocked?1:0;if(a.type==="regions")return Object.values(g.regions).filter(Boolean).length;if(a.type==="lifetimeCash")return g.lifetimeCash;if(a.type==="nuclear")return g.plants.nuclear.unlocked?1:0;if(a.type==="operator")return g.operatorLevel;return 0}function updateAchievements(){ACH.forEach(a=>{if(!g.achievements[a.id]&&achievementValue(a)>=a.target){g.achievements[a.id]=true;addLog("Achievement unlocked: "+a.label);toast("🏆 "+a.label)}})}
function dailyReward(){const now=Date.now(),day=86400000;if(now-g.lastDaily<day){toast("Daily reward in "+Math.ceil((day-(now-g.lastDaily))/3600000)+"h");return}const r=Math.max(250,Math.round(500+output()*150));g.cash+=r;g.lifetimeCash+=r;g.lastDaily=now;addXP(5);addLog("Daily supply drop received: "+money(r));saveGame();render()}
function activateBoost(){if(Date.now()<g.boostUntil){toast("2× boost is already active.");return}g.boostUntil=Date.now()+10*60*1000;addLog("Grid output boost activated.");saveGame();render()}function maintenancePack(){toast("TEST PURCHASE • Maintenance Pack");g.maintenance=100;PLANTS.forEach(p=>{if(g.plants[p.id].unlocked)g.plants[p.id].condition=100});saveGame();render()}function starterPack(){toast("TEST PURCHASE • Starter Pack");if(g.starter){toast("Starter Pack already claimed.");return}g.starter=true;g.cash+=5000;g.lifetimeCash+=5000;g.boostUntil=Math.max(g.boostUntil,Date.now()+10*60*1000);saveGame();render()}
function prestige(){if(g.lifetimeCash<50000){toast("Earn $50,000 lifetime cash first.");return}askConfirm("Prestige Company","Reset cash, plants and regions for +10% permanent production?",()=>{const p=g.prestige+1,a=g.achievements,settings=g.settings,autoGenerateUnlocked=g.autoGenerateUnlocked;g=defaultGame();g.prestige=p;g.achievements=a;g.settings=settings;g.autoGenerateUnlocked=autoGenerateUnlocked;g.autoGenerate=false;g.tutorialStep=5;g.log=["Company prestiged."];saveGame();render();feedback("big")})}function resetGame(){askConfirm("Erase Save?","This permanently resets your local Power Plant Tycoon progress.",()=>{localStorage.removeItem("PPT_V5");g=defaultGame();saveGame();render();toast("Save reset")})}
function createEvent(){if(g.event||Date.now()<g.eventCooldown||output()<=0||Math.random()>.03)return;const r=Math.random();if(r<.4)g.event={type:"breakdown",title:"⚠ Turbine Breakdown",text:"Automatic production reduced by 50%.",cost:Math.max(300,output()*35)};else if(r<.72)g.event={type:"surge",title:"📈 Demand Surge",text:"Grid demand is elevated. Power sells for 75% more.",expires:Date.now()+60000};else g.event={type:"inspection",title:"🦺 Safety Inspection",text:"Complete the inspection for a cash and XP bonus.",reward:Math.max(150,output()*20)};g.eventCooldown=Date.now()+90000;addLog(g.event.title);render()}
function resolveEvent(){if(!g.event)return;if(g.event.type==="breakdown"){if(g.cash<g.event.cost){toast("Repair requires "+money(g.event.cost));return}g.cash-=g.event.cost;g.maintenance=Math.max(60,g.maintenance-5);g.event=null;addXP(8)}else if(g.event.type==="inspection"){const r=g.event.reward;g.cash+=r;g.lifetimeCash+=r;g.event=null;addXP(15)}else g.event=null;saveGame();render()}
function updateEvent(){if(g.event&&g.event.type==="surge"&&Date.now()>g.event.expires)g.event=null}
function updateDayNight(){const n=Math.floor(Date.now()/45000)%2===1;document.body.classList.toggle("night",n);document.getElementById("weather").textContent=n?"🌙 NIGHT SHIFT":"☀ CLEAR"}
function setVisual(id,on,l=1){const e=document.getElementById(id);if(!e)return;e.classList.toggle("hidden",!on);e.style.filter=on&&l>=8?"brightness(1.18) drop-shadow(0 0 12px #ffd24d55)":on&&l>=3?"brightness(1.08) drop-shadow(0 0 7px #4de3ff44)":""}
function tag(id,on,text){const e=document.getElementById(id);e.classList.toggle("show",!!on);if(on)e.textContent=text}
function selectStageView(id){
  const p=g.plants[id];
  if(!p||!p.unlocked){toast("Commission this plant first.");return}
  g.viewStage=id;saveGame();render();toast("Viewing "+PLANTS.find(x=>x.id===id).name);
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
function showPage(id,b){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));document.querySelectorAll(".nav button").forEach(x=>x.classList.remove("active"));if(b)b.classList.add("active");window.scrollTo({top:0,behavior:"smooth"})}
function renderPlants(){
  document.getElementById("plantList").innerHTML=PLANTS.map(p=>{
    const s=g.plants[p.id],c=plantCost(p);
    const level=s.level||0,tier=level>=20?4:level>=10?3:level>=5?2:1;
    return `<div class="asset">
      <div class="plant-card-bg" style="background-image:url('images/thumbs/${p.id}.jpg')"></div>
      <div class="plant-card-shade"></div>
      <div class="plant-card-content">
        <div class="plant-card-top">
          <div class="plant-card-name">${p.icon} ${p.name}</div>
          <span class="plant-card-level">${s.unlocked?"LV "+level+" • TIER "+tier:"LOCKED"}</span>
        </div>
        <div class="plant-card-meta">${s.unlocked?Math.round(s.condition)+"% condition • "+num(p.base*level)+" kWh/s base":"Commission at "+money(p.unlock)}</div>
        <div class="plant-card-output">${s.unlocked?"Fleet output contribution "+num(p.base*level*totalMult())+"/s":"Unlock to add this technology to Riverbend"}</div>
        <div class="plant-card-actions">
          <button onclick="buildPlant('${p.id}')">${s.unlocked?"UPGRADE "+money(c):"BUILD "+money(c)}</button>
          ${s.unlocked?`<button class="view-btn" onclick="selectStageView('${p.id}');showPage('home',document.querySelector('[data-nav=home]'))">VIEW</button>`:""}
        </div>
      </div>
    </div>`
  }).join("")
}
function renderCorporate(){document.getElementById("corporateUpgradeList").innerHTML=CORPORATE.map(u=>`<div class="asset"><div class="asset-icon">⚙️</div><div><div class="asset-name">${u.name}</div><div class="asset-meta">${u.desc}</div></div><button onclick="buyCorporate('${u.id}')">LV ${g.corporate[u.id]}<br>${money(corporateCost(u))}</button></div>`).join("")}
function renderRegions(){
  document.getElementById("regionList").innerHTML=REGIONS.map(r=>`<div class="region ${g.regions[r.id]?"":"locked"}">
    <div class="region-icon">${r.emoji}</div>
    <h4>${r.name}</h4>
    <p>${r.desc}</p>
    ${g.regions[r.id]?'<span class="badge">CONNECTED</span>':`<button class="btn blue" onclick="buyRegion('${r.id}')">UNLOCK ${money(r.cost)}</button>`}
  </div>`).join("")
}
function renderContracts(){const el=document.getElementById("contractList");if(g.activeContract){const rem=Math.max(0,Math.ceil((g.activeContract.end-Date.now())/1000));el.innerHTML=`<div class="contract"><div class="contract-head"><span>📜 ${g.activeContract.name}</span><span>${rem}s</span></div><p class="small">Power sale multiplier ${g.activeContract.rate.toFixed(2)}×</p></div>`;return}el.innerHTML=CONTRACTS.map(c=>`<div class="contract"><div class="contract-head"><span>${c.name}</span><span>${money(c.reward)}</span></div><p class="small">Requires ${num(c.required)} kWh/s • ${c.duration}s • ${c.rate.toFixed(2)}× sales</p><button class="btn ${output()>=c.required?"green":"dark"}" style="width:100%" onclick="startContract('${c.id}')">${output()>=c.required?"ACCEPT CONTRACT":"OUTPUT TOO LOW"}</button></div>`).join("")}
function renderMissions(){document.getElementById("missionList").innerHTML=MISSIONS.map(m=>{const v=missionValue(m),pct=Math.min(100,v/m.target*100),done=!!g.missions[m.id];return`<div class="mission"><div class="mission-head"><span>${m.label}</span><span>${done?"✓ CLAIMED":money(m.reward)}</span></div><div class="small" style="margin:7px 0">${num(Math.min(v,m.target))} / ${num(m.target)}</div><div class="progress"><i style="width:${pct}%"></i></div>${!done&&v>=m.target?`<button class="btn green" style="width:100%;margin-top:9px" onclick="claimMission('${m.id}')">CLAIM REWARD</button>`:""}</div>`}).join("")}
function renderAchievements(){document.getElementById("achievementList").innerHTML=ACH.map(a=>`<div class="achievement"><div class="ach-head"><span>${g.achievements[a.id]?"🏆":"🔒"} ${a.label}</span><span>${g.achievements[a.id]?"UNLOCKED":""}</span></div><small>${a.desc}</small></div>`).join("")}
function renderEvent(){const b=document.getElementById("eventBox");if(!g.event){b.classList.remove("show");return}b.classList.add("show");document.getElementById("eventTitle").textContent=g.event.title;let t=g.event.text,bt="RESOLVE";if(g.event.type==="breakdown"){t+=" Repair cost: "+money(g.event.cost);bt="REPAIR"}if(g.event.type==="surge"){t+=" "+Math.max(0,Math.ceil((g.event.expires-Date.now())/1000))+"s remaining.";bt="END EVENT"}if(g.event.type==="inspection"){t+=" Reward: "+money(g.event.reward);bt="COMPLETE INSPECTION"}document.getElementById("eventText").textContent=t;document.getElementById("eventButton").textContent=bt}
function degradePlant(){if(output()<=0)return;let d=.015*(1-Math.min(.6,g.corporate.maint*.08))*(1-Math.min(.5,g.engineers*.08));
if(g.policy==="maximum")d*=1.35;if(g.policy==="reliability")d*=.55;
d*=1-Math.min(.45,g.research.materials*.07);g.maintenance=Math.max(0,g.maintenance-d);
g.reliability=Math.max(40,Math.min(100,98-(100-g.maintenance)*.28+g.staff.safety*1.5+g.research.controls*2));PLANTS.forEach(p=>{const s=g.plants[p.id];if(s.unlocked)s.condition=Math.max(35,s.condition-d*.7)})}
function payOperatingCosts(){const c=fuelCostPerSecond();if(g.cash>=c)g.cash-=c;else{g.cash=0;g.maintenance=Math.max(0,g.maintenance-.03)}}
function renderAutoGenerateUI(){
  const homeBtn=document.getElementById("autoGenerateBtn");
  if(homeBtn){
    homeBtn.classList.remove("locked","on");
    if(!g.autoGenerateUnlocked){
      homeBtn.textContent="🔒 AUTO GENERATE";
      homeBtn.classList.add("locked");
    }else if(g.autoGenerate){
      homeBtn.textContent="🤖 AUTO GENERATE: ON";
      homeBtn.classList.add("on");
    }else{
      homeBtn.textContent="🤖 AUTO GENERATE: OFF";
    }
  }

  const storeBtn=document.getElementById("autoGenerateStoreBtn");
  if(storeBtn){
    storeBtn.textContent=g.autoGenerateUnlocked?"OWNED":"TEST BUY";
    storeBtn.disabled=!!g.autoGenerateUnlocked;
    storeBtn.className="btn "+(g.autoGenerateUnlocked?"green":"purple");
  }
}

function render(){updateEvent();updateContract();updateAchievements();updateDayNight();document.getElementById("cash").textContent=money(g.cash);document.getElementById("power").textContent=num(g.stored)+" kWh";document.getElementById("output").textContent=num(output())+"/s";document.getElementById("tapInfo").textContent=num(tapPower())+" kWh/tap";document.getElementById("tapCost").textContent="Next manual generator upgrade: "+money(tapUpgradeCost());document.getElementById("operatorLevel").textContent=g.operatorLevel;document.getElementById("operatorXP").textContent=Math.floor(g.operatorXP)+" / "+(g.operatorLevel*100);document.getElementById("efficiencyValue").textContent=Math.round(totalMult()*100)+"%";document.getElementById("maintenanceValue").textContent=Math.round(g.maintenance)+"%";document.getElementById("fuelCostValue").textContent=money(fuelCostPerSecond())+"/s";document.getElementById("netValue").textContent=money(netValuePerSecond())+"/s";document.getElementById("maintenanceStatus").textContent=g.maintenance>80?"Healthy":g.maintenance>50?"Service Soon":"Maintenance Required";document.getElementById("engineerInfo").textContent="Engineers: "+g.engineers+" • Next hire: "+money(engineerCost())+" • Service cost: "+money(maintenanceCost());document.getElementById("gridStatus").textContent=g.event&&g.event.type==="breakdown"?"● UNIT TRIPPED":"● GRID ONLINE";let rank="GRID ROOKIE";if(g.lifetimeCash>=10000)rank="PLANT MANAGER";if(g.lifetimeCash>=50000)rank="POWER EXECUTIVE";if(g.lifetimeCash>=250000)rank="GRID BARON";if(g.lifetimeCash>=1000000)rank="ENERGY MOGUL";document.getElementById("rank").textContent=rank+" • LV "+g.operatorLevel;document.getElementById("prestigeInfo").innerHTML="Current prestige: <b>"+g.prestige+"</b> • Permanent production bonus: <b>+"+(g.prestige*10)+"%</b><br><span class='small'>Prestige unlocks after $50,000 lifetime cash. Current: "+money(g.lifetimeCash)+"</span>";renderPlants();renderCorporate();renderRegions();renderContracts();renderMissions();renderAchievements();renderEvent();updateFacility();document.getElementById("activityLog").innerHTML=g.log.map(x=>"<div>"+x+"</div>").join("");
document.getElementById("kpiLifetime").textContent=money(g.lifetimeCash);
document.getElementById("kpiContracts").textContent=g.contractsCompleted;
document.getElementById("kpiPrestige").textContent=g.prestige;
applySettings();renderTutorial();renderEndgame();renderMegaSystems();renderAutoGenerateUI();renderGuidedTutorial();renderPremiumAssetState()}
function handleOffline(){const now=Date.now(),s=Math.min(8*3600,Math.max(0,(now-g.lastSeen)/1000));if(s<30||output()<=0){g.lastSeen=now;return}const p=output()*s*.65,c=fuelCostPerSecond()*s*.65;g.stored+=p;g.generated+=p;g.cash=Math.max(0,g.cash-c);document.getElementById("offlineAmount").textContent=num(p)+" kWh";document.getElementById("offlineText").textContent="Your facility operated for "+Math.floor(s/60)+" minutes at 65% offline efficiency. Fuel cost: "+money(c)+".";document.getElementById("offlineModal").classList.add("show");addLog("Offline production added "+num(p)+" kWh.")}
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

console.log("Power Plant Tycoon PREMIUM EXPANSION V3 DIESEL CLEANUP loaded");handleOffline();render();setInterval(()=>{const p=output();g.stored+=p;g.generated+=p;payOperatingCosts();degradePlant();autoSellTick();createEvent();updateContract();saveGame();render()},1000);setInterval(()=>{shiftMarket();saveGame();render()},15000);document.addEventListener("visibilitychange",()=>{if(document.hidden)saveGame()});
