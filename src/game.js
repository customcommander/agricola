import {
  assign,
  createActor,
  enqueueActions,
  fromPromise,
  sendTo,
  setup,
  spawnChild,
} from 'xstate';

import {
  produce
} from 'immer';

import dispatcher from './dispatcher.js';

const src = setup({
  actors: {
    'task-loader':
    fromPromise(({input: tasks}) =>
      Promise.all(tasks.map(id =>
        import(/* webpackInclude: /\d+.js$/ */`./task-${id}.js`)
          .then(task => [id, task.default])))),

    dispatcher
  },

  actions: {
    'init-dispatcher':
    spawnChild('dispatcher', {systemId: 'dispatcher'}),

    'setup-new-turn':
    assign(({context}) => produce(context, draft => {
      draft.turn += 1;
      draft.workers = draft.family;
      Object.keys(draft.tasks).forEach(id => {
        if (draft.tasks[id].selected === true) {
          draft.tasks[id].selected = false;
        }
      });
      return draft;
    })),

    'task-loader-done':
    enqueueActions(({enqueue, event}) => {
      for (let [id, task] of event.output) {
        enqueue.spawnChild(task, {systemId: `task-${id}`});
      }
    }),

    'task-start':
    assign(({context, event}) => produce(context, draft => {
      const {task_id} = event;
      draft.workers -= 1;
      draft.tasks[event.task_id].selected = true;
      draft.early_exit = false;
      return draft;
    })),

    'task-aborted':
    assign(({context, event}) => produce(context, draft => {
      const {err, task_id} = event;
      draft.workers += 1;
      draft.tasks[task_id].selected = false;
      draft.error = err;
      return draft;
    })),
 
    'task-forward':
    sendTo(({system, event}) => system.get(`task-${event.task_id}`),
           ({context, event}) => ({...event, game_context: context})),

    'game-update':
    enqueueActions(({enqueue, event}) => {

      enqueue.assign(({context}) => {
        return event.updater(context);
      });

      if (event.reply_to) {
        const task_id = event.reply_to;

        enqueue.sendTo(
          ({system}) => system.get(`task-${task_id}`),
          ({context}) => ({
            type: 'game.updated',
            game_context: context
          })
        );
      }
    }),

    'error-dismiss':
    assign({error: null}),

    'dispatch':
    sendTo(({system}) => system.get('dispatcher'),
           (_, params) => ({
             type: 'dispatch',
             jobs: params
           }))
  },

  guards: {
    'task-available?': ({context, event}) => {
      const {task_id} = event;
      return context.tasks[task_id].selected === false;
    },
    has_workers: ({context}) => {
      const check = context.workers > 0;
      return check;
    },

    is_harvest_time: ({context}) => {
      const {turn} = context;
      const check = [4, 7, 9, 11, 13, 14].includes(turn);
      console.log(`is harvest time? ${turn} ${check}`);
      return check;
    },

    is_last_turn: ({context}) => {
      const {turn} = context;
      const check = turn === 14;
      console.log(`is last turn? ${turn} ${check}`);
      return check;
    }
  }
});

const dispatcher_params =
  (channels) => ({context}) => channels.flatMap(ch => {
    let ids;
    ids = Object.entries(context.tasks);
    ids = ids.filter(([, t]) => t[ch] === true);
    return ids.map(([id]) => ({ev: `task.${ch}`, task_id: id}));
  });

const machine = src.createMachine({
  "context": {
    "turn": 0,
    "family": 2,
    "workers": 2,
    "supply": {
      "food": 0,
      "wood": 0,
      "clay": 0,
      "reed": 0,
      stone: 0
    },
    house_type: 'wooden_hut',
    "farmyard": {
      "A1": null,
      "A2": null,
      "A3": null,
      "A4": null,
      "A5": null,
      "B1": {
        "type": "wooden_hut"
      },
      "B2": null,
      "B3": null,
      "B4": null,
      "B5": null,
      "C1": {
        "type": "wooden_hut"
      },
      "C2": null,
      "C3": null,
      "C4": null,
      "C5": null
    },
    tasks: {
      101: {selected: false},
      104: {selected: false},
      107: {selected: false, quantity: 0, replenish: true},
      108: {selected: false, quantity: 0, replenish: true},
      109: {selected: false, quantity: 0, replenish: true},
      110: {selected: false, quantity: 0, replenish: true}
    },
    "error": null,
    early_exit: null
  },
  "initial": "init",
  "states": {
    "init": {
      "entry": "init-dispatcher",
      "invoke": {
        "src": "task-loader",
        input: ({context}) => Object.keys(context.tasks),
        "onDone": {
          "target": 'new-turn',
          "actions": "task-loader-done"
        }
      }
    },
    'new-turn': {
      entry: [
        'setup-new-turn',
        {
          type: 'dispatch',
          params: dispatcher_params(['reset',
                                     'replenish'])
        }
      ],
      on: {
        'dispatch.done': {
          target: 'work'
        }
      }
    },
    "work": {
      "initial": "select_task",
      "states": {
        "select_task": {
          "on": {
            "task.selected": {
              "target": "perform_task",
              "guard": "task-available?",
              "actions": [
                "task-start",
                "task-forward"
              ]
            }
          }
        },
        "perform_task": {
          "on": {
            "task.aborted": {
              "target": "select_task",
              "actions": "task-aborted"
            },
            "task.completed": [
              {
                "target": "select_task",
                "guard": "has_workers"
              },
              {
                "target": "done"
              }
            ]
          }
        },
        "done": {
          "type": "final"
        }
      },
      "onDone": [
        {
          "target": "harvest",
          "guard": "is_harvest_time"
        },
        {
          "target": "new-turn"
        }
      ]
    },
    "harvest": {
      "initial": "fields",
      "states": {
        "fields": {
          "after": {
            "200": "feed"
          }
        },
        "feed": {
          "after": {
            "200": "breed"
          }
        },
        "breed": {
          "after": {
            "200": "done"
          }
        },
        "done": {
          "type": "final"
        }
      },
      "onDone": [
        {
          "target": "game_over",
          "guard": "is_last_turn"
        },
        {
          "target": "new-turn"
        }
      ]
    },
    "game_over": {
      "type": "final"
    }
  },
  "on": {
    "space.selected": {
      "actions": "task-forward"
    },
    "game.update": {
      "actions": "game-update"
    },
    "error.dismiss": {
      "actions": "error-dismiss"
    },
    'task.exit': {
      actions: 'task-forward'
    }
  }
});

export default createActor(machine, {
  systemId: 'gamesys'
});

