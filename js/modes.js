// Three ways to see the site. The mode is chosen in the inline <head> script
// (URL ?mode=pro|voyage|gallery → saved choice → first-visit chooser) and applied as html[data-mode].
(() => {
  const root = document.documentElement, MODE = root.dataset.mode || 'voyage';
  const NAMES = { pro: 'Professional', voyage: 'Voyage', gallery: 'Gallery' };

  const setMode = m => {
    let saved = false;
    try { localStorage.setItem('mode', m); saved = localStorage.getItem('mode') === m; } catch (e) {}
    if (saved) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    else location.hash = m;            // no storage (private mode, embeds): carry the choice in the address instead
    location.reload();
  };
  window.__setMode = setMode;

  // the switcher appears in the header, the phone menu and the gallery bar
  document.querySelectorAll('.modes').forEach(el => {
    el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Choose how to view this site');
    el.innerHTML = Object.entries(NAMES).map(([k, v]) => `<button type="button" data-m="${k}" class="${k === MODE ? 'on' : ''}" aria-pressed="${k === MODE}">${v}</button>`).join('');
    el.addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.m !== MODE) setMode(b.dataset.m); });
  });

  // first visit: ask
  if (root.classList.contains('choosing')) {
    const c = document.createElement('div'); c.id = 'chooser'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'Choose how to look around');
    c.innerHTML = `
      <p class="hi">qusai.</p>
      <h2>How would you like to <i>look around?</i></h2>
      <p>I'm a developer who also draws, so this site comes three ways.</p>
      <div class="opts">
        <button class="opt" data-m="pro"><svg viewBox="0 0 44 44" fill="none" stroke="#f3eee3" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="13" width="34" height="24" rx="3"/><path d="M16 13V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M5 23h34M20 23v4h4v-4"/></svg>
          <b>Professional</b><span>Just the work: projects, skills, awards and résumé.</span><em>2-minute read</em></button>
        <button class="opt" data-m="voyage"><svg viewBox="0 0 44 44" fill="none" stroke="#f3eee3" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M4 28h36l-7 9H11z" fill="#f2b01e" stroke="#f3eee3"/><path d="M22 6v22H9zM22 6v22h13z"/></svg>
          <b>Voyage</b><span>Sail through it on a paper boat. The whole story, with my drawings, islands and the odd pirate.</span><em>The full experience</em></button>
        <button class="opt" data-m="gallery"><svg viewBox="0 0 44 44" fill="none" stroke="#f3eee3" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M22 3v5M12 8h20"/><rect x="8" y="12" width="28" height="22" /><rect x="13" y="17" width="18" height="12"/><path d="M17 40h10"/></svg>
          <b>Gallery</b><span>Only the art. Walk a museum wall of forty sketchbook pages, one at a time.</span><em>For art lovers</em></button>
      </div>
      <small>You can switch any time from the top of the page.</small>`;
    document.body.appendChild(c);
    c.addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) setMode(b.dataset.m); });
    const first = c.querySelector('.opt'); if (first) first.focus({ preventScroll: true });
  }
})();
