const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Music Setup
const bgMusic = new Audio('play.mp3');
bgMusic.loop = true;
const deathSound = new Audio('end.mp3'); 

// Internal Wide Resolution
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

// Images: Put head.png and obstacle.png in your folder
const headImg = new Image(); headImg.src = 'head.png'; 
const obsImg = new Image();  obsImg.src = 'obstacle.png';

let gameActive = true;
let score = 0;
let speed = 7.5; 
let startTime = Date.now();
let lastObstacleTime = Date.now(); 
let obstacleCount = 0;
const wallHeight = 100; 

const player = {
    x: 150, 
    y: GAME_HEIGHT / 2,
    bodyW: 55, bodyH: 80, headSize: 120 
};

// Controls (Drag anywhere)
function moveMan(e) {
    if (!gameActive) return;
    
    // Start background music on first interaction
    if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
    }

    const rect = canvas.getBoundingClientRect();
    const scaleY = GAME_HEIGHT / rect.height;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let canvasY = (clientY - rect.top) * scaleY;
    
    const minY = wallHeight + 20; 
    const maxY = GAME_HEIGHT - wallHeight - player.bodyH - 20;
    player.y = Math.max(minY, Math.min(maxY, canvasY));
}

window.addEventListener('mousemove', moveMan);
window.addEventListener('touchstart', moveMan);
window.addEventListener('touchmove', (e) => { e.preventDefault(); moveMan(e); }, {passive: false});

let obstacles = [];

function spawnObstacle() {
    let gap = 280; 
    let obsWidth = 180; 
    let pos = Math.random() * (GAME_HEIGHT - (wallHeight * 2) - gap) + wallHeight;
    obstacles.push({ x: GAME_WIDTH, y: pos, w: obsWidth, gap: gap });
    obstacleCount++;
}

function drawTunnel() {
    ctx.fillStyle = '#8B4513'; 
    ctx.fillRect(0, 0, GAME_WIDTH, wallHeight); 
    ctx.fillRect(0, GAME_HEIGHT - wallHeight, GAME_WIDTH, wallHeight);
    
    ctx.strokeStyle = '#5D2E0A';
    ctx.lineWidth = 4;
    for(let i=0; i < GAME_WIDTH + 200; i+=100) {
        let offset = (Date.now() / 15) % 100;
        ctx.strokeRect(i - offset, 0, 100, wallHeight);
        ctx.strokeRect(i - offset, GAME_HEIGHT - wallHeight, 100, wallHeight);
    }
}

function update() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawTunnel();

    let now = Date.now();
    let spawnDelay = (obstacleCount === 0) ? 2000 : 2500;
    if (now - lastObstacleTime > spawnDelay) {
        spawnObstacle();
        lastObstacleTime = now;
    }

    if (now - startTime > 60000) speed = 10.5;

    // Draw Character
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.bodyW, player.bodyH); // Suit
    ctx.fillRect(player.x - 15, player.y + 10, 15, 50); // Arms
    ctx.fillRect(player.x + player.bodyW, player.y + 10, 15, 50);

    if (headImg.complete && headImg.naturalWidth !== 0) {
        ctx.drawImage(headImg, player.x - 35, player.y - player.headSize + 25, player.headSize + 20, player.headSize);
    } else {
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath(); ctx.arc(player.x + 27, player.y - 40, 60, 0, Math.PI*2); ctx.fill();
    }

    // Obstacles
    obstacles.forEach((o, i) => {
        o.x -= speed;
        if (obsImg.complete && obsImg.naturalWidth !== 0) {
            ctx.drawImage(obsImg, o.x, wallHeight, o.w, o.y - wallHeight); 
            ctx.drawImage(obsImg, o.x, o.y + o.gap, o.w, GAME_HEIGHT - wallHeight - (o.y + o.gap)); 
        } else {
            ctx.fillStyle = "#444";
            ctx.fillRect(o.x, wallHeight, o.w, o.y - wallHeight);
            ctx.fillRect(o.x, o.y + o.gap, o.w, GAME_HEIGHT - wallHeight - (o.y + o.gap));
        }

        if (player.x < o.x + o.w && player.x + player.bodyW > o.x) {
            if (player.y - 70 < o.y || player.y + player.bodyH > o.y + o.gap) endGame();
        }

        if (o.x + o.w < 0) { obstacles.splice(i, 1); score++; document.getElementById('score').innerText = `SCORE: ${score}`; }
    });

    requestAnimationFrame(update);
}

function endGame() {
    gameActive = false;
    bgMusic.pause(); // Stop play music
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').innerText = "SCORE: " + score;
    deathSound.play().catch(() => {}); 
}

function resetGame() { location.reload(); }
update();
