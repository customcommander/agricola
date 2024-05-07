import {LitElement, css, html, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import {ContextConsumer} from '@lit/context';

import {spaces} from './util-farmyard.js';

import './component-farmyard-room.js';
import './component-field.js';

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
  #selection;

  constructor() {
    super();

    this.#farmyard = new ContextConsumer(this, {
      context: 'farmyard',
      subscribe: true
    });

    this.#selection = new ContextConsumer(this, {
      context: 'selection',
      subscribe: true
    });
  }

  _empty(id) {
    return html`
      <div id=${id}>
        empty
      </div>
    `;
  }

  _room(id, space) {
    return html`
      <agricola-farmyard-room
        id=${id}
        type=${space.type}>
      </agricola-farmyard-room>
    `;
  }

  _field(id, space, selection) {
    return html`
      <agricola-field
        id=${id}
        type=${space?.type ?? nothing}
        ?plow=${space == null && selection != null}>
      </agricola-field>
    `;
  }

  _space(space_id) {
    const farmyard = this.#farmyard.value;
    const selection = this.#selection.value;

    const space = farmyard[space_id];
    const selected = selection?.spaces.includes(space_id);
    const task_id = selection?.task_id;

    if (space?.type == 'field' || (selected && task_id == 104)) {
      return this._field(space_id, space, selection);
    }

    if (space?.type == 'wooden_hut') {
      return this._room(space_id, space);
    }

    return this._empty(space_id);
  }

  render() {
    return html`${map(spaces, id => this._space(id))}`;
  }
}

customElements.define('agricola-farmyard', FarmYard);

