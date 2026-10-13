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

const JOUSTER_SVG = `
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <g class="jouster-bob">
    <path class="leg leg-a" d="M72 82 L70 108" stroke="#3b2414" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path class="leg leg-b" d="M84 82 L84 108" stroke="#3b2414" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path class="leg leg-b" d="M108 82 L108 108" stroke="#3b2414" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path class="leg leg-a" d="M120 82 L122 108" stroke="#3b2414" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M58 64 Q36 68 42 96" stroke="#3b2414" stroke-width="6" stroke-linecap="round" fill="none"/>
    <ellipse cx="95" cy="70" rx="40" ry="16" fill="#5a3a22"/>
    <polygon points="124,62 140,34 154,40 138,74" fill="#5a3a22"/>
    <path d="M140 34 L172 52 L166 60 L148 50 Z" fill="#5a3a22"/>
    <circle cx="150" cy="42" r="2" fill="#fcf5e5"/>
    <path d="M128 52 Q124 40 136 32" stroke="#3b2414" stroke-width="4" fill="none"/>
    <path d="M60 62 H128 V84 Q94 92 60 84 Z" fill="#800020" stroke="#d4af37" stroke-width="2"/>
    <rect x="90" y="36" width="16" height="26" rx="3" fill="#8a8f98" stroke="#3e2723" stroke-width="1.5"/>
    <path d="M92 60 L84 76 L96 76 Z" fill="#8a8f98" stroke="#3e2723" stroke-width="1.5"/>
    <circle cx="98" cy="28" r="9" fill="#a0a5ad" stroke="#3e2723" stroke-width="1.5"/>
    <rect x="98" y="26" width="10" height="3" fill="#3e2723"/>
    <path d="M92 20 Q82 10 78 22" stroke="#800020" stroke-width="4" fill="none" stroke-linecap="round"/>
    <line x1="96" y1="50" x2="192" y2="30" stroke="#8b5a2b" stroke-width="3" stroke-linecap="round"/>
    <polygon points="150,38 150,46 128,44" fill="#d4af37"/>
    <path d="M104 40 L124 40 L124 54 Q114 66 104 54 Z" fill="#d4af37" stroke="#800020" stroke-width="2"/>
  </g>
</svg>`;

function rideJouster() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('.jouster')) return;

  const rider = document.createElement('div');
  rider.className = 'jouster';
  rider.setAttribute('aria-hidden', 'true');
  rider.innerHTML = JOUSTER_SVG;
  rider.addEventListener('animationend', (e) => {
    if (e.target === rider) rider.remove();
  });
  document.body.appendChild(rider);
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
