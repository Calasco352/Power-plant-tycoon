/* POWER PLANT TYCOON BUILD 6 — HQ COMMAND CENTER */
(function(){
  if(window.__pptHQ6Installed)return;
  window.__pptHQ6Installed=true;

  const HQ6={
    operations:{name:"Operations",base:10000,effect:"+1.5% plant production / level",icon:"🎛️"},
    engineering:{name:"Engineering",base:12000,effect:"-3% maintenance cost / level",icon:"🔧"},
    trading:{name:"Trading",base:14000,effect:"+1.5% power sale value / level",icon:"📈"},
    hr:{name:"HR & Training",base:9000,effect:"-2% staff hiring cost / level",icon:"👥"},
    research:{name:"R&D",base:16000,effect:"-2% research cost / level",icon:"🧪"},
    finance:{name:"Finance",base:18000,effect:"+0.75% sale value / level",icon:"🪙"},
    grid:{name:"Grid Control",base:20000,effect:"+0.75% output & sale value / level",icon:"⚡"}
  };

  function ensureHQ6(){
    if(typeof g==="undefined"||!g)return;
    if(!g.hq6)g.hq6={departments:{}};
    if(!g.hq6.departments)g.hq6.departments={};
    Object.keys(HQ6).forEach(id=>{
      if(g.hq6.departments[id]==null)g.hq6.departments[id]=1;
      g.hq6.departments[id]=Math.max(1,Number(g.hq6.departments[id])||1);
    });
  }
  function lv(id){ensureHQ6();return g.hq6.departments[id]||1}
  function extra(id){return Math.max(0,lv(id)-1)}
  function cost(id){return HQ6[id].base*Math.pow(1.78,extra(id))}
  function hqLevel(){return Math.max(1,Math.floor(Object.keys(HQ6).reduce((a,id)=>a+lv(id),0)/Object.keys(HQ6).length))}
  function totalStaff(){return Object.values(g.staff||{}).reduce((a,b)=>a+(Number(b)||0),0)}
  function totalResearch(){return Object.values(g.research||{}).reduce((a,b)=>a+(Number(b)||0),0)}
  function plantsOnline(){return (typeof PLANTS!=="undefined"?PLANTS:[]).filter(p=>g.plants?.[p.id]?.unlocked).length}
  function fmtMoney(v){try{return money(v)}catch(e){return "$"+Math.round(v).toLocaleString()}}
  function fmtNum(v){try{return num(v)}catch(e){return Number(v||0).toFixed(1)}}

  // Integrate HQ progression into the existing real game systems while keeping game.js untouched.
  if(typeof totalMult==="function"){
    const oldTotalMult=totalMult;
    totalMult=function(){return oldTotalMult()*(1+extra("operations")*.015+extra("grid")*.0075)};
  }
  if(typeof gridSaleMult==="function"){
    const oldGridSaleMult=gridSaleMult;
    gridSaleMult=function(){return oldGridSaleMult()*(1+extra("trading")*.015+extra("finance")*.0075+extra("grid")*.0075)};
  }
  if(typeof maintenanceCost==="function"){
    const oldMaintenanceCost=maintenanceCost;
    maintenanceCost=function(){return oldMaintenanceCost()*Math.max(.65,1-extra("engineering")*.03)};
  }
  if(typeof staffCost==="function"){
    const oldStaffCost=staffCost;
    staffCost=function(id){return oldStaffCost(id)*Math.max(.65,1-extra("hr")*.02)};
  }
  if(typeof researchCost==="function"){
    const oldResearchCost=researchCost;
    researchCost=function(id){return oldResearchCost(id)*Math.max(.65,1-extra("research")*.02)};
  }

  window.upgradeHQ6Department=function(id){
    ensureHQ6();
    if(!HQ6[id])return;
    const c=cost(id);
    if(g.cash<c){if(typeof toast==="function")toast("Need "+fmtMoney(c)+" to upgrade "+HQ6[id].name+".");return}
    g.cash-=c;g.hq6.departments[id]++;
    g.reputation=(g.reputation||0)+4;
    if(typeof addXP==="function")addXP(18);
    if(typeof addLog==="function")addLog("HQ "+HQ6[id].name+" upgraded to Level "+lv(id)+".");
    if(typeof saveGame==="function")saveGame();
    if(typeof render==="function")render();
    renderHQ6();
    if(typeof feedback==="function")feedback("big");
  };

  window.openHQ6Department=function(id){
    document.querySelectorAll(".hq6-dept").forEach(e=>e.classList.toggle("active",e.dataset.dept===id));
    document.querySelectorAll(".hq6-detail").forEach(e=>e.classList.toggle("show",e.dataset.detail===id));
    const p=document.querySelector('.hq6-detail[data-detail="'+id+'"]');
    if(p)setTimeout(()=>p.scrollIntoView({behavior:"smooth",block:"nearest"}),30);
  };
  window.closeHQ6Details=function(){document.querySelectorAll(".hq6-detail").forEach(e=>e.classList.remove("show"));document.querySelectorAll(".hq6-dept").forEach(e=>e.classList.remove("active"))};

  function syncText(id,text){const e=document.getElementById(id);if(e)e.textContent=text}
  function syncWidth(id,pct){const e=document.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,pct))+"%"}
  function departmentEffect(id){
    const n=extra(id);
    if(id==="operations")return "+"+(n*1.5).toFixed(1)+"% Plant Production";
    if(id==="engineering")return "-"+(n*3).toFixed(0)+"% Maintenance Cost";
    if(id==="trading")return "+"+(n*1.5).toFixed(1)+"% Power Sale Value";
    if(id==="hr")return "-"+(n*2).toFixed(0)+"% Hiring Cost";
    if(id==="research")return "-"+(n*2).toFixed(0)+"% Research Cost";
    if(id==="finance")return "+"+(n*.75).toFixed(2)+"% Finance Sale Bonus";
    return "+"+(n*.75).toFixed(2)+"% Grid Output + Sale";
  }

  function renderHQ6(){
    if(typeof g==="undefined"||!g)return;
    ensureHQ6();
    const out=typeof output==="function"?output():0;
    const net=typeof netValuePerSecond==="function"?netValuePerSecond():0;
    const reliability=Math.max(0,Math.min(100,Number(g.reliability||100)));
    const demand=Math.round((g.market?.demand||1)*100);
    const hq=hqLevel();
    const levelProgress=(Object.keys(HQ6).reduce((a,id)=>a+lv(id),0)%7)/7*100;

    syncText("hq6Cash",fmtMoney(g.cash||0));
    syncText("hq6Stored",typeof energy==="function"?energy(g.stored||0):fmtNum(g.stored||0)+" kWh");
    syncText("hq6Output",typeof powerRate==="function"?powerRate(out):fmtNum(out)+"/s");
    syncText("hq6Staff",totalStaff()+" STAFF");
    syncText("hq6Rep",Math.floor(g.reputation||0));
    syncText("hq6Level","LV "+hq);
    syncWidth("hq6Xp",levelProgress);
    syncText("hq6GridStability",Math.round(reliability)+"%");
    syncText("hq6Demand",demand+"%");
    const plantTotal=typeof PLANTS!=="undefined"?PLANTS.length:5;
    syncText("hq6Plants",plantsOnline()+" / "+plantTotal);
    syncText("hq6Daily",fmtMoney(Math.max(0,net*86400)));
    syncText("hq6CompanyValue",fmtMoney(Math.max(0,(g.lifetimeCash||0)+(g.cash||0)+(g.generated||0)*.25)));
    syncText("hq6Net",fmtMoney(Math.max(0,net))+"/s");
    syncText("hq6ResearchCount",totalResearch()+" TECH LEVELS");

    const goal=Math.min(plantTotal,plantsOnline()+1);
    syncText("hq6Goal",plantsOnline()>=plantTotal?"All generation technologies online":"Expand to "+goal+" Plants");
    syncText("hq6GoalArrow",plantsOnline()>=plantTotal?"★":"»");

    Object.keys(HQ6).forEach(id=>{
      syncText("hq6Lv-"+id,"LV "+lv(id));
      syncText("hq6Effect-"+id,departmentEffect(id));
      syncText("hq6Cost-"+id,"UPGRADE "+fmtMoney(cost(id)));
    });

    const now=new Date();
    syncText("hq6Time",now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
  }
  window.renderHQ6=renderHQ6;

  if(typeof render==="function"){
    const oldRender=render;
    render=function(){const r=oldRender();renderHQ6();return r};
  }

  ensureHQ6();
  if(typeof saveGame==="function")saveGame();
  renderHQ6();
  setInterval(renderHQ6,1000);
})();
