const globalScope =
  typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null;

const patchFlag = "__FABLE_CUSTOM_ELEMENT_HMR_PATCHED__";

if (globalScope?.customElements && import.meta?.hot && !globalScope[patchFlag]) {
  const originalDefine = globalScope.customElements.define.bind(globalScope.customElements);

  const ensureLitMetadata = (ctor) => {
    if (!ctor) return;
    if (typeof ctor.finalize === "function") {
      ctor.finalize();
    }
  };

  const copyStatics = (target, source) => {
    for (const key of Reflect.ownKeys(source)) {
      if (key === "length" || key === "name" || key === "prototype") continue;
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor) {
        Object.defineProperty(target, key, descriptor);
      }
    }
  };

  const copyPrototype = (targetProto, sourceProto) => {
    for (const key of Reflect.ownKeys(sourceProto)) {
      if (key === "constructor") continue;
      const descriptor = Object.getOwnPropertyDescriptor(sourceProto, key);
      if (descriptor) {
        Object.defineProperty(targetProto, key, descriptor);
      }
    }
  };

  const refreshInstances = (tagName) => {
    const instances = globalScope.document?.querySelectorAll?.(tagName) ?? [];
    instances.forEach((instance) => {
      if (typeof instance.requestUpdate === "function") {
        instance.requestUpdate();
      } else if (typeof instance.connectedCallback === "function") {
        instance.connectedCallback();
      }
    });
  };

  const upgradeElement = (tagName, existingCtor, nextCtor) => {
    ensureLitMetadata(nextCtor);
    copyStatics(existingCtor, nextCtor);
    copyPrototype(existingCtor.prototype, nextCtor.prototype);
    ensureLitMetadata(existingCtor);
    refreshInstances(tagName);
  };

  globalScope.customElements.define = function define(tagName, elementClass, options) {
    const existingCtor = globalScope.customElements.get(tagName);
    if (!existingCtor) {
      ensureLitMetadata(elementClass);
      originalDefine(tagName, elementClass, options);
      return;
    }

    upgradeElement(tagName, existingCtor, elementClass);
  };

  globalScope[patchFlag] = true;
}
