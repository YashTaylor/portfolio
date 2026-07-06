// Ambient life: sakura petals (always), birds (day), fireflies (night).
// One shared fixed canvas, one rAF loop. window.NIGHT (0–1) comes from main.js.
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('ambient');
  if (!canvas || reduced) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let running = false;
  let rafId = null;
  let lastT = 0;

  // ---- sprites (pre-rendered once; no per-frame path fills) ----
  function makePetalSprite(size, color) {
    const s = document.createElement('canvas');
    const pad = 4;
    s.width = s.height = size * 2 + pad * 2;
    const c = s.getContext('2d');
    c.translate(size + pad, size + pad);
    c.fillStyle = color;
    c.beginPath();
    // petal: teardrop with a notched tip
    c.moveTo(0, -size);
    c.bezierCurveTo(size * 0.9, -size * 0.6, size * 0.75, size * 0.6, 0, size);
    c.bezierCurveTo(-size * 0.75, size * 0.6, -size * 0.9, -size * 0.6, 0, -size);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.beginPath();
    c.ellipse(-size * 0.2, -size * 0.25, size * 0.3, size * 0.5, -0.5, 0, Math.PI * 2);
    c.fill();
    return s;
  }

  function makeGlowSprite() {
    const s = document.createElement('canvas');
    s.width = s.height = 36;
    const c = s.getContext('2d');
    const g = c.createRadialGradient(18, 18, 0, 18, 18, 18);
    g.addColorStop(0, 'rgba(216, 240, 150, 0.95)');
    g.addColorStop(0.25, 'rgba(196, 228, 120, 0.5)');
    g.addColorStop(1, 'rgba(180, 220, 100, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 36, 36);
    return s;
  }

  const petalSprites = [];
  ['#E8A7B8', '#F3C6D3'].forEach((color) => {
    [5, 7, 10].forEach((size) => petalSprites.push(makePetalSprite(size, color)));
  });
  const glowSprite = makeGlowSprite();

  // ---- particles ----
  let petals = [];
  let fireflies = [];
  let birds = [];       // active flock members
  let nextFlockAt = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function spawnPetal(fromTop) {
    return {
      sprite: petalSprites[(Math.random() * petalSprites.length) | 0],
      baseX: rand(-40, W + 40),
      y: fromTop ? rand(-60, -10) : rand(0, H),
      vy: rand(16, 34),
      swayAmp: rand(22, 62),
      swayFreq: rand(0.3, 0.8),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-1.2, 1.2),
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

  function spawnFlock(now) {
    const count = 2 + ((Math.random() * 3) | 0);
    const baseY = H * rand(0.08, 0.3);
    const vx = rand(60, 90);
    for (let i = 0; i < count; i++) {
      birds.push({
        x: -40 - i * rand(26, 46),
        y: baseY + rand(-22, 22),
        vx,
        phase: rand(0, Math.PI * 2),
        size: rand(7, 11),
      });
    }
    nextFlockAt = now + rand(18000, 35000);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const petalCount = Math.round(Math.min(Math.max((W * H) / 60000, 8), 22));
    petals = Array.from({ length: petalCount }, () => spawnPetal(false));
    const flyCount = Math.round(Math.min(Math.max((W * H) / 75000, 12), 20));
    fireflies = Array.from({ length: flyCount }, spawnFirefly);
    birds = [];
  }

  function drawBird(b, t) {
    const flap = Math.sin(t * 8 + b.phase) * b.size * 0.55;
    ctx.beginPath();
    ctx.moveTo(b.x - b.size, b.y - flap);
    ctx.quadraticCurveTo(b.x - b.size * 0.4, b.y + b.size * 0.25, b.x, b.y);
    ctx.quadraticCurveTo(b.x + b.size * 0.4, b.y + b.size * 0.25, b.x + b.size, b.y - flap);
    ctx.stroke();
  }

  function step(now) {
    if (!running) return;
    const t = now / 1000;
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const night = window.NIGHT || 0;

    ctx.clearRect(0, 0, W, H);

    // --- petals (fade a little at night) ---
    ctx.globalAlpha = 0.9 - 0.45 * night;
    for (const p of petals) {
      p.y += p.vy * dt;
      p.rot += p.rotSpeed * dt;
      const x = p.baseX + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
      if (p.y > H + 30) Object.assign(p, spawnPetal(true));
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(p.sprite, -p.sprite.width / 2, -p.sprite.height / 2);
      ctx.restore();
    }

    // --- birds (daytime only, not on small screens) ---
    if (W >= 480 && night < 0.5) {
      if (now > nextFlockAt) spawnFlock(now);
      ctx.globalAlpha = (1 - night * 2) * 0.8;
      ctx.strokeStyle = '#3A3630';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (const b of birds) {
        b.x += b.vx * dt;
        drawBird(b, t);
      }
      birds = birds.filter((b) => b.x < W + 60);
    } else {
      birds = [];
    }

    // --- fireflies (night only) ---
    if (night > 0.02) {
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
        ctx.globalAlpha = night * pulse;
        ctx.drawImage(glowSprite, f.x - 18, f.y - 18);
      }
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
