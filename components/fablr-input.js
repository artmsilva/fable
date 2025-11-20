import { css, html, LitElement } from "lit";

class FablrInput extends LitElement {
  static properties = {
    label: { type: String },
    placeholder: { type: String },
    value: { type: String },
  };

  static styles = css`
    :host {
      display: contents;
    }
    label {
      display: block;
      font-size: var(--font-label);
      margin-bottom: calc(var(--space-base) * 1.5);
      color: color-mix(in srgb, var(--secondary-color) 85%, black);
      font-family: var(--font-stack);
    }
    input {
      width: max-content;
      padding: var(--space-2) calc(var(--space-base) * 2.5);
      border: 1px solid var(--secondary-color);
      border-radius: calc(var(--space-base) * 1.5);
      font-size: var(--font-body);
      font-family: var(--font-stack);
    }
    input:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
  `;

  constructor() {
    super();
    this.label = "";
    this.placeholder = "";
    this.value = "";
  }

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ""}
      <input
        .value=${this.value}
        placeholder=${this.placeholder}
        @input=${(e) => {
          this.value = e.target.value;
          this.dispatchEvent(new CustomEvent("input", { detail: this.value }));
        }}
      />
    `;
  }
}

customElements.define("fablr-input", FablrInput);

// Stories
const meta = {
  title: "Fablr Input",
  component: "fablr-input",
  args: { label: "Name", placeholder: "Enter name", value: "" },
};
const stories = {
  Default: (args) =>
    html`<fablr-input
      label=${args.label}
      placeholder=${args.placeholder}
      .value=${args.value}
    ></fablr-input>`,
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
