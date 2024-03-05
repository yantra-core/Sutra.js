import Sutra from '../lib/sutra.js';
import fs from 'fs';
// creates a new sutra instance
const sutra = new Sutra();

// adds a new condition as function which returns value
sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');
sutra.addCondition('isRoundStarted', (data) => data.roundStarted);

// adds a new condition using DSL conditional object
sutra.addCondition('isHealthLow', {
  op: 'lessThan',
  property: 'health',
  value: 50
});

sutra.on('spawnEnemyUnits', () => {
  console.log('spawning enemy units');
});

sutra
  .if('isRoundStarted')
  .then('spawnEnemyUnits')


// exports the sutra as json
const json = sutra.toJSON();
// console.log(json);

// exports the sutra as plain english
const english = sutra.toEnglish();
console.log(english);

let gamestate = {
  roundStarted: false
};


// nothing happens, roundStarted is false
sutra.tick(gamestate);

// roundStarted is true, so spawnEnemyUnits is called
gamestate.roundStarted = true;
sutra.tick(gamestate);



// write the english to test.txt file
// fs.writeFileSync('test.txt', english);