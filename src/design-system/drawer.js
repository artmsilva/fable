import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import "./icon-button.js";

class FableDrawer extends LitElement {
  static status = "stable";

  static properties = {
    open: { type: Boolean, reflect: true },
    position: {
      type: String,
      reflect: true,
      enum: ["left", "right", "bottom"],
    },
    width: { type: String },
  };

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      bottom: 0;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border-color);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    :host([open]) {
      transform: translateX(0);
    }

    :host([position="left"]) {
      left: 0;
      right: auto;
      border-left: none;
      border-right: 1px solid var(--border-color);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      transform: translateX(-100%);
    }

    :host([position="left"][open]) {
      transform: translateX(0);
    }

    :host([position="right"]) {
      right: 0;
      left: auto;
    }

    :host([position="bottom"]) {
      top: auto;
      left: 0;
      right: 0;
      bottom: 0;
      border-left: none;
      border-top: 1px solid var(--border-color);
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(100%);
    }

    :host([position="bottom"][open]) {
      transform: translateY(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-primary);
    }

    .drawer-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4);
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 999;
    }

    .backdrop.visible {
      opacity: 1;
      pointer-events: auto;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.position = "right";
    this.width = "500px";
  }

  _updateBackdrop() {
    if (this.open) {
      this._showBackdrop();
    } else {
      this._hideBackdrop();
    }
  }

  _showBackdrop() {
    if (!this._backdrop) {
      this._backdrop = document.createElement("div");
      this._backdrop.className = "backdrop";
      this._backdrop.addEventListener("click", () => this.close());
      document.body.appendChild(this._backdrop);
    }
    requestAnimationFrame(() => {
      this._backdrop.classList.add("visible");
    });
  }

  _hideBackdrop() {
    if (this._backdrop) {
      this._backdrop.classList.remove("visible");
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._backdrop) {
      this._backdrop.remove();
      this._backdrop = null;
    }
  }

  close() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="drawer-header">
        <h3 class="drawer-title"><slot name="title">Drawer</slot></h3>
        <fable-icon-button @click=${this.close} aria-label="Close drawer">
          ✕
        </fable-icon-button>
      </div>
      <div class="drawer-content">
        <slot></slot>
      </div>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("width") || changedProperties.has("position")) {
      if (this.position === "bottom") {
        this.style.height = this.width;
        this.style.width = "";
      } else {
        this.style.width = this.width;
        this.style.height = "";
      }
    }
    if (changedProperties.has("open")) {
      this._updateBackdrop();
    }
  }
}

customElements.define("fable-drawer", FableDrawer);

// Stories
const meta = {
  title: "Drawer",
  component: "fable-drawer",
  args: {
    open: false,
    position: "right",
    width: "400px",
  },
  argTypes: {
    position: {
      control: "select",
      options: ["left", "right", "bottom"],
    },
  },
};

const stories = {
  Default: (args) => html`
    <fable-button
      @click=${(e) => {
        const drawer = e.target.nextElementSibling;
        drawer.open = true;
      }}
    >
      Open Drawer
    </fable-button>
    <fable-drawer
      .open=${args.open}
      position=${args.position}
      width=${args.width}
    >
      <div slot="title">Example Drawer</div>
      <p>This is the drawer content. You can put any content here.</p>
      <fable-stack gap="var(--space-3)">
        <fable-input label="Name" value="John Doe"></fable-input>
        <fable-textarea label="Description" rows="4"></fable-textarea>
        <fable-button variant="primary">Save</fable-button>
      </fable-stack>
    </fable-drawer>
  `,
  "Bottom Position": (_args) => html`
    <fable-button
      @click=${(e) => {
        const drawer = e.target.nextElementSibling;
        drawer.open = true;
      }}
    >
      Open Bottom Drawer
    </fable-button>
    <fable-drawer open position="bottom" width="300px">
      <div slot="title">Bottom Sheet</div>
      <p>This drawer slides up from the bottom of the screen.</p>
      <fable-button variant="primary">Action</fable-button>
    </fable-drawer>
  `,
  "With Code": (_args) => html`
    <fable-button
      @click=${(e) => {
        const drawer = e.target.nextElementSibling;
        drawer.open = true;
      }}
    >
      View Source
    </fable-button>
    <fable-drawer position="right" width="600px">
      <div slot="title">Source Code</div>
      <pre
        style="background: var(--bg-primary); padding: var(--space-3); border-radius: var(--radius); overflow-x: auto;"
      ><code>const myFunction = () => {
  console.log('Hello, World!');
  return 42;
};</code></pre>
    </fable-drawer>
  `,
};

if (!window[STORIES_KEY]) window[STORIES_KEY] = [];
window[STORIES_KEY].push({ meta, stories });
