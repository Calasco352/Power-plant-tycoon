/* POWER PLANT TYCOON — BUILD 13 EXECUTIVE GRID VIP + GAME CENTER RANKINGS */
/* PPT BUILD 14 VIP PURCHASE UI */
(function(){
  if(window.__pptBuild13VipRankings)return;
  window.__pptBuild13VipRankings=true;

  const VIP={
    monthly:"com.calascointeractive.powerplanttycoon.vip.monthly",
    yearly:"com.calascointeractive.powerplanttycoon.vip.yearly"
  };
  const LB={
    company:"com.calascointeractive.powerplanttycoon.lb.companyvalue",
    prestige:"com.calascointeractive.powerplanttycoon.lb.prestige",
    empire:"com.calascointeractive.powerplanttycoon.lb.empirelevel",
    weeklyCash:"com.calascointeractive.powerplanttycoon.lb.weeklygrowth",
    weeklyEnergy:"com.calascointeractive.powerplanttycoon.lb.weeklyenergy"
  };
  const RANK_KEY="PPT_B13_RANKINGS_V1";
  const VIP_KEY="PPT_B13_VIP_DAILY_V1";
  let vipActive=false;
  let vipPlan="";
  let gameCenter={authenticated:false,alias:"",lastMessage:"Connect to Game Center to compete globally."};

  function n(v){v=Number(v);return Number.isFinite(v)?v:0}
  function game(){try{return typeof g!=="undefined"?g:null}catch(e){return null}}
  function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
  function dayKey(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function weekKey(){
    const d=new Date(),u=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
    const day=u.getUTCDay()||7;u.setUTCDate(u.getUTCDate()+4-day);
    const y0=new Date(Date.UTC(u.getUTCFullYear(),0,1));
    const w=Math.ceil((((u-y0)/86400000)+1)/7);
    return u.getUTCFullYear()+"-W"+String(w).padStart(2,"0");
  }
  function loadRankState(){
    let s={};try{s=JSON.parse(localStorage.getItem(RANK_KEY)||"{}")||{}}catch(e){}
    const wk=weekKey(),cash=n(game()?.lifetimeCash),gen=n(game()?.generated);
    if(s.week!==wk){s={week:wk,cashBase:cash,weeklyEnergy:0,lastGenerated:gen,lastSubmit:{}}}
    if(!s.lastSubmit)s.lastSubmit={};
    if(s.cashBase==null)s.cashBase=cash;
    if(s.lastGenerated==null)s.lastGenerated=gen;
    const delta=gen>=s.lastGenerated?gen-s.lastGenerated:gen; // handles prestige/reset
    if(delta>0&&Number.isFinite(delta))s.weeklyEnergy=n(s.weeklyEnergy)+delta;
    s.lastGenerated=gen;
    try{localStorage.setItem(RANK_KEY,JSON.stringify(s))}catch(e){}
    return s;
  }
  function saveRankState(s){try{localStorage.setItem(RANK_KEY,JSON.stringify(s))}catch(e){}}
  function gcScore(v){return Math.max(0,Math.min(9000000000000000,Math.floor(n(v))))}
  function metrics(){
    const s=loadRankState();
    const cash=n(game()?.lifetimeCash);
    const weeklyCash=Math.max(0,cash-n(s.cashBase));
    const prestige=n(game()?.prestige);
    const empireLevel=n(game()?.empireLevel);
    const weeklyEnergy=n(s.weeklyEnergy);
    return [
      {key:"company",id:LB.company,title:"Company Value",value:gcScore(cash),display:(typeof money==="function"?money(cash):String(gcScore(cash))),scope:"ALL TIME"},
      {key:"prestige",id:LB.prestige,title:"Prestige Count",value:gcScore(prestige),display:String(gcScore(prestige)),scope:"ALL TIME"},
      {key:"empire",id:LB.empire,title:"Empire Level",value:gcScore(empireLevel),display:String(gcScore(empireLevel)),scope:"ALL TIME"},
      {key:"weeklyCash",id:LB.weeklyCash,title:"Weekly Company Growth",value:gcScore(weeklyCash),display:(typeof money==="function"?money(weeklyCash):String(gcScore(weeklyCash))),scope:"THIS WEEK"},
      {key:"weeklyEnergy",id:LB.weeklyEnergy,title:"Weekly Energy",value:gcScore(weeklyEnergy),display:(typeof energy==="function"?energy(weeklyEnergy):String(gcScore(weeklyEnergy))),scope:"THIS WEEK"}
    ];
  }

  function native(){return typeof nativeStoreKitAvailable==="function"&&nativeStoreKitAvailable()}
  function sendNative(action,extra={}){
    if(!native())return false;
    try{window.webkit.messageHandlers[PPT_STOREKIT.bridgeName].postMessage(Object.assign({action},extra));return true}catch(e){return false}
  }
  function syncProductIDs(){
    if(typeof PPT_STOREKIT==="undefined"||!PPT_STOREKIT)return;
    PPT_STOREKIT.products.vipMonthly=VIP.monthly;
    PPT_STOREKIT.products.vipYearly=VIP.yearly;
  }
  function updateVipFromOwned(owned){
    if(!Array.isArray(owned))return;
    const yearly=owned.includes(VIP.yearly),monthly=owned.includes(VIP.monthly);
    vipActive=yearly||monthly;
    vipPlan=yearly?"YEARLY":monthly?"MONTHLY":"";
    applyVipVisuals();renderVip();
  }
  function applyVipVisuals(){
    document.body?.classList.toggle("ppt13-vip-active",vipActive);
    let badge=document.getElementById("ppt13VipBadge");
    if(!badge){
      const rank=document.getElementById("rank");
      if(rank&&rank.parentElement){badge=document.createElement("span");badge.id="ppt13VipBadge";badge.textContent="VIP";rank.insertAdjacentElement("afterend",badge)}
    }
    if(badge)badge.style.display=vipActive?"inline-flex":"none";
  }

  function ensureVipStore(){
    const store=document.getElementById("store");if(!store||document.getElementById("ppt13VipCard"))return;
    const card=document.createElement("div");card.id="ppt13VipCard";card.className="card ppt13-vip-card";
    card.innerHTML=`
      <div class="ppt13-vip-head"><div><small>EXECUTIVE GRID VIP</small><h3>💎 VIP Membership</h3><p>Ongoing executive benefits for active members.</p></div><span id="ppt13VipState">NOT ACTIVE</span></div>
      <div class="ppt13-vip-benefits">
        <div><b>+5%</b><small>GRID OUTPUT</small></div><div><b>+3%</b><small>SALE QUALITY</small></div><div><b>VIP</b><small>DAILY SUPPLY</small></div><div><b>0</b><small>FORCED ADS</small></div>
      </div>
      <div class="ppt13-vip-plans">
        <button id="ppt13VipMonthly" class="btn gold" onclick="pptBuyVIP('monthly')">MONTHLY • $4.99</button>
        <button id="ppt13VipYearly" class="btn purple" onclick="pptBuyVIP('yearly')">YEARLY • $39.99</button>
      </div>
      <div class="ppt13-vip-actions"><button id="ppt13VipDaily" class="btn green" onclick="pptClaimVIPDaily()">CLAIM VIP DAILY SUPPLY</button><button class="btn dark" onclick="pptManageVIP()">MANAGE MEMBERSHIP</button></div>
      <p class="small">VIP benefits stay active only while the Apple subscription is active. Permanent purchases remain permanent.</p>`;
    const hero=store.querySelector(".page-hero");
    if(hero)hero.insertAdjacentElement("afterend",card);else store.prepend(card);
  }
  function renderVip(){
    ensureVipStore();applyVipVisuals();
    const state=document.getElementById("ppt13VipState");if(state){state.textContent=vipActive?("ACTIVE • "+vipPlan):"NOT ACTIVE";state.classList.toggle("active",vipActive)}
    const m=document.getElementById("ppt13VipMonthly"),y=document.getElementById("ppt13VipYearly");
    const pm=PPT_STOREKIT?.prices?.[VIP.monthly]||"",py=PPT_STOREKIT?.prices?.[VIP.yearly]||"";
    if(m){m.textContent=vipPlan==="MONTHLY"?"MONTHLY ACTIVE":(pm?"MONTHLY • "+pm:"MONTHLY • CHECKING…");m.disabled=vipPlan==="MONTHLY"}
    if(y){y.textContent=vipPlan==="YEARLY"?"YEARLY ACTIVE":(py?"YEARLY • "+py:"YEARLY • CHECKING…");y.disabled=vipPlan==="YEARLY"}
    const d=document.getElementById("ppt13VipDaily");if(d){let s={};try{s=JSON.parse(localStorage.getItem(VIP_KEY)||"{}")||{}}catch(e){}const claimed=s.day===dayKey();d.disabled=!vipActive||claimed;d.textContent=!vipActive?"VIP MEMBERS ONLY":claimed?"VIP SUPPLY CLAIMED TODAY":"CLAIM VIP DAILY SUPPLY"}
  }
  window.pptBuyVIP=function(plan){
    syncProductIDs();const id=plan==="yearly"?VIP.yearly:VIP.monthly;
    if(!native()){if(typeof toast==="function")toast("VIP subscriptions are available in the iPhone/iPad App Store build.");return}
    if(typeof setStoreKitStatus==="function")setStoreKitStatus("Checking Apple Store…");
    if(typeof requestStoreKitStatus==="function")requestStoreKitStatus();
    setTimeout(()=>{
      if(typeof setStoreKitStatus==="function")setStoreKitStatus("Opening Apple subscription…");
      sendNative("purchase",{productID:id});
    },250);
  };
  window.pptManageVIP=function(){
    if(!native()){if(typeof toast==="function")toast("Subscription management is available on iPhone/iPad.");return}
    sendNative("manageSubscriptions");
  };
  window.pptClaimVIPDaily=function(){
    if(!vipActive){if(typeof toast==="function")toast("Executive Grid VIP is not active.");return}
    let s={};try{s=JSON.parse(localStorage.getItem(VIP_KEY)||"{}")||{}}catch(e){}
    if(s.day===dayKey()){if(typeof toast==="function")toast("VIP daily supply already claimed.");return}
    let reward=Math.max(25000,n(typeof netValuePerSecond==="function"?netValuePerSecond():0)*300,n(typeof output==="function"?output():0)*180);
    reward=Math.min(1e300,reward);
    if(typeof recordEarnedCash==="function")recordEarnedCash(reward);else if(game())g.cash=n(g.cash)+reward;
    s.day=dayKey();try{localStorage.setItem(VIP_KEY,JSON.stringify(s))}catch(e){}
    if(typeof addLog==="function")addLog("Executive Grid VIP daily supply received: "+(typeof money==="function"?money(reward):reward)+".");
    if(typeof saveGame==="function")saveGame();if(typeof render==="function")render();renderVip();
    if(typeof feedback==="function")feedback("big");if(typeof toast==="function")toast("💎 VIP daily supply: "+(typeof money==="function"?money(reward):reward));
  };

  function ensureRankings(){
    const stats=document.getElementById("stats");if(!stats||document.getElementById("ppt13Rankings"))return;
    const card=document.createElement("div");card.id="ppt13Rankings";card.className="card ppt13-rank-card";
    card.innerHTML=`<div class="ppt13-rank-head"><div><small>GLOBAL COMPETITION</small><h3>🏆 Game Center Rankings</h3><p id="ppt13GCStatus">Connect to Game Center to compete globally.</p></div><span id="ppt13GCAlias">OFFLINE</span></div><div id="ppt13RankList" class="ppt13-rank-list"></div><div class="ppt13-rank-actions"><button class="btn blue" onclick="pptSyncRankings(true)">SYNC SCORES</button><button class="btn dark" onclick="pptGameCenterAuth()">CONNECT GAME CENTER</button></div><p class="small">Scores are submitted to Apple Game Center. Weekly boards reset automatically in Game Center.</p>`;
    const banner=stats.querySelector(".uf-banner");if(banner)banner.insertAdjacentElement("afterend",card);else stats.prepend(card);
  }
  function renderRankings(){
    ensureRankings();
    const status=document.getElementById("ppt13GCStatus");if(status)status.textContent=gameCenter.lastMessage;
    const alias=document.getElementById("ppt13GCAlias");if(alias){alias.textContent=gameCenter.authenticated?(gameCenter.alias||"CONNECTED"):(native()?"NOT CONNECTED":"IPHONE/IPAD ONLY");alias.classList.toggle("active",gameCenter.authenticated)}
    const list=document.getElementById("ppt13RankList");if(list)list.innerHTML=metrics().map(m=>`<div class="ppt13-rank-row"><div><small>${m.scope}</small><b>${esc(m.title)}</b><span>${esc(m.display)}</span></div><button class="btn dark" onclick="pptOpenLeaderboard('${m.id}')">VIEW</button></div>`).join("");
  }
  window.pptGameCenterAuth=function(){
    if(!native()){gameCenter.lastMessage="Game Center rankings are available in the iPhone/iPad build.";renderRankings();return}
    gameCenter.lastMessage="Connecting to Game Center…";renderRankings();sendNative("gameCenterAuth");
  };
  window.pptOpenLeaderboard=function(id){
    if(!native()){if(typeof toast==="function")toast("Game Center is available in the iPhone/iPad build.");return}
    sendNative("gameCenterShow",{leaderboardID:id});
  };
  window.pptSyncRankings=function(force){
    if(!native()||!gameCenter.authenticated){if(force)pptGameCenterAuth();return}
    const s=loadRankState();
    metrics().forEach(m=>{
      const last=n(s.lastSubmit?.[m.id]);
      if(force||m.value>last){sendNative("gameCenterSubmit",{leaderboardID:m.id,score:m.value});s.lastSubmit[m.id]=Math.max(last,m.value)}
    });
    saveRankState(s);gameCenter.lastMessage="Ranking scores synced with Game Center.";renderRankings();
  };

  /* VIP applies after all Build 8/Build 6 balance wrappers. */
  if(typeof totalMult==="function"&&!totalMult.__ppt13Vip){const base=totalMult;const f=function(){return base.apply(this,arguments)*(vipActive?1.05:1)};f.__ppt13Vip=true;totalMult=f}
  if(typeof marketSaleMult==="function"&&!marketSaleMult.__ppt13Vip){const base=marketSaleMult;const f=function(){return base.apply(this,arguments)*(vipActive?1.03:1)};f.__ppt13Vip=true;marketSaleMult=f}
  if(typeof markInterstitialOpportunity==="function"&&!markInterstitialOpportunity.__ppt13Vip){const base=markInterstitialOpportunity;const f=function(){if(vipActive)return;return base.apply(this,arguments)};f.__ppt13Vip=true;markInterstitialOpportunity=f}
  if(typeof tryShowPendingInterstitial==="function"&&!tryShowPendingInterstitial.__ppt13Vip){const base=tryShowPendingInterstitial;const f=function(){if(vipActive){if(game()?.adState)g.adState.pending=false;return}return base.apply(this,arguments)};f.__ppt13Vip=true;tryShowPendingInterstitial=f}

  const previousResult=window.powerPlantStoreKitResult;
  window.powerPlantStoreKitResult=function(p){
    try{
      const isGC=p&&typeof p.status==="string"&&p.status.startsWith("gameCenter");
      if(isGC){
        if(p.status==="gameCenterAuth"){
          gameCenter.authenticated=!!p.authenticated;gameCenter.alias=p.alias||"";
          gameCenter.lastMessage=gameCenter.authenticated?("Connected as "+(gameCenter.alias||"Game Center Player")):"Game Center sign-in is not active.";
          if(gameCenter.authenticated)setTimeout(()=>pptSyncRankings(false),300);
        }else if(p.status==="gameCenterSubmitted"){
          gameCenter.lastMessage="Scores are up to date on Game Center.";
        }else if(p.status==="gameCenterError"){
          gameCenter.lastMessage=p.message||"Game Center is unavailable right now.";
        }
        renderRankings();return;
      }
      if(p?.status==="error"&&(p.productID===VIP.monthly||p.productID===VIP.yearly)){
        const msg=p.message||"This VIP plan is not available from Apple yet. Please try again.";
        if(typeof setStoreKitStatus==="function")setStoreKitStatus(msg);
        if(typeof toast==="function")toast(msg);
        renderVip();return;
      }
      if(p?.status==="purchased"&&(p.productID===VIP.monthly||p.productID===VIP.yearly)){
        updateVipFromOwned(Array.isArray(p.ownedProductIDs)?p.ownedProductIDs:[p.productID]);
        if(typeof toast==="function")toast("💎 Executive Grid VIP activated!");
        if(typeof setStoreKitStatus==="function")setStoreKitStatus("VIP membership active.");
        return;
      }
      if(typeof previousResult==="function")previousResult(p);
      if(p?.prices&&typeof p.prices==="object"&&typeof PPT_STOREKIT!=="undefined")Object.assign(PPT_STOREKIT.prices,p.prices);
      if(Array.isArray(p?.ownedProductIDs))updateVipFromOwned(p.ownedProductIDs);
      renderVip();
    }catch(e){console.warn("Build 13 VIP/Rankings bridge error",e);if(typeof previousResult==="function")previousResult(p)}
  };

  if(typeof render==="function"&&!render.__ppt13VipRankings){const base=render;const f=function(){const r=base.apply(this,arguments);renderVip();renderRankings();loadRankState();return r};f.__ppt13VipRankings=true;render=f}
  if(typeof showPage==="function"&&!showPage.__ppt13Rankings){const base=showPage;const f=function(id,b){const r=base.apply(this,arguments);if(id==="stats"){renderRankings();setTimeout(()=>pptSyncRankings(false),450)}return r};f.__ppt13Rankings=true;showPage=f}

  document.addEventListener("visibilitychange",()=>{if(!document.hidden){if(typeof requestStoreKitStatus==="function")requestStoreKitStatus();pptGameCenterAuth();setTimeout(()=>pptSyncRankings(false),900)}});

  syncProductIDs();ensureVipStore();ensureRankings();renderVip();renderRankings();loadRankState();
  if(native()){setTimeout(()=>pptGameCenterAuth(),700);setTimeout(()=>{if(typeof requestStoreKitStatus==="function")requestStoreKitStatus()},350)}

  window.pptBuild13LaunchAudit=function(){
    const a={vipActive,vipPlan,gameCenterAuthenticated:gameCenter.authenticated,leaderboards:Object.assign({},LB),vipProducts:Object.assign({},VIP),metrics:metrics(),hqThemeOwned:!!game()?.hqExecutiveThemeUnlocked};
    console.table(a);return a;
  };
})();
