import React, { Component } from "react";
import { provider, InjectorContext } from "../src";

function sharedTests() {}

describe("@provider decorator", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  sharedTests();

  it("should warn about Class.contextType changes", () => {
    @provider()
    class App extends Component {}

    App.contextType = React.createContext(null);

    expect(console.error).toBeCalled();
    expect(App.contextType).toBe(InjectorContext);
  });
});

describe("@provider decorator in PRODUCTION mode", () => {
  beforeAll(() => {
    __DEV__ = false;
  });

  afterAll(() => {
    __DEV__ = true;
  });

  sharedTests();

  it("should not warn about Class.contextType changes", () => {
    @provider()
    class App extends Component {}

    expect(App.contextType).toBe(InjectorContext);

    App.contextType = React.createContext(null);

    expect(App.contextType).not.toBe(InjectorContext);
  });
});
