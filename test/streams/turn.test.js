const test = require('tape');
const { interpret } = require('xstate');
const machine = require('../../src/machines/main.js');
const SUT = require('../../src/streams/turn.js');

const completeTurn = s => {
  s.send({type: 'TASK_SELECTED', task: 'take-x-wood'});
  s.send({type: 'TASK_COMPLETED', task: 'take-x-wood'});
  s.send({type: 'TASK_SELECTED', task: 'take-x-clay'});
  s.send({type: 'TASK_COMPLETED', task: 'take-x-clay'});
}

const completeHarvest = s => {
  s.send({type: 'HARVEST_COMPLETED'});
};

test('turn$ emits for each turn event', t => {
  const s = interpret(machine());
  const turns = [];
  const stream$ = SUT(s);

  stream$.subscribe(t => turns.push(t));
  s.start();

  // stage 1
  completeTurn(s);     // turn 1
  completeTurn(s);     // turn 2
  completeTurn(s);     // turn 3
  completeTurn(s);     // turn 4
  completeHarvest(s);
  // stage 2
  completeTurn(s);     // turn 5
  completeTurn(s);     // turn 6
  completeTurn(s);     // turn 7
  completeHarvest(s);
  // stage 3
  completeTurn(s);     // turn 8
  completeTurn(s);     // turn 9
  completeHarvest(s);
  // stage 4
  completeTurn(s);     // turn 10
  completeTurn(s);     // turn 11
  completeHarvest(s);
  // stage 5
  completeTurn(s);     // turn 12
  completeTurn(s);     // turn 13
  completeHarvest(s);
  // stage 6
  completeTurn(s);     // turn 14
  completeHarvest(s);

  t.same(turns, [ {turn: 1 , stage: 1, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 1 , stage: 1, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 2 , stage: 1, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 2 , stage: 1, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 3 , stage: 1, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 3 , stage: 1, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 4 , stage: 1, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 4 , stage: 1, workers: 2, workersLeft: 0, harvest: true }
                , {turn: 5 , stage: 2, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 5 , stage: 2, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 6 , stage: 2, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 6 , stage: 2, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 7 , stage: 2, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 7 , stage: 2, workers: 2, workersLeft: 0, harvest: true }
                , {turn: 8 , stage: 3, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 8 , stage: 3, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 9 , stage: 3, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 9 , stage: 3, workers: 2, workersLeft: 0, harvest: true }
                , {turn: 10, stage: 4, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 10, stage: 4, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 11, stage: 4, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 11, stage: 4, workers: 2, workersLeft: 0, harvest: true }
                , {turn: 12, stage: 5, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 12, stage: 5, workers: 2, workersLeft: 0, harvest: false}
                , {turn: 13, stage: 5, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 13, stage: 5, workers: 2, workersLeft: 0, harvest: true }
                , {turn: 14, stage: 6, workers: 2, workersLeft: 1, harvest: false}
                , {turn: 14, stage: 6, workers: 2, workersLeft: 0, harvest: true }]);
  t.end();
});
