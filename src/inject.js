import "reflect-metadata";
import { InjectorContext, getInjector, getInstance } from "./injector";
import { isValidMetadata, isReactComponent, isFunction } from "./types";
import {
  getDebugName,
  logInvalidMetadata,
  logNotFoundProvider,
  logError
} from "./errors";
/** @typedef {import("./types").Token} Token */

/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param {Token | Object} [targetOrToken] Object or Class prototype or dependency injection token
 * @param {string | symbol | Function} [keyOrToken] Property key or dependency injection token
 */
export function inject(targetOrToken, keyOrToken) {
  if (isFunction(keyOrToken)) {
    return injectFunction(targetOrToken, keyOrToken);
  }
  /** @type {Token} */
  let token;
  if (!keyOrToken) {
    token = targetOrToken;
    return injectDecorator;
  }
  token = Reflect.getMetadata("design:type", targetOrToken, keyOrToken);
  if (__DEV__) {
    if (!isValidMetadata(token)) {
      logInvalidMetadata(targetOrToken, token);
    }
  }
  return injectDecorator(targetOrToken, keyOrToken);

  function injectDecorator(prototype, key) {
    if (__DEV__) {
      defineContextType(prototype);
    } else {
      prototype.constructor.contextType = InjectorContext;
    }

    const descriptor = {
      configurable: true,
      enumerable: true,
      get() {
        const instance = injectFunction(this, token);
        Object.defineProperty(this, key, {
          enumerable: true,
          writable: true,
          value: instance
        });
        return instance;
      },
      set(instance) {
        Object.defineProperty(this, key, {
          enumerable: true,
          writable: true,
          value: instance
        });
      }
    };

    Object.defineProperty(prototype, key, descriptor);

    return descriptor;
  }
}

/**
 * Resolve a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @internal
 * @param {Object} target The object in which we inject class instance
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
function injectFunction(target, token) {
  const injector = getInjector(target);
  if (__DEV__) {
    if (!injector) {
      logNotFoundProvider(target);
    }
  }
  return getInstance(injector, token);
}

/**
 * Set Class.contextType = InjectorContext
 * @internal
 * @param {Object} prototype React Component prototype
 */
function defineContextType(prototype) {
  if (isReactComponent(prototype)) {
    const { constructor } = prototype;
    const className = getDebugName(constructor);
    if (constructor.contextType !== InjectorContext) {
      if (constructor.contextType) {
        logError(
          `Decorator tries to overwrite existing ${className}.contextType`
        );
      } else {
        Object.defineProperty(constructor, "contextType", {
          get() {
            return InjectorContext;
          },
          set() {
            logError(
              `You are trying to overwrite ${className}.contextType = InjectorContext`
            );
          }
        });
      }
    }
  }
}
