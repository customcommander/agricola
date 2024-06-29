import {LitElement, css, html} from 'lit';

class Space extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 3px 1fr 3px;
      grid-template-rows: 3px 1fr 3px;
      grid-template-areas:
        "n n n"
        "w c e"
        "s s s";
    }

    :host(:not([type])) #center {
      background-color: gray;
    }

    :host([type="field"]) #center {
      background-color: green;
    }

    :host([type="wooden-hut"]) #center {
      background-color: brown;
    }

    :host([type="stable"]) #center {
      background-color: orange;
    }

    .edge {
      // background-color: pink;
    }

    #north  {grid-area: n}
    #east   {grid-area: e}
    #south  {grid-area: s}
    #west   {grid-area: w}
    #center {grid-area: c}
  `;

  static properties = {
    type: {}
  }

  render() {
    return html`
      <div id="north" class="edge"></div>
      <div id="east"  class="edge"></div>
      <div id="south" class="edge"></div>
      <div id="west"  class="edge"></div>
      <div id="center">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('agricola-space', Space);

