import tap from 'tape';
import Sutra from '../lib/Sutra.js';

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

    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', testData, testGameState), true, 'Condition with valid data and gameState should return true');
    testGameState.isGameRunning = false;
    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', testData, testGameState), false, 'Condition with invalid gameState should return false');

    // Test composite conditions with gameState
    sutra.addCondition('compositeCondition', {
      op: 'and',
      conditions: ['isDataAndGameStateValid', 'someOtherCondition']
    });

    // Test conditions without gameState
    sutra.addCondition('isDataValid', data => data.isValid);
    t.equal(sutra.evaluateCondition('isDataValid', testData), true, 'Condition without gameState should still function correctly');

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

    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', testData, testGameState), true, 'isDataAndGameStateValid should return true when both data and gameState are valid');

    // Change gameState and test again
    testGameState.isGameRunning = false;
    t.equal(sutra.evaluateCondition('isDataAndGameStateValid', testData, testGameState), false, 'isDataAndGameStateValid should return false when gameState is invalid');

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
