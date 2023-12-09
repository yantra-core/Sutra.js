import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Extended SutraPath Node Remove Nested Tests', async (t) => {
  let sutra = new Sutra();

  // Add a complex nested structure
  sutra.addAction({
    if: 'isBoss',
    then: [
      {
        if: 'isHealthLow',
        then: [
          {
            action: 'entity::update',
            data: { color: 0xff0000, speed: 5 },
            then: [{ action: 'entity::alert', data: { message: 'Health low!' } }]
          },
          {
            action: 'entity::wait',
            data: { duration: 5 }
          }
        ],
        else: [
          { action: 'entity::heal', data: { amount: 20 } }
        ]
      },
      {
        if: 'isAngry',
        then: [
          { action: 'entity::attack', data: { damage: 10 } },
          {
            action: 'entity::shout',
            data: { message: 'Angry!' },
            else: [{ action: 'entity::calmDown' }]
          }
        ]
      }
    ]
  });

  // Test removing a deep nested node and checking sutraPath updates
  sutra.removeNode('tree[0].then[0].then[0].then[0]');
  t.equal(sutra.tree[0].then[0].then[0].then.length, 0, 'Deeply nested actions should be empty after removal');

  // Test removing a node from an 'else' branch
  sutra.removeNode('tree[0].then[0].else[0]');
  t.equal(sutra.tree[0].then[0].else.length, 0, 'Else actions should be empty after removal');

  // Test removing a node and updating sibling nodes
  sutra.removeNode('tree[0].then[1].then[0]');
  t.equal(sutra.tree[0].then[1].then.length, 1, 'One sibling node should remain after removal');
  t.equal(sutra.tree[0].then[1].then[0].action, 'entity::shout', 'Remaining sibling node should have action "entity::shout"');
  t.equal(sutra.tree[0].then[1].then[0].sutraPath, 'tree[0].then[1].then[0]', 'SutraPath of remaining sibling node should be updated correctly');

  // Add more test cases as needed to cover different scenarios

  t.end();
});

tap.test('Extended SutraPath Node Remove Nested Tests with Array Conditionals', async (t) => {
  let sutra = new Sutra();

  // Add a complex nested structure with array conditionals
  sutra.addCondition('compositeCondition', [
    { op: 'equals', property: 'type', value: 'BOSS' },
    { op: 'lessThan', property: 'health', value: 50 }
  ]);

  sutra.addAction({
    if: 'compositeCondition',
    then: [
      {
        action: 'entity::update',
        data: { status: 'alert' }
      },
      {
        action: 'entity::heal',
        data: { amount: 20 }
      }
    ]
  });

  // Test removing a node within an array conditional
  sutra.removeNode('tree[0].then[1]');
  t.equal(sutra.tree[0].then.length, 1, 'One action should remain after removal in array conditional');
  t.equal(sutra.tree[0].then[0].action, 'entity::update', 'Remaining action should be "entity::update"');
  t.equal(sutra.tree[0].then[0].sutraPath, 'tree[0].then[0]', 'SutraPath of remaining action in array conditional should be updated correctly');

  // Add a nested structure within an array conditional
  sutra.addAction({
    if: 'compositeCondition',
    then: [
      {
        action: 'entity::alert',
        then: [
          { action: 'entity::soundAlarm', data: { volume: 'high' } },
          { action: 'entity::lockdown' }
        ]
      }
    ]
  });

  // Test removing a deeply nested node within an array conditional
  sutra.removeNode('tree[1].then[0].then[1]');
  t.equal(sutra.tree[1].then[0].then.length, 1, 'One nested action should remain after deep removal in array conditional');
  t.equal(sutra.tree[1].then[0].then[0].action, 'entity::soundAlarm', 'Remaining nested action should be "entity::soundAlarm"');
  t.equal(sutra.tree[1].then[0].then[0].sutraPath, 'tree[1].then[0].then[0]', 'SutraPath of remaining deeply nested action in array conditional should be updated correctly');

  // Additional test cases can be added to cover more scenarios with array conditionals

  t.end();
});

tap.test('Extended SutraPath Node Remove Tests with Array of Conditions', async (t) => {
  let sutra = new Sutra();

  // Define conditions
  sutra.addCondition('blockCountLessThan5', (gameState) => gameState.blocks < 5);
  sutra.addCondition('spawnerHealthAbove50', (entity) => entity.health > 50);

  // Add action with array of conditions
  sutra.addAction({
    if: ['blockCountLessThan5', 'spawnerHealthAbove50'],
    then: [{ action: 'createBlock' }]
  });

  // Add more actions for testing removal
  sutra.addAction({
    if: ['blockCountLessThan5'],
    then: [{ action: 'increaseBlockCount' }]
  });

  // Test removing an action where the condition is an array
  sutra.removeNode('tree[0]');
  t.equal(sutra.tree.length, 1, 'One action should remain after removal');
  t.equal(sutra.tree[0].then[0].action, 'increaseBlockCount', 'Remaining action should be "increaseBlockCount"');
  t.equal(sutra.tree[0].then[0].sutraPath, 'tree[0].then[0]', 'SutraPath of remaining action should be updated correctly');

  // Test removing a node from a deeply nested structure with array of conditions
  sutra.addAction({
    if: ['blockCountLessThan5', 'spawnerHealthAbove50'],
    then: [{
      action: 'createAdvancedBlock',
      then: [{ action: 'activateBlock' }]
    }]
  });

  sutra.removeNode('tree[1].then[0].then[0]');
  t.equal(sutra.tree[1].then[0].then.length, 0, 'Nested actions should be empty after deep removal with array of conditions');
  t.equal(sutra.tree[1].then[0].sutraPath, 'tree[1].then[0]', 'SutraPath of parent node should be updated correctly');

  // Additional test cases can be added to cover more scenarios with array of conditions

  t.end();
});
