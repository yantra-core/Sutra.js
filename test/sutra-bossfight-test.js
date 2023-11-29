import tap from 'tape';
import Sutra from '../lib/Sutra.js';

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
    op: 'equals',
    property: 'type',
    value: 'BOSS'
  });
  */
 
  
  // use standard Sutra DSL for condition
  sutra.addCondition('isHealthLow', {
    op: 'lessThan',
    property: 'health',
    value: 50
  });

  let bossHealthLowDetected = false;
  let updatedEnt = {};

  sutra.on('entity::update', (updatedEntity, node) => {
    //console.log('entity::update', updatedEntity, node);
    if (updatedEntity.type === 'BOSS') {
      //console.log("Boss with health below 50 found: " + updatedEntity.id)
      bossHealthLowDetected = true;
      // updatedEntity is merged entityData + actionData
      updatedEnt = updatedEntity;
    }
  });

  // Function to generate a random color integer
  function generateRandomColorInt() {
    return Math.floor(Math.random() * 255);
  }

  sutra.addAction({
    if: 'isBoss',
    then: [{
      if: 'isHealthLow',
      then: [{ 
        action: 'entity::update', 
        data: { color: generateRandomColorInt, speed: 5 } // Example with multiple properties
      }]
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

  // check random value from 0-255
  t.ok(updatedEnt.color >= 0 && updatedEnt.color <= 255, 'Boss has random color');
  
  // check that speed is 5
  t.equal(updatedEnt.speed, 5, 'Boss has speed of 5');

  // Resetting for next test
  bossHealthLowDetected = false;
  allEntities[0].health = 100;

  // Test case: Boss health goes back above 50, should not detect again
  gameTick();
  t.equal(bossHealthLowDetected, false, 'Boss with restored health above 50 should not be detected');

  t.end();
});
