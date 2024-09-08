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


  render() {
    return html`
      <div>
        Version: ${VERSION}
        ${when(PRODUCTION,
          () => html`<strong id="warning">This game is not ready yet! Work in progress...</strong>`)}
      </div>
    `;
  }
}

customElements.define('agricola-footer', AgricolaFooter);

