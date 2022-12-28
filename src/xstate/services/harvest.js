import {assign, createMachine, sendParent, spawn} from "xstate";

const machine = () => createMachine({
  initial: 'init',
  states: {
    init: {
      entry: ['notify_ready'],
      after: {
        50: {
          target: 'done'
        }
      }
    },
    done: {
      type: 'final',
      entry: ['notify_done']
    }
  }
}, {
  actions:{
    notify_ready: sendParent({type: 'HARVEST_SERVICE_READY'}),
    notify_done: sendParent({type: 'HARVEST_DONE'})
  }
});

export const start_harvest_service = assign({
  harvest_service: () => spawn(machine())
});
