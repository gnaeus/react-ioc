import { Context } from "react";

type ClassDecorator = <T extends Function>(target: T) => T;
type Constructor<T> = new (...args: any[]) => T;
type Token = Function | Object | string | symbol;
type Definition = Function | [Function] | [Token, Function];
type ProviderMixin<T> = T & {
  contextType: typeof InjectorContext;
  WrappedComponent: T;
};

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
 * Bind dependency to specified class.
 * @param cosntructor Constructor
 * @returns Dependency resolver
 */
export declare function toClass(cosntructor: Constructor<any>): Function;
