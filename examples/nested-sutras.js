import Sutra from '../lib/Sutra.js';

let round = new Sutra();

// Define round-related conditions
round.addCondition('roundStarted', (entity, gameState) => gameState.roundStarted === true);
round.addCondition('roundEnded', (entity, gameState) => gameState.roundEnded === true);
round.addCondition('roundRunning', {
  op: 'not',
  conditions: ['roundEnded']
});

let npcLogic = new Sutra();
npcLogic.addCondition('isSpawner', (entity) => entity.type === 'UnitSpawner');
npcLogic.addAction({
  if: ['isSpawner'],
  then: [{
    action: 'spawnEnemy',
    data: {
      // Data relevant to spawning the enemy
      type: 'ENEMY',
      position: { x: 100, y: 50 },
      health: 100
    }
  }]
});

npcLogic.on('spawnEnemy', (data, node, gameState) => {
  console.log('Spawning enemy:', data);
  // Logic to spawn an enemy in the game
  // For example, you might add the enemy to the gameState or call a method in your game engine
});

let level = new Sutra();

level.use(round, 'roundLogic');
level.use(npcLogic, 'npcLogic');

level.addAction({
  if: 'roundRunning',
  subtree: 'npcLogic'
});

level.tick({
  type: 'UnitSpawner',
  position: { x: 100, y: 50 },
  health: 100

}, { roundStarted: false, roundEnded: false });

console.log("level.tree", level.tree)


console.log(level.toEnglish())