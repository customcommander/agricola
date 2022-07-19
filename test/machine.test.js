const test = require('tape');
const {interpret} = require('xstate');
const m = require('../src/machines/main.js');

test('cannot select a task already completed', t => {
  const s = interpret(m());
  s.start();
  s.send({type: 'TASK_SELECTED', task: 'take_grain'});
  s.send({type: 'TASK_COMPLETED', task: 'take_grain'});
  t.throws(() => s.send({type: 'TASK_SELECTED', task: 'take_grain'}));
  t.end();
});
