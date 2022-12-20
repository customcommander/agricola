import test from 'tape';
import {distinct, filter, from, map, take, tap, toArray} from 'rxjs';
import {waitFor} from 'xstate/lib/waitFor.js';

import sut from '../src/xstate/main.js';
import task from '../src/xstate/observables/task.js';

test('sequence', (t) => {
  const [game, start] = sut();

  const state$ = from(game).pipe(
    filter(st => st.matches('work.init') === false),
    map(st => [st.matches('work.main') ? 'work' : st.value, st.context.turn, st.context.stage]),
    distinct(arr => arr.join('/')),
    toArray(),
  );

  return new Promise(async res => {
    state$.subscribe({
      next(actual) {
        t.same(actual, [ [      'setup',  0, 0]
                       , [       'work',  1, 1]
                       , [       'work',  2, 1]
                       , [       'work',  3, 1]
                       , [       'work',  4, 1]
                       , [    'harvest',  4, 1]
                       , [       'work',  5, 2]
                       , [       'work',  6, 2]
                       , [       'work',  7, 2]
                       , [    'harvest',  7, 2]
                       , [       'work',  8, 3]
                       , [       'work',  9, 3]
                       , [    'harvest',  9, 3]
                       , [       'work', 10, 4]
                       , [       'work', 11, 4]
                       , [    'harvest', 11, 4]
                       , [       'work', 12, 5]
                       , [       'work', 13, 5]
                       , [    'harvest', 13, 5]
                       , [       'work', 14, 6]
                       , [    'harvest', 14, 6]
                       , ['end_of_game', 14, 6]]);
      },
      complete() {
        res();
      }
    });

    start();

    // stage 1
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 2
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 3
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 4
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 5
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 6
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
  });
});

test('preset tasks order', t => {
  const [game, start] = sut();
  const task$ = task(from(game)).pipe(
    filter(t => t.available),
    map(t => t.id),
    take(14),
    toArray()
  );

  return new Promise(async res => {
    task$.subscribe({
      next(actual) {
        t.same(actual, [2, 1, 3, 4, 6, 5, 7, 8, 9, 11, 10, 12, 13, 14]);
      },
      complete() {
        res();
      }
    });

    start([{type: 'SETUP_GAME', tasks_order: [2, 1, 3, 4, 6, 5, 7, 8, 9, 11, 10, 12, 13, 14]}]);

    // stage 1
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 2
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 3
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 4
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 5
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);

    // stage 6
    await waitFor(game, state => state.matches('work.main'));
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
    game.send([{type: 'TASK_SELECTED'}, {type: 'TASK_DONE'}]);
  });
});
