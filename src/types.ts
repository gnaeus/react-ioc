export type Token = Function | Object | string | symbol;
export type Definition = Function | [Function] | [Token, Function];

export function isFunction(arg): arg is Function {
  return typeof arg === "function";
}

export function isObject(arg): arg is Object {
  return arg && typeof arg === "object";
}

export function isString(arg): arg is string {
  return typeof arg === "string";
}

export function isSymbol(arg): arg is symbol {
  return typeof arg === "symbol";
}

export function isToken(arg): arg is Token {
  return isFunction(arg) || isObject(arg) || isString(arg) || isSymbol(arg);
}

export function isReactComponent(prototype) {
  return isObject(prototype) && isObject(prototype.isReactComponent);
}

export function isValidMetadata(arg): arg is Function {
  return (
    isFunction(arg) &&
    [Object, Function, Number, String, Boolean].indexOf(arg) === -1
  );
}
