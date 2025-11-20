import { css, html, LitElement } from "lit";

/**
 * A simple button component for Fablr design system.
 * @element fablr-button
 * @slot - The button label.
 * @csspart button - The button element.
 */
class FablrButton extends LitElement {
  static properties = {
    disabled: { type: Boolean },
    variant: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: contents;
      --component: fablr-button;
      --component-type: button;
      --component-status: stable;
      --opacity: 1;
    }
    :host([variant="primary"]) {
      --button-bg-color: var(--primary-color);
      --button-border-color: var(--primary-color);
      --button-text-color: color-mix(
        in srgb,
        var(--button-bg-color) 10%,
        white
      );
    }
    :host([variant="secondary"]) {
      --button-bg-color: transparent;
      --button-border-color: var(--primary-color);
      --button-text-color: var(--primary-color);
      --button-hover-bg: color-mix(
        in srgb,
        var(--primary-color) 10%,
        transparent
      );
    }
    button {
      border: 1px solid var(--button-border-color);
      background-color: var(--button-bg-color);
      color: var(--button-text-color);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--space-base);
      cursor: pointer;
      font-size: var(--font-body);
      font-family: var(--font-stack);
      opacity: var(--opacity);
      transition: opacity 0.2s ease-in-out;
    }
    button:hover {
      --opacity: var(--opacity-hover);
    }
    button:active {
      --opacity: var(--opacity-active);
    }
    button:focus-visible {
      --opacity: var(--opacity-focus);
      outline: var(--outline-width) solid var(--primary-color);
      outline-offset: var(--outline-offset);
    }
    button:disabled {
      --opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.disabled = false;
    this.variant = "primary";
  }

  render() {
    return html` <button ?disabled=${this.disabled}><slot></slot></button> `;
  }
}

customElements.define("fablr-button", FablrButton);

/**
 * Meta information for Fablr Button component
 */
const meta = {
  title: "Fablr Button",
  component: "fablr-button",
  args: { disabled: false, variant: "primary" },
  slots: {
    default: "Primary Button",
  },
};

/**
 * Stories for Fablr Button component
 */
const stories = {
  Primary: (args, slots) =>
    html`<fablr-button ?disabled=${args.disabled} variant=${args.variant}
      >${slots?.default ?? "Primary Button"}</fablr-button
    >`,
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args, slots) =>
      html`<fablr-button ?disabled=${args.disabled} variant="primary"
        >${slots?.default ?? "Disabled Button"}</fablr-button
      >`,
  },
  Secondary: {
    args: (baseArgs) => ({ ...baseArgs, variant: "secondary" }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fablr-button ?disabled=${args.disabled} variant=${args.variant}
        >${slots?.default ?? "Secondary Button"}</fablr-button
      >`,
  },
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
