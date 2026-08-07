(function(){
  /* Load the requested Biryani family before the final visual layers. */
  if(!document.querySelector('link[data-taipei-font="biryani-preconnect"]')){
    const preconnect=document.createElement('link');
    preconnect.rel='preconnect';
    preconnect.href='https://fonts.googleapis.com';
    preconnect.dataset.taipeiFont='biryani-preconnect';
    document.head.appendChild(preconnect);
  }
  if(!document.querySelector('link[data-taipei-font="biryani-gstatic"]')){
    const gstatic=document.createElement('link');
    gstatic.rel='preconnect';
    gstatic.href='https://fonts.gstatic.com';
    gstatic.crossOrigin='anonymous';
    gstatic.dataset.taipeiFont='biryani-gstatic';
    document.head.appendChild(gstatic);
  }
  if(!document.querySelector('link[data-taipei-font="biryani"]')){
    const font=document.createElement('link');
    font.rel='stylesheet';
    font.href='https://fonts.googleapis.com/css2?family=Biryani:wght@200;300;400;600;700;800;900&display=swap';
    font.dataset.taipeiFont='biryani';
    document.head.appendChild(font);
  }

  /* Keep the redesign isolated and last in the cascade without changing the app stack. */
  if(!document.querySelector('link[href="skill-redesign.css"]')){
    const redesign=document.createElement('link');
    redesign.rel='stylesheet';
    redesign.href='skill-redesign.css';
    document.head.appendChild(redesign);
  }
  if(!document.querySelector('link[href="biryani-consistency.css"]')){
    const consistency=document.createElement('link');
    consistency.rel='stylesheet';
    consistency.href='biryani-consistency.css';
    document.head.appendChild(consistency);
  }
  if(!document.querySelector('link[href="neon-vibrant.css"]')){
    const neon=document.createElement('link');
    neon.rel='stylesheet';
    neon.href='neon-vibrant.css';
    document.head.appendChild(neon);
  }

  /* Final type override. */
  if(!document.getElementById('biryani-final-type-fix')){
    const finalType=document.createElement('style');
    finalType.id='biryani-final-type-fix';
    finalType.textContent=`
      #app,
      #app *,
      #app *::before,
      #app *::after{
        font-family:"Biryani",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
      }

      #app h1,
      #app h2,
      #app h3,
      #app h4,
      #app h5,
      #app h6,
      #app .brand h1,
      #app .section-head h2,
      #app .stop-title,
      #app .poi-copy h3,
      #app .transport-card h3,
      #app .transport-recommend h3,
      #app .app-card h3,
      #app .popup-title,
      #app .day-ticket-guide strong{
        font-family:"Biryani",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        font-weight:400!important;
      }

      #app .brand h1,
      #app .section-head h2{
        letter-spacing:-.015em!important;
      }

      #app .brand-eyebrow,
      #app .panel-kicker,
      #app .ticket-kicker{
        font-weight:600!important;
      }
    `;
    document.head.appendChild(finalType);
  }

  /* Final colour + itinerary spacing correction. */
  if(!document.getElementById('taipei-final-ui-fix')){
    const finalUI=document.createElement('style');
    finalUI.id='taipei-final-ui-fix';
    finalUI.textContent=`
      :root,
      [data-theme="dark"]{
        --coral:#FF6700!important;
        --coral-deep:#FF6700!important;
        --ui-accent:#FF6700!important;
        --ui-accent-strong:#FF6700!important;
      }

      #app .leaflet-overlay-pane path[stroke="#d94f33"],
      #app .leaflet-overlay-pane path[stroke="#D94F33"],
      #app .leaflet-overlay-pane path[stroke="rgb(217, 79, 51)"]{
        stroke:#FF6700!important;
      }

      #app [style*="#d94f33"],
      #app [style*="#D94F33"]{
        --day-color:#FF6700!important;
      }

      #app .day-ticket-guide{
        margin-left:14px!important;
        margin-right:0!important;
        margin-bottom:16px!important;
      }

      #app .timeline{
        padding-left:14px!important;
        margin-top:0!important;
        gap:0!important;
        border-top:0!important;
      }

      #app .timeline::before{
        top:26px!important;
        bottom:26px!important;
      }

      #app .stop-main{
        grid-template-columns:36px minmax(0,1fr) 24px!important;
        column-gap:12px!important;
        min-height:0!important;
        padding:14px 4px 10px!important;
        align-items:center!important;
      }

      #app .stop-number{
        width:36px!important;
        height:36px!important;
      }

      #app .stop-title{margin:0!important;}
      #app .stop-meta{margin-top:2px!important;}

      #app details.stop-details summary{
        min-height:36px!important;
        padding:2px 4px 10px 52px!important;
      }

      #app .stop-body{
        padding:0 4px 14px 52px!important;
      }

      #app .stop-card::before{
        top:24px!important;
      }

      @media(max-width:560px){
        #app .day-ticket-guide{
          margin-bottom:14px!important;
        }
        #app .stop-main{
          padding:12px 4px 8px!important;
        }
        #app details.stop-details summary{
          min-height:34px!important;
          padding-bottom:8px!important;
        }
        #app .stop-body{
          padding-bottom:12px!important;
        }
      }
    `;
    document.head.appendChild(finalUI);
  }

  /* Keep the Day 1 route/markers on the exact requested orange after initial map render. */
  try{
    if(typeof dayColours!=='undefined') dayColours[1]='#FF6700';
  }catch(e){}

  function recolourDayOne(){
    document.querySelectorAll('.leaflet-overlay-pane path').forEach(path=>{
      const stroke=(path.getAttribute('stroke')||'').toLowerCase().replace(/\s/g,'');
      if(stroke==='#d94f33'||stroke==='rgb(217,79,51)') path.setAttribute('stroke','#FF6700');
    });
    document.querySelectorAll('[style*="#d94f33"],[style*="#D94F33"]').forEach(el=>{
      el.style.setProperty('--day-color','#FF6700','important');
    });
  }
  recolourDayOne();
  new MutationObserver(recolourDayOne).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});

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