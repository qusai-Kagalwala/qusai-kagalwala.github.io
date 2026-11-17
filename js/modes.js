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
      <p>I'm a developer who also draws, so this site comes three ways. Hover over an option to preview the actual site.</p>
      
      <div class="opts">
        <button class="opt opt-pro" data-m="pro" data-video="media/preview-pro.mp4" type="button">
          <svg class="opt-svg" viewBox="0 0 44 44" fill="none" stroke="#f3eee3" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="13" width="34" height="24" rx="3"/><path d="M16 13V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M5 23h34M20 23v4h4v-4"/></svg>
          <div class="opt-head">
            <b>Professional</b>
            <span class="opt-sub">Direct &amp; structured</span>
          </div>
          <span class="opt-desc">Just the work: shipped projects, code decisions, verified credentials and résumé.</span>
          <div class="opt-foot">
            <em>2-minute read</em>
            <span class="opt-hint">Preview ↑</span>
          </div>
        </button>

        <button class="opt opt-voyage" data-m="voyage" data-video="media/preview-voyage.mp4" type="button">
          <span class="opt-ribbon">Recommended</span>
          <svg class="opt-svg" viewBox="0 0 44 44" fill="none" stroke="#f3eee3" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M4 28h36l-7 9H11z" fill="#f2b01e" stroke="#f3eee3"/><path d="M22 6v22H9zM22 6v22h13z"/></svg>
          <div class="opt-head">
            <b>Voyage</b>
            <span class="opt-sub">The signature journey</span>
          </div>
          <span class="opt-desc">Sail through it on a paper boat. Drawings, islands, river routes &amp; an arcade mini-game.</span>
          <div class="opt-foot">
            <em>Full experience</em>
            <span class="opt-hint">Preview ↑</span>
          </div>
        </button>

        <button class="opt opt-gallery" data-m="gallery" data-video="media/preview-gallery.mp4" type="button">
          <svg class="opt-svg" viewBox="0 0 44 44" fill="none" stroke="#f3eee3" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M22 3v5M12 8h20"/><rect x="8" y="12" width="28" height="22" /><rect x="13" y="17" width="18" height="12"/><path d="M17 40h10"/></svg>
          <div class="opt-head">
            <b>Gallery</b>
            <span class="opt-sub">Art exhibition</span>
          </div>
          <span class="opt-desc">Only the art. Walk a spotlighted museum wall of forty sketchbook pages, one at a time.</span>
          <div class="opt-foot">
            <em>For art lovers</em>
            <span class="opt-hint">Preview ↑</span>
          </div>
        </button>
      </div>

      <small>Switch any time from the top navigation · Press <kbd>1</kbd> for Pro, <kbd>2</kbd> for Voyage, <kbd>3</kbd> for Gallery</small>

      <!-- Floating video peek popover (shows actual site on hover, like certificate peek) -->
      <div id="chooser-peek" aria-hidden="true">
        <div class="cp-frame">
          <div class="cp-bar">
            <span class="cp-dots"><i></i><i></i><i></i></span>
            <span class="cp-title">Actual Site · Preview</span>
            <span class="cp-tag">Live</span>
          </div>
          <div class="cp-media">
            <video muted loop playsinline preload="auto"></video>
            <div class="cp-fallback">
              <div class="cp-fb-pro">
                <div class="cp-mock-hero">
                  <b>qusai.</b><span class="cp-pill">Open to internships</span>
                  <h3>Qusai Kagalwala</h3>
                  <p>Developer building AI web, desktop &amp; mobile tools.</p>
                  <div class="cp-mock-kpis"><span>Microsoft Store</span><span>3 Live Apps</span><span>18 Certs</span><span>4× 1st Place</span></div>
                </div>
              </div>
              <div class="cp-fb-voyage">
                <div class="cp-mock-sky"><span class="cp-mock-moon"></span><i class="cp-s1"></i><i class="cp-s2"></i></div>
                <svg class="cp-mock-river" viewBox="0 0 200 100"><path d="M10 30 Q 70 80 120 40 T 190 70" fill="none" stroke="#f2b01e" stroke-width="12" stroke-opacity=".2"/><path d="M10 30 Q 70 80 120 40 T 190 70" fill="none" stroke="#f2b01e" stroke-width="2" stroke-dasharray="3 4"/></svg>
                <div class="cp-mock-boat"><svg viewBox="0 0 60 50"><path d="M5 25h40l-8 10H14z" fill="#f2b01e"/><path d="M26 4v21H12z" fill="#fff"/><path d="M26 4v21h14z" fill="#1f4fa3"/><circle cx="16" cy="15" r="3" fill="#fff8ec"/></svg></div>
              </div>
              <div class="cp-fb-gallery">
                <div class="cp-mock-spot"></div>
                <div class="cp-mock-wall"><img src="art/t/40.jpg" alt=""><img src="art/t/20.jpg" alt=""><img src="art/t/10.jpg" alt=""><img src="art/t/23.jpg" alt=""></div>
                <div class="cp-mock-floor"></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    document.body.appendChild(c);
    c.addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) setMode(b.dataset.m); });

    /* ---------- floating hover peek logic (like certificate peek) ---------- */
    const cPeek = c.querySelector('#chooser-peek');
    const cpVideo = cPeek.querySelector('video');
    const cpTitle = cPeek.querySelector('.cp-title');
    const cpTag = cPeek.querySelector('.cp-tag');
    const cpFallback = cPeek.querySelector('.cp-fallback');
    let cpx = 0, cpy = 0, ctx = 0, cty = 0, cShowing = false;

    c.querySelectorAll('.opt').forEach(opt => {
      opt.addEventListener('mouseenter', e => {
        const m = opt.dataset.m;
        const videoSrc = opt.dataset.video;
        cpTitle.textContent = 'Actual Site · ' + (m === 'pro' ? 'Professional' : m === 'voyage' ? 'Voyage' : 'Gallery');
        cpTag.textContent = m === 'voyage' ? 'Story' : m === 'pro' ? 'Work' : 'Art';
        
        // Show correct mode preview fallback
        cpFallback.setAttribute('data-show', m);

        if (videoSrc) {
          if (cpVideo.dataset.src !== videoSrc) {
            cpVideo.dataset.src = videoSrc;
            cpVideo.src = videoSrc;
          }
          cpVideo.currentTime = 0;
          const playPromise = cpVideo.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              cpVideo.style.display = 'block';
            }).catch(() => {
              cpVideo.style.display = 'none';
            });
          }
        }

        cShowing = true;
        cPeek.classList.add('on');
        cpx = ctx = e.clientX;
        cpy = cty = e.clientY;
      });

      opt.addEventListener('mouseleave', () => {
        cShowing = false;
        cPeek.classList.remove('on');
        try { cpVideo.pause(); } catch (e) {}
      });
    });

    window.addEventListener('mousemove', e => {
      ctx = e.clientX;
      cty = e.clientY;
    });

    (function cFollow(){
      if (cShowing) {
        cpx += (ctx - cpx) * 0.2;
        cpy += (cty - cpy) * 0.2;
        const w = cPeek.offsetWidth || 400, h = cPeek.offsetHeight || 280;
        let x = cpx - w / 2;
        let y = cpy - h - 22;
        if (y < 20) y = cpy + 26;
        if (x < 16) x = 16;
        if (x + w > window.innerWidth - 16) x = window.innerWidth - w - 16;
        cPeek.style.transform = `translate(${x}px,${y}px) rotate(${(ctx - cpx) * 0.035}deg)`;
      }
      requestAnimationFrame(cFollow);
    })();

    // Keyboard shortcuts
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
