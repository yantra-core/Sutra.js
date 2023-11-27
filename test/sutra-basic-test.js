import tap from 'tape';
import Sutra from '../lib/sutra.js';

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

    sutra.on('action', (action) => {
      if (action === 'testAction') {
        actionExecuted = true;
      }
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

    sutra.addAction({
      if: 'isTrue',
      then: [
        {
          if: 'isAlsoTrue',
          then: [{ action: 'nestedAction' }]
        }
      ]
    });

    sutra.on('action', (action) => {
      if (action === 'nestedAction') {
        nestedActionExecuted = true;
      }
    });

    sutra.traverseNode(sutra.tree[0], {});
    t.equal(nestedActionExecuted, true, 'nestedAction should be executed when both conditions are met');
  });

  parent.test('Sutra DSL Conditions', (t) => {
    const sutra = new Sutra();

    // Test lessThan condition
    sutra.addCondition('isHealthLow', {
      operator: 'lessThan',
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
      operator: 'lessThan',
      property: 'health',
      value: 50
    });

    t.equal(sutra.evaluateCondition('isHealthLow', { health: 40 }), true, 'isHealthLow should return true for health < 50');
    t.equal(sutra.evaluateCondition('isHealthLow', { health: 60 }), false, 'isHealthLow should return false for health >= 50');

    t.end();
  });

  tap.test('Sutra DSL Operator Tests', (t) => {
    const sutra = new Sutra();
    
    // Test each DSL operator
    sutra.addCondition('lessThanTest', { operator: 'lessThan', property: 'value', value: 10 });
    sutra.addCondition('greaterThanTest', { operator: 'greaterThan', property: 'value', value: 10 });
    sutra.addCondition('equalsTest', { operator: 'equals', property: 'value', value: 10 });
    sutra.addCondition('notEqualsTest', { operator: 'notEquals', property: 'value', value: 10 });
    sutra.addCondition('lessThanOrEqualTest', { operator: 'lessThanOrEqual', property: 'value', value: 10 });
    sutra.addCondition('greaterThanOrEqualTest', { operator: 'greaterThanOrEqual', property: 'value', value: 10 });
  
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
