const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathSound = document.getElementById('deathSound');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ASSETS
const headImg = new Image(); headImg.src = 'head.png'; 
const obsImg = new Image();  obsImg.src = 'obstacle.png';

let gameActive = true;
let score = 0;
let speed = 6; 
let startTime = Date.now();
let lastObstacleTime = Date.now() - 500; // Offset so first spawn waits 2 seconds
let obstacleCount = 0;

const wallHeight = 90; 

const player = {
    x: 50,
    y: canvas.height / 2,
    bodyW: 45,
    bodyH: 60,
    headSize: 90 
};

// Controls
function moveMan(e) {
    if (!gameActive) return;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    if (clientY > wallHeight + 40 && clientY < canvas.height - wallHeight - player.bodyH) {
        player.y = clientY;
    }
}
window.addEventListener('mousemove', moveMan);
window.addEventListener('touchstart', moveMan);
window.addEventListener('touchmove', (e) => { e.preventDefault(); moveMan(e); }, {passive: false});

let obstacles = [];

function spawnObstacle() {
    let gap = 240; 
    let obsWidth = 140; 
    let pos = Math.random() * (canvas.height - (wallHeight * 2) - gap) + wallHeight;
    obstacles.push({ x: canvas.width, y: pos, w: obsWidth, gap: gap });
    obstacleCount++;
}

function drawTunnel() {
    ctx.fillStyle = '#5a2d0c'; 
    ctx.fillRect(0, 0, canvas.width, wallHeight); 
    ctx.fillRect(0, canvas.height - wallHeight, canvas.width, wallHeight);
    
    ctx.strokeStyle = '#3d1e08';
    ctx.lineWidth = 4;
    for(let i=0; i<canvas.width; i+=80) {
        ctx.strokeRect(i, 0, 80, wallHeight);
        ctx.strokeRect(i, canvas.height - wallHeight, 80, wallHeight);
    }
}

function update() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawTunnel();

    let now = Date.now();
    let timeSinceStart = now - startTime;

    // SPAWN LOGIC
    if (obstacleCount === 0) {
        // First obstacle: wait 2 seconds
        if (timeSinceStart > 2000) {
            spawnObstacle();
            lastObstacleTime = now;
        }
    } else {
        // Following obstacles: wait 2.5 seconds
        if (now - lastObstacleTime > 2500) {
            spawnObstacle();
            lastObstacleTime = now;
        }
    }

    // Speed increase after 60s
    if (timeSinceStart > 60000) speed = 9; 

    // Character Rendering
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.bodyW, player.bodyH); 
    ctx.fillRect(player.x - 15, player.y + 10, 15, 40); 
    ctx.fillRect(player.x + player.bodyW, player.y + 10, 15, 40);

    if (headImg.complete && headImg.naturalWidth !== 0) {
        ctx.drawImage(headImg, player.x - 25, player.y - player.headSize + 10, player.headSize + 15, player.headSize);
    } else {
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(player.x + 22, player.y - 30, 45, 0, Math.PI*2);
        ctx.fill();
    }

    // Obstacle movement
    obstacles.forEach((o, i) => {
        o.x -= speed;
        
        if (obsImg.complete && obsImg.naturalWidth !== 0) {
            ctx.drawImage(obsImg, o.x, wallHeight, o.w, o.y - wallHeight); 
            ctx.drawImage(obsImg, o.x, o.y + o.gap, o.w, canvas.height - wallHeight - (o.y + o.gap)); 
        } else {
            ctx.fillStyle = "#444";
            ctx.fillRect(o.x, wallHeight, o.w, o.y - wallHeight);
            ctx.fillRect(o.x, o.y + o.gap, o.w, canvas.height - wallHeight - (o.y + o.gap));
        }

        // Collision Check
        if (player.x < o.x + o.w && player.x + player.bodyW > o.x) {
            if (player.y - 50 < o.y || player.y + player.bodyH > o.y + o.gap) {
                gameOver();
            }
        }

        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').innerText = `SCORE: ${score}`;
        }
    });

    requestAnimationFrame(update);
}

function gameOver() {
    gameActive = false;
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').innerText = "SCORE: " + score;
    deathSound.play().catch(() => {}); 
}

function resetGame() {
    location.reload(); 
}

update();
