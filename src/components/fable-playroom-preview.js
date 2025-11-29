import { LitElement, html, css } from "lit";
import { DSLParser } from "../playroom/dsl-parser.js";
import { TokenResolver } from "../playroom/token-resolver.js";

export class FablePlayroomPreview extends LitElement {
  static properties = {
    code: { type: String },
    theme: { type: String },
    tokens: { type: Object },
    args: { type: Object },
    selectedNode: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      position: relative;
    }

    .preview-container {
      height: 100%;
      position: relative;
      overflow: auto;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }

    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(220, 53, 69, 0.1);
      border: 2px solid var(--color-error);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .error-content {
      background: var(--color-background);
      padding: var(--space-4);
      border-radius: var(--border-radius-sm);
      max-width: 80%;
      max-height: 80%;
      overflow: auto;
    }

    .error-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-error);
      margin-bottom: var(--space-2);
    }

    .error-message {
      font-family: monospace;
      font-size: var(--font-size-sm);
      color: var(--color-text);
      white-space: pre-wrap;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-background);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      z-index: 5;
    }

    .preview-toolbar {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      display: flex;
      gap: var(--space-1);
      z-index: 15;
    }

    .toolbar-button {
      padding: var(--space-1) var(--space-2);
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      cursor: pointer;
      opacity: 0.8;
      transition: all 0.2s;
    }

    .toolbar-button:hover {
      opacity: 1;
      background: var(--color-primary);
      color: var(--color-primary-text);
      border-color: var(--color-primary);
    }

    .node-highlight {
      position: absolute;
      pointer-events: none;
      border: 2px solid var(--color-primary);
      background: rgba(0, 123, 255, 0.1);
      z-index: 8;
      transition: all 0.2s;
    }
  `;

  constructor() {
    super();
    this.code = '';
    this.theme = 'light';
    this.tokens = {};
    this.args = {};
    this.selectedNode = null;
    
    this.parser = new DSLParser();
    this.tokenResolver = new TokenResolver();
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = '';
    
    this._setupMessageHandlers();
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Update preview when code changes
    if (changedProperties.has("code") && this.code) {
      this._updatePreview();
    }

    // Update theme when theme changes
    if (changedProperties.has("theme")) {
      this._updateTheme();
    }

    // Update tokens when tokens change
    if (changedProperties.has("tokens")) {
      this._updateTokens();
    }
  }

  async _updatePreview() {
    this.isLoading = true;
    this.hasError = false;
    this.requestUpdate();

    try {
      // Parse DSL code
      const ast = this.parser.parse(this.code);
      
      // Generate HTML with resolved tokens and args
      const context = {
        tokens: this.tokenResolver.buildTokenObject(),
        args: this.args
      };
      
      const html = this.parser.generateHTML(ast, context);
      
      // Update iframe content
      const iframe = this.shadowRoot.querySelector('.preview-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'update-preview',
          data: { html, ast, context }
        }, '*');
      }
      
      this.isLoading = false;
      this.hasError = false;
      
    } catch (error) {
      console.error('Preview update error:', error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = error.message;
    }
    
    this.requestUpdate();
  }

      this.isLoading = false;
      this.hasError = false;
    } catch (error) {
      console.error("Preview update error:", error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = error.message;
    }

    this.requestUpdate();
  }

  _updateTheme() {
    const iframe = this.shadowRoot.querySelector('.preview-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'update-theme',
        data: { theme: this.theme }
      }, '*');
    }
  }
  }

  _updateTokens() {
    // Token updates will be reflected in next preview update
    this._updatePreview();
  }

  _handleRefresh() {
    this._updatePreview();
  }

  _handleCopyHTML() {
    const iframe = this.shadowRoot.querySelector('.preview-iframe');
    if (iframe && iframe.contentWindow) {
      const previewElement = iframe.contentWindow.document.getElementById('preview-root');
      if (previewElement) {
        navigator.clipboard.writeText(previewElement.innerHTML);
      }
    }
  }
  }

  render() {
    return html`
      <div class="preview-container">
        <div class="preview-content theme-${this.theme}">
          <!-- Preview content will be injected here -->
        </div>
        
        ${
          this.isLoading
            ? html`
          <div class="loading-overlay">
            Loading preview...
          </div>
        `
            : ""
        }
        
        ${
          this.hasError
            ? html`
          <div class="error-overlay">
            <div class="error-content">
              <div class="error-title">Preview Error</div>
              <div class="error-message">${this.errorMessage}</div>
            </div>
          </div>
        `
            : ""
        }
        
        <div class="preview-toolbar">
          <button class="toolbar-button" @click=${this._handleRefresh}>
            🔄 Refresh
          </button>
          <button class="toolbar-button" @click=${this._handleCopyHTML}>
            📋 Copy HTML
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("fable-playroom-preview", FablePlayroomPreview);
