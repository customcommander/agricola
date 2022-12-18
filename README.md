[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

# Agricola

A deep dive exploration of reactive programming combining state machines ([XState][]) and observables ([RxJS][]) with a web-component-based ([Lit][]) single page application. In the end I hope to build the solo version of the popular board game.

## Architecture

### Overview

The main state machine is kept relatively simple but each state spawns one or more services.

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

[XState]: https://xstate.js.org/
[RxJS]: https://rxjs.dev/
[Lit]: https://lit.dev/