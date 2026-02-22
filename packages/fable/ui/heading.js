import { css, html, LitElement } from "lit";
import { html as staticHtml, unsafeStatic } from "lit/static-html.js";
import { define } from "../src/define.js";

class FableHeading extends LitElement {
  static status = "stable";
  static description = "Semantic heading element using the display typeface with a consistent typographic scale.";
  static taxonomy = { group: "Foundations", tags: ["heading", "typography"] };

  static properties = { level: { type: Number, reflect: true } };
  static args = { level: 3 };
  static argTypes = { level: { control: "select", options: [1, 2, 3, 4, 5, 6] } };

  static styles = css`
    :host { display: block; }
    :host([level="1"]) { --_fs: 2rem; --_lh: 1.2; }
    :host([level="2"]) { --_fs: 1.5rem; --_lh: 1.25; }
    :host([level="3"]) { --_fs: 1.1rem; --_lh: 1.3; }
    :host([level="4"]) { --_fs: 0.95rem; --_lh: 1.35; }
    :host([level="5"]) { --_fs: 0.875rem; --_lh: 1.4; }
    :host([level="6"]) { --_fs: 0.8rem; --_lh: 1.4; }
    h1, h2, h3, h4, h5, h6 { margin: 0; font-family: var(--font-display, "DM Serif Display", Georgia, serif); font-weight: 400; font-size: var(--_fs, 1.1rem); line-height: var(--_lh, 1.3); letter-spacing: 0; color: var(--text-primary); }
  `;

  static stories = {
    Default: (args) => html`<fable-heading level=${args.level}>Heading text</fable-heading>`,
    Scale: (_args) => html`
      <div style="display:flex;flex-direction:column;gap:8px">
        <fable-heading level="1">Level 1 — Display</fable-heading>
        <fable-heading level="2">Level 2 — Section</fable-heading>
        <fable-heading level="3">Level 3 — Subsection</fable-heading>
        <fable-heading level="4">Level 4 — Panel</fable-heading>
        <fable-heading level="5">Level 5 — Label</fable-heading>
        <fable-heading level="6">Level 6 — Caption</fable-heading>
      </div>
    `,
  };

  constructor() { super(); this.level = 3; }
  render() {
    const level = Math.min(Math.max(this.level || 3, 1), 6);
    const tag = unsafeStatic(`h${level}`);
    return staticHtml`<${tag}><slot></slot></${tag}>`;
  }
}

define("fable-heading", FableHeading);
