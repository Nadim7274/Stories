const genres = [
  {
    id: 'horror',
    title: 'Horror — The Last Switch',
    lead: 'A warm room hums. A hanging switch dares you to turn the lights off.',
    colors: ['#120f0f','#32070e','#780f1d'],
    beats: [
      'A portrait blinks when you are not staring.',
      'Letters slip off the wall and whisper your name.',
      'Major reveal: a silhouette appears behind the lamp.'
    ]
  },
  { id:'scifi', title:'Sci‑Fi — Drift Protocol', lead:'Reticle online. Drag the starfield and trace unknown orbits.', colors:['#030915','#29114f','#1f7bff'], beats:['A moon fractures into geometric shards.','Your pulse syncs with ship telemetry.','Major reveal: hyperspace tears open.']},
  { id:'romance', title:'Romance — Letters in Bloom', lead:'Petals drift around handwritten promises.', colors:['#2c1020','#79344e','#f7a6ca'], beats:['A folded letter opens with a glow.','Old photos phase in as if remembered.','Major reveal: two timelines merge in one vow.']},
  { id:'fantasy', title:'Fantasy — Emberwood Oath', lead:'An enchanted grove breathes with glyph-lit mist.', colors:['#06170f','#144a38','#5ef0bf'], beats:['Wisps gather into a hidden map.','Runes awaken beneath your steps.','Major reveal: the skyforge dragon descends.']},
  { id:'mystery', title:'Mystery — Neon Casefile', lead:'Rain, static and clues stitched across midnight streets.', colors:['#05060f','#0b2441','#4a83d8'], beats:['A clue board auto-connects suspect strings.','A coded number flickers in neon.','Major reveal: culprit reflection appears in glass.']}
];

const root = document.querySelector('#storyRoot');
const nav = document.querySelector('#genreNav');
const tpl = document.querySelector('#sectionTemplate');
const state = { audio:false, particles:[], pointer:{x:innerWidth/2,y:innerHeight/2}, scrollY:0 };

function buildSections(){
  genres.forEach((g, i)=>{
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.classList.add(g.id);
    node.id = g.id;
    node.querySelector('h2').textContent = g.title;
    node.querySelector('.lead').textContent = g.lead;
    const beats = node.querySelector('.beats');
    g.beats.forEach(b=>{ const p=document.createElement('p'); p.className='beat'; p.textContent=b; beats.appendChild(p); });
    paintParallax(node, g.colors);
    hookInteractions(node, g, i);
    root.appendChild(node);

    const b = document.createElement('button');
    b.className='pill'; b.textContent = g.id;
    b.onclick = ()=> node.scrollIntoView({behavior:'smooth'});
    nav.appendChild(b);
  });
}

function paintParallax(section, [c1,c2,c3]) {
  section.querySelector('.back').style.background = `radial-gradient(circle at 30% 30%,${c3}40,transparent 55%),linear-gradient(${c1},${c2})`;
  section.querySelector('.mid').style.background = `repeating-linear-gradient(120deg,transparent 0 20px,${c3}18 20px 24px)`;
  section.querySelector('.front').style.background = `radial-gradient(circle at 75% 65%,${c3}88,transparent 40%)`;
}

function hookInteractions(section, genre, idx){
  const revealBtn = section.querySelector('.reveal-btn');
  const beats = [...section.querySelectorAll('.beat')];
  let hiddenTapCount = 0;
  revealBtn.addEventListener('click', ()=>emit(section, 20, genre.colors[2]), {passive:true});
  section.querySelector('.secret-hit').addEventListener('click', ()=>{
    hiddenTapCount++;
    if(hiddenTapCount===2){ section.classList.add('easter'); emit(section, 70, '#fff'); }
  }, {passive:true});
  section.addEventListener('pointerdown', ()=>emit(section, 14, genre.colors[2]), {passive:true});

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        section.style.setProperty('--active', 1);
        beats.forEach((b,i)=>setTimeout(()=>b.classList.add('visible'), 800*i));
      }
    });
  }, {threshold:.35});
  io.observe(section);

  setTimeout(()=>{
    const major=document.createElement('div');
    major.className='glass';
    major.style.cssText='position:absolute;inset:auto 1rem 1rem auto;padding:.6rem;z-index:5';
    major.textContent=`${genre.id.toUpperCase()} EVENT UNLOCKED`;
    section.appendChild(major);
  }, 55000 + idx*15000);
}

function emit(section, count, color){
  const r = section.getBoundingClientRect();
  for(let i=0;i<count;i++){
    state.particles.push({
      x:state.pointer.x, y:state.pointer.y + state.scrollY,
      vx:(Math.random()-.5)*1.8, vy:(Math.random()-.5)*1.8,
      life:70+Math.random()*80, color
    });
  }
}

function setupGlobal(){
  addEventListener('pointermove', e=>{state.pointer.x=e.clientX; state.pointer.y=e.clientY;}, {passive:true});
  addEventListener('scroll', ()=>{state.scrollY=scrollY; updateParallax();}, {passive:true});
  document.querySelector('#audioToggle').addEventListener('click', toggleAudio, {passive:true});
}

function updateParallax(){
  document.querySelectorAll('.genre').forEach(section=>{
    const rect = section.getBoundingClientRect();
    const progress = rect.top / innerHeight;
    section.querySelectorAll('.parallax').forEach(layer=>{
      const d = Number(layer.dataset.depth);
      layer.style.transform = `translate3d(0,${-progress*70*d}px,0) scale(${1+d*0.15})`;
    });
  });
}

const sounds = {};
function toggleAudio(){
  state.audio = !state.audio;
  const btn = document.querySelector('#audioToggle');
  btn.textContent = `Audio: ${state.audio ? 'On' : 'Off'}`;
  if(state.audio){
    if(!sounds.ctx){
      sounds.ctx = new (window.AudioContext||window.webkitAudioContext)();
      sounds.master = sounds.ctx.createGain(); sounds.master.gain.value = .03; sounds.master.connect(sounds.ctx.destination);
    }
    ['horror','scifi','romance','fantasy','mystery'].forEach((id, i)=>startTone(id, 120+i*45));
  } else if(sounds.master){ sounds.master.gain.value = 0; }
}
function startTone(id, base){
  const o = sounds.ctx.createOscillator(); const g = sounds.ctx.createGain();
  o.type = id==='horror' ? 'sawtooth' : 'sine'; o.frequency.value = base;
  g.gain.value = .006; o.connect(g); g.connect(sounds.master); o.start(); sounds[id]=o;
}

function animate(){
  const c = document.querySelector('#fxCanvas');
  const dpr = Math.min(devicePixelRatio||1, 2);
  const w = c.width = innerWidth*dpr, h = c.height = innerHeight*dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,innerWidth,innerHeight);
  ctx.strokeStyle='#8ec9ff88';
  ctx.beginPath(); ctx.arc(state.pointer.x,state.pointer.y,18,0,Math.PI*2); ctx.stroke();
  state.particles = state.particles.filter(p=>p.life>0);
  state.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life--; ctx.fillStyle=p.color+Math.floor(p.life).toString(16).padStart(2,'0'); ctx.fillRect(p.x,p.y-state.scrollY,2,2);});
  requestAnimationFrame(animate);
}

buildSections();
setupGlobal();
animate();
