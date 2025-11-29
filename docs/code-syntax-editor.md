# `<code-syntax-editor>` Component Guide

Self-contained web component that uses the FontWithASyntaxHighlighter font to render a code-editor-like textarea with built-in syntax coloring. No external parsing or JS libraries needed—color comes from the font itself.

## Files
- `src/design-system/code-syntax-editor.js` — custom element definition.
- `src/design-system/font-syntax.css` — `@font-face` declaration (points to `/FontWithASyntaxHighlighter-Regular.woff2` at repo root).

## Usage
```html
<link rel="stylesheet" href="/src/design-system/font-syntax.css">
<script type="module" src="/src/design-system/code-syntax-editor.js"></script>

<code-syntax-editor>
const x = 123;
console.log("highlighted via font!");
</code-syntax-editor>

<code-syntax-editor readonly value="let x = 42;">
  <span slot="label">Read-only Example</span>
</code-syntax-editor>
```

## Attributes
- `value` — textarea content (mirrors `value` property).
- `readonly` — boolean attribute; sets textarea `readOnly`.

## Properties
- `value: string` — updates attribute and textarea content.
- `readonly: boolean` — updates attribute and `textarea.readOnly`.

## Events
- `input` — bubbles + composed; emitted when textarea input fires.
- `change` — bubbles + composed; emitted when textarea change fires.

## Behavior
- If no `value` attribute, the component uses light DOM text as the initial value and then removes that text to avoid duplicates.
- Shadow DOM (open) hosts a `<label><slot name="label"></slot></label>` and `<textarea class="editor">`.
- Applies font, dark theme, and focus/readonly styles per spec.
- `aria-readonly` mirrors the readonly state.
