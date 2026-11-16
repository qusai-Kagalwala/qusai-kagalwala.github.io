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
      <p>I'm a developer who also draws, so this site comes three ways. Hover over any option for a live preview.</p>
      <div class="opts">
        <!-- Option 1: Professional -->
        <button class="opt opt-pro" data-m="pro" type="button">
          <div class="opt-preview" aria-hidden="true">
            <div class="pv-bar">
              <span class="pv-dots"><i class="dr"></i><i class="dy"></i><i class="dg"></i></span>
              <span class="pv-name">pro · preview</span>
              <span class="pv-live"><i class="live-dot"></i> LIVE</span>
            </div>
            <div class="pv-viewport pv-pro">
              <div class="pv-pro-scroll">
                <div class="pv-mini-head">
                  <span class="pv-mini-brand">qusai.</span>
                  <span class="pv-mini-pill">● Open to internships</span>
                </div>
                <div class="pv-mini-hero">
                  <b>Qusai Kagalwala</b>
                  <p>Developer building AI web, desktop & mobile tools.</p>
                </div>
                <div class="pv-mini-kpis">
                  <div><b>Store</b><span>Docly .exe</span></div>
                  <div><b>3 Apps</b><span>In public use</span></div>
                  <div><b>18 Certs</b><span>ISC2, Cisco</span></div>
                </div>
                <div class="pv-mini-card">
                  <div class="pv-mc-top"><span class="pv-mc-tag">Capstone</span><b>Cue</b></div>
                  <div class="pv-mc-tech"><span>React 19</span><span>Gemini</span><span>Vite</span></div>
                </div>
                <div class="pv-mini-card">
                  <div class="pv-mc-top"><span class="pv-mc-tag">Windows</span><b>Docly</b></div>
                  <div class="pv-mc-tech"><span>Python</span><span>PySide6</span><span>OpenCV</span></div>
                </div>
              </div>
            </div>
            <div class="pv-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Live UI</div>
          </div>
          <div class="opt-body">
            <div class="opt-title-row">
              <svg class="opt-icon" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="13" width="34" height="24" rx="3"/><path d="M16 13V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M5 23h34M20 23v4h4v-4"/></svg>
              <div>
                <b>Professional</b>
                <span class="opt-sub">Direct &amp; structured</span>
              </div>
            </div>
            <span>Just the work: shipped projects, code, verified credentials and résumé.</span>
            <div class="opt-footer">
              <em>2-minute read</em>
              <span class="opt-go">View work →</span>
            </div>
          </div>
        </button>

        <!-- Option 2: Voyage (Signature Story) -->
        <button class="opt opt-voyage" data-m="voyage" type="button">
          <span class="opt-ribbon">★ Recommended</span>
          <div class="opt-preview" aria-hidden="true">
            <div class="pv-bar">
              <span class="pv-dots"><i class="dr"></i><i class="dy"></i><i class="dg"></i></span>
              <span class="pv-name">voyage · preview</span>
              <span class="pv-live"><i class="live-dot"></i> STORY</span>
            </div>
            <div class="pv-viewport pv-voyage">
              <div class="pv-night-sky">
                <i class="pv-star s1"></i><i class="pv-star s2"></i><i class="pv-star s3"></i><i class="pv-star s4"></i>
                <div class="pv-moon"></div>
              </div>
              <svg class="pv-river" viewBox="0 0 240 120">
                <path class="pv-river-wash" d="M10 35 Q 70 85 130 45 T 230 85" fill="none" stroke="#f2b01e" stroke-opacity=".2" stroke-width="22" stroke-linecap="round"/>
                <path class="pv-river-ink" d="M10 35 Q 70 85 130 45 T 230 85" fill="none" stroke="#f2b01e" stroke-width="2.2" stroke-dasharray="3 4"/>
              </svg>
              <div class="pv-boat-actor">
                <svg viewBox="0 0 120 100">
                  <g class="bob">
                    <path d="M12 40h66l-13 17H25z" fill="#f2b01e"/>
                    <path d="M45 6v34H22z" fill="#fff"/>
                    <path d="M45 6v34h23z" fill="#1f4fa3"/>
                    <g stroke="#f3eee3" stroke-width="2" fill="none" stroke-linecap="round"><path d="M12 40h66l-13 17H25z"/><path d="M45 6L22 40M45 6l23 34M45 6v34"/></g>
                    <circle cx="28" cy="24" r="5" fill="#fff8ec"/><path d="M28 29v11M28 33l7-6" stroke="#f3eee3" stroke-width="2"/>
                  </g>
                </svg>
                <i class="pv-wake w1"></i><i class="pv-wake w2"></i>
              </div>
              <div class="pv-islet">
                <svg viewBox="0 0 60 30"><ellipse cx="30" cy="24" rx="28" ry="5" fill="#8fe6dc" opacity=".45"/><path d="M6 24c6-8 38-8 48 0z" fill="#f4e2b4"/><g transform="translate(42,22) scale(0.26)"><path d="M0 0c2-30-6-55-14-75" stroke="#8b5a2b" stroke-width="8" fill="none"/><circle cx="-14" cy="-75" r="13" fill="#2d8a4e"/></g></svg>
              </div>
            </div>
            <div class="pv-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Interactive River</div>
          </div>
          <div class="opt-body">
            <div class="opt-title-row">
              <svg class="opt-icon" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M4 28h36l-7 9H11z" fill="#f2b01e" stroke="#f3eee3"/><path d="M22 6v22H9zM22 6v22h13z"/></svg>
              <div>
                <b>Voyage</b>
                <span class="opt-sub">The signature journey</span>
              </div>
            </div>
            <span>Sail through it on a paper boat. Drawings, islands, river routes &amp; an arcade mini-game.</span>
            <div class="opt-footer">
              <em>The full experience</em>
              <span class="opt-go">Sail aboard →</span>
            </div>
          </div>
        </button>

        <!-- Option 3: Gallery -->
        <button class="opt opt-gallery" data-m="gallery" type="button">
          <div class="opt-preview" aria-hidden="true">
            <div class="pv-bar">
              <span class="pv-dots"><i class="dr"></i><i class="dy"></i><i class="dg"></i></span>
              <span class="pv-name">gallery · preview</span>
              <span class="pv-live"><i class="live-dot"></i> ART</span>
            </div>
            <div class="pv-viewport pv-gallery">
              <div class="pv-spotlight"></div>
              <div class="pv-gallery-wall">
                <div class="pv-art-frame">
                  <img src="art/t/40.jpg" alt="" loading="lazy">
                  <span>p. 40 · full moon</span>
                </div>
                <div class="pv-art-frame">
                  <img src="art/t/20.jpg" alt="" loading="lazy">
                  <span>p. 20 · rickshaw</span>
                </div>
                <div class="pv-art-frame">
                  <img src="art/t/10.jpg" alt="" loading="lazy">
                  <span>p. 10 · tall ship</span>
                </div>
                <div class="pv-art-frame">
                  <img src="art/t/23.jpg" alt="" loading="lazy">
                  <span>p. 23 · lighthouse</span>
                </div>
              </div>
              <div class="pv-wood-floor"></div>
            </div>
            <div class="pv-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Museum Wall</div>
          </div>
          <div class="opt-body">
            <div class="opt-title-row">
              <svg class="opt-icon" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M22 3v5M12 8h20"/><rect x="8" y="12" width="28" height="22" /><rect x="13" y="17" width="18" height="12"/><path d="M17 40h10"/></svg>
              <div>
                <b>Gallery</b>
                <span class="opt-sub">Art exhibition</span>
              </div>
            </div>
            <span>Walk a spotlighted museum wall of forty sketchbook pages, one at a time.</span>
            <div class="opt-footer">
              <em>For art lovers</em>
              <span class="opt-go">Enter gallery →</span>
            </div>
          </div>
        </button>
      </div>
      <small>Switch any time from the top navigation · Press <kbd>1</kbd> for Pro, <kbd>2</kbd> for Voyage, <kbd>3</kbd> for Gallery</small>`;
    document.body.appendChild(c);
    c.addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) setMode(b.dataset.m); });
    
    // Keyboard shortcuts: 1/p = Pro, 2/v = Voyage, 3/g = Gallery
    window.addEventListener('keydown', e => {
      if (!root.classList.contains('choosing')) return;
      const k = e.key.toLowerCase();
      if (k === '1' || k === 'p') setMode('pro');
      else if (k === '2' || k === 'v') setMode('voyage');
      else if (k === '3' || k === 'g') setMode('gallery');
    });

    const first = c.querySelector('.opt'); if (first) first.focus({ preventScroll: true });
  }
})();
