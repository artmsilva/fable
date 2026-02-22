import { define } from "fable-workbench";
import { css, html, LitElement } from "lit";

class DemoToggle extends LitElement {
  static title = "Toggle";
  static description = "Binary switch for on/off states.";
  static status = "beta";
  static taxonomy = { group: "Inputs", category: "Controls", tags: ["toggle", "switch"] };

  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
  };

  static args = { checked: false, disabled: false, label: "Notifications" };

  static styles = css`
    :host { display: inline-flex; align-items: center; gap: var(--space-3); }
    .track {
      position: relative;
      width: 36px;
      height: 20px;
      border-radius: 10px;
      background: var(--border-color);
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    :host([checked]) .track {
      background: var(--primary-color);
    }
    :host([disabled]) .track {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }
    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--bg-primary);
      box-shadow: 0 1px 3px var(--shadow-color);
      transition: transform 0.2s;
    }
    :host([checked]) .thumb {
      transform: translateX(16px);
    }
    .label {
      font-family: var(--font-stack);
      font-size: var(--font-body);
      color: var(--text-primary);
      user-select: none;
    }
    :host([disabled]) .label {
      color: var(--text-secondary);
    }
  `;

  static stories = {
    Default: (args) =>
      html`<demo-toggle ?checked=${args.checked} ?disabled=${args.disabled} label=${args.label}></demo-toggle>`,
    Checked: {
      args: (base) => ({ ...base, checked: true }),
      lockedArgs: { checked: true },
      render: (args) =>
        html`<demo-toggle checked ?disabled=${args.disabled} label=${args.label}></demo-toggle>`,
    },
    Disabled: {
      args: (base) => ({ ...base, disabled: true }),
      lockedArgs: { disabled: true },
      render: () => html`
        <div style="display:flex;flex-direction:column;gap:12px">
          <demo-toggle disabled label="Disabled off"></demo-toggle>
          <demo-toggle checked disabled label="Disabled on"></demo-toggle>
        </div>
      `,
    },
    Group: {
      render: () => html`
        <div style="display:flex;flex-direction:column;gap:12px">
          <demo-toggle checked label="Email notifications"></demo-toggle>
          <demo-toggle label="Push notifications"></demo-toggle>
          <demo-toggle checked label="Weekly digest"></demo-toggle>
        </div>
      `,
    },
  };

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.label = "";
  }

  _toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent("change", { detail: { checked: this.checked } }));
  }

  render() {
    return html`
      <div
        class="track"
        role="switch"
        aria-checked=${this.checked}
        aria-disabled=${this.disabled}
        tabindex=${this.disabled ? -1 : 0}
        @click=${this._toggle}
        @keydown=${(e) => (e.key === " " || e.key === "Enter") && this._toggle()}
      >
        <div class="thumb"></div>
      </div>
      ${this.label ? html`<span class="label" @click=${this._toggle}>${this.label}</span>` : null}
    `;
  }
}

define("demo-toggle", DemoToggle);
