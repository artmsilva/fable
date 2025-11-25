/**
 * Design System Barrel Export
 *
 * This file exports all design system components for convenient importing.
 * Allows: import "@design-system" instead of individual component imports.
 */

// Display Components
export * from "./badge.js";
// Form Components
export * from "./button.js";
// Layout Components
export * from "./card.js";
export * from "./checkbox.js";
export * from "./code-block.js";
export * from "./drawer.js";
export * from "./header.js";
export * from "./icon-button.js";
export * from "./input.js";
// Navigation Components
export * from "./link.js";
export * from "./nav-group.js";
export * from "./preview.js";
export * from "./select.js";
export * from "./sidebar.js";
export * from "./stack.js";
export * from "./textarea.js";

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
