import React, { Component } from "react";
import { render } from "react-dom";
import { provider, inject, InjectorContext } from "../src";

function sharedTests() {
  it("should inject dependencies", () => {
    class AppService {}

    class PageService {
      /**
       * @param {AppService} appService
       */
      constructor(appService) {
        this.appService = appService || inject(this, AppService);
      }
    }

    class WidgetService {
      /**
       * @param {AppService} appService
       * @param {PageService} pageService
       */
      constructor(appService, pageService) {
        this.appService = appService || inject(this, AppService);
        this.pageService = pageService || inject(this, PageService);
      }
    }

    @provider(AppService)
    class App extends Component {
      static contextType = InjectorContext;
      appService = inject(this, AppService);

      render() {
        app = this;
        return <Page />;
      }
    }
    /** @type {App} */
    let app;

    @provider(PageService)
    class Page extends Component {
      static contextType = InjectorContext;
      pageService = inject(this, PageService);

      render() {
        page = this;
        return <Widget />;
      }
    }
    /** @type {Page} */
    let page;

    @provider(WidgetService)
    class Widget extends Component {
      static contextType = InjectorContext;
      widgetService = inject(this, WidgetService);

      render() {
        widget = this;
        return <Block />;
      }
    }
    /** @type {Widget} */
    let widget;

    class Block extends Component {
      static contextType = InjectorContext;
      appService = inject(this, AppService);
      pageService = inject(this, PageService);
      widgetService = inject(this, WidgetService);

      render() {
        block = this;
        return <div />;
      }
    }
    /** @type {Block} */
    let block;

    render(<App />, document.createElement("div"));

    expect(app.appService).toBeInstanceOf(AppService);
    expect(page.pageService).toBeInstanceOf(PageService);
    expect(widget.widgetService).toBeInstanceOf(WidgetService);

    expect(block.appService).toBe(app.appService);
    expect(block.pageService).toBe(page.pageService);
    expect(block.widgetService).toBe(widget.widgetService);

    expect(page.pageService.appService).toBe(app.appService);
    expect(widget.widgetService.appService).toBe(app.appService);
    expect(widget.widgetService.pageService).toBe(page.pageService);
  });
}

describe("inject() function", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  sharedTests();

  it("should warn about not found provider", () => {
    class FooService {}

    class BarService {
      fooService = inject(this, FooService);
    }

    const barService = new BarService();

    expect(console.error).toBeCalled();
    expect(barService.fooService).toBe(undefined);
  });

  it("should warn about not found dependency", () => {
    class AppService {}

    @provider()
    class App extends Component {
      static contextType = InjectorContext;
      appService = inject(this, AppService);

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(console.error).toBeCalled();
    expect(app.appService).toBe(undefined);
  });
});

describe("inject() function in PRODUCTION mode", () => {
  beforeAll(() => {
    __DEV__ = false;
  });

  afterAll(() => {
    __DEV__ = true;
  });

  sharedTests();

  it("should return undefined if dependency is not found", () => {
    class AppService {}

    @provider()
    class App extends Component {
      static contextType = InjectorContext;
      appService = inject(this, AppService);

      render() {
        app = this;
        return <div />;
      }
    }
    /** @type {App} */
    let app;

    render(<App />, document.createElement("div"));

    expect(app.appService).toBe(undefined);
  });
});
