(function(){
  const grid=document.getElementById('poiGrid');
  const status=document.getElementById('nearbyStatus');
  const mapPane=document.querySelector('.map-pane');
  if(!grid||typeof L==='undefined'||typeof map==='undefined') return;

  let focusMarker=null;

  function coordsFromCard(card){
    const existing=card.querySelector('.poi-map-btn[data-lat][data-lon]');
    if(existing){
      const lat=Number(existing.dataset.lat),lon=Number(existing.dataset.lon);
      if(Number.isFinite(lat)&&Number.isFinite(lon)) return {lat,lon};
    }

    const links=[...card.querySelectorAll('a[href]')];
    for(const link of links){
      try{
        const url=new URL(link.href);
        const destination=url.searchParams.get('destination');
        const query=url.searchParams.get('query');
        const value=destination||query||'';
        const match=value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
        if(match){
          const lat=Number(match[1]),lon=Number(match[2]);
          if(Number.isFinite(lat)&&Number.isFinite(lon)) return {lat,lon};
        }
      }catch{}
    }
    return null;
  }

  function nameFromCard(card){
    return card.querySelector('h3')?.textContent?.trim()||'Nearby place';
  }

  function enhanceCards(){
    grid.querySelectorAll('.poi-card').forEach(card=>{
      if(card.querySelector('.poi-map-btn')) return;
      const coords=coordsFromCard(card);
      const row=card.querySelector('.link-row');
      if(!coords||!row) return;
      const button=document.createElement('button');
      button.type='button';
      button.className='mini-link poi-map-btn';
      button.textContent='Pin on map';
      button.dataset.lat=String(coords.lat);
      button.dataset.lon=String(coords.lon);
      button.dataset.name=nameFromCard(card);
      row.prepend(button);
    });
  }

  function pinResult(button){
    const lat=Number(button.dataset.lat),lon=Number(button.dataset.lon);
    const name=button.dataset.name||'Nearby place';
    if(!Number.isFinite(lat)||!Number.isFinite(lon)){
      if(status) status.textContent='Could not read this place location.';
      return;
    }

    if(typeof state!=='undefined') state.selectedPoint={lat,lng:lon};
    if(focusMarker) map.removeLayer(focusMarker);

    const icon=L.divIcon({
      className:'nearby-result-pin-wrap',
      html:'<div class="nearby-result-pin" aria-hidden="true"><span></span></div>',
      iconSize:[32,38],
      iconAnchor:[16,36],
      popupAnchor:[0,-31]
    });

    focusMarker=L.marker([lat,lon],{icon,zIndexOffset:1600}).addTo(map);
    const directions=`https://www.google.com/maps/dir/?api=1${typeof state!=='undefined'&&state.currentLocation?`&origin=${state.currentLocation.lat},${state.currentLocation.lng}`:''}&destination=${lat},${lon}`;
    const safeName=name.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    focusMarker.bindPopup(`<div class="popup-title">${safeName}</div><div class="popup-meta">Nearby search result</div><a class="mini-link" href="${directions}" target="_blank" rel="noopener">Directions</a>`);
    map.flyTo([lat,lon],Math.max(map.getZoom(),17),{animate:true,duration:.6});
    setTimeout(()=>focusMarker?.openPopup(),500);

    grid.querySelectorAll('.poi-map-btn.is-pinned').forEach(item=>{
      item.classList.remove('is-pinned');
      item.textContent='Pin on map';
    });
    button.classList.add('is-pinned');
    button.textContent='Pinned';
    if(status) status.textContent=`Pinned ${name} on the app map.`;

    if(window.matchMedia('(max-width:920px)').matches&&mapPane){
      mapPane.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  grid.addEventListener('click',event=>{
    const button=event.target.closest('.poi-map-btn');
    if(!button) return;
    event.preventDefault();
    event.stopPropagation();
    pinResult(button);
  });

  new MutationObserver(enhanceCards).observe(grid,{childList:true,subtree:true});
  enhanceCards();
})();
