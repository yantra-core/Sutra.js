import tap from 'tape';
import Sutra from '../lib/sutra.js';


tap.test('Sutra .use() method and subSutra functionality - single not condition - true', async (t) => {

  let round = new Sutra();

  // Define round-related conditions
  round.addCondition('roundStarted', (entity, gameState) => gameState.roundStarted === true);
  round.addCondition('roundEnded', (entity, gameState) => gameState.roundEnded === true);
  round.addCondition('roundRunning', (entity, gameState) =>  gameState.roundRunning === true );
  
  let npcLogic = new Sutra();
  npcLogic.addCondition('isSpawner', (entity) => entity.type === 'UnitSpawner');
  
  npcLogic
    .if('isSpawner')
    .then('spawnEnemy', {
      type: 'ENEMY',
      position: { x: 100, y: 50 },
      health: 100
    });
  
  npcLogic.on('spawnEnemy', (data, node, gameState) => {
    console.log('Spawning enemy:', data);
    // Logic to spawn an enemy in the game
    // For example, you might add the enemy to the gameState or call a method in your game engine
  });
  
  let level = new Sutra();
  
  level.use(round);
  level.use(npcLogic, 'npcLogic'); // optionally specify a name for the subtree to reference it later
  //level.use(npcLogic, 'npcLogic');
  
  level
    .if('roundRunning')
    .if('roundStarted')
    .then('npcLogic');

  /*
  level.addAction({
    if: 'roundRunning',
    subtree: 'npcLogic'
  });
  */
  
  let actionTriggered = false;
  npcLogic.on('spawnEnemy', () => {
    console.log('spawnEnemy action triggered')
    actionTriggered = true;
  });

  console.log(level.tree)
  level.tick({
    type: 'UnitSpawner'
    // ... other data ...
  }, { roundStarted: true, roundEnded: false, roundRunning: true });

  t.equal(actionTriggered, true, 'spawnEnemy action should be triggered when round is not running');
  t.end();

});



tap.test('Sutra .use() method and subSutra functionality - single not condition - false', async (t) => {

  let round = new Sutra();

  // Define round-related conditions
  round.addCondition('roundStarted', (entity, gameState) => gameState.roundStarted === true);
  round.addCondition('roundEnded', (entity, gameState) => gameState.roundEnded === true);
  round.addCondition('roundRunning', (entity, gameState) =>  gameState.roundRunning === true );
  
  let npcLogic = new Sutra();
  npcLogic.addCondition('isSpawner', (entity) => entity.type === 'UnitSpawner');
  
  npcLogic
    .if('isSpawner')
    .then('spawnEnemy', {
      type: 'ENEMY',
      position: { x: 100, y: 50 },
      health: 100
    });
  
  npcLogic.on('spawnEnemy', (data, node, gameState) => {
    console.log('Spawning enemy:', data);
    // Logic to spawn an enemy in the game
    // For example, you might add the enemy to the gameState or call a method in your game engine
  });
  
  let level = new Sutra();
  
  level.use(round);
  level.use(npcLogic, 'npcLogic'); // optionally specify a name for the subtree to reference it later
  //level.use(npcLogic, 'npcLogic');
  
  // doesnt work
  level
    .if('roundRunning')
    .if('roundStarted')
    .then('npcLogic');
  
  /*
  // works
  level.addAction({
    if: 'roundRunning',
    subtree: 'npcLogic'
  });
  */
  
  let actionTriggered = false;
  npcLogic.on('spawnEnemy', () => {
    console.log('spawnEnemy action triggered')
    actionTriggered = true;
  });

  console.log(level.toJSON())
  level.tick({
    type: 'UnitSpawner'
  }, { roundStarted: false, roundEnded: false, roundRunning: false });

  t.equal(actionTriggered, false, 'spawnEnemy action should be triggered when round is not running');
  t.end();

});

