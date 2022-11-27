import test from 'tape';
import {from} from 'rxjs';

import sut from '../src/xstate/main.js';

test('sequence', (t) => {
  const game = sut();
  const state$ = from(game);
  const actual = [];
  state$.subscribe({
    next(state) {
      actual.push([state.value, state.context.turn, state.context.stage]);
    },
    complete() {
      t.same(actual, [ [       'init',  0, 0]
                     , [       'work',  1, 1]
                     , [       'work',  2, 1]
                     , [       'work',  3, 1]
                     , [       'work',  4, 1]
                     , [       'feed',  4, 1]
                     , [       'work',  5, 2]
                     , [       'work',  6, 2]
                     , [       'work',  7, 2]
                     , [       'feed',  7, 2]
                     , [       'work',  8, 3]
                     , [       'work',  9, 3]
                     , [       'feed',  9, 3]
                     , [       'work', 10, 4]
                     , [       'work', 11, 4]
                     , [       'feed', 11, 4]
                     , [       'work', 12, 5]
                     , [       'work', 13, 5]
                     , [       'feed', 13, 5]
                     , [       'work', 14, 6]
                     , [       'feed', 14, 6]
                     , ['end_of_game', 14, 6]]);
      t.end();
    }
  })
});
