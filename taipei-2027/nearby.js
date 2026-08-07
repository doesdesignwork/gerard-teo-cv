const poiImageCache = new Map();
const categoryImageCache = new Map();

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

function commonsFileUrl(fileName, width=520) {
  if (!fileName) return null;
  const clean=fileName.replace(/^File:/i,'');
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(clean)}?width=${width}`;
}

function imageCandidate(url,credit='Wikimedia',sourceUrl=null,attribution='',illustrative=false) {
  return url ? {url,credit,sourceUrl,attribution,illustrative} : null;
}

function dedupeCandidates(items) {
  const seen=new Set();
  return items.filter(item=>{
    if (!item?.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

async function wikidataCandidates(qid) {
  if (!qid) return [];
  try {
    const r=await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(qid)}.json`);
    if (!r.ok) return [];
    const d=await r.json();
    const entity=d?.entities?.[qid];
    const file=entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    const category=entity?.claims?.P373?.[0]?.mainsnak?.datavalue?.value;
    const out=[];
    if (file) out.push(imageCandidate(commonsFileUrl(file),'Wikimedia Commons'));
    if (category) {
      const found=await commonsSearchImage(`incategory:${category}`,true);
      if (found) out.push(found);
    }
    return out;
  } catch { return []; }
}

async function taggedImageCandidates(tags) {
  const out=[];
  if (tags.image && /^https?:\/\//.test(tags.image)) out.push(imageCandidate(tags.image,'OpenStreetMap image'));
  if (tags.wikimedia_commons && /^File:/i.test(tags.wikimedia_commons)) out.push(imageCandidate(commonsFileUrl(tags.wikimedia_commons),'Wikimedia Commons'));
  if (tags.wikimedia_commons && /^Category:/i.test(tags.wikimedia_commons)) {
    const found=await commonsSearchImage(`incategory:${tags.wikimedia_commons.replace(/^Category:/i,'')}`,true);
    if (found) out.push(found);
  }
  if (tags.wikidata) out.push(...await wikidataCandidates(tags.wikidata));
  if (tags.wikipedia) {
    try {
      const split=tags.wikipedia.split(':');
      const lang=split.length>1?split.shift():'en';
      const title=split.join(':');
      const r=await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (r.ok) {
        const d=await r.json();
        if (d?.thumbnail?.source) out.push(imageCandidate(d.thumbnail.source,`${lang.toUpperCase()} Wikipedia`,d.content_urls?.desktop?.page||null));
      }
    } catch {}
  }
  return out;
}

async function wikipediaSearchImage(name,lang='zh') {
  if (!name) return null;
  try {
    const query=new URLSearchParams({
      action:'query',format:'json',origin:'*',generator:'search',
      gsrsearch:`${name} 台北`,gsrnamespace:'0',gsrlimit:'3',
      prop:'pageimages|info',piprop:'thumbnail',pithumbsize:'520',inprop:'url'
    });
    const r=await fetch(`https://${lang}.wikipedia.org/w/api.php?${query.toString()}`);
    if (!r.ok) return null;
    const d=await r.json();
    const pages=Object.values(d?.query?.pages||{});
    const page=pages.find(p=>p?.thumbnail?.source);
    return page?.thumbnail?.source ? imageCandidate(page.thumbnail.source,`${lang.toUpperCase()} Wikipedia`,page.fullurl||null) : null;
  } catch { return null; }
}

async function commonsSearchImage(search,raw=false) {
  if (!search) return null;
  try {
    const query=new URLSearchParams({
      action:'query',format:'json',origin:'*',generator:'search',
      gsrsearch:raw?search:`${search} Taipei`,gsrnamespace:'6',gsrlimit:'4',
      prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'520'
    });
    const r=await fetch(`https://commons.wikimedia.org/w/api.php?${query.toString()}`);
    if (!r.ok) return null;
    const d=await r.json();
    const pages=Object.values(d?.query?.pages||{});
    const page=pages.find(p=>p?.imageinfo?.[0]);
    const info=page?.imageinfo?.[0];
    if (!info) return null;
    const attribution=info.extmetadata?.Artist?.value?.replace(/<[^>]*>/g,'')||'';
    return imageCandidate(info.thumburl||info.url,'Wikimedia Commons',info.descriptionurl||null,attribution);
  } catch { return null; }
}

async function openverseSearchImage(queryText,illustrative=false) {
  if (!queryText) return null;
  try {
    const params=new URLSearchParams({q:queryText,page_size:'8',mature:'false'});
    const r=await fetch(`https://api.openverse.org/v1/images/?${params.toString()}`);
    if (!r.ok) return null;
    const d=await r.json();
    const result=(d?.results||[]).find(item=>item?.thumbnail||item?.url);
    if (!result) return null;
    const source=(result.source||result.provider||'Openverse').replace(/_/g,' ');
    const credit=`Openverse · ${source}`;
    return imageCandidate(result.thumbnail||result.url,credit,result.foreign_landing_url||result.detail_url||null,result.attribution||'',illustrative);
  } catch { return null; }
}

function broadImageQuery(poi) {
  const t=poi.tags||{};
  if (state.selectedCategory==='food') {
    if (t.amenity==='cafe') return 'Taipei Taiwan cafe coffee shop';
    if (t.amenity==='ice_cream') return 'Taipei Taiwan dessert ice cream';
    const cuisine=(t.cuisine||'Taiwanese').replace(/[_;]/g,' ');
    return `Taipei Taiwan ${cuisine} restaurant food`;
  }
  if (state.selectedCategory==='shopping') {
    const shop=(t.shop||'shopping').replace(/[_;]/g,' ');
    return `Taipei Taiwan ${shop} shop shopping`;
  }
  const kind=(t.tourism||'landmark').replace(/[_;]/g,' ');
  return `Taipei Taiwan ${kind} attraction landmark`;
}

function visualFallbackDataUri(poi) {
  const label=state.selectedCategory==='food'?'TAIPEI FOOD':state.selectedCategory==='shopping'?'TAIPEI SHOPPING':'TAIPEI PLACE';
  const icon=state.selectedCategory==='food'?'食':state.selectedCategory==='shopping'?'買':'景';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" fill="#1b211f"/><circle cx="535" cy="80" r="180" fill="#FF6700" opacity=".18"/><circle cx="90" cy="370" r="210" fill="#FF6700" opacity=".12"/><text x="48" y="180" font-size="92" font-family="sans-serif" fill="#FF6700">${icon}</text><text x="48" y="250" font-size="34" font-family="sans-serif" font-weight="700" fill="#fff">${label}</text><text x="48" y="292" font-size="20" font-family="sans-serif" fill="#c8cecb">Image preview unavailable</text></svg>`;
  return imageCandidate(`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,'Taipei Trip Companion',null,'',true);
}

async function categoryFallbackCandidates(poi) {
  const query=broadImageQuery(poi);
  if (!categoryImageCache.has(query)) {
    categoryImageCache.set(query,(async()=>{
      const out=[];
      const ov=await openverseSearchImage(query,true);
      if (ov) out.push(ov);
      const commons=await commonsSearchImage(query);
      if (commons) out.push({...commons,illustrative:true});
      return out;
    })());
  }
  return await categoryImageCache.get(query);
}

async function resolvePoiImages(poi) {
  const key=`${poi.type}-${poi.id}`;
  if (poiImageCache.has(key)) return poiImageCache.get(key);
  const promise=(async()=>{
    const out=[];
    out.push(...await taggedImageCandidates(poi.tags));

    const names=[poi.tags['name:en'],poi.tags.name,poi.tags['name:zh'],poi.tags.alt_name].filter(Boolean);
    for (const name of [...new Set(names)].slice(0,3)) {
      const commons=await commonsSearchImage(name);
      if (commons) out.push(commons);
      if (out.length<2) {
        const zh=await wikipediaSearchImage(name,'zh');
        if (zh) out.push(zh);
      }
      if (out.length<2) {
        const en=await wikipediaSearchImage(name,'en');
        if (en) out.push(en);
      }
      if (out.length<2) {
        const ov=await openverseSearchImage(`"${name}" Taipei Taiwan`,false);
        if (ov) out.push(ov);
      }
      if (out.length>=2) break;
    }

    out.push(...await categoryFallbackCandidates(poi));
    out.push(visualFallbackDataUri(poi));
    return dedupeCandidates(out);
  })();
  poiImageCache.set(key,promise);
  return promise;
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
  const candidates=await resolvePoiImages(poi);
  if (!card.isConnected) return;
  const alt=poi.tags.name||poi.tags['name:en']||'Nearby place';
  let index=0;

  function showCandidate() {
    const item=candidates[index++]||visualFallbackDataUri(poi);
    const badge=item.illustrative?'Illustrative · '+item.credit:item.credit;
    const credit=item.sourceUrl
      ? `<a class="poi-photo-credit" href="${item.sourceUrl}" target="_blank" rel="noopener" title="${(item.attribution||badge).replace(/"/g,'&quot;')}">${badge}</a>`
      : `<span class="poi-photo-credit" title="${(item.attribution||badge).replace(/"/g,'&quot;')}">${badge}</span>`;
    card.innerHTML=`<img src="${item.url}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" />${credit}`;
    const img=card.querySelector('img');
    img.addEventListener('error',showCandidate,{once:true});
  }

  showCandidate();
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
    status.textContent=`Showing ${data.length} places, nearest first. Images use OpenStreetMap links, Wikidata, Wikipedia, Wikimedia Commons and Openverse, with an illustrative fallback so cards never stay empty.`;
    const queue=[...data];
    const workers=Array.from({length:3},async()=>{while(queue.length){const poi=queue.shift();await hydratePoiImage(poi,grid);}});
    await Promise.all(workers);
  } catch(e) {
    status.textContent=e.message;
    grid.innerHTML='<div class="empty">Nearby live data is unavailable right now. The itinerary tab still contains curated stops and working official or Maps links.</div>';
  }
}
document.getElementById('searchNearbyBtn').addEventListener('click',searchNearby);
