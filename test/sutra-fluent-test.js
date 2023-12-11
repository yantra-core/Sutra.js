import tap from 'tape';
import Sutra from '../lib/sutra.js';

// Define your 'rules' Sutra instance here
let rules = new Sutra();

rules
  .if('blockHitPlayer')
  .if('blockIsRed')
  .then('damagePlayer');

rules
  .if('blockHitPlayer')
  .if('blockIsNotRed')
  .then('healPlayer');

rules
  .if('blockHitPlayer')
  .then('removeBlock');

// Mock data
let playerBlockCollision = {
  type: 'BLOCK',
  color: 'red' // Change to 'not red' for different test cases
};

// Define conditions
rules.addCondition('blockHitPlayer', () => true); // Assuming collision always happens
rules.addCondition('blockIsRed', (entity) => entity.color === 'red');
rules.addCondition('blockIsNotRed', (entity) => entity.color !== 'red'); // New condition

// Define actions
let actionsTriggered = [];
rules.on('damagePlayer', () => actionsTriggered.push('damagePlayer'));
rules.on('removeBlock', () => actionsTriggered.push('removeBlock'));
rules.on('healPlayer', () => actionsTriggered.push('healPlayer')); // New action

tap('Sutra Behavior Tree sutraPath Tests', (t) => {
  t.equal(rules.tree[0].sutraPath, 'tree[0]', "sutraPath for first node should be 'tree[0]'");
  t.equal(rules.tree[0].then[0].sutraPath, 'tree[0].then[0]', "sutraPath for nested node should be 'tree[0].then[0]'");
  t.end();
});

tap('Sutra Behavior Tree Tests', (t) => {
  // Reset actionsTriggered before each test
  actionsTriggered = [];

  // Test case when block is red
  rules.tick(playerBlockCollision);
  t.deepEqual(actionsTriggered, ['damagePlayer', 'removeBlock'], "Should damage player and remove block if block is red");

  // Reset actionsTriggered for next test
  actionsTriggered = [];
  playerBlockCollision.color = 'not red';

  // Test case when block is not red
  rules.tick(playerBlockCollision);
  t.deepEqual(actionsTriggered, ['healPlayer', 'removeBlock'], "Should heal player and remove block if block is not red");

  t.end();
});


// Define your 'rules' Sutra instance here
let rulesWithElse = new Sutra();

rulesWithElse
  .if('blockHitPlayer')
  .if('blockIsRed')
  .then('damagePlayer')
  .else('healPlayer');

rulesWithElse
  .if('blockHitPlayer')
  .then('removeBlock');

// Mock data
let playerBlockCollisionElse = {
  type: 'BLOCK',
  color: 'red' // Change to 'not red' for different test cases
};

// Define conditions
rulesWithElse.addCondition('blockHitPlayer', () => true); // Assuming collision always happens
rulesWithElse.addCondition('blockIsRed', (entity) => entity.color === 'red');

// Define actions
let actionsTriggeredElse = [];
rulesWithElse.on('damagePlayer', () => actionsTriggeredElse.push('damagePlayer'));
rulesWithElse.on('removeBlock', () => actionsTriggeredElse.push('removeBlock'));
rulesWithElse.on('healPlayer', () => actionsTriggeredElse.push('healPlayer'));

tap('Sutra Behavior Tree Tests with Else', (t) => {
  // Reset actionsTriggered before each test
  actionsTriggeredElse = [];

  // Test case when block is red
  playerBlockCollisionElse.color = 'red';
  rulesWithElse.tick(playerBlockCollisionElse);
  t.deepEqual(actionsTriggeredElse, ['damagePlayer', 'removeBlock'], "Should damage player and remove block if block is red");

  // Reset actionsTriggered for next test
  actionsTriggeredElse = [];
  playerBlockCollisionElse.color = 'not red';

  // Test case when block is not red
  rulesWithElse.tick(playerBlockCollisionElse);
  t.deepEqual(actionsTriggeredElse, ['healPlayer', 'removeBlock'], "Should heal player and remove block if block is not red");

  t.end();
});