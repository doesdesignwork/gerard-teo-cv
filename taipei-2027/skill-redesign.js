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

  /* Capture phase makes this the single theme controller and prevents the older
     app.js click handler from toggling a second time. */
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
})();
