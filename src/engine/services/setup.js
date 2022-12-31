import {assign, forwardTo, spawn} from "xstate";
import {assign as i_assign} from '@xstate/immer';
import {id} from "../utils.js";

const service = (callback, receive) => {

  receive(({type, ...payload}) => {
    if (type == 'SETUP_GAME') {
      callback({type: 'SETUP_DONE', ...payload});
    }
  });

  return function noop(){};
};

export const start_setup_service = assign({
  setup_service: () => spawn(service)
});

export const forward_to_setup_service = forwardTo(ctx => ctx.setup_service);

export const setup_done = i_assign((ctx, {rounds}) => {
  ctx.tasks = {
    ...ctx.tasks,
    ...Object.assign(
      ...rounds.map((round, i) => ({
        [round]: {
          type: 'turn-based',
          turn: i+1,
          change_id: id(),
          available: false,
          disabled: null,
          selected: false
        }
      }))
    )
  };
});
