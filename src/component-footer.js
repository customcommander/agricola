import {LitElement, html} from 'lit';

class AgricolaFooter extends LitElement {

  constructor() {
    super();
  }


  render() {
    return html`
      <div>version: ${VERSION}</div>
    `;
  }
}

customElements.define('agricola-footer', AgricolaFooter);

