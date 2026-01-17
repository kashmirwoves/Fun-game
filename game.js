const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restartBtn");
const gameOverSound = document.getElementById("gameOverSound");

// GAME STATE
let gameRunning = true;
let score = 0;

// PLAYER PHYSICS
let y = 0;
let velocity = 0;
const gravity = 0.6;
const jumpPower = 12;
let isJumping = false;

// OBSTACLE
let obstacleX = window.innerWidth + 100;
const obstacleSpeed = 6;

// INPUT
document.addEventListener("touchstart", () => {
  if (!gameRunning) return;
  if (!isJumping) {
    velocity = jumpPower;
    isJumping = true;
  }
});

// MAIN LOOP
function gameLoop() {
  if (!gameRunning) return;

  // Player physics
  velocity -= gravity;
  y += velocity;

  if (y <= 0) {
    y = 0;
    velocity = 0;
    isJumping = false;
  }

  player.style.bottom = (15 + y) + "vh";

  // Obstacle movement
  obstacleX -= obstacleSpeed;
  if (obstacleX < -100) {
    obstacleX = window.innerWidth + 100;
  }
  obstacle.style.right = obstacleX + "px";

  // Collision
  const playerRect = player.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  if (
    playerRect.right > obstacleRect.left &&
    playerRect.left < obstacleRect.right &&
    playerRect.bottom > obstacleRect.top
  ) {
    endGame();
    return;
  }

  requestAnimationFrame(gameLoop);
}

// SCORE
setInterval(() => {
  if (gameRunning) {
    score++;
    scoreText.textContent = score;
  }
}, 1000);

// GAME OVER
function endGame() {
  gameRunning = false;
  gameOverSound.currentTime = 0;
  gameOverSound.play();
  overlay.style.display = "flex";
}

// RESTART
restartBtn.addEventListener("touchstart", () => {
  location.reload();
});

// START
gameLoop();
