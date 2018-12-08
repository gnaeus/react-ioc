import React, { Component } from "react";
import { render } from "react-dom";
import { provider, inject, toClass, InjectorContext } from "../src";

function sharedTests() {
  it("should accept bindings in short form", () => {
    class FooService {}
    class BarService {}
    class BazService {}

    @provider(FooService, [BarService], [BazService, BazService])
    class App extends Component {
      static contextType = InjectorContext;
      fooService = inject(this, FooService);
      barService = inject(this, BarService);
      bazService = inject(this, BazService);

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.fooService).toBeInstanceOf(FooService);
    expect(app.barService).toBeInstanceOf(BarService);
    expect(app.bazService).toBeInstanceOf(BazService);
  });

  it("should accept non-function tokens", () => {
    class FooService {}
    class BarService {}
    class BazService {}

    const barToken = Symbol("barToken");
    const bazToken = {};

    @provider(
      ["fooToken", FooService],
      [barToken, BarService],
      [bazToken, BazService]
    )
    class App extends Component {
      static contextType = InjectorContext;
      fooService = inject(this, "fooToken");
      barService = inject(this, barToken);
      bazService = inject(this, bazToken);

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.fooService).toBeInstanceOf(FooService);
    expect(app.barService).toBeInstanceOf(BarService);
    expect(app.bazService).toBeInstanceOf(BazService);
  });

  it("should bind dependency to specified class", () => {
    class FooService {}
    class BarService {
      fooService = inject(this, FooService);
    }

    @provider(
      [FooService, toClass(FooService)],
      [BarService, toClass(BarService)]
    )
    class App extends Component {
      static contextType = InjectorContext;
      barService = inject(this, BarService);

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.barService).toBeInstanceOf(BarService);
    expect(app.barService.fooService).toBeInstanceOf(FooService);
  });
}

describe("binding functions", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  sharedTests();

  it("should validate bindings", () => {
    class FooService {}
    class BarService {}

    // @ts-ignore
    @provider([123, FooService], [BarService, "BarService"])
    class App extends Component {}

    App;

    expect(console.error).toBeCalledTimes(3);
  });

  it("should validate specified class", () => {
    class AppService {}

    // @ts-ignore
    @provider([AppService, toClass("not a class")])
    class App extends Component {
      static contextType = InjectorContext;
      appService = inject(this, AppService);
    }

    App;

    expect(console.error).toBeCalledTimes(1);
  });
});

describe("binding functions in PRODUCTION mode", () => {
  beforeAll(() => {
    __DEV__ = false;
  });

  afterAll(() => {
    __DEV__ = true;
  });

  sharedTests();
});
