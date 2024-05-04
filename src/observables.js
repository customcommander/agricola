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

