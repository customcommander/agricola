import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

class Field extends LitElement {
  static styles = css`
    :host([type="field"]) {
      background-color: green;
    }
  `;

  static properties = {
    type: {},

    plow: {
      type: Boolean
    }
  };

  #messages;

  constructor() {
    super();

    this.#messages = new ContextConsumer(this, {
      context: 'messages'
    });
  }

  _plow() {
    const msg = this.#messages.value;

    return html`
      <a href="#" @click=${this._onPlow}>
        ${msg.plow()}
      </a>
    `;
  }

  _onPlow() {
    this.dispatchEvent(
      new CustomEvent('dispatch', {
        bubbles: true,
        composed: true,
        detail: {
          type: 'space.selected',
          task_id: 104,
          space_id: this.id
        }
      })
    );
  }

  render() {
    return html`
      <div>
        ${this.plow ? this._plow() : ''}
      </div>
    `;
  }
}

customElements.define('agricola-field', Field);

