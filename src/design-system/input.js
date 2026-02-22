import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FableInput extends LitElement {
  static status = "beta";
  static description = "Text input field with label and helper support.";
  static taxonomy = { group: "Inputs", tags: ["input", "form"] };

  static properties = {
    label: { type: String },
    placeholder: { type: String },
    value: { type: String },
    type: { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: contents;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: calc(var(--space-base) * 1.5);
      width: 100%;
    }
    span {
      font-size: var(--font-label);
      color: var(--text-primary);
      font-family: var(--font-stack);
    }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: var(--space-2) calc(var(--space-base) * 2.5);
      border-radius: calc(var(--space-base) * 1.5);
      font-size: var(--font-body);
      font-family: var(--font-stack);
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    input:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    input:disabled {
      opacity: var(--opacity-disabled, 0.5);
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.label = "";
    this.placeholder = "";
    this.value = "";
    this.type = "text";
    this.disabled = false;
  }

  render() {
    return html`
      <label>
        ${this.label ? html`<span>${this.label}</span>` : ""}
        <input
          part="input"
          type=${this.type}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
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
const meta = getComponentStoryMeta("input", {
  args: { label: "Name", placeholder: "Enter name" },
});
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
