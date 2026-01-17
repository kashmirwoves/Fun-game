const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const overlay = document.getElementById("overlay");
const restart = document.getElementById("restart");

let playerHeight = 50; // head height
let playerY = window.innerHeight * 0.5;
let baseSpeed = 2; // slower than before
let speed = baseSpeed;
let score = 0;
let running = true;

// Tunnel wall heights
const ceilingHeight = window.innerHeight * 0.15;
const floorHeight = window.innerHeight * 0.15;

// Obstacles
const totalObstacles = 100;
const obstacleSpacing = 600; // distance between obstacles
const topObsContainer = [];
const bottomObsContainer = [];

// Create obstacles
for (let i = 0; i < totalObstacles; i++) {
  const topObs = document.createElement("div");
  const bottomObs = document.createElement("div");

  topObs.classList.add("obstacle", "top");
  bottomObs.classList.add("obstacle", "bottom");

  document.getElementById("game").appendChild(topObs);
  document.getElementById("game").appendChild(bottomObs);

  // Random gap: top, middle, bottom
  let gapHeight = playerHeight * 1.5; // ~1.5x player
  let maxGapStart = window.innerHeight - ceilingHeight - floorHeight - gapHeight;
  let gapStart = Math.random() * maxGapStart;

  topObs.style.height = gapStart + "px";
  bottomObs.style.height = (window.innerHeight - ceilingHeight - floorHeight - gapStart - gapHeight) + "px";

  // Set initial X position
  topObs.dataset.x = window.innerWidth + i * obstacleSpacing;
  bottomObs.dataset.x = window.innerWidth + i * obstacleSpacing;

  topObs.dataset.counted = false; // score counting
  bottomObs.dataset.counted = false;

  topObsContainer.push(topObs);
  bottomObsContainer.push(bottomObs);
}

// Touch drag
let touchY = null;
document.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; });
document.addEventListener("touchmove", e => {
  if (!running) return;
  const newY = e.touches[0].clientY;
  const delta = newY - touchY;
  touchY = newY;
  playerY += delta;

  // Constrain inside tunnel walls
  if (playerY < ceilingHeight) playerY = ceilingHeight;
  if (playerY > window.innerHeight - floorHeight - playerHeight) playerY = window.innerHeight - floorHeight - playerHeight;

  player.style.top = playerY + "px";
});

// Game loop
let startTime = Date.now();
function loop() {
  if (!running) return;

  const elapsed = (Date.now() - startTime) / 1000;

  // Gradually increase speed after 60 seconds
  if (elapsed > 60) {
    speed += 0.002; // slow gradual increase
  }

  // Move obstacles
  for (let i = 0; i < totalObstacles; i++) {
    let topObs = topObsContainer[i];
    let bottomObs = bottomObsContainer[i];

    let x = parseFloat(topObs.dataset.x);
    x -= speed;

    // Reset obstacle far right
    if (x < -100) {
      x = window.innerWidth + (totalObstacles - 1) * obstacleSpacing;

      // Random gap for this reset
      let gapHeight = playerHeight * 1.5;
      let maxGapStart = window.innerHeight - ceilingHeight - floorHeight - gapHeight;
      let gapStart = Math.random() * maxGapStart;

      topObs.style.height = gapStart + "px";
      bottomObs.style.height = (window.innerHeight - ceilingHeight - floorHeight - gapStart - gapHeight) + "px";

      // Reset score counted flag
      topObs.dataset.counted = false;
    }

    topObs.dataset.x = x;
    bottomObs.dataset.x = x;
    topObs.style.left = x + "px";
    bottomObs.style.left = x + "px";

    // Collision detection
    const p = player.getBoundingClientRect();
    const t = topObs.getBoundingClientRect();
    const b = bottomObs.getBoundingClientRect();

    if ((p.right > t.left && p.left < t.right && p.top < t.bottom) ||
        (p.right > b.left && p.left < b.right && p.bottom > b.top)) {
      gameOver();
    }

    // Score counting
    if (x + 80 < player.offsetLeft && !topObs.dataset.counted) {
      score++;
      scoreText.textContent = score;
      topObs.dataset.counted = true;
    }
  }

  requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  overlay.style.display = "flex";
  // Optional sound in future: document.getElementById('gameover').play();
}

// Restart
restart.addEventListener("click", () => location.reload());

loop();
