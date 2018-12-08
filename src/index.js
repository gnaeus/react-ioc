import { inject } from "./inject";
import { provider, registerIn } from "./provider";
export { InjectorContext } from "./injector";
export { toClass, toFactory, toExisting, toValue } from "./bindings";
export { useInstance, useInstances } from "./hooks";
export {
  inject,
  provider,
  registerIn,
  inject as Inject,
  provider as Provider,
  registerIn as RegisterIn
};
