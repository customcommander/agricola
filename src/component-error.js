import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

class Err extends LitElement {
  static styles = css`
    #container {
      display: flex;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      background-color: rgba(0,0,0,0.2);
      z-index: 1000;
    }

    div[role="alertdialog"] {
      background-color: white;
      border: 1px solid black;
    }
  `;

  #error;
  #messages;

  constructor() {
    super();

    this.#error = new ContextConsumer(this, {
      context: 'error',
      subscribe: true
    });

    this.#messages = new ContextConsumer(this, {
      context: 'messages'
    });
  }

  _dismiss() {
    this.dispatchEvent(
      new CustomEvent('player.move', {
        bubbles: true,
        composed: true,
        detail: {
          type: 'error.dismiss'
        }
      })
    );
  }

  render() {
    const err = this.#error.value;
    const msg = this.#messages.value;

    if (!err) {
      return;
    }

    return html`
      <div id="container">
        <div role="alertdialog" aria-modal="true">
          <div>
            <p>${msg[err]()}</p>
          </div>
          <div>
            <button type="button" @click=${this._dismiss}>
              ${msg.action_ok()}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('agricola-error', Err);

