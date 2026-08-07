# Taipei Trip Companion · Redesign audit

## Example user prompt

> Redesign my existing Taipei Trip Companion without changing its free static stack or breaking any working feature. Keep the interactive Leaflet/OpenStreetMap map, live location tracking, clickable itinerary, nearby POIs with free images, hidden-cost audit, transport ticketing and app links. Make it feel like a premium editorial Taiwan field guide rather than an AI-generated dashboard. Prioritize mobile readability and map-first use, preserve the map-control spacing that already works, reduce generic cards and gradients, simplify the palette, strengthen typography and interaction states, and improve loading, empty and error states. No paid services or new frameworks.

## 1. Scan

- Stack: static HTML, vanilla CSS and vanilla JavaScript.
- Map: Leaflet 1.9.4 with OpenStreetMap tiles.
- Nearby discovery: OpenStreetMap Overpass plus Wikimedia/Wikipedia/Wikidata image fallbacks.
- State: browser geolocation and localStorage.
- No package manager or framework dependency is required for the current app.
- Existing functions to preserve: day route filtering, route drawing, live-location tracking, nearest-stop status, itinerary-to-map focus, map popups, Google Maps/directions links, nearby filtering, cost calculator, transport ticketing and theme toggle.
- Styling had accumulated several override files. The redesign therefore adds one final targeted CSS layer rather than migrating or rewriting the app.

## 2. Diagnose

### Typography
- Inter/system-style treatment dominated most UI and read as generic product-dashboard typography.
- Headline hierarchy existed but the surrounding utility UI competed with it.
- Numeric itinerary/cost information could scan more cleanly with tabular figures.

### Color and surfaces
- Too many interface accents were in use: coral, jade, indigo, amber and violet.
- Nearby placeholders used a turquoise-to-purple gradient that looked synthetic and unrelated to the Taipei field-guide direction.
- Many elements relied on white cards, rounded corners, borders and shadows at the same time.

### Layout and component patterns
- Summary metrics, itinerary stops, nearby POIs, apps and ticket cards repeated the same bordered-card grammar.
- Tabs used a pill/container treatment that added another layer of chrome.
- The page needed a clearer visual distinction between primary content and supporting controls.
- Existing map-control positioning is fragile because it was refined through prior mobile fixes, so positional rules must remain untouched.

### Interactivity and states
- Hover/active states existed but did not share a unified interaction language.
- Theme control used a generic sun/moon icon without a persistent text label.
- Loading used a circular spinner rather than a more content-shaped loading state.
- Empty/error states were functional but visually generic.

### Metadata and accessibility
- Skip navigation and semantic sectioning already existed and should be preserved.
- Active tabs/day controls could expose stronger ARIA state.
- A custom favicon and richer share metadata were missing.

## 3. Fix

- Added `skill-redesign.css` as a final, targeted vanilla-CSS layer.
- Reduced the interface to one primary UI accent while keeping route-day colors as semantic map data.
- Shifted body typography to Avenir/system sans with Iowan/Palatino-style editorial display headings, without downloading fonts.
- Converted summary metrics, itinerary, nearby results, ticket information and app lists from repeated cards into quieter editorial rows/ledgers.
- Removed the AI-like POI gradient fallback and replaced it with a neutral image state.
- Replaced the circular loading spinner visually with a skeleton shimmer.
- Simplified tabs into an underline navigation pattern.
- Standardized focus, hover and pressed states.
- Converted the theme icon into an explicit `Theme` control and added ARIA state.
- Added ARIA current/pressed states to navigation and day selectors.
- Added a custom favicon and social metadata at runtime without adding a framework or analytics.
- Switched viewport-height overrides to `dvh` for better mobile-browser behavior.
- Preserved the existing 24px map overlay edge system and map-control positioning.

## Verification

- No framework migration and no new paid service or API.
- Existing application JS files remain in place.
- Changes are isolated to one final CSS layer, one small interaction/accessibility layer, the existing UX initializer and this audit file.
- Git comparison from the pre-redesign commit can be used to review the exact change set.
