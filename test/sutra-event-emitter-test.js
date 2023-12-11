import tap from 'tape';
import Sutra from '../lib/sutra.js';

// Utility function to create a basic sutra with action
function createBasicSutra() {
  const sutra = new Sutra();
  sutra.addCondition('isBoss', entity => entity.type === 'BOSS');
  sutra.addCondition('isHealthLow', entity => entity.health < 50);

  sutra.addAction({
    if: 'isBoss',
    then: [{
      if: 'isHealthLow',
      then: [{
        action: 'entity::updateEntity',
        data: { color: 0xff0000, speed: 5 }
      }]
    }]
  });

  return sutra;
}

tap.test('Basic Event Emission', (t) => {
  const sutra = createBasicSutra();

  sutra.on('entity::updateEntity', (data) => {
    t.equal(data.color, 0xff0000, 'Color should be red');
    t.equal(data.speed, 5, 'Speed should be 5');
    t.end();
  });

  sutra.tick({ type: 'BOSS', health: 30 });
});

tap.test('Subtree Event Emission without Shared Listeners', (t) => {
  const mainSutra = new Sutra();
  const subSutra = createBasicSutra();

  mainSutra.use(subSutra, 'subtree', 0, false);

  subSutra.on('entity::updateEntity', () => {
    t.pass('Subtree event emitted and caught in subtree');
  });

  mainSutra.on('entity::updateEntity', () => {
    t.fail('Event should not be caught in main tree');
  });

  subSutra.tick({ type: 'BOSS', health: 30 });
  t.end();
});

tap.test('Subtree Event Emission with Shared Listeners', (t) => {
  const mainSutra = new Sutra();
  const subSutra = createBasicSutra();

  mainSutra.use(subSutra, 'subtree'); // Share listeners

  let eventEmittedInSubtree = false;
  subSutra.on('entity::updateEntity', () => {
    eventEmittedInSubtree = true;
  });

  mainSutra.on('entity::updateEntity', () => {
    t.ok(eventEmittedInSubtree, 'Event should first be emitted in subtree');
    t.pass('Shared event caught in main tree');
    t.end();
  });

  subSutra.tick({ type: 'BOSS', health: 30 });
});

tap.test('Event Emission from Main Sutra to Subtree Listener', (t) => {
  const mainSutra = new Sutra();
  const subSutra = createBasicSutra();

  // Use the subtree with shared listeners
  mainSutra.use(subSutra, 'subtree', true);

  // Add a listener in the subtree
  subSutra.on('main::customEvent', () => {
    t.pass('Subtree listener caught event emitted from main Sutra');
    t.end();
  });

  // Add a new action in the main Sutra that emits the custom event
  mainSutra.addAction({
    if: 'customCondition',
    then: [{
      action: 'main::customEvent',
      data: {}
    }]
  });

  // Add a condition to trigger the new action
  mainSutra.addCondition('customCondition', () => true);

  // Trigger the tick in the main Sutra to emit the event
  mainSutra.tick({});
});

tap.test('Subtree Event Handling and Condition Evaluation', (t) => {
  let level = new Sutra();
  let round = new Sutra();

  // Define conditions and add them to 'round'
  round.addCondition('roundStarted', (entity, gameState) => gameState.roundStarted);
  round.addCondition('roundEnded', (entity, gameState) => gameState.roundEnded);
  round.addCondition('roundRunning', (entity, gameState) => gameState.roundRunning);
  round.addCondition('roundNotRunning', (entity, gameState) => !gameState.roundRunning);

  round.on('roundLost', (data, node, gameState) => {
    gameState.roundStarted = false;
    gameState.roundRunning = false;
    gameState.roundEnded = true;
  });

  round.on('startRound', (data, node, gameState) => {
    gameState.roundRunning = true;
    t.pass('startRound event correctly triggered');
  });

  round.if('roundNotRunning').then('startRound');
  level.use(round, 'roundLogic');

  let gameState = { roundStarted: false, roundRunning: false, roundEnded: false };

  // Trigger the tick method on the main sutra and check gameState changes
  level.tick({}, gameState);

  t.ok(gameState.roundRunning, 'Game state updated correctly after startRound event');
  t.end();
});

tap.run();