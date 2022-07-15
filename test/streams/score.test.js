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
  t.same(scores, [{family: [2, 6]}]);
  t.end();
});