import Sutra from '../lib/sutra.js';

const rules = new Sutra();

rules.addCondition('isPlayer', (context) => {
  return context.type === 'PLAYER';
});

rules.addMap('equipShield', (context) => {
  if (context.type === 'PLAYER') {
    context.shield = 'wooden';
  }
});

rules.on('equippedShield', (context) => {
  console.log('Shield equipped!', context);
});

// single-level
rules
 .if('isPlayer')
 .map('equipShield')
 .then('equippedShield');

// scoped
rules
 .if('isPlayer')
 .then(function(sub){
  sub
    .map('equipShield')
    .then('equippedShield');
 })


 rules.tick({ type: 'PLAYER' });