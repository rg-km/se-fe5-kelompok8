const CELL_SIZE = 20;
const CANVAS_SIZE = 600;
const REDRAW_INTERVAL = 50;
const WIDTH = CANVAS_SIZE / CELL_SIZE;
const HEIGHT = CANVAS_SIZE / CELL_SIZE;
const DIRECTION = {
	LEFT: 0,
	RIGHT: 1,
	UP: 2,
	DOWN: 3,
};

const EARLY_MOVE_INTERVAL = 120;
let CURRENT_MOVE_INTERVAL = EARLY_MOVE_INTERVAL;

let audio = new Audio('game-over.mp3');

//image
let headImg = new Image();
let bodyImg = new Image();
let tailImg = new Image();
let appleImg = new Image();
let lifeImg = new Image();
headImg.src = 'assets/head.png';
bodyImg.src = 'assets/body.png';
tailImg.src = 'assets/tail.png';
appleImg.src = 'assets/apple.png';
lifeImg.src = 'assets/life.png';

let level = 1;
let life = 3;
let score = 0;

function initPosition() {
	return {
		x: Math.floor(Math.random() * WIDTH),
		y: Math.floor(Math.random() * HEIGHT),
	};
}

function initHeadAndBody() {
	let head = initPosition();
	let body = [{ x: head.x, y: head.y }];
	return {
		head: head,
		body: body,
	};
}

function initDirection() {
	return Math.floor(Math.random() * 4);
}

function initSnake(color) {
	return {
		color: color,
		...initHeadAndBody(),
		direction: initDirection(),
	};
}
let snake1 = initSnake('green');

let apple1 = {
	position: initPosition(),
};

let apple2 = {
	position: initPosition(),
};

// create nyawa
let health = {
	appear: false,
	position: initPosition(),
};

function drawCell(ctx, x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawImagePixel(ctx, x, y, img) {
	ctx.drawImage(img, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function levelUp() {
	level++;
	CURRENT_MOVE_INTERVAL -= 20;
	alert(`Selamat anda Naik level ${level}`);
	updateHtml();
}

function updateHtml() {
	let levelElement = document.getElementById('level-up');
	levelElement.innerText = level;
	let speedElement = document.getElementById('speed');
	speedElement.innerText = CURRENT_MOVE_INTERVAL;
}


// Update life
function updateLifeHtml() {
	let lifeElement = document.getElementById('life');
	lifeElement.innerHTML = '';
	for (var i = 0; i < life; i++) {
		let node = document.createElement('IMG');
		node.src = 'assets/life.png';
		lifeElement.appendChild(node);
		console.log(life);
	}
}

function drawScore(snake) {
	let scoreCanvas;
	if (snake.color == snake1.color) {
		scoreCanvas = document.getElementById('score1Board');
	}
	let scoreCtx = scoreCanvas.getContext('2d');

	scoreCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
	scoreCtx.font = '30px Arial';
	scoreCtx.fillStyle = snake.color;
	scoreCtx.fillText(score, 10, scoreCanvas.scrollHeight / 2);
}

function draw() {
	setInterval(function () {
		let snakeCanvas = document.getElementById('snakeBoard');
		let ctx = snakeCanvas.getContext('2d');

		ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

		drawImagePixel(ctx, snake1.head.x, snake1.head.y, headImg);

		for (let i = 1; i < snake1.body.length; i++) {
			if (i == snake1.body.length - 1) {
				drawImagePixel(ctx, snake1.body[i].x, snake1.body[i].y, tailImg);
			} else {
				drawImagePixel(ctx, snake1.body[i].x, snake1.body[i].y, bodyImg);
			}
		}

		//apple
		drawImagePixel(ctx, apple1.position.x, apple1.position.y, appleImg);
		drawImagePixel(ctx, apple2.position.x, apple2.position.y, appleImg);
		if (health.appear) {
			drawImagePixel(ctx, health.position.x, health.position.y, lifeImg);
		}

		drawScore(snake1);
	}, REDRAW_INTERVAL);
}

function teleport(snake) {
	if (snake.head.x < 0) {
		snake.head.x = CANVAS_SIZE / CELL_SIZE - 1;
	}
	if (snake.head.x >= WIDTH) {
		snake.head.x = 0;
	}
	if (snake.head.y < 0) {
		snake.head.y = CANVAS_SIZE / CELL_SIZE - 1;
	}
	if (snake.head.y >= HEIGHT) {
		snake.head.y = 0;
	}
}

function eat(snake, apple) {
	if (snake.head.x == apple.position.x && snake.head.y == apple.position.y) {
		apple.position = initPosition();
		score++;
		snake.body.push({ x: snake.head.x, y: snake.head.y });
		if (score % 5 === 0) {
			levelUp();
		}
		health.appear = isPrimeNumber(score);
		console.log(health.appear);
		health.position = initPosition();
	}
}

function eatLife(snake) {
	if (health.appear == true && snake.head.x == health.position.x && snake.head.y == health.position.y) {
		life++;
		updateLifeHtml();
		health.appear = false;
		health.position = initPosition();
	}
}

function isPrimeNumber(score) {
	if (score === 1) {
		return false;
	}

	for (let i = 2; i < score; i++) {
		if (score % i == 0) {
			return false;
		}
	}
	return true;
}

function moveLeft(snake) {
	snake.head.x--;
	teleport(snake);
	eat(snake, apple1);
	eat(snake, apple2);
	eatLife(snake);
}

function moveRight(snake) {
	snake.head.x++;
	teleport(snake);
	eat(snake, apple1);
	eat(snake, apple2);
	eatLife(snake);
}

function moveDown(snake) {
	snake.head.y++;
	teleport(snake);
	eat(snake, apple1);
	eat(snake, apple2);
	eatLife(snake);
}

function moveUp(snake) {
	snake.head.y--;
	teleport(snake);
	eat(snake, apple1);
	eat(snake, apple2);
	eatLife(snake);
}

function checkCollision(snakes) {
	let isCollide = false;
	//this
	for (let i = 0; i < snakes.length; i++) {
		for (let j = 0; j < snakes.length; j++) {
			for (let k = 1; k < snakes[j].body.length; k++) {
				if (snakes[i].head.x == snakes[j].body[k].x && snakes[i].head.y == snakes[j].body[k].y) {
					isCollide = true;
				}
			}
		}
	}
	if (isCollide) {
		audio.play();
		alert('Game over');
		snake1 = initSnake('green');
		life--;
		if (life < 1) {
			level = 1;
			CURRENT_MOVE_INTERVAL = EARLY_MOVE_INTERVAL;
			life = 3;
			score = 0;
			updateHtml();
		}
		updateLifeHtml();
	}
	return isCollide;
}

function move(snake) {
	switch (snake.direction) {
		case DIRECTION.LEFT:
			moveLeft(snake);
			break;
		case DIRECTION.RIGHT:
			moveRight(snake);
			break;
		case DIRECTION.DOWN:
			moveDown(snake);
			break;
		case DIRECTION.UP:
			moveUp(snake);
			break;
	}
	moveBody(snake);
	if (!checkCollision(snake1)) {
		setTimeout(function () {
			move(snake);
		}, CURRENT_MOVE_INTERVAL);
	} else {
		initGame();
	}
}

function moveBody(snake) {
	snake.body.unshift({ x: snake.head.x, y: snake.head.y });
	snake.body.pop();
}

function turn(snake, direction) {
	const oppositeDirections = {
		[DIRECTION.LEFT]: DIRECTION.RIGHT,
		[DIRECTION.RIGHT]: DIRECTION.LEFT,
		[DIRECTION.DOWN]: DIRECTION.UP,
		[DIRECTION.UP]: DIRECTION.DOWN,
	};

	if (direction !== oppositeDirections[snake.direction]) {
		snake.direction = direction;
	}
}

document.addEventListener('keydown', function (event) {
	if (event.key === 'ArrowLeft') {
		turn(snake1, DIRECTION.LEFT);
	} else if (event.key === 'ArrowRight') {
		turn(snake1, DIRECTION.RIGHT);
	} else if (event.key === 'ArrowUp') {
		turn(snake1, DIRECTION.UP);
	} else if (event.key === 'ArrowDown') {
		turn(snake1, DIRECTION.DOWN);
	}
});

function initGame() {
	move(snake1);
}

initGame();



