import {createMachine} from 'xstate';

export default createMachine({
  context: {},
  initial: 'init',
  states: {
    init: {
      type: 'final'
    }
  }
});
