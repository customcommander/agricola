import {
  Subject,
  distinct,
  distinctUntilChanged,
  fromEventPattern,
  map,
  multicast,
  refCount,
} from 'rxjs';

import deep_equal from 'fast-deep-equal';

import {empty_spaces} from './util-farmyard.js';

export const observe_game = game =>
  fromEventPattern(
    (handler) => game.subscribe(handler),
    (_, subscription) => subscription.unsubscribe()
  )
  .pipe(
    multicast(new Subject()),
    refCount()
  );

export const turn$ = snapshot$ => snapshot$.pipe(
  map(snapshot => snapshot.context.turn),
  distinct()
);

export const tasks$ = snapshot$ => snapshot$.pipe(
  map(snapshot => snapshot.context.tasks),
  distinctUntilChanged(deep_equal)
);

export const supply$ = snapshot$ => snapshot$.pipe(
  map(snapshot => snapshot.context.supply),
  distinctUntilChanged(deep_equal)
);

export const farmyard$ = snapshot$ => snapshot$.pipe(
  map(snapshot => snapshot.context.farmyard),
  distinctUntilChanged(deep_equal)
);

export const selection$ = snapshot$ => snapshot$.pipe(
  map(({context: {tasks, farmyard}}) => {
    const task_id = [104].find(id => tasks[id].selected && !tasks[id].done);

    if (!task_id) {
      return null;
    }

    if (task_id == 104) {
      return empty_spaces(farmyard).map(space_id => ({
        task_id,
        space_id,
        plow: true
      }));
    }
  }),

  distinctUntilChanged(deep_equal)
);

export const error$ = snapshot$ => snapshot$.pipe(
  map(({context: {error}}) => error),
  distinctUntilChanged()
);

