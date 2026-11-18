// Three ways to see the site. The mode is chosen in the inline <head> script
// (URL ?mode=pro|voyage|gallery → saved choice → first-visit chooser) and applied as html[data-mode].
(() => {
  const root = document.documentElement, MODE = root.dataset.mode || 'voyage';
  const NAMES = { pro: 'Professional', voyage: 'Voyage', gallery: 'Gallery' };

  if (MODE === 'voyage' || MODE === 'gallery') {
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch (e) {}
  }

  const setMode = m => {
    let saved = false;
    try { localStorage.setItem('mode', m); saved = localStorage.getItem('mode') === m; } catch (e) {}
    if (saved) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    else location.hash = m;            // no storage (private mode, embeds): carry the choice in the address instead
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    } catch (e) {}
    location.reload();
  };
  window.__setMode = setMode;

  // the switcher appears in the header, the phone menu and the gallery bar
  document.querySelectorAll('.modes').forEach(el => {
    el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Choose how to view this site');
    el.innerHTML = Object.entries(NAMES).map(([k, v]) => `<button type="button" data-m="${k}" class="${k === MODE ? 'on' : ''}" aria-pressed="${k === MODE}">${v}</button>`).join('');
    el.addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.m !== MODE) setMode(b.dataset.m); });
  });

  // Clicking "qusai." logo opens the role/mode picker
  document.querySelectorAll('.mark').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openChooser();
    });
  });

  function initChooser(c) {
    c.addEventListener('click', e => {
      const b = e.target.closest('.opt');
      if (b) setMode(b.dataset.m);
      if (e.target.closest('.chooser-close')) {
        root.classList.remove('choosing');
        c.remove();
      }
    });

    /* ---------- floating hover peek logic (direct video on hover, 5-second loop) ---------- */
    const cPeek = c.querySelector('#chooser-peek');
    const cpVideo = cPeek.querySelector('video');
    const cpTitle = cPeek.querySelector('.cp-title');
    const cpTag = cPeek.querySelector('.cp-tag');
    let cpx = 0, cpy = 0, ctx = 0, cty = 0, cShowing = false;
    const LOOP_SECONDS = 5.0; // Snappy 5-second trimmed loop

    // Seamless 5-second loop constraint
    cpVideo.addEventListener('timeupdate', () => {
      if (cpVideo.currentTime >= LOOP_SECONDS) {
        cpVideo.currentTime = 0;
        cpVideo.play().catch(() => {});
      }
    });

    c.querySelectorAll('.opt').forEach(opt => {
      opt.addEventListener('mouseenter', e => {
        const m = opt.dataset.m;
        const videoSrc = opt.dataset.video;
        cpTitle.textContent = 'Actual Site · ' + (m === 'pro' ? 'Professional' : m === 'voyage' ? 'Voyage' : 'Gallery');
        cpTag.textContent = m === 'voyage' ? 'Story' : m === 'pro' ? 'Work' : 'Art';

        if (videoSrc) {
          if (cpVideo.dataset.src !== videoSrc) {
            cpVideo.dataset.src = videoSrc;
            cpVideo.src = videoSrc + '#t=0,5';
            cpVideo.load();
          }
          cpVideo.currentTime = 0;
          cpVideo.play().catch(() => {});
        }

        cShowing = true;
        cPeek.classList.add('on');
        cpx = ctx = e.clientX;
        cpy = cty = e.clientY;
      });

      opt.addEventListener('mouseleave', () => {
        cShowing = false;
        cPeek.classList.remove('on');
        try {
          cpVideo.pause();
          cpVideo.currentTime = 0;
        } catch (e) {}
      });
    });

    window.addEventListener('mousemove', e => {
      ctx = e.clientX;
      cty = e.clientY;
    });

    (function cFollow(){
      if (cShowing) {
        cpx += (ctx - cpx) * 0.25;
        cpy += (cty - cpy) * 0.25;
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
      if (k === 'escape') {
        root.classList.remove('choosing');
        c.remove();
      } else if (k === '1' || k === 'p') setMode('pro');
      else if (k === '2' || k === 'v') setMode('voyage');
      else if (k === '3' || k === 'g') setMode('gallery');
    });

    const first = c.querySelector('.opt'); if (first) first.focus({ preventScroll: true });
  }

  function openChooser() {
    let c = document.getElementById('chooser');
    if (c) c.remove();
    c = document.createElement('div');
    c.id = 'chooser';
    c.setAttribute('role', 'dialog');
    c.setAttribute('aria-label', 'Choose how to look around');
    c.innerHTML = `
      <button class="chooser-close" aria-label="Close" type="button" style="position:absolute;top:20px;right:24px;background:none;border:0;color:#f3eee3;font-size:28px;cursor:pointer;line-height:1;z-index:10;opacity:.7;transition:opacity .2s">&times;</button>
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

      <small>Switch any time from the navigation · Press <kbd>1</kbd> for Pro, <kbd>2</kbd> for Voyage, <kbd>3</kbd> for Gallery</small>

      <!-- Floating video peek popover (shows actual site on hover, direct video) -->
      <div id="chooser-peek" aria-hidden="true">
        <div class="cp-frame">
          <div class="cp-bar">
            <span class="cp-dots"><i></i><i></i><i></i></span>
            <span class="cp-title">Actual Site · Preview</span>
            <span class="cp-tag">Live</span>
          </div>
          <div class="cp-media">
            <video muted loop playsinline></video>
          </div>
        </div>
      </div>`;

    document.body.appendChild(c);
    root.classList.add('choosing');
    initChooser(c);
  }
  window.__openChooser = openChooser;

  // first visit: ask
  if (root.classList.contains('choosing')) {
    openChooser();
  }
})();
