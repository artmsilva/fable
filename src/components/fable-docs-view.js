import { css, html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { getDocsMetadata, getView } from "@store";
import { parseMarkdown } from "@utils";

export class FableDocsView extends LitElement {
  static properties = {
    _docs: { state: true },
    _view: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      padding: var(--space-6, 32px);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-stack, "Inter", system-ui);
    }
    article {
      max-width: 920px;
      margin: 0 auto;
      line-height: 1.6;
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(220px, 1fr);
      gap: var(--space-6, 32px);
    }
    .doc-body {
      max-width: 680px;
    }
    h1,
    h2,
    h3 {
      color: var(--text-heading, var(--text-primary));
    }
    pre {
      background: var(--bg-secondary);
      padding: var(--space-3, 16px);
      border-radius: var(--radius, 12px);
      overflow-x: auto;
    }
    nav.toc {
      position: sticky;
      top: 24px;
      align-self: start;
      padding: var(--space-4);
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      background: var(--bg-secondary);
    }
    nav.toc h4 {
      margin: 0 0 var(--space-2);
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    nav.toc ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    nav.toc a {
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    nav.toc a:hover {
      color: var(--text-primary);
    }
  `;

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
      <article>
        <div class="doc-body">
          <header>
            <p class="eyebrow">${doc.section}</p>
            <h1>${doc.title}</h1>
            ${doc.description
              ? html`<p class="summary">${doc.description}</p>`
              : null}
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
              `,
            )}
          </ul>
        </nav>
      </article>
    `;
  }
}

customElements.define("fable-docs-view", FableDocsView);
