import {LitElement, css, html} from 'lit';

class FarmYard extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-areas:
        "A1 A2 A3 A4 A5"
        "B1 B2 B3 B4 B5"
        "C1 C2 C3 C4 C5";
    }

    #A1 {grid-area: A1}
    #A2 {grid-area: A2}
    #A3 {grid-area: A3}
    #A4 {grid-area: A4}
    #A5 {grid-area: A5}
    #B1 {grid-area: B1}
    #B2 {grid-area: B2}
    #B3 {grid-area: B3}
    #B4 {grid-area: B4}
    #B5 {grid-area: B5}
    #C1 {grid-area: C1}
    #C2 {grid-area: C2}
    #C3 {grid-area: C3}
    #C4 {grid-area: C4}
    #C5 {grid-area: C5}
  `;

  render() {
    return html`
      <div id="A1">A1</div>
      <div id="A2">A2</div>
      <div id="A3">A3</div>
      <div id="A4">A4</div>
      <div id="A5">A5</div>

      <div id="B1">B1</div>
      <div id="B2">B2</div>
      <div id="B3">B3</div>
      <div id="B4">B4</div>
      <div id="B5">B5</div>

      <div id="C1">C1</div>
      <div id="C2">C2</div>
      <div id="C3">C3</div>
      <div id="C4">C4</div>
      <div id="C5">C5</div>
    `;
  }
}

customElements.define('agricola-farmyard', FarmYard);

