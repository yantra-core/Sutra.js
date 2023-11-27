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

  // Additional tests for different scenarios can be added here...
});
