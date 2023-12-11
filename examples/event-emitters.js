import Sutra from '../lib/sutra.js';

let level = new Sutra();
let round = new Sutra();

// Define conditions and add them to 'round'
round.addCondition('roundStarted', (entity, gameState) => gameState.roundStarted);
round.addCondition('roundEnded', (entity, gameState) => gameState.roundEnded);
round.addCondition('roundRunning', (entity, gameState) => gameState.roundRunning);
round.addCondition('roundNotRunning', (entity, gameState) => {
  console.log('Evaluating roundNotRunning:', !gameState.roundRunning);
  return !gameState.roundRunning;
});

round.on('roundLost', (data, node, gameState) => {
  gameState.roundStarted = false;
  gameState.roundRunning = false;
  gameState.roundEnded = true;
});

round.on('startRound', (data, node, gameState) => {
  console.log('startRound event triggered');
  gameState.roundRunning = true;
});

round.if('roundNotRunning').then('startRound');

level.use(round, 'roundLogic');

let gameState = { roundStarted: false, roundRunning: false, roundEnded: false };

console.log("gameState", gameState)
// Trigger the tick method on the main sutra and check gameState changes
level.tick({}, gameState);
console.log("gameState", gameState)

//console.log(level.toJSON());
//console.log(level.toEnglish());