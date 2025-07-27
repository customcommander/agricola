import {LitElement, css, html, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import {ContextConsumer} from '@lit/context';

import {spaces} from './util-farmyard.js';

import './component-space.js';

class FarmYard extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: 0;
      grid-template-columns: 7px 1fr 7px 1fr 7px 1fr 7px 1fr 7px 1fr 7px;
      grid-template-rows:    7px 1fr 7px 1fr 7px 1fr 7px;
      grid-template-areas:
        " .  F01 .  F02 .  F03 .  F04 .  F05 . "

        "F06 A1 F07 A2 F08 A3 F09 A4 F10 A5 F11"

        " .  F12 .  F13 .  F14 .  F15 .  F16 . "

        "F17 B1 F18 B2 F19 B3 F20 B4 F21 B5 F22"

        " .  F23 .  F24 .  F25 .  F26 .  F27 . "

        "F28 C1 F29 C2 F30 C3 F31 C4 F32 C5 F33"

        " .  F34 .  F35 .  F36 .  F37 .  F38 . ";
    }

    #F01 {grid-area: F01} #F11 {grid-area: F11}
    #F02 {grid-area: F02} #F12 {grid-area: F12}
    #F03 {grid-area: F03} #F13 {grid-area: F13}
    #F04 {grid-area: F04} #F14 {grid-area: F14}
    #F05 {grid-area: F05} #F15 {grid-area: F15}
    #F06 {grid-area: F06} #F16 {grid-area: F16}
    #F07 {grid-area: F07} #F17 {grid-area: F17}
    #F08 {grid-area: F08} #F18 {grid-area: F18}
    #F09 {grid-area: F09} #F19 {grid-area: F19}
    #F10 {grid-area: F10} #F20 {grid-area: F20}

    #F21 {grid-area: F21} #F31 {grid-area: F31} 
    #F22 {grid-area: F22} #F32 {grid-area: F32}
    #F23 {grid-area: F23} #F33 {grid-area: F33}
    #F24 {grid-area: F24} #F34 {grid-area: F34}
    #F25 {grid-area: F25} #F35 {grid-area: F35}
    #F26 {grid-area: F26} #F36 {grid-area: F36}
    #F27 {grid-area: F27} #F37 {grid-area: F37}
    #F28 {grid-area: F28} #F38 {grid-area: F38}
    #F29 {grid-area: F29}
    #F30 {grid-area: F30}

    .fence {
      background-color: pink;
      cursor: pointer;
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
      new CustomEvent('player.move', {
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
        type=${space?.type ?? nothing}
        grain=${space?.grain || nothing}
        vegetable=${space?.vegetable || nothing}>
        ${map(selections ?? [], (sel) => this._cta(sel))}
      </agricola-space>
    `;
  }

  render() {
    return html`
      <div id="F01" class="fence"></div>
      <div id="F02" class="fence"></div>
      <div id="F03" class="fence"></div>
      <div id="F04" class="fence"></div>
      <div id="F05" class="fence"></div>
      <div id="F06" class="fence"></div>
      <div id="F07" class="fence"></div>
      <div id="F08" class="fence"></div>
      <div id="F09" class="fence"></div>
      <div id="F10" class="fence"></div>
      <div id="F11" class="fence"></div>
      <div id="F12" class="fence"></div>
      <div id="F13" class="fence"></div>
      <div id="F14" class="fence"></div>
      <div id="F15" class="fence"></div>
      <div id="F16" class="fence"></div>
      <div id="F17" class="fence"></div>
      <div id="F18" class="fence"></div>
      <div id="F19" class="fence"></div>
      <div id="F20" class="fence"></div>
      <div id="F21" class="fence"></div>
      <div id="F22" class="fence"></div>
      <div id="F23" class="fence"></div>
      <div id="F24" class="fence"></div>
      <div id="F25" class="fence"></div>
      <div id="F26" class="fence"></div>
      <div id="F27" class="fence"></div>
      <div id="F28" class="fence"></div>
      <div id="F29" class="fence"></div>
      <div id="F30" class="fence"></div>
      <div id="F31" class="fence"></div>
      <div id="F32" class="fence"></div>
      <div id="F33" class="fence"></div>
      <div id="F34" class="fence"></div>
      <div id="F35" class="fence"></div>
      <div id="F36" class="fence"></div>
      <div id="F37" class="fence"></div>
      <div id="F38" class="fence"></div>

      ${map(spaces, id => this._space(id))}
    `;
  }
}

customElements.define('agricola-farmyard', FarmYard);

