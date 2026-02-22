import { css, html, LitElement } from "lit";
import "./input.js";

class FableSearchInput extends LitElement {
  static properties = {
    value: { type: String },
    placeholder: { type: String },
  };

  constructor() {
    super();
    this.value = "";
    this.placeholder = "Search";
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    fable-input::part(input) {
      border-radius: var(--border-radius-full);
      padding-left: var(--space-4, 16px);
      padding-right: var(--space-4, 16px);
      background: var(--bg-primary);
    }
  `;

  _handleInput(event) {
    // Native input events compose through shadow DOM boundaries — only handle
    // fable-input's CustomEvent which carries the actual value in event.detail
    if (!(event instanceof CustomEvent)) return;
    this.value = event.detail;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <fable-input
        type="search"
        placeholder=${this.placeholder}
        .value=${this.value}
        @input=${this._handleInput}
      ></fable-input>
    `;
  }
}

customElements.define("fable-search-input", FableSearchInput);
