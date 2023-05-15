
var blockSize = 15;
var width = Math.floor(window.innerWidth / blockSize) * blockSize;
var height = Math.floor(window.innerHeight / blockSize) * blockSize;
var snake = [];
var food = {};
var score = 0;
var panicScore = 0;
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
  for (var i = 70; i >= 5; i--) {
    snake.push({x: i, y: 4});
  }
  food = createFood();
  var head = {x: snake[0].x, y: snake[0].y};

  path = PATHFINDING(head, food, snake);

  gameLoop = setInterval(function() {

    draw();
    move();
  }, 5);
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
  if (head.x == food.x && head.y == food.y) {
    score++;
    food = createFood();
    //path = PATHFINDING(head, food, snake);
    path = null;
  } else {
    snake.pop();
  }

  
  if (path && path.length > 0) {
    nextStep = path.shift();
    var dx = nextStep.x - head.x;
    var dy = nextStep.y - head.y;
    head = {x: head.x + dx, y: head.y + dy};
  } else{
    trueN = lastStep(head, food);
    if (trueN != null){
      head.x += trueN.x;
      head.y += trueN.y;
    } else {
      nx = panic(head, snake);
      if (nx != null) {
        head = {x: nx.x, y: nx.y};
        panicScore++;
        if (panicScore > 10){
          path = PATHFINDING(head, food, snake);
          panicScore = 0;
          nextStep = path.shift();
          var dx = nextStep.x - head.x;
          var dy = nextStep.y - head.y;
          head = {x: head.x + dx, y: head.y + dy};
        }
      } else {
        ded();
      }
      
    }
  }

  snake.unshift(head);
  if (head.x < 0 || head.x >= width / blockSize || head.y < 0 || head.y >= height / blockSize || checkCollision(head,snake)) {
    ded();
  } 
}

function lastStep(node, food) {
  var neighbors = [
    { x: node.x - 1, y: node.y },
    { x: node.x + 1, y: node.y },
    { x: node.x, y: node.y - 1 },
    { x: node.x, y: node.y + 1 },
  ];  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i];
    if (neighbor.x === food.x && neighbor.y === food.y) {
      return neighbor;
    }
  }
  return null;
}

function ded(){
  clearInterval(gameLoop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  init();
}

function createFood() {
  var food;
  do {
    food = {x: Math.floor((Math.random() * width)/blockSize), y:  Math.floor((Math.random() * height) / blockSize)};
  } while (checkCollision(food, snake));
  return food;
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
      var adjacentObstacles = getAdjacentObstacles(neighbor, obstacles);
      var tentativeGScore = gScore[current.x + ',' + current.y] + 1 + adjacentObstacles;
      if (!gScore[neighbor.x + ',' + neighbor.y] || tentativeGScore < gScore[neighbor.x + ',' + neighbor.y]) {
        cameFrom[neighbor.x + ',' + neighbor.y] = current;
        gScore[neighbor.x + ',' + neighbor.y] = tentativeGScore;
        fScore[neighbor.x + ',' + neighbor.y] = adjacentObstacles + tentativeGScore + heuristic(neighbor, end);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
    neighbors.sort((a, b) => {
      var aAdjacentObstacles = getAdjacentObstacles(a, obstacles);
      var bAdjacentObstacles = getAdjacentObstacles(b, obstacles);
      var aTentativeGScore = gScore[current.x + ',' + current.y] + 1 + aAdjacentObstacles;
      var bTentativeGScore = gScore[current.x + ',' + current.y] + 1 + bAdjacentObstacles;
      return aTentativeGScore - bTentativeGScore;
    });
    //
  }
  return true;
}

function panic(head, snake) {
  var neighbors = [    { x: head.x - 1, y: head.y },    { x: head.x + 1, y: head.y },    { x: head.x, y: head.y - 1 },    { x: head.x, y: head.y + 1 },  ];
  var availableNeighbors = [];
  for (var i = 0; i < neighbors.length; i++) {
    var neighbor = neighbors[i];
    if (neighbor.x >= 0 && neighbor.x < width / blockSize && neighbor.y >= 0 && neighbor.y < height / blockSize && checkCollision(neighbor, snake) == false) {
      availableNeighbors.push(neighbor);
    }
  }
  if (availableNeighbors.length > 0) {
    var randIndex = Math.floor(Math.random() * availableNeighbors.length);
    return availableNeighbors[randIndex];
  } else {
    return null;
  }
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

function getAdjacentObstacles(node, obstacles) {
  var count = 0;
  var neighbors = [
  { x: node.x - 1, y: node.y },
  { x: node.x + 1, y: node.y },
  { x: node.x, y: node.y - 1 },
  { x: node.x, y: node.y + 1 },
  ];
  for (var i = 0; i < neighbors.length; i++) {
    var neighbor = neighbors[i];
    if (!obstacles.some(obstacle => obstacle.x === neighbor.x && obstacle.y === neighbor.y)) {
      count++;
    }
  }
  if (count < 2){
    return 0;
  }
  return count*count;
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
  if (!obstacles) {
    return false;
  }
  for (var i = 2; i < obstacles.length; i++) {
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
