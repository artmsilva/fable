import { parseDocument } from "htmlparser2";
import { getComponentMetadataByComponent } from "@metadata";

export class DSLParser {
  constructor() {
    this.componentRegistry = new Map();
    this.tokenRegistry = new Map();
    this.argsRegistry = new Map();
  }

  // Parse DSL string to AST
  parse(dslString) {
    try {
      const htmlAST = parseDocument(dslString);
      return this.processNode(htmlAST);
    } catch (error) {
      throw new Error(`DSL parsing failed: ${error.message}`);
    }
  }

  // Process HTML node and add Fable-specific features
  processNode(node) {
    if (node.type === "tag") {
      return this.processComponentNode(node);
    } else if (node.type === "text") {
      return this.processTextNode(node);
    }
    return null;
  }

  // Process component nodes with prop validation
  processComponentNode(node) {
    const tagName = node.name;
    const componentMeta = getComponentMetadataByComponent(tagName);

    if (!componentMeta && tagName.startsWith("fable-")) {
      console.warn(`Unknown component: ${tagName}`);
    }

    return {
      type: "component",
      tagName,
      props: this.processProps(node.attribs || {}),
      slots: this.processSlots(node.children || []),
      metadata: componentMeta,
      sourceLocation: node.startIndex,
    };
  }

  // Process props with interpolation
  processProps(rawProps) {
    const processed = {};

    for (const [key, value] of Object.entries(rawProps)) {
      processed[key] = this.processInterpolation(value);
    }

    return processed;
  }

  // Process {token.*}, {args.*}, and JS expressions
  processInterpolation(value) {
    if (typeof value !== "string") return value;

    // Match {expression} patterns
    const interpolationRegex = /\{([^}]+)\}/g;
    let match;
    const parts = [];
    let lastIndex = 0;

    while ((match = interpolationRegex.exec(value)) !== null) {
      // Add literal text before interpolation
      if (match.index > lastIndex) {
        parts.push({
          type: "literal",
          value: value.slice(lastIndex, match.index),
        });
      }

      // Process interpolation
      const expression = match[1].trim();
      parts.push(this.parseExpression(expression));
      lastIndex = interpolationRegex.lastIndex;
    }

    // Add trailing literal text
    if (lastIndex < value.length) {
      parts.push({
        type: "literal",
        value: value.slice(lastIndex),
      });
    }

    // Return simple value if no interpolations
    return parts.length === 1 && parts[0].type === "literal"
      ? parts[0].value
      : { type: "interpolation", parts };
  }

  // Parse individual expressions
  parseExpression(expr) {
    if (expr.startsWith("token.")) {
      return {
        type: "token",
        path: expr.slice(6), // Remove 'token.'
      };
    } else if (expr.startsWith("args.")) {
      return {
        type: "args",
        path: expr.slice(5), // Remove 'args.'
      };
    } else {
      // Limited JS expression
      return {
        type: "expression",
        code: expr,
      };
    }
  }

  // Process slots (children)
  processSlots(children) {
    return children
      .map((child) => {
        if (child.type === "tag") {
          return this.processComponentNode(child);
        } else if (child.type === "text") {
          return this.processTextNode(child);
        }
        return null;
      })
      .filter(Boolean);
  }

  // Process text content with interpolation
  processTextNode(node) {
    const content = node.data || "";
    const processed = this.processInterpolation(content);

    return {
      type: "text",
      content: processed,
      sourceLocation: node.startIndex,
    };
  }

  // Generate HTML from AST for preview
  generateHTML(ast, context = {}) {
    if (Array.isArray(ast)) {
      return ast.map((node) => this.generateHTML(node, context)).join("");
    }

    if (ast.type === "component") {
      return this.generateComponentHTML(ast, context);
    } else if (ast.type === "text") {
      return this.processTextContent(ast.content, context);
    }
    return "";
  }

  // Generate component HTML with resolved values
  generateComponentHTML(node, context) {
    const props = this.resolveProps(node.props, context);
    const propsString = Object.entries(props)
      .map(([key, value]) => `${key}="${this.escapeHTML(value)}"`)
      .join(" ");

    const slotsHTML = node.slots.map((slot) => this.generateHTML(slot, context)).join("");

    const openingTag = propsString ? `<${node.tagName} ${propsString}>` : `<${node.tagName}>`;
    const closingTag = `</${node.tagName}>`;

    return `${openingTag}${slotsHTML}${closingTag}`;
  }

  // Resolve interpolated values
  resolveProps(props, context) {
    const resolved = {};

    for (const [key, value] of Object.entries(props)) {
      if (value && value.type === "interpolation") {
        resolved[key] = this.resolveInterpolation(value, context);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  // Resolve interpolation to actual values
  resolveInterpolation(interpolation, context) {
    return interpolation.parts
      .map((part) => {
        if (part.type === "literal") {
          return part.value;
        } else if (part.type === "token") {
          return this.resolveToken(part.path, context);
        } else if (part.type === "args") {
          return this.resolveArgs(part.path, context);
        } else if (part.type === "expression") {
          return this.evaluateExpression(part.code, context);
        }
        return "";
      })
      .join("");
  }

  // Resolve token values
  resolveToken(path, context) {
    const tokens = context.tokens || {};
    return this.getNestedValue(tokens, path);
  }

  // Resolve args values
  resolveArgs(path, context) {
    const args = context.args || {};
    return this.getNestedValue(args, path);
  }

  // Evaluate limited JS expressions
  evaluateExpression(code, context) {
    // Only allow simple ternary and property access
    const safeExpr = code.replace(/[^a-zA-Z0-9._?:<>= ]/g, "");
    try {
      // Create safe evaluation context
      const func = new Function("args", "token", `return ${safeExpr}`);
      return func(context.args || {}, context.tokens || {});
    } catch (e) {
      console.warn(`Expression evaluation failed: ${code}`, e);
      return "";
    }
  }

  // Utility for nested property access
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : "";
    }, obj);
  }

  // Process text content with interpolation
  processTextContent(content, context) {
    if (typeof content === "string") {
      return this.escapeHTML(content);
    } else if (content && content.type === "interpolation") {
      return this.resolveInterpolation(content, context);
    }
    return "";
  }

  // HTML escaping
  escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}
