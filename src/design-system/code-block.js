import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";
import { getComponentStoryMeta } from "../metadata/components.js";

class FableCodeBlock extends LitElement {
  static status = "stable";

  static properties = {
    language: { type: String },
    _content: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }
    pre {
      color: #f1f1f1;
      background: #0f0f0f;
      padding: var(--space-4);
      border-radius: var(--radius);
      overflow-x: auto;
      margin: 0;
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.5;
      border: 1px solid var(--border-color);
      white-space: pre;
    }
    code {
      font-family:
        "FontWithASyntaxHighlighter", ui-monospace, SFMono-Regular, Menlo,
        Consolas, "Liberation Mono", "Courier New", monospace;
    }
  `;

  constructor() {
    super();
    this.language = "";
    this._content = "";
  }

  firstUpdated() {
    this._captureContent();
  }

  _captureContent() {
    const slot = this.shadowRoot?.querySelector("slot");
    const nodes = slot ? slot.assignedNodes({ flatten: true }) : [];
    const text = nodes
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent || "")
      .join("");
    this._content = this._normalizeCode(text);
  }

  _normalizeCode(text = "") {
    const lines = text.split(/\r?\n/);
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

    let minIndent = Infinity;
    for (const line of lines) {
      if (!line.trim()) continue;
      const match = line.match(/^(\s+)/);
      const indent = match ? match[1].length : 0;
      if (indent < minIndent) minIndent = indent;
    }
    if (minIndent === Infinity) minIndent = 0;

    const normalized = lines.map((line) =>
      line.startsWith(" ".repeat(minIndent)) ? line.slice(minIndent) : line,
    );
    return normalized.join("\n");
  }

  render() {
    return html`
      <pre><code>${this._content}</code></pre>
      <slot
        style="display: none;"
        @slotchange=${() => this._captureContent()}
      ></slot>
    `;
  }
}

customElements.define("fable-code-block", FableCodeBlock);

// Stories
const meta = getComponentStoryMeta("code-block", {
  args: {
    language: "javascript",
  },
});

const docsContent = `# Code Block usage

Use Code Block to display code snippets with the built-in syntax highlighting.

:::story code-block--Default
`;

const stories = {
  Docs: {
    type: "docs",
    title: "Code Block",
    description: "Guidance for code snippet display with syntax highlighting.",
    content: docsContent,
  },
  Default: (args) => html`
    <fable-code-block language=${args.language}>
      const greeting = "Hello, World!"; console.log(greeting);
    </fable-code-block>
  `,
  "Multi-line": (args) => html`
    <fable-code-block language=${args.language}>
      function fibonacci(n) { if (n <= 1) return n; return fibonacci(n - 1) +
      fibonacci(n - 2); } console.log(fibonacci(10));
    </fable-code-block>
  `,
  "HTML Code": {
    args: (baseArgs) => ({ ...baseArgs, language: "html" }),
    render: (args) => html`
      <fable-code-block language=${args.language}>
        &lt;button class="btn btn-primary" type="button"&gt; Primary Action
        &lt;/button&gt;
      </fable-code-block>
    `,
  },
};

if (!window[STORIES_KEY]) window[STORIES_KEY] = [];
window[STORIES_KEY].push({ meta, stories });
