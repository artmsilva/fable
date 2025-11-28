import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FableCheckbox extends LitElement {
  static status = "beta";

  static properties = {
    label: { type: String },
    checked: { type: Boolean },
    disabled: { type: Boolean },
  };

  static styles = css`
    :host {
      display: contents;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      border-radius: calc(var(--space-base) * 1.5);
      cursor: pointer;
    }
    input[type="checkbox"]:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    input[type="checkbox"]:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    span {
      font-size: var(--font-body);
      color: var(--text-primary);
      font-family: var(--font-stack);
      user-select: none;
    }
    .checkbox-container:has(input:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.label = "";
    this.checked = false;
    this.disabled = false;
  }

  render() {
    return html`
      <label class="checkbox-container">
        <input
          type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${(e) => {
            this.checked = e.target.checked;
            this.dispatchEvent(new CustomEvent("change", { detail: this.checked }));
          }}
        />
        ${this.label ? html`<span>${this.label}</span>` : ""}
      </label>
    `;
  }
}

customElements.define("fable-checkbox", FableCheckbox);

// Stories
const meta = getComponentStoryMeta("checkbox", {
  args: {
    label: "Accept terms",
    checked: false,
  },
});

const stories = {
  Default: (args) =>
    html`<fable-checkbox
      label=${args.label}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
    ></fable-checkbox>`,
  Checked: {
    args: (baseArgs) => ({ ...baseArgs, checked: true }),
    render: (args) =>
      html`<fable-checkbox
        label=${args.label}
        ?checked=${args.checked}
        ?disabled=${args.disabled}
      ></fable-checkbox>`,
  },
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args) =>
      html`<fable-checkbox
        label=${args.label}
        ?checked=${args.checked}
        ?disabled=${args.disabled}
      ></fable-checkbox>`,
  },
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
