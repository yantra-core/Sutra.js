import Sutra from '../lib/sutra.js';

let rules = new Sutra();

// Define movement conditions
rules.addCondition('PLAYER_UP', (entity) => entity.direction.includes('UP'));
rules.addCondition('PLAYER_RIGHT', (entity) => entity.direction.includes('RIGHT'));

// Define actions for movements
rules.if('PLAYER_UP').then('MOVE_UP');
rules.if('PLAYER_RIGHT').then('MOVE_RIGHT');

// Define a mock action handler to update the state
// do nothing, rules.state will still be updated
rules.on('MOVE_UP', (entity, node) => {});
rules.on('MOVE_RIGHT', (entity, node) => {});

// Mock entity with direction indicating diagonal movement (UP and RIGHT)
let mockEntity = { direction: ['UP', 'RIGHT'] };

// all empty
console.log('rules.state', rules.state)
console.log('rules.satisfiedActions', rules.satisfiedActions)
console.log('rules.satisfiedConditions', rules.satisfiedConditions)

// run the sutra
rules.tick(mockEntity);

// state is combined scope
console.log('rules.state', rules.state)

// individual scopes
console.log('rules.satisfiedActions', rules.satisfiedActions)
console.log('rules.satisfiedConditions', rules.satisfiedConditions)