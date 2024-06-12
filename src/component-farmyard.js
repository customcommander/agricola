import {LitElement, css, html, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {ContextConsumer} from '@lit/context';

import {spaces} from './util-farmyard.js';

import './component-space.js';

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
  #messages;
  #selection;

  constructor() {
    super();

    this.#farmyard = new ContextConsumer(this, {
      context: 'farmyard',
      subscribe: true
    });

    this.#messages = new ContextConsumer(this, {
      context: 'messages'
    });

    this.#selection = new ContextConsumer(this, {
      context: 'selection',
      subscribe: true
    });

  }

  _dispatch(sel) {
    this.dispatchEvent(
      new CustomEvent('dispatch', {
        bubbles: true,
        composed: true,
        detail: sel
      })
    );
  }

  _cta(sel) {
    const msg = this.#messages.value[sel.type]();
    return html`
      <a href="#" @click=${() => this._dispatch(sel)}>
        ${msg}
      </a>
    `;    
  }

  _space(id) {
    const space = this.#farmyard.value[id];
    const selections = this.#selection.value?.filter(s => s.space_id === id);

    return html`
      <agricola-space
        id=${id}
        type=${space?.type ?? nothing}>
        ${map(selections ?? [], (sel) => this._cta(sel))}
      </agricola-space>
    `;
  }

  render() {
    return html`${map(spaces, id => this._space(id))}`;
  }
}

customElements.define('agricola-farmyard', FarmYard);

