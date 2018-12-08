import { INJECTOR, getInstance } from "./injector";
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

/**
 * Bind type to specified factory funciton.
 * @param {any} depsOrFactory Dependencies or factory
 * @param {Function} [factory] Factory
 * @return {Function}
 */
export function toFactory(depsOrFactory, factory) {
  if (__DEV__) {
    if (factory) {
      if (!Array.isArray(depsOrFactory)) {
        logError(`Dependency array ${getDebugName(depsOrFactory)} is invalid`);
      }
      if (!isFunction(factory)) {
        logError(`Factory ${getDebugName(factory)} is not a valid dependency`);
      }
    } else if (!isFunction(depsOrFactory)) {
      logError(
        `Factory ${getDebugName(depsOrFactory)} is not a valid dependency`
      );
    }
  }
  return asBinding(
    factory
      ? injector =>
          factory(...depsOrFactory.map(token => getInstance(injector, token)))
      : depsOrFactory
  );
}

/**
 * Bind type to specified value.
 * @param {any} value
 * @return {Function}
 */
export function toValue(value) {
  if (__DEV__) {
    if (value === undefined) {
      logError(`Please specify some value`);
    }
  }
  return asBinding(() => value);
}

/**
 * Bind type to existing instance located by token.
 * @param {Token} token
 * @return {Function}
 */
export function toExisting(token) {
  if (__DEV__) {
    if (!isFunction(token)) {
      logError(
        `Token ${getDebugName(token)} is not a valid dependency injection token`
      );
    }
  }
  return asBinding(injector => getInstance(injector, token));
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
