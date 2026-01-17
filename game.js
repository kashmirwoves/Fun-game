const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

let canvasWidth, canvasHeight;
let character, obstacles = [];
let score = 0;
let gameOver = false;
let speed = 5;
let gameInterval, speedInterval;

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    // Character: equal body and head size, unique design placeholder
    character = {
        x: canvasWidth / 4,
        y: canvasHeight / 2,
        size: 30, // Body size
        headSize: 30, // Head size equal to body
        // Placeholder for image - can be added later
    };
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Implement character dragging for mobile (finger touch)
let isDragging = false;
canvas.addEventListener('touchstart', (e) => {
    const touchY = e.touches[0].clientY;
    if (Math.abs(touchY - character.y) < character.size) {
        isDragging = true;
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const touchY = e.touches[0].clientY;
        // Restrict movement within tunnel boundaries (adjust as needed)
        character.y = Math.max(character.headSize, Math.min(canvasHeight - character.headSize, touchY));
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

function createObstacle() {
    // Tunnel game: obstacles above and below with open space
    const minSpace = character.headSize * 4; // Sufficient space for character
    const spaceHeight = minSpace + Math.random() * (canvasHeight / 3);
    const spaceY = character.headSize + Math.random() * (canvasHeight - 2 * character.headSize - spaceHeight);

    obstacles.push({
        x: canvasWidth,
        y1: 0,
        h1: spaceY,
        y2: spaceY + spaceHeight,
        h2: canvasHeight - spaceY - spaceHeight,
        width: 30,
        // Placeholder for images
    });
}

function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    score++;
    
    // Draw character (placeholder visuals)
    ctx.fillStyle = '#0000FF'; // Suit color
    ctx.fillRect(character.x - character.size / 2, character.y - character.size / 2, character.size, character.size);
    ctx.fillStyle = '#FF0000'; // Head color (placeholder for image)
    ctx.beginPath();
    ctx.arc(character.x, character.y - character.size / 2 - character.headSize / 2, character.headSize / 2, 0, Math.PI * 2);
    ctx.fill();
    // Basic representation of hands and arms
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#0000FF';
    ctx.beginPath();
    ctx.moveTo(character.x - character.size / 2, character.y);
    ctx.lineTo(character.x - character.size, character.y + character.size / 2);
    ctx.moveTo(character.x + character.size / 2, character.y);
    ctx.lineTo(character.x + character.size, character.y + character.size / 2);
    ctx.stroke();

    // Update and draw obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= speed;

        ctx.fillStyle = '#555'; // Wall color
        ctx.fillRect(obs.x, obs.y1, obs.width, obs.h1);
        ctx.fillRect(obs.x, obs.y2, obs.width, obs.h2);

        // Collision detection
        if (character.x + character.size / 2 > obs.x && character.x - character.size / 2 < obs.x + obs.width) {
            if (character.y - character.headSize / 2 < obs.h1 || character.y + character.size / 2 > obs.y2) {
                endGame();
            }
        }
    }

    // Remove off-screen obstacles
    if (obstacles.length > 0 && obstacles[0].x < -obstacles[0].width) {
        obstacles.shift();
    }

    // Add new obstacles
    if (score % 100 === 0) { // Adjust frequency
        createObstacle();
    }

    // Display score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    clearInterval(speedInterval);
    restartButton.style.display = 'block';
    // Optional: play sound here if added in the future
}

restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';
    restartGame();
});

function restartGame() {
    score = 0;
    speed = 5;
    obstacles = [];
    gameOver = false;
    character.y = canvasHeight / 2;
    createObstacle();
    gameInterval = setInterval(updateGame, 20); // Adjust interval for smoother animation
    speedInterval = setInterval(() => {
        speed += 1; // Increase speed every 60 seconds
    }, 60000);
}

restartGame(); // Start the game initially
