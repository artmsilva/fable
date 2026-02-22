const computeBasePath = () => {
  if (typeof window === "undefined") {
    return "/";
  }
  const explicit = window.__FABLE_BASE_PATH__;
  const baseEl = document.querySelector("base");
  const candidate = explicit || baseEl?.getAttribute("href") || "/";
  const resolved = new URL(candidate, window.location.origin).pathname;
  let normalized = resolved || "/";
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized || "/";
};

let _basePath;
const getBasePath = () => {
  if (_basePath === undefined) {
    _basePath = computeBasePath();
  }
  return _basePath;
};

const ensureLeadingSlash = (path = "/") => {
  if (!path.startsWith("/")) return `/${path}`;
  return path || "/";
};

export const stripBasePath = (pathname) => {
  const normalized = ensureLeadingSlash(pathname || "/");
  if (getBasePath() === "/" || !normalized.startsWith(getBasePath())) {
    return normalized;
  }
  const stripped = normalized.slice(getBasePath().length);
  return stripped.startsWith("/") ? stripped || "/" : `/${stripped}`;
};

export const prependBasePath = (path) => {
  const normalized = ensureLeadingSlash(path || "/");
  if (getBasePath() === "/") {
    return normalized;
  }
  if (normalized === "/") {
    return getBasePath();
  }
  return `${getBasePath()}${normalized}`;
};
