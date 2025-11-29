import { css, html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "./doc-toc.js";
import "./docs-story.js";

class FableDocsPage extends LitElement {
  static properties = {
    section: { type: String },
    title: { type: String },
    description: { type: String },
    content: { type: String },
    toc: { type: Array },
  };

  constructor() {
    super();
    this.section = "";
    this.title = "";
    this.description = "";
    this.content = "";
    this.toc = [];
    this._handleHashChange = this._handleHashChange.bind(this);
  }

  static styles = css`
    .docs-page {
      display: block;
      height: 100%;
      overflow-y: auto;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-stack, "Inter", system-ui);
      padding: var(--space-6, 32px);
      box-sizing: border-box;
    }

    .hero {
      margin-bottom: var(--space-6, 32px);
      padding: var(--space-5, 24px);
      border-radius: var(--radius, 12px);
      background: linear-gradient(
        120deg,
        color-mix(in srgb, var(--primary-color) 10%, transparent),
        color-mix(in srgb, var(--accent-color, #1fb6ff) 6%, transparent)
      );
      border: 1px solid var(--border-color);
    }

    .eyebrow {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      margin: 0 0 var(--space-2);
    }

    .hero h1 {
      margin: 0 0 var(--space-2);
      color: var(--text-heading, var(--text-primary));
    }

    .summary {
      margin: 0;
      color: var(--text-secondary);
      max-width: 70ch;
    }

    .body {
      display: grid;
      grid-template-columns: minmax(0, 2fr) 280px;
      gap: var(--space-5, 24px);
      align-items: start;
    }

    .content {
      line-height: 1.6;
    }

    .content h1,
    .content h2,
    .content h3 {
      color: var(--text-heading, var(--text-primary));
      margin-top: var(--space-5, 24px);
      margin-bottom: var(--space-2, 8px);
    }

    .content p {
      margin: 0 0 var(--space-3, 16px);
      color: var(--text-primary);
    }

    .content ul {
      padding-left: var(--space-5, 24px);
      margin: 0 0 var(--space-3, 16px);
      color: var(--text-primary);
    }

    .content blockquote {
      margin: var(--space-3, 16px) 0;
      padding: var(--space-3, 16px);
      border-left: 3px solid var(--primary-color);
      background: var(--bg-secondary);
      border-radius: var(--radius, 12px);
      color: var(--text-primary);
    }

    .content pre {
      background: var(--bg-secondary);
      padding: var(--space-3, 16px);
      border-radius: var(--radius, 12px);
      overflow-x: auto;
      border: 1px solid var(--border-color);
      font-family:
        "Iosevka Term SS08", "JetBrains Mono", ui-monospace, SFMono-Regular,
        Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.9rem;
      line-height: 1.5;
      position: relative;
      white-space: pre;
    }

    .code-block .token.keyword {
      color: #7c3aed;
      font-weight: 600;
    }
    .code-block .token.string {
      color: #16a34a;
    }
    .code-block .token.comment {
      color: #6b7280;
      font-style: italic;
    }
    .code-block .token.number {
      color: #d97706;
    }

    .content fable-docs-story {
      display: block;
    }

    .content .callout {
      border-radius: var(--radius, 12px);
      padding: var(--space-3, 16px);
      margin: var(--space-3, 16px) 0;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
    }

    .content .callout-info {
      border-color: color-mix(
        in srgb,
        var(--primary-color) 20%,
        var(--border-color)
      );
      background: color-mix(
        in srgb,
        var(--primary-color) 6%,
        var(--bg-secondary)
      );
    }

    .content .callout-warning {
      border-color: #f59e0b;
      background: color-mix(in srgb, #f59e0b 10%, var(--bg-secondary));
    }

    .content .callout-danger {
      border-color: #ef4444;
      background: color-mix(in srgb, #ef4444 10%, var(--bg-secondary));
    }

    .outline {
      position: sticky;
      top: var(--space-4, 16px);
    }

    @media (max-width: 960px) {
      .body {
        grid-template-columns: 1fr;
      }
      .outline {
        position: relative;
        top: 0;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("hashchange", this._handleHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("hashchange", this._handleHashChange);
  }

  firstUpdated() {
    this._scrollToHash();
  }

  updated(changedProps) {
    if (changedProps.has("content")) {
      this.updateComplete.then(() => this._scrollToHash());
    }
  }

  _handleHashChange() {
    this._scrollToHash({ smooth: false });
  }

  _scrollToHash({ smooth = true } = {}) {
    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;
    this._scrollToId(hash, { smooth, syncHash: false });
  }

  _scrollToId(id, { smooth = true, syncHash = true } = {}) {
    if (!id) return;
    const target = this.renderRoot?.querySelector(`#${CSS.escape(id)}`);
    if (target) {
      target.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
      if (syncHash) {
        history.replaceState(null, "", `#${id}`);
      }
    }
  }

  _handleTocClick(event, entry) {
    event.preventDefault();
    this._scrollToId(entry.id, { smooth: true, syncHash: true });
  }

  createRenderRoot() {
    // Render into light DOM so hash links and TOC targets remain reachable
    return this;
  }

  render() {
    const hasToc = Array.isArray(this.toc) && this.toc.length > 0;
    const styleText = Array.isArray(this.constructor.styles)
      ? this.constructor.styles.map((s) => s.cssText).join("\n")
      : this.constructor.styles?.cssText || "";
    return html`
      <style>
        ${styleText}
      </style>
      <article class="docs-page">
        <header class="hero">
          ${this.section ? html`<p class="eyebrow">${this.section}</p>` : null}
          ${this.title ? html`<h1>${this.title}</h1>` : null}
          ${this.description
            ? html`<p class="summary">${this.description}</p>`
            : null}
        </header>
        <div class="body">
          <section class="content">${unsafeHTML(this.content || "")}</section>
          ${hasToc
            ? html`
                <aside class="outline">
                  <fable-doc-toc .toc=${this.toc}></fable-doc-toc>
                </aside>
              `
            : null}
        </div>
      </article>
    `;
  }
}

customElements.define("fable-docs-page", FableDocsPage);
