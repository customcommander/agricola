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

      const tasks = Object.entries(draft.tasks);

      tasks.forEach(([id, t]) => {
        if (t.selected === true) {
          draft.tasks[id].selected = false;
        }

        if (t.hidden === true && t.turn === draft.turn) {
          draft.tasks[id].hidden = false;
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
    ids = ids.filter(([, t]) => t[ch] === true && t.hidden !== true);
    return ids.map(([id]) => ({ev: `task.${ch}`, task_id: id}));
  });

const machine = src.createMachine({
  context: ({input}) => {
    const turn = input?.turn ?? 1;

    /*
      Running order.
      TODO: randomise order for stage 1 to 5
     */
    const ro = [[ 1,  2, 3, 4], // stage 1
                [ 5,  6, 7   ], // stage 2
                [ 8,  9      ], // stage 3
                [10, 11      ], // stage 4
                [12, 13      ], // stage 5
                [14          ]  // stage 6
               ];

    return {
      turn,
      family:  2,
      workers: 2,
      supply: {
        food:  0,
        grain: 0,
        wood:  0,
        clay:  0,
        reed:  0,
        stone: 0
      },
      house_type: 'wooden-hut',
      farmyard: {
        A1:                 null, A2: null, A3: null, A4: null, A5: null,
        B1: {type: 'wooden-hut'}, B2: null, B3: null, B4: null, B5: null,
        C1: {type: 'wooden-hut'}, C2: null, C3: null, C4: null, C5: null
      },
      tasks: {
        101: {selected: false                              },
        103: {selected: false                              }, // take grain
        104: {selected: false                              },
        105: {selected: false                              },
        107: {selected: false, quantity: 2, replenish: true}, // wood
        108: {selected: false, quantity: 1, replenish: true}, // clay
        109: {selected: false, quantity: 1, replenish: true}, // reed
        110: {selected: false, quantity: 1, replenish: true}, // fishing

        // Stage 1

        // Fences
        111: {selected:  false,
              turn:      ro[0][0],
              hidden:    ro[0][0] > turn},

        // Major Improvement
        112: {selected:  false,
              turn:      ro[0][1],
              hidden:    ro[0][1] > turn},

        // Sow and/or Bake bread
        113: {selected:  false,
              turn:      ro[0][2],
              hidden:    ro[0][2] > turn},

        // Take x Sheep
        114: {selected:  false,
              quantity:  0,
              replenish: true,
              turn:      ro[0][3],
              hidden:    ro[0][3] > turn},
      },
      error: null,
      early_exit: null
    };
  },
  "initial": "init",
  "states": {
    "init": {
      "entry": "init-dispatcher",
      "invoke": {
        "src": "task-loader",
        input: ({context}) => Object.keys(context.tasks),
        onDone: {
          target: 'work',
          actions: 'task-loader-done'
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
    'select.*': {
      actions: 'task-forward'
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

export default () => {
  return createActor(machine, {
    systemId: 'gamesys'
  });
}

