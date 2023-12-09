import tap from 'tape';
import Sutra from '../lib/sutra.js';


tap.test('Sutra .use() method and subSutra functionality - single not condition - true', async (t) => {

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
  
  level.use(round);
  level.use(npcLogic, 'npcLogic'); // optionally specify a name for the subtree to reference it later
  //level.use(npcLogic, 'npcLogic');
  
  level.addAction({
    if: 'roundRunning',
    subtree: 'npcLogic'
  });
  
  let actionTriggered = false;
  npcLogic.on('spawnEnemy', () => {
    actionTriggered = true;
  });

  level.tick({
    type: 'UnitSpawner'
    // ... other data ...
  }, { roundStarted: false, roundEnded: false });

  t.equal(actionTriggered, true, 'spawnEnemy action should be triggered when round is not running');
  t.end();

});


tap.test('Sutra .use() method and subSutra functionality - single not condition - false', async (t) => {

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
  //level.use(npcLogic, 'npcLogic');
  
  level.addAction({
    if: 'roundRunning',
    subtree: 'npcLogic'
  });
  
  let actionTriggered = false;
  npcLogic.on('spawnEnemy', () => {
    actionTriggered = true;
  });

  level.tick({
    type: 'UnitSpawner'
    // ... other data ...
  }, { roundStarted: false, roundEnded: true });

  t.equal(actionTriggered, false, 'spawnEnemy action should be triggered when round is not running');
  t.end();

});

/*
tap.test('Sutra nested subtrees integration test', (t) => {
  let mainSutra = new Sutra();
  let subSutra1 = new Sutra();
  let subSutra2 = new Sutra();

  // Define conditions in subSutra1
  subSutra1.addCondition('sub1Condition', (entity, gameState) => gameState.sub1Flag);
  
  // Define conditions in subSutra2
  subSutra2.addCondition('sub2Condition', (entity, gameState) => gameState.sub2Flag);

  // Define action in subSutra2
  subSutra2.addAction({
    if: 'sub2Condition',
    then: [{ action: 'sub2Action' }]
  });

  // Use subSutra2 in subSutra1
  subSutra1.use(subSutra2, 'subSutra2');

  // Use subSutra1 in mainSutra
  mainSutra.use(subSutra1, 'subSutra1');

  // Set up gameState and entity
  let gameState = { sub1Flag: true, sub2Flag: false };
  let mockEntity = {};
  let actionTriggered = false;

  mainSutra.on('sub2Action', () => {
    actionTriggered = true;
  });

  // Trigger the main Sutra (expect sub2Action not to be triggered)
  mainSutra.tick(mockEntity, gameState);
  t.equal(actionTriggered, false, 'sub2Action should not be triggered when sub2Condition is false');

  // Change gameState to satisfy sub2Condition
  gameState.sub2Flag = true;

  // Reset actionTriggered flag
  actionTriggered = false;

  // Trigger the main Sutra again (expect sub2Action to be triggered)
  mainSutra.tick(mockEntity, gameState);
  t.equal(actionTriggered, true, 'sub2Action should be triggered when sub2Condition is true');

  t.end();
});

*/