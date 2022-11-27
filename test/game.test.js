import test from 'tape';
import {waitFor} from 'xstate/lib/waitFor.js';

import sut from '../src/xstate/main.js';

test('sequence', async (t) => {
  const state_matches = expected => st => st.matches(expected);
  const prop_is = prop => expected => ({context}) => context[prop] === expected;
  const turn_is = prop_is('turn');
  const stage_is = prop_is('stage');

  const game = sut();

  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(1));
  await waitFor(game, stage_is(1));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(2));
  await waitFor(game, stage_is(1));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(3));
  await waitFor(game, stage_is(1));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(4));
  await waitFor(game, stage_is(1));

  game.send({type: 'HARVEST_TIME'});
  await waitFor(game, state_matches('feed'));

  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(5));
  await waitFor(game, stage_is(2));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(6));
  await waitFor(game, stage_is(2));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(7));
  await waitFor(game, stage_is(2));

  game.send({type: 'HARVEST_TIME'});
  await waitFor(game, state_matches('feed'));

  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(8));
  await waitFor(game, stage_is(3));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(9));
  await waitFor(game, stage_is(3));

  game.send({type: 'HARVEST_TIME'});
  await waitFor(game, state_matches('feed'));

  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(10));
  await waitFor(game, stage_is(4));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(11));
  await waitFor(game, stage_is(4));

  game.send({type: 'HARVEST_TIME'});
  await waitFor(game, state_matches('feed'));

  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(12));
  await waitFor(game, stage_is(5));

  game.send({type: 'NEW_TURN'});
  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(13));
  await waitFor(game, stage_is(5));

  game.send({type: 'HARVEST_TIME'});
  await waitFor(game, state_matches('feed'));

  await waitFor(game, state_matches('work'));
  await waitFor(game, turn_is(14));
  await waitFor(game, stage_is(6));

  game.send({type: 'HARVEST_TIME'});
  await waitFor(game, state_matches('feed'));

  await waitFor(game, state_matches('end_of_game'));

  t.pass('ok');
  t.end();
});
