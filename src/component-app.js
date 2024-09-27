import {LitElement, css, html} from 'lit';

import {
  Subject,
  buffer,
  concatMap,
  delay,
  fromEvent,
  fromEventPattern,
  map,
  of,
  share,
  takeUntil,
} from 'rxjs';

import {
  early_exit$,
  error$,
  farmyard$,
  selection$,
  supply$,
  tasks$,
  turn$,
} from './observables.js';

import {ContextProvider} from '@lit/context';

import messages from './messages_en.yaml';

import game from './game.js';

import './component-error.js';
import './component-infobar.js';
import './component-supply.js';
import './component-tasks.js';
import './component-secondary-tasks.js';
import './component-farmyard.js';
import './component-footer.js';

class App extends LitElement {
  static styles = css`
    :host {
      display: grid;
      width: 100vw;
      height: 100vh;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 3rem 1fr 1fr 3rem;
      grid-template-areas:
        "info    supply"
        "actions farm"
        "actions mmoc"
        "footer  err";
    }

    agricola-infobar {
      grid-area: info;
    }

    agricola-supply {
      grid-area: supply;
    }

    agricola-tasks {
      grid-area: actions;
      overflow: scroll;
    }

    agricola-secondary-tasks {
      grid-area: mmoc;
      overflow: scroll;
    }

    agricola-farmyard {
      grid-area: farm;
    }

    agricola-error {
      grid-area: err;
    }

    agricola-footer {
      grid-area: footer;
    }
  `;

  #messages;

  #early_exit;
  #error;
  #farmyard;
  #selection;
  #supply;
  #tasks;
  #turn;

  constructor() {
    super();

    const provide = (context) => {
      return new ContextProvider(this, {context});
    };

    this.#messages = provide('messages');

    this.#early_exit = provide('early_exit');
    this.#error = provide('error');
    this.#farmyard = provide('farmyard');
    this.#selection = provide('selection');
    this.#supply = provide('supply');
    this.#tasks = provide('tasks');
    this.#turn = provide('turn');

    this.#messages.setValue(messages);

    /*
      When this emits it means that the player
      has decided to restart the game and
      replay some of their moves.

      This observable is used as a notification
      mechanism for several other observables
      so the emission needs to be multicasted.

      TODO: rename `game.restart`
     */
    this._restart$ = fromEvent(this, 'restart-game').pipe(
      map(() => true),
      share()
    );

    /*

      There are two sources of XState events.

      1. From playing the game.

      The player moves are dispatched through a dedicated
      CustomEvent channel `player.move` (TODO: rename).

      This observable subscribes to that channel.

      Note: any component can (and must) use that channel
      but only this one has access to the game engine
      where these events are ultimately forwarded to.

      2. From replaying the moves.

      We also buffer all events until a player decides
      to restart the game.

      When this happens we resend each of these events
      back to this observable.

     */
    this._event$ = (new Subject).pipe(
      concatMap(ev => {
        const {replay, ...detail} = ev;
        const obs = of(detail);
        // Small delay between replay events so we can see what's going on.
        return replay ? obs.pipe(delay(1000)) : obs;
      })
    );

    // TODO: rename to `player.move`.
    //       allow to unsubscribe from it.
    fromEvent(this, 'dispatch')
      .pipe(map(ev => ev.detail))
      .subscribe(this._event$);


    /*

      This emits only after a player has decided
      to restart the game and it emits an array
      with all the moves a player has made so far.

      Notes:

      1. A player can restart the game as many times
         as they want, whenever they want.

      2. As `_event$` is multicast, buffering events
         does not prevent them from being forwarded
         to the game engine.

      3. As buffered events are sent back to `_event$`,
         they will automatically be buffered again,
         which is definitely what we want.

     */
    this._replay$ = this._event$.pipe(
      buffer(this._restart$)
    );

    /*

      At this point we do not know whether it
      is a new player move or a replay of a
      previous move.

      The only thing we know is that anything
      that `_event$` emits has to be forwarded
      to the game engine.

     */
    this._event$.subscribe(ev => {
      this._game.send(ev);
    });

    /*

      At this point we need to restart the game
      from scratch and replay each player move
      one by one.

      TODO:
      The player should not be allowed to
      interact with the game until the events
      are all replayed.

     */
    this._replay$.subscribe(evs => {
      this._game.stop();
      this._init();
      evs.forEach(ev => {
        this._event$.next({replay: true, ...ev});
      });
    });
  }

  _init() {
    this._game = game();

    this._game$ = fromEventPattern(
      (handler) => this._game.subscribe(handler),
      (_, subscription) => subscription.unsubscribe()
    ).pipe(
      takeUntil(this._restart$),
      share()
    );

    const observe = (fn, cb) => {
      fn(this._game$).subscribe(cb);
    };

    observe(early_exit$, early_exit => this.#early_exit.setValue(early_exit));
    observe(error$, error => this.#error.setValue(error));
    observe(farmyard$, farmyard => this.#farmyard.setValue(farmyard));
    observe(selection$, selection => this.#selection.setValue(selection));
    observe(supply$, supply => this.#supply.setValue(supply));
    observe(tasks$, tasks => this.#tasks.setValue(tasks));
    observe(turn$, turn => this.#turn.setValue(turn));

    this._game.start();
  }

  connectedCallback() {
    super.connectedCallback();
    this._init();
  }

  render() {
    return html`
      <agricola-error></agricola-error>
      <agricola-infobar></agricola-infobar>
      <agricola-supply></agricola-supply>
      <agricola-tasks></agricola-tasks>
      <agricola-secondary-tasks></agricola-secondary-tasks>
      <agricola-farmyard></agricola-farmyard>
      <agricola-footer></agricola-footer>
    `;
  }
}

customElements.define('agricola-app', App);

