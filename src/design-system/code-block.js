import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "../config.js";

class FableCodeBlock extends LitElement {
  static status = "stable";

  static properties = {
    language: { type: String },
  };

  static styles = css`
    :host {
      display: block;
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
    code {
      font-family: inherit;
    }
  `;

  constructor() {
    super();
    this.language = "";
  }

  render() {
    return html` <pre><code><slot></slot></code></pre> `;
  }
}

customElements.define("fable-code-block", FableCodeBlock);

// Stories
const meta = {
  component: "fable-code-block",
  args: {
    language: "javascript",
  },
};

const stories = {
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
        &lt;div class="container"&gt; &lt;h1&gt;Hello World&lt;/h1&gt;
        &lt;p&gt;Welcome to my site&lt;/p&gt; &lt;/div&gt;
      </fable-code-block>
    `,
  },
};

if (!window[STORIES_KEY]) window[STORIES_KEY] = [];
window[STORIES_KEY].push({ meta, stories });
