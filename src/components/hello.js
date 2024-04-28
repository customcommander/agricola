import {LitElement, css, html} from 'lit';

class Hello extends LitElement {
  static styles = css`
    :host {
      color: blue
		}
	`;

  constructor() {
    super();
  }

  render() {
    return html`
			<p>this is great :)...</p>
		`;
  }
}

customElements.define('agricola-hello', Hello);

