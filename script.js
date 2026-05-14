const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const coinsEl = document.getElementById("coins");
const livesEl = document.getElementById("lives");
const statusEl = document.getElementById("status");

const gravity = 0.6;
const friction = 0.85;
const worldWidth = 2600;

const player = {
  x: 80,
  y: 120,
  w: 38,
  h: 52,
  vx: 0,
  vy: 0,
  speed: 1.2,
  jump: -12,
  onGround: false,
  lives: 3,
  coins: 0
};

const camera = { x: 0 };

const platforms = [
  { x: 0, y: 490, w: 2600, h: 50, type: "ground" },
  { x: 300, y: 430, w: 140, h: 20, type: "brick" },
  { x: 540, y: 370, w: 170, h: 20, type: "brick" },
  { x: 820, y: 330, w: 150, h: 20, type: "brick" },
  { x: 1080, y: 390, w: 190, h: 20, type: "brick" },
  { x: 1410, y: 340, w: 180, h: 20, type: "brick" },
  { x: 1710, y: 300, w: 200, h: 20, type: "brick" }
];

const coins = [220, 350, 580, 610, 1000, 1170, 1470, 1760, 1830, 2300].map((x, i) => ({
  x,
  y: i % 2 ? 320 : 260,
  r: 10,
  taken: false
}));

const enemies = [700, 1240, 1540, 2010].map((x) => ({ x, y: 458, w: 30, h: 30, dir: 1 }));

const goal = { x: 2450, y: 380, w: 36, h: 110 };
const keys = {};
let won = false;

function resetLevel() {
  player.x = 80;
  player.y = 120;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  camera.x = 0;
  statusEl.textContent = "Status: Ready";
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update() {
  if (won) return;

  if (keys.ArrowLeft || keys.a) player.vx -= player.speed;
  if (keys.ArrowRight || keys.d) player.vx += player.speed;

  player.vx *= friction;
  player.vy += gravity;

  player.x += player.vx;
  player.y += player.vy;
  player.onGround = false;

  platforms.forEach((p) => {
    if (intersects(player, p)) {
      const prevBottom = player.y - player.vy + player.h;
      if (prevBottom <= p.y + 4 && player.vy >= 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  });

  if ((keys.ArrowUp || keys.w || keys[" "]) && player.onGround) {
    player.vy = player.jump;
    player.onGround = false;
  }

  coins.forEach((c) => {
    if (!c.taken && intersects(player, { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 })) {
      c.taken = true;
      player.coins += 1;
    }
  });

  enemies.forEach((e) => {
    e.x += e.dir * 1.1;
    if (e.x < 100 || e.x > worldWidth - 100) e.dir *= -1;

    if (intersects(player, e)) {
      if (player.vy > 2 && player.y + player.h - 6 < e.y + 10) {
        e.x = -9999;
        player.vy = -8;
      } else {
        player.lives -= 1;
        statusEl.textContent = "Status: Hit by enemy";
        if (player.lives <= 0) {
          statusEl.textContent = "Status: Game Over (Press R)";
        }
        resetLevel();
      }
    }
  });

  if (player.y > canvas.height + 300) {
    player.lives -= 1;
    statusEl.textContent = "Status: Fell down";
    resetLevel();
  }

  if (intersects(player, goal)) {
    won = true;
    statusEl.textContent = "Status: You Win!";
  }

  player.x = Math.max(0, Math.min(worldWidth - player.w, player.x));
  camera.x = Math.max(0, Math.min(worldWidth - canvas.width, player.x - 220));

  coinsEl.textContent = `Coins: ${player.coins}`;
  livesEl.textContent = `Lives: ${player.lives}`;
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#70c5ff");
  grad.addColorStop(1, "#d7f4ff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  drawBackground();
  ctx.save();
  ctx.translate(-camera.x, 0);

  platforms.forEach((p) => {
    ctx.fillStyle = p.type === "ground" ? "#58b948" : "#b86f35";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });

  coins.forEach((c) => {
    if (c.taken) return;
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach((e) => {
    if (e.x < -1000) return;
    ctx.fillStyle = "#7a3f22";
    ctx.fillRect(e.x, e.y, e.w, e.h);
  });

  ctx.fillStyle = "#fff";
  ctx.fillRect(goal.x + 14, goal.y, 6, goal.h);
  ctx.fillStyle = "#e02121";
  ctx.fillRect(goal.x, goal.y, 28, 18);

  ctx.fillStyle = "#dd2f2f";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "#1e40af";
  ctx.fillRect(player.x + 6, player.y + 28, player.w - 12, 20);

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  keys[key] = true;
  if (key === "r") {
    player.lives = 3;
    player.coins = 0;
    coins.forEach((c) => (c.taken = false));
    won = false;
    resetLevel();
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  keys[key] = false;
});

resetLevel();
loop();
