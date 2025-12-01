import assert from "node:assert/strict";
import test from "node:test";

// Lightweight URLPattern stub for Node until it ships natively here.
if (typeof globalThis.URLPattern === "undefined") {
  class SimpleURLPattern {
    constructor({ pathname }) {
      this.pathname = pathname;
      this.parts = pathname.split("/").filter(Boolean);
    }

    exec(url) {
      const rawPath = url.pathname || "/";
      const normalizedPath =
        rawPath === "/"
          ? "/"
          : rawPath.endsWith("/") && rawPath !== "/"
            ? rawPath.slice(0, -1)
            : rawPath;
      if (this.pathname === "/" && normalizedPath === "/") {
        return { pathname: { groups: {} } };
      }
      const incomingParts = normalizedPath.split("/").filter(Boolean);
      if (incomingParts.length !== this.parts.length) return null;
      const groups = {};
      for (let i = 0; i < this.parts.length; i++) {
        const part = this.parts[i];
        const value = incomingParts[i];
        if (part.startsWith(":")) {
          groups[part.slice(1)] = value;
        } else if (part !== value) {
          return null;
        }
      }
      return { pathname: { groups } };
    }
  }
  globalThis.URLPattern = SimpleURLPattern;
}

const { matchRoutePath } = await import("../src/router.js");

test("matches home route with and without trailing slash", () => {
  assert.equal(matchRoutePath("/").name, "home");
  assert.equal(matchRoutePath("").name, "home");
  assert.equal(matchRoutePath("/").params?.group, undefined);
});

test("matches component route with slugs", () => {
  const route = matchRoutePath("/components/button/primary");
  assert.equal(route.name, "component");
  assert.deepEqual(route.params, { group: "button", story: "primary" });
});

test("matches component route with trailing slash", () => {
  const route = matchRoutePath("/components/button/primary/");
  assert.equal(route.name, "component");
  assert.deepEqual(route.params, { group: "button", story: "primary" });
});

test("returns not-found for unknown paths", () => {
  assert.equal(matchRoutePath("/not-a-real-page").name, "not-found");
});
