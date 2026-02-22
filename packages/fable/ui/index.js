/**
 * Fable UI Primitives — barrel file
 *
 * Each component self-registers via define() or customElements.define() on import.
 */

import "./attributes-table.js";
import "./badge.js";
import "./button.js";
import "./card.js";
import "./checkbox.js";
import "./code-block.js";
import "./docs-story.js";
import "./drawer.js";
import "./header.js";
import "./heading.js";
import "./icon-button.js";
import "./input.js";
import "./link.js";
import "./nav-group.js";
import "./preview.js";
import "./search-input.js";
import "./select.js";
import "./sidebar.js";
import "./stack.js";
import "./textarea.js";

if (import.meta.hot) {
  const componentModules = Object.keys(import.meta.glob("./*.js")).filter(
    (p) => p !== "./index.js"
  );
  if (componentModules.length) {
    import.meta.hot.accept(componentModules, () => null);
  }
}
