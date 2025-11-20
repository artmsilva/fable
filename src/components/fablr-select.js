import { css, html, LitElement } from "lit";

class FablrSelectOption extends HTMLElement {
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

customElements.define("fablr-select-option", FablrSelectOption);

class FablrSelect extends LitElement {
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
      const options = Array.from(this.querySelectorAll("fablr-select-option"));
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
            this.dispatchEvent(
              new CustomEvent("change", { detail: this.value })
            );
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

customElements.define("fablr-select", FablrSelect);

// Stories
const meta = {
  component: "fablr-select",
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
      <fablr-select-option value="option1">Option 1</fablr-select-option>
      <fablr-select-option value="option2">Option 2</fablr-select-option>
      <fablr-select-option value="option3">Option 3</fablr-select-option>
    `,
  },
};

const stories = {
  Default: (args, slots) =>
    html`<fablr-select
      label=${args.label}
      .value=${args.value}
      ?disabled=${args.disabled}
    >
      ${slots?.default}
    </fablr-select>`,
  "With Countries": (args) =>
    html`<fablr-select label="Select Country" value="us">
      <fablr-select-option value="us">United States</fablr-select-option>
      <fablr-select-option value="uk">United Kingdom</fablr-select-option>
      <fablr-select-option value="ca">Canada</fablr-select-option>
      <fablr-select-option value="au">Australia</fablr-select-option>
      <fablr-select-option value="de">Germany</fablr-select-option>
    </fablr-select>`,
  "Many Options": (args) =>
    html`<fablr-select label="Choose Framework" value="react">
      <fablr-select-option value="react">React</fablr-select-option>
      <fablr-select-option value="vue">Vue</fablr-select-option>
      <fablr-select-option value="angular">Angular</fablr-select-option>
      <fablr-select-option value="svelte">Svelte</fablr-select-option>
      <fablr-select-option value="solid">Solid</fablr-select-option>
      <fablr-select-option value="lit">Lit</fablr-select-option>
    </fablr-select>`,
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args, slots) =>
      html`<fablr-select
        label=${args.label}
        .value=${args.value}
        ?disabled=${args.disabled}
      >
        ${slots?.default}
      </fablr-select>`,
  },
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
