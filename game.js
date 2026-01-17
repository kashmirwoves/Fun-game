const player = document.getElementById("player");
const topObs = document.querySelector(".obstacle.top");
const bottomObs = document.querySelector(".obstacle.bottom");
const scoreText = document.getElementById("score");
const overlay = document.getElementById("overlay");
const restart = document.getElementById("restart");

let y = 0;
let velocity = 0;
let gravity = 0.7;
let jump = 12;

let obsX = window.innerWidth + 100;
let speed = 5;

let score = 0;
let running = true;

/* Controls */
document.addEventListener("touchstart", () => {
  if (!running) return;
  velocity = jump;
});

/* Game loop */
function loop() {
  if (!running) return;

  velocity -= gravity;
  y += velocity;

  if (y < 0) {
    y = 0;
    velocity = 0;
  }

  player.style.bottom = (20 + y) + "vh";

  obsX -= speed;
  if (obsX < -60) {
    obsX = window.innerWidth + 200;
    score++;
    scoreText.textContent = score;
  }

  topObs.style.left = obsX + "px";
  bottomObs.style.left = obsX + "px";

  checkCollision();
  requestAnimationFrame(loop);
}

function checkCollision() {
  const p = player.getBoundingClientRect();
  const t = topObs.getBoundingClientRect();
  const b = bottomObs.getBoundingClientRect();

  if (
    (p.right > t.left && p.left < t.right && p.top < t.bottom) ||
    (p.right > b.left && p.left < b.right && p.bottom > b.top)
  ) {
    gameOver();
  }
}

function gameOver() {
  running = false;
  overlay.style.display = "flex";
}

restart.addEventListener("click", () => location.reload());

loop();
