import tap from 'tape';
import Sutra from '../lib/sutra.js';


function topdownMovement(game) {
  let rules = new Sutra();

  // Define movement conditions
  rules.addCondition('PLAYER_UP', (entity) => entity.direction.includes('UP'));
  rules.addCondition('PLAYER_RIGHT', (entity) => entity.direction.includes('RIGHT'));

  // Define actions for movements
  rules.if('PLAYER_UP').then('MOVE_UP');
  rules.if('PLAYER_RIGHT').then('MOVE_RIGHT');

  // Define a mock action handler to update the state
  rules.on('MOVE_UP', (entity, node) => {
    // do nothing, this will register:
    // rules.state.MOVE_UP = true
    // rules.state.PLAYER_UP = true
    // rules.satisifedActions.MOVE_UP = true
    // rules.satisfiedConditions.PLAYER_UP = true
  });

  rules.on('MOVE_RIGHT', (entity, node) => {
    // do nothing, this will register:
    // rules.state.MOVE_RIGHT = true
    // rules.state.PLAYER_RIGHT = true
    // rules.satisifedActions.MOVE_RIGHT = true
    // rules.satisfiedConditions.PLAYER_RIGHT = true
  });

  return rules;
}

tap.test('Diagonal Movement Stateful Nodes Test', (t) => {
  let mockGame = {};
  let rules = topdownMovement(mockGame);

  // Mock entity with direction indicating diagonal movement (UP and RIGHT)
  let mockEntity = { direction: ['UP', 'RIGHT'] };

  t.ok(!rules.state['PLAYER_UP'], 'Node state should be empty');
  t.ok(!rules.satisfiedActions['MOVE_UP'], 'Node state should be empty');
  t.ok(!rules.satisfiedConditions['PLAYER_UP'], 'Node state should be empty');
  t.ok(!rules.satisfiedActions['MOVE_RIGHT'], 'Node state should be empty');
  t.ok(!rules.satisfiedConditions['PLAYER_RIGHT'], 'Node state should be empty');

  rules.tick(mockEntity);
  t.ok(rules.state['PLAYER_UP'], 'Node state should reflect upward movement');
  t.ok(rules.state['MOVE_UP'], 'Node state should reflect upward movement');
  t.ok(rules.state['PLAYER_RIGHT'], 'Node state should reflect upward movement');
  t.ok(rules.state['MOVE_RIGHT'], 'Node state should reflect upward movement');
  t.ok(rules.satisfiedActions['MOVE_UP'], 'Node state should reflect upward movement');
  t.ok(rules.satisfiedConditions['PLAYER_UP'], 'Node state should reflect upward movement');
  t.ok(rules.satisfiedActions['MOVE_RIGHT'], 'Node state should reflect upward movement');
  t.ok(rules.satisfiedConditions['PLAYER_RIGHT'], 'Node state should reflect upward movement');

  t.end();
});
