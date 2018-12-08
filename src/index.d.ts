import { Context } from "react";

type ClassDecorator = <T extends Function>(target: T) => T;
type Constructor<T> = new (...args: any[]) => T;
type Token = Function | Object | string | symbol;
type Definition = Function | [Function] | [Token, Function];
type Provider = {
  /**
   * Register dependency injection bindings in scope of decorated class
   * @param definitions Dependency injection configuration
   * @returns Decorated constructor
   */
  register(...definitions: Definition[]): void;
};
type ProviderMixin<T> = T &
  Provider & {
    contextType: typeof InjectorContext;
    WrappedComponent: T;
  };

declare module "react" {
  namespace Component {
    function register(...definitions: Definition[]): void;
  }
}

export declare const InjectorContext: Context<Function>;

/**
 * Decorator or HOC that register dependency injection bindings
 * in scope of decorated class
 * @param definitions Dependency injection configuration
 * @returns Decorator or HOC
 */
export declare function provider(
  ...definitions: Definition[]
): <T extends Function>(target: T) => ProviderMixin<T>;

/**
 * Decorator that lazily registers class in scope of specified Provider.
 * @param getProvider Lambda function that returns Provider
 * @returns Decorator
 */
export declare function registerIn(
  getProvider: () => Provider
): <T extends Function>(target: T) => T;

/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param token Dependency injection token
 * @returns Property decorator
 */
export declare function inject(token?: Token): PropertyDecorator;
/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 */
export declare function inject(target: Object, key: string | symbol): void;
/**
 * Create a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param target The object in which we inject class instance
 * @param token Dependency injection token
 * @returns Resolved class instance
 */
export declare function inject<T>(
  target: Object,
  token: Constructor<T> | Token
): T;

/**
 * React hook for resolving a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param token Dependency injection token
 * @returns Resolved class instance
 */
export declare function useInstance<T>(token: Constructor<T> | Token): T;

/**
 * React hook for resolving a class instances that registered by some Provider in hierarchy.
 * Instances are cached in Provider that registers it's classes.
 * @param tokens Dependency injection tokens
 * @returns Resolved class instances
 */
export declare function useInstances<T extends [any, ...any[]]>(
  ...tokens: { [K in keyof T]: Constructor<T[K]> | Token }
): T;

/**
 * Bind dependency to specified class.
 * @param cosntructor Constructor
 * @returns Dependency resolver
 */
export declare function toClass(cosntructor: Constructor<any>): Function;

/**
 * Bind dependency to specified value.
 * @param value Any value
 * @returns Dependency resolver
 */
export declare function toValue(value: any): Function;

/**
 * Bind dependency to specified factory funciton.
 * @param factory Factory
 * @returns Dependency resolver
 */
export declare function toFactory(factory: () => any): Function;
/**
 * Bind dependency to specified factory funciton.
 * @param deps Factory dependencies
 * @param factory Factory
 * @returns Dependency resolver
 */
export declare function toFactory<T extends [any, ...any[]]>(
  deps: { [K in keyof T]: Constructor<T[K]> | Token },
  factory: (...args: T) => any
): Function;

/**
 * Bind dependency to existing instance located by token.
 * @param token Dependency injection token
 * @returns Dependency resolver
 */
export declare function toExisting(token: Token): Function;
