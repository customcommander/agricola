import {LitElement, html, css} from 'lit';
import {when} from 'lit/directives/when.js';

class AgricolaFooter extends LitElement {
  static styles = css`
    #warning {
      color: red;
    }
  `;

  constructor() {
    super();
  }

  _restart() {
    this.dispatchEvent(
      new CustomEvent('restart-game', {
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <div>
        Version: ${VERSION}
        ${when(PRODUCTION,
          () => html`<strong id="warning">This game is not ready yet! Work in progress...</strong>`)}
        <button type="button" @click=${() => this._restart()}>restart</button>
      </div>
    `;
  }
}

customElements.define('agricola-footer', AgricolaFooter);

