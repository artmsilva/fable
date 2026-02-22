import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { define } from "../src/define.js";

class FableIconButton extends LitElement {
  static status = "beta";
  static description = "Circular button for contextual icon-only actions.";
  static taxonomy = { group: "Inputs", tags: ["icon", "button"] };

  static properties = { disabled: { type: Boolean }, ariaLabel: { type: String, attribute: "aria-label" } };
  static args = { ariaLabel: "Icon button" };
  static slots = { default: "🌙" };

  static styles = css`
    :host { display: inline-block; }
    button { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--space-2); padding: var(--space-2) var(--space-3); cursor: pointer; font-size: var(--font-size-lg); transition: all 0.2s ease; font-family: var(--font-stack); color: var(--text-primary); display: inline-flex; align-items: center; justify-content: center; }
    button:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 2px 8px var(--shadow-color); }
    button:active:not(:disabled) { transform: scale(0.98); }
    button:focus-visible { outline: var(--outline-width) solid var(--primary-color); outline-offset: var(--outline-offset); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `;

  static stories = {
    Default: (args, slots) => html`<fable-icon-button ?disabled=${args.disabled} aria-label=${args.ariaLabel}>${slots?.default ?? "🌙"}</fable-icon-button>`,
    ThemeToggle: {
      args: (baseArgs) => ({ ...baseArgs, ariaLabel: "Toggle theme" }),
      render: (args, slots) => html`<fable-icon-button ?disabled=${args.disabled} aria-label=${args.ariaLabel}>${slots?.default ?? "☀️"}</fable-icon-button>`,
    },
    Disabled: {
      args: (baseArgs) => ({ ...baseArgs, disabled: true }),
      lockedArgs: { disabled: true },
      render: (args, slots) => html`<fable-icon-button ?disabled=${args.disabled} aria-label=${args.ariaLabel}>${slots?.default ?? "🔒"}</fable-icon-button>`,
    },
  };

  constructor() { super(); this.disabled = false; this.ariaLabel = ""; }
  render() {
    return html`<button ?disabled=${this.disabled} aria-label=${ifDefined(this.ariaLabel || undefined)}><slot></slot></button>`;
  }
}

define("fable-icon-button", FableIconButton);
