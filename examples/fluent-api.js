import Sutra from '../lib/sutra.js';

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

sutra.addAction({
  if: ['isBoss', 'isHealthLow'],
  then: [{
    action: 'entity::updateEntity',
    data: { color: 0xff0000, speed: 5 }
  }]
});

sutra.if('isBoss', 'isHealthLow').then('entity::updateEntity', { color: 0xff0000, speed: 5 });

sutra.if('isBoss').if('isHealthLow').then('entity::updateEntity', { color: 0xff0000, speed: 5 });


sutra
  .if('isBoss')
  .if('isHealthLow')
  .then('entity::updateEntity', { color: 0xff0000, speed: 5 })
  .then('entity::createEntity', { color: 0x00ff00, speed: 1 })
  .else('entity::updateEntity', { color: 0x0000ff, speed: 10 });




// exports the sutra as json
const json = sutra.toJSON();
console.log(json);

// exports the sutra as plain english
const english = sutra.toEnglish();
console.log(english);