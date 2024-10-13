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
  feed_phase$,
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

    agricola-infobar         { grid-area: info   }
    agricola-supply          { grid-area: supply }
    agricola-tasks           { grid-area: actions; overflow: scroll }
    agricola-secondary-tasks { grid-area: mmoc   ; overflow: scroll }
    agricola-farmyard        { grid-area: farm   }
    agricola-error           { grid-area: err    }
    agricola-footer          { grid-area: footer }
  `;

  constructor() {
    super();

    this._provide('messages', messages);

    // These are values generated from the game engine
    // and made available to components at any level
    // via the Context API.
    this._provide('early_exit');
    this._provide('error');
    this._provide('farmyard');
    this._provide('feed_phase');
    this._provide('selection');
    this._provide('supply');
    this._provide('tasks');
    this._provide('turn');

    /*

      When this emits it means that the player
      has decided to restart the game and
      replay some of their moves.

      This observable is used as a notification
      mechanism for several other observables
      so the emission needs to be multicasted.

     */
    this._restart$ = fromEvent(this, 'game.restart').pipe(
      map(() => true),
      share()
    );

    /*

      There are two sources of XState events.

      1. From playing the game.

      The player moves are dispatched through a dedicated
      CustomEvent channel `player.move`.

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

    fromEvent(this, 'player.move')
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

  _provide(resource, val) {
    this[`_${resource}`] = new ContextProvider(this, {
      context: resource
    });
    if (val) {
      this[`_${resource}`].setValue(val);
    }
  }

  _observe(fn, resource) {
    fn(this._game$).subscribe(val => {
      this[`_${resource}`].setValue(val);
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

    this._observe(early_exit$, 'early_exit');
    this._observe(error$     , 'error'     );
    this._observe(farmyard$  , 'farmyard'  );
    this._observe(feed_phase$, 'feed_phase');
    this._observe(selection$ , 'selection' );
    this._observe(supply$    , 'supply'    );
    this._observe(tasks$     , 'tasks'     );
    this._observe(turn$      , 'turn'      );

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

