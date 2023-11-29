import tap from 'tape';
import Sutra from '../lib/Sutra.js';

tap.test('Nested Conditions Tests', async (t) => {
  let sutra = new Sutra();

  // Add Nested Conditions
  sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');
  sutra.addCondition('isHealthLow', {
    op: 'lessThan',
    property: 'health',
    value: 50
  });

  sutra.addAction({
    if: 'isBoss',
    then: [{
      if: 'isHealthLow',
      then: [{ 
        action: 'entity::update', 
        data: { color: 0xff0000, speed: 5 } 
      }]
    }]
  });

  // Asserting nested structure
  t.equal(sutra.tree.length, 1, 'Tree should have one node with nested actions');
  t.ok(sutra.tree[0].then, 'Nested structure should exist under the first node');

  // Assert child node exists
  t.ok(sutra.tree[0].then[0].if === 'isHealthLow', 'Child node with condition "isHealthLow" should exist');

  // Remove Parent Condition
  sutra.removeNode('tree[0]');
  t.equal(sutra.tree.length, 0, 'Tree should have no nodes after removing parent condition');

  t.end();
});

tap.test('Complex Scenario Tests', async (t) => {
  let sutra = new Sutra();

  // Multiple Nested Levels
  sutra.addAction({
    if: 'isBoss',
    then: [{
      if: 'isHealthLow',
      then: [{
        if: 'anotherCondition',
        then: [{ 
          action: 'someAction', 
          data: { /* data here */ } 
        }]
      }]
    }]
  });

  // Assertions for nested structure
  t.equal(sutra.tree.length, 1, 'Tree should have one node with nested actions');
  t.ok(sutra.tree[0].then, 'Nested structure should exist under the first node');
  t.ok(sutra.tree[0].then[0].then, 'Second level of nested structure should exist');

  // Removing Intermediate Node
  sutra.removeNode('tree[0].then[0]');
  t.equal(sutra.tree[0].then.length, 0, 'Intermediate node should be removed, leaving no nodes at this level');

  t.end();
});

tap.test('Complex Scenario Tests 2', async (t) => {
  let sutra = new Sutra();

  // Multiple Nested Levels
  sutra.addAction({
    if: 'isBoss',
    then: [{
      if: 'isHealthLow',
      then: [{
        if: 'anotherCondition',
        then: [{ 
          action: 'someAction', 
          data: { /* data here */ } 
        }]
      }]
    }]
  });

  // Assertions for nested structure
  t.equal(sutra.tree.length, 1, 'Tree should have one node with nested actions');
  t.ok(sutra.tree[0].then, 'Nested structure should exist under the first node');
  t.ok(sutra.tree[0].then[0].then, 'Second level of nested structure should exist');

  // Removing Intermediate Node
  sutra.removeNode('tree[0].then[0].then[0]');
  t.equal(sutra.tree[0].then.length, 1, 'Intermediate node should be removed, leaving no nodes at this level');
  t.equal(sutra.tree[0].then[0].then.length, 0, 'Intermediate node should be removed, leaving no nodes at this level');

  t.end();
});