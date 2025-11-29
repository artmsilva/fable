import { getDocsMetadata, getView } from "@store";
import { parseMarkdown } from "@utils";
import { html, LitElement } from "lit";

export class FableDocsView extends LitElement {
  static properties = {
    _docs: { state: true },
    _view: { state: true },
  };

  constructor() {
    super();
    this._docs = getDocsMetadata();
    this._view = getView();
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
    if (key === "view") {
      this._view = getView();
    }
    if (key === "metadata") {
      this._docs = getDocsMetadata();
    }
  }

  _getActiveDoc() {
    if (this._view?.name !== "docs") return null;
    const { section, slug, id } = this._view.params || {};
    return this._docs.find((doc) => {
      if (id && doc.id === id) return true;
      return doc.section === section && doc.slug === slug;
    });
  }

  render() {
    const doc = this._getActiveDoc();
    if (!doc) {
      return html`<div>Select a document from the Docs section.</div>`;
    }

    const parsed = parseMarkdown(doc.content || "");
    return html`
      <fable-docs-page
        .section=${doc.section || ""}
        .title=${doc.title || ""}
        .description=${doc.description || ""}
        .content=${parsed.html || ""}
        .toc=${parsed.toc || []}
      ></fable-docs-page>
    `;
  }
}

customElements.define("fable-docs-view", FableDocsView);
