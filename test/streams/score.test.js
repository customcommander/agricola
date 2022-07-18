const test = require('tape');
const { interpret } = require('xstate');
const machine = require('../../src/machines/main.js');
const SUT = require('../../src/streams/score.js');

test('score$', t => {
  const s = interpret(machine());
  const stream$ = SUT(s);
  const scores = [];
  stream$.subscribe(score => scores.push(score));
  s.start();
  s.send({type: 'TASK_SELECTED' , task: 'take-x-wood'});
  s.send({type: 'TASK_COMPLETED', task: 'take-x-wood'});
  s.send({type: 'TASK_SELECTED' , task: 'take_grain' });
  s.send({type: 'TASK_COMPLETED', task: 'take_grain' }); // end of turn 1
  s.send({type: 'TASK_SELECTED' , task: 'plow_field' });
  s.send({type: 'TASK_COMPLETED', task: 'plow_field', spaces: ['A1'] });
  s.send({type: 'TASK_SELECTED' , task: 'take_grain' });
  s.send({type: 'TASK_COMPLETED', task: 'take_grain' }); // end of turn 2

  t.same(scores, [ // initial score
                   { family:       [ 2,   6]
                   , unusedSpaces: [13, -13]
                   , grain:        [ 0,  -1]
                   , fields:       [ 0,  -1]
                   , total:              -9}
                   // after taking grain
                 , { family:       [ 2,   6]
                   , unusedSpaces: [13, -13]
                   , grain:        [ 1,   1]
                   , fields:       [ 0,  -1]
                   , total:              -7}
                   // after plowing field
                 , { family:       [ 2,   6]
                   , unusedSpaces: [12, -12]
                   , grain:        [ 1,   1]
                   , fields:       [ 1,  -1]
                   , total:              -6}
                   // after taking grain
                 , { family:       [ 2,   6]
                   , unusedSpaces: [12, -12]
                   , grain:        [ 2,   1]
                   , fields:       [ 1,  -1]
                   , total:              -6}]);
  t.end();
});