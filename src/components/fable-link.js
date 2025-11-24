import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FableLink extends LitElement {
  static status = "stable";

  static properties = {
    // Story identification
    story: { type: String }, // "component-slug/story-slug"
    groupIndex: { type: Number },
    storyName: { type: String },

    // Optional args object to include in URL
    args: { type: Object },

    // Simple href fallback
    href: { type: String },

    // Active state
    active: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: contents;
    }
    a {
      color: var(--primary-color);
      text-decoration: none;
      cursor: pointer;
      padding: calc(var(--space-base)) var(--space-2);
      border-radius: var(--space-base);
      transition: background-color 0.2s;
      display: inline-block;
      font-size: var(--font-body);
      font-family: var(--font-stack);
    }
    a:hover {
      background-color: color-mix(
        in srgb,
        var(--primary-color) 10%,
        transparent
      );
      text-decoration: underline;
    }
    :host([active]) a {
      background-color: color-mix(
        in srgb,
        var(--primary-color) 15%,
        transparent
      );
      color: var(--primary-color);
      font-weight: 600;
    }
  `;

  constructor() {
    super();
    this.story = "";
    this.groupIndex = null;
    this.storyName = "";
    this.args = {};
    this.href = "";
    this.active = false;
  }

  _buildHref() {
    // If explicit href provided, use it
    if (this.href) return this.href;

    // If story string provided (e.g., "button/primary")
    if (this.story) {
      const params = new URLSearchParams();
      params.set("story", this.story);

      // Add args if provided
      if (this.args && typeof this.args === "object") {
        Object.entries(this.args).forEach(([key, value]) => {
          params.set(key, String(value));
        });
      }

      return `?${params.toString()}`;
    }

    // Fallback to # for no-op links
    return "#";
  }

  render() {
    return html`
      <a href=${this._buildHref()}>
        <slot></slot>
      </a>
    `;
  }
}

customElements.define("fable-link", FableLink);

// Stories
const meta = {
  component: "fable-link",
  args: {
    story: "button/primary",
    active: false,
  },
  slots: {
    default: "Click me",
  },
};

const stories = {
  "Simple Story Link": (args, slots) =>
    html`<fable-link story=${args.story} ?active=${args.active}
      >${slots?.default ?? "Story Link"}</fable-link
    >`,

  "With Args": (args, slots) =>
    html`<fable-link
      story="button/primary"
      .args=${{ variant: "primary", size: "large" }}
      ?active=${args.active}
      >${slots?.default ?? "Button Primary Large"}</fable-link
    >`,

  "Simple Href": (args, slots) =>
    html`<fable-link href="/some/path" ?active=${args.active}
      >${slots?.default ?? "Simple Link"}</fable-link
    >`,

  Active: {
    args: (args) => ({ ...args, active: true }),
    lockedArgs: { active: true },
    render: (args, slots) =>
      html`<fable-link story=${args.story} ?active=${args.active}
        >${slots?.default ?? "Active Link"}</fable-link
      >`,
  },
};

window[STORIES_KEY] = window[STORIES_KEY] || [];
window[STORIES_KEY].push({ meta, stories });
