const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathSound = document.getElementById('deathSound');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- ASSET LOADING (Optional) ---
const headImg = new Image(); headImg.src = 'head.png';
const obsImg = new Image();  obsImg.src = 'obstacle.png';

let gameActive = true;
let score = 0;
let speed = 5;
let startTime = Date.now();
const wallHeight = 80;

const player = {
    x: 60,
    y: canvas.height / 2,
    bodyW: 40,
    bodyH: 60,
    headSize: 80 // Equal to body size/large
};

// Controls: Move player to touch/mouse Y position
function handleMove(e) {
    if (!gameActive) return;
    let posY = e.touches ? e.touches[0].clientY : e.clientY;
    // Keep man inside the brick walls
    if (posY > wallHeight + player.headSize && posY < canvas.height - wallHeight - player.bodyH) {
        player.y = posY;
    }
}
window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e); }, {passive: false});

let obstacles = [];
function spawnObstacle() {
    let gap = 180;
    let pos = Math.random() * (canvas.height - (wallHeight * 2) - gap) + wallHeight;
    obstacles.push({ x: canvas.width, y: pos, w: 60, gap: gap });
}

function drawBricks() {
    ctx.fillStyle = '#8B4513';
    // Top wall
    ctx.fillRect(0, 0, canvas.width, wallHeight);
    // Bottom wall
    ctx.fillRect(0, canvas.height - wallHeight, canvas.width, wallHeight);
    
    // Simple brick line detail
    ctx.strokeStyle = '#5D2E0A';
    for(let i=0; i<canvas.width; i+=40) {
        ctx.strokeRect(i, 0, 40, wallHeight);
        ctx.strokeRect(i, canvas.height - wallHeight, 40, wallHeight);
    }
}

function update() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();

    // Draw Character (Man in Suit)
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.bodyW, player.bodyH); // Suit
    ctx.fillRect(player.x - 10, player.y + 5, 10, 35); // Left Arm
    ctx.fillRect(player.x + player.bodyW, player.y + 5, 10, 35); // Right Arm

    // Draw Head (Image or Circle)
    if (headImg.complete && headImg.naturalWidth !== 0) {
        ctx.drawImage(headImg, player.x - 20, player.y - player.headSize, player.headSize + 20, player.headSize);
    } else {
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(player.x + 20, player.y - 30, 40, 0, Math.PI*2);
        ctx.fill();
    }

    // Move and Draw Obstacles
    if (Math.random() < 0.015) spawnObstacle();
    
    obstacles.forEach((o, i) => {
        o.x -= speed;
        
        // Draw Obstacle (Image or Block)
        if (obsImg.complete && obsImg.naturalWidth !== 0) {
            ctx.drawImage(obsImg, o.x, wallHeight, o.w, o.y - wallHeight); // Top
            ctx.drawImage(obsImg, o.x, o.y + o.gap, o.w, canvas.height - wallHeight - (o.y + o.gap)); // Bottom
        } else {
            ctx.fillStyle = "#444";
            ctx.fillRect(o.x, wallHeight, o.w, o.y - wallHeight);
            ctx.fillRect(o.x, o.y + o.gap, o.w, canvas.height - wallHeight - (o.y + o.gap));
        }

        // Collision Detection
        if (player.x < o.x + o.w && player.x + player.bodyW > o.x) {
            if (player.y - 50 < o.y || player.y + player.bodyH > o.y + o.gap) {
                gameOver();
            }
        }

        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').innerText = `Score: ${score}`;
        }
    });

    // Speed boost after 60s
    if (Date.now() - startTime > 60000) speed = 8;

    requestAnimationFrame(update);
}

function gameOver() {
    gameActive = false;
    document.getElementById('game-over').classList.remove('hidden');
    deathSound.play().catch(() => { console.log("Music file missing - playing without sound."); });
}

function resetGame() {
    location.reload(); // Simplest way to reset all variables
}

update();
