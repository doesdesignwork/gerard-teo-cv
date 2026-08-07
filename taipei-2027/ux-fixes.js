(function(){
  const app=document.getElementById('app');

  /* One source of truth for the four day colours before the first route render. */
  try{
    if(typeof dayColours!=='undefined'){
      dayColours[1]='#FF6700';
      dayColours[2]='#00FFD1';
      dayColours[3]='#B026FF';
      dayColours[4]='#FFE600';
    }
  }catch(e){}

  /* Keep theme state identical on app, html and body. */
  function syncDocumentTheme(){
    if(!app) return;
    const theme=app.dataset.theme==='light'?'light':'dark';
    document.documentElement.dataset.theme=theme;
    document.body.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
  }
  syncDocumentTheme();
  if(app){
    new MutationObserver(syncDocumentTheme).observe(app,{attributes:true,attributeFilter:['data-theme']});
  }

  /* Clearer map-day labels without changing route behaviour. */
  const picker=document.getElementById('mapDayPicker');
  if(picker){
    const labels={
      0:{kicker:'Route',date:'All days'},
      1:{kicker:'Day 1',date:'Fri 20'},
      2:{kicker:'Day 2',date:'Sat 21'},
      3:{kicker:'Day 3',date:'Sun 22'},
      4:{kicker:'Day 4',date:'Mon 23'}
    };
    function enhance(){
      picker.querySelectorAll('.seg-btn').forEach(btn=>{
        const day=Number(btn.dataset.day);
        const label=labels[day];
        if(!label||btn.dataset.enhanced==='1') return;
        btn.innerHTML=`<span class="day-kicker">${label.kicker}</span><span class="day-date">${label.date}</span>`;
        btn.setAttribute('aria-label',day===0?'Show the complete trip route':`Show ${label.kicker}, ${label.date} August route`);
        btn.title=day===0?'Show all itinerary days':`Show ${label.kicker} on the map`;
        btn.dataset.enhanced='1';
      });
    }
    new MutationObserver(enhance).observe(picker,{childList:true,subtree:true});
    enhance();
  }

  /* Load the resilient Around Me pin enhancer once. It works with both the
     legacy and recommendation result renderers, so every result gets a map pin. */
  if(!document.querySelector('script[src="nearby-pin.js"]')){
    const script=document.createElement('script');
    script.src='nearby-pin.js';
    document.body.appendChild(script);
  }
})();
