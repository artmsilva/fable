import { css, html, LitElement } from "lit";

class FablrDrawer extends LitElement {
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

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: var(--space-2);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: var(--bg-hover);
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
        <button
          class="close-button"
          @click=${this.close}
          aria-label="Close drawer"
        >
          ✕
        </button>
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

customElements.define("fablr-drawer", FablrDrawer);

// Stories
const meta = {
  title: "Drawer",
  component: "fablr-drawer",
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
    <fablr-button
      @click=${(e) => {
        const drawer = e.target.nextElementSibling;
        drawer.open = true;
      }}
    >
      Open Drawer
    </fablr-button>
    <fablr-drawer
      .open=${args.open}
      position=${args.position}
      width=${args.width}
    >
      <div slot="title">Example Drawer</div>
      <p>This is the drawer content. You can put any content here.</p>
      <fablr-stack gap="var(--space-3)">
        <fablr-input label="Name" value="John Doe"></fablr-input>
        <fablr-textarea label="Description" rows="4"></fablr-textarea>
        <fablr-button variant="primary">Save</fablr-button>
      </fablr-stack>
    </fablr-drawer>
  `,
  "Bottom Position": (args) => html`
    <fablr-button
      @click=${(e) => {
        const drawer = e.target.nextElementSibling;
        drawer.open = true;
      }}
    >
      Open Bottom Drawer
    </fablr-button>
    <fablr-drawer open position="bottom" width="300px">
      <div slot="title">Bottom Sheet</div>
      <p>This drawer slides up from the bottom of the screen.</p>
      <fablr-button variant="primary">Action</fablr-button>
    </fablr-drawer>
  `,
  "With Code": (args) => html`
    <fablr-button
      @click=${(e) => {
        const drawer = e.target.nextElementSibling;
        drawer.open = true;
      }}
    >
      View Source
    </fablr-button>
    <fablr-drawer position="right" width="600px">
      <div slot="title">Source Code</div>
      <pre
        style="background: var(--bg-primary); padding: var(--space-3); border-radius: var(--radius); overflow-x: auto;"
      ><code>const myFunction = () => {
  console.log('Hello, World!');
  return 42;
};</code></pre>
    </fablr-drawer>
  `,
};

if (!window.__FABLR_STORIES__) window.__FABLR_STORIES__ = [];
window.__FABLR_STORIES__.push({ meta, stories });
