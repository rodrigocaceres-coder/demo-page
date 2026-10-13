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

document.getElementById('excitedBtn').addEventListener('click', () => {
  playChime();
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
