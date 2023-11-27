import tap from 'tape';
import Sutra from '../lib/sutra.js';


tap.test('AND composite condition test', async (t) => {
  let sutra = new Sutra();
  let actionExecuted = false;

  sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');
  sutra.addCondition('isHealthLow', {
    operator: 'lessThan',
    property: 'health',
    value: 50
  });

  // Composite AND condition
  sutra.addCondition('isBossAndHealthLow', {
    operator: 'and',
    conditions: ['isBoss', 'isHealthLow']
  });

  sutra.addAction({
    if: 'isBossAndHealthLow',
    then: [{ action: 'testAction' }]
  });

  sutra.on('testAction', () => {
    actionExecuted = true;
  });

  // Entity that meets both conditions
  let entity = { id: 1, type: 'BOSS', health: 30 };

  sutra.tick(entity);
  t.equal(actionExecuted, true, 'Action should be executed when both conditions are met');

  t.end();
});

tap.test('OR composite condition test', async (t) => {
  let sutra = new Sutra();
  let actionExecuted = false;

  sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');
  sutra.addCondition('isPlayer', (entity) => entity.type === 'PLAYER');

  sutra.addCondition('isBossOrPlayer', {
    operator: 'or',
    conditions: ['isBoss', 'isPlayer']
  });

  sutra.addAction({
    if: 'isBossOrPlayer',
    then: [{ action: 'testAction' }]
  });

  sutra.on('testAction', () => {
    actionExecuted = true;
  });

  // Entity that meets one of the conditions (is a Boss)
  let bossEntity = { id: 1, type: 'BOSS', health: 100 };
  sutra.tick(bossEntity);
  t.equal(actionExecuted, true, 'Action should be executed when one of the conditions is met');

  actionExecuted = false; // Reset for the next test

  // Entity that meets the other condition (is a Player)
  let playerEntity = { id: 2, type: 'PLAYER', health: 100 };
  sutra.tick(playerEntity);
  t.equal(actionExecuted, true, 'Action should be executed when the other condition is met');

  t.end();
});

tap.test('NOT condition test', async (t) => {
  let sutra = new Sutra();
  let actionExecuted = false;

  sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');

  sutra.addCondition('isNotBoss', {
    operator: 'not',
    condition: 'isBoss'
  });

  sutra.addAction({
    if: 'isNotBoss',
    then: [{ action: 'testAction' }]
  });

  sutra.on('testAction', () => {
    actionExecuted = true;
  });

  // Entity that does not meet the isBoss condition
  let nonBossEntity = { id: 3, type: 'ENEMY', health: 100 };
  sutra.tick(nonBossEntity);
  t.equal(actionExecuted, true, 'Action should be executed when NOT condition is met');

  t.end();
});
