import { LitElement, html, css } from "lit";

export class FablePlayroomView extends LitElement {
  static properties = {
    _code: { state: true },
    _theme: { state: true },
    _tokens: { state: true },
    _args: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background: var(--color-background);
    }

    .playroom-layout {
      display: grid;
      grid-template-columns: 280px 1fr 320px;
      height: 100vh;
      gap: var(--space-2);
      padding: var(--space-2);
    }

    .palette-panel {
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .editor-preview-panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .editor-container {
      flex: 1;
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      min-height: 0;
    }

    .preview-container {
      flex: 1;
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      min-height: 0;
    }

    .inspector-panel {
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: var(--space-3);
      background: var(--color-background-secondary);
      border-bottom: 1px solid var(--border-color);
      font-size: var(--font-size-sm);
      font-weight: 600;
    }

    .panel-content {
      flex: 1;
      overflow: hidden;
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .placeholder-icon {
      font-size: 2rem;
      margin-bottom: var(--space-2);
      opacity: 0.5;
    }
  `;

  constructor() {
    super();
    this._code =
      '<!-- Start composing your UI -->\n<fable-button variant="primary">\n  Click me\n</fable-button>';
    this._theme = "light";
    this._tokens = {};
    this._args = {};
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleStateChange = this._handleStateChange.bind(this);
    window.addEventListener("state-changed", this._handleStateChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("state-changed", this._handleStateChange);
  }

  _handleStateChange(event) {
    // Handle global state changes if needed
  }

  _handleCodeChange(event) {
    this._code = event.detail.value;
  }

  _handleNodeSelected(event) {
    // Handle node selection from preview
    console.log("Node selected:", event.detail);
  }

  _handleInspectorUpdate(event) {
    // Handle property updates from inspector
    this._code = event.detail.code;
  }

  render() {
    return html`
      <div class="playroom-layout">
        <!-- Component Palette -->
        <div class="palette-panel">
          <fable-playroom-palette 
            @component-insert=${this._handleInsertText}
          ></fable-playroom-palette>
        </div>

        <!-- Editor and Preview -->
        <div class="editor-preview-panel">
          <!-- Code Editor -->
          <div class="editor-container">
            <fable-playroom-editor 
              .value=${this._code}
              .theme=${this._theme}
              .readOnly=${false}
              @editor-change=${this._handleCodeChange}
              @insert-text=${this._handleInsertText}
            ></fable-playroom-editor>
          </div>

          <!-- Live Preview -->
          <div class="preview-container">
            <fable-playroom-preview 
              .code=${this._code}
              .theme=${this._theme}
              .tokens=${this._tokens}
              .args=${this._args}
              @node-selected=${this._handleNodeSelected}
            ></fable-playroom-preview>
          </div>
        </div>

        <!-- Properties Inspector -->
        <div class="inspector-panel">
          <div class="panel-header">Properties</div>
          <div class="panel-content">
            <div class="placeholder">
              <div>
                <div class="placeholder-icon">⚙️</div>
                <div>Properties Inspector</div>
                <div style="font-size: var(--font-size-xs); margin-top: var(--space-1);">
                  Select element to edit properties
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("fable-playroom-view", FablePlayroomView);
