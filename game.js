const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathSound = document.getElementById('deathSound');

// 1. WIDE ANGLE INTERNAL RESOLUTION
const GAME_WIDTH = 1200; 
const GAME_HEIGHT = 800;

function resize() {
    const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    canvas.style.width = (GAME_WIDTH * scale) + 'px';
    canvas.style.height = (GAME_HEIGHT * scale) + 'px';
}
window.addEventListener('resize', resize);
resize();

// 2. ASSETS (Images will auto-load if you place them in the folder)
const headImg = new Image(); headImg.src = 'head.png'; 
const obsImg = new Image();  obsImg.src = 'obstacle.png';

let gameActive = true;
let score = 0;
let speed = 7.5; // Adjusted for wide-angle visibility
let startTime = Date.now();
let lastObstacleTime = Date.now(); 
let obstacleCount = 0;

const wallHeight = 100; // Thick brick tunnel walls

const player = {
    x: 120, // Positioned slightly into the screen
    y: GAME_HEIGHT / 2,
    bodyW: 50,
    bodyH: 75,
    headSize: 110 // Big head (Size relative to body)
};

// 3. CONTROLS (Dragging/Touch anywhere on screen)
function moveMan(e) {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = GAME_HEIGHT / rect.height;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let canvasY = (clientY - rect.top) * scaleY;
    
    // Boundary check: Stay between brick walls
    const minY = wallHeight + 20; 
    const maxY = GAME_HEIGHT - wallHeight - player.bodyH - 20;

    if (canvasY < minY) player.y = minY;
    else if (canvasY > maxY) player.y = maxY;
    else player.y = canvasY;
}

window.addEventListener('mousemove', moveMan);
window.addEventListener('touchstart', (e) => { moveMan(e); });
window.addEventListener('touchmove', (e) => { e.preventDefault(); moveMan(e); }, {passive: false});

let obstacles = [];

// 4. SOFA STRIKER (Obstacle) Logic
function spawnObstacle() {
    let gap = 270; // Open space for player to fly through
    let obsWidth = 160; // Wide obstacles
    let pos = Math.random() * (GAME_HEIGHT - (wallHeight * 2) - gap) + wallHeight;
    obstacles.push({ x: GAME_WIDTH, y: pos, w: obsWidth, gap: gap });
    obstacleCount++;
}

function drawTunnel() {
    // Drawing Brick Walls
    ctx.fillStyle = '#8B4513'; 
    ctx.fillRect(0, 0, GAME_WIDTH, wallHeight); 
    ctx.fillRect(0, GAME_HEIGHT - wallHeight, GAME_WIDTH, wallHeight);
    
    // Brick Detail Lines
    ctx.strokeStyle = '#5D2E0A';
    ctx.lineWidth = 4;
    for(let i=0; i < GAME_WIDTH + 200; i+=100) {
        let offset = (Date.now() / 15) % 100; // Moving wall effect
        ctx.strokeRect(i - offset, 0, 100, wallHeight);
        ctx.strokeRect(i - offset, GAME_HEIGHT - wallHeight, 100, wallHeight);
    }
}

function update() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    drawTunnel();

    let now = Date.now();
    let timeSinceStart = now - startTime;

    // 5. TIMING: 2s delay for first, then 2.5s for rest
    let spawnDelay = (obstacleCount === 0) ? 2000 : 2500;
    if (now - lastObstacleTime > spawnDelay) {
        spawnObstacle();
        lastObstacleTime = now;
    }

    // SPEED INCREASE: Viral difficulty after 60s
    if (timeSinceStart > 60000) speed = 10;

    // 6. DRAW PLAYER (Suit Man)
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.bodyW, player.bodyH); // Suit
    ctx.fillRect(player.x - 15, player.y + 10, 15, 45); // Left Arm
    ctx.fillRect(player.x + player.bodyW, player.y + 10, 15, 45); // Right Arm

    // Big Head (Image or Placeholder)
    if (headImg.complete && headImg.naturalWidth !== 0) {
        ctx.drawImage(headImg, player.x - 30, player.y - player.headSize + 20, player.headSize + 20, player.headSize);
    } else {
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(player.x + 25, player.y - 35, 55, 0, Math.PI*2);
        ctx.fill();
    }

    // 7. OBSTACLE MOVEMENT & COLLISION
    obstacles.forEach((o, i) => {
        o.x -= speed;
        
        // Draw Obstacle (Image or Placeholder)
        if (obsImg.complete && obsImg.naturalWidth !== 0) {
            ctx.drawImage(obsImg, o.x, wallHeight, o.w, o.y - wallHeight); 
            ctx.drawImage(obsImg, o.x, o.y + o.gap, o.w, GAME_HEIGHT - wallHeight - (o.y + o.gap)); 
        } else {
            ctx.fillStyle = "#444";
            ctx.fillRect(o.x, wallHeight, o.w, o.y - wallHeight); // Top
            ctx.fillRect(o.x, o.y + o.gap, o.w, GAME_HEIGHT - wallHeight - (o.y + o.gap)); // Bottom
        }

        // Collision Check (Head and Body)
        if (player.x < o.x + o.w && player.x + player.bodyW > o.x) {
            // Check top (head height) and bottom (body height)
            if (player.y - 60 < o.y || player.y + player.bodyH > o.y + o.gap) {
                gameOver();
            }
        }

        // Remove off-screen obstacles & increment score
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
    document.getElementById('final-score').innerText = "FINAL SCORE: " + score;
    deathSound.play().catch(() => {
        console.log("Audio file 'death.mp3' not found, skipping sound.");
    }); 
}

function resetGame() {
    location.reload(); 
}

// Start the loop
update();
