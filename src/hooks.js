import { useContext, useRef } from "react";
import { InjectorContext, getInstance } from "./injector";
import { logNotFoundProvider } from "./errors";
/** @typedef {import("./types").Token} Token */

/**
 * React hook for resolving a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
export function useInstance(token) {
  const ref = useRef(null);
  const injector = useContext(InjectorContext);
  if (__DEV__) {
    if (!injector) {
      logNotFoundProvider();
    }
  }
  return ref.current || (ref.current = getInstance(injector, token));
}

/**
 * React hook for resolving a class instances that registered by some Provider in hierarchy.
 * Instances are cached in Provider that registers it's classes.
 * @param {...Token} tokens Dependency injection tokens
 * @returns {Object[]} Resolved class instances
 */
export function useInstances(...tokens) {
  const ref = useRef(null);
  const injector = useContext(InjectorContext);
  if (__DEV__) {
    if (!injector) {
      logNotFoundProvider();
    }
  }
  return (
    ref.current ||
    (ref.current = tokens.map(token => getInstance(injector, token)))
  );
}
