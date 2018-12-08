import { INJECTOR } from "./injector";
import { isFunction, isToken } from "./types";
import { logIncorrectBinding, logError, getDebugName } from "./errors";
/** @typedef {import("./types").Definition} Definition */
/** @typedef {import("./types").Token} Token */

/**
 * Bind type to specified class.
 * @param {new (...args) => any} constructor
 * @return {Function}
 */
export function toClass(constructor) {
  if (__DEV__) {
    if (!isFunction(constructor)) {
      logError(`Class ${getDebugName(constructor)} is not a valid dependency`);
    }
  }
  return asBinding(injector => {
    const instance = new constructor();
    if (!instance[INJECTOR]) {
      instance[INJECTOR] = injector;
    }
    return instance;
  });
}

/* istanbul ignore next */
const IS_BINDING = typeof Symbol === "function" ? Symbol() : "__binding__";

/**
 * Mark function as binding function.
 * @internal
 * @param {Function} binding
 * @returns {Function}
 */
function asBinding(binding) {
  binding[IS_BINDING] = true;
  return binding;
}

/**
 * Add bindings to bindings Map
 * @internal
 * @param {Map<Token, Function>} bindingMap
 * @param {Definition[]} definitions
 */
export function addBindings(bindingMap, definitions) {
  definitions.forEach(definition => {
    let token, binding;
    if (Array.isArray(definition)) {
      [token, binding = token] = definition;
    } else {
      token = binding = definition;
    }
    if (__DEV__) {
      if (!isToken(token) || !isFunction(binding)) {
        logIncorrectBinding(token, binding);
      }
    }
    // @ts-ignore
    bindingMap.set(token, binding[IS_BINDING] ? binding : toClass(binding));
  });
}
