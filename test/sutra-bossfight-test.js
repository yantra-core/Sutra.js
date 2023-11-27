import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Boss fight behavior tree test', async (t) => {
  let allEntities = [
    { id: 1, type: 'BOSS', health: 100 },
    { id: 2, type: 'PLAYER', health: 100 }
  ];

  let sutra = new Sutra();

  // use custom function for condition
  sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');

  /*
  // could also be written as:
  sutra.addCondition('isBoss', {
    operator: 'equals',
    property: 'type',
    value: 'BOSS'
  });
  */
  
  // use standard Sutra DSL for condition
  sutra.addCondition('isHealthLow', {
    operator: 'lessThan',
    property: 'health',
    value: 50
  });

  let bossHealthLowDetected = false;

  sutra.on('performCheck', (entity) => {
    if (entity.type === 'BOSS') {
      console.log("Boss with health below 50 found: " + entity.id)
      bossHealthLowDetected = true;
    }
  });

  sutra.addAction({
    if: 'isBoss',
    then: [{
      if: 'isHealthLow',
      then: [{ action: 'performCheck' }]
    }]
  });

  function gameTick() {
    allEntities.forEach(entity => {
      sutra.tick(entity);
    });
  }

  // Test case: Boss health is above 50, should not detect
  gameTick();
  t.equal(bossHealthLowDetected, false, 'Boss with health above 50 should not be detected');

  // Test case: Boss health drops below 50, should detect
  allEntities[0].health = 30;
  gameTick();
  t.equal(bossHealthLowDetected, true, 'Boss with health below 50 should be detected');

  // Resetting for next test
  bossHealthLowDetected = false;
  allEntities[0].health = 100;

  // Test case: Boss health goes back above 50, should not detect again
  gameTick();
  t.equal(bossHealthLowDetected, false, 'Boss with restored health above 50 should not be detected');

  t.end();
});
