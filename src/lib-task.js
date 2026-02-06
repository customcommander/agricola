import {
  produce
} from "immer";

import {
  enqueueActions,
  log,
  sendTo,
  setup,
} from "xstate";


const game = ({system}) => system.get('gamesys');

// Check, select & execute
const micro_task = setup({
  actions: {
    'task-check': sendTo(game, ({context}) => ({
      type: 'game.query',
      query: context.check,
      reply_to: `task-${context.task_id}`
    })),

    'task-input': enqueueActions(({ enqueue, context }) => {
      // This means we already had a first run and the task is in a "repeat loop".
      // In this case we display an "Exit button" to allow the player to break out.
      if (context.run === 1) {
        enqueue.sendTo(game, {
          type: 'game.update',
          updater: produce(game => {
            game.early_exit = context.task_id;
            return game;
          })
        });
      }
      enqueue.sendTo(game, {
        type: 'game.update',
        updater: produce(context.select.bind(null, {
          task_id: context.task_id
        })),
      });
    }),

    'task-execute': enqueueActions(({enqueue, event, context}) => {
      // We need to keep track of how many times a task run.
      // Most tasks can't be repeated and will stop at run=1.
      enqueue.assign({
        run: ({ context }) => context.run + 1
      });
      enqueue.sendTo(game, {
        type: 'game.update',
        updater: produce(context.execute.bind(null, {
          task_id: context.task_id,
          event
        })),
        reply_to: `task-${context.task_id}`,
      });
    }),

    'task-abort': sendTo(
      ({context, system}) => system.get(context.reply_to),
      ({context, event}) => ({
        type: 'task.aborted',
        task_id: context.task_id,
        err: event.response
      })),

    'task-complete': sendTo(
      ({context, system}) => system.get(context.reply_to),
      ({context}) => ({
        type: 'task.completed',
        task_id: context.task_id
      }))
  },
  guards: {
    'has-check?': ({context}) => {
      return typeof context.check === 'function';
    },
    'check->select?': ({context, event}) => {
      return event.response === true && typeof context.select === 'function';
    },
    'check->execute?': ({event}) => {
      return event.response === true;
    },
    'check->abort?': ({context, event}) => {
      return event.response !== true && context.run === 0;
    },
    'can-repeat?': ({context}) => {
      return context.repeat === true;
    }
  }
}).createMachine({
  context: ({ input }) => {
    const {
      task_id,
      reply_to,
      repeat = false,
      check,
      select,
      execute
    } = input;

    return {
      task_id,
      reply_to,
      run: 0,
      abort: null,
      repeat,
      check,
      select,
      execute,
    };
  },
  initial: 'boot',
  states: {
    boot: {
      always: [
        {
          guard: 'has-check?',
          target: 'check'
        },
        {
          target: 'execute'
        }
      ]
    },
    check: {
      entry: 'task-check',
      on: {
        'game.response': [
          {
            guard: 'check->abort?',
            target: 'exit',
            actions: 'task-abort'
          },
          {
            guard: 'check->select?',
            target: 'select'
          },
          {
            guard: 'check->execute?',
            target: 'execute'
          },
          {
            target: 'exit',
            actions: 'task-complete'
          }
        ]
      }
    },
    select: {
      entry: 'task-input',
      on: {
        'select.*': {
          target: 'execute'
        },
        'task.exit': {
          target: 'exit',
          actions: 'task-complete'
        }
      }
    },
    execute: {
      entry: 'task-execute',
      on: {
        'game.updated': [
          {
            guard: 'can-repeat?',
            target: 'check'
          },
          {
            target: 'exit',
            actions: 'task-complete'
          }
        ]
      }
    },
    exit: {
      type: 'final',
    }
  }
});

export default setup({
  actors: {
    'micro-task': micro_task
  },

  actions: {
    log_init: log(({context}) => `task ${context.task_id} loaded.`),

    'forward': sendTo('task-runner', ({event}) => ({
      ...event
    }))
  }
}).createMachine({
  context: ({input: {task_id, ...micro_tasks}}) => ({
    task_id,
    ...micro_tasks,
  }),
  initial: 'init',
  states: {
    init: {
      always: {
        target: 'idle',
        actions: 'log_init'
      }
    },
    idle: {
      on: {
        'task.*': {
          target: 'running'
        }
      }
    },
    running: {
      invoke: {
        id: 'task-runner',
        src: 'micro-task',
        input: ({context, event}) => {     
          const task_type = event.type.split('.')[1];
          return {
            task_id: context.task_id,
            reply_to: event.reply_to,
            ...context[task_type]
          };
        },
        onDone: {
          target: 'idle',
        }
      },
      on: {
        'game.*': {
          actions: 'forward'
        },
        'select.*': {
          actions: 'forward'
        },
        'task.exit': {
          actions: 'forward'
        }
      }
    }
  }
});

