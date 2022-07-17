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
  s.send({type: 'TASK_SELECTED', task: 'take-x-wood'});
  s.send({type: 'TASK_COMPLETED', task: 'take-x-wood'});
  s.send({type: 'TASK_SELECTED', task: 'take_grain'});
  s.send({type: 'TASK_COMPLETED', task: 'take_grain'});
  t.same(scores, [ {family: [2, 6], unusedSpaces: [13, -13], grain: [0, -1]}
                 , {family: [2, 6], unusedSpaces: [13, -13], grain: [1,  1]}]);
  t.end();
});