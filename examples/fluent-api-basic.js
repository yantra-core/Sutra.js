import Sutra from '../lib/sutra.js';
import fs from 'fs';
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


sutra
  .if('roundStarted')
  .if('roundNotRunning')
  .then('spawnEnemyUnits')
  .then('startRound')


// exports the sutra as json
const json = sutra.toJSON();
console.log(json);

// exports the sutra as plain english
const english = sutra.toEnglish();
console.log(english);

// write the english to test.txt file
fs.writeFileSync('test.txt', english);