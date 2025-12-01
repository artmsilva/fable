import { prependBasePath, stripBasePath } from "./router/base-path.js";

const routeDefinitions = [
  { name: "component", pattern: new URLPattern({ pathname: "/components/:group/:story" }) },
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

const buildURLForMatching = () => {
  const { pathname, search, hash } = window.location;
  const normalizedPath = normalizePathname(stripBasePath(pathname) || "/");
  return new URL(`${normalizedPath}${search || ""}${hash || ""}`, window.location.origin);
};

const matchRoute = (url) => {
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

const evaluateRoute = () => {
  if (typeof window === "undefined") {
    return { name: "home", params: {}, searchParams: new URLSearchParams() };
  }

  const url = buildURLForMatching();
  return matchRoute(url);
};

export const matchRoutePath = (pathname = "/", search = "") => {
  const normalizedPath = normalizePathname(pathname);
  const url = new URL(`${normalizedPath}${search || ""}`, "https://example.test");
  return matchRoute(url);
};

export const getRouteDefinitions = () => routeDefinitions;

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
  const pathname = normalizePathname(pathnamePart || "/");
  const fullPath = prependBasePath(pathname);
  const search = searchPart ? `?${searchPart}` : "";
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", `${fullPath}${search}`);
  notify();
};
