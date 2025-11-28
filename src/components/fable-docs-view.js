import { getDocsMetadata, getView } from "@store";
import { parseMarkdown } from "@utils";
import { html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

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
    this.style.display = "block";
    this.style.height = "100%";
    this.style.overflowY = "auto";
  }

  createRenderRoot() {
    return this;
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
      <article>
        <div class="doc-body">
          <header>
            <p class="eyebrow">${doc.section}</p>
            <h1>${doc.title}</h1>
            ${doc.description ? html`<p class="summary">${doc.description}</p>` : null}
          </header>
          <section class="content">${unsafeHTML(parsed.html)}</section>
        </div>
        <nav class="toc">
          <h4>On this page</h4>
          <ul>
            ${parsed.toc.map(
              (entry) => html`
                <li>
                  <a
                    href="#${entry.id}"
                    style="margin-left: ${(entry.level - 1) * 10}px"
                  >
                    ${entry.text}
                  </a>
                </li>
              `
            )}
          </ul>
        </nav>
      </article>
    `;
  }
}

customElements.define("fable-docs-view", FableDocsView);
