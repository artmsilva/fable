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

const BASE_PATH = computeBasePath();

const ensureLeadingSlash = (path = "/") => {
  if (!path.startsWith("/")) return `/${path}`;
  return path || "/";
};

export const getBasePath = () => BASE_PATH;

export const stripBasePath = (pathname) => {
  const normalized = ensureLeadingSlash(pathname || "/");
  if (BASE_PATH === "/" || !normalized.startsWith(BASE_PATH)) {
    return normalized;
  }
  const stripped = normalized.slice(BASE_PATH.length);
  return stripped.startsWith("/") ? stripped || "/" : `/${stripped}`;
};

export const prependBasePath = (path) => {
  const normalized = ensureLeadingSlash(path || "/");
  if (BASE_PATH === "/") {
    return normalized;
  }
  if (normalized === "/") {
    return BASE_PATH;
  }
  return `${BASE_PATH}${normalized}`;
};
