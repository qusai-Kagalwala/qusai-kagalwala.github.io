// "Defend the island": a 45-second arcade mini-game, opened from the island at the end of the Voyage.
// Pirate ships cross the sea after the coconuts. Tap the water to fire the cannon; shots take time to land, so aim ahead.
(() => {
  const btn = document.getElementById('playBtn'); if (!btn) return;
  const SHIP = `<svg viewBox="0 0 104 92"><g stroke="#0c0c10" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
      <path d="M8 60h88l-10 20c-2 4-5 6-9 6H27c-4 0-7-2-9-6z" fill="#4a2c18"/><path d="M12 66h80" stroke="#f2b01e" stroke-width="2.5"/>
      <path d="M52 6v54M30 22v38" fill="none"/>
      <path d="M54 12c16 4 24 14 26 40H54z" fill="#17171c"/><path d="M50 14C36 20 26 32 22 54h28z" fill="#24242c"/>
      <path d="M52 6l16 5-16 5z" fill="#b3261e"/>
      <circle cx="66" cy="33" r="6" fill="#f3eee3"/><path d="M58 43l16 7M74 43l-16 7" stroke="#f3eee3" stroke-width="2.6"/>
      <circle cx="30" cy="73" r="3" fill="#0c0c10"/><circle cx="52" cy="73" r="3" fill="#0c0c10"/><circle cx="74" cy="73" r="3" fill="#0c0c10"/>
    </g></svg>`;
  const ISLE = `<svg viewBox="0 0 320 150">
      <ellipse cx="160" cy="132" rx="158" ry="22" fill="#8fe6dc" opacity=".55"/>
      <path d="M22 132C60 92 260 92 298 132 240 146 80 146 22 132z" fill="#f4e2b4" stroke="#caa66a" stroke-width="2"/>
      <path d="M70 112c40-16 140-16 180 0-50-8-130-8-180 0z" fill="#6fb04f"/>
      <g transform="translate(236 110)"><path d="M0 0C4-28 2-52-8-76" stroke="#8b5a2b" stroke-width="9" fill="none" stroke-linecap="round"/>
        <g transform="translate(-8 -76)"><path d="M0 0C20-22 56-22 76 0 52-10 28-8 0 0z" fill="#1f9a50"/><path d="M0 0C-20-22-56-22-76 0-52-10-28-8 0 0z" fill="#46a83f"/><path d="M0 0C-6-28 6-48 26-58 16-36 12-18 0 0z" fill="#7cc043"/><path d="M0 0C14 8 34 26 36 48 22 30 12 16 0 0z" fill="#c9dc3c"/><path d="M0 0C-14 8-34 26-36 48-22 30-12 16 0 0z" fill="#1f9a50"/><circle cx="-4" cy="5" r="6" fill="#8d6640"/><circle cx="6" cy="7" r="6" fill="#7a5634"/></g></g>
      <g class="nuts"><circle cx="78" cy="112" r="9" fill="#8d6640"/><circle cx="96" cy="116" r="9" fill="#7a5634"/><circle cx="87" cy="102" r="9" fill="#9a7148"/></g>
      <g transform="translate(160 104)"><g class="barrel"><rect x="-9" y="-58" width="18" height="52" rx="6" fill="#23252d" stroke="#0c0c10" stroke-width="2"/><rect x="-11" y="-60" width="22" height="8" rx="3" fill="#3a3d48" stroke="#0c0c10" stroke-width="2"/></g>
        <path d="M-22 0a22 22 0 0 1 44 0z" fill="#7a5230" stroke="#3d2814" stroke-width="2"/><circle cx="-16" cy="2" r="8" fill="#3d2814"/><circle cx="16" cy="2" r="8" fill="#3d2814"/></g>
    </svg>`;

  let g, sea, hudScore, hudTime, hudNuts, layer, barrel, raf = 0, S = null;
  let audioCtx = null, soundOn = true;

  const best = () => { try { return +localStorage.getItem('pirateBest') || 0; } catch (e) { return 0; } };

  // Lightweight synthesized audio (zero network bytes, instantaneous)
  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function sfxShoot() {
    if (!soundOn) return;
    try {
      const ctx = getAudio(), osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.24, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }
  function sfxHit(pts, isCombo) {
    if (!soundOn) return;
    try {
      const ctx = getAudio(), osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isCombo ? 740 : pts >= 30 ? 640 : 480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isCombo ? 980 : 780, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }
  function sfxLoseNut() {
    if (!soundOn) return;
    try {
      const ctx = getAudio(), osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.24);
    } catch (e) {}
  }

  function open(){
    if (g) return;
    g = document.createElement('div'); g.id = 'game'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-label', 'Defend the island mini-game');
    g.innerHTML = `<div class="gm-sky"><i class="gm-sun"></i><i class="gm-cloud c1"></i><i class="gm-cloud c2"></i></div>
      <div class="gm-sea"><i class="gm-w w1"></i><i class="gm-w w2"></i><i class="gm-w w3"></i><div class="gm-layer"></div></div>
      <div class="gm-isle">${ISLE}</div>
      <div class="gm-hud">
        <span>Score <b class="sc">0</b></span>
        <span>Time <b class="tm">45</b></span>
        <span class="nt" aria-label="Coconuts left">🥥🥥🥥</span>
        <button class="gm-mute" type="button" aria-label="Toggle sound" title="Sound">${soundOn ? '🔊' : '🔇'}</button>
        <button class="gm-x" aria-label="Close game">×</button>
      </div>
      <div class="gm-card"></div>`;
    document.body.appendChild(g); document.documentElement.classList.add('gaming');
    sea = g.querySelector('.gm-sea'); layer = g.querySelector('.gm-layer'); barrel = g.querySelector('.barrel');
    hudScore = g.querySelector('.sc'); hudTime = g.querySelector('.tm'); hudNuts = g.querySelector('.nt');
    g.querySelector('.gm-x').onclick = close;
    const muteBtn = g.querySelector('.gm-mute');
    muteBtn.onclick = () => {
      soundOn = !soundOn;
      muteBtn.textContent = soundOn ? '🔊' : '🔇';
    };
    sea.addEventListener('pointerdown', shoot);
    addEventListener('keydown', esc);
    card(`<p class="k">A 45-second arcade game</p><h3>Defend the <i>island</i></h3><p>Pirate ships are hunting the island's coconuts! Tap anywhere on the sea to fire the cannon. Shots take flight time, so lead your targets. Far ships give higher points.</p>
      <div class="acts"><button class="btn fill" data-a="start">Start Game</button><button class="btn" data-a="close">Not now</button></div>${best() ? `<small>Your personal best: <b>${best()} pts</b></small>` : ''}`);
  }
  const esc = e => { if (e.key === 'Escape') close(); };
  function close(){ cancelAnimationFrame(raf); removeEventListener('keydown', esc); if (g) g.remove(); g = null; S = null; document.documentElement.classList.remove('gaming'); btn.focus({preventScroll: true}); }
  function card(html){ const c = g.querySelector('.gm-card'); c.innerHTML = html; c.classList.add('on');
    c.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; if (a.dataset.a === 'start') start(); else close(); }; }

  function start(){
    g.querySelector('.gm-card').classList.remove('on'); layer.innerHTML = '';
    S = { t0: performance.now(), last: performance.now(), score: 0, nuts: 3, ships: [], balls: [], nextSpawn: 350, lastShot: 0, lastHitTime: 0, combo: 0, over: false };
    hud(); raf = requestAnimationFrame(tick);
  }
  const hud = () => {
    hudScore.textContent = S.score;
    hudNuts.textContent = '🥥'.repeat(S.nuts) + '💔'.repeat(Math.max(0, 3 - S.nuts));
  };
  const LANES = [{ y: .16, s: .5, v: 72, pts: 30 }, { y: .36, s: .75, v: 108, pts: 20 }, { y: .58, s: 1, v: 144, pts: 10 }];
  function spawn(elapsed){
    const W = sea.clientWidth, H = sea.clientHeight, L = LANES[Math.floor(Math.random() * 3)], dir = Math.random() < .5 ? 1 : -1;
    const w = 104 * L.s * (W < 600 ? .8 : 1), el = document.createElement('div'); el.className = 'gm-ship'; el.innerHTML = SHIP;
    el.style.width = w + 'px'; el.style.zIndex = Math.round(L.y * 10); layer.appendChild(el);
    const speed = L.v * (1 + elapsed / 45000 * .7) * (W < 600 ? .7 : 1) * (.85 + Math.random() * .3);
    S.ships.push({ el, x: dir > 0 ? -w : W, y: H * L.y, w, h: w * .88, vx: dir * speed, pts: L.pts, dir, alive: true });
  }
  function mouth(){ const r = barrel.getBoundingClientRect(), s = sea.getBoundingClientRect(); return [r.left + r.width / 2 - s.left, r.top - s.top + 6]; }
  
  function shoot(e){
    if (!S || S.over) return; const now = performance.now(); if (now - S.lastShot < 280) return; S.lastShot = now;
    const s = sea.getBoundingClientRect(), tx = e.clientX - s.left, ty = e.clientY - s.top, [mx, my] = mouth();
    
    // Aim cannon with animated recoil kickback
    const angle = Math.atan2(tx - mx, my - ty) * 57.3;
    barrel.style.transform = `rotate(${angle}deg)`;
    barrel.animate([
      { transform: `rotate(${angle}deg) scale(1, 1)` },
      { transform: `rotate(${angle}deg) scale(0.86, 0.76)`, offset: 0.25 },
      { transform: `rotate(${angle}deg) scale(1, 1)` }
    ], { duration: 220, easing: 'ease-out' });

    // Target reticle indicator at impact point
    const ret = document.createElement('i');
    ret.className = 'gm-reticle';
    ret.style.cssText = `left:${tx}px;top:${ty}px`;
    layer.appendChild(ret);
    setTimeout(() => ret.remove(), 560);

    // Muzzle flash
    const fl = document.createElement('i');
    fl.className = 'gm-flash';
    fl.style.cssText = `left:${mx}px;top:${my}px`;
    layer.appendChild(fl);
    setTimeout(() => fl.remove(), 180);

    const el = document.createElement('i'); el.className = 'gm-ball'; layer.appendChild(el);
    const dist = Math.hypot(tx - mx, ty - my);
    S.balls.push({ el, mx, my, tx, ty, t: 0, dur: Math.max(.28, dist / 780) });
    puff(mx, my, '#fff3c4', 6, 26);
    sfxShoot();
  }

  function puff(x, y, color, n, r){
    for (let i = 0; i < n; i++) { const d = document.createElement('i'); d.className = 'gm-drop'; d.style.cssText = `left:${x}px;top:${y}px;background:${color}`; layer.appendChild(d);
      const a = Math.random() * Math.PI * 2, rr = r * (.4 + Math.random());
      d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * rr}px,${Math.sin(a) * rr - r * .5}px) scale(.3)`, opacity: 0 }], { duration: 520 + Math.random() * 260, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => d.remove(); }
  }

  function splinters(x, y){
    for (let i = 0; i < 5; i++) {
      const sp = document.createElement('i'); sp.className = 'gm-splinter';
      sp.style.cssText = `left:${x}px;top:${y}px`; layer.appendChild(sp);
      const a = Math.random() * Math.PI * 2, dist = 20 + Math.random() * 45;
      sp.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist + 22}px) rotate(${Math.random()*360}deg)`, opacity: 0 }
      ], { duration: 600, easing: 'ease-out' }).onfinish = () => sp.remove();
    }
  }

  function float(x, y, text, isCombo){
    const f = document.createElement('b');
    f.className = isCombo ? 'gm-combo' : 'gm-pts';
    f.textContent = text;
    f.style.cssText = `left:${x}px;top:${y}px`;
    layer.appendChild(f);
    f.animate([
      { transform: 'translate(-50%,0) scale(1)', opacity: 1 },
      { transform: `translate(-50%,-${isCombo ? 56 : 46}px) scale(${isCombo ? 1.15 : 1})`, opacity: 0 }
    ], { duration: isCombo ? 1100 : 900, easing: 'ease-out' }).onfinish = () => f.remove();
  }

  function tick(now){
    if (!S) return; const dt = Math.min(.05, (now - S.last) / 1000); S.last = now;
    const elapsed = now - S.t0, left = Math.max(0, 45 - elapsed / 1000), W = sea.clientWidth;
    hudTime.textContent = Math.ceil(left);
    if (left <= 10) hudTime.classList.add('urgent');
    else hudTime.classList.remove('urgent');

    if (elapsed > S.nextSpawn) { spawn(elapsed); S.nextSpawn = elapsed + Math.max(620, 1450 - elapsed / 45000 * 850) * (.7 + Math.random() * .6); }
    
    for (const s of S.ships) { if (!s.alive) continue; s.x += s.vx * dt;
      s.el.style.transform = `translate(${s.x}px,${s.y}px) scaleX(${s.dir > 0 ? -1 : 1})`;
      if ((s.dir > 0 && s.x > W + 10) || (s.dir < 0 && s.x < -s.w - 10)) {
        s.alive = false; s.el.remove(); S.nuts--; S.combo = 0; hud();
        sfxLoseNut();
        g.classList.remove('hit'); void g.offsetWidth; g.classList.add('hit');
        const nut = g.querySelector('.nuts circle:last-child'); if (nut) nut.remove();
      }
    }

    for (const b of S.balls) {
      b.t += dt / b.dur; const k = Math.min(1, b.t), x = b.mx + (b.tx - b.mx) * k, y = b.my + (b.ty - b.my) * k - Math.sin(k * Math.PI) * 70, sc = 1 - k * .45;
      b.el.style.transform = `translate(${x}px,${y}px) scale(${sc})`;
      if (k >= 1) {
        b.done = true; b.el.remove();
        const hit = S.ships.find(s => s.alive && b.tx > s.x - 8 && b.tx < s.x + s.w + 8 && b.ty > s.y - 6 && b.ty < s.y + s.h + 10);
        if (hit) {
          hit.alive = false;
          const isCombo = now - S.lastHitTime < 2400;
          S.combo = isCombo ? S.combo + 1 : 1;
          S.lastHitTime = now;
          const comboBonus = (S.combo - 1) * 10;
          const earned = hit.pts + comboBonus;
          S.score += earned;
          hud();
          sfxHit(hit.pts, S.combo > 1);
          puff(b.tx, b.ty, '#f2b01e', 12, 48);
          puff(b.tx, b.ty + 14, '#d6f1fb', 10, 56);
          splinters(b.tx, b.ty);
          float(b.tx, b.ty - 12, '+' + earned + (hit.pts >= 30 ? ' (Long Shot!)' : ''));
          if (S.combo > 1) float(b.tx, b.ty - 34, `COMBO ×${S.combo}! 🔥`, true);
          hit.el.animate([
            { translate: '0 0', rotate: '0deg', opacity: 1 },
            { translate: '0 14px', rotate: `${hit.dir * 14}deg`, opacity: 1, offset: .45 },
            { translate: '0 70px', rotate: `${hit.dir * 34}deg`, opacity: 0 }
          ], { duration: 900, easing: 'ease-in', composite: 'add' }).onfinish = () => hit.el.remove();
        } else {
          puff(b.tx, b.ty, '#d6f1fb', 7, 34);
        }
      }
    }

    S.balls = S.balls.filter(b => !b.done); S.ships = S.ships.filter(s => s.alive);
    if (left <= 0 || S.nuts <= 0) return finish(S.nuts > 0);
    raf = requestAnimationFrame(tick);
  }

  function finish(survived){
    S.over = true; const sc = S.score, prev = best(), record = sc > prev;
    if (record) { try { localStorage.setItem('pirateBest', sc); } catch (e) {} }
    card(`
      ${record && sc ? '<div class="trophy">🏆</div><span class="record-pill">New Personal Best!</span>' : ''}
      <p class="k">${survived ? 'Island Defended!' : 'The Coconuts Were Taken'}</p>
      <h3>${sc} <i>points</i></h3>
      <p>${record && sc ? 'Incredible accuracy! You set a brand-new high score record.' : survived ? 'Splendid shooting! The coconuts and island remain safe.' : 'They grabbed the haul. Aim slightly ahead of moving ships to lead your shots!'}${prev && !record ? ` Your all-time record is <b>${prev} pts</b>.` : ''}</p>
      <div class="acts">
        <button class="btn fill" data-a="start">Play Again</button>
        <button class="btn" data-a="close">Back to Portfolio</button>
      </div>
    `);
  }

  btn.addEventListener('click', open);
})();
