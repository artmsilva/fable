import { prependBasePath, stripBasePath } from "./router/base-path.js";

/**
 * Router built on the Navigation API (window.navigation).
 * Intercepts same-origin navigations and matches against route definitions.
 * Exports the same surface as the previous popstate-based router:
 *   initRouter, subscribeToRouter, navigateTo
 */

const routeDefinitions = [
  { name: "component", pattern: new URLPattern({ pathname: "/components/:group" }) },
  { name: "home", pattern: new URLPattern({ pathname: "/" }) },
];

let currentRoute = null;
const listeners = new Set();
let initialized = false;

const normalizePathname = (pathname) => {
  if (!pathname || pathname === "/") return "/";
  const withLeading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeading.endsWith("/") ? withLeading.slice(0, -1) || "/" : withLeading;
};

const matchRoute = (url) => {
  for (const def of routeDefinitions) {
    const result = def.pattern.exec(url);
    if (result) {
      return {
        name: def.name,
        params: result.pathname.groups || {},
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

const evaluateRoute = () => {
  if (typeof window === "undefined") {
    return { name: "home", params: {}, searchParams: new URLSearchParams() };
  }
  const { pathname, search, hash } = window.location;
  const normalizedPath = normalizePathname(stripBasePath(pathname) || "/");
  const url = new URL(`${normalizedPath}${search || ""}${hash || ""}`, window.location.origin);
  return matchRoute(url);
};

const notify = () => {
  currentRoute = evaluateRoute();
  for (const cb of listeners) {
    cb(currentRoute);
  }
};

export const initRouter = () => {
  if (initialized || typeof window === "undefined") {
    return currentRoute;
  }
  initialized = true;
  currentRoute = evaluateRoute();

  navigation.addEventListener("navigate", (event) => {
    if (!event.canIntercept || event.hashChange) return;

    const dest = new URL(event.destination.url);
    if (dest.origin !== location.origin) return;

    event.intercept({
      handler() {
        notify();
      },
    });
  });

  return currentRoute;
};

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
  const pathname = normalizePathname(pathnamePart || "/");
  const fullPath = prependBasePath(pathname);
  const search = searchPart ? `?${searchPart}` : "";
  navigation.navigate(`${fullPath}${search}`, {
    history: replace ? "replace" : "push",
  });
};
