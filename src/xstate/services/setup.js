import {assign, forwardTo, spawn} from "xstate";
import {assign as i_assign} from '@xstate/immer';

// TODO: simulate a bit of delay whilst setting up the game.
const service = (callback, receive) => {

  receive(e => {
    if (e.type == 'SETUP_GAME') {
      setTimeout(() => {
        callback({type: 'SETUP_DONE', tasks_order: e.tasks_order});
      }, 50);
    }
  });

  return function noop(){};
};

export const start_setup_service = assign({
  SetupService: () => spawn(service)
});

export const forward_to_setup_service = forwardTo(ctx => ctx.SetupService);

export const setup_done = i_assign((ctx, e) => {
  ctx.tasks_order = e.tasks_order;
});
