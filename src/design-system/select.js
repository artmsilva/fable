import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FableSelectOption extends HTMLElement {
  static get observedAttributes() {
    return ["value", "label"];
  }

  constructor() {
    super();
    this.style.display = "none";
  }

  get value() {
    return this.getAttribute("value") || "";
  }

  set value(val) {
    this.setAttribute("value", val);
  }

  get label() {
    return this.getAttribute("label") || this.textContent?.trim() || "";
  }

  set label(val) {
    this.setAttribute("label", val);
  }
}

customElements.define("fable-select-option", FableSelectOption);

class FableSelect extends LitElement {
  static status = "beta";

  static properties = {
    label: { type: String },
    value: { type: String },
    disabled: { type: Boolean },
  };

  static styles = css`
    :host {
      display: contents;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    span {
      font-size: var(--font-label);
      color: var(--text-primary);
      font-family: var(--font-stack);
    }
    select {
      padding: var(--space-2) calc(var(--space-base) * 2.5);
      font-size: var(--font-body);
      font-family: var(--font-stack);
      border-radius: calc(var(--space-base) * 1.5);
      cursor: pointer;
    }
    select:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
  `;

  constructor() {
    super();
    this.label = "";
    this.value = "";
    this.disabled = false;
    this._options = [];
  }

  firstUpdated() {
    // Get options after first render when slot content is available
    this._updateOptions();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    // Update the select value after render
    const selectEl = this.shadowRoot?.querySelector("select");
    if (selectEl && this.value) {
      selectEl.value = this.value;
    }
  }

  _handleSlotChange() {
    this._updateOptions();
  }

  _updateOptions() {
    // Use requestAnimationFrame to ensure slot content is fully rendered
    requestAnimationFrame(() => {
      const options = Array.from(this.querySelectorAll("fable-select-option"));
      this._options = options.map((opt) => ({
        value: opt.value || "",
        label: opt.label || opt.textContent?.trim() || "",
      }));
      if (this._options.length > 0) {
        this.requestUpdate();
      }
    });
  }

  render() {
    return html`
      <label>
        ${this.label ? html`<span>${this.label}</span>` : ""}
        <select
          .value=${this.value}
          ?disabled=${this.disabled}
          @change=${(e) => {
            this.value = e.target.value;
            this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
          }}
        >
          ${this._options.map(
            (opt) =>
              html`<option
                value=${opt.value}
                ?selected=${this.value === opt.value}
              >
                ${opt.label}
              </option>`
          )}
        </select>
      </label>
      <slot @slotchange=${this._handleSlotChange}></slot>
    `;
  }
}

customElements.define("fable-select", FableSelect);

// Stories
const meta = {
  component: "fable-select",
  args: {
    label: "Choose option",
    value: "option2",
    disabled: false,
  },
  argTypes: {
    disabled: {
      control: "boolean",
    },
  },
  slots: {
    default: html`
      <fable-select-option value="option1">Option 1</fable-select-option>
      <fable-select-option value="option2">Option 2</fable-select-option>
      <fable-select-option value="option3">Option 3</fable-select-option>
    `,
  },
};

const stories = {
  Default: (args, slots) =>
    html`<fable-select
      label=${args.label}
      .value=${args.value}
      ?disabled=${args.disabled}
    >
      ${slots?.default}
    </fable-select>`,
  "With Countries": (_args) =>
    html`<fable-select label="Select Country" value="us">
      <fable-select-option value="us">United States</fable-select-option>
      <fable-select-option value="uk">United Kingdom</fable-select-option>
      <fable-select-option value="ca">Canada</fable-select-option>
      <fable-select-option value="au">Australia</fable-select-option>
      <fable-select-option value="de">Germany</fable-select-option>
    </fable-select>`,
  "Many Options": (_args) =>
    html`<fable-select label="Choose Framework" value="react">
      <fable-select-option value="react">React</fable-select-option>
      <fable-select-option value="vue">Vue</fable-select-option>
      <fable-select-option value="angular">Angular</fable-select-option>
      <fable-select-option value="svelte">Svelte</fable-select-option>
      <fable-select-option value="solid">Solid</fable-select-option>
      <fable-select-option value="lit">Lit</fable-select-option>
    </fable-select>`,
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args, slots) =>
      html`<fable-select
        label=${args.label}
        .value=${args.value}
        ?disabled=${args.disabled}
      >
        ${slots?.default}
      </fable-select>`,
  },
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
