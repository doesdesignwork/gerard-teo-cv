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

  /* Make the app theme state authoritative for the whole document. */
  const themeApp=document.getElementById('app');
  function syncDocumentTheme(){
    if(!themeApp) return;
    const theme=themeApp.dataset.theme==='light'?'light':'dark';
    document.documentElement.dataset.theme=theme;
    document.body.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
  }
  syncDocumentTheme();
  if(themeApp){
    new MutationObserver(syncDocumentTheme).observe(themeApp,{attributes:true,attributeFilter:['data-theme']});
  }

  /* Explicit final light/dark surfaces so the switch always produces a visible change. */
  if(!document.getElementById('theme-final-fix')){
    const themeStyle=document.createElement('style');
    themeStyle.id='theme-final-fix';
    themeStyle.textContent=`
      html[data-theme="light"],
      html[data-theme="light"] body{
        background:#F7FAFF!important;
        color:#111827!important;
      }
      html[data-theme="light"] #app{
        --paper:#F7FAFF!important;
        --paper-2:#ECF3FF!important;
        --surface:#FFFFFF!important;
        --surface-strong:#F8FBFF!important;
        --ink:#111827!important;
        --ink-soft:#4B5563!important;
        --line:rgba(77,91,255,.20)!important;
        --line-strong:rgba(176,38,255,.26)!important;
        --ui-bg:#F7FAFF!important;
        --ui-panel:#FFFFFF!important;
        --ui-surface:#FFFFFF!important;
        --ui-surface-muted:#EEF4FF!important;
        --ui-ink:#111827!important;
        --ui-muted:#4B5563!important;
        --ui-line:rgba(77,91,255,.20)!important;
        --ui-line-strong:rgba(176,38,255,.26)!important;
        background:#F7FAFF!important;
        color:#111827!important;
      }
      html[data-theme="light"] #app .topbar,
      html[data-theme="light"] #app .side-pane,
      html[data-theme="light"] #app .tabs,
      html[data-theme="light"] #app .metric,
      html[data-theme="light"] #app .stop-card,
      html[data-theme="light"] #app .transport-card,
      html[data-theme="light"] #app .app-card,
      html[data-theme="light"] #app .icon-btn,
      html[data-theme="light"] #app .mini-link,
      html[data-theme="light"] #app .transport-links a,
      html[data-theme="light"] #app .itinerary-ticket-links a,
      html[data-theme="light"] #app select,
      html[data-theme="light"] #app input[type="number"]{
        background:#FFFFFF!important;
        color:#111827!important;
        border-color:rgba(77,91,255,.20)!important;
      }
      html[data-theme="light"] #app .side-pane{background:#FFFFFF!important;}
      html[data-theme="light"] #app .tab-btn{color:#596274!important;}
      html[data-theme="light"] #app .tab-btn.active{color:#111827!important;}
      html[data-theme="light"] #app .status-card,
      html[data-theme="light"] #app .map-legend{
        background:rgba(255,255,255,.96)!important;
        color:#111827!important;
        border-color:rgba(77,91,255,.20)!important;
      }
      html[data-theme="light"] #app .status-card span{color:#4B5563!important;}
      html[data-theme="light"] #app .leaflet-popup-content-wrapper,
      html[data-theme="light"] #app .leaflet-popup-tip,
      html[data-theme="light"] #app .leaflet-control-zoom a{
        background:#FFFFFF!important;
        color:#111827!important;
      }
      html[data-theme="light"] #app .leaflet-tile-pane{
        filter:saturate(1.05) contrast(1.02) brightness(1.02)!important;
      }

      html[data-theme="dark"],
      html[data-theme="dark"] body{
        background:#070A12!important;
        color:#F7FAFF!important;
      }
      html[data-theme="dark"] #app{
        --paper:#070A12!important;
        --paper-2:#0D1220!important;
        --surface:#101623!important;
        --surface-strong:#151C2B!important;
        --ink:#F7FAFF!important;
        --ink-soft:#B9C5D8!important;
        --line:rgba(0,255,209,.22)!important;
        --line-strong:rgba(217,0,255,.38)!important;
        --ui-bg:#070A12!important;
        --ui-panel:#0D1220!important;
        --ui-surface:#101623!important;
        --ui-surface-muted:#182136!important;
        --ui-ink:#F7FAFF!important;
        --ui-muted:#B9C5D8!important;
        --ui-line:rgba(0,255,209,.22)!important;
        --ui-line-strong:rgba(217,0,255,.38)!important;
        background:#070A12!important;
        color:#F7FAFF!important;
      }
      html[data-theme="dark"] #app .topbar{background:rgba(7,10,18,.94)!important;}
      html[data-theme="dark"] #app .side-pane{background:linear-gradient(180deg,#0D1220,#090D17)!important;}
      html[data-theme="dark"] #app .tabs{background:#0D1220!important;}
      html[data-theme="dark"] #app .status-card,
      html[data-theme="dark"] #app .map-legend{background:rgba(7,10,18,.94)!important;color:#F7FAFF!important;}
      html[data-theme="dark"] #app .leaflet-tile-pane{filter:saturate(1.24) contrast(1.08) brightness(.78)!important;}
    `;
    document.head.appendChild(themeStyle);
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