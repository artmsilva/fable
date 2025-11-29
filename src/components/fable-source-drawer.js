import {
  getSelectedStory,
  getSourceDrawerOpen,
  getStories,
  toggleSourceDrawer,
} from "@store";
import { getStorySource } from "@utils";
import { html, LitElement } from "lit";
import "@design-system/drawer.js";
import "@design-system/icon-button.js";
import "@design-system/code-block.js";

/**
 * Source Drawer - Bottom drawer showing story source code
 */
export class FableSourceDrawer extends LitElement {
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
    if (!source) return;
    navigator.clipboard.writeText(source).then(() => {
      console.log("Source code copied to clipboard!");
    });
  }

  _getSource() {
    if (!this._selected) return "";
    const group = this._stories[this._selected.groupIndex];
    return getStorySource(group, this._selected.name);
  }

  _isDocsStory() {
    if (!this._selected) return false;
    const group = this._stories[this._selected.groupIndex];
    const story = group?.stories?.[this._selected.name];
    return group?.meta?.type === "docs" || story?.type === "docs";
  }

  render() {
    const source = this._getSource();
    const isDocs = this._isDocsStory();
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
          >
            📋
          </fable-icon-button>
        </div>
        ${isDocs
          ? html`<p>Source is not available for docs stories.</p>`
          : html`<fable-code-block language="javascript">
              ${source || "No source available for this story."}
            </fable-code-block>`}
      </fable-drawer>
    `;
  }
}

customElements.define("fable-source-drawer", FableSourceDrawer);
