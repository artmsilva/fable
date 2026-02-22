import { css, html, LitElement } from "lit";
import { define } from "../src/define.js";

class FableHeader extends LitElement {
  static status = "stable";
  static description = "Top-level header providing product name and controls.";
  static taxonomy = { group: "Layout", tags: ["header", "navigation"] };

  static properties = {
    align: { type: String, reflect: true, enum: ["start", "center", "end"] },
  };

  static args = { align: "center" };
  static argTypes = { align: { control: "select", options: ["start", "center", "end"] } };

  static styles = css`
    :host { display: flex; align-items: center; gap: 12px; padding-left: var(--space-4); border-bottom: 1px solid var(--border-color); }
    :host([align="start"]) { align-items: flex-start; }
    :host([align="center"]) { align-items: center; }
    :host([align="end"]) { align-items: flex-end; }
  `;

  static stories = {
    Default: (args) => html`<fable-header align=${args.align}><h3>Component Title</h3><fable-badge variant="stable">stable</fable-badge></fable-header>`,
    "Page Header": (args) => html`<fable-header align=${args.align}><h2>Dashboard</h2><fable-badge variant="info">3 notifications</fable-badge><fable-button variant="primary">New Item</fable-button></fable-header>`,
    "With Icons": (args) => html`<fable-header align=${args.align}><fable-icon-button>⬅️</fable-icon-button><h3>Settings</h3><fable-icon-button>✏️</fable-icon-button><fable-icon-button>🗑️</fable-icon-button></fable-header>`,
    "Status Header": (args) => html`<fable-header align=${args.align}><h3>fable-button — Default</h3><fable-badge variant="stable">stable</fable-badge><fable-badge variant="info">v2.0</fable-badge></fable-header>`,
    "Align Start": (_args) => html`<fable-header align="start"><h3>Tall Title</h3><fable-badge variant="beta">beta</fable-badge><fable-button variant="secondary">Action</fable-button></fable-header>`,
    "Align End": (_args) => html`<fable-header align="end"><h3>Tall Title</h3><fable-badge variant="alpha">alpha</fable-badge><fable-button variant="secondary">Action</fable-button></fable-header>`,
  };

  constructor() { super(); this.align = "center"; }
  render() { return html`<slot></slot>`; }
}

define("fable-header", FableHeader);
