const escapeHtml = (str = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatInline = (text = "") => {
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  formatted = formatted.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    '<a href="$2">$1</a>',
  );
  return formatted;
};

const highlightCode = (code = "", lang = "") => {
  const escaped = escapeHtml(code);
  const language = lang.toLowerCase();
  const isScriptLike = ["js", "javascript", "ts", "typescript"].includes(
    language,
  );
  if (!language || !isScriptLike) {
    return escaped;
  }

  let highlighted = escaped;

  highlighted = highlighted.replace(
    /(\/\/.*?$)/gm,
    '<span class="token comment">$1</span>',
  );
  highlighted = highlighted.replace(
    /(\/\*[^]*?\*\/)/g,
    '<span class="token comment">$1</span>',
  );

  highlighted = highlighted.replace(
    /("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g,
    '<span class="token string">$1</span>',
  );

  highlighted = highlighted.replace(
    /\b(const|let|var|return|export|import|from|if|else|class|new|function|async|await|switch|case|break|default)\b/g,
    '<span class="token keyword">$1</span>',
  );

  highlighted = highlighted.replace(
    /\b(0x[a-fA-F0-9]+|\d+(?:\.\d+)?)\b/g,
    '<span class="token number">$1</span>',
  );

  return highlighted;
};

const normalizeCodeBlock = (lines = []) => {
  // Drop leading/trailing blank lines
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

  // Calculate minimal indent (ignoring empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^(\s+)/);
    const indent = match ? match[1].length : 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (minIndent === Infinity) minIndent = 0;

  // Outdent uniformly
  return lines.map((line) =>
    line.startsWith(" ".repeat(minIndent)) ? line.slice(minIndent) : line,
  );
};

export const parseMarkdown = (content = "") => {
  const lines = content.split(/\r?\n/);
  const parts = [];
  const toc = [];
  let inList = false;
  let inCode = false;
  let codeLang = "";
  let codeLines = [];
  let inCallout = false;
  let calloutType = "info";
  let calloutLines = [];

  const flushList = () => {
    if (inList) {
      parts.push("</ul>");
      inList = false;
    }
  };

  const flushCode = () => {
    if (inCode) {
      const normalized = normalizeCodeBlock(codeLines);
      const joined = normalized.join("\n");
      const code =
        codeLang &&
        ["js", "javascript", "ts", "typescript", "html", "css"].includes(
          codeLang.toLowerCase(),
        )
          ? highlightCode(joined, codeLang)
          : escapeHtml(joined);
      const langClass = codeLang ? ` language-${codeLang.toLowerCase()}` : "";
      parts.push(
        `<pre class="code-block${langClass}"><code${codeLang ? ` data-lang="${codeLang}"` : ""}>${code}</code></pre>`,
      );
      inCode = false;
      codeLang = "";
      codeLines = [];
    }
  };

  const flushCallout = () => {
    if (!inCallout) return;
    const body = calloutLines.join("\n").trim();
    const formatted = body
      .split(/\n{2,}/)
      .map((block) => `<p>${formatInline(block.trim())}</p>`)
      .join("");
    parts.push(
      `<div class="callout callout-${calloutType}">${formatted}</div>`,
    );
    inCallout = false;
    calloutType = "info";
    calloutLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");

    if (line.startsWith(":::")) {
      if (inCallout) {
        flushCallout();
        continue;
      }
      const match = line.match(/^:::callout\s+(\w+)/i);
      if (match) {
        flushList();
        inCallout = true;
        calloutType = match[1].toLowerCase();
        calloutLines = [];
        continue;
      }
    }

    if (line.startsWith("```")) {
      if (inCode) {
        flushCode();
      } else {
        flushList();
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (inCallout) {
      calloutLines.push(line);
      continue;
    }

    const storyMatch = line.match(
      /^:::story\s+([a-zA-Z0-9-]+)(?:--([a-zA-Z0-9-]+))?/,
    );
    if (storyMatch) {
      flushList();
      const componentId = storyMatch[1];
      const storyName = storyMatch[2] || "";
      parts.push(
        `<fable-docs-story component-id="${componentId}"${storyName ? ` story="${storyName}"` : ""}></fable-docs-story>`,
      );
      continue;
    }

    if (!line.trim()) {
      flushList();
      flushCallout();
      parts.push("");
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      parts.push(`<h${level} id="${id}">${formatInline(text)}</h${level}>`);
      toc.push({ level, text, id });
      continue;
    }

    if (line.startsWith(">")) {
      flushList();
      parts.push(
        `<blockquote>${formatInline(line.slice(1).trim())}</blockquote>`,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        parts.push("<ul>");
        inList = true;
      }
      parts.push(`<li>${formatInline(line.slice(2).trim())}</li>`);
      continue;
    }

    flushList();
    flushCallout();
    parts.push(`<p>${formatInline(line.trim())}</p>`);
  }

  flushList();
  flushCode();
  flushCallout();

  return {
    html: parts.join("\n"),
    toc,
  };
};
