export class MonacoLoader {
  constructor() {
    this.loadingPromise = null;
    this.monaco = null;
    this.editor = null;
  }

  // Dynamically load Monaco from CDN
  async loadMonaco() {
    if (this.monaco) {
      return this.monaco;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadFromCDN();
    return this.loadingPromise;
  }

  async _loadFromCDN() {
    try {
      // Load Monaco loader script
      await this._loadScript("https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js");

      // Configure Monaco
      const require = globalThis.require;
      require.config({
        paths: {
          vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
        },
      });

      // Load Monaco modules
      const monaco = await new Promise((resolve, reject) => {
        require(["vs/editor/editor.main"], resolve, reject);
      });

      this.monaco = monaco;
      this._setupFableDSL(monaco);

      return monaco;
    } catch (error) {
      console.error("Failed to load Monaco editor:", error);
      throw error;
    }
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  _setupFableDSL(monaco) {
    // Register custom language for Fable DSL
    monaco.languages.register({ id: "fabledsl" });

    // Configure language features
    this._setupLanguageConfiguration(monaco);
    this._setupTokensProvider(monaco);
    this._setupCompletionProvider(monaco);
    this._setupHoverProvider(monaco);
  }

  _setupLanguageConfiguration(monaco) {
    monaco.languages.setLanguageConfiguration("fabledsl", {
      comments: {
        blockComment: ["<!--", "-->"],
      },
      brackets: [
        ["<", ">"],
        ["{", "}"],
      ],
      autoClosingPairs: [
        { open: "<", close: ">" },
        { open: "{", close: "}" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: "<", close: ">" },
        { open: "{", close: "}" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });
  }

  _setupTokensProvider(monaco) {
    monaco.languages.setMonarchTokensProvider("fabledsl", {
      tokenizer: {
        root: [
          // HTML tags
          [/<\/?[\w-]+/, "tag"],

          // Attributes
          [/[\w-]+(?==)/, "attribute.name"],

          // Attribute values
          [/="[^"]*"/, "attribute.value"],
          [/'[^']*'/, "attribute.value"],

          // Token interpolation
          [/\{token\.[^}]+\}/, "token"],

          // Args interpolation
          [/\{args\.[^}]+\}/, "args"],

          // Expression interpolation
          [/\{[^}]+\}/, "expression"],

          // Text content
          [/[^<]+/, "text"],
        ],
      },
    });

    // Define color theme
    monaco.editor.defineTheme("fable-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "tag", foreground: "569cd6" },
        { token: "attribute.name", foreground: "92c5f8" },
        { token: "attribute.value", foreground: "ce9178" },
        { token: "token", foreground: "4ec9b0", fontStyle: "italic" },
        { token: "args", foreground: "dcdcaa", fontStyle: "italic" },
        { token: "expression", foreground: "c586c0", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
      },
    });
  }

  _setupCompletionProvider(monaco) {
    monaco.languages.registerCompletionItemProvider("fabledsl", {
      provideCompletionItems: async (model, position) => {
        const suggestions = [];

        // Component completions
        suggestions.push(...(await this._getComponentCompletions(model, position)));

        // Token completions
        suggestions.push(...this._getTokenCompletions(model, position));

        // Args completions
        suggestions.push(...this._getArgsCompletions(model, position));

        return { suggestions };
      },
    });
  }

  async _getComponentCompletions(model, position) {
    const { listComponentMetadata } = await import("@metadata");
    const components = listComponentMetadata();

    return components
      .filter((comp) => comp.kind === "component-story")
      .map((comp) => ({
        label: comp.component,
        kind: this.monaco.languages.CompletionItemKind.Class,
        documentation: comp.description,
        insertText: `<${comp.component}>$0</${comp.component}>`,
        insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      }));
  }

  _getTokenCompletions(model, position) {
    // Get token metadata for completions
    const tokens = [
      "token.color.background",
      "token.color.text",
      "token.color.primary",
      "token.space.sm",
      "token.space.md",
      "token.space.lg",
      "token.typography.heading1",
      "token.typography.heading2",
      "token.typography.body",
    ];

    return tokens.map((token) => ({
      label: token,
      kind: this.monaco.languages.CompletionItemKind.Variable,
      documentation: `Design token: ${token}`,
      insertText: `{${token}}`,
    }));
  }

  _getArgsCompletions(model, position) {
    const args = ["args.placeholder", "args.value", "args.label", "args.onClick", "args.isActive"];

    return args.map((arg) => ({
      label: arg,
      kind: this.monaco.languages.CompletionItemKind.Variable,
      documentation: `Component argument: ${arg}`,
      insertText: `{${arg}}`,
    }));
  }

  _setupHoverProvider(monaco) {
    monaco.languages.registerHoverProvider("fabledsl", {
      provideHover: async (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return;

        // Provide hover info for components
        if (word.word.startsWith("fable-")) {
          const { getComponentMetadataByComponent } = await import("@metadata");
          const meta = getComponentMetadataByComponent(word.word);

          if (meta) {
            return {
              contents: [
                { value: `**${meta.title}**` },
                { value: meta.description || "No description available" },
              ],
            };
          }
        }

        return null;
      },
    });
  }

  // Create editor instance
  async createEditor(container, options = {}) {
    const monaco = await this.loadMonaco();

    const defaultOptions = {
      value: "<!-- Start composing your UI -->\n",
      language: "fabledsl",
      theme: "fable-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: "on",
      wordWrap: "on",
      folding: true,
      bracketPairColorization: { enabled: true },
    };

    this.editor = monaco.editor.create(container, { ...defaultOptions, ...options });
    return this.editor;
  }

  // Get current editor value
  getValue() {
    return this.editor?.getValue() || "";
  }

  // Set editor value
  setValue(value) {
    if (this.editor) {
      this.editor.setValue(value);
    }
  }

  // Insert text at position
  insertText(text, position = null) {
    if (this.editor) {
      if (position) {
        this.editor.setPosition(position);
      }
      this.editor.trigger("keyboard", "type", { text });
    }
  }

  // Focus editor
  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  // Dispose editor
  dispose() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }
}
