import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

class SecondaryTasks extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(14, 3rem);
      grid-template-areas:
        "head2 head3"
        "m001  o001 "
        "m002  o002 "
        "m003  o003 "
        "m004  o004 "
        "m005  o005 "
        "m006  o006 "
        "m007  o007 "
        "head1 .    "
        "t201  t206 "
        "t202  t207 "
        "t203  t208 "
        "t204  t209 "
        "t205  t210 ";
    }

    .head  {font-weight: bold}
    #head1 {grid-area:  head1}
    #head2 {grid-area:  head2}
    #head3 {grid-area:  head3}

    #t201 {grid-area: t201}
    #t202 {grid-area: t202}
    #t203 {grid-area: t203}
    #t204 {grid-area: t204}
    #t205 {grid-area: t205}
    #t206 {grid-area: t206}
    #t207 {grid-area: t207}
    #t208 {grid-area: t208}
    #t209 {grid-area: t209}
    #t210 {grid-area: t210}
  `;

  #messages;

  constructor() {
    super();

    this.#messages = new ContextConsumer(this, {
      context: 'messages'
    });
  }

  render() {
    const msg = this.#messages.value;

    return html`
      <div id="head1" class="head">${msg.major_improvements()}</div>
      <div id="head2" class="head">${msg.minor_improvements()}</div>
      <div id="head3" class="head">${msg.occupations()}</div>
    `;
  }
}

customElements.define('agricola-secondary-tasks', SecondaryTasks);

