const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const overlay = document.getElementById("overlay");
const restart = document.getElementById("restart");

let playerHeight = 50;
let playerY = window.innerHeight * 0.5;
let speed = 4; // normal speed back
let score = 0;
let running = true;

// Tunnel wall heights
const ceilingHeight = window.innerHeight * 0.15;
const floorHeight = window.innerHeight * 0.15;

// Obstacles
const totalObstacles = 100;
let obstacleSpacing = 650; // slightly increased distance
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

  // Gap size slightly increased
  let gapHeight = playerHeight * 1.5 + 10; 
  let maxGapStart = window.innerHeight - ceilingHeight - floorHeight - gapHeight;
  let gapStart = Math.random() * maxGapStart;

  topObs.style.height = gapStart + "px";
  bottomObs.style.height = (window.innerHeight - ceilingHeight - floorHeight - gapStart - gapHeight) + "px";

  // Initial X position
  topObs.dataset.x = window.innerWidth + i * obstacleSpacing;
  bottomObs.dataset.x = window.innerWidth + i * obstacleSpacing;

  topObs.dataset.counted = false;
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
function loop() {
  if (!running) return;

  // Move obstacles
  for (let i = 0; i < totalObstacles; i++) {
    let topObs = topObsContainer[i];
    let bottomObs = bottomObsContainer[i];

    let x = parseFloat(topObs.dataset.x);
    x -= speed;

    // Reset obstacle far right
    if (x < -100) {
      x = window.innerWidth + (totalObstacles - 1) * obstacleSpacing;

      // Random gap for reset
      let gapHeight = playerHeight * 1.5 + 10;
      let maxGapStart = window.innerHeight - ceilingHeight - floorHeight - gapHeight;
      let gapStart = Math.random() * maxGapStart;

      topObs.style.height = gapStart + "px";
      bottomObs.style.height = (window.innerHeight - ceilingHeight - floorHeight - gapStart - gapHeight) + "px";

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
  // Optional sound can be added later
}

// Restart
restart.addEventListener("click", () => location.reload());

loop();
