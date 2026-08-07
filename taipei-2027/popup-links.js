(function () {
  if (typeof drawRoutes !== 'function') return;

  const originalDrawRoutes = drawRoutes;

  function googleMapsLocation(stop) {
    return stop.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.lat},${stop.lng}`)}`;
  }

  function enhanceMarkerPopups() {
    const days = state.selectedDay === 0 ? tripDays : tripDays.filter(day => day.day === state.selectedDay);
    let markerIndex = 0;

    days.forEach(day => {
      day.stops.forEach((stop, index) => {
        const marker = state.markerLayers[markerIndex++];
        if (!marker) return;

        const mapsLink = googleMapsLocation(stop);
        const directionsLink = mapsDirections(stop);

        marker.bindPopup(`
          <div class="popup-title">${index + 1}. ${stop.name}</div>
          <div class="popup-meta">${day.label} · ${stop.time} · ${stop.duration}</div>
          <div class="link-row popup-link-row">
            <a class="mini-link popup-map-link" href="${mapsLink}" target="_blank" rel="noopener noreferrer">Google Maps</a>
            <a class="mini-link" href="${directionsLink}" target="_blank" rel="noopener noreferrer">Directions</a>
          </div>
        `);
      });
    });
  }

  drawRoutes = function (fit = false) {
    originalDrawRoutes(fit);
    enhanceMarkerPopups();
  };
})();
