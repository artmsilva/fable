import { css, html, LitElement } from "lit";
import { define } from "../src/define.js";

class FableBadge extends LitElement {
  static status = "stable";
  static description = "Inline status indicator with tone-aware variants.";
  static taxonomy = { group: "Feedback", tags: ["badge", "status"] };

  static properties = {
    variant: {
      type: String,
      reflect: true,
      enum: ["alpha", "beta", "stable", "deprecated", "info"],
    },
    size: {
      type: String,
      reflect: true,
      enum: ["default", "condensed"],
    },
    tooltip: { type: String },
  };

  static args = {
    variant: "stable",
    size: "default",
    tooltip: "This is a tooltip",
  };

  static argTypes = {
    size: {
      control: "select",
      options: ["default", "condensed"],
    },
  };

  static slots = {
    default: "Badge",
  };

  static styles = css`
    :host {
      display: inline-block;
    }
    .badge {
      padding: var(--space-base) var(--space-1);
      border-radius: var(--space-base);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: help;
      position: relative;
      font-family: var(--font-stack);
      display: inline-block;
      border: 1px solid currentColor;
      background: transparent;
      line-height: 1.4;
    }
    :host([size="condensed"]) .badge {
      padding: var(--space-base) var(--space-1);
      font-size: var(--font-size-xs);
      letter-spacing: 0.06em;
    }
    :host([variant="alpha"]) .badge {
      color: var(--color-error);
    }
    :host([variant="beta"]) .badge {
      color: var(--primary-color, #c4622d);
    }
    :host([variant="stable"]) .badge {
      color: var(--text-secondary, #6b5f52);
    }
    :host([variant="deprecated"]) .badge {
      color: var(--text-secondary, #9e8e7e);
      opacity: 0.6;
    }
    :host([variant="info"]) .badge {
      color: var(--primary-color, #c4622d);
    }
    .badge::after {
      content: attr(data-tooltip);
      position: fixed;
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--space-1);
      border: 1px solid var(--border-color);
      box-shadow: 0 2px 8px var(--shadow-color);
      font-size: var(--font-size-xs);
      font-weight: normal;
      text-transform: none;
      letter-spacing: normal;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 10000;
      margin-left: var(--space-2);
    }
    .badge:hover::after {
      opacity: 1;
    }
  `;

  static stories = {
    Docs: {
      title: "Badge",
      description: "Status badge usage and variant guidance.",
      content: `# Badge usage

Badges convey short status labels. Keep copy to a single word where possible.

## Variants

- **alpha/beta**: Use for early-stage components.
- **stable**: Indicates production readiness.
- **deprecated**: Signals phase-out; include migration path nearby.

:::callout danger
Avoid using badges as buttons or links; they should be informational only.
:::

## Sizing

- Default for content surfaces.
- Condensed for navigation or dense tables.`,
    },
    Alpha: {
      args: (baseArgs) => ({ ...baseArgs, variant: "alpha", tooltip: "Early development - APIs may change" }),
      lockedArgs: { variant: true },
      render: (args, slots) => html`<fable-badge variant=${args.variant} size=${args.size} tooltip=${args.tooltip}>${slots?.default ?? "alpha"}</fable-badge>`,
    },
    Beta: {
      args: (baseArgs) => ({ ...baseArgs, variant: "beta", tooltip: "Testing phase - Ready for feedback" }),
      lockedArgs: { variant: true },
      render: (args, slots) => html`<fable-badge variant=${args.variant} size=${args.size} tooltip=${args.tooltip}>${slots?.default ?? "beta"}</fable-badge>`,
    },
    Stable: {
      args: (baseArgs) => ({ ...baseArgs, variant: "stable", tooltip: "Production ready - Stable API" }),
      lockedArgs: { variant: true },
      render: (args, slots) => html`<fable-badge variant=${args.variant} size=${args.size} tooltip=${args.tooltip}>${slots?.default ?? "stable"}</fable-badge>`,
    },
    Deprecated: {
      args: (baseArgs) => ({ ...baseArgs, variant: "deprecated", tooltip: "Being phased out - Use alternatives" }),
      lockedArgs: { variant: true },
      render: (args, slots) => html`<fable-badge variant=${args.variant} size=${args.size} tooltip=${args.tooltip}>${slots?.default ?? "deprecated"}</fable-badge>`,
    },
    Info: {
      args: (baseArgs) => ({ ...baseArgs, variant: "info", tooltip: "Additional information" }),
      lockedArgs: { variant: true },
      render: (args, slots) => html`<fable-badge variant=${args.variant} size=${args.size} tooltip=${args.tooltip}>${slots?.default ?? "info"}</fable-badge>`,
    },
    Condensed: {
      args: (baseArgs) => ({ ...baseArgs, size: "condensed" }),
      lockedArgs: { size: true },
      render: (_args, _slots) => html`
        <div class="badge-story-row">
          <fable-badge variant="alpha" size="condensed">alpha</fable-badge>
          <fable-badge variant="beta" size="condensed">beta</fable-badge>
          <fable-badge variant="stable" size="condensed">stable</fable-badge>
          <fable-badge variant="deprecated" size="condensed">deprecated</fable-badge>
          <fable-badge variant="info" size="condensed">info</fable-badge>
        </div>
      `,
    },
  };

  constructor() {
    super();
    this.variant = "info";
    this.size = "default";
    this.tooltip = "";
  }

  render() {
    return html`
      <span class="badge" data-tooltip=${this.tooltip}>
        <slot></slot>
      </span>
    `;
  }
}

define("fable-badge", FableBadge);
