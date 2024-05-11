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

function is_current_task(task) {
  const {selected, done} = task;
  return selected && !done;
}

export const selection$ = snapshot$ => snapshot$.pipe(
  map(({context: {tasks, farmyard}}) => {
    const task_id = [104,107,108,109].find(id => tasks[id].selected && !tasks[id].done);
    const task = tasks[task_id];
    const no_selection = task_id != 104;

    if (no_selection) return null;

    return {
      task_id: 104,
      spaces: empty_spaces(farmyard)
    };
  }),

  distinctUntilChanged(deep_equal)
);
