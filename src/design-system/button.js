import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FableButton extends LitElement {
  static status = "alpha";

  static properties = {
    disabled: { type: Boolean },
    variant: {
      type: String,
      reflect: true,
      // Custom enum definition for story controls
      enum: ["primary", "secondary"],
    },
  };

  static styles = css`
    :host {
      display: contents;
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

customElements.define("fable-button", FableButton);

/**
 * Meta information for fable Button component
 */
const meta = getComponentStoryMeta("button", {
  args: {
    disabled: false,
    variant: "primary",
  },
  slots: {
    default: "Primary Button",
  },
});

/**
 * Stories for fable Button component
 */
const docsContent = `# Button usage

Use the Button component for primary and secondary calls to action. Keep copy short and action oriented.

:::story button--Primary

### HTML usage snippet

:::story code-block--HTML\ Code

## Variants

- **Primary**: Main task on a page (one per view).
- **Secondary**: Supporting actions that should not distract from the primary task.

## Accessibility

- Provide \`aria-label\` when the button only shows an icon.
- Keep focus outlines visible; avoid removing the default outline without replacing it.`;

const stories = {
  Docs: {
    type: "docs",
    title: "Button",
    description:
      "Usage, variants, and accessibility guidance for the Button component.",
    content: docsContent,
  },
  Primary: (args, slots) =>
    html`<fable-button ?disabled=${args.disabled} variant=${args.variant}
      >${slots?.default ?? "Primary Button"}</fable-button
    >`,
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args, slots) =>
      html`<fable-button ?disabled=${args.disabled} variant="primary"
        >${slots?.default ?? "Disabled Button"}</fable-button
      >`,
  },
  Secondary: {
    args: (baseArgs) => ({ ...baseArgs, variant: "secondary" }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fable-button ?disabled=${args.disabled} variant=${args.variant}
        >${slots?.default ?? "Secondary Button"}</fable-button
      >`,
  },
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
