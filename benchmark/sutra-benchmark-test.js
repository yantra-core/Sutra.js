// Basic benchmark tests for Sutra
// These tests are meant to provide a baseline for performance and to ensure that future changes do not introduce performance regressions.
// If you want to benchmark any API cases that are not covered by these tests, please add them here.
import tap from 'tape';
import { performance } from 'perf_hooks';
import Sutra from '../lib/sutra.js';

// Utility function to create a basic sutra with action
function createBasicSutra() {
  const sutra = new Sutra();
  sutra.addCondition('isBoss', entity => entity.type === 'BOSS');
  sutra.addCondition('isHealthLow', entity => entity.health < 50);

  sutra.addAction({
    if: 'isBoss',
    then: [{
      if: 'isHealthLow',
      then: [{
        action: 'entity::updateEntity',
        data: { color: 0xff0000, speed: 5 }
      }]
    }]
  });

  return sutra;
}

tap.test('Small Sutra Benchmark', (t) => {
  const sutra = createBasicSutra();
  const numberOfTicks = 300; // Number of tick operations for the test
  const threshold = 3; // Threshold in milliseconds

  let startTime = performance.now();

  for (let i = 0; i < numberOfTicks; i++) {
    sutra.tick({ type: 'BOSS', health: Math.random() * 100 });
  }

  let endTime = performance.now();
  let timeTaken = endTime - startTime;
  t.ok(timeTaken < threshold, `Small Sutra should complete in less than ${threshold}ms. Time taken: ${timeTaken}ms`);
  t.end();
});

tap.test('Large Sutra Benchmark', (t) => {
  const sutra = new Sutra();
  const numberOfConditions = 50; // Number of conditions to add
  const numberOfTicks = 300; // Number of tick operations for the test
  const threshold = 150; // Adjusted threshold for larger tree, in milliseconds

  // Programmatically add conditions and actions
  for (let i = 0; i < numberOfConditions; i++) {
    sutra.addCondition(`condition${i}`, entity => entity[`value${i}`] === true);
    sutra.addAction({
      if: `condition${i}`,
      then: [{ action: `action${i}`, data: {} }]
    });
  }

  let startTime = performance.now();

  for (let i = 0; i < numberOfTicks; i++) {
    let data = {};
    for (let j = 0; j < numberOfConditions; j++) {
      data[`value${j}`] = Math.random() < 0.5;
    }
    sutra.tick(data);
  }

  let endTime = performance.now();
  let timeTaken = endTime - startTime;
  t.ok(timeTaken < threshold, `Large Sutra should complete in less than ${threshold}ms. Time taken: ${timeTaken}ms`);
  t.end();
});

tap.test('Nested Conditions Sutra Benchmark', (t) => {
  let rules = new Sutra();

  // Add conditions to the Sutra instance
  rules.addCondition('blockHitPlayer', entity => entity.blockHitPlayer);
  rules.addCondition('blockIsRed', entity => entity.blockColor === 'red');

  // Define the Sutra behavior
  rules
    .if('blockHitPlayer')
    .then((rules) => {
      rules
        .if('blockIsRed')
        .then('damagePlayer')
        .else('healPlayer');
    })
    .then('removeBlock');

  const numberOfTicks = 300; // Number of tick operations for the test
  const threshold = 1; // Threshold in milliseconds

  let startTime = performance.now();

  for (let i = 0; i < numberOfTicks; i++) {
    let entity = {
      blockHitPlayer: Math.random() < 0.5,
      blockColor: Math.random() < 0.5 ? 'red' : 'blue'
    };
    rules.tick(entity);
  }

  let endTime = performance.now();
  let timeTaken = endTime - startTime;

  t.ok(timeTaken < threshold, `Nested Conditions Sutra should complete in less than ${threshold}ms. Time taken: ${timeTaken}ms`);
  t.end();
});