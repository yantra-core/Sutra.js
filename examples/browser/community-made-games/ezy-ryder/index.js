let cssDot;
let game;
let inputSutra;
let animationFrameId;
const moveSpeed = 210;
const minBubbleCount = 30;
const maxBubbleCount = 35;
let playerCollectedPoints = 0;
let totalPoints;
const BaseMusic = new Audio();
BaseMusic.src = 'static/video-game-music-loop-27629.mp3';
BaseMusic.loop = true;
const gameOverAudio = new Audio();
gameOverAudio.src = 'static/080205_life-lost-game-over-89697.mp3';
const coinAudio = new Audio();
coinAudio.src = 'static/ding-126626.mp3';
const ScoreBoard = document.getElementById('score');
const bubbleCount = getRandomInt(minBubbleCount, maxBubbleCount);
let bubbles;

function createCssDot(entityId) {
  const dot = document.createElement('div');
  dot.setAttribute('class','dot')
  dot.id = `cssDot${entityId}`;
  dot.style.position = 'absolute';
  dot.style.width = '20px';
  dot.style.height = '20px';
  dot.style.backgroundColor = 'blue';
  dot.style.borderRadius = '50%';
  dot.style.left = `${window.innerWidth / 2}px`;
  dot.style.top = `${window.innerHeight / 2}px`;
  document.body.appendChild(dot);
  return dot;
}

function createGameMock(cssDot) {
  const dotRadius = 10;

  return {
    applyForce: function (entityId, force) {
      let currentX = parseFloat(cssDot.style.left) || 0;
      let currentY = parseFloat(cssDot.style.top) || 0;

      let newX = currentX + force.x;
      let newY = currentY + force.y;

      newX = Math.max(dotRadius, Math.min(window.innerWidth - dotRadius, newX));
      newY = Math.max(dotRadius, Math.min(window.innerHeight - dotRadius, newY));

      cssDot.style.left = `${newX}px`;
      cssDot.style.top = `${newY}px`;
    },
  };
}

function initializeSutra(game, inputMap, moveSpeed) {
  let inputSutra = SUTRA.createSutra();
  inputMap.forEach((key) => {
    inputSutra.addCondition(`press${key}`, (data, gameState) => {
      return gameState.input && gameState.input.controls[key];
    });
  });

  inputSutra.if('pressW').then('moveForward');
  inputSutra.if('pressA').then('moveLeft');
  inputSutra.if('pressS').then('moveBackward');
  inputSutra.if('pressD').then('moveRight');

  inputSutra.on('moveForward', (entity) => {
    let dx = 0;
    let dy = moveSpeed;
    const forceFactor = 0.08;
    const force = { x: dx * forceFactor, y: -dy * forceFactor };
    game.applyForce(entity.id, force);
  });

  inputSutra.on('moveLeft', (entity) => {
    let dx = moveSpeed;
    let dy = 0;
    const forceFactor = 0.08;
    const force = { x: -dx * forceFactor, y: dy * forceFactor };
    game.applyForce(entity.id, force);
  });

  inputSutra.on('moveRight', (entity) => {
    let dx = moveSpeed;
    let dy = 0;
    const forceFactor = 0.08;
    const force = { x: dx * forceFactor, y: dy * forceFactor };
    game.applyForce(entity.id, force);
  });

  inputSutra.on('moveBackward', (entity) => {
    let dx = 0;
    let dy = moveSpeed;
    const forceFactor = 0.08;
    const force = { x: dx * forceFactor, y: dy * forceFactor };
    game.applyForce(entity.id, force);
  });

  return inputSutra;
}

function handleKeyDown(event, inputSutra, inputMap) {
  if (inputMap.includes(event.key.toUpperCase())) {
    let gameState = { input: { controls: { [event.key.toUpperCase()]: true } } };
    inputSutra.tick({ id: 'cssDot' }, gameState);
  }
}

function handleKeyUp(event, inputSutra, inputMap) {
  if (inputMap.includes(event.key.toUpperCase())) {
    let gameState = { input: { controls: { [event.key.toUpperCase()]: false } } };
    inputSutra.tick({ id: 'cssDot' }, gameState);
  }
}

function createBubbles(count) {
  const bubbles = [];

  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    bubble.setAttribute('class', 'bubble');
    bubble.style.width = '20px';
    bubble.style.height = '20px';
    bubble.style.backgroundColor = 'black';
    bubble.style.borderRadius = '50%';
    bubble.style.position = 'absolute';

    bubble.style.left = `${Math.random() * (window.innerWidth - 20)}px`;
    bubble.style.top = `${Math.random() * (window.innerHeight - 20)}px`;

    const direction = {
      x: Math.random() < 0.5 ? -1 : 1,
      y: Math.random() < 0.5 ? -1 : 1
    };

    bubbles.push({ element: bubble, direction, speed: getRandomSpeed() });

    document.body.appendChild(bubble);
  }

  for (let i = 0; i < Math.floor(count / 1.5); i++) {
    const pointBubble = createPointBubble();
    bubbles.push({ element: pointBubble, direction: getRandomDirection(), speed: getRandomSpeed() });
  }

  return bubbles;
}


function getRandomSpeed() {
  return Math.random() * (2 - 0.5) + 0.5;
}
function getRandomDirection() {
  return Math.random() < 0.5 ? -1 : 1;
}

function updateBubbles(bubbles) {
  const speed = 2;

  bubbles.forEach((bubble) => {
    let left = parseFloat(bubble.element.style.left) || Math.random() * (window.innerWidth - 20);
    let top = parseFloat(bubble.element.style.top) || Math.random() * (window.innerHeight - 20);

    left += bubble.direction.x * speed;
    top += bubble.direction.y * speed;

    if (left < 0 || left > window.innerWidth - 20) {
      bubble.direction.x *= -1;
    }

    if (top < 0 || top > window.innerHeight - 20) {
      bubble.direction.y *= -1;  
    }

    bubble.element.style.left = `${left}px`;
    bubble.element.style.top = `${top}px`;
  });
}

let animBubbles = [];

let collisionCount = 0;

function detectCollision(cssDot, bubbles) {
  const dotRect = cssDot.getBoundingClientRect();

  for (let i = 0; i < bubbles.length; i++) {
    const bubble = bubbles[i];
    const bubbleRect = bubble.element.getBoundingClientRect();

    if (
      dotRect.left < bubbleRect.right &&
      dotRect.right > bubbleRect.left &&
      dotRect.top < bubbleRect.bottom &&
      dotRect.bottom > bubbleRect.top
    ) {
      if (bubble.element.classList.contains('point-bubble')) {
        console.log('Collision detected with point bubble!');
        score += 10; 
        playerCollectedPoints++;
        coinAudio.play();
        ScoreBoard.innerHTML = score;

        bubble.element.remove();
        bubbles.splice(i, 1);
      } else {
        console.log('Collision detected with bubble:', bubble.element.id);
        const bubblePosition = {
          left: parseFloat(bubble.element.style.left),
          top: parseFloat(bubble.element.style.top)
        };

        bubble.element.remove();
        bubbles.splice(i, 1);

        collisionCount++;

        for (let j = 0; j < 15; j++) {
          const animBubble = createAnimBubble(bubblePosition.left, bubblePosition.top);
          animBubbles.push({ element: animBubble, direction: getRandomDirection(), speed: getRandomSpeed() });
        }
        warning();

        if (collisionCount > 7) {
          gameOver();
        }
      }

      return bubble;
    }
  }

  return null;
}

function createAnimBubble(left, top) {
  const animBubble = document.createElement('div');
  animBubble.setAttribute('class', 'animBubble');
  animBubble.style.width = '0.5rem';
  animBubble.style.height = '0.5rem';
  animBubble.style.backgroundColor = 'red'; // Customize the color as needed
  animBubble.style.borderRadius = '5rem';
  animBubble.style.position = 'absolute';
  animBubble.style.left = `${left}px`;
  animBubble.style.top = `${top}px`;

  document.body.appendChild(animBubble);

  return animBubble;
}

function updateAnimBubbles() {
  const speed = 2;

  animBubbles.forEach((animBubble) => {
    let left = parseFloat(animBubble.element.style.left) || 0;
    let top = parseFloat(animBubble.element.style.top) || 0;

    left += animBubble.direction.x * speed;
    top += animBubble.direction.y * speed;

    animBubble.element.style.left = `${left}px`;
    animBubble.element.style.top = `${top}px`;
  });

  animBubbles = animBubbles.filter((animBubble) => {
    const left = parseFloat(animBubble.element.style.left) || 0;
    const top = parseFloat(animBubble.element.style.top) || 0;
    return left >= 0 && left <= window.innerWidth && top >= 0 && top <= window.innerHeight;
  });
}

function update() {
  updateBubbles(bubbles);
  updateAnimBubbles();
  const collidedBubblePosition = detectCollision(cssDot, bubbles);

  if (collidedBubblePosition) {
    console.log('Collided bubble position:', collidedBubblePosition);
  }

  requestAnimationFrame(update);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createPointBubble() {
  const pointBubble = document.createElement('div');
  pointBubble.setAttribute('class', 'point-bubble');
  pointBubble.style.width = '20px';
  pointBubble.style.height = '20px';
  pointBubble.style.backgroundColor = 'gold'; 
  pointBubble.style.borderRadius = '50%';
  pointBubble.style.position = 'absolute';

  pointBubble.style.left = `${Math.random() * (window.innerWidth - 20)}px`;
  pointBubble.style.top = `${Math.random() * (window.innerHeight - 20)}px`;

  document.body.appendChild(pointBubble);

  return pointBubble;
}

function warning(){
  document.body.classList.add('warn');
  setTimeout(()=>{
    document.body.classList.remove('warn');
  },200)
}
const Alert = document.getElementById('customAlert');
function gameOver() {
  BaseMusic.pause();
  gameOverAudio.play();
  Alert.style.display = 'block';
  document.querySelector('.dot').style.display = 'none';
  let animB = document.querySelectorAll('.animBubble');
  animB.forEach(ele=>{
    ele.style.display = 'none';
  })
  bubbles.forEach((bubble) => {
    bubble.element.remove();
  });

  bubbles.length = 0;

}

function newAlert(){
  location.reload();
}

function startGame() {
  const forceFactor = 0.05;
  const inputMap = ['W', 'A', 'S', 'D'];

  cssDot = createCssDot(1); 
  game = createGameMock(cssDot); 
  inputSutra = initializeSutra(game, inputMap, moveSpeed); 

  document.addEventListener('keydown', (event) => handleKeyDown(event, inputSutra, inputMap));
  document.addEventListener('keyup', (event) => handleKeyUp(event, inputSutra, inputMap));
  totalPoints = Math.floor(minBubbleCount / 5);
  bubbles = createBubbles(bubbleCount);
  BaseMusic.play();
  cancelAnimationFrame(animationFrameId);

  collisionCount = 0;
  score = 0;
  ScoreBoard.innerHTML = score;

  bubbles.forEach(bubble => bubble.element.remove());
  animBubbles.forEach(animBubble => animBubble.element.remove());

  const newBubbleCount = getRandomInt(minBubbleCount, maxBubbleCount);
  bubbles = createBubbles(newBubbleCount);

  cssDot.style.left = `${window.innerWidth / 2}px`;
  cssDot.style.top = `${window.innerHeight / 2}px`;

  animationFrameId = requestAnimationFrame(update);

}
