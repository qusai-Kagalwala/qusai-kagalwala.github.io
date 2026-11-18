// Gallery mode: a museum wall. One drawing under the spotlight at a time; you walk from frame to frame.
(() => {
  const root = document.documentElement;
  if (root.dataset.mode !== 'gallery') return;
  const el = document.getElementById('gallery'); if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  // hung in the order they were drawn: sketchbook page 40 is the first drawing, page 1 the newest
  const PAGES = Array.from({ length: 40 }, (_, i) => 40 - i);
  const FAN = new Set([4, 16, 18, 22, 31]);          // tributes to other people's characters
  const bays = [
    `<div class="g-text"><p class="k">Qusai Kagalwala</p><h2>The <i>Sketchbook</i></h2>
       <p>Forty pages of ink, marker, watercolour and pencil, hung in the order they were drawn. Each one gets the wall to itself.</p>
       <p class="hint">walk this way →</p></div>`,
    ...PAGES.map((p, i) => `<figure class="g-frame"><img data-src="art/${pad(p)}.jpg" alt="Sketchbook page ${p}" decoding="async" draggable="false"></figure>
       <div class="g-plaque"><b>No. ${i + 1}</b>Sketchbook, page ${p}${FAN.has(p) ? ' · fan art' : ''}<br><em>Qusai Kagalwala${i === 0 ? ' · the first page' : i === 39 ? ' · the newest page' : ''}</em></div>`),
    `<div class="g-text"><p class="k">End of the wall</p><h2>Thanks for <i>visiting.</i></h2>
       <p>The same hands also build software. If you'd like to see that side, or just say hello:</p>
       <div class="acts"><button class="btn fill" data-go="voyage">Take the voyage</button><button class="btn" data-go="pro">See the work</button><a class="btn" href="mailto:qusai.kagalwala53@gmail.com">Write to me</a></div></div>`,
  ];
  const N = bays.length;

  el.innerHTML = `
    <div class="g-view">
      <div class="g-wall"><div class="g-track">${bays.map((b, i) => `<section class="g-bay" data-i="${i}" aria-hidden="${i ? 'true' : 'false'}"><div class="g-glow"></div><div class="g-lamp"></div>${b}</section>`).join('')}</div></div>
      <div class="g-skirt"></div><div class="g-floor"></div><div class="g-shine"></div>
    </div>
    <div class="g-top"><a class="mark" href="#top" aria-label="Qusai Kagalwala — home">qusai<span>.</span></a></div>
    <button class="g-side l" aria-label="Previous drawing">←</button><button class="g-side r" aria-label="Next drawing">→</button>
    <div class="g-hud">
      <div class="g-ticks" role="group" aria-label="Jump to a drawing">${PAGES.map((p, i) => `<button data-i="${i + 1}" aria-label="No. ${i + 1}"></button>`).join('')}</div>
      <div class="g-ctrl"><button class="prev" aria-label="Previous">←</button><span class="n" aria-live="polite"></span><button class="next" aria-label="Next">→</button><button class="tour">Guided tour</button></div>
      <div class="modes"></div>
    </div>`;

  const track = el.querySelector('.g-track'), floor = el.querySelector('.g-floor'), bayEls = [...el.querySelectorAll('.g-bay')];
  const ticks = [...el.querySelectorAll('.g-ticks button')], label = el.querySelector('.g-ctrl .n');
  const sideL = el.querySelector('.g-side.l'), sideR = el.querySelector('.g-side.r'), tourBtn = el.querySelector('.tour');
  let idx = 0, lock = 0, tour = null;

  const need = i => { const im = bayEls[i] && bayEls[i].querySelector('img[data-src]'); if (im) { im.src = im.dataset.src; im.removeAttribute('data-src'); } };
  function go(to, fromTour){
    to = Math.max(0, Math.min(N - 1, to)); if (to === idx) return;
    if (!fromTour) stopTour();
    const steps = Math.abs(to - idx), dur = reduce ? 0 : Math.min(2.4, 1.05 + (steps - 1) * .22);
    for (let i = to - 1; i <= to + 2; i++) need(i);
    el.style.setProperty('--dur', dur + 's');
    el.classList.remove('g-walking'); void el.offsetWidth; el.classList.add('g-walking');
    clearTimeout(lock); lock = setTimeout(() => el.classList.remove('g-walking'), dur * 1000);
    idx = to; paint();
  }
  function paint(){
    track.style.transform = `translateX(${-idx * 100}vw)`;
    floor.style.backgroundPosition = `0 0, ${-idx * 420}px 0`;
    bayEls.forEach((b, i) => { b.classList.toggle('on', i === idx); b.setAttribute('aria-hidden', i === idx ? 'false' : 'true'); });
    ticks.forEach((t, i) => t.classList.toggle('on', i + 1 === idx));
    label.innerHTML = idx === 0 ? 'Entrance' : idx === N - 1 ? 'Exit' : `${pad(idx)} <small>/ 40</small>`;
    sideL.disabled = idx === 0; sideR.disabled = idx === N - 1;
  }
  const next = () => go(idx + 1), prev = () => go(idx - 1);
  function stopTour(){ if (tour) { clearInterval(tour); tour = null; tourBtn.classList.remove('on'); tourBtn.textContent = 'Guided tour'; } }
  tourBtn.onclick = () => { if (tour) return stopTour();
    tourBtn.classList.add('on'); tourBtn.textContent = 'Pause tour';
    if (idx >= N - 1) go(0, true); else go(idx + 1, true);
    tour = setInterval(() => { if (idx >= N - 1) stopTour(); else go(idx + 1, true); }, 5200); };

  el.querySelector('.prev').onclick = prev; el.querySelector('.next').onclick = next; sideL.onclick = prev; sideR.onclick = next;
  el.querySelector('.g-ticks').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); });
  el.querySelector('.g-wall').addEventListener('click', e => { if (e.target.closest('a,button')) return; const x = e.clientX / innerWidth; if (x > .62) next(); else if (x < .38) prev(); });
  el.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && window.__setMode) window.__setMode(b.dataset.go); });
  addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    if (e.key === 'Home') go(0); if (e.key === 'End') go(N - 1);
  });
  let wheelAt = 0;
  el.addEventListener('wheel', e => { e.preventDefault(); const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 18 || Date.now() - wheelAt < 900) return; wheelAt = Date.now(); d > 0 ? next() : prev(); }, { passive: false });
  let sx = 0, sy = 0;
  el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev(); });

  need(1); need(2); paint();
  document.title = 'The Sketchbook — Qusai Kagalwala';
})();
