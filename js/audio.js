// Ambient audio: synthesized wind + fūrin wind chimes (Web Audio API).
// Muted by default; AudioContext is created lazily on the first toggle click.
(function () {
  const button = document.getElementById('audio-toggle');
  if (!button) return;

  let ctx = null;
  let masterGain = null;
  let chimeGain = null;
  let chimeTimer = null;
  let enabled = false;

  // Hirajoshi scale on A4 — gentle pentatonic, never dissonant
  const SCALE = [440, 493.88, 523.25, 659.26, 698.46, 880, 987.77];

  function buildWind() {
    // 4s looped pinkish-noise buffer (one-pole lowpassed white noise)
    const len = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) {
      b = 0.98 * b + 0.02 * (Math.random() * 2 - 1);
      data[i] = b * 3.2;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    filter.Q.value = 0.5;

    // slow "breathing" of the wind
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 150;
    lfo.connect(lfoGain).connect(filter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;

    src.connect(filter).connect(windGain).connect(masterGain);
    src.start();
    lfo.start();
  }

  function strikeChime(freq, when) {
    const strike = ctx.createGain();
    strike.gain.setValueAtTime(0, when);
    strike.gain.linearRampToValueAtTime(0.12, when + 0.008);
    strike.gain.exponentialRampToValueAtTime(0.0001, when + 4);

    [freq, freq * 1.003].forEach((f) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = f;
      osc.connect(strike);
      osc.start(when);
      osc.stop(when + 4.2);
    });
    // faint metallic partial
    const partial = ctx.createOscillator();
    partial.frequency.value = freq * 2.76;
    const partialGain = ctx.createGain();
    partialGain.gain.value = 0.15;
    partial.connect(partialGain).connect(strike);
    partial.start(when);
    partial.stop(when + 4.2);

    strike.connect(chimeGain);
    // gentle echo
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.35;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.22;
    strike.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(chimeGain);
  }

  function scheduleChimes() {
    const wait = 7000 + Math.random() * 11000;
    chimeTimer = setTimeout(() => {
      if (enabled && ctx && ctx.state === 'running') {
        const notes = 1 + ((Math.random() * 3) | 0);
        for (let i = 0; i < notes; i++) {
          const freq = SCALE[(Math.random() * SCALE.length) | 0];
          strikeChime(freq, ctx.currentTime + i * (0.18 + Math.random() * 0.3));
        }
      }
      scheduleChimes();
    }, wait);
  }

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    chimeGain = ctx.createGain();
    chimeGain.gain.value = 0.5;
    chimeGain.connect(masterGain);

    buildWind();
    scheduleChimes();
  }

  function setEnabled(on) {
    enabled = on;
    button.classList.toggle('on', on);
    button.setAttribute('aria-pressed', String(on));

    if (on) {
      ctx.resume().then(() => {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 1.5);
      });
    } else {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(() => {
        if (!enabled && ctx.state === 'running') ctx.suspend();
      }, 1400);
    }
  }

  button.addEventListener('click', () => {
    if (!ctx) init(); // user gesture — safe to create the context here
    setEnabled(!enabled);
  });

  // pause when the tab is hidden; resume if still enabled
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden && ctx.state === 'running') {
      ctx.suspend();
    } else if (!document.hidden && enabled) {
      ctx.resume();
    }
  });
})();
