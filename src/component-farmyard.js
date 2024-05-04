import {LitElement, css, html} from 'lit';
import {map} from 'lit/directives/map.js';
import {ContextConsumer} from '@lit/context';

import './component-farmyard-room.js';

class FarmYard extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: 2px;
      grid-template-columns: repeat(5, 1fr);
      grid-template-areas:
        "A1 A2 A3 A4 A5"
        "B1 B2 B3 B4 B5"
        "C1 C2 C3 C4 C5";
    }

    #A1 {grid-area: A1}
    #A2 {grid-area: A2}
    #A3 {grid-area: A3}
    #A4 {grid-area: A4}
    #A5 {grid-area: A5}
    #B1 {grid-area: B1}
    #B2 {grid-area: B2}
    #B3 {grid-area: B3}
    #B4 {grid-area: B4}
    #B5 {grid-area: B5}
    #C1 {grid-area: C1}
    #C2 {grid-area: C2}
    #C3 {grid-area: C3}
    #C4 {grid-area: C4}
    #C5 {grid-area: C5}
  `;

  #farmyard;

  constructor() {
    super();

    this.#farmyard = new ContextConsumer(this, {
      context: 'farmyard',
      subscribe: true
    });
  }

  _room(id, space) {
    return html`
      <agricola-farmyard-room
        id=${id}
        type=${space.type}>
      </agricola-farmyard-room>
    `;
  }

  _empty(id) {
    return html`<div id=${id}>${id}</div>`;
  }

  render() {
    const spaces = ['A1', 'A2', 'A3', 'A4', 'A5',
                    'B1', 'B2', 'B3', 'B4', 'B5',
                    'C1', 'C2', 'C3', 'C4', 'C5'];

    const farmyard = this.#farmyard.value;

    const space = id => {
      const s = farmyard[id];

      return (!s ? this._empty(id)
                 : this._room(id, s));

    };

    return html`${map(spaces, space)}`;
  }
}

customElements.define('agricola-farmyard', FarmYard);

