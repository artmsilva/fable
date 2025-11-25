import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { STORIES_KEY } from "../config.js";

class FableIconButton extends LitElement {
  static status = "beta";

  static properties = {
    disabled: { type: Boolean },
    ariaLabel: { type: String, attribute: "aria-label" },
  };

  static styles = css`
    :host {
      display: inline-block;
    }
    button {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.2s ease;
      font-family: var(--font-stack);
      color: var(--text-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    button:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 2px 8px var(--shadow-color);
    }
    button:active:not(:disabled) {
      transform: scale(0.98);
    }
    button:focus-visible {
      outline: var(--outline-width) solid var(--primary-color);
      outline-offset: var(--outline-offset);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.disabled = false;
    this.ariaLabel = "";
  }

  render() {
    return html`
      <button
        ?disabled=${this.disabled}
        aria-label=${ifDefined(this.ariaLabel || undefined)}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define("fable-icon-button", FableIconButton);

// Stories
const meta = {
  component: "fable-icon-button",
  args: {
    ariaLabel: "Icon button",
  },
  slots: {
    default: "🌙",
  },
};

const stories = {
  Default: (args, slots) =>
    html`<fable-icon-button
      ?disabled=${args.disabled}
      aria-label=${args.ariaLabel}
      >${slots?.default ?? "🌙"}</fable-icon-button
    >`,
  ThemeToggle: {
    args: (baseArgs) => ({ ...baseArgs, ariaLabel: "Toggle theme" }),
    render: (args, slots) =>
      html`<fable-icon-button
        ?disabled=${args.disabled}
        aria-label=${args.ariaLabel}
        >${slots?.default ?? "☀️"}</fable-icon-button
      >`,
  },
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args, slots) =>
      html`<fable-icon-button
        ?disabled=${args.disabled}
        aria-label=${args.ariaLabel}
        >${slots?.default ?? "🔒"}</fable-icon-button
      >`,
  },
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
