(function () {
  const timeline = document.getElementById('timeline');
  const mapPane = document.querySelector('.map-pane');
  if (!timeline || !mapPane) return;

  function resolveStop(card) {
    const cards = Array.from(timeline.querySelectorAll('.stop-card'));
    const cardIndex = cards.indexOf(card);
    if (cardIndex < 0) return null;

    if (state.selectedDay === 0) {
      const flattened = [];
      tripDays.forEach(day => day.stops.forEach((stop, index) => flattened.push({ day, stop, index })));
      return flattened[cardIndex] || null;
    }

    const day = tripDays.find(item => item.day === state.selectedDay);
    if (!day || !day.stops[cardIndex]) return null;
    return { day, stop: day.stops[cardIndex], index: cardIndex };
  }

  function findMarker(stop) {
    return state.markerLayers.find(marker => {
      const point = marker.getLatLng();
      return Math.abs(point.lat - stop.lat) < 0.000001 && Math.abs(point.lng - stop.lng) < 0.000001;
    });
  }

  function focusStop(card) {
    const item = resolveStop(card);
    if (!item) return;

    const { stop } = item;
    state.follow = false;
    document.getElementById('followBtn')?.classList.remove('active');
    state.selectedPoint = { lat: stop.lat, lng: stop.lng };
    updateSelectedPointMarker(false);

    const moveMap = () => {
      map.invalidateSize();
      map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 0.7
      });
      const marker = findMarker(stop);
      if (marker) setTimeout(() => marker.openPopup(), 450);
    };

    document.querySelectorAll('.stop-card.map-focused').forEach(el => el.classList.remove('map-focused'));
    card.classList.add('map-focused');

    if (window.matchMedia('(max-width: 920px)').matches) {
      mapPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(moveMap, 420);
    } else {
      moveMap();
    }
  }

  function prepareCards() {
    timeline.querySelectorAll('.stop-main').forEach(main => {
      main.setAttribute('role', 'button');
      main.setAttribute('tabindex', '0');
      main.setAttribute('aria-label', `Show ${main.querySelector('.stop-title')?.textContent || 'this stop'} on map`);
      main.title = 'Show this stop on the map';
    });
  }

  timeline.addEventListener('click', event => {
    if (event.target.closest('input, a, summary, details')) return;
    const main = event.target.closest('.stop-main');
    if (!main) return;
    focusStop(main.closest('.stop-card'));
  });

  timeline.addEventListener('keydown', event => {
    const main = event.target.closest('.stop-main');
    if (!main || !['Enter', ' '].includes(event.key)) return;
    if (event.target.closest('input, a, summary, details')) return;
    event.preventDefault();
    focusStop(main.closest('.stop-card'));
  });

  new MutationObserver(prepareCards).observe(timeline, { childList: true, subtree: true });
  prepareCards();
})();
