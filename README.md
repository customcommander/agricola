[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

# Agricola

A deep dive exploration of reactive programming combining state machines ([XState][]) and observables ([RxJS][]) with a web-component-based ([Lit][]) single page application. In the end I hope to build the solo version of the popular board game.

## Architecture

### Boundaries

The game engine is managed by a single state machine split into multiple services.

We can produce a diverse range of observables from the state machine. The user interface components subscribe to these observables.

Even though the user interface is not allowed to subscribe directly to the state machine, it can however trigger events that will ultimately lead to state changes and new data being emitted by the observables.

In all circumstances data flows in **one and only one** direction.

```mermaid
flowchart LR
GE(((Game Engine)))    -- produces -->
O(((Observables)))     --     feed -->
UI(((User Interface))) -- triggers --> GE
```

### States Machines

#### Overview

The main state machine is kept relatively simple (YMMV) as each state is expected to spawn one or more services.

```mermaid
stateDiagram-v2
    state after_harvest <<choice>>
    state after_work <<choice>>

    [*] --> setup

    note left of setup
    All the things we need to do
    before we can start the game.
    end note

    setup --> setup : SETUP_GAME
    setup --> work  : SETUP_DONE

    note left of work
    Keep working until we reach
    the end of a stage (i.e. harvest time)
    end note

    work --> after_work : WORK_DONE
    after_work --> work : not_harvest
    after_work --> harvest

    harvest --> after_harvest: HARVEST_DONE

    after_harvest --> work : not_end_of_game
    after_harvest --> end_of_game
    end_of_game --> [*]
```

#### Work Service

The **Work Service** is given the number of workers for the active turn and remains active until all the workers are placed on the board.

```mermaid
stateDiagram-v2
    state after_perform <<choice>>

    [*] --> init
    init --> select
    select --> perform: TASK_SELECTED
    perform --> select: TASK_CANCELLED
    perform --> after_perform: TASK_DONE
    after_perform --> select: workers_left
    after_perform --> done
    done --> [*]
```

[XState]: https://xstate.js.org/
[RxJS]: https://rxjs.dev/
[Lit]: https://lit.dev/