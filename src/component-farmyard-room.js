import {LitElement, css, html} from 'lit';

class FarmYardRoom extends LitElement {
  static properties = {
    type: {}
  };

  static styles = css`
    :host([type="wooden_hut"]) {
      background-color: brown;
    }
  `;

  render() {
    return html`<div></div>`;
  }
}

customElements.define('agricola-farmyard-room', FarmYardRoom);

