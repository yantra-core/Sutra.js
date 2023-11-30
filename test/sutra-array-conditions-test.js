import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Sutra - Array of Conditions Tests', async (parent) => {

  parent.test('Sequential Execution - All Conditions Met', async (t) => {
    let sutra = new Sutra();
    let actionExecuted = false;

    sutra.addCondition('sequentialConditions', [
      (entity) => entity.type === 'BOSS',
      { op: 'lessThan', property: 'health', value: 50 }
    ]);

    sutra.addAction({ if: 'sequentialConditions', then: [{ action: 'testAction' }] });
    sutra.on('testAction', () => { actionExecuted = true; });

    let entity = { id: 1, type: 'BOSS', health: 30 };
    sutra.tick(entity);
    t.equal(actionExecuted, true, 'Action should be executed when all conditions are met');
    t.end();
  });

  parent.test('Sequential Execution - One Condition Not Met', async (t) => {
    let sutra = new Sutra();
    let actionExecuted = false;

    sutra.addCondition('sequentialConditions', [
      (entity) => entity.type === 'BOSS',
      { op: 'greaterThan', property: 'health', value: 50 }
    ]);

    sutra.addAction({ if: 'sequentialConditions', then: [{ action: 'testAction' }] });
    sutra.on('testAction', () => { actionExecuted = true; });

    let entity = { id: 2, type: 'BOSS', health: 30 };
    sutra.tick(entity);
    t.equal(actionExecuted, false, 'Action should not be executed when one condition is not met');
    t.end();
  });

  parent.test('Spawner Action with Composite Conditions', async (t) => {
    let sutra = new Sutra();
    let blockCreated = false;
  
    sutra.addCondition('blockCountLessThan5', { op: 'lessThan', gamePropertyPath: 'ents.BLOCK.length', value: 5 });
    sutra.addCondition('spawnerHealthAbove50', { op: 'greaterThan', property: 'health', value: 50 });
  
    sutra.addAction({
      if: ['blockCountLessThan5', 'spawnerHealthAbove50'],
      then: [{ action: 'createBlock' }]
    });
  
    sutra.on('createBlock', () => { blockCreated = true; });
  
    const gameState = { ents: { BLOCK: [] } };
    const spawner = { type: 'SPAWNER', health: 60 };
  
    sutra.tick(spawner, gameState);
    t.equal(blockCreated, true, 'Block should be created when both conditions are met');
  
    blockCreated = false;
    spawner.health = 40; // Health below 50
    sutra.tick(spawner, gameState);
    t.equal(blockCreated, false, 'Block should not be created when one condition is not met');
    t.end();
  });

  parent.test('Spawner Action with Nested Composite Conditions', async (t) => {
    let sutra = new Sutra();
    let blockCreated = false;
  
    sutra.addCondition('isSpawner', (entity) => entity.type === 'SPAWNER');
  
    let condition = sutra.getCondition('isSpawner');
    t.equal(typeof condition, "function", 'Condition should exist as function')

    sutra.addCondition('blockCountLessThan5', { op: 'lessThan', gamePropertyPath: 'ents.BLOCK.length', value: 5 });
    sutra.addCondition('spawnerHealthAbove50', { op: 'greaterThan', property: 'health', value: 50 });
  
    sutra.addAction({
      if: 'isSpawner',
      then: [{
        if: ['blockCountLessThan5', 'spawnerHealthAbove50'],
        then: [{ action: 'createBlock' }]
      }]
    });
  
    sutra.on('createBlock', () => { blockCreated = true; });
  
    const gameState = { ents: { BLOCK: [] } };
    const spawner = { type: 'SPAWNER', health: 60 };
  
    sutra.tick(spawner, gameState);
    t.equal(blockCreated, true, 'Block should be created when both conditions are met');
  
    blockCreated = false;
    spawner.health = 40; // Health below 50
    sutra.tick(spawner, gameState);
    t.equal(blockCreated, false, 'Block should not be created when one condition is not met');
    t.end();
  });
  

});

tap.test('Sutra - Array of Conditions Tests', async (parent) => {

  // Test for a block count between 5 and 10
  parent.test('Block Count Between 5 and 10', async (t) => {
    let sutra = new Sutra();
    let blockCountCorrect = false;

    sutra.addCondition('blockCountBetween5and10', [
      { op: 'greaterThan', gamePropertyPath: 'ents.BLOCK.length', value: 5 },
      { op: 'lessThan', gamePropertyPath: 'ents.BLOCK.length', value: 10 }
    ]);

    sutra.addAction({
      if: 'blockCountBetween5and10',
      then: [{ action: 'validateBlockCount' }]
    });

    let condition = sutra.getCondition('blockCountBetween5and10');
    t.equal(Array.isArray(condition), true, 'Condition should be an array');
    t.equal(condition[0].op, 'greaterThan', 'First condition should be greaterThan');
    t.equal(condition[1].op, 'lessThan', 'First condition should be greaterThan');

    sutra.on('validateBlockCount', () => { blockCountCorrect = true; });

    const gameState = {
      ents: { BLOCK: new Array(7).fill({}) } // 7 blocks, should satisfy the condition
    };

    sutra.tick({}, gameState);
    t.equal(blockCountCorrect, true, 'Should validate when block count is between 5 and 10');

    gameState.ents.BLOCK = new Array(4).fill({}); // 4 blocks, should not satisfy the condition
    blockCountCorrect = false; // reset the flag for the next test
    sutra.tick({}, gameState);
    t.equal(blockCountCorrect, false, 'Should not validate when block count is less than 5');

    gameState.ents.BLOCK = new Array(11).fill({}); // 11 blocks, should not satisfy the condition
    blockCountCorrect = false; // reset the flag for the next test
    sutra.tick({}, gameState);
    t.equal(blockCountCorrect, false, 'Should not validate when block count is greater than 10');

    t.end();
  });
});