(function () {
  const app = document.getElementById('app');
  const themeBtn = document.getElementById('themeBtn');
  const tabs = document.querySelector('.tabs');
  const picker = document.getElementById('mapDayPicker');

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

  const nearbyBtn = document.getElementById('searchNearbyBtn');
  const OVERPASS_ENDPOINTS = [
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.nchc.org.tw/api/interpreter'
  ];
  const NEARBY_CACHE_PREFIX = 'taipei-nearby-v2:';

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
          tourism:category==='interest'?'attraction':undefined,
          website:stop.official||undefined,
          'addr:district':'Curated itinerary stop'
        }
      });
    }));
    pool.sort((a,b)=>a.distance-b.distance);
    const nearby = pool.filter(p=>p.distance<=Math.max(radius,1500));
    return (nearby.length ? nearby : pool).slice(0,8);
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

  async function resilientSearchNearby() {
    const status=document.getElementById('nearbyStatus');
    const grid=document.getElementById('poiGrid');
    let origin;
    try { origin=getSearchOrigin(); }
    catch(e) { status.textContent=e.message; grid.innerHTML=''; return; }

    const radius=Number(document.getElementById('radiusSelect').value);
    const key=`${state.selectedCategory}-${Math.round(origin.lat*1000)}-${Math.round(origin.lng*1000)}-${radius}`;
    status.textContent='Searching nearby places…';
    grid.innerHTML='<div class="empty"><div class="loader"></div>Finding nearby places</div>';

    let data=state.poiCache.get(key);
    let source='live';

    if (!data) {
      const filter=overpassFilter(state.selectedCategory);
      const query=`[out:json][timeout:18];(node(around:${radius},${origin.lat},${origin.lng})${filter};way(around:${radius},${origin.lat},${origin.lng})${filter};relation(around:${radius},${origin.lat},${origin.lng})${filter};);out center tags 40;`;
      try {
        const raw=await fetchOverpass(query,status);
        data=raw.elements
          .map(el=>({...el,lat:el.lat??el.center?.lat,lon:el.lon??el.center?.lon,tags:el.tags||{}}))
          .filter(p=>p.lat&&p.lon&&p.tags.name)
          .map(p=>({...p,distance:distanceMetres(origin,{lat:p.lat,lng:p.lon})}))
          .sort((a,b)=>a.distance-b.distance)
          .slice(0,18);
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

    grid.innerHTML=data.map(renderPoiCard).join('');
    status.textContent = source==='live'
      ? `Showing ${data.length} nearby places, nearest first.`
      : source==='saved'
        ? `Live map service is busy. Showing ${data.length} recently saved nearby places.`
        : `Live map services are temporarily unavailable. Showing ${data.length} nearest curated trip places instead.`;

    hydrateImagesSafely(data,grid);
  }

  nearbyBtn?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    resilientSearchNearby();
  }, true);

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
