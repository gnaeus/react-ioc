import React, { Component } from "react";
import { render } from "react-dom";
import {
  provider,
  inject,
  toClass,
  toFactory,
  toValue,
  toExisting
} from "../src";

function sharedTests() {
  it("should accept bindings in short form", () => {
    class FooService {}
    class BarService {}
    class BazService {}

    @provider(FooService, [BarService], [BazService, BazService])
    class App extends Component {
      @inject(FooService) fooService;
      @inject(BarService) barService;
      @inject(BazService) bazService;

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
      @inject("fooToken") fooService;
      @inject(barToken) barService;
      @inject(bazToken) bazService;

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
      @inject(BarService) barService;

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

  it("should bind dependency to specified factory", () => {
    class AppService {}

    @provider([AppService, toFactory(() => new AppService())])
    class App extends Component {
      @inject(AppService) appService;

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.appService).toBeInstanceOf(AppService);
  });

  it("should inject dependencies to factory", () => {
    class AppService {
      constructor(fooService, barService) {
        this.fooService = fooService;
        this.barService = barService;
      }
    }
    class FooService {}
    class BarService {}

    @provider(FooService, BarService, [
      AppService,
      toFactory(
        [FooService, BarService],
        (fooService, barService) => new AppService(fooService, barService)
      )
    ])
    class App extends Component {
      @inject(AppService) appService;

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.appService).toBeInstanceOf(AppService);
    expect(app.appService.fooService).toBeInstanceOf(FooService);
    expect(app.appService.barService).toBeInstanceOf(BarService);
  });

  it("should bind dependency to specified value", () => {
    class AppService {}
    const appService = new AppService();

    @provider([AppService, toValue(appService)])
    class App extends Component {
      @inject(AppService) appService;

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.appService).toBe(appService);
  });

  it("should bind dependency to already registered dependency", () => {
    class FooService {}
    class BarService {}

    @provider(
      [FooService, toClass(FooService)],
      [BarService, toExisting(FooService)]
    )
    class App extends Component {
      @inject(FooService) fooService;
      @inject(BarService) barService;

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.barService).toBeInstanceOf(FooService);
    expect(app.fooService).toBeInstanceOf(FooService);
    expect(app.barService).toBe(app.fooService);
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
      @inject(AppService) appService;
    }

    App;

    expect(console.error).toBeCalledTimes(1);
  });

  it("should validate specifed factory and dependencies", () => {
    class FooService {}
    class BarService {}
    class BazService {}

    @provider(
      // @ts-ignore
      [FooService, toFactory(new FooService())],
      // @ts-ignore
      [BarService, toFactory(FooService, BarService)],
      // @ts-ignore
      [BazService, toFactory([FooService], new BazService())]
    )
    class App extends Component {}

    App;

    expect(console.error).toBeCalledTimes(4);
  });

  it("should validate specifed value", () => {
    class AppService {}

    @provider([AppService, toValue(undefined)])
    class App extends Component {}

    App;

    expect(console.error).toBeCalledTimes(1);
  });

  it("should validate specifed already registered dependency", () => {
    class AppService {}

    // @ts-ignore
    @provider([AppService, toExisting(new AppService())])
    class App extends Component {}

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
