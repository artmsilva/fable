/**
 * Design System Barrel Export
 *
 * This file exports all design system components for convenient importing.
 * Allows: import "@design-system" instead of individual component imports.
 */

export * from "./activity-feed.js";
// Display Components
export * from "./badge.js";
// Form Components
export * from "./button.js";
// Layout Components
export * from "./card.js";
export * from "./checkbox.js";
export * from "./code-block.js";
export * from "./doc-toc.js";
export * from "./docs-page.js";
export * from "./drawer.js";
export * from "./filter-chips.js";
export * from "./header.js";
export * from "./hero-banner.js";
export * from "./highlight-cards.js";
export * from "./icon-button.js";
export * from "./icon-detail.js";
export * from "./icon-grid.js";
export * from "./input.js";
// Navigation Components
export * from "./link.js";
export * from "./nav-group.js";
export * from "./preview.js";
export * from "./search-input.js";
export * from "./select.js";
export * from "./sidebar.js";
export * from "./spotlight-list.js";
export * from "./stack.js";
export * from "./textarea.js";
export * from "./token-detail.js";
export * from "./token-groups.js";

// Import side effects to register custom elements
import "./button.js";
import "./input.js";
import "./textarea.js";
import "./checkbox.js";
import "./select.js";
import "./link.js";
import "./nav-group.js";
import "./card.js";
import "./stack.js";
import "./sidebar.js";
import "./header.js";
import "./preview.js";
import "./drawer.js";
import "./badge.js";
import "./icon-button.js";
import "./code-block.js";
import "./hero-banner.js";
import "./highlight-cards.js";
import "./activity-feed.js";
import "./filter-chips.js";
import "./spotlight-list.js";
import "./docs-page.js";
import "./search-input.js";
import "./icon-grid.js";
import "./icon-detail.js";
import "./token-groups.js";
import "./token-detail.js";
import "./doc-toc.js";

if (import.meta.hot) {
  const componentModules = Object.keys(import.meta.glob("./*.js")).filter(
    (path) => path !== "./index.js"
  );
  if (componentModules.length) {
    import.meta.hot.accept(componentModules, () => null);
  }
}
