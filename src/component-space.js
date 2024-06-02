import {LitElement, css, html} from 'lit';

class Space extends LitElement {
  static styles = css`
    :host(:not([type])) {
      background-color: gray;
    }

    :host([type="field"]) {
      background-color: green;
    }

    :host([type="wooden_hut"]) {
      background-color: brown;
    }

    :host([type="stable"]) {
      background-color: orange;
    }
  `;

  static properties = {
    type: {}
  }

  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('agricola-space', Space);

