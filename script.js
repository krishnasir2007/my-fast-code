const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Paddle settings
const playerPaddleWidth = 100;
const aiPaddleWidth = 850; // AI paddle width adjusted for better gameplay
const paddleHeight = 10;

// Ball settings
const ballRadius = 10;
let ballX = canvas.width / 2,
    ballY = canvas.height / 2;
let ballSpeedX = 4,
    ballSpeedY = -4;
const maxSpeed = 8; // Maximum speed to prevent extreme ball movement
const speedIncrease = 0.2;

// Player movement settings
let playerX = canvas.width / 2 - playerPaddleWidth / 2;
let playerY = canvas.height - 20;
let aiX = canvas.width / 2 - aiPaddleWidth / 2;
let aiY = 10;

let leftPressed = false,
    rightPressed = false;
let gameStarted = false,
    gamePaused = false;
let gameInterval, timerInterval, speedInterval;
let totalSeconds = 0;

// DOM Elements
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const timerDisplay = document.getElementById("timer");
const gameOverMessage = document.getElementById("gameOverMessage");

// Reset the game state
function resetGame() {
    playerX = canvas.width / 2 - playerPaddleWidth / 2;
    aiX = canvas.width / 2 - aiPaddleWidth / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 4; // Start with horizontal speed to the right
    ballSpeedY = -4; // Ball starts going up
    totalSeconds = 0;
    timerDisplay.textContent = "Time: 00:00";
    gameOverMessage.style.display = "none";
    gamePaused = false;
    pauseBtn.textContent = "Pause";
}

// Start the game
function startGame() {
    if (gameStarted) return;
    resetGame();
    gameStarted = true;

    // Set a predictable, yet dynamic direction for the ball
    // The ball will always go up and either to the left or right randomly
    ballSpeedX = Math.random() < 0.5 ? 4 : -4; // Random horizontal direction (left or right)
    ballSpeedY = -4; // Ball starts going up

    gameInterval = setInterval(updateGame, 1000 / 60);

    timerInterval = setInterval(() => {
        totalSeconds++;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        timerDisplay.textContent = `Time: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, 1000);

    speedInterval = setInterval(() => {
        // Ensure the ball's speed doesn't exceed the maximum allowed speed
        if (Math.abs(ballSpeedX) < maxSpeed) {
            ballSpeedX += ballSpeedX > 0 ? speedIncrease : -speedIncrease;
        }
        if (Math.abs(ballSpeedY) < maxSpeed) {
            ballSpeedY += ballSpeedY > 0 ? speedIncrease : -speedIncrease;
        }
    }, 2000);
}

// Stop the game
function stopGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(speedInterval);
    gameStarted = false;
}

// Pause/Resume the game
function pauseGame() {
    if (!gameStarted) return;
    if (!gamePaused) {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        clearInterval(speedInterval);
        gamePaused = true;
        pauseBtn.textContent = "Resume";
    } else {
        gameInterval = setInterval(updateGame, 1000 / 60);
        timerInterval = setInterval(() => {
            totalSeconds++;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = totalSeconds % 60;
            timerDisplay.textContent = `Time: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }, 1000);

        speedInterval = setInterval(() => {
            if (Math.abs(ballSpeedX) < maxSpeed) {
                ballSpeedX += ballSpeedX > 0 ? speedIncrease : -speedIncrease;
            }
            if (Math.abs(ballSpeedY) < maxSpeed) {
                ballSpeedY += ballSpeedY > 0 ? speedIncrease : -speedIncrease;
            }
        }, 2000);
        gamePaused = false;
        pauseBtn.textContent = "Pause";
    }
}

// Restart the game
function restartGame() {
    stopGame();
    startGame();
}

// Game loop
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPaddle(playerX, playerY, playerPaddleWidth); // Draw player paddle
    drawPaddle(aiX, aiY, aiPaddleWidth); // Draw AI paddle
    drawBall(); // Draw ball

    movePlayer(); // Handle player movement
    moveAI(); // Handle AI paddle movement

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball and wall collisions
    if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX; // Ball bounces off left and right walls
    }

    // Paddle collision
    if (ballY + ballRadius >= playerY && ballX >= playerX && ballX <= playerX + playerPaddleWidth) {
        ballSpeedY = -Math.abs(ballSpeedY); // Reflect ball off player paddle
        ballSpeedX += ballSpeedX > 0 ? 0.2 : -0.2; // Slight speed increase after hitting player paddle
    }

    if (ballY - ballRadius <= aiY + paddleHeight && ballX >= aiX && ballX <= aiX + aiPaddleWidth) {
        ballSpeedY = Math.abs(ballSpeedY); // Reflect ball off AI paddle
        ballSpeedX += ballSpeedX > 0 ? 0.2 : -0.2; // Slight speed increase after hitting AI paddle
    }

    // Game over condition (ball falls out of bounds)
    if (ballY < 0 || ballY > canvas.height) {
        stopGame();
        gameOverMessage.style.display = "block";
    }
}

// Draw the paddles
function drawPaddle(x, y, width) {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, width, paddleHeight);
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

// Move player paddle
function movePlayer() {
    if (leftPressed && playerX > 0) playerX -= 8;
    if (rightPressed && playerX + playerPaddleWidth < canvas.width) playerX += 8;
}

// AI movement (follows the ball)
function moveAI() {
    // AI tries to follow the ball, but with a slight delay (speed control)
    const paddleCenter = aiX + aiPaddleWidth / 2; // center of AI paddle
    const ballCenter = ballX; // center of ball (X position)

    // Move AI paddle towards the ball center
    if (paddleCenter - ballCenter > 4) {
        aiX -= 4; // Move left
    } else if (ballCenter - paddleCenter > 4) {
        aiX += 4; // Move right
    }

    // Prevent AI paddle from going out of bounds
    aiX = Math.max(0, Math.min(canvas.width - aiPaddleWidth, aiX));
}

// Keyboard input handling
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = false;
});

// Hook up buttons
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
pauseBtn.addEventListener("click", pauseGame);