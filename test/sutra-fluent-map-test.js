import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Sutra .map() Function Integration Test', (t) => {
  let rules = new Sutra();
  let damageEventTriggered = false;
  let healEventTriggered = false;


  // Define conditions
  rules.addCondition('blockHitPlayer', (entity) => {
    return true;
  });

  rules.addCondition('blockIsRed', (context) => {
    return context.BLOCK.color === 'red';
  });

  // Define the transform function 'identifyCollisionParticipants'
  rules.addMap('setBlockBlue', (context) => {
    context.BLOCK.color = 'blue';
  });

  // Define actions
  rules.on('damagePlayer', (context) => {
    console.log('damagePlayer action triggered', context)
    damageEventTriggered = true;
  });

  rules.on('healPlayer', (context) => {
    healEventTriggered = true;
  });

  rules.on('removeBlock', (context) => {
    if (context && context.block) {
      context.block.exists = false;
    }
  });

  // Construct the behavior tree using .map()
  rules
    .if('blockHitPlayer')
    .then((subRules) => {
      subRules
        .map('setBlockBlue')
        .if('blockIsRed')
        .then('damagePlayer')
        .else('healPlayer');
    })
    .then('removeBlock');

  // Create a mock entity representing a collision
  let collisionEntity = {
    type: 'COLLISION',
    PLAYER: { type: 'PLAYER', health: 100 },
    BLOCK: { type: 'BLOCK', color: 'red' }
  };

  rules.tick(collisionEntity);

  t.equal(damageEventTriggered, false, 'damagePlayer event should not be triggered');
  t.equal(healEventTriggered, true, 'healPlayer event should be triggered');

  t.end();
});
