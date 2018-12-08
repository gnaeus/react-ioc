import { isFunction, isObject, isReactComponent } from "./types";

export function getDebugName(value) {
  if (isFunction(value)) {
    return String(value.displayName || value.name);
  }
  if (isObject(value) && isFunction(value.constructor)) {
    return String(value.constructor.name);
  }
  return String(value);
}

export function logError(message) {
  try {
    throw new Error(message);
  } catch (e) {
    console.error(e);
  }
}

export function logIncorrectBinding(token, binding) {
  const tokenName = getDebugName(token);
  const bindingName = getDebugName(binding);
  logError(`Binding [${tokenName}, ${bindingName}] is incorrect.`);
}

export function logNotFoundDependency(token) {
  const name = getDebugName(token);
  logError(
    `Dependency ${name} is not found.
Please register ${name} in some Provider e.g.
@provider([${name}, ${name}])
class App extends React.Component { /*...*/ }`
  );
}

export function logNotFoundProvider(target) {
  if (isReactComponent(target)) {
    const name = getDebugName(target);
    logError(
      `Provider is not found.
  Please define Provider and set ${name}.contextType = InjectorContext e.g.
  @provider([MyService, MyService])
  class App extends React.Component { /*...*/ }
  class ${name} extends React.Component {
    static contextType = InjectorContext;
  }`
    );
  } else {
    logError(
      `Provider is not found.
  Please define Provider e.g.
  @provider([MyService, MyService])
  class App extends React.Component { /*...*/ }`
    );
  }
}
