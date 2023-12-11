import Sutra from '../lib/sutra.js';
// import fs from 'fs';
// creates a new sutra instance
const sutra = new Sutra();

// adds a new condition as function which returns value
sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');

// adds a new condition using DSL conditional object
sutra.addCondition('isHealthLow', {
  op: 'lessThan',
  property: 'health',
  value: 50
});

sutra.if('isBoss', 'isHealthLow').then('entity::updateEntity', { color: 0xff0000, speed: 5 });

sutra.if('isBoss').if('isHealthLow').then('entity::updateEntity', { color: 0xff0000, speed: 5 });

/*
sutra
  .if('isBoss')
  .if('isHealthLow')
  .then('entity::updateEntity', { color: 0xff0000, speed: 5 })
  .then('entity::createEntity', { color: 0x00ff00, speed: 1 })
  .else('entity::updateEntity', { color: 0x0000ff, speed: 10 });
*/


sutra
  .if('roundStarted')
  .if('roundNotRunning')
  .then('spawnEnemyUnits')
  .then('startRound')


// this is how we currently do it
sutra.addAction({
  if: ['blockHitPlayer'],
  then: [{
    if: ['blockIsRed'],
    then: [{ action: 'damagePlayer' }],
    else: [{ action: 'healPlayer' }]
  }, {
    action: 'removeBlock'
  }]
});

// alternative syntax 



// TODO: ensure all these fluent APIs are supported:
sutra.if('isBoss').if('isHealthLow').then('entity::updateEntity', { color: 0xff0000, speed: 5 });
sutra.if('isBoss', 'isHealthLow').then('entity::updateEntity', { color: 0xff0000, speed: 5 });

sutra.addAction({
  if: 'isBoss',
  then: [{
    if: 'isHealthLow',
    then: [{
      action: 'entity::updateEntity',
      data: { color: 0xff0000, speed: 5 } // Example with multiple properties
    }]
  }]
});

sutra
  .if('isBoss')
  .then((rules) => {
    rules
      .if('isHealthLow')
      .then('entity::updateEntity', { color: 0xff0000, speed: 5 });
  })


  sutra
  .if('blockHitWall')
  .then('damageWall')
  .then('removeBlock');


// exports the sutra as json
const json = sutra.toJSON();
console.log(json);

// exports the sutra as plain english
const english = sutra.toEnglish();
console.log(english);

// write the english to test.txt file
// fs.writeFileSync('test.txt', english);