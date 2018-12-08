import { createElement } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { Injector, InjectorContext } from "./injector";
import { addBindings } from "./bindings";
import { isObject, isFunction } from "./types";
import { logError } from "./errors";
/** @typedef {import("./types").Definition} Definition */
/** @typedef {import("./types").Token} Token */

/**
 * HOC that registers dependency injection bindings in scope of decorated component
 * @param {...Definition} definitions Dependency injection configuration
 */
export const provider = (...definitions) => Wrapped => {
  /** @type {Map<Token, Function>} */
  const bindingMap = new Map();

  addBindings(bindingMap, definitions);

  class Provider extends Injector {
    _parent = this.context;
    _bindingMap = bindingMap;
    _instanceMap = new Map();

    componentWillUnmount() {
      this._instanceMap.forEach(instance => {
        if (isObject(instance) && isFunction(instance.dispose)) {
          instance.dispose();
        }
      });
    }

    render() {
      return createElement(
        InjectorContext.Provider,
        { value: this },
        createElement(Wrapped, this.props)
      );
    }

    static WrappedComponent = Wrapped;
  }

  if (__DEV__) {
    Provider.displayName = `Provider(${Wrapped.displayName || Wrapped.name})`;

    Object.defineProperty(Provider, "contextType", {
      get() {
        return InjectorContext;
      },
      set() {
        logError(
          `You are trying to overwrite ${
            Provider.displayName
          }.contextType = InjectorContext`
        );
      }
    });
  } else {
    Provider.contextType = InjectorContext;
  }

  // static fields from component should be visible on the generated Consumer
  return hoistNonReactStatics(Provider, Wrapped);
};
