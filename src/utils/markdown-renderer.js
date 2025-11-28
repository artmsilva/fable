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
  formatted = formatted.replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return formatted;
};

export const parseMarkdown = (content = "") => {
  const lines = content.split(/\r?\n/);
  const parts = [];
  const toc = [];
  let inList = false;
  let inCode = false;
  let codeLang = "";
  let codeLines = [];

  const flushList = () => {
    if (inList) {
      parts.push("</ul>");
      inList = false;
    }
  };

  const flushCode = () => {
    if (inCode) {
      const code = escapeHtml(codeLines.join("\n"));
      parts.push(`<pre><code${codeLang ? ` data-lang="${codeLang}"` : ""}>${code}</code></pre>`);
      inCode = false;
      codeLang = "";
      codeLines = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");

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

    if (!line.trim()) {
      flushList();
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
      parts.push(`<blockquote>${formatInline(line.slice(1).trim())}</blockquote>`);
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
    parts.push(`<p>${formatInline(line.trim())}</p>`);
  }

  flushList();
  flushCode();

  return {
    html: parts.join("\n"),
    toc,
  };
};
