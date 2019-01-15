import React, { Component } from "react";
import { render } from "react-dom";
import { provider, Provider, inject, Inject, InjectorContext } from "../src";

function sharedTests() {
  it("should inject dependencies", () => {
    class AppService {}

    class PageService {
      @inject(AppService) appService;
    }

    class WidgetService {
      @inject(AppService) appService;
      @inject(PageService) pageService;
      // self dependency
      @inject(WidgetService) widgetService;
    }

    @provider(AppService)
    class App extends Component {
      @inject(AppService) appService;

      render() {
        app = this;
        return <Page />;
      }
    }
    let app: App;

    @provider(PageService)
    class Page extends Component {
      @inject(PageService) pageService;

      render() {
        page = this;
        return <Widget />;
      }
    }
    let page: Page;

    @provider(WidgetService)
    class Widget extends Component {
      @inject(WidgetService) widgetService;

      render() {
        widget = this;
        return <Block />;
      }
    }
    let widget: Widget;

    class Block extends Component {
      @inject(AppService) appService;
      @inject(PageService) pageService;
      @inject(WidgetService) widgetService;

      render() {
        block = this;
        return <div />;
      }
    }
    let block: Block;

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
    // self dependency
    expect(widget.widgetService.widgetService).toBe(widget.widgetService);
  });

  it("should inject dependencies with Reflect Metadata", () => {
    class AppService {}

    class PageService {
      @inject appService: AppService;
    }

    class WidgetService {
      @inject appService: AppService;
      @inject pageService: PageService;
      // self dependency
      @inject widgetService: WidgetService;
    }

    @provider(AppService)
    class App extends Component {
      @inject appService: AppService;

      render() {
        app = this;
        return <Page />;
      }
    }
    let app: App;

    @provider(PageService)
    class Page extends Component {
      @inject pageService: PageService;

      render() {
        page = this;
        return <Widget />;
      }
    }
    let page: Page;

    @provider(WidgetService)
    class Widget extends Component {
      @inject widgetService: WidgetService;

      render() {
        widget = this;
        return <Block />;
      }
    }
    let widget: Widget;

    class Block extends Component {
      @inject appService: AppService;
      @inject pageService: PageService;
      @inject widgetService: WidgetService;

      render() {
        block = this;
        return <div />;
      }
    }
    let block: Block;

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
    // self dependency
    expect(widget.widgetService.widgetService).toBe(widget.widgetService);
  });

  it("should work with empty parentheses", () => {
    class AppService {}

    class PageService {
      @Inject() appService: AppService;
    }

    class WidgetService {
      @Inject() appService: AppService;
      @Inject() pageService: PageService;
      // self dependency
      @Inject() widgetService: WidgetService;
    }

    @Provider(AppService)
    class App extends Component {
      @Inject() appService: AppService;

      render() {
        app = this;
        return <Page />;
      }
    }
    let app: App;

    @Provider(PageService)
    class Page extends Component {
      @Inject() pageService: PageService;

      render() {
        page = this;
        return <Widget />;
      }
    }
    let page: Page;

    @Provider(WidgetService)
    class Widget extends Component {
      @Inject() widgetService: WidgetService;

      render() {
        widget = this;
        return <div />;
      }
    }
    let widget: Widget;

    render(<App />, document.createElement("div"));

    expect(app.appService).toBeInstanceOf(AppService);
    expect(page.pageService).toBeInstanceOf(PageService);
    expect(page.pageService.appService).toBe(app.appService);
    expect(widget.widgetService.appService).toBe(app.appService);
    expect(widget.widgetService.pageService).toBe(page.pageService);
    // self dependency
    expect(widget.widgetService.widgetService).toBe(widget.widgetService);
  });

  it("should allow writes to decorated field", () => {
    class FooService {}

    class BarService {
      @inject fooService: FooService = new FooService();
    }

    const barService = new BarService();

    expect(barService.fooService).toBeInstanceOf(FooService);
  });

  it("should provide injected dependencies in constructor", () => {
    class Session {
      doSomethingUseful() {}
    }

    @provider(Session)
    class App extends React.Component {
      render() {
        return <Loader />;
      }
    }

    class Loader extends React.Component {
      @inject session: Session;

      constructor(props, context) {
        super(props, context);
        this.session.doSomethingUseful();
      }

      render() {
        return null;
      }
    }

    render(<App />, document.createElement("div"));
  });
}

describe("@inject decorator", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  sharedTests();

  it("should validate specified Reflect Metadata", () => {
    interface Interface {}

    class AppService {
      @inject undefined;
      @inject object: Interface;
      @inject function: () => void;
      @inject number: number;
      @inject boolean: boolean;
      @inject string: string;
    }

    AppService;

    expect(console.error).toBeCalledTimes(6);
  });

  it("should warn about predefined Class.contextType", () => {
    class AppService {}

    class App extends Component {
      static contextType = React.createContext(null);

      @inject appService: AppService;
    }

    expect(console.error).toBeCalled();
    expect(App.contextType).not.toBe(InjectorContext);
  });

  it("should warn about Class.contextType changes", () => {
    class AppService {}

    class App extends Component {
      @inject appService: AppService;
    }

    App.contextType = React.createContext(null);

    expect(console.error).toBeCalled();
    expect(App.contextType).toBe(InjectorContext);
  });
});

describe("@inject decorator in PRODUCTION mode", () => {
  beforeAll(() => {
    __DEV__ = false;
  });

  afterAll(() => {
    __DEV__ = true;
  });

  sharedTests();

  it("should not warn about predefined Class.contextType", () => {
    class AppService {}

    class App extends Component {
      static contextType = React.createContext(null);

      @inject appService: AppService;
    }

    expect(App.contextType).toBe(InjectorContext);
  });

  it("should not warn about Class.contextType changes", () => {
    class AppService {}

    class App extends Component {
      @inject appService: AppService;
    }

    expect(App.contextType).toBe(InjectorContext);

    App.contextType = React.createContext(null);

    expect(App.contextType).not.toBe(InjectorContext);
  });
});
