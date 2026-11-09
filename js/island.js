// The island: an intro scene that opens the site, and a little shore where the journey ends.
// The stick figure behind the palm talks in terminal prompts. Click him for more.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LINES = [
    "git checkout -b vacation",
    "it's not a bug, it's a beach.",
    "npm install coconut --save",
    "sudo take-a-break",
    "ping qusai … reply within one tide.",
    "while (true) { sail(); draw(); build(); }",
    "404: stress not found.",
    "git commit -m \"found the island\"",
  ];

  /* ---------- the island, drawn around (0,0) = waterline under the palms ---------- */
  const leaf = (a, c, s = 1) => `<path transform="rotate(${a}) scale(${s})" d="M0 0C24-20 62-22 94 4C70-8 44-6 18 2C12 4 6 3 0 0Z" fill="${c}"/>`;
  const fronds = (angles, s) => angles.map((a, i) => leaf(a, i % 2 ? '#4e9e44' : '#2f7d3a', s)).join('');
  const island = id => `
    <g class="isle">
      <ellipse class="foam" cx="0" cy="6" rx="214" ry="13" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>
      <path d="M-196 2C-140-30 140-30 196 2C128 18-128 18-196 2Z" fill="#f1dcaa"/>
      <path d="M-196 2C-128 18 128 18 196 2C120 9-120 9-196 2Z" fill="#d6b87e"/>
      <path d="M-128-12C-60-34 70-34 136-12C82-21-72-21-128-12Z" fill="#5e9f46"/>
      <path d="M-96-17l4-10 3 9M-40-22l3-9 4 9M60-21l4-10 3 10M100-16l3-8 4 8" stroke="#4b8a37" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- deck chair -->
      <g transform="translate(-92 -12)">
        <path d="M-22 6L-26-14M20 6L24-14M-18 6L-12-6M16 6L10-6" stroke="#7a5230" stroke-width="3" stroke-linecap="round"/>
        <path d="M-19-50H17L21-18H-23Z" fill="url(#${id}-stripes)" stroke="#7a5230" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M-25-18H23L28-8H-30Z" fill="#2457b8" stroke="#7a5230" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
      <!-- the stick figure, hidden behind the trunk until he peeks out -->
      <g clip-path="url(#${id}-peek)">
        <g class="fig" role="button" tabindex="0" aria-label="Talk to the stick figure">
          <rect x="6" y="-92" width="44" height="78" fill="transparent"/>
          <ellipse cx="24" cy="-15" rx="12" ry="3" fill="#000" opacity=".12"/>
          <g stroke="#1b1c29" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="24" cy="-76" r="8" fill="#fff8ec"/>
            <path d="M24-68V-42M24-42L17-18M24-42L31-18M24-60L13-50"/>
            <path class="arm" d="M24-60L36-73"/>
          </g>
          <path d="M21-78h1.5M27-78h1.5" stroke="#1b1c29" stroke-width="2" stroke-linecap="round"/>
          <path d="M21-72q3 3 6 0" stroke="#1b1c29" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        </g>
      </g>
      <!-- palms -->
      <g class="sway s1">
        <path d="M6-16C6-70-2-130-14-196" stroke="#8b5a2b" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M0-50h11M-1-80h11M-3-110h10M-6-140h10M-9-168h9" stroke="#6e4420" stroke-width="2" stroke-linecap="round"/>
        <g transform="translate(-14 -196)"><g class="fr">${fronds([-34, 8, 46, 132, 172, 214, 258], 1)}
          <circle cx="-5" cy="3" r="6" fill="#6b4423"/><circle cx="6" cy="5" r="6" fill="#5a3a1d"/></g></g>
      </g>
      <g class="sway s2">
        <path d="M36-16C48-66 64-112 86-152" stroke="#8b5a2b" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M42-44h10M50-74h9M60-102h9M71-128h8" stroke="#6e4420" stroke-width="2" stroke-linecap="round"/>
        <g transform="translate(86 -152)"><g class="fr">${fronds([-24, 18, 58, 140, 182, 226], .8)}<circle cx="0" cy="3" r="5" fill="#6b4423"/></g></g>
      </g>
    </g>`;
  const defs = id => `<defs>
      <pattern id="${id}-stripes" width="9" height="9" patternUnits="userSpaceOnUse">
        <rect width="9" height="9" fill="#fff"/><rect width="4.5" height="9" fill="#2f6fd6"/></pattern>
      <clipPath id="${id}-peek"><rect x="9" y="-120" width="80" height="120"/></clipPath>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7fcf"/><stop offset="1" stop-color="#bfdcf4"/></linearGradient>
      <linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3aa7cc"/><stop offset="1" stop-color="#11507c"/></linearGradient>
    </defs>`;
  const waves = (y0, n, w) => Array.from({length: n}, (_, i) => {
    const y = y0 + i * 34, x = (i * 173) % 260 - 130;
    return `<g class="wave" style="--d:${8 + i * 2}s"><path d="M${x} ${y}${' q20 -8 40 0 t40 0'.repeat(3)}M${x + 600} ${y + 12}${' q20 -8 40 0 t40 0'.repeat(2)}M${x + 1100} ${y - 6}${' q20 -8 40 0 t40 0'.repeat(3)}" stroke="#fff" stroke-opacity="${w}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
  }).join('');
  const boatSVG = `<g class="pboat"><g class="bobber">
      <path d="M-33 0h66l-13 18H-20z" fill="#f2b01e"/><path d="M0-36v36H-22z" fill="#fff"/><path d="M0-36v36h22z" fill="#2f6fd6"/>
      <g fill="none" stroke="#1b1c29" stroke-width="2" stroke-linejoin="round"><path d="M-33 0h66l-13 18H-20z"/><path d="M0-36L-22 0M0-36l22 36M0-36V0"/></g></g></g>`;

  /* ---------- speech bubble that types like a terminal ---------- */
  function bubble(host){
    const b = document.createElement('div'); b.className = 'say'; b.setAttribute('aria-live', 'polite');
    b.innerHTML = '<p><b>›</b> <span></span><i class="caret"></i></p><div class="act"></div>'; host.appendChild(b);
    const span = b.querySelector('span'); let timer;
    b.type = (text, done) => {
      clearInterval(timer); b.classList.add('on'); span.textContent = ''; b.querySelector('.act').innerHTML = '';
      if (reduce) { span.textContent = text; done && done(); return; }
      let i = 0; timer = setInterval(() => { span.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(timer); done && done(); } }, 34);
    };
    return b;
  }
  function placeBubble(b, svg, fig, host){
    const r = fig.getBoundingClientRect(), h = host.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    if (vw < 720) {                         // phones: a full-width bubble just above the figure
      b.classList.add('wide'); b.style.left = (16 - h.left) + 'px'; b.style.width = (vw - 32) + 'px';
      b.style.top = (r.top - h.top - 18) + 'px';
    } else {                                // larger screens: beside the figure, kept on screen
      b.classList.remove('wide'); b.style.width = '';
      b.style.left = Math.max(12 - h.left, Math.min(r.right - h.left + 8, vw - h.left - 332)) + 'px';
      b.style.top = (r.top - h.top - 14) + 'px';
    }
  }
  function talky(fig, b, svg, host){
    let k = Math.floor(Math.random() * LINES.length);
    const talk = () => { fig.classList.remove('wave'); void fig.getBBox(); fig.classList.add('wave'); b.type(LINES[k++ % LINES.length]); placeBubble(b, svg, fig, host); };
    fig.addEventListener('click', e => { e.stopPropagation(); talk(); });
    fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); talk(); } });
  }

  /* ---------- 1. the intro ---------- */
  const intro = document.getElementById('intro');
  if (intro && root.classList.contains('loading')) {
    intro.innerHTML = `
      <svg class="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="false">
        ${defs('i')}
        <rect width="1200" height="480" fill="url(#i-sky)"/>
        <g class="clouds"><g class="cloud" style="--d:70s"><ellipse cx="220" cy="190" rx="90" ry="34" fill="#fff"/><ellipse cx="270" cy="168" rx="60" ry="40" fill="#fff"/><ellipse cx="170" cy="176" rx="46" ry="30" fill="#fff"/></g>
          <g class="cloud" style="--d:95s"><ellipse cx="900" cy="140" rx="110" ry="36" fill="#fff" opacity=".95"/><ellipse cx="960" cy="114" rx="70" ry="44" fill="#fff"/><ellipse cx="850" cy="122" rx="50" ry="32" fill="#fff"/></g>
          <g class="cloud" style="--d:120s"><ellipse cx="330" cy="360" rx="120" ry="18" fill="#fff" opacity=".5"/><ellipse cx="1010" cy="330" rx="90" ry="14" fill="#fff" opacity=".45"/></g></g>
        <rect y="470" width="1200" height="330" fill="url(#i-sea)"/>
        <rect y="468" width="1200" height="4" fill="#fff" opacity=".35"/>
        ${waves(520, 8, .28)}
        <g transform="translate(600 520) scale(1.25)" class="rise">${island('i')}</g>
        <g transform="translate(880 560) scale(1.3)">${boatSVG}</g>
      </svg>
      <button class="skip" type="button">Skip intro</button>`;
    const svg = intro.querySelector('svg'), fig = intro.querySelector('.fig');
    const b = bubble(intro); talky(fig, b, svg, intro);
    let gone = false;
    const sail = () => {
      if (gone) return; gone = true;
      intro.classList.add('sail');
      setTimeout(() => { intro.classList.add('done'); root.classList.remove('loading');
        try { sessionStorage.setItem('seen', '1'); } catch (e) {}
        dispatchEvent(new Event('intro:done')); }, reduce ? 0 : 1100);
      setTimeout(() => intro.remove(), reduce ? 50 : 2200);
    };
    intro.querySelector('.skip').onclick = sail;
    addEventListener('keydown', e => { if (e.key === 'Escape' && !gone) sail(); });
    setTimeout(() => fig.classList.add('peek'), reduce ? 0 : 1200);
    setTimeout(() => {
      placeBubble(b, svg, fig, intro);
      b.type("Need a break? Hop on the boat — let's sail through Qusai's journey.", () => {
        const go = document.createElement('button'); go.className = 'go'; go.type = 'button'; go.textContent = 'Set sail →'; go.onclick = sail;
        const hint = document.createElement('small'); hint.textContent = 'or click me for more';
        b.querySelector('.act').append(go, hint); go.focus({preventScroll: true});
      });
    }, reduce ? 0 : 1900);
    addEventListener('resize', () => placeBubble(b, svg, fig, intro));
    setTimeout(sail, 12000);   // don't hold anyone hostage
  } else if (intro) intro.remove();

  /* ---------- 2. the shore at the end of the page ---------- */
  const shore = document.getElementById('shore');
  if (shore) {
    shore.innerHTML = `<svg viewBox="0 0 700 300" aria-hidden="false">
        ${defs('e')}
        <g opacity=".9">${waves(232, 3, .22)}</g>
        <g transform="translate(400 238) scale(.92)" class="rise">${island('e')}</g>
      </svg>`;
    const svg = shore.querySelector('svg'), fig = shore.querySelector('.fig');
    const b = bubble(shore); talky(fig, b, svg, shore);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.disconnect(); shore.classList.add('in');
      setTimeout(() => fig.classList.add('peek'), reduce ? 0 : 900);
      setTimeout(() => { placeBubble(b, svg, fig, shore);
        b.type('journey.complete() ✓  Thanks for sailing along — say hello?', () => {
          const a = document.createElement('a'); a.className = 'go'; a.href = 'mailto:qusai.kagalwala53@gmail.com'; a.textContent = 'Write to me →';
          b.querySelector('.act').append(a); }); }, reduce ? 0 : 1500);
    }), {threshold: .5});
    io.observe(shore);
    addEventListener('resize', () => b.classList.contains('on') && placeBubble(b, svg, fig, shore));
  }
})();
