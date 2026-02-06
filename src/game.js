import {
  assign,
  createActor,
  enqueueActions,
  sendTo,
  setup,
  spawnChild,
} from 'xstate';

import {
  produce
} from 'immer';

import bootstrap from './bootstrap.js';
import dispatcher from './dispatcher.js';

const src = setup({
  actors: {
    dispatcher
  },

  actions: {
    bootstrap:
    spawnChild(bootstrap),

    'bootstrap-finalize':
    assign(({context, event}) => produce(context, draft => {
      draft.tasks = event.data;
      return draft;
    })),

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

    'task-start':
    assign(({context, event}) => produce(context, draft => {
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
           ({event}) => ({...event, reply_to: 'gamesys'})),

    'task-cleanup': assign({
      selection: null,
      early_exit: null
    }),

    'game-update':
    enqueueActions(({enqueue, event, system}) => {
      enqueue.assign(({context}) => {
        return event.updater(context);
      });
      enqueue.sendTo(system.get(event.reply_to), {
        type: 'game.updated',
      });
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
    }
  }
});

const machine = src.createMachine({
  context: () => ({
    turn: 1,
    family: 2,
    workers: 2,
    supply: {
      food: 0,
      grain: 0,
      vegetable: 0,
      wood: 0,
      clay: 0,
      reed: 0,
      stone: 0
    },
    house_type: 'wooden-hut',
    farmyard: {
      A1:                   null, A2: null, A3: null, A4: null, A5: null,
      B1: { type: 'wooden-hut' }, B2: null, B3: null, B4: null, B5: null,
      C1: { type: 'wooden-hut' }, C2: null, C3: null, C4: null, C5: null
    },
    // The data for each task is fetched during the bootstrap phase.
    tasks: {},
    error: null,
    early_exit: null,
  }),
  "initial": "init",
  "states": {
    "init": {
      entry: 'bootstrap',
      on: {
        'boot.success': {
          target: 'work',
          actions: 'bootstrap-finalize'
        },
        'boot.failure': {
          target: 'failure'
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
              const {tasks} = context;
              const entries = Object.entries(tasks);
              const jobs = entries.reduce((acc, [task_id, task]) => {
                const replenish = task.replenish === true;
                const available = task.hidden !== true;
                if (replenish && available) {
                  acc.push({task_id, type: 'task.replenish'});
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
          },
          exit: 'task-cleanup'
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
              const entries = Object.entries(context.tasks);
              const jobs = entries.reduce(
                (acc, [task_id, def]) => 
                  def.fields === true
                    ? acc.concat({task_id, type: 'task.fields'})
                    : acc
                , []);
              return {jobs};
            },
            onDone: {
              target: 'feed'
            }
          },
        },
        feed: {
          on: {
            'task.feed': {
              actions: 'task-forward'
            },
            'task.completed': {
              target: 'breed',
            }
          }
        },
        breed: {
          always: {
            target: 'done',
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
    },
    failure: {
      type: 'final',
      entry: ({event}) => {
        console.log('BOOT FAILED', event);
      }
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

