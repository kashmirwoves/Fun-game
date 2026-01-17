const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathSound = document.getElementById('deathSound');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- ASSET PLACEHOLDERS ---
const headImg = new Image(); headImg.src = 'head.png'; 
const obsImg = new Image();  obsImg.src = 'obstacle.png';

let gameActive = true;
let score = 0;
let speed = 5;
let startTime = Date.now();
let lastObstacleTime = 0; 

const wallHeight = 70; // Thick brick walls top/bottom

const player = {
    x: 60,
    y: canvas.height / 2,
    bodyW: 40,
    bodyH: 60,
    headSize: 85 
};

// Dragging Control (Mobile & Desktop)
function handleMove(e) {
    if (!gameActive) return;
    let posY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Bounds check to stop at brick walls
    const minY = wallHeight + 10;
    const maxY = canvas.height - wallHeight - player.bodyH - 10;
    
    if (posY < minY) player.y = minY;
    else if (posY > maxY) player.y = maxY;
    else player.y = posY;
}

window.addEventListener('mousemove', handleMove);
window.addEventListener('touchstart', (e) => handleMove(e));
window.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e); }, {passive: false});

let obstacles = [];

function spawnObstacle() {
    let gap = 220; // Enough space for the big head
    let obstacleWidth = 130; // Wide obstacles
    let pos = Math.random() * (canvas.height - (wallHeight * 2) - gap) + wallHeight;
    
    obstacles.push({ x: canvas.width, y: pos, w: obstacleWidth, gap: gap });
}

function drawBricks() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, canvas.width, wallHeight); 
    ctx.fillRect(0, canvas.height - wallHeight, canvas.width, wallHeight);
    
    // Brick pattern
    ctx.strokeStyle = '#5D2E0A';
    ctx.lineWidth = 3;
    for(let i=0; i<canvas.width; i+=60) {
        ctx.strokeRect(i, 0, 60, wallHeight);
        ctx.strokeRect(i, canvas.height - wallHeight, 60, wallHeight);
    }
}

function update() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();

    // Spawn Timing: 2.5 Seconds
    let currentTime = Date.now();
    if (currentTime - lastObstacleTime > 2500) {
        spawnObstacle();
        lastObstacleTime = currentTime;
    }

    // Draw Character
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.bodyW, player.bodyH); // Suit body
    ctx.fillRect(player.x - 12, player.y + 10, 12, 40); // Arms
    ctx.fillRect(player.x + player.bodyW, player.y + 10, 12, 40);

    // Head (Image or colored circle)
    if (headImg.complete && headImg.naturalWidth !== 0) {
        ctx.drawImage(headImg, player.x - 25, player.y - player.headSize + 15, player.headSize + 10, player.headSize);
    } else {
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(player.x + 20, player.y - 25, 45, 0, Math.PI*2);
        ctx.fill();
    }

    // Move and Draw Obstacles
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

        // Collision logic
        if (player.x < o.x + o.w && player.x + player.bodyW > o.x) {
            // Check top of head and bottom of suit
            if (player.y - 60 < o.y || player.y + player.bodyH > o.y + o.gap) {
                endGame();
            }
        }

        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').innerText = `Score: ${score}`;
        }
    });

    // Speed increase after 60s
    if (currentTime - startTime > 60000) speed = 8.5;

    requestAnimationFrame(update);
}

function endGame() {
    gameActive = false;
    document.getElementById('game-over').classList.remove('hidden');
    deathSound.play().catch(() => {}); // Plays only if death.mp3 exists
}

function resetGame() {
    location.reload(); 
}

update();
