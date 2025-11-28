import { prependBasePath, stripBasePath } from "./router/base-path.js";

const routeDefinitions = [
  { name: "home", pattern: new URLPattern({ pathname: "/" }) },
  {
    name: "component",
    pattern: new URLPattern({ pathname: "/components/:group/:story" }),
  },
  {
    name: "docs",
    pattern: new URLPattern({ pathname: "/docs/:section/:slug" }),
  },
  { name: "tokens", pattern: new URLPattern({ pathname: "/tokens/:tokenId" }) },
  { name: "tokens", pattern: new URLPattern({ pathname: "/tokens" }) },
  { name: "icons", pattern: new URLPattern({ pathname: "/icons/:iconId" }) },
  { name: "icons", pattern: new URLPattern({ pathname: "/icons" }) },
];

let currentRoute = null;
const listeners = new Set();
let initialized = false;

const buildURLForMatching = () => {
  const { pathname, search, hash } = window.location;
  const normalizedPath = stripBasePath(pathname) || "/";
  return new URL(`${normalizedPath}${search || ""}${hash || ""}`, window.location.origin);
};

const evaluateRoute = () => {
  if (typeof window === "undefined") {
    return { name: "home", params: {}, searchParams: new URLSearchParams() };
  }

  const url = buildURLForMatching();
  for (const def of routeDefinitions) {
    const exec = def.pattern.exec(url);
    if (exec) {
      return {
        name: def.name,
        params: exec.pathname.groups || {},
        searchParams: new URLSearchParams(url.search || ""),
      };
    }
  }
  return {
    name: "not-found",
    params: {},
    searchParams: new URLSearchParams(url.search || ""),
  };
};

const notify = () => {
  currentRoute = evaluateRoute();
  listeners.forEach((cb) => {
    cb(currentRoute);
  });
};

export const initRouter = () => {
  if (initialized || typeof window === "undefined") {
    return currentRoute;
  }
  initialized = true;
  currentRoute = evaluateRoute();
  window.addEventListener("popstate", notify);
  return currentRoute;
};

export const getCurrentRoute = () => currentRoute || evaluateRoute();

export const subscribeToRouter = (callback, { immediate = true } = {}) => {
  listeners.add(callback);
  if (immediate && currentRoute) {
    callback(currentRoute);
  }
  return () => {
    listeners.delete(callback);
  };
};

export const navigateTo = (path, { replace = false } = {}) => {
  if (typeof window === "undefined") return;
  const [pathnamePart, searchPart = ""] = path.split("?");
  const pathname = pathnamePart || "/";
  const fullPath = prependBasePath(pathname);
  const search = searchPart ? `?${searchPart}` : "";
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", `${fullPath}${search}`);
  notify();
};
