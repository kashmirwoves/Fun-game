const player = document.getElementById("player");
const topObs = document.querySelector(".obstacle.top");
const bottomObs = document.querySelector(".obstacle.bottom");
const scoreText = document.getElementById("score");
const overlay = document.getElementById("overlay");
const restart = document.getElementById("restart");

let playerY = window.innerHeight * 0.5; // start vertical position
let obsX = window.innerWidth + 100;
let speed = 4;
let score = 0;
let running = true;

// Touch drag control
let touchY = null;
document.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; });
document.addEventListener("touchmove", e => {
  if (!running) return;
  const newY = e.touches[0].clientY;
  const delta = newY - touchY;
  touchY = newY;
  playerY += delta;
  // limit player inside screen
  if (playerY < 15) playerY = 15;
  if (playerY > window.innerHeight - 70) playerY = window.innerHeight - 70;
  player.style.top = playerY + "px";
});

// Main game loop
let lastSpeedIncrease = Date.now();
function loop() {
  if (!running) return;

  // Move obstacles
  obsX -= speed;
  if (obsX < -60) {
    obsX = window.innerWidth + 200;
    // Random vertical gap for challenge
    const gap = Math.random() * 150 + 100;
    topObs.style.height = gap + "px";
    bottomObs.style.height = (window.innerHeight - gap - 30) + "px";
    score++;
    scoreText.textContent = score;
  }

  topObs.style.left = obsX + "px";
  bottomObs.style.left = obsX + "px";

  // Gradually increase speed every 5 seconds
  if (Date.now() - lastSpeedIncrease > 5000) {
    speed += 0.3;
    lastSpeedIncrease = Date.now();
  }

  checkCollision();
  requestAnimationFrame(loop);
}

// Collision detection
function checkCollision() {
  const p = player.getBoundingClientRect();
  const t = topObs.getBoundingClientRect();
  const b = bottomObs.getBoundingClientRect();

  if ((p.right > t.left && p.left < t.right && p.top < t.bottom) ||
      (p.right > b.left && p.left < b.right && p.bottom > b.top)) {
    gameOver();
  }
}

// Game over
function gameOver() {
  running = false;
  overlay.style.display = "flex";
  // In future you can play sound like: document.getElementById('gameover').play();
}

// Restart
restart.addEventListener("click", () => location.reload());

loop();
