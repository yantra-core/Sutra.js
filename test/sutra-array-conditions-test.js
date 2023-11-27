import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Array of Conditions Test - Sequential Execution', async (t) => {
  let sutra = new Sutra();
  let actionExecuted = false;

  // Adding conditions as an array
  sutra.addCondition('arrayConditions', [
    (entity) => entity.type === 'BOSS', // First condition as a function
    {
      op: 'lessThan', // Second condition as an object
      property: 'health',
      value: 50
    }
  ]);

  sutra.addAction({
    if: 'arrayConditions',
    then: [{ action: 'testAction' }]
  });

  sutra.on('testAction', () => {
    actionExecuted = true;
  });

  // Entity that meets both conditions in the array
  let entity = { id: 1, type: 'BOSS', health: 30 };

  sutra.tick(entity);
  t.equal(actionExecuted, true, 'Action should be executed when all array conditions are met');

  t.end();
});

tap.only('Array of Conditions Test - Partial Match', async (t) => {
  let sutra = new Sutra();
  let actionExecuted = false;

  // Similar setup as the previous test, but with different conditions
  sutra.addCondition('arrayConditionsPartial', [
    (entity) => entity.type === 'BOSS', // Only the first condition should match
    {
      op: 'greaterThan',
      property: 'health',
      value: 50
    }
  ]);

  sutra.addAction({
    if: 'arrayConditionsPartial',
    then: [{ action: 'testAction' }]
  });

  sutra.on('testAction', () => {
    actionExecuted = true;
  });

  // Entity that meets both conditions in the array
  let entity = { id: 2, type: 'BOSS', health: 100 };

  sutra.tick(entity);
  t.equal(actionExecuted, true, 'Action should be executed when all array conditions are met');

});
