import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Sutra Library Tests with GameState Context', async (parent) => {
  // Test for condition evaluation using both data and gameState
  parent.test('should evaluate conditions with data and gameState', async (t) => {
    const sutra = new Sutra();

    // Custom function condition using both data and gameState
    sutra.addCondition('isDataAndGameStateValid', (data, gameState) => {
      return data.isValid && gameState.isGameRunning;
    });

    // DSL condition (if applicable) using gameState
    // sutra.addCondition('isGameStateActive', { /* DSL condition that utilizes gameState */ });

    // Test data and game state
    const testData = { isValid: true };
    const testGameState = { isGameRunning: true };

    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', null, testData, testGameState), true, 'Condition with valid data and gameState should return true');
    testGameState.isGameRunning = false;
    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', null, testData, testGameState), false, 'Condition with invalid gameState should return false');

    // Test composite conditions with gameState
    sutra.addCondition('compositeCondition', {
      op: 'and',
      conditions: ['isDataAndGameStateValid', 'someOtherCondition']
    });

    // Test conditions without gameState
    sutra.addCondition('isDataValid', data => data.isValid);
    t.equal(sutra.evaluateCondition('isDataValid', null, testData), true, 'Condition without gameState should still function correctly');

    // Test with undefined or null gameState
    /*
    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', testData, undefined), false, 'Condition should handle undefined gameState gracefully');
    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', testData, null), false, 'Condition should handle null gameState gracefully');
    */

    t.end();
  });

});

tap.test('Sutra Integration Tests with GameState Context', async (parent) => {
  // Test for condition evaluation using both data and gameState
  parent.test('should evaluate conditions with data and gameState', async (t) => {
    const sutra = new Sutra();

    // Adding a custom function condition that uses both data and gameState
    sutra.addCondition('isDataAndGameStateValid', (data, gameState) => {
      return data.isValid && gameState.isGameRunning;
    });

    // Test data and game state
    const testData = { isValid: true };
    const testGameState = { isGameRunning: true };

    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', null, testData, testGameState), true, 'isDataAndGameStateValid should return true when both data and gameState are valid');

    // Change gameState and test again
    testGameState.isGameRunning = false;
    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', null, testData, testGameState), false, 'isDataAndGameStateValid should return false when gameState is invalid');

    t.end();
  });

  // Test for Sutra.tick() with gameState
  parent.test('Sutra.tick() should handle gameState', async (t) => {
    const sutra = new Sutra();

    // Adding a condition and action
    sutra.addCondition('isGameActive', (data, gameState) => gameState.isActive);
    sutra.addAction({
      if: 'isGameActive',
      then: [{ action: 'logAction' }]
    });

    sutra.on('logAction', (data, node) => {
      t.pass('Action triggered when gameState is active');
    });

    const gameActiveState = { isActive: true };
    sutra.tick({}, gameActiveState); // Simulate tick with active game state

    const gameInactiveState = { isActive: false };
    sutra.tick({}, gameInactiveState); // Simulate tick with inactive game state

    t.end();
  });
});

tap.test('Sutra Deeply Nested GameState Tests', async (parent) => {
  parent.test('should evaluate conditions with deeply nested gameState values', async (t) => {
    const sutra = new Sutra();

    // Adding a condition to check a deeply nested value in gameState
    sutra.addCondition('nestedValueCheck', {
      op: 'lessThan',
      gamePropertyPath: 'level.stats.blockCount',
      value: 5
    });


    // Simulating a gameState with deeply nested properties
    const gameState = {
      level: {
        stats: {
          blockCount: 3
        }
      }
    };

    t.equal(sutra.evaluateCondition('nestedValueCheck', null, {}, gameState), true, 'nestedValueCheck should return true for blockCount < 5');

    // Modifying the gameState to change the block count
    gameState.level.stats.blockCount = 6;
    t.equal(sutra.evaluateCondition('nestedValueCheck', null, {}, gameState), false, 'nestedValueCheck should return false for blockCount >= 5');

    // Testing with different types of nested values
    sutra.addCondition('nestedStringCheck', {
      op: 'equals',
      gamePropertyPath: 'level.description',
      value: 'Level 1'
    });

    gameState.level.description = 'Level 1';
    t.equal(sutra.evaluateCondition('nestedStringCheck', null, {}, gameState), true, 'nestedStringCheck should return true for matching string');

    gameState.level.description = 'Level 2';
    t.equal(sutra.evaluateCondition('nestedStringCheck', null, {}, gameState), false, 'nestedStringCheck should return false for non-matching string');

    // Testing with an array
    sutra.addCondition('nestedArrayLengthCheck', {
      op: 'greaterThanOrEqual',
      gamePropertyPath: 'level.enemies.length',
      value: 2
    });

    gameState.level.enemies = ['enemy1', 'enemy2'];
    t.equal(sutra.evaluateCondition('nestedArrayLengthCheck', null, {}, gameState), true, 'nestedArrayLengthCheck should return true for array length >= 2');

    gameState.level.enemies = ['enemy1'];
    t.equal(sutra.evaluateCondition('nestedArrayLengthCheck', null, {}, gameState), false, 'nestedArrayLengthCheck should return false for array length < 2');


    // Testing with an undefined array
    sutra.addCondition('nestedUndefinedArrayLengthCheck', {
      op: 'equals',
      gamePropertyPath: 'level.items.length',
      value: 0
    });

    // Simulating gameState where the array is undefined
    delete gameState.level.enemies; // or gameState.level.enemies = undefined;
    t.equal(sutra.evaluateCondition('nestedUndefinedArrayLengthCheck', null, {}, gameState), true, 'nestedUndefinedArrayLengthCheck should return true for undefined array length equaling 0');

    t.end();
  });
});

tap.test('Sutra GameState Array Item Test', async (parent) => {
  parent.test('should evaluate conditions based on specific items in an array within gameState', async (t) => {
    const sutra = new Sutra();

    // Adding a condition to check a specific item in an array within gameState
    sutra.addCondition('arrayItemCheck', {
      op: 'equals',
      gamePropertyPath: 'level.powerUps[1]',
      value: 'speedBoost'
    });

    // Simulating a gameState with an array containing specific items
    const gameState = {
      level: {
        powerUps: ['shield', 'speedBoost', 'extraLife']
      }
    };

    t.equal(sutra.evaluateCondition('arrayItemCheck', null, {}, gameState), true, 'arrayItemCheck should return true for specific array item matching');

    // Changing the array item to a different value
    gameState.level.powerUps[1] = 'invisibility';
    t.equal(sutra.evaluateCondition('arrayItemCheck', null, {}, gameState), false, 'arrayItemCheck should return false for non-matching array item');

    t.end();
  });
});
