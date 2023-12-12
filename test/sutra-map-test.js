import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Sutra .map() Function Integration Test', (t) => {
  let rules = new Sutra();
  let damageEventTriggered = false;
  let healEventTriggered = false;

  // Define conditions
  rules.addCondition('blockHitPlayer', (entity) => {
    return entity.type === 'COLLISION' && (entity.bodyA.type === 'PLAYER' || entity.bodyB.type === 'PLAYER') && (entity.bodyA.type === 'BLOCK' || entity.bodyB.type === 'BLOCK');
  });

  rules.addCondition('blockIsRed', (context) => {
    return context.block.color === 'red';
  });

  // Define the transform function 'identifyCollisionParticipants'
  rules.addMap('identifyCollisionParticipants', (entity) => {
    if (entity.type === 'COLLISION') {
      return {
        block: entity.bodyA.type === 'BLOCK' ? entity.bodyA : entity.bodyB,
        player: entity.bodyA.type === 'PLAYER' ? entity.bodyA : entity.bodyB
      };
    }
  });

  // Define actions
  rules.on('damagePlayer', (context) => {
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

  // Construct the behavior tree using addAction and addMap
  rules.addAction({
    if: 'blockHitPlayer',
    then: [{
      map: 'identifyCollisionParticipants',
      then: [{
        if: 'blockIsRed',
        then: [{ action: 'damagePlayer' }],
        else: [{ action: 'healPlayer' }]
      }],
    }, { action: 'removeBlock' }]
  });

  // Create a mock entity representing a collision
  let collisionEntity = {
    type: 'COLLISION',
    bodyA: { type: 'PLAYER', health: 100 },
    bodyB: { type: 'BLOCK', color: 'red', exists: true }
  };

  // Run the Sutra with the collision entity
  rules.tick(collisionEntity);

  // Assertions
  t.ok(damageEventTriggered, 'damagePlayer action should be triggered when block is red');
  //t.false(collisionEntity.bodyB.exists, 'Block should be removed after collision');
  t.notOk(healEventTriggered, 'healPlayer action should not be triggered when block is red');

  t.end();
});
