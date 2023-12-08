import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Sutra .use() method and subSutra functionality', async (t) => {
  let roundSutra = new Sutra();
  roundSutra.addCondition('roundEnded', (entity, gameState) => gameState.roundEnded === true);
  roundSutra.addCondition('roundRunning', {
    op: 'not',
    conditions: ['roundEnded']
  });

  let levelSutra = new Sutra();
  levelSutra.use(roundSutra);

  // Test the integration of the simple condition
  t.ok(levelSutra.conditions['roundEnded'], 'roundEnded condition is integrated into levelSutra');

  // Test the integration of the composite condition
  t.ok(levelSutra.conditions['roundRunning'], 'roundRunning condition is integrated into levelSutra');

  const gameState = {
    roundEnded: false
  };

  // Test roundRunning condition
  const roundRunningResult = levelSutra.evaluateCompositeCondition(levelSutra.conditions['roundRunning'], {}, gameState);
  t.equal(roundRunningResult, true, 'roundRunning condition evaluates correctly');

  // Assuming roundSpecificAction is an action defined in roundSutra
  levelSutra.on('roundSpecificAction', () => {
    t.pass('roundSpecificAction triggered successfully in levelSutra');
    t.end();
  });

  levelSutra.tick({}, gameState);
});
