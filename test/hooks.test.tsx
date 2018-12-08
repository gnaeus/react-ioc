import React from "react";
import { render } from "react-dom";
import { provider, inject, useInstance, useInstances } from "../src/index";

function sharedTests() {
  it("should inject services", () => {
    class AppService {}
    let appService: AppService;

    class PageService {
      appService = inject(this, AppService);
    }
    let pageService: PageService;

    class WidgetService {
      appService = inject(this, AppService);
      pageService = inject(this, PageService);
    }
    let widgetService: WidgetService;

    const App = provider(AppService)(() => {
      appService = useInstance(AppService);
      return <Page />;
    });

    const Page = provider(PageService)(() => {
      pageService = useInstance(PageService);
      return <Widget />;
    });

    const Widget = provider(WidgetService)(() => {
      widgetService = useInstance(WidgetService);
      return <Block />;
    });

    const Block = () => {
      blockServices = useInstances(AppService, PageService, WidgetService);
      return <div />;
    };
    let blockServices: [AppService, PageService, WidgetService];

    render(<App />, document.createElement("div"));

    expect(appService).toBeInstanceOf(AppService);
    expect(pageService).toBeInstanceOf(PageService);
    expect(widgetService).toBeInstanceOf(WidgetService);

    expect(blockServices[0]).toBe(appService);
    expect(blockServices[1]).toBe(pageService);
    expect(blockServices[2]).toBe(widgetService);

    expect(pageService.appService).toBe(appService);
    expect(widgetService.appService).toBe(appService);
    expect(widgetService.pageService).toBe(pageService);
  });
}

describe("useInstance() hook", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  sharedTests();

  it("should warn about not found provider", () => {
    class AppService {}
    class PageService {}
    class OtherService {}

    const App = () => {
      appService = useInstance(AppService);
      return <Page />;
    };
    let appService;

    const Page = () => {
      [pageService, otherService] = useInstances(PageService, OtherService);
      return <div />;
    };
    let pageService, otherService;

    render(<App />, document.createElement("div"));

    // Two times — Provider not found
    // Three times — Dependency not found
    expect(console.error).toBeCalledTimes(5);

    expect(appService).toBe(undefined);
    expect(pageService).toBe(undefined);
    expect(otherService).toBe(undefined);
  });
});

describe("useInstance() hook in PRODUCTION mode", () => {
  beforeAll(() => {
    __DEV__ = false;
  });

  afterAll(() => {
    __DEV__ = true;
  });

  sharedTests();
});
