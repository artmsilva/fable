import { LitElement, html, css } from "lit";
import { MonacoLoader } from "../playroom/monaco-loader.js";

export class FablePlayroomEditor extends LitElement {
  static properties = {
    value: { type: String },
    theme: { type: String },
    readOnly: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--color-background);
    }

    .editor-container {
      height: 100%;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
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
      z-index: 10;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-top: 2px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: var(--space-2);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .editor-toolbar {
      display: flex;
      align-items: center;
      padding: var(--space-2);
      background: var(--color-background-secondary);
      border-bottom: 1px solid var(--border-color);
      gap: var(--space-2);
    }

    .toolbar-button {
      padding: var(--space-1) var(--space-2);
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      cursor: pointer;
      transition: all 0.2s;
    }

    .toolbar-button:hover {
      background: var(--color-primary);
      color: var(--color-primary-text);
      border-color: var(--color-primary);
    }

    .toolbar-separator {
      width: 1px;
      height: 16px;
      background: var(--border-color);
    }
  `;

  constructor() {
    super();
    this.value = "";
    this.theme = "fable-dark";
    this.readOnly = false;
    this.monacoLoader = new MonacoLoader();
    this.editor = null;
    this.isLoading = true;
  }

  async firstUpdated() {
    await this._initializeEditor();
  }

  async _initializeEditor() {
    const container = this.shadowRoot.querySelector(".editor-container");

    try {
      this.editor = await this.monacoLoader.createEditor(container, {
        value: this.value,
        theme: this.theme,
        readOnly: this.readOnly,
      });

      // Set up change event listener
      this.editor.onDidChangeModelContent(() => {
        this.value = this.editor.getValue();
        this.dispatchEvent(
          new CustomEvent("editor-change", {
            detail: { value: this.value },
            bubbles: true,
          })
        );
      });

      // Set up cursor position listener
      this.editor.onDidChangeCursorPosition((event) => {
        this.dispatchEvent(
          new CustomEvent("cursor-position-change", {
            detail: { position: event.position },
            bubbles: true,
          })
        );
      });

      this.isLoading = false;
      this.requestUpdate();
    } catch (error) {
      console.error("Failed to initialize Monaco editor:", error);
      this.isLoading = false;
      this.requestUpdate();
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Update editor value if changed externally
    if (changedProperties.has("value") && this.editor && this.value !== this.editor.getValue()) {
      this.editor.setValue(this.value);
    }

    // Update theme if changed
    if (changedProperties.has("theme") && this.editor) {
      this.monacoLoader.monaco.editor.setTheme(this.theme);
    }

    // Update read-only state if changed
    if (changedProperties.has("readOnly") && this.editor) {
      this.editor.updateOptions({ readOnly: this.readOnly });
    }
  }

  _handleFormat() {
    if (this.editor) {
      // Format current document
      this.editor.getAction("editor.action.formatDocument").run();
    }
  }

  _handleCopy() {
    if (this.editor) {
      const selection = this.editor.getModel().getValueInRange(this.editor.getSelection());
      navigator.clipboard.writeText(selection);
    }
  }

  _handlePaste() {
    navigator.clipboard.readText().then((text) => {
      if (this.editor) {
        this.editor.trigger("keyboard", "type", { text });
      }
    });
  }

  _handleInsertText(event) {
    const { text, position } = event.detail;
    if (this.editor) {
      this.monacoLoader.insertText(text, position);
    }
  }

  render() {
    return html`
      <div class="editor-toolbar">
        <button class="toolbar-button" @click=${this._handleFormat}>
          Format
        </button>
        
        <div class="toolbar-separator"></div>
        
        <button class="toolbar-button" @click=${this._handleCopy}>
          Copy
        </button>
        
        <button class="toolbar-button" @click=${this._handlePaste}>
          Paste
        </button>
      </div>

      <div class="editor-container">
        ${
          this.isLoading
            ? html`
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
            Loading editor...
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.monacoLoader) {
      this.monacoLoader.dispose();
    }
  }
}

customElements.define("fable-playroom-editor", FablePlayroomEditor);
