import { getTokenMetadata } from "@metadata";

export class TokenResolver {
  constructor() {
    this.tokenMap = new Map();
    this.initializeTokens();
  }

  initializeTokens() {
    const tokens = getTokenMetadata();
    tokens.forEach((token) => {
      this.tokenMap.set(token.id, token.value);
    });
  }

  // Get token value by path (e.g., "color.background")
  getToken(path) {
    return this.getNestedValue(this.buildTokenObject(), path);
  }

  // Build nested token object from flat metadata
  buildTokenObject() {
    const tokens = {};
    this.tokenMap.forEach((value, key) => {
      this.setNestedValue(tokens, key, value);
    });
    return tokens;
  }

  // Set nested property value
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  // Get nested property value
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : "";
    }, obj);
  }
}
