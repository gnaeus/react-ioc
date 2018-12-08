import { getInjector, getInstance } from "./injector";
import { logNotFoundProvider } from "./errors";
/** @typedef {import("./types").Token} Token */

/**
 * Resolve a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param {Object} target The object in which we inject class instance
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
export function inject(target, token) {
  const injector = getInjector(target);
  if (__DEV__) {
    if (!injector) {
      logNotFoundProvider(target);
    }
  }
  return getInstance(injector, token);
}
