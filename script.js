const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

const tileSize = 15;
const tiles = canvas.width / tileSize;

let snake;
let direction;
let queuedDirection;
let food;
let score;
let gameOver;

function reset() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  queuedDirection = direction;
  food = randomFoodPosition();
  score = 0;
  gameOver = false;
  scoreEl.textContent = `Score: ${score}`;
  statusEl.textContent = "Play!";
}

function randomFoodPosition() {
  let next;
  do {
    next = {
      x: Math.floor(Math.random() * tiles),
      y: Math.floor(Math.random() * tiles)
    };
  } while (snake?.some((part) => part.x === next.x && part.y === next.y));
  return next;
}

function setDirection(key) {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const next = map[key];
  if (!next) return;

  if (next.x === -direction.x && next.y === -direction.y) return;
  queuedDirection = next;

  if (gameOver) {
    reset();
  }
}

function update() {
  if (gameOver) return;

  direction = queuedDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tiles ||
    head.y >= tiles ||
    snake.some((part) => part.x === head.x && part.y === head.y)
  ) {
    gameOver = true;
    statusEl.textContent = "Game Over! Press a key/tap to restart.";
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = `Score: ${score}`;
    food = randomFoodPosition();
  } else {
    snake.pop();
  }
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCell(food.x, food.y, "#1f3019");
  snake.forEach((part, index) => {
    drawCell(part.x, part.y, index === 0 ? "#10190d" : "#1a2816");
  });
}

function tick() {
  update();
  draw();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  setDirection(key);
});

document.querySelectorAll(".control").forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.dir);
  });
});

reset();
draw();
setInterval(tick, 120);
