const scenes = [
  {
    id: 'horror',
    title: 'Horror — The Last Light',
    hook: 'A lamp glows. A switch dangles. Tap twice in the corner to wake the watcher.',
    palette: ['#090909', '#2a1117', '#8f1027'],
    beats: ['The room breathes in static.', 'Whispers slip between letters.', 'MAJOR REVEAL: the silhouette steps into your blind spot.'],
    majorAfterMs: 70000
  },
  { id: 'scifi', title: 'Sci‑Fi — Drift Protocol', hook: 'Drag through star lanes. Every pulse distorts the orbit mesh.', palette: ['#030816', '#191c57', '#2f7bff'], beats: ['A planet fractures into holograms.', 'Crosshair sync established.', 'MAJOR REVEAL: hyperspace fold unlocked.'], majorAfterMs: 86000 },
  { id: 'romance', title: 'Romance — Letters of Dawn', hook: 'Petals float over saved memories. Chapters unfold as you descend.', palette: ['#321626', '#7b3857', '#f4a4cd'], beats: ['An unopened letter glows warm gold.', 'Two timelines overlap in melody.', 'MAJOR REVEAL: the final vow appears.'], majorAfterMs: 98000 },
  { id: 'fantasy', title: 'Fantasy — Emberwood Oath', hook: 'Ancient runes hover over an enchanted map. Tap to cast wisps.', palette: ['#03160f', '#14513b', '#63ecc2'], beats: ['Forest lights gather into sigils.', 'A hidden road draws itself.', 'MAJOR REVEAL: skyforge guardian descends.'], majorAfterMs: 108000 },
  { id: 'mystery', title: 'Mystery — Neon Casefile', hook: 'Storm-soaked signs flicker over a living evidence board.', palette: ['#05070f', '#0b2340', '#80a5ff'], beats: ['Thread lines connect unknown suspects.', 'The final code appears in rain.', 'MAJOR REVEAL: culprit reflection surfaces in glass.'], majorAfterMs: 118000 }
];

const app = document.querySelector('#app');
const nav = document.querySelector('#nav');
const tpl = document.querySelector('#sceneTemplate');
const canvas = document.querySelector('#worldFx');
const reticle = document.querySelector('#reticle');

const S = { pointer: { x: innerWidth / 2, y: innerHeight / 2 }, scrollY: 0, particles: [], stars: [], audioOn: false, audio: {} };

function createSceneCard(scene) {
  const sec = tpl.content.firstElementChild.cloneNode(true);
  sec.id = scene.id;
  sec.classList.add(scene.id);
  sec.querySelector('h2').textContent = scene.title;
  sec.querySelector('.hook').textContent = scene.hook;
  const timeline = sec.querySelector('.timeline');
  scene.beats.forEach((b) => {
    const p = document.createElement('p');
    p.className = 'beat';
    p.textContent = b;
    timeline.appendChild(p);
  });
  paintScene(sec, scene.palette);
  wireScene(sec, scene);
  app.appendChild(sec);

  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.textContent = scene.id;
  chip.addEventListener('click', () => sec.scrollIntoView({ behavior: 'smooth' }), { passive: true });
  nav.appendChild(chip);
}

function paintScene(sec, [a, b, c]) {
  sec.querySelector('.sky').style.background = `radial-gradient(circle at 20% 20%,${c}66,transparent 45%),linear-gradient(${a},${b})`;
  sec.querySelector('.haze').style.background = `repeating-linear-gradient(130deg, transparent 0 18px, ${c}22 18px 24px)`;
  sec.querySelector('.land').style.background = `radial-gradient(circle at 70% 85%, ${c}80, transparent 40%)`;
  sec.querySelector('.foreground').style.background = `linear-gradient(to top, #000000cc 0%, transparent 45%)`;
}

function wireScene(sec, scene) {
  const beats = [...sec.querySelectorAll('.beat')];
  let secret = 0;

  sec.querySelector('.reveal').addEventListener('click', () => emit(20, scene.palette[2]), { passive: true });
  sec.addEventListener('pointerdown', () => emit(14, scene.palette[2]), { passive: true });
  sec.querySelector('.easter-zone').addEventListener('click', () => {
    secret += 1;
    if (secret === 2) {
      sec.classList.add('reveal-major');
      emit(95, '#ffffff');
      setTimeout(() => sec.classList.remove('reveal-major'), 1800);
    }
  }, { passive: true });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        sec.classList.add('active');
        beats.forEach((el, i) => setTimeout(() => el.classList.add('show'), i * 1200));
      }
    });
  }, { threshold: 0.35 });
  io.observe(sec);

  setTimeout(() => {
    sec.classList.add('reveal-major');
    const note = document.createElement('div');
    note.className = 'glass';
    note.style.cssText = 'position:absolute;left:1rem;bottom:1rem;padding:.55rem .7rem;z-index:12';
    note.textContent = `${scene.id.toUpperCase()} MAJOR EVENT`;
    sec.appendChild(note);
    emit(120, scene.palette[2]);
  }, scene.majorAfterMs);
}

function emit(count, color) {
  for (let i = 0; i < count; i += 1) {
    S.particles.push({ x: S.pointer.x, y: S.pointer.y + S.scrollY, vx: (Math.random() - 0.5) * 2.4, vy: (Math.random() - 0.5) * 2.4, life: 70 + Math.random() * 100, color });
  }
}

function initStars() {
  for (let i = 0; i < 140; i += 1) S.stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, s: Math.random() * 1.8 + 0.2 });
}

function tick() {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  S.stars.forEach((s) => {
    ctx.fillStyle = '#b8d8ff55';
    ctx.fillRect(s.x, (s.y + S.scrollY * 0.03) % innerHeight, s.s, s.s);
  });

  S.particles = S.particles.filter((p) => p.life > 0);
  S.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    const alpha = Math.max(0.1, p.life / 170).toFixed(2);
    ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.fillRect(p.x, p.y - S.scrollY, 2, 2);
  });
  requestAnimationFrame(tick);
}

function syncParallax() {
  document.querySelectorAll('.scene').forEach((sec) => {
    const t = sec.getBoundingClientRect().top / innerHeight;
    sec.querySelectorAll('.layer').forEach((layer) => {
      const d = Number(layer.dataset.depth);
      layer.style.transform = `translate3d(0, ${-t * (90 * d)}px, 0) scale(${1 + d * 0.2})`;
    });
  });
}

function startAudio() {
  if (!S.audio.ctx) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0.05;
    master.connect(ctx.destination);
    S.audio = { ctx, master, nodes: [] };
  }
  const base = [90, 130, 170, 210, 240];
  base.forEach((freq, i) => {
    const osc = S.audio.ctx.createOscillator();
    const gain = S.audio.ctx.createGain();
    osc.type = i === 0 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.005;
    osc.connect(gain);
    gain.connect(S.audio.master);
    osc.start();
    S.audio.nodes.push(osc);
  });
}

function bootstrap() {
  scenes.forEach(createSceneCard);
  initStars();
  addEventListener('pointermove', (e) => {
    S.pointer.x = e.clientX;
    S.pointer.y = e.clientY;
    reticle.style.left = `${e.clientX}px`;
    reticle.style.top = `${e.clientY}px`;
  }, { passive: true });
  addEventListener('scroll', () => { S.scrollY = scrollY; syncParallax(); }, { passive: true });
  addEventListener('resize', () => syncParallax(), { passive: true });

  document.querySelector('#audioBtn').addEventListener('click', () => {
    S.audioOn = !S.audioOn;
    document.querySelector('#audioBtn').textContent = S.audioOn ? 'Audio On' : 'Audio Off';
    if (S.audioOn) startAudio();
    if (!S.audioOn && S.audio.master) S.audio.master.gain.value = 0;
    if (S.audioOn && S.audio.master) S.audio.master.gain.value = 0.05;
  }, { passive: true });

  syncParallax();
  tick();
}

bootstrap();
