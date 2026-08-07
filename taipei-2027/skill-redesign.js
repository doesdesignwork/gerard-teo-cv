(function () {
  const app = document.getElementById('app');
  const themeBtn = document.getElementById('themeBtn');
  const tabs = document.querySelector('.tabs');
  const picker = document.getElementById('mapDayPicker');

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

  syncThemeControl();
  syncTabs();
  syncDayButtons();

  themeBtn?.addEventListener('click', () => requestAnimationFrame(syncThemeControl));

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
