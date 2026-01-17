const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathSound = document.getElementById('deathSound');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- ASSETS ---
const headImg = new Image(); headImg.src = 'head.png';
const obsImg = new Image();  obsImg.src = 'obstacle.png';

let gameActive = true;
let score = 0;
let speed = 5;
let startTime = Date.now();
let lastObstacleTime = 0; // Track timing for the 4-second gap

const wallHeight = 80;

const player = {
    x: 60,
    y: canvas.height / 2,
    bodyW: 40,
    bodyH: 60,
    headSize: 85 // Big head
};

// Controls
function handleMove(e) {
    if (!gameActive) return;
    let posY = e.touches ? e.touches[0].clientY : e.clientY;
    if (posY > wallHeight + 20 && posY < canvas.height - wallHeight - player.bodyH) {
        player.y = posY;
    }
}
window.addEventListener('mousemove', handleMove);
window.addEventListener('touchstart', handleMove); // Support tap to jump-to-position
window.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e); }, {passive: false});

let obstacles = [];

function spawnObstacle() {
    let gap = 200; // Space to fly through
    let obstacleWidth = 120; // MADE WIDER as requested
    let pos = Math.random() * (canvas.height - (wallHeight * 2) - gap) + wallHeight;
    
    obstacles.push({ 
        x: canvas.width, 
        y: pos, 
        w: obstacleWidth, 
        gap: gap 
    });
}

function drawBricks() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, canvas.width, wallHeight); // Top
    ctx.fillRect(0, canvas.height - wallHeight, canvas.width, wallHeight); // Bottom
    
    ctx.strokeStyle = '#5D2E0A';
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=50) {
        ctx.strokeRect(i, 0, 50, wallHeight);
        ctx.strokeRect(i, canvas.height - wallHeight, 50, wallHeight);
    }
}

function update() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();

    // 1. TIMING LOGIC: Spawn obstacle every 4 seconds (4000 milliseconds)
    let currentTime = Date.now();
    if (currentTime - lastObstacleTime > 4000) {
        spawnObstacle();
        lastObstacleTime = currentTime;
    }

    // 2. DRAW MAN IN SUIT
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.bodyW, player.bodyH); // Suit
    ctx.fillRect(player.x - 12, player.y + 10, 12, 40); // Left Arm
    ctx.fillRect(player.x + player.bodyW, player.y + 10, 12, 40); // Right Arm

    // Big Head Logic
    if (headImg.complete && headImg.naturalWidth !== 0) {
        ctx.drawImage(headImg, player.x - 25, player.y - player.headSize + 10, player.headSize + 10, player.headSize);
    } else {
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(player.x + 20, player.y - 25, 45, 0, Math.PI*2);
        ctx.fill();
    }

    // 3. OBSTACLE MOVEMENT & COLLISION
    obstacles.forEach((o, i) => {
        o.x -= speed;
        
        if (obsImg.complete && obsImg.naturalWidth !== 0) {
            ctx.drawImage(obsImg, o.x, wallHeight, o.w, o.y - wallHeight); 
            ctx.drawImage(obsImg, o.x, o.y + o.gap, o.w, canvas.height - wallHeight - (o.y + o.gap)); 
        } else {
            ctx.fillStyle = "#555";
            ctx.fillRect(o.x, wallHeight, o.w, o.y - wallHeight);
            ctx.fillRect(o.x, o.y + o.gap, o.w, canvas.height - wallHeight - (o.y + o.gap));
        }

        // Precise Collision Detection
        if (player.x < o.x + o.w && player.x + player.bodyW > o.x) {
            // Check if head or body hits the top or bottom obstacle
            if (player.y - 40 < o.y || player.y + player.bodyH > o.y + o.gap) {
                gameOver();
            }
        }

        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').innerText = `Score: ${score}`;
        }
    });

    // Speed up after 60s
    if (currentTime - startTime > 60000) speed = 8;

    requestAnimationFrame(update);
}

function gameOver() {
    gameActive = false;
    document.getElementById('game-over').classList.remove('hidden');
    // Try to play sound if file exists, otherwise ignore
    deathSound.play().catch(() => {});
}

function resetGame() {
    location.reload(); 
}

update();
