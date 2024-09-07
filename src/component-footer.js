import {LitElement, html} from 'lit';

class AgricolaFooter extends LitElement {

  constructor() {
    super();
  }


  render() {
    return html`
      <div>Version: ${VERSION}</div>
    `;
  }
}

customElements.define('agricola-footer', AgricolaFooter);

