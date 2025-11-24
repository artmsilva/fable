import { css, html, LitElement } from "lit";
import {
  getStories,
  getSelectedStory,
  getSourceDrawerOpen,
  toggleSourceDrawer,
} from "../store/app-store.js";
import { getStorySource } from "../utils/story-processor.js";
import "../components/drawer.js";
import "../components/icon-button.js";

/**
 * Source Drawer - Bottom drawer showing story source code
 */
export class FableSourceDrawer extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    pre {
      background: var(--bg-primary);
      padding: var(--space-4);
      border-radius: var(--radius);
      overflow-x: auto;
      margin: 0;
      font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
  `;

  static properties = {
    _open: { state: true },
    _stories: { state: true },
    _selected: { state: true },
  };

  constructor() {
    super();
    this._open = getSourceDrawerOpen();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._handleStateChange = this._handleStateChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("state-changed", this._handleStateChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("state-changed", this._handleStateChange);
  }

  _handleStateChange(e) {
    const key = e.detail.key;
    if (["sourceDrawerOpen", "stories", "selectedStory"].includes(key)) {
      this._open = getSourceDrawerOpen();
      this._stories = getStories();
      this._selected = getSelectedStory();
      this.requestUpdate();
    }
  }

  _handleClose() {
    toggleSourceDrawer();
  }

  _copyToClipboard() {
    const source = this._getSource();
    navigator.clipboard.writeText(source).then(() => {
      console.log("Source code copied to clipboard!");
    });
  }

  _getSource() {
    if (!this._selected) return "";
    const group = this._stories[this._selected.groupIndex];
    return getStorySource(group, this._selected.name);
  }

  render() {
    return html`
      <fable-drawer
        ?open=${this._open}
        position="bottom"
        width="50vh"
        @close=${this._handleClose}
      >
        <div slot="title">
          📄 Story Source Code
          <fable-icon-button
            aria-label="Copy source code"
            @click=${() => this._copyToClipboard()}
            style="margin-left: var(--space-2);"
          >
            📋
          </fable-icon-button>
        </div>
        <div style="position: relative;">
          <pre><code>${this._getSource()}</code></pre>
        </div>
      </fable-drawer>
    `;
  }
}

customElements.define("fable-source-drawer", FableSourceDrawer);
