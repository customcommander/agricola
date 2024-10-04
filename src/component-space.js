import {
  LitElement,
  css,
  html,
  nothing,
} from 'lit';

class Space extends LitElement {
  static styles = css`
    :host(:not([type])) {
      background-color: gray;
    }

    :host([type="field"]) {
      background-color: green;
    }

    :host([type="field"][grain]) {
      background-color: yellow;
    }

    :host([type="wooden-hut"]) {
      background-color: brown;
    }

    :host([type="stable"]) {
      background-color: orange;
    }
  `;

  static properties = {
    type:  {},
    grain: {}
  }

  render() {
    return html`
      <div>
        <span>${this.grain ?? nothing}</span>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('agricola-space', Space);

