import {
  sendTo,
  setup
} from 'xstate';

const src = setup({
  actions: {
    abort:
    sendTo(({system}) => system.get('gamesys'),
           () => ({
             f:1,
           }))
  }
});

export default src.createMachine({
  on: {
    'task.selected': [
      {target: 'xx', guard: 'eligible?'},
      {actions: 'abort'}
    ]
  }
});


export const abort = () => "NOT_ENOUGH_RESOURCES";
