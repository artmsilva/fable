import { define } from "fable-workbench";
import { css, html, LitElement } from "lit";

class DemoAvatar extends LitElement {
  static title = "Avatar";
  static description = "Circular identity indicator with initials fallback.";
  static status = "stable";
  static taxonomy = { group: "Data Display", category: "Identity", tags: ["avatar", "user"] };

  static properties = {
    name: { type: String },
    src: { type: String },
    size: { type: String, reflect: true, enum: ["sm", "md", "lg"] },
  };

  static args = { name: "Art Silva", src: "", size: "md" };
  static argTypes = {
    size: { control: "select", options: ["sm", "md", "lg"] },
  };

  static styles = css`
    :host { display: inline-block; }
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
      background: color-mix(in srgb, var(--primary-color) 15%, var(--bg-secondary));
      color: var(--primary-color);
      font-family: var(--font-stack);
      font-weight: 600;
      user-select: none;
    }
    :host([size="sm"]) .avatar { width: 28px; height: 28px; font-size: 0.65rem; }
    :host([size="md"]) .avatar { width: 40px; height: 40px; font-size: 0.8rem; }
    :host([size="lg"]) .avatar { width: 56px; height: 56px; font-size: 1rem; }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  static stories = {
    Default: (args) =>
      html`<demo-avatar name=${args.name} src=${args.src} size=${args.size}></demo-avatar>`,
    Sizes: {
      lockedArgs: { size: true },
      render: () => html`
        <div style="display:flex;gap:12px;align-items:center">
          <demo-avatar name="Art Silva" size="sm"></demo-avatar>
          <demo-avatar name="Art Silva" size="md"></demo-avatar>
          <demo-avatar name="Art Silva" size="lg"></demo-avatar>
        </div>
      `,
    },
    WithImage: {
      args: (base) => ({ ...base, src: "https://api.dicebear.com/9.x/initials/svg?seed=AS" }),
      lockedArgs: { src: true },
      render: (args) =>
        html`<demo-avatar name=${args.name} src=${args.src} size=${args.size}></demo-avatar>`,
    },
    Group: {
      render: () => html`
        <div style="display:flex;margin-left:8px">
          ${["Ada Lovelace", "Grace Hopper", "Margaret Hamilton"].map(
            (name) => html`<demo-avatar name=${name} size="md" style="margin-left:-8px;border:2px solid var(--bg-primary);border-radius:50%"></demo-avatar>`,
          )}
        </div>
      `,
    },
  };

  constructor() {
    super();
    this.name = "";
    this.src = "";
    this.size = "md";
  }

  get _initials() {
    return (this.name || "")
      .split(" ")
      .map((w) => w[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  render() {
    return html`
      <div class="avatar" aria-label=${this.name || "avatar"}>
        ${this.src
          ? html`<img src=${this.src} alt=${this.name} />`
          : this._initials}
      </div>
    `;
  }
}

define("demo-avatar", DemoAvatar);
