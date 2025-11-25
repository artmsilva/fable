import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FableBadge extends LitElement {
  static status = "stable";

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

  static styles = css`
    :host {
      display: inline-block;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: help;
      position: relative;
      font-family: var(--font-stack);
      display: inline-block;
    }
    :host([size="condensed"]) .badge {
      padding: 2px 6px;
      font-size: 0.625rem;
      border-radius: 8px;
      letter-spacing: 0.3px;
    }
    :host([variant="alpha"]) .badge {
      background: #ff4444;
      color: white;
    }
    :host([variant="beta"]) .badge {
      background: #ff9800;
      color: white;
    }
    :host([variant="stable"]) .badge {
      background: #4caf50;
      color: white;
    }
    :host([variant="deprecated"]) .badge {
      background: #9e9e9e;
      color: white;
    }
    :host([variant="info"]) .badge {
      background: var(--primary-color);
      color: white;
    }
    .badge::after {
      content: attr(data-tooltip);
      position: fixed;
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      font-size: 0.75rem;
      font-weight: normal;
      text-transform: none;
      letter-spacing: normal;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 10000;
      margin-left: 8px;
    }
    .badge:hover::after {
      opacity: 1;
    }
    .badge:hover::after,
    .badge:hover::before {
      opacity: 1;
    }
  `;

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

customElements.define("fable-badge", FableBadge);

// Stories
const meta = {
  component: "fable-badge",
  args: {
    variant: "stable",
    size: "default",
    tooltip: "This is a tooltip",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "condensed"],
    },
  },
  slots: {
    default: "Badge",
  },
};

const stories = {
  Alpha: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "alpha",
      tooltip: "Early development - APIs may change",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fable-badge
        variant=${args.variant}
        size=${args.size}
        tooltip=${args.tooltip}
        >${slots?.default ?? "alpha"}</fable-badge
      >`,
  },
  Beta: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "beta",
      tooltip: "Testing phase - Ready for feedback",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fable-badge
        variant=${args.variant}
        size=${args.size}
        tooltip=${args.tooltip}
        >${slots?.default ?? "beta"}</fable-badge
      >`,
  },
  Stable: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "stable",
      tooltip: "Production ready - Stable API",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fable-badge
        variant=${args.variant}
        size=${args.size}
        tooltip=${args.tooltip}
        >${slots?.default ?? "stable"}</fable-badge
      >`,
  },
  Deprecated: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "deprecated",
      tooltip: "Being phased out - Use alternatives",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fable-badge
        variant=${args.variant}
        size=${args.size}
        tooltip=${args.tooltip}
        >${slots?.default ?? "deprecated"}</fable-badge
      >`,
  },
  Info: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "info",
      tooltip: "Additional information",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fable-badge
        variant=${args.variant}
        size=${args.size}
        tooltip=${args.tooltip}
        >${slots?.default ?? "info"}</fable-badge
      >`,
  },
  Condensed: {
    args: (baseArgs) => ({
      ...baseArgs,
      size: "condensed",
    }),
    lockedArgs: { size: true },
    render: (_args, _slots) =>
      html`
        <div style="display: flex; gap: 8px; align-items: center;">
          <fable-badge variant="alpha" size="condensed">alpha</fable-badge>
          <fable-badge variant="beta" size="condensed">beta</fable-badge>
          <fable-badge variant="stable" size="condensed">stable</fable-badge>
          <fable-badge variant="deprecated" size="condensed"
            >deprecated</fable-badge
          >
          <fable-badge variant="info" size="condensed">info</fable-badge>
        </div>
      `,
  },
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
