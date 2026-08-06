const state = {
  selectedDay: 1,
  selectedCategory: 'food',
  selectedPoint: hotel,
  currentLocation: null,
  currentAccuracy: null,
  watchId: null,
  follow: false,
  userMarker: null,
  accuracyCircle: null,
  selectMarker: null,
  routeLayers: [],
  markerLayers: [],
  poiCache: new Map()
};

const appEl = document.getElementById('app');
const savedTheme = localStorage.getItem('taipei-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
appEl.dataset.theme = savedTheme;
document.getElementById('themeBtn').textContent = savedTheme === 'dark' ? '☀' : '☾';

const map = L.map('map', { zoomControl:true, preferCanvas:true }).setView([25.055,121.535], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom:19,
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
}).addTo(map);

function markerIcon(day, number) {
  const colour = dayColours[day];
  return L.divIcon({
    className:'',
    html:`<div class="marker-pin" style="background:${colour}"><span>${number}</span></div>`,
    iconSize:[34,34], iconAnchor:[17,32], popupAnchor:[0,-28]
  });
}

function userIcon() {
  return L.divIcon({ className:'', html:'<div class="user-dot"></div>', iconSize:[18,18], iconAnchor:[9,9] });
}

function mapsDirections(stop) {
  const origin = state.currentLocation ? `&origin=${state.currentLocation.lat},${state.currentLocation.lng}` : '';
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${stop.lat},${stop.lng}`;
}

function clearMapRoutes() {
  [...state.routeLayers, ...state.markerLayers].forEach(layer => map.removeLayer(layer));
  state.routeLayers = [];
  state.markerLayers = [];
}

function drawRoutes(fit=false) {
  clearMapRoutes();
  const days = state.selectedDay === 0 ? tripDays : tripDays.filter(d => d.day === state.selectedDay);
  const allPoints = [];
  days.forEach(day => {
    const latlngs = day.stops.map(s => [s.lat,s.lng]);
    allPoints.push(...latlngs);
    const line = L.polyline(latlngs, {color:dayColours[day.day],weight:5,opacity:.75,dashArray:day.day===3?'10 8':null,lineJoin:'round'}).addTo(map);
    state.routeLayers.push(line);
    day.stops.forEach((stop,index) => {
      const marker = L.marker([stop.lat,stop.lng], {icon:markerIcon(day.day,index+1)}).addTo(map);
      marker.bindPopup(`<div class="popup-title">${index+1}. ${stop.name}</div><div class="popup-meta">${day.label} · ${stop.time} · ${stop.duration}</div><a class="mini-link" href="${mapsDirections(stop)}" target="_blank" rel="noopener">Directions</a>`);
      marker.on('click', () => {
        state.selectedPoint = {lat:stop.lat,lng:stop.lng};
        updateSelectedPointMarker(false);
      });
      state.markerLayers.push(marker);
    });
  });
  if (fit && allPoints.length) map.fitBounds(allPoints,{padding:[38,38]});
}

function buildDayPicker() {
  const picker = document.getElementById('mapDayPicker');
  const options = [{day:0,label:'All'}].concat(tripDays.map(d => ({day:d.day,label:`D${d.day}`})));
  picker.innerHTML = options.map(o => `<button type="button" class="seg-btn ${state.selectedDay===o.day?'active':''}" data-day="${o.day}">${o.label}</button>`).join('');
  picker.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => selectDay(Number(btn.dataset.day))));
}

function selectDay(day) {
  state.selectedDay = day;
  buildDayPicker();
  drawRoutes(true);
  renderItinerary();
}

function renderItinerary() {
  const title = document.getElementById('itineraryTitle');
  const sub = document.getElementById('itinerarySubtitle');
  const summary = document.getElementById('tripSummary');
  const timeline = document.getElementById('timeline');
  if (state.selectedDay === 0) {
    title.textContent = 'Full journey';
    sub.textContent = 'All four days, 20–24 August 2027';
    const totalStops = tripDays.reduce((n,d)=>n+d.stops.length,0);
    summary.innerHTML = `<div class="metric"><span>Days</span><strong>4</strong></div><div class="metric"><span>Stops</span><strong>${totalStops}</strong></div><div class="metric"><span>Base</span><strong>Taipei Main</strong></div>`;
  } else {
    const day = tripDays.find(d=>d.day===state.selectedDay);
    title.textContent = `Day ${day.day} · ${day.label}`;
    sub.textContent = day.title;
    summary.innerHTML = `<div class="metric"><span>Transport</span><strong>${day.transport}</strong></div><div class="metric"><span>Pace</span><strong>${day.distance}</strong></div><div class="metric"><span>Stops</span><strong>${day.stops.length}</strong></div>`;
  }
  const selectedDays = state.selectedDay===0 ? tripDays : tripDays.filter(d=>d.day===state.selectedDay);
  const visited = JSON.parse(localStorage.getItem('taipei-visited') || '{}');
  timeline.innerHTML = selectedDays.map(day => day.stops.map((stop,index) => {
    const key = `${day.day}-${index}`;
    const checked = visited[key] ? 'checked' : '';
    const links = [
      stop.official ? `<a class="mini-link" href="${stop.official}" target="_blank" rel="noopener">Official site</a>` : '',
      stop.tickets ? `<a class="mini-link" href="${stop.tickets}" target="_blank" rel="noopener">Tickets</a>` : '',
      `<a class="mini-link" href="${stop.maps}" target="_blank" rel="noopener">Open in Maps</a>`,
      `<a class="mini-link" href="${mapsDirections(stop)}" target="_blank" rel="noopener">Directions</a>`
    ].join('');
    return `<article class="stop-card ${checked?'visited':''}" style="--day-color:${dayColours[day.day]}">
      <div class="stop-main">
        <div class="stop-number">${index+1}</div>
        <div><h3 class="stop-title">${stop.name}</h3><div class="stop-meta">${stop.time} · ${stop.duration} · ${stop.type}</div></div>
        <input class="visit-check" type="checkbox" ${checked} aria-label="Mark ${stop.name} as visited" data-key="${key}" />
      </div>
      <details class="stop-details"><summary>Details and links</summary><div class="stop-body"><p>${stop.notes}</p><div class="link-row">${links}</div></div></details>
    </article>`;
  }).join('')).join('');
  timeline.querySelectorAll('.visit-check').forEach(box => box.addEventListener('change', e => {
    const v = JSON.parse(localStorage.getItem('taipei-visited') || '{}');
    v[e.target.dataset.key] = e.target.checked;
    localStorage.setItem('taipei-visited',JSON.stringify(v));
    e.target.closest('.stop-card').classList.toggle('visited',e.target.checked);
  }));
}

function updateSelectedPointMarker(pan=true) {
  if (state.selectMarker) map.removeLayer(state.selectMarker);
  state.selectMarker = L.circleMarker([state.selectedPoint.lat,state.selectedPoint.lng], {radius:8,color:'#111',weight:3,fillColor:'#ffd166',fillOpacity:1}).addTo(map).bindTooltip('Explore from here');
  if (pan) map.panTo([state.selectedPoint.lat,state.selectedPoint.lng]);
}

map.on('click', e => {
  state.selectedPoint = {lat:e.latlng.lat,lng:e.latlng.lng};
  updateSelectedPointMarker(false);
  document.getElementById('originSelect').value = 'map';
  activateTab('nearby');
  document.getElementById('nearbyStatus').textContent = 'Map point selected. Press “Find places nearby”.';
});

function distanceMetres(a,b) {
  const R=6371000, toRad=x=>x*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lng-a.lng);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

function nearestPlannedStop(loc) {
  let best=null;
  tripDays.forEach(day => day.stops.forEach((stop,index) => {
    const d=distanceMetres(loc,stop);
    if (!best || d<best.distance) best={day:day.day,index,stop,distance:d};
  }));
  return best;
}

function updateLocationUI() {
  const head=document.getElementById('locationHeadline');
  const detail=document.getElementById('locationDetail');
  if (!state.currentLocation) return;
  const near=nearestPlannedStop(state.currentLocation);
  const dist=near.distance<1000?`${Math.round(near.distance)} m`:`${(near.distance/1000).toFixed(1)} km`;
  head.textContent=`Nearest stop: ${near.stop.name}`;
  detail.textContent=`${dist} away · GPS accuracy about ${Math.round(state.currentAccuracy||0)} m · location stays in this browser`;
}

function startTracking() {
  if (!navigator.geolocation) {
    document.getElementById('locationHeadline').textContent='Location is not supported on this device';
    return;
  }
  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(state.watchId);
    state.watchId=null;
    state.follow=false;
    document.getElementById('locateBtn').classList.remove('active');
    document.getElementById('followBtn').classList.remove('active');
    document.getElementById('followBtn').disabled=true;
    document.getElementById('locationHeadline').textContent='Location tracking is off';
    document.getElementById('locationDetail').textContent='Tap ◎ to start again.';
    return;
  }
  document.getElementById('locationHeadline').textContent='Requesting your location…';
  state.watchId=navigator.geolocation.watchPosition(pos => {
    state.currentLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};
    state.currentAccuracy=pos.coords.accuracy;
    if (!state.userMarker) state.userMarker=L.marker([state.currentLocation.lat,state.currentLocation.lng],{icon:userIcon(),zIndexOffset:1000}).addTo(map).bindTooltip('You are here');
    else state.userMarker.setLatLng([state.currentLocation.lat,state.currentLocation.lng]);
    if (!state.accuracyCircle) state.accuracyCircle=L.circle([state.currentLocation.lat,state.currentLocation.lng],{radius:state.currentAccuracy,color:'#1687ff',weight:1,fillOpacity:.08}).addTo(map);
    else state.accuracyCircle.setLatLng([state.currentLocation.lat,state.currentLocation.lng]).setRadius(state.currentAccuracy);
    if (state.follow) map.setView([state.currentLocation.lat,state.currentLocation.lng],Math.max(map.getZoom(),16));
    document.getElementById('locateBtn').classList.add('active');
    document.getElementById('followBtn').disabled=false;
    updateLocationUI();
  }, err => {
    document.getElementById('locationHeadline').textContent='Location permission was not available';
    document.getElementById('locationDetail').textContent=err.message || 'Use a selected map point or the hotel instead.';
    state.watchId=null;
  }, {enableHighAccuracy:true,maximumAge:5000,timeout:15000});
}

document.getElementById('locateBtn').addEventListener('click',startTracking);
document.getElementById('followBtn').addEventListener('click',() => {
  state.follow=!state.follow;
  document.getElementById('followBtn').classList.toggle('active',state.follow);
  if (state.follow && state.currentLocation) map.setView([state.currentLocation.lat,state.currentLocation.lng],16);
});
document.getElementById('fitRouteBtn').addEventListener('click',()=>drawRoutes(true));

function activateTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===`tab-${name}`));
  if (name==='itinerary') setTimeout(()=>map.invalidateSize(),50);
}
document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>activateTab(btn.dataset.tab)));

document.getElementById('themeBtn').addEventListener('click',() => {
  const next=appEl.dataset.theme==='dark'?'light':'dark';
  appEl.dataset.theme=next;
  localStorage.setItem('taipei-theme',next);
  document.getElementById('themeBtn').textContent=next==='dark'?'☀':'☾';
});

document.querySelectorAll('.chip').forEach(chip=>chip.addEventListener('click',() => {
  state.selectedCategory=chip.dataset.category;
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c===chip));
}));
