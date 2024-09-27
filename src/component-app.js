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

    this._restart$ = fromEvent(this, 'restart-game').pipe(share());

    this._event$ = (new Subject).pipe(
      concatMap(({replay, ...ev}) =>
        replay
          ? of(ev).pipe(delay(1000))
          : of(ev))
    );

    fromEvent(this, 'dispatch')
      .pipe(map(ev => ev.detail))
      .subscribe(this._event$);

    this._replay$ = this._event$.pipe(buffer(this._restart$));

    this._event$.subscribe(ev => {
      this._game.send(ev);
    });

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

