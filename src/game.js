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
    
    'game-response':
    sendTo(
      ({event, system}) => system.get(event.reply_to),
      ({event: {query, ...ev}, context}) => ({
        type: 'game.response',
        response: query({event: ev}, context)
      })
    ),

    'error-dismiss':
    assign({error: null}),
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
    },

    'is-feeding-task?':
    ({context, event}) => {
      const {task_id} = event;
      return context.tasks[task_id].feeding === true;
    },

    'is-main-feeding-task?':
    ({context, event}) => {
      const {task_id} = event;
      return task_id === '002';
    }
  }
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
        food:      0,
        grain:     0,
        vegetable: 0,
        wood:      0,
        clay:      0,
        reed:      0,
        stone:     0
      },
      house_type: 'wooden-hut',
      farmyard: {
        A1:                 null, A2: null, A3: null, A4: null, A5: null,
        B1: {type: 'wooden-hut'}, B2: null, B3: null, B4: null, B5: null,
        C1: {type: 'wooden-hut'}, C2: null, C3: null, C4: null, C5: null
      },
      tasks: {
        '001': {},
        '002': {feeding: true},

        101: {selected: false             },
        102: {selected: false             },
        103: {selected: false             }, // take grain
        104: {selected: false             },
        105: {selected: false             },
        106: {selected: false             },
        107: {selected: false, quantity: 2}, // wood
        108: {selected: false, quantity: 1}, // clay
        109: {selected: false, quantity: 1}, // reed
        110: {selected: false, quantity: 1}, // fishing

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
              turn:      ro[0][3],
              hidden:    ro[0][3] > turn},

        // Stage 2

        // Family growth
        115: {selected:  false,
              turn:      ro[1][0],
              hidden:    ro[1][0] > turn},

        // Take x Stone
        116: {selected:  false,
              quantity:  0,
              turn:      ro[1][1],
              hidden:    ro[1][1] > turn},

        // After Renovation also Major Improvement
        117: {selected:  false,
              turn:      ro[1][2],
              hidden:    ro[1][2] > turn},

        // Stage 3

        // Take x Vegetable
        118: {selected:  false,
              turn:      ro[2][0],
              hidden:    ro[2][0] > turn},

        // Take {qty} Wild Boar
        119: {selected:  false,
              quantity:  0,
              turn:      ro[2][1],
              hidden:    ro[2][1] > turn}


      },
      error: null,
      early_exit: null,

      /*

        The `on_*` properties are list of tasks ids
        to be contacted when the game reaches the
        corresponding state.

      */
      on_replenish: ['107','108','109','110','114', '116', '119'],
      on_fields:    ['001'],
    };
  },
  "initial": "init",
  "states": {
    "init": {
      invoke: {
        src: 'task-loader',
        input: ({context}) => Object.keys(context.tasks),
        onDone: {
          target: 'work',
          actions: 'task-loader-done'
        }
      }
    },
    'new-turn': {
      initial: 'init-new-turn',
      states: {
        'init-new-turn': {
          always: {
            actions: 'setup-new-turn',
            target: 'replenish'
          }
        },
        replenish: {
          invoke: {
            src: 'dispatcher',
            systemId: 'dispatcher',
            input: ({context}) => {
              const {on_replenish: notify, tasks} = context;

              const jobs = notify.reduce((acc, task_id) => {
                const available = tasks[task_id].hidden !== true;
                // Ignore tasks not yet available
                if (available) {
                  acc.push({task_id, ev: 'task.replenish'});
                }
                return acc;
              }, []);

              return {jobs};
            },
            onDone: {
              target: 'done'
            }
          }
        },
        done: {
          type: 'final'
        }
      },
      onDone: {
        target: 'work'
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
          invoke: {
            src: 'dispatcher',
            systemId: 'dispatcher',
            input: ({context}) => {
              const {on_fields: notify} = context;
              const jobs = notify.map(task_id => ({task_id, ev: 'task.fields'}));
              return {jobs};
            },
            onDone: {
              target: 'feed'
            }
          },
        },
        feed: {
          on: {
            'task.selected': {
              guard: 'is-feeding-task?',
              actions: 'task-forward'
            },
            'task.completed': {
              guard: 'is-main-feeding-task?',
              target: 'breed'
            }
          }
        },
        breed: {
          always: {
            target: 'done',
            actions: () => console.log('breed: todo')
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
    'game.query': {
      'actions': 'game-response'
    },
    "error.dismiss": {
      "actions": "error-dismiss"
    },
    'task.exit': {
      actions: 'task-forward'
    }
  }
});

export default function () {
  return createActor(machine, {systemId: 'gamesys'});
}

