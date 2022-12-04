import {assign, createMachine, sendParent, spawn} from 'xstate';

const machine = () => createMachine({
  context: {},
  initial: 'init',
  states: {
    init: {
      type: 'final',
      entry: 'work_done'
    }
  }
}, {
  actions: {
    work_done: sendParent({type: 'WORK_DONE'})
  }
});

export const start_work_service = assign({
  WorkService: () => spawn(machine())
});
