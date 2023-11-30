import tap from 'tape';
import Sutra from '../lib/Sutra.js';

tap.test('Sutra Library Tests', async (parent) => {
  // Test for condition evaluation
  parent.test('should correctly evaluate conditions', async (t) => {
    const sutra = new Sutra();
    sutra.addCondition('isTrue', () => true);
    t.equal(sutra.evaluateCondition('isTrue', {}), true, 'isTrue condition should return true');
  });

  // Test for action execution based on conditions
  parent.test('should correctly handle actions based on conditions', async (t) => {
    const sutra = new Sutra();
    let actionExecuted = false;

    sutra.on('testAction', (data) => {
      actionExecuted = true;
    });

    sutra.addCondition('isTrue', () => true);
    sutra.addAction({
      if: 'isTrue',
      then: [{ action: 'testAction' }]
    });

    sutra.traverseNode(sutra.tree[0], {});
    t.equal(actionExecuted, true, 'testAction should be executed when isTrue condition is met');
  });

  // Test for event emission
  parent.test('should emit events correctly', async (t) => {
    const sutra = new Sutra();
    let eventEmitted = false;

    sutra.on('customEvent', () => {
      eventEmitted = true;
    });

    sutra.emit('customEvent');
    t.equal(eventEmitted, true, 'customEvent should be emitted correctly');
  });

  // Test for complex nested conditions and actions
  parent.test('should handle nested conditions and actions', async (t) => {
    const sutra = new Sutra();
    let nestedActionExecuted = false;

    sutra.addCondition('isTrue', () => true);
    sutra.addCondition('isAlsoTrue', () => true);
    sutra.addCondition('isAlsoFalse', () => false);

    // Test when both conditions are true
    sutra.addAction({
      if: 'isTrue',
      then: [
        {
          if: 'isAlsoTrue',
          then: [{ action: 'nestedAction' }]
        }
      ]
    });

    sutra.on('nestedAction', () => {
      nestedActionExecuted = true;
    });

    sutra.traverseNode(sutra.tree[0], {});
    t.equal(nestedActionExecuted, true, 'nestedAction should be executed when both conditions are met');

    // Reset and test when the second condition is false
    nestedActionExecuted = false;
    sutra.tree = []; // Reset the behavior tree
    sutra.addAction({
      if: 'isTrue',
      then: [
        {
          if: 'isAlsoFalse',
          then: [{ action: 'nestedAction' }]
        }
      ]
    });

    sutra.traverseNode(sutra.tree[0], {});
    t.equal(nestedActionExecuted, false, 'nestedAction should not be executed when the second condition is false');
  });

  parent.test('Sutra DSL Conditions', (t) => {
    const sutra = new Sutra();

    // Test lessThan condition
    sutra.addCondition('isHealthLow', {
      op: 'lessThan',
      property: 'health',
      value: 50
    });

    // Test data
    const testData = { health: 40 };

    t.equal(sutra.evaluateCondition('isHealthLow', testData), true, 'isHealthLow should return true for health < 50');

    t.end();
  });


  // Test for DSL-based condition evaluation
  parent.test('should correctly evaluate DSL conditions', async (t) => {
    const sutra = new Sutra();

    // Adding a condition using the new DSL syntax
    sutra.addCondition('isHealthLow', {
      op: 'lessThan',
      property: 'health',
      value: 50
    });

    t.equal(sutra.evaluateCondition('isHealthLow', { health: 40 }), true, 'isHealthLow should return true for health < 50');
    t.equal(sutra.evaluateCondition('isHealthLow', { health: 60 }), false, 'isHealthLow should return false for health >= 50');

    t.end();
  });

  tap.test('Sutra DSL op Tests', (t) => {
    const sutra = new Sutra();

    // Test addCondition function shorthand
    sutra.addCondition('blockCountEquals0', (data, gameState) => gameState.ents.BLOCK.length === 0);
    sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');

    // Test addCondition function shorthand with invalid global state lookup
    sutra.addCondition('invalidCountEquals10', (data, gameState) => gameState.ents.INVALID.length === 10);

    // Perform tests for custom function shorthand
    t.equal(sutra.evaluateCondition('blockCountEquals0', {}, { ents: { BLOCK: [] } }), true, 'blockCountEquals0 should return true when BLOCK count is 0');
    t.equal(sutra.evaluateCondition('blockCountEquals0', {}, { ents: { BLOCK: [{}] } }), false, 'blockCountEquals0 should return false when BLOCK count is not 0');
    t.equal(sutra.evaluateCondition('invalidCountEquals10', {}, { ents: { BLOCK: [] } }), false, 'invalidCountEquals10 should return false when property lookup is invalid');

    // Test each DSL op
    sutra.addCondition('lessThanTest', { op: 'lessThan', property: 'value', value: 10 });
    sutra.addCondition('greaterThanTest', { op: 'greaterThan', property: 'value', value: 10 });
    sutra.addCondition('equalsTest', { op: 'equals', property: 'value', value: 10 });
    sutra.addCondition('notEqualsTest', { op: 'notEquals', property: 'value', value: 10 });
    sutra.addCondition('lessThanOrEqualTest', { op: 'lessThanOrEqual', property: 'value', value: 10 });
    sutra.addCondition('greaterThanOrEqualTest', { op: 'greaterThanOrEqual', property: 'value', value: 10 });

    // Perform tests
    t.equal(sutra.evaluateCondition('lessThanTest', { value: 5 }), true, 'lessThanTest should return true for value < 10');
    t.equal(sutra.evaluateCondition('greaterThanTest', { value: 15 }), true, 'greaterThanTest should return true for value > 10');
    t.equal(sutra.evaluateCondition('equalsTest', { value: 10 }), true, 'equalsTest should return true for value == 10');
    t.equal(sutra.evaluateCondition('notEqualsTest', { value: 15 }), true, 'notEqualsTest should return true for value != 10');
    t.equal(sutra.evaluateCondition('lessThanOrEqualTest', { value: 10 }), true, 'lessThanOrEqualTest should return true for value <= 10');
    t.equal(sutra.evaluateCondition('greaterThanOrEqualTest', { value: 10 }), true, 'greaterThanOrEqualTest should return true for value >= 10');

    t.end();
  });

});
