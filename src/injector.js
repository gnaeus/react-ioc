import { Component, createContext } from "react";
import { logNotFoundDependency } from "./errors";
/** @typedef {import("./types").Token} Token */

/** React Context for Injector */
export const InjectorContext = createContext(null);

/**
 * Dependency injection container
 * @internal
 */
export class Injector extends Component {
  /** @type {Injector} */
  _parent;
  /** @type {Map<Token, Function>} */
  _bindingMap;
  /** @type {Map<Token, Object>} */
  _instanceMap;
}

/**
 * Find Injector for passed object and cache it inside this object
 * @internal
 * @param {Object} target The object in which we inject value
 * @returns {Injector}
 */
export function getInjector(target) {
  let injector = target[INJECTOR];
  if (injector) {
    return injector;
  }
  injector = currentInjector || target.context;
  if (injector instanceof Injector) {
    target[INJECTOR] = injector;
    return injector;
  }
  return null;
}

/** @type {Injector} */
let currentInjector = null;

/* istanbul ignore next */
export const INJECTOR =
  typeof Symbol === "function" ? Symbol() : "__injector__";

/**
 * Resolve a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @internal
 * @param {Injector} injector Injector instance
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
export function getInstance(injector, token) {
  if (registrationQueue.length > 0) {
    registrationQueue.forEach(registration => {
      registration();
    });
    registrationQueue.length = 0;
  }

  let activeInjector = injector;
  while (activeInjector) {
    let instance = activeInjector._instanceMap.get(token);
    if (instance !== undefined) {
      return instance;
    }
    const binding = activeInjector._bindingMap.get(token);
    if (binding) {
      const prevInjector = currentInjector;
      currentInjector = activeInjector;
      try {
        instance = binding(injector);
      } finally {
        currentInjector = prevInjector;
      }
      activeInjector._instanceMap.set(token, instance);
      return instance;
    }
    activeInjector = activeInjector._parent;
  }
  if (__DEV__) {
    logNotFoundDependency(token);
  }
  return undefined;
}

/** @type {Function[]} */
export const registrationQueue = [];
