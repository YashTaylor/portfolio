// Ambient life for the Night Shrine: rising ember sparks + fireflies.
// One shared fixed canvas, one rAF loop.
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('ambient');
  if (!canvas || reduced) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let running = false;
  let rafId = null;
  let lastT = 0;

  // ---- pre-rendered glow sprites ----
  function makeGlow(size, stops) {
    const s = document.createElement('canvas');
    s.width = s.height = size * 2;
    const c = s.getContext('2d');
    const g = c.createRadialGradient(size, size, 0, size, size, size);
    stops.forEach(([offset, color]) => g.addColorStop(offset, color));
    c.fillStyle = g;
    c.fillRect(0, 0, size * 2, size * 2);
    return s;
  }

  // warm ember sparks (gold-orange)
  const emberSprites = [
    makeGlow(5, [[0, 'rgba(255, 214, 140, 0.95)'], [0.3, 'rgba(240, 170, 80, 0.5)'], [1, 'rgba(220, 130, 50, 0)']]),
    makeGlow(7, [[0, 'rgba(255, 200, 110, 0.9)'], [0.3, 'rgba(230, 150, 70, 0.45)'], [1, 'rgba(210, 120, 40, 0)']]),
    makeGlow(9, [[0, 'rgba(255, 224, 160, 0.85)'], [0.3, 'rgba(240, 180, 90, 0.4)'], [1, 'rgba(220, 140, 60, 0)']]),
  ];
  // cool green firefly glow
  const fireflySprite = makeGlow(18, [
    [0, 'rgba(216, 240, 150, 0.95)'],
    [0.25, 'rgba(196, 228, 120, 0.5)'],
    [1, 'rgba(180, 220, 100, 0)'],
  ]);

  // ---- particles ----
  let embers = [];
  let fireflies = [];

  const rand = (a, b) => a + Math.random() * (b - a);

  function spawnEmber(fromBottom) {
    return {
      sprite: emberSprites[(Math.random() * emberSprites.length) | 0],
      baseX: rand(-20, W + 20),
      y: fromBottom ? rand(H + 10, H + 60) : rand(H * 0.25, H),
      vy: rand(8, 20),                 // rising speed
      swayAmp: rand(12, 40),
      swayFreq: rand(0.25, 0.7),
      phase: rand(0, Math.PI * 2),
      flicker: rand(1.5, 3.5),
      life: rand(0.6, 1),              // brightness multiplier
    };
  }

  function spawnFirefly() {
    return {
      x: rand(0, W),
      y: rand(H * 0.35, H * 0.95),
      vx: rand(-14, 14),
      vy: rand(-9, 9),
      phase: rand(0, Math.PI * 2),
      pulse: rand(1.6, 3),
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const emberCount = Math.round(Math.min(Math.max((W * H) / 75000, 10), 18));
    embers = Array.from({ length: emberCount }, () => spawnEmber(false));
    const flyCount = Math.round(Math.min(Math.max((W * H) / 80000, 10), 18));
    fireflies = Array.from({ length: flyCount }, spawnFirefly);
  }

  function step(now) {
    if (!running) return;
    const t = now / 1000;
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    ctx.clearRect(0, 0, W, H);

    // --- embers rising ---
    for (const e of embers) {
      e.y -= e.vy * dt;
      const x = e.baseX + Math.sin(t * e.swayFreq + e.phase) * e.swayAmp;
      if (e.y < -30) Object.assign(e, spawnEmber(true));

      // flicker + fade out toward the top of the viewport
      const heightFade = Math.min(Math.max(e.y / (H * 0.35), 0), 1);
      const flicker = 0.55 + 0.45 * Math.sin(t * e.flicker + e.phase);
      ctx.globalAlpha = 0.75 * e.life * flicker * heightFade;
      ctx.drawImage(e.sprite, x - e.sprite.width / 2, e.y - e.sprite.height / 2);
    }

    // --- fireflies ---
    for (const f of fireflies) {
      f.vx += rand(-8, 8) * dt;
      f.vy += rand(-8, 8) * dt;
      f.vx = Math.max(-20, Math.min(20, f.vx));
      f.vy = Math.max(-14, Math.min(14, f.vy));
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      // soft-bound to lower 65% of the viewport
      if (f.x < -20) f.x = W + 20;
      if (f.x > W + 20) f.x = -20;
      if (f.y < H * 0.35) f.vy += 6 * dt;
      if (f.y > H + 10) f.y = H * 0.6;

      const pulse = 0.3 + 0.7 * Math.pow(Math.sin(t * f.pulse + f.phase), 2);
      ctx.globalAlpha = 0.85 * pulse;
      ctx.drawImage(fireflySprite, f.x - 18, f.y - 18);
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(step);
  }

  function setRunning(on) {
    if (on && !running) {
      running = true;
      lastT = performance.now();
      rafId = requestAnimationFrame(step);
    } else if (!on && running) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden));

  resize();
  setRunning(true);
})();
