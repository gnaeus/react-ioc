"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

require("reflect-metadata");
var tslib_1 = require("tslib");
var hoistNonReactStatics = _interopDefault(require("hoist-non-react-statics"));
var react = require("react");

function isFunction(arg) {
  return typeof arg === "function";
}
function isObject(arg) {
  return arg && typeof arg === "object";
}
function isString(arg) {
  return typeof arg === "string";
}
function isSymbol(arg) {
  return typeof arg === "symbol";
}
function isToken(arg) {
  return isFunction(arg) || isObject(arg) || isString(arg) || isSymbol(arg);
}
function isReactComponent(prototype) {
  return isObject(prototype) && isObject(prototype.isReactComponent);
}
function isValidMetadata(arg) {
  return (
    isFunction(arg) &&
    [Object, Function, Number, String, Boolean].indexOf(arg) === -1
  );
}

function getDebugName(value) {
  if (isFunction(value)) {
    return String(value.displayName || value.name);
  }
  if (isObject(value) && isFunction(value.constructor)) {
    return String(value.constructor.name);
  }
  return String(value);
}
function logError(message) {
  try {
    throw new Error(message);
  } catch (e) {
    console.error(e);
  }
}
function logIncorrectBinding(token, binding) {
  var tokenName = getDebugName(token);
  var bindingName = getDebugName(binding);
  logError("Binding [" + tokenName + ", " + bindingName + "] is incorrect.");
}
function logNotFoundDependency(token) {
  var name = getDebugName(token);
  logError(
    "Dependency " +
      name +
      " is not found.\nPlease register " +
      name +
      " in some Provider e.g.\n@provider([" +
      name +
      ", " +
      name +
      "])\nclass App extends React.Component { /*...*/ }"
  );
}
function logNotFoundProvider(target) {
  if (isReactComponent(target)) {
    var name_1 = getDebugName(target);
    logError(
      "Provider is not found.\n  Please define Provider and set " +
        name_1 +
        ".contextType = InjectorContext e.g.\n  @provider([MyService, MyService])\n  class App extends React.Component { /*...*/ }\n  class " +
        name_1 +
        " extends React.Component {\n    static contextType = InjectorContext;\n  }"
    );
  } else {
    logError(
      "Provider is not found.\n  Please define Provider e.g.\n  @provider([MyService, MyService])\n  class App extends React.Component { /*...*/ }"
    );
  }
}
function logInvalidMetadata(target, token) {
  var tokenName = getDebugName(token);
  var targetName = getDebugName(target);
  logError(
    tokenName +
      " is not a valid dependency.\nPlease specify ES6 class as property type e.g.\nclass MyService {}\nclass " +
      targetName +
      " {\n  @inject myService: MyService;\n}"
  );
}

/** @typedef {import("./types").Token} Token */
/** React Context for Injector */
var InjectorContext = react.createContext(null);
/**
 * Dependency injection container
 * @internal
 */
var Injector = /** @class */ (function(_super) {
  tslib_1.__extends(Injector, _super);
  function Injector() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  return Injector;
})(react.Component);
/**
 * Find Injector for passed object and cache it inside this object
 * @internal
 * @param {Object} target The object in which we inject value
 * @returns {Injector}
 */
function getInjector(target) {
  var injector = target[INJECTOR];
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
var currentInjector = null;
/* istanbul ignore next */
var INJECTOR = typeof Symbol === "function" ? Symbol() : "__injector__";
/**
 * Resolve a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @internal
 * @param {Injector} injector Injector instance
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
function getInstance(injector, token) {
  if (registrationQueue.length > 0) {
    registrationQueue.forEach(function(registration) {
      registration();
    });
    registrationQueue.length = 0;
  }
  while (injector) {
    var instance = injector._instanceMap.get(token);
    if (instance !== undefined) {
      return instance;
    }
    var binding = injector._bindingMap.get(token);
    if (binding) {
      var prevInjector = currentInjector;
      currentInjector = injector;
      try {
        instance = binding(injector);
      } finally {
        currentInjector = prevInjector;
      }
      injector._instanceMap.set(token, instance);
      return instance;
    }
    injector = injector._parent;
  }
  if (process.env.NODE_ENV !== "production") {
    logNotFoundDependency(token);
  }
  return undefined;
}
/** @type {Function[]} */
var registrationQueue = [];

/** @typedef {import("./types").Token} Token */
/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param {Token | Object} [targetOrToken] Object or Class prototype or dependency injection token
 * @param {string | symbol | Function} [keyOrToken] Property key or dependency injection token
 */
function inject(targetOrToken, keyOrToken) {
  if (isFunction(keyOrToken)) {
    return injectFunction(targetOrToken, keyOrToken);
  }
  /** @type {Token} */
  var token;
  if (!keyOrToken) {
    token = targetOrToken;
    return injectDecorator;
  }
  return injectDecorator(targetOrToken, keyOrToken);
  function injectDecorator(prototype, key) {
    if (process.env.NODE_ENV !== "production") {
      defineContextType(prototype);
    } else {
      prototype.constructor.contextType = InjectorContext;
    }
    if (!token) {
      token = Reflect.getMetadata("design:type", prototype, key);
      if (process.env.NODE_ENV !== "production") {
        if (!isValidMetadata(token)) {
          logInvalidMetadata(targetOrToken, token);
        }
      }
    }
    var descriptor = {
      configurable: true,
      enumerable: true,
      get: function() {
        var instance = injectFunction(this, token);
        Object.defineProperty(this, key, {
          enumerable: true,
          writable: true,
          value: instance
        });
        return instance;
      },
      set: function(instance) {
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
  var injector = getInjector(target);
  if (process.env.NODE_ENV !== "production") {
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
    var constructor = prototype.constructor;
    var className_1 = getDebugName(constructor);
    if (constructor.contextType !== InjectorContext) {
      if (constructor.contextType) {
        logError(
          "Decorator tries to overwrite existing " +
            className_1 +
            ".contextType"
        );
      } else {
        Object.defineProperty(constructor, "contextType", {
          get: function() {
            return InjectorContext;
          },
          set: function() {
            logError(
              "You are trying to overwrite " +
                className_1 +
                ".contextType = InjectorContext"
            );
          }
        });
      }
    }
  }
}

/** @typedef {import("./types").Definition} Definition */
/** @typedef {import("./types").Token} Token */
/**
 * Bind type to specified class.
 * @param {new (...args) => any} constructor
 * @return {Function}
 */
function toClass(constructor) {
  if (process.env.NODE_ENV !== "production") {
    if (!isFunction(constructor)) {
      logError(
        "Class " + getDebugName(constructor) + " is not a valid dependency"
      );
    }
  }
  return asBinding(function(injector) {
    var instance = new constructor();
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
function toFactory(depsOrFactory, factory) {
  if (process.env.NODE_ENV !== "production") {
    if (factory) {
      if (!Array.isArray(depsOrFactory)) {
        logError(
          "Dependency array " + getDebugName(depsOrFactory) + " is invalid"
        );
      }
      if (!isFunction(factory)) {
        logError(
          "Factory " + getDebugName(factory) + " is not a valid dependency"
        );
      }
    } else if (!isFunction(depsOrFactory)) {
      logError(
        "Factory " + getDebugName(depsOrFactory) + " is not a valid dependency"
      );
    }
  }
  return asBinding(
    factory
      ? function(injector) {
          return factory.apply(
            void 0,
            depsOrFactory.map(function(token) {
              return getInstance(injector, token);
            })
          );
        }
      : depsOrFactory
  );
}
/**
 * Bind type to specified value.
 * @param {any} value
 * @return {Function}
 */
function toValue(value) {
  if (process.env.NODE_ENV !== "production") {
    if (value === undefined) {
      logError("Please specify some value");
    }
  }
  return asBinding(function() {
    return value;
  });
}
/**
 * Bind type to existing instance located by token.
 * @param {Token} token
 * @return {Function}
 */
function toExisting(token) {
  if (process.env.NODE_ENV !== "production") {
    if (!isFunction(token)) {
      logError(
        "Token " +
          getDebugName(token) +
          " is not a valid dependency injection token"
      );
    }
  }
  return asBinding(function(injector) {
    return getInstance(injector, token);
  });
}
/* istanbul ignore next */
var IS_BINDING = typeof Symbol === "function" ? Symbol() : "__binding__";
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
function addBindings(bindingMap, definitions) {
  definitions.forEach(function(definition) {
    var _a;
    var token, binding;
    if (Array.isArray(definition)) {
      (token = definition[0]),
        (_a = definition[1]),
        (binding = _a === void 0 ? token : _a);
    } else {
      token = binding = definition;
    }
    if (process.env.NODE_ENV !== "production") {
      if (!isToken(token) || !isFunction(binding)) {
        logIncorrectBinding(token, binding);
      }
    }
    // @ts-ignore
    bindingMap.set(token, binding[IS_BINDING] ? binding : toClass(binding));
  });
}

/** @typedef {import("./types").Definition} Definition */
/** @typedef {import("./types").Token} Token */
/**
 * HOC that registers dependency injection bindings in scope of decorated component
 * @param {...Definition} definitions Dependency injection configuration
 */
var provider = function() {
  var definitions = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    definitions[_i] = arguments[_i];
  }
  return function(Wrapped) {
    /** @type {Map<Token, Function>} */
    var bindingMap = new Map();
    addBindings(bindingMap, definitions);
    var Provider = /** @class */ (function(_super) {
      tslib_1.__extends(Provider, _super);
      function Provider() {
        var _this = (_super !== null && _super.apply(this, arguments)) || this;
        _this._parent = _this.context;
        _this._bindingMap = bindingMap;
        _this._instanceMap = new Map();
        return _this;
      }
      Provider.prototype.componentWillUnmount = function() {
        this._instanceMap.forEach(function(instance) {
          if (isObject(instance) && isFunction(instance.dispose)) {
            instance.dispose();
          }
        });
      };
      Provider.prototype.render = function() {
        return react.createElement(
          InjectorContext.Provider,
          { value: this },
          react.createElement(Wrapped, this.props)
        );
      };
      /**
       * Register dependency injection bindings in scope of decorated class
       * @param {...Definition} definitions Dependency injection configuration
       */
      Provider.register = function() {
        var definitions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          definitions[_i] = arguments[_i];
        }
        addBindings(bindingMap, definitions);
      };
      Provider.WrappedComponent = Wrapped;
      return Provider;
    })(Injector);
    if (process.env.NODE_ENV !== "production") {
      Provider.displayName =
        "Provider(" + (Wrapped.displayName || Wrapped.name) + ")";
      Object.defineProperty(Provider, "contextType", {
        get: function() {
          return InjectorContext;
        },
        set: function() {
          logError(
            "You are trying to overwrite " +
              Provider.displayName +
              ".contextType = InjectorContext"
          );
        }
      });
    } else {
      Provider.contextType = InjectorContext;
    }
    // static fields from component should be visible on the generated Consumer
    return hoistNonReactStatics(Provider, Wrapped);
  };
};
/**
 * Register class in specified provider.
 * @typedef {{ register(constructor: Function): void }} Provider
 * @param {() => Provider} getProvider Function that returns some provider
 * @param {Function} [binding] Dependency injection binding
 */
var registerIn = function(getProvider, binding) {
  return function(constructor) {
    registrationQueue.push(function() {
      if (process.env.NODE_ENV !== "production") {
        var provider_1 = getProvider();
        if (
          !isFunction(provider_1) ||
          !(provider_1.prototype instanceof Injector)
        ) {
          logError(
            getDebugName(provider_1) +
              " is not a valid Provider. Please use:\n" +
              "@registerIn(() => MyProvider)\n" +
              ("class " + getDebugName(constructor) + " {}\n")
          );
        } else {
          provider_1.register(binding ? [constructor, binding] : constructor);
        }
      } else {
        getProvider().register(binding ? [constructor, binding] : constructor);
      }
    });
    return constructor;
  };
};

/** @typedef {import("./types").Token} Token */
/**
 * React hook for resolving a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
function useInstance(token) {
  var ref = react.useRef(null);
  var injector = react.useContext(InjectorContext);
  if (process.env.NODE_ENV !== "production") {
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
function useInstances() {
  var tokens = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    tokens[_i] = arguments[_i];
  }
  var ref = react.useRef(null);
  var injector = react.useContext(InjectorContext);
  if (process.env.NODE_ENV !== "production") {
    if (!injector) {
      logNotFoundProvider();
    }
  }
  return (
    ref.current ||
    (ref.current = tokens.map(function(token) {
      return getInstance(injector, token);
    }))
  );
}

exports.inject = inject;
exports.provider = provider;
exports.registerIn = registerIn;
exports.Inject = inject;
exports.Provider = provider;
exports.RegisterIn = registerIn;
exports.InjectorContext = InjectorContext;
exports.toClass = toClass;
exports.toFactory = toFactory;
exports.toExisting = toExisting;
exports.toValue = toValue;
exports.useInstance = useInstance;
exports.useInstances = useInstances;
//# sourceMappingURL=index.js.map
