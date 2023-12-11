import tap from 'tape';
import Sutra from '../lib/sutra.js';

// Define your 'rules' Sutra instance here
let rules = new Sutra();

rules
  .if('blockHitPlayer')
  .then((rules) => {
    rules
      .if('blockIsRed')
      .then('damagePlayer')
      .else('healPlayer');
  })
  .then('removeBlock');


//console.log(rules.toJSON());
//console.log(rules.toEnglish());

// Mock data
let playerBlockCollision = {
  type: 'BLOCK',
  color: 'red' // Change to 'not red' for different test cases
};

// Define conditions
rules.addCondition('blockHitPlayer', () => true); // Assuming collision always happens
rules.addCondition('blockIsRed', (entity) => entity.color === 'red');

// Define actions
let actionsTriggered = [];
rules.on('damagePlayer', () => actionsTriggered.push('damagePlayer'));
rules.on('healPlayer', () => actionsTriggered.push('healPlayer'));
rules.on('removeBlock', () => actionsTriggered.push('removeBlock'));

tap('Sutra Behavior Tree Tests', (t) => {
  // Reset actionsTriggered before each test
  actionsTriggered = [];

  // Test sutraPath for each node
  t.equal(rules.tree[0].sutraPath, 'tree[0]', "sutraPath for first node should be 'tree[0]'");
  t.equal(rules.tree[0].then[0].sutraPath, 'tree[0].then[0]', "sutraPath for nested then node should be 'tree[0].then[0]'");
  t.equal(rules.tree[0].then[0].then[0].sutraPath, 'tree[0].then[0].then[0]', "sutraPath for nested damagePlayer action should be 'tree[0].then[0].then[0]'");
  t.equal(rules.tree[0].then[0].else[0].sutraPath, 'tree[0].then[0].else[0]', "sutraPath for nested healPlayer action should be 'tree[0].then[0].else[0]'");


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


