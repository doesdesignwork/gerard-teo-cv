(function () {
  if (typeof tripDays === 'undefined' || typeof state === 'undefined') return;

  const STORAGE_KEY = 'taipei-itinerary-custom-v1';
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const allowedFields = ['name','time','duration','type','notes','lat','lng','official','tickets','maps'];
  const baseline = new Map();
  tripDays.forEach(day => day.stops.forEach((stop,index) => {
    baseline.set(`${day.day}-${index}`, allowedFields.reduce((copy,key) => {
      if (stop[key] !== undefined) copy[key] = stop[key];
      return copy;
    }, {}));
  }));

  function safeExternalUrl(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    try {
      const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
      return ['http:','https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function readCustomisations() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch { return {}; }
  }

  function writeCustomisations(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }

  function getStop(dayNumber,index) {
    return tripDays.find(day => day.day === Number(dayNumber))?.stops?.[Number(index)] || null;
  }

  function mapsSearch(name,lat,lng) {
    const query = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? `${Number(lat)},${Number(lng)}`
      : `${name}, Taiwan`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function inferType(category,type) {
    const value = `${category || ''} ${type || ''}`.toLowerCase();
    if (/restaurant|cafe|food|bar|pub|ice_cream/.test(value)) return 'Food';
    if (/shop|mall|market/.test(value)) return 'Shopping';
    if (/hotel|hostel|guest_house/.test(value)) return 'Hotel';
    if (/railway|station|aeroway|airport|bus|transport/.test(value)) return 'Transport';
    if (/historic|heritage|temple|memorial/.test(value)) return 'Heritage';
    if (/natural|waterfall|park|peak|beach/.test(value)) return 'Nature';
    if (/museum|gallery|artwork|arts_centre/.test(value)) return 'Design';
    if (/viewpoint/.test(value)) return 'Viewpoint';
    if (/tourism|attraction/.test(value)) return 'Sight';
    return '';
  }

  async function fetchJson(url,timeout=7500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url,{signal:controller.signal,headers:{'Accept':'application/json'}});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timer); }
  }

  async function geocodePlace(name) {
    const query = `${name}, Taiwan`;
    try {
      const params = new URLSearchParams({
        format:'jsonv2', limit:'1', countrycodes:'tw', addressdetails:'1', extratags:'1', namedetails:'1',
        'accept-language':'en,zh-TW', q:query
      });
      const results = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      const hit = Array.isArray(results) ? results[0] : null;
      if (hit) {
        return {
          lat:Number(hit.lat), lng:Number(hit.lon), label:hit.display_name || name,
          type:inferType(hit.category,hit.type),
          website:safeExternalUrl(hit.extratags?.website || hit.extratags?.['contact:website'] || '')
        };
      }
    } catch {}

    try {
      const params = new URLSearchParams({q:query,limit:'1',lang:'en',lat:'25.05',lon:'121.53'});
      const data = await fetchJson(`https://photon.komoot.io/api/?${params.toString()}`);
      const feature = data?.features?.[0];
      if (feature?.geometry?.coordinates?.length >= 2) {
        return {
          lat:Number(feature.geometry.coordinates[1]), lng:Number(feature.geometry.coordinates[0]),
          label:[feature.properties?.name,feature.properties?.city,feature.properties?.country].filter(Boolean).join(', ') || name,
          type:inferType(feature.properties?.osm_key,feature.properties?.osm_value), website:''
        };
      }
    } catch {}
    return null;
  }

  function applyStoredCustomisations() {
    const saved = readCustomisations();
    Object.entries(saved).forEach(([key,values]) => {
      const [day,index] = key.split('-').map(Number);
      const stop = getStop(day,index);
      if (!stop || !values || typeof values !== 'object') return;
      allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(values,field)) stop[field] = values[field];
      });
      if (!stop.maps) stop.maps = mapsSearch(stop.name,stop.lat,stop.lng);
    });
  }

  function saveStopOverride(day,index,stop) {
    const key = `${day}-${index}`;
    const saved = readCustomisations();
    saved[key] = allowedFields.reduce((copy,field) => {
      if (stop[field] !== undefined && stop[field] !== null && stop[field] !== '') copy[field] = stop[field];
      return copy;
    },{});
    writeCustomisations(saved);
  }

  function resetStop(day,index) {
    const key = `${day}-${index}`;
    const original = baseline.get(key);
    const stop = getStop(day,index);
    if (!original || !stop) return;
    allowedFields.forEach(field => delete stop[field]);
    Object.assign(stop,original);
    const saved = readCustomisations();
    delete saved[key];
    writeCustomisations(saved);
    refreshItinerary(true);
  }

  function visibleStopRefs() {
    const refs = [];
    const days = state.selectedDay === 0 ? tripDays : tripDays.filter(day => day.day === state.selectedDay);
    days.forEach(day => day.stops.forEach((stop,index) => refs.push({day:day.day,index,stop})));
    return refs;
  }

  function annotateCards() {
    const refs = visibleStopRefs();
    timeline.querySelectorAll('.stop-card').forEach((card,cardIndex) => {
      const ref = refs[cardIndex];
      if (!ref) return;
      card.dataset.day = String(ref.day);
      card.dataset.stopIndex = String(ref.index);
      const main = card.querySelector('.stop-main');
      if (!main) return;
      main.classList.add('has-editor');
      let button = main.querySelector('.itinerary-edit-btn');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'itinerary-edit-btn';
        button.innerHTML = '<span aria-hidden="true">✎</span><span class="sr-only">Edit stop</span>';
        const checkbox = main.querySelector('.visit-check');
        if (checkbox) main.insertBefore(button,checkbox);
        else main.appendChild(button);
      }
      button.setAttribute('aria-label',`Edit ${ref.stop.name}`);
      button.title = `Edit ${ref.stop.name}`;
    });
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'itinerary-editor';
  dialog.innerHTML = `
    <form method="dialog" class="itinerary-editor-shell" id="itineraryEditorForm">
      <div class="itinerary-editor-head">
        <div><span class="ticket-kicker">Customise stop</span><h2 id="editorTitle">Edit itinerary</h2></div>
        <button class="editor-close" value="cancel" type="submit" aria-label="Close editor">×</button>
      </div>
      <div class="editor-grid">
        <label class="editor-field editor-wide">Place / activity<input id="editorName" required autocomplete="off"></label>
        <label class="editor-field">Time<input id="editorTime" placeholder="14:30"></label>
        <label class="editor-field">Duration<input id="editorDuration" placeholder="60 min"></label>
        <label class="editor-field editor-wide">Type<input id="editorType" placeholder="Food, Sight, Shopping…"></label>
        <label class="editor-field editor-wide">Notes<textarea id="editorNotes" rows="4"></textarea></label>
        <label class="editor-field editor-wide">Official website <span>optional</span><input id="editorOfficial" inputmode="url" placeholder="https://…"></label>
        <label class="editor-field editor-wide">Tickets / booking <span>optional</span><input id="editorTickets" inputmode="url" placeholder="https://…"></label>
      </div>
      <div class="editor-auto-note">If the place name changes, the app will locate it in Taiwan, update the map marker and route, rebuild Google Maps and Directions links, infer the stop type when possible, and use a verified website when map data provides one.</div>
      <div class="editor-status" id="editorStatus" aria-live="polite"></div>
      <div class="editor-actions">
        <button type="button" class="editor-reset" id="editorReset">Reset this stop</button>
        <div class="editor-actions-right"><button type="button" class="editor-cancel" id="editorCancel">Cancel</button><button type="submit" class="editor-save" id="editorSave" value="save">Save changes</button></div>
      </div>
    </form>`;
  document.body.appendChild(dialog);

  const form = dialog.querySelector('#itineraryEditorForm');
  const fields = {
    name:dialog.querySelector('#editorName'),time:dialog.querySelector('#editorTime'),duration:dialog.querySelector('#editorDuration'),
    type:dialog.querySelector('#editorType'),notes:dialog.querySelector('#editorNotes'),official:dialog.querySelector('#editorOfficial'),tickets:dialog.querySelector('#editorTickets')
  };
  const statusEl = dialog.querySelector('#editorStatus');
  const saveBtn = dialog.querySelector('#editorSave');
  let active = null;

  function openEditor(day,index) {
    const stop = getStop(day,index);
    if (!stop) return;
    active = {day:Number(day),index:Number(index),snapshot:{...stop}};
    dialog.querySelector('#editorTitle').textContent = `Day ${day} · ${stop.name}`;
    fields.name.value = stop.name || '';
    fields.time.value = stop.time || '';
    fields.duration.value = stop.duration || '';
    fields.type.value = stop.type || '';
    fields.notes.value = stop.notes || '';
    fields.official.value = stop.official || '';
    fields.tickets.value = stop.tickets || '';
    statusEl.textContent = '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
    setTimeout(() => fields.name.focus(),30);
  }

  function closeEditor() {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    active = null;
  }

  async function commitEditor() {
    if (!active) return;
    const stop = getStop(active.day,active.index);
    if (!stop) return;
    const newName = fields.name.value.trim();
    if (!newName) { statusEl.textContent='Place / activity cannot be empty.'; return; }

    const nameChanged = newName.toLowerCase() !== String(active.snapshot.name || '').trim().toLowerCase();
    saveBtn.disabled = true;
    statusEl.textContent = nameChanged ? 'Finding the new location and refreshing links…' : 'Saving changes…';

    let located = null;
    if (nameChanged) located = await geocodePlace(newName);

    stop.name = newName;
    stop.time = fields.time.value.trim() || active.snapshot.time || '';
    stop.duration = fields.duration.value.trim() || active.snapshot.duration || '';
    stop.type = fields.type.value.trim() || active.snapshot.type || 'Sight';
    stop.notes = fields.notes.value.trim();

    const officialInput = safeExternalUrl(fields.official.value);
    const ticketInput = safeExternalUrl(fields.tickets.value);
    const officialWasEdited = fields.official.value.trim() !== String(active.snapshot.official || '').trim();
    const ticketsWereEdited = fields.tickets.value.trim() !== String(active.snapshot.tickets || '').trim();

    if (nameChanged && located) {
      stop.lat = located.lat;
      stop.lng = located.lng;
      stop.maps = mapsSearch(newName,located.lat,located.lng);
      if (located.type && fields.type.value.trim() === String(active.snapshot.type || '').trim()) stop.type = located.type;
      stop.official = officialWasEdited ? officialInput : (located.website || '');
      stop.tickets = ticketsWereEdited ? ticketInput : '';
      statusEl.textContent = `Located: ${located.label}. Updating itinerary…`;
    } else {
      if (nameChanged) stop.maps = mapsSearch(newName,null,null);
      else stop.maps = mapsSearch(newName,stop.lat,stop.lng);
      stop.official = officialInput;
      stop.tickets = ticketInput;
      if (nameChanged && !located) statusEl.textContent = 'Place saved. Automatic map lookup did not resolve it, so the existing route position is kept and Google Maps will search by name.';
    }

    saveStopOverride(active.day,active.index,stop);
    refreshItinerary(true);
    saveBtn.disabled = false;
    setTimeout(closeEditor,nameChanged && !located ? 900 : 180);
  }

  function refreshItinerary(redrawMap) {
    if (typeof window.renderItinerary === 'function') window.renderItinerary();
    else if (typeof renderItinerary === 'function') renderItinerary();
    if (redrawMap && typeof drawRoutes === 'function') drawRoutes(false);
    annotateCards();
  }

  timeline.addEventListener('click',event => {
    const button = event.target.closest('.itinerary-edit-btn');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const card = button.closest('.stop-card');
    openEditor(card?.dataset.day,card?.dataset.stopIndex);
  },true);

  dialog.querySelector('#editorCancel').addEventListener('click',closeEditor);
  dialog.querySelector('#editorReset').addEventListener('click',() => {
    if (!active) return;
    const day=active.day,index=active.index;
    resetStop(day,index);
    closeEditor();
  });
  form.addEventListener('submit',event => {
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    commitEditor();
  });
  dialog.addEventListener('click',event => {
    if (event.target === dialog) closeEditor();
  });

  applyStoredCustomisations();
  refreshItinerary(true);
  new MutationObserver(annotateCards).observe(timeline,{childList:true,subtree:true});
  annotateCards();
})();
