/* PPT BUILD 4 — presentation-only helpers. Core game logic is untouched. */
(()=>{
  const $=id=>document.getElementById(id);
  function text(id,fallback="—"){const el=$(id);return el?(el.textContent||fallback).trim():fallback}
  function refresh(){
    const grid=$("b4Grid"),weather=$("b4Weather"),condition=$("b4Condition"),clock=$("b4Clock");
    if(grid) grid.textContent=text("gridStatus","GRID ONLINE").replace(/^●\s*/,"");
    if(weather) weather.textContent=text("weather","CLEAR").replace(/^[^A-Z0-9]+/i,"");
    const rel=parseFloat(text("cpRel","100"))||100;
    if(condition) condition.textContent=rel>=80?"OPTIMAL":rel>=55?"WATCH":"SERVICE";
    if(clock){const d=new Date();clock.textContent=d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});}
    const map={diesel:"cpDiesel",steam:"cpSteam",gas:"cpGas",solar:"cpSolar",nuclear:"cpNuclear"};
    document.querySelectorAll(".b4-plant-card[data-stage]").forEach(card=>{
      const src=$(map[card.dataset.stage]);
      card.classList.toggle("active",!!src?.classList.contains("active"));
      card.classList.toggle("locked",!!src?.classList.contains("locked"));
    });
  }
  document.addEventListener("DOMContentLoaded",()=>{refresh();setInterval(refresh,1000)});
})();
