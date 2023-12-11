/*
import tap from 'tape';
import Sutra from '../lib/sutra.js';

let rules = new Sutra();

// Define the behavior tree
rules
  .if('playerIsInDanger')
  .then((rules) => {
    rules
      .if('hasHealthPotion')
      .then('useHealthPotion')
      .else((rules) => {
        rules
          .if('canEscape')
          .then('escape')
          .else('fightBack');
      });
  });

// Mock data
let playerState = {
  isInDanger: true,
  hasHealthPotion: false,
  canEscape: false
};

// Define conditions
rules.addCondition('playerIsInDanger', () => playerState.isInDanger);
rules.addCondition('hasHealthPotion', () => playerState.hasHealthPotion);
rules.addCondition('canEscape', () => playerState.canEscape);

// Define actions
let actionsTriggered = [];
rules.on('useHealthPotion', () => actionsTriggered.push('useHealthPotion'));
rules.on('escape', () => actionsTriggered.push('escape'));
rules.on('fightBack', () => actionsTriggered.push('fightBack'));

tap('Sutra Behavior Tree Tests', (t) => {
  // Test case when player has no health potion and cannot escape
  actionsTriggered = [];
  playerState.hasHealthPotion = false;
  playerState.canEscape = false;
  rules.tick(playerState);
  t.deepEqual(actionsTriggered, ['fightBack'], "Player should fight back if in danger, without health potion and cannot escape");

  // Test case when player has health potion
  actionsTriggered = [];
  playerState.hasHealthPotion = true;
  rules.tick(playerState);
  t.deepEqual(actionsTriggered, ['useHealthPotion'], "Player should use health potion if in danger and has one");

  // Test case when player can escape
  actionsTriggered = [];
  playerState.hasHealthPotion = false;
  playerState.canEscape = true;
  rules.tick(playerState);
  t.deepEqual(actionsTriggered, ['escape'], "Player should escape if in danger, without health potion but can escape");

  t.end();
});

*/