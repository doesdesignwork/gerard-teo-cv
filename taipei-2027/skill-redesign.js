(function () {
  const app = document.getElementById('app');
  const themeBtn = document.getElementById('themeBtn');
  const tabs = document.querySelector('.tabs');
  const picker = document.getElementById('mapDayPicker');
  const nearbyBtn = document.getElementById('searchNearbyBtn');
  const poiGrid = document.getElementById('poiGrid');
  const mapPane = document.querySelector('.map-pane');
  let nearbyFocusMarker = null;

  function applyTheme(theme) {
    if (!app) return;
    const next = theme === 'light' ? 'light' : 'dark';
    app.dataset.theme = next;
    document.documentElement.dataset.theme = next;
    document.body.dataset.theme = next;
    localStorage.setItem('taipei-theme', next);
    syncThemeControl();
  }

  function syncThemeControl() {
    if (!themeBtn || !app) return;
    const dark = app.dataset.theme === 'dark';
    themeBtn.textContent = dark ? 'Light' : 'Dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  function syncTabs() {
    if (!tabs) return;
    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.classList.contains('active')) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
  }

  function syncDayButtons() {
    if (!picker) return;
    picker.querySelectorAll('.seg-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    });
  }

  if (app) applyTheme(app.dataset.theme || localStorage.getItem('taipei-theme') || 'dark');
  syncTabs();
  syncDayButtons();

  themeBtn?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    applyTheme(app.dataset.theme === 'dark' ? 'light' : 'dark');
  }, true);

  if (app) {
    new MutationObserver(() => {
      document.documentElement.dataset.theme = app.dataset.theme;
      document.body.dataset.theme = app.dataset.theme;
      syncThemeControl();
    }).observe(app, { attributes:true, attributeFilter:['data-theme'] });
  }

  if (tabs) {
    new MutationObserver(syncTabs).observe(tabs, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  if (picker) {
    new MutationObserver(syncDayButtons).observe(picker, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  const OVERPASS_ENDPOINTS = [
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.nchc.org.tw/api/interpreter'
  ];
  const NEARBY_CACHE_PREFIX = 'taipei-nearby-v3:';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeExternalUrl(value) {
    if (!value) return null;
    const candidate = String(value).startsWith('http') ? String(value) : `https://${value}`;
    try {
      const parsed = new URL(candidate);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
    } catch {
      return null;
    }
  }

  function categoryLabel(tags) {
    return tags.cuisine || tags.shop || tags.tourism || tags.amenity || 'Place';
  }

  function distanceScore(distance) {
    if (distance <= 150) return 3;
    if (distance <= 300) return 2.5;
    if (distance <= 500) return 2;
    if (distance <= 800) return 1.25;
    if (distance <= 1200) return .75;
    return 0;
  }

  function recommendationMeta(poi, category) {
    const tags = poi.tags || {};
    let score = 1 + distanceScore(Number(poi.distance || 99999));
    const reasons = [];

    const hasAddress = tags['addr:street'] || tags['addr:housenumber'] || tags['addr:full'];
    const website = tags.website || tags['contact:website'];
    const phone = tags.phone || tags['contact:phone'];
    const reservation = tags.reservation || tags.booking || tags['contact:booking'];
    const isNotable = tags.wikipedia || tags.wikidata;
    const awardSignal = Object.entries(tags).some(([key, value]) =>
      /michelin|award|guide/i.test(key) && String(value).toLowerCase() !== 'no'
    );

    if (website) { score += 2; reasons.push('official website'); }
    if (tags.opening_hours) { score += 1.5; reasons.push('hours listed'); }
    if (hasAddress) score += 1;
    if (phone) score += .5;
    if (isNotable) { score += 3.5; reasons.push('notable listing'); }
    if (awardSignal) { score += 6; reasons.push('guide or award signal'); }
    if (poi.type === 'curated') { score += 4; reasons.push('curated trip pick'); }

    if (category === 'food') {
      if (tags.cuisine) { score += 3; reasons.push('cuisine listed'); }
      if (tags.amenity === 'restaurant') score += 2;
      else if (tags.amenity === 'cafe') score += 1.75;
      else if (['bar','pub','food_court','ice_cream','marketplace'].includes(tags.amenity)) score += 1;
      else if (['bakery','deli','confectionery','coffee','tea'].includes(tags.shop)) score += 1.5;
      if (reservation) { score += 1; reasons.push('booking info'); }
      if (tags.takeaway || tags.delivery || tags.outdoor_seating) score += .5;
    } else if (category === 'shopping') {
      if (tags.shop) score += 2;
      if (tags.brand || tags.operator) score += .5;
    } else {
      if (tags.tourism) score += 2;
      if (tags.description || tags['description:en']) score += 1;
    }

    if (Number(poi.distance || 99999) <= 300) reasons.unshift('close by');

    return {
      score,
      reasons: [...new Set(reasons)].slice(0, 3),
      high: false
    };
  }

  function rankNearbyPlaces(data, category) {
    const ranked = (data || []).map(poi => ({
      ...poi,
      _recommendation: recommendationMeta(poi, category)
    })).sort((a, b) => {
      const scoreDifference = b._recommendation.score - a._recommendation.score;
      if (Math.abs(scoreDifference) > .01) return scoreDifference;
      return Number(a.distance || 99999) - Number(b.distance || 99999);
    }).slice(0, 18);

    const maxRecommended = category === 'food' ? 6 : 4;
    const threshold = category === 'food' ? 5 : 5.5;
    let marked = 0;

    ranked.forEach(poi => {
      if (marked < maxRecommended && poi._recommendation.score >= threshold) {
        poi._recommendation.high = true;
        marked += 1;
      }
    });

    return ranked;
  }

  function nearbyFilters(category) {
    if (category === 'food') {
      return [
        '[amenity~"restaurant|cafe|fast_food|food_court|bar|pub|ice_cream|marketplace|biergarten"]',
        '[shop~"bakery|deli|confectionery|coffee|tea"]'
      ];
    }
    if (category === 'shopping') return ['[shop]'];
    return ['[tourism~"attraction|museum|gallery|viewpoint|artwork|information"]'];
  }

  function buildNearbyQuery(category, radius, origin) {
    const clauses = [];
    nearbyFilters(category).forEach(filter => {
      ['node', 'way', 'relation'].forEach(kind => {
        clauses.push(`${kind}(around:${radius},${origin.lat},${origin.lng})${filter};`);
      });
    });
    return `[out:json][timeout:18];(${clauses.join('')});out center tags 80;`;
  }

  function dedupePlaces(items) {
    const seen = new Set();
    return items.filter(poi => {
      const key = `${poi.type}-${poi.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function fetchOverpassEndpoint(endpoint, query) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(endpoint, {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
        body:'data='+encodeURIComponent(query),
        signal:controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();
      if (!raw || !Array.isArray(raw.elements)) throw new Error('Invalid response');
      return raw;
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchOverpass(query, status) {
    let lastError = null;
    for (let i=0; i<OVERPASS_ENDPOINTS.length; i++) {
      try {
        if (status && i>0) status.textContent = `Map service busy. Trying backup ${i+1} of ${OVERPASS_ENDPOINTS.length}…`;
        return await fetchOverpassEndpoint(OVERPASS_ENDPOINTS[i], query);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('All map services unavailable');
  }

  function readNearbyCache(key) {
    try {
      const saved = JSON.parse(localStorage.getItem(NEARBY_CACHE_PREFIX+key) || 'null');
      if (!saved?.data?.length) return null;
      if (Date.now() - Number(saved.saved||0) > 30*24*60*60*1000) return null;
      return saved.data;
    } catch { return null; }
  }

  function writeNearbyCache(key, data) {
    try {
      localStorage.setItem(NEARBY_CACHE_PREFIX+key, JSON.stringify({saved:Date.now(),data}));
    } catch {}
  }

  function curatedNearbyFallback(origin, radius) {
    const category = state.selectedCategory;
    let pool = [];
    tripDays.forEach(day => day.stops.forEach((stop,index) => {
      const isFood = stop.type === 'Food';
      const isShopping = /Shopping|Design/i.test(stop.type);
      const isInterest = /Sight|Heritage|Nature|Viewpoint|Design|Ticket/i.test(stop.type);
      const matches = category==='food' ? isFood : category==='shopping' ? isShopping : isInterest;
      if (!matches) return;
      const distance = distanceMetres(origin,{lat:stop.lat,lng:stop.lng});
      pool.push({
        type:'curated', id:`${day.day}-${index}`, lat:stop.lat, lon:stop.lng, distance,
        tags:{
          name:stop.name,
          amenity:category==='food'?'restaurant':undefined,
          shop:category==='shopping'?'yes':undefined,
          tourism:category==='sights'?'attraction':undefined,
          website:stop.official||undefined,
          cuisine:category==='food'?'Taiwanese / local':undefined,
          'addr:district':'Curated itinerary stop'
        }
      });
    }));
    pool.sort((a,b)=>a.distance-b.distance);
    const nearby = pool.filter(p=>p.distance<=Math.max(radius,1500));
    return (nearby.length ? nearby : pool).slice(0,12);
  }

  async function hydrateImagesSafely(data, grid) {
    const queue=[...data];
    const workers=Array.from({length:3},async()=>{
      while(queue.length){
        const poi=queue.shift();
        try { await hydratePoiImage(poi,grid); } catch {
          const media=grid.querySelector(`[data-poi-id="${poi.type}-${poi.id}"] [data-media]`);
          if (media) {
            const fallback=visualFallbackDataUri(poi);
            media.innerHTML=`<img src="${fallback.url}" alt="Nearby place" loading="lazy" /><span class="poi-photo-credit">Illustrative</span>`;
          }
        }
      }
    });
    await Promise.allSettled(workers);
  }

  function renderEnhancedPoiCard(poi) {
    const tags = poi.tags || {};
    const icon = state.selectedCategory==='food'?'食':state.selectedCategory==='shopping'?'買':'景';
    const website = safeExternalUrl(tags.website || tags['contact:website']);
    const reservation = safeExternalUrl(tags.reservation || tags.booking || tags['contact:booking']);
    const name = tags.name || tags['name:en'] || 'Unnamed place';
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.lat},${poi.lon}`)}`;
    const directions = `https://www.google.com/maps/dir/?api=1${state.currentLocation?`&origin=${state.currentLocation.lat},${state.currentLocation.lng}`:''}&destination=${poi.lat},${poi.lon}`;
    const address = [tags['addr:housenumber'],tags['addr:street'],tags['addr:district']].filter(Boolean).join(' ');
    const rec = poi._recommendation || { high:false, reasons:[] };
    const reason = rec.reasons.length ? rec.reasons.join(' + ') : 'strong nearby match';
    const recommended = rec.high
      ? `<span class="recommend-badge" title="App-ranked from free map signals, not review scores: ${escapeHtml(reason)}">★ Highly recommended</span>`
      : '';

    return `<article class="poi-card${rec.high?' is-recommended':''}" data-poi-id="${escapeHtml(`${poi.type}-${poi.id}`)}">
      <div class="poi-media" data-media><div class="poi-photo-state"><div><strong>${icon}</strong>Finding photo…</div></div></div>
      <div class="poi-copy">
        <div class="poi-title-row"><h3>${escapeHtml(name)}</h3>${recommended}</div>
        <p>${escapeHtml(address||tags.opening_hours||'OpenStreetMap place information')}</p>
        <div class="poi-tags">
          <span class="tag">${Math.round(Number(poi.distance||0))} m</span>
          <span class="tag">${escapeHtml(categoryLabel(tags))}</span>
          ${tags.opening_hours?`<span class="tag">${escapeHtml(tags.opening_hours)}</span>`:''}
        </div>
        <div class="link-row">
          <button class="mini-link poi-map-btn" type="button" data-lat="${Number(poi.lat)}" data-lon="${Number(poi.lon)}" data-name="${escapeHtml(name)}">Pin on map</button>
          ${website?`<a class="mini-link" href="${escapeHtml(website)}" target="_blank" rel="noopener">Official site</a>`:''}
          ${reservation?`<a class="mini-link" href="${escapeHtml(reservation)}" target="_blank" rel="noopener">Reserve / book</a>`:''}
          <a class="mini-link" href="${maps}" target="_blank" rel="noopener">Maps</a>
          <a class="mini-link" href="${directions}" target="_blank" rel="noopener">Directions</a>
        </div>
      </div>
    </article>`;
  }

  function focusNearbyResult(button) {
    const lat = Number(button.dataset.lat);
    const lon = Number(button.dataset.lon);
    const name = button.dataset.name || 'Nearby place';
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    state.selectedPoint = { lat, lng:lon };

    if (nearbyFocusMarker) map.removeLayer(nearbyFocusMarker);

    const icon = L.divIcon({
      className:'nearby-result-pin-wrap',
      html:'<div class="nearby-result-pin" aria-hidden="true"><span></span></div>',
      iconSize:[32,38],
      iconAnchor:[16,36],
      popupAnchor:[0,-31]
    });

    nearbyFocusMarker = L.marker([lat,lon], { icon, zIndexOffset:1400 }).addTo(map);
    const directions = `https://www.google.com/maps/dir/?api=1${state.currentLocation?`&origin=${state.currentLocation.lat},${state.currentLocation.lng}`:''}&destination=${lat},${lon}`;
    nearbyFocusMarker.bindPopup(
      `<div class="popup-title">${escapeHtml(name)}</div><div class="popup-meta">Nearby search result</div><a class="mini-link" href="${directions}" target="_blank" rel="noopener">Directions</a>`
    );

    map.flyTo([lat,lon], Math.max(map.getZoom(),17), {animate:true,duration:.65});
    setTimeout(() => nearbyFocusMarker?.openPopup(), 520);

    poiGrid?.querySelectorAll('.poi-map-btn.is-pinned').forEach(item => {
      item.classList.remove('is-pinned');
      item.textContent = 'Pin on map';
    });
    button.classList.add('is-pinned');
    button.textContent = 'Pinned';

    const status = document.getElementById('nearbyStatus');
    if (status) status.textContent = `Pinned ${name} on the app map.`;

    if (window.matchMedia('(max-width:920px)').matches && mapPane) {
      mapPane.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  async function resilientSearchNearby() {
    const status=document.getElementById('nearbyStatus');
    const grid=document.getElementById('poiGrid');
    let origin;
    try { origin=getSearchOrigin(); }
    catch(e) { status.textContent=e.message; grid.innerHTML=''; return; }

    const radius=Number(document.getElementById('radiusSelect').value);
    const key=`${state.selectedCategory}-${Math.round(origin.lat*1000)}-${Math.round(origin.lng*1000)}-${radius}`;
    status.textContent='Searching nearby places and ranking strong local matches…';
    grid.innerHTML='<div class="empty"><div class="loader"></div>Finding nearby places</div>';

    let data=state.poiCache.get(key);
    let source='live';

    if (!data) {
      const query=buildNearbyQuery(state.selectedCategory,radius,origin);
      try {
        const raw=await fetchOverpass(query,status);
        data=dedupePlaces(raw.elements
          .map(el=>({...el,lat:el.lat??el.center?.lat,lon:el.lon??el.center?.lon,tags:el.tags||{}}))
          .filter(p=>p.lat&&p.lon&&p.tags.name)
          .map(p=>({...p,distance:distanceMetres(origin,{lat:p.lat,lng:p.lon})})));
        state.poiCache.set(key,data);
        if (data.length) writeNearbyCache(key,data);
      } catch {
        data=readNearbyCache(key);
        if (data?.length) source='saved';
        else {
          data=curatedNearbyFallback(origin,radius);
          source='curated';
        }
      }
    }

    if (!data?.length) {
      grid.innerHTML='<div class="empty">No places were found for this category. Try a larger radius or another map point.</div>';
      status.textContent='No nearby results found.';
      return;
    }

    data=rankNearbyPlaces(data,state.selectedCategory);
    state.poiCache.set(key,data);

    grid.innerHTML=data.map(renderEnhancedPoiCard).join('');

    const highlighted=data.filter(p=>p._recommendation?.high).length;
    const sourceText = source==='live'
      ? `Showing ${data.length} nearby places`
      : source==='saved'
        ? `Live map service is busy. Showing ${data.length} recently saved places`
        : `Live map services are temporarily unavailable. Showing ${data.length} curated trip places`;
    const rankingText = highlighted
      ? ` · ${highlighted} highlighted as Highly recommended`
      : '';
    const foodText = state.selectedCategory==='food'
      ? ' · includes mapped restaurants, cafés, markets, bakeries, tea and coffee shops'
      : '';
    status.textContent = `${sourceText}${rankingText}${foodText}. Recommended picks use distance, opening-hours, official/notability and place-detail signals from free map data, not paid review scores.`;

    hydrateImagesSafely(data,grid);
  }

  nearbyBtn?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    resilientSearchNearby();
  }, true);

  poiGrid?.addEventListener('click', event => {
    const button = event.target.closest('.poi-map-btn');
    if (!button) return;
    event.preventDefault();
    focusNearbyResult(button);
  });

  if (!document.querySelector('link[href="itinerary-customizer.css"]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'itinerary-customizer.css';
    document.head.appendChild(style);
  }
  if (!document.querySelector('script[src="itinerary-customizer.js"]')) {
    const customizer = document.createElement('script');
    customizer.src = 'itinerary-customizer.js';
    document.body.appendChild(customizer);
  }
})();