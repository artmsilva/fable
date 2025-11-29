/**
 * <code-syntax-editor> — text editor using FontWithASyntaxHighlighter for visual syntax.
 * Requires the consumer to load `font-syntax.css` so the font is available.
 */
class CodeSyntaxEditor extends HTMLElement {
  static get observedAttributes() {
    return ["value", "readonly"];
  }

  constructor() {
    super();
    this._value = "";
    this._readonly = false;
    this.attachShadow({ mode: "open" });
    this._handleInput = this._handleInput.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }

  connectedCallback() {
    if (!this.shadowRoot.innerHTML) {
      this._render();
    }
    this._syncFromInitialContent();
    this._applyState();
  }

  attributeChangedCallback(name, _old, value) {
    if (name === "value") {
      this._value = value ?? "";
      this._applyState();
    }
    if (name === "readonly") {
      this._readonly = value !== null;
      this._applyState();
    }
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    const val = newValue ?? "";
    if (val === this._value) return;
    this._value = val;
    this.setAttribute("value", val);
    this._applyState();
  }

  get readonly() {
    return this._readonly;
  }

  set readonly(isReadonly) {
    const next = Boolean(isReadonly);
    if (next === this._readonly) return;
    this._readonly = next;
    if (next) {
      this.setAttribute("readonly", "");
    } else {
      this.removeAttribute("readonly");
    }
    this._applyState();
  }

  _render() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        color: #fff;
        font-family: "FontWithASyntaxHighlighter", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
      }
      .wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      label {
        font-size: 0.85rem;
        color: #8b8d93;
      }
      textarea.editor {
        width: 100%;
        min-height: 200px;
        background: #05060a;
        color: #fff;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 0.75rem;
        box-sizing: border-box;
        font: inherit;
        resize: vertical;
        tab-size: 2;
        line-height: 1.5;
        outline: none;
      }
      textarea.editor:focus {
        border-color: #888;
      }
      :host([readonly]) textarea.editor {
        border-style: dashed;
        border-color: #555;
        background: #020309;
        color: #b1b3ba;
      }
      :host([readonly]) textarea.editor:focus {
        border-color: #555;
      }
    `;

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const label = document.createElement("label");
    label.innerHTML = `<slot name="label"></slot>`;

    const textarea = document.createElement("textarea");
    textarea.className = "editor";
    textarea.addEventListener("input", this._handleInput);
    textarea.addEventListener("change", this._handleChange);

    wrapper.append(label, textarea);
    this.shadowRoot.append(style, wrapper);
  }

  _syncFromInitialContent() {
    if (this.hasAttribute("value")) {
      this._value = this.getAttribute("value") || "";
      return;
    }
    // Collect text nodes from light DOM (excluding slotted label).
    const textParts = [];
    const toRemove = [];
    this.childNodes.forEach((node) => {
      const isLabelSlot =
        node.nodeType === Node.ELEMENT_NODE && node.getAttribute("slot") === "label";
      if (isLabelSlot) return;
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        textParts.push(node.textContent);
        toRemove.push(node);
      }
    });
    if (textParts.length) {
      this._value = textParts.join("").trim();
      this.setAttribute("value", this._value);
    }
    toRemove.forEach((node) => node.remove());
  }

  _applyState() {
    const textarea = this.shadowRoot.querySelector("textarea.editor");
    if (!textarea) return;
    textarea.value = this._value || "";
    textarea.readOnly = this._readonly;
    textarea.setAttribute("aria-readonly", String(this._readonly));
  }

  _emit(type, originalEvent) {
    const event = new Event(type, {
      bubbles: true,
      composed: true,
      cancelable: originalEvent?.cancelable ?? false,
    });
    this.dispatchEvent(event);
  }

  _handleInput(event) {
    const textarea = event.target;
    this._value = textarea.value;
    this.setAttribute("value", this._value);
    this._emit("input", event);
  }

  _handleChange(event) {
    this._emit("change", event);
  }
}

customElements.define("code-syntax-editor", CodeSyntaxEditor);

export { CodeSyntaxEditor };
