/* POWER PLANT TYCOON — BUILD 13 IAP RELEASE HARDENING + EXECUTIVE HQ */
(function(){
  if(window.__pptBuild13IAPRelease)return;
  window.__pptBuild13IAPRelease=true;

  const IDS={
    autoGenerate:"com.calascointeractive.powerplanttycoon.autogenerate",
    capitalInjection:"com.calascointeractive.powerplanttycoon.capitalinjection",
    executiveLicense:"com.calascointeractive.powerplanttycoon.executivelicense",
    maintenanceCrate:"com.calascointeractive.powerplanttycoon.maintenancecrate",
    removeAds:"com.calascointeractive.powerplanttycoon.removeads",
    turboGrid:"com.calascointeractive.powerplanttycoon.turbogrid",
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
  const PERMANENT=["autoGenerate","removeAds","executiveLicense","hqExecutiveTheme","offlineOperations","foundersBundle","autoSellLicense"];
  const CONSUMABLE=["turboGrid","maintenanceCrate","capitalInjection","marketIntelligence","emergencyEngineering","rdAccelerator","recruitmentDrive","gridReserve","regionalExpansion"];

  function syncProductIDs(){
    if(typeof PPT_STOREKIT==="undefined"||!PPT_STOREKIT)return;
    Object.assign(PPT_STOREKIT.products,IDS);
    PPT_STOREKIT.permanentKeys=Array.from(new Set([...(PPT_STOREKIT.permanentKeys||[]),...PERMANENT]));
    PPT_STOREKIT.consumableKeys=Array.from(new Set([...(PPT_STOREKIT.consumableKeys||[]),...CONSUMABLE]));
  }

  function themeOwned(){return !!(typeof g!=="undefined"&&g&&g.hqExecutiveThemeUnlocked)}
  function ensureExecutiveUI(){
    const company=document.getElementById("company");
    if(!company)return;
    const titlebar=company.querySelector(".hq6-titlebar");
    if(titlebar&&!document.getElementById("ppt13ExecutiveBadge")){
      const left=titlebar.firstElementChild||titlebar;
      const badge=document.createElement("div");
      badge.id="ppt13ExecutiveBadge";
      badge.textContent="EXECUTIVE THEME ACTIVE";
      left.appendChild(badge);
    }
    const hero=company.querySelector(".hq6-hero");
    if(hero&&!document.getElementById("ppt13ExecutiveSeal")){
      const seal=document.createElement("div");
      seal.id="ppt13ExecutiveSeal";
      seal.textContent="PREMIUM EXECUTIVE OPERATIONS";
      hero.appendChild(seal);
    }
  }
  function updateStoreThemeCopy(){
    document.querySelectorAll(".b6-product").forEach(card=>{
      const title=card.querySelector("h4")?.textContent?.trim();
      if(title!=="HQ Executive Theme")return;
      const p=card.querySelector("p");
      if(p)p.textContent="Transforms HQ into a premium black-and-gold executive command suite.";
      card.classList.toggle("ppt13-theme-owned",themeOwned());
    });
  }
  function applyExecutiveTheme(){
    syncProductIDs();
    const on=themeOwned();
    document.body?.classList.toggle("ppt13-executive-active",on);
    ensureExecutiveUI();
    const badge=document.getElementById("ppt13ExecutiveBadge");
    const seal=document.getElementById("ppt13ExecutiveSeal");
    if(badge)badge.style.display=on?"inline-flex":"none";
    if(seal)seal.style.display=on?"flex":"none";
    updateStoreThemeCopy();
  }

  /* Correct an old customer log message. Final economy uses a controlled
     sale-quality improvement rather than the legacy +25% wording. */
  const oldAddLog=typeof addLog==="function"?addLog:null;
  if(oldAddLog){
    addLog=function(msg){
      if(msg==="Market Intelligence active: +25% sale value for 30 minutes.")
        msg="Market Intelligence active: improved sale quality for 30 minutes.";
      return oldAddLog(msg);
    };
  }

  /* Run after the Build 6 StoreKit handler so purchase/restore results immediately
     transform the HQ and keep the corrected product IDs active. */
  if(typeof window.powerPlantStoreKitResult==="function"){
    const previousStoreResult=window.powerPlantStoreKitResult;
    window.powerPlantStoreKitResult=function(payload){
      syncProductIDs();
      const wasOwned=themeOwned();
      const r=previousStoreResult(payload);
      applyExecutiveTheme();
      if(!wasOwned&&themeOwned()&&payload?.status==="purchased"&&payload?.productID===IDS.hqExecutiveTheme){
        if(typeof toast==="function")toast("✨ Executive HQ command suite activated!");
        if(typeof feedback==="function")feedback("big");
      }
      return r;
    };
  }

  /* Keep the premium appearance applied after any game render/navigation. */
  if(typeof render==="function"){
    const previousRender=render;
    render=function(){const r=previousRender.apply(this,arguments);applyExecutiveTheme();return r};
  }
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)applyExecutiveTheme()});

  /* Hidden release audit: no customer-facing test UI. */
  window.pptIAPReleaseAudit=function(){
    syncProductIDs();
    const idValues=Object.values(IDS),runtime=Object.values(PPT_STOREKIT?.products||{});
    const report={
      productCount:idValues.length,
      uniqueProductIDs:new Set(idValues).size,
      runtimeIDsMatch:idValues.every(id=>runtime.includes(id)),
      permanentKeys:PERMANENT.slice(),
      consumableKeys:CONSUMABLE.slice(),
      executiveThemeOwned:themeOwned(),
      autoGenerateOwned:!!g?.autoGenerateUnlocked,
      removeAdsOwned:!!g?.adsRemoved,
      executiveLicenseOwned:!!g?.executiveLicenseUnlocked,
      offlineOperationsOwned:!!g?.offlineOperationsUnlocked,
      foundersBundleOwned:!!g?.foundersBundleUnlocked,
      autoSellLicenseOwned:!!g?.autoSellLicenseUnlocked,
      marketIntelActive:Date.now()<Number(g?.marketIntelUntil||0),
      engineeringActive:Date.now()<Number(g?.engineeringShieldUntil||0),
      researchVouchers:Number(g?.store6ResearchVouchers||0),
      recruitmentVouchers:Number(g?.store6RecruitmentVouchers||0)
    };
    console.table(report);return report;
  };

  syncProductIDs();
  applyExecutiveTheme();
  setTimeout(()=>{syncProductIDs();applyExecutiveTheme();if(typeof requestStoreKitStatus==="function"&&typeof nativeStoreKitAvailable==="function"&&nativeStoreKitAvailable())requestStoreKitStatus()},350);
})();
