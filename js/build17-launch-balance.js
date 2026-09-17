/* GRIDLINE EMPIRE — BUILD 17 LAUNCH BALANCE PASS
   Goal: keep early progression controlled while making mid/late active play
   deliver meaningful upgrades in roughly 2–5 minutes at the tested 7-plant /
   prestige-12 stage. Late-game sale and production multipliers remain capped. */
(function(){
  if(window.__gridlineBuild17Balance)return;
  window.__gridlineBuild17Balance=true;

  const n=v=>Math.max(0,Number(v)||0);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||a));
  const plantCount=()=>{try{return PLANTS.filter(p=>g?.plants?.[p.id]?.unlocked).length}catch(e){return 0}};
  const prestigeCount=()=>Math.max(0,Math.floor(n(g?.prestige)));

  /* Stronger prestige: each reset should materially speed the next run,
     but growth uses a sub-linear exponent and a hard cap. */
  if(typeof prestigeMult==="function"){
    prestigeMult=function(){
      const p=prestigeCount();
      return 1+Math.min(1.75,.075*Math.pow(p,.70));
    };
  }

  /* +12% baseline generation, then a bounded portfolio bonus.
     At 7 plants this is ~+42% before the stronger prestige contribution. */
  function build17ProductionBoost(){
    const c=Math.max(1,plantCount());
    const portfolio=1+Math.min(.28,Math.max(0,c-1)*.045);
    return clamp(1.12*portfolio,1.12,1.44);
  }
  if(typeof totalMult==="function"&&!totalMult.__gridlineB17){
    const base=totalMult;
    const f=function(){return Math.max(.05,base.apply(this,arguments)*build17ProductionBoost())};
    f.__gridlineB17=true;totalMult=f;
  }

  /* Sale income progression:
       - first plant: about +18% versus Build 16
       - scales with portfolio breadth + prestige
       - current 7-plant / prestige-12 benchmark: about 6.4x sale value
       - hard cap prevents a return to runaway late-game cash
     Final effective sale rate is also capped near $1.05/kWh. */
  function build17SaleBoost(){
    const c=Math.max(1,plantCount()),p=prestigeCount();
    const portfolio=1+Math.min(4.25,.10*Math.pow(Math.max(0,c-1),2));
    const prestige=1+Math.min(.30,.055*Math.sqrt(p));
    return clamp(1.18*portfolio*prestige,1.18,7.0);
  }
  if(typeof safeSaleMultiplier==="function"&&!safeSaleMultiplier.__gridlineB17){
    const base=safeSaleMultiplier;
    const f=function(){return clamp(base.apply(this,arguments)*build17SaleBoost(),.05,1.05)};
    f.__gridlineB17=true;safeSaleMultiplier=f;
  }

  /* Mid-game costs: lower the grind without flattening early or endgame goals. */
  if(typeof plantCost==="function"&&!plantCost.__gridlineB17){
    const base=plantCost;
    const f=function(p){
      let cost=n(base.apply(this,arguments));
      const unlock=n(p?.unlock);
      if(unlock>=350000 && unlock<=1200000000)cost*=.88; // 12% lower mid-game plant cost
      return Math.max(1,cost);
    };
    f.__gridlineB17=true;plantCost=f;
  }
  function midGameUpgradeDiscount(){const c=plantCount();return c>=5&&c<=12?.90:1}
  if(typeof corporateCost==="function"&&!corporateCost.__gridlineB17){
    const base=corporateCost;const f=function(){return Math.max(1,n(base.apply(this,arguments))*midGameUpgradeDiscount())};f.__gridlineB17=true;corporateCost=f;
  }
  if(typeof staffCost==="function"&&!staffCost.__gridlineB17){
    const base=staffCost;const f=function(){return Math.max(1,n(base.apply(this,arguments))*midGameUpgradeDiscount())};f.__gridlineB17=true;staffCost=f;
  }
  if(typeof researchCost==="function"&&!researchCost.__gridlineB17){
    const base=researchCost;const f=function(){return Math.max(1,n(base.apply(this,arguments))*midGameUpgradeDiscount())};f.__gridlineB17=true;researchCost=f;
  }

  /* Keep displayed net-value estimates consistent with the new sale curve. */
  if(typeof netValuePerSecond==="function"){
    netValuePerSecond=function(){
      let gross=0,fuel=0;
      try{gross=output()*safeSaleMultiplier()}catch(e){}
      try{fuel=fuelCostPerSecond()}catch(e){}
      return Math.max(0,gross-fuel);
    };
  }

  window.pptBuild17EconomyAudit=function(){
    const c=plantCount(),p=prestigeCount();
    const out=typeof output==="function"?output():0;
    const rate=typeof safeSaleMultiplier==="function"?safeSaleMultiplier():0;
    const report={
      build:"Gridline Empire Build 17",
      unlockedPlants:c,
      prestige:p,
      productionBoost:build17ProductionBoost(),
      saleProgressionBoost:build17SaleBoost(),
      effectiveSalePerKWh:rate,
      outputKWhPerSecond:out,
      estimatedGrossCashPerMinute:out*rate*60,
      midGameCostMultiplier:midGameUpgradeDiscount()
    };
    console.table(report);return report;
  };

  console.info("Gridline Empire • Build 17 launch balance active");
})();
