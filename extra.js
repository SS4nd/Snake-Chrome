
var blockSize = 15;
var width = Math.floor(window.innerWidth / blockSize) * blockSize;
var height = Math.floor(window.innerHeight / blockSize) * blockSize;
var snake = [];
var food = {};
var score = 0;
var direction = 'right';
var gameLoop;
var path = [];
var pathNum = {};
var canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '9999';
canvas.style.pointerEvents = "none";
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');


function init() {
  score = 0;
  direction = 'right';
  snake = [];
  for (var i = 10; i >= 5; i--) {
    snake.push({x: i, y: 4});
  }
  food = createFood();
  console.log(food);
  var head = {x: snake[0].x, y: snake[0].y};

  path = PATHFINDING(head, food, snake);

  gameLoop = setInterval(function() {

    draw();
    move();
  }, 100);
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  for (var i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i == 0) ? '#0ff' : '#0f0';
    ctx.fillRect(snake[i].x * blockSize, snake[i].y * blockSize, blockSize, blockSize);
  }
  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x * blockSize, food.y * blockSize, blockSize, blockSize);
  ctx.fillStyle = '#000';
  ctx.font = '16px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

function move() {
  var head = {x: snake[0].x, y: snake[0].y};
  var nextStep = {x: head.x, y: head.y}; // default value
  console.log("nextStep")
  console.log(path)
  console.log("nextStep")

  if (path && path.length > 0) {
    nextStep = path.shift();
  } else {
    var trueN = lastStep(head,food);
    nextStep = {x: trueN.x, y: trueN.y};
  }

  var dx = nextStep.x - head.x;
  var dy = nextStep.y - head.y;
  
  head = {x: head.x + dx, y: head.y + dy};
    
  snake.unshift(head);
  if (head.x < 0 || head.x >= width / blockSize || head.y < 0 || head.y >= height / blockSize || checkCollision(head)) {
    clearInterval(gameLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
    
  if (head.x == food.x && head.y == food.y) {
    score++;
    food = createFood();
    path = PATHFINDING(head, food, snake);
  } else {
    snake.pop();
  }
}
function lastStep(head){
  const neighbors = [      { x: head.x - 1, y: head.y },      { x: head.x + 1, y: head.y },      { x: head.x, y: head.y - 1 },      { x: head.x, y: head.y + 1 },    ];

  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i];
    if (neighbor.x === food.x && neighbor.y === food.y) {
      bbb = true;
      return{x: neighbor.x, y: neighbor.y };
    }
  }
}

function createFood() {
  return {x: Math.floor((Math.random() * width)/blockSize), y:  Math.floor((Math.random() * height) / blockSize)};
}

function checkCollision(head) {
    for (var i = 1; i < snake.length; i++) {
        if (head.x == snake[i].x && head.y == snake[i].y) {
            return true;
        }
    }
}

function PATHFINDING(start, end, obstacles) {
  var openSet = [start];
  var cameFrom = {};
  var gScore = {};
  var fScore = {};
  gScore[start.x + ',' + start.y] = 0;
  fScore[start.x + ',' + start.y] = heuristic(start, end);

  while (openSet.length > 0) {
    var current = getLowestFScore(openSet, fScore);
    if (current.x == end.x && current.y == end.y) {
      return reconstructPath(cameFrom, current);
    }
    openSet = removeFromArray(openSet, current);
    var neighbors = getNeighbors(current, obstacles);
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      var tentativeGScore = gScore[current.x + ',' + current.y] + 1;
      if (!gScore[neighbor.x + ',' + neighbor.y] || tentativeGScore < gScore[neighbor.x + ',' + neighbor.y]) {
        cameFrom[neighbor.x + ',' + neighbor.y] = current;
        gScore[neighbor.x + ',' + neighbor.y] = tentativeGScore;
        fScore[neighbor.x + ',' + neighbor.y] = tentativeGScore + heuristic(neighbor, end);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return [];
}

function getLowestFScore(nodes, fScore) {
  var lowestScore = Infinity;
  var lowestNode;
  for (var i = 0; i < nodes.length; i++) {
    var score = fScore[nodes[i].x + ',' + nodes[i].y];
    if (score < lowestScore) {
      lowestScore = score;
      lowestNode = nodes[i];
    }
  }
  return lowestNode;
}

function removeFromArray(array, element) {
  var index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
}

function getNeighbors(node, obstacles) {
  var result = [];
  var neighbors = [    { x: node.x - 1, y: node.y },    { x: node.x + 1, y: node.y },    { x: node.x, y: node.y - 1 },    { x: node.x, y: node.y + 1 },  ];
  for (var i = 0; i < neighbors.length; i++) {
    var neighbor = neighbors[i];
    if (neighbor.x >= 0 && neighbor.x < width / blockSize &&
        neighbor.y >= 0 && neighbor.y < height / blockSize &&
        !obstacles.some(obstacle => obstacle.x === neighbor.x && obstacle.y === neighbor.y) &&
        !snake.some(part => part.x === neighbor.x && part.y === neighbor.y)) {
      result.push(neighbor);
    }
  }
  return result;
}

function checkCollision(node, obstacles) {
  for (var i = 0; i < obstacles.length; i++) {
    if (node.x == obstacles[i].x && node.y == obstacles[i].y) {
      return true;
    }
  }
  return false;
}

function reconstructPath(cameFrom, current) {
  var path = [current];
  while (cameFrom[current.x + ',' + current.y]) {
    current = cameFrom[current.x + ',' + current.y];
    path.unshift(current);
  }
  return path;
}

function heuristic(node1, node2) {
  return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
}


init();
