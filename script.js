"use strict";

//draw the map
const map = [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'W...............................W',
    'W...............................W',
    'W...............................W',
    'W...........WWWWWWWW............W',
    'WWWWWWW...................WWWWWWW',
    'W...............................W',
    'W...............................W',
    'W...............................W',
    'W.....WWWWWW.......WWWWWWW......W',
    'W...............................W',
    'W...............................W',
    'W...............................W',
    'W...............................W',
    'WWWWWWW....WWWWWWWWW....WWWWWWWWW',
    'W...............................W',
    'W...............................W',
    'W...............................W',
    'W...............................W',
    'W......WWWWW...........W........W',
    'W......................W........W',
    'W......................W........W',
    'W..................WWWWWWW......W',
    'W...............................W',
    'W.....WWWW......................W',
    'W........W......................W',
    'W........W......................W',
    'W........W......................W',
    'W........W......................W',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
];
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 20;

function drawMap() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 'W') {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}

//To check whether the tank collides with the wall
function isColliding(x, y, width, height) {
    const leftTile = Math.floor(x / tileSize);
    const rightTile = Math.floor((x + width) / tileSize);
    const topTile = Math.floor(y / tileSize);
    const bottomTile = Math.floor((y + height) / tileSize);

    for (let row = topTile; row <= bottomTile; row++) {
        for (let col = leftTile; col <= rightTile; col++) {
            if (map[row] && map[row][col] === 'W') {
                return true;
            }
        }
    }
    return false;
}

//the setting of the tank
const tankImage = new Image();
tankImage.src = "tank.png";

class Tank {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 38.8;
        this.height = 38.8;
        this.speed = 2;
        this.direction = 0;
    }
    //import the outside images
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.direction);
        ctx.drawImage(tankImage, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
    //basic movement
    rotateLeft() {
        this.direction -= 0.05;
    }

    rotateRight() {
        this.direction += 0.05
    }
    
    moveForward() {
        let dx = 0
        let dy = 0
        dx += Math.cos(this.direction-Math.PI/2) * this.speed;
        dy += Math.sin(this.direction-Math.PI/2) * this.speed;
        const nextX = this.x + dx;
        const nextY = this.y + dy;
        if (!isColliding(nextX, nextY, this.width, this.height)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    moveBackward() {
        let dx = 0
        let dy = 0
        dx -= Math.cos(this.direction-Math.PI/2) * this.speed;
        dy -= Math.sin(this.direction-Math.PI/2) * this.speed;
        const nextX = this.x + dx;
        const nextY = this.y + dy;
        if (!isColliding(nextX, nextY, this.width, this.height)) {
            this.x = nextX;
            this.y = nextY;
        }
    }
}

let tank = new Tank(canvas.width / 2 - 25, canvas.height - 80);

//setting of the cannonball
class Cannonball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.speed = 5;
        this.direction = tank.direction;
        this.color = 'red';
        this.active = true;
        this.lifetime = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        let dx = 0
        let dy = 0
        this.lifetime += 1

        dx += Math.cos(this.direction-Math.PI/2) * this.speed;
        dy += Math.sin(this.direction-Math.PI/2) * this.speed;

        const nextX1 = this.x + dx
        const nextY1 = this.y + dy

        //check whether the cannonball touch the wall
        const topLeftTile = Math.floor((nextY1 - this.radius) / tileSize) * map[0].length + Math.floor((nextX1 - this.radius) / tileSize);
        const topRightTile = Math.floor((nextY1 - this.radius) / tileSize) * map[0].length + Math.floor((nextX1 + this.radius) / tileSize);
        const bottomLeftTile = Math.floor((nextY1 + this.radius) / tileSize) * map[0].length + Math.floor((nextX1 - this.radius) / tileSize);
        const bottomRightTile = Math.floor((nextY1 + this.radius) / tileSize) * map[0].length + Math.floor((nextX1 + this.radius) / tileSize);
        const tiles = [topLeftTile, topRightTile, bottomLeftTile, bottomRightTile];

        if (this.x < 0 || this.y < 0 || this.x > canvas.width || this.y > canvas.height || this.lifetime >= 400) {
            this.active = false;
            this.lifetime = 0;
        }

        //check whether rebound
        let reboundTime = 0
        let rebound = false;
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            if (map[Math.floor(tile / map[0].length)][tile % map[0].length] === 'W') {
                rebound = true;
                break;
            }
        }

        //adjust the angle that after rebound
        
        if (rebound) {
            const gridX = Math.floor(this.x / tileSize);
            const gridY = Math.floor(this.y / tileSize);
            console.log(map[gridY+1][gridX+1],map[gridY][gridX+1],map[gridY+1][gridX],map[gridY][gridX])
            if(map[gridY][gridX - 1] === 'W' || map[gridY][gridX + 1] === 'W') {
                this.direction = -this.direction
            } 
            if(map[gridY - 1] && map[gridY - 1][gridX] === 'W' || map[gridY + 1] && map[gridY + 1][gridX] === 'W') {
                this.direction = -this.direction + Math.PI
            }
            console.log(reboundTime)
        } else {
            this.x = nextX1;
            this.y = nextY1;
        }
    }
}

//fire the cannonball, every one second add one cannonball to the list
let cannonballs = [];

let canFire = true;

function fireCannonball() {
    if (canFire) {
        const cannonball = new Cannonball(tank.x, tank.y) //+ tank.width*Math.sin(tank.direction) / 2)
        cannonballs.push(cannonball);
        canFire = false;
        setTimeout(() => {
            canFire = true;
        }, "1 second");
    }
}

const keys = {};

//enemy setting
class Enemy {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.width = 15;
      this.height = 10;
      this.color = color;
    }
  
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  
    isHit(cannonball) {
      const edx = this.x - cannonball.x;
      const edy = this.y - cannonball.y;
      const distance = Math.sqrt(edx * edx + edy * edy);
  
      return distance < (this.width/2 + cannonball.radius);
    }
}

let enemies = [new Enemy(30, 30, 'green')];

//eventlistener for key pressing
document.addEventListener('keydown', (e) => {
        if (e.code === 'H' || e.key === 'h') {
            fireCannonball();
        } else {
            keys[e.key] = true;
        }
    });

document.addEventListener('keyup', (e) => {
    if (!(e.code === 'H' || e.key === 'h')) {
        keys[e.key] = false;
    }
});

//random choice function, randomly choose one element from list choices
function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

const choices = ['green','yellow','tomato','blue']

//randomly generate new position
function randomPosition() {
    let randomX, randomY;
    let isValidPosition = false;

    while (!isValidPosition) {
        randomX = Math.floor(Math.random() * ((canvas.width / tileSize) - 2) + 1) * tileSize;
        randomY = Math.floor(Math.random() * ((canvas.height / tileSize) - 2) + 1) * tileSize;

        const X1 = Math.floor(randomX / tileSize);
        const X2 = Math.floor((randomX + tileSize - 1) / tileSize);
        const Y1 = Math.floor(randomY / tileSize);
        const Y2 = Math.floor((randomY + tileSize - 1) / tileSize);

        if (map[Y1][X1] === '.' &&
            map[Y1][X2] === '.' &&
            map[Y2][X1] === '.' &&
            map[Y2][X2] === '.'
            ) {
            isValidPosition = true;
        }
    }

    return { x: randomX, y: randomY };
}

//count the number of enemies being killed
let number = 0

function numberCount() {
    const scoreDiv = document.getElementById('score');
    scoreDiv.textContent = "Enemies hit: " + number;
}

//countdown timer
let time = 60;
const countdown = document.getElementById('countdown');
let gamestart = false;

function countdowntimer() {
    if (gamestart) {
        time--;
        countdown.textContent = time;

        if (time <= 0) {
            clearInterval(countdownInterval);
            gameover();
        }
    }
}

let countdownInterval = setInterval(countdowntimer, 1000);

let gameloops;
//gameloop
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    tank.draw();
    enemies.forEach((enemy) => {
        enemy.draw();
    });

    if (keys['a'] || keys['A']) {
        tank.rotateLeft();
    }

    if (keys['d'] || keys['D']) {
        tank.rotateRight();
    }

    if (keys['w'] || keys['W']) {
        tank.moveForward();
    }

    if (keys['s'] || keys['S']) {
        tank.moveBackward();
    }

    for (let i = 0; i < cannonballs.length; i++) {
        const cannonball1 = cannonballs[i];
        cannonball1.update();
        cannonball1.draw();

        if (cannonball1.active === false) {
            cannonballs.splice(i,1)
        }

        if (cannonballs.length > 9) {
            cannonballs.splice(0,1)
        }

        if (cannonball1.y < 0) {
            cannonballs.splice(i, 1);
            i--;
        }

        for (let k = 0; k < enemies.length; k++) {
            const enemy1 = enemies[k]
            if (enemy1.isHit(cannonball1)) {
                enemies.push(new Enemy(randomPosition().x, randomPosition().y, choose(choices)));
                enemies.splice(k, 1)
                number = number + 1
            }
        }
    }

    numberCount();
    gamestart = true;
    gameloops = requestAnimationFrame(gameLoop);
    gameloops;
}

function startGame() {
    gameLoop();
    document.getElementById("startGame").style.visibility = "hidden";
    document.getElementById("guide").style.visibility = "hidden";
    document.getElementById("score").style.visibility = "visible";
    document.getElementById("countdown").style.visibility = "visible";
}

document.getElementById('startGame').addEventListener('click', startGame);

const final = document.querySelector(".f")

function gameover() {
    document.getElementById('gameover').style.visibility = 'visible';
    document.getElementById('again').style.visibility = 'visible';
    document.getElementById('menu').style.visibility = 'visible';
    final.classList.add("final");
    cancelAnimationFrame(gameloops);
}

const re = document.getElementById('again');
re.addEventListener('click', restart);
function restart() {
    reset();
    gameLoop();
}

function reset() {
    time = 60;
    number = 0;
    countdown.textContent = time;
    numberCount();

    cannonballs = [];
    enemies = [new Enemy(randomPosition().x, randomPosition().y, choose(choices))];
    document.getElementById('gameover').style.visibility = 'hidden';
    document.getElementById('again').style.visibility = 'hidden';
    document.getElementById('menu').style.visibility = 'hidden';
    final.classList.remove("final");
    clearInterval(countdownInterval);
    countdownInterval = setInterval(countdowntimer, 1000);
    tank.x = canvas.width / 2 - 25;
    tank.y = canvas.height - 80;
    tank.direction = 0;
}

