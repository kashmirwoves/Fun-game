const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fit screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Assets
const headImg = new Image(); headImg.src = 'head.png';
const obstacleImg = new Image(); obstacleImg.src = 'obstacle.png';
const playMusic = new Audio('play.mp3'); playMusic.loop = true;
const endMusic = new Audio('end.mp3');

let score = 0;
let gameActive = true;
let obstacles = [];

const player = {
    x: 50, y: canvas.height - 150, width: 80, height: 80,
    dy: 0, jumpForce: 15, gravity: 0.8, grounded: false
};

// Controls
function jump() {
    if (player.grounded && gameActive) {
        player.dy = -player.jumpForce;
        player.grounded = false;
        if (playMusic.paused) playMusic.play();
    }
}

window.addEventListener('touchstart', jump);
window.addEventListener('mousedown', jump);

function spawnObstacle() {
    if (!gameActive) return;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - 90,
        width: 70, height: 70,
        tag: "Softy" 
    });
}

setInterval(spawnObstacle, 1800);

function update() {
    if (!gameActive) return;

    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y + player.height > canvas.height - 20) {
        player.y = canvas.height - 20 - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    obstacles.forEach((obs, index) => {
        obs.x -= 6; // Obstacle speed

        // Collision Check
        if (player.x < obs.x + obs.width - 10 &&
            player.x + player.width - 10 > obs.x &&
            player.y < obs.y + obs.height - 10 &&
            player.y + player.height > obs.y) {
            gameOver();
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }
    });

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Ground
    ctx.fillStyle = "#666";
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Draw Player and Obstacles
    ctx.drawImage(headImg, player.x, player.y, player.width, player.height);
    obstacles.forEach(obs => {
        ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
    });

    // Score
    ctx.fillStyle = "black";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Score: " + score, 20, 40);
}

function gameOver() {
    gameActive = false;
    playMusic.pause();
    endMusic.play();
    document.getElementById("overlay").style.display = "flex";
}

update();
