(function(){
  /* Keep the redesign isolated and last in the cascade without changing the app stack. */
  if(!document.querySelector('link[href="skill-redesign.css"]')){
    const redesign=document.createElement('link');
    redesign.rel='stylesheet';
    redesign.href='skill-redesign.css';
    document.head.appendChild(redesign);
  }

  if(!document.querySelector('link[rel="icon"]')){
    const favicon=document.createElement('link');
    favicon.rel='icon';
    favicon.href='favicon.svg';
    favicon.type='image/svg+xml';
    document.head.appendChild(favicon);
  }

  const metaEntries=[
    ['name','color-scheme','light dark'],
    ['property','og:title','Taipei 2027 · Couple Trip Companion'],
    ['property','og:description','A map-first Taipei couple itinerary with live location, nearby food and shopping, ticket guidance and transparent costs.'],
    ['property','og:type','website'],
    ['name','twitter:card','summary'],
    ['name','twitter:title','Taipei 2027 · Couple Trip Companion'],
    ['name','twitter:description','A map-first Taipei couple itinerary with live location, nearby places, tickets and costs.']
  ];
  metaEntries.forEach(([attr,key,value])=>{
    if(document.head.querySelector(`meta[${attr}="${key}"]`)) return;
    const meta=document.createElement('meta');
    meta.setAttribute(attr,key);
    meta.content=value;
    document.head.appendChild(meta);
  });

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
        const l=labels[day];
        if(!l||btn.dataset.enhanced==='1') return;
        btn.innerHTML=`<span class="day-kicker">${l.kicker}</span><span class="day-date">${l.date}</span>`;
        btn.setAttribute('aria-label',day===0?'Show the complete trip route':`Show ${l.kicker}, ${l.date} August route`);
        btn.title=day===0?'Show all itinerary days':`Show ${l.kicker} on the map`;
        btn.dataset.enhanced='1';
      });
    }
    new MutationObserver(enhance).observe(picker,{childList:true,subtree:true});
    enhance();
  }

  if(!document.querySelector('script[src="skill-redesign.js"]')){
    const polish=document.createElement('script');
    polish.src='skill-redesign.js';
    polish.defer=true;
    document.body.appendChild(polish);
  }
})();
