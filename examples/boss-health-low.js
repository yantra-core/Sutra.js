
import Sutra from '../lib/Sutra.js';

// creates a new sutra instance
const sutra = new Sutra();

// adds a new condition as function which returns value
sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');

// adds a new condition by name
sutra.addCondition('isHealthLow', {
  op: 'lessThan',
  property: 'health',
  value: 50
});

// adds a simple if-then action with data
/*
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
*/

/* altenative syntax for the above action

sutra.addAction({
  if: ['isBoss', 'isHealthLow'],
  then: [{
    action: 'entity::updateEntity',
    data: { color: 0xff0000 } // Example with multiple properties
  },
  {
    action: 'entity::updateEntity',
    data: { speed: 5 } // Example with multiple properties
  }]
});
*/



const gameState = { isGameRunning: true };

sutra.addCondition('isGameRunning', (data, gameState) => gameState.isGameRunning);

sutra.addAction({
  if: ['isGameRunning', 'isBoss', 'isHealthLow'],
  then: [ {
    action: 'logAction'
  }, {
    action: 'entity::updateEntity',
    data: { color: generateRandomColorInt, speed: 5 }
  }]
});

sutra.on('logAction', (data, node) => {
  console.log('logAction', data, node)
});

// Function to generate a random color integer
function generateRandomColorInt(entity, gameState, node) {
  return Math.floor(Math.random() * 255);
}

/*

sutra.addAction({
  if: ['isBoss', 'isHealthLow'],
  then: [{
    action: 'entity::updateEntity',
    data: { color: generateRandomColorInt, speed: 5 }
  }]
});
*/


// create a simple array of entities
let allEntities = [
  { id: 1, type: 'BOSS', health: 100 },
  { id: 2, type: 'PLAYER', health: 100 }
];

// create a gameTick function for iterating over all entities and calling sutra.tick() for each
function gameTick(gameState) {
  allEntities.forEach(entity => {
    sutra.tick(entity, gameState);
  });
}

// listen for all events that the sutra instance emits
sutra.onAny(function (ev, data, node) {
  console.log('onAny', ev, data);
})

// listen for specific events that the sutra instance emits
sutra.on('entity::updateEntity', function (data, node) {
  // here we can now write arbitrary code to handle the event
  // When using `mantra`, we can simply call game.emit('entity::updateEntity', data);
  console.log('entity::updateEntity =>', JSON.stringify(data, true, 2));
});

// run the game tick with Boss at full health
// nothing should happen
gameTick(gameState);

// run the game tick with Boss at low health
// `entity::updateEntity` event should be emitted
allEntities[0].health = 40;
gameTick(gameState);

gameState.isGameRunning = false;

// nothing should happen
gameTick(gameState);
