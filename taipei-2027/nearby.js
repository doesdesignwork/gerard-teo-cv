const poiImageCache = new Map();

function getSearchOrigin() {
  const mode=document.getElementById('originSelect').value;
  if (mode==='current') {
    if (!state.currentLocation) throw new Error('Start live location first, or choose “Selected map point” or “Roaders Plus Hotel”.');
    return state.currentLocation;
  }
  if (mode==='hotel') return hotel;
  return state.selectedPoint;
}

function overpassFilter(category) {
  if (category==='food') return '[amenity~"restaurant|cafe|fast_food|food_court|bar|pub|ice_cream|marketplace"]';
  if (category==='shopping') return '[shop]';
  return '[tourism~"attraction|museum|gallery|viewpoint|artwork|information"]';
}

function poiCategoryLabel(tags) {
  return tags.cuisine || tags.shop || tags.tourism || tags.amenity || 'Place';
}

function commonsFileUrl(fileName, width=420) {
  if (!fileName) return null;
  const clean=fileName.replace(/^File:/i,'');
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(clean)}?width=${width}`;
}

async function wikidataImage(qid) {
  if (!qid) return null;
  try {
    const r=await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(qid)}.json`);
    if (!r.ok) return null;
    const d=await r.json();
    const file=d?.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    return file?commonsFileUrl(file):null;
  } catch { return null; }
}

async function wikipediaImage(tags) {
  if (tags.image && /^https?:\/\//.test(tags.image)) return tags.image;
  if (tags.wikimedia_commons && /^File:/i.test(tags.wikimedia_commons)) return commonsFileUrl(tags.wikimedia_commons);
  if (tags.wikidata) {
    const wd=await wikidataImage(tags.wikidata);
    if (wd) return wd;
  }
  if (!tags.wikipedia) return null;
  try {
    const split=tags.wikipedia.split(':');
    const lang=split.length>1?split.shift():'en';
    const title=split.join(':');
    const r=await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!r.ok) return null;
    const d=await r.json();
    return d?.thumbnail?.source||null;
  } catch { return null; }
}

async function commonsSearchImage(name) {
  if (!name) return null;
  try {
    const query=new URLSearchParams({
      action:'query',format:'json',origin:'*',generator:'search',
      gsrsearch:`${name} Taipei`,gsrnamespace:'6',gsrlimit:'1',
      prop:'imageinfo',iiprop:'url',iiurlwidth:'420'
    });
    const r=await fetch(`https://commons.wikimedia.org/w/api.php?${query.toString()}`);
    if (!r.ok) return null;
    const d=await r.json();
    const pages=Object.values(d?.query?.pages||{});
    const info=pages[0]?.imageinfo?.[0];
    return info?.thumburl||info?.url||null;
  } catch { return null; }
}

async function resolvePoiImage(poi) {
  const key=`${poi.type}-${poi.id}`;
  if (poiImageCache.has(key)) return poiImageCache.get(key);
  const direct=await wikipediaImage(poi.tags);
  if (direct) { poiImageCache.set(key,direct); return direct; }
  const name=poi.tags['name:en']||poi.tags.name;
  const searched=await commonsSearchImage(name);
  poiImageCache.set(key,searched||null);
  return searched||null;
}

function safeUrl(url) {
  if (!url) return null;
  const value=url.startsWith('http')?url:`https://${url}`;
  try { const u=new URL(value); return ['http:','https:'].includes(u.protocol)?u.href:null; } catch { return null; }
}

function renderPoiCard(poi) {
  const icon=state.selectedCategory==='food'?'食':state.selectedCategory==='shopping'?'買':'景';
  const website=safeUrl(poi.tags.website||poi.tags['contact:website']);
  const reservation=safeUrl(poi.tags.reservation||poi.tags.booking||poi.tags['contact:booking']);
  const maps=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.lat},${poi.lon}`)}`;
  const directions=`https://www.google.com/maps/dir/?api=1${state.currentLocation?`&origin=${state.currentLocation.lat},${state.currentLocation.lng}`:''}&destination=${poi.lat},${poi.lon}`;
  const address=[poi.tags['addr:housenumber'],poi.tags['addr:street'],poi.tags['addr:district']].filter(Boolean).join(' ');
  return `<article class="poi-card" data-poi-id="${poi.type}-${poi.id}">
    <div class="poi-media" data-media><div class="poi-photo-state"><div><strong>${icon}</strong>Finding photo…</div></div></div>
    <div class="poi-copy">
      <h3>${poi.tags.name||poi.tags['name:en']||'Unnamed place'}</h3>
      <p>${address||poi.tags.opening_hours||'OpenStreetMap place information'}</p>
      <div class="poi-tags"><span class="tag">${Math.round(poi.distance)} m</span><span class="tag">${poiCategoryLabel(poi.tags)}</span>${poi.tags.opening_hours?`<span class="tag">${poi.tags.opening_hours}</span>`:''}</div>
      <div class="link-row">
        ${website?`<a class="mini-link" href="${website}" target="_blank" rel="noopener">Official site</a>`:''}
        ${reservation?`<a class="mini-link" href="${reservation}" target="_blank" rel="noopener">Reserve / book</a>`:''}
        <a class="mini-link" href="${maps}" target="_blank" rel="noopener">Maps</a>
        <a class="mini-link" href="${directions}" target="_blank" rel="noopener">Directions</a>
      </div>
    </div>
  </article>`;
}

async function hydratePoiImage(poi,grid) {
  const card=grid.querySelector(`[data-poi-id="${poi.type}-${poi.id}"] [data-media]`);
  if (!card) return;
  const image=await resolvePoiImage(poi);
  if (!card.isConnected) return;
  if (image) {
    const alt=poi.tags.name||poi.tags['name:en']||'Nearby place';
    card.innerHTML=`<img src="${image}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" /><span class="poi-photo-credit">Wikimedia</span>`;
    const img=card.querySelector('img');
    img.addEventListener('error',()=>{card.innerHTML='<div class="poi-photo-state"><div><strong>⌖</strong>Photo unavailable</div></div>';},{once:true});
  } else {
    card.innerHTML='<div class="poi-photo-state"><div><strong>⌖</strong>No free photo found</div></div>';
  }
}

async function searchNearby() {
  const status=document.getElementById('nearbyStatus');
  const grid=document.getElementById('poiGrid');
  let origin;
  try { origin=getSearchOrigin(); } catch(e) { status.textContent=e.message; grid.innerHTML=''; return; }
  const radius=Number(document.getElementById('radiusSelect').value);
  const key=`${state.selectedCategory}-${Math.round(origin.lat*1000)}-${Math.round(origin.lng*1000)}-${radius}`;
  status.textContent='Searching free OpenStreetMap data…';
  grid.innerHTML='<div class="empty"><div class="loader"></div>Finding nearby places</div>';
  try {
    let data=state.poiCache.get(key);
    if (!data) {
      const filter=overpassFilter(state.selectedCategory);
      const query=`[out:json][timeout:20];(node(around:${radius},${origin.lat},${origin.lng})${filter};way(around:${radius},${origin.lat},${origin.lng})${filter};relation(around:${radius},${origin.lat},${origin.lng})${filter};);out center tags 40;`;
      const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
      if (!response.ok) throw new Error('The community map service is temporarily busy. Try again shortly.');
      const raw=await response.json();
      data=raw.elements.map(el => ({...el,lat:el.lat??el.center?.lat,lon:el.lon??el.center?.lon,tags:el.tags||{}}))
        .filter(p=>p.lat&&p.lon&&p.tags.name)
        .map(p=>({...p,distance:distanceMetres(origin,{lat:p.lat,lng:p.lon})}))
        .sort((a,b)=>a.distance-b.distance)
        .slice(0,18);
      state.poiCache.set(key,data);
    }
    if (!data.length) {
      grid.innerHTML='<div class="empty">No named places were returned for this category. Try a larger radius or another map point.</div>';
      status.textContent='No results in the community map data.';
      return;
    }
    grid.innerHTML=data.map(renderPoiCard).join('');
    status.textContent=`Showing ${data.length} places, nearest first. Free photos are sourced from Wikimedia when available.`;
    const queue=[...data];
    const workers=Array.from({length:3},async()=>{while(queue.length){const poi=queue.shift();await hydratePoiImage(poi,grid);}});
    await Promise.all(workers);
  } catch(e) {
    status.textContent=e.message;
    grid.innerHTML='<div class="empty">Nearby live data is unavailable right now. The itinerary tab still contains curated stops and working official or Maps links.</div>';
  }
}
document.getElementById('searchNearbyBtn').addEventListener('click',searchNearby);
