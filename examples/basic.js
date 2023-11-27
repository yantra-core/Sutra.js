import Sutra from '../lib/sutra.js';

const gameBehavior = new Sutra();

// Adding conditions with custom code
gameBehavior.addCondition('isEnemyNear', (data) => {
  // Logic to check if an enemy is near, using data
  return data.enemyNear;
});

// adding conditions with DSL
gameBehavior.addCondition('isHealthLow', {
  operator: 'lessThan',
  property: 'health',
  value: 50
});

// Registering action event listeners
gameBehavior.on('alertPlayer', () => {
  console.log('Alerting player!');
});
gameBehavior.on('retreat', () => {
  console.log('Retreating!');
});
gameBehavior.on('attackEnemy', () => {
  console.log('Attacking enemy!');
});

// Adding nested actions
gameBehavior.addAction({
  if: 'isEnemyNear',
  then: [
    {
      action: 'alertPlayer'
    },
    {
      if: 'isHealthLow',
      then: [{ action: 'retreat' }],
      else: [{ action: 'attackEnemy' }]
    }
  ]
});

// In game loop, with example data
gameBehavior.tick({ enemyNear: true, health: 40 });

// Serialize to JSON
const jsonRepresentation = gameBehavior.serializeToJson();
console.log(jsonRepresentation);

// Export to English
const englishRepresentation = gameBehavior.exportToEnglish();
console.log(englishRepresentation);
