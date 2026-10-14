const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type = 'sine', duration = 0.2) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playChime() {
  playTone(523.25, 'sine', 0.2);
  setTimeout(() => playTone(659.25, 'sine', 0.3), 100);
}

/* ---------- Jouster ride (Huzzah button) ---------- */

const RIDE_SECONDS = 6;   // time to cross the screen
const TROT_STEP = 0.3;    // seconds between hoof beats (one diagonal pair per beat)

const JOUSTER_SVG = `
<svg viewBox="0 0 420 270" xmlns="http://www.w3.org/2000/svg" role="presentation">
  <defs>
    <linearGradient id="jx-bay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a4f31"/>
      <stop offset="0.55" stop-color="#5a3721"/>
      <stop offset="1" stop-color="#3a2214"/>
    </linearGradient>
    <linearGradient id="jx-steel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6c7580"/>
      <stop offset="0.35" stop-color="#eef1f4"/>
      <stop offset="0.7" stop-color="#aab3bc"/>
      <stop offset="1" stop-color="#58616b"/>
    </linearGradient>
    <linearGradient id="jx-cloth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a30f31"/>
      <stop offset="1" stop-color="#620018"/>
    </linearGradient>
    <linearGradient id="jx-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f1d77a"/>
      <stop offset="1" stop-color="#b8922a"/>
    </linearGradient>
  </defs>

  <ellipse class="jx-shadow" cx="205" cy="254" rx="150" ry="7" fill="#3e2723" opacity="0.28"/>

  <g class="jx-bob">

    <!-- far legs (darker) -->
    <g class="jx-leg jx-pair-a" style="transform-origin:142px 152px">
      <path d="M133 150 L151 150 L148 200 L136 200 Z" fill="#2e1a0f"/>
      <g class="jx-lower jx-lower-hind" style="transform-origin:142px 199px">
        <path d="M137 198 L148 198 L147 238 L138 238 Z" fill="#2e1a0f"/>
        <path d="M136 236 L149 236 L151 249 L134 249 Z" fill="#120a05"/>
      </g>
    </g>
    <g class="jx-leg jx-pair-b" style="transform-origin:246px 152px">
      <path d="M237 150 L255 150 L252 200 L240 200 Z" fill="#2e1a0f"/>
      <g class="jx-lower jx-lower-fore" style="transform-origin:246px 199px">
        <path d="M241 198 L252 198 L251 238 L242 238 Z" fill="#2e1a0f"/>
        <path d="M240 236 L253 236 L255 249 L238 249 Z" fill="#120a05"/>
      </g>
    </g>

    <!-- tail -->
    <g class="jx-tail" style="transform-origin:106px 124px">
      <path d="M104 118 C78 118 56 138 50 172 C47 190 54 204 64 216 C65 198 72 184 82 172 C92 158 100 144 112 134 Z" fill="#1b1009"/>
      <path d="M96 128 C80 134 66 152 62 176" stroke="#3a2214" stroke-width="2" fill="none" opacity="0.7"/>
    </g>

    <!-- body, neck and head -->
    <path d="M100 120 C115 102 160 99 200 105 C225 108 245 102 258 92 C272 78 282 62 296 50 C302 44 312 44 318 50 C328 60 345 84 352 104 C357 113 351 121 342 120 C333 119 323 107 316 99 C308 106 298 114 288 130 C282 142 280 156 270 167 C240 178 160 178 125 168 C100 161 88 136 100 120 Z" fill="url(#jx-bay)"/>
    <path d="M125 168 C160 178 240 178 270 167 C280 158 282 146 286 136 C270 160 240 170 200 170 C165 170 140 166 112 152 C114 160 118 164 125 168 Z" fill="#000" opacity="0.18"/>
    <path d="M112 118 C140 106 190 104 226 108" stroke="#8c5e3a" stroke-width="3" fill="none" opacity="0.5" stroke-linecap="round"/>
    <!-- far ear -->
    <path d="M309 50 L309 33 L318 49 Z" fill="#3a2214"/>
    <!-- near ear -->
    <path d="M314 49 L317 31 L326 50 Z" fill="#5a3721"/>
    <!-- eye and nostril -->
    <ellipse cx="327" cy="68" rx="3.4" ry="2.6" fill="#f4ead2"/>
    <circle cx="327.6" cy="68" r="1.7" fill="#120a05"/>
    <ellipse cx="347" cy="109" rx="2" ry="1.4" fill="#120a05" transform="rotate(-20 347 109)"/>

    <!-- near legs -->
    <g class="jx-leg jx-pair-b" style="transform-origin:128px 152px">
      <path d="M118 150 L138 150 L134 200 L121 200 Z" fill="#4a2c1a"/>
      <g class="jx-lower jx-lower-hind" style="transform-origin:128px 199px">
        <path d="M122 198 L134 198 L133 238 L123 238 Z" fill="#4a2c1a"/>
        <path d="M122.4 222 L133.4 222 L133 238 L123 238 Z" fill="#efe6d2"/>
        <path d="M121 236 L135 236 L138 249 L119 249 Z" fill="#120a05"/>
      </g>
    </g>
    <g class="jx-leg jx-pair-a" style="transform-origin:262px 152px">
      <path d="M252 150 L273 150 L269 200 L256 200 Z" fill="#4a2c1a"/>
      <g class="jx-lower jx-lower-fore" style="transform-origin:262px 199px">
        <path d="M257 198 L269 198 L268 238 L258 238 Z" fill="#4a2c1a"/>
        <path d="M257.4 222 L268.4 222 L268 238 L258 238 Z" fill="#efe6d2"/>
        <path d="M256 236 L270 236 L273 249 L254 249 Z" fill="#120a05"/>
      </g>
    </g>

    <!-- caparison (horse cloth) -->
    <g class="jx-cloth" style="transform-origin:200px 108px">
      <path d="M122 114 C150 106 232 106 266 112 C274 130 278 160 278 190 q-10.5 14 -21 0 q-10.5 14 -21 0 q-10.5 14 -21 0 q-10.5 14 -21 0 q-10.5 14 -21 0 q-10.5 14 -21 0 q-10.5 14 -21 0 q-10.5 14 -21 0 C106 170 102 138 122 114 Z" fill="url(#jx-cloth)" stroke="url(#jx-gold)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M112 172 C150 178 240 178 273 170" stroke="url(#jx-gold)" stroke-width="3" fill="none" stroke-dasharray="1 7" stroke-linecap="round"/>
      <path d="M118 128 C160 118 232 118 270 126" stroke="url(#jx-gold)" stroke-width="2" fill="none" opacity="0.9"/>
      <!-- cross pattee -->
      <g transform="translate(232 148)" fill="url(#jx-gold)" stroke="#5a3a00" stroke-width="0.8">
        <path d="M-3 -16 L3 -16 L5 -4 L16 -3 L16 3 L5 4 L3 16 L-3 16 L-5 4 L-16 3 L-16 -3 L-5 -4 Z"/>
      </g>
      <g transform="translate(150 150) scale(0.7)" fill="url(#jx-gold)" stroke="#5a3a00" stroke-width="0.8">
        <path d="M-3 -16 L3 -16 L5 -4 L16 -3 L16 3 L5 4 L3 16 L-3 16 L-5 4 L-16 3 L-16 -3 L-5 -4 Z"/>
      </g>
    </g>

    <!-- mane -->
    <g class="jx-mane" style="transform-origin:262px 92px">
      <path d="M256 92 C268 74 284 56 304 42 L314 50 C298 58 284 72 274 100 C268 98 262 96 256 92 Z" fill="#1b1009"/>
    </g>

    <!-- chamfron (face armor) and plume -->
    <path d="M316 52 C330 63 346 86 351 105 L343 108 C336 90 324 74 311 60 Z" fill="url(#jx-steel)" stroke="#3e2723" stroke-width="1"/>
    <circle cx="323" cy="63" r="3" fill="url(#jx-gold)" stroke="#5a3a00" stroke-width="0.6"/>
    <g class="jx-plume-horse" style="transform-origin:312px 46px">
      <path d="M312 48 C302 32 314 20 318 6 C328 20 326 36 320 50 Z" fill="#800020" stroke="#3e2723" stroke-width="1"/>
      <path d="M314 44 C310 32 316 22 318 12" stroke="url(#jx-gold)" stroke-width="2" fill="none"/>
    </g>

    <!-- reins -->
    <path d="M344 100 Q292 124 226 90" stroke="#2a1a0e" stroke-width="1.6" fill="none"/>

    <!-- lance (behind the rider) -->
    <g class="jx-lance" style="transform-origin:222px 78px">
      <line x1="150" y1="100" x2="398" y2="18.5" stroke="#e9dcbc" stroke-width="5" stroke-linecap="round"/>
      <line x1="150" y1="100" x2="398" y2="18.5" stroke="#800020" stroke-width="5" stroke-dasharray="10 14"/>
      <line x1="150" y1="100" x2="398" y2="18.5" stroke="#3e2723" stroke-width="0.8" opacity="0.5"/>
      <path d="M396 22.5 L396 14.5 L414 12 Z" fill="url(#jx-steel)" stroke="#3e2723" stroke-width="0.8"/>
      <g class="jx-flag" style="transform-origin:374px 26px">
        <path d="M374 24 L330 19 L346 28 L331 40 L374 31 Z" fill="url(#jx-gold)" stroke="#5a3a00" stroke-width="1"/>
        <path d="M368 26 L344 24" stroke="#800020" stroke-width="3"/>
      </g>
    </g>

    <!-- rider -->
    <g class="jx-rider">
      <!-- leg -->
      <path d="M180 108 L202 112 L214 140 L199 145 Z" fill="url(#jx-steel)" stroke="#3e2723" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M199 142 L214 139 L210 176 L195 174 Z" fill="url(#jx-steel)" stroke="#3e2723" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M193 172 L211 174 L221 183 L200 186 Z" fill="#3a3f46" stroke="#1d2024" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="194" cy="181" r="2.4" fill="url(#jx-gold)"/>
      <!-- surcoat -->
      <path d="M172 64 L204 60 L212 112 L216 128 C200 134 182 134 166 128 L170 112 Z" fill="url(#jx-cloth)" stroke="#3e2723" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M171 100 L211 100 L212 106 L170 106 Z" fill="url(#jx-gold)" stroke="#5a3a00" stroke-width="0.8"/>
      <!-- gorget and helm -->
      <rect x="183" y="50" width="16" height="13" rx="2" fill="url(#jx-steel)" stroke="#3e2723" stroke-width="1.2"/>
      <path d="M181 30 C181 15 207 15 207 30 L209 55 L179 55 Z" fill="url(#jx-steel)" stroke="#3e2723" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="191" y="35" width="16" height="3.4" rx="1.5" fill="#120a05"/>
      <path d="M199 38 L199 54" stroke="#120a05" stroke-width="2.4"/>
      <path d="M181 44 L209 44" stroke="#3e2723" stroke-width="1" opacity="0.6"/>
      <circle cx="202" cy="47" r="0.9" fill="#120a05"/><circle cx="202" cy="50" r="0.9" fill="#120a05"/>
      <!-- helm plume -->
      <g class="jx-plume" style="transform-origin:192px 20px">
        <path d="M194 19 C178 2 150 2 128 18 C148 18 164 22 176 33 C163 31 148 36 138 48 C160 42 182 40 198 30 Z" fill="#800020" stroke="#3e2723" stroke-width="1" stroke-linejoin="round"/>
        <path d="M188 22 C168 12 148 14 134 22" stroke="url(#jx-gold)" stroke-width="2.4" fill="none"/>
      </g>
      <!-- shield -->
      <path d="M181 66 L215 66 L215 96 C215 112 202 122 198 125 C194 122 181 112 181 96 Z" fill="url(#jx-gold)" stroke="#3e2723" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M181 84 L198 73 L215 84 L215 94 L198 83 L181 94 Z" fill="#800020" stroke="#3e2723" stroke-width="0.8"/>
      <circle cx="198" cy="102" r="4" fill="#800020" stroke="#3e2723" stroke-width="0.8"/>
      <!-- arm and gauntlet -->
      <path d="M200 70 L222 78" stroke="#3e2723" stroke-width="9" stroke-linecap="round"/>
      <path d="M200 70 L222 78" stroke="url(#jx-steel)" stroke-width="6.4" stroke-linecap="round"/>
      <circle cx="224" cy="78.5" r="5.5" fill="#8a929b" stroke="#3e2723" stroke-width="1.4"/>
      <ellipse cx="236" cy="72" rx="3" ry="8" transform="rotate(18 236 72)" fill="url(#jx-steel)" stroke="#3e2723" stroke-width="1"/>
    </g>

  </g>
</svg>`;

/* ----- hoof beats, armor jingle, pass-by pan and volume ----- */

function makeNoise(ctx, seconds) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function hoofBeat(ctx, out, noise, t, strength, hollow) {
  // dry crack of the hoof
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = hollow ? 800 : 1500;
  band.Q.value = 1.3;
  const crack = ctx.createGain();
  crack.gain.setValueAtTime(0.0001, t);
  crack.gain.exponentialRampToValueAtTime(0.9 * strength, t + 0.004);
  crack.gain.exponentialRampToValueAtTime(0.0001, t + (hollow ? 0.1 : 0.06));
  src.connect(band);
  band.connect(crack);
  crack.connect(out);
  src.start(t);
  src.stop(t + 0.14);

  // hollow thump of the ground
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(hollow ? 210 : 270, t);
  osc.frequency.exponentialRampToValueAtTime(hollow ? 90 : 130, t + 0.08);
  const thump = ctx.createGain();
  thump.gain.setValueAtTime(0.0001, t);
  thump.gain.exponentialRampToValueAtTime(0.7 * strength, t + 0.003);
  thump.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  osc.connect(thump);
  thump.connect(out);
  osc.start(t);
  osc.stop(t + 0.14);
}

function armorJingle(ctx, out, noise, t) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const high = ctx.createBiquadFilter();
  high.type = 'highpass';
  high.frequency.value = 4500;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  src.connect(high);
  high.connect(g);
  g.connect(out);
  src.start(t);
  src.stop(t + 0.1);
}

// Schedules the whole trot on any audio context (also works offline for tests).
function scheduleTrot(ctx, out, startTime, seconds) {
  const noise = makeNoise(ctx, 0.15);
  const beats = Math.floor(seconds / TROT_STEP);
  for (let i = 0; i < beats; i++) {
    const t = startTime + i * TROT_STEP;
    const hollow = i % 2 === 1;                       // clip, clop, clip, clop
    hoofBeat(ctx, out, noise, t, 1, hollow);
    hoofBeat(ctx, out, noise, t + 0.028, 0.55, hollow); // second hoof of the pair
    if (i % 2 === 0 || i % 3 === 1) armorJingle(ctx, out, noise, t + 0.02);
  }
}

function playTrot(seconds) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t0 = audioCtx.currentTime + 0.05;

  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.18, t0);                       // far away
  master.gain.linearRampToValueAtTime(0.7, t0 + seconds / 2); // passes the middle
  master.gain.linearRampToValueAtTime(0.18, t0 + seconds);    // rides off

  if (audioCtx.createStereoPanner) {
    const pan = audioCtx.createStereoPanner();
    pan.pan.setValueAtTime(-0.9, t0);
    pan.pan.linearRampToValueAtTime(0.9, t0 + seconds);
    master.connect(pan);
    pan.connect(audioCtx.destination);
  } else {
    master.connect(audioCtx.destination);
  }

  scheduleTrot(audioCtx, master, t0, seconds);
}

function rideJouster() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('.jouster')) return;

  const rider = document.createElement('div');
  rider.className = 'jouster';
  rider.setAttribute('aria-hidden', 'true');
  rider.style.setProperty('--ride-time', RIDE_SECONDS + 's');
  rider.innerHTML = JOUSTER_SVG;
  rider.addEventListener('animationend', (e) => {
    if (e.target === rider) rider.remove();
  });
  document.body.appendChild(rider);

  playTrot(RIDE_SECONDS);
}

document.getElementById('excitedBtn').addEventListener('click', () => {
  playChime();
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  rideJouster();
});

function switchGame(evt, gameName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.game-panel').forEach(panel => panel.classList.remove('active'));

  evt.target.classList.add('active');
  document.getElementById('game-' + gameName).classList.add('active');

  stopStarGame();
}

let clickerScore = 0;
let clickerTimer = null;
let timeLeft = 10;

function startClicker() {
  clickerScore = 0;
  timeLeft = 10;
  document.getElementById('clickerStatus').innerText = `Time: 10s | Score: 0`;
  const target = document.getElementById('targetBtn');
  target.style.display = 'block';
  moveTarget();

  clearInterval(clickerTimer);
  clickerTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(clickerTimer);
      target.style.display = 'none';
      document.getElementById('clickerStatus').innerText = `Game Over! Final Score: ${clickerScore}`;
      playChime();
    } else {
      document.getElementById('clickerStatus').innerText = `Time: ${timeLeft}s | Score: ${clickerScore}`;
    }
  }, 1000);
}

function moveTarget() {
  const box = document.getElementById('clickerBox');
  const maxX = box.clientWidth - 44;
  const maxY = box.clientHeight - 44;
  const target = document.getElementById('targetBtn');
  target.style.left = Math.floor(Math.random() * maxX) + 'px';
  target.style.top = Math.floor(Math.random() * maxY) + 'px';
}

function hitTarget() {
  if (timeLeft > 0) {
    clickerScore++;
    playTone(400 + clickerScore * 25, 'sine', 0.1);
    document.getElementById('clickerStatus').innerText = `Time: ${timeLeft}s | Score: ${clickerScore}`;
    moveTarget();
  }
}

const emojis = ['📜', '📜', '🏰', '🏰', '👑', '👑', '⚔️', '⚔️'];
let flippedCards = [];
let matchedPairs = 0;

function initMemoryGame() {
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  flippedCards = [];
  matchedPairs = 0;
  document.getElementById('memoryStatus').innerText = 'Find all 4 matching pairs!';

  const shuffled = [...emojis].sort(() => Math.random() - 0.5);
  shuffled.forEach((emoji) => {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.emoji = emoji;
    card.innerText = emoji;
    card.onclick = () => flipCard(card);
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
    card.classList.add('flipped');
    playTone(300, 'sine', 0.1);
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      const [c1, c2] = flippedCards;
      if (c1.dataset.emoji === c2.dataset.emoji) {
        matchedPairs++;
        playTone(600, 'sine', 0.15);
        flippedCards = [];
        if (matchedPairs === 4) {
          document.getElementById('memoryStatus').innerText = '🎉 Thou hast matched all pairs!';
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      } else {
        setTimeout(() => {
          c1.classList.remove('flipped');
          c2.classList.remove('flipped');
          flippedCards = [];
        }, 800);
      }
    }
  }
}

const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let starGameLoop = null;
let basket = { x: 125, width: 50, height: 12 };
let star = { x: 150, y: 0, speed: 2.5 };
let starScore = 0;
let starActive = false;

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  basket.x = e.clientX - rect.left - basket.width / 2;
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') basket.x -= 20;
  if (e.key === 'ArrowRight') basket.x += 20;
});

function startStarGame() {
  starScore = 0;
  star.y = 0;
  star.x = Math.random() * (canvas.width - 20);
  star.speed = 2.5;
  starActive = true;
  document.getElementById('starStatus').innerText = `Score: 0`;

  cancelAnimationFrame(starGameLoop);
  updateStarGame();
}

function stopStarGame() {
  starActive = false;
  cancelAnimationFrame(starGameLoop);
}

function updateStarGame() {
  if (!starActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#8b5a2b'; /* Wood basket */
  ctx.fillRect(basket.x, canvas.height - basket.height - 5, basket.width, basket.height);

  star.y += star.speed;
  ctx.fillStyle = '#d4af37';
  ctx.font = '18px Arial';
  ctx.fillText('⭐', star.x, star.y);

  if (star.y >= canvas.height - 20 && star.x >= basket.x - 10 && star.x <= basket.x + basket.width + 10) {
    starScore++;
    playTone(500 + starScore * 30, 'sine', 0.1);
    document.getElementById('starStatus').innerText = `Score: ${starScore}`;
    star.y = 0;
    star.x = Math.random() * (canvas.width - 20);
    star.speed += 0.2;
  } else if (star.y > canvas.height) {
    stopStarGame();
    document.getElementById('starStatus').innerText = `Game Over! Final Score: ${starScore}`;
    playTone(180, 'sawtooth', 0.3);
    return;
  }

  starGameLoop = requestAnimationFrame(updateStarGame);
}

const simonFreqs = [261.63, 329.63, 392.00, 523.25];
const padIds = ['pad-red', 'pad-green', 'pad-blue', 'pad-yellow'];
let simonSeq = [];
let simonIndex = 0;
let simonAcceptingInput = false;

function startSimon() {
  simonSeq = [];
  document.getElementById('simonStatus').innerText = 'Watch the pattern!';
  nextSimonRound();
}

function nextSimonRound() {
  simonIndex = 0;
  simonAcceptingInput = false;
  simonSeq.push(Math.floor(Math.random() * 4));
  playSimonSequence();
}

function playSimonSequence() {
  let i = 0;
  const interval = setInterval(() => {
    flashPad(simonSeq[i]);
    i++;
    if (i >= simonSeq.length) {
      clearInterval(interval);
      setTimeout(() => {
        simonAcceptingInput = true;
        document.getElementById('simonStatus').innerText = `Thy turn! (Length: ${simonSeq.length})`;
      }, 300);
    }
  }, 600);
}

function flashPad(padIdx) {
  const pad = document.getElementById(padIds[padIdx]);
  pad.classList.add('active-pad');
  playTone(simonFreqs[padIdx], 'sine', 0.25);
  setTimeout(() => pad.classList.remove('active-pad'), 300);
}

function handleSimonInput(padIdx) {
  if (!simonAcceptingInput) return;

  flashPad(padIdx);

  if (padIdx === simonSeq[simonIndex]) {
    simonIndex++;
    if (simonIndex >= simonSeq.length) {
      simonAcceptingInput = false;
      document.getElementById('simonStatus').innerText = 'Correct! Preparing next round...';
      setTimeout(nextSimonRound, 1000);
    }
  } else {
    simonAcceptingInput = false;
    document.getElementById('simonStatus').innerText = `Alas, wrong pad! Final Score: ${simonSeq.length - 1}`;
    playTone(150, 'sawtooth', 0.4);
  }
}

initMemoryGame();

/* ---------- English / Spanish toggle ----------
   Static text: elements with data-i18n (text) or data-i18n-alt (image alt).
   Game messages: the code above writes English into the four status lines.
   A watcher below translates each message to Spanish and keeps the English
   original, so toggling back restores the exact message.
   Keep this block at the bottom of the file. */
(function () {
  const STORAGE_KEY = 'demo-page-lang';

  const STRINGS = {
    pageTitle: { en: 'Web Development 101', es: 'Desarrollo Web 101' },
    heroAlt: {
      en: 'A clean workspace with a laptop showing code',
      es: 'Un espacio de trabajo ordenado con una laptop que muestra código'
    },
    welcome: { en: 'Welcome to Web Development 101', es: 'Bienvenido a Desarrollo Web 101' },
    intro: {
      en: 'This class introduces the fundamentals of web design and coding. We are learning how to build webpages using HTML and host them live using GitHub Pages!',
      es: 'Esta clase presenta los fundamentos del diseño y la programación web. Aprendemos a construir páginas con HTML y a publicarlas con GitHub Pages.'
    },
    huzzah: { en: "🎉 Huzzah! (I'm Excited)", es: '🎉 ¡Hurra! (Estoy emocionado)' },
    arcadeTitle: { en: '🏰 The Grand Arcade', es: '🏰 La Gran Galería de Juegos' },
    arcadeHint: { en: 'Choose thy diversion:', es: 'Elige tu pasatiempo:' },
    tabClicker: { en: '⚡ Quick Strike', es: '⚡ Golpe Rápido' },
    tabMemory: { en: "🧠 Scholar's Memory", es: '🧠 Memoria del Erudito' },
    tabStar: { en: '⭐ Catch the Star', es: '⭐ Atrapa la Estrella' },
    tabSimon: { en: "🎵 Bard's Sequence", es: '🎵 Secuencia del Bardo' },
    clickerTitle: { en: 'Quick Strike (10 Seconds)', es: 'Golpe Rápido (10 segundos)' },
    memoryTitle: { en: "Scholar's Memory Match", es: 'Pares de la Memoria del Erudito' },
    starTitle: { en: 'Catch the Falling Star', es: 'Atrapa la Estrella Fugaz' },
    simonTitle: { en: "Bard's Sequence", es: 'Secuencia del Bardo' },
    commence: { en: 'Commence', es: 'Comenzar' },
    newGame: { en: 'New Game', es: 'Nueva partida' },
    peruse: { en: 'Peruse my favored manuscript:', es: 'Hojea mi manuscrito favorito:' },
    wiki: { en: 'Visit Wikipedia', es: 'Visitar Wikipedia' },
    nameLabel: { en: 'What is thy name?', es: '¿Cómo te llamas?' },
    namePlaceholder: { en: 'Thy name', es: 'Tu nombre' }
  };

  const BUTTON_LABEL = {
    en: { text: 'Español', label: 'Cambiar a español' },
    es: { text: 'English', label: 'Switch to English' }
  };

  /* English game message (regex) to Spanish (function). */
  const MESSAGES = [
    [/^Click Start to test thy reaction speed!$/, () => '¡Pulsa Comenzar para probar tu rapidez!'],
    [/^Time: (\d+)s \| Score: (\d+)$/, (m) => `Tiempo: ${m[1]}s | Puntos: ${m[2]}`],
    [/^Game Over! Final Score: (\d+)$/, (m) => `¡Fin del juego! Puntuación final: ${m[1]}`],
    [/^Find all 4 matching pairs!$/, () => '¡Encuentra los 4 pares!'],
    [/^🎉 Thou hast matched all pairs!$/, () => '🎉 ¡Has hallado todos los pares!'],
    [/^Move thy mouse or Left\/Right arrows to control the basket!$/, () => '¡Mueve el ratón o las flechas izquierda y derecha para guiar la cesta!'],
    [/^Score: (\d+)$/, (m) => `Puntos: ${m[1]}`],
    [/^Press Commence to begin!$/, () => '¡Pulsa Comenzar para empezar!'],
    [/^Watch the pattern!$/, () => '¡Observa la secuencia!'],
    [/^Thy turn! \(Length: (\d+)\)$/, (m) => `¡Tu turno! (Longitud: ${m[1]})`],
    [/^Correct! Preparing next round\.\.\.$/, () => '¡Correcto! Preparando la siguiente ronda...'],
    [/^Alas, wrong pad! Final Score: (\d+)$/, (m) => `¡Ay, pad equivocado! Puntuación final: ${m[1]}`]
  ];

  const STATUS_IDS = ['clickerStatus', 'memoryStatus', 'starStatus', 'simonStatus'];
  const status = {}; // id -> { english, written }
  let lang = 'en';

  function toSpanish(text) {
    for (const [re, fn] of MESSAGES) {
      const m = text.match(re);
      if (m) return fn(m);
    }
    return text; // unknown message stays as written
  }

  function renderStatus(id) {
    const el = document.getElementById(id);
    const s = status[id];
    if (!el || !s) return;
    const out = lang === 'es' ? toSpanish(s.english) : s.english;
    s.written = out;
    if (el.textContent !== out) el.textContent = out;
  }

  function applyLanguage(next) {
    lang = next === 'es' ? 'es' : 'en';
    document.documentElement.lang = lang;
    document.title = STRINGS.pageTitle[lang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const entry = STRINGS[el.dataset.i18n];
      if (entry) el.textContent = entry[lang];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const entry = STRINGS[el.dataset.i18nPlaceholder];
      if (entry) el.placeholder = entry[lang];
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const entry = STRINGS[el.dataset.i18nAlt];
      if (entry) el.alt = entry[lang];
    });

    STATUS_IDS.forEach(renderStatus);

    const btn = document.getElementById('langToggle');
    if (btn) {
      btn.textContent = BUTTON_LABEL[lang].text;
      btn.setAttribute('aria-label', BUTTON_LABEL[lang].label);
      btn.setAttribute('lang', lang === 'es' ? 'en' : 'es');
    }

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
  }

  function watchStatus() {
    const observer = new MutationObserver(() => {
      STATUS_IDS.forEach((id) => {
        const el = document.getElementById(id);
        const s = status[id];
        if (!el || !s) return;
        if (el.textContent !== s.written) {  // game code wrote a new message
          s.english = el.textContent;
          renderStatus(id);
        }
      });
    });
    STATUS_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      status[id] = { english: el.textContent, written: el.textContent };
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  watchStatus();

  document.getElementById('langToggle').addEventListener('click', () => {
    applyLanguage(lang === 'en' ? 'es' : 'en');
  });

  let saved = 'en';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) { /* storage blocked */ }
  applyLanguage(saved);
})();

/* ---------- Name welcome ----------
   Shows a greeting under the name box; follows the page language set by the toggle above. */
(function () {
  const input = document.getElementById('nameInput');
  const out = document.getElementById('nameWelcome');
  if (!input || !out) return;

  const GREETING = {
    en: (n) => `Welcome, ${n}! Enjoy the arcade.`,
    es: (n) => `¡Te damos la bienvenida, ${n}! Disfruta la galería.`
  };

  function render() {
    const name = input.value.trim();
    const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
    out.textContent = name ? GREETING[lang](name) : '';
  }

  input.addEventListener('input', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
