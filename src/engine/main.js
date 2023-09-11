import { interpret
       , createMachine
       , raise
       , assign
       } from 'xstate';

const def =
  { predictableActionArguments: true
  , context:
    { round: 0 }
  , initial: 'setup'
  , states:
    { setup:
      { entry: raise('SETUP_DONE')
      , on:
        { SETUP_DONE:
          { target: 'new_round' }}}
    , new_round:
      { entry: 'new_round'
      , on:
        { WORK:
          { target: 'work' }}}
    , work:
      { on:
        { WORK_DONE:
          [ { target: 'new_round', cond: 'not_last_round' }
          , { target: 'end_of_game' }]}}
    , end_of_game:
      { type: 'final' }}};

const impl =
  { guards:
    { not_last_round:
        ctx => ctx.round < 16 }
  , actions:
    { new_round:
        assign({ round: ctx => ctx.round + 1 }) }};

export default function init() {
  return interpret(createMachine(def, impl));
}

