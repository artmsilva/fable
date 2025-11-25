import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FableInput extends LitElement {
  static status = "beta";

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
      display: flex;
      flex-direction: column;
      gap: calc(var(--space-base) * 1.5);
    }
    span {
      font-size: var(--font-label);
      color: var(--text-primary);
      font-family: var(--font-stack);
    }
    input {
      width: max-content;
      padding: var(--space-2) calc(var(--space-base) * 2.5);
      border-radius: calc(var(--space-base) * 1.5);
      font-size: var(--font-body);
      font-family: var(--font-stack);
      border-color: var(--secondary-color);
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
      <label>
        ${this.label ? html`<span>${this.label}</span>` : ""}
        <input
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${(e) => {
            this.value = e.target.value;
            this.dispatchEvent(new CustomEvent("input", { detail: this.value }));
          }}
        />
      </label>
    `;
  }
}

customElements.define("fable-input", FableInput);

// Stories
const meta = {
  component: "fable-input",
  args: { label: "Name", placeholder: "Enter name" },
};
const stories = {
  Default: (args) =>
    html`<fable-input
      label=${args.label}
      placeholder=${args.placeholder}
      .value=${args.value}
    ></fable-input>`,
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
