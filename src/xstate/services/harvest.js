import {assign, createMachine, forwardTo, sendParent, spawn} from "xstate";
import { stop } from "xstate/lib/actions.js";

const machine = () => createMachine({
  initial: 'init',
  states: {
    init: {
      entry: ['notify_startup'],
      always: {
        target: 'fields'
      }
    },
    fields: {
      on: {
        HARVEST_FIELDS_DONE: {
          target: 'feed'
        }
      }
    },
    feed: {
      on: {
        HARVEST_FEED_DONE: {
          target: 'breed'
        }
      }
    },
    breed: {
      on: {
        HARVEST_BREED_DONE: {
          target: 'done'
        }
      }
    },
    done: {
      type: 'final',
      entry: ['notify_shutdown']
    }
  }
}, {
  actions:{
    notify_startup: sendParent({type: 'HARVEST_SERVICE_STARTUP'}),
    notify_shutdown: sendParent({type: 'HARVEST_SERVICE_SHUTDOWN'})
  }
});

export const start_harvest_service = assign({
  harvest_service: () => spawn(machine())
});

export const stop_harvest_service = stop(ctx => ctx.harvest_service);

export const forward_to_harvest_service = forwardTo(ctx => ctx.harvest_service);
